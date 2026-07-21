import {
  cacheAcademyAccountCompletion,
  cacheAcademyAccountCompletions,
  getAcademyWalletProgressSummary,
  type AcademyAnswerAssessment,
  type AcademyModuleCompletion,
} from "./academyProgressStore";
import { ottSupabase } from "./ottAuth";

const COURSE_VERSION = "1.0";

type AcademyCompletionRow = {
  user_id: string;
  course_id: string;
  course_version: string;
  lesson_version: string;
  overall_score: number;
  xp: number;
  credits: number;
  assessments: AcademyAnswerAssessment[] | null;
  completed_at: string;
  updated_at: string;
};

export type SaveAccountAcademyCompletionInput = {
  userId: string;
  lessonId: string;
  lessonTitle: string;
  completedAt: number;
  xp: number;
  credits: number;
  overallScore: number;
  assessments: AcademyAnswerAssessment[];
  sourceWallet?: string;
};

function requireClient() {
  if (!ottSupabase) {
    throw new Error("OTT account storage is not configured yet.");
  }

  return ottSupabase;
}

function rowToCompletion(row: AcademyCompletionRow): AcademyModuleCompletion {
  const assessments = Array.isArray(row.assessments) ? row.assessments : [];

  return {
    lessonId: row.course_id,
    lessonTitle: row.course_id,
    walletAddress: `account:${row.user_id}`,
    completedAt: new Date(row.completed_at).getTime(),
    xp: row.xp,
    credits: row.credits,
    overallScore: row.overall_score,
    assessments,
    assessmentMode: "ai",
  };
}

export async function loadAccountAcademyCompletions(userId: string) {
  const client = requireClient();
  const { data, error } = await client
    .from("academy_completions")
    .select(
      "user_id,course_id,course_version,lesson_version,overall_score,xp,credits,assessments,completed_at,updated_at",
    )
    .eq("user_id", userId)
    .eq("course_version", COURSE_VERSION)
    .order("completed_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => rowToCompletion(row as AcademyCompletionRow));
}

export async function hydrateAccountAcademyCache(userId: string) {
  const completions = await loadAccountAcademyCompletions(userId);
  cacheAcademyAccountCompletions(userId, completions);
  return completions;
}

export async function saveAccountAcademyCompletion(
  input: SaveAccountAcademyCompletionInput,
) {
  if (!input.assessments.length || input.assessments.some((item) => !item.passed)) {
    throw new Error("Every Academy answer must pass before account progress can be stored.");
  }

  // The assessment endpoint must have written the trusted row already.
  // The browser only reads it back and updates the local display cache.
  const remote = await loadAccountAcademyCompletions(input.userId);
  const verified = remote.find((item) => item.lessonId === input.lessonId);

  if (!verified) {
    throw new Error(
      "The answers passed, but the trusted server did not store this course. Check the Supabase server configuration.",
    );
  }

  cacheAcademyAccountCompletion(input.userId, {
    ...verified,
    lessonTitle: input.lessonTitle,
  });
  return verified;
}

export async function migrateLegacyWalletProgressToAccount(
  userId: string,
  walletAddress: string,
) {
  const client = requireClient();
  const legacy = getAcademyWalletProgressSummary(walletAddress);

  if (!legacy.completions.length) {
    return 0;
  }

  const { data: existingRows, error: existingError } = await client
    .from("academy_legacy_imports")
    .select("course_id")
    .eq("user_id", userId)
    .eq("wallet_address", walletAddress);

  if (existingError) {
    throw existingError;
  }

  const existing = new Set((existingRows ?? []).map((row) => String(row.course_id)));
  const imports = legacy.completions
    .filter((completion) => !existing.has(completion.lessonId))
    .map((completion) => ({
      user_id: userId,
      wallet_address: walletAddress,
      course_id: completion.lessonId,
      overall_score: completion.overallScore,
      xp: completion.xp,
      credits: completion.credits,
      assessments: completion.assessments,
      legacy_completed_at: new Date(completion.completedAt).toISOString(),
      status: "needs_reassessment",
    }));

  if (!imports.length) {
    return 0;
  }

  const { error } = await client.from("academy_legacy_imports").insert(imports);

  if (error) {
    throw error;
  }

  return imports.length;
}
