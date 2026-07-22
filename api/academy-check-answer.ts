import { GoogleGenAI } from "@google/genai";

const MIN_ANSWER_LENGTH = 18;
const MAX_ANSWER_LENGTH = 200;
const MAX_CONTEXT_LENGTH = 5000;
const PASS_SCORE = 70;
const DEFAULT_MODEL = "gemini-2.5-flash";

const STOP_WORDS = new Set([
  "about", "after", "again", "also", "and", "are", "because", "been", "before", "being", "between",
  "can", "could", "does", "each", "explain", "from", "have", "into", "more", "must", "only", "other",
  "should", "that", "their", "them", "then", "there", "these", "this", "those", "through", "using", "what",
  "when", "where", "which", "while", "with", "would", "your", "zelf", "antwoord", "beschrijf", "deze",
  "door", "drie", "eigen", "een", "gebruikt", "heeft", "het", "hoe", "ieder", "kan", "komt", "leggen",
  "meer", "moet", "naar", "niet", "noem", "omdat", "onder", "over", "voor", "waar", "waarom", "welke",
  "wordt", "woorden", "zijn", "zoals", "zonder",
]);

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
  suggestedAnswer?: unknown;
  strengths?: unknown;
};

type CleanAssessment = {
  taskId: string;
  score: number;
  passed: boolean;
  feedback: string;
  missingConcepts: string[];
};

type CoachPayload = {
  provider: "gemini" | "rubric-fallback";
  label: string;
  strengths: string[];
  suggestedAnswer: string;
  note: string;
};

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanScore(value: unknown) {
  const score = typeof value === "number" ? value : Number(value);
  return Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : 0;
}

function cleanList(value: unknown, maximum: number) {
  return Array.isArray(value)
    ? value.map(getString).filter(Boolean).slice(0, maximum)
    : [];
}

function cleanAssessment(taskId: string, value: ModelAssessment): CleanAssessment {
  const score = cleanScore(value.score);
  const feedback = getString(value.feedback).slice(0, 700) || "No feedback was returned.";
  const missingConcepts = cleanList(value.missingConcepts, 8);

  return {
    taskId,
    score,
    passed: score >= PASS_SCORE && value.passed !== false,
    feedback,
    missingConcepts,
  };
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value: string) {
  return normalizeText(value)
    .split(" ")
    .map((word) => word.replace(/^-+|-+$/g, ""))
    .filter((word) => word.length >= 4 && !STOP_WORDS.has(word));
}

function getConcepts(question: string, lessonContext: string) {
  const weights = new Map<string, number>();

  for (const word of tokenize(question)) {
    weights.set(word, (weights.get(word) ?? 0) + 5);
  }

  for (const word of tokenize(lessonContext)) {
    weights.set(word, (weights.get(word) ?? 0) + 1);
  }

  return [...weights.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([word]) => word)
    .slice(0, 10);
}

function selectHelpfulContext(lessonContext: string, concepts: string[]) {
  const sentences = lessonContext
    .split(/(?<=[.!?])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 30 && sentence.length <= 360);

  const ranked = sentences
    .map((sentence) => {
      const normalized = normalizeText(sentence);
      const overlap = concepts.filter((concept) => normalized.includes(concept)).length;
      return { sentence, overlap };
    })
    .filter((item) => item.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap || a.sentence.length - b.sentence.length)
    .slice(0, 2)
    .map((item) => item.sentence);

  return ranked.join(" ").slice(0, 650);
}

function fallbackAssessment(input: {
  taskId: string;
  question: string;
  answer: string;
  lessonContext: string;
  language: "nl" | "en";
}) {
  const concepts = getConcepts(input.question, input.lessonContext);
  const answerWords = tokenize(input.answer);
  const answerSet = new Set(answerWords);
  const matched = concepts.filter((concept) => answerSet.has(concept));
  const missing = concepts.filter((concept) => !answerSet.has(concept)).slice(0, 4);
  const conceptRatio = concepts.length > 0 ? matched.length / concepts.length : 0.4;
  const uniqueWordCount = new Set(answerWords).size;
  const lengthPoints = Math.min(20, Math.max(5, Math.round(input.answer.length / 7)));
  const conceptPoints = Math.round(conceptRatio * 55);
  const reasoningPoints = /\b(omdat|waardoor|zodat|daarom|betekent|because|therefore|means|which means|so that)\b/i.test(input.answer)
    ? 10
    : 3;
  const detailPoints = uniqueWordCount >= 16 ? 10 : uniqueWordCount >= 10 ? 7 : uniqueWordCount >= 6 ? 4 : 1;
  let score = Math.min(88, 5 + lengthPoints + conceptPoints + reasoningPoints + detailPoints);

  const normalizedQuestion = normalizeText(input.question);
  const normalizedAnswer = normalizeText(input.answer);
  const questionWords = new Set(tokenize(input.question));
  const newWords = answerWords.filter((word) => !questionWords.has(word));

  if (normalizedAnswer === normalizedQuestion || new Set(newWords).size < 3) {
    score = Math.min(score, 35);
  }

  if (input.answer.length < 35) {
    score = Math.min(score, 55);
  }

  const passed = score >= PASS_SCORE;
  const helpfulContext = selectHelpfulContext(input.lessonContext, concepts);
  const strengths = matched.slice(0, 4);
  const language = input.language;
  const feedback = passed
    ? language === "nl"
      ? `Goed begin. Je antwoord laat begrip zien en benoemt ${matched.length || "enkele"} relevante kernbegrippen. Maak de uitleg nog sterker met een duidelijk oorzaak-gevolgverband.`
      : `Good start. Your answer demonstrates understanding and includes ${matched.length || "some"} relevant concepts. Make it even stronger with a clear cause-and-effect explanation.`
    : language === "nl"
      ? `Je antwoord heeft een begin, maar is nog niet volledig genoeg voor 70%. Leg concreter uit wat het begrip doet, waarom het belangrijk is en hoe het bij de vraag past.`
      : `Your answer has a starting point, but it is not complete enough for 70%. Explain more concretely what the concept does, why it matters and how it answers the question.`;
  const suggestedAnswer = helpfulContext
    ? language === "nl"
      ? `Een sterker antwoord kan deze lespunten in eigen woorden combineren: ${helpfulContext}`
      : `A stronger answer can combine these lesson points in your own words: ${helpfulContext}`
    : language === "nl"
      ? `Benoem eerst het kernbegrip, leg daarna uit hoe het werkt en sluit af met waarom dit belangrijk is voor de vraag.`
      : `Name the core concept first, explain how it works, and finish with why it matters for the question.`;

  const assessment: CleanAssessment = {
    taskId: input.taskId,
    score,
    passed,
    feedback,
    missingConcepts: missing,
  };
  const coach: CoachPayload = {
    provider: "rubric-fallback",
    label: language === "nl" ? "OTT oefencoach" : "OTT practice coach",
    strengths,
    suggestedAnswer,
    note: language === "nl"
      ? "Dit is directe oefenfeedback op basis van de lesinhoud. Alleen een geconfigureerde server-AI-beoordeling kan later als geverifieerde NFT-score meetellen."
      : "This is immediate practice feedback based on the lesson content. Only a configured server AI assessment can later count as a verified NFT score.",
  };

  return { assessment, coach };
}

async function geminiAssessment(input: {
  apiKey: string;
  model: string;
  taskId: string;
  lessonId: string;
  question: string;
  answer: string;
  lessonContext: string;
  language: "nl" | "en";
}) {
  const ai = new GoogleGenAI({ apiKey: input.apiKey });
  const prompt = `You are the supportive AI coach for OTT Academy, an XRPL education platform.

Assess one learner answer against the question and supplied lesson context.
Rules:
- Accept correct explanations in Dutch or English, including normal spelling mistakes.
- Reward demonstrated understanding, not copied wording.
- Reject vague, circular, copied-question, gibberish or unsafe answers.
- Score from 0 to 100. A score of ${PASS_SCORE} or higher passes.
- Give concise constructive feedback in the learner's preferred language (${input.language}).
- Identify useful strengths and missing concepts.
- Provide one concise example of a stronger answer based only on the supplied lesson context.
- This is practice feedback only. Do not claim the lesson is officially completed.
- Return JSON only in this exact shape:
{"score":0,"passed":false,"feedback":"...","missingConcepts":["..."],"strengths":["..."],"suggestedAnswer":"..."}

Lesson ID: ${input.lessonId}
Task ID: ${input.taskId}
Question: ${input.question}
Lesson context: ${input.lessonContext || "No extra context supplied."}
Learner answer: ${input.answer}`;

  const response = await ai.models.generateContent({
    model: input.model,
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
  const assessment = cleanAssessment(input.taskId, parsed);
  const coach: CoachPayload = {
    provider: "gemini",
    label: "Gemini AI Coach",
    strengths: cleanList(parsed.strengths, 6),
    suggestedAnswer: getString(parsed.suggestedAnswer).slice(0, 900),
    note: input.language === "nl"
      ? "AI-oefenfeedback. De definitieve lesscore wordt bij Les berekenen en opslaan opnieuw server-side gecontroleerd."
      : "AI practice feedback. The final lesson score is recalculated server-side when the lesson is saved.",
  };

  return { assessment, coach };
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

    const apiKey = process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim() || "";
    const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;

    if (apiKey) {
      try {
        const result = await geminiAssessment({
          apiKey,
          model,
          taskId,
          lessonId,
          question,
          answer,
          lessonContext,
          language,
        });

        return res.status(200).json({
          ok: true,
          mode: "ai",
          passScore: PASS_SCORE,
          ...result,
          assessedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.warn("Gemini Academy coach failed; using rubric fallback.", error);
      }
    }

    const result = fallbackAssessment({ taskId, question, answer, lessonContext, language });
    return res.status(200).json({
      ok: true,
      mode: "rubric-fallback",
      passScore: PASS_SCORE,
      ...result,
      assessedAt: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown Academy answer check error.",
    });
  }
}
