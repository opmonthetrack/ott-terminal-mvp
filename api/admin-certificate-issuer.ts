import { createClient } from "@supabase/supabase-js";

const XAMAN_API_URL = "https://xumm.app/api/v1/platform/payload";
const ISSUANCE_TYPE = "foundation-certificate";
const SOURCE_TAG = 2606170002;

type RequestLike = {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
  body?: Record<string, unknown>;
};

type ResponseLike = {
  status: (code: number) => {
    json: (body: unknown) => void;
  };
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

type XamanPayloadResult = {
  uuid?: string;
  meta?: { signed?: boolean; resolved?: boolean; cancelled?: boolean; expired?: boolean };
  response?: { account?: string; txid?: string };
  next?: { always?: string; no_push_msg_received?: string };
  refs?: { qr_png?: string; qr_matrix?: string; websocket_status?: string };
  [key: string]: unknown;
};

type XrplTxResult = {
  validated?: boolean;
  tx_json?: Record<string, unknown>;
  tx?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  hash?: string;
  ledger_index?: number;
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

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function textToHex(value: string) {
  return Array.from(new TextEncoder().encode(value))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

function isValidXrplAddress(value: string) {
  return /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(value);
}

function isValidHash(value: string) {
  return /^[A-Fa-f0-9]{64}$/.test(value);
}

function isValidUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function normalizePublicUrl(value: string | undefined) {
  const clean = value?.trim().replace(/\/$/, "") ?? "";
  if (!clean) return "https://ott-terminal-mvp.vercel.app";
  return /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
}

function parseUInt32(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 4_294_967_295
    ? parsed
    : fallback;
}

function parseMintFlags(value: string | undefined) {
  const parsed = Number(value ?? "0");
  const allowedMask = 1 | 2 | 8 | 16;
  if (!Number.isInteger(parsed) || parsed < 0 || (parsed & ~allowedMask) !== 0) {
    throw new Error("OTT_CERTIFICATE_NFT_FLAGS contains unsupported NFT flags.");
  }
  return parsed;
}

function formatSerial(serial: number) {
  return `#${String(serial).padStart(4, "0")}`;
}

function getXamanHeaders() {
  const apiKey = process.env.XAMAN_API_KEY?.trim();
  const apiSecret = process.env.XAMAN_API_SECRET?.trim();
  if (!apiKey || !apiSecret) {
    throw new Error("Xaman issuer signing is not configured on the server.");
  }
  return {
    "Content-Type": "application/json",
    "X-API-Key": apiKey,
    "X-API-Secret": apiSecret,
  };
}

function getNetwork() {
  const network = process.env.OTT_CERTIFICATE_XRPL_NETWORK?.trim().toUpperCase();
  if (network !== "MAINNET" && network !== "TESTNET") {
    throw new Error("Set OTT_CERTIFICATE_XRPL_NETWORK to MAINNET or TESTNET before creating issuer payloads.");
  }
  return network;
}

function getIssuerWallet() {
  const issuerWallet = process.env.OTT_CERTIFICATE_ISSUER_WALLET?.trim() ?? "";
  if (!isValidXrplAddress(issuerWallet)) {
    throw new Error("OTT_CERTIFICATE_ISSUER_WALLET is missing or invalid.");
  }
  return issuerWallet;
}

function getAdminLists() {
  const emails = new Set(
    (process.env.OTT_MINT_ADMIN_EMAILS ?? "")
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
  );
  const userIds = new Set(
    (process.env.OTT_MINT_ADMIN_USER_IDS ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
  return { emails, userIds };
}

async function createXamanPayload(body: Record<string, unknown>) {
  const response = await fetch(XAMAN_API_URL, {
    method: "POST",
    headers: getXamanHeaders(),
    body: JSON.stringify(body),
  });
  const payload = (await response.json()) as XamanPayloadResult;
  if (!response.ok) {
    throw new Error(`Xaman payload creation failed: ${JSON.stringify(payload).slice(0, 500)}`);
  }
  if (!payload.uuid || !isValidUuid(payload.uuid)) {
    throw new Error("Xaman did not return a valid payload UUID.");
  }
  return payload;
}

async function getXamanPayload(uuid: string) {
  const response = await fetch(`${XAMAN_API_URL}/${uuid}`, {
    method: "GET",
    headers: getXamanHeaders(),
  });
  const payload = (await response.json()) as XamanPayloadResult;
  if (!response.ok) {
    throw new Error(`Xaman payload lookup failed: ${JSON.stringify(payload).slice(0, 500)}`);
  }
  return payload;
}

async function fetchXrplTransaction(txHash: string) {
  const rpcUrl = process.env.XRPL_RPC_URL?.trim();
  if (!rpcUrl) {
    throw new Error("XRPL_RPC_URL must be configured for the selected certificate network.");
  }
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      method: "tx",
      params: [{ transaction: txHash, binary: false }],
    }),
  });
  const data = (await response.json()) as { result?: XrplTxResult; error?: string };
  if (!response.ok || data.error || data.result?.error || !data.result) {
    throw new Error("XRPL transaction lookup failed or the transaction is not available yet.");
  }
  return data.result;
}

function readTx(result: XrplTxResult) {
  return result.tx_json ?? result.tx ?? {};
}

function readMeta(result: XrplTxResult) {
  return result.meta ?? {};
}

function getTransactionResult(meta: Record<string, unknown>) {
  return getString(meta.TransactionResult);
}

function getMetaHash(meta: Record<string, unknown>, field: "nftoken_id" | "offer_id") {
  const value = getString(meta[field]);
  return isValidHash(value) ? value.toUpperCase() : "";
}

function assertValidatedSuccess(result: XrplTxResult) {
  const meta = readMeta(result);
  if (!result.validated) throw new Error("The XRPL transaction is not validated yet.");
  if (getTransactionResult(meta) !== "tesSUCCESS") {
    throw new Error(`The XRPL transaction did not succeed (${getTransactionResult(meta) || "unknown"}).`);
  }
}

function certificateSelect() {
  return [
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
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed. Use GET or POST." });
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL?.trim();
    const serviceRoleKey = (
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
    )?.trim();
    const token = getBearerToken(req);

    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(503).json({ ok: false, error: "Trusted certificate storage is not configured." });
    }
    if (!token) {
      return res.status(401).json({ ok: false, error: "Sign in with the authorized founder account." });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const { data: userData, error: userError } = await admin.auth.getUser(token);
    if (userError || !userData.user) {
      return res.status(401).json({ ok: false, error: "The founder account session could not be verified." });
    }

    const { emails, userIds } = getAdminLists();
    const email = userData.user.email?.trim().toLowerCase() ?? "";
    if (!userIds.has(userData.user.id) && (!email || !emails.has(email))) {
      return res.status(403).json({ ok: false, error: "This OTT account is not authorized for certificate issuance." });
    }

    if (req.method === "GET") {
      const { data, error } = await admin
        .from("nft_issuance_records")
        .select(certificateSelect())
        .eq("issuance_type", ISSUANCE_TYPE)
        .order("created_at", { ascending: true });
      if (error) {
        return res.status(500).json({ ok: false, error: "The certificate queue could not be loaded." });
      }
      return res.status(200).json({ ok: true, queue: data ?? [] });
    }

    const action = getString(req.body?.action);
    const claimId = getString(req.body?.claimId);
    if (!claimId) {
      return res.status(400).json({ ok: false, error: "claimId is required." });
    }

    const { data: claimData, error: claimError } = await admin
      .from("nft_issuance_records")
      .select(certificateSelect())
      .eq("id", claimId)
      .eq("issuance_type", ISSUANCE_TYPE)
      .maybeSingle();
    if (claimError) {
      return res.status(500).json({ ok: false, error: "The certificate claim could not be loaded." });
    }
    if (!claimData) {
      return res.status(404).json({ ok: false, error: "Certificate claim not found." });
    }

    const claim = claimData as CertificateRow;
    if (!claim.wallet_address || !isValidXrplAddress(claim.wallet_address)) {
      return res.status(409).json({ ok: false, error: "The claim does not have a valid receiving wallet." });
    }

    const issuerWallet = getIssuerWallet();
    const network = getNetwork();
    const appUrl = normalizePublicUrl(
      process.env.OTT_PUBLIC_APP_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL,
    );
    const serialText = String(claim.serial_number).padStart(4, "0");
    const serialLabel = formatSerial(claim.serial_number);
    const metadataUri = `${appUrl}/api/academy-certificate-metadata?serial=${serialText}`;
    if (new TextEncoder().encode(metadataUri).length > 256) {
      return res.status(500).json({ ok: false, error: "The certificate metadata URI exceeds the XRPL 256-byte limit." });
    }

    if (action === "create-mint") {
      if (!["reserved", "failed", "mint-signing"].includes(claim.lifecycle_step)) {
        return res.status(409).json({ ok: false, error: `Mint cannot start from lifecycle step ${claim.lifecycle_step}.`, claim });
      }

      const taxon = parseUInt32(process.env.OTT_CERTIFICATE_NFT_TAXON, SOURCE_TAG);
      const flags = parseMintFlags(process.env.OTT_CERTIFICATE_NFT_FLAGS);
      const payload = await createXamanPayload({
        txjson: {
          TransactionType: "NFTokenMint",
          Account: issuerWallet,
          NFTokenTaxon: taxon,
          Flags: flags,
          URI: textToHex(metadataUri),
          Memos: [
            {
              Memo: {
                MemoType: textToHex("OTT_FOUNDATION_CERTIFICATE"),
                MemoData: textToHex(`OTT XRPL Foundation Certificate ${serialLabel}`),
              },
            },
          ],
        },
        options: {
          submit: true,
          force_network: network,
          return_url: {
            app: `${appUrl}/?founder=1&certificate_mint_return=1&payload={id}`,
            web: `${appUrl}/?founder=1&certificate_mint_return=1&payload={id}`,
          },
        },
        custom_meta: {
          identifier: `ott-foundation-mint-${claim.id}`,
          instruction: `Mint ${serialLabel} to the OTT issuer account`,
          blob: { claimId: claim.id, serial: serialLabel, stage: "mint", sourceTag: SOURCE_TAG },
        },
      });

      const { data, error } = await admin
        .from("nft_issuance_records")
        .update({
          status: "pending",
          lifecycle_step: "mint-signing",
          metadata_uri: metadataUri,
          mint_payload_uuid: payload.uuid,
          error_message: null,
        })
        .eq("id", claim.id)
        .select(certificateSelect())
        .single();
      if (error) throw error;
      return res.status(200).json({ ok: true, stage: "mint-signing", claim: data, payload });
    }

    if (action === "verify-mint") {
      if (!claim.mint_payload_uuid) {
        return res.status(409).json({ ok: false, error: "No mint payload has been created for this claim." });
      }
      const payload = await getXamanPayload(claim.mint_payload_uuid);
      if (!payload.meta?.resolved) {
        return res.status(202).json({ ok: true, pending: true, stage: "mint-signing", claim, payload });
      }
      if (!payload.meta.signed) {
        await admin.from("nft_issuance_records").update({ status: "failed", lifecycle_step: "failed", error_message: "Issuer declined the mint payload." }).eq("id", claim.id);
        return res.status(409).json({ ok: false, error: "Issuer declined the mint payload." });
      }

      const txid = getString(payload.response?.txid).toUpperCase();
      const signer = getString(payload.response?.account);
      if (signer !== issuerWallet || !isValidHash(txid)) {
        return res.status(409).json({ ok: false, error: "The mint payload signer or transaction hash does not match the configured issuer." });
      }

      const result = await fetchXrplTransaction(txid);
      assertValidatedSuccess(result);
      const tx = readTx(result);
      const meta = readMeta(result);
      const taxon = parseUInt32(process.env.OTT_CERTIFICATE_NFT_TAXON, SOURCE_TAG);
      const flags = parseMintFlags(process.env.OTT_CERTIFICATE_NFT_FLAGS);
      const nftokenId = getMetaHash(meta, "nftoken_id");
      if (
        getString(tx.TransactionType) !== "NFTokenMint" ||
        getString(tx.Account) !== issuerWallet ||
        Number(tx.NFTokenTaxon) !== taxon ||
        Number(tx.Flags ?? 0) !== flags ||
        getString(tx.URI).toUpperCase() !== textToHex(metadataUri)
      ) {
        return res.status(409).json({ ok: false, error: "The validated mint transaction does not match this certificate claim." });
      }
      if (!nftokenId) {
        return res.status(502).json({ ok: false, error: "The validated XRPL response did not include nftoken_id." });
      }

      const { data, error } = await admin
        .from("nft_issuance_records")
        .update({
          status: "pending",
          lifecycle_step: "minted",
          metadata_uri: metadataUri,
          mint_transaction_hash: txid,
          nftoken_id: nftokenId,
          minted_at: new Date().toISOString(),
          error_message: null,
        })
        .eq("id", claim.id)
        .select(certificateSelect())
        .single();
      if (error) throw error;
      return res.status(200).json({ ok: true, stage: "minted", claim: data, payload, xrpl: { txid, nftokenId } });
    }

    if (action === "create-offer") {
      if (claim.lifecycle_step !== "minted" || !claim.nftoken_id) {
        return res.status(409).json({ ok: false, error: "The certificate must be validated as minted before creating the transfer offer." });
      }

      const payload = await createXamanPayload({
        txjson: {
          TransactionType: "NFTokenCreateOffer",
          Account: issuerWallet,
          NFTokenID: claim.nftoken_id,
          Amount: "0",
          Destination: claim.wallet_address,
          Flags: 1,
          Memos: [
            {
              Memo: {
                MemoType: textToHex("OTT_CERTIFICATE_TRANSFER"),
                MemoData: textToHex(`Free targeted transfer for ${serialLabel}`),
              },
            },
          ],
        },
        options: {
          submit: true,
          force_network: network,
          return_url: {
            app: `${appUrl}/?founder=1&certificate_offer_return=1&payload={id}`,
            web: `${appUrl}/?founder=1&certificate_offer_return=1&payload={id}`,
          },
        },
        custom_meta: {
          identifier: `ott-foundation-offer-${claim.id}`,
          instruction: `Create the free targeted transfer offer for ${serialLabel}`,
          blob: { claimId: claim.id, serial: serialLabel, stage: "offer", sourceTag: SOURCE_TAG },
        },
      });

      const { data, error } = await admin
        .from("nft_issuance_records")
        .update({
          status: "pending",
          lifecycle_step: "offer-signing",
          offer_payload_uuid: payload.uuid,
          error_message: null,
        })
        .eq("id", claim.id)
        .select(certificateSelect())
        .single();
      if (error) throw error;
      return res.status(200).json({ ok: true, stage: "offer-signing", claim: data, payload });
    }

    if (action === "verify-offer") {
      if (!claim.offer_payload_uuid || !claim.nftoken_id) {
        return res.status(409).json({ ok: false, error: "No transfer-offer payload exists for this claim." });
      }
      const payload = await getXamanPayload(claim.offer_payload_uuid);
      if (!payload.meta?.resolved) {
        return res.status(202).json({ ok: true, pending: true, stage: "offer-signing", claim, payload });
      }
      if (!payload.meta.signed) {
        await admin.from("nft_issuance_records").update({ status: "failed", lifecycle_step: "failed", error_message: "Issuer declined the transfer-offer payload." }).eq("id", claim.id);
        return res.status(409).json({ ok: false, error: "Issuer declined the transfer-offer payload." });
      }

      const txid = getString(payload.response?.txid).toUpperCase();
      const signer = getString(payload.response?.account);
      if (signer !== issuerWallet || !isValidHash(txid)) {
        return res.status(409).json({ ok: false, error: "The offer payload signer or transaction hash does not match the configured issuer." });
      }

      const result = await fetchXrplTransaction(txid);
      assertValidatedSuccess(result);
      const tx = readTx(result);
      const meta = readMeta(result);
      const offerId = getMetaHash(meta, "offer_id");
      if (
        getString(tx.TransactionType) !== "NFTokenCreateOffer" ||
        getString(tx.Account) !== issuerWallet ||
        getString(tx.NFTokenID).toUpperCase() !== claim.nftoken_id.toUpperCase() ||
        getString(tx.Destination) !== claim.wallet_address ||
        getString(tx.Amount) !== "0" ||
        Number(tx.Flags ?? 0) !== 1
      ) {
        return res.status(409).json({ ok: false, error: "The validated transfer offer does not match this certificate claim." });
      }
      if (!offerId) {
        return res.status(502).json({ ok: false, error: "The validated XRPL response did not include offer_id." });
      }

      const { data, error } = await admin
        .from("nft_issuance_records")
        .update({
          status: "pending",
          lifecycle_step: "offer-created",
          offer_transaction_hash: txid,
          transfer_offer_id: offerId,
          offer_created_at: new Date().toISOString(),
          error_message: null,
        })
        .eq("id", claim.id)
        .select(certificateSelect())
        .single();
      if (error) throw error;
      return res.status(200).json({ ok: true, stage: "offer-created", claim: data, payload, xrpl: { txid, offerId } });
    }

    return res.status(400).json({
      ok: false,
      error: "Unknown action. Use create-mint, verify-mint, create-offer or verify-offer.",
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown certificate issuer error.",
    });
  }
}
