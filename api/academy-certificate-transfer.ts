import { createClient } from "@supabase/supabase-js";

const XAMAN_API_URL = "https://xumm.app/api/v1/platform/payload";
const ISSUANCE_TYPE = "foundation-certificate";

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

function getNetwork() {
  const network = process.env.OTT_CERTIFICATE_XRPL_NETWORK?.trim().toUpperCase();
  if (network !== "MAINNET" && network !== "TESTNET") {
    throw new Error("Set OTT_CERTIFICATE_XRPL_NETWORK to MAINNET or TESTNET before accepting certificates.");
  }
  return network;
}

function getXamanHeaders() {
  const apiKey = process.env.XAMAN_API_KEY?.trim();
  const apiSecret = process.env.XAMAN_API_SECRET?.trim();
  if (!apiKey || !apiSecret) {
    throw new Error("Xaman certificate transfer is not configured on the server.");
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

function getRpcUrl() {
  const rpcUrl = process.env.XRPL_RPC_URL?.trim();
  if (!rpcUrl) {
    throw new Error("XRPL_RPC_URL must be configured for the selected certificate network.");
  }
  return rpcUrl;
}

async function fetchXrplTransaction(txHash: string) {
  const response = await fetch(getRpcUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ method: "tx", params: [{ transaction: txHash, binary: false }] }),
  });
  const data = (await response.json()) as { result?: XrplTxResult; error?: string };
  if (!response.ok || data.error || data.result?.error || !data.result) {
    throw new Error("XRPL transaction lookup failed or the transaction is not available yet.");
  }
  return data.result;
}

async function accountOwnsNft(account: string, nftokenId: string) {
  let marker: unknown = undefined;
  for (let page = 0; page < 20; page += 1) {
    const params: Record<string, unknown> = { account, ledger_index: "validated", limit: 400 };
    if (marker !== undefined) params.marker = marker;
    const response = await fetch(getRpcUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method: "account_nfts", params: [params] }),
    });
    const data = (await response.json()) as {
      result?: { account_nfts?: Array<Record<string, unknown>>; marker?: unknown; error?: string };
      error?: string;
    };
    if (!response.ok || data.error || data.result?.error || !data.result) {
      throw new Error("The receiving wallet NFT ownership could not be verified.");
    }
    const found = (data.result.account_nfts ?? []).some(
      (item) => getString(item.NFTokenID).toUpperCase() === nftokenId.toUpperCase(),
    );
    if (found) return true;
    if (data.result.marker === undefined) return false;
    marker = data.result.marker;
  }
  return false;
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

function getMetaNftId(meta: Record<string, unknown>) {
  const value = getString(meta.nftoken_id);
  return isValidHash(value) ? value.toUpperCase() : "";
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed. Use POST." });
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL?.trim();
    const serviceRoleKey = (
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
    )?.trim();
    const token = getBearerToken(req);
    const action = getString(req.body?.action);

    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(503).json({ ok: false, error: "Trusted certificate storage is not configured." });
    }
    if (!token) {
      return res.status(401).json({ ok: false, error: "Sign in before accepting your certificate NFT." });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const { data: userData, error: userError } = await admin.auth.getUser(token);
    if (userError || !userData.user) {
      return res.status(401).json({ ok: false, error: "The OTT account session could not be verified." });
    }

    const select = "id,status,lifecycle_step,serial_number,wallet_address,metadata_uri,nftoken_id,transfer_offer_id,accept_payload_uuid,accept_transaction_hash,transaction_hash,error_message,created_at,updated_at";
    const { data: claimData, error: claimError } = await admin
      .from("nft_issuance_records")
      .select(select)
      .eq("user_id", userData.user.id)
      .eq("issuance_type", ISSUANCE_TYPE)
      .maybeSingle();
    if (claimError) {
      return res.status(500).json({ ok: false, error: "Your certificate claim could not be loaded." });
    }
    if (!claimData) {
      return res.status(404).json({ ok: false, error: "No Foundation Certificate claim exists for this account." });
    }

    const claim = claimData as Record<string, unknown>;
    const walletAddress = getString(claim.wallet_address);
    const nftokenId = getString(claim.nftoken_id).toUpperCase();
    const transferOfferId = getString(claim.transfer_offer_id).toUpperCase();
    const lifecycleStep = getString(claim.lifecycle_step);
    const serialLabel = `#${String(Number(claim.serial_number)).padStart(4, "0")}`;

    if (!isValidXrplAddress(walletAddress) || !isValidHash(nftokenId) || !isValidHash(transferOfferId)) {
      return res.status(409).json({ ok: false, error: "The issuer has not completed a valid targeted transfer offer yet." });
    }

    if (action === "create-accept") {
      if (lifecycleStep !== "offer-created" && lifecycleStep !== "accept-signing") {
        return res.status(409).json({ ok: false, error: `Certificate acceptance cannot start from ${lifecycleStep}.` });
      }

      const appUrl = normalizePublicUrl(
        process.env.OTT_PUBLIC_APP_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL,
      );
      const payload = await createXamanPayload({
        txjson: {
          TransactionType: "NFTokenAcceptOffer",
          Account: walletAddress,
          NFTokenSellOffer: transferOfferId,
          Memos: [
            {
              Memo: {
                MemoType: textToHex("OTT_CERTIFICATE_ACCEPT"),
                MemoData: textToHex(`Accept ${serialLabel} into the verified receiving wallet`),
              },
            },
          ],
        },
        options: {
          submit: true,
          force_network: getNetwork(),
          return_url: {
            app: `${appUrl}/?certificate_accept_return=1&payload={id}`,
            web: `${appUrl}/?certificate_accept_return=1&payload={id}`,
          },
        },
        custom_meta: {
          identifier: `ott-foundation-accept-${getString(claim.id)}`,
          instruction: `Accept OTT XRPL Foundation Certificate ${serialLabel}`,
          blob: { claimId: claim.id, serial: serialLabel, stage: "accept" },
        },
      });

      const { data, error } = await admin
        .from("nft_issuance_records")
        .update({
          status: "pending",
          lifecycle_step: "accept-signing",
          accept_payload_uuid: payload.uuid,
          error_message: null,
        })
        .eq("id", claim.id)
        .eq("user_id", userData.user.id)
        .select(select)
        .single();
      if (error) throw error;
      return res.status(200).json({ ok: true, stage: "accept-signing", claim: data, payload });
    }

    if (action === "verify-accept") {
      const payloadUuid = getString(claim.accept_payload_uuid);
      if (!isValidUuid(payloadUuid)) {
        return res.status(409).json({ ok: false, error: "No valid certificate acceptance payload exists." });
      }

      const payload = await getXamanPayload(payloadUuid);
      if (!payload.meta?.resolved) {
        return res.status(202).json({ ok: true, pending: true, stage: "accept-signing", claim, payload });
      }
      if (!payload.meta.signed) {
        await admin
          .from("nft_issuance_records")
          .update({ status: "pending", lifecycle_step: "offer-created", accept_payload_uuid: null, error_message: "The learner declined the certificate acceptance payload." })
          .eq("id", claim.id)
          .eq("user_id", userData.user.id);
        return res.status(409).json({ ok: false, error: "The certificate acceptance was declined. The transfer offer remains available." });
      }

      const signer = getString(payload.response?.account);
      const txid = getString(payload.response?.txid).toUpperCase();
      if (signer !== walletAddress || !isValidHash(txid)) {
        return res.status(409).json({ ok: false, error: "The accepting wallet or transaction hash does not match the certificate claim." });
      }

      const result = await fetchXrplTransaction(txid);
      const tx = readTx(result);
      const meta = readMeta(result);
      const transactionResult = getTransactionResult(meta);
      if (!result.validated) {
        return res.status(202).json({ ok: true, pending: true, stage: "ledger-validation", claim, payload });
      }
      if (transactionResult !== "tesSUCCESS") {
        return res.status(409).json({ ok: false, error: `The acceptance transaction did not succeed (${transactionResult || "unknown"}).` });
      }
      if (
        getString(tx.TransactionType) !== "NFTokenAcceptOffer" ||
        getString(tx.Account) !== walletAddress ||
        getString(tx.NFTokenSellOffer).toUpperCase() !== transferOfferId
      ) {
        return res.status(409).json({ ok: false, error: "The validated acceptance transaction does not match this certificate offer." });
      }

      const metadataNftId = getMetaNftId(meta);
      if (metadataNftId && metadataNftId !== nftokenId) {
        return res.status(409).json({ ok: false, error: "The NFT changed by the acceptance transaction is not this certificate." });
      }

      const ownsNft = await accountOwnsNft(walletAddress, nftokenId);
      if (!ownsNft) {
        return res.status(202).json({ ok: true, pending: true, stage: "ownership-confirmation", claim, payload });
      }

      const now = new Date().toISOString();
      const { data, error } = await admin
        .from("nft_issuance_records")
        .update({
          status: "issued",
          lifecycle_step: "issued",
          transaction_hash: txid,
          accept_transaction_hash: txid,
          issued_at: now,
          error_message: null,
        })
        .eq("id", claim.id)
        .eq("user_id", userData.user.id)
        .select(select)
        .single();
      if (error) throw error;
      return res.status(200).json({ ok: true, stage: "issued", claim: data, payload, xrpl: { txid, nftokenId, owner: walletAddress } });
    }

    return res.status(400).json({ ok: false, error: "Unknown action. Use create-accept or verify-accept." });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown certificate transfer error.",
    });
  }
}
