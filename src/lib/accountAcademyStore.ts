import {
  cacheAcademyAccountCompletion,
  cacheAcademyAccountCompletions,
  getAcademyWalletProgressSummary,
  loadAcademyAccountProgress,
  type AcademyAnswerAssessment,
  type AcademyModuleCompletion,
} from "./academyProgressStore";
import { ottSupabase } from "./ottAuth";

const COURSE_VERSION = "1.0";
const LESSON_VERSION = "1.0";

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

  const client = requireClient();
  const currentCache = loadAcademyAccountProgress(input.userId);
  const existing = currentCache.completions[input.lessonId];

  if (existing && existing.overallScore >= input.overallScore) {
    return existing;
  }

  const completion: AcademyModuleCompletion = {
    lessonId: input.lessonId,
    lessonTitle: input.lessonTitle,
    walletAddress: input.sourceWallet || `account:${input.userId}`,
    completedAt: input.completedAt,
    xp: input.xp,
    credits: input.credits,
    overallScore: input.overallScore,
    assessments: input.assessments,
    assessmentMode: "ai",
  };

  const { error } = await client.from("academy_completions").upsert(
    {
      user_id: input.userId,
      course_id: input.lessonId,
      course_version: COURSE_VERSION,
      lesson_version: LESSON_VERSION,
      overall_score: input.overallScore,
      xp: input.xp,
      credits: input.credits,
      assessments: input.assessments,
      completed_at: new Date(input.completedAt).toISOString(),
    },
    { onConflict: "user_id,course_id,course_version" },
  );

  if (error) {
    throw error;
  }

  cacheAcademyAccountCompletion(input.userId, completion);
  return completion;
}

export async function migrateLegacyWalletProgressToAccount(
  userId: string,
  walletAddress: string,
) {
  const legacy = getAcademyWalletProgressSummary(walletAddress);

  if (!legacy.completions.length) {
    return 0;
  }

  const remote = await loadAccountAcademyCompletions(userId);
  const remoteByCourse = new Map(remote.map((item) => [item.lessonId, item]));
  let migrated = 0;

  for (const completion of legacy.completions) {
    const existing = remoteByCourse.get(completion.lessonId);

    if (existing && existing.overallScore >= completion.overallScore) {
      continue;
    }

    await saveAccountAcademyCompletion({
      userId,
      lessonId: completion.lessonId,
      lessonTitle: completion.lessonTitle,
      completedAt: completion.completedAt,
      xp: completion.xp,
      credits: completion.credits,
      overallScore: completion.overallScore,
      assessments: completion.assessments,
      sourceWallet: walletAddress,
    });
    migrated += 1;
  }

  await hydrateAccountAcademyCache(userId);
  return migrated;
}
