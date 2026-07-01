export type PartnerId =
  | "anodos"
  | "doppler"
  | "soil"
  | "banxa"
  | "xahau"
  | "flare-xrpfi"
  | "magnetic"
  | "price-alerts"
  | "nft-burning"
  | "xls38d"
  | "truth-desk";

export type PartnerRiskLevel = "low" | "medium" | "high";
export type PartnerStatus =
  | "official-link"
  | "education-only"
  | "xapp-watch"
  | "build-later"
  | "ott-service";

export type PartnerCategory =
  | "DeFi"
  | "Onramp"
  | "Ecosystem"
  | "Market Data"
  | "NFT"
  | "Cross-chain"
  | "Service";

export type PartnerEducationCard = {
  id: PartnerId;
  name: string;
  label: string;
  category: PartnerCategory;
  status: PartnerStatus;
  riskLevel: PartnerRiskLevel;
  officialUrl: string;
  ctaLabel: string;
  sourceTag: number;
  xpReward: number;
  proofStampXp: number;
  accent: string;
  headline: string;
  oneLine: string;
  whyItMatters: string;
  whatItDoes: string[];
  howToUse: string[];
  riskNotes: string[];
  ottAngle: string[];
  proofStampMemo: string;
  completionChecklist: string[];
  tags: string[];
};

export const PARTNER_SOURCE_TAG = 2606170002;

export const partnerCatalog: PartnerEducationCard[] = [
  {
    id: "anodos",
    name: "Anodos",
    label: "XRPL DeFi Gateway",
    category: "DeFi",
    status: "official-link",
    riskLevel: "medium",
    officialUrl: "https://apps.anodos.finance/",
    ctaLabel: "Open Anodos",
    sourceTag: PARTNER_SOURCE_TAG,
    xpReward: 35,
    proofStampXp: 100,
    accent: "cyan",
    headline: "Learn XRPL DEX, liquidity and portfolio routing before entering Anodos.",
    oneLine:
      "Anodos becomes the clean starter route for users who want to understand XRPL DeFi before leaving OTT Terminal.",
    whyItMatters:
      "A new user needs context before using a DEX or liquidity interface. OTT Terminal explains the route first, then sends the user to the official platform.",
    whatItDoes: [
      "Introduces XRPL DEX and account-management concepts.",
      "Explains liquidity, token trading and portfolio discovery in plain language.",
      "Routes users to the official Anodos platform after risk awareness.",
    ],
    howToUse: [
      "Read the XRPL DeFi overview.",
      "Complete the risk checklist.",
      "Open the official Anodos platform.",
      "Optionally create an OTT Proof Stamp with SourceTag 2606170002.",
    ],
    riskNotes: [
      "OTT Terminal does not execute trades.",
      "Token prices and liquidity can move quickly.",
      "Users must verify token issuers and official URLs themselves.",
      "No profit or yield is promised.",
    ],
    ottAngle: [
      "Use Anodos as the DEX education route.",
      "Track learning completion with XP.",
      "Only stamp meaningful completion on-ledger.",
    ],
    proofStampMemo: "OTT_PROOF_ANODOS_ROUTE_COMPLETED",
    completionChecklist: [
      "I understand this is an external platform.",
      "I understand OTT Terminal is not executing the trade.",
      "I checked the official provider link.",
    ],
    tags: ["XRPL", "DEX", "Liquidity", "Portfolio"],
  },
  {
    id: "doppler",
    name: "Doppler Finance",
    label: "XRP/RLUSD Yield Education",
    category: "DeFi",
    status: "official-link",
    riskLevel: "high",
    officialUrl: "https://www.doppler.finance/",
    ctaLabel: "Open Doppler",
    sourceTag: PARTNER_SOURCE_TAG,
    xpReward: 40,
    proofStampXp: 100,
    accent: "violet",
    headline: "Explain XRPFi and vault risk before users explore Doppler.",
    oneLine:
      "Doppler is treated as a yield-education route, not as a promise of return inside OTT Terminal.",
    whyItMatters:
      "Yield language needs extra care. The terminal should explain strategy, custody, withdrawal rules, counterparty risk and external responsibility first.",
    whatItDoes: [
      "Introduces XRPFi and RLUSD/XRP vault concepts.",
      "Explains that yield products can include custody, strategy and counterparty risk.",
      "Routes users only after they understand the risk layer.",
    ],
    howToUse: [
      "Read the vault explanation.",
      "Confirm that this is not financial advice.",
      "Review risks and provider terms.",
      "Open the official Doppler platform.",
    ],
    riskNotes: [
      "Yield is never guaranteed.",
      "External vaults can include custody, withdrawal and strategy risks.",
      "OTT Terminal does not provide yield or manage funds.",
      "Users must read official terms before depositing anything.",
    ],
    ottAngle: [
      "Position as XRPFi education.",
      "Show clear risk-first layout.",
      "Add XP only for learning completion, not for depositing funds.",
    ],
    proofStampMemo: "OTT_PROOF_DOPPLER_ROUTE_COMPLETED",
    completionChecklist: [
      "I understand yield is not guaranteed.",
      "I understand this is an external provider.",
      "I understand OTT Terminal is not a vault provider.",
    ],
    tags: ["XRPFi", "RLUSD", "Vaults", "Risk"],
  },
  {
    id: "soil",
    name: "Soil Farming Finance",
    label: "RWA Vault Education",
    category: "DeFi",
    status: "official-link",
    riskLevel: "high",
    officialUrl: "https://xrpl.soil.co/",
    ctaLabel: "Open Soil",
    sourceTag: PARTNER_SOURCE_TAG,
    xpReward: 40,
    proofStampXp: 100,
    accent: "green",
    headline: "Teach real-world yield and vault mechanics before users leave the terminal.",
    oneLine:
      "Soil is used as an RWA/vault education card with strong risk and provider-responsibility language.",
    whyItMatters:
      "RWA and vault products need explanation before action: what the funds are used for, who the provider is, and what risks exist.",
    whatItDoes: [
      "Introduces RWA, vault and fixed-yield concepts.",
      "Explains that external providers define the actual product terms.",
      "Makes users confirm risk awareness before opening the official site.",
    ],
    howToUse: [
      "Read the RWA vault overview.",
      "Review the risk checklist.",
      "Open the official Soil XRPL site.",
      "Use proof stamp only for route completion, not for deposit behavior.",
    ],
    riskNotes: [
      "Fixed yield still has provider, liquidity and counterparty risks.",
      "OTT Terminal does not lend or borrow funds.",
      "Users must review official terms and eligibility.",
      "No return, approval or access is guaranteed.",
    ],
    ottAngle: [
      "Good model for explaining RWA vaults clearly.",
      "XP should reward learning and risk awareness.",
      "No XP should be tied to deposit size.",
    ],
    proofStampMemo: "OTT_PROOF_SOIL_ROUTE_COMPLETED",
    completionChecklist: [
      "I understand this is an external vault provider.",
      "I understand vaults can carry counterparty risk.",
      "I understand OTT Terminal does not provide financial advice.",
    ],
    tags: ["RWA", "Vaults", "RLUSD", "Risk"],
  },
  {
    id: "banxa",
    name: "Banxa",
    label: "Fiat Access Route",
    category: "Onramp",
    status: "official-link",
    riskLevel: "medium",
    officialUrl: "https://banxa.com/",
    ctaLabel: "Open Banxa",
    sourceTag: PARTNER_SOURCE_TAG,
    xpReward: 30,
    proofStampXp: 80,
    accent: "blue",
    headline: "Explain fiat-to-crypto access before users leave to a regulated onramp.",
    oneLine:
      "Banxa can support the access route concept while the actual payment/onramp flow remains with the official provider.",
    whyItMatters:
      "Users who are new to crypto often need a fiat entry route. OTT Terminal explains the access model and then routes to the official provider.",
    whatItDoes: [
      "Introduces fiat-to-crypto access and checkout routing.",
      "Explains KYC, provider terms and payment processing boundaries.",
      "Separates OTT Terminal education from the external onramp service.",
    ],
    howToUse: [
      "Choose the access route explanation.",
      "Understand that Banxa handles the fiat/onramp side.",
      "Open official Banxa flow when ready.",
      "Return to terminal after completion if needed.",
    ],
    riskNotes: [
      "Fees, limits and KYC are controlled by the external provider.",
      "OTT Terminal does not process fiat payments.",
      "Payment availability can depend on region and provider rules.",
      "Users must check the official quote before paying.",
    ],
    ottAngle: [
      "Supports the €3 fiat access concept.",
      "Can be shown as an official route, not an internal service.",
      "Useful for onboarding users without XRP yet.",
    ],
    proofStampMemo: "OTT_PROOF_BANXA_ROUTE_COMPLETED",
    completionChecklist: [
      "I understand Banxa is the external provider.",
      "I understand fees and KYC can apply.",
      "I checked the official payment quote.",
    ],
    tags: ["Fiat", "Onramp", "Access", "KYC"],
  },
  {
    id: "xahau",
    name: "Xahau Ecosystem Hub",
    label: "Hooks + Smart Accounts",
    category: "Ecosystem",
    status: "official-link",
    riskLevel: "medium",
    officialUrl: "https://xahau.network/",
    ctaLabel: "Open Xahau",
    sourceTag: PARTNER_SOURCE_TAG,
    xpReward: 35,
    proofStampXp: 90,
    accent: "lime",
    headline: "Teach Xahau Hooks and programmable account logic in an XRPL-friendly way.",
    oneLine:
      "Xahau becomes the smart-account education route for users who want to understand Hooks before leaving the terminal.",
    whyItMatters:
      "Hooks and smart account logic are powerful, but they need simple explanation before users interact with new ecosystems.",
    whatItDoes: [
      "Introduces Xahau and account-based programmability.",
      "Explains Hooks as logic that can approve, reject or customize behavior.",
      "Routes users to the official ecosystem after education.",
    ],
    howToUse: [
      "Read the Hooks overview.",
      "Compare XRPL mainnet and Xahau use cases.",
      "Open the official Xahau ecosystem.",
      "Create proof stamp after completing the learning route.",
    ],
    riskNotes: [
      "Xahau is a separate ecosystem from XRPL mainnet.",
      "Users must understand wallet/network switching.",
      "Smart logic can create unexpected behavior if misunderstood.",
      "OTT Terminal does not deploy Hooks for users in this module.",
    ],
    ottAngle: [
      "Great route for future OTT automation ideas.",
      "Can connect later to reward logic and access control.",
      "Keep it education-first for the hackathon demo.",
    ],
    proofStampMemo: "OTT_PROOF_XAHAU_ROUTE_COMPLETED",
    completionChecklist: [
      "I understand Xahau is separate from XRPL mainnet.",
      "I understand Hooks can automate account behavior.",
      "I opened only the official ecosystem link.",
    ],
    tags: ["Xahau", "Hooks", "Smart Accounts", "Ecosystem"],
  },
  {
    id: "flare-xrpfi",
    name: "Flare XRPFi Yield",
    label: "Xaman xApp Watch",
    category: "DeFi",
    status: "xapp-watch",
    riskLevel: "high",
    officialUrl: "https://xaman.app/blog/flare",
    ctaLabel: "Read Xaman / Flare Info",
    sourceTag: PARTNER_SOURCE_TAG,
    xpReward: 40,
    proofStampXp: 100,
    accent: "orange",
    headline: "Explain XRPFi yield routes without presenting yield as native XRP staking.",
    oneLine:
      "Flare XRPFi is treated as a high-risk education route around DeFi vault access through Xaman and Flare Smart Accounts.",
    whyItMatters:
      "Users often misunderstand yield. The terminal must clarify that XRP does not magically generate yield by itself; external DeFi mechanisms create the opportunity and the risk.",
    whatItDoes: [
      "Introduces XRPFi, Flare Smart Accounts and Xaman xApp routing.",
      "Explains that yield routes depend on external DeFi mechanics.",
      "Makes users confirm that OTT Terminal is not the yield provider.",
    ],
    howToUse: [
      "Read the XRPFi explanation.",
      "Confirm the no-financial-advice disclaimer.",
      "Open the official Xaman/Flare information.",
      "Optionally proof-stamp learning completion.",
    ],
    riskNotes: [
      "DeFi yield is not guaranteed.",
      "Smart accounts, vaults and bridges can carry technical risk.",
      "OTT Terminal does not provide yield or custody.",
      "Users must read official terms and risk documents.",
    ],
    ottAngle: [
      "Use as a careful education module.",
      "Do not use aggressive APR language.",
      "Show a clear difference between learning XP and financial return.",
    ],
    proofStampMemo: "OTT_PROOF_FLARE_XRPFI_ROUTE_COMPLETED",
    completionChecklist: [
      "I understand XRPFi is not native staking.",
      "I understand external DeFi risk exists.",
      "I understand OTT Terminal does not provide yield.",
    ],
    tags: ["Flare", "Xaman", "XRPFi", "Yield Risk"],
  },
  {
    id: "magnetic",
    name: "Magnetic",
    label: "Market + DEX Intelligence",
    category: "Market Data",
    status: "official-link",
    riskLevel: "medium",
    officialUrl: "https://xmagnetic.org/",
    ctaLabel: "Open Magnetic",
    sourceTag: PARTNER_SOURCE_TAG,
    xpReward: 35,
    proofStampXp: 90,
    accent: "pink",
    headline: "Use Magnetic as market-intelligence inspiration for XRPL tokens, AMMs and NFTs.",
    oneLine:
      "Magnetic is a strong UI reference for market tables, token pages, AMM pools, NFT discovery and wallet-connected XRPL exploration.",
    whyItMatters:
      "Users need market context before touching tokens. Tables, filters, liquidity stats and holder data make the terminal feel more useful.",
    whatItDoes: [
      "Introduces XRPL market tracking and token discovery.",
      "Explains AMM pools, liquidity, holders and market movement.",
      "Routes users to the official Magnetic platform for deeper action.",
    ],
    howToUse: [
      "Read the market-data explanation.",
      "Check liquidity and issuer risk notes.",
      "Open official Magnetic for live data.",
      "Use proof stamp for route completion only.",
    ],
    riskNotes: [
      "Market data can change quickly.",
      "Trending tokens can be risky or illiquid.",
      "OTT Terminal does not endorse tokens.",
      "Users must verify issuers and liquidity themselves.",
    ],
    ottAngle: [
      "Bring its best UI ideas into OTT layout.",
      "Add token intelligence summaries later.",
      "Keep trading actions outside the terminal for now.",
    ],
    proofStampMemo: "OTT_PROOF_MAGNETIC_ROUTE_COMPLETED",
    completionChecklist: [
      "I understand market data can change.",
      "I understand trending does not mean safe.",
      "I checked the official provider link.",
    ],
    tags: ["Market", "AMM", "NFT", "DEX"],
  },
  {
    id: "price-alerts",
    name: "Price Alert System",
    label: "Watchlist Builder",
    category: "Market Data",
    status: "build-later",
    riskLevel: "low",
    officialUrl: "https://xrpl.org/docs/concepts/tokens/",
    ctaLabel: "Read XRPL Token Docs",
    sourceTag: PARTNER_SOURCE_TAG,
    xpReward: 25,
    proofStampXp: 75,
    accent: "sky",
    headline: "Build safer watchlists before adding live alerts.",
    oneLine:
      "Price alerts should start as education and watchlist notes, then later become real alert infrastructure.",
    whyItMatters:
      "A price-alert system can keep users returning daily, but it must not push users into trades.",
    whatItDoes: [
      "Introduces watchlists and token tracking.",
      "Explains alerts as awareness tools, not trade signals.",
      "Prepares future integration with live market APIs.",
    ],
    howToUse: [
      "Create a learning watchlist.",
      "Add notes about why a token matters.",
      "Mark risk level and issuer status.",
      "Proof-stamp a completed watchlist route.",
    ],
    riskNotes: [
      "Alerts are not financial advice.",
      "Price movement alone does not prove quality.",
      "Future alerts must avoid manipulative language.",
      "Users remain responsible for every decision.",
    ],
    ottAngle: [
      "Good retention feature.",
      "Use XP for watchlist discipline.",
      "Build real alerts after demo stability.",
    ],
    proofStampMemo: "OTT_PROOF_PRICE_ALERT_ROUTE_COMPLETED",
    completionChecklist: [
      "I understand alerts are not trade advice.",
      "I understand issuer and liquidity checks matter.",
      "I created a watchlist for learning purposes.",
    ],
    tags: ["Alerts", "Watchlist", "Market", "Education"],
  },
  {
    id: "nft-burning",
    name: "NFT Burning",
    label: "NFTokenBurn Route",
    category: "NFT",
    status: "education-only",
    riskLevel: "medium",
    officialUrl:
      "https://xrpl.org/docs/references/protocol/transactions/types/nftokenburn",
    ctaLabel: "Read NFTokenBurn Docs",
    sourceTag: PARTNER_SOURCE_TAG,
    xpReward: 30,
    proofStampXp: 85,
    accent: "red",
    headline: "Teach NFT burn mechanics before adding any destructive action.",
    oneLine:
      "NFT burning is useful for access passes, revocation and symbolic mechanics, but it must be handled carefully.",
    whyItMatters:
      "Burning is destructive. Users must understand that a burned NFT is removed and cannot simply be undone.",
    whatItDoes: [
      "Explains the XRPL NFTokenBurn transaction.",
      "Shows when holders or issuers may burn NFTs.",
      "Prepares future OTT Access Pass lifecycle logic.",
    ],
    howToUse: [
      "Read the NFT burn explanation.",
      "Confirm destructive-action awareness.",
      "Open official XRPL docs.",
      "Only add real burn payloads after demo safety is complete.",
    ],
    riskNotes: [
      "Burning can be irreversible.",
      "Never burn an NFT without understanding access consequences.",
      "OTT Terminal should not auto-burn anything.",
      "Future burn tools need multiple confirmations.",
    ],
    ottAngle: [
      "Useful for OTT Access Pass lifecycle.",
      "Can support expired pass logic later.",
      "For hackathon, keep as education-first.",
    ],
    proofStampMemo: "OTT_PROOF_NFT_BURN_ROUTE_COMPLETED",
    completionChecklist: [
      "I understand burning can be irreversible.",
      "I understand this module is educational for now.",
      "I opened the official XRPL docs.",
    ],
    tags: ["NFT", "Burn", "Access Pass", "XRPL Docs"],
  },
  {
    id: "xls38d",
    name: "XLS-38d Bridge Watch",
    label: "Cross-chain Research",
    category: "Cross-chain",
    status: "education-only",
    riskLevel: "high",
    officialUrl: "https://github.com/XRPLF/XRPL-Standards/discussions",
    ctaLabel: "Open XRPL Standards",
    sourceTag: PARTNER_SOURCE_TAG,
    xpReward: 35,
    proofStampXp: 90,
    accent: "indigo",
    headline: "Track cross-chain bridge ideas as research, not as a live promise.",
    oneLine:
      "XLS-38d belongs in the terminal as a research/watch module for bridge thinking and ecosystem future planning.",
    whyItMatters:
      "Cross-chain bridges can unlock use cases, but they are high-risk and should be explained carefully before any user action.",
    whatItDoes: [
      "Introduces bridge concepts and XRPL standards research.",
      "Explains why cross-chain movement needs security review.",
      "Keeps future ideas separate from live product promises.",
    ],
    howToUse: [
      "Read the bridge research summary.",
      "Review risks around bridges and wrapped assets.",
      "Open XRPL Standards discussions.",
      "Proof-stamp only the learning route.",
    ],
    riskNotes: [
      "Bridge infrastructure can be high-risk.",
      "Do not assume unreleased standards are production-ready.",
      "OTT Terminal should not promise future bridge support.",
      "Research modules must be clearly labeled as watch items.",
    ],
    ottAngle: [
      "Good for visionary roadmap storytelling.",
      "Useful in XRPL Foundation meeting as future direction.",
      "Keep out of core MVP execution until stable.",
    ],
    proofStampMemo: "OTT_PROOF_XLS38D_ROUTE_COMPLETED",
    completionChecklist: [
      "I understand this is research/watch content.",
      "I understand bridges can carry high risk.",
      "I understand this is not a live OTT bridge service.",
    ],
    tags: ["Bridge", "XLS-38d", "Research", "Cross-chain"],
  },
  {
    id: "truth-desk",
    name: "Truth Desk",
    label: "Ask + 1-on-1",
    category: "Service",
    status: "ott-service",
    riskLevel: "low",
    officialUrl: "https://ott-terminal-mvp.vercel.app/",
    ctaLabel: "Open Truth Desk",
    sourceTag: PARTNER_SOURCE_TAG,
    xpReward: 25,
    proofStampXp: 75,
    accent: "white",
    headline: "Let users ask one short question or book focused 1-on-1 XRPL orientation.",
    oneLine:
      "Truth Desk turns the terminal into a personal education gateway without becoming financial or legal advice.",
    whyItMatters:
      "Some users need a human explanation. A paid question or appointment creates real XRPL payment utility and gives Oswald preparation context.",
    whatItDoes: [
      "Supports a 1 XRP question with max 200 characters.",
      "Supports 15, 30, 45 or 60 minute 1-on-1 request flows.",
      "Uses XRP payment proof with SourceTag 2606170002 before the request is accepted.",
    ],
    howToUse: [
      "Choose Ask Truth or 1-on-1.",
      "Enter a short question or meeting goal.",
      "Pay with XRP through Xaman.",
      "Verify payment and submit request.",
    ],
    riskNotes: [
      "This is education and orientation only.",
      "No legal, tax or financial advice is provided.",
      "No investment outcome is promised.",
      "Meeting availability must be confirmed separately.",
    ],
    ottAngle: [
      "Adds direct founder access.",
      "Shows real XRP payment utility.",
      "Creates a strong demo for service payments.",
    ],
    proofStampMemo: "OTT_PROOF_TRUTH_DESK_ROUTE_COMPLETED",
    completionChecklist: [
      "I understand this is education only.",
      "I understand no investment advice is provided.",
      "I entered a clear question or meeting goal.",
    ],
    tags: ["Ask", "1-on-1", "XRP Payment", "Founder Access"],
  },
];

export function getPartnerCatalog() {
  return partnerCatalog;
}

export function getPartnerById(id: PartnerId) {
  return partnerCatalog.find((partner) => partner.id === id) ?? null;
}

export function getPartnersByCategory(category: PartnerCategory) {
  return partnerCatalog.filter((partner) => partner.category === category);
}

export function getHighRiskPartners() {
  return partnerCatalog.filter((partner) => partner.riskLevel === "high");
}

export function getPartnerCompletionXp(partner: PartnerEducationCard) {
  return partner.xpReward + partner.proofStampXp;
}

export function getPartnerProofStampMemo(id: PartnerId) {
  return getPartnerById(id)?.proofStampMemo ?? "OTT_PROOF_ROUTE_COMPLETED";
}

export function getRiskLabel(riskLevel: PartnerRiskLevel) {
  if (riskLevel === "high") {
    return "High risk: read carefully";
  }

  if (riskLevel === "medium") {
    return "Medium risk: verify before action";
  }

  return "Low risk: education route";
}

export function getStatusLabel(status: PartnerStatus) {
  if (status === "official-link") {
    return "Official external platform";
  }

  if (status === "education-only") {
    return "Education only";
  }

  if (status === "xapp-watch") {
    return "xApp watch route";
  }

  if (status === "build-later") {
    return "Build later";
  }

  return "OTT service";
}
