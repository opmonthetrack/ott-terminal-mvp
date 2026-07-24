import { createClient } from "@supabase/supabase-js";
import {
  ACADEMY_COURSES,
  ACADEMY_NFT_MINIMUM_AVERAGE,
} from "../src/lib/academyCourseCatalog.js";

const COURSE_VERSION = "1.0";
const ANSWER_PASS_SCORE = 70;

type RequestLike = {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
};

type ResponseLike = {
  status: (code: number) => {
    json: (body: unknown) => void;
  };
};

type StoredAssessment = {
  taskId?: unknown;
  passed?: unknown;
  score?: unknown;
};

type CompletionRow = {
  course_id: string;
  course_version: string;
  overall_score: number;
  xp: number;
  credits: number;
  assessments: StoredAssessment[] | null;
  completed_at: string;
  updated_at: string;
};

function getBearerToken(req: RequestLike) {
  const raw = req.headers?.authorization ?? req.headers?.Authorization;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value?.startsWith("Bearer ") ? value.slice("Bearer ".length).trim() : "";
}

function isVerifiedCompletion(row: CompletionRow, requiredAnswers: number) {
  const assessments = Array.isArray(row.assessments) ? row.assessments : [];
  if (assessments.length < requiredAnswers) return false;
  if (!Number.isFinite(Number(row.overall_score))) return false;
  return assessments.every((assessment) => (
    assessment?.passed === true && Number(assessment?.score) >= ANSWER_PASS_SCORE
  ));
}

function emptySnapshot(configured: boolean, setupRequired = false) {
  return {
    ok: true,
    configured,
    setupRequired,
    totalLessons: ACADEMY_COURSES.length,
    completedCount: 0,
    completionPercent: 0,
    averageScore: 0,
    totalXp: 0,
    maximumXp: ACADEMY_COURSES.reduce((sum, course) => sum + course.xp, 0),
    totalCredits: 0,
    allLessonsComplete: false,
    averageQualified: false,
    nftEligible: false,
    minimumAverage: ACADEMY_NFT_MINIMUM_AVERAGE,
    answerPassScore: ANSWER_PASS_SCORE,
    lessons: ACADEMY_COURSES.map((course) => ({
      id: course.id,
      module: course.module,
      title: course.title,
      xp: course.xp,
      credits: course.credits,
      completed: false,
      score: null,
      completedAt: null,
      updatedAt: null,
    })),
  };
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method not allowed. Use GET." });
  }

  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ ok: false, error: "Sign in to view Academy progress." });
  }

  const supabaseUrl = process.env.SUPABASE_URL?.trim() || process.env.VITE_SUPABASE_URL?.trim() || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(200).json(emptySnapshot(false, true));
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData.user) {
    return res.status(401).json({ ok: false, error: "The OTT account session could not be verified." });
  }

  const { data, error } = await admin
    .from("academy_completions")
    .select("course_id,course_version,overall_score,xp,credits,assessments,completed_at,updated_at")
    .eq("user_id", userData.user.id)
    .eq("course_version", COURSE_VERSION);

  if (error) {
    const setupRequired = error.code === "42P01" || /academy_completions/i.test(error.message ?? "");
    if (setupRequired) {
      return res.status(200).json(emptySnapshot(true, true));
    }
    return res.status(500).json({ ok: false, error: "Academy progress could not be loaded." });
  }

  const rows = (data ?? []) as CompletionRow[];
  const bestByCourse = new Map<string, CompletionRow>();

  for (const row of rows) {
    const existing = bestByCourse.get(row.course_id);
    if (!existing || Number(row.overall_score) > Number(existing.overall_score)) {
      bestByCourse.set(row.course_id, row);
    }
  }

  const lessons = ACADEMY_COURSES.map((course) => {
    const row = bestByCourse.get(course.id);
    const completed = Boolean(row && isVerifiedCompletion(row, course.tasks.length));
    return {
      id: course.id,
      module: course.module,
      title: course.title,
      xp: completed ? Number(row?.xp ?? course.xp) : course.xp,
      credits: completed ? Number(row?.credits ?? course.credits) : course.credits,
      completed,
      score: completed ? Math.max(0, Math.min(100, Math.round(Number(row?.overall_score ?? 0)))) : null,
      completedAt: completed ? row?.completed_at ?? null : null,
      updatedAt: completed ? row?.updated_at ?? null : null,
    };
  });
  const completedLessons = lessons.filter((lesson) => lesson.completed && lesson.score !== null);
  const completedCount = completedLessons.length;
  const averageScore = completedCount
    ? Math.round(completedLessons.reduce((sum, lesson) => sum + Number(lesson.score), 0) / completedCount)
    : 0;
  const allLessonsComplete = completedCount === ACADEMY_COURSES.length;
  const averageQualified = averageScore >= ACADEMY_NFT_MINIMUM_AVERAGE;

  return res.status(200).json({
    ok: true,
    configured: true,
    setupRequired: false,
    totalLessons: ACADEMY_COURSES.length,
    completedCount,
    completionPercent: Math.round((completedCount / ACADEMY_COURSES.length) * 100),
    averageScore,
    totalXp: completedLessons.reduce((sum, lesson) => sum + lesson.xp, 0),
    maximumXp: ACADEMY_COURSES.reduce((sum, course) => sum + course.xp, 0),
    totalCredits: completedLessons.reduce((sum, lesson) => sum + lesson.credits, 0),
    allLessonsComplete,
    averageQualified,
    nftEligible: allLessonsComplete && averageQualified,
    minimumAverage: ACADEMY_NFT_MINIMUM_AVERAGE,
    answerPassScore: ANSWER_PASS_SCORE,
    lessons,
  });
}
