export type AcademyPathId = "foundations" | "use" | "markets" | "build";
export type AcademyCourseAccess = "free" | "access";

export type AcademyCourseTask = {
  id: string;
  promptEn: string;
  promptNl: string;
};

export type AcademyCourse = {
  id: string;
  module: string;
  path: AcademyPathId;
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Builder" | "Advanced";
  minutes: number;
  access: AcademyCourseAccess;
  outcomeEn: string;
  outcomeNl: string;
  topics: string[];
  tasks: AcademyCourseTask[];
  sourceLabel: string;
  sourceUrl: string;
  xp: number;
  credits: number;
};

export const ACADEMY_PATHS = [
  { id: "foundations" as const, en: "Foundations", nl: "Basis" },
  { id: "use" as const, en: "Safe use", nl: "Veilig gebruik" },
  { id: "markets" as const, en: "Tokens and DeFi", nl: "Tokens en DeFi" },
  { id: "build" as const, en: "Build", nl: "Bouwen" },
];

export const ACADEMY_COURSES: AcademyCourse[] = [
  {
    id: "blockchain-crypto-basics", module: "01", path: "foundations", title: "Blockchain & Crypto Basics",
    difficulty: "Beginner", minutes: 90, access: "free", xp: 25, credits: 1,
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
    difficulty: "Beginner", minutes: 90, access: "free", xp: 25, credits: 1,
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
    difficulty: "Beginner", minutes: 90, access: "free", xp: 25, credits: 2,
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
    id: "source-tag-proof", module: "04", path: "foundations", title: "SourceTag 2606170002 Proof",
    difficulty: "Beginner", minutes: 45, access: "free", xp: 15, credits: 2,
    outcomeEn: "Understand OTT’s public Make Waves proof identity.",
    outcomeNl: "Begrijp de openbare OTT Make Waves-proofidentiteit.",
    topics: ["SourceTag", "Audit trail", "Memo", "Duplicates", "Proof"],
    sourceLabel: "XRPL.org Docs", sourceUrl: "https://xrpl.org/docs",
    tasks: [
      { id: "task-1", promptEn: "What does SourceTag 2606170002 identify?", promptNl: "Wat identificeert SourceTag 2606170002?" },
      { id: "task-2", promptEn: "Which transaction fields must be checked alongside SourceTag?", promptNl: "Welke transactievelden controleer je naast SourceTag?" },
      { id: "task-3", promptEn: "How do you prevent the same proof from rewarding twice?", promptNl: "Hoe voorkom je dat dezelfde proof dubbel wordt beloond?" },
    ],
  },
  {
    id: "defi-island", module: "05", path: "use", title: "Explore DeFi-Island",
    difficulty: "Beginner", minutes: 60, access: "free", xp: 20, credits: 1,
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
    difficulty: "Intermediate", minutes: 120, access: "access", xp: 45, credits: 4,
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
    difficulty: "Intermediate", minutes: 120, access: "access", xp: 40, credits: 4,
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
    difficulty: "Intermediate", minutes: 120, access: "access", xp: 40, credits: 3,
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
    difficulty: "Intermediate", minutes: 120, access: "access", xp: 45, credits: 4,
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
    difficulty: "Intermediate", minutes: 90, access: "access", xp: 35, credits: 3,
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
    difficulty: "Intermediate", minutes: 120, access: "access", xp: 45, credits: 4,
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
    difficulty: "Builder", minutes: 120, access: "access", xp: 50, credits: 5,
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
    difficulty: "Builder", minutes: 120, access: "access", xp: 50, credits: 5,
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
    difficulty: "Advanced", minutes: 90, access: "access", xp: 60, credits: 6,
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

export const ACADEMY_COURSE_IDS = ACADEMY_COURSES.map((course) => course.id);
export const ACADEMY_NFT_MINIMUM_AVERAGE = 75;
export const ACADEMY_ANSWER_PASS_SCORE = 70;
