import type { AcademyAnswerAssessment } from "./academyProgressStore";
import { ottSupabase } from "./ottAuth";

export const ACADEMY_COACH_EVENT = "ott-academy-coach-result";

export type AcademyCoachPayload = {
  provider: "gemini" | "rubric-fallback";
  label: string;
  strengths: string[];
  suggestedAnswer: string;
  note: string;
};

export type AcademyAssessmentResponse = {
  ok: boolean;
  mode?: "ai" | "rubric-fallback";
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
  mode?: "ai" | "rubric-fallback";
  passScore?: number;
  assessment?: AcademyAnswerAssessment;
  coach?: AcademyCoachPayload;
  assessedAt?: string;
  error?: string;
};

export type AcademyCoachEventDetail = {
  question: string;
  answer: string;
  language: "nl" | "en";
  response?: AcademyAnswerCheckResponse;
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

function announceCoach(detail: AcademyCoachEventDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<AcademyCoachEventDetail>(ACADEMY_COACH_EVENT, { detail }));
}

async function readJson<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    return { ok: false, error: `Server response could not be read (${response.status}).` } as T;
  }
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

  const data = await readJson<AcademyAssessmentResponse>(response);

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
  try {
    const response = await fetch("/api/academy-check-answer", {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify(input),
    });

    const data = await readJson<AcademyAnswerCheckResponse>(response);

    if (!response.ok) {
      const message = data.error || `Answer check failed (${response.status}).`;
      announceCoach({
        question: input.question,
        answer: input.answer,
        language: input.language,
        response: data,
        error: message,
      });
      throw data;
    }

    announceCoach({
      question: input.question,
      answer: input.answer,
      language: input.language,
      response: data,
    });
    return data;
  } catch (error) {
    const structured = error as AcademyAnswerCheckResponse;
    if (structured?.ok === false) throw error;

    const message = error instanceof Error ? error.message : "Answer check failed.";
    announceCoach({
      question: input.question,
      answer: input.answer,
      language: input.language,
      error: message,
    });
    throw error;
  }
}
