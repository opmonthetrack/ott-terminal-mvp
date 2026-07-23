import fs from "node:fs";

const apiFile = "api/ott.ts";
let apiSource = fs.readFileSync(apiFile, "utf8");

const handlerMarker = "\nexport default async function handler(req: RequestLike, res: ResponseLike) {";
const handlerIndex = apiSource.indexOf(handlerMarker);
if (handlerIndex < 0) throw new Error("api/ott handler marker not found.");

const researchCode = String.raw`

const KNOWN_BLACKHOLE_ADDRESSES = new Set([
  "rrrrrrrrrrrrrrrrrrrrrhoLvTp",
  "rrrrrrrrrrrrrrrrrrrrBZbvji",
]);

function researchArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    : [];
}

function researchString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function researchNumber(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function callResearchXrpl(
  command: string,
  parameters: Record<string, unknown>,
) {
  const response = await fetch(XRPL_RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ method: command, params: [parameters] }),
  });

  const payload = await response.json() as {
    result?: Record<string, unknown>;
    error?: unknown;
  };
  const result = readObject(payload.result);
  const error = researchString(result.error) || researchString(payload.error);

  if (!response.ok || error) {
    throw new Error(
      researchString(result.error_message)
      || error
      || command + " request failed.",
    );
  }

  return result;
}

async function optionalResearchXrpl(
  command: string,
  parameters: Record<string, unknown>,
) {
  try {
    return { result: await callResearchXrpl(command, parameters), error: "" };
  } catch (error) {
    return {
      result: null,
      error: error instanceof Error ? error.message : command + " unavailable.",
    };
  }
}

async function paginatedResearchXrpl(
  command: string,
  listKey: string,
  parameters: Record<string, unknown>,
  maxPages = 5,
) {
  const entries: Record<string, unknown>[] = [];
  let marker: unknown = undefined;
  let lastResult: Record<string, unknown> = {};

  for (let page = 0; page < maxPages; page += 1) {
    const result = await callResearchXrpl(command, {
      ...parameters,
      ...(marker !== undefined ? { marker } : {}),
    });
    lastResult = result;
    entries.push(...researchArray(result[listKey]));
    marker = result.marker;
    if (marker === undefined || marker === null) {
      return { entries, complete: true, result: lastResult };
    }
  }

  return { entries, complete: false, result: lastResult };
}

function normalizeResearchCurrency(value: string) {
  const clean = value.trim().toUpperCase();
  if (/^[A-Z0-9?!@#$%^&*<>()[\]{}|]{3}$/.test(clean)) return clean;
  if (/^[0-9A-F]{40}$/.test(clean)) return clean;
  return "";
}

function readOfferAmount(value: unknown, expected: "xrp" | "token") {
  if (expected === "xrp") {
    const drops = researchNumber(value);
    return drops === null ? null : drops / 1_000_000;
  }

  const amount = readObject(value);
  return researchNumber(amount.value);
}

function readOfferField(offer: Record<string, unknown>, names: string[]) {
  for (const name of names) {
    if (offer[name] !== undefined && offer[name] !== null) return offer[name];
  }
  return undefined;
}

function summarizeOrderBook(
  asks: Record<string, unknown>[],
  bids: Record<string, unknown>[],
) {
  const askRows = asks.map((offer) => {
    const token = readOfferAmount(
      readOfferField(offer, ["taker_gets_funded", "TakerGets", "taker_gets"]),
      "token",
    );
    const xrp = readOfferAmount(
      readOfferField(offer, ["taker_pays_funded", "TakerPays", "taker_pays"]),
      "xrp",
    );
    return { token, xrp, price: token && xrp ? xrp / token : null };
  }).filter((row) => row.token && row.xrp && row.price);

  const bidRows = bids.map((offer) => {
    const xrp = readOfferAmount(
      readOfferField(offer, ["taker_gets_funded", "TakerGets", "taker_gets"]),
      "xrp",
    );
    const token = readOfferAmount(
      readOfferField(offer, ["taker_pays_funded", "TakerPays", "taker_pays"]),
      "token",
    );
    return { token, xrp, price: token && xrp ? xrp / token : null };
  }).filter((row) => row.token && row.xrp && row.price);

  const bestAsk = askRows.length
    ? Math.min(...askRows.map((row) => row.price as number))
    : null;
  const bestBid = bidRows.length
    ? Math.max(...bidRows.map((row) => row.price as number))
    : null;
  const midpoint = bestAsk !== null && bestBid !== null ? (bestAsk + bestBid) / 2 : null;
  const spreadPercent = midpoint && bestAsk !== null && bestBid !== null
    ? ((bestAsk - bestBid) / midpoint) * 100
    : null;

  return {
    askCount: askRows.length,
    bidCount: bidRows.length,
    bestAskXrp: bestAsk,
    bestBidXrp: bestBid,
    spreadPercent,
    askTokenDepth: askRows.reduce((sum, row) => sum + (row.token ?? 0), 0),
    bidTokenDepth: bidRows.reduce((sum, row) => sum + (row.token ?? 0), 0),
  };
}

function rippleDateToIso(value: unknown) {
  const seconds = researchNumber(value);
  if (seconds === null) return null;
  return new Date((seconds + 946684800) * 1000).toISOString();
}

async function handleAuditIssuer(body: RequestBody) {
  const issuer = getString(body, "issuer");
  const currency = normalizeResearchCurrency(getString(body, "currency"));

  if (!isValidXrplAddress(issuer)) {
    return { status: 400, body: { ok: false, error: "Missing or invalid XRPL issuer address." } };
  }
  if (!currency) {
    return { status: 400, body: { ok: false, error: "Use a 3-character or 40-hex XRPL currency code." } };
  }

  const info = await callResearchXrpl("account_info", {
    account: issuer,
    ledger_index: "validated",
    signer_lists: true,
    api_version: 2,
  });
  const accountData = readObject(info.account_data);
  const accountFlagsResult = readObject(info.account_flags);
  const numericFlags = researchNumber(accountData.Flags) ?? 0;
  const accountFlags = {
    defaultRipple: Boolean(accountFlagsResult.defaultRipple ?? (numericFlags & 0x00800000)),
    depositAuth: Boolean(accountFlagsResult.depositAuth ?? (numericFlags & 0x01000000)),
    disableMasterKey: Boolean(accountFlagsResult.disableMasterKey ?? (numericFlags & 0x00100000)),
    disallowIncomingXRP: Boolean(accountFlagsResult.disallowIncomingXRP ?? (numericFlags & 0x00080000)),
    globalFreeze: Boolean(accountFlagsResult.globalFreeze ?? (numericFlags & 0x00400000)),
    noFreeze: Boolean(accountFlagsResult.noFreeze ?? (numericFlags & 0x00200000)),
    requireAuthorization: Boolean(accountFlagsResult.requireAuthorization ?? (numericFlags & 0x00040000)),
    requireDestinationTag: Boolean(accountFlagsResult.requireDestinationTag ?? (numericFlags & 0x00020000)),
    allowTrustLineClawback: Boolean(accountFlagsResult.allowTrustLineClawback ?? ((numericFlags >>> 0) & 0x80000000)),
  };

  const [objectsState, linesState, gatewayState, txState, asksState, bidsState, ammState] = await Promise.all([
    paginatedResearchXrpl("account_objects", "account_objects", {
      account: issuer,
      ledger_index: "validated",
      limit: 400,
    }, 10).then((value) => ({ value, error: "" })).catch((error) => ({ value: null, error: error instanceof Error ? error.message : "account_objects unavailable." })),
    paginatedResearchXrpl("account_lines", "lines", {
      account: issuer,
      ledger_index: "validated",
      limit: 400,
    }, 10).then((value) => ({ value, error: "" })).catch((error) => ({ value: null, error: error instanceof Error ? error.message : "account_lines unavailable." })),
    optionalResearchXrpl("gateway_balances", {
      account: issuer,
      strict: true,
      ledger_index: "validated",
    }),
    optionalResearchXrpl("account_tx", {
      account: issuer,
      ledger_index_min: -1,
      ledger_index_max: -1,
      forward: false,
      limit: 50,
    }),
    optionalResearchXrpl("book_offers", {
      taker_gets: { currency, issuer },
      taker_pays: { currency: "XRP" },
      ledger_index: "validated",
      limit: 50,
    }),
    optionalResearchXrpl("book_offers", {
      taker_gets: { currency: "XRP" },
      taker_pays: { currency, issuer },
      ledger_index: "validated",
      limit: 50,
    }),
    optionalResearchXrpl("amm_info", {
      asset: { currency: "XRP" },
      asset2: { currency, issuer },
      ledger_index: "validated",
    }),
  ]);

  const objects = objectsState.value?.entries ?? [];
  const objectScanComplete = Boolean(objectsState.value?.complete);
  const signerLists = objects.filter((item) => item.LedgerEntryType === "SignerList");
  const delegates = objects.filter((item) => item.LedgerEntryType === "Delegate");
  const regularKey = researchString(accountData.RegularKey) || null;
  const regularKeyIsKnownBlackhole = Boolean(regularKey && KNOWN_BLACKHOLE_ADDRESSES.has(regularKey));
  const noSignerList = signerLists.length === 0;
  const noDelegates = delegates.length === 0;
  const conditionsMet = Boolean(
    accountFlags.disableMasterKey
    && regularKeyIsKnownBlackhole
    && noSignerList
    && noDelegates
    && objectScanComplete,
  );
  const blackholeStatus = !objectScanComplete
    ? "incomplete"
    : conditionsMet
      ? "conditions-met"
      : "not-established";

  const matchingLines = (linesState.value?.entries ?? []).filter((line) => (
    normalizeResearchCurrency(researchString(line.currency)) === currency
  ));
  const holders = matchingLines.map((line) => {
    const balance = researchNumber(line.balance) ?? 0;
    return {
      account: researchString(line.account),
      balance: balance < 0 ? Math.abs(balance) : 0,
      limit: researchString(line.limit) || null,
      freeze: Boolean(line.freeze || line.freeze_peer),
      authorized: typeof line.authorized === "boolean"
        ? line.authorized
        : typeof line.peer_authorized === "boolean"
          ? line.peer_authorized
          : null,
    };
  }).filter((holder) => holder.account && holder.balance > 0)
    .sort((a, b) => b.balance - a.balance);

  const obligations = readObject(gatewayState.result?.obligations);
  const obligation = researchString(obligations[currency]) || null;
  const asks = researchArray(asksState.result?.offers);
  const bids = researchArray(bidsState.result?.offers);
  const orderBook = summarizeOrderBook(asks, bids);

  const amm = readObject(ammState.result?.amm);
  const amount = amm.amount;
  const amount2 = amm.amount2;
  const xrpAmount = typeof amount === "string"
    ? String((researchNumber(amount) ?? 0) / 1_000_000)
    : typeof amount2 === "string"
      ? String((researchNumber(amount2) ?? 0) / 1_000_000)
      : null;
  const tokenAmountObject = typeof amount === "object" && amount !== null
    ? readObject(amount)
    : typeof amount2 === "object" && amount2 !== null
      ? readObject(amount2)
      : {};
  const tokenAmount = researchString(tokenAmountObject.value) || null;

  const transactions = researchArray(txState.result?.transactions).slice(0, 20).map((entry) => {
    const tx = readObject(entry.tx ?? entry.tx_json);
    const meta = readObject(entry.meta);
    return {
      hash: researchString(tx.hash) || researchString(entry.hash),
      type: researchString(tx.TransactionType) || "Unknown",
      result: researchString(meta.TransactionResult) || "unknown",
      ledgerIndex: researchNumber(entry.ledger_index ?? tx.ledger_index),
      date: rippleDateToIso(tx.date),
      account: researchString(tx.Account) || null,
      destination: researchString(tx.Destination) || null,
    };
  }).filter((tx) => tx.hash);

  const balanceDrops = researchNumber(accountData.Balance) ?? 0;
  const ledgerIndex = researchNumber(info.ledger_index);

  return {
    status: 200,
    body: {
      ok: true,
      checkedAt: new Date().toISOString(),
      ledgerIndex,
      issuer,
      currency,
      account: {
        balanceXrp: (balanceDrops / 1_000_000).toString(),
        ownerCount: researchNumber(accountData.OwnerCount) ?? 0,
        sequence: researchNumber(accountData.Sequence) ?? 0,
        domain: hexToText(researchString(accountData.Domain)) || null,
        regularKey,
        flags: accountFlags,
      },
      blackhole: {
        disableMaster: accountFlags.disableMasterKey,
        regularKeyIsKnownBlackhole,
        noSignerList,
        noDelegates,
        accountObjectsComplete: objectScanComplete,
        conditionsMet,
        status: blackholeStatus,
        explanation: conditionsMet
          ? "The account meets all currently checkable XRPL blackhole conditions: disabled master key, known blackhole RegularKey, no signer list and no delegates."
          : !objectScanComplete
            ? "The account-object scan was incomplete, so absence of signer lists or delegates cannot be established."
            : "One or more checkable blackhole conditions are not met. A disabled master key alone is not proof of blackholing.",
      },
      token: {
        obligation,
        holderCount: holders.length,
        trustlineCount: matchingLines.length,
        holderScanComplete: Boolean(linesState.value?.complete),
        topHolders: holders.slice(0, 20).map((holder) => ({
          ...holder,
          balance: holder.balance.toString(),
        })),
      },
      liquidity: {
        orderBook,
        amm: {
          exists: Boolean(amm.account),
          account: researchString(amm.account) || null,
          xrpAmount,
          tokenAmount,
          tradingFee: researchNumber(amm.trading_fee),
          error: ammState.error || null,
        },
      },
      recentTransactions: transactions,
      sourceStatus: {
        gatewayBalances: gatewayState.error || "complete",
        accountLines: linesState.error || (linesState.value?.complete ? "complete" : "partial"),
        accountObjects: objectsState.error || (objectScanComplete ? "complete" : "partial"),
        orderBooks: asksState.error || bidsState.error || "complete",
        amm: ammState.error || "complete",
        accountTransactions: txState.error || "complete",
      },
      limitations: [
        "A public ledger cannot prove that two wallets have the same beneficial owner; wallet relationships require separately sourced evidence and must be labelled as inference.",
        "A high holder count, visible order book or AMM does not prove legal compliance, real utility, fair valuation or safe exit liquidity.",
        "Blackhole status has no cryptographic certificate. This report checks observable ledger conditions only.",
        "Public XRPL servers can paginate or disable expensive methods. Partial scans are labelled and must not be presented as complete rich lists.",
        "This issuer audit is evidence for at most 20 points of the 100-point OTT Research Score and is not a buy recommendation.",
      ],
    },
  };
}
`;

if (!apiSource.includes("async function handleAuditIssuer")) {
  apiSource = apiSource.slice(0, handlerIndex) + researchCode + apiSource.slice(handlerIndex);
}

const actionAnchor = `    if (action === "xrpl.verifyTransaction") {\n      result = await handleVerifyTransaction(body);\n    }\n`;
const actionInsert = `    if (action === "xrpl.auditIssuer") {\n      result = await handleAuditIssuer(body);\n    }\n\n${actionAnchor}`;
if (!apiSource.includes('action === "xrpl.auditIssuer"')) {
  if (!apiSource.includes(actionAnchor)) throw new Error("api/ott action anchor not found.");
  apiSource = apiSource.replace(actionAnchor, actionInsert);
}

fs.writeFileSync(apiFile, apiSource);

const tabFile = "src/tabs/XrplVerifyTab.tsx";
let tabSource = fs.readFileSync(tabFile, "utf8");
const importAnchor = 'import { OTTLogo, OTTProofBadge } from "../components/OTTLogo";';
if (!tabSource.includes('from "../components/IssuerResearchAudit"')) {
  tabSource = tabSource.replace(
    importAnchor,
    `${importAnchor}\nimport { IssuerResearchAudit } from "../components/IssuerResearchAudit";`,
  );
}

const renderAnchor = `      </section>\n    </div>\n  );\n}\n\nfunction ResultCard`;
const renderInsert = `      </section>\n\n      <IssuerResearchAudit />\n    </div>\n  );\n}\n\nfunction ResultCard`;
if (!tabSource.includes("<IssuerResearchAudit />")) {
  if (!tabSource.includes(renderAnchor)) throw new Error("XRPL Verify render anchor not found.");
  tabSource = tabSource.replace(renderAnchor, renderInsert);
}

fs.writeFileSync(tabFile, tabSource);
console.log("Token research issuer audit integrated.");
