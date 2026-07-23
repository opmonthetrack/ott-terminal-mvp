import { ottSupabase } from "./ottAuth";

export type TokenResearchRequest = {
  id: string;
  user_id: string;
  token_name: string;
  currency_code: string;
  issuer_address: string;
  official_website: string | null;
  claimed_country: string | null;
  claimed_legal_entity: string | null;
  claimed_registration_number: string | null;
  requester_summary: string;
  status: string;
  raw_score: number | null;
  final_score: number | null;
  score_threshold: number;
  score_cap: number | null;
  score_cap_reason: string | null;
  evidence_confidence: string;
  neutral_conclusion: string | null;
  created_at: string;
  updated_at: string;
};

export type ResearchEvidenceKind =
  | "whitepaper"
  | "roadmap"
  | "audit"
  | "legal"
  | "issuer"
  | "liquidity"
  | "holders"
  | "team"
  | "market"
  | "screenshot"
  | "other";

export type TokenResearchEvidence = {
  id: string;
  user_id: string;
  token_request_id: string | null;
  evidence_kind: ResearchEvidenceKind;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  storage_path: string;
  source_title: string | null;
  source_url: string | null;
  source_kind: string | null;
  notes: string;
  created_at: string;
};

export type SubmitTokenResearchInput = {
  tokenName: string;
  currencyCode: string;
  issuerAddress: string;
  officialWebsite?: string;
  claimedCountry?: string;
  claimedLegalEntity?: string;
  claimedRegistrationNumber?: string;
  requesterSummary?: string;
};

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set([
  "pdf", "doc", "docx", "odt", "rtf", "txt", "md", "csv", "json",
  "jpg", "jpeg", "png", "webp", "heic", "heif",
]);
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/json",
  "application/rtf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.oasis.opendocument.text",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
  "application/octet-stream",
  "",
]);

function requireClient() {
  if (!ottSupabase) throw new Error("OTT account storage is not configured.");
  return ottSupabase;
}

async function requireUser() {
  const client = requireClient();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) throw new Error("Log eerst in met je OTT-account.");
  return data.user;
}

function safeFileName(value: string) {
  const normalized = value.normalize("NFKD").replace(/[^A-Za-z0-9._-]+/g, "-");
  return normalized.replace(/^-+|-+$/g, "").slice(0, 140) || "evidence-file";
}

function fileExtension(name: string) {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

export function validateResearchFile(file: File) {
  if (file.size <= 0) throw new Error(`${file.name}: het bestand is leeg.`);
  if (file.size > MAX_FILE_SIZE) throw new Error(`${file.name}: maximaal 15 MB per bestand.`);
  const extension = fileExtension(file.name);
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    throw new Error(`${file.name}: dit bestandstype wordt niet ondersteund.`);
  }
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error(`${file.name}: MIME-type ${file.type || "onbekend"} wordt niet ondersteund.`);
  }
}

export async function submitTokenResearchRequest(input: SubmitTokenResearchInput) {
  const client = requireClient();
  await requireUser();
  const { data, error } = await client.rpc("submit_ott_token_research_request", {
    p_token_name: input.tokenName.trim(),
    p_currency_code: input.currencyCode.trim().toUpperCase(),
    p_issuer_address: input.issuerAddress.trim(),
    p_official_website: input.officialWebsite?.trim() || null,
    p_claimed_country: input.claimedCountry?.trim() || null,
    p_claimed_legal_entity: input.claimedLegalEntity?.trim() || null,
    p_claimed_registration_number: input.claimedRegistrationNumber?.trim() || null,
    p_requester_summary: input.requesterSummary?.trim() || "",
  });
  if (error) throw error;
  if (typeof data !== "string") throw new Error("De researchaanvraag gaf geen aanvraagnummer terug.");
  return data;
}

export async function loadTokenResearchRequests() {
  const client = requireClient();
  await requireUser();
  const { data, error } = await client
    .from("token_research_requests")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as TokenResearchRequest[];
}

export async function loadTokenResearchEvidence(requestId: string) {
  const client = requireClient();
  await requireUser();
  const { data, error } = await client
    .from("research_evidence")
    .select("id,user_id,token_request_id,evidence_kind,file_name,mime_type,size_bytes,storage_path,source_title,source_url,source_kind,notes,created_at")
    .eq("token_request_id", requestId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as TokenResearchEvidence[];
}

export async function uploadTokenResearchEvidence(input: {
  requestId: string;
  file: File;
  evidenceKind: ResearchEvidenceKind;
  notes?: string;
}) {
  validateResearchFile(input.file);
  const client = requireClient();
  const user = await requireUser();
  const fileName = safeFileName(input.file.name);
  const storagePath = `${user.id}/token-research/${input.requestId}/${crypto.randomUUID()}-${fileName}`;
  const mimeType = input.file.type || "application/octet-stream";

  const { error: uploadError } = await client.storage
    .from("research-evidence")
    .upload(storagePath, input.file, {
      cacheControl: "3600",
      contentType: mimeType,
      upsert: false,
    });
  if (uploadError) throw uploadError;

  const { data, error: insertError } = await client
    .from("research_evidence")
    .insert({
      user_id: user.id,
      project_key: `token-research:${input.requestId}`,
      token_request_id: input.requestId,
      evidence_kind: input.evidenceKind,
      file_name: input.file.name.slice(0, 160),
      mime_type: mimeType,
      size_bytes: input.file.size,
      storage_path: storagePath,
      source_title: input.file.name.slice(0, 160),
      source_kind: "user-upload",
      source_checked_at: new Date().toISOString(),
      notes: input.notes?.trim().slice(0, 1000) || "",
    })
    .select("id,user_id,token_request_id,evidence_kind,file_name,mime_type,size_bytes,storage_path,source_title,source_url,source_kind,notes,created_at")
    .single();

  if (insertError) {
    await client.storage.from("research-evidence").remove([storagePath]);
    throw insertError;
  }

  return data as TokenResearchEvidence;
}

export async function openTokenResearchEvidence(storagePath: string) {
  const client = requireClient();
  await requireUser();
  const { data, error } = await client.storage
    .from("research-evidence")
    .createSignedUrl(storagePath, 60);
  if (error) throw error;
  if (!data.signedUrl) throw new Error("Kon geen tijdelijke bestandslink maken.");
  window.open(data.signedUrl, "_blank", "noopener,noreferrer");
}

export async function deleteTokenResearchEvidence(evidence: TokenResearchEvidence) {
  const client = requireClient();
  await requireUser();
  const { error: deleteError } = await client
    .from("research_evidence")
    .delete()
    .eq("id", evidence.id);
  if (deleteError) throw deleteError;

  const { error: storageError } = await client.storage
    .from("research-evidence")
    .remove([evidence.storage_path]);
  if (storageError) throw storageError;
}
