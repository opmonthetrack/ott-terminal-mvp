import { createClient } from "@supabase/supabase-js";

const XAMAN_API_URL = "https://xumm.app/api/v1/platform/payload";
const ISSUANCE_TYPE = "foundation-certificate";
const SOURCE_TAG = 2606170002;
const SELECT_FIELDS = [
  "id",
  "user_id",
  "status",
  "lifecycle_step",
  "serial_number",
  "wallet_address",
  "qualification_score",
  "qualification_course_count",
  "metadata_uri",
  "mint_payload_uuid",
  "mint_transaction_hash",
  "nftoken_id",
  "offer_payload_uuid",
  "offer_transaction_hash",
  "transfer_offer_id",
  "accept_payload_uuid",
  "accept_transaction_hash",
  "transaction_hash",
  "error_message",
  "created_at",
  "updated_at",
].join(",");

type RequestLike = {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
  body?: Record<string, unknown>;
};

type ResponseLike = {
  status: (code: number) => { json: (body: unknown) => void };
};

type CertificateRow = {
  id: string;
  user_id: string;
  status: string;
  lifecycle_step: string;
  serial_number: number;
  wallet_address: string | null;
  qualification_score: number | null;
  qualification_course_count: number | null;
  metadata_uri: string | null;
  mint_payload_uuid: string | null;
  mint_transaction_hash: string | null;
  nftoken_id: string | null;
  offer_payload_uuid: string | null;
  offer_transaction_hash: string | null;
  transfer_offer_id: string | null;
  accept_payload_uuid: string | null;
  accept_transaction_hash: string | null;
  transaction_hash: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

type XamanPayload = {
  uuid?: string;
  meta?: { signed?: boolean; resolved?: boolean };
  response?: { account?: string; txid?: string };
  next?: { always?: string; no_push_msg_received?: string };
  refs?: { qr_png?: string; qr_matrix?: string; websocket_status?: string };
  [key: string]: unknown;
};

type XrplResult = {
  validated?: boolean;
  tx_json?: Record<string, unknown>;
  tx?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  error?: string;
  error_message?: string;
};

function getHeader(req: RequestLike, name: string) {
  const value = req.headers?.[name] ?? req.headers?.[name.toLowerCase()];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function getBearerToken(req: RequestLike) {
  const authorization = getHeader(req, "authorization");
  return authorization.toLowerCase().startsWith("bearer ")
    ? authorization.slice(7).trim()
    : "";
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function textToHex(value: string) {
  return Array.from(new TextEncoder().encode(value))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

function isAddress(value: string) {
  return /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(value);
}

function isHash(value: string) {
  return /^[A-Fa-f0-9]{64}$/.test(value);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function publicUrl() {
  const value = (
    process.env.OTT_PUBLIC_APP_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    "https://ott-terminal-mvp.vercel.app"
  ).trim().replace(/\/$/, "");
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function issuerWallet() {
  const value = process.env.OTT_CERTIFICATE_ISSUER_WALLET?.trim() ?? "";
  if (!isAddress(value)) throw new Error("OTT_CERTIFICATE_ISSUER_WALLET is missing or invalid.");
  return value;
}

function network() {
  const value = process.env.OTT_CERTIFICATE_XRPL_NETWORK?.trim().toUpperCase();
  if (value !== "MAINNET" && value !== "TESTNET") {
    throw new Error("Set OTT_CERTIFICATE_XRPL_NETWORK to MAINNET or TESTNET.");
  }
  return value;
}

function taxon() {
  const parsed = Number(process.env.OTT_CERTIFICATE_NFT_TAXON ?? SOURCE_TAG);
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 4_294_967_295
    ? parsed
    : SOURCE_TAG;
}

function mintFlags() {
  const parsed = Number(process.env.OTT_CERTIFICATE_NFT_FLAGS ?? 0);
  const allowedMask = 1 | 2 | 8 | 16;
  if (!Number.isInteger(parsed) || parsed < 0 || (parsed & ~allowedMask) !== 0) {
    throw new Error("OTT_CERTIFICATE_NFT_FLAGS contains unsupported flags.");
  }
  return parsed;
}

function xamanHeaders() {
  const key = process.env.XAMAN_API_KEY?.trim();
  const secret = process.env.XAMAN_API_SECRET?.trim();
  if (!key || !secret) throw new Error("Xaman issuer signing is not configured.");
  return { "Content-Type": "application/json", "X-API-Key": key, "X-API-Secret": secret };
}

function rpcUrl() {
  const value = process.env.XRPL_RPC_URL?.trim();
  if (!value) throw new Error("XRPL_RPC_URL must match the selected certificate network.");
  return value;
}

function serialLabel(serial: number) {
  return `#${String(serial).padStart(4, "0")}`;
}

function adminAllowed(userId: string, email: string) {
  const ids = new Set((process.env.OTT_MINT_ADMIN_USER_IDS ?? "").split(",").map((item) => item.trim()).filter(Boolean));
  const emails = new Set((process.env.OTT_MINT_ADMIN_EMAILS ?? "").split(",").map((item) => item.trim().toLowerCase()).filter(Boolean));
  return ids.has(userId) || Boolean(email && emails.has(email.toLowerCase()));
}

async function createPayload(body: Record<string, unknown>) {
  const response = await fetch(XAMAN_API_URL, {
    method: "POST",
    headers: xamanHeaders(),
    body: JSON.stringify(body),
  });
  const payload = (await response.json()) as XamanPayload;
  if (!response.ok) throw new Error(`Xaman payload creation failed: ${JSON.stringify(payload).slice(0, 500)}`);
  if (!payload.uuid || !isUuid(payload.uuid)) throw new Error("Xaman did not return a valid payload UUID.");
  return payload;
}

async function getPayload(uuid: string) {
  const response = await fetch(`${XAMAN_API_URL}/${uuid}`, { method: "GET", headers: xamanHeaders() });
  const payload = (await response.json()) as XamanPayload;
  if (!response.ok) throw new Error(`Xaman payload lookup failed: ${JSON.stringify(payload).slice(0, 500)}`);
  return payload;
}

async function getTransaction(hash: string) {
  const response = await fetch(rpcUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ method: "tx", params: [{ transaction: hash, binary: false }] }),
  });
  const data = (await response.json()) as { result?: XrplResult; error?: string };
  if (!response.ok || data.error || data.result?.error || !data.result) {
    throw new Error("XRPL transaction lookup failed or is not available yet.");
  }
  return data.result;
}

function transaction(result: XrplResult) {
  return result.tx_json ?? result.tx ?? {};
}

function metadata(result: XrplResult) {
  return result.meta ?? {};
}

function assertSuccess(result: XrplResult) {
  const resultCode = stringValue(metadata(result).TransactionResult);
  if (!result.validated) throw new Error("The XRPL transaction is not validated yet.");
  if (resultCode !== "tesSUCCESS") throw new Error(`XRPL transaction failed (${resultCode || "unknown"}).`);
}

function metadataHash(meta: Record<string, unknown>, key: "nftoken_id" | "offer_id") {
  const value = stringValue(meta[key]).toUpperCase();
  return isHash(value) ? value : "";
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed. Use GET or POST." });
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL?.trim();
    const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY)?.trim();
    const token = getBearerToken(req);
    if (!supabaseUrl || !serviceKey) return res.status(503).json({ ok: false, error: "Trusted certificate storage is not configured." });
    if (!token) return res.status(401).json({ ok: false, error: "Sign in with the authorized founder account." });

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const { data: userData, error: userError } = await admin.auth.getUser(token);
    if (userError || !userData.user) return res.status(401).json({ ok: false, error: "Founder session could not be verified." });
    if (!adminAllowed(userData.user.id, userData.user.email ?? "")) {
      return res.status(403).json({ ok: false, error: "This OTT account is not authorized for certificate issuance." });
    }

    if (req.method === "GET") {
      const { data, error } = await admin
        .from("nft_issuance_records")
        .select(SELECT_FIELDS)
        .eq("issuance_type", ISSUANCE_TYPE)
        .order("created_at", { ascending: true });
      if (error) return res.status(500).json({ ok: false, error: "The certificate queue could not be loaded." });
      return res.status(200).json({ ok: true, queue: data ?? [] });
    }

    const action = stringValue(req.body?.action);
    const claimId = stringValue(req.body?.claimId);
    if (!claimId) return res.status(400).json({ ok: false, error: "claimId is required." });

    const { data: claimData, error: claimError } = await admin
      .from("nft_issuance_records")
      .select(SELECT_FIELDS)
      .eq("id", claimId)
      .eq("issuance_type", ISSUANCE_TYPE)
      .maybeSingle();
    if (claimError) return res.status(500).json({ ok: false, error: "The certificate claim could not be loaded." });
    if (!claimData) return res.status(404).json({ ok: false, error: "Certificate claim not found." });

    const claim = claimData as unknown as CertificateRow;
    if (!claim.wallet_address || !isAddress(claim.wallet_address)) {
      return res.status(409).json({ ok: false, error: "The claim has no valid receiving wallet." });
    }

    const issuer = issuerWallet();
    const appUrl = publicUrl();
    const serialText = String(claim.serial_number).padStart(4, "0");
    const label = serialLabel(claim.serial_number);
    const uri = `${appUrl}/api/academy-certificate-metadata?serial=${serialText}`;
    if (new TextEncoder().encode(uri).length > 256) {
      return res.status(500).json({ ok: false, error: "Certificate metadata URI exceeds 256 bytes." });
    }

    if (action === "create-mint") {
      if (!["reserved", "failed", "mint-signing"].includes(claim.lifecycle_step)) {
        return res.status(409).json({ ok: false, error: `Mint cannot start from ${claim.lifecycle_step}.` });
      }
      const payload = await createPayload({
        txjson: {
          TransactionType: "NFTokenMint",
          Account: issuer,
          NFTokenTaxon: taxon(),
          Flags: mintFlags(),
          URI: textToHex(uri),
          Memos: [{ Memo: { MemoType: textToHex("OTT_FOUNDATION_CERTIFICATE"), MemoData: textToHex(`OTT XRPL Foundation Certificate ${label}`) } }],
        },
        options: {
          submit: true,
          force_network: network(),
          return_url: {
            app: `${appUrl}/?founder=1&issuer=1&certificate_mint_return=1&payload={id}`,
            web: `${appUrl}/?founder=1&issuer=1&certificate_mint_return=1&payload={id}`,
          },
        },
        custom_meta: {
          identifier: `ott-foundation-mint-${claim.id}`,
          instruction: `Mint ${label} to the OTT issuer account`,
          blob: { claimId: claim.id, serial: label, stage: "mint", sourceTag: SOURCE_TAG },
        },
      });
      const { data, error } = await admin
        .from("nft_issuance_records")
        .update({ status: "pending", lifecycle_step: "mint-signing", metadata_uri: uri, mint_payload_uuid: payload.uuid, error_message: null })
        .eq("id", claim.id)
        .select(SELECT_FIELDS)
        .single();
      if (error) throw error;
      return res.status(200).json({ ok: true, stage: "mint-signing", claim: data, payload });
    }

    if (action === "verify-mint") {
      if (!claim.mint_payload_uuid) return res.status(409).json({ ok: false, error: "No mint payload exists." });
      const payload = await getPayload(claim.mint_payload_uuid);
      if (!payload.meta?.resolved) return res.status(202).json({ ok: true, pending: true, stage: "mint-signing", claim, payload });
      if (!payload.meta.signed) {
        await admin.from("nft_issuance_records").update({ status: "failed", lifecycle_step: "failed", error_message: "Issuer declined the mint payload." }).eq("id", claim.id);
        return res.status(409).json({ ok: false, error: "Issuer declined the mint payload." });
      }
      const txid = stringValue(payload.response?.txid).toUpperCase();
      if (stringValue(payload.response?.account) !== issuer || !isHash(txid)) {
        return res.status(409).json({ ok: false, error: "Mint signer or transaction hash does not match the issuer." });
      }
      const result = await getTransaction(txid);
      assertSuccess(result);
      const tx = transaction(result);
      const nftokenId = metadataHash(metadata(result), "nftoken_id");
      if (
        stringValue(tx.TransactionType) !== "NFTokenMint" ||
        stringValue(tx.Account) !== issuer ||
        Number(tx.NFTokenTaxon) !== taxon() ||
        Number(tx.Flags ?? 0) !== mintFlags() ||
        stringValue(tx.URI).toUpperCase() !== textToHex(uri)
      ) {
        return res.status(409).json({ ok: false, error: "Validated mint transaction does not match this claim." });
      }
      if (!nftokenId) return res.status(502).json({ ok: false, error: "Validated response did not include nftoken_id." });
      const { data, error } = await admin
        .from("nft_issuance_records")
        .update({ status: "pending", lifecycle_step: "minted", metadata_uri: uri, mint_transaction_hash: txid, nftoken_id: nftokenId, minted_at: new Date().toISOString(), error_message: null })
        .eq("id", claim.id)
        .select(SELECT_FIELDS)
        .single();
      if (error) throw error;
      return res.status(200).json({ ok: true, stage: "minted", claim: data, payload, xrpl: { txid, nftokenId } });
    }

    if (action === "create-offer") {
      if (claim.lifecycle_step !== "minted" || !claim.nftoken_id) {
        return res.status(409).json({ ok: false, error: "Certificate must be validated as minted first." });
      }
      const payload = await createPayload({
        txjson: {
          TransactionType: "NFTokenCreateOffer",
          Account: issuer,
          NFTokenID: claim.nftoken_id,
          Amount: "0",
          Destination: claim.wallet_address,
          Flags: 1,
          Memos: [{ Memo: { MemoType: textToHex("OTT_CERTIFICATE_TRANSFER"), MemoData: textToHex(`Free targeted transfer for ${label}`) } }],
        },
        options: {
          submit: true,
          force_network: network(),
          return_url: {
            app: `${appUrl}/?founder=1&issuer=1&certificate_offer_return=1&payload={id}`,
            web: `${appUrl}/?founder=1&issuer=1&certificate_offer_return=1&payload={id}`,
          },
        },
        custom_meta: {
          identifier: `ott-foundation-offer-${claim.id}`,
          instruction: `Create the free targeted transfer offer for ${label}`,
          blob: { claimId: claim.id, serial: label, stage: "offer", sourceTag: SOURCE_TAG },
        },
      });
      const { data, error } = await admin
        .from("nft_issuance_records")
        .update({ status: "pending", lifecycle_step: "offer-signing", offer_payload_uuid: payload.uuid, error_message: null })
        .eq("id", claim.id)
        .select(SELECT_FIELDS)
        .single();
      if (error) throw error;
      return res.status(200).json({ ok: true, stage: "offer-signing", claim: data, payload });
    }

    if (action === "verify-offer") {
      if (!claim.offer_payload_uuid || !claim.nftoken_id) {
        return res.status(409).json({ ok: false, error: "No transfer-offer payload exists." });
      }
      const payload = await getPayload(claim.offer_payload_uuid);
      if (!payload.meta?.resolved) return res.status(202).json({ ok: true, pending: true, stage: "offer-signing", claim, payload });
      if (!payload.meta.signed) {
        await admin.from("nft_issuance_records").update({ status: "failed", lifecycle_step: "failed", error_message: "Issuer declined the transfer offer." }).eq("id", claim.id);
        return res.status(409).json({ ok: false, error: "Issuer declined the transfer offer." });
      }
      const txid = stringValue(payload.response?.txid).toUpperCase();
      if (stringValue(payload.response?.account) !== issuer || !isHash(txid)) {
        return res.status(409).json({ ok: false, error: "Offer signer or transaction hash does not match the issuer." });
      }
      const result = await getTransaction(txid);
      assertSuccess(result);
      const tx = transaction(result);
      const offerId = metadataHash(metadata(result), "offer_id");
      if (
        stringValue(tx.TransactionType) !== "NFTokenCreateOffer" ||
        stringValue(tx.Account) !== issuer ||
        stringValue(tx.NFTokenID).toUpperCase() !== claim.nftoken_id.toUpperCase() ||
        stringValue(tx.Destination) !== claim.wallet_address ||
        stringValue(tx.Amount) !== "0" ||
        Number(tx.Flags ?? 0) !== 1
      ) {
        return res.status(409).json({ ok: false, error: "Validated transfer offer does not match this claim." });
      }
      if (!offerId) return res.status(502).json({ ok: false, error: "Validated response did not include offer_id." });
      const { data, error } = await admin
        .from("nft_issuance_records")
        .update({ status: "pending", lifecycle_step: "offer-created", offer_transaction_hash: txid, transfer_offer_id: offerId, offer_created_at: new Date().toISOString(), error_message: null })
        .eq("id", claim.id)
        .select(SELECT_FIELDS)
        .single();
      if (error) throw error;
      return res.status(200).json({ ok: true, stage: "offer-created", claim: data, payload, xrpl: { txid, offerId } });
    }

    return res.status(400).json({ ok: false, error: "Unknown action." });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error instanceof Error ? error.message : "Unknown issuer error." });
  }
}
