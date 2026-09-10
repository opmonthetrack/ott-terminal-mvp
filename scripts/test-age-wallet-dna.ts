import assert from "node:assert/strict";
import { test } from "node:test";
import { deriveDnaBasis, dnaAssetKey, simulateDnaBids, scanAgeWalletDna, type DnaAsset, type DnaBasis } from "../src/lib/ageWalletDna";

const account = "rTestWallet";
const issuer = "rIssuerOne";
const otherIssuer = "rIssuerTwo";
const asset = (balance = "100", issue = issuer): DnaAsset => ({ currency: "USD", issuer: issue, balance, frozen: false });
const hash = (id: number) => id.toString(16).padStart(64, "0");
const row = (id: number, nodes: any[], extra: Record<string, any> = {}) => ({
  hash: hash(id), ledger_index: id, validated: true,
  tx_json: { Account: account, TransactionType: "OfferCreate", Fee: "10", ...extra },
  meta: { TransactionIndex: 0, TransactionResult: "tesSUCCESS", AffectedNodes: nodes },
});
const creation = row(1, [{ CreatedNode: { LedgerEntryType: "AccountRoot", NewFields: { Account: account, Balance: "1000000000" } } }], { Account: "rFunder", TransactionType: "Payment" });
function exchange(id: number, before: string, after: string, xrpDeltaDrops: number, options: { issue?: string; high?: boolean; type?: string } = {}) {
  const issue = options.issue ?? issuer;
  const sign = options.high ? -1 : 1;
  return row(id, [
    { ModifiedNode: { LedgerEntryType: "AccountRoot", PreviousFields: { Balance: "1000000000" }, FinalFields: { Account: account, Balance: String(1000000000 + xrpDeltaDrops) } } },
    { ModifiedNode: { LedgerEntryType: "RippleState", PreviousFields: { Balance: { currency: "USD", value: String(Number(before) * sign) } }, FinalFields: {
      Balance: { currency: "USD", value: String(Number(after) * sign) },
      LowLimit: { issuer: options.high ? issue : account, currency: "USD" },
      HighLimit: { issuer: options.high ? account : issue, currency: "USD" },
    } } },
  ], { TransactionType: options.type ?? "OfferCreate" });
}
function basis(history: any[], balance = "100", complete = true) {
  return deriveDnaBasis(account, [asset(balance)], history, complete).get(dnaAssetKey("USD", issuer))!;
}
const buy = exchange(2, "0", "100", -10000010);

test("validated purchase uses actual balance changes plus its direct network fee", () => {
  const result = basis([creation, buy]);
  assert.equal(result.status, "known");
  assert.equal(result.totalCostXrp, "10.00001");
  assert.equal(result.averageCostXrp, "0.1000001");
});
test("weighted cost is reduced proportionally on a partial sale, not replaced by sale proceeds", () => {
  const buyTwo = exchange(3, "100", "200", -20000010);
  const sale = exchange(4, "200", "150", 7000000 - 10);
  const result = basis([sale, buyTwo, buy, creation], "150");
  assert.equal(result.totalCostXrp, "22.500015");
  assert.equal(result.averageCostXrp, "0.1500001");
});
test("duplicate history rows cannot double acquisition costs", () => assert.equal(basis([creation, buy, buy]).totalCostXrp, "10.00001"));
test("the live cluster's API v1 nested transaction format has the same acquisition basis", () => {
  const history = [creation, buy].map(({ tx_json, hash, ledger_index, ...rest }) => ({ ...rest, tx: { ...tx_json, hash, ledger_index } }));
  assert.equal(basis(history).totalCostXrp, "10.00001");
});
test("high-side RippleState balance signs are inverted", () => assert.equal(basis([creation, exchange(2, "0", "100", -10000010, { high: true })]).totalCostXrp, "10.00001"));
test("identical token symbols from different issuers retain separate costs", () => {
  const all = deriveDnaBasis(account, [asset(), asset("100", otherIssuer)], [creation, buy, exchange(3, "0", "100", -50000010, { issue: otherIssuer })], true);
  assert.equal(all.get(dnaAssetKey("USD", issuer))?.totalCostXrp, "10.00001");
  assert.equal(all.get(dnaAssetKey("USD", otherIssuer))?.totalCostXrp, "50.00001");
});
test("partial-payment Amount and SendMax cannot override delivered balance changes", () => {
  const payment = exchange(2, "0", "100", -10000010, { type: "Payment" });
  Object.assign(payment.tx_json, { Amount: { currency: "USD", value: "1000000", issuer }, SendMax: "999999999999", Flags: 131072 });
  assert.equal(basis([creation, payment]).averageCostXrp, "0.1000001");
});
test("incoming transfers and airdrops never acquire an invented zero purchase price", () => {
  const result = basis([creation, exchange(2, "0", "100", -10, { type: "Payment" })]);
  assert.equal(result.status, "unknown"); assert.equal(result.totalCostXrp, null);
});
test("a transfer mixed into purchased holdings makes the remaining cost unknown", () => assert.equal(basis([creation, buy, exchange(3, "100", "120", -10, { type: "Payment" })], "120").status, "unknown"));
test("outgoing transfers reduce the weighted cost of remaining holdings", () => assert.equal(basis([creation, buy, exchange(3, "100", "50", -10, { type: "Payment" })], "50").totalCostXrp, "5.000005"));
test("a fully disposed unknown position can reset before a new evidenced acquisition", () => {
  const history = [creation, exchange(2, "0", "100", -10, { type: "Payment" }), exchange(3, "100", "0", 1000000), exchange(4, "0", "100", -10000010)];
  assert.equal(basis(history).totalCostXrp, "10.00001");
});
test("partial history cannot claim a full acquisition basis", () => assert.equal(basis([creation, buy], "100", false).totalCostXrp, null));
test("absence of the opening account history remains explicit", () => assert.equal(basis([buy]).status, "unknown"));
test("current ledger holdings must reconcile with reconstructed quantities", () => assert.equal(basis([creation, buy], "101").status, "unknown"));
test("unvalidated, missing or malformed transaction evidence fails closed", () => {
  for (const invalid of [{ ...buy, validated: false }, { ...buy, meta: undefined }, { ...buy, hash: "not-a-hash" }, { ...buy, ledger_index: undefined }]) {
    assert.equal(basis([creation, invalid]).status, "unknown");
  }
});
test("a failed transaction is not counted as a purchase", () => {
  const failed = exchange(3, "100", "200", -10000010);
  failed.meta.TransactionResult = "tecPATH_DRY";
  assert.equal(basis([creation, buy, failed]).totalCostXrp, "10.00001");
});
test("complex multi-token acquisitions do not assign all XRP to one token", () => {
  const complex = structuredClone(buy);
  complex.meta.AffectedNodes.push(exchange(3, "0", "50", -10, { issue: otherIssuer }).meta.AffectedNodes[1]);
  assert.equal(basis([creation, complex]).status, "unknown");
});

const known: DnaBasis = { status: "known", totalCostXrp: "10", averageCostXrp: "0.1", reason: "fixture", observedPurchases: [] };
const bid = (tokens: string, xrpDrops: string, extras: Record<string, any> = {}) => ({ Account: "rBidder", TakerGets: xrpDrops, TakerPays: { currency: "USD", issuer, value: tokens }, ...extras });
const quote = (offers: any[], overrides: Record<string, any> = {}) => simulateDnaBids({ account, asset: { ...asset(), basis: known }, offers, transferRate: "1", feeDrops: "10", ledger: 123, ledgerCloseTime: 800000000, ...overrides });

test("funded depth is consumed across price levels before net profit is estimated", () => {
  const q = quote([bid("100", "10000000"), bid("50", "15000000")]);
  assert.equal(q.grossXrp, "20"); assert.equal(q.netXrp, "19.99999"); assert.equal(q.estimatedPnlXrp, "9.99999");
});
test("partially funded offers cannot value the whole wallet at the headline price", () => {
  const q = quote([bid("100", "20000000", { taker_gets_funded: "4000000", taker_pays_funded: { currency: "USD", issuer, value: "20" } })]);
  assert.equal(q.coveredTokens, "20"); assert.equal(q.fullCoverage, false); assert.equal(q.estimatedPnlXrp, null);
});
test("the user's own bids cannot be counted as third-party liquidity", () => {
  const q = quote([bid("100", "20000000", { Account: account })]);
  assert.equal(q.grossXrp, "0"); assert.equal(q.fullCoverage, false);
});
test("issuer transfer rate reduces the tokens that can reach bidders", () => {
  const q = quote([bid("100", "20000000")], { transferRate: "1.25" });
  assert.equal(q.grossXrp, "16"); assert.equal(q.coveredTokens, "100"); assert.equal(q.fullCoverage, true);
});
test("a loss remains a loss after transaction fees", () => assert.equal(quote([bid("100", "9000000")]).estimatedPnlXrp, "-1.00001"));
test("expired orders are not available liquidity", () => {
  assert.equal(quote([bid("100", "20000000", { Expiration: 800000000 })]).fullCoverage, false);
  assert.equal(quote([bid("100", "20000000", { Expiration: 800000001 })]).fullCoverage, true);
});
test("issuer redemption bids are exempt from the issuer transfer rate", () => {
  assert.equal(quote([bid("100", "20000000", { Account: issuer })], { transferRate: "1.25" }).grossXrp, "20");
});
test("unknown basis and frozen holdings never produce a profit number", () => {
  assert.equal(quote([bid("100", "20000000")], { asset: { ...asset(), basis: { ...known, status: "unknown", totalCostXrp: null } } }).estimatedPnlXrp, null);
  assert.equal(quote([bid("100", "20000000")], { asset: { ...asset(), frozen: true, basis: known } }).estimatedPnlXrp, null);
});
test("an issuer mismatch in a book response is rejected", () => assert.throws(() => quote([bid("100", "20000000", { TakerPays: { currency: "USD", issuer: otherIssuer, value: "100" } })]), /mismatch/));
test("even tiny missing depth cannot become full coverage", () => assert.equal(quote([], { asset: { ...asset("0.000000000000001"), basis: known } }).fullCoverage, false));
test("invalid amounts are rejected instead of producing NaN or Infinity", () => {
  assert.throws(() => quote([bid("0", "1000000")]), /Invalid bid/);
  assert.throws(() => quote([], { feeDrops: "NaN" }), /Invalid amount/);
});
test("invalid input is rejected before any network request", async () => {
  await assert.rejects(scanAgeWalletDna("not an XRPL account", "mainnet"), /public XRPL/);
});
