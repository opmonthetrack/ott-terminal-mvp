import Decimal from "decimal.js";
import type { XrplNetwork } from "./walletRegistry";

// Read-only adaptation of AGE Wallet DNA. No signer, owner session or execution API.
const D = Decimal.clone({ precision: 48 });
type Json = Record<string, any>;
export type DnaAsset = { currency: string; issuer: string; balance: string; frozen: boolean };
export type DnaBasis = {
  status: "known" | "unknown";
  totalCostXrp: string | null;
  averageCostXrp: string | null;
  reason: string;
  observedPurchases: { hash: string; quantity: string; costXrp: string }[];
};
export type DnaScan = {
  account: string; network: XrplNetwork; ledger: number; scannedAt: string;
  xrpBalance: string; assets: (DnaAsset & { basis: DnaBasis })[];
  historyCount: number; historyComplete: boolean; assetsPartial: boolean;
};
export type DnaQuote = {
  ledger: number; quotedAt: string; requestedTokens: string; coveredTokens: string;
  grossXrp: string; feeXrp: string; netXrp: string; fullCoverage: boolean;
  estimatedPnlXrp: string | null; estimatedPnlPercent: string | null;
};
const ENDPOINTS: Record<XrplNetwork, string> = {
  mainnet: "wss://xrplcluster.com/",
  testnet: "wss://s.altnet.rippletest.net:51233",
  devnet: "wss://s.devnet.rippletest.net:51233",
};
const stringify = (value: Decimal) => value.toSignificantDigits(16, Decimal.ROUND_DOWN).toFixed();
const number = (value: unknown) => {
  if (typeof value !== "string" && typeof value !== "number") throw new Error("Missing amount");
  const result = new D(value);
  if (!result.isFinite()) throw new Error("Invalid amount");
  return result;
};
export const dnaAssetKey = (currency: string, issuer: string) => currency + ":" + issuer;
export function dnaSymbol(currency: string) {
  if (!/^[A-Fa-f0-9]{40}$/.test(currency)) return currency;
  const bytes = new Uint8Array(currency.match(/../g)!.map(value => parseInt(value, 16)));
  return new TextDecoder().decode(bytes).replace(/\0/g, "") || currency;
}

async function rpc(network: XrplNetwork, command: string, params: Json, signal?: AbortSignal): Promise<Json> {
  if (signal?.aborted) throw new Error("Scan cancelled");
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(ENDPOINTS[network]);
    const id = crypto.randomUUID();
    let settled = false;
    const finish = (error?: Error, result?: Json) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      signal?.removeEventListener("abort", abort);
      socket.close();
      error ? reject(error) : resolve(result!);
    };
    const abort = () => finish(new Error("Scan cancelled"));
    const timeout = setTimeout(() => finish(new Error("XRPL did not answer in time. Try again.")), 15000);
    signal?.addEventListener("abort", abort, { once: true });
    socket.onopen = () => {
      // The public cluster currently rejects account_tx v2; v1 has equivalent
      // validated metadata, with tx/hash/ledger_index nested differently.
      if (!settled) socket.send(JSON.stringify({ id, command, api_version: command === "account_tx" ? 1 : 2, ...params }));
    };
    socket.onmessage = event => {
      try {
        const response = JSON.parse(String(event.data));
        if (response.id !== id) return;
        if (response.status === "error" || response.result?.error || !response.result) {
          const message = response.error_message || response.result?.error_message || response.error || response.result?.error || "XRPL request failed";
          finish(new Error(/rate limit|quota/i.test(message) ? "The public XRPL server is busy. Wait at least a minute before trying again." : message));
        } else finish(undefined, response.result);
      } catch { finish(new Error("XRPL returned an unreadable response")); }
    };
    socket.onerror = () => finish(new Error("Could not reach the selected XRP Ledger"));
    socket.onclose = () => { if (!settled) finish(new Error("XRPL connection closed before the result")); };
  });
}

// Balance deltas come from validated metadata, never Payment.Amount/SendMax.
function changes(meta: Json, account: string) {
  if (!Array.isArray(meta.AffectedNodes)) throw new Error("Missing transaction metadata");
  const tokens = new Map<string, Decimal>();
  let xrp = new D(0);
  let createdAccount = false;
  for (const wrapper of meta.AffectedNodes) {
    const created = Boolean(wrapper.CreatedNode);
    const deleted = Boolean(wrapper.DeletedNode);
    const node = wrapper.CreatedNode || wrapper.ModifiedNode || wrapper.DeletedNode;
    if (!node) throw new Error("Incomplete ledger node");
    const final = node.NewFields || node.FinalFields || {};
    const before = node.PreviousFields || {};
    if (node.LedgerEntryType === "AccountRoot" && final.Account === account) {
      if (created) createdAccount = true;
      if (created) xrp = xrp.plus(number(final.Balance).div(1000000));
      else if (before.Balance !== undefined) xrp = xrp.plus(number(final.Balance).minus(number(before.Balance)).div(1000000));
    }
    if (node.LedgerEntryType !== "RippleState") continue;
    const low = final.LowLimit?.issuer;
    const high = final.HighLimit?.issuer;
    if (account !== low && account !== high) continue;
    if (!created && !deleted && before.Balance === undefined) continue;
    const end = deleted ? new D(0) : number(final.Balance?.value);
    const start = created ? new D(0) : number(before.Balance?.value ?? final.Balance?.value);
    const delta = end.minus(start).mul(account === low ? 1 : -1);
    const key = dnaAssetKey(final.Balance?.currency || final.LowLimit?.currency, account === low ? high : low);
    tokens.set(key, (tokens.get(key) || new D(0)).plus(delta));
  }
  return { xrp, tokens, createdAccount };
}

export function deriveDnaBasis(account: string, assets: DnaAsset[], history: Json[], complete: boolean): Map<string, DnaBasis> {
  const state = new Map<string, { quantity: Decimal; cost: Decimal; known: boolean; buys: DnaBasis["observedPurchases"] }>();
  let valid = true;
  let accountCreationSeen = false;
  const seen = new Set<string>();
  const ordered = history.map<Json>(row => ({ ...row, ledger_index: row.ledger_index ?? row.tx?.ledger_index })).sort((a, b) => (a.ledger_index - b.ledger_index) || ((a.meta?.TransactionIndex ?? 0) - (b.meta?.TransactionIndex ?? 0)));
  for (const row of ordered) {
    const tx = row.tx_json || row.tx;
    const hash = row.hash || tx?.hash;
    if (row.validated !== true || !tx || typeof hash !== "string" || !/^[A-Fa-f0-9]{64}$/.test(hash) || !Number.isInteger(row.ledger_index) || !Number.isInteger(row.meta?.TransactionIndex)) {
      valid = false; continue;
    }
    if (seen.has(hash)) continue;
    seen.add(hash);
    if (row.meta.TransactionResult !== "tesSUCCESS") continue;
    try {
      const delta = changes(row.meta, account);
      accountCreationSeen ||= delta.createdAccount;
      const ownFee = tx.Account === account ? number(tx.Fee).div(1000000) : new D(0);
      const principalXrp = delta.xrp.plus(ownFee);
      const changed = [...delta.tokens.entries()].filter(([, value]) => !value.isZero());
      // These paths may include DEX/AMM conversion; metadata gives actual net amounts.
      const exchangeType = tx.TransactionType === "OfferCreate" || tx.TransactionType === "Payment";
      for (const [key, amount] of changed) {
        const item = state.get(key) || { quantity: new D(0), cost: new D(0), known: true, buys: [] };
        if (amount.gt(0)) {
          const purchase = exchangeType && changed.length === 1 && principalXrp.lt(0);
          if (purchase) {
            const cost = delta.xrp.neg(); // includes the sender's network fee exactly once
            item.cost = item.cost.plus(cost);
            item.buys.push({ hash, quantity: stringify(amount), costXrp: stringify(cost) });
          } else item.known = false; // transfer, airdrop, complex conversion: acquisition cost unknown
          item.quantity = item.quantity.plus(amount);
        } else {
          const remaining = item.quantity.plus(amount);
          if (remaining.lt(0) || item.quantity.lte(0)) item.known = false;
          else item.cost = item.cost.mul(remaining).div(item.quantity);
          item.quantity = remaining;
          if (remaining.isZero()) { item.cost = new D(0); item.known = true; }
        }
        state.set(key, item);
      }
    } catch { valid = false; }
  }
  return new Map(assets.map(asset => {
    const key = dnaAssetKey(asset.currency, asset.issuer);
    const item = state.get(key);
    const balance = number(asset.balance);
    const matches = item && item.quantity.minus(balance).abs().lte(D.max(balance.abs().mul("1e-14"), "1e-14"));
    const known = Boolean(complete && valid && accountCreationSeen && item?.known && matches && balance.gt(0));
    return [key, {
      status: known ? "known" : "unknown",
      totalCostXrp: known ? stringify(item!.cost) : null,
      averageCostXrp: known ? stringify(item!.cost.div(balance)) : null,
      reason: known ? "Weighted average from validated wallet history, including directly attributable purchase fees."
        : !complete ? "The scan limit was reached or the history service is unavailable."
        : !valid || !accountCreationSeen ? "The available history does not establish a complete opening balance."
        : !matches ? "The reconstructed holdings do not match the ledger balance."
        : "An incoming transfer or unsupported acquisition has an unknown purchase cost.",
      observedPurchases: item?.buys.slice(-5) || [],
    } satisfies DnaBasis];
  }));
}

export async function scanAgeWalletDna(accountInput: string, network: XrplNetwork, signal?: AbortSignal): Promise<DnaScan> {
  const account = accountInput.trim();
  if (!/^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(account)) throw new Error("Enter a public XRPL r-address.");
  const info = await rpc(network, "account_info", { account, ledger_index: "validated" }, signal);
  const ledger = info.ledger_index;
  if (info.validated !== true || !Number.isInteger(ledger) || info.account_data?.Account !== account) throw new Error("No validated account snapshot was returned");
  let marker: unknown;
  let rawLines: Json[] = [];
  for (let page = 0; page < 4; page++) {
    const result = await rpc(network, "account_lines", { account, ledger_index: ledger, limit: 200, ...(marker ? { marker } : {}) }, signal);
    if (!Array.isArray(result.lines) || result.validated !== true || result.ledger_index !== ledger || result.account !== account) throw new Error("Validated trustline data is unavailable");
    rawLines.push(...result.lines);
    marker = result.marker;
    if (!marker) break;
  }
  const assetsPartial = Boolean(marker);
  const assets: DnaAsset[] = rawLines.filter(line => number(line.balance).gt(0)).map(line => ({
    currency: line.currency, issuer: line.account, balance: line.balance,
    frozen: Boolean(line.freeze || line.freeze_peer || line.deep_freeze || line.deep_freeze_peer),
  }));
  const history: Json[] = [];
  let historyComplete = false;
  marker = undefined;
  try {
    for (let page = 0; page < 4; page++) {
      const result = await rpc(network, "account_tx", {
        account, ledger_index_min: -1, ledger_index_max: ledger, limit: 50,
        binary: false, forward: false, ...(marker ? { marker } : {}),
      }, signal);
      if (!Array.isArray(result.transactions) || result.validated !== true || result.account !== account || result.ledger_index_max !== ledger) throw new Error("Complete validated history is unavailable");
      history.push(...result.transactions);
      marker = result.marker;
      if (!marker) { historyComplete = true; break; }
    }
  } catch (error) { if (signal?.aborted) throw error; }
  const basis = deriveDnaBasis(account, assets, history, historyComplete);
  return {
    account, network, ledger, scannedAt: new Date().toISOString(),
    xrpBalance: stringify(number(info.account_data.Balance).div(1000000)),
    assets: assets.map(asset => ({ ...asset, basis: basis.get(dnaAssetKey(asset.currency, asset.issuer))! })),
    historyCount: history.length, historyComplete, assetsPartial,
  };
}

export function simulateDnaBids(input: {
  asset: DnaAsset & { basis: DnaBasis }; account: string; offers: Json[];
  transferRate: string; feeDrops: string; ledger: number; ledgerCloseTime: number;
}): DnaQuote {
  const requested = number(input.asset.balance);
  const rate = number(input.transferRate);
  const fee = number(input.feeDrops).div(1000000);
  if (requested.lte(0) || rate.lt(1) || fee.lt(0) || !Number.isInteger(input.ledgerCloseTime)) throw new Error("Invalid quote inputs");
  const bids = input.offers.filter(offer => offer.Account !== input.account && (offer.Expiration === undefined || (Number.isInteger(offer.Expiration) && offer.Expiration > input.ledgerCloseTime))).map(offer => {
    if (typeof offer.TakerGets !== "string" || offer.TakerPays?.currency !== input.asset.currency || offer.TakerPays?.issuer !== input.asset.issuer) throw new Error("Order book asset mismatch");
    const xrp = number(offer.TakerGets).div(1000000);
    const tokens = number(offer.TakerPays.value);
    if (xrp.lte(0) || tokens.lte(0)) throw new Error("Invalid bid");
    const fundedXrp = offer.taker_gets_funded === undefined ? xrp : number(offer.taker_gets_funded).div(1000000);
    const fundedTokens = offer.taker_pays_funded === undefined ? tokens : number(typeof offer.taker_pays_funded === "object" ? offer.taker_pays_funded.value : offer.taker_pays_funded);
    const scale = D.min(1, fundedXrp.div(xrp), fundedTokens.div(tokens));
    return { price: xrp.div(tokens), tokens: tokens.mul(D.max(0, scale)), rate: offer.Account === input.asset.issuer ? new D(1) : rate };
  }).sort((a, b) => b.price.comparedTo(a.price));
  let remaining = requested;
  let gross = new D(0);
  for (const bid of bids) {
    const budget = remaining.div(bid.rate);
    const consumesRemainder = budget.lte(bid.tokens);
    const fill = D.min(budget, bid.tokens);
    gross = gross.plus(fill.mul(bid.price));
    remaining = consumesRemainder ? new D(0) : remaining.minus(fill.mul(bid.rate));
    if (remaining.isZero()) break;
  }
  const covered = requested.minus(remaining);
  const fullCoverage = remaining.isZero();
  const net = gross.minus(fee);
  const pnl = fullCoverage && !input.asset.frozen && input.asset.basis.status === "known" && input.asset.basis.totalCostXrp !== null
    ? net.minus(number(input.asset.basis.totalCostXrp)) : null;
  const cost = input.asset.basis.totalCostXrp === null ? null : number(input.asset.basis.totalCostXrp);
  return {
    ledger: input.ledger, quotedAt: new Date().toISOString(),
    requestedTokens: stringify(requested), coveredTokens: stringify(covered),
    grossXrp: stringify(gross), feeXrp: stringify(fee), netXrp: stringify(net), fullCoverage,
    estimatedPnlXrp: pnl === null ? null : stringify(pnl),
    estimatedPnlPercent: pnl !== null && cost?.gt(0) ? stringify(pnl.div(cost).mul(100)) : null,
  };
}

export async function quoteAgeWalletDna(scan: DnaScan, asset: DnaScan["assets"][number], signal?: AbortSignal): Promise<DnaQuote> {
  if (asset.frozen) throw new Error("A trustline freeze flag prevents a usable sale estimate.");
  const info = await rpc(scan.network, "account_info", { account: asset.issuer, ledger_index: "validated" }, signal);
  if (info.validated !== true || !Number.isInteger(info.ledger_index) || info.account_data?.Account !== asset.issuer) throw new Error("Issuer evidence is unavailable");
  if ((Number(info.account_data.Flags) & 0x00400000) !== 0) throw new Error("Issuer Global Freeze is active");
  // A fresh quote must use the same holdings as the scan; old balances are not sale inventory.
  const [lines, book, fees, ledgerSnapshot] = await Promise.all([
    rpc(scan.network, "account_lines", { account: scan.account, peer: asset.issuer, ledger_index: info.ledger_index, limit: 400 }, signal),
    rpc(scan.network, "book_offers", { ledger_index: info.ledger_index, taker: scan.account, taker_gets: { currency: "XRP" }, taker_pays: { currency: asset.currency, issuer: asset.issuer }, limit: 100 }, signal),
    rpc(scan.network, "fee", {}, signal),
    rpc(scan.network, "ledger", { ledger_index: info.ledger_index, transactions: false, expand: false }, signal),
  ]);
  // book_offers may omit `validated`; its exact ledger must match the validated issuer snapshot.
  if (lines.validated !== true || lines.ledger_index !== info.ledger_index || lines.account !== scan.account || book.validated === false || book.ledger_index !== info.ledger_index) throw new Error("Quote responses do not share a validated ledger");
  if (ledgerSnapshot.validated !== true || ledgerSnapshot.ledger_index !== info.ledger_index || !Number.isInteger(ledgerSnapshot.ledger?.close_time)) throw new Error("The order book's validation time is unavailable");
  const current = lines.lines?.find((line: Json) => line.currency === asset.currency && line.account === asset.issuer);
  if (!current || !number(current.balance).eq(asset.balance) || current.freeze || current.freeze_peer || current.deep_freeze || current.deep_freeze_peer) throw new Error("Wallet holdings changed or are restricted. Run a new scan.");
  if ((Number(info.account_data.Flags) & 0x00040000) !== 0 && current.peer_authorized !== true) throw new Error("Issuer authorization has not been established");
  if (!Array.isArray(book.offers)) throw new Error("Order book data is unavailable");
  return simulateDnaBids({
    account: scan.account, asset, offers: book.offers,
    transferRate: stringify(number(info.account_data.TransferRate ?? "1000000000").div(1000000000)),
    feeDrops: fees.drops?.open_ledger_fee, ledger: info.ledger_index, ledgerCloseTime: ledgerSnapshot.ledger.close_time,
  });
}
