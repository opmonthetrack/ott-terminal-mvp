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
    send: (body: string) => void;
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

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
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
    return res.status(503).json({ ok: false, error: "Certificate image storage is not configured." });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { data, error } = await admin
    .from("nft_issuance_records")
    .select("serial_number,qualification_score,qualification_course_count")
    .eq("issuance_type", ISSUANCE_TYPE)
    .eq("serial_number", serial)
    .maybeSingle();

  if (error) {
    return res.status(500).json({ ok: false, error: "Certificate image data could not be loaded." });
  }
  if (!data) {
    return res.status(404).json({ ok: false, error: "Certificate serial not found." });
  }

  const serialLabel = escapeXml(formatSerial(serial));
  const score = Math.max(0, Math.min(100, Number(data.qualification_score ?? 0)));
  const lessons = Math.max(0, Number(data.qualification_course_count ?? 0));
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200" role="img" aria-label="OTT XRPL Foundation Certificate ${serialLabel}">
  <defs>
    <radialGradient id="halo" cx="50%" cy="42%" r="54%">
      <stop offset="0%" stop-color="#1d4ed8" stop-opacity="0.42"/>
      <stop offset="58%" stop-color="#0f172a" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#020617" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="line" x1="0" x2="1">
      <stop offset="0%" stop-color="#93c5fd" stop-opacity="0"/>
      <stop offset="50%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#93c5fd" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="1200" rx="72" fill="#020617"/>
  <circle cx="600" cy="480" r="420" fill="url(#halo)"/>
  <rect x="55" y="55" width="1090" height="1090" rx="54" fill="none" stroke="#334155" stroke-width="2"/>
  <rect x="82" y="82" width="1036" height="1036" rx="42" fill="none" stroke="#0f3b74" stroke-width="1"/>
  <path d="M600 210 L785 530 L415 530 Z" fill="none" stroke="#f8fafc" stroke-width="14" stroke-linejoin="round"/>
  <path d="M505 445 C555 390 645 390 695 445 C645 500 555 500 505 445 Z" fill="none" stroke="#93c5fd" stroke-width="9"/>
  <circle cx="600" cy="445" r="34" fill="#f8fafc"/>
  <path d="M240 640 H960" stroke="url(#line)" stroke-width="3"/>
  <text x="600" y="720" fill="#93c5fd" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700" letter-spacing="8" text-anchor="middle">XRPL ONTHETRACK TERMINAL</text>
  <text x="600" y="795" fill="#f8fafc" font-family="Arial, Helvetica, sans-serif" font-size="62" font-weight="700" text-anchor="middle">FOUNDATION CERTIFICATE</text>
  <text x="600" y="872" fill="#cbd5e1" font-family="Arial, Helvetica, sans-serif" font-size="30" text-anchor="middle">Verified Academy completion · ${lessons} lessons · ${score}%</text>
  <text x="600" y="1000" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="82" font-weight="700" letter-spacing="6" text-anchor="middle">${serialLabel}</text>
  <text x="600" y="1070" fill="#64748b" font-family="Arial, Helvetica, sans-serif" font-size="22" letter-spacing="4" text-anchor="middle">SOURCE TAG 2606170002</text>
</svg>`;

  res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400");
  return res.status(200).send(svg);
}
