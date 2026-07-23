import { ottSupabase } from "./ottAuth";

export type ResearchWebSource = {
  id: string;
  request_id: string;
  url: string;
  canonical_url: string;
  domain: string;
  title: string;
  source_kind: string;
  authority_level: string;
  review_status: string;
  search_focus: string;
  summary: string;
  published_at: string | null;
  checked_at: string;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ScoutCandidate = {
  url: string;
  canonicalUrl: string;
  title: string;
  domain: string;
  suggestedSourceKind: string;
  suggestedAuthorityLevel: string;
};

export type ScoutResult = {
  model: string;
  briefing: string;
  searchQueries: string[];
  sources: ScoutCandidate[];
};

type ScoutResponse = {
  ok: boolean;
  setupRequired?: boolean;
  sources?: ResearchWebSource[];
  source?: ResearchWebSource;
  scout?: ScoutResult;
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
  let data: ScoutResponse;
  try {
    data = await response.json() as ScoutResponse;
  } catch {
    data = { ok: false, error: `Server response could not be read (${response.status}).` };
  }
  if (!response.ok || !data.ok) throw data;
  return data;
}

export async function loadResearchWebSources(requestId: string) {
  const query = new URLSearchParams({ scope: "evidence-scout", requestId });
  const response = await fetch(`/api/access-payment?${query.toString()}`, {
    method: "GET",
    headers: await authHeaders(),
    cache: "no-store",
  });
  return parse(response);
}

export async function runResearchEvidenceScout(input: {
  requestId: string;
  focus: string;
  instructions: string;
}) {
  const response = await fetch("/api/access-payment?scope=evidence-scout", {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ action: "search", ...input }),
  });
  return parse(response);
}

export async function saveResearchWebSource(input: {
  requestId: string;
  url: string;
  title: string;
  summary: string;
  focus: string;
  sourceKind: string;
  authorityLevel: string;
  reviewStatus: string;
}) {
  const response = await fetch("/api/access-payment?scope=evidence-scout", {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ action: "save", ...input }),
  });
  return parse(response);
}

export async function updateResearchWebSource(input: {
  sourceId: string;
  sourceKind: string;
  authorityLevel: string;
  reviewStatus: string;
  summary: string;
}) {
  const response = await fetch("/api/access-payment?scope=evidence-scout", {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ action: "update", ...input }),
  });
  return parse(response);
}

export async function deleteResearchWebSource(sourceId: string) {
  const response = await fetch("/api/access-payment?scope=evidence-scout", {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ action: "delete", sourceId }),
  });
  return parse(response);
}
