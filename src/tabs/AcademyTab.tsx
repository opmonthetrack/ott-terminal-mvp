import { useEffect, useMemo, useState, type ElementType } from "react";
import {
  Award,
  BadgeCheck,
  BookOpen,
  Brain,
  Building2,
  CheckCircle2,
  ChevronRight,
  Code2,
  Coins,
  Cpu,
  ExternalLink,
  Fingerprint,
  GraduationCap,
  Layers,
  Loader2,
  Lock,
  Network,
  Repeat2,
  ShieldCheck,
  Sparkles,
  Target,
  Wallet,
  XCircle,
} from "lucide-react";
import { OTTLogo, OTTProofBadge } from "../components/OTTLogo";
import { assessAcademyModule } from "../lib/academyAssessmentClient";
import {
  getAcademyProgressSummary,
  saveAcademyModuleCompletion,
  type AcademyAnswerAssessment,
} from "../lib/academyProgressStore";
import { MAKE_WAVES_SOURCE_TAG } from "../lib/makeWaves";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

type AcademyTabProps = {
  walletAddress?: string;
  onNavigate?: (target: string) => void;
};

type LessonStatus = "free" | "premium";
type Difficulty = "Beginner" | "Intermediate" | "Builder" | "Agentic";
type AcademyView = "path" | "module" | "proof";

type LessonTask = {
  id: string;
  promptNl: string;
  promptEn: string;
};

type Lesson = {
  id: string;
  module: string;
  difficulty: Difficulty;
  title: string;
  goalNl: string;
  goalEn: string;
  ottAngleNl: string;
  ottAngleEn: string;
  topics: string[];
  tasks: LessonTask[];
  sourceLabel: string;
  sourceUrl: string;
  minutes: number;
  status: LessonStatus;
  xp: number;
  credits: number;
  icon: ElementType;
};

const MAX_ANSWER_LENGTH = 200;

const lessons: Lesson[] = [
  {
    id: "blockchain-crypto-basics",
    module: "01",
    difficulty: "Beginner",
    title: "Blockchain & Crypto Basics",
    goalNl: "Begrijp blockchain, wallets, transacties en de basisrisico's voordat je tekent.",
    goalEn: "Understand blockchain, wallets, transactions and basic risks before signing.",
    ottAngleNl: "Eerst begrijpen, daarna pas ondertekenen.",
    ottAngleEn: "Understand first, sign later.",
    topics: ["Ledger", "Wallet", "Self-custody", "Transactions", "Risk"],
    tasks: [
      { id: "task-1", promptNl: "Leg in eigen woorden uit wat een ledger is.", promptEn: "Explain in your own words what a ledger is." },
      { id: "task-2", promptNl: "Noem drie risico's voordat je een wallet gebruikt.", promptEn: "Name three risks to consider before using a wallet." },
      { id: "task-3", promptNl: "Waarom moet begrijpen vóór ondertekenen komen?", promptEn: "Why should understanding come before signing?" },
    ],
    sourceLabel: "XRPL Learning Portal",
    sourceUrl: "https://learn.xrpl.org/",
    minutes: 90,
    status: "free",
    xp: 25,
    credits: 1,
    icon: BookOpen,
  },
  {
    id: "intro-to-xrpl",
    module: "02",
    difficulty: "Beginner",
    title: "Intro to the XRPL",
    goalNl: "Leer wat XRPL is en hoe je gevalideerde transacties leest.",
    goalEn: "Learn what XRPL is and how to read validated transactions.",
    ottAngleNl: `Koppel netwerkbegrip aan SourceTag ${MAKE_WAVES_SOURCE_TAG}.`,
    ottAngleEn: `Connect network understanding to SourceTag ${MAKE_WAVES_SOURCE_TAG}.`,
    topics: ["XRPL", "Accounts", "Validation", "Finality", "Explorer"],
    tasks: [
      { id: "task-1", promptNl: "Leg uit wat de XRP Ledger is.", promptEn: "Explain what the XRP Ledger is." },
      { id: "task-2", promptNl: "Wat controleer je bij een XRPL-transactie?", promptEn: "What should you check when looking up an XRPL transaction?" },
      { id: "task-3", promptNl: "Waarom is finaliteit nuttig voor proof-acties?", promptEn: "Why is finality useful for proof actions?" },
    ],
    sourceLabel: "XRPL Learning Portal · Intro",
    sourceUrl: "https://learn.xrpl.org/",
    minutes: 90,
    status: "free",
    xp: 25,
    credits: 1,
    icon: Network,
  },
  {
    id: "payments-use-cases",
    module: "03",
    difficulty: "Beginner",
    title: "Payments Use Cases on XRPL",
    goalNl: "Leer veilige XRPL-betalingen en proofbetalingen controleren.",
    goalEn: "Learn to verify safe XRPL payments and proof payments.",
    ottAngleNl: "Van payload naar gevalideerde proof, zonder custody.",
    ottAngleEn: "From payload to validated proof, without custody.",
    topics: ["Payment", "tesSUCCESS", "Memo", "SourceTag", "Validation"],
    tasks: [
      { id: "task-1", promptNl: "Beschrijf een veilige XRPL-proofbetaling.", promptEn: "Describe the parts of a safe XRPL proof payment." },
      { id: "task-2", promptNl: "Wat betekent tesSUCCESS en wat bewijst het niet alleen?", promptEn: "What does tesSUCCESS mean and what does it not prove by itself?" },
      { id: "task-3", promptNl: "Waarom zijn memo en SourceTag nuttig?", promptEn: "Why can a memo and SourceTag be useful?" },
    ],
    sourceLabel: "XRPL Learning Portal · Payments",
    sourceUrl: "https://learn.xrpl.org/",
    minutes: 90,
    status: "free",
    xp: 25,
    credits: 2,
    icon: Wallet,
  },
  {
    id: "source-tag-proof",
    module: "04",
    difficulty: "Beginner",
    title: `SourceTag ${MAKE_WAVES_SOURCE_TAG} Proof`,
    goalNl: "Begrijp de publieke OTT Make Waves-proofidentiteit.",
    goalEn: "Understand the public OTT Make Waves proof identity.",
    ottAngleNl: "Connect → Learn → Prove → Track.",
    ottAngleEn: "Connect → Learn → Prove → Track.",
    topics: ["SourceTag", "Audit trail", "Memo", "Duplicate protection", "Proof"],
    tasks: [
      { id: "task-1", promptNl: `Wat identificeert SourceTag ${MAKE_WAVES_SOURCE_TAG}?`, promptEn: `What does SourceTag ${MAKE_WAVES_SOURCE_TAG} identify?` },
      { id: "task-2", promptNl: "Welke velden controleer je naast SourceTag?", promptEn: "Which transaction fields must be checked alongside SourceTag?" },
      { id: "task-3", promptNl: "Hoe voorkom je dubbele beloning voor dezelfde proof?", promptEn: "How do you prevent the same proof from rewarding twice?" },
    ],
    sourceLabel: "XRPL.org Docs",
    sourceUrl: "https://xrpl.org/docs",
    minutes: 45,
    status: "free",
    xp: 15,
    credits: 2,
    icon: Fingerprint,
  },
  {
    id: "defi-island",
    module: "05",
    difficulty: "Beginner",
    title: "Explore DeFi-Island",
    goalNl: "Gebruik testnet en gamification om DeFi-concepten veilig te leren.",
    goalEn: "Use testnet and gamification to learn DeFi concepts safely.",
    ottAngleNl: "Speels leren zonder echt kapitaal te riskeren.",
    ottAngleEn: "Playful learning without risking real capital.",
    topics: ["Testnet", "Quests", "DEX", "AMM", "Safety"],
    tasks: [
      { id: "task-1", promptNl: "Beschrijf één DeFi-concept dat je tegenkwam.", promptEn: "Describe one DeFi concept you encountered." },
      { id: "task-2", promptNl: "Waarom is testnet geschikt voor leerquests?", promptEn: "Why is testnet appropriate for learning quests?" },
      { id: "task-3", promptNl: "Welke veiligheidsles hoort in een DeFi-quest?", promptEn: "What safety lesson should a gamified DeFi quest include?" },
    ],
    sourceLabel: "XRPL Learning Portal · DeFi-Island",
    sourceUrl: "https://learn.xrpl.org/",
    minutes: 60,
    status: "free",
    xp: 20,
    credits: 1,
    icon: Sparkles,
  },
  {
    id: "deep-dive-defi",
    module: "06",
    difficulty: "Intermediate",
    title: "Deep Dive into XRPL DeFi",
    goalNl: "Begrijp DEX, AMM, liquiditeit en risico zonder winstbelofte.",
    goalEn: "Understand DEX, AMM, liquidity and risk without profit promises.",
    ottAngleNl: "Risico en context vóór uitvoering.",
    ottAngleEn: "Risk and context before execution.",
    topics: ["DEX", "AMM", "Liquidity", "Slippage", "Risk"],
    tasks: [
      { id: "task-1", promptNl: "Leg een AMM uit zonder winstbelofte.", promptEn: "Explain an AMM without promising profit." },
      { id: "task-2", promptNl: "Vergelijk een DEX met een broker.", promptEn: "Compare a decentralized exchange with a broker." },
      { id: "task-3", promptNl: "Noem drie betekenisvolle DeFi-risico's.", promptEn: "Name three meaningful DeFi risks." },
    ],
    sourceLabel: "XRPL Learning Portal · DeFi",
    sourceUrl: "https://learn.xrpl.org/",
    minutes: 120,
    status: "premium",
    xp: 40,
    credits: 3,
    icon: Repeat2,
  },
  {
    id: "blockchain-for-business",
    module: "07",
    difficulty: "Intermediate",
    title: "Blockchain for Business",
    goalNl: "Vertaal een bedrijfsprobleem naar een controleerbare XRPL-workflow.",
    goalEn: "Translate a business problem into a verifiable XRPL workflow.",
    ottAngleNl: "B2B-proof zonder blockchain als wondermiddel te presenteren.",
    ottAngleEn: "B2B proof without presenting blockchain as magic.",
    topics: ["Business case", "Operations", "Compliance", "Proof", "Review"],
    tasks: [
      { id: "task-1", promptNl: "Beschrijf één realistisch bedrijfsprobleem voor XRPL.", promptEn: "Describe one realistic business problem for XRPL." },
      { id: "task-2", promptNl: "Beschrijf de XRPL-route en proof trail.", promptEn: "Describe the XRPL route and its proof trail." },
      { id: "task-3", promptNl: "Welke compliance of menselijke controle blijft nodig?", promptEn: "What compliance or human review is still needed?" },
    ],
    sourceLabel: "XRPL Learning Portal · Business",
    sourceUrl: "https://learn.xrpl.org/",
    minutes: 120,
    status: "premium",
    xp: 45,
    credits: 4,
    icon: Building2,
  },
  {
    id: "tokenization-rwa",
    module: "08",
    difficulty: "Intermediate",
    title: "Tokenization & Real World Assets",
    goalNl: "Begrijp utility, issuerverantwoordelijkheid en juridische grenzen.",
    goalEn: "Understand utility, issuer responsibility and legal boundaries.",
    ottAngleNl: "Geen waarde- of eigendomsbelofte zonder juridische basis.",
    ottAngleEn: "No value or ownership promise without legal basis.",
    topics: ["Tokenization", "RWA", "Issuer", "Utility", "Legal"],
    tasks: [
      { id: "task-1", promptNl: "Geef een utility-only tokenisatievoorbeeld.", promptEn: "Give a utility-only tokenization example." },
      { id: "task-2", promptNl: "Wat mag nooit zonder juridische goedkeuring worden beloofd?", promptEn: "What must never be promised without legal approval?" },
      { id: "task-3", promptNl: "Waarom moeten het actief en de issuer worden geverifieerd?", promptEn: "Why must the off-chain asset and issuer be verified?" },
    ],
    sourceLabel: "XRPL Learning Portal · RWA",
    sourceUrl: "https://learn.xrpl.org/",
    minutes: 120,
    status: "premium",
    xp: 45,
    credits: 4,
    icon: Layers,
  },
  {
    id: "stablecoins",
    module: "09",
    difficulty: "Intermediate",
    title: "Stablecoins on XRPL",
    goalNl: "Begrijp issued assets, issuer-risico en veilige integratie.",
    goalEn: "Understand issued assets, issuer risk and safe integration.",
    ottAngleNl: "Stabiel doel betekent niet risicovrij.",
    ottAngleEn: "A stable target does not mean risk-free.",
    topics: ["Stablecoin", "Issuer", "Trustline", "Redemption", "Risk"],
    tasks: [
      { id: "task-1", promptNl: "Leg een stablecoin uit zonder het een bankdeposito te noemen.", promptEn: "Explain a stablecoin without calling it a bank deposit." },
      { id: "task-2", promptNl: "Welke issuer-risico's controleer je?", promptEn: "Which issuer risks should a user check?" },
      { id: "task-3", promptNl: "Maak een korte stablecoin-veiligheidschecklist.", promptEn: "Create a short stablecoin safety checklist." },
    ],
    sourceLabel: "XRPL Learning Portal · Stablecoins",
    sourceUrl: "https://learn.xrpl.org/",
    minutes: 90,
    status: "premium",
    xp: 35,
    credits: 3,
    icon: Coins,
  },
  {
    id: "defi-exchanges-lending-trading",
    module: "10",
    difficulty: "Intermediate",
    title: "Exchanges, Lending & Trading",
    goalNl: "Scheid educatie, risicoanalyse en financieel advies.",
    goalEn: "Separate education, risk analysis and financial advice.",
    ottAngleNl: "Leren en simuleren, geen trade-aansturing.",
    ottAngleEn: "Learn and simulate, no trade instruction.",
    topics: ["Exchange", "Lending", "Trading", "Advice boundary", "Risk"],
    tasks: [
      { id: "task-1", promptNl: "Geef een gebalanceerde DeFi-risicoanalyse.", promptEn: "Give a balanced risk analysis for a DeFi action." },
      { id: "task-2", promptNl: "Leg educatie versus financieel advies uit.", promptEn: "Explain the difference between education and financial advice." },
      { id: "task-3", promptNl: "Noem drie verboden of misleidende beloften.", promptEn: "List three promises an education platform should not make." },
    ],
    sourceLabel: "XRPL Learning Portal · Exploring DeFi",
    sourceUrl: "https://learn.xrpl.org/",
    minutes: 120,
    status: "premium",
    xp: 45,
    credits: 4,
    icon: ShieldCheck,
  },
  {
    id: "decentralized-identity",
    module: "11",
    difficulty: "Intermediate",
    title: "Decentralized Identity on XRPL",
    goalNl: "Ontwerp credentials met privacy, consent en beperkte betekenis.",
    goalEn: "Design credentials with privacy, consent and limited meaning.",
    ottAngleNl: "Walletprofiel zonder private gegevens onnodig openbaar te maken.",
    ottAngleEn: "Wallet profile without unnecessarily exposing private data.",
    topics: ["DID", "Credentials", "Privacy", "Consent", "Certificate"],
    tasks: [
      { id: "task-1", promptNl: "Beschrijf een nuttige proof badge.", promptEn: "Describe a useful proof badge." },
      { id: "task-2", promptNl: "Welke profielgegevens moeten privé blijven?", promptEn: "What profile data should remain private?" },
      { id: "task-3", promptNl: "Hoe koppel je een certificaat veilig aan een wallet?", promptEn: "How should a certificate be linked to a wallet safely?" },
    ],
    sourceLabel: "XRPL Learning Portal · Identity",
    sourceUrl: "https://learn.xrpl.org/",
    minutes: 120,
    status: "premium",
    xp: 40,
    credits: 4,
    icon: BadgeCheck,
  },
  {
    id: "build-react",
    module: "12",
    difficulty: "Builder",
    title: "Build with XRPL and React.js",
    goalNl: "Ontwerp veilige front-endflows voor Xaman en XRPL-verificatie.",
    goalEn: "Design safe front-end flows for Xaman and XRPL verification.",
    ottAngleNl: "Van gebruiker naar bouwer, eerst testnet.",
    ottAngleEn: "From user to builder, testnet first.",
    topics: ["React", "Payload", "Xaman", "Verification", "UX"],
    tasks: [
      { id: "task-1", promptNl: "Schets een veilige XRPL React-componentflow.", promptEn: "Outline a safe XRPL React component flow." },
      { id: "task-2", promptNl: "Beschrijf veilige signing-UX.", promptEn: "Describe safe signing UX." },
      { id: "task-3", promptNl: "Waarom start een nieuwe flow op testnet?", promptEn: "Why should a new transaction flow start on testnet?" },
    ],
    sourceLabel: "XRPL Learning Portal · React",
    sourceUrl: "https://learn.xrpl.org/",
    minutes: 120,
    status: "premium",
    xp: 50,
    credits: 5,
    icon: Code2,
  },
  {
    id: "code-javascript",
    module: "13",
    difficulty: "Builder",
    title: "Code with XRPL and JavaScript",
    goalNl: "Leer veilige verificatie, servervalidatie en secret-isolatie.",
    goalEn: "Learn safe verification, server validation and secret isolation.",
    ottAngleNl: "Geen credits zonder gevalideerde proof.",
    ottAngleEn: "No credits without validated proof.",
    topics: ["xrpl.js", "Verification", "Server validation", "Secrets", "Testnet"],
    tasks: [
      { id: "task-1", promptNl: "Beschrijf pseudocode voor transactieverificatie.", promptEn: "Describe pseudocode for transaction verification." },
      { id: "task-2", promptNl: "Noem drie veiligheidschecks in een XRPL-app.", promptEn: "Name three security checks in an XRPL app." },
      { id: "task-3", promptNl: "Waarom moeten secrets server-side blijven?", promptEn: "Explain why secrets must stay server-side." },
    ],
    sourceLabel: "XRPL Learning Portal · JavaScript",
    sourceUrl: "https://learn.xrpl.org/",
    minutes: 120,
    status: "premium",
    xp: 50,
    credits: 5,
    icon: Code2,
  },
  {
    id: "agentic-transactions",
    module: "14",
    difficulty: "Agentic",
    title: "AI Agents & Agentic Transactions",
    goalNl: "Ontwerp agentflows met limieten, audit trails en menselijke controle.",
    goalEn: "Design agent flows with limits, audit trails and human control.",
    ottAngleNl: "Een agent voert alleen vooraf toegestane acties uit.",
    ottAngleEn: "An agent only executes pre-approved actions.",
    topics: ["Agent wallet", "Limits", "Allowlist", "Audit trail", "Emergency stop"],
    tasks: [
      { id: "task-1", promptNl: "Wat mag een AI-betaalagent wel en niet doen?", promptEn: "What may and may not an AI payment agent do?" },
      { id: "task-2", promptNl: "Maak een nuttige limietenlijst voor een agent.", promptEn: "Create a useful agent limit list." },
      { id: "task-3", promptNl: "Waarom zijn audit trails en menselijke controle nodig?", promptEn: "Why are audit trails and human control required?" },
    ],
    sourceLabel: "XRPL.org · Agentic Transactions",
    sourceUrl: "https://xrpl.org/docs/agents/agentic-transactions",
    minutes: 90,
    status: "premium",
    xp: 60,
    credits: 6,
    icon: Cpu,
  },
];

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "error" in error) {
    const value = (error as { error?: unknown }).error;
    return typeof value === "string" ? value : fallback;
  }

  return fallback;
}

function shortWallet(value: string) {
  return value.length > 18 ? `${value.slice(0, 9)}…${value.slice(-7)}` : value;
}

export function AcademyTab({ walletAddress = "guest", onNavigate }: AcademyTabProps) {
  const { language } = useTerminalLanguage();
  const isEnglish = language === "en";
  const isGuest = !walletAddress || walletAddress === "guest";
  const [activeView, setActiveView] = useState<AcademyView>("path");
  const [selectedLessonId, setSelectedLessonId] = useState(lessons[0].id);
  const [answersByLesson, setAnswersByLesson] = useState<Record<string, Record<string, string>>>({});
  const [assessmentsByLesson, setAssessmentsByLesson] = useState<Record<string, AcademyAnswerAssessment[]>>({});
  const [isAssessing, setIsAssessing] = useState(false);
  const [status, setStatus] = useState(
    isEnglish
      ? "Choose a module, answer every task and let AI assess your understanding."
      : "Kies een module, beantwoord elke opdracht en laat AI je begrip beoordelen.",
  );
  const [progressVersion, setProgressVersion] = useState(0);

  const selectedLesson = lessons.find((lesson) => lesson.id === selectedLessonId) ?? lessons[0];
  const progress = useMemo(
    () => getAcademyProgressSummary(walletAddress),
    [walletAddress, progressVersion],
  );
  const completedLessonIds = progress.completedLessonIds;
  const progressPercent = Math.round((progress.completedCount / lessons.length) * 100);
  const selectedAnswers = answersByLesson[selectedLesson.id] ?? {};
  const selectedAssessments = assessmentsByLesson[selectedLesson.id] ??
    progress.completions.find((item) => item.lessonId === selectedLesson.id)?.assessments ?? [];
  const selectedCompletion = progress.completions.find(
    (item) => item.lessonId === selectedLesson.id,
  );
  const freeLessons = lessons.filter((lesson) => lesson.status === "free").length;
  const premiumLessons = lessons.length - freeLessons;
  const totalMinutes = lessons.reduce((sum, lesson) => sum + lesson.minutes, 0);

  useEffect(() => {
    const refresh = () => setProgressVersion((value) => value + 1);
    window.addEventListener("ott-academy-progress-changed", refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener("ott-academy-progress-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  function updateAnswer(taskId: string, value: string) {
    const cleanValue = value.slice(0, MAX_ANSWER_LENGTH);
    setAnswersByLesson((current) => ({
      ...current,
      [selectedLesson.id]: {
        ...(current[selectedLesson.id] ?? {}),
        [taskId]: cleanValue,
      },
    }));
  }

  async function assessAndComplete() {
    const answers = selectedLesson.tasks.map((task) => ({
      taskId: task.id,
      answer: selectedAnswers[task.id]?.trim() ?? "",
    }));
    const unanswered = answers.filter((item) => item.answer.length < 18);

    if (unanswered.length > 0) {
      setStatus(
        isEnglish
          ? "Answer every task with a meaningful explanation before AI assessment."
          : "Beantwoord elke opdracht met een betekenisvolle uitleg vóór de AI-beoordeling.",
      );
      return;
    }

    setIsAssessing(true);
    setStatus(
      isEnglish
        ? "AI is checking every answer against the module rubric..."
        : "AI controleert elk antwoord aan de hand van de modulerubric...",
    );

    try {
      const response = await assessAcademyModule({
        lessonId: selectedLesson.id,
        language,
        walletAddress,
        answers,
      });
      const assessments = response.assessments ?? [];
      setAssessmentsByLesson((current) => ({
        ...current,
        [selectedLesson.id]: assessments,
      }));

      if (!response.overallPassed || assessments.some((item) => !item.passed)) {
        setStatus(
          isEnglish
            ? "Module not completed. Improve every failed answer and run the AI check again."
            : "Module niet afgerond. Verbeter elk onvoldoende antwoord en voer de AI-check opnieuw uit.",
        );
        return;
      }

      if (isGuest) {
        setStatus(
          isEnglish
            ? "All answers passed in practice mode. Connect Xaman to save this module to your Wallet Dashboard profile."
            : "Alle antwoorden zijn geslaagd in oefenmodus. Koppel Xaman om deze module in je Wallet Dashboard-profiel op te slaan.",
        );
        return;
      }

      saveAcademyModuleCompletion({
        lessonId: selectedLesson.id,
        lessonTitle: selectedLesson.title,
        walletAddress,
        completedAt: Date.now(),
        xp: selectedLesson.xp,
        credits: selectedLesson.credits,
        overallScore: response.overallScore ?? 0,
        assessments,
        assessmentMode: "ai",
      });
      setProgressVersion((value) => value + 1);
      setStatus(
        isEnglish
          ? `Module verified and saved to ${shortWallet(walletAddress)}. XP and OTT Credits now appear in Wallet Dashboard.`
          : `Module geverifieerd en opgeslagen voor ${shortWallet(walletAddress)}. XP en OTT Credits verschijnen nu in Wallet Dashboard.`,
      );
    } catch (error) {
      setStatus(
        getErrorMessage(
          error,
          isEnglish
            ? "AI assessment failed. Try again shortly."
            : "AI-beoordeling mislukt. Probeer het straks opnieuw.",
        ),
      );
    } finally {
      setIsAssessing(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-[#080808]">
      <section className="relative overflow-hidden border-b border-black/10 bg-[radial-gradient(circle_at_18%_18%,rgba(56,152,232,0.16),transparent_28%),radial-gradient(circle_at_82%_8%,rgba(200,56,136,0.16),transparent_28%),#ffffff] p-4 md:p-8 xl:p-10">
        <div className="flex flex-wrap items-start justify-between gap-6 mb-8">
          <OTTLogo
            size="lg"
            subtitle={
              isEnglish
                ? "AI-assessed XRPL learning linked to your verified wallet"
                : "AI-beoordeeld XRPL-leren gekoppeld aan je geverifieerde wallet"
            }
          />
          <OTTProofBadge sourceTag={String(MAKE_WAVES_SOURCE_TAG)} />
        </div>

        <div className="max-w-5xl">
          <div className="inline-flex items-center gap-2 border border-black/10 bg-white/80 px-4 py-2 mb-6">
            <Brain size={15} className="text-[#C83888]" />
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/55">
              {isEnglish ? "OTT Academy · AI Assessment" : "OTT Academie · AI-Beoordeling"}
            </p>
          </div>

          <h1 className="font-orbitron text-4xl md:text-6xl font-black uppercase leading-none tracking-tight mb-6">
            {isEnglish ? "Learn. Explain." : "Leer. Leg uit."}
            <br />
            <span className="bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] bg-clip-text text-transparent">
              {isEnglish ? "Pass every answer." : "Slaag voor elk antwoord."}
            </span>
          </h1>

          <p className="font-mono text-sm md:text-base text-black/60 leading-relaxed max-w-4xl">
            {isEnglish
              ? "No self-verification and no multiple-choice shortcut. Type your own answers, stay within 200 characters and pass every AI-checked task before the module can enter your Wallet Dashboard profile."
              : "Geen zelfverificatie en geen meerkeuzesnelweg. Typ je eigen antwoorden, blijf binnen 200 tekens en slaag voor elke AI-gecontroleerde opdracht voordat de module in je Wallet Dashboard-profiel komt."}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-8">
          <MetricCard label={isEnglish ? "Progress" : "Voortgang"} value={`${progressPercent}%`} text={`${progress.completedCount}/${lessons.length} verified`} icon={Target} />
          <MetricCard label="XP" value={String(progress.totalXp)} text={isEnglish ? "Verified learning" : "Geverifieerd leren"} icon={Sparkles} />
          <MetricCard label="OTT Credits" value={String(progress.totalCredits)} text={isEnglish ? "Profile credits" : "Profielcredits"} icon={Award} />
          <MetricCard label={isEnglish ? "AI Average" : "AI-Gemiddelde"} value={`${progress.averageScore}%`} text={isEnglish ? "Passed modules" : "Geslaagde modules"} icon={Brain} />
          <MetricCard label={isEnglish ? "Catalog" : "Catalogus"} value={`${freeLessons}+${premiumLessons}`} text={`${Math.round(totalMinutes / 60)}h+`} icon={BookOpen} />
        </div>

        <div className="flex flex-wrap gap-2 mt-6">
          <ViewButton active={activeView === "path"} label={isEnglish ? "Learning Path" : "Leerpad"} onClick={() => setActiveView("path")} />
          <ViewButton active={activeView === "module"} label={isEnglish ? "Assessment Room" : "Beoordelingsruimte"} onClick={() => setActiveView("module")} />
          <ViewButton active={activeView === "proof"} label={isEnglish ? "Completion Proof" : "Afrondingsproof"} onClick={() => setActiveView("proof")} />
        </div>
      </section>

      <section className="p-4 md:p-8 xl:p-10">
        {isGuest && (
          <div className="border border-[#C83888]/25 bg-[#C83888]/10 p-4 mb-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Lock size={18} className="text-[#C83888] mt-0.5 shrink-0" />
              <p className="font-mono text-xs text-black/60 leading-relaxed max-w-3xl">
                {isEnglish
                  ? "Practice mode is available, but progress is never added to Wallet Dashboard until a verified Xaman wallet is connected."
                  : "Oefenmodus is beschikbaar, maar voortgang wordt nooit aan Wallet Dashboard toegevoegd voordat een geverifieerde Xaman-wallet is gekoppeld."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate?.("xaman")}
              className="bg-black text-white px-4 py-3 font-orbitron text-[10px] font-black uppercase tracking-widest"
            >
              {isEnglish ? "Connect Xaman" : "Koppel Xaman"}
            </button>
          </div>
        )}

        {activeView === "path" && (
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 xl:col-span-8">
              <Panel title={isEnglish ? "AI-Verified Learning Path" : "AI-Geverifieerd Leerpad"} icon={GraduationCap}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {lessons.map((lesson) => {
                    const completion = progress.completions.find((item) => item.lessonId === lesson.id);

                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => {
                          setSelectedLessonId(lesson.id);
                          setActiveView("module");
                        }}
                        className={`border p-5 text-left transition-all ${
                          completion
                            ? "border-[#3898E8]/35 bg-[#3898E8]/5"
                            : "border-black/10 bg-[#F7F8FC] hover:bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div>
                            <p className="font-mono text-[10px] uppercase tracking-widest text-[#C83888] mb-2">
                              Module {lesson.module} · {lesson.difficulty}
                            </p>
                            <p className="font-orbitron text-sm font-black uppercase leading-tight">
                              {lesson.title}
                            </p>
                          </div>
                          {completion ? (
                            <BadgeCheck size={20} className="text-[#3898E8] shrink-0" />
                          ) : lesson.status === "premium" ? (
                            <Lock size={18} className="text-black/35 shrink-0" />
                          ) : (
                            <ChevronRight size={18} className="text-black/35 shrink-0" />
                          )}
                        </div>
                        <p className="font-mono text-xs text-black/50 leading-relaxed mb-4">
                          {isEnglish ? lesson.goalEn : lesson.goalNl}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Tag text={`${lesson.minutes} min`} />
                          <Tag text={`+${lesson.xp} XP`} />
                          <Tag text={completion ? `${completion.overallScore}% AI verified` : lesson.status} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Panel>
            </div>

            <div className="col-span-12 xl:col-span-4 space-y-4">
              <Panel title={isEnglish ? "Assessment Rules" : "Beoordelingsregels"} icon={ShieldCheck}>
                <div className="space-y-3">
                  <InfoLine text={isEnglish ? "Three typed answers per module." : "Drie getypte antwoorden per module."} />
                  <InfoLine text={isEnglish ? "Maximum 200 characters per answer." : "Maximaal 200 tekens per antwoord."} />
                  <InfoLine text={isEnglish ? "Each answer must score at least 70%." : "Elk antwoord moet minimaal 70% scoren."} />
                  <InfoLine text={isEnglish ? "One failed answer blocks completion." : "Eén onvoldoende antwoord blokkeert afronding."} />
                  <InfoLine text={isEnglish ? "Only verified wallet progress enters the profile." : "Alleen geverifieerde walletvoortgang komt in het profiel."} />
                </div>
              </Panel>

              <Panel title={isEnglish ? "Official Sources" : "Officiële Bronnen"} icon={ExternalLink}>
                <SourceLink label="XRPL Learning Portal" url="https://learn.xrpl.org/" />
                <SourceLink label="XRPL.org Docs" url="https://xrpl.org/docs" />
                <SourceLink label="Agentic Transactions" url="https://xrpl.org/docs/agents/agentic-transactions" />
              </Panel>
            </div>
          </div>
        )}

        {activeView === "module" && (
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 xl:col-span-3">
              <Panel title={isEnglish ? "Modules" : "Modules"} icon={BookOpen}>
                <div className="space-y-2 max-h-[760px] overflow-y-auto pr-1">
                  {lessons.map((lesson) => (
                    <button
                      key={lesson.id}
                      type="button"
                      onClick={() => setSelectedLessonId(lesson.id)}
                      className={`w-full border p-3 text-left ${
                        selectedLesson.id === lesson.id
                          ? "border-[#C83888] bg-[#C83888]/10"
                          : "border-black/10 bg-[#F7F8FC]"
                      }`}
                    >
                      <p className="font-mono text-[9px] uppercase tracking-widest text-black/35 mb-1">
                        {lesson.module} · {completedLessonIds.includes(lesson.id) ? "Verified" : lesson.status}
                      </p>
                      <p className="font-orbitron text-[10px] font-black uppercase leading-tight">
                        {lesson.title}
                      </p>
                    </button>
                  ))}
                </div>
              </Panel>
            </div>

            <div className="col-span-12 xl:col-span-9 space-y-4">
              <Panel title={selectedLesson.title} icon={selectedLesson.icon}>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12 lg:col-span-8">
                    <div className="border border-black/10 bg-[#F7F8FC] p-5 mb-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-black/35 mb-3">
                        {isEnglish ? "Learning Goal" : "Leerdoel"}
                      </p>
                      <p className="font-mono text-sm text-black/60 leading-relaxed mb-4">
                        {isEnglish ? selectedLesson.goalEn : selectedLesson.goalNl}
                      </p>
                      <div className="border border-[#C83888]/25 bg-[#C83888]/10 p-4">
                        <p className="font-mono text-xs text-black/60 leading-relaxed">
                          {isEnglish ? selectedLesson.ottAngleEn : selectedLesson.ottAngleNl}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-5">
                      {selectedLesson.topics.map((topic) => <Tag key={topic} text={topic} />)}
                    </div>

                    <div className="space-y-4">
                      {selectedLesson.tasks.map((task, index) => {
                        const answer = selectedAnswers[task.id] ?? "";
                        const assessment = selectedAssessments.find((item) => item.taskId === task.id);

                        return (
                          <div key={task.id} className={`border p-5 ${assessment ? (assessment.passed ? "border-[#3898E8]/35 bg-[#3898E8]/5" : "border-[#C83888]/35 bg-[#C83888]/5") : "border-black/10 bg-white"}`}>
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div>
                                <p className="font-mono text-[9px] uppercase tracking-widest text-[#3898E8] mb-2">
                                  {isEnglish ? `Task ${index + 1}` : `Opdracht ${index + 1}`}
                                </p>
                                <p className="font-orbitron text-sm font-black uppercase leading-relaxed">
                                  {isEnglish ? task.promptEn : task.promptNl}
                                </p>
                              </div>
                              {assessment && (
                                <div className={`px-3 py-2 font-orbitron text-xs font-black ${assessment.passed ? "bg-[#3898E8] text-white" : "bg-[#C83888] text-white"}`}>
                                  {assessment.score}%
                                </div>
                              )}
                            </div>

                            <textarea
                              value={answer}
                              onChange={(event) => updateAnswer(task.id, event.target.value)}
                              maxLength={MAX_ANSWER_LENGTH}
                              rows={4}
                              disabled={Boolean(selectedCompletion)}
                              placeholder={isEnglish ? "Type your own explanation..." : "Typ je eigen uitleg..."}
                              className="w-full border border-black/10 bg-[#F7F8FC] p-4 font-mono text-sm text-black outline-none focus:border-[#3898E8] disabled:opacity-60"
                            />
                            <div className="flex items-center justify-between gap-3 mt-2">
                              <p className="font-mono text-[9px] uppercase tracking-widest text-black/35">
                                {answer.length}/{MAX_ANSWER_LENGTH}
                              </p>
                              <p className="font-mono text-[9px] uppercase tracking-widest text-black/35">
                                {isEnglish ? "Minimum meaningful explanation" : "Minimaal betekenisvolle uitleg"}
                              </p>
                            </div>

                            {assessment && (
                              <div className="border border-black/10 bg-white p-4 mt-4">
                                <div className="flex items-start gap-3">
                                  {assessment.passed ? <CheckCircle2 size={17} className="text-[#3898E8] mt-0.5 shrink-0" /> : <XCircle size={17} className="text-[#C83888] mt-0.5 shrink-0" />}
                                  <div>
                                    <p className="font-mono text-xs text-black/60 leading-relaxed">
                                      {assessment.feedback}
                                    </p>
                                    {assessment.missingConcepts.length > 0 && (
                                      <p className="font-mono text-[10px] text-[#C83888] mt-2">
                                        {isEnglish ? "Missing: " : "Ontbreekt: "}{assessment.missingConcepts.join(", ")}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="col-span-12 lg:col-span-4 space-y-4">
                    <div className="border border-black/10 bg-[#F7F8FC] p-5 sticky top-6">
                      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-black/35 mb-4">
                        {isEnglish ? "Module Verification" : "Moduleverificatie"}
                      </p>
                      <InfoRow label="Wallet" value={isGuest ? "Guest / practice" : shortWallet(walletAddress)} />
                      <InfoRow label={isEnglish ? "Reward" : "Beloning"} value={`+${selectedLesson.xp} XP · +${selectedLesson.credits} Credits`} />
                      <InfoRow label={isEnglish ? "Status" : "Status"} value={selectedCompletion ? `AI verified · ${selectedCompletion.overallScore}%` : "Not verified"} />

                      <button
                        type="button"
                        onClick={() => void assessAndComplete()}
                        disabled={isAssessing || Boolean(selectedCompletion)}
                        className="w-full mt-5 bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] text-white p-4 font-orbitron text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isAssessing ? <Loader2 size={16} className="animate-spin" /> : selectedCompletion ? <BadgeCheck size={16} /> : <Brain size={16} />}
                        {isAssessing
                          ? isEnglish ? "AI checking answers" : "AI controleert antwoorden"
                          : selectedCompletion
                            ? isEnglish ? "Module AI Verified" : "Module AI-Geverifieerd"
                            : isEnglish ? "AI Check & Complete" : "AI-Check & Afronden"}
                      </button>

                      <div className="border border-black/10 bg-white p-4 mt-4">
                        <p className="font-mono text-xs text-black/60 leading-relaxed">{status}</p>
                      </div>

                      <a
                        href={selectedLesson.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 border border-black/10 bg-white p-4 flex items-center justify-between gap-3"
                      >
                        <div>
                          <p className="font-mono text-[9px] uppercase tracking-widest text-black/35 mb-1">Official source</p>
                          <p className="font-orbitron text-[10px] font-black uppercase">{selectedLesson.sourceLabel}</p>
                        </div>
                        <ExternalLink size={16} />
                      </a>
                    </div>
                  </div>
                </div>
              </Panel>
            </div>
          </div>
        )}

        {activeView === "proof" && (
          <Panel title={isEnglish ? "Wallet-Linked Completion Proof" : "Wallet-Gekoppelde Afrondingsproof"} icon={Award}>
            <div className="max-w-4xl mx-auto border border-black/10 bg-[radial-gradient(circle_at_20%_20%,rgba(56,152,232,0.14),transparent_28%),radial-gradient(circle_at_82%_15%,rgba(200,56,136,0.14),transparent_28%),#ffffff] p-6 md:p-10 text-center">
              <Award size={46} className="mx-auto mb-6 text-[#C83888]" />
              <p className="font-mono text-[10px] uppercase tracking-[0.45em] text-black/35 mb-4">OTT Academy</p>
              <h2 className="font-orbitron text-3xl md:text-5xl font-black uppercase mb-5">
                {progressPercent === 100 ? (isEnglish ? "Learning Path Completed" : "Leerpad Afgerond") : (isEnglish ? "Completion Locked" : "Afronding Vergrendeld")}
              </h2>
              <p className="font-mono text-sm text-black/55 leading-relaxed max-w-2xl mx-auto mb-8">
                {isEnglish
                  ? "This proof only unlocks after all 14 modules have passed every AI-assessed answer under the same verified wallet profile."
                  : "Deze proof wordt pas ontgrendeld nadat alle 14 modules onder hetzelfde geverifieerde walletprofiel voor elk AI-beoordeeld antwoord zijn geslaagd."}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 text-left">
                <InfoRow label={isEnglish ? "Modules" : "Modules"} value={`${progress.completedCount}/${lessons.length}`} />
                <InfoRow label="XP" value={String(progress.totalXp)} />
                <InfoRow label="Credits" value={String(progress.totalCredits)} />
                <InfoRow label={isEnglish ? "AI Average" : "AI-Gemiddelde"} value={`${progress.averageScore}%`} />
              </div>

              <button
                type="button"
                disabled={progressPercent < 100 || isGuest}
                onClick={() => onNavigate?.("wallet")}
                className="bg-black text-white px-6 py-4 font-orbitron text-xs font-black uppercase tracking-widest disabled:opacity-35"
              >
                {isGuest
                  ? isEnglish ? "Connect Xaman first" : "Koppel eerst Xaman"
                  : progressPercent === 100
                    ? isEnglish ? "Open Wallet Dashboard Profile" : "Open Wallet Dashboard-Profiel"
                    : isEnglish ? "Complete every AI assessment" : "Rond elke AI-beoordeling af"}
              </button>
            </div>
          </Panel>
        )}
      </section>
    </div>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon: ElementType; children: React.ReactNode }) {
  return (
    <div className="border border-black/10 bg-white p-5 md:p-6 shadow-sm shadow-black/5">
      <div className="flex items-center gap-2 mb-5">
        <Icon size={18} className="text-[#3898E8]" />
        <p className="font-orbitron text-xs uppercase tracking-widest">{title}</p>
      </div>
      {children}
    </div>
  );
}

function MetricCard({ label, value, text, icon: Icon }: { label: string; value: string; text: string; icon: ElementType }) {
  return (
    <div className="border border-black/10 bg-white/85 p-4">
      <Icon size={17} className="text-[#3898E8] mb-3" />
      <p className="font-mono text-[9px] uppercase tracking-widest text-black/35 mb-1">{label}</p>
      <p className="font-orbitron text-lg font-black uppercase mb-1">{value}</p>
      <p className="font-mono text-[9px] uppercase tracking-widest text-black/40">{text}</p>
    </div>
  );
}

function ViewButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-3 font-orbitron text-[10px] font-black uppercase tracking-widest ${active ? "bg-black text-white" : "border border-black/10 bg-white text-black"}`}
    >
      {label}
    </button>
  );
}

function Tag({ text }: { text: string }) {
  return <span className="border border-black/10 bg-white px-3 py-2 font-mono text-[9px] uppercase tracking-widest text-black/45">{text}</span>;
}

function InfoLine({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <CheckCircle2 size={14} className="text-[#3898E8] mt-0.5 shrink-0" />
      <p className="font-mono text-xs text-black/55 leading-relaxed">{text}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-black/10 bg-white p-3 mb-2 last:mb-0 text-left">
      <p className="font-mono text-[9px] uppercase tracking-widest text-black/35 mb-1">{label}</p>
      <p className="font-mono text-xs text-black/65 break-all">{value}</p>
    </div>
  );
}

function SourceLink({ label, url }: { label: string; url: string }) {
  return (
    <a href={url} target="_blank" rel="noreferrer" className="border border-black/10 bg-[#F7F8FC] p-4 mb-2 last:mb-0 flex items-center justify-between gap-3">
      <p className="font-orbitron text-[10px] font-black uppercase">{label}</p>
      <ExternalLink size={15} />
    </a>
  );
}
