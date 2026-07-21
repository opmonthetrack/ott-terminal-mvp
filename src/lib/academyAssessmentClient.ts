import type { AcademyAnswerAssessment } from "./academyProgressStore";
import { ottSupabase } from "./ottAuth";

export type AcademyAssessmentResponse = {
  ok: boolean;
  mode?: "ai";
  lesson?: {
    id: string;
    title: string;
  };
  rules?: {
    passScore: number;
    allTasksRequired: boolean;
    maxAnswerLength: number;
  };
  overallPassed?: boolean;
  overallScore?: number;
  assessments?: AcademyAnswerAssessment[];
  assessedAt?: string;
  accountStorage?: {
    authenticated: boolean;
    stored: boolean;
    preservedHigherScore?: boolean;
    error?: string;
  };
  error?: string;
};

export async function assessAcademyModule(input: {
  lessonId: string;
  language: "nl" | "en";
  walletAddress: string;
  answers: Array<{
    taskId: string;
    answer: string;
  }>;
}) {
  const session = ottSupabase
    ? (await ottSupabase.auth.getSession()).data.session
    : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  const response = await fetch("/api/academy-assess", {
    method: "POST",
    headers,
    body: JSON.stringify(input),
  });

  const data = (await response.json()) as AcademyAssessmentResponse;

  if (!response.ok) {
    throw data;
  }

  return data;
}
