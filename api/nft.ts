// api/nft.ts must stay self-contained for Vercel serverless runtime.
// It creates founder-controlled Xaman NFT payloads only. No payment or automatic access unlock runs here.

const MAKE_WAVES_SOURCE_TAG = 2606170002;
const XAMAN_API_URL = "https://xumm.app/api/v1/platform/payload";
const XRPL_RPC_URL = process.env.XRPL_RPC_URL || "https://s1.ripple.com:51234/";

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
const TF_SELL_NFTOKEN = 1;

const ZERO_DROPS = "0";

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

type XrplTxJson = {
  Account?: string;
  TransactionType?: string;
  URI?: string;
  NFTokenTaxon?: number;
  NFTokenID?: string;
  Amount?: string;
  Destination?: string;
  Flags?: number;
  SourceTag?: number;
};

type XrplMeta = {
  TransactionResult?: string;
  AffectedNodes?: unknown[];
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
    account_nfts?: RawNft[];
    marker?: unknown;
  };
  error?: string;
};

type RawNft = {
  NFTokenID?: string;
  Issuer?: string;
  NFTokenTaxon?: number;
  URI?: string;
  Flags?: number;
  nft_serial?: number;
};

type NormalizedNft = {
  nftokenId: string;
  issuer: string;
  taxon: number;
  uri: string;
  decodedUri: string;
  flags?: number;
  serial?: number;
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

    if (!bytes) {
      return "";
    }

    return new TextDecoder().decode(new Uint8Array(bytes));
  } catch {
    return "";
  }
}

function getString(body: RequestBody, key: string) {
  const value = body[key];

  return typeof value === "string" ? value.trim() : "";
}

function isValidXrplAddress(value: string) {
  return /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(value);
}

function isValidTxHash(value: string) {
  return /^[A-Fa-f0-9]{64}$/.test(value);
}

function isValidNftokenId(value: string) {
  return /^[A-Fa-f0-9]{64}$/.test(value);
}

function normalizeText(value: string) {
  return value.trim().toLowerCase();
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

async function xrplRpc(method: string, params: Record<string, unknown>) {
  const response = await fetch(XRPL_RPC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
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
        error: "XRPL lookup failed.",
        details: data,
      },
    };
  }

  return {
    status: 200,
    body: data,
  };
}

function readTxJson(result: XrplTxResult): XrplTxJson {
  return result.tx_json ?? result.tx ?? {};
}

function normalizeNft(input: RawNft): NormalizedNft {
  return {
    nftokenId: input.NFTokenID ?? "unknown",
    issuer: input.Issuer ?? "unknown",
    taxon: input.NFTokenTaxon ?? 0,
    uri: input.URI ?? "",
    decodedUri: hexToText(input.URI),
    flags: input.Flags,
    serial: input.nft_serial,
  };
}

function nftUriMatchesAccessPass(rawUri: string, decodedUri: string) {
  const acceptedUris = [
    OTT_ACCESS_PASS_METADATA_URI,
    `ipfs://${OTT_ACCESS_PASS_METADATA_CID}`,
    OTT_ACCESS_PASS_METADATA_CID,
    `https://ipfs.io/ipfs/${OTT_ACCESS_PASS_METADATA_CID}`,
    `https://gateway.pinata.cloud/ipfs/${OTT_ACCESS_PASS_METADATA_CID}`,
  ].map(normalizeText);

  const normalizedRaw = normalizeText(rawUri);
  const normalizedDecoded = normalizeText(decodedUri);
  const encodedMetadataUri = normalizeText(textToHex(OTT_ACCESS_PASS_METADATA_URI));
  const encodedMetadataCid = normalizeText(textToHex(OTT_ACCESS_PASS_METADATA_CID));

  return (
    acceptedUris.includes(normalizedRaw) ||
    acceptedUris.includes(normalizedDecoded) ||
    normalizedRaw.includes(encodedMetadataUri) ||
    normalizedRaw.includes(encodedMetadataCid) ||
    normalizedDecoded.includes(normalizeText(OTT_ACCESS_PASS_METADATA_CID))
  );
}

function isAccessPassNft(nft: NormalizedNft) {
  return (
    nft.issuer === OTT_ACCESS_PASS_ISSUER &&
    nft.taxon === OTT_ACCESS_PASS_TAXON &&
    nftUriMatchesAccessPass(nft.uri, nft.decodedUri)
  );
}

function collectNftsFromUnknown(value: unknown, output: RawNft[] = []) {
  if (!value || typeof value !== "object") {
    return output;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectNftsFromUnknown(item, output));
    return output;
  }

  const record = value as Record<string, unknown>;

  if (typeof record.NFTokenID === "string") {
    output.push({
      NFTokenID: record.NFTokenID,
      Issuer: typeof record.Issuer === "string" ? record.Issuer : undefined,
      NFTokenTaxon:
        typeof record.NFTokenTaxon === "number" ? record.NFTokenTaxon : undefined,
      URI: typeof record.URI === "string" ? record.URI : undefined,
      Flags: typeof record.Flags === "number" ? record.Flags : undefined,
      nft_serial: typeof record.nft_serial === "number" ? record.nft_serial : undefined,
    });
  }

  Object.values(record).forEach((item) => collectNftsFromUnknown(item, output));

  return output;
}

async function fetchAccountNfts(account: string) {
  const allNfts: RawNft[] = [];
  let marker: unknown = undefined;

  for (let page = 0; page < 10; page += 1) {
    const result = await xrplRpc("account_nfts", {
      account,
      ledger_index: "validated",
      limit: 400,
      ...(marker ? { marker } : {}),
    });

    if (result.status !== 200) {
      return result;
    }

    const data = result.body as XrplRpcResponse;
    allNfts.push(...(data.result?.account_nfts ?? []));
    marker = data.result?.marker;

    if (!marker) {
      break;
    }
  }

  return {
    status: 200,
    body: allNfts,
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
      mode: "founder-nft-payload-verification",
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

async function handleVerifyAccessPassMint(body: RequestBody) {
  const txHash = getString(body, "txHash");
  const issuerWallet = getString(body, "issuerWallet") || OTT_ACCESS_PASS_ISSUER;

  if (!txHash || !isValidTxHash(txHash)) {
    return { status: 400, body: { ok: false, error: "Missing or invalid txHash." } };
  }

  if (!isValidXrplAddress(issuerWallet)) {
    return { status: 400, body: { ok: false, error: "Missing or invalid issuerWallet." } };
  }

  const txResult = await xrplRpc("tx", {
    transaction: txHash,
    binary: false,
  });

  if (txResult.status !== 200) {
    return txResult;
  }

  const txData = txResult.body as XrplRpcResponse;
  const xrplResult = txData.result as XrplTxResult;
  const txJson = readTxJson(xrplResult);
  const meta = xrplResult.meta ?? {};
  const mintedFromMeta = collectNftsFromUnknown(meta).map(normalizeNft).filter(isAccessPassNft);

  const accountNftsResult = await fetchAccountNfts(issuerWallet);

  if (accountNftsResult.status !== 200) {
    return accountNftsResult;
  }

  const accountNfts = (accountNftsResult.body as RawNft[]).map(normalizeNft);
  const accessPassNfts = accountNfts.filter(isAccessPassNft);
  const newestAccessPass = accessPassNfts
    .slice()
    .sort((a, b) => (b.serial ?? 0) - (a.serial ?? 0))[0] ?? null;

  const txValidated = Boolean(xrplResult.validated);
  const txSuccess = meta.TransactionResult === "tesSUCCESS";
  const isNftMint = txJson.TransactionType === "NFTokenMint";
  const issuerMatches = txJson.Account === issuerWallet;
  const sourceTagMatches = txJson.SourceTag === MAKE_WAVES_SOURCE_TAG;
  const taxonMatches = txJson.NFTokenTaxon === OTT_ACCESS_PASS_TAXON;
  const uriMatches = nftUriMatchesAccessPass(txJson.URI ?? "", hexToText(txJson.URI));
  const flagsMatch = txJson.Flags === TF_TRANSFERABLE;

  return {
    status: 200,
    body: {
      ok: true,
      mode: "access-pass-mint-verification",
      sourceTag: MAKE_WAVES_SOURCE_TAG,
      txHash,
      verified: {
        accessPassMintVerified: Boolean(
          txValidated &&
            txSuccess &&
            isNftMint &&
            issuerMatches &&
            sourceTagMatches &&
            taxonMatches &&
            uriMatches &&
            flagsMatch,
        ),
        txValidated,
        txSuccess,
        transactionResult: meta.TransactionResult ?? "unknown",
        isNftMint,
        issuerMatches,
        sourceTagMatches,
        taxonMatches,
        uriMatches,
        flagsMatch,
        issuerWallet,
        account: txJson.Account ?? null,
        taxon: txJson.NFTokenTaxon ?? null,
        flags: txJson.Flags ?? null,
        ledgerIndex: xrplResult.ledger_index ?? null,
      },
      mintedNftsFromMeta: mintedFromMeta,
      matchedIssuerNfts: accessPassNfts,
      newestAccessPass,
      xrpl: txData.result,
    },
  };
}

async function handleCreateAccessPassSendOfferPayload(body: RequestBody) {
  const issuerWallet = getString(body, "issuerWallet") || OTT_ACCESS_PASS_ISSUER;
  const destinationWallet = getString(body, "destinationWallet");
  const nftokenId = getString(body, "nftokenId");

  if (!isValidXrplAddress(issuerWallet)) {
    return { status: 400, body: { ok: false, error: "Missing or invalid issuerWallet." } };
  }

  if (!destinationWallet || !isValidXrplAddress(destinationWallet)) {
    return { status: 400, body: { ok: false, error: "Missing or invalid destinationWallet." } };
  }

  if (!nftokenId || !isValidNftokenId(nftokenId)) {
    return { status: 400, body: { ok: false, error: "Missing or invalid NFTokenID." } };
  }

  const memoText = `OTT_ACCESS_PASS_SEND | destination ${destinationWallet} | utility access only | SourceTag ${MAKE_WAVES_SOURCE_TAG}`;
  const txjson = {
    TransactionType: "NFTokenCreateOffer",
    Account: issuerWallet,
    NFTokenID: nftokenId,
    Amount: ZERO_DROPS,
    Destination: destinationWallet,
    Flags: TF_SELL_NFTOKEN,
    SourceTag: MAKE_WAVES_SOURCE_TAG,
    Memos: [
      {
        Memo: {
          MemoType: textToHex("OTT_ACCESS_PASS_SEND"),
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
        app: `${OTT_PUBLIC_APP_URL}/?nft_send_offer_return=1&payload={id}`,
        web: `${OTT_PUBLIC_APP_URL}/?nft_send_offer_return=1&payload={id}`,
      },
    },
    custom_meta: {
      identifier: "ott-access-pass-send-offer",
      instruction: "OnTheTrack — Create 0 XRP NFT send offer for a destination wallet. Utility access only; no investment or resale value promise.",
      blob: {
        mode: "founder-access-pass-send-offer",
        sourceTag: MAKE_WAVES_SOURCE_TAG,
        issuerWallet,
        destinationWallet,
        nftokenId,
        amountDrops: ZERO_DROPS,
        flags: TF_SELL_NFTOKEN,
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
      mode: "founder-access-pass-send-offer",
      sourceTag: MAKE_WAVES_SOURCE_TAG,
      sendOffer: {
        issuerWallet,
        destinationWallet,
        nftokenId,
        amountDrops: ZERO_DROPS,
        flags: TF_SELL_NFTOKEN,
      },
      payload: result.body,
      transactionMeta: {
        transactionType: "NFTokenCreateOffer",
        sourceTag: MAKE_WAVES_SOURCE_TAG,
        memoText,
      },
    },
  };
}

async function handleVerifyAccessPassSendOffer(body: RequestBody) {
  const txHash = getString(body, "txHash");
  const issuerWallet = getString(body, "issuerWallet") || OTT_ACCESS_PASS_ISSUER;
  const destinationWallet = getString(body, "destinationWallet");
  const nftokenId = getString(body, "nftokenId");

  if (!txHash || !isValidTxHash(txHash)) {
    return { status: 400, body: { ok: false, error: "Missing or invalid txHash." } };
  }

  if (!isValidXrplAddress(issuerWallet)) {
    return { status: 400, body: { ok: false, error: "Missing or invalid issuerWallet." } };
  }

  if (!destinationWallet || !isValidXrplAddress(destinationWallet)) {
    return { status: 400, body: { ok: false, error: "Missing or invalid destinationWallet." } };
  }

  if (!nftokenId || !isValidNftokenId(nftokenId)) {
    return { status: 400, body: { ok: false, error: "Missing or invalid NFTokenID." } };
  }

  const txResult = await xrplRpc("tx", {
    transaction: txHash,
    binary: false,
  });

  if (txResult.status !== 200) {
    return txResult;
  }

  const txData = txResult.body as XrplRpcResponse;
  const xrplResult = txData.result as XrplTxResult;
  const txJson = readTxJson(xrplResult);
  const meta = xrplResult.meta ?? {};

  const txValidated = Boolean(xrplResult.validated);
  const txSuccess = meta.TransactionResult === "tesSUCCESS";
  const isCreateOffer = txJson.TransactionType === "NFTokenCreateOffer";
  const issuerMatches = txJson.Account === issuerWallet;
  const destinationMatches = txJson.Destination === destinationWallet;
  const nftokenMatches = txJson.NFTokenID === nftokenId;
  const amountMatches = txJson.Amount === ZERO_DROPS;
  const sourceTagMatches = txJson.SourceTag === MAKE_WAVES_SOURCE_TAG;
  const sellOfferFlagMatches = txJson.Flags === TF_SELL_NFTOKEN;

  return {
    status: 200,
    body: {
      ok: true,
      mode: "access-pass-send-offer-verification",
      sourceTag: MAKE_WAVES_SOURCE_TAG,
      txHash,
      verified: {
        accessPassSendOfferVerified: Boolean(
          txValidated &&
            txSuccess &&
            isCreateOffer &&
            issuerMatches &&
            destinationMatches &&
            nftokenMatches &&
            amountMatches &&
            sourceTagMatches &&
            sellOfferFlagMatches,
        ),
        txValidated,
        txSuccess,
        transactionResult: meta.TransactionResult ?? "unknown",
        isCreateOffer,
        issuerMatches,
        destinationMatches,
        nftokenMatches,
        amountMatches,
        sourceTagMatches,
        sellOfferFlagMatches,
        issuerWallet,
        destinationWallet,
        nftokenId,
        amountDrops: txJson.Amount ?? null,
        flags: txJson.Flags ?? null,
        ledgerIndex: xrplResult.ledger_index ?? null,
      },
      xrpl: txData.result,
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

    if (action === "xrpl.verifyAccessPassMint") {
      result = await handleVerifyAccessPassMint(body);
    }

    if (action === "xaman.createAccessPassSendOfferPayload") {
      result = await handleCreateAccessPassSendOfferPayload(body);
    }

    if (action === "xrpl.verifyAccessPassSendOffer") {
      result = await handleVerifyAccessPassSendOffer(body);
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