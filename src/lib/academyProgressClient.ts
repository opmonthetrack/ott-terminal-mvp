import { ottSupabase } from "./ottAuth";

export type AcademyProgressLesson = {
  id: string;
  module: string;
  title: string;
  xp: number;
  credits: number;
  completed: boolean;
  score: number | null;
  completedAt: string | null;
  updatedAt: string | null;
};

export type AcademyProgressSnapshot = {
  ok: boolean;
  configured: boolean;
  setupRequired: boolean;
  totalLessons: number;
  completedCount: number;
  completionPercent: number;
  averageScore: number;
  totalXp: number;
  maximumXp: number;
  totalCredits: number;
  allLessonsComplete: boolean;
  averageQualified: boolean;
  nftEligible: boolean;
  minimumAverage: number;
  answerPassScore: number;
  lessons: AcademyProgressLesson[];
  error?: string;
};

async function getHeaders() {
  const session = ottSupabase
    ? (await ottSupabase.auth.getSession()).data.session
    : null;
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  return headers;
}

export async function getAcademyProgressSnapshot() {
  const response = await fetch("/api/academy-progress", {
    method: "GET",
    headers: await getHeaders(),
    cache: "no-store",
  });

  let data: AcademyProgressSnapshot;
  try {
    data = (await response.json()) as AcademyProgressSnapshot;
  } catch {
    throw new Error(`Academy progress response could not be read (${response.status}).`);
  }

  if (!response.ok || !data.ok) {
    throw new Error(data.error || `Academy progress could not be loaded (${response.status}).`);
  }

  return data;
}
