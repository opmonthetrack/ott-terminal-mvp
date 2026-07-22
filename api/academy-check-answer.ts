import { GoogleGenAI } from "@google/genai";

const MIN_ANSWER_LENGTH = 18;
const MAX_ANSWER_LENGTH = 200;
const MAX_CONTEXT_LENGTH = 5000;
const PASS_SCORE = 70;
const DEFAULT_MODEL = "gemini-2.5-flash";

type RequestLike = {
  method?: string;
  body?: Record<string, unknown>;
};

type ResponseLike = {
  status: (code: number) => {
    json: (body: unknown) => void;
  };
};

type ModelAssessment = {
  score?: unknown;
  passed?: unknown;
  feedback?: unknown;
  missingConcepts?: unknown;
};

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanScore(value: unknown) {
  const score = typeof value === "number" ? value : Number(value);
  return Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : 0;
}

function cleanAssessment(taskId: string, value: ModelAssessment) {
  const score = cleanScore(value.score);
  const feedback = getString(value.feedback).slice(0, 700) || "No feedback was returned.";
  const missingConcepts = Array.isArray(value.missingConcepts)
    ? value.missingConcepts.map(getString).filter(Boolean).slice(0, 8)
    : [];

  return {
    taskId,
    score,
    passed: score >= PASS_SCORE && value.passed !== false,
    feedback,
    missingConcepts,
  };
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed. Use POST." });
  }

  try {
    const taskId = getString(req.body?.taskId);
    const lessonId = getString(req.body?.lessonId);
    const question = getString(req.body?.question);
    const answer = getString(req.body?.answer);
    const language = getString(req.body?.language) === "nl" ? "nl" : "en";
    const lessonContext = getString(req.body?.lessonContext).slice(0, MAX_CONTEXT_LENGTH);

    if (!taskId || !lessonId || !question) {
      return res.status(400).json({ ok: false, error: "Lesson, task and question are required." });
    }

    if (answer.length < MIN_ANSWER_LENGTH) {
      return res.status(400).json({
        ok: false,
        error: `Explain your answer in at least ${MIN_ANSWER_LENGTH} characters.`,
      });
    }

    if (answer.length > MAX_ANSWER_LENGTH) {
      return res.status(400).json({
        ok: false,
        error: `The answer exceeds the ${MAX_ANSWER_LENGTH}-character limit.`,
      });
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return res.status(503).json({
        ok: false,
        error: "AI Academy assessor is not configured. Add GEMINI_API_KEY in Vercel.",
      });
    }

    const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are the practice answer checker for OTT Academy, an XRPL education platform.

Assess one learner answer against the question and supplied lesson context.
Rules:
- Accept correct explanations in Dutch or English, including normal spelling mistakes.
- Reward demonstrated understanding, not exact copied wording.
- Reject vague, circular, copied-question, gibberish or unsafe answers.
- Score from 0 to 100. A score of ${PASS_SCORE} or higher passes.
- Give concise constructive feedback in the learner's preferred language (${language}).
- This is practice feedback only. Do not claim the lesson is officially completed.
- Return JSON only in this exact shape:
{"score":0,"passed":false,"feedback":"...","missingConcepts":["..."]}

Lesson ID: ${lessonId}
Task ID: ${taskId}
Question: ${question}
Lesson context: ${lessonContext || "No extra context supplied."}
Learner answer: ${answer}`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    });
    const responseText = response.text?.trim() ?? "";
    if (!responseText) {
      throw new Error("AI answer checker returned an empty response.");
    }

    const parsed = JSON.parse(responseText) as ModelAssessment;
    return res.status(200).json({
      ok: true,
      mode: "practice",
      passScore: PASS_SCORE,
      assessment: cleanAssessment(taskId, parsed),
      assessedAt: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown Academy answer check error.",
    });
  }
}
