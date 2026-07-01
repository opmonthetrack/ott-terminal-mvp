import {
  MAKE_WAVES_SOURCE_TAG,
  getMakeWavesAction,
  getMakeWavesMemo,
  isMakeWavesSourceTag,
  type MakeWavesActionId,
} from "../src/lib/makeWaves";
import { getPartnerProofStampMemo } from "../src/lib/partnerCatalog";

const XAMAN_API_URL = "https://xumm.app/api/v1/platform/payload";
const XRPL_RPC_URL =
  process.env.XRPL_RPC_URL || "https://s1.ripple.com:51234/";
const ONE_XRP_DROPS = "1000000";

const OTT_PUBLIC_APP_URL =
  process.env.OTT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL?.replace(/\/$/, "") ||
  "https://ott-terminal.vercel.app";

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

function getBrandingReturnUrl() {
  const target = `${OTT_PUBLIC_APP_URL}/?xaman_return=1`;

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

  return {
    ...body,
    options: {
      ...options,
      return_url: getBrandingReturnUrl(),
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

  const action = getMakeWavesAction(actionId);
  const memoText = getMakeWavesMemo(actionId);
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
        sourceTag: MAKE_WAVES_SOURCE_TAG,
        actionId,
        xp: signed ? action.xp : 0,
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

  const memoText = getPartnerProofStampMemo(partnerId as never);
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
