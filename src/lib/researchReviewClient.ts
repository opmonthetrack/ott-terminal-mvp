import { ottSupabase } from "./ottAuth";
import type {
  OttEvidenceStatus,
  OttResearchCategoryId,
  OttResearchScoreResult,
} from "./ottResearchScore";

export type ResearchQueueItem = {
  id: string;
  user_id: string;
  token_name: string;
  currency_code: string;
  issuer_address: string;
  official_website: string | null;
  claimed_country: string | null;
  claimed_legal_entity: string | null;
  status: string;
  raw_score: number | null;
  final_score: number | null;
  evidence_confidence: string;
  updated_at: string;
  evidence_count: number;
  requester: { id: string; email: string | null; name: string | null } | null;
};

export type ResearchEvidenceItem = {
  id: string;
  token_request_id: string;
  evidence_kind: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  storage_path: string;
  source_url: string | null;
  source_title: string | null;
  source_kind: string | null;
  source_published_at: string | null;
  source_checked_at: string | null;
  notes: string;
  created_at: string;
};

export type ResearchScoreItem = {
  id?: string;
  category_id: OttResearchCategoryId;
  max_points: number;
  awarded_points: number;
  evidence_status: OttEvidenceStatus;
  rationale: string;
  evidence_ids: string[];
  checked_at?: string | null;
};

export type ResearchCase = {
  request: ResearchQueueItem & {
    claimed_registration_number: string | null;
    requester_summary: string;
    score_cap: number | null;
    score_cap_reason: string | null;
    neutral_conclusion: string | null;
    founder_review_note: string | null;
    reviewed_at: string | null;
  };
  evidence: ResearchEvidenceItem[];
  scoreItems: ResearchScoreItem[];
  watchlist: PublicWatchlistItem | null;
};

export type PublicWatchlistItem = {
  id: string;
  token_name: string;
  currency_code: string;
  issuer_address: string;
  status: string;
  neutral_rationale: string;
  evidence_summary: string;
  research_request_id: string;
  display_order: number;
  reviewed_at: string | null;
  published_at: string | null;
  research: {
    final_score: number | null;
    evidence_confidence: string;
    neutral_conclusion: string | null;
    reviewed_at: string | null;
  } | null;
};

type ReviewResponse = {
  ok: boolean;
  setupRequired?: boolean;
  queue?: ResearchQueueItem[];
  case?: ResearchCase;
  request?: ResearchCase["request"];
  scoreResult?: OttResearchScoreResult;
  watchlist?: PublicWatchlistItem | null;
  signedUrl?: string;
  fileName?: string;
  items?: PublicWatchlistItem[];
  error?: string;
};

async function authHeaders() {
  const session = ottSupabase ? (await ottSupabase.auth.getSession()).data.session : null;
  if (!session?.access_token) throw new Error("Log eerst in met het founderaccount.");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
  };
}

async function parse(response: Response) {
  let data: ReviewResponse;
  try {
    data = await response.json() as ReviewResponse;
  } catch {
    data = { ok: false, error: `Server response could not be read (${response.status}).` };
  }
  if (!response.ok || !data.ok) throw data;
  return data;
}

export async function loadResearchReviewQueue() {
  const response = await fetch("/api/access-payment?scope=research-review", {
    method: "GET",
    headers: await authHeaders(),
    cache: "no-store",
  });
  return parse(response);
}

export async function loadResearchReviewCase(requestId: string) {
  const query = new URLSearchParams({ scope: "research-review", requestId });
  const response = await fetch(`/api/access-payment?${query.toString()}`, {
    method: "GET",
    headers: await authHeaders(),
    cache: "no-store",
  });
  return parse(response);
}

export async function openFounderEvidence(evidenceId: string) {
  const response = await fetch("/api/access-payment?scope=research-review", {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ action: "evidence-url", evidenceId }),
  });
  const data = await parse(response);
  if (!data.signedUrl) throw new Error("Geen tijdelijke bestandslink ontvangen.");
  window.open(data.signedUrl, "_blank", "noopener,noreferrer");
}

export async function saveFounderResearchScore(input: {
  requestId: string;
  status: string;
  neutralConclusion: string;
  founderReviewNote: string;
  items: Array<{
    categoryId: OttResearchCategoryId;
    awardedPoints: number;
    evidenceStatus: OttEvidenceStatus;
    rationale: string;
    evidenceIds: string[];
  }>;
}) {
  const response = await fetch("/api/access-payment?scope=research-review", {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ action: "save-score", ...input }),
  });
  return parse(response);
}

export async function publishResearchWatchlist(input: {
  requestId: string;
  watchlistStatus: string;
  neutralRationale: string;
  evidenceSummary: string;
  displayOrder: number;
}) {
  const response = await fetch("/api/access-payment?scope=research-review", {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ action: "publish-watchlist", ...input }),
  });
  return parse(response);
}

export async function unpublishResearchWatchlist(requestId: string) {
  const response = await fetch("/api/access-payment?scope=research-review", {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ action: "unpublish-watchlist", requestId }),
  });
  return parse(response);
}

export async function loadPublicResearchWatchlist() {
  const response = await fetch("/api/access-payment?scope=watchlist", {
    method: "GET",
    cache: "no-store",
  });
  return parse(response);
}
