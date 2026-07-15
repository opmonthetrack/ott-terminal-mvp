export type SocialPlatform =
  | "x"
  | "linkedin"
  | "facebook"
  | "instagram"
  | "tiktok"
  | "youtube"
  | "medium";

export type TagCategory =
  | "official"
  | "developer"
  | "foundation"
  | "executive"
  | "analyst"
  | "legal"
  | "community"
  | "brand"
  | "project";

export type SocialHandle = {
  name: string;
  handle: string;
  category: TagCategory;
  platforms: SocialPlatform[];
  useFor: string[];
  caution?: string;
  verifyBeforePosting: boolean;
};

export type HashtagSet = {
  id: string;
  label: string;
  platforms: SocialPlatform[];
  maxRecommended: number;
  hashtags: string[];
  cashtags?: string[];
  useFor: string[];
  avoidFor?: string[];
};

export type PlatformTagRule = {
  platform: SocialPlatform;
  label: string;
  style: string;
  maxHashtags: number;
  useCashtags: boolean;
  mentionPolicy: string;
  placement: string;
  bestFor: string[];
  avoid: string[];
};

export const platformTagRules: PlatformTagRule[] = [
  {
    platform: "x",
    label: "X / Twitter",
    style: "Fast, direct, community-native. Cashtags are allowed and useful.",
    maxHashtags: 6,
    useCashtags: true,
    mentionPolicy:
      "Use 1-3 mentions only when directly relevant. Do not tag every large account in every post.",
    placement: "Use cashtags and hashtags at the end. Mentions can be inside the text or final line.",
    bestFor: ["breaking news", "XRPL updates", "community discussion", "threads", "quick source-first analysis"],
    avoid: ["too many mentions", "spam tagging", "price promises", "legal conclusions without source"],
  },
  {
    platform: "linkedin",
    label: "LinkedIn",
    style: "Professional, business-focused, compliance-aware.",
    maxHashtags: 5,
    useCashtags: false,
    mentionPolicy:
      "Tag companies or people only when the post is clearly about their work. Prefer names typed manually in LinkedIn.",
    placement: "Use 3-5 hashtags at the bottom after the main insight.",
    bestFor: ["fintech", "enterprise adoption", "regulation", "RWA", "payments", "education"],
    avoid: ["cashtags", "meme tone", "too many hashtags", "influencer spam"],
  },
  {
    platform: "facebook",
    label: "Facebook",
    style: "Accessible community/news explanation.",
    maxHashtags: 8,
    useCashtags: false,
    mentionPolicy:
      "Use official pages sparingly. Works best in groups when the context is educational.",
    placement: "Use 5-8 hashtags at the bottom.",
    bestFor: ["community education", "simple explainers", "news recap", "group posts"],
    avoid: ["overly technical language", "too many tags", "financial advice tone"],
  },
  {
    platform: "instagram",
    label: "Instagram",
    style: "Visual, discovery-focused, caption-friendly.",
    maxHashtags: 15,
    useCashtags: false,
    mentionPolicy:
      "Mention only official/visual-relevant accounts. Place broader hashtags at the bottom after spacing.",
    placement: "Caption first, then spacing, then 10-15 hashtags.",
    bestFor: ["visual explainers", "carousel posts", "brand awareness", "community reach"],
    avoid: ["long technical source dumps", "too many niche finance tags", "unverified account tags"],
  },
  {
    platform: "tiktok",
    label: "TikTok",
    style: "Short hook, simple language, fast trend discovery.",
    maxHashtags: 6,
    useCashtags: false,
    mentionPolicy:
      "Mentions are optional. Use hashtags to guide the For You Page topic.",
    placement: "Use 4-6 strong hashtags in caption after the hook.",
    bestFor: ["short explainers", "daily signal", "beginner education", "trend reactions"],
    avoid: ["too many hashtags", "complex legal/technical wording", "price-target content"],
  },
  {
    platform: "youtube",
    label: "YouTube",
    style: "Searchable title, description and chapters.",
    maxHashtags: 5,
    useCashtags: false,
    mentionPolicy:
      "Mentions are less important than clear title, description, chapters and source links.",
    placement: "Put 3-5 hashtags at the end of the description.",
    bestFor: ["longer explainers", "weekly recap", "demo video", "tutorial"],
    avoid: ["keyword stuffing", "unverified claims", "clickbait without source"],
  },
  {
    platform: "medium",
    label: "Medium",
    style: "Article-first, source-first, evergreen explanation.",
    maxHashtags: 5,
    useCashtags: false,
    mentionPolicy:
      "Do not rely on @ mentions. Use source links and clear attribution instead.",
    placement: "Use Medium topics/tags, plus source links inside the article.",
    bestFor: ["deep analysis", "how-to", "XRPL education", "project updates", "submission story"],
    avoid: ["short spam posts", "tag stuffing", "unsupported claims"],
  },
];

export const socialHandles: SocialHandle[] = [
  {
    name: "Ripple",
    handle: "@Ripple",
    category: "official",
    platforms: ["x", "linkedin", "facebook", "instagram"],
    useFor: ["Ripple news", "RLUSD", "payments", "enterprise", "official Ripple updates"],
    caution: "Use only when the post is directly about Ripple or an official Ripple source.",
    verifyBeforePosting: true,
  },
  {
    name: "RippleX Dev",
    handle: "@RippleXDev",
    category: "developer",
    platforms: ["x"],
    useFor: ["XRPL developer updates", "builders", "XLS", "technical education", "XRPL tooling"],
    caution: "Best for developer or technical content, not generic price/community posts.",
    verifyBeforePosting: true,
  },
  {
    name: "XRPL Foundation",
    handle: "@XRPLF",
    category: "foundation",
    platforms: ["x", "linkedin"],
    useFor: ["XRPL standards", "rippled", "governance", "ecosystem infrastructure"],
    caution: "Use when the source is XRPLF or neutral ecosystem infrastructure.",
    verifyBeforePosting: true,
  },
  {
    name: "x402 Foundation",
    handle: "@x402Foundation",
    category: "foundation",
    platforms: ["x"],
    useFor: ["foundation/community references", "XRPL ecosystem discussion"],
    caution: "Verify account relevance before each use.",
    verifyBeforePosting: true,
  },
  {
    name: "Brad Garlinghouse",
    handle: "@bgarlinghouse",
    category: "executive",
    platforms: ["x", "linkedin"],
    useFor: ["Ripple leadership", "enterprise strategy", "regulation", "Ripple official statements"],
    caution: "Use only when directly relevant to his statement or Ripple leadership.",
    verifyBeforePosting: true,
  },
  {
    name: "David Schwartz / JoelKatz",
    handle: "@JoelKatz",
    category: "executive",
    platforms: ["x", "linkedin", "medium"],
    useFor: ["XRPL technical explanation", "consensus", "protocol discussion", "developer education"],
    caution: "Use when the post is technical or references his public explanation.",
    verifyBeforePosting: true,
  },
  {
    name: "Monica Long",
    handle: "@MonicaLongSF",
    category: "executive",
    platforms: ["x", "linkedin"],
    useFor: ["Ripple business", "payments", "RLUSD", "institutional adoption"],
    caution: "Use only when directly relevant to Ripple strategy or her statements.",
    verifyBeforePosting: true,
  },
  {
    name: "John E. Deaton",
    handle: "@JohnEDeaton1",
    category: "legal",
    platforms: ["x", "linkedin"],
    useFor: ["legal context", "SEC/Ripple case history", "crypto law commentary"],
    caution: "Do not use for technical or price posts. Avoid presenting legal opinions as final legal advice.",
    verifyBeforePosting: true,
  },
  {
    name: "James K. Filan",
    handle: "@filanlaw",
    category: "legal",
    platforms: ["x"],
    useFor: ["court filings", "legal documents", "case updates"],
    caution: "Use when the post references legal filings or court process.",
    verifyBeforePosting: true,
  },
  {
    name: "Crypto Eri",
    handle: "@sentosumosaba",
    category: "analyst",
    platforms: ["x", "youtube"],
    useFor: ["fundamental analysis", "Japan/Ripple context", "community education"],
    caution: "Use as community analyst mention, not official source.",
    verifyBeforePosting: true,
  },
  {
    name: "Wrath of Kahneman",
    handle: "@WKahneman",
    category: "analyst",
    platforms: ["x", "medium"],
    useFor: ["research threads", "ecosystem analysis", "macro context"],
    caution: "Use as analyst/community research mention, not official confirmation.",
    verifyBeforePosting: true,
  },
  {
    name: "Vet",
    handle: "@Vet_X0",
    category: "community",
    platforms: ["x"],
    useFor: ["XRPL community", "developer/community discussion"],
    caution: "Use when directly relevant to the topic or conversation.",
    verifyBeforePosting: true,
  },
  {
    name: "XRP CryptoWolf",
    handle: "@XRPCryptoWolf",
    category: "analyst",
    platforms: ["x"],
    useFor: ["XRP community reach", "market/community discussion"],
    caution: "Community/influencer tag only. Do not overuse.",
    verifyBeforePosting: true,
  },
  {
    name: "JackTheRippler",
    handle: "@JackTheRippler",
    category: "community",
    platforms: ["x"],
    useFor: ["XRP community reach", "social discussion"],
    caution: "Community tag only. Avoid spam tagging.",
    verifyBeforePosting: true,
  },
  {
    name: "Alex Cobb",
    handle: "@AlexCobb_",
    category: "community",
    platforms: ["x"],
    useFor: ["XRP community discussion", "social reach"],
    caution: "Community tag only. Avoid tagging unless relevant.",
    verifyBeforePosting: true,
  },
  {
    name: "The Bearable Bull",
    handle: "@thebearablebull",
    category: "community",
    platforms: ["x"],
    useFor: ["XRP community reach", "social discussion"],
    caution: "Community tag only. Do not use for official/source claims.",
    verifyBeforePosting: true,
  },
  {
    name: "Digital Asset Investor",
    handle: "@DigAssetInvestor",
    category: "community",
    platforms: ["x"],
    useFor: ["XRP community reach", "digital asset discussion"],
    caution: "Community tag only. Do not use as official confirmation.",
    verifyBeforePosting: true,
  },
];

export const hashtagSets: HashtagSet[] = [
  {
    id: "xrpl-core",
    label: "XRPL Core",
    platforms: ["x", "linkedin", "facebook", "instagram", "tiktok", "youtube", "medium"],
    maxRecommended: 6,
    cashtags: ["$XRP"],
    hashtags: ["#XRP", "#XRPL", "#XRPLedger", "#XRPCommunity", "#Ripple"],
    useFor: ["general XRPL", "XRP Ledger", "wallets", "payments", "community updates"],
  },
  {
    id: "ripple-rlusd-payments",
    label: "Ripple / RLUSD / Payments",
    platforms: ["x", "linkedin", "facebook", "instagram", "tiktok", "youtube", "medium"],
    maxRecommended: 6,
    cashtags: ["$XRP", "$RLUSD"],
    hashtags: ["#Ripple", "#RLUSD", "#DigitalAssets", "#Fintech", "#Payments", "#Blockchain"],
    useFor: ["Ripple", "RLUSD", "payments", "fintech", "enterprise", "stablecoins"],
    avoidFor: ["pure XRPL technical post without Ripple/RLUSD context"],
  },
  {
    id: "developer-xls",
    label: "Developer / XLS / Builder",
    platforms: ["x", "linkedin", "medium", "youtube"],
    maxRecommended: 6,
    cashtags: ["$XRP"],
    hashtags: ["#XRPL", "#XRPLedger", "#XLS", "#Web3", "#Developers", "#BuildOnXRPL"],
    useFor: ["XLS standards", "builders", "developer tooling", "technical updates", "amendments"],
  },
  {
    id: "macro-rwa-iso",
    label: "Macro / RWA / ISO 20022",
    platforms: ["x", "linkedin", "facebook", "medium", "youtube"],
    maxRecommended: 5,
    cashtags: ["$XRP", "$RLUSD"],
    hashtags: ["#ISO20022", "#RWA", "#Tokenization", "#CBDC", "#Fintech", "#DigitalAssets"],
    useFor: ["ISO 20022", "RWA", "CBDC", "BRICS", "macro payments", "tokenization"],
    avoidFor: ["claiming XRP/XRPL is used by a macro institution without direct source"],
  },
  {
    id: "defi-ecosystem",
    label: "XRPL Ecosystem / DeFi",
    platforms: ["x", "linkedin", "facebook", "instagram", "tiktok", "medium", "youtube"],
    maxRecommended: 8,
    cashtags: ["$XRP"],
    hashtags: ["#DeFi", "#Sologenic", "#Evernode", "#Xahau", "#Web3", "#CryptoNews", "#Blockchain"],
    useFor: ["Sologenic", "Evernode", "Xahau", "DeFi", "ecosystem projects"],
    avoidFor: ["official Ripple-only content"],
  },
  {
    id: "ott-brand",
    label: "OTT Brand / Make Waves",
    platforms: ["x", "linkedin", "facebook", "instagram", "tiktok", "youtube", "medium"],
    maxRecommended: 8,
    hashtags: ["#OnTheTrack", "#TruthOnTheTrack", "#MakeWaves", "#XRPLEducation", "#ProofBeforeTrust", "#CryptoEducation"],
    useFor: ["OTT Terminal", "Make Waves", "education", "demo", "community posts", "project updates"],
  },
  {
    id: "instagram-discovery",
    label: "Instagram Discovery",
    platforms: ["instagram"],
    maxRecommended: 15,
    hashtags: [
      "#XRP",
      "#XRPLedger",
      "#RippleCrypto",
      "#RLUSD",
      "#XRPCommunity",
      "#CryptoNews",
      "#BlockchainTechnology",
      "#Fintech",
      "#Investing",
      "#CryptoTraders",
      "#RippleLabs",
      "#CryptoArt",
      "#Web3",
      "#CryptoEducation",
      "#OnTheTrack"
    ],
    useFor: ["Instagram captions", "visual posts", "reels", "carousels"],
  },
  {
    id: "tiktok-fyp",
    label: "TikTok FYP",
    platforms: ["tiktok"],
    maxRecommended: 6,
    hashtags: ["#XRP", "#Ripple", "#XRPL", "#CryptoTikTok", "#XRPCommunity", "#RLUSD", "#CryptoInvesting"],
    useFor: ["TikTok caption", "short hooks", "daily signal videos", "beginner explainers"],
  },
  {
    id: "linkedin-professional",
    label: "LinkedIn Professional",
    platforms: ["linkedin"],
    maxRecommended: 5,
    hashtags: ["#XRP", "#XRPLedger", "#Fintech", "#Ripple", "#DigitalAssets", "#Blockchain"],
    useFor: ["professional updates", "business", "fintech", "regulation", "enterprise", "education"],
    avoidFor: ["meme posts", "price speculation", "cashtags"],
  },
  {
    id: "facebook-community",
    label: "Facebook Community",
    platforms: ["facebook"],
    maxRecommended: 8,
    hashtags: ["#XRP", "#Ripple", "#XRPLedger", "#RLUSD", "#XRPCommunity", "#CryptoNieuws", "#Blockchain"],
    useFor: ["Facebook posts", "community groups", "simple Dutch news/explainers"],
  },
];

export const contextToTagSetIds: Record<string, string[]> = {
  xrpl: ["xrpl-core", "ott-brand"],
  ripple: ["ripple-rlusd-payments", "xrpl-core"],
  rlusd: ["ripple-rlusd-payments", "macro-rwa-iso"],
  xls: ["developer-xls", "xrpl-core"],
  amendment: ["developer-xls", "xrpl-core"],
  developer: ["developer-xls", "ott-brand"],
  cbdc: ["macro-rwa-iso", "ripple-rlusd-payments"],
  iso20022: ["macro-rwa-iso", "ripple-rlusd-payments"],
  rwa: ["macro-rwa-iso", "ripple-rlusd-payments"],
  defi: ["defi-ecosystem", "xrpl-core"],
  xahau: ["defi-ecosystem", "xrpl-core"],
  evernode: ["defi-ecosystem", "xrpl-core"],
  sologenic: ["defi-ecosystem", "xrpl-core"],
  ott: ["ott-brand", "xrpl-core"],
  makewaves: ["ott-brand", "xrpl-core"],
  legal: ["xrpl-core"],
};

export function getPlatformRule(platform: SocialPlatform) {
  return platformTagRules.find((rule) => rule.platform === platform);
}

export function getHashtagSetsForPlatform(platform: SocialPlatform) {
  return hashtagSets.filter((set) => set.platforms.includes(platform));
}

export function getHandlesForPlatform(platform: SocialPlatform) {
  return socialHandles.filter((handle) => handle.platforms.includes(platform));
}

export function getTagSetById(id: string) {
  return hashtagSets.find((set) => set.id === id);
}

export function getRecommendedTagSetIds(context: string) {
  const normalized = context.toLowerCase().replace(/[^a-z0-9]/g, "");

  return contextToTagSetIds[normalized] ?? ["xrpl-core", "ott-brand"];
}
