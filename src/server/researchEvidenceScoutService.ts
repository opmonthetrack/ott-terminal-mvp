import { GoogleGenAI } from "@google/genai";
import { createClient, type User } from "@supabase/supabase-js";

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

type SourceKind =
  | "official-legislation"
  | "regulator"
  | "company-register"
  | "project-official"
  | "audit-provider"
  | "market-provider"
  | "news"
  | "social"
  | "other";

type AuthorityLevel = "official" | "primary" | "secondary" | "unverified";
type ReviewStatus = "candidate" | "verified" | "rejected" | "conflict";

type GroundingChunk = {
  web?: {
    uri?: string;
    title?: string;
  };
};

type GroundedResponse = {
  text?: string;
  candidates?: Array<{
    groundingMetadata?: {
      groundingChunks?: GroundingChunk[];
      webSearchQueries?: string[];
    };
  }>;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SOURCE_KINDS = new Set<SourceKind>([
  "official-legislation",
  "regulator",
  "company-register",
  "project-official",
  "audit-provider",
  "market-provider",
  "news",
  "social",
  "other",
]);
const AUTHORITY_LEVELS = new Set<AuthorityLevel>(["official", "primary", "secondary", "unverified"]);
const REVIEW_STATUSES = new Set<ReviewStatus>(["candidate", "verified", "rejected", "conflict"]);
const SEARCH_FOCUSES = new Set([
  "legal-jurisdiction",
  "company-registration",
  "regulatory-warnings",
  "issuer-identity",
  "whitepaper-product",
  "roadmap-execution",
  "team-transparency",
  "market-data",
  "general",
]);

function queryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

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

function makeAdmin() {
  const url = process.env.SUPABASE_URL?.trim() || process.env.VITE_SUPABASE_URL?.trim() || "";
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY)?.trim() || "";
  if (!url || !key) throw new Error("Trusted Supabase server storage is not configured.");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

type AdminClient = ReturnType<typeof makeAdmin>;

function adminAllowed(userId: string, email: string) {
  const ids = new Set((process.env.OTT_MINT_ADMIN_USER_IDS ?? "").split(",").map((item) => item.trim()).filter(Boolean));
  const emails = new Set((process.env.OTT_MINT_ADMIN_EMAILS ?? "").split(",").map((item) => item.trim().toLowerCase()).filter(Boolean));
  return ids.has(userId) || Boolean(email && emails.has(email.toLowerCase()));
}

async function founderContext(req: RequestLike) {
  const admin = makeAdmin();
  const token = bearer(req);
  if (!token) throw new Error("AUTH_REQUIRED");
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) throw new Error("AUTH_INVALID");
  if (!adminAllowed(data.user.id, data.user.email ?? "")) throw new Error("FOUNDER_REQUIRED");
  return { admin, user: data.user };
}

function setupError(error: unknown) {
  const message = error instanceof Error
    ? error.message
    : typeof error === "object" && error !== null && "message" in error
      ? String((error as { message?: unknown }).message ?? "")
      : String(error ?? "");
  return /token_research_sources|source_ids|schema cache|does not exist/i.test(message);
}

function canonicalizeUrl(raw: string) {
  const url = new URL(raw);
  url.hash = "";
  ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"]
    .forEach((key) => url.searchParams.delete(key));
  url.hostname = url.hostname.toLowerCase();
  if (url.pathname !== "/") url.pathname = url.pathname.replace(/\/+$/, "");
  return url.toString();
}

function sourceSuggestion(rawUrl: string, title: string) {
  let domain = "";
  try {
    domain = new URL(rawUrl).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return { domain: "invalid", sourceKind: "other" as SourceKind, authorityLevel: "unverified" as AuthorityLevel };
  }

  const titleText = title.toLowerCase();
  const officialGovernment = /(?:\.gov(?:\.[a-z]{2})?|\.gouv\.[a-z]{2}|\.go\.[a-z]{2}|\.europa\.eu|eur-lex\.europa\.eu|overheid\.nl|esma\.europa\.eu|eba\.europa\.eu|ecb\.europa\.eu|afm\.nl|dnb\.nl)$/.test(domain);
  const registerHint = /register|registry|companies house|chamber|kvk|handelsregister|business register/.test(titleText);
  const regulatorHint = /regulator|authority|commission|supervision|warning|enforcement|licen[cs]e|mica/.test(titleText);
  const legislationHint = /law|regulation|directive|legislation|act|verordening|wetgeving/.test(titleText);

  if (officialGovernment && legislationHint) {
    return { domain, sourceKind: "official-legislation" as SourceKind, authorityLevel: "official" as AuthorityLevel };
  }
  if (officialGovernment && registerHint) {
    return { domain, sourceKind: "company-register" as SourceKind, authorityLevel: "official" as AuthorityLevel };
  }
  if (officialGovernment || regulatorHint) {
    return { domain, sourceKind: "regulator" as SourceKind, authorityLevel: officialGovernment ? "official" as AuthorityLevel : "unverified" as AuthorityLevel };
  }
  return { domain, sourceKind: "other" as SourceKind, authorityLevel: "unverified" as AuthorityLevel };
}

function buildPrompt(request: Record<string, unknown>, focus: string, instructions: string) {
  const today = new Date().toISOString().slice(0, 10);
  return `You are the evidence-scout layer for OTT Token Research. Today is ${today}.

Research case:
- Token/project: ${String(request.token_name ?? "")}
- XRPL currency: ${String(request.currency_code ?? "")}
- XRPL issuer: ${String(request.issuer_address ?? "")}
- Claimed website: ${String(request.official_website ?? "unknown")}
- Claimed country: ${String(request.claimed_country ?? "unknown")}
- Claimed legal entity: ${String(request.claimed_legal_entity ?? "unknown")}
- Claimed registration number: ${String(request.claimed_registration_number ?? "unknown")}
- Search focus: ${focus}
- Founder instructions: ${instructions || "none"}

Search the current web, prioritizing in this order:
1. official legislation and government publications;
2. official financial regulators and warning/authorization registers;
3. official company or foundation registers;
4. the project's own official primary documents;
5. independent audits or reputable secondary sources only when primary sources are unavailable.

Rules:
- Do not calculate or recommend an OTT score.
- Do not say a token is compliant, licensed, safe, legitimate, a security, a utility token, or approved unless an official source explicitly supports that exact statement.
- Separate verified facts, project claims, contradictions, missing evidence and inferences.
- State dates and jurisdictions.
- A regulator register entry or whitepaper filing is not automatically an endorsement.
- Return a concise founder briefing with sections: Verified facts, Project claims, Contradictions, Missing evidence, Suggested next checks.
- Ground every web-derived statement with the search citations provided by the tool.`;
}

async function runGroundedSearch(request: Record<string, unknown>, focus: string, instructions: string) {
  const apiKey = process.env.GEMINI_API_KEY?.trim() || "";
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured for evidence scouting.");
  const model = process.env.GEMINI_RESEARCH_MODEL?.trim() || process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
  const ai = new GoogleGenAI({ apiKey });
  const raw = await ai.models.generateContent({
    model,
    contents: buildPrompt(request, focus, instructions),
    config: {
      temperature: 0.1,
      tools: [{ googleSearch: {} }],
    },
  });
  const response = raw as unknown as GroundedResponse;
  const candidate = response.candidates?.[0];
  const chunks = candidate?.groundingMetadata?.groundingChunks ?? [];
  const unique = new Map<string, {
    url: string;
    canonicalUrl: string;
    title: string;
    domain: string;
    suggestedSourceKind: SourceKind;
    suggestedAuthorityLevel: AuthorityLevel;
  }>();

  for (const chunk of chunks) {
    const url = stringValue(chunk.web?.uri);
    if (!url) continue;
    try {
      const canonicalUrl = canonicalizeUrl(url);
      const title = stringValue(chunk.web?.title) || canonicalUrl;
      const suggestion = sourceSuggestion(canonicalUrl, title);
      unique.set(canonicalUrl, {
        url,
        canonicalUrl,
        title,
        domain: suggestion.domain,
        suggestedSourceKind: suggestion.sourceKind,
        suggestedAuthorityLevel: suggestion.authorityLevel,
      });
    } catch {
      // Ignore malformed search URLs rather than weakening the entire result.
    }
  }

  return {
    model,
    briefing: stringValue(response.text),
    searchQueries: candidate?.groundingMetadata?.webSearchQueries ?? [],
    sources: [...unique.values()],
  };
}

async function loadSources(admin: AdminClient, requestId: string) {
  const { data, error } = await admin
    .from("token_research_sources")
    .select("*")
    .eq("request_id", requestId)
    .order("checked_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export default async function researchEvidenceScoutHandler(req: RequestLike, res: ResponseLike) {
  let admin: AdminClient;
  let founder: User;
  try {
    ({ admin, user: founder } = await founderContext(req));
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return res.status(message === "FOUNDER_REQUIRED" ? 403 : message.startsWith("AUTH_") ? 401 : 503).json({
      ok: false,
      error: message === "FOUNDER_REQUIRED" ? "This OTT account is not authorized for evidence scouting." : "Founder account verification failed.",
    });
  }

  try {
    if (req.method === "GET") {
      const requestId = queryValue(req.query?.requestId);
      if (!UUID.test(requestId)) return res.status(400).json({ ok: false, error: "Invalid research request ID." });
      return res.status(200).json({ ok: true, sources: await loadSources(admin, requestId) });
    }

    if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Use GET or POST." });
    const action = stringValue(req.body?.action);

    if (action === "search") {
      const requestId = stringValue(req.body?.requestId);
      const focus = stringValue(req.body?.focus) || "general";
      const instructions = stringValue(req.body?.instructions).slice(0, 2000);
      if (!UUID.test(requestId)) return res.status(400).json({ ok: false, error: "Invalid research request ID." });
      if (!SEARCH_FOCUSES.has(focus)) return res.status(400).json({ ok: false, error: "Invalid evidence-scout focus." });
      const { data: request, error } = await admin
        .from("token_research_requests")
        .select("*")
        .eq("id", requestId)
        .single();
      if (error) throw error;
      const result = await runGroundedSearch(request as unknown as Record<string, unknown>, focus, instructions);
      return res.status(200).json({ ok: true, scout: result });
    }

    if (action === "save") {
      const requestId = stringValue(req.body?.requestId);
      const rawUrl = stringValue(req.body?.url);
      const title = stringValue(req.body?.title).slice(0, 500);
      const summary = stringValue(req.body?.summary).slice(0, 8000);
      const focus = stringValue(req.body?.focus) || "general";
      const sourceKind = stringValue(req.body?.sourceKind) as SourceKind;
      const authorityLevel = stringValue(req.body?.authorityLevel) as AuthorityLevel;
      const reviewStatus = stringValue(req.body?.reviewStatus) as ReviewStatus;
      if (!UUID.test(requestId)) return res.status(400).json({ ok: false, error: "Invalid research request ID." });
      if (!SOURCE_KINDS.has(sourceKind)) return res.status(400).json({ ok: false, error: "Invalid source kind." });
      if (!AUTHORITY_LEVELS.has(authorityLevel)) return res.status(400).json({ ok: false, error: "Invalid authority level." });
      if (!REVIEW_STATUSES.has(reviewStatus)) return res.status(400).json({ ok: false, error: "Invalid review status." });
      let canonicalUrl: string;
      try {
        canonicalUrl = canonicalizeUrl(rawUrl);
      } catch {
        return res.status(400).json({ ok: false, error: "Invalid source URL." });
      }
      const domain = new URL(canonicalUrl).hostname.toLowerCase().replace(/^www\./, "");
      const reviewedAt = reviewStatus === "candidate" ? null : new Date().toISOString();
      const { data, error } = await admin
        .from("token_research_sources")
        .upsert({
          request_id: requestId,
          url: rawUrl,
          canonical_url: canonicalUrl,
          domain,
          title,
          source_kind: sourceKind,
          authority_level: authorityLevel,
          review_status: reviewStatus,
          search_focus: focus,
          summary,
          checked_at: new Date().toISOString(),
          created_by: founder.id,
          reviewed_by: reviewedAt ? founder.id : null,
          reviewed_at: reviewedAt,
        }, { onConflict: "request_id,canonical_url" })
        .select("*")
        .single();
      if (error) throw error;
      return res.status(200).json({ ok: true, source: data });
    }

    if (action === "update") {
      const sourceId = stringValue(req.body?.sourceId);
      const sourceKind = stringValue(req.body?.sourceKind) as SourceKind;
      const authorityLevel = stringValue(req.body?.authorityLevel) as AuthorityLevel;
      const reviewStatus = stringValue(req.body?.reviewStatus) as ReviewStatus;
      const summary = stringValue(req.body?.summary).slice(0, 8000);
      if (!UUID.test(sourceId)) return res.status(400).json({ ok: false, error: "Invalid source ID." });
      if (!SOURCE_KINDS.has(sourceKind) || !AUTHORITY_LEVELS.has(authorityLevel) || !REVIEW_STATUSES.has(reviewStatus)) {
        return res.status(400).json({ ok: false, error: "Invalid source review fields." });
      }
      const reviewedAt = reviewStatus === "candidate" ? null : new Date().toISOString();
      const { data, error } = await admin
        .from("token_research_sources")
        .update({
          source_kind: sourceKind,
          authority_level: authorityLevel,
          review_status: reviewStatus,
          summary,
          checked_at: new Date().toISOString(),
          reviewed_by: reviewedAt ? founder.id : null,
          reviewed_at: reviewedAt,
        })
        .eq("id", sourceId)
        .select("*")
        .single();
      if (error) throw error;
      return res.status(200).json({ ok: true, source: data });
    }

    if (action === "delete") {
      const sourceId = stringValue(req.body?.sourceId);
      if (!UUID.test(sourceId)) return res.status(400).json({ ok: false, error: "Invalid source ID." });
      const { error } = await admin.from("token_research_sources").delete().eq("id", sourceId);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ ok: false, error: "Unknown evidence-scout action." });
  } catch (error) {
    if (setupError(error)) return res.status(200).json({ ok: true, setupRequired: true, sources: [] });
    return res.status(500).json({ ok: false, error: error instanceof Error ? error.message : "Evidence scout action failed." });
  }
}
