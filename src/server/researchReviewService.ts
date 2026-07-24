import { createClient, type User } from "@supabase/supabase-js";
import {
  calculateOttResearchScore,
  OTT_RESEARCH_CATEGORIES,
  type OttEvidenceStatus,
  type OttResearchCategoryId,
  type OttResearchScoreInput,
} from "../lib/ottResearchScore";

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

type ScoreItemInput = {
  categoryId: OttResearchCategoryId;
  awardedPoints: number;
  evidenceStatus: OttEvidenceStatus;
  rationale: string;
  evidenceIds: string[];
  sourceIds: string[];
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const WATCHLIST_STATUSES = new Set(["research", "monitor", "documented", "caution"]);
const EVIDENCE_STATUSES = new Set<OttEvidenceStatus>([
  "verified", "partial", "unverified", "missing", "conflict",
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

function numberValue(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && UUID.test(item))
    : [];
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
  return /token_research_requests|token_research_score_items|token_research_watchlist|schema cache|does not exist/i.test(message);
}

function confidenceFromItems(items: ScoreItemInput[]) {
  const verified = items.filter((item) => item.evidenceStatus === "verified").length;
  const conflict = items.some((item) => item.evidenceStatus === "conflict");
  if (conflict) return "low";
  if (verified >= 7) return "high";
  if (verified >= 4) return "medium";
  if (verified >= 1) return "low";
  return "insufficient";
}

function parseScoreItems(value: unknown): ScoreItemInput[] {
  if (!Array.isArray(value)) throw new Error("Score items are required.");
  return OTT_RESEARCH_CATEGORIES.map((category) => {
    const raw = value.find((item) => (
      typeof item === "object"
      && item !== null
      && (item as { categoryId?: unknown }).categoryId === category.id
    )) as Record<string, unknown> | undefined;
    const awarded = Math.round(numberValue(raw?.awardedPoints) ?? 0);
    const status = stringValue(raw?.evidenceStatus) as OttEvidenceStatus;
    if (!EVIDENCE_STATUSES.has(status)) throw new Error(`Invalid evidence status for ${category.id}.`);
    if (awarded < 0 || awarded > category.maxPoints) {
      throw new Error(`${category.id} must be between 0 and ${category.maxPoints} points.`);
    }
    return {
      categoryId: category.id,
      awardedPoints: awarded,
      evidenceStatus: status,
      rationale: stringValue(raw?.rationale).slice(0, 5000),
      evidenceIds: [...new Set(stringArray(raw?.evidenceIds))],
      sourceIds: [...new Set(stringArray(raw?.sourceIds))],
    };
  });
}

async function describeUser(admin: AdminClient, userId: string) {
  const { data } = await admin.auth.admin.getUserById(userId);
  const user = data.user as User | null;
  return {
    id: userId,
    email: user?.email ?? null,
    name: user?.user_metadata?.display_name ?? user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? null,
  };
}

async function listQueue(admin: AdminClient) {
  const { data: requests, error } = await admin
    .from("token_research_requests")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(200);
  if (error) throw error;

  const requestRows = (requests ?? []) as unknown as Array<Record<string, unknown>>;
  const requestIds = requestRows.map((row) => String(row.id));
  const userIds = [...new Set(requestRows.map((row) => String(row.user_id)))];

  let evidenceRows: Array<Record<string, unknown>> = [];
  if (requestIds.length > 0) {
    const { data, error: evidenceError } = await admin
      .from("research_evidence")
      .select("id,token_request_id,evidence_kind,created_at")
      .in("token_request_id", requestIds);
    if (evidenceError) throw evidenceError;
    evidenceRows = (data ?? []) as unknown as Array<Record<string, unknown>>;
  }

  const users = await Promise.all(userIds.map((id) => describeUser(admin, id)));
  const userMap = new Map(users.map((user) => [user.id, user]));
  const evidenceCounts = new Map<string, number>();
  evidenceRows.forEach((row) => {
    const requestId = String(row.token_request_id ?? "");
    evidenceCounts.set(requestId, (evidenceCounts.get(requestId) ?? 0) + 1);
  });

  return requestRows.map((request) => ({
    ...request,
    requester: userMap.get(String(request.user_id)) ?? null,
    evidence_count: evidenceCounts.get(String(request.id)) ?? 0,
  }));
}

async function loadCase(admin: AdminClient, requestId: string) {
  const { data: request, error } = await admin
    .from("token_research_requests")
    .select("*")
    .eq("id", requestId)
    .single();
  if (error) throw error;

  const [{ data: evidence, error: evidenceError }, { data: scores, error: scoreError }, { data: watchlist, error: watchlistError }] = await Promise.all([
    admin.from("research_evidence").select("*").eq("token_request_id", requestId).order("created_at", { ascending: false }),
    admin.from("token_research_score_items").select("*").eq("request_id", requestId).order("category_id"),
    admin.from("token_research_watchlist").select("*").eq("research_request_id", requestId).maybeSingle(),
  ]);
  if (evidenceError) throw evidenceError;
  if (scoreError) throw scoreError;
  if (watchlistError) throw watchlistError;

  const requestRow = request as unknown as Record<string, unknown>;
  return {
    request: {
      ...requestRow,
      requester: await describeUser(admin, String(requestRow.user_id)),
    },
    evidence: evidence ?? [],
    scoreItems: scores ?? [],
    watchlist: watchlist ?? null,
  };
}

async function handleFounderReview(req: RequestLike, res: ResponseLike) {
  let admin: AdminClient;
  let founder: User;
  try {
    ({ admin, user: founder } = await founderContext(req));
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return res.status(message === "FOUNDER_REQUIRED" ? 403 : message.startsWith("AUTH_") ? 401 : 503).json({
      ok: false,
      error: message === "FOUNDER_REQUIRED" ? "This OTT account is not authorized for research review." : "Founder account verification failed.",
    });
  }

  try {
    if (req.method === "GET") {
      const requestId = queryValue(req.query?.requestId);
      if (requestId) {
        if (!UUID.test(requestId)) return res.status(400).json({ ok: false, error: "Invalid research request ID." });
        return res.status(200).json({ ok: true, case: await loadCase(admin, requestId) });
      }
      return res.status(200).json({ ok: true, queue: await listQueue(admin) });
    }

    if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Use GET or POST." });
    const action = stringValue(req.body?.action);

    if (action === "evidence-url") {
      const evidenceId = stringValue(req.body?.evidenceId);
      if (!UUID.test(evidenceId)) return res.status(400).json({ ok: false, error: "Invalid evidence ID." });
      const { data: evidence, error } = await admin
        .from("research_evidence")
        .select("id,storage_path,file_name")
        .eq("id", evidenceId)
        .single();
      if (error) throw error;
      const row = evidence as unknown as { storage_path: string; file_name: string };
      const { data, error: signedError } = await admin.storage
        .from("research-evidence")
        .createSignedUrl(row.storage_path, 60);
      if (signedError) throw signedError;
      return res.status(200).json({ ok: true, signedUrl: data.signedUrl, fileName: row.file_name });
    }

    if (action === "save-score") {
      const requestId = stringValue(req.body?.requestId);
      if (!UUID.test(requestId)) return res.status(400).json({ ok: false, error: "Invalid research request ID." });
      const items = parseScoreItems(req.body?.items);
      const conclusion = stringValue(req.body?.neutralConclusion).slice(0, 10000);
      const reviewNote = stringValue(req.body?.founderReviewNote).slice(0, 5000);
      const status = stringValue(req.body?.status) || "scored";
      if (!["triage", "needs-evidence", "in-review", "scored", "rejected"].includes(status)) {
        return res.status(400).json({ ok: false, error: "Invalid review status." });
      }

      const evidenceIds = [...new Set(items.flatMap((item) => item.evidenceIds))];
      const sourceIds = [...new Set(items.flatMap((item) => item.sourceIds))];
      if (evidenceIds.length > 0) {
        const { data, error } = await admin
          .from("research_evidence")
          .select("id,token_request_id")
          .in("id", evidenceIds);
        if (error) throw error;
        const invalid = (data ?? []).some((row) => String((row as Record<string, unknown>).token_request_id) !== requestId);
        if (invalid || (data ?? []).length !== evidenceIds.length) {
          return res.status(400).json({ ok: false, error: "One or more evidence files do not belong to this research case." });
        }
      }

      if (sourceIds.length > 0) {
        const { data, error } = await admin
          .from("token_research_sources")
          .select("id,request_id,review_status")
          .in("id", sourceIds);
        if (error) throw error;
        const rows = (data ?? []) as unknown as Array<Record<string, unknown>>;
        const invalid = rows.some((row) => (
          String(row.request_id) !== requestId
          || String(row.review_status) !== "verified"
        ));
        if (invalid || rows.length !== sourceIds.length) {
          return res.status(400).json({
            ok: false,
            error: "Every linked web source must belong to this case and have founder status verified.",
          });
        }
      }

      for (const item of items) {
        const evidenceCount = item.evidenceIds.length + item.sourceIds.length;
        if (item.awardedPoints > 0 && evidenceCount === 0) {
          return res.status(400).json({
            ok: false,
            error: `${item.categoryId} cannot receive points without linked evidence.`,
          });
        }
        if (item.evidenceStatus === "missing" && evidenceCount > 0) {
          return res.status(400).json({
            ok: false,
            error: `${item.categoryId} has linked evidence and cannot be marked missing.`,
          });
        }
        if (item.evidenceStatus !== "missing" && evidenceCount === 0) {
          return res.status(400).json({
            ok: false,
            error: `${item.categoryId} needs linked evidence for status ${item.evidenceStatus}.`,
          });
        }
        if ((item.awardedPoints > 0 || item.evidenceStatus !== "missing") && item.rationale.length < 20) {
          return res.status(400).json({
            ok: false,
            error: `${item.categoryId} needs a concrete rationale of at least 20 characters.`,
          });
        }
      }

      const scoreInputs: OttResearchScoreInput[] = items.map((item) => ({
        categoryId: item.categoryId,
        awardedPoints: item.awardedPoints,
        evidenceStatus: item.evidenceStatus,
        rationale: item.rationale,
        evidenceCount: item.evidenceIds.length + item.sourceIds.length,
      }));
      const result = calculateOttResearchScore(scoreInputs);
      const checkedAt = new Date().toISOString();

      const rows = items.map((item) => ({
        request_id: requestId,
        category_id: item.categoryId,
        max_points: OTT_RESEARCH_CATEGORIES.find((category) => category.id === item.categoryId)?.maxPoints ?? 0,
        awarded_points: item.awardedPoints,
        evidence_status: item.evidenceStatus,
        rationale: item.rationale,
        evidence_ids: item.evidenceIds,
        source_ids: item.sourceIds,
        checked_at: checkedAt,
        checked_by: founder.id,
      }));
      const { error: scoreError } = await admin
        .from("token_research_score_items")
        .upsert(rows, { onConflict: "request_id,category_id" });
      if (scoreError) throw scoreError;

      const { data: request, error: requestError } = await admin
        .from("token_research_requests")
        .update({
          status,
          raw_score: result.rawScore,
          final_score: result.finalScore,
          score_cap: result.scoreCap,
          score_cap_reason: result.capReasons.join(" ") || null,
          evidence_confidence: confidenceFromItems(items),
          neutral_conclusion: conclusion || null,
          founder_review_note: reviewNote || null,
          reviewed_by: founder.id,
          reviewed_at: checkedAt,
        })
        .eq("id", requestId)
        .select("*")
        .single();
      if (requestError) throw requestError;

      return res.status(200).json({ ok: true, request, scoreResult: result });
    }

    if (action === "publish-watchlist") {
      const requestId = stringValue(req.body?.requestId);
      const watchlistStatus = stringValue(req.body?.watchlistStatus);
      const rationale = stringValue(req.body?.neutralRationale).slice(0, 5000);
      const evidenceSummary = stringValue(req.body?.evidenceSummary).slice(0, 5000);
      const displayOrder = Math.max(0, Math.min(10000, Math.round(numberValue(req.body?.displayOrder) ?? 100)));
      if (!UUID.test(requestId)) return res.status(400).json({ ok: false, error: "Invalid research request ID." });
      if (!WATCHLIST_STATUSES.has(watchlistStatus)) return res.status(400).json({ ok: false, error: "Invalid watchlist status." });
      if (rationale.length < 20) return res.status(400).json({ ok: false, error: "A neutral public rationale of at least 20 characters is required." });

      const { data: request, error } = await admin
        .from("token_research_requests")
        .select("*")
        .eq("id", requestId)
        .single();
      if (error) throw error;
      const row = request as unknown as Record<string, unknown>;
      const finalScore = numberValue(row.final_score);
      if (finalScore === null) return res.status(400).json({ ok: false, error: "Save a founder research score before publishing." });
      if (watchlistStatus === "documented" && finalScore < 55) {
        return res.status(400).json({ ok: false, error: "A documented watchlist status requires a final OTT Research Score of at least 55%." });
      }

      const publishedAt = new Date().toISOString();
      const { data: watchlist, error: watchlistError } = await admin
        .from("token_research_watchlist")
        .upsert({
          token_name: row.token_name,
          currency_code: row.currency_code,
          issuer_address: row.issuer_address,
          status: watchlistStatus,
          neutral_rationale: rationale,
          evidence_summary: evidenceSummary,
          research_request_id: requestId,
          is_public: true,
          display_order: displayOrder,
          created_by: founder.id,
          reviewed_at: row.reviewed_at ?? publishedAt,
          published_at: publishedAt,
        }, { onConflict: "currency_code,issuer_address" })
        .select("*")
        .single();
      if (watchlistError) throw watchlistError;

      const { error: requestError } = await admin
        .from("token_research_requests")
        .update({ status: "published", published_at: publishedAt })
        .eq("id", requestId);
      if (requestError) throw requestError;
      return res.status(200).json({ ok: true, watchlist });
    }

    if (action === "unpublish-watchlist") {
      const requestId = stringValue(req.body?.requestId);
      if (!UUID.test(requestId)) return res.status(400).json({ ok: false, error: "Invalid research request ID." });
      const { data, error } = await admin
        .from("token_research_watchlist")
        .update({ is_public: false, published_at: null })
        .eq("research_request_id", requestId)
        .select("*")
        .maybeSingle();
      if (error) throw error;
      return res.status(200).json({ ok: true, watchlist: data ?? null });
    }

    return res.status(400).json({ ok: false, error: "Unknown research review action." });
  } catch (error) {
    if (setupError(error)) return res.status(200).json({ ok: true, setupRequired: true, queue: [] });
    return res.status(500).json({ ok: false, error: error instanceof Error ? error.message : "Research review action failed." });
  }
}

async function handlePublicWatchlist(req: RequestLike, res: ResponseLike) {
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Use GET." });
  try {
    const admin = makeAdmin();
    const { data: watchlist, error } = await admin
      .from("token_research_watchlist")
      .select("*")
      .eq("is_public", true)
      .not("published_at", "is", null)
      .neq("status", "archived")
      .order("display_order", { ascending: true })
      .order("updated_at", { ascending: false })
      .limit(100);
    if (error) throw error;

    const rows = (watchlist ?? []) as unknown as Array<Record<string, unknown>>;
    const requestIds = rows.map((row) => String(row.research_request_id ?? "")).filter((id) => UUID.test(id));
    let requests: Array<Record<string, unknown>> = [];
    if (requestIds.length > 0) {
      const { data, error: requestError } = await admin
        .from("token_research_requests")
        .select("id,final_score,evidence_confidence,neutral_conclusion,reviewed_at")
        .in("id", requestIds);
      if (requestError) throw requestError;
      requests = (data ?? []) as unknown as Array<Record<string, unknown>>;
    }
    const requestMap = new Map(requests.map((request) => [String(request.id), request]));

    return res.status(200).json({
      ok: true,
      items: rows.map((item) => ({
        ...item,
        research: requestMap.get(String(item.research_request_id)) ?? null,
      })),
    });
  } catch (error) {
    if (setupError(error)) return res.status(200).json({ ok: true, setupRequired: true, items: [] });
    return res.status(500).json({ ok: false, error: error instanceof Error ? error.message : "Public watchlist could not be loaded." });
  }
}

export default async function researchReviewHandler(req: RequestLike, res: ResponseLike) {
  const scope = queryValue(req.query?.scope).toLowerCase();
  if (scope === "research-review") return handleFounderReview(req, res);
  if (scope === "watchlist") return handlePublicWatchlist(req, res);
  return res.status(400).json({ ok: false, error: "Unknown research service scope." });
}
