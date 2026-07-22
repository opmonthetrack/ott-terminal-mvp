import type { AcademyAnswerAssessment } from "./academyProgressStore";

export type AcademyLessonAttempt = {
  ownerKey: string;
  lessonId: string;
  answers: Record<string, string>;
  assessments: AcademyAnswerAssessment[];
  latestScore: number;
  updatedAt: number;
};

const STORAGE_KEY = "ott-academy-lesson-attempts-v1";

function readAll() {
  if (typeof window === "undefined") {
    return {} as Record<string, AcademyLessonAttempt>;
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as Record<
      string,
      AcademyLessonAttempt
    >;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {} as Record<string, AcademyLessonAttempt>;
  }
}

function makeKey(ownerKey: string, lessonId: string) {
  return `${ownerKey.trim() || "guest"}:${lessonId}`;
}

export function loadAcademyLessonAttempt(ownerKey: string, lessonId: string) {
  const key = makeKey(ownerKey, lessonId);
  return (
    readAll()[key] ?? {
      ownerKey: ownerKey.trim() || "guest",
      lessonId,
      answers: {},
      assessments: [],
      latestScore: 0,
      updatedAt: 0,
    }
  ) satisfies AcademyLessonAttempt;
}

export function saveAcademyLessonAttempt(input: AcademyLessonAttempt) {
  if (typeof window === "undefined") {
    return input;
  }

  const ownerKey = input.ownerKey.trim() || "guest";
  const key = makeKey(ownerKey, input.lessonId);
  const next: AcademyLessonAttempt = {
    ...input,
    ownerKey,
    answers: Object.fromEntries(
      Object.entries(input.answers).map(([taskId, answer]) => [taskId, answer.slice(0, 200)]),
    ),
    assessments: input.assessments.map((assessment) => ({
      ...assessment,
      score: Math.max(0, Math.min(100, Math.round(assessment.score))),
      feedback: assessment.feedback.slice(0, 700),
      missingConcepts: assessment.missingConcepts.slice(0, 8),
    })),
    latestScore: Math.max(0, Math.min(100, Math.round(input.latestScore))),
    updatedAt: Date.now(),
  };

  const all = readAll();
  all[key] = next;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return next;
}

export function clearAcademyLessonAttempt(ownerKey: string, lessonId: string) {
  if (typeof window === "undefined") {
    return;
  }

  const all = readAll();
  delete all[makeKey(ownerKey, lessonId)];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}
