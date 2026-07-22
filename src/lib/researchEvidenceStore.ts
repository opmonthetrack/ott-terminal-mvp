import { isOttAuthConfigured, ottSupabase } from "./ottAuth";

export const RESEARCH_EVIDENCE_BUCKET = "research-evidence";
export const MAX_RESEARCH_FILE_BYTES = 10 * 1024 * 1024;

export type ResearchEvidenceKind = "whitepaper" | "roadmap" | "audit" | "legal" | "other";

export type ResearchEvidenceRecord = {
  id: string;
  projectKey: string;
  kind: ResearchEvidenceKind;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
  notes: string;
  createdAt: string;
};

const LOCAL_KEY = "ott-research-evidence-v1";
const ACCEPTED_EXTENSIONS = ["pdf", "txt", "md", "json", "csv", "doc", "docx"];

function safeFileName(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120) || "evidence-file";
}

function safeProjectKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64) || "unassigned";
}

function localRecords(): ResearchEvidenceRecord[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(LOCAL_KEY) ?? "[]") as ResearchEvidenceRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalRecord(record: ResearchEvidenceRecord) {
  if (typeof window === "undefined") {
    return;
  }

  const records = [record, ...localRecords().filter((item) => item.id !== record.id)].slice(0, 100);
  window.localStorage.setItem(LOCAL_KEY, JSON.stringify(records));
}

export function getLocalResearchEvidence(projectKey?: string) {
  const records = localRecords();
  return projectKey
    ? records.filter((record) => record.projectKey === safeProjectKey(projectKey))
    : records;
}

export function validateResearchEvidenceFile(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (!ACCEPTED_EXTENSIONS.includes(extension)) {
    throw new Error("Unsupported file type. Use PDF, text, Markdown, JSON, CSV, DOC or DOCX.");
  }
  if (file.size <= 0) {
    throw new Error("The selected file is empty.");
  }
  if (file.size > MAX_RESEARCH_FILE_BYTES) {
    throw new Error("The file is larger than 10 MB.");
  }
}

export async function uploadResearchEvidence(input: {
  file: File;
  projectKey: string;
  kind: ResearchEvidenceKind;
  notes?: string;
}) {
  validateResearchEvidenceFile(input.file);

  const projectKey = safeProjectKey(input.projectKey);
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const fileName = safeFileName(input.file.name);
  const localFallback: ResearchEvidenceRecord = {
    id,
    projectKey,
    kind: input.kind,
    fileName,
    mimeType: input.file.type || "application/octet-stream",
    sizeBytes: input.file.size,
    storagePath: `local-session/${projectKey}/${id}-${fileName}`,
    notes: input.notes?.trim().slice(0, 1000) ?? "",
    createdAt,
  };

  if (!isOttAuthConfigured || !ottSupabase) {
    saveLocalRecord(localFallback);
    return { record: localFallback, persisted: false as const };
  }

  const { data: userData, error: userError } = await ottSupabase.auth.getUser();
  if (userError || !userData.user) {
    saveLocalRecord(localFallback);
    return { record: localFallback, persisted: false as const };
  }

  const storagePath = `${userData.user.id}/${projectKey}/${id}-${fileName}`;
  const { error: uploadError } = await ottSupabase.storage
    .from(RESEARCH_EVIDENCE_BUCKET)
    .upload(storagePath, input.file, {
      upsert: false,
      cacheControl: "3600",
      contentType: input.file.type || undefined,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data, error } = await ottSupabase
    .from("research_evidence")
    .insert({
      id,
      user_id: userData.user.id,
      project_key: projectKey,
      evidence_kind: input.kind,
      file_name: fileName,
      mime_type: input.file.type || "application/octet-stream",
      size_bytes: input.file.size,
      storage_path: storagePath,
      notes: input.notes?.trim().slice(0, 1000) ?? "",
    })
    .select("id, project_key, evidence_kind, file_name, mime_type, size_bytes, storage_path, notes, created_at")
    .single();

  if (error) {
    await ottSupabase.storage.from(RESEARCH_EVIDENCE_BUCKET).remove([storagePath]);
    throw error;
  }

  const record: ResearchEvidenceRecord = {
    id: data.id,
    projectKey: data.project_key,
    kind: data.evidence_kind as ResearchEvidenceKind,
    fileName: data.file_name,
    mimeType: data.mime_type,
    sizeBytes: data.size_bytes,
    storagePath: data.storage_path,
    notes: data.notes ?? "",
    createdAt: data.created_at,
  };

  saveLocalRecord(record);
  return { record, persisted: true as const };
}
