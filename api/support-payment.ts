// api/support-payment.ts is a standalone Vercel serverless route for voluntary OTT support payments.
// It creates Xaman payloads and reads public XRPL transactions for the live support counter.

const MAKE_WAVES_SOURCE_TAG = 2606170002;
const XAMAN_API_URL = "https://xumm.app/api/v1/platform/payload";
const XRPL_RPC_URL = process.env.XRPL_RPC_URL || "https://s1.ripple.com:51234/";
const RIPPLE_EPOCH_OFFSET_SECONDS = 946684800;
const MAX_ACCOUNT_TX_PAGES = 5;
const ACCOUNT_TX_PAGE_SIZE = 200;

const SUPPORT_AMOUNTS: Record<string, string> = {
  "0.589": "589000",
  "1.00": "1000000",
  "1.589": "1589000",
  "2.00": "2000000",
  "2.589": "2589000",
  "3.00": "3000000",
  "3.589": "3589000",
  "4.00": "4000000",
  "4.589": "4589000",
  "5.00": "5000000",
  "5.89": "5890000",
};

const OTT_PUBLIC_APP_URL =
  normalizePublicUrl(process.env.OTT_PUBLIC_APP_URL) ||
  normalizePublicUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
  "https://ott-terminal-mvp.vercel.app";

const OTT_SUPPORT_WALLET =
  process.env.OTT_SUPPORT_WALLET?.trim() ||
  process.env.OTT_ACCESS_WALLET?.trim() ||
  process.env.VITE_OTT_ACCESS_WALLET?.trim() ||
  "rsEHpJiExneayjkrQdeQEveUwabmmPbksq";

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
  setHeader?: (name: string, value: string) => void;
};

type XrplMemo = {
  Memo?: {
    MemoType?: string;
    MemoData?: string;
    MemoFormat?: string;
  };
};

type XrplTransaction = {
  Account?: string;
  Destination?: string;
  Amount?: string | Record<string, unknown>;
  TransactionType?: string;
  SourceTag?: number;
  Memos?: XrplMemo[];
  date?: number;
  hash?: string;
};

type XrplTransactionMeta = {
  TransactionResult?: string;
};

type AccountTransactionEntry = {
  tx?: XrplTransaction;
  tx_json?: XrplTransaction;
  meta?: XrplTransactionMeta;
  validated?: boolean;
  hash?: string;
};

type XrplRpcResponse = {
  result?: {
    transactions?: AccountTransactionEntry[];
    marker?: unknown;
    error?: string;
    error_message?: string;
  };
  error?: string;
};

type PublicSupportMemo = {
  version: 1;
  public: true;
  name: string;
  message: string;
};

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

function textToHex(value: string) {
  return Array.from(new TextEncoder().encode(value))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

function hexToText(value: string | undefined) {
  if (!value) {
    return "";
  }

  const cleanValue = value.startsWith("0x") ? value.slice(2) : value;

  if (!/^[0-9A-Fa-f]+$/.test(cleanValue) || cleanValue.length % 2 !== 0) {
    return value;
  }

  try {
    const bytes = cleanValue.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16));
    return bytes ? new TextDecoder().decode(new Uint8Array(bytes)) : "";
  } catch {
    return "";
  }
}

function getString(body: RequestBody, key: string) {
  const value = body[key];
  return typeof value === "string" ? value.trim() : "";
}

function getBoolean(body: RequestBody, key: string) {
  return body[key] === true;
}

function cleanPublicText(value: string, maxLength: number) {
  return value
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function isValidXrplAddress(value: string) {
  return /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(value);
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

async function createXamanPayload(body: Record<string, unknown>) {
  const response = await fetch(XAMAN_API_URL, {
    method: "POST",
    headers: getXamanHeaders(),
    body: JSON.stringify(body),
  });

  const payload = await response.json();

  if (!response.ok) {
    return {
      status: 502,
      body: {
        ok: false,
        error: "Xaman support payment payload creation failed.",
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
        error: "Xaman support payment payload lookup failed.",
        details: payload,
      },
    };
  }

  return {
    status: 200,
    body: payload,
  };
}

async function xrplRpc(method: string, params: Record<string, unknown>) {
  const response = await fetch(XRPL_RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      method,
      params: [params],
    }),
  });

  const data = (await response.json()) as XrplRpcResponse;

  if (!response.ok || data.error || data.result?.error) {
    return {
      status: 502,
      body: {
        ok: false,
        error: "XRPL support counter lookup failed.",
        details: data,
      },
    };
  }

  return {
    status: 200,
    body: data,
  };
}

function getTransaction(entry: AccountTransactionEntry) {
  return entry.tx_json ?? entry.tx ?? {};
}

function getMemoText(transaction: XrplTransaction) {
  return (transaction.Memos ?? []).map((entry) => ({
    type: hexToText(entry.Memo?.MemoType),
    data: hexToText(entry.Memo?.MemoData),
  }));
}

function hasSupportPaymentMemo(transaction: XrplTransaction) {
  return getMemoText(transaction).some(
    (memo) =>
      memo.type === "OTT_SUPPORT_PAYMENT" ||
      memo.data.includes("OTT Terminal voluntary support"),
  );
}

function readPublicSupportMemo(transaction: XrplTransaction): PublicSupportMemo | null {
  const publicMemo = getMemoText(transaction).find(
    (memo) => memo.type === "OTT_SUPPORT_PUBLIC",
  );

  if (!publicMemo?.data) {
    return null;
  }

  try {
    const parsed = JSON.parse(publicMemo.data) as Partial<PublicSupportMemo>;

    if (parsed.version !== 1 || parsed.public !== true) {
      return null;
    }

    const name = cleanPublicText(typeof parsed.name === "string" ? parsed.name : "", 40);
    const message = cleanPublicText(
      typeof parsed.message === "string" ? parsed.message : "",
      160,
    );

    if (!name && !message) {
      return null;
    }

    return {
      version: 1,
      public: true,
      name,
      message,
    };
  } catch {
    return null;
  }
}

function dropsToXrp(drops: bigint) {
  const whole = drops / 1_000_000n;
  const fraction = (drops % 1_000_000n).toString().padStart(6, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole.toString();
}

function rippleDateToIso(date: number | undefined) {
  if (!Number.isFinite(date)) {
    return null;
  }

  return new Date(((date as number) + RIPPLE_EPOCH_OFFSET_SECONDS) * 1000).toISOString();
}

function shortAddress(value: string) {
  return value.length > 13 ? `${value.slice(0, 7)}...${value.slice(-5)}` : value;
}

async function handleCreateSupportPaymentPayload(body: RequestBody) {
  const amountXrp = getString(body, "amountXrp");
  const amountDrops = SUPPORT_AMOUNTS[amountXrp];
  const supporterName = cleanPublicText(getString(body, "supporterName"), 40);
  const publicMessage = cleanPublicText(getString(body, "publicMessage"), 160);
  const publicConsent = getBoolean(body, "publicConsent");
  const hasPublicContent = Boolean(supporterName || publicMessage);

  if (!amountDrops) {
    return {
      status: 400,
      body: {
        ok: false,
        error: "Unsupported support amount.",
        allowedAmounts: Object.keys(SUPPORT_AMOUNTS),
      },
    };
  }

  if (!isValidXrplAddress(OTT_SUPPORT_WALLET)) {
    return {
      status: 500,
      body: { ok: false, error: "Missing or invalid OTT support wallet." },
    };
  }

  if (hasPublicContent && !publicConsent) {
    return {
      status: 400,
      body: {
        ok: false,
        error:
          "Confirm that the name/message may be stored publicly on XRPL and shared by OTT, or clear the fields.",
      },
    };
  }

  const memoText = `OTT Terminal voluntary support | ${amountXrp} XRP | no investment, yield, access, NFT, token or governance rights | SourceTag ${MAKE_WAVES_SOURCE_TAG}`;
  const publicMemo: PublicSupportMemo | null =
    hasPublicContent && publicConsent
      ? {
          version: 1,
          public: true,
          name: supporterName,
          message: publicMessage,
        }
      : null;
  const returnUrl = `${OTT_PUBLIC_APP_URL}/?support_payment_return=1&payload={id}&amount=${encodeURIComponent(amountXrp)}`;

  const result = await createXamanPayload({
    txjson: {
      TransactionType: "Payment",
      Destination: OTT_SUPPORT_WALLET,
      Amount: amountDrops,
      SourceTag: MAKE_WAVES_SOURCE_TAG,
      Memos: [
        {
          Memo: {
            MemoType: textToHex("OTT_SUPPORT_PAYMENT"),
            MemoData: textToHex(memoText),
          },
        },
        ...(publicMemo
          ? [
              {
                Memo: {
                  MemoType: textToHex("OTT_SUPPORT_PUBLIC"),
                  MemoFormat: textToHex("application/json"),
                  MemoData: textToHex(JSON.stringify(publicMemo)),
                },
              },
            ]
          : []),
      ],
    },
    options: {
      submit: true,
      return_url: {
        app: returnUrl,
        web: returnUrl,
      },
    },
    custom_meta: {
      identifier: `ott-support-${amountXrp.replace(".", "-")}`,
      instruction: publicMemo
        ? `Voluntary support of ${amountXrp} XRP for OTT Terminal. Your optional public message is included in the XRPL transaction memo.`
        : `Voluntary support payment of ${amountXrp} XRP for OTT Terminal development, education and onboarding. No investment or access rights.`,
      blob: {
        mode: "ott-support-payment",
        amountXrp,
        amountDrops,
        destinationWallet: OTT_SUPPORT_WALLET,
        sourceTag: MAKE_WAVES_SOURCE_TAG,
        memoText,
        publicSupportMessage: publicMemo,
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
      mode: "ott-support-payment",
      sourceTag: MAKE_WAVES_SOURCE_TAG,
      support: {
        amountXrp,
        amountDrops,
        destinationWallet: OTT_SUPPORT_WALLET,
        hasPublicMessage: Boolean(publicMemo),
      },
      payload: result.body,
    },
  };
}

async function handleVerifySupportPaymentPayload(body: RequestBody) {
  const uuid = getString(body, "uuid");

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

  return {
    status: 200,
    body: {
      ok: true,
      mode: "ott-support-payment-verification",
      sourceTag: MAKE_WAVES_SOURCE_TAG,
      verified: {
        signed: Boolean(payload.meta?.signed),
        resolved: Boolean(payload.meta?.resolved),
        payerAccount: payload.response?.account ?? null,
        txid: payload.response?.txid ?? null,
      },
      payload,
    },
  };
}

async function handleGetSupportStats() {
  if (!isValidXrplAddress(OTT_SUPPORT_WALLET)) {
    return {
      status: 500,
      body: { ok: false, error: "Missing or invalid OTT support wallet." },
    };
  }

  const entries: AccountTransactionEntry[] = [];
  let marker: unknown = undefined;
  let truncated = false;

  for (let page = 0; page < MAX_ACCOUNT_TX_PAGES; page += 1) {
    const result = await xrplRpc("account_tx", {
      account: OTT_SUPPORT_WALLET,
      ledger_index_min: -1,
      ledger_index_max: -1,
      binary: false,
      forward: false,
      limit: ACCOUNT_TX_PAGE_SIZE,
      ...(marker ? { marker } : {}),
    });

    if (result.status !== 200) {
      return result;
    }

    const data = result.body as XrplRpcResponse;
    entries.push(...(data.result?.transactions ?? []));
    marker = data.result?.marker;

    if (!marker) {
      break;
    }

    if (page === MAX_ACCOUNT_TX_PAGES - 1) {
      truncated = true;
    }
  }

  let totalDrops = 0n;
  let paymentCount = 0;
  let publicMessageCount = 0;
  let latestPaymentAt: string | null = null;
  const supporterAccounts = new Set<string>();
  const latestPublicSupporters: Array<{
    name: string;
    account: string;
    amountXrp: string;
    date: string | null;
  }> = [];

  for (const entry of entries) {
    const transaction = getTransaction(entry);
    const meta = entry.meta ?? {};
    const amount = transaction.Amount;
    const isSupportPayment = Boolean(
      entry.validated !== false &&
        meta.TransactionResult === "tesSUCCESS" &&
        transaction.TransactionType === "Payment" &&
        transaction.Destination === OTT_SUPPORT_WALLET &&
        transaction.SourceTag === MAKE_WAVES_SOURCE_TAG &&
        typeof amount === "string" &&
        /^\d+$/.test(amount) &&
        hasSupportPaymentMemo(transaction),
    );

    if (!isSupportPayment || typeof amount !== "string") {
      continue;
    }

    const amountDrops = BigInt(amount);
    const paymentDate = rippleDateToIso(transaction.date);
    const publicMemo = readPublicSupportMemo(transaction);

    totalDrops += amountDrops;
    paymentCount += 1;

    if (transaction.Account) {
      supporterAccounts.add(transaction.Account);
    }

    if (!latestPaymentAt && paymentDate) {
      latestPaymentAt = paymentDate;
    }

    if (publicMemo) {
      publicMessageCount += 1;

      if (latestPublicSupporters.length < 8) {
        latestPublicSupporters.push({
          name: publicMemo.name || "Anonymous supporter",
          account: transaction.Account ? shortAddress(transaction.Account) : "Unknown wallet",
          amountXrp: dropsToXrp(amountDrops),
          date: paymentDate,
        });
      }
    }
  }

  return {
    status: 200,
    body: {
      ok: true,
      mode: "ott-support-stats",
      sourceTag: MAKE_WAVES_SOURCE_TAG,
      supportWallet: OTT_SUPPORT_WALLET,
      stats: {
        totalXrp: dropsToXrp(totalDrops),
        totalDrops: totalDrops.toString(),
        paymentCount,
        uniqueSupporters: supporterAccounts.size,
        publicMessageCount,
        latestPaymentAt,
        scannedTransactions: entries.length,
        truncated,
        updatedAt: new Date().toISOString(),
      },
      latestPublicSupporters,
      note:
        "Public message text is stored on XRPL but is reviewed before OTT republishes or features it.",
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

  res.setHeader?.("Cache-Control", "no-store, max-age=0");

  try {
    const body = req.body ?? {};
    const action = body.action;

    let result:
      | {
          status: number;
          body: unknown;
        }
      | undefined;

    if (action === "xaman.createSupportPaymentPayload") {
      result = await handleCreateSupportPaymentPayload(body);
    }

    if (action === "xaman.verifySupportPaymentPayload") {
      result = await handleVerifySupportPaymentPayload(body);
    }

    if (action === "xrpl.getSupportStats") {
      result = await handleGetSupportStats();
    }

    if (!result) {
      return res.status(400).json({
        ok: false,
        error: "Unknown support payment API action.",
      });
    }

    return res.status(result.status).json(result.body);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown support payment API error.",
    });
  }
}
