// api/support-payment.ts is a standalone Vercel serverless route for voluntary OTT support payments.
// It does not mint NFTs, unlock access, create token rights, or modify the core Xaman/API flow.

const MAKE_WAVES_SOURCE_TAG = 2606170002;
const XAMAN_API_URL = "https://xumm.app/api/v1/platform/payload";

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

async function handleCreateSupportPaymentPayload(body: RequestBody) {
  const amountXrp = getString(body, "amountXrp");
  const amountDrops = SUPPORT_AMOUNTS[amountXrp];

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

  const memoText = `OTT Terminal voluntary support | ${amountXrp} XRP | no investment, yield, access, NFT, token or governance rights | SourceTag ${MAKE_WAVES_SOURCE_TAG}`;
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
      instruction: `Voluntary support payment of ${amountXrp} XRP for OTT Terminal development, education and onboarding. No investment or access rights.`,
      blob: {
        mode: "ott-support-payment",
        amountXrp,
        amountDrops,
        destinationWallet: OTT_SUPPORT_WALLET,
        sourceTag: MAKE_WAVES_SOURCE_TAG,
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
      mode: "ott-support-payment",
      sourceTag: MAKE_WAVES_SOURCE_TAG,
      support: {
        amountXrp,
        amountDrops,
        destinationWallet: OTT_SUPPORT_WALLET,
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

    if (action === "xaman.createSupportPaymentPayload") {
      result = await handleCreateSupportPaymentPayload(body);
    }

    if (action === "xaman.verifySupportPaymentPayload") {
      result = await handleVerifySupportPaymentPayload(body);
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
