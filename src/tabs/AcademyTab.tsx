import { useMemo, useState } from "react";
import type { ElementType, ReactNode } from "react";
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
  KeyRound,
  Layers,
  Lock,
  Network,
  PlayCircle,
  Repeat2,
  ShieldCheck,
  Sparkles,
  Target,
  Wallet,
} from "lucide-react";
import { OTTLogo, OTTProofBadge } from "../components/OTTLogo";
import { MAKE_WAVES_SOURCE_TAG } from "../lib/makeWaves";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

type AcademyTabProps = {
  walletAddress?: string;
};

type LessonStatus = "free" | "premium";
type AcademyView = "path" | "lesson" | "quiz" | "certificate";
type Difficulty = "Beginner" | "Intermediate" | "Builder" | "Agentic";

type Lesson = {
  id: string;
  module: string;
  difficulty: Difficulty;
  titleNl: string;
  titleEn: string;
  goalNl: string;
  goalEn: string;
  ottAngleNl: string;
  ottAngleEn: string;
  topicsNl: string[];
  topicsEn: string[];
  tasksNl: string[];
  tasksEn: string[];
  sourceLabel: string;
  sourceUrl: string;
  minutes: number;
  status: LessonStatus;
  xp: number;
  credits: number;
  icon: ElementType;
};

type QuizQuestion = {
  id: string;
  questionNl: string;
  questionEn: string;
  answersNl: string[];
  answersEn: string[];
  correctIndex: number;
};

const progressStorageKey = "ott-academy-progress-v2";

const lessons: Lesson[] = [
  {
    id: "blockchain-crypto-basics",
    module: "01",
    difficulty: "Beginner",
    titleNl: "Blockchain & Crypto Basics",
    titleEn: "Blockchain & Crypto Basics",
    goalNl: "Leer de basis van blockchain, crypto, wallets, transacties en waarom verificatie belangrijker is dan hype.",
    goalEn: "Learn the basics of blockchain, crypto, wallets, transactions and why verification matters more than hype.",
    ottAngleNl: "OTT vertaalt dit naar: eerst begrijpen, dan pas tekenen.",
    ottAngleEn: "OTT translates this into: understand first, sign later.",
    topicsNl: ["Wat is blockchain?", "Wat is crypto?", "Waarom self-custody?", "Wat is een transactie?", "Wat zijn risico's?"],
    topicsEn: ["What is blockchain?", "What is crypto?", "Why self-custody?", "What is a transaction?", "What are the risks?"],
    tasksNl: ["Leg in eigen woorden uit wat een ledger is.", "Schrijf drie risico's op voordat je een wallet gebruikt.", "Open de Academy quiz."],
    tasksEn: ["Explain in your own words what a ledger is.", "Write down three risks before using a wallet.", "Open the Academy quiz."],
    sourceLabel: "XRPL Learning Portal · Blockchain and Crypto Basics",
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
    titleNl: "Intro to the XRPL",
    titleEn: "Intro to the XRPL",
    goalNl: "Leer wat de XRP Ledger is, hoe het netwerk werkt en waarom het geschikt is voor snelle, goedkope proof-acties.",
    goalEn: "Learn what the XRP Ledger is, how the network works and why it fits fast, low-cost proof actions.",
    ottAngleNl: `OTT koppelt dit aan SourceTag ${MAKE_WAVES_SOURCE_TAG} en Make Waves proof.`,
    ottAngleEn: `OTT links this to SourceTag ${MAKE_WAVES_SOURCE_TAG} and Make Waves proof.`,
    topicsNl: ["XRPL geschiedenis", "Ledger basics", "Accounts", "Transacties", "Finaliteit"],
    topicsEn: ["XRPL history", "Ledger basics", "Accounts", "Transactions", "Finality"],
    tasksNl: ["Open XRPL Explorer.", "Zoek een transactie op.", "Controleer ledger status en tx-resultaat."],
    tasksEn: ["Open XRPL Explorer.", "Look up a transaction.", "Check ledger status and tx result."],
    sourceLabel: "XRPL Learning Portal · Intro to the XRPL",
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
    titleNl: "Payments Use Cases on XRPL",
    titleEn: "Payments Use Cases on XRPL",
    goalNl: "Leer hoe betalingen op XRPL werken en hoe een kleine proof-betaling veilig gecontroleerd kan worden.",
    goalEn: "Learn how payments on XRPL work and how a small proof payment can be verified safely.",
    ottAngleNl: "OTT gebruikt dit voor Daily Check-In, SourceTag Proof en XP/OTT Credits.",
    ottAngleEn: "OTT uses this for Daily Check-In, SourceTag Proof and XP/OTT Credits.",
    topicsNl: ["XRP payments", "Payment status", "tesSUCCESS", "Memo", "SourceTag"],
    topicsEn: ["XRP payments", "Payment status", "tesSUCCESS", "Memo", "SourceTag"],
    tasksNl: ["Maak een proof-payload.", "Verify de transactie.", "Controleer Reward Ledger."],
    tasksEn: ["Create a proof payload.", "Verify the transaction.", "Check Reward Ledger."],
    sourceLabel: "XRPL Learning Portal · Payments Use Cases",
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
    titleNl: `SourceTag ${MAKE_WAVES_SOURCE_TAG} Proof`,
    titleEn: `SourceTag ${MAKE_WAVES_SOURCE_TAG} Proof`,
    goalNl: "Begrijp waarom SourceTag de publieke OTT Make Waves-signatuur is en hoe je hem controleert.",
    goalEn: "Understand why SourceTag is the public OTT Make Waves signature and how to verify it.",
    ottAngleNl: "Dit is de kern van onze challenge-flow: Connect → Learn → Prove → Track.",
    ottAngleEn: "This is the core challenge flow: Connect → Learn → Prove → Track.",
    topicsNl: ["SourceTag", "Audit trail", "Memo", "Campaign tracking", "Reward eligibility"],
    topicsEn: ["SourceTag", "Audit trail", "Memo", "Campaign tracking", "Reward eligibility"],
    tasksNl: [`Controleer SourceTag ${MAKE_WAVES_SOURCE_TAG}.`, "Controleer of account en destination kloppen.", "Controleer of XP/Credits niet dubbel worden toegevoegd."],
    tasksEn: [`Check SourceTag ${MAKE_WAVES_SOURCE_TAG}.`, "Check account and destination.", "Check that XP/Credits are not added twice."],
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
    titleNl: "Explore DeFi-Island",
    titleEn: "Explore DeFi-Island",
    goalNl: "Gebruik de 3D XRPL testnet leerwereld als speelse onboarding naar DeFi-concepten.",
    goalEn: "Use the 3D XRPL testnet learning world as a playful onboarding path to DeFi concepts.",
    ottAngleNl: "OTT kan dit later gamified maken met quests, badges en XP.",
    ottAngleEn: "OTT can later gamify this with quests, badges and XP.",
    topicsNl: ["3D learning", "Quests", "Testnet", "DeFi basics", "Gamified learning"],
    topicsEn: ["3D learning", "Quests", "Testnet", "DeFi basics", "Gamified learning"],
    tasksNl: ["Open DeFi-Island.", "Voltooi een quest.", "Noteer welke XRPL concepten je tegenkomt."],
    tasksEn: ["Open DeFi-Island.", "Complete a quest.", "Write down which XRPL concepts you encounter."],
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
    titleNl: "Deep Dive into XRPL DeFi",
    titleEn: "Deep Dive into XRPL DeFi",
    goalNl: "Leer DeFi op XRPL begrijpen: veiligheid, pathfinding, autobridging, liquidity pools en risico's.",
    goalEn: "Understand XRPL DeFi: safety, pathfinding, auto-bridging, liquidity pools and risks.",
    ottAngleNl: "Premium omdat dit snel verkeerd begrepen wordt en begeleiding nodig heeft.",
    ottAngleEn: "Premium because this is easily misunderstood and needs guidance.",
    topicsNl: ["DEX", "Auto-bridging", "Pathfinding", "AMM", "Liquidity risk"],
    topicsEn: ["DEX", "Auto-bridging", "Pathfinding", "AMM", "Liquidity risk"],
    tasksNl: ["Leg AMM uit zonder winstbelofte.", "Vergelijk DEX vs broker.", "Schrijf drie DeFi-risico's op."],
    tasksEn: ["Explain AMM without a profit promise.", "Compare DEX vs broker.", "Write down three DeFi risks."],
    sourceLabel: "XRPL Learning Portal · Deep Dive into XRPL DeFi",
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
    titleNl: "Blockchain for Business",
    titleEn: "Blockchain for Business",
    goalNl: "Leer hoe bedrijven XRPL kunnen gebruiken voor finance, proof, compliance en nieuwe workflows.",
    goalEn: "Learn how businesses can use XRPL for finance, proof, compliance and new workflows.",
    ottAngleNl: "Dit wordt de basis voor partnergesprekken, demos en B2B-terminalroutes.",
    ottAngleEn: "This becomes the base for partner conversations, demos and B2B terminal routes.",
    topicsNl: ["Business use cases", "Compliance", "Operational finance", "Proof workflows", "Education"],
    topicsEn: ["Business use cases", "Compliance", "Operational finance", "Proof workflows", "Education"],
    tasksNl: ["Kies één bedrijfsscenario.", "Beschrijf probleem → XRPL-route → proof.", "Maak een mini partner brief."],
    tasksEn: ["Choose one business scenario.", "Describe problem → XRPL route → proof.", "Create a mini partner brief."],
    sourceLabel: "XRPL Learning Portal · Blockchain for Business",
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
    titleNl: "Tokenization & Real World Assets",
    titleEn: "Tokenization & Real World Assets",
    goalNl: "Leer hoe real-world assets conceptueel als tokens kunnen worden weergegeven op XRPL.",
    goalEn: "Learn how real-world assets can conceptually be represented as tokens on XRPL.",
    ottAngleNl: "Premium omdat dit juridisch gevoelig is en duidelijke framing vereist.",
    ottAngleEn: "Premium because this is legally sensitive and requires careful framing.",
    topicsNl: ["Tokenization", "RWA", "Issuer", "Compliance", "Utility vs security"],
    topicsEn: ["Tokenization", "RWA", "Issuer", "Compliance", "Utility vs security"],
    tasksNl: ["Bedenk een utility-only voorbeeld.", "Schrijf wat je níet mag beloven.", "Koppel het aan legal review."],
    tasksEn: ["Create a utility-only example.", "Write what you must not promise.", "Link it to legal review."],
    sourceLabel: "XRPL Learning Portal · Tokenization and RWA",
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
    titleNl: "Stablecoins on XRPL",
    titleEn: "Stablecoins on XRPL",
    goalNl: "Leer hoe stablecoins worden uitgegeven, verplaatst en geïntegreerd op XRPL.",
    goalEn: "Learn how stablecoins are issued, transferred and integrated on XRPL.",
    ottAngleNl: "Relevant voor toekomstige fiat/commerce routes, maar V1 blijft education-only.",
    ottAngleEn: "Relevant for future fiat/commerce routes, while V1 remains education-only.",
    topicsNl: ["Stablecoins", "Issued assets", "Issuer", "Transfers", "Integration"],
    topicsEn: ["Stablecoins", "Issued assets", "Issuer", "Transfers", "Integration"],
    tasksNl: ["Leg stablecoin uit zonder bankbelofte.", "Controleer issuer-risico.", "Maak een safety checklist."],
    tasksEn: ["Explain stablecoin without a bank promise.", "Check issuer risk.", "Create a safety checklist."],
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
    titleNl: "Exploring DeFi: Exchanges, Lending & Trading",
    titleEn: "Exploring DeFi: Exchanges, Lending & Trading",
    goalNl: "Leer DeFi-routes begrijpen zonder dat OTT advies, broker of execution provider wordt.",
    goalEn: "Understand DeFi routes without OTT becoming an adviser, broker or execution provider.",
    ottAngleNl: "Premium: leren, simuleren en risico begrijpen; geen trade-aansturing.",
    ottAngleEn: "Premium: learn, simulate and understand risk; no trade execution.",
    topicsNl: ["Exchange basics", "Lending concepts", "Trading risks", "Simulation", "No advice"],
    topicsEn: ["Exchange basics", "Lending concepts", "Trading risks", "Simulation", "No advice"],
    tasksNl: ["Maak een risicoanalyse.", "Scheid educatie van advies.", "Schrijf een 'do not promise' lijst."],
    tasksEn: ["Create a risk analysis.", "Separate education from advice.", "Write a 'do not promise' list."],
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
    titleNl: "Decentralized Identity on XRPL",
    titleEn: "Decentralized Identity on XRPL",
    goalNl: "Leer hoe DID, credentials en compliance passen bij Web3 finance en gebruikersvertrouwen.",
    goalEn: "Learn how DIDs, credentials and compliance fit Web3 finance and user trust.",
    ottAngleNl: "Premium omdat dit later kan groeien naar certificaten, badges en verified profiles.",
    ottAngleEn: "Premium because this can grow into certificates, badges and verified profiles.",
    topicsNl: ["DID", "Credentials", "Compliance", "Web3 identity", "Proof profiles"],
    topicsEn: ["DID", "Credentials", "Compliance", "Web3 identity", "Proof profiles"],
    tasksNl: ["Ontwerp een proof badge.", "Beschrijf wat publiek en privé moet blijven.", "Koppel aan certificaten."],
    tasksEn: ["Design a proof badge.", "Describe what should stay public or private.", "Link it to certificates."],
    sourceLabel: "XRPL Learning Portal · Decentralized Identity",
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
    titleNl: "Build with XRPL and React.js",
    titleEn: "Build with XRPL and React.js",
    goalNl: "Leer hoe je een front-end app bouwt die accounts, payments en trustlines kan gebruiken.",
    goalEn: "Learn how to build a front-end app that can use accounts, payments and trustlines.",
    ottAngleNl: "Premium builder route: van gebruiker naar maker.",
    ottAngleEn: "Premium builder route: from user to maker.",
    topicsNl: ["React", "XRPL account", "Payments", "Trustlines", "Front-end UX"],
    topicsEn: ["React", "XRPL account", "Payments", "Trustlines", "Front-end UX"],
    tasksNl: ["Maak een componentplan.", "Beschrijf veilige signing UX.", "Bouw eerst testnet."],
    tasksEn: ["Create a component plan.", "Describe safe signing UX.", "Build testnet first."],
    sourceLabel: "XRPL Learning Portal · Build with React.js",
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
    titleNl: "Code with XRPL and JavaScript",
    titleEn: "Code with XRPL and JavaScript",
    goalNl: "Leer XRPL-codeconcepten met JavaScript: accounts, payments, trustlines en verificatie.",
    goalEn: "Learn XRPL coding concepts with JavaScript: accounts, payments, trustlines and verification.",
    ottAngleNl: "Premium builder route voor mensen die OTT-achtige tools willen leren maken.",
    ottAngleEn: "Premium builder route for people who want to learn to build OTT-style tools.",
    topicsNl: ["xrpl.js", "Account setup", "Send XRP", "Trustlines", "Verification"],
    topicsEn: ["xrpl.js", "Account setup", "Send XRP", "Trustlines", "Verification"],
    tasksNl: ["Schrijf pseudo-code voor tx verify.", "Noem drie veiligheidschecks.", "Bouw alleen op testnet."],
    tasksEn: ["Write pseudocode for tx verify.", "Name three safety checks.", "Build only on testnet."],
    sourceLabel: "XRPL Learning Portal · Code with XRPL and JavaScript",
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
    titleNl: "AI Agents & Agentic Transactions",
    titleEn: "AI Agents & Agentic Transactions",
    goalNl: "Leer waarom XRPL interessant is voor AI-agents: voorspelbare kosten, finaliteit, audit trails en veilige beperkingen.",
    goalEn: "Learn why XRPL is interesting for AI agents: predictable costs, finality, audit trails and safe constraints.",
    ottAngleNl: "Premium future module: agent-flow alleen met testnet, duidelijke limieten en menselijke controle.",
    ottAngleEn: "Premium future module: agent flow only with testnet, clear limits and human control.",
    topicsNl: ["AI agent wallet", "Agentic payment loop", "MCP docs", "x402", "Audit trail"],
    topicsEn: ["AI agent wallet", "Agentic payment loop", "MCP docs", "x402", "Audit trail"],
    tasksNl: ["Beschrijf wat een agent wel/niet mag doen.", "Maak een limietenlijst.", "Gebruik alleen testnet in de oefening."],
    tasksEn: ["Describe what an agent may/may not do.", "Create a limits list.", "Use testnet only in the exercise."],
    sourceLabel: "XRPL.org · Agentic Transactions",
    sourceUrl: "https://xrpl.org/docs/agents/agentic-transactions",
    minutes: 90,
    status: "premium",
    xp: 60,
    credits: 6,
    icon: Cpu,
  },
];

const quizQuestions: QuizQuestion[] = [
  {
    id: "q1",
    questionNl: "Wat is de veiligste positie van OTT Terminal?",
    questionEn: "What is the safest position for OTT Terminal?",
    answersNl: ["Private keys bewaren voor gebruikers", "Education-first, self-custody, geen custody", "Automatisch traden namens gebruikers"],
    answersEn: ["Store private keys for users", "Education-first, self-custody, no custody", "Automatically trade on behalf of users"],
    correctIndex: 1,
  },
  {
    id: "q2",
    questionNl: `Waarvoor gebruikt OTT SourceTag ${MAKE_WAVES_SOURCE_TAG}?`,
    questionEn: `What does OTT use SourceTag ${MAKE_WAVES_SOURCE_TAG} for?`,
    answersNl: ["Proof en herkenbaarheid van OTT/Make Waves transacties", "Geheime wallet-toegang", "Prijsvoorspellingen"],
    answersEn: ["Proof and recognition of OTT/Make Waves transactions", "Secret wallet access", "Price predictions"],
    correctIndex: 0,
  },
  {
    id: "q3",
    questionNl: "Waarom zijn premium DeFi-lessen locked?",
    questionEn: "Why are premium DeFi lessons locked?",
    answersNl: ["Omdat risico, compliance en context belangrijk zijn", "Omdat DeFi altijd gratis geld is", "Omdat OTT trades uitvoert"],
    answersEn: ["Because risk, compliance and context matter", "Because DeFi is always free money", "Because OTT executes trades"],
    correctIndex: 0,
  },
  {
    id: "q4",
    questionNl: "Wat is de juiste positie van AI-agent modules?",
    questionEn: "What is the correct position for AI agent modules?",
    answersNl: ["Testnet, limieten, audit trail en menselijke controle", "Volledig autonome mainnet-uitgaven zonder limiet", "Seeds delen met de agent"],
    answersEn: ["Testnet, limits, audit trail and human control", "Fully autonomous mainnet spending without limits", "Share seeds with the agent"],
    correctIndex: 0,
  },
];

export function AcademyTab({ walletAddress = "guest" }: AcademyTabProps) {
  const { language } = useTerminalLanguage();
  const isEnglish = language === "en";

  const [activeView, setActiveView] = useState<AcademyView>("path");
  const [selectedLessonId, setSelectedLessonId] = useState(lessons[0].id);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(() => readProgress());
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});

  const selectedLesson = lessons.find((lesson) => lesson.id === selectedLessonId) ?? lessons[0];
  const completedCount = completedLessonIds.length;
  const progressPercent = Math.round((completedCount / lessons.length) * 100);
  const totalXp = lessons
    .filter((lesson) => completedLessonIds.includes(lesson.id))
    .reduce((sum, lesson) => sum + lesson.xp, 0);
  const totalCredits = lessons
    .filter((lesson) => completedLessonIds.includes(lesson.id))
    .reduce((sum, lesson) => sum + lesson.credits, 0);
  const quizScore = useMemo(() => {
    return quizQuestions.reduce((score, question) => {
      return quizAnswers[question.id] === question.correctIndex ? score + 1 : score;
    }, 0);
  }, [quizAnswers]);

  const premiumLessons = lessons.filter((lesson) => lesson.status === "premium").length;
  const freeLessons = lessons.filter((lesson) => lesson.status === "free").length;
  const totalMinutes = lessons.reduce((sum, lesson) => sum + lesson.minutes, 0);

  function toggleLessonComplete(lessonId: string) {
    const next = completedLessonIds.includes(lessonId)
      ? completedLessonIds.filter((id) => id !== lessonId)
      : [...completedLessonIds, lessonId];

    setCompletedLessonIds(next);
    writeProgress(next);
  }

  return (
    <div className="min-h-screen bg-white text-[#080808]">
      <section className="relative overflow-hidden border-b border-black/10 bg-[radial-gradient(circle_at_18%_18%,rgba(56,152,232,0.16),transparent_28%),radial-gradient(circle_at_82%_8%,rgba(200,56,136,0.16),transparent_28%),radial-gradient(circle_at_85%_82%,rgba(216,72,88,0.12),transparent_30%),#ffffff]">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.28),#ffffff_92%)]" />

        <div className="relative z-10 p-4 md:p-6 xl:p-10">
          <div className="grid grid-cols-12 gap-6 items-end">
            <div className="col-span-12 xl:col-span-8">
              <div className="mb-6">
                <OTTLogo size="lg" subtitle={isEnglish ? "XRPL portal knowledge in the OTT jacket" : "XRPL portal kennis in het OTT jasje"} />
              </div>

              <div className="inline-flex items-center gap-2 border border-black/10 bg-white/80 shadow-sm px-4 py-2 mb-6">
                <GraduationCap size={15} className="text-[#3898E8]" />

                <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/55">
                  {isEnglish ? "OTT Academy V2 · Deep Catalog" : "OTT Academie V2 · Deep Catalog"}
                </p>
              </div>

              <h1 className="font-orbitron text-4xl xl:text-6xl font-black uppercase leading-none tracking-tight mb-6">
                {isEnglish ? "Learn XRPL." : "Leer XRPL."}
                <br />
                <span className="bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] bg-clip-text text-transparent">
                  {isEnglish ? "Stay On TheTrack." : "Blijf OnTheTrack."}
                </span>
              </h1>

              <p className="font-mono text-sm xl:text-base text-black/60 leading-relaxed max-w-3xl mb-8">
                {isEnglish
                  ? "A deeper Academy built from the XRPL Learning Portal and official docs, rewritten in OTT language: free onboarding first, then a large premium path for DeFi, business, tokenization, identity, coding and AI agents."
                  : "Een diepere Academy gebouwd vanuit het XRPL Learning Portal en officiële docs, herschreven in OTT-taal: eerst gratis onboarding, daarna een groot premium pad voor DeFi, business, tokenization, identity, coding en AI agents."}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 max-w-5xl">
                <MetricCard label={isEnglish ? "Progress" : "Voortgang"} value={`${progressPercent}%`} text={`${completedCount}/${lessons.length} modules`} icon={Target} />
                <MetricCard label="XP" value={String(totalXp)} text={isEnglish ? "Learning score" : "Leerscore"} icon={Sparkles} />
                <MetricCard label="OTT Credits" value={String(totalCredits)} text={isEnglish ? "Academy credits" : "Academy credits"} icon={Award} />
                <MetricCard label={isEnglish ? "Free" : "Gratis"} value={String(freeLessons)} text={isEnglish ? "Open modules" : "Open modules"} icon={BookOpen} />
                <MetricCard label={isEnglish ? "Premium" : "Premium"} value={String(premiumLessons)} text={`${Math.round(totalMinutes / 60)}h+ content`} icon={Lock} />
              </div>
            </div>

            <div className="col-span-12 xl:col-span-4">
              <div className="border border-black/10 bg-white/90 backdrop-blur p-5 shadow-xl shadow-black/5">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <p className="font-orbitron text-xs uppercase tracking-widest">
                    {isEnglish ? "Student Status" : "Studentstatus"}
                  </p>

                  <div className="border border-black/10 bg-[#F7F8FC] px-3 py-2">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-black/55">
                      V2
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <OTTProofBadge sourceTag={String(MAKE_WAVES_SOURCE_TAG)} />
                </div>

                <div className="space-y-3">
                  <InfoRow label="Wallet" value={walletAddress === "guest" ? "Guest / Free Preview" : walletAddress} />
                  <InfoRow label={isEnglish ? "Total Study Time" : "Totale studietijd"} value={`${Math.round(totalMinutes / 60)}+ hours`} />
                  <InfoRow label="Quiz" value={`${quizScore}/${quizQuestions.length}`} />
                  <InfoRow label={isEnglish ? "Legal Position" : "Juridische positie"} value={isEnglish ? "Education only" : "Alleen educatie"} />
                </div>

                <div className="border border-black/10 bg-[#F7F8FC] p-4 mt-5">
                  <div className="flex items-start gap-3">
                    <ShieldCheck size={18} className="text-[#C83888] mt-0.5 shrink-0" />

                    <p className="font-mono text-xs text-black/55 leading-relaxed">
                      {isEnglish
                        ? "No custody. No trade execution. No yield promise. The goal is to make users return because learning finally becomes guided, trackable and rewarding."
                        : "Geen custody. Geen trade-uitvoering. Geen yieldbelofte. Het doel is dat gebruikers terugkomen omdat leren eindelijk begeleid, meetbaar en belonend wordt."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-8">
            <ViewButton active={activeView === "path"} label={isEnglish ? "Learning Path" : "Leerpad"} onClick={() => setActiveView("path")} />
            <ViewButton active={activeView === "lesson"} label={isEnglish ? "Lesson Room" : "Lesruimte"} onClick={() => setActiveView("lesson")} />
            <ViewButton active={activeView === "quiz"} label="Quiz" onClick={() => setActiveView("quiz")} />
            <ViewButton active={activeView === "certificate"} label={isEnglish ? "Certificate" : "Certificaat"} onClick={() => setActiveView("certificate")} />
          </div>
        </div>
      </section>

      <section className="p-4 md:p-6 xl:p-10 bg-white">
        {activeView === "path" && (
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 xl:col-span-8">
              <Panel title={isEnglish ? "XRPL Portal → OTT Learning Path" : "XRPL Portal → OTT Leerpad"} icon={Layers}>
                <div className="grid grid-cols-1 gap-3">
                  {lessons.map((lesson) => (
                    <LessonRow
                      key={lesson.id}
                      lesson={lesson}
                      language={language}
                      selected={selectedLesson.id === lesson.id}
                      completed={completedLessonIds.includes(lesson.id)}
                      onSelect={() => {
                        setSelectedLessonId(lesson.id);
                        setActiveView("lesson");
                      }}
                      onToggleComplete={() => toggleLessonComplete(lesson.id)}
                    />
                  ))}
                </div>
              </Panel>
            </div>

            <div className="col-span-12 xl:col-span-4 space-y-4">
              <Panel title={isEnglish ? "Official Source Base" : "Officiële bronbasis"} icon={GraduationCap}>
                <div className="space-y-3">
                  <SourceLink label="XRPL Learning Portal" url="https://learn.xrpl.org/" />
                  <SourceLink label="XRPL.org Docs" url="https://xrpl.org/docs" />
                  <SourceLink label="Agentic Transactions" url="https://xrpl.org/docs/agents/agentic-transactions" />
                  <SourceLink label="XRPL AI Tools" url="https://xrpl.org/resources/dev-tools/ai-tools" />
                </div>

                <div className="border border-[#3898E8]/25 bg-[#3898E8]/10 p-4 mt-5">
                  <p className="font-mono text-xs text-black/60 leading-relaxed">
                    {isEnglish
                      ? "We do not copy the portal word-for-word. We mirror the curriculum, link back to the source and turn it into OTT tasks, XP, credits and proof."
                      : "We kopiëren het portaal niet woord voor woord. We spiegelen het curriculum, linken terug naar de bron en maken er OTT-opdrachten, XP, credits en proof van."}
                  </p>
                </div>
              </Panel>

              <Panel title={isEnglish ? "Retention Strategy" : "Retentie Strategie"} icon={Brain}>
                <div className="space-y-3">
                  <RoadmapLine text={isEnglish ? "Free modules create trust." : "Gratis modules bouwen vertrouwen."} />
                  <RoadmapLine text={isEnglish ? "Premium catalog shows depth." : "Premium catalog toont diepte."} />
                  <RoadmapLine text={isEnglish ? "XP/Credits create return loops." : "XP/Credits zorgen voor terugkeer."} />
                  <RoadmapLine text={isEnglish ? "Source links prove credibility." : "Bronlinks bewijzen geloofwaardigheid."} />
                </div>
              </Panel>
            </div>
          </div>
        )}

        {activeView === "lesson" && (
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 xl:col-span-4">
              <Panel title={isEnglish ? "Modules" : "Modules"} icon={BookOpen}>
                <div className="space-y-3">
                  {lessons.map((lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => setSelectedLessonId(lesson.id)}
                      className={`w-full border p-4 text-left transition-all ${
                        selectedLesson.id === lesson.id
                          ? "border-[#C83888] bg-[#C83888]/10"
                          : "border-black/10 bg-[#F7F8FC] hover:bg-white"
                      }`}
                    >
                      <p className="font-mono text-[10px] uppercase tracking-widest text-black/35 mb-2">
                        {lesson.module} · {lesson.difficulty} · {lesson.minutes} min
                      </p>

                      <p className="font-orbitron text-xs font-black uppercase text-black">
                        {isEnglish ? lesson.titleEn : lesson.titleNl}
                      </p>
                    </button>
                  ))}
                </div>
              </Panel>
            </div>

            <div className="col-span-12 xl:col-span-8">
              <LessonRoom
                lesson={selectedLesson}
                language={language}
                completed={completedLessonIds.includes(selectedLesson.id)}
                onToggleComplete={() => toggleLessonComplete(selectedLesson.id)}
              />
            </div>
          </div>
        )}

        {activeView === "quiz" && (
          <Panel title={isEnglish ? "Knowledge Check" : "Kennischeck"} icon={Brain}>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 xl:col-span-8 space-y-4">
                {quizQuestions.map((question) => (
                  <QuizCard
                    key={question.id}
                    question={question}
                    language={language}
                    selectedIndex={quizAnswers[question.id]}
                    onAnswer={(index) =>
                      setQuizAnswers((current) => ({
                        ...current,
                        [question.id]: index,
                      }))
                    }
                  />
                ))}
              </div>

              <div className="col-span-12 xl:col-span-4">
                <div className="border border-black/10 bg-[#F7F8FC] p-6 sticky top-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/35 mb-4">
                    Quiz Score
                  </p>

                  <p className="font-orbitron text-5xl font-black uppercase mb-4">
                    {quizScore}/{quizQuestions.length}
                  </p>

                  <p className="font-mono text-xs text-black/55 leading-relaxed mb-5">
                    {isEnglish
                      ? "This checks whether users understand safety, SourceTag proof, premium risk and agent limits."
                      : "Dit checkt of gebruikers veiligheid, SourceTag proof, premium risico en agent-limieten begrijpen."}
                  </p>

                  <button
                    onClick={() => setActiveView("certificate")}
                    className="w-full bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] text-white p-4 font-orbitron text-xs font-black uppercase tracking-widest hover:brightness-95 transition-all"
                  >
                    {isEnglish ? "View Certificate" : "Bekijk Certificaat"}
                  </button>
                </div>
              </div>
            </div>
          </Panel>
        )}

        {activeView === "certificate" && (
          <Panel title={isEnglish ? "Completion Proof" : "Afronding Proof"} icon={Award}>
            <div className="border border-black/10 bg-[radial-gradient(circle_at_20%_20%,rgba(56,152,232,0.14),transparent_28%),radial-gradient(circle_at_82%_15%,rgba(200,56,136,0.14),transparent_28%),#ffffff] p-6 md:p-10">
              <div className="max-w-3xl mx-auto border border-black/10 bg-white/90 p-6 md:p-10 text-center shadow-xl shadow-black/5">
                <Award size={42} className="mx-auto mb-6 text-[#C83888]" />

                <p className="font-mono text-[10px] uppercase tracking-[0.45em] text-black/35 mb-4">
                  OTT Academy Certificate
                </p>

                <h2 className="font-orbitron text-3xl md:text-5xl font-black uppercase mb-6">
                  {isEnglish ? "XRPL Deep Learning Path" : "XRPL Deep Learning Pad"}
                </h2>

                <p className="font-mono text-sm text-black/55 leading-relaxed mb-8">
                  {isEnglish
                    ? "Proof-ready foundation for progress, XP, credits, wallet address and future certificates."
                    : "Proof-ready basis voor voortgang, XP, credits, walletadres en toekomstige certificaten."}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
                  <InfoRow label={isEnglish ? "Progress" : "Voortgang"} value={`${progressPercent}%`} />
                  <InfoRow label="XP" value={String(totalXp)} />
                  <InfoRow label="Credits" value={String(totalCredits)} />
                  <InfoRow label="SourceTag" value={String(MAKE_WAVES_SOURCE_TAG)} />
                </div>

                <button
                  disabled={progressPercent < 100}
                  className="bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] text-white px-6 py-4 font-orbitron text-xs font-black uppercase tracking-widest hover:brightness-95 transition-all disabled:opacity-40"
                >
                  {progressPercent >= 100
                    ? isEnglish
                      ? "Generate Proof"
                      : "Genereer Proof"
                    : isEnglish
                      ? "Complete all modules first"
                      : "Rond eerst alle modules af"}
                </button>
              </div>
            </div>
          </Panel>
        )}
      </section>
    </div>
  );
}

function LessonRoom({
  lesson,
  language,
  completed,
  onToggleComplete,
}: {
  lesson: Lesson;
  language: "nl" | "en";
  completed: boolean;
  onToggleComplete: () => void;
}) {
  const isEnglish = language === "en";
  const Icon = lesson.icon;
  const topics = isEnglish ? lesson.topicsEn : lesson.topicsNl;
  const tasks = isEnglish ? lesson.tasksEn : lesson.tasksNl;

  return (
    <Panel title={isEnglish ? lesson.titleEn : lesson.titleNl} icon={Icon}>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-8">
          <div className="border border-black/10 bg-[#F7F8FC] p-5 md:p-6 mb-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/35 mb-4">
              {isEnglish ? "Learning Goal" : "Leerdoel"}
            </p>

            <p className="font-mono text-sm text-black/60 leading-relaxed mb-4">
              {isEnglish ? lesson.goalEn : lesson.goalNl}
            </p>

            <div className="border border-[#C83888]/25 bg-[#C83888]/10 p-4">
              <p className="font-mono text-xs text-black/60 leading-relaxed">
                {isEnglish ? lesson.ottAngleEn : lesson.ottAngleNl}
              </p>
            </div>
          </div>

          <div className="border border-black/10 bg-white p-5 md:p-6 mb-4">
            <div className="flex items-start gap-4 mb-5">
              <PlayCircle size={24} className="text-[#3898E8] shrink-0" />

              <div>
                <p className="font-orbitron text-lg font-black uppercase mb-2">
                  {isEnglish ? "OTT Lesson Room" : "OTT Lesruimte"}
                </p>

                <p className="font-mono text-xs text-black/55 leading-relaxed">
                  {isEnglish
                    ? "The official source gives the base. OTT turns it into guided tasks, proof checks and retention loops."
                    : "De officiële bron geeft de basis. OTT maakt er begeleide opdrachten, proof-checks en retentie-loops van."}
                </p>
              </div>
            </div>

            <p className="font-orbitron text-sm font-black uppercase mb-3">
              {isEnglish ? "Topics" : "Onderwerpen"}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {topics.map((line) => (
                <TemplateBlock key={line} title="Topic" text={line} icon={Sparkles} />
              ))}
            </div>

            <p className="font-orbitron text-sm font-black uppercase mb-3">
              {isEnglish ? "OTT Tasks" : "OTT Opdrachten"}
            </p>

            <div className="space-y-3">
              {tasks.map((line) => (
                <TemplateBlock key={line} title="Task" text={line} icon={CheckCircle2} />
              ))}
            </div>
          </div>

          <button
            onClick={onToggleComplete}
            className={`w-full p-5 text-left border transition-all ${
              completed
                ? "border-[#3898E8]/25 bg-[#3898E8]/10"
                : "border-black/10 bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] text-white"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-orbitron text-sm font-black uppercase mb-2">
                  {completed
                    ? isEnglish
                      ? "Module Completed"
                      : "Module Afgerond"
                    : isEnglish
                      ? "Mark Module Complete"
                      : "Markeer Module Als Afgerond"}
                </p>

                <p className={`font-mono text-xs uppercase tracking-widest ${completed ? "text-black/45" : "text-white/75"}`}>
                  +{lesson.xp} XP · +{lesson.credits} OTT Credits
                </p>
              </div>

              <CheckCircle2 size={24} className={completed ? "text-[#3898E8]" : "text-white"} />
            </div>
          </button>
        </div>

        <div className="col-span-12 xl:col-span-4">
          <div className="border border-black/10 bg-[#F7F8FC] p-5 sticky top-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/35 mb-4">
              {isEnglish ? "Module Data" : "Moduledata"}
            </p>

            <div className="space-y-3">
              <InfoRow label="Module" value={lesson.module} />
              <InfoRow label="Level" value={lesson.difficulty} />
              <InfoRow label={isEnglish ? "Duration" : "Duur"} value={`${lesson.minutes} min`} />
              <InfoRow label="XP" value={String(lesson.xp)} />
              <InfoRow label="Credits" value={String(lesson.credits)} />
              <InfoRow label={isEnglish ? "Access" : "Toegang"} value={lesson.status === "free" ? "Free" : "Premium"} />
            </div>

            <a
              href={lesson.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="block border border-black/10 bg-white p-4 mt-5 hover:bg-[#F7F8FC] transition-all"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-black/35 mb-2">
                    Source
                  </p>
                  <p className="font-orbitron text-xs font-black uppercase text-black">
                    {lesson.sourceLabel}
                  </p>
                </div>

                <ExternalLink size={16} className="text-[#C83888]" />
              </div>
            </a>

            {lesson.status === "premium" && (
              <div className="border border-[#C83888]/25 bg-[#C83888]/10 p-4 mt-5">
                <div className="flex items-start gap-3">
                  <Lock size={16} className="text-[#C83888] mt-0.5 shrink-0" />

                  <p className="font-mono text-xs text-black/60 leading-relaxed">
                    {isEnglish
                      ? "Premium module. This is intentionally visible to show how much deeper the Access Pass path goes."
                      : "Premium module. Dit is bewust zichtbaar zodat gebruikers zien hoeveel dieper het Access Pass-pad gaat."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Panel>
  );
}

function LessonRow({
  lesson,
  language,
  selected,
  completed,
  onSelect,
  onToggleComplete,
}: {
  lesson: Lesson;
  language: "nl" | "en";
  selected: boolean;
  completed: boolean;
  onSelect: () => void;
  onToggleComplete: () => void;
}) {
  const isEnglish = language === "en";
  const Icon = lesson.icon;

  return (
    <div
      className={`border p-4 md:p-5 transition-all ${
        selected
          ? "border-[#C83888] bg-[#C83888]/10"
          : lesson.status === "premium"
            ? "border-[#C83888]/25 bg-[#C83888]/5"
            : "border-black/10 bg-[#F7F8FC]"
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="w-12 h-12 border border-black/10 bg-white flex items-center justify-center shrink-0">
          <Icon size={20} className={lesson.status === "free" ? "text-[#3898E8]" : "text-[#C83888]"} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-widest text-black/35 mb-2">
            Module {lesson.module} · {lesson.difficulty} · {lesson.minutes} min · {lesson.status === "free" ? "Free" : "Premium"}
          </p>

          <p className="font-orbitron text-sm font-black uppercase text-black mb-2">
            {isEnglish ? lesson.titleEn : lesson.titleNl}
          </p>

          <p className="font-mono text-xs text-black/55 leading-relaxed">
            {isEnglish ? lesson.goalEn : lesson.goalNl}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onToggleComplete}
            className={`border px-3 py-3 transition-all ${
              completed
                ? "border-[#3898E8]/25 bg-[#3898E8]/10 text-[#3898E8]"
                : "border-black/10 bg-white text-black/40 hover:text-black"
            }`}
            title={completed ? "Completed" : "Mark complete"}
          >
            <CheckCircle2 size={17} />
          </button>

          <button
            onClick={onSelect}
            className="border border-black/10 bg-white px-4 py-3 hover:bg-[#F7F8FC] transition-all flex items-center gap-2"
          >
            <span className="font-orbitron text-[10px] font-black uppercase">
              {isEnglish ? "Open" : "Open"}
            </span>

            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function QuizCard({
  question,
  language,
  selectedIndex,
  onAnswer,
}: {
  question: QuizQuestion;
  language: "nl" | "en";
  selectedIndex?: number;
  onAnswer: (index: number) => void;
}) {
  const isEnglish = language === "en";
  const answers = isEnglish ? question.answersEn : question.answersNl;
  const isAnswered = typeof selectedIndex === "number";

  return (
    <div className="border border-black/10 bg-white p-5 md:p-6 shadow-sm">
      <p className="font-orbitron text-sm font-black uppercase text-black mb-5">
        {isEnglish ? question.questionEn : question.questionNl}
      </p>

      <div className="space-y-3">
        {answers.map((answer, index) => {
          const selected = selectedIndex === index;
          const correct = question.correctIndex === index;

          return (
            <button
              key={answer}
              onClick={() => onAnswer(index)}
              className={`w-full border p-4 text-left transition-all ${
                selected
                  ? correct
                    ? "border-[#3898E8]/25 bg-[#3898E8]/10"
                    : "border-[#D84858]/25 bg-[#D84858]/10"
                  : "border-black/10 bg-[#F7F8FC] hover:bg-white"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="font-orbitron text-xs font-black text-black/35">
                  {String.fromCharCode(65 + index)}
                </span>

                <p className="font-mono text-xs text-black/60 leading-relaxed">
                  {answer}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div className="mt-4">
          <p className="font-mono text-xs text-black/45">
            {selectedIndex === question.correctIndex
              ? isEnglish
                ? "Correct. Continue to proof-based progress."
                : "Correct. Ga door naar proof-based voortgang."
              : isEnglish
                ? "Not correct yet. Review the lesson and try again."
                : "Nog niet correct. Bekijk de les en probeer opnieuw."}
          </p>
        </div>
      )}
    </div>
  );
}

function SourceLink({ label, url }: { label: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-between gap-3 border border-black/10 bg-[#F7F8FC] p-3 hover:bg-white transition-all"
    >
      <p className="font-orbitron text-xs font-black uppercase text-black">
        {label}
      </p>

      <ExternalLink size={15} className="text-[#C83888]" />
    </a>
  );
}

function ViewButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 border font-orbitron text-[10px] font-black uppercase tracking-widest transition-all ${
        active
          ? "bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] text-white border-transparent"
          : "bg-white text-black/50 border-black/10 hover:text-black hover:bg-[#F7F8FC]"
      }`}
    >
      {label}
    </button>
  );
}

function MetricCard({
  label,
  value,
  text,
  icon: Icon,
}: {
  label: string;
  value: string;
  text: string;
  icon: ElementType;
}) {
  return (
    <div className="border border-black/10 bg-white/90 p-4 shadow-sm">
      <Icon size={18} className="text-[#C83888] mb-3" />

      <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">
        {label}
      </p>

      <p className="font-orbitron text-xl font-black uppercase mb-1 break-all">
        {value}
      </p>

      <p className="font-mono text-[10px] text-black/35 uppercase">{text}</p>
    </div>
  );
}

function Panel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: ElementType;
  children: ReactNode;
}) {
  return (
    <div className="border border-black/10 bg-white p-5 md:p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <Icon size={18} className="text-[#3898E8]" />

        <p className="font-orbitron text-xs uppercase tracking-widest">
          {title}
        </p>
      </div>

      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-3">
      <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">
        {label}
      </p>

      <p className="font-orbitron text-xs font-black uppercase break-all">
        {value}
      </p>
    </div>
  );
}

function RoadmapLine({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 border border-black/10 bg-[#F7F8FC] p-3">
      <CheckCircle2 size={14} className="text-[#C83888] shrink-0" />

      <p className="font-mono text-xs text-black/55 leading-relaxed">{text}</p>
    </div>
  );
}

function TemplateBlock({
  title,
  text,
  icon: Icon,
}: {
  title: string;
  text: string;
  icon: ElementType;
}) {
  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-4">
      <div className="flex items-start gap-3">
        <Icon size={15} className="text-[#3898E8] shrink-0 mt-0.5" />

        <div>
          <p className="font-orbitron text-[10px] font-black uppercase mb-2">
            {title}
          </p>

          <p className="font-mono text-xs text-black/55 leading-relaxed">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}

function readProgress() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(progressStorageKey);
    const parsed = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed)
      ? parsed.filter((value) => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

function writeProgress(value: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(progressStorageKey, JSON.stringify(value));
}

export default AcademyTab;
