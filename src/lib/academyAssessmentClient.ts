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

export type AcademyAnswerCheckResponse = {
  ok: boolean;
  mode?: "practice";
  passScore?: number;
  assessment?: AcademyAnswerAssessment;
  assessedAt?: string;
  error?: string;
};

async function authHeaders() {
  const session = ottSupabase
    ? (await ottSupabase.auth.getSession()).data.session
    : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  return headers;
}

export async function assessAcademyModule(input: {
  lessonId: string;
  language: "nl" | "en";
  walletAddress: string;
  answers: Array<{
    taskId: string;
    answer: string;
  }>;
}) {
  const response = await fetch("/api/academy-assess", {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(input),
  });

  const data = (await response.json()) as AcademyAssessmentResponse;

  if (!response.ok) {
    throw data;
  }

  return data;
}

export async function checkAcademyAnswer(input: {
  lessonId: string;
  taskId: string;
  question: string;
  answer: string;
  lessonContext: string;
  language: "nl" | "en";
}) {
  const response = await fetch("/api/academy-check-answer", {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(input),
  });

  const data = (await response.json()) as AcademyAnswerCheckResponse;

  if (!response.ok) {
    throw data;
  }

  return data;
}
