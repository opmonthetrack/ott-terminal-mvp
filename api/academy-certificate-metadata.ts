import { createClient } from "@supabase/supabase-js";

const ISSUANCE_TYPE = "foundation-certificate";

interface RequestLike {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
}

interface ResponseLike {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => {
    json: (body: unknown) => void;
  };
}

function getQueryString(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function parseSerial(value: string) {
  const normalized = value.trim().replace(/^#/, "");
  if (!/^\d{1,4}$/.test(normalized)) return null;
  const serial = Number(normalized);
  return Number.isInteger(serial) && serial >= 1 && serial <= 5000 ? serial : null;
}

function normalizePublicUrl(value: string | undefined) {
  const clean = value?.trim().replace(/\/$/, "") ?? "";
  if (!clean) return "https://ott-terminal-mvp.vercel.app";
  return /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
}

function formatSerial(serial: number) {
  return `#${String(serial).padStart(4, "0")}`;
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method not allowed. Use GET." });
  }

  const serial = parseSerial(getQueryString(req.query?.serial));
  if (!serial) {
    return res.status(400).json({ ok: false, error: "A valid serial between 0001 and 5000 is required." });
  }

  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const serviceRoleKey = (
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
  )?.trim();

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(503).json({ ok: false, error: "Certificate metadata storage is not configured." });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { data, error } = await admin
    .from("nft_issuance_records")
    .select("serial_number,wallet_address,qualification_score,qualification_course_count,created_at")
    .eq("issuance_type", ISSUANCE_TYPE)
    .eq("serial_number", serial)
    .maybeSingle();

  if (error) {
    return res.status(500).json({ ok: false, error: "Certificate metadata could not be loaded." });
  }
  if (!data) {
    return res.status(404).json({ ok: false, error: "Certificate serial not found." });
  }

  const appUrl = normalizePublicUrl(
    process.env.OTT_PUBLIC_APP_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL,
  );
  const serialLabel = formatSerial(serial);
  const imageUrl = `${appUrl}/api/academy-certificate-image?serial=${String(serial).padStart(4, "0")}`;
  const externalUrl = `${appUrl}/?certificate=${String(serial).padStart(4, "0")}`;

  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400");
  return res.status(200).json({
    name: `OTT XRPL Foundation Certificate ${serialLabel}`,
    description:
      "Verified proof that the holder completed the OTT XRPL Foundation Academy requirements. This certificate is educational proof and does not represent an investment, financial return or ownership right.",
    image: imageUrl,
    external_url: externalUrl,
    issuer: "XRPL OnTheTrack Terminal",
    collection: "OTT XRPL Foundation Certificate",
    edition: serialLabel,
    attributes: [
      { trait_type: "Certificate serial", value: serialLabel },
      { trait_type: "Verified Academy score", value: Number(data.qualification_score ?? 0), display_type: "number" },
      { trait_type: "Verified lessons", value: Number(data.qualification_course_count ?? 0), display_type: "number" },
      { trait_type: "Receiving XRPL account", value: String(data.wallet_address ?? "") },
      { trait_type: "Program", value: "OTT XRPL Foundation Academy" },
      { trait_type: "SourceTag", value: "2606170002" },
    ],
  });
}
