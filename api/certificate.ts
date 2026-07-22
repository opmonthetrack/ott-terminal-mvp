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
  "minted_at",
  "offer_created_at",
  "issued_at",
  "created_at",
  "updated_at",
].join(",");

type RequestLike = {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
  query?: Record<string, string | string[] | undefined>;
  body?: Record<string, unknown>;
};

type ResponseLike = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => {
    json: (body: unknown) => void;
    send: (body: string) => void;
  };
};

type AdminClient = ReturnType<typeof createClient>;

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
  minted_at: string | null;
  offer_created_at: string | null;
  issued_at: string | null;
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

function header(req: RequestLike, name: string) {
  const value = req.headers?.[name] ?? req.headers?.[name.toLowerCase()];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function bearer(req: RequestLike) {
  const value = header(req, "authorization");
  return value.toLowerCase().startsWith("bearer ") ? value.slice(7).trim() : "";
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function queryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
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

function parseSerial(value: string) {
  const normalized = value.trim().replace(/^#/, "");
  if (!/^\d{1,4}$/.test(normalized)) return null;
  const serial = Number(normalized);
  return Number.isInteger(serial) && serial >= 1 && serial <= 5000 ? serial : null;
}

function serialLabel(serial: number) {
  return `#${String(serial).padStart(4, "0")}`;
}

function publicUrl() {
  const value = (
    process.env.OTT_PUBLIC_APP_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    "https://ott-terminal-mvp.vercel.app"
  ).trim().replace(/\/$/, "");
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function metadataUri(serial: number) {
  return `${publicUrl()}/api/certificate?scope=metadata&serial=${String(serial).padStart(4, "0")}`;
}

function issuerWallet() {
  const value = process.env.OTT_CERTIFICATE_ISSUER_WALLET?.trim() ?? "";
  if (!isAddress(value)) throw new Error("OTT_CERTIFICATE_ISSUER_WALLET is missing or invalid.");
  return value;
}

function selectedNetwork() {
  const value = process.env.OTT_CERTIFICATE_XRPL_NETWORK?.trim().toUpperCase();
  if (value !== "MAINNET" && value !== "TESTNET") {
    throw new Error("Set OTT_CERTIFICATE_XRPL_NETWORK to MAINNET or TESTNET.");
  }
  return value;
}

function collectionTaxon() {
  const parsed = Number(process.env.OTT_CERTIFICATE_NFT_TAXON ?? SOURCE_TAG);
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 4_294_967_295 ? parsed : SOURCE_TAG;
}

function collectionFlags() {
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
  if (!key || !secret) throw new Error("Xaman certificate signing is not configured.");
  return { "Content-Type": "application/json", "X-API-Key": key, "X-API-Secret": secret };
}

function rpcUrl() {
  const value = process.env.XRPL_RPC_URL?.trim();
  if (!value) throw new Error("XRPL_RPC_URL must match the selected certificate network.");
  return value;
}

function adminAllowed(userId: string, email: string) {
  const ids = new Set((process.env.OTT_MINT_ADMIN_USER_IDS ?? "").split(",").map((item) => item.trim()).filter(Boolean));
  const emails = new Set((process.env.OTT_MINT_ADMIN_EMAILS ?? "").split(",").map((item) => item.trim().toLowerCase()).filter(Boolean));
  return ids.has(userId) || Boolean(email && emails.has(email.toLowerCase()));
}

function makeAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY)?.trim();
  if (!supabaseUrl || !serviceKey) throw new Error("Trusted certificate storage is not configured.");
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

async function authenticate(admin: AdminClient, req: RequestLike) {
  const token = bearer(req);
  if (!token) throw new Error("AUTH_REQUIRED");
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) throw new Error("AUTH_INVALID");
  return data.user;
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

async function rpc(method: string, params: Record<string, unknown>) {
  const response = await fetch(rpcUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ method, params: [params] }),
  });
  const data = (await response.json()) as { result?: Record<string, unknown>; error?: string };
  if (!response.ok || data.error || stringValue(data.result?.error) || !data.result) {
    throw new Error(`XRPL ${method} request failed or is not available yet.`);
  }
  return data.result;
}

async function getTransaction(hash: string) {
  return (await rpc("tx", { transaction: hash, binary: false })) as XrplResult;
}

async function accountOwnsNft(account: string, nftokenId: string) {
  let marker: unknown = undefined;
  for (let page = 0; page < 20; page += 1) {
    const params: Record<string, unknown> = { account, ledger_index: "validated", limit: 400 };
    if (marker !== undefined) params.marker = marker;
    const result = await rpc("account_nfts", params);
    const items = Array.isArray(result.account_nfts) ? result.account_nfts as Array<Record<string, unknown>> : [];
    if (items.some((item) => stringValue(item.NFTokenID).toUpperCase() === nftokenId.toUpperCase())) return true;
    if (result.marker === undefined) return false;
    marker = result.marker;
  }
  return false;
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

async function loadClaimById(admin: AdminClient, claimId: string) {
  const { data, error } = await admin
    .from("nft_issuance_records")
    .select(SELECT_FIELDS)
    .eq("id", claimId)
    .eq("issuance_type", ISSUANCE_TYPE)
    .maybeSingle();
  if (error) throw new Error("The certificate claim could not be loaded.");
  return data ? data as unknown as CertificateRow : null;
}

async function loadClaimByUser(admin: AdminClient, userId: string) {
  const { data, error } = await admin
    .from("nft_issuance_records")
    .select(SELECT_FIELDS)
    .eq("user_id", userId)
    .eq("issuance_type", ISSUANCE_TYPE)
    .maybeSingle();
  if (error) throw new Error("The certificate claim could not be loaded.");
  return data ? data as unknown as CertificateRow : null;
}

async function handleMetadata(req: RequestLike, res: ResponseLike) {
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Use GET." });
  const serial = parseSerial(queryValue(req.query?.serial));
  if (!serial) return res.status(400).json({ ok: false, error: "Valid serial 0001–5000 required." });
  const admin = makeAdmin();
  const { data, error } = await admin
    .from("nft_issuance_records")
    .select("serial_number,wallet_address,qualification_score,qualification_course_count")
    .eq("issuance_type", ISSUANCE_TYPE)
    .eq("serial_number", serial)
    .maybeSingle();
  if (error) return res.status(500).json({ ok: false, error: "Metadata could not be loaded." });
  if (!data) return res.status(404).json({ ok: false, error: "Certificate not found." });

  const label = serialLabel(serial);
  const base = publicUrl();
  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400");
  return res.status(200).json({
    name: `OTT XRPL Foundation Certificate ${label}`,
    description: "Verified OTT XRPL Foundation Academy completion proof. Educational utility only; no investment, financial return or ownership promise.",
    image: `${base}/api/certificate?scope=image&serial=${String(serial).padStart(4, "0")}`,
    external_url: `${base}/?certificate=${String(serial).padStart(4, "0")}`,
    issuer: "XRPL OnTheTrack Terminal",
    collection: "OTT XRPL Foundation Certificate",
    edition: label,
    attributes: [
      { trait_type: "Certificate serial", value: label },
      { trait_type: "Verified Academy score", value: Number(data.qualification_score ?? 0), display_type: "number" },
      { trait_type: "Verified lessons", value: Number(data.qualification_course_count ?? 0), display_type: "number" },
      { trait_type: "Receiving XRPL account", value: String(data.wallet_address ?? "") },
      { trait_type: "Program", value: "OTT XRPL Foundation Academy" },
      { trait_type: "SourceTag", value: String(SOURCE_TAG) },
    ],
  });
}

async function handleImage(req: RequestLike, res: ResponseLike) {
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Use GET." });
  const serial = parseSerial(queryValue(req.query?.serial));
  if (!serial) return res.status(400).json({ ok: false, error: "Valid serial 0001–5000 required." });
  const admin = makeAdmin();
  const { data, error } = await admin
    .from("nft_issuance_records")
    .select("qualification_score,qualification_course_count")
    .eq("issuance_type", ISSUANCE_TYPE)
    .eq("serial_number", serial)
    .maybeSingle();
  if (error) return res.status(500).json({ ok: false, error: "Image data could not be loaded." });
  if (!data) return res.status(404).json({ ok: false, error: "Certificate not found." });

  const label = serialLabel(serial);
  const score = Math.max(0, Math.min(100, Number(data.qualification_score ?? 0)));
  const lessons = Math.max(0, Number(data.qualification_course_count ?? 0));
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
<defs><radialGradient id="h" cx="50%" cy="42%" r="54%"><stop offset="0%" stop-color="#1d4ed8" stop-opacity=".42"/><stop offset="100%" stop-color="#020617" stop-opacity="0"/></radialGradient></defs>
<rect width="1200" height="1200" rx="72" fill="#020617"/><circle cx="600" cy="470" r="430" fill="url(#h)"/><rect x="55" y="55" width="1090" height="1090" rx="54" fill="none" stroke="#334155" stroke-width="2"/>
<path d="M600 210 785 530 415 530Z" fill="none" stroke="#f8fafc" stroke-width="14"/><path d="M505 445c50-55 140-55 190 0-50 55-140 55-190 0Z" fill="none" stroke="#93c5fd" stroke-width="9"/><circle cx="600" cy="445" r="34" fill="#f8fafc"/>
<text x="600" y="720" fill="#93c5fd" font-family="Arial" font-size="28" font-weight="700" letter-spacing="8" text-anchor="middle">XRPL ONTHETRACK TERMINAL</text>
<text x="600" y="795" fill="#f8fafc" font-family="Arial" font-size="62" font-weight="700" text-anchor="middle">FOUNDATION CERTIFICATE</text>
<text x="600" y="872" fill="#cbd5e1" font-family="Arial" font-size="30" text-anchor="middle">Verified Academy completion · ${lessons} lessons · ${score}%</text>
<text x="600" y="1000" fill="#fff" font-family="Arial" font-size="82" font-weight="700" letter-spacing="6" text-anchor="middle">${label}</text>
<text x="600" y="1070" fill="#64748b" font-family="Arial" font-size="22" letter-spacing="4" text-anchor="middle">SOURCE TAG ${SOURCE_TAG}</text></svg>`;
  res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400");
  return res.status(200).send(svg);
}

async function handleStatus(req: RequestLike, res: ResponseLike) {
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Use GET." });
  const admin = makeAdmin();
  const user = await authenticate(admin, req);
  const claim = await loadClaimByUser(admin, user.id);
  return res.status(200).json({
    ok: true,
    claim: claim ? { ...claim, serial: serialLabel(claim.serial_number) } : null,
  });
}

async function handleIssuer(req: RequestLike, res: ResponseLike) {
  if (req.method !== "GET" && req.method !== "POST") return res.status(405).json({ ok: false, error: "Use GET or POST." });
  const admin = makeAdmin();
  const user = await authenticate(admin, req);
  if (!adminAllowed(user.id, user.email ?? "")) return res.status(403).json({ ok: false, error: "This OTT account is not authorized for certificate issuance." });

  if (req.method === "GET") {
    const { data, error } = await admin
      .from("nft_issuance_records")
      .select(SELECT_FIELDS)
      .eq("issuance_type", ISSUANCE_TYPE)
      .order("created_at", { ascending: true });
    if (error) return res.status(500).json({ ok: false, error: "Issuer queue could not be loaded." });
    return res.status(200).json({ ok: true, queue: data ?? [] });
  }

  const action = stringValue(req.body?.action);
  const claimId = stringValue(req.body?.claimId);
  if (!claimId) return res.status(400).json({ ok: false, error: "claimId is required." });
  const claim = await loadClaimById(admin, claimId);
  if (!claim) return res.status(404).json({ ok: false, error: "Certificate claim not found." });
  if (!claim.wallet_address || !isAddress(claim.wallet_address)) return res.status(409).json({ ok: false, error: "Claim has no valid receiving wallet." });

  const issuer = issuerWallet();
  const uri = metadataUri(claim.serial_number);
  const label = serialLabel(claim.serial_number);
  if (new TextEncoder().encode(uri).length > 256) return res.status(500).json({ ok: false, error: "Metadata URI exceeds 256 bytes." });

  if (action === "create-mint") {
    if (!["reserved", "failed", "mint-signing"].includes(claim.lifecycle_step)) return res.status(409).json({ ok: false, error: `Mint cannot start from ${claim.lifecycle_step}.` });
    const payload = await createPayload({
      txjson: {
        TransactionType: "NFTokenMint",
        Account: issuer,
        NFTokenTaxon: collectionTaxon(),
        Flags: collectionFlags(),
        URI: textToHex(uri),
        Memos: [{ Memo: { MemoType: textToHex("OTT_FOUNDATION_CERTIFICATE"), MemoData: textToHex(`OTT XRPL Foundation Certificate ${label}`) } }],
      },
      options: {
        submit: true,
        force_network: selectedNetwork(),
        return_url: {
          app: `${publicUrl()}/?founder=1&issuer=1&certificate_mint_return=1&payload={id}`,
          web: `${publicUrl()}/?founder=1&issuer=1&certificate_mint_return=1&payload={id}`,
        },
      },
      custom_meta: { identifier: `ott-foundation-mint-${claim.id}`, instruction: `Mint ${label}`, blob: { claimId: claim.id, serial: label, stage: "mint", sourceTag: SOURCE_TAG } },
    });
    const { data, error } = await admin.from("nft_issuance_records")
      .update({ status: "pending", lifecycle_step: "mint-signing", metadata_uri: uri, mint_payload_uuid: payload.uuid, error_message: null })
      .eq("id", claim.id).select(SELECT_FIELDS).single();
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
    if (stringValue(payload.response?.account) !== issuer || !isHash(txid)) return res.status(409).json({ ok: false, error: "Mint signer or hash mismatch." });
    const result = await getTransaction(txid);
    assertSuccess(result);
    const tx = transaction(result);
    const nftokenId = metadataHash(metadata(result), "nftoken_id");
    if (stringValue(tx.TransactionType) !== "NFTokenMint" || stringValue(tx.Account) !== issuer || Number(tx.NFTokenTaxon) !== collectionTaxon() || Number(tx.Flags ?? 0) !== collectionFlags() || stringValue(tx.URI).toUpperCase() !== textToHex(uri)) {
      return res.status(409).json({ ok: false, error: "Validated mint does not match this claim." });
    }
    if (!nftokenId) return res.status(502).json({ ok: false, error: "Validated response did not include nftoken_id." });
    const { data, error } = await admin.from("nft_issuance_records")
      .update({ status: "pending", lifecycle_step: "minted", metadata_uri: uri, mint_transaction_hash: txid, nftoken_id: nftokenId, minted_at: new Date().toISOString(), error_message: null })
      .eq("id", claim.id).select(SELECT_FIELDS).single();
    if (error) throw error;
    return res.status(200).json({ ok: true, stage: "minted", claim: data, payload, xrpl: { txid, nftokenId } });
  }

  if (action === "create-offer") {
    if (claim.lifecycle_step !== "minted" || !claim.nftoken_id) return res.status(409).json({ ok: false, error: "Certificate must be validated as minted first." });
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
        force_network: selectedNetwork(),
        return_url: {
          app: `${publicUrl()}/?founder=1&issuer=1&certificate_offer_return=1&payload={id}`,
          web: `${publicUrl()}/?founder=1&issuer=1&certificate_offer_return=1&payload={id}`,
        },
      },
      custom_meta: { identifier: `ott-foundation-offer-${claim.id}`, instruction: `Create free targeted offer for ${label}`, blob: { claimId: claim.id, serial: label, stage: "offer", sourceTag: SOURCE_TAG } },
    });
    const { data, error } = await admin.from("nft_issuance_records")
      .update({ status: "pending", lifecycle_step: "offer-signing", offer_payload_uuid: payload.uuid, error_message: null })
      .eq("id", claim.id).select(SELECT_FIELDS).single();
    if (error) throw error;
    return res.status(200).json({ ok: true, stage: "offer-signing", claim: data, payload });
  }

  if (action === "verify-offer") {
    if (!claim.offer_payload_uuid || !claim.nftoken_id) return res.status(409).json({ ok: false, error: "No transfer offer exists." });
    const payload = await getPayload(claim.offer_payload_uuid);
    if (!payload.meta?.resolved) return res.status(202).json({ ok: true, pending: true, stage: "offer-signing", claim, payload });
    if (!payload.meta.signed) {
      await admin.from("nft_issuance_records").update({ status: "failed", lifecycle_step: "failed", error_message: "Issuer declined the transfer offer." }).eq("id", claim.id);
      return res.status(409).json({ ok: false, error: "Issuer declined the transfer offer." });
    }
    const txid = stringValue(payload.response?.txid).toUpperCase();
    if (stringValue(payload.response?.account) !== issuer || !isHash(txid)) return res.status(409).json({ ok: false, error: "Offer signer or hash mismatch." });
    const result = await getTransaction(txid);
    assertSuccess(result);
    const tx = transaction(result);
    const offerId = metadataHash(metadata(result), "offer_id");
    if (stringValue(tx.TransactionType) !== "NFTokenCreateOffer" || stringValue(tx.Account) !== issuer || stringValue(tx.NFTokenID).toUpperCase() !== claim.nftoken_id.toUpperCase() || stringValue(tx.Destination) !== claim.wallet_address || stringValue(tx.Amount) !== "0" || Number(tx.Flags ?? 0) !== 1) {
      return res.status(409).json({ ok: false, error: "Validated offer does not match this claim." });
    }
    if (!offerId) return res.status(502).json({ ok: false, error: "Validated response did not include offer_id." });
    const { data, error } = await admin.from("nft_issuance_records")
      .update({ status: "pending", lifecycle_step: "offer-created", offer_transaction_hash: txid, transfer_offer_id: offerId, offer_created_at: new Date().toISOString(), error_message: null })
      .eq("id", claim.id).select(SELECT_FIELDS).single();
    if (error) throw error;
    return res.status(200).json({ ok: true, stage: "offer-created", claim: data, payload, xrpl: { txid, offerId } });
  }

  return res.status(400).json({ ok: false, error: "Unknown issuer action." });
}

async function handleTransfer(req: RequestLike, res: ResponseLike) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Use POST." });
  const admin = makeAdmin();
  const user = await authenticate(admin, req);
  const claim = await loadClaimByUser(admin, user.id);
  if (!claim) return res.status(404).json({ ok: false, error: "No certificate claim exists." });

  const wallet = claim.wallet_address ?? "";
  const nftokenId = (claim.nftoken_id ?? "").toUpperCase();
  const offerId = (claim.transfer_offer_id ?? "").toUpperCase();
  if (!isAddress(wallet) || !isHash(nftokenId) || !isHash(offerId)) return res.status(409).json({ ok: false, error: "Issuer transfer offer is not ready." });

  const action = stringValue(req.body?.action);
  const label = serialLabel(claim.serial_number);

  if (action === "create-accept") {
    if (!["offer-created", "accept-signing"].includes(claim.lifecycle_step)) return res.status(409).json({ ok: false, error: `Acceptance cannot start from ${claim.lifecycle_step}.` });
    const payload = await createPayload({
      txjson: {
        TransactionType: "NFTokenAcceptOffer",
        Account: wallet,
        NFTokenSellOffer: offerId,
        Memos: [{ Memo: { MemoType: textToHex("OTT_CERTIFICATE_ACCEPT"), MemoData: textToHex(`Accept ${label} into verified wallet`) } }],
      },
      options: {
        submit: true,
        force_network: selectedNetwork(),
        return_url: {
          app: `${publicUrl()}/?certificate_accept_return=1&payload={id}`,
          web: `${publicUrl()}/?certificate_accept_return=1&payload={id}`,
        },
      },
      custom_meta: { identifier: `ott-foundation-accept-${claim.id}`, instruction: `Accept ${label}`, blob: { claimId: claim.id, serial: label, stage: "accept" } },
    });
    const { data, error } = await admin.from("nft_issuance_records")
      .update({ status: "pending", lifecycle_step: "accept-signing", accept_payload_uuid: payload.uuid, error_message: null })
      .eq("id", claim.id).eq("user_id", user.id).select(SELECT_FIELDS).single();
    if (error) throw error;
    return res.status(200).json({ ok: true, stage: "accept-signing", claim: data, payload });
  }

  if (action === "verify-accept") {
    if (!claim.accept_payload_uuid || !isUuid(claim.accept_payload_uuid)) return res.status(409).json({ ok: false, error: "No valid acceptance payload exists." });
    const payload = await getPayload(claim.accept_payload_uuid);
    if (!payload.meta?.resolved) return res.status(202).json({ ok: true, pending: true, stage: "accept-signing", claim, payload });
    if (!payload.meta.signed) {
      await admin.from("nft_issuance_records").update({ status: "pending", lifecycle_step: "offer-created", accept_payload_uuid: null, error_message: "Learner declined certificate acceptance." }).eq("id", claim.id).eq("user_id", user.id);
      return res.status(409).json({ ok: false, error: "Acceptance declined; transfer offer remains available." });
    }
    const txid = stringValue(payload.response?.txid).toUpperCase();
    if (stringValue(payload.response?.account) !== wallet || !isHash(txid)) return res.status(409).json({ ok: false, error: "Accepting wallet or hash mismatch." });
    const result = await getTransaction(txid);
    if (!result.validated) return res.status(202).json({ ok: true, pending: true, stage: "ledger-validation", claim, payload });
    assertSuccess(result);
    const tx = transaction(result);
    if (stringValue(tx.TransactionType) !== "NFTokenAcceptOffer" || stringValue(tx.Account) !== wallet || stringValue(tx.NFTokenSellOffer).toUpperCase() !== offerId) {
      return res.status(409).json({ ok: false, error: "Validated acceptance does not match this offer." });
    }
    const changedNft = metadataHash(metadata(result), "nftoken_id");
    if (changedNft && changedNft !== nftokenId) return res.status(409).json({ ok: false, error: "Acceptance changed a different NFT." });
    if (!(await accountOwnsNft(wallet, nftokenId))) return res.status(202).json({ ok: true, pending: true, stage: "ownership-confirmation", claim, payload });

    const now = new Date().toISOString();
    const { data, error } = await admin.from("nft_issuance_records")
      .update({ status: "issued", lifecycle_step: "issued", transaction_hash: txid, accept_transaction_hash: txid, issued_at: now, error_message: null })
      .eq("id", claim.id).eq("user_id", user.id).select(SELECT_FIELDS).single();
    if (error) throw error;
    return res.status(200).json({ ok: true, stage: "issued", claim: data, payload, xrpl: { txid, nftokenId, owner: wallet } });
  }

  return res.status(400).json({ ok: false, error: "Unknown transfer action." });
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  const scope = queryValue(req.query?.scope).toLowerCase();
  try {
    if (scope === "metadata") return await handleMetadata(req, res);
    if (scope === "image") return await handleImage(req, res);
    if (scope === "status") return await handleStatus(req, res);
    if (scope === "issuer") return await handleIssuer(req, res);
    if (scope === "transfer") return await handleTransfer(req, res);
    return res.status(400).json({ ok: false, error: "Unknown certificate scope." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown certificate error.";
    if (message === "AUTH_REQUIRED") return res.status(401).json({ ok: false, error: "Sign in first." });
    if (message === "AUTH_INVALID") return res.status(401).json({ ok: false, error: "OTT account session could not be verified." });
    return res.status(500).json({ ok: false, error: message });
  }
}
