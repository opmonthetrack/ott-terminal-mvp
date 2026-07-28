const XAMAN_PAYLOAD_URL = "https://xumm.app/api/v1/platform/payload";

type RequestLike = {
  method?: string;
  body?: Record<string, unknown>;
};

type ResponseLike = {
  status: (code: number) => {
    json: (body: unknown) => void;
  };
};

type XamanPayload = {
  uuid?: string;
  meta?: {
    signed?: boolean;
    resolved?: boolean;
    cancelled?: boolean;
    expired?: boolean;
  };
  response?: {
    account?: string;
    hex?: string;
    signature?: string;
  };
  refs?: {
    qr_png?: string;
    qr_matrix?: string;
    websocket_status?: string;
  };
  next?: {
    always?: string;
    no_push_msg_received?: string;
  };
  payload?: {
    tx_type?: string;
    tx_destination?: string;
  };
  [key: string]: unknown;
};

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isXrplAddress(value: string) {
  return /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(value);
}

function xamanHeaders() {
  const apiKey = process.env.XAMAN_API_KEY?.trim();
  const apiSecret = process.env.XAMAN_API_SECRET?.trim();

  if (!apiKey || !apiSecret) {
    throw new Error("Xaman SignIn is not configured.");
  }

  return {
    "Content-Type": "application/json",
    "X-API-Key": apiKey,
    "X-API-Secret": apiSecret,
  };
}

function deploymentUrl() {
  const configured = (
    process.env.VERCEL_URL ||
    process.env.OTT_PUBLIC_APP_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    "ott-terminal-mvp.vercel.app"
  ).trim().replace(/\/$/, "");

  return /^https?:\/\//i.test(configured) ? configured : `https://${configured}`;
}

function returnUrl() {
  return `${deploymentUrl()}/?tab=xaman&xaman_signin_return=1&payload={id}`;
}

async function createSignInPayload() {
  const response = await fetch(XAMAN_PAYLOAD_URL, {
    method: "POST",
    headers: xamanHeaders(),
    body: JSON.stringify({
      txjson: {
        TransactionType: "SignIn",
      },
      options: {
        submit: false,
        return_url: {
          app: returnUrl(),
          web: returnUrl(),
        },
      },
      custom_meta: {
        identifier: "ott-wallet-signin",
        instruction: "OnTheTrack — Verify ownership of your XRPL wallet",
        blob: {
          mode: "ott-wallet-signin",
          product: "OTT Terminal",
          purpose: "Signature-only wallet ownership verification",
        },
      },
    }),
  });

  const payload = (await response.json()) as XamanPayload;
  if (!response.ok || !payload.uuid || !isUuid(payload.uuid)) {
    throw new Error("Xaman could not create a valid SignIn request.");
  }

  return payload;
}

async function getSignInPayload(uuid: string) {
  const response = await fetch(`${XAMAN_PAYLOAD_URL}/${uuid}`, {
    method: "GET",
    headers: xamanHeaders(),
  });

  const payload = (await response.json()) as XamanPayload;
  if (!response.ok) {
    throw new Error("Xaman could not load this SignIn request.");
  }

  return payload;
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Use POST." });
  }

  try {
    const action = stringValue(req.body?.action);

    if (action === "create") {
      const payload = await createSignInPayload();
      return res.status(200).json({
        ok: true,
        mode: "xaman-signin",
        payload,
      });
    }

    if (action === "verify") {
      const uuid = stringValue(req.body?.uuid);
      if (!isUuid(uuid)) {
        return res.status(400).json({ ok: false, error: "A valid Xaman payload UUID is required." });
      }

      const payload = await getSignInPayload(uuid);
      const resolved = Boolean(payload.meta?.resolved);
      const signed = Boolean(payload.meta?.signed);
      const account = stringValue(payload.response?.account);

      if (signed && !isXrplAddress(account)) {
        return res.status(409).json({
          ok: false,
          error: "Xaman returned a signed request without a valid XRPL account.",
        });
      }

      return res.status(resolved ? 200 : 202).json({
        ok: true,
        mode: "xaman-signin",
        pending: !resolved,
        resolved,
        signed,
        account: signed ? account : null,
        declined: resolved && !signed,
        payload,
      });
    }

    return res.status(400).json({ ok: false, error: "Unknown Xaman SignIn action." });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Xaman SignIn failed.",
    });
  }
}
