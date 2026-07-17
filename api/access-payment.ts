// api/access-payment.ts must stay self-contained for Vercel serverless runtime.
// It creates founder-controlled Xaman payment payloads only. No automatic mint or access unlock runs here.

const MAKE_WAVES_SOURCE_TAG = 2606170002;
const XAMAN_API_URL = "https://xumm.app/api/v1/platform/payload";
const ACCESS_PRICE_XRP = "1.589";
const ACCESS_PRICE_DROPS = "1589000";

const OTT_PUBLIC_APP_URL =
  normalizePublicUrl(process.env.OTT_PUBLIC_APP_URL) ||
  normalizePublicUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
  "https://ott-terminal-mvp.vercel.app";

const OTT_ACCESS_WALLET =
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

function getString(body: RequestBody, key: string) {
  const value = body[key];

  return typeof value === "string" ? value.trim() : "";
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
        error: "Xaman access payment payload creation failed.",
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
        error: "Xaman access payment payload lookup failed.",
        details: payload,
      },
    };
  }

  return {
    status: 200,
    body: payload,
  };
}

async function handleCreateAccessPaymentPayload(body: RequestBody) {
  const customerWallet = getString(body, "customerWallet");
  const destinationWallet = getString(body, "destinationWallet") || OTT_ACCESS_WALLET;
  const accessTier = (getString(body, "accessTier") || "Founder Access Pass").slice(0, 80);

  if (customerWallet && !isValidXrplAddress(customerWallet)) {
    return { status: 400, body: { ok: false, error: "Invalid customerWallet." } };
  }

  if (!isValidXrplAddress(destinationWallet)) {
    return { status: 400, body: { ok: false, error: "Missing or invalid destinationWallet." } };
  }

  const memoText = `OTT Access Pass payment | ${accessTier} | ${ACCESS_PRICE_XRP} XRP | utility access only | no investment or yield | SourceTag ${MAKE_WAVES_SOURCE_TAG}${customerWallet ? ` | wallet ${customerWallet}` : ""}`;
  const txjson = {
    TransactionType: "Payment",
    Destination: destinationWallet,
    Amount: ACCESS_PRICE_DROPS,
    SourceTag: MAKE_WAVES_SOURCE_TAG,
    Memos: [
      {
        Memo: {
          MemoType: textToHex("OTT_ACCESS_PAYMENT"),
          MemoData: textToHex(memoText),
        },
      },
    ],
  };

  const result = await createXamanPayload({
    txjson,
    options: {
      submit: true,
      return_url: {
        app: `${OTT_PUBLIC_APP_URL}/?access_payment_return=1&payload={id}`,
        web: `${OTT_PUBLIC_APP_URL}/?access_payment_return=1&payload={id}`,
      },
    },
    custom_meta: {
      identifier: "ott-access-pass-payment",
      instruction: `Pay ${ACCESS_PRICE_XRP} XRP for OTT Terminal Access Pass service. Utility access only; no investment, yield or resale value promise.`,
      blob: {
        mode: "ott-access-pass-payment",
        sourceTag: MAKE_WAVES_SOURCE_TAG,
        priceXrp: ACCESS_PRICE_XRP,
        amountDrops: ACCESS_PRICE_DROPS,
        destinationWallet,
        customerWallet: customerWallet || null,
        accessTier,
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
      mode: "ott-access-pass-payment",
      sourceTag: MAKE_WAVES_SOURCE_TAG,
      payment: {
        priceXrp: ACCESS_PRICE_XRP,
        amountDrops: ACCESS_PRICE_DROPS,
        destinationWallet,
        customerWallet: customerWallet || null,
        accessTier,
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

async function handleVerifyAccessPaymentPayload(body: RequestBody) {
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
      mode: "ott-access-payment-verification",
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

    if (action === "xaman.createAccessPaymentPayload") {
      result = await handleCreateAccessPaymentPayload(body);
    }

    if (action === "xaman.verifyAccessPaymentPayload") {
      result = await handleVerifyAccessPaymentPayload(body);
    }

    if (!result) {
      return res.status(400).json({
        ok: false,
        error: "Unknown access payment API action.",
      });
    }

    return res.status(result.status).json(result.body);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown access payment API router error.",
    });
  }
}
