// api/nft.ts must stay self-contained for Vercel serverless runtime.
// It creates founder-controlled Xaman NFT payloads only. No payment or automatic access unlock runs here.

const MAKE_WAVES_SOURCE_TAG = 2606170002;
const XAMAN_API_URL = "https://xumm.app/api/v1/platform/payload";

const OTT_PUBLIC_APP_URL =
  normalizePublicUrl(process.env.OTT_PUBLIC_APP_URL) ||
  normalizePublicUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
  "https://ott-terminal-mvp.vercel.app";

const OTT_ACCESS_PASS_ISSUER =
  process.env.OTT_ACCESS_PASS_ISSUER?.trim() ||
  process.env.VITE_OTT_ACCESS_PASS_ISSUER?.trim() ||
  "rPCF1f9pi91B7ad7FydnxFPKiF7cdycV5q";

const OTT_ACCESS_PASS_TAXON = Number(
  process.env.OTT_ACCESS_PASS_TAXON ||
    process.env.VITE_OTT_ACCESS_PASS_TAXON ||
    "2606170002",
);

const OTT_ACCESS_PASS_METADATA_CID =
  process.env.OTT_ACCESS_PASS_METADATA_CID?.trim() ||
  process.env.VITE_OTT_ACCESS_PASS_METADATA_CID?.trim() ||
  "bafkreifw47mopkw7qq4fppxkhgcthyrjvger5uyrqybyj52aunqhsz2cbm";

const OTT_ACCESS_PASS_METADATA_URI =
  process.env.OTT_ACCESS_PASS_METADATA_URI?.trim() ||
  process.env.VITE_OTT_ACCESS_PASS_METADATA_URI?.trim() ||
  `ipfs://${OTT_ACCESS_PASS_METADATA_CID}`;

const TF_TRANSFERABLE = 8;

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
        error: "Xaman NFT payload creation failed.",
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
        error: "Xaman NFT payload lookup failed.",
        details: payload,
      },
    };
  }

  return {
    status: 200,
    body: payload,
  };
}

async function handleCreateAccessPassMintPayload(body: RequestBody) {
  const issuerWallet = getString(body, "issuerWallet") || OTT_ACCESS_PASS_ISSUER;
  const accessTier = (getString(body, "accessTier") || "Terminal Services").slice(0, 80);

  if (!isValidXrplAddress(issuerWallet)) {
    return { status: 400, body: { ok: false, error: "Missing or invalid issuerWallet." } };
  }

  const memoText = `OTT_ACCESS_PASS | ${accessTier} | Utility access only | SourceTag ${MAKE_WAVES_SOURCE_TAG}`;
  const txjson = {
    TransactionType: "NFTokenMint",
    Account: issuerWallet,
    URI: textToHex(OTT_ACCESS_PASS_METADATA_URI),
    NFTokenTaxon: OTT_ACCESS_PASS_TAXON,
    Flags: TF_TRANSFERABLE,
    SourceTag: MAKE_WAVES_SOURCE_TAG,
    Memos: [
      {
        Memo: {
          MemoType: textToHex("OTT_ACCESS_PASS"),
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
        app: `${OTT_PUBLIC_APP_URL}/?nft_mint_return=1&payload={id}`,
        web: `${OTT_PUBLIC_APP_URL}/?nft_mint_return=1&payload={id}`,
      },
    },
    custom_meta: {
      identifier: "ott-access-pass-mint",
      instruction: "OnTheTrack — Mint OTT Access Pass NFT. Utility access only; no investment, yield or resale value promise.",
      blob: {
        mode: "founder-access-pass-mint",
        sourceTag: MAKE_WAVES_SOURCE_TAG,
        issuerWallet,
        taxon: OTT_ACCESS_PASS_TAXON,
        metadataCid: OTT_ACCESS_PASS_METADATA_CID,
        metadataUri: OTT_ACCESS_PASS_METADATA_URI,
        flags: TF_TRANSFERABLE,
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
      mode: "founder-access-pass-mint",
      sourceTag: MAKE_WAVES_SOURCE_TAG,
      nft: {
        issuerWallet,
        taxon: OTT_ACCESS_PASS_TAXON,
        metadataCid: OTT_ACCESS_PASS_METADATA_CID,
        metadataUri: OTT_ACCESS_PASS_METADATA_URI,
        uriHex: textToHex(OTT_ACCESS_PASS_METADATA_URI),
        flags: TF_TRANSFERABLE,
        accessTier,
      },
      payload: result.body,
      transactionMeta: {
        transactionType: "NFTokenMint",
        sourceTag: MAKE_WAVES_SOURCE_TAG,
        memoText,
      },
    },
  };
}

async function handleVerifyNftPayload(body: RequestBody) {
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
      mode: "founder-access-pass-mint-verification",
      sourceTag: MAKE_WAVES_SOURCE_TAG,
      verified: {
        signed: Boolean(payload.meta?.signed),
        resolved: Boolean(payload.meta?.resolved),
        account: payload.response?.account ?? null,
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

    if (action === "xaman.createAccessPassMintPayload") {
      result = await handleCreateAccessPassMintPayload(body);
    }

    if (action === "xaman.verifyNftPayload") {
      result = await handleVerifyNftPayload(body);
    }

    if (!result) {
      return res.status(400).json({
        ok: false,
        error: "Unknown NFT API action.",
      });
    }

    return res.status(result.status).json(result.body);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown NFT API router error.",
    });
  }
}
