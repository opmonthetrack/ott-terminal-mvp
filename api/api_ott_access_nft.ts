type VercelRequest = {
  method?: string;
  body?: unknown;
  query?: Record<string, string | string[] | undefined>;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
};

const XAMAN_API_BASE = "https://xumm.app/api/v1/platform";

const XAMAN_API_KEY = process.env.XAMAN_API_KEY || "";
const XAMAN_API_SECRET = process.env.XAMAN_API_SECRET || "";

const OTT_PUBLIC_APP_URL = normalizePublicUrl(
  process.env.OTT_PUBLIC_APP_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    "https://ott-terminal-mvp.vercel.app",
);

const OTT_ACCESS_PASS_ISSUER =
  process.env.OTT_ACCESS_PASS_ISSUER ||
  process.env.OTT_PROOF_DESTINATION_WALLET ||
  "rPCF1f9pi91B7ad7FydnxFPKiF7cdycV5q";

const OTT_ACCESS_PASS_TAXON = Number(
  process.env.OTT_ACCESS_PASS_TAXON || "2606170002",
);

const OTT_ACCESS_PASS_METADATA_CID =
  process.env.OTT_ACCESS_PASS_METADATA_CID ||
  "bafkreifw47mopkw7qq4fppxkhgcthyrjvger5uyrqybyj52aunqhsz2cbm";

const OTT_ACCESS_PASS_METADATA_URI =
  process.env.OTT_ACCESS_PASS_METADATA_URI ||
  `ipfs://${OTT_ACCESS_PASS_METADATA_CID}`;

const OTT_ACCESS_PASS_FLAGS = Number(
  process.env.OTT_ACCESS_PASS_FLAGS || "8",
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setJsonHeaders(res);

  if (req.method === "OPTIONS") {
    res.status(204).json({});
    return;
  }

  if (!XAMAN_API_KEY || !XAMAN_API_SECRET) {
    res.status(500).json({
      ok: false,
      error: "Missing XAMAN_API_KEY or XAMAN_API_SECRET.",
    });
    return;
  }

  try {
    const body = getBody(req.body);
    const action = body.action || getQueryValue(req.query, "action");

    if (action === "create-access-nft-mint-payload") {
      const payload = await createAccessNftMintPayload();
      res.status(200).json(payload);
      return;
    }

    if (action === "verify-access-nft-mint-payload") {
      const payloadUuid =
        body.payloadUuid ||
        body.uuid ||
        getQueryValue(req.query, "payloadUuid") ||
        getQueryValue(req.query, "uuid");

      if (!payloadUuid) {
        res.status(400).json({
          ok: false,
          error: "Missing payloadUuid.",
        });
        return;
      }

      const verification = await verifyAccessNftMintPayload(payloadUuid);
      res.status(200).json(verification);
      return;
    }

    res.status(400).json({
      ok: false,
      error:
        "Unknown action. Use create-access-nft-mint-payload or verify-access-nft-mint-payload.",
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Access NFT API request failed.",
    });
  }
}

async function createAccessNftMintPayload() {
  const uriHex = encodeNftUri(OTT_ACCESS_PASS_METADATA_URI);

  const txjson = {
    TransactionType: "NFTokenMint",
    Account: OTT_ACCESS_PASS_ISSUER,
    URI: uriHex,
    NFTokenTaxon: OTT_ACCESS_PASS_TAXON,
    Flags: OTT_ACCESS_PASS_FLAGS,
    SourceTag: OTT_ACCESS_PASS_TAXON,
  };

  const payloadBody = {
    txjson,
    options: {
      submit: true,
      expire: 10,
      return_url: {
        web: `${OTT_PUBLIC_APP_URL}?xaman_return=1&return_target=access`,
        app: `${OTT_PUBLIC_APP_URL}?xaman_return=1&return_target=access`,
      },
    },
    custom_meta: {
      identifier: `ott-access-pass-mint-${Date.now()}`,
      instruction:
        "Mint OTT Access Pass NFT. Utility access only. No investment promise, no yield, no resale value promise.",
      blob: {
        project: "XRPL OnTheTrack Terminal",
        action: "OTT_ACCESS_PASS_NFT_MINT",
        issuer: OTT_ACCESS_PASS_ISSUER,
        taxon: OTT_ACCESS_PASS_TAXON,
        metadataCid: OTT_ACCESS_PASS_METADATA_CID,
        metadataUri: OTT_ACCESS_PASS_METADATA_URI,
        legalPosition: "Access utility only",
      },
    },
  };

  const response = await xamanFetch("/payload", {
    method: "POST",
    body: JSON.stringify(payloadBody),
  });

  return {
    ok: true,
    action: "create-access-nft-mint-payload",
    issuer: OTT_ACCESS_PASS_ISSUER,
    taxon: OTT_ACCESS_PASS_TAXON,
    metadataCid: OTT_ACCESS_PASS_METADATA_CID,
    metadataUri: OTT_ACCESS_PASS_METADATA_URI,
    uriHex,
    flags: OTT_ACCESS_PASS_FLAGS,
    payload: response,
    refs: response?.refs,
    uuid: response?.uuid,
    next: response?.next,
  };
}

async function verifyAccessNftMintPayload(payloadUuid: string) {
  const response = await xamanFetch(`/payload/${encodeURIComponent(payloadUuid)}`, {
    method: "GET",
  });

  const signed = Boolean(response?.response?.signed);
  const account =
    typeof response?.response?.account === "string"
      ? response.response.account
      : null;
  const txid =
    typeof response?.response?.txid === "string"
      ? response.response.txid
      : null;
  const resolved = Boolean(response?.meta?.resolved);

  return {
    ok: true,
    action: "verify-access-nft-mint-payload",
    uuid: payloadUuid,
    verified: {
      signed,
      resolved,
      account,
      txid,
      issuerMatches: account === OTT_ACCESS_PASS_ISSUER,
    },
    payload: response,
  };
}

async function xamanFetch(
  path: string,
  init: {
    method: "GET" | "POST";
    body?: string;
  },
) {
  const response = await fetch(`${XAMAN_API_BASE}${path}`, {
    method: init.method,
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": XAMAN_API_KEY,
      "X-API-Secret": XAMAN_API_SECRET,
    },
    body: init.body,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
        data?.message ||
        data?.error ||
        `Xaman API failed with status ${response.status}.`,
    );
  }

  return data;
}

function encodeNftUri(value: string) {
  return Array.from(new TextEncoder().encode(value))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

function normalizePublicUrl(value: string) {
  const cleanValue = value.trim();

  if (!cleanValue) {
    return "https://ott-terminal-mvp.vercel.app";
  }

  if (cleanValue.startsWith("http://") || cleanValue.startsWith("https://")) {
    return cleanValue.replace(/\/$/, "");
  }

  return `https://${cleanValue.replace(/\/$/, "")}`;
}

function getBody(body: unknown): Record<string, string> {
  if (!body || typeof body !== "object") {
    return {};
  }

  return body as Record<string, string>;
}

function getQueryValue(
  query: Record<string, string | string[] | undefined> | undefined,
  key: string,
) {
  const value = query?.[key];

  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function setJsonHeaders(res: VercelResponse) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}
