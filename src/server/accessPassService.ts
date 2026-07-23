import { createClient } from "@supabase/supabase-js";

const XAMAN_API_URL = "https://xumm.app/api/v1/platform/payload";
const ISSUANCE_TYPE = "access-pass";
const SOURCE_TAG = 2606170002;
const PRICE_XRP = "1.589";
const PRICE_DROPS = "1589000";
const DEFAULT_ACCESS_WALLET = "rsEHpJiExneayjkrQdeQEveUwabmmPbksq";

const ORDER_FIELDS = [
  "id", "user_id", "customer_wallet", "access_tier", "price_drops",
  "destination_wallet", "source_tag", "status", "payment_payload_uuid",
  "payment_tx_hash", "payer_account", "payment_validated_at", "serial_number",
  "issuance_record_id", "error_message", "created_at", "updated_at",
].join(",");

const CLAIM_FIELDS = [
  "id", "user_id", "status", "lifecycle_step", "serial_number", "wallet_address",
  "metadata_uri", "mint_payload_uuid", "mint_transaction_hash", "nftoken_id",
  "offer_payload_uuid", "offer_transaction_hash", "transfer_offer_id",
  "accept_payload_uuid", "accept_transaction_hash", "transaction_hash",
  "error_message", "minted_at", "offer_created_at", "issued_at", "created_at", "updated_at",
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
};

type OrderRow = {
  id: string;
  user_id: string;
  customer_wallet: string;
  access_tier: string;
  price_drops: number;
  destination_wallet: string;
  source_tag: number;
  status: string;
  payment_payload_uuid: string | null;
  payment_tx_hash: string | null;
  payer_account: string | null;
  payment_validated_at: string | null;
  serial_number: number | null;
  issuance_record_id: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

type ClaimRow = {
  id: string;
  user_id: string;
  status: string;
  lifecycle_step: string;
  serial_number: number;
  wallet_address: string | null;
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

type AdminClient = ReturnType<typeof makeAdmin>;

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
  const normalized = value.replace(/^#/, "");
  if (!/^\d{1,3}$/.test(normalized)) return null;
  const serial = Number(normalized);
  return Number.isInteger(serial) && serial >= 1 && serial <= 500 ? serial : null;
}

function serialLabel(serial: number) {
  return `#${String(serial).padStart(3, "0")}`;
}

function textToHex(value: string) {
  return Array.from(new TextEncoder().encode(value))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

function publicUrl() {
  const value = (
    process.env.OTT_PUBLIC_APP_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    "https://ott-terminal-mvp.vercel.app"
  ).trim().replace(/\/$/, "");
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function accessWallet() {
  const value = (
    process.env.OTT_ACCESS_WALLET ||
    process.env.VITE_OTT_ACCESS_WALLET ||
    DEFAULT_ACCESS_WALLET
  ).trim();
  if (!isAddress(value)) throw new Error("OTT_ACCESS_WALLET is missing or invalid.");
  return value;
}

function issuerWallet() {
  const value = process.env.OTT_ACCESS_PASS_ISSUER_WALLET?.trim() || "";
  if (!isAddress(value)) throw new Error("OTT_ACCESS_PASS_ISSUER_WALLET is missing or invalid.");
  return value;
}

function selectedNetwork() {
  const value = (process.env.OTT_ACCESS_PASS_XRPL_NETWORK || "MAINNET").trim().toUpperCase();
  if (value !== "MAINNET" && value !== "TESTNET") throw new Error("OTT_ACCESS_PASS_XRPL_NETWORK must be MAINNET or TESTNET.");
  return value;
}

function rpcUrl() {
  const configured = process.env.OTT_ACCESS_PASS_XRPL_RPC_URL?.trim() || process.env.XRPL_RPC_URL?.trim();
  if (configured) return configured;
  return selectedNetwork() === "TESTNET"
    ? "https://s.altnet.rippletest.net:51234"
    : "https://xrplcluster.com";
}

function collectionTaxon() {
  const parsed = Number(process.env.OTT_ACCESS_PASS_NFT_TAXON ?? SOURCE_TAG);
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 4_294_967_295 ? parsed : SOURCE_TAG;
}

function collectionFlags() {
  const parsed = Number(process.env.OTT_ACCESS_PASS_NFT_FLAGS ?? 0);
  const allowedMask = 1 | 2 | 8 | 16;
  if (!Number.isInteger(parsed) || parsed < 0 || (parsed & ~allowedMask) !== 0) {
    throw new Error("OTT_ACCESS_PASS_NFT_FLAGS contains unsupported flags.");
  }
  return parsed;
}

function metadataUri(serial: number) {
  return `${publicUrl()}/api/access-payment?scope=metadata&serial=${String(serial).padStart(3, "0")}`;
}

function adminAllowed(userId: string, email: string) {
  const ids = new Set((process.env.OTT_MINT_ADMIN_USER_IDS ?? "").split(",").map((item) => item.trim()).filter(Boolean));
  const emails = new Set((process.env.OTT_MINT_ADMIN_EMAILS ?? "").split(",").map((item) => item.trim().toLowerCase()).filter(Boolean));
  return ids.has(userId) || Boolean(email && emails.has(email.toLowerCase()));
}

function makeAdmin() {
  const url = process.env.SUPABASE_URL?.trim() || process.env.VITE_SUPABASE_URL?.trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY)?.trim();
  if (!url || !key) throw new Error("Trusted Access Pass storage is not configured.");
  return createClient(url, key, {
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

function xamanHeaders() {
  const key = process.env.XAMAN_API_KEY?.trim();
  const secret = process.env.XAMAN_API_SECRET?.trim();
  if (!key || !secret) throw new Error("Xaman Access Pass signing is not configured.");
  return { "Content-Type": "application/json", "X-API-Key": key, "X-API-Secret": secret };
}

async function createPayload(body: Record<string, unknown>) {
  const response = await fetch(XAMAN_API_URL, {
    method: "POST",
    headers: xamanHeaders(),
    body: JSON.stringify(body),
  });
  const payload = (await response.json()) as XamanPayload;
  if (!response.ok) throw new Error(`Xaman payload creation failed: ${JSON.stringify(payload).slice(0, 400)}`);
  if (!payload.uuid || !isUuid(payload.uuid)) throw new Error("Xaman did not return a valid payload UUID.");
  return payload;
}

async function getPayload(uuid: string) {
  const response = await fetch(`${XAMAN_API_URL}/${uuid}`, { method: "GET", headers: xamanHeaders() });
  const payload = (await response.json()) as XamanPayload;
  if (!response.ok) throw new Error(`Xaman payload lookup failed: ${JSON.stringify(payload).slice(0, 400)}`);
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

async function loadOrderByUser(admin: AdminClient, userId: string) {
  const { data, error } = await admin.from("access_pass_orders").select(ORDER_FIELDS).eq("user_id", userId).maybeSingle();
  if (error) throw new Error("The Access Pass order could not be loaded.");
  return data ? data as unknown as OrderRow : null;
}

async function loadOrderById(admin: AdminClient, orderId: string) {
  const { data, error } = await admin.from("access_pass_orders").select(ORDER_FIELDS).eq("id", orderId).maybeSingle();
  if (error) throw new Error("The Access Pass order could not be loaded.");
  return data ? data as unknown as OrderRow : null;
}

async function loadClaimByUser(admin: AdminClient, userId: string) {
  const { data, error } = await admin.from("nft_issuance_records").select(CLAIM_FIELDS)
    .eq("user_id", userId).eq("issuance_type", ISSUANCE_TYPE).maybeSingle();
  if (error) throw new Error("The Access Pass issuance record could not be loaded.");
  return data ? data as unknown as ClaimRow : null;
}

async function loadClaimById(admin: AdminClient, claimId: string) {
  const { data, error } = await admin.from("nft_issuance_records").select(CLAIM_FIELDS)
    .eq("id", claimId).eq("issuance_type", ISSUANCE_TYPE).maybeSingle();
  if (error) throw new Error("The Access Pass issuance record could not be loaded.");
  return data ? data as unknown as ClaimRow : null;
}

async function syncOrderFromClaim(admin: AdminClient, claim: ClaimRow, status = claim.lifecycle_step) {
  await admin.from("access_pass_orders").update({ status, error_message: claim.error_message })
    .eq("issuance_record_id", claim.id);
}

function publicOrder(order: OrderRow | null, claim: ClaimRow | null) {
  return {
    order: order ? { ...order, serial: order.serial_number ? serialLabel(order.serial_number) : null } : null,
    claim: claim ? { ...claim, serial: serialLabel(claim.serial_number) } : null,
  };
}

async function createPaymentPayload(input: {
  customerWallet: string;
  accessTier: string;
  orderId?: string;
}) {
  const destination = accessWallet();
  const memo = `OTT Access Pass Alpha | ${PRICE_XRP} XRP | order ${input.orderId ?? "legacy"} | receive ${input.customerWallet} | utility only | SourceTag ${SOURCE_TAG}`;
  return createPayload({
    txjson: {
      TransactionType: "Payment",
      Destination: destination,
      Amount: PRICE_DROPS,
      SourceTag: SOURCE_TAG,
      Memos: [{ Memo: { MemoType: textToHex("OTT_ACCESS_PASS_PAYMENT"), MemoData: textToHex(memo) } }],
    },
    options: {
      submit: true,
      force_network: selectedNetwork(),
      return_url: {
        app: input.orderId
          ? `${publicUrl()}/?access_payment_return=1&order=${input.orderId}&payload={id}`
          : `${publicUrl()}/access-payment.html?access_payment_return=1&payload={id}`,
        web: input.orderId
          ? `${publicUrl()}/?access_payment_return=1&order=${input.orderId}&payload={id}`
          : `${publicUrl()}/access-payment.html?access_payment_return=1&payload={id}`,
      },
    },
    custom_meta: {
      identifier: input.orderId ? `ott-access-order-${input.orderId}` : "ott-access-pass-payment",
      instruction: `Pay ${PRICE_XRP} XRP for OTT Access Pass Alpha. Utility access only.`,
      blob: {
        mode: "ott-access-pass-payment",
        orderId: input.orderId ?? null,
        sourceTag: SOURCE_TAG,
        amountDrops: PRICE_DROPS,
        destinationWallet: destination,
        customerWallet: input.customerWallet,
        accessTier: input.accessTier,
      },
    },
  });
}

async function handleMetadata(req: RequestLike, res: ResponseLike) {
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Use GET." });
  const serial = parseSerial(queryValue(req.query?.serial));
  if (!serial) return res.status(400).json({ ok: false, error: "Valid serial 001–500 required." });
  const admin = makeAdmin();
  const { data, error } = await admin.from("nft_issuance_records")
    .select("serial_number").eq("issuance_type", ISSUANCE_TYPE).eq("serial_number", serial).maybeSingle();
  if (error) return res.status(500).json({ ok: false, error: "Metadata could not be loaded." });
  if (!data) return res.status(404).json({ ok: false, error: "Access Pass not found." });
  const label = serialLabel(serial);
  const image = process.env.OTT_ACCESS_PASS_IMAGE_URI?.trim()
    || `${publicUrl()}/api/access-payment?scope=image&serial=${String(serial).padStart(3, "0")}`;
  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400");
  return res.status(200).json({
    name: `OTT Access Pass: Alpha ${label}`,
    description: "Utility access pass for XRPL OnTheTrack Terminal services. No investment, yield, profit or resale value promise.",
    image,
    external_url: `${publicUrl()}/?access_pass=${String(serial).padStart(3, "0")}`,
    issuer: "XRPL OnTheTrack Terminal",
    collection: "OTT Access Pass: Alpha",
    edition: label,
    attributes: [
      { trait_type: "Access Pass serial", value: label },
      { trait_type: "Series", value: "Alpha" },
      { trait_type: "Utility", value: "OTT Terminal access" },
      { trait_type: "SourceTag", value: String(SOURCE_TAG) },
      { trait_type: "Legal position", value: "Access utility only" },
    ],
  });
}

async function handleImage(req: RequestLike, res: ResponseLike) {
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Use GET." });
  const serial = parseSerial(queryValue(req.query?.serial));
  if (!serial) return res.status(400).json({ ok: false, error: "Valid serial 001–500 required." });
  const label = serialLabel(serial);
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#38a9ff"/><stop offset=".52" stop-color="#8d4bd8"/><stop offset="1" stop-color="#f0447c"/></linearGradient><radialGradient id="r"><stop stop-color="#552a83"/><stop offset="1" stop-color="#050817"/></radialGradient></defs>
<rect width="1200" height="1200" rx="72" fill="url(#r)"/><rect x="46" y="46" width="1108" height="1108" rx="54" fill="none" stroke="url(#g)" stroke-width="12"/>
<path d="M600 155 950 770H250Z" fill="none" stroke="url(#g)" stroke-width="22"/><path d="M600 210 690 365 510 365Z" fill="url(#g)" stroke="#fff" stroke-opacity=".7" stroke-width="8"/>
<text x="600" y="520" fill="#fff" font-family="Arial" font-size="84" font-weight="700" text-anchor="middle">{ XRP }</text>
<text x="600" y="690" fill="#fff" font-family="Arial" font-size="70" font-weight="800" text-anchor="middle">XRPL OTT TERMINAL</text>
<text x="600" y="820" fill="#e2e8f0" font-family="Arial" font-size="48" font-weight="700" letter-spacing="5" text-anchor="middle">ACCESS PASS: ALPHA</text>
<text x="600" y="955" fill="#fff" font-family="Arial" font-size="92" font-weight="800" letter-spacing="8" text-anchor="middle">${label}</text>
<text x="600" y="1080" fill="#94a3b8" font-family="Arial" font-size="28" letter-spacing="9" text-anchor="middle">WE GOT YOUR BACK</text></svg>`;
  res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400");
  return res.status(200).send(svg);
}

async function handleStatus(req: RequestLike, res: ResponseLike) {
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Use GET." });
  const admin = makeAdmin();
  const user = await authenticate(admin, req);
  const order = await loadOrderByUser(admin, user.id);
  const claim = await loadClaimByUser(admin, user.id);
  return res.status(200).json({ ok: true, ...publicOrder(order, claim), priceXrp: PRICE_XRP });
}

async function handleOrder(req: RequestLike, res: ResponseLike) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Use POST." });
  const admin = makeAdmin();
  const user = await authenticate(admin, req);
  const action = stringValue(req.body?.action);
  const existing = await loadOrderByUser(admin, user.id);

  if (action === "create-payment") {
    const customerWallet = stringValue(req.body?.customerWallet);
    const accessTier = (stringValue(req.body?.accessTier) || "Alpha").slice(0, 80);
    if (!isAddress(customerWallet)) return res.status(400).json({ ok: false, error: "A valid XRPL receiving wallet is required." });
    if (existing && ["paid", "reserved", "mint-signing", "minted", "offer-signing", "offer-created", "accept-signing", "issued"].includes(existing.status)) {
      const claim = await loadClaimByUser(admin, user.id);
      return res.status(200).json({ ok: true, alreadyPaid: true, ...publicOrder(existing, claim), priceXrp: PRICE_XRP });
    }

    let order: OrderRow;
    if (existing) {
      const { data, error } = await admin.from("access_pass_orders").update({
        customer_wallet: customerWallet,
        access_tier: accessTier,
        destination_wallet: accessWallet(),
        status: "created",
        payment_payload_uuid: null,
        payment_tx_hash: null,
        payer_account: null,
        payment_validated_at: null,
        error_message: null,
      }).eq("id", existing.id).select(ORDER_FIELDS).single();
      if (error) throw new Error("The Access Pass order could not be reset.");
      order = data as unknown as OrderRow;
    } else {
      const { data, error } = await admin.from("access_pass_orders").insert({
        user_id: user.id,
        customer_wallet: customerWallet,
        access_tier: accessTier,
        price_drops: Number(PRICE_DROPS),
        destination_wallet: accessWallet(),
        source_tag: SOURCE_TAG,
        status: "created",
      }).select(ORDER_FIELDS).single();
      if (error) throw new Error("The Access Pass order could not be created. Run the Access Pass Supabase migration first.");
      order = data as unknown as OrderRow;
    }

    const payload = await createPaymentPayload({ customerWallet, accessTier, orderId: order.id });
    const { data, error } = await admin.from("access_pass_orders").update({
      status: "payment-signing",
      payment_payload_uuid: payload.uuid,
      error_message: null,
    }).eq("id", order.id).eq("user_id", user.id).select(ORDER_FIELDS).single();
    if (error) throw new Error("The Xaman payment request could not be attached to the order.");
    return res.status(200).json({ ok: true, stage: "payment-signing", order: data, payload, priceXrp: PRICE_XRP });
  }

  if (action === "verify-payment") {
    if (!existing?.payment_payload_uuid || !isUuid(existing.payment_payload_uuid)) {
      return res.status(409).json({ ok: false, error: "No valid Access Pass payment request exists." });
    }
    const requestedUuid = stringValue(req.body?.uuid);
    if (requestedUuid && requestedUuid !== existing.payment_payload_uuid) {
      return res.status(409).json({ ok: false, error: "Payment payload does not belong to this order." });
    }
    const payload = await getPayload(existing.payment_payload_uuid);
    if (!payload.meta?.resolved) {
      await admin.from("access_pass_orders").update({ status: "payment-pending" }).eq("id", existing.id);
      return res.status(202).json({ ok: true, pending: true, stage: "payment-signing", order: existing, payload });
    }
    if (!payload.meta.signed) {
      await admin.from("access_pass_orders").update({ status: "created", payment_payload_uuid: null, error_message: "Payment request was declined or expired." }).eq("id", existing.id);
      return res.status(409).json({ ok: false, error: "Payment request was declined or expired." });
    }

    const txid = stringValue(payload.response?.txid).toUpperCase();
    const payer = stringValue(payload.response?.account);
    if (!isHash(txid) || !isAddress(payer)) return res.status(409).json({ ok: false, error: "Xaman payment signer or hash is invalid." });
    if (payer !== existing.customer_wallet) return res.status(409).json({ ok: false, error: "The paying wallet must match the receiving wallet for this Access Pass." });

    const result = await getTransaction(txid);
    if (!result.validated) {
      await admin.from("access_pass_orders").update({ status: "payment-pending" }).eq("id", existing.id);
      return res.status(202).json({ ok: true, pending: true, stage: "ledger-validation", order: existing, payload });
    }
    assertSuccess(result);
    const tx = transaction(result);
    if (
      stringValue(tx.TransactionType) !== "Payment"
      || stringValue(tx.Account) !== existing.customer_wallet
      || stringValue(tx.Destination) !== existing.destination_wallet
      || stringValue(tx.Amount) !== PRICE_DROPS
      || Number(tx.SourceTag) !== SOURCE_TAG
    ) {
      return res.status(409).json({ ok: false, error: "Validated XRPL payment does not match the Access Pass order." });
    }

    const now = new Date().toISOString();
    const { error: paidError } = await admin.from("access_pass_orders").update({
      status: "paid",
      payment_tx_hash: txid,
      payer_account: payer,
      payment_validated_at: now,
      error_message: null,
    }).eq("id", existing.id).eq("user_id", user.id);
    if (paidError) throw new Error("The validated payment could not be stored.");

    const { error: reserveError } = await admin.rpc("reserve_ott_access_pass", { p_order_id: existing.id });
    if (reserveError) throw new Error(reserveError.message || "An Access Pass serial could not be reserved.");
    const order = await loadOrderById(admin, existing.id);
    const claim = await loadClaimByUser(admin, user.id);
    return res.status(200).json({ ok: true, stage: "reserved", ...publicOrder(order, claim), payload, xrpl: { txid, payer }, priceXrp: PRICE_XRP });
  }

  return res.status(400).json({ ok: false, error: "Unknown Access Pass order action." });
}

async function handleIssuer(req: RequestLike, res: ResponseLike) {
  if (req.method !== "GET" && req.method !== "POST") return res.status(405).json({ ok: false, error: "Use GET or POST." });
  const admin = makeAdmin();
  const user = await authenticate(admin, req);
  if (!adminAllowed(user.id, user.email ?? "")) return res.status(403).json({ ok: false, error: "This OTT account is not authorized for Access Pass issuance." });

  if (req.method === "GET") {
    const { data, error } = await admin.from("nft_issuance_records").select(CLAIM_FIELDS)
      .eq("issuance_type", ISSUANCE_TYPE).order("created_at", { ascending: true });
    if (error) return res.status(500).json({ ok: false, error: "Access Pass issuer queue could not be loaded." });
    return res.status(200).json({ ok: true, queue: data ?? [] });
  }

  const action = stringValue(req.body?.action);
  const claimId = stringValue(req.body?.claimId);
  if (!claimId) return res.status(400).json({ ok: false, error: "claimId is required." });
  const claim = await loadClaimById(admin, claimId);
  if (!claim) return res.status(404).json({ ok: false, error: "Access Pass claim not found." });
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
        Memos: [{ Memo: { MemoType: textToHex("OTT_ACCESS_PASS_ALPHA"), MemoData: textToHex(`OTT Access Pass Alpha ${label}`) } }],
      },
      options: {
        submit: true,
        force_network: selectedNetwork(),
        return_url: {
          app: `${publicUrl()}/?founder=1&accessissuer=1&access_mint_return=1&payload={id}`,
          web: `${publicUrl()}/?founder=1&accessissuer=1&access_mint_return=1&payload={id}`,
        },
      },
      custom_meta: { identifier: `ott-access-mint-${claim.id}`, instruction: `Mint Access Pass ${label}`, blob: { claimId: claim.id, serial: label, stage: "mint", sourceTag: SOURCE_TAG } },
    });
    const { data, error } = await admin.from("nft_issuance_records").update({
      status: "pending", lifecycle_step: "mint-signing", metadata_uri: uri,
      mint_payload_uuid: payload.uuid, error_message: null,
    }).eq("id", claim.id).select(CLAIM_FIELDS).single();
    if (error) throw error;
    await syncOrderFromClaim(admin, data as unknown as ClaimRow, "mint-signing");
    return res.status(200).json({ ok: true, stage: "mint-signing", claim: data, payload });
  }

  if (action === "verify-mint") {
    if (!claim.mint_payload_uuid) return res.status(409).json({ ok: false, error: "No mint payload exists." });
    const payload = await getPayload(claim.mint_payload_uuid);
    if (!payload.meta?.resolved) return res.status(202).json({ ok: true, pending: true, stage: "mint-signing", claim, payload });
    if (!payload.meta.signed) {
      await admin.from("nft_issuance_records").update({ status: "failed", lifecycle_step: "failed", error_message: "Issuer declined the mint payload." }).eq("id", claim.id);
      await admin.from("access_pass_orders").update({ status: "failed", error_message: "Issuer declined the mint payload." }).eq("issuance_record_id", claim.id);
      return res.status(409).json({ ok: false, error: "Issuer declined the mint payload." });
    }
    const txid = stringValue(payload.response?.txid).toUpperCase();
    if (stringValue(payload.response?.account) !== issuer || !isHash(txid)) return res.status(409).json({ ok: false, error: "Mint signer or hash mismatch." });
    const result = await getTransaction(txid);
    assertSuccess(result);
    const tx = transaction(result);
    const nftokenId = metadataHash(metadata(result), "nftoken_id");
    if (stringValue(tx.TransactionType) !== "NFTokenMint" || stringValue(tx.Account) !== issuer || Number(tx.NFTokenTaxon) !== collectionTaxon() || Number(tx.Flags ?? 0) !== collectionFlags() || stringValue(tx.URI).toUpperCase() !== textToHex(uri)) {
      return res.status(409).json({ ok: false, error: "Validated mint does not match this Access Pass." });
    }
    if (!nftokenId) return res.status(502).json({ ok: false, error: "Validated response did not include nftoken_id." });
    const { data, error } = await admin.from("nft_issuance_records").update({
      status: "pending", lifecycle_step: "minted", metadata_uri: uri,
      mint_transaction_hash: txid, nftoken_id: nftokenId, minted_at: new Date().toISOString(), error_message: null,
    }).eq("id", claim.id).select(CLAIM_FIELDS).single();
    if (error) throw error;
    await syncOrderFromClaim(admin, data as unknown as ClaimRow, "minted");
    return res.status(200).json({ ok: true, stage: "minted", claim: data, payload, xrpl: { txid, nftokenId } });
  }

  if (action === "create-offer") {
    if (claim.lifecycle_step !== "minted" || !claim.nftoken_id) return res.status(409).json({ ok: false, error: "Access Pass must be validated as minted first." });
    const payload = await createPayload({
      txjson: {
        TransactionType: "NFTokenCreateOffer",
        Account: issuer,
        NFTokenID: claim.nftoken_id,
        Amount: "0",
        Destination: claim.wallet_address,
        Flags: 1,
        Memos: [{ Memo: { MemoType: textToHex("OTT_ACCESS_PASS_TRANSFER"), MemoData: textToHex(`Free targeted transfer for ${label}`) } }],
      },
      options: {
        submit: true,
        force_network: selectedNetwork(),
        return_url: {
          app: `${publicUrl()}/?founder=1&accessissuer=1&access_offer_return=1&payload={id}`,
          web: `${publicUrl()}/?founder=1&accessissuer=1&access_offer_return=1&payload={id}`,
        },
      },
      custom_meta: { identifier: `ott-access-offer-${claim.id}`, instruction: `Create free targeted offer for ${label}`, blob: { claimId: claim.id, serial: label, stage: "offer" } },
    });
    const { data, error } = await admin.from("nft_issuance_records").update({
      status: "pending", lifecycle_step: "offer-signing", offer_payload_uuid: payload.uuid, error_message: null,
    }).eq("id", claim.id).select(CLAIM_FIELDS).single();
    if (error) throw error;
    await syncOrderFromClaim(admin, data as unknown as ClaimRow, "offer-signing");
    return res.status(200).json({ ok: true, stage: "offer-signing", claim: data, payload });
  }

  if (action === "verify-offer") {
    if (!claim.offer_payload_uuid || !claim.nftoken_id) return res.status(409).json({ ok: false, error: "No transfer offer exists." });
    const payload = await getPayload(claim.offer_payload_uuid);
    if (!payload.meta?.resolved) return res.status(202).json({ ok: true, pending: true, stage: "offer-signing", claim, payload });
    if (!payload.meta.signed) return res.status(409).json({ ok: false, error: "Issuer declined the transfer offer." });
    const txid = stringValue(payload.response?.txid).toUpperCase();
    if (stringValue(payload.response?.account) !== issuer || !isHash(txid)) return res.status(409).json({ ok: false, error: "Offer signer or hash mismatch." });
    const result = await getTransaction(txid);
    assertSuccess(result);
    const tx = transaction(result);
    const offerId = metadataHash(metadata(result), "offer_id");
    if (stringValue(tx.TransactionType) !== "NFTokenCreateOffer" || stringValue(tx.Account) !== issuer || stringValue(tx.NFTokenID).toUpperCase() !== claim.nftoken_id.toUpperCase() || stringValue(tx.Destination) !== claim.wallet_address || stringValue(tx.Amount) !== "0" || Number(tx.Flags ?? 0) !== 1) {
      return res.status(409).json({ ok: false, error: "Validated offer does not match this Access Pass." });
    }
    if (!offerId) return res.status(502).json({ ok: false, error: "Validated response did not include offer_id." });
    const { data, error } = await admin.from("nft_issuance_records").update({
      status: "pending", lifecycle_step: "offer-created", offer_transaction_hash: txid,
      transfer_offer_id: offerId, offer_created_at: new Date().toISOString(), error_message: null,
    }).eq("id", claim.id).select(CLAIM_FIELDS).single();
    if (error) throw error;
    await syncOrderFromClaim(admin, data as unknown as ClaimRow, "offer-created");
    return res.status(200).json({ ok: true, stage: "offer-created", claim: data, payload, xrpl: { txid, offerId } });
  }

  return res.status(400).json({ ok: false, error: "Unknown Access Pass issuer action." });
}

async function handleTransfer(req: RequestLike, res: ResponseLike) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Use POST." });
  const admin = makeAdmin();
  const user = await authenticate(admin, req);
  const claim = await loadClaimByUser(admin, user.id);
  if (!claim) return res.status(404).json({ ok: false, error: "No Access Pass claim exists." });
  const wallet = claim.wallet_address ?? "";
  const nftokenId = (claim.nftoken_id ?? "").toUpperCase();
  const offerId = (claim.transfer_offer_id ?? "").toUpperCase();
  if (!isAddress(wallet) || !isHash(nftokenId) || !isHash(offerId)) return res.status(409).json({ ok: false, error: "Founder transfer offer is not ready." });
  const action = stringValue(req.body?.action);
  const label = serialLabel(claim.serial_number);

  if (action === "create-accept") {
    if (!["offer-created", "accept-signing"].includes(claim.lifecycle_step)) return res.status(409).json({ ok: false, error: `Acceptance cannot start from ${claim.lifecycle_step}.` });
    const payload = await createPayload({
      txjson: {
        TransactionType: "NFTokenAcceptOffer",
        Account: wallet,
        NFTokenSellOffer: offerId,
        Memos: [{ Memo: { MemoType: textToHex("OTT_ACCESS_PASS_ACCEPT"), MemoData: textToHex(`Accept Access Pass ${label}`) } }],
      },
      options: {
        submit: true,
        force_network: selectedNetwork(),
        return_url: {
          app: `${publicUrl()}/?access_accept_return=1&payload={id}`,
          web: `${publicUrl()}/?access_accept_return=1&payload={id}`,
        },
      },
      custom_meta: { identifier: `ott-access-accept-${claim.id}`, instruction: `Accept Access Pass ${label}`, blob: { claimId: claim.id, serial: label, stage: "accept" } },
    });
    const { data, error } = await admin.from("nft_issuance_records").update({
      status: "pending", lifecycle_step: "accept-signing", accept_payload_uuid: payload.uuid, error_message: null,
    }).eq("id", claim.id).eq("user_id", user.id).select(CLAIM_FIELDS).single();
    if (error) throw error;
    await syncOrderFromClaim(admin, data as unknown as ClaimRow, "accept-signing");
    return res.status(200).json({ ok: true, stage: "accept-signing", claim: data, payload });
  }

  if (action === "verify-accept") {
    if (!claim.accept_payload_uuid || !isUuid(claim.accept_payload_uuid)) return res.status(409).json({ ok: false, error: "No valid acceptance payload exists." });
    const payload = await getPayload(claim.accept_payload_uuid);
    if (!payload.meta?.resolved) return res.status(202).json({ ok: true, pending: true, stage: "accept-signing", claim, payload });
    if (!payload.meta.signed) {
      await admin.from("nft_issuance_records").update({ status: "pending", lifecycle_step: "offer-created", accept_payload_uuid: null, error_message: "Customer declined Access Pass acceptance." }).eq("id", claim.id);
      await admin.from("access_pass_orders").update({ status: "offer-created", error_message: "Customer declined Access Pass acceptance." }).eq("issuance_record_id", claim.id);
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
    const { data, error } = await admin.from("nft_issuance_records").update({
      status: "issued", lifecycle_step: "issued", transaction_hash: txid,
      accept_transaction_hash: txid, issued_at: now, error_message: null,
    }).eq("id", claim.id).eq("user_id", user.id).select(CLAIM_FIELDS).single();
    if (error) throw error;
    await syncOrderFromClaim(admin, data as unknown as ClaimRow, "issued");
    return res.status(200).json({ ok: true, stage: "issued", claim: data, payload, xrpl: { txid, nftokenId, owner: wallet } });
  }

  return res.status(400).json({ ok: false, error: "Unknown Access Pass transfer action." });
}

async function handleLegacy(req: RequestLike, res: ResponseLike) {
  const action = stringValue(req.body?.action);
  if (action === "xaman.createAccessPaymentPayload") {
    const customerWallet = stringValue(req.body?.customerWallet);
    const accessTier = (stringValue(req.body?.accessTier) || "Alpha").slice(0, 80);
    if (!isAddress(customerWallet)) return res.status(400).json({ ok: false, error: "Invalid customerWallet." });
    const payload = await createPaymentPayload({ customerWallet, accessTier });
    return res.status(200).json({
      ok: true,
      mode: "legacy-access-payment",
      sourceTag: SOURCE_TAG,
      payment: { priceXrp: PRICE_XRP, amountDrops: PRICE_DROPS, destinationWallet: accessWallet(), customerWallet, accessTier },
      payload,
    });
  }
  if (action === "xaman.verifyAccessPaymentPayload") {
    const uuid = stringValue(req.body?.uuid);
    if (!isUuid(uuid)) return res.status(400).json({ ok: false, error: "Missing or invalid uuid." });
    const payload = await getPayload(uuid);
    const txid = stringValue(payload.response?.txid).toUpperCase();
    let validated = false;
    if (payload.meta?.signed && isHash(txid)) {
      const result = await getTransaction(txid);
      validated = Boolean(result.validated && stringValue(metadata(result).TransactionResult) === "tesSUCCESS");
    }
    return res.status(200).json({
      ok: true,
      mode: "legacy-access-payment-verification",
      verified: {
        signed: Boolean(payload.meta?.signed),
        resolved: Boolean(payload.meta?.resolved),
        validated,
        payerAccount: payload.response?.account ?? null,
        txid: payload.response?.txid ?? null,
      },
      payload,
    });
  }
  return res.status(400).json({ ok: false, error: "Unknown access payment API action." });
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  const scope = queryValue(req.query?.scope).toLowerCase();
  try {
    if (scope === "metadata") return await handleMetadata(req, res);
    if (scope === "image") return await handleImage(req, res);
    if (scope === "status") return await handleStatus(req, res);
    if (scope === "order") return await handleOrder(req, res);
    if (scope === "issuer") return await handleIssuer(req, res);
    if (scope === "transfer") return await handleTransfer(req, res);
    if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Use POST." });
    return await handleLegacy(req, res);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Access Pass error.";
    if (message === "AUTH_REQUIRED") return res.status(401).json({ ok: false, error: "Sign in first." });
    if (message === "AUTH_INVALID") return res.status(401).json({ ok: false, error: "OTT account session could not be verified." });
    return res.status(500).json({ ok: false, error: message });
  }
}
