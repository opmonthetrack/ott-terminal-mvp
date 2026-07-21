import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

const MAX_ANSWER_LENGTH = 200;
const MIN_ANSWER_LENGTH = 18;
const PASS_SCORE = 70;
const DEFAULT_MODEL = "gemini-2.5-flash";
const COURSE_VERSION = "1.0";
const LESSON_VERSION = "1.0";
const ASSESSMENT_VERSION = "1.0";

type AcademyTask = {
  id: string;
  promptEn: string;
  promptNl: string;
  rubric: string;
};

type AcademyLessonAssessment = {
  title: string;
  tasks: AcademyTask[];
};

type AcademyReward = {
  xp: number;
  credits: number;
};

const LESSON_REWARDS: Record<string, AcademyReward> = {
  "blockchain-crypto-basics": { xp: 25, credits: 1 },
  "intro-to-xrpl": { xp: 25, credits: 1 },
  "payments-use-cases": { xp: 25, credits: 2 },
  "source-tag-proof": { xp: 15, credits: 2 },
  "defi-island": { xp: 20, credits: 1 },
  "blockchain-for-business": { xp: 45, credits: 4 },
  "decentralized-identity": { xp: 40, credits: 4 },
  "deep-dive-defi": { xp: 40, credits: 3 },
  "tokenization-rwa": { xp: 45, credits: 4 },
  stablecoins: { xp: 35, credits: 3 },
  "defi-exchanges-lending-trading": { xp: 45, credits: 4 },
  "build-react": { xp: 50, credits: 5 },
  "code-javascript": { xp: 50, credits: 5 },
  "agentic-transactions": { xp: 60, credits: 6 },
};

const LESSON_ASSESSMENTS: Record<string, AcademyLessonAssessment> = {
  "blockchain-crypto-basics": {
    title: "Blockchain & Crypto Basics",
    tasks: [
      {
        id: "task-1",
        promptEn: "Explain in your own words what a ledger is.",
        promptNl: "Leg in eigen woorden uit wat een ledger is.",
        rubric: "Explain a ledger as a shared or recorded history of balances or transactions, not a wallet or prediction tool.",
      },
      {
        id: "task-2",
        promptEn: "Name three risks to consider before using a wallet.",
        promptNl: "Noem drie risico's voordat je een wallet gebruikt.",
        rubric: "Include three meaningful risks such as recovery loss, phishing, wrong destination, malicious links, device compromise or irreversible transactions.",
      },
      {
        id: "task-3",
        promptEn: "Explain why understanding should come before signing.",
        promptNl: "Leg uit waarom begrijpen vóór ondertekenen komt.",
        rubric: "Connect self-custody, irreversible authorization, transaction review and avoiding blind signing.",
      },
    ],
  },
  "intro-to-xrpl": {
    title: "Introduction to the XRPL",
    tasks: [
      {
        id: "task-1",
        promptEn: "Explain what the XRP Ledger is.",
        promptNl: "Leg uit wat de XRP Ledger is.",
        rubric: "Describe XRPL as a public decentralized ledger and network for transactions and assets, not Ripple's private database.",
      },
      {
        id: "task-2",
        promptEn: "What should you check when looking up an XRPL transaction?",
        promptNl: "Wat controleer je bij het opzoeken van een XRPL-transactie?",
        rubric: "Mention validated status, transaction result, account or destination, amount, ledger index and memo or tag where relevant.",
      },
      {
        id: "task-3",
        promptEn: "Why is finality useful for proof actions?",
        promptNl: "Waarom is finaliteit nuttig voor proof-acties?",
        rubric: "Explain that validated transactions become reliable evidence and are not merely pending promises.",
      },
    ],
  },
  "payments-use-cases": {
    title: "Payments on XRPL",
    tasks: [
      {
        id: "task-1",
        promptEn: "Describe the parts of a safe XRPL proof payment.",
        promptNl: "Beschrijf de onderdelen van een veilige XRPL-proofbetaling.",
        rubric: "Include correct destination, amount, signing account, memo or SourceTag, review in the wallet and validated success.",
      },
      {
        id: "task-2",
        promptEn: "What does tesSUCCESS mean and what does it not prove by itself?",
        promptNl: "Wat betekent tesSUCCESS en wat bewijst het niet op zichzelf?",
        rubric: "State successful execution while noting that destination, amount, account, memo, tag and validation still need checking.",
      },
      {
        id: "task-3",
        promptEn: "Explain why a memo and SourceTag can be useful.",
        promptNl: "Leg uit waarom een memo en SourceTag nuttig kunnen zijn.",
        rubric: "Connect them to public context, action identification, reconciliation and auditability without describing them as secret security.",
      },
    ],
  },
  "source-tag-proof": {
    title: "SourceTag 2606170002 Proof",
    tasks: [
      {
        id: "task-1",
        promptEn: "What does SourceTag 2606170002 identify in OTT Terminal?",
        promptNl: "Wat identificeert SourceTag 2606170002 in OTT Terminal?",
        rubric: "Identify it as the public OTT Make Waves tracking and proof tag, not a password or private wallet credential.",
      },
      {
        id: "task-2",
        promptEn: "Which transaction fields must be checked alongside SourceTag?",
        promptNl: "Welke transactievelden controleer je naast SourceTag?",
        rubric: "Mention validated status, result, account, destination, amount, memo or action and transaction hash or ledger.",
      },
      {
        id: "task-3",
        promptEn: "How do you prevent the same proof from rewarding twice?",
        promptNl: "Hoe voorkom je dat dezelfde proof dubbel wordt beloond?",
        rubric: "Mention a unique transaction hash or action key, a persistent record, duplicate checks or idempotency and crediting validated proof once.",
      },
    ],
  },
  "defi-island": {
    title: "Explore DeFi-Island",
    tasks: [
      {
        id: "task-1",
        promptEn: "Describe one DeFi concept you encountered.",
        promptNl: "Beschrijf één DeFi-concept dat je tegenkwam.",
        rubric: "Accurately describe a concept such as liquidity, swap, AMM, DEX, trustline, testnet or risk.",
      },
      {
        id: "task-2",
        promptEn: "Why is testnet appropriate for learning quests?",
        promptNl: "Waarom is testnet geschikt voor leerquests?",
        rubric: "Explain safe experimentation without risking real funds and that test assets have no real value.",
      },
      {
        id: "task-3",
        promptEn: "What safety lesson should a gamified DeFi quest include?",
        promptNl: "Welke veiligheidsles hoort in een gamified DeFi-quest?",
        rubric: "Include transaction review, no guaranteed returns, self-custody, phishing awareness or understanding risk before action.",
      },
    ],
  },
  "blockchain-for-business": {
    title: "Blockchain for Business",
    tasks: [
      {
        id: "task-1",
        promptEn: "Describe one realistic business problem for XRPL.",
        promptNl: "Beschrijf één realistisch bedrijfsprobleem voor XRPL.",
        rubric: "Identify a concrete operational problem rather than vague profit claims.",
      },
      {
        id: "task-2",
        promptEn: "Describe the XRPL route and its proof trail.",
        promptNl: "Beschrijf de XRPL-route en de proof trail.",
        rubric: "Connect the business action to transaction fields, validation, identifiers or memos and auditable records.",
      },
      {
        id: "task-3",
        promptEn: "What compliance or human review is still needed?",
        promptNl: "Welke compliance of menselijke controle blijft nodig?",
        rubric: "State that blockchain does not replace legal, privacy, accounting, identity, sanctions or business-process review.",
      },
    ],
  },
  "decentralized-identity": {
    title: "Decentralized Identity",
    tasks: [
      {
        id: "task-1",
        promptEn: "Describe a useful proof badge.",
        promptNl: "Beschrijf een nuttige proofbadge.",
        rubric: "Identify a specific achievement or credential, issuer, verification method and limited meaning.",
      },
      {
        id: "task-2",
        promptEn: "What profile data should remain private?",
        promptNl: "Welke profielgegevens moeten privé blijven?",
        rubric: "Mention sensitive personal data, private keys or recovery secrets, unnecessary wallet history, identity documents or consent-based disclosure.",
      },
      {
        id: "task-3",
        promptEn: "How should a certificate be linked to a wallet safely?",
        promptNl: "Hoe koppel je een certificaat veilig aan een wallet?",
        rubric: "Mention wallet signature or ownership proof, issuer verification, no private keys, consent and duplicate or revocation considerations.",
      },
    ],
  },
  "deep-dive-defi": {
    title: "XRPL DeFi",
    tasks: [
      {
        id: "task-1",
        promptEn: "Explain an AMM without promising profit.",
        promptNl: "Leg een AMM uit zonder winstbelofte.",
        rubric: "Explain pooled liquidity and algorithmic pricing and include risks such as price movement, impermanent loss, slippage or protocol risk.",
      },
      {
        id: "task-2",
        promptEn: "Compare a decentralized exchange with a broker.",
        promptNl: "Vergelijk een decentrale exchange met een broker.",
        rubric: "Distinguish self-custody and on-ledger execution from an intermediary or custodial service and mention different responsibilities and risks.",
      },
      {
        id: "task-3",
        promptEn: "Name three meaningful DeFi risks.",
        promptNl: "Noem drie betekenisvolle DeFi-risico's.",
        rubric: "Provide three distinct risks such as liquidity, volatility, slippage, impermanent loss, issuer, exploit, regulatory or signing risk.",
      },
    ],
  },
  "tokenization-rwa": {
    title: "Tokenization & RWA",
    tasks: [
      {
        id: "task-1",
        promptEn: "Give a utility-only tokenization example.",
        promptNl: "Geef een utility-only tokenisatievoorbeeld.",
        rubric: "Describe access, certificate, ticket, proof or service utility without guaranteed value or investment return.",
      },
      {
        id: "task-2",
        promptEn: "What must never be promised without legal approval?",
        promptNl: "Wat mag nooit zonder juridische goedkeuring worden beloofd?",
        rubric: "Mention guaranteed profit, yield or value, ownership claims, redemption, regulated rights or misleading investment language.",
      },
      {
        id: "task-3",
        promptEn: "Why must the off-chain asset and issuer be verified?",
        promptNl: "Waarom moeten het off-chain actief en de issuer worden geverifieerd?",
        rubric: "Explain that a token does not by itself prove legal ownership, authenticity, reserves, enforceability or issuer reliability.",
      },
    ],
  },
  stablecoins: {
    title: "Stablecoins on XRPL",
    tasks: [
      {
        id: "task-1",
        promptEn: "Explain a stablecoin without calling it a bank deposit.",
        promptNl: "Leg een stablecoin uit zonder het een bankdeposito te noemen.",
        rubric: "Explain an issued token targeting a value and avoid claiming automatic deposit insurance or risk-free redemption.",
      },
      {
        id: "task-2",
        promptEn: "Which issuer risks should a user check?",
        promptNl: "Welke issuerrisico's moet een gebruiker controleren?",
        rubric: "Mention reserves or redemption, regulation, solvency, freeze or clawback settings, trustlines, transparency or counterparty risk.",
      },
      {
        id: "task-3",
        promptEn: "Create a short stablecoin safety checklist.",
        promptNl: "Maak een korte stablecoin-veiligheidschecklist.",
        rubric: "Include correct currency and issuer, trustline, terms or redemption, wallet or destination, transaction review and risk awareness.",
      },
    ],
  },
  "defi-exchanges-lending-trading": {
    title: "Exchanges, Lending & Trading",
    tasks: [
      {
        id: "task-1",
        promptEn: "Give a balanced risk analysis for a DeFi action.",
        promptNl: "Geef een gebalanceerde risicoanalyse voor een DeFi-actie.",
        rubric: "Include mechanism and multiple risks without giving a guaranteed outcome or personalized trade instruction.",
      },
      {
        id: "task-2",
        promptEn: "Explain the difference between education and financial advice.",
        promptNl: "Leg het verschil uit tussen educatie en financieel advies.",
        rubric: "Distinguish general information and risk learning from personalized recommendations or instructions to buy, sell or allocate funds.",
      },
      {
        id: "task-3",
        promptEn: "List three promises an education platform should not make.",
        promptNl: "Noem drie beloften die een educatieplatform niet moet maken.",
        rubric: "List three misleading promises such as guaranteed profit, no risk, fixed yield, price certainty or automatic recovery.",
      },
    ],
  },
  "build-react": {
    title: "Build with XRPL and React",
    tasks: [
      {
        id: "task-1",
        promptEn: "Outline a safe XRPL React component flow.",
        promptNl: "Schets een veilige XRPL React-componentflow.",
        rubric: "Include input and state, server payload creation, wallet signing, return verification, loading or error states and no secret exposure.",
      },
      {
        id: "task-2",
        promptEn: "Describe safe signing UX.",
        promptNl: "Beschrijf veilige signing-UX.",
        rubric: "Show transaction type, destination, amount, memo or tag, network, user confirmation and clear success or failure states.",
      },
      {
        id: "task-3",
        promptEn: "Why should a new transaction flow start on testnet?",
        promptNl: "Waarom start een nieuwe transactieflow op testnet?",
        rubric: "Explain testing without real funds, detecting bugs, validating assumptions and moving to mainnet only after review.",
      },
    ],
  },
  "code-javascript": {
    title: "Code with XRPL and JavaScript",
    tasks: [
      {
        id: "task-1",
        promptEn: "Describe pseudocode for transaction verification.",
        promptNl: "Beschrijf pseudocode voor transactieverificatie.",
        rubric: "Fetch by hash and check validated status, result, transaction type, account or destination, amount and memo or tag before crediting.",
      },
      {
        id: "task-2",
        promptEn: "Name three security checks in an XRPL app.",
        promptNl: "Noem drie veiligheidschecks in een XRPL-app.",
        rubric: "Name three checks such as server-side validation, allowlists, address validation, exact amounts, signature result, duplicate protection or secret isolation.",
      },
      {
        id: "task-3",
        promptEn: "Explain why secrets must stay server-side.",
        promptNl: "Leg uit waarom secrets server-side moeten blijven.",
        rubric: "State that browser code is public and API secrets or private credentials must not be exposed to clients or repositories.",
      },
    ],
  },
  "agentic-transactions": {
    title: "AI Agents & Transactions",
    tasks: [
      {
        id: "task-1",
        promptEn: "What may and may not an AI payment agent do?",
        promptNl: "Wat mag een AI-betaalagent wel en niet doen?",
        rubric: "Include explicit scope or allowlists and prohibit unlimited autonomous spending, recovery-secret access or unreviewed high-risk actions.",
      },
      {
        id: "task-2",
        promptEn: "Create a useful agent limit list.",
        promptNl: "Maak een nuttige limietenlijst voor een agent.",
        rubric: "Include amount, destination, frequency, asset or network, timeout, human approval, logging or emergency-stop limits.",
      },
      {
        id: "task-3",
        promptEn: "Why are audit trails and human control required?",
        promptNl: "Waarom zijn audit trails en menselijke controle nodig?",
        rubric: "Explain accountability, error detection, abuse prevention, review, stop decisions and compliance.",
      },
    ],
  },
};

type RequestBody = {
  lessonId?: unknown;
  language?: unknown;
  walletAddress?: unknown;
  answers?: unknown;
};

type RequestLike = {
  method?: string;
  body?: RequestBody;
  headers?: Record<string, string | string[] | undefined>;
};

type ResponseLike = {
  status: (code: number) => {
    json: (body: unknown) => void;
  };
};

type SubmittedAnswer = {
  taskId: string;
  answer: string;
};

type ModelAssessment = {
  taskId?: unknown;
  score?: unknown;
  passed?: unknown;
  feedback?: unknown;
  missingConcepts?: unknown;
};

type CleanAssessment = {
  taskId: string;
  passed: boolean;
  score: number;
  feedback: string;
  missingConcepts: string[];
};

type AccountStorageResult = {
  authenticated: boolean;
  stored: boolean;
  preservedHigherScore?: boolean;
  error?: string;
};

function getApiKey() {
  return process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim() || "";
}

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isLikelyXrplAddress(value: string) {
  return /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(value);
}

function parseAnswers(value: unknown): SubmittedAnswer[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const record = item as Record<string, unknown>;
      const taskId = getString(record.taskId);
      const answer = getString(record.answer);
      return taskId && answer ? { taskId, answer } : null;
    })
    .filter((item): item is SubmittedAnswer => Boolean(item));
}

function cleanModelAssessment(value: ModelAssessment, task: AcademyTask): CleanAssessment {
  const rawScore = typeof value.score === "number" ? value.score : Number(value.score);
  const score = Number.isFinite(rawScore)
    ? Math.max(0, Math.min(100, Math.round(rawScore)))
    : 0;
  const feedback = getString(value.feedback).slice(0, 220) || "Answer needs a clearer explanation.";
  const missingConcepts = Array.isArray(value.missingConcepts)
    ? value.missingConcepts
        .map((item) => getString(item).slice(0, 80))
        .filter(Boolean)
        .slice(0, 5)
    : [];

  return {
    taskId: task.id,
    passed: score >= PASS_SCORE,
    score,
    feedback,
    missingConcepts,
  };
}

function getBearerToken(req: RequestLike) {
  const rawHeader = req.headers?.authorization ?? req.headers?.Authorization;
  const authorization = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;

  if (!authorization?.startsWith("Bearer ")) {
    return "";
  }

  return authorization.slice("Bearer ".length).trim();
}

async function storeVerifiedCompletion(input: {
  req: RequestLike;
  lessonId: string;
  overallScore: number;
  assessments: CleanAssessment[];
  model: string;
}) : Promise<AccountStorageResult> {
  const token = getBearerToken(input.req);

  if (!token) {
    return { authenticated: false, stored: false };
  }

  const supabaseUrl = process.env.SUPABASE_URL?.trim() || process.env.VITE_SUPABASE_URL?.trim() || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";

  if (!supabaseUrl || !serviceRoleKey) {
    return {
      authenticated: true,
      stored: false,
      error: "Trusted Academy storage is not configured on the server.",
    };
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
    return {
      authenticated: false,
      stored: false,
      error: "The OTT account session could not be verified.",
    };
  }

  const reward = LESSON_REWARDS[input.lessonId] ?? { xp: 0, credits: 0 };
  const { data: existing, error: existingError } = await admin
    .from("academy_completions")
    .select("overall_score")
    .eq("user_id", userData.user.id)
    .eq("course_id", input.lessonId)
    .eq("course_version", COURSE_VERSION)
    .maybeSingle();

  if (existingError) {
    return { authenticated: true, stored: false, error: "Could not check existing Academy progress." };
  }

  if (existing && Number(existing.overall_score) >= input.overallScore) {
    return { authenticated: true, stored: true, preservedHigherScore: true };
  }

  const { error } = await admin.from("academy_completions").upsert(
    {
      user_id: userData.user.id,
      course_id: input.lessonId,
      course_version: COURSE_VERSION,
      lesson_version: LESSON_VERSION,
      overall_score: input.overallScore,
      xp: reward.xp,
      credits: reward.credits,
      assessments: input.assessments,
      completed_at: new Date().toISOString(),
      verified_by: "server-ai",
      verification_model: input.model,
      assessment_version: ASSESSMENT_VERSION,
    },
    { onConflict: "user_id,course_id,course_version" },
  );

  if (error) {
    return { authenticated: true, stored: false, error: "Could not store verified Academy progress." };
  }

  return { authenticated: true, stored: true };
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed. Use POST." });
  }

  try {
    const lessonId = getString(req.body?.lessonId);
    const language = getString(req.body?.language) === "nl" ? "nl" : "en";
    const walletAddress = getString(req.body?.walletAddress);
    const answers = parseAnswers(req.body?.answers);
    const lesson = LESSON_ASSESSMENTS[lessonId];

    if (!lesson) {
      return res.status(400).json({ ok: false, error: "Unknown Academy lesson." });
    }

    if (walletAddress && walletAddress !== "guest" && !isLikelyXrplAddress(walletAddress)) {
      return res.status(400).json({ ok: false, error: "Invalid wallet address." });
    }

    if (answers.length !== lesson.tasks.length) {
      return res.status(400).json({
        ok: false,
        error: `Answer all ${lesson.tasks.length} tasks before assessment.`,
      });
    }

    for (const task of lesson.tasks) {
      const submitted = answers.find((item) => item.taskId === task.id);

      if (!submitted) {
        return res.status(400).json({ ok: false, error: `Missing answer for ${task.id}.` });
      }

      if (submitted.answer.length < MIN_ANSWER_LENGTH) {
        return res.status(400).json({
          ok: false,
          error: `Answer ${task.id} is too short. Explain your reasoning in at least ${MIN_ANSWER_LENGTH} characters.`,
        });
      }

      if (submitted.answer.length > MAX_ANSWER_LENGTH) {
        return res.status(400).json({
          ok: false,
          error: `Answer ${task.id} exceeds the ${MAX_ANSWER_LENGTH}-character limit.`,
        });
      }
    }

    const apiKey = getApiKey();

    if (!apiKey) {
      return res.status(503).json({
        ok: false,
        error: "AI Academy assessor is not configured. Add GEMINI_API_KEY in Vercel.",
      });
    }

    const taskPayload = lesson.tasks.map((task) => ({
      taskId: task.id,
      question: language === "nl" ? task.promptNl : task.promptEn,
      rubric: task.rubric,
      answer: answers.find((item) => item.taskId === task.id)?.answer ?? "",
    }));

    const prompt = `You are the strict but fair assessment engine for OTT Academy, an XRPL education platform.

Assess every learner answer independently against its rubric.
Rules:
- Accept correct explanations in Dutch or English, including normal spelling mistakes.
- Do not require exact wording.
- Reject empty, vague, circular, copied-question, gibberish or unsafe answers.
- Do not reward confidence; reward demonstrated understanding.
- Scores of 70 or higher pass. Every task must pass for the course to complete.
- Give concise, constructive feedback. Never invent facts outside the rubric.
- Return JSON only with this exact shape:
{"assessments":[{"taskId":"task-1","score":0,"passed":false,"feedback":"...","missingConcepts":["..."]}]}

Lesson: ${lesson.title}
Language preference: ${language}
Tasks and answers:
${JSON.stringify(taskPayload)}`;

    const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
    const ai = new GoogleGenAI({ apiKey });
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
      throw new Error("AI assessor returned an empty response.");
    }

    const parsed = JSON.parse(responseText) as { assessments?: ModelAssessment[] };
    const modelAssessments = Array.isArray(parsed.assessments) ? parsed.assessments : [];
    const assessments = lesson.tasks.map((task) => {
      const modelAssessment = modelAssessments.find(
        (item) => getString(item.taskId) === task.id,
      );
      return cleanModelAssessment(modelAssessment ?? {}, task);
    });
    const overallPassed = assessments.every((item) => item.passed);
    const overallScore = Math.round(
      assessments.reduce((sum, item) => sum + item.score, 0) / assessments.length,
    );
    const accountStorage = overallPassed
      ? await storeVerifiedCompletion({ req, lessonId, overallScore, assessments, model })
      : { authenticated: Boolean(getBearerToken(req)), stored: false };

    return res.status(200).json({
      ok: true,
      mode: "ai",
      lesson: {
        id: lessonId,
        title: lesson.title,
      },
      rules: {
        passScore: PASS_SCORE,
        allTasksRequired: true,
        maxAnswerLength: MAX_ANSWER_LENGTH,
      },
      overallPassed,
      overallScore,
      assessments,
      assessedAt: new Date().toISOString(),
      accountStorage,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown Academy assessment error.",
    });
  }
}
