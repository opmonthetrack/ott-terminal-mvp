import { useEffect, useMemo, useState, type ElementType } from "react";
import {
  Award,
  BadgeCheck,
  BookOpen,
  Brain,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Code2,
  Coins,
  Cpu,
  ExternalLink,
  Fingerprint,
  Layers,
  Library,
  Loader2,
  Lock,
  Network,
  Repeat2,
  Search,
  ShieldCheck,
  Sparkles,
  UserCircle,
  Wallet,
  XCircle,
} from "lucide-react";
import { ACADEMY_LEARNING_CONTENT } from "../lib/academyLearningContent";
import {
  migrateLegacyWalletProgressToAccount,
  saveAccountAcademyCompletion,
} from "../lib/accountAcademyStore";
import { assessAcademyModule } from "../lib/academyAssessmentClient";
import {
  getAcademyProgressSummary,
  type AcademyAnswerAssessment,
} from "../lib/academyProgressStore";
import { isAccessVerified, loadAccessState } from "../lib/accessStore";
import { MAKE_WAVES_SOURCE_TAG } from "../lib/makeWaves";
import { NFT_EDITION_REGISTRY, formatEditionSerial } from "../lib/nftEditionRegistry";
import { getOttAccountName } from "../lib/ottAuth";
import { useOttAuthSession } from "../lib/useOttAuthSession";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

type AcademyTabProps = {
  walletAddress?: string;
  onNavigate?: (target: string) => void;
};

type AcademyView = "hub" | "library" | "course" | "certificate";
type CourseAccess = "free" | "access";
type PathId = "foundations" | "use" | "markets" | "build";

type CourseTask = {
  id: string;
  promptEn: string;
  promptNl: string;
};

type Course = {
  id: string;
  module: string;
  path: PathId;
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Builder" | "Advanced";
  minutes: number;
  access: CourseAccess;
  outcomeEn: string;
  outcomeNl: string;
  topics: string[];
  tasks: CourseTask[];
  sourceLabel: string;
  sourceUrl: string;
  xp: number;
  credits: number;
  icon: ElementType;
};

const MAX_ANSWER_LENGTH = 200;

const paths = [
  { id: "foundations" as const, en: "Foundations", nl: "Basis" },
  { id: "use" as const, en: "Safe use", nl: "Veilig gebruik" },
  { id: "markets" as const, en: "Tokens and DeFi", nl: "Tokens en DeFi" },
  { id: "build" as const, en: "Build", nl: "Bouwen" },
];

const courses: Course[] = [
  {
    id: "blockchain-crypto-basics", module: "01", path: "foundations", title: "Blockchain & Crypto Basics",
    difficulty: "Beginner", minutes: 90, access: "free", icon: BookOpen, xp: 25, credits: 1,
    outcomeEn: "Understand ledgers, wallets, transactions and basic risks.",
    outcomeNl: "Begrijp ledgers, wallets, transacties en basisrisico’s.",
    topics: ["Ledger", "Wallet", "Self-custody", "Transactions", "Risk"],
    sourceLabel: "XRPL Learning Portal", sourceUrl: "https://learn.xrpl.org/course/blockchain-and-crypto-basics/",
    tasks: [
      { id: "task-1", promptEn: "Explain in your own words what a ledger is.", promptNl: "Leg in eigen woorden uit wat een ledger is." },
      { id: "task-2", promptEn: "Name three risks to consider before using a wallet.", promptNl: "Noem drie risico’s voordat je een wallet gebruikt." },
      { id: "task-3", promptEn: "Why should understanding come before signing?", promptNl: "Waarom moet begrijpen vóór ondertekenen komen?" },
    ],
  },
  {
    id: "intro-to-xrpl", module: "02", path: "foundations", title: "Introduction to the XRPL",
    difficulty: "Beginner", minutes: 90, access: "free", icon: Network, xp: 25, credits: 1,
    outcomeEn: "Understand accounts, validation and transaction finality.",
    outcomeNl: "Begrijp accounts, validatie en transactiefinaliteit.",
    topics: ["XRPL", "Accounts", "Validation", "Finality", "Explorer"],
    sourceLabel: "XRPL Learning Portal", sourceUrl: "https://learn.xrpl.org/",
    tasks: [
      { id: "task-1", promptEn: "Explain what the XRP Ledger is.", promptNl: "Leg uit wat de XRP Ledger is." },
      { id: "task-2", promptEn: "What should you check when looking up an XRPL transaction?", promptNl: "Wat controleer je bij het opzoeken van een XRPL-transactie?" },
      { id: "task-3", promptEn: "Why is finality useful for proof actions?", promptNl: "Waarom is finaliteit nuttig voor proof-acties?" },
    ],
  },
  {
    id: "payments-use-cases", module: "03", path: "foundations", title: "Payments on XRPL",
    difficulty: "Beginner", minutes: 90, access: "free", icon: Wallet, xp: 25, credits: 2,
    outcomeEn: "Review destinations, amounts, tags, memos and validation.",
    outcomeNl: "Controleer adressen, bedragen, tags, memo’s en validatie.",
    topics: ["Payment", "tesSUCCESS", "Memo", "SourceTag", "Validation"],
    sourceLabel: "XRPL Learning Portal", sourceUrl: "https://learn.xrpl.org/",
    tasks: [
      { id: "task-1", promptEn: "Describe the parts of a safe XRPL proof payment.", promptNl: "Beschrijf de onderdelen van een veilige XRPL-proofbetaling." },
      { id: "task-2", promptEn: "What does tesSUCCESS mean and what does it not prove by itself?", promptNl: "Wat betekent tesSUCCESS en wat bewijst het niet op zichzelf?" },
      { id: "task-3", promptEn: "Why can a memo and SourceTag be useful?", promptNl: "Waarom kunnen een memo en SourceTag nuttig zijn?" },
    ],
  },
  {
    id: "source-tag-proof", module: "04", path: "foundations", title: `SourceTag ${MAKE_WAVES_SOURCE_TAG} Proof`,
    difficulty: "Beginner", minutes: 45, access: "free", icon: Fingerprint, xp: 15, credits: 2,
    outcomeEn: "Understand OTT’s public Make Waves proof identity.",
    outcomeNl: "Begrijp de openbare OTT Make Waves-proofidentiteit.",
    topics: ["SourceTag", "Audit trail", "Memo", "Duplicates", "Proof"],
    sourceLabel: "XRPL.org Docs", sourceUrl: "https://xrpl.org/docs",
    tasks: [
      { id: "task-1", promptEn: `What does SourceTag ${MAKE_WAVES_SOURCE_TAG} identify?`, promptNl: `Wat identificeert SourceTag ${MAKE_WAVES_SOURCE_TAG}?` },
      { id: "task-2", promptEn: "Which transaction fields must be checked alongside SourceTag?", promptNl: "Welke transactievelden controleer je naast SourceTag?" },
      { id: "task-3", promptEn: "How do you prevent the same proof from rewarding twice?", promptNl: "Hoe voorkom je dat dezelfde proof dubbel wordt beloond?" },
    ],
  },
  {
    id: "defi-island", module: "05", path: "use", title: "Explore DeFi-Island",
    difficulty: "Beginner", minutes: 60, access: "free", icon: Sparkles, xp: 20, credits: 1,
    outcomeEn: "Use testnet and gamification to learn DeFi safely.",
    outcomeNl: "Gebruik testnet en gamification om DeFi veilig te leren.",
    topics: ["Testnet", "Quests", "DEX", "AMM", "Safety"],
    sourceLabel: "XRPL Learning Portal", sourceUrl: "https://learn.xrpl.org/",
    tasks: [
      { id: "task-1", promptEn: "Describe one DeFi concept you encountered.", promptNl: "Beschrijf één DeFi-concept dat je tegenkwam." },
      { id: "task-2", promptEn: "Why is testnet appropriate for learning quests?", promptNl: "Waarom is testnet geschikt voor leerquests?" },
      { id: "task-3", promptEn: "What safety lesson should a gamified DeFi quest include?", promptNl: "Welke veiligheidsles hoort in een gamified DeFi-quest?" },
    ],
  },
  {
    id: "blockchain-for-business", module: "06", path: "use", title: "Blockchain for Business",
    difficulty: "Intermediate", minutes: 120, access: "access", icon: Building2, xp: 45, credits: 4,
    outcomeEn: "Translate a business problem into a verifiable workflow.",
    outcomeNl: "Vertaal een bedrijfsprobleem naar een controleerbare workflow.",
    topics: ["Business case", "Operations", "Compliance", "Proof", "Review"],
    sourceLabel: "XRPL Learning Portal", sourceUrl: "https://learn.xrpl.org/",
    tasks: [
      { id: "task-1", promptEn: "Describe one realistic business problem for XRPL.", promptNl: "Beschrijf één realistisch bedrijfsprobleem voor XRPL." },
      { id: "task-2", promptEn: "Describe the XRPL route and its proof trail.", promptNl: "Beschrijf de XRPL-route en de proof trail." },
      { id: "task-3", promptEn: "What compliance or human review is still needed?", promptNl: "Welke compliance of menselijke controle blijft nodig?" },
    ],
  },
  {
    id: "decentralized-identity", module: "07", path: "use", title: "Decentralized Identity",
    difficulty: "Intermediate", minutes: 120, access: "access", icon: BadgeCheck, xp: 40, credits: 4,
    outcomeEn: "Design credentials with privacy, consent and limited meaning.",
    outcomeNl: "Ontwerp credentials met privacy, toestemming en beperkte betekenis.",
    topics: ["DID", "Credentials", "Privacy", "Consent", "Certificate"],
    sourceLabel: "XRPL Learning Portal", sourceUrl: "https://learn.xrpl.org/",
    tasks: [
      { id: "task-1", promptEn: "Describe a useful proof badge.", promptNl: "Beschrijf een nuttige proofbadge." },
      { id: "task-2", promptEn: "What profile data should remain private?", promptNl: "Welke profielgegevens moeten privé blijven?" },
      { id: "task-3", promptEn: "How should a certificate be linked to a wallet safely?", promptNl: "Hoe koppel je een certificaat veilig aan een wallet?" },
    ],
  },
  {
    id: "deep-dive-defi", module: "08", path: "markets", title: "XRPL DeFi",
    difficulty: "Intermediate", minutes: 120, access: "access", icon: Repeat2, xp: 40, credits: 3,
    outcomeEn: "Understand DEX, AMM, liquidity and risk without profit promises.",
    outcomeNl: "Begrijp DEX, AMM, liquiditeit en risico zonder winstbeloften.",
    topics: ["DEX", "AMM", "Liquidity", "Slippage", "Risk"],
    sourceLabel: "XRPL Learning Portal", sourceUrl: "https://learn.xrpl.org/",
    tasks: [
      { id: "task-1", promptEn: "Explain an AMM without promising profit.", promptNl: "Leg een AMM uit zonder winstbelofte." },
      { id: "task-2", promptEn: "Compare a decentralized exchange with a broker.", promptNl: "Vergelijk een decentrale exchange met een broker." },
      { id: "task-3", promptEn: "Name three meaningful DeFi risks.", promptNl: "Noem drie betekenisvolle DeFi-risico’s." },
    ],
  },
  {
    id: "tokenization-rwa", module: "09", path: "markets", title: "Tokenization & RWA",
    difficulty: "Intermediate", minutes: 120, access: "access", icon: Layers, xp: 45, credits: 4,
    outcomeEn: "Understand utility, issuer responsibility and legal boundaries.",
    outcomeNl: "Begrijp utility, issuerverantwoordelijkheid en juridische grenzen.",
    topics: ["Tokenization", "RWA", "Issuer", "Utility", "Legal"],
    sourceLabel: "XRPL Learning Portal", sourceUrl: "https://learn.xrpl.org/",
    tasks: [
      { id: "task-1", promptEn: "Give a utility-only tokenization example.", promptNl: "Geef een utility-only tokenisatievoorbeeld." },
      { id: "task-2", promptEn: "What must never be promised without legal approval?", promptNl: "Wat mag nooit zonder juridische goedkeuring worden beloofd?" },
      { id: "task-3", promptEn: "Why must the off-chain asset and issuer be verified?", promptNl: "Waarom moeten het off-chain actief en de issuer worden geverifieerd?" },
    ],
  },
  {
    id: "stablecoins", module: "10", path: "markets", title: "Stablecoins on XRPL",
    difficulty: "Intermediate", minutes: 90, access: "access", icon: Coins, xp: 35, credits: 3,
    outcomeEn: "Understand issued assets, redemption and issuer risk.",
    outcomeNl: "Begrijp issued assets, inwisselbaarheid en issuerrisico.",
    topics: ["Stablecoin", "Issuer", "Trustline", "Redemption", "Risk"],
    sourceLabel: "XRPL Learning Portal", sourceUrl: "https://learn.xrpl.org/",
    tasks: [
      { id: "task-1", promptEn: "Explain a stablecoin without calling it a bank deposit.", promptNl: "Leg een stablecoin uit zonder het een bankdeposito te noemen." },
      { id: "task-2", promptEn: "Which issuer risks should a user check?", promptNl: "Welke issuerrisico’s moet een gebruiker controleren?" },
      { id: "task-3", promptEn: "Create a short stablecoin safety checklist.", promptNl: "Maak een korte stablecoin-veiligheidschecklist." },
    ],
  },
  {
    id: "defi-exchanges-lending-trading", module: "11", path: "markets", title: "Exchanges, Lending & Trading",
    difficulty: "Intermediate", minutes: 120, access: "access", icon: ShieldCheck, xp: 45, credits: 4,
    outcomeEn: "Separate education, risk analysis and financial advice.",
    outcomeNl: "Scheid educatie, risicoanalyse en financieel advies.",
    topics: ["Exchange", "Lending", "Trading", "Advice boundary", "Risk"],
    sourceLabel: "XRPL Learning Portal", sourceUrl: "https://learn.xrpl.org/",
    tasks: [
      { id: "task-1", promptEn: "Give a balanced risk analysis for a DeFi action.", promptNl: "Geef een gebalanceerde risicoanalyse voor een DeFi-actie." },
      { id: "task-2", promptEn: "Explain the difference between education and financial advice.", promptNl: "Leg het verschil uit tussen educatie en financieel advies." },
      { id: "task-3", promptEn: "List three promises an education platform should not make.", promptNl: "Noem drie beloften die een educatieplatform niet moet maken." },
    ],
  },
  {
    id: "build-react", module: "12", path: "build", title: "Build with XRPL and React",
    difficulty: "Builder", minutes: 120, access: "access", icon: Code2, xp: 50, credits: 5,
    outcomeEn: "Design safe front-end signing and verification flows.",
    outcomeNl: "Ontwerp veilige front-endflows voor ondertekening en verificatie.",
    topics: ["React", "Payload", "Wallet", "Verification", "UX"],
    sourceLabel: "XRPL Learning Portal", sourceUrl: "https://learn.xrpl.org/",
    tasks: [
      { id: "task-1", promptEn: "Outline a safe XRPL React component flow.", promptNl: "Schets een veilige XRPL React-componentflow." },
      { id: "task-2", promptEn: "Describe safe signing UX.", promptNl: "Beschrijf veilige signing-UX." },
      { id: "task-3", promptEn: "Why should a new transaction flow start on testnet?", promptNl: "Waarom start een nieuwe transactieflow op testnet?" },
    ],
  },
  {
    id: "code-javascript", module: "13", path: "build", title: "Code with XRPL and JavaScript",
    difficulty: "Builder", minutes: 120, access: "access", icon: Code2, xp: 50, credits: 5,
    outcomeEn: "Learn server validation, security checks and secret isolation.",
    outcomeNl: "Leer servervalidatie, veiligheidschecks en secretisolatie.",
    topics: ["xrpl.js", "Verification", "Server", "Secrets", "Testnet"],
    sourceLabel: "XRPL Learning Portal", sourceUrl: "https://learn.xrpl.org/",
    tasks: [
      { id: "task-1", promptEn: "Describe pseudocode for transaction verification.", promptNl: "Beschrijf pseudocode voor transactieverificatie." },
      { id: "task-2", promptEn: "Name three security checks in an XRPL app.", promptNl: "Noem drie veiligheidschecks in een XRPL-app." },
      { id: "task-3", promptEn: "Explain why secrets must stay server-side.", promptNl: "Leg uit waarom secrets server-side moeten blijven." },
    ],
  },
  {
    id: "agentic-transactions", module: "14", path: "build", title: "AI Agents & Transactions",
    difficulty: "Advanced", minutes: 90, access: "access", icon: Cpu, xp: 60, credits: 6,
    outcomeEn: "Design agent flows with limits, audit trails and human control.",
    outcomeNl: "Ontwerp agentflows met limieten, audit trails en menselijke controle.",
    topics: ["Agent wallet", "Limits", "Allowlist", "Audit trail", "Stop"],
    sourceLabel: "XRPL.org Docs", sourceUrl: "https://xrpl.org/docs/agents/agentic-transactions",
    tasks: [
      { id: "task-1", promptEn: "What may and may not an AI payment agent do?", promptNl: "Wat mag een AI-betaalagent wel en niet doen?" },
      { id: "task-2", promptEn: "Create a useful agent limit list.", promptNl: "Maak een nuttige limietenlijst voor een agent." },
      { id: "task-3", promptEn: "Why are audit trails and human control required?", promptNl: "Waarom zijn audit trails en menselijke controle nodig?" },
    ],
  },
];

function isWalletAddress(value: string) {
  return /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(value);
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "error" in error) {
    const value = (error as { error?: unknown }).error;
    if (typeof value === "string") return value;
  }
  return fallback;
}

export function AcademyTab({ walletAddress = "guest", onNavigate }: AcademyTabProps) {
  const { language } = useTerminalLanguage();
  const { user, signedIn, loading: authLoading } = useOttAuthSession();
  const isEnglish = language === "en";
  const hasWallet = isWalletAddress(walletAddress);
  const accessUnlocked = hasWallet && isAccessVerified(loadAccessState(walletAddress));
  const accountName = getOttAccountName(user);

  const [view, setView] = useState<AcademyView>("hub");
  const [selectedPath, setSelectedPath] = useState<PathId | "all">("all");
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0].id);
  const [libraryQuery, setLibraryQuery] = useState("");
  const [answersByCourse, setAnswersByCourse] = useState<Record<string, Record<string, string>>>({});
  const [assessmentsByCourse, setAssessmentsByCourse] = useState<Record<string, AcademyAnswerAssessment[]>>({});
  const [isAssessing, setIsAssessing] = useState(false);
  const [progressVersion, setProgressVersion] = useState(0);
  const [status, setStatus] = useState("");

  const progress = useMemo(
    () => getAcademyProgressSummary(walletAddress),
    [walletAddress, progressVersion, signedIn],
  );
  const selectedCourse = courses.find((course) => course.id === selectedCourseId) ?? courses[0];
  const selectedContent = ACADEMY_LEARNING_CONTENT[selectedCourse.id];
  const selectedCompletion = progress.completions.find((item) => item.lessonId === selectedCourse.id);
  const selectedAnswers = answersByCourse[selectedCourse.id] ?? {};
  const selectedAssessments = assessmentsByCourse[selectedCourse.id] ?? selectedCompletion?.assessments ?? [];
  const visibleCourses = selectedPath === "all" ? courses : courses.filter((course) => course.path === selectedPath);
  const progressPercent = Math.round((progress.completedCount / courses.length) * 100);
  const foundation = NFT_EDITION_REGISTRY.foundationCertificate;

  const libraryCourses = useMemo(() => {
    const query = libraryQuery.trim().toLowerCase();
    if (!query) return courses;
    return courses.filter((course) => {
      const content = ACADEMY_LEARNING_CONTENT[course.id];
      const searchable = [
        course.title,
        ...course.topics,
        content?.summaryEn,
        content?.summaryNl,
        ...content?.glossary.flatMap((item) => [item.term, item.definitionEn, item.definitionNl]) ?? [],
      ].join(" ").toLowerCase();
      return searchable.includes(query);
    });
  }, [libraryQuery]);

  useEffect(() => {
    const refresh = () => setProgressVersion((value) => value + 1);
    window.addEventListener("ott-academy-progress-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("ott-academy-progress-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    if (!user?.id || !hasWallet || authLoading) return;
    void migrateLegacyWalletProgressToAccount(user.id, walletAddress)
      .then(() => setProgressVersion((value) => value + 1))
      .catch(() => undefined);
  }, [authLoading, hasWallet, user?.id, walletAddress]);

  function openCourse(course: Course) {
    if (course.access === "access" && !accessUnlocked) {
      setStatus(isEnglish
        ? "This course belongs to the Access learning library. Verify an OTT Access Pass to continue."
        : "Deze cursus hoort bij de Access-leerbibliotheek. Verifieer een OTT Access Pass om verder te gaan.");
      onNavigate?.("accessgate");
      return;
    }
    setSelectedCourseId(course.id);
    setStatus("");
    setView("course");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateAnswer(taskId: string, value: string) {
    setAnswersByCourse((current) => ({
      ...current,
      [selectedCourse.id]: {
        ...(current[selectedCourse.id] ?? {}),
        [taskId]: value.slice(0, MAX_ANSWER_LENGTH),
      },
    }));
  }

  async function assessAndComplete() {
    const answers = selectedCourse.tasks.map((task) => ({
      taskId: task.id,
      answer: selectedAnswers[task.id]?.trim() ?? "",
    }));
    if (answers.some((item) => item.answer.length < 18)) {
      setStatus(isEnglish
        ? "Answer every question with a meaningful explanation before assessment."
        : "Beantwoord iedere vraag met een betekenisvolle uitleg vóór de beoordeling.");
      return;
    }

    setIsAssessing(true);
    setStatus(isEnglish ? "AI is checking every answer…" : "AI controleert ieder antwoord…");
    try {
      const response = await assessAcademyModule({
        lessonId: selectedCourse.id,
        language,
        walletAddress: hasWallet ? walletAddress : "guest",
        answers,
      });
      const assessments = response.assessments ?? [];
      setAssessmentsByCourse((current) => ({ ...current, [selectedCourse.id]: assessments }));
      if (!response.overallPassed || assessments.some((assessment) => !assessment.passed)) {
        setStatus(isEnglish
          ? "Not completed yet. Review the lesson and improve every failed answer."
          : "Nog niet afgerond. Lees de les opnieuw en verbeter ieder onvoldoende antwoord.");
        return;
      }
      if (!user?.id) {
        setStatus(isEnglish
          ? "All answers passed in practice mode. Sign in to save verified progress."
          : "Alle antwoorden zijn geslaagd in oefenmodus. Log in om geverifieerde voortgang op te slaan.");
        return;
      }
      await saveAccountAcademyCompletion({
        userId: user.id,
        lessonId: selectedCourse.id,
        lessonTitle: selectedCourse.title,
        completedAt: Date.now(),
        xp: selectedCourse.xp,
        credits: selectedCourse.credits,
        overallScore: response.overallScore ?? 0,
        assessments,
        sourceWallet: hasWallet ? walletAddress : undefined,
      });
      setProgressVersion((value) => value + 1);
      setStatus(isEnglish
        ? `Course completed and saved to ${accountName || "your OTT account"}.`
        : `Cursus afgerond en opgeslagen in ${accountName || "je OTT-account"}.`);
    } catch (error) {
      setStatus(getErrorMessage(error, isEnglish
        ? "The assessment or account save could not be completed."
        : "De beoordeling of accountopslag kon niet worden voltooid."));
    } finally {
      setIsAssessing(false);
    }
  }

  const CourseIcon = selectedCourse.icon;

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <section className="border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">OTT Academy</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                {isEnglish ? "Learn first. Then prove what you understand." : "Leer eerst. Bewijs daarna wat je begrijpt."}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
                {isEnglish
                  ? "Every course now contains an explanation, glossary, example and official source before the knowledge check."
                  : "Iedere cursus bevat nu uitleg, begrippen, een voorbeeld en een officiële bron vóór de kennistoets."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <ViewButton active={view === "hub"} onClick={() => setView("hub")}>{isEnglish ? "Courses" : "Cursussen"}</ViewButton>
              <ViewButton active={view === "library"} onClick={() => setView("library")}>{isEnglish ? "Library" : "Bibliotheek"}</ViewButton>
              <ViewButton active={view === "certificate"} onClick={() => setView("certificate")}>{isEnglish ? "Certificate" : "Certificaat"}</ViewButton>
            </div>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <SummaryCard label={isEnglish ? "Course progress" : "Cursusvoortgang"} value={authLoading ? "…" : `${progress.completedCount}/${courses.length}`} text={`${progressPercent}%`} />
            <SummaryCard label={isEnglish ? "Verified learning" : "Geverifieerd leren"} value={`${progress.totalXp} XP`} text={signedIn ? accountName || user?.email || "OTT account" : (isEnglish ? "Sign in to save" : "Log in om op te slaan")} />
            <SummaryCard label={isEnglish ? "Foundation edition" : "Foundation-editie"} value={`${formatEditionSerial("foundationCertificate", foundation.serialStart)}–${formatEditionSerial("foundationCertificate", foundation.serialEnd)}`} text={isEnglish ? "Separate from Access Pass" : "Los van Access Pass"} />
          </div>
        </div>
      </section>

      {status && <div className="border-b border-blue-100 bg-blue-50"><div className="mx-auto max-w-6xl px-5 py-3 text-sm text-blue-900 sm:px-8">{status}</div></div>}

      {view === "hub" && (
        <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">{isEnglish ? "How learning works" : "Hoe leren werkt"}</p>
                <h2 className="mt-3 text-2xl font-semibold">{isEnglish ? "Read, understand, answer, verify." : "Lees, begrijp, antwoord, verifieer."}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{isEnglish
                  ? "The answer is found in the lesson material. Write it in your own words; the AI checks understanding rather than exact copied sentences."
                  : "Het antwoord staat in het lesmateriaal. Schrijf het in je eigen woorden; de AI controleert begrip in plaats van exact gekopieerde zinnen."}</p>
              </div>
              <button type="button" onClick={() => setView("library")} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold hover:bg-slate-100">
                <Library size={17} /> {isEnglish ? "Open Library" : "Open bibliotheek"}
              </button>
            </div>
          </section>

          {!signedIn && (
            <section className="mt-6 flex flex-col gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3"><UserCircle className="mt-0.5 text-blue-700" size={21} /><div><p className="font-semibold text-blue-950">{isEnglish ? "Create a free OTT account" : "Maak een gratis OTT-account"}</p><p className="mt-1 text-sm text-blue-900/75">{isEnglish ? "Save verified learning across devices." : "Bewaar geverifieerde voortgang op verschillende apparaten."}</p></div></div>
              <button type="button" onClick={() => onNavigate?.("wallet")} className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800">{isEnglish ? "Sign in" : "Inloggen"}</button>
            </section>
          )}

          <section className="mt-14">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">{isEnglish ? "Learning paths" : "Leerpaden"}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">{isEnglish ? "Choose one subject at a time." : "Kies één onderwerp tegelijk."}</h2>
            <div className="mt-7 flex flex-wrap gap-2">
              <FilterButton active={selectedPath === "all"} onClick={() => setSelectedPath("all")}>{isEnglish ? "All courses" : "Alle cursussen"}</FilterButton>
              {paths.map((path) => <FilterButton key={path.id} active={selectedPath === path.id} onClick={() => setSelectedPath(path.id)}>{isEnglish ? path.en : path.nl}</FilterButton>)}
            </div>
            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {visibleCourses.map((course) => {
                const completion = progress.completions.find((item) => item.lessonId === course.id);
                return <CourseCard key={course.id} course={course} isEnglish={isEnglish} locked={course.access === "access" && !accessUnlocked} score={completion?.overallScore} onClick={() => openCourse(course)} />;
              })}
            </div>
          </section>
        </main>
      )}

      {view === "library" && (
        <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">XRPL Library</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">{isEnglish ? "Search the Academy encyclopedia." : "Doorzoek de Academy-encyclopedie."}</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">{isEnglish ? "Find a course, term or explanation and return to the full lesson when needed." : "Zoek een cursus, begrip of uitleg en ga wanneer nodig terug naar de volledige les."}</p>
          </div>
          <div className="relative mt-8 max-w-2xl">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={19} />
            <input value={libraryQuery} onChange={(event) => setLibraryQuery(event.target.value)} placeholder={isEnglish ? "Search wallet, trustline, AMM, validation…" : "Zoek wallet, trustline, AMM, validatie…"} className="w-full rounded-2xl border border-slate-200 py-3.5 pl-12 pr-4 text-sm outline-none focus:border-blue-500" />
          </div>
          <div className="mt-9 space-y-5">
            {libraryCourses.map((course) => {
              const content = ACADEMY_LEARNING_CONTENT[course.id];
              return (
                <article key={course.id} className="rounded-3xl border border-slate-200 p-6 sm:p-8">
                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div className="max-w-3xl">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">{isEnglish ? "Course" : "Cursus"} {course.module}</p>
                      <h3 className="mt-2 text-xl font-semibold">{course.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{isEnglish ? content?.summaryEn : content?.summaryNl}</p>
                    </div>
                    <button type="button" onClick={() => openCourse(course)} className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50">{isEnglish ? "Open lesson" : "Open les"}<ChevronRight size={16} /></button>
                  </div>
                  <div className="mt-6 grid gap-3 md:grid-cols-3">
                    {content?.glossary.map((item) => <div key={item.term} className="rounded-2xl bg-slate-50 p-4"><p className="text-sm font-semibold">{item.term}</p><p className="mt-2 text-sm leading-6 text-slate-600">{isEnglish ? item.definitionEn : item.definitionNl}</p></div>)}
                  </div>
                </article>
              );
            })}
            {libraryCourses.length === 0 && <p className="rounded-2xl border border-slate-200 p-6 text-sm text-slate-600">{isEnglish ? "No library results found." : "Geen resultaten gevonden in de bibliotheek."}</p>}
          </div>
        </main>
      )}

      {view === "course" && (
        <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
          <button type="button" onClick={() => setView("hub")} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"><ChevronLeft size={17} />{isEnglish ? "Back to courses" : "Terug naar cursussen"}</button>
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
            <section>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100"><CourseIcon size={23} /></div>
                <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">{isEnglish ? "Course" : "Cursus"} {selectedCourse.module} · {selectedCourse.difficulty} · {selectedCourse.minutes} min</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{selectedCourse.title}</h2></div>
              </div>

              <section className="mt-8 rounded-3xl border border-blue-100 bg-blue-50/50 p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">{isEnglish ? "Learn first" : "Leer eerst"}</p>
                <p className="mt-4 text-lg leading-8 text-slate-800">{isEnglish ? selectedContent?.summaryEn : selectedContent?.summaryNl}</p>
              </section>

              <div className="mt-6 space-y-4">
                {selectedContent?.sections.map((section, index) => <article key={section.titleEn} className="rounded-2xl border border-slate-200 p-6"><div className="flex gap-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white">{index + 1}</span><div><h3 className="text-lg font-semibold">{isEnglish ? section.titleEn : section.titleNl}</h3><p className="mt-3 text-sm leading-7 text-slate-600">{isEnglish ? section.bodyEn : section.bodyNl}</p></div></div></article>)}
              </div>

              <section className="mt-6 rounded-2xl bg-slate-950 p-6 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">{isEnglish ? "Example" : "Voorbeeld"}</p>
                <p className="mt-3 text-sm leading-7 text-slate-200">{isEnglish ? selectedContent?.exampleEn : selectedContent?.exampleNl}</p>
              </section>

              <section className="mt-6">
                <h3 className="text-lg font-semibold">{isEnglish ? "Key terms" : "Kernbegrippen"}</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {selectedContent?.glossary.map((item) => <div key={item.term} className="rounded-2xl border border-slate-200 p-4"><p className="text-sm font-semibold">{item.term}</p><p className="mt-2 text-sm leading-6 text-slate-600">{isEnglish ? item.definitionEn : item.definitionNl}</p></div>)}
                </div>
              </section>

              <div className="mt-12 border-t border-slate-200 pt-10">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">{isEnglish ? "Knowledge check" : "Kennistoets"}</p>
                <h3 className="mt-3 text-2xl font-semibold">{isEnglish ? "Explain what you learned in your own words." : "Leg in je eigen woorden uit wat je hebt geleerd."}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{isEnglish ? "Use the lesson above. Copying exact sentences is not required; understanding is." : "Gebruik de les hierboven. Exacte zinnen kopiëren hoeft niet; begrip wel."}</p>
              </div>

              <div className="mt-7 space-y-5">
                {selectedCourse.tasks.map((task, index) => {
                  const answer = selectedAnswers[task.id] ?? "";
                  const assessment = selectedAssessments.find((item) => item.taskId === task.id);
                  return (
                    <article key={task.id} className={`rounded-2xl border p-5 sm:p-6 ${assessment?.passed ? "border-emerald-200 bg-emerald-50/40" : assessment ? "border-amber-200 bg-amber-50/40" : "border-slate-200"}`}>
                      <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">{isEnglish ? `Question ${index + 1}` : `Vraag ${index + 1}`}</p><h3 className="mt-2 text-base font-semibold leading-6">{isEnglish ? task.promptEn : task.promptNl}</h3></div>{assessment && <span className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold">{assessment.score}%</span>}</div>
                      <textarea value={answer} onChange={(event) => updateAnswer(task.id, event.target.value)} maxLength={MAX_ANSWER_LENGTH} rows={4} disabled={Boolean(selectedCompletion)} placeholder={isEnglish ? "Explain this in your own words…" : "Leg dit in je eigen woorden uit…"} className="mt-5 w-full rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 outline-none focus:border-blue-500 disabled:bg-slate-50" />
                      <div className="mt-2 flex justify-between text-xs text-slate-500"><span>{isEnglish ? "Minimum 18 meaningful characters" : "Minimaal 18 betekenisvolle tekens"}</span><span>{answer.length}/{MAX_ANSWER_LENGTH}</span></div>
                      {assessment && <div className="mt-4 flex gap-3 rounded-xl border border-slate-200 bg-white p-4">{assessment.passed ? <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-700" size={18} /> : <XCircle className="mt-0.5 shrink-0 text-amber-700" size={18} />}<div><p className="text-sm leading-6 text-slate-700">{assessment.feedback}</p>{assessment.missingConcepts.length > 0 && <p className="mt-2 text-xs text-slate-500">{isEnglish ? "Review: " : "Controleer: "}{assessment.missingConcepts.join(", ")}</p>}</div></div>}
                    </article>
                  );
                })}
              </div>
            </section>

            <aside>
              <div className="sticky top-24 rounded-2xl border border-slate-200 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{isEnglish ? "Course check" : "Cursuscontrole"}</p>
                <div className="mt-5 space-y-4 text-sm">
                  <InfoRow label={isEnglish ? "Learning material" : "Lesmateriaal"} value={`${selectedContent?.sections.length ?? 0} ${isEnglish ? "sections" : "delen"}`} />
                  <InfoRow label={isEnglish ? "Stored under" : "Opgeslagen onder"} value={signedIn ? accountName || "OTT account" : (isEnglish ? "Practice only" : "Alleen oefenen")} />
                  <InfoRow label={isEnglish ? "Pass mark" : "Slagingsgrens"} value="70% each" />
                  <InfoRow label={isEnglish ? "Reward" : "Beloning"} value={`+${selectedCourse.xp} XP`} />
                </div>
                <button type="button" onClick={() => void assessAndComplete()} disabled={isAssessing || Boolean(selectedCompletion)} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">{isAssessing ? <Loader2 className="animate-spin" size={17} /> : selectedCompletion ? <BadgeCheck size={17} /> : <Brain size={17} />}{isAssessing ? (isEnglish ? "Checking answers" : "Antwoorden controleren") : selectedCompletion ? (isEnglish ? "Course verified" : "Cursus geverifieerd") : (isEnglish ? "Check my answers" : "Controleer mijn antwoorden")}</button>
                {!signedIn && <button type="button" onClick={() => onNavigate?.("wallet")} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-50"><UserCircle size={17} />{isEnglish ? "Sign in to save" : "Log in om op te slaan"}</button>}
                <a href={selectedCourse.sourceUrl} target="_blank" rel="noreferrer" className="mt-5 flex items-center justify-between gap-3 border-t border-slate-200 pt-5 text-sm text-slate-600 hover:text-slate-950"><span><span className="block text-xs text-slate-400">{isEnglish ? "Official source" : "Officiële bron"}</span><span className="mt-1 block font-medium">{selectedCourse.sourceLabel}</span></span><ExternalLink size={17} /></a>
              </div>
            </aside>
          </div>
        </main>
      )}

      {view === "certificate" && (
        <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <section>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">{isEnglish ? "Final Academy achievement" : "Definitieve Academy-prestatie"}</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">OTT XRPL Foundation Certificate</h2>
              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600">{isEnglish ? "A separate certificate collection for verified Foundation completion, not part of the 500 Access Pass NFTs." : "Een aparte certificaatcollectie voor geverifieerde Foundation-afronding, los van de 500 Access Pass-NFT’s."}</p>
              <div className="mt-10 rounded-2xl border border-slate-200 p-6 sm:p-8">
                <h3 className="text-xl font-semibold">{isEnglish ? "Certificate requirements" : "Certificaatvoorwaarden"}</h3>
                <div className="mt-6 space-y-4">
                  <Requirement done={progress.completedCount === courses.length} text={isEnglish ? `Complete all ${courses.length} courses` : `Rond alle ${courses.length} cursussen af`} />
                  <Requirement done={false} text={isEnglish ? "Pass the randomized final assessment" : "Slaag voor de willekeurige eindtoets"} />
                  <Requirement done={signedIn} text={isEnglish ? "Use a verified OTT account" : "Gebruik een geverifieerd OTT-account"} />
                  <Requirement done={hasWallet} text={isEnglish ? "Prove the receiving wallet" : "Bewijs de ontvangende wallet"} />
                </div>
                <div className="mt-8"><div className="flex justify-between text-sm font-medium"><span>{isEnglish ? "Current progress" : "Huidige voortgang"}</span><span>{progressPercent}%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-700" style={{ width: `${progressPercent}%` }} /></div></div>
              </div>
            </section>
            <aside className="rounded-3xl border border-slate-200 bg-slate-950 p-7 text-white"><Award size={32} className="text-blue-300" /><p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">{isEnglish ? "Certificate edition" : "Certificaat-editie"}</p><p className="mt-3 text-3xl font-semibold">#0001–#5000</p><p className="mt-4 text-sm leading-6 text-slate-300">{isEnglish ? "Reserved · artwork, metadata, final assessment and claim service still need to be completed." : "Gereserveerd · artwork, metadata, eindtoets en claimservice moeten nog worden voltooid."}</p></aside>
          </div>
        </main>
      )}
    </div>
  );
}

function ViewButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${active ? "bg-slate-950 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{children}</button>;
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} className={`rounded-full px-4 py-2 text-sm font-medium ${active ? "bg-blue-700 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{children}</button>;
}

function SummaryCard({ label, value, text }: { label: string; value: string; text: string }) {
  return <div className="rounded-2xl border border-slate-200 p-5"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-xl font-semibold">{value}</p><p className="mt-1 text-xs text-slate-500">{text}</p></div>;
}

function CourseCard({ course, isEnglish, locked, score, onClick }: { course: Course; isEnglish: boolean; locked: boolean; score?: number; onClick: () => void }) {
  const Icon = course.icon;
  return <article className="rounded-3xl border border-slate-200 p-6 transition hover:border-slate-300 hover:shadow-sm"><div className="flex items-start justify-between gap-4"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100"><Icon size={21} /></div>{score !== undefined ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">{score}%</span> : locked ? <Lock size={17} className="text-slate-400" /> : <span className="text-xs font-medium text-blue-700">{course.access === "free" ? "Free" : "Access"}</span>}</div><p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{isEnglish ? "Course" : "Cursus"} {course.module} · {course.minutes} min</p><h3 className="mt-2 text-xl font-semibold">{course.title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{isEnglish ? course.outcomeEn : course.outcomeNl}</p><div className="mt-5 flex flex-wrap gap-2">{course.topics.slice(0, 3).map((topic) => <span key={topic} className="rounded-full bg-slate-50 px-3 py-1 text-xs text-slate-500">{topic}</span>)}</div><button type="button" onClick={onClick} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-950">{score !== undefined ? (isEnglish ? "Review lesson" : "Les opnieuw bekijken") : locked ? (isEnglish ? "Verify Access" : "Verifieer Access") : (isEnglish ? "Start learning" : "Start met leren")}<ChevronRight size={16} /></button></article>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-4"><span className="text-slate-500">{label}</span><span className="text-right font-medium text-slate-900">{value}</span></div>;
}

function Requirement({ done, text }: { done: boolean; text: string }) {
  return <div className="flex items-center gap-3"><span className={`flex h-6 w-6 items-center justify-center rounded-full ${done ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>{done ? <CheckCircle2 size={15} /> : <Lock size={13} />}</span><span className="text-sm text-slate-700">{text}</span></div>;
}
