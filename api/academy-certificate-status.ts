import { createClient } from "@supabase/supabase-js";

const ISSUANCE_TYPE = "foundation-certificate";

type RequestLike = {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
};

type ResponseLike = {
  status: (code: number) => {
    json: (body: unknown) => void;
  };
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

function formatSerial(serial: number) {
  return `#${String(serial).padStart(4, "0")}`;
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method not allowed. Use GET." });
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
      return res.status(401).json({ ok: false, error: "Sign in to view your certificate status." });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const { data: userData, error: userError } = await admin.auth.getUser(token);
    if (userError || !userData.user) {
      return res.status(401).json({ ok: false, error: "The OTT account session could not be verified." });
    }

    const { data, error } = await admin
      .from("nft_issuance_records")
      .select(
        "id,status,lifecycle_step,serial_number,wallet_address,qualification_score,qualification_course_count,metadata_uri,mint_transaction_hash,nftoken_id,offer_transaction_hash,transfer_offer_id,accept_payload_uuid,accept_transaction_hash,transaction_hash,error_message,minted_at,offer_created_at,issued_at,created_at,updated_at",
      )
      .eq("user_id", userData.user.id)
      .eq("issuance_type", ISSUANCE_TYPE)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ ok: false, error: "Certificate status could not be loaded." });
    }
    if (!data) {
      return res.status(200).json({ ok: true, claim: null });
    }

    return res.status(200).json({
      ok: true,
      claim: {
        ...data,
        serial: formatSerial(Number(data.serial_number)),
      },
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown certificate status error.",
    });
  }
}
