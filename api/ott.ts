// api/ott.ts must be self-contained for Vercel serverless runtime.
// Do not import from src/lib here; Node ESM cannot resolve those TS frontend modules at runtime.

const MAKE_WAVES_SOURCE_TAG = 2606170002;

type MakeWavesActionId =
  | "daily-checkin"
  | "source-tag-proof"
  | "wallet-safety"
  | "academy-lesson"
  | "xrpl-verify"
  | "roadmap-vote"
  | "ott-token-eligibility";

type MakeWavesAction = {
  id: MakeWavesActionId;
  title: string;
  xp: number;
  memo: string;
};

const MAKE_WAVES_ACTIONS: Record<MakeWavesActionId, MakeWavesAction> = {
  "daily-checkin": {
    id: "daily-checkin",
    title: "Daily Check-In",
    xp: 10,
    memo: "OTT_MAKE_WAVES | Daily Check-In | SourceTag 2606170002",
  },
  "source-tag-proof": {
    id: "source-tag-proof",
    title: "SourceTag Proof",
    xp: 15,
    memo: "OTT_MAKE_WAVES | SourceTag Proof | SourceTag 2606170002",
  },
  "wallet-safety": {
    id: "wallet-safety",
    title: "Wallet Safety",
    xp: 20,
    memo: "OTT_MAKE_WAVES | Wallet Safety | SourceTag 2606170002",
  },
  "academy-lesson": {
    id: "academy-lesson",
    title: "Academy Lesson",
    xp: 25,
    memo: "OTT_MAKE_WAVES | Academy Lesson | SourceTag 2606170002",
  },
  "xrpl-verify": {
    id: "xrpl-verify",
    title: "XRPL Verify",
    xp: 20,
    memo: "OTT_MAKE_WAVES | XRPL Verify | SourceTag 2606170002",
  },
  "roadmap-vote": {
    id: "roadmap-vote",
    title: "Roadmap Vote",
    xp: 0,
    memo: "OTT Make Waves Roadmap Vote",
  },
  "ott-token-eligibility": {
    id: "ott-token-eligibility",
    title: "OTT Token Eligibility",
    xp: 30,
    memo: "OTT_MAKE_WAVES | OTT Token Eligibility | SourceTag 2606170002",
  },
};

function getMakeWavesAction(actionId: MakeWavesActionId) {
  return MAKE_WAVES_ACTIONS[actionId] ?? MAKE_WAVES_ACTIONS["daily-checkin"];
}

function getMakeWavesMemo(actionId: MakeWavesActionId) {
  return getMakeWavesAction(actionId).memo;
}

function isMakeWavesSourceTag(value: number | null | undefined) {
  return value === MAKE_WAVES_SOURCE_TAG;
}

function getPartnerProofStampMemo(partnerId: string) {
  const cleanPartnerId = partnerId.trim() || "partner";

  return `OTT_PROOF_STAMP | ${cleanPartnerId} | SourceTag ${MAKE_WAVES_SOURCE_TAG}`;
}

const XAMAN_API_URL = "https://xumm.app/api/v1/platform/payload";
const XRPL_RPC_URL =
  process.env.XRPL_RPC_URL || "https://s1.ripple.com:51234/";
const ONE_XRP_DROPS = "1000000";

function normalizePublicUrl(value: string | undefined) {
  const cleanValue = value?.trim().replace(/\/$/, "");

  if (!cleanValue) {
    return "";
  }

  if (/^https?:\/\//i.test(cleanValue)) {
    return cleanValue;
  }

  return `https://${cleanValue}`;
}

const OTT_PUBLIC_APP_URL =
  normalizePublicUrl(process.env.OTT_PUBLIC_APP_URL) ||
  normalizePublicUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
  "https://ott-terminal-mvp.vercel.app";

const OTT_BRAND_NAME = "XRPL OnTheTrack Terminal";
const OTT_LOGO_URL = `${OTT_PUBLIC_APP_URL}/logo.png`;

const OTT_WALLET_IDENTITIES = {
  proof:
    process.env.OTT_PROOF_DESTINATION_WALLET?.trim() ||
    "set-OTT_PROOF_DESTINATION_WALLET",
  truthDesk:
    process.env.OTT_TRUTH_DESK_WALLET?.trim() ||
    "set-OTT_TRUTH_DESK_WALLET",
  access:
    process.env.OTT_ACCESS_WALLET?.trim() ||
    "set-OTT_ACCESS_WALLET",
};


type RequestBody = Record<string, unknown> & {
  action?: string;
};

type RequestLike = {
  method?: string;
  body?: RequestBody;
};

type ResponseLike = {
  status: (code: number) => {
    json: (body: unknown) => void;
  };
};

type XrplMemo = {
  Memo?: {
    MemoType?: string;
    MemoData?: string;
    MemoFormat?: string;
  };
};

type IssuedCurrencyAmount = {
  currency?: string;
  issuer?: string;
  value?: string;
};

type XrplTxJson = {
  Account?: string;
  Destination?: string;
  SourceTag?: number;
  TransactionType?: string;
  Amount?: string | IssuedCurrencyAmount;
  Memos?: XrplMemo[];
};

type XrplMeta = {
  TransactionResult?: string;
};

type XrplTxResult = {
  validated?: boolean;
  tx_json?: XrplTxJson;
  tx?: XrplTxJson;
  meta?: XrplMeta;
  hash?: string;
  ledger_index?: number;
};

type XrplRpcResponse = {
  result?: XrplTxResult & {
    error?: string;
    error_message?: string;
  };
  error?: string;
};

function textToHex(value: string) {
  return Array.from(new TextEncoder().encode(value))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

function hexToText(value: string | undefined) {
  if (!value || value.length % 2 !== 0) {
    return "";
  }

  try {
    const bytes = value.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) ?? [];
    return new TextDecoder().decode(new Uint8Array(bytes));
  } catch {
    return "";
  }
}

function getString(body: RequestBody, key: string) {
  const value = body[key];

  return typeof value === "string" ? value.trim() : "";
}

function getNumber(body: RequestBody, key: string) {
  const value = body[key];

  return typeof value === "number" ? value : undefined;
}

function isValidXrplAddress(value: string) {
  return /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(value);
}

function isValidTxHash(value: string) {
  return /^[A-Fa-f0-9]{64}$/.test(value);
}

function cleanAmountDrops(value: string, fallback = "1") {
  if (!value || !/^[0-9]+$/.test(value)) {
    return fallback;
  }

  return value;
}

function cleanCurrencyCode(value: string) {
  const cleanValue = value.trim().toUpperCase().slice(0, 20);

  return cleanValue || "OTT";
}

function cleanTokenAmount(value: string) {
  if (!value || Number.isNaN(Number(value))) {
    return "1";
  }

  return value;
}

function readTxJson(result: XrplTxResult): XrplTxJson {
  return result.tx_json ?? result.tx ?? {};
}

function readMeta(result: XrplTxResult): XrplMeta {
  return result.meta ?? {};
}

function extractMemoText(memos: XrplMemo[] | undefined) {
  if (!memos?.length) {
    return [];
  }

  return memos.map((memo) => ({
    type: hexToText(memo.Memo?.MemoType),
    data: hexToText(memo.Memo?.MemoData),
    format: hexToText(memo.Memo?.MemoFormat),
  }));
}

function matchesOptional(expected: string, actual: string | null) {
  if (!expected) {
    return true;
  }

  return expected === actual;
}

function memoContainsExpected(expectedMemoContains: string, memoData: string[]) {
  if (!expectedMemoContains) {
    return true;
  }

  return memoData.some((memo) => memo.includes(expectedMemoContains));
}

function normalizeCurrency(value: string | undefined) {
  return value?.trim().toUpperCase() ?? "";
}

function isIssuedCurrencyAmount(
  amount: string | IssuedCurrencyAmount | undefined
): amount is IssuedCurrencyAmount {
  return Boolean(amount && typeof amount === "object");
}

function getXamanHeaders() {
  const apiKey = process.env.XAMAN_API_KEY;
  const apiSecret = process.env.XAMAN_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error("Missing XAMAN_API_KEY or XAMAN_API_SECRET.");
  }

  return {
    "Content-Type": "application/json",
    "X-API-Key": apiKey,
    "X-API-Secret": apiSecret,
  };
}

function getBrandingReturnUrl(actionId = "source-tag-proof") {
  const cleanActionId = encodeURIComponent(actionId);
  const target =
    `${OTT_PUBLIC_APP_URL}/?ott_xaman_return=1` +
    `&payload={id}` +
    `&action=${cleanActionId}` +
    `&sourceTag=${MAKE_WAVES_SOURCE_TAG}`;

  return {
    app: target,
    web: target,
  };
}

function readObject(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

function addOttBrandingToPayload(body: Record<string, unknown>) {
  const options = readObject(body.options);
  const customMeta = readObject(body.custom_meta);
  const blob = readObject(customMeta.blob);

  const instruction =
    typeof customMeta.instruction === "string" && customMeta.instruction
      ? customMeta.instruction
      : `${OTT_BRAND_NAME} signing request`;

  const actionId =
    typeof blob.actionId === "string"
      ? blob.actionId
      : typeof customMeta.identifier === "string"
        ? customMeta.identifier.replace(/^ott-/, "")
        : "source-tag-proof";

  return {
    ...body,
    options: {
      ...options,
      return_url: getBrandingReturnUrl(actionId),
    },
    custom_meta: {
      ...customMeta,
      identifier:
        typeof customMeta.identifier === "string" && customMeta.identifier
          ? customMeta.identifier
          : "ott-terminal",
      instruction: instruction.includes("OnTheTrack")
        ? instruction
        : `OnTheTrack — ${instruction}`,
      blob: {
        ...blob,
        brand: OTT_BRAND_NAME,
        logoUrl: OTT_LOGO_URL,
        sourceTag: MAKE_WAVES_SOURCE_TAG,
        walletIdentities: OTT_WALLET_IDENTITIES,
      },
    },
  };
}

async function createXamanPayload(body: Record<string, unknown>) {
  const brandedBody = addOttBrandingToPayload(body);

  const response = await fetch(XAMAN_API_URL, {
    method: "POST",
    headers: getXamanHeaders(),
    body: JSON.stringify(brandedBody),
  });

  const payload = await response.json();

  if (!response.ok) {
    return {
      status: 502,
      body: {
        ok: false,
        error: "Xaman payload creation failed.",
        details: payload,
      },
    };
  }

  return {
    status: 200,
    body: payload,
  };
}

async function getXamanPayload(uuid: string) {
  const response = await fetch(`${XAMAN_API_URL}/${uuid}`, {
    method: "GET",
    headers: getXamanHeaders(),
  });

  const payload = await response.json();

  if (!response.ok) {
    return {
      status: 502,
      body: {
        ok: false,
        error: "Xaman payload lookup failed.",
        details: payload,
      },
    };
  }

  return {
    status: 200,
    body: payload,
  };
}

async function fetchXrplTransaction(txHash: string) {
  const xrplResponse = await fetch(XRPL_RPC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      method: "tx",
      params: [
        {
          transaction: txHash,
          binary: false,
        },
      ],
    }),
  });

  const data = (await xrplResponse.json()) as XrplRpcResponse;

  if (!xrplResponse.ok || data.error || data.result?.error) {
    return {
      status: 502,
      body: {
        ok: false,
        error: "XRPL transaction lookup failed.",
        details: data,
      },
    };
  }

  if (!data.result) {
    return {
      status: 404,
      body: {
        ok: false,
        error: "Transaction not found.",
      },
    };
  }

  return {
    status: 200,
    body: data,
  };
}

function makePaymentTx({
  account,
  destination,
  amountDrops,
  memoType,
  memoData,
}: {
  account?: string;
  destination: string;
  amountDrops: string;
  memoType: string;
  memoData: string;
}) {
  const txjson: Record<string, unknown> = {
    TransactionType: "Payment",
    Destination: destination,
    Amount: amountDrops,
    SourceTag: MAKE_WAVES_SOURCE_TAG,
    Memos: [
      {
        Memo: {
          MemoType: textToHex(memoType),
          MemoData: textToHex(memoData),
        },
      },
    ],
  };

  if (account) {
    txjson.Account = account;
  }

  return txjson;
}

async function handleCreateMakeWavesPayload(body: RequestBody) {
  const actionId = (getString(body, "actionId") || "daily-checkin") as MakeWavesActionId;
  const walletAddress = getString(body, "walletAddress");
  const destinationWallet =
    getString(body, "destinationWallet") ||
    process.env.OTT_PROOF_DESTINATION_WALLET?.trim() ||
    process.env.OTT_TRUTH_DESK_WALLET?.trim() ||
    "";
  const amountDrops = cleanAmountDrops(getString(body, "amountDrops"), "1");
  const voteId = getString(body, "voteId");
  const allowedVoteIds = ["academy-path", "wallet-insights", "community-tools"];

  if (walletAddress && !isValidXrplAddress(walletAddress)) {
    return { status: 400, body: { ok: false, error: "Invalid walletAddress." } };
  }

  if (!destinationWallet || !isValidXrplAddress(destinationWallet)) {
    return {
      status: 400,
      body: {
        ok: false,
        error:
          "Missing destination wallet. Add OTT_PROOF_DESTINATION_WALLET in Vercel or send destinationWallet.",
      },
    };
  }

  if (actionId === "roadmap-vote" && !allowedVoteIds.includes(voteId)) {
    return { status: 400, body: { ok: false, error: "Invalid roadmap vote option." } };
  }

  const action = getMakeWavesAction(actionId);
  const memoText = actionId === "roadmap-vote"
    ? `${getMakeWavesMemo(actionId)} | Cycle 1 | ${voteId}`
    : getMakeWavesMemo(actionId);
  const txjson = makePaymentTx({
    account: walletAddress || undefined,
    destination: destinationWallet,
    amountDrops,
    memoType: "OTT_MAKE_WAVES",
    memoData: memoText,
  });

  const result = await createXamanPayload({
    txjson,
    options: {
      submit: true,
      return_url: {
        app: "https://xumm.app",
        web: "https://xumm.app",
      },
    },
    custom_meta: {
      identifier: `ott-${actionId}`,
      instruction: `${action.title} with SourceTag ${MAKE_WAVES_SOURCE_TAG}`,
      blob: {
        sourceTag: MAKE_WAVES_SOURCE_TAG,
        actionId,
        xp: action.xp,
        memoText,
        voteId: actionId === "roadmap-vote" ? voteId : null,
      },
    },
  });

  if (result.status !== 200) {
    return result;
  }

  return {
    status: 200,
    body: {
      ok: true,
      mode: "make-waves-payload",
      sourceTag: MAKE_WAVES_SOURCE_TAG,
      action: {
        id: action.id,
        title: action.title,
        xp: action.xp,
      },
      payload: result.body,
      transactionMeta: {
        transactionType: "Payment",
        sourceTag: MAKE_WAVES_SOURCE_TAG,
        memoText,
      },
    },
  };
}

async function handleVerifyMakeWavesPayload(body: RequestBody) {
  const uuid = getString(body, "uuid");
  const actionId = (getString(body, "actionId") || "daily-checkin") as MakeWavesActionId;

  if (!uuid) {
    return { status: 400, body: { ok: false, error: "Missing uuid." } };
  }

  const result = await getXamanPayload(uuid);

  if (result.status !== 200) {
    return result;
  }

  const payload = result.body as {
    meta?: { signed?: boolean; resolved?: boolean };
    response?: { account?: string; txid?: string };
  };
  const action = getMakeWavesAction(actionId);
  const signed = Boolean(payload.meta?.signed);
  const account = payload.response?.account ?? null;
  const txid = payload.response?.txid ?? null;
  let ledgerValidated = false;
  let transactionResult = "not-checked";
  let sourceTag: number | null = null;
  let sourceTagMatches = false;
  let accountMatches = false;
  let actionMemoMatches = false;
  let isPayment = false;
  let ledgerIndex: number | null = null;

  if (signed && txid && isValidTxHash(txid)) {
    const ledgerResult = await fetchXrplTransaction(txid);

    if (ledgerResult.status === 200) {
      const data = ledgerResult.body as XrplRpcResponse;
      const txResult = data.result as XrplTxResult;
      const txJson = readTxJson(txResult);
      const meta = readMeta(txResult);
      const memoData = extractMemoText(txJson.Memos).map((memo) => memo.data);

      ledgerValidated = Boolean(txResult.validated);
      transactionResult = meta.TransactionResult ?? "unknown";
      sourceTag = txJson.SourceTag ?? null;
      sourceTagMatches = isMakeWavesSourceTag(sourceTag);
      accountMatches = Boolean(account && txJson.Account === account);
      actionMemoMatches = memoContainsExpected(action.memo, memoData);
      isPayment = txJson.TransactionType === "Payment";
      ledgerIndex = txResult.ledger_index ?? null;
    } else {
      transactionResult = "pending-or-not-found";
    }
  }

  const makeWavesVerified = Boolean(
    signed &&
      ledgerValidated &&
      transactionResult === "tesSUCCESS" &&
      sourceTagMatches &&
      accountMatches &&
      actionMemoMatches &&
      isPayment,
  );

  return {
    status: 200,
    body: {
      ok: true,
      sourceTag: MAKE_WAVES_SOURCE_TAG,
      verified: {
        signed,
        resolved: Boolean(payload.meta?.resolved),
        account,
        txid,
        sourceTag,
        actionId,
        xp: makeWavesVerified ? action.xp : 0,
        makeWavesVerified,
        ledgerValidated,
        transactionResult,
        sourceTagMatches,
        accountMatches,
        actionMemoMatches,
        isPayment,
        ledgerIndex,
      },
      payload,
    },
  };
}

async function handleCreateTrustlinePayload(body: RequestBody) {
  const userWallet = getString(body, "userWallet");
  const issuerWallet = getString(body, "issuerWallet");
  const currencyCode = cleanCurrencyCode(getString(body, "currencyCode") || "OTT");
  const limitAmount = cleanTokenAmount(getString(body, "limitAmount") || "1000000");
  const memoText = getMakeWavesMemo("ott-token-eligibility");

  if (userWallet && !isValidXrplAddress(userWallet)) {
    return { status: 400, body: { ok: false, error: "Invalid userWallet." } };
  }

  if (!issuerWallet || !isValidXrplAddress(issuerWallet)) {
    return { status: 400, body: { ok: false, error: "Missing or invalid issuerWallet." } };
  }

  const txjson: Record<string, unknown> = {
    TransactionType: "TrustSet",
    LimitAmount: {
      currency: currencyCode,
      issuer: issuerWallet,
      value: limitAmount,
    },
    SourceTag: MAKE_WAVES_SOURCE_TAG,
    Memos: [
      {
        Memo: {
          MemoType: textToHex("OTT_TESTNET_TRUSTLINE"),
          MemoData: textToHex(memoText),
        },
      },
    ],
  };

  if (userWallet) {
    txjson.Account = userWallet;
  }

  const result = await createXamanPayload({
    txjson,
    options: {
      submit: true,
      return_url: {
        app: "https://xumm.app",
        web: "https://xumm.app",
      },
    },
    custom_meta: {
      identifier: "ott-testnet-trustline",
      instruction: `Set ${currencyCode} trustline with SourceTag ${MAKE_WAVES_SOURCE_TAG}`,
      blob: {
        sourceTag: MAKE_WAVES_SOURCE_TAG,
        mode: "testnet-trustline",
        currencyCode,
        issuerWallet,
        limitAmount,
      },
    },
  });

  if (result.status !== 200) {
    return result;
  }

  return {
    status: 200,
    body: {
      ok: true,
      mode: "testnet-trustline",
      sourceTag: MAKE_WAVES_SOURCE_TAG,
      token: {
        currencyCode,
        issuerWallet,
        limitAmount,
      },
      payload: result.body,
      transactionMeta: {
        transactionType: "TrustSet",
        sourceTag: MAKE_WAVES_SOURCE_TAG,
        memoText,
      },
    },
  };
}

async function handleCreateTokenPaymentPayload(body: RequestBody) {
  const senderWallet = getString(body, "senderWallet");
  const destinationWallet = getString(body, "destinationWallet");
  const issuerWallet = getString(body, "issuerWallet");
  const currencyCode = cleanCurrencyCode(getString(body, "currencyCode") || "OTT");
  const tokenAmount = cleanTokenAmount(getString(body, "tokenAmount") || "1");
  const memoText = getMakeWavesMemo("ott-token-eligibility");

  if (senderWallet && !isValidXrplAddress(senderWallet)) {
    return { status: 400, body: { ok: false, error: "Invalid senderWallet." } };
  }

  if (!destinationWallet || !isValidXrplAddress(destinationWallet)) {
    return { status: 400, body: { ok: false, error: "Missing or invalid destinationWallet." } };
  }

  if (!issuerWallet || !isValidXrplAddress(issuerWallet)) {
    return { status: 400, body: { ok: false, error: "Missing or invalid issuerWallet." } };
  }

  const txjson: Record<string, unknown> = {
    TransactionType: "Payment",
    Destination: destinationWallet,
    SourceTag: MAKE_WAVES_SOURCE_TAG,
    Amount: {
      currency: currencyCode,
      issuer: issuerWallet,
      value: tokenAmount,
    },
    Memos: [
      {
        Memo: {
          MemoType: textToHex("OTT_TESTNET_REWARD"),
          MemoData: textToHex(memoText),
        },
      },
    ],
  };

  if (senderWallet) {
    txjson.Account = senderWallet;
  }

  const result = await createXamanPayload({
    txjson,
    options: {
      submit: true,
      return_url: {
        app: "https://xumm.app",
        web: "https://xumm.app",
      },
    },
    custom_meta: {
      identifier: "ott-testnet-token-payment",
      instruction: `Send ${tokenAmount} ${currencyCode} with SourceTag ${MAKE_WAVES_SOURCE_TAG}`,
      blob: {
        sourceTag: MAKE_WAVES_SOURCE_TAG,
        mode: "testnet-token-payment",
        currencyCode,
        issuerWallet,
        destinationWallet,
        tokenAmount,
      },
    },
  });

  if (result.status !== 200) {
    return result;
  }

  return {
    status: 200,
    body: {
      ok: true,
      mode: "testnet-token-payment",
      sourceTag: MAKE_WAVES_SOURCE_TAG,
      token: {
        currencyCode,
        issuerWallet,
        destinationWallet,
        tokenAmount,
      },
      payload: result.body,
      transactionMeta: {
        transactionType: "Payment",
        sourceTag: MAKE_WAVES_SOURCE_TAG,
        memoText,
      },
    },
  };
}

async function handleCreateProofStampPayload(body: RequestBody) {
  const walletAddress = getString(body, "walletAddress");
  const destinationWallet =
    getString(body, "destinationWallet") ||
    process.env.OTT_PROOF_DESTINATION_WALLET?.trim() ||
    "";
  const partnerId = getString(body, "partnerId") || "anodos";
  const routeName = (getString(body, "routeName") || "OTT Partner Route").slice(0, 80);
  const amountDrops = cleanAmountDrops(getString(body, "amountDrops"), "1");

  if (walletAddress && !isValidXrplAddress(walletAddress)) {
    return { status: 400, body: { ok: false, error: "Invalid walletAddress." } };
  }

  if (!destinationWallet || !isValidXrplAddress(destinationWallet)) {
    return {
      status: 400,
      body: {
        ok: false,
        error:
          "Missing or invalid destinationWallet. Add OTT_PROOF_DESTINATION_WALLET in Vercel or send destinationWallet.",
      },
    };
  }

  const memoText = getPartnerProofStampMemo(partnerId);
  const visibleMemo = `${memoText} | ${routeName} | SourceTag ${MAKE_WAVES_SOURCE_TAG}`;
  const txjson = makePaymentTx({
    account: walletAddress || undefined,
    destination: destinationWallet,
    amountDrops,
    memoType: "OTT_PROOF_STAMP",
    memoData: visibleMemo,
  });

  const result = await createXamanPayload({
    txjson,
    options: {
      submit: true,
      return_url: {
        app: "https://xumm.app",
        web: "https://xumm.app",
      },
    },
    custom_meta: {
      identifier: `ott-proof-stamp-${partnerId}`,
      instruction: `Stamp ${routeName} completion on XRPL with SourceTag ${MAKE_WAVES_SOURCE_TAG}`,
      blob: {
        sourceTag: MAKE_WAVES_SOURCE_TAG,
        mode: "partner-proof-stamp",
        partnerId,
        routeName,
        destinationWallet,
        amountDrops,
        memoText: visibleMemo,
      },
    },
  });

  if (result.status !== 200) {
    return result;
  }

  return {
    status: 200,
    body: {
      ok: true,
      mode: "partner-proof-stamp",
      sourceTag: MAKE_WAVES_SOURCE_TAG,
      route: {
        partnerId,
        routeName,
      },
      payment: {
        destinationWallet,
        amountDrops,
      },
      payload: result.body,
      transactionMeta: {
        transactionType: "Payment",
        sourceTag: MAKE_WAVES_SOURCE_TAG,
        memoText: visibleMemo,
      },
    },
  };
}


async function handleCreateAccessPaymentPayload(body: RequestBody) {
  const walletAddress = getString(body, "walletAddress");
  const destinationWallet =
    getString(body, "destinationWallet") ||
    process.env.OTT_ACCESS_WALLET?.trim() ||
    process.env.OTT_PROOF_DESTINATION_WALLET?.trim() ||
    "";
  const routeId = getString(body, "routeId") || "xrp-payment";
  const routeTitle = (getString(body, "routeTitle") || "OTT Access").slice(0, 80);
  const proofMemo = (getString(body, "proofMemo") || "OTT_ACCESS_PAYMENT").slice(0, 120);
  const amountDrops = cleanAmountDrops(getString(body, "amountDrops"), ONE_XRP_DROPS);

  if (walletAddress && !isValidXrplAddress(walletAddress)) {
    return { status: 400, body: { ok: false, error: "Invalid walletAddress." } };
  }

  if (!destinationWallet || !isValidXrplAddress(destinationWallet)) {
    return {
      status: 400,
      body: {
        ok: false,
        error:
          "Missing or invalid destinationWallet. Add OTT_ACCESS_WALLET in Vercel or send destinationWallet.",
      },
    };
  }

  if (
    routeId !== "xrp-payment" &&
    routeId !== "ott-access-pass" &&
    routeId !== "rlusd-payment"
  ) {
    return {
      status: 400,
      body: {
        ok: false,
        error: "Access payload only supports xrp-payment, rlusd-payment and ott-access-pass.",
      },
    };
  }

  if (routeId === "rlusd-payment") {
    return {
      status: 400,
      body: {
        ok: false,
        error:
          "RLUSD access route is prepared, but issued-currency access payment is not enabled in this demo router yet.",
      },
    };
  }

  const memoText = `${proofMemo} | ${routeTitle} | SourceTag ${MAKE_WAVES_SOURCE_TAG}`;
  const txjson = makePaymentTx({
    account: walletAddress || undefined,
    destination: destinationWallet,
    amountDrops,
    memoType: "OTT_ACCESS",
    memoData: memoText,
  });

  const result = await createXamanPayload({
    txjson,
    options: {
      submit: true,
      return_url: {
        app: "https://xumm.app",
        web: "https://xumm.app",
      },
    },
    custom_meta: {
      identifier: `ott-access-${routeId}`,
      instruction: `${routeTitle} access payment with SourceTag ${MAKE_WAVES_SOURCE_TAG}`,
      blob: {
        sourceTag: MAKE_WAVES_SOURCE_TAG,
        mode: "terminal-access-payment",
        routeId,
        routeTitle,
        destinationWallet,
        amountDrops,
        memoText,
      },
    },
  });

  if (result.status !== 200) {
    return result;
  }

  return {
    status: 200,
    body: {
      ok: true,
      mode: "terminal-access-payment",
      sourceTag: MAKE_WAVES_SOURCE_TAG,
      access: {
        routeId,
        routeTitle,
      },
      payment: {
        destinationWallet,
        amountDrops,
      },
      payload: result.body,
      transactionMeta: {
        transactionType: "Payment",
        sourceTag: MAKE_WAVES_SOURCE_TAG,
        memoText,
      },
    },
  };
}

async function handleCreateTruthDeskPayload(body: RequestBody) {
  const walletAddress = getString(body, "walletAddress");
  const destinationWallet =
    getString(body, "destinationWallet") ||
    process.env.OTT_TRUTH_DESK_WALLET?.trim() ||
    "";
  const serviceType = getString(body, "serviceType") || "ask-truth";
  const question = getString(body, "question").slice(0, 200);
  const meetingGoal = getString(body, "meetingGoal").slice(0, 500);
  const durationMinutes = getNumber(body, "durationMinutes");
  const amountDrops = cleanAmountDrops(getString(body, "amountDrops"), ONE_XRP_DROPS);

  if (walletAddress && !isValidXrplAddress(walletAddress)) {
    return { status: 400, body: { ok: false, error: "Invalid walletAddress." } };
  }

  if (!destinationWallet || !isValidXrplAddress(destinationWallet)) {
    return {
      status: 400,
      body: {
        ok: false,
        error:
          "Missing or invalid destinationWallet. Add OTT_TRUTH_DESK_WALLET in Vercel or send destinationWallet.",
      },
    };
  }

  if (serviceType !== "ask-truth" && serviceType !== "one-on-one") {
    return { status: 400, body: { ok: false, error: "Invalid serviceType." } };
  }

  if (serviceType === "ask-truth" && !question) {
    return { status: 400, body: { ok: false, error: "Question is required for Ask Truth." } };
  }

  if (
    serviceType === "one-on-one" &&
    durationMinutes !== 15 &&
    durationMinutes !== 30 &&
    durationMinutes !== 45 &&
    durationMinutes !== 60
  ) {
    return { status: 400, body: { ok: false, error: "durationMinutes must be 15, 30, 45 or 60." } };
  }

  if (serviceType === "one-on-one" && !meetingGoal) {
    return { status: 400, body: { ok: false, error: "meetingGoal is required for 1-on-1." } };
  }

  const serviceLabel = serviceType === "ask-truth" ? "Ask Truth" : "Truth 1-on-1";
  const memoSubject =
    serviceType === "ask-truth"
      ? question
      : `${durationMinutes} min | ${meetingGoal}`;
  const memoText = `OTT_TRUTH_DESK | ${serviceLabel} | ${memoSubject} | SourceTag ${MAKE_WAVES_SOURCE_TAG}`;
  const txjson = makePaymentTx({
    account: walletAddress || undefined,
    destination: destinationWallet,
    amountDrops,
    memoType: "OTT_TRUTH_DESK",
    memoData: memoText,
  });

  const result = await createXamanPayload({
    txjson,
    options: {
      submit: true,
      return_url: {
        app: "https://xumm.app",
        web: "https://xumm.app",
      },
    },
    custom_meta: {
      identifier: `ott-truth-desk-${serviceType}`,
      instruction: `${serviceLabel} payment with SourceTag ${MAKE_WAVES_SOURCE_TAG}`,
      blob: {
        sourceTag: MAKE_WAVES_SOURCE_TAG,
        mode: "truth-desk-service-payment",
        serviceType,
        serviceLabel,
        question,
        meetingGoal,
        durationMinutes,
        destinationWallet,
        amountDrops,
        memoText,
      },
    },
  });

  if (result.status !== 200) {
    return result;
  }

  return {
    status: 200,
    body: {
      ok: true,
      mode: "truth-desk-service-payment",
      sourceTag: MAKE_WAVES_SOURCE_TAG,
      service: {
        serviceType,
        serviceLabel,
        question,
        meetingGoal,
        durationMinutes: serviceType === "one-on-one" ? durationMinutes : null,
      },
      payment: {
        destinationWallet,
        amountDrops,
      },
      payload: result.body,
      transactionMeta: {
        transactionType: "Payment",
        sourceTag: MAKE_WAVES_SOURCE_TAG,
        memoText,
      },
    },
  };
}

async function handleVerifyTransaction(body: RequestBody) {
  const txHash = getString(body, "txHash");
  const expectedWallet = getString(body, "expectedWallet");

  if (!txHash || !isValidTxHash(txHash)) {
    return { status: 400, body: { ok: false, error: "Missing or invalid txHash." } };
  }

  const result = await fetchXrplTransaction(txHash);

  if (result.status !== 200) {
    return result;
  }

  const data = result.body as XrplRpcResponse;
  const txResult = data.result as XrplTxResult;
  const txJson = readTxJson(txResult);
  const meta = readMeta(txResult);
  const sourceTag = txJson.SourceTag ?? null;
  const sourceTagMatches = isMakeWavesSourceTag(sourceTag);
  const validated = Boolean(txResult.validated);
  const transactionResult = meta.TransactionResult ?? "unknown";
  const success = transactionResult === "tesSUCCESS";
  const walletMatches = matchesOptional(expectedWallet, txJson.Account ?? null);
  const makeWavesVerified = Boolean(
    validated && success && sourceTagMatches && walletMatches
  );

  return {
    status: 200,
    body: {
      ok: true,
      makeWavesSourceTag: MAKE_WAVES_SOURCE_TAG,
      txHash,
      verified: {
        makeWavesVerified,
        validated,
        success,
        transactionResult,
        sourceTag,
        sourceTagMatches,
        account: txJson.Account ?? null,
        destination: txJson.Destination ?? null,
        transactionType: txJson.TransactionType ?? null,
        walletMatches,
        ledgerIndex: txResult.ledger_index ?? null,
      },
      xrpl: data.result,
    },
  };
}

async function handleVerifyTokenPayment(body: RequestBody) {
  const txHash = getString(body, "txHash");
  const expectedDestination = getString(body, "expectedDestination");
  const expectedIssuer = getString(body, "expectedIssuer");
  const expectedCurrency = getString(body, "expectedCurrency");
  const expectedAmount = getString(body, "expectedAmount");

  if (!txHash || !isValidTxHash(txHash)) {
    return { status: 400, body: { ok: false, error: "Missing or invalid txHash." } };
  }

  const result = await fetchXrplTransaction(txHash);

  if (result.status !== 200) {
    return result;
  }

  const data = result.body as XrplRpcResponse;
  const txResult = data.result as XrplTxResult;
  const txJson = readTxJson(txResult);
  const meta = readMeta(txResult);
  const issuedAmount = isIssuedCurrencyAmount(txJson.Amount) ? txJson.Amount : null;
  const sourceTag = txJson.SourceTag ?? null;
  const sourceTagMatches = isMakeWavesSourceTag(sourceTag);
  const validated = Boolean(txResult.validated);
  const transactionResult = meta.TransactionResult ?? "unknown";
  const success = transactionResult === "tesSUCCESS";
  const isPayment = txJson.TransactionType === "Payment";
  const isTokenPayment = Boolean(isPayment && issuedAmount);
  const tokenCurrency = normalizeCurrency(issuedAmount?.currency);
  const tokenIssuer = issuedAmount?.issuer ?? null;
  const tokenAmount = issuedAmount?.value ?? null;
  const currencyMatches = !expectedCurrency || normalizeCurrency(expectedCurrency) === tokenCurrency;
  const issuerMatches = matchesOptional(expectedIssuer, tokenIssuer);
  const destinationMatches = matchesOptional(expectedDestination, txJson.Destination ?? null);
  const amountMatches = matchesOptional(expectedAmount, tokenAmount);
  const tokenPaymentMatches = Boolean(
    isTokenPayment &&
      currencyMatches &&
      issuerMatches &&
      destinationMatches &&
      amountMatches
  );
  const makeWavesTokenVerified = Boolean(
    validated && success && sourceTagMatches && tokenPaymentMatches
  );

  return {
    status: 200,
    body: {
      ok: true,
      makeWavesSourceTag: MAKE_WAVES_SOURCE_TAG,
      txHash,
      verified: {
        makeWavesTokenVerified,
        validated,
        success,
        transactionResult,
        sourceTag,
        sourceTagMatches,
        account: txJson.Account ?? null,
        destination: txJson.Destination ?? null,
        transactionType: txJson.TransactionType ?? null,
        isPayment,
        isTokenPayment,
        token: {
          currency: tokenCurrency || null,
          issuer: tokenIssuer,
          amount: tokenAmount,
        },
        checks: {
          currencyMatches,
          issuerMatches,
          destinationMatches,
          amountMatches,
          tokenPaymentMatches,
        },
        ledgerIndex: txResult.ledger_index ?? null,
      },
      xrpl: data.result,
    },
  };
}

async function handleVerifyMemoPayment(body: RequestBody, mode: "proof" | "truth" | "access") {
  const txHash = getString(body, "txHash");
  const expectedWallet = getString(body, "expectedWallet");
  const expectedDestination = getString(body, "expectedDestination");
  const expectedAmountDrops = getString(body, "expectedAmountDrops");
  const expectedMemoContains = getString(body, "expectedMemoContains");

  if (!txHash || !isValidTxHash(txHash)) {
    return { status: 400, body: { ok: false, error: "Missing or invalid txHash." } };
  }

  const result = await fetchXrplTransaction(txHash);

  if (result.status !== 200) {
    return result;
  }

  const data = result.body as XrplRpcResponse;
  const txResult = data.result as XrplTxResult;
  const txJson = readTxJson(txResult);
  const meta = readMeta(txResult);
  const memoText = extractMemoText(txJson.Memos);
  const memoData = memoText.map((memo) => memo.data).filter(Boolean);
  const sourceTag = txJson.SourceTag ?? null;
  const sourceTagMatches = isMakeWavesSourceTag(sourceTag);
  const validated = Boolean(txResult.validated);
  const transactionResult = meta.TransactionResult ?? "unknown";
  const success = transactionResult === "tesSUCCESS";
  const isPayment = txJson.TransactionType === "Payment";
  const amountDrops = typeof txJson.Amount === "string" ? txJson.Amount : null;
  const walletMatches = matchesOptional(expectedWallet, txJson.Account ?? null);
  const destinationMatches = matchesOptional(expectedDestination, txJson.Destination ?? null);
  const amountMatches = matchesOptional(expectedAmountDrops, amountDrops);
  const memoMatches = memoContainsExpected(expectedMemoContains, memoData);
  const expectedTag =
    mode === "proof"
      ? "OTT_PROOF"
      : mode === "truth"
        ? "OTT_TRUTH_DESK"
        : "OTT_ACCESS";
  const hasExpectedMemo =
    memoData.some((memo) => memo.includes(expectedTag)) ||
    memoText.some((memo) => memo.type.includes(expectedTag));
  const verified = Boolean(
    validated &&
      success &&
      isPayment &&
      sourceTagMatches &&
      walletMatches &&
      destinationMatches &&
      amountMatches &&
      memoMatches &&
      hasExpectedMemo
  );

  if (mode === "proof") {
    return {
      status: 200,
      body: {
        ok: true,
        makeWavesSourceTag: MAKE_WAVES_SOURCE_TAG,
        txHash,
        verified: {
          proofStampVerified: verified,
          validated,
          success,
          transactionResult,
          sourceTag,
          sourceTagMatches,
          account: txJson.Account ?? null,
          destination: txJson.Destination ?? null,
          transactionType: txJson.TransactionType ?? null,
          isPayment,
          amountDrops,
          walletMatches,
          destinationMatches,
          amountMatches,
          memoMatches,
          hasProofMemo: hasExpectedMemo,
          memoText,
          ledgerIndex: txResult.ledger_index ?? null,
        },
        xrpl: data.result,
      },
    };
  }

  if (mode === "access") {
    return {
      status: 200,
      body: {
        ok: true,
        makeWavesSourceTag: MAKE_WAVES_SOURCE_TAG,
        txHash,
        verified: {
          accessPaymentVerified: verified,
          validated,
          success,
          transactionResult,
          sourceTag,
          sourceTagMatches,
          account: txJson.Account ?? null,
          destination: txJson.Destination ?? null,
          transactionType: txJson.TransactionType ?? null,
          isPayment,
          amountDrops,
          walletMatches,
          destinationMatches,
          amountMatches,
          memoMatches,
          hasAccessMemo: hasExpectedMemo,
          memoText,
          ledgerIndex: txResult.ledger_index ?? null,
        },
        xrpl: data.result,
      },
    };
  }

  return {
    status: 200,
    body: {
      ok: true,
      makeWavesSourceTag: MAKE_WAVES_SOURCE_TAG,
      txHash,
      verified: {
        truthDeskPaymentVerified: verified,
        validated,
        success,
        transactionResult,
        sourceTag,
        sourceTagMatches,
        account: txJson.Account ?? null,
        destination: txJson.Destination ?? null,
        transactionType: txJson.TransactionType ?? null,
        isPayment,
        amountDrops,
        walletMatches,
        destinationMatches,
        amountMatches,
        memoMatches,
        hasTruthDeskMemo: hasExpectedMemo,
        memoText,
        ledgerIndex: txResult.ledger_index ?? null,
      },
      xrpl: data.result,
    },
  };
}


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

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed. Use POST.",
    });
  }

  try {
    const body = req.body ?? {};
    const action = body.action;

    let result:
      | {
          status: number;
          body: unknown;
        }
      | undefined;

    if (action === "xaman.createMakeWavesPayload") {
      result = await handleCreateMakeWavesPayload(body);
    }

    if (action === "xaman.verifyMakeWavesPayload") {
      result = await handleVerifyMakeWavesPayload(body);
    }

    if (action === "xaman.createTrustlinePayload") {
      result = await handleCreateTrustlinePayload(body);
    }

    if (action === "xaman.createTokenPaymentPayload") {
      result = await handleCreateTokenPaymentPayload(body);
    }

    if (action === "xaman.createProofStampPayload") {
      result = await handleCreateProofStampPayload(body);
    }

    if (action === "xaman.createAccessPaymentPayload") {
      result = await handleCreateAccessPaymentPayload(body);
    }

    if (action === "xaman.createTruthDeskPayload") {
      result = await handleCreateTruthDeskPayload(body);
    }

    if (action === "xrpl.auditIssuer") {
      result = await handleAuditIssuer(body);
    }

    if (action === "xrpl.verifyTransaction") {
      result = await handleVerifyTransaction(body);
    }

    if (action === "xrpl.verifyTokenPayment") {
      result = await handleVerifyTokenPayment(body);
    }

    if (action === "xrpl.verifyProofStamp") {
      result = await handleVerifyMemoPayment(body, "proof");
    }

    if (action === "xrpl.verifyAccessPayment") {
      result = await handleVerifyMemoPayment(body, "access");
    }

    if (action === "xrpl.verifyTruthDeskPayment") {
      result = await handleVerifyMemoPayment(body, "truth");
    }

    if (!result) {
      return res.status(400).json({
        ok: false,
        error: "Unknown API action.",
      });
    }

    return res.status(result.status).json(result.body);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown API router error.",
    });
  }
}
