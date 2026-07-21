import { GoogleGenAI } from "@google/genai";

const MAX_ANSWER_LENGTH = 200;
const MIN_ANSWER_LENGTH = 18;
const PASS_SCORE = 70;
const DEFAULT_MODEL = "gemini-2.5-flash";

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

const LESSON_ASSESSMENTS: Record<string, AcademyLessonAssessment> = {
  "blockchain-crypto-basics": {
    title: "Blockchain & Crypto Basics",
    tasks: [
      {
        id: "task-1",
        promptEn: "Explain in your own words what a ledger is.",
        promptNl: "Leg in eigen woorden uit wat een ledger is.",
        rubric: "Must explain that a ledger is a shared/recorded history of balances or transactions, not a wallet or a prediction tool.",
      },
      {
        id: "task-2",
        promptEn: "Name three risks to consider before using a wallet.",
        promptNl: "Noem drie risico's voordat je een wallet gebruikt.",
        rubric: "Must include three meaningful risks such as seed loss, phishing, wrong address, malicious links, device compromise, scams, or irreversible transactions.",
      },
      {
        id: "task-3",
        promptEn: "Explain why understanding should come before signing.",
        promptNl: "Leg uit waarom begrijpen vóór ondertekenen komt.",
        rubric: "Must connect self-custody, irreversible authorization, transaction review, and avoiding blind signing.",
      },
    ],
  },
  "intro-to-xrpl": {
    title: "Intro to the XRPL",
    tasks: [
      {
        id: "task-1",
        promptEn: "Explain what the XRP Ledger is.",
        promptNl: "Leg uit wat de XRP Ledger is.",
        rubric: "Must describe XRPL as a public decentralized ledger/network for transactions and assets, not as Ripple's private database.",
      },
      {
        id: "task-2",
        promptEn: "What should you check when looking up an XRPL transaction?",
        promptNl: "Wat controleer je bij het opzoeken van een XRPL-transactie?",
        rubric: "Must mention validated status, transaction result such as tesSUCCESS, account/destination, amount, ledger index, memo or SourceTag where relevant.",
      },
      {
        id: "task-3",
        promptEn: "Why is finality useful for proof actions?",
        promptNl: "Waarom is finaliteit nuttig voor proof-acties?",
        rubric: "Must explain that validated transactions become reliable evidence and are not merely pending or reversible promises.",
      },
    ],
  },
  "payments-use-cases": {
    title: "Payments Use Cases on XRPL",
    tasks: [
      {
        id: "task-1",
        promptEn: "Describe the parts of a safe XRPL proof payment.",
        promptNl: "Beschrijf de onderdelen van een veilige XRPL-proofbetaling.",
        rubric: "Must include correct destination, amount, signing wallet, SourceTag/memo, review in Xaman, and validated success.",
      },
      {
        id: "task-2",
        promptEn: "What does tesSUCCESS mean and what does it not prove by itself?",
        promptNl: "Wat betekent tesSUCCESS en wat bewijst het niet op zichzelf?",
        rubric: "Must state successful execution while noting that destination, amount, memo, account, SourceTag and validation still need checking.",
      },
      {
        id: "task-3",
        promptEn: "Explain why a memo and SourceTag can be useful.",
        promptNl: "Leg uit waarom een memo en SourceTag nuttig kunnen zijn.",
        rubric: "Must connect them to public context, campaign/action identification, reconciliation, and auditability without claiming secret security.",
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
        rubric: "Must identify it as the public OTT Make Waves tracking/proof tag, not a password or private wallet credential.",
      },
      {
        id: "task-2",
        promptEn: "Which transaction fields must be checked alongside SourceTag?",
        promptNl: "Welke transactievelden controleer je naast SourceTag?",
        rubric: "Must mention validated status, tesSUCCESS, account, destination, amount, memo/action and transaction hash or ledger.",
      },
      {
        id: "task-3",
        promptEn: "How do you prevent the same proof from rewarding twice?",
        promptNl: "Hoe voorkom je dat dezelfde proof dubbel wordt beloond?",
        rubric: "Must mention unique transaction hash/action key, persistent record, duplicate check/idempotency, and only crediting validated proof once.",
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
        rubric: "Must accurately describe a real concept such as liquidity, swap, AMM, DEX, trustline, testnet, or risk.",
      },
      {
        id: "task-2",
        promptEn: "Why is testnet appropriate for learning quests?",
        promptNl: "Waarom is testnet geschikt voor leerquests?",
        rubric: "Must explain safe experimentation without risking real funds and that test assets have no real value.",
      },
      {
        id: "task-3",
        promptEn: "What safety lesson should a gamified DeFi quest include?",
        promptNl: "Welke veiligheidsles hoort in een gamified DeFi-quest?",
        rubric: "Must include transaction review, no guaranteed returns, self-custody, phishing awareness, or understanding risk before action.",
      },
    ],
  },
  "deep-dive-defi": {
    title: "Deep Dive into XRPL DeFi",
    tasks: [
      {
        id: "task-1",
        promptEn: "Explain an AMM without promising profit.",
        promptNl: "Leg een AMM uit zonder winstbelofte.",
        rubric: "Must explain pooled liquidity/algorithmic pricing and include risks such as price movement, impermanent loss, slippage or smart/protocol risk.",
      },
      {
        id: "task-2",
        promptEn: "Compare a decentralized exchange with a broker.",
        promptNl: "Vergelijk een decentrale exchange met een broker.",
        rubric: "Must distinguish self-custody/on-ledger execution from an intermediary/custodial service and mention different responsibilities and risks.",
      },
      {
        id: "task-3",
        promptEn: "Name three meaningful DeFi risks.",
        promptNl: "Noem drie betekenisvolle DeFi-risico's.",
        rubric: "Must provide three distinct risks such as liquidity, volatility, slippage, impermanent loss, issuer, exploit, scam, regulatory, or signing risk.",
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
        rubric: "Must identify a concrete operational problem rather than vague profit claims.",
      },
      {
        id: "task-2",
        promptEn: "Describe the XRPL route and its proof trail.",
        promptNl: "Beschrijf de XRPL-route en de proof trail.",
        rubric: "Must connect the business action to transaction fields, validation, identifiers/memos and auditable records.",
      },
      {
        id: "task-3",
        promptEn: "What compliance or human review is still needed?",
        promptNl: "Welke compliance of menselijke controle blijft nodig?",
        rubric: "Must state that blockchain does not replace legal, privacy, accounting, identity, sanctions or business-process review.",
      },
    ],
  },
  "tokenization-rwa": {
    title: "Tokenization & Real World Assets",
    tasks: [
      {
        id: "task-1",
        promptEn: "Give a utility-only tokenization example.",
        promptNl: "Geef een utility-only tokenisatievoorbeeld.",
        rubric: "Must describe access, certificate, ticket, proof or service utility without guaranteed value or investment return.",
      },
      {
        id: "task-2",
        promptEn: "What must never be promised without legal approval?",
        promptNl: "Wat mag nooit zonder juridische goedkeuring worden beloofd?",
        rubric: "Must mention guaranteed profit/yield/value, ownership claims, redemption, regulated rights, or misleading investment language.",
      },
      {
        id: "task-3",
        promptEn: "Why must the off-chain asset and issuer be verified?",
        promptNl: "Waarom moeten het off-chain actief en de issuer worden geverifieerd?",
        rubric: "Must explain that a token does not by itself prove legal ownership, authenticity, reserves, enforceability or issuer reliability.",
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
        rubric: "Must explain issued token/value targeting and avoid claiming automatic deposit insurance or risk-free redemption.",
      },
      {
        id: "task-2",
        promptEn: "Which issuer risks should a user check?",
        promptNl: "Welke issuer-risico's moet een gebruiker controleren?",
        rubric: "Must mention reserves/redemption, regulation, solvency, freeze/clawback/settings, trustline, transparency or counterparty risk.",
      },
      {
        id: "task-3",
        promptEn: "Create a short stablecoin safety checklist.",
        promptNl: "Maak een korte stablecoin-veiligheidschecklist.",
        rubric: "Must include correct currency/issuer, trustline, terms/redemption, wallet/destination, transaction review and risk awareness.",
      },
    ],
  },
  "defi-exchanges-lending-trading": {
    title: "Exploring DeFi: Exchanges, Lending & Trading",
    tasks: [
      {
        id: "task-1",
        promptEn: "Give a balanced risk analysis for a DeFi action.",
        promptNl: "Geef een gebalanceerde risicoanalyse voor een DeFi-actie.",
        rubric: "Must include both mechanism and multiple risks, without giving a guaranteed outcome or personalized trade instruction.",
      },
      {
        id: "task-2",
        promptEn: "Explain the difference between education and financial advice.",
        promptNl: "Leg het verschil uit tussen educatie en financieel advies.",
        rubric: "Must distinguish general information/risk learning from personalized recommendations or instructions to buy, sell or allocate funds.",
      },
      {
        id: "task-3",
        promptEn: "List three promises an education platform should not make.",
        promptNl: "Noem drie beloften die een educatieplatform niet moet maken.",
        rubric: "Must list three prohibited/misleading promises such as guaranteed profit, no risk, fixed yield, price certainty, or automatic recovery.",
      },
    ],
  },
  "decentralized-identity": {
    title: "Decentralized Identity on XRPL",
    tasks: [
      {
        id: "task-1",
        promptEn: "Describe a useful proof badge.",
        promptNl: "Beschrijf een nuttige proof badge.",
        rubric: "Must identify a specific achievement/credential, issuer, verification method and limited meaning.",
      },
      {
        id: "task-2",
        promptEn: "What profile data should remain private?",
        promptNl: "Welke profielgegevens moeten privé blijven?",
        rubric: "Must mention sensitive personal data, private keys/seeds, unnecessary wallet history, identity documents or consent-based disclosure.",
      },
      {
        id: "task-3",
        promptEn: "How should a certificate be linked to a wallet safely?",
        promptNl: "Hoe koppel je een certificaat veilig aan een wallet?",
        rubric: "Must mention wallet signature/ownership proof, issuer verification, no private keys, consent and revocation/duplicate considerations.",
      },
    ],
  },
  "build-react": {
    title: "Build with XRPL and React.js",
    tasks: [
      {
        id: "task-1",
        promptEn: "Outline a safe XRPL React component flow.",
        promptNl: "Schets een veilige XRPL React-componentflow.",
        rubric: "Must include input/state, server payload creation, Xaman signing, return/verification, loading/error states and no secret exposure.",
      },
      {
        id: "task-2",
        promptEn: "Describe safe signing UX.",
        promptNl: "Beschrijf veilige signing-UX.",
        rubric: "Must show transaction type, destination, amount, memo/tag, network, user confirmation and clear success/failure states.",
      },
      {
        id: "task-3",
        promptEn: "Why should a new transaction flow start on testnet?",
        promptNl: "Waarom start een nieuwe transactieflow op testnet?",
        rubric: "Must explain testing without real funds, detecting bugs, validating assumptions and moving to mainnet only after review.",
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
        rubric: "Must fetch by hash and check validated, tesSUCCESS, transaction type, account/destination, amount and memo/tag before crediting.",
      },
      {
        id: "task-2",
        promptEn: "Name three security checks in an XRPL app.",
        promptNl: "Noem drie veiligheidschecks in een XRPL-app.",
        rubric: "Must name three distinct checks such as server-side validation, allowlists, address validation, exact amounts, signature result, duplicate protection or secret isolation.",
      },
      {
        id: "task-3",
        promptEn: "Explain why secrets must stay server-side.",
        promptNl: "Leg uit waarom secrets server-side moeten blijven.",
        rubric: "Must state browser code is public and API secrets/private credentials must not be exposed to clients or repositories.",
      },
    ],
  },
  "agentic-transactions": {
    title: "AI Agents & Agentic Transactions",
    tasks: [
      {
        id: "task-1",
        promptEn: "What may and may not an AI payment agent do?",
        promptNl: "Wat mag een AI-betaalagent wel en niet doen?",
        rubric: "Must include explicit scope/allowlist and prohibit unlimited autonomous spending, seed access or unreviewed high-risk actions.",
      },
      {
        id: "task-2",
        promptEn: "Create a useful agent limit list.",
        promptNl: "Maak een nuttige limietenlijst voor een agent.",
        rubric: "Must include amount, destination, frequency, asset/network, timeout, human approval, logging or emergency stop limits.",
      },
      {
        id: "task-3",
        promptEn: "Why are audit trails and human control required?",
        promptNl: "Waarom zijn audit trails en menselijke controle nodig?",
        rubric: "Must explain accountability, error detection, abuse prevention, review, rollback/stop decisions and compliance.",
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

function cleanModelAssessment(
  value: ModelAssessment,
  task: AcademyTask,
) {
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
- Scores of 70 or higher pass. Every task must pass for the module to complete.
- Give concise, constructive feedback. Never invent facts outside the rubric.
- Return JSON only with this exact shape:
{"assessments":[{"taskId":"task-1","score":0,"passed":false,"feedback":"...","missingConcepts":["..."]}]}

Lesson: ${lesson.title}
Language preference: ${language}
Tasks and answers:
${JSON.stringify(taskPayload)}`;

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL,
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
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown Academy assessment error.",
    });
  }
}
