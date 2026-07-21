import type { AcademyAnswerAssessment } from "./academyProgressStore";

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
  const response = await fetch("/api/academy-assess", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = (await response.json()) as AcademyAssessmentResponse;

  if (!response.ok) {
    throw data;
  }

  return data;
}
