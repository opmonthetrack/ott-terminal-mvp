import type { XrplNetwork } from "./walletRegistry";

export type XrplTrustline = {
  currency: string;
  issuer: string;
  balance: string;
  limit: string;
  noRipple: boolean;
  noRipplePeer: boolean;
  freeze: boolean;
  freezePeer: boolean;
  authorized: boolean;
  peerAuthorized: boolean;
};

export type XrplNft = {
  id: string;
  issuer: string;
  uri: string;
  taxon: number;
  serial: number;
  transferFee: number;
  flags: number;
  burnable: boolean;
  onlyXrp: boolean;
  transferable: boolean;
};

export type XrplRecentTransaction = {
  hash: string;
  transactionType: string;
  direction: "incoming" | "outgoing" | "self" | "related";
  counterparty: string;
  amount: string;
  result: string;
  successful: boolean;
  validated: boolean;
  ledgerIndex: number;
  date: string;
  sourceTag: number | null;
  destinationTag: number | null;
};

export type XrplWalletProfile = {
  address: string;
  network: XrplNetwork;
  ledgerIndex: number;
  balanceXrp: string;
  availableXrp: string;
  estimatedReserveXrp: string;
  reserveBaseXrp: string;
  reserveIncrementXrp: string;
  sequence: number;
  ownerCount: number;
  domain: string;
  regularKey: string;
  accountFlags: number;
  trustlineCount: number;
  tokenCount: number;
  nftCount: number;
  offerCount: number;
  escrowCount: number;
  signerListCount: number;
  paymentChannelCount: number;
  checkCount: number;
  depositPreauthCount: number;
  ticketCount: number;
  ammPositionCount: number;
  objectCountLoaded: number;
  partial: boolean;
  loadedAt: string;
};

export type XrplWalletWorkspace = {
  profile: XrplWalletProfile;
  trustlines: XrplTrustline[];
  nfts: XrplNft[];
  transactions: XrplRecentTransaction[];
};

export type XrplTransactionSnapshot = {
  hash: string;
  network: XrplNetwork;
  validated: boolean;
  successful: boolean;
  result: string;
  transactionType: string;
  account: string;
  destination: string;
  amount: string;
  feeXrp: string;
  sourceTag: number | null;
  destinationTag: number | null;
  ledgerIndex: number;
  date: string;
};

type LedgerObject = { LedgerEntryType?: string; [key: string]: unknown };
type RawTrustline = {
  currency?: string;
  balance?: string;
  account?: string;
  limit?: string;
  no_ripple?: boolean;
  no_ripple_peer?: boolean;
  freeze?: boolean;
  freeze_peer?: boolean;
  authorized?: boolean;
  peer_authorized?: boolean;
};
type RawNft = {
  NFTokenID?: string;
  Issuer?: string;
  URI?: string;
  NFTokenTaxon?: number;
  nft_serial?: number;
  TransferFee?: number;
  Flags?: number;
};
type RawTransaction = {
  hash?: string;
  TransactionType?: string;
  Account?: string;
  Destination?: string;
  Amount?: string | { currency?: string; issuer?: string; value?: string };
  DeliverMax?: string | { currency?: string; issuer?: string; value?: string };
  Fee?: string;
  SourceTag?: number;
  DestinationTag?: number;
  date?: number;
};
type RawAccountTransaction = {
  tx?: RawTransaction;
  tx_json?: RawTransaction;
  hash?: string;
  ledger_index?: number;
  validated?: boolean;
  meta?: { TransactionResult?: string };
};

type XrplResponse = {
  id?: number;
  result?: {
    error?: string;
    error_message?: string;
    ledger_index?: number;
    marker?: unknown;
    account_data?: {
      Account?: string;
      Balance?: string;
      Sequence?: number;
      OwnerCount?: number;
      Domain?: string;
      Flags?: number;
      RegularKey?: string;
    };
    lines?: RawTrustline[];
    account_objects?: LedgerObject[];
    account_nfts?: RawNft[];
    transactions?: RawAccountTransaction[];
    info?: {
      validated_ledger?: {
        seq?: number;
        reserve_base_xrp?: string | number;
        reserve_inc_xrp?: string | number;
      };
    };
    validated_ledger?: {
      seq?: number;
      reserve_base_xrp?: string | number;
      reserve_inc_xrp?: string | number;
    };
    hash?: string;
    validated?: boolean;
    TransactionType?: string;
    Account?: string;
    Destination?: string;
    Amount?: string | { currency?: string; issuer?: string; value?: string };
    DeliverMax?: string | { currency?: string; issuer?: string; value?: string };
    Fee?: string;
    SourceTag?: number;
    DestinationTag?: number;
    date?: number;
    tx_json?: RawTransaction & { hash?: string };
    meta?: { TransactionResult?: string };
  };
};

const NETWORK_ENDPOINTS: Record<XrplNetwork, string> = {
  mainnet: "wss://xrplcluster.com/",
  testnet: "wss://s.altnet.rippletest.net:51233",
  devnet: "wss://s.devnet.rippletest.net:51233",
};

const XRPL_EPOCH_OFFSET_SECONDS = 946_684_800;

function requestXrpl(network: XrplNetwork, request: Record<string, unknown>) {
  return new Promise<XrplResponse>((resolve, reject) => {
    const socket = new WebSocket(NETWORK_ENDPOINTS[network]);
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const timeout = window.setTimeout(() => {
      socket.close();
      reject(new Error("XRPL request timed out."));
    }, 15_000);

    socket.onopen = () => socket.send(JSON.stringify({ id, ...request }));
    socket.onmessage = (event) => {
      try {
        const response = JSON.parse(String(event.data)) as XrplResponse;
        if (response.id !== id) return;
        window.clearTimeout(timeout);
        socket.close();
        if (response.result?.error) {
          reject(new Error(response.result.error_message || response.result.error));
          return;
        }
        resolve(response);
      } catch (error) {
        window.clearTimeout(timeout);
        socket.close();
        reject(error);
      }
    };
    socket.onerror = () => {
      window.clearTimeout(timeout);
      socket.close();
      reject(new Error("Could not reach the XRP Ledger."));
    };
  });
}

function dropsToXrpNumber(value: string) {
  const parsed = Number(value) / 1_000_000;
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatXrpNumber(value: number) {
  return Math.max(0, value).toLocaleString(undefined, { maximumFractionDigits: 6 });
}

function dropsToXrp(value: string) {
  return formatXrpNumber(dropsToXrpNumber(value));
}

function decodeHexText(value?: string) {
  if (!value) return "";
  try {
    const bytes = value.match(/.{1,2}/g)?.map((part) => Number.parseInt(part, 16)) ?? [];
    return new TextDecoder().decode(new Uint8Array(bytes)).replace(/\0/g, "").trim();
  } catch {
    return "";
  }
}

function decodeCurrency(value?: string) {
  if (!value) return "Unknown";
  if (/^[A-Za-z0-9?!@#$%^&*<>(){}\[\]|]{3}$/.test(value)) return value;
  const decoded = decodeHexText(value);
  return decoded || `${value.slice(0, 6)}…${value.slice(-4)}`;
}

function countObjects(objects: LedgerObject[], type: string) {
  return objects.filter((object) => object.LedgerEntryType === type).length;
}

function formatTransactionAmount(value: unknown) {
  if (typeof value === "string") return `${dropsToXrp(value)} XRP`;
  if (typeof value === "object" && value !== null) {
    const amount = value as { currency?: string; value?: string };
    return `${amount.value?.trim() || "unknown"} ${decodeCurrency(amount.currency)}`;
  }
  return "Not displayed";
}

function rippleDate(value?: number) {
  if (typeof value !== "number") return "Date unavailable";
  return new Date((value + XRPL_EPOCH_OFFSET_SECONDS) * 1000).toISOString();
}

function mapTrustline(line: RawTrustline): XrplTrustline {
  return {
    currency: decodeCurrency(line.currency),
    issuer: line.account ?? "Unknown issuer",
    balance: line.balance ?? "0",
    limit: line.limit ?? "0",
    noRipple: line.no_ripple === true,
    noRipplePeer: line.no_ripple_peer === true,
    freeze: line.freeze === true,
    freezePeer: line.freeze_peer === true,
    authorized: line.authorized === true,
    peerAuthorized: line.peer_authorized === true,
  };
}

function mapNft(nft: RawNft): XrplNft {
  const flags = nft.Flags ?? 0;
  return {
    id: nft.NFTokenID ?? "Unknown NFT",
    issuer: nft.Issuer ?? "Unknown issuer",
    uri: decodeHexText(nft.URI),
    taxon: nft.NFTokenTaxon ?? 0,
    serial: nft.nft_serial ?? 0,
    transferFee: (nft.TransferFee ?? 0) / 1000,
    flags,
    burnable: (flags & 1) !== 0,
    onlyXrp: (flags & 2) !== 0,
    transferable: (flags & 8) !== 0,
  };
}

function mapRecentTransaction(entry: RawAccountTransaction, address: string): XrplRecentTransaction | null {
  const tx = entry.tx_json ?? entry.tx;
  if (!tx?.TransactionType || !tx.Account) return null;
  const destination = tx.Destination ?? "";
  const direction = tx.Account === address && destination === address
    ? "self"
    : tx.Account === address
      ? "outgoing"
      : destination === address
        ? "incoming"
        : "related";
  const counterparty = direction === "outgoing" ? destination : tx.Account;
  const result = entry.meta?.TransactionResult ?? "Unknown";
  return {
    hash: (tx.hash ?? entry.hash ?? "").toUpperCase(),
    transactionType: tx.TransactionType,
    direction,
    counterparty,
    amount: formatTransactionAmount(tx.Amount ?? tx.DeliverMax),
    result,
    successful: result === "tesSUCCESS",
    validated: entry.validated === true,
    ledgerIndex: entry.ledger_index ?? 0,
    date: rippleDate(tx.date),
    sourceTag: typeof tx.SourceTag === "number" ? tx.SourceTag : null,
    destinationTag: typeof tx.DestinationTag === "number" ? tx.DestinationTag : null,
  };
}

export async function loadXrplWalletWorkspace(
  address: string,
  network: XrplNetwork = "mainnet",
): Promise<XrplWalletWorkspace> {
  const requests = await Promise.allSettled([
    requestXrpl(network, { command: "account_info", account: address, ledger_index: "validated" }),
    requestXrpl(network, { command: "account_lines", account: address, ledger_index: "validated", limit: 400 }),
    requestXrpl(network, { command: "account_objects", account: address, ledger_index: "validated", limit: 400 }),
    requestXrpl(network, { command: "account_nfts", account: address, ledger_index: "validated", limit: 400 }),
    requestXrpl(network, { command: "account_tx", account: address, ledger_index_min: -1, ledger_index_max: -1, limit: 30, forward: false, api_version: 2 }),
    requestXrpl(network, { command: "server_info" }),
  ]);

  const accountResult = requests[0];
  if (accountResult.status === "rejected") throw accountResult.reason;
  const account = accountResult.value.result?.account_data;
  if (!account?.Account) throw new Error("No validated XRPL account was found on the selected network.");

  const linesResult = requests[1].status === "fulfilled" ? requests[1].value : null;
  const objectsResult = requests[2].status === "fulfilled" ? requests[2].value : null;
  const nftsResult = requests[3].status === "fulfilled" ? requests[3].value : null;
  const txResult = requests[4].status === "fulfilled" ? requests[4].value : null;
  const stateResult = requests[5].status === "fulfilled" ? requests[5].value : null;
  const lines = linesResult?.result?.lines ?? [];
  const objects = objectsResult?.result?.account_objects ?? [];
  const nfts = nftsResult?.result?.account_nfts ?? [];
  const ledgerState = stateResult?.result?.info?.validated_ledger ?? stateResult?.result?.validated_ledger;
  const reserveBase = Number(ledgerState?.reserve_base_xrp ?? 1);
  const reserveIncrement = Number(ledgerState?.reserve_inc_xrp ?? 0.2);
  const estimatedReserve = reserveBase + (account.OwnerCount ?? 0) * reserveIncrement;
  const balance = dropsToXrpNumber(account.Balance ?? "0");
  const partial = requests.slice(1).some((result) => result.status === "rejected") ||
    Boolean(linesResult?.result?.marker || objectsResult?.result?.marker || nftsResult?.result?.marker || txResult?.result?.marker);

  return {
    profile: {
      address: account.Account,
      network,
      ledgerIndex: accountResult.value.result?.ledger_index ?? ledgerState?.seq ?? 0,
      balanceXrp: formatXrpNumber(balance),
      availableXrp: formatXrpNumber(balance - estimatedReserve),
      estimatedReserveXrp: formatXrpNumber(estimatedReserve),
      reserveBaseXrp: formatXrpNumber(reserveBase),
      reserveIncrementXrp: formatXrpNumber(reserveIncrement),
      sequence: account.Sequence ?? 0,
      ownerCount: account.OwnerCount ?? 0,
      domain: decodeHexText(account.Domain),
      regularKey: account.RegularKey ?? "",
      accountFlags: account.Flags ?? 0,
      trustlineCount: lines.length,
      tokenCount: lines.filter((line) => line.currency && line.balance !== "0").length,
      nftCount: nfts.length,
      offerCount: countObjects(objects, "Offer"),
      escrowCount: countObjects(objects, "Escrow"),
      signerListCount: countObjects(objects, "SignerList"),
      paymentChannelCount: countObjects(objects, "PayChannel"),
      checkCount: countObjects(objects, "Check"),
      depositPreauthCount: countObjects(objects, "DepositPreauth"),
      ticketCount: countObjects(objects, "Ticket"),
      ammPositionCount: countObjects(objects, "AMM") + countObjects(objects, "RippleState"),
      objectCountLoaded: objects.length,
      partial,
      loadedAt: new Date().toISOString(),
    },
    trustlines: lines.map(mapTrustline),
    nfts: nfts.map(mapNft),
    transactions: (txResult?.result?.transactions ?? [])
      .map((entry) => mapRecentTransaction(entry, account.Account ?? address))
      .filter((entry): entry is XrplRecentTransaction => entry !== null),
  };
}

export async function loadXrplWalletProfile(address: string, network: XrplNetwork = "mainnet") {
  return (await loadXrplWalletWorkspace(address, network)).profile;
}

export async function loadXrplTransactionSnapshot(hash: string, network: XrplNetwork = "mainnet") {
  const normalizedHash = hash.trim().toUpperCase();
  if (!/^[A-F0-9]{64}$/.test(normalizedHash)) throw new Error("Enter a valid 64-character XRPL transaction hash.");
  const response = await requestXrpl(network, { command: "tx", transaction: normalizedHash, binary: false });
  const result = response.result;
  const transaction = result?.tx_json ?? result;
  if (!transaction?.TransactionType || !transaction.Account) throw new Error("No transaction was found on the selected network.");
  const transactionResult = result?.meta?.TransactionResult ?? "Unknown";
  return {
    hash: transaction.hash?.toUpperCase() || normalizedHash,
    network,
    validated: result?.validated === true,
    successful: transactionResult === "tesSUCCESS",
    result: transactionResult,
    transactionType: transaction.TransactionType,
    account: transaction.Account,
    destination: transaction.Destination ?? "",
    amount: formatTransactionAmount(transaction.Amount ?? transaction.DeliverMax),
    feeXrp: transaction.Fee ? dropsToXrp(transaction.Fee) : "Unknown",
    sourceTag: typeof transaction.SourceTag === "number" ? transaction.SourceTag : null,
    destinationTag: typeof transaction.DestinationTag === "number" ? transaction.DestinationTag : null,
    ledgerIndex: result?.ledger_index ?? 0,
    date: rippleDate(transaction.date),
  } satisfies XrplTransactionSnapshot;
}
