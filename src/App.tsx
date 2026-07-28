import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  Home,
  Lock,
  LogOut,
  Menu,
  Presentation,
  Search,
  ShieldCheck,
  UserCircle,
  Wallet,
  X,
} from "lucide-react";
import { OTTLogoMark } from "./components/OTTLogo";
import { TerminalHomeTab } from "./tabs/TerminalHomeTab";
import { getOttAccountName } from "./lib/ottAuth";
import { getOttRole, getOttRoleLabel, hasFounderAccess, type OttRole } from "./lib/ottRoles";
import {
  EMPTY_ENTITLEMENTS,
  loadPremiumAccessStatus,
  type PremiumEntitlements,
} from "./lib/premiumAccessClient";
import { useOttAuthSession } from "./lib/useOttAuthSession";
import { verifyMakeWavesPayload } from "./lib/xamanClient";
import {
  cleanXamanReturnUrl,
  clearXamanMobileSession,
  getXamanReturnState,
} from "./lib/xamanMobileSession";
import { useTerminalLanguage } from "./lib/useTerminalLanguage";
import type { TerminalLanguage } from "./lib/terminalCopy";
import type { WalletProviderId, WalletVerificationMethod, XrplNetwork } from "./lib/walletRegistry";
import {
  clearWalletSession,
  getStoredWalletAddress,
  saveWalletSession,
} from "./lib/walletSession";

const DashboardTab = lazy(() => import("./tabs/DashboardTab").then((module) => ({ default: module.DashboardTab })));
const DailyCheckInTab = lazy(() => import("./tabs/DailyCheckInTab").then((module) => ({ default: module.DailyCheckInTab })));
const SourceTagMonitorTab = lazy(() => import("./tabs/SourceTagMonitorTab").then((module) => ({ default: module.SourceTagMonitorTab })));
const XamanCenterTab = lazy(() => import("./tabs/XamanCenterTab").then((module) => ({ default: module.XamanCenterTab })));
const XamanActivationTab = lazy(() => import("./tabs/XamanActivationTab").then((module) => ({ default: module.XamanActivationTab })));
const XrplVerifyTab = lazy(() => import("./tabs/XrplVerifyTab").then((module) => ({ default: module.XrplVerifyTab })));
const NetworkState = lazy(() => import("./tabs/NetworkState").then((module) => ({ default: module.NetworkState })));
const WalletTab = lazy(() => import("./tabs/WalletTab").then((module) => ({ default: module.WalletTab })));
const PortfolioTab = lazy(() => import("./tabs/PortfolioTab").then((module) => ({ default: module.PortfolioTab })));
const EcosystemTab = lazy(() => import("./tabs/EcosystemTab").then((module) => ({ default: module.EcosystemTab })));
const ValidatorTab = lazy(() => import("./tabs/ValidatorTab").then((module) => ({ default: module.ValidatorTab })));
const DeveloperHubTab = lazy(() => import("./tabs/DeveloperHubTab").then((module) => ({ default: module.DeveloperHubTab })));
const TokenizationTab = lazy(() => import("./tabs/TokenizationTab").then((module) => ({ default: module.TokenizationTab })));
const TokenFactory = lazy(() => import("./tabs/TokenFactory").then((module) => ({ default: module.TokenFactory })));
const ProfileTab = lazy(() => import("./tabs/ProfileTab").then((module) => ({ default: module.ProfileTab })));
const OTTTokenCenterTab = lazy(() => import("./tabs/OTTTokenCenterTab").then((module) => ({ default: module.OTTTokenCenterTab })));
const OTTRewardPolicyTab = lazy(() => import("./tabs/OTTRewardPolicyTab").then((module) => ({ default: module.OTTRewardPolicyTab })));
const RewardLedgerTab = lazy(() => import("./tabs/RewardLedgerTab").then((module) => ({ default: module.RewardLedgerTab })));
const OTTTestnetTokenTab = lazy(() => import("./tabs/OTTTestnetTokenTab").then((module) => ({ default: module.OTTTestnetTokenTab })));
const PartnerHubTab = lazy(() => import("./tabs/PartnerHubTab").then((module) => ({ default: module.PartnerHubTab })));
const TruthDeskTab = lazy(() => import("./tabs/TruthDeskTab").then((module) => ({ default: module.TruthDeskTab })));
const AccessGateTab = lazy(() => import("./tabs/AccessGateTab").then((module) => ({ default: module.AccessGateTab })));
const PitchModeTab = lazy(() => import("./tabs/PitchModeTab").then((module) => ({ default: module.PitchModeTab })));
const SubmissionPackTab = lazy(() => import("./tabs/SubmissionPackTab").then((module) => ({ default: module.SubmissionPackTab })));
const SmokeTestTab = lazy(() => import("./tabs/SmokeTestTab").then((module) => ({ default: module.SmokeTestTab })));
const OTTIntelligence = lazy(() => import("./tabs/OTTIntelligence").then((module) => ({ default: module.OTTIntelligence })));
const LaunchControlTab = lazy(() => import("./tabs/LaunchControlTab").then((module) => ({ default: module.LaunchControlTab })));
const AIHubTab = lazy(() => import("./tabs/AIHubTab").then((module) => ({ default: module.AIHubTab })));
const MarketplaceTab = lazy(() => import("./tabs/MarketplaceTab").then((module) => ({ default: module.MarketplaceTab })));
const NewsTab = lazy(() => import("./tabs/NewsTab").then((module) => ({ default: module.NewsTab })));
const DeFiTab = lazy(() => import("./tabs/DeFiTab").then((module) => ({ default: module.DeFiTab })));
const AcademyTab = lazy(() => import("./tabs/AcademyTab").then((module) => ({ default: module.AcademyTab })));
const LedgerIntelTab = lazy(() => import("./tabs/LedgerIntelTab").then((module) => ({ default: module.LedgerIntelTab })));
const RoadmapTab = lazy(() => import("./tabs/RoadmapTab").then((module) => ({ default: module.RoadmapTab })));
const SupportDonationTab = lazy(() => import("./tabs/SupportDonationTab").then((module) => ({ default: module.SupportDonationTab })));

type ActiveTab =
  | "home"
  | "dashboard"
  | "checkin"
  | "source"
  | "roadmap"
  | "xaman"
  | "xamanactivation"
  | "xrplverify"
  | "network"
  | "wallet"
  | "portfolio"
  | "ecosystem"
  | "validator"
  | "developer"
  | "tokenization"
  | "factory"
  | "profile"
  | "token"
  | "rewardpolicy"
  | "rewardledger"
  | "otttestnet"
  | "partners"
  | "truthdesk"
  | "accessgate"
  | "pitchmode"
  | "submission"
  | "smoketest"
  | "ottintelligence"
  | "launch"
  | "ai"
  | "marketplace"
  | "news"
  | "defi"
  | "academy"
  | "support"
  | "intel";

type RouteAudience = "public" | "account" | "premium" | "founder";
type PremiumScope = "allPremium" | "academyPremium" | "walletAcademy" | "researchPro";

type RouteItem = {
  id: ActiveTab;
  label: string;
  description: string;
  audience: RouteAudience;
  premiumScope?: PremiumScope;
};

type MenuGroup = {
  title: string;
  items: RouteItem[];
};

type NavigationItem = {
  id: ActiveTab;
  label: string;
  icon: typeof Home;
};

type LockReason = "account" | "premium" | "founder";
type FounderConsole = "issuer" | "accessissuer" | "accessmanager" | "research";

const SOURCE_TAG = "2606170002";
const ALL_TAB_IDS: ActiveTab[] = [
  "home",
  "dashboard",
  "checkin",
  "source",
  "roadmap",
  "xaman",
  "xamanactivation",
  "xrplverify",
  "network",
  "wallet",
  "portfolio",
  "ecosystem",
  "validator",
  "developer",
  "tokenization",
  "factory",
  "profile",
  "token",
  "rewardpolicy",
  "rewardledger",
  "otttestnet",
  "partners",
  "truthdesk",
  "accessgate",
  "pitchmode",
  "submission",
  "smoketest",
  "ottintelligence",
  "launch",
  "ai",
  "marketplace",
  "news",
  "defi",
  "academy",
  "support",
  "intel",
];
const ALL_TAB_SET = new Set<ActiveTab>(ALL_TAB_IDS);

function getRouteCatalog(language: TerminalLanguage): Record<ActiveTab, RouteItem> {
  const en = language === "en";

  return {
    home: {
      id: "home",
      label: en ? "Home" : "Start",
      description: en ? "Understand OTT, Make Waves and the XRPL mission." : "Begrijp OTT, Make Waves en de XRPL-missie.",
      audience: "public",
    },
    dashboard: {
      id: "dashboard",
      label: en ? "Progress" : "Voortgang",
      description: en ? "Your account, learning and activity overview." : "Overzicht van je account, leren en activiteit.",
      audience: "account",
    },
    checkin: {
      id: "checkin",
      label: en ? "Daily proof" : "Dagelijks bewijs",
      description: en ? "Create a verified daily XRPL proof." : "Maak een geverifieerd dagelijks XRPL-bewijs.",
      audience: "account",
    },
    source: {
      id: "source",
      label: `SourceTag ${SOURCE_TAG}`,
      description: en ? "Understand and verify OTT's on-ledger project identity." : "Begrijp en verifieer de on-ledger projectidentiteit van OTT.",
      audience: "public",
    },
    roadmap: {
      id: "roadmap",
      label: en ? "Community" : "Community",
      description: en ? "Roadmap voting, quests, testing and transparent support." : "Roadmapstemmen, quests, testen en transparante steun.",
      audience: "public",
    },
    xaman: {
      id: "xaman",
      label: en ? "XRPL Wallet Hub" : "XRPL Wallet Hub",
      description: en ? "Connect and test supported XRPL wallets." : "Koppel en test ondersteunde XRPL-wallets.",
      audience: "public",
    },
    xamanactivation: {
      id: "xamanactivation",
      label: en ? "Wallet learning" : "Leren over wallets",
      description: en ? "Compare custody, recovery and signing models." : "Vergelijk custody-, herstel- en ondertekenmodellen.",
      audience: "public",
    },
    xrplverify: {
      id: "xrplverify",
      label: en ? "Verify transaction" : "Transactie verifiëren",
      description: en ? "Inspect a transaction against the validated ledger." : "Controleer een transactie op de gevalideerde ledger.",
      audience: "public",
    },
    network: {
      id: "network",
      label: en ? "XRPL Tools" : "XRPL-tools",
      description: en ? "Explore the ledger, transactions and SourceTag tools." : "Verken de ledger, transacties en SourceTag-tools.",
      audience: "public",
    },
    wallet: {
      id: "wallet",
      label: en ? "Profile & wallet" : "Profiel en wallet",
      description: en ? "Sign in, manage your profile and link verified wallets." : "Log in, beheer je profiel en koppel geverifieerde wallets.",
      audience: "public",
    },
    portfolio: {
      id: "portfolio",
      label: "Portfolio",
      description: en ? "Internal portfolio prototype." : "Intern portfolioprototype.",
      audience: "founder",
    },
    ecosystem: {
      id: "ecosystem",
      label: en ? "XRPL Ecosystem" : "XRPL-ecosysteem",
      description: en ? "Projects, institutions and infrastructure across XRPL." : "Projecten, instellingen en infrastructuur binnen XRPL.",
      audience: "public",
    },
    validator: {
      id: "validator",
      label: en ? "Validators" : "Validators",
      description: en ? "Learn how consensus and network operators work." : "Leer hoe consensus en netwerkbeheerders werken.",
      audience: "public",
    },
    developer: {
      id: "developer",
      label: en ? "Developer Hub" : "Developer Hub",
      description: en ? "Technical XRPL references and building blocks." : "Technische XRPL-referenties en bouwstenen.",
      audience: "public",
    },
    tokenization: {
      id: "tokenization",
      label: en ? "Tokenization" : "Tokenisatie",
      description: en ? "Explore issued assets, RWA and XRPL token standards." : "Verken uitgegeven activa, RWA en XRPL-tokenstandaarden.",
      audience: "public",
    },
    factory: {
      id: "factory",
      label: en ? "Token factory" : "Tokenfabriek",
      description: en ? "Internal token creation laboratory." : "Intern laboratorium voor tokencreatie.",
      audience: "founder",
    },
    profile: {
      id: "profile",
      label: en ? "Legacy profile" : "Oud profiel",
      description: en ? "Legacy profile retained for migration review." : "Oud profiel bewaard voor migratiecontrole.",
      audience: "founder",
    },
    token: {
      id: "token",
      label: "OTT Token",
      description: en ? "Internal token concept and legal review." : "Intern tokenconcept en juridische beoordeling.",
      audience: "founder",
    },
    rewardpolicy: {
      id: "rewardpolicy",
      label: en ? "Reward policy" : "Beloningsbeleid",
      description: en ? "Internal reward and eligibility policy." : "Intern belonings- en toelatingsbeleid.",
      audience: "founder",
    },
    rewardledger: {
      id: "rewardledger",
      label: en ? "Verified results" : "Geverifieerde resultaten",
      description: en ? "Review account-bound progress and proofs." : "Bekijk accountgebonden voortgang en bewijzen.",
      audience: "account",
    },
    otttestnet: {
      id: "otttestnet",
      label: "OTT Testnet",
      description: en ? "Controlled release and transaction testing." : "Gecontroleerde release- en transactietests.",
      audience: "founder",
    },
    partners: {
      id: "partners",
      label: "Partner Hub",
      description: en ? "Internal partner and institution management." : "Intern partner- en instellingenbeheer.",
      audience: "founder",
    },
    truthdesk: {
      id: "truthdesk",
      label: "Truth Desk",
      description: en ? "Founder research and publication operations." : "Founderonderzoek en publicatiebeheer.",
      audience: "founder",
    },
    accessgate: {
      id: "accessgate",
      label: en ? "Access & credentials" : "Toegang en certificaten",
      description: en ? "Access Passes, earned certificates and claim status." : "Access Passes, verdiende certificaten en claimstatus.",
      audience: "public",
    },
    pitchmode: {
      id: "pitchmode",
      label: en ? "Pitch mode" : "Pitchmodus",
      description: en ? "Founder presentation environment." : "Founder-presentatieomgeving.",
      audience: "founder",
    },
    submission: {
      id: "submission",
      label: en ? "Submission pack" : "Inzendpakket",
      description: en ? "Make Waves submission evidence and assets." : "Make Waves-inzendbewijs en bestanden.",
      audience: "founder",
    },
    smoketest: {
      id: "smoketest",
      label: "Smoke test",
      description: en ? "Founder QA and release verification." : "Founder-QA en releaseverificatie.",
      audience: "founder",
    },
    ottintelligence: {
      id: "ottintelligence",
      label: "OTT Intelligence Pro",
      description: en ? "Premium verified research and operational signals." : "Premium geverifieerd onderzoek en operationele signalen.",
      audience: "premium",
      premiumScope: "researchPro",
    },
    launch: {
      id: "launch",
      label: "Launch control",
      description: en ? "Founder release readiness and launch controls." : "Founder-releasegereedheid en launchcontroles.",
      audience: "founder",
    },
    ai: {
      id: "ai",
      label: "AI Hub",
      description: en ? "Internal AI and automation laboratory." : "Intern AI- en automatiseringslaboratorium.",
      audience: "founder",
    },
    marketplace: {
      id: "marketplace",
      label: en ? "Marketplace" : "Webshop",
      description: en ? "Internal commerce prototype until payments are complete." : "Intern handelsprototype totdat betalingen compleet zijn.",
      audience: "founder",
    },
    news: {
      id: "news",
      label: en ? "Newsroom" : "Nieuwsruimte",
      description: en ? "Turn verified XRPL information into readable updates." : "Zet geverifieerde XRPL-informatie om in leesbare updates.",
      audience: "public",
    },
    defi: {
      id: "defi",
      label: "XRPL DeFi Directory",
      description: en ? "Reviewed XRPL DeFi projects, protocols and status." : "Beoordeelde XRPL-DeFi-projecten, protocollen en status.",
      audience: "public",
    },
    academy: {
      id: "academy",
      label: en ? "Learn" : "Leren",
      description: en ? "XRPL Academy, wallet education and earned certificates." : "XRPL Academy, walleteducatie en verdiende certificaten.",
      audience: "public",
    },
    support: {
      id: "support",
      label: en ? "Support OTT" : "Steun OTT",
      description: en ? "Transparent voluntary support on the XRPL." : "Transparante vrijwillige ondersteuning op de XRPL.",
      audience: "public",
    },
    intel: {
      id: "intel",
      label: en ? "Explore" : "Ontdekken",
      description: en ? "XRPL intelligence, ecosystem, DeFi and tokenization." : "XRPL-intelligence, ecosysteem, DeFi en tokenisatie.",
      audience: "public",
    },
  };
}

function pickRoutes(catalog: Record<ActiveTab, RouteItem>, ids: ActiveTab[]) {
  return ids.map((id) => catalog[id]);
}

function getCoreMenuGroups(catalog: Record<ActiveTab, RouteItem>, language: TerminalLanguage): MenuGroup[] {
  const en = language === "en";
  return [
    { title: en ? "Start" : "Start", items: pickRoutes(catalog, ["home", "academy"]) },
    { title: en ? "Discover" : "Ontdekken", items: pickRoutes(catalog, ["intel", "network"]) },
    { title: en ? "My OTT" : "Mijn OTT", items: pickRoutes(catalog, ["wallet", "dashboard"]) },
    { title: en ? "Access & community" : "Toegang en community", items: pickRoutes(catalog, ["accessgate", "roadmap", "support"]) },
  ];
}

function getFounderMenuGroups(catalog: Record<ActiveTab, RouteItem>, language: TerminalLanguage): MenuGroup[] {
  const en = language === "en";
  return [
    {
      title: en ? "Founder & QA" : "Founder en QA",
      items: pickRoutes(catalog, ["launch", "pitchmode", "submission", "smoketest"]),
    },
    {
      title: en ? "Internal operations" : "Interne operatie",
      items: pickRoutes(catalog, [
        "truthdesk",
        "otttestnet",
        "partners",
        "factory",
        "rewardpolicy",
        "ai",
        "marketplace",
        "portfolio",
        "token",
        "profile",
      ]),
    },
  ];
}

function getInitialActiveTab(): ActiveTab {
  if (typeof window === "undefined") return "home";

  const params = new URLSearchParams(window.location.search);
  if (params.get("support_payment_return") === "1") return "support";
  if (params.get("access_payment_return") === "1" || params.get("access_accept_return") === "1") return "accessgate";

  const requestedTab = params.get("tab") as ActiveTab | null;
  return requestedTab && ALL_TAB_SET.has(requestedTab) ? requestedTab : "home";
}

function getPrimaryNavigation(language: TerminalLanguage, founderMode: boolean): NavigationItem[] {
  const en = language === "en";
  if (founderMode) {
    return [
      { id: "launch", label: en ? "Control" : "Control", icon: ShieldCheck },
      { id: "pitchmode", label: en ? "Pitch" : "Pitch", icon: Presentation },
      { id: "smoketest", label: "QA", icon: ClipboardCheck },
      { id: "truthdesk", label: en ? "Research" : "Onderzoek", icon: Search },
    ];
  }

  return [
    { id: "home", label: en ? "Home" : "Start", icon: Home },
    { id: "academy", label: en ? "Learn" : "Leren", icon: BookOpen },
    { id: "intel", label: en ? "Explore" : "Ontdekken", icon: Compass },
    { id: "wallet", label: en ? "Profile" : "Profiel", icon: UserCircle },
  ];
}

function hasPremiumScope(entitlements: PremiumEntitlements, scope: PremiumScope | undefined) {
  if (entitlements.allPremium) return true;
  if (!scope) return false;
  return Boolean(entitlements[scope]);
}

function getRouteLockReason(
  route: RouteItem,
  signedIn: boolean,
  founder: boolean,
  entitlements: PremiumEntitlements,
): LockReason | null {
  if (route.audience === "public") return null;
  if (route.audience === "account") return signedIn ? null : "account";
  if (route.audience === "founder") return founder ? null : "founder";
  if (!signedIn) return "account";
  return founder || hasPremiumScope(entitlements, route.premiumScope) ? null : "premium";
}

export default function App() {
  const [walletAddress, setWalletAddress] = useState<string>(() => getStoredWalletAddress());
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => getInitialActiveTab());
  const [menuOpen, setMenuOpen] = useState(false);
  const [walletStatus, setWalletStatus] = useState("");
  const [entitlements, setEntitlements] = useState<PremiumEntitlements>(EMPTY_ENTITLEMENTS);
  const [premiumLoading, setPremiumLoading] = useState(false);
  const [premiumSetupRequired, setPremiumSetupRequired] = useState(false);
  const { language, setLanguage } = useTerminalLanguage();
  const { user, signedIn, loading: authLoading } = useOttAuthSession();

  const role = getOttRole(user);
  const founderAuthorized = hasFounderAccess(user);
  const founderMode = useMemo(() => {
    if (typeof window === "undefined" || !founderAuthorized) return false;
    return new URLSearchParams(window.location.search).get("founder") === "1";
  }, [founderAuthorized]);
  const catalog = useMemo(() => getRouteCatalog(language), [language]);
  const coreMenuGroups = useMemo(() => getCoreMenuGroups(catalog, language), [catalog, language]);
  const founderMenuGroups = useMemo(() => getFounderMenuGroups(catalog, language), [catalog, language]);
  const menuGroups = founderMode ? founderMenuGroups : coreMenuGroups;
  const primaryNavigation = useMemo(() => getPrimaryNavigation(language, founderMode), [founderMode, language]);
  const activeItem = catalog[activeTab];
  const lockReason = getRouteLockReason(activeItem, signedIn, founderAuthorized, entitlements);
  const routeAccessPending = authLoading || (activeItem.audience === "premium" && signedIn && premiumLoading);
  const accountName = getOttAccountName(user);

  const refreshPremiumAccess = useCallback(async (silent = false) => {
    if (!signedIn) {
      setEntitlements(EMPTY_ENTITLEMENTS);
      setPremiumSetupRequired(false);
      setPremiumLoading(false);
      return;
    }

    if (!silent) setPremiumLoading(true);
    try {
      const requestedWallet = walletAddress && walletAddress !== "guest" ? walletAddress : undefined;
      const response = await loadPremiumAccessStatus(requestedWallet);
      setEntitlements(response.entitlements ?? EMPTY_ENTITLEMENTS);
      setPremiumSetupRequired(Boolean(response.setupRequired));
    } catch {
      setEntitlements(EMPTY_ENTITLEMENTS);
      setPremiumSetupRequired(false);
    } finally {
      setPremiumLoading(false);
    }
  }, [signedIn, walletAddress]);

  useEffect(() => {
    void refreshPremiumAccess(true);
    const refresh = () => void refreshPremiumAccess(true);
    window.addEventListener("focus", refresh);
    window.addEventListener("ott-wallet-session-changed", refresh);
    window.addEventListener("ott-premium-access-changed", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("ott-wallet-session-changed", refresh);
      window.removeEventListener("ott-premium-access-changed", refresh);
    };
  }, [refreshPremiumAccess]);

  useEffect(() => {
    const dutchFallbacks: Record<string, string> = {
      "Privacy Policy": "Privacybeleid",
      "Terms of Use": "Gebruiksvoorwaarden",
      "OTT COMMAND DASHBOARD": "OTT-DAGOVERZICHT",
      "DAILY INTELLIGENCE SNAPSHOT": "DAGELIJKSE INTELLIGENCE-MOMENTOPNAME",
      "XAMAN PAYMENT": "XAMAN-BETALING",
      "Free": "Gratis",
      "Verify Access": "Toegang verifiëren",
      "Refresh": "Vernieuwen",
      "Open X Post": "X-bericht openen",
    };

    const applyAccessibilityFallbacks = () => {
      document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
        "input, textarea, select",
      ).forEach((control) => {
        const hasName = control.hasAttribute("aria-label") ||
          control.hasAttribute("aria-labelledby") ||
          Boolean(control.id && document.querySelector(`label[for="${CSS.escape(control.id)}"]`)) ||
          Boolean(control.closest("label"));

        if (!hasName) {
          const fallback = control.getAttribute("placeholder") ||
            control.getAttribute("name") ||
            (language === "en" ? "Input field" : "Invoerveld");
          control.setAttribute("aria-label", fallback);
        }
      });

      if (language !== "nl") return;
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node) {
        const value = node.nodeValue ?? "";
        const trimmed = value.trim();
        const replacement = dutchFallbacks[trimmed];
        if (replacement) node.nodeValue = value.replace(trimmed, replacement);
        node = walker.nextNode();
      }
    };

    applyAccessibilityFallbacks();
    const observer = new MutationObserver(applyAccessibilityFallbacks);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [activeTab, language]);

  useEffect(() => {
    const initialTab = activeTab;
    const url = new URL(window.location.href);
    if (initialTab !== "home" && !url.searchParams.has("tab")) {
      url.searchParams.set("tab", initialTab);
      window.history.replaceState({}, document.title, url.toString());
    }

    const syncFromHistory = () => setActiveTab(getInitialActiveTab());
    window.addEventListener("popstate", syncFromHistory);
    return () => window.removeEventListener("popstate", syncFromHistory);
  }, []);

  useEffect(() => {
    document.title = activeTab === "home"
      ? "OTT Terminal | XRPL learning platform"
      : `${activeItem.label} | OTT Terminal`;
  }, [activeItem.label, activeTab]);

  useEffect(() => {
    const syncWalletSession = () => {
      const storedAddress = getStoredWalletAddress();
      setWalletAddress((currentAddress) => currentAddress === storedAddress ? currentAddress : storedAddress);
    };
    window.addEventListener("storage", syncWalletSession);
    window.addEventListener("ott-wallet-session-changed", syncWalletSession);
    return () => {
      window.removeEventListener("storage", syncWalletSession);
      window.removeEventListener("ott-wallet-session-changed", syncWalletSession);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  useEffect(() => {
    const returnState = getXamanReturnState();
    if (!returnState.hasReturnedFromXaman || !returnState.payloadUuid || !returnState.actionId) return;

    let mounted = true;
    async function verifyReturnedPayload() {
      setWalletStatus(language === "en" ? "Verifying your wallet signature…" : "Je wallethandtekening wordt gecontroleerd…");
      try {
        const response = await verifyMakeWavesPayload(returnState.payloadUuid as string, returnState.actionId);
        if (!mounted) return;

        if (response.verified?.signed && response.verified?.account) {
          saveWalletSession({
            walletAddress: response.verified.account,
            providerId: "xaman",
            network: "mainnet",
            verificationMethod: "signed",
          });
          setWalletAddress(response.verified.account);
          setActiveTab(returnState.returnTarget as ActiveTab);
          setWalletStatus(language === "en" ? "Wallet connected." : "Wallet gekoppeld.");
          clearXamanMobileSession();
        } else if (response.verified?.resolved && !response.verified?.signed) {
          setActiveTab("xaman");
          setWalletStatus(language === "en" ? "The wallet request was declined or expired." : "Het walletverzoek is geweigerd of verlopen.");
        } else {
          setActiveTab("xaman");
          setWalletStatus(language === "en" ? "Waiting for wallet approval." : "Wachten op walletgoedkeuring.");
        }
      } catch {
        if (!mounted) return;
        setActiveTab("xaman");
        setWalletStatus(language === "en" ? "We could not verify the wallet return." : "De terugkeer van de wallet kon niet worden geverifieerd.");
      } finally {
        cleanXamanReturnUrl();
        window.setTimeout(() => mounted && setWalletStatus(""), 4500);
      }
    }

    void verifyReturnedPayload();
    return () => {
      mounted = false;
    };
  }, [language]);

  function goTo(target: ActiveTab) {
    setActiveTab(target);
    setMenuOpen(false);
    const url = new URL(window.location.href);
    if (target === "home") url.searchParams.delete("tab");
    else url.searchParams.set("tab", target);
    window.history.pushState({}, document.title, url.toString());
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function navigateTo(target: string) {
    if (ALL_TAB_SET.has(target as ActiveTab)) goTo(target as ActiveTab);
  }

  function connectWallet(
    address: string,
    providerId: WalletProviderId = "xaman",
    network: XrplNetwork = "mainnet",
    verificationMethod: WalletVerificationMethod = "signed",
  ) {
    saveWalletSession({ walletAddress: address, providerId, network, verificationMethod });
    setWalletAddress(address);
    setActiveTab("wallet");
    setMenuOpen(false);
  }

  function connectWalletWithoutNavigation(
    address: string,
    providerId: WalletProviderId,
    network: XrplNetwork,
    verificationMethod: WalletVerificationMethod,
  ) {
    saveWalletSession({ walletAddress: address, providerId, network, verificationMethod });
    setWalletAddress(address);
    setMenuOpen(false);
  }

  function disconnectWallet() {
    clearWalletSession();
    setWalletAddress("guest");
    setEntitlements(EMPTY_ENTITLEMENTS);
    setMenuOpen(false);
    setWalletStatus(language === "en" ? "Wallet disconnected." : "Wallet losgekoppeld.");
    window.setTimeout(() => setWalletStatus(""), 2500);
  }

  function enterFounderMode() {
    const url = new URL(window.location.href);
    url.searchParams.set("founder", "1");
    url.searchParams.set("tab", "launch");
    window.location.assign(url.toString());
  }

  function exitFounderMode() {
    const url = new URL(window.location.href);
    ["founder", "issuer", "accessissuer", "accessmanager", "research"].forEach((key) => url.searchParams.delete(key));
    url.searchParams.delete("tab");
    window.location.assign(url.toString());
  }

  function openFounderConsole(consoleId: FounderConsole) {
    const url = new URL(window.location.href);
    ["issuer", "accessissuer", "accessmanager", "research"].forEach((key) => url.searchParams.delete(key));
    url.searchParams.set("founder", "1");
    url.searchParams.set(consoleId, "1");
    window.location.assign(url.toString());
  }

  return (
    <div className="min-h-screen bg-white text-[#111827] selection:bg-[#2563EB]/15">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:text-slate-950 focus:shadow-lg">
        {language === "en" ? "Skip to main content" : "Ga naar de hoofdinhoud"}
      </a>
      <TopNavigation
        activeTab={activeTab}
        accountName={accountName}
        signedIn={signedIn}
        authLoading={authLoading}
        walletConnected={walletAddress !== "guest"}
        language={language}
        setLanguage={setLanguage}
        primaryNavigation={primaryNavigation}
        founderMode={founderMode}
        onNavigate={goTo}
        onOpenMenu={() => setMenuOpen(true)}
      />

      {walletStatus && <StatusBanner text={walletStatus} />}

      {menuOpen && (
        <AllToolsMenu
          activeTab={activeTab}
          accountName={accountName}
          signedIn={signedIn}
          walletAddress={walletAddress}
          language={language}
          setLanguage={setLanguage}
          menuGroups={menuGroups}
          role={role}
          entitlements={entitlements}
          founderAuthorized={founderAuthorized}
          founderMode={founderMode}
          premiumSetupRequired={premiumSetupRequired}
          onNavigate={goTo}
          onDisconnectWallet={disconnectWallet}
          onEnterFounder={enterFounderMode}
          onExitFounder={exitFounderMode}
          onOpenFounderConsole={openFounderConsole}
          onClose={() => setMenuOpen(false)}
        />
      )}

      <main id="main-content" className="min-h-[calc(100vh-72px)] bg-white" tabIndex={-1}>
        {(["news", "ottintelligence"] as ActiveTab[]).includes(activeTab) && (
          <h1 className="sr-only">{activeItem.label}</h1>
        )}
        {activeTab !== "home" && (
          <div className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
              <p className="text-xs font-medium text-slate-500">{activeItem.label}</p>
              <AccessTierBadge
                language={language}
                role={role}
                signedIn={signedIn}
                entitlements={entitlements}
                founderMode={founderMode}
              />
            </div>
          </div>
        )}

        {routeAccessPending ? (
          <RouteLoadingState language={language} />
        ) : lockReason ? (
          <LockedPreview
            language={language}
            activeItem={activeItem}
            lockReason={lockReason}
            signedIn={signedIn}
            walletAddress={walletAddress}
            premiumSetupRequired={premiumSetupRequired}
            onNavigate={goTo}
          />
        ) : (
          <Suspense fallback={<RouteLoadingState language={language} />}>
            {activeTab === "home" && <TerminalHomeTab walletAddress={walletAddress} onNavigate={navigateTo} />}
            {activeTab === "dashboard" && <DashboardTab onNavigate={navigateTo} />}
            {activeTab === "checkin" && <DailyCheckInTab walletAddress={walletAddress} />}
            {activeTab === "source" && <SourceTagMonitorTab walletAddress={walletAddress} />}
            {activeTab === "roadmap" && <RoadmapTab walletAddress={walletAddress} onNavigate={navigateTo} />}
            {activeTab === "support" && <SupportDonationTab />}
            {activeTab === "xamanactivation" && <XamanActivationTab />}
            {activeTab === "xaman" && <XamanCenterTab walletAddress={walletAddress} onWalletConnected={connectWallet} />}
            {activeTab === "xrplverify" && <XrplVerifyTab walletAddress={walletAddress} />}
            {activeTab === "network" && <NetworkState />}
            {activeTab === "wallet" && (
              <WalletTab
                walletAddress={walletAddress}
                onWalletConnected={connectWallet}
                onNavigate={navigateTo}
                onDisconnect={disconnectWallet}
              />
            )}
            {activeTab === "portfolio" && <PortfolioTab walletAddress={walletAddress} />}
            {activeTab === "ecosystem" && <EcosystemTab />}
            {activeTab === "validator" && <ValidatorTab />}
            {activeTab === "developer" && <DeveloperHubTab />}
            {activeTab === "tokenization" && <TokenizationTab />}
            {activeTab === "factory" && <TokenFactory />}
            {activeTab === "profile" && <ProfileTab />}
            {activeTab === "token" && <OTTTokenCenterTab />}
            {activeTab === "rewardpolicy" && <OTTRewardPolicyTab />}
            {activeTab === "rewardledger" && <RewardLedgerTab walletAddress={walletAddress} />}
            {activeTab === "otttestnet" && <OTTTestnetTokenTab walletAddress={walletAddress} />}
            {activeTab === "partners" && <PartnerHubTab walletAddress={walletAddress} />}
            {activeTab === "truthdesk" && <TruthDeskTab walletAddress={walletAddress} />}
            {activeTab === "accessgate" && (
              <AccessGateTab
                walletAddress={walletAddress}
                onNavigate={navigateTo}
                onWalletConnected={connectWalletWithoutNavigation}
              />
            )}
            {activeTab === "pitchmode" && <PitchModeTab walletAddress={walletAddress} />}
            {activeTab === "submission" && <SubmissionPackTab walletAddress={walletAddress} />}
            {activeTab === "smoketest" && <SmokeTestTab walletAddress={walletAddress} />}
            {activeTab === "ottintelligence" && <OTTIntelligence />}
            {activeTab === "launch" && <LaunchControlTab />}
            {activeTab === "ai" && <AIHubTab />}
            {activeTab === "marketplace" && <MarketplaceTab />}
            {activeTab === "news" && <NewsTab />}
            {activeTab === "defi" && <DeFiTab />}
            {activeTab === "academy" && <AcademyTab walletAddress={walletAddress} onNavigate={navigateTo} />}
            {activeTab === "intel" && <LedgerIntelTab />}
          </Suspense>
        )}
      </main>
    </div>
  );
}

function TopNavigation({
  activeTab,
  accountName,
  signedIn,
  authLoading,
  walletConnected,
  language,
  setLanguage,
  primaryNavigation,
  founderMode,
  onNavigate,
  onOpenMenu,
}: {
  activeTab: ActiveTab;
  accountName: string;
  signedIn: boolean;
  authLoading: boolean;
  walletConnected: boolean;
  language: TerminalLanguage;
  setLanguage: (language: TerminalLanguage) => void;
  primaryNavigation: NavigationItem[];
  founderMode: boolean;
  onNavigate: (target: ActiveTab) => void;
  onOpenMenu: () => void;
}) {
  const accountLabel = authLoading
    ? "…"
    : signedIn
      ? accountName || (language === "en" ? "My account" : "Mijn account")
      : language === "en" ? "Sign in" : "Inloggen";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-2 px-3 sm:gap-4 sm:px-6 lg:px-8">
        <button type="button" onClick={() => onNavigate(founderMode ? "launch" : "home")} className="flex shrink-0 items-center gap-3 text-left" aria-label="OTT home">
          <OTTLogoMark size={36} />
          <div className="hidden sm:block">
            <p className="text-sm font-semibold tracking-tight text-slate-950">OnTheTrack</p>
            <p className="text-[11px] text-slate-500">{founderMode ? "Founder control" : "XRPL learning platform"}</p>
          </div>
        </button>

        {!founderMode && (
          <div className="flex min-w-0 items-center gap-1 md:hidden">
            <button
              type="button"
              onClick={() => onNavigate(walletConnected ? "wallet" : "xaman")}
              className="flex min-w-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-left text-[10px] font-semibold text-slate-700"
              aria-label={walletConnected
                ? (language === "en" ? "Open synchronized XRPL wallet" : "Open gesynchroniseerde XRPL-wallet")
                : (language === "en" ? "Synchronize an XRPL wallet" : "Synchroniseer een XRPL-wallet")}
            >
              <span className={`h-2 w-2 shrink-0 rounded-full ${walletConnected ? "bg-emerald-500" : "bg-slate-300"}`} aria-hidden="true" />
              <span className="min-w-0 leading-tight">
                <span className="block">XRPL</span>
                <span className="block max-w-16 truncate text-[9px] font-medium text-slate-500">
                  {walletConnected
                    ? (language === "en" ? "synchronized" : "gesynchroniseerd")
                    : (language === "en" ? "not synchronized" : "niet gesynchroniseerd")}
                </span>
              </span>
            </button>

            {activeTab === "home" && (
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event("ott-open-terminal-tour"))}
                className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[10px] font-semibold text-slate-700"
                aria-label={language === "en" ? "Start the OTT Terminal tour" : "Start de OTT Terminal-tour"}
              >
                <ShieldCheck size={14} className="text-blue-700" />
                <span className="leading-tight">Start tour</span>
              </button>
            )}
          </div>
        )}

        <nav className="mx-auto hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          {primaryNavigation.map((item) => {
            const Icon = item.icon;
            const selected = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={selected ? "page" : undefined}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${selected ? "bg-slate-100 text-slate-950" : "text-slate-500 hover:bg-slate-50 hover:text-slate-950"}`}
              >
                <Icon size={16} strokeWidth={1.8} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <div className="flex items-center rounded-lg border border-slate-200 p-1">
            <button type="button" onClick={() => setLanguage("en")} aria-pressed={language === "en"} className={`rounded-md px-2.5 py-1.5 text-[11px] font-semibold ${language === "en" ? "bg-slate-900 text-white" : "text-slate-500"}`}>EN</button>
            <button type="button" onClick={() => setLanguage("nl")} aria-pressed={language === "nl"} className={`rounded-md px-2.5 py-1.5 text-[11px] font-semibold ${language === "nl" ? "bg-slate-900 text-white" : "text-slate-500"}`}>NL</button>
          </div>

          <button type="button" onClick={() => onNavigate("wallet")} className="hidden max-w-44 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 lg:flex">
            <span className="relative">
              <UserCircle size={17} />
              {walletConnected && <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" title={language === "en" ? "Wallet connected" : "Wallet gekoppeld"} />}
            </span>
            <span className="truncate">{accountLabel}</span>
          </button>

          <button type="button" onClick={onOpenMenu} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50" aria-label={language === "en" ? "Open navigation" : "Navigatie openen"}>
            <Menu size={19} />
          </button>
        </div>
      </div>

      <nav className="flex border-t border-slate-100 px-2 py-2 md:hidden" aria-label="Mobile primary navigation">
        {primaryNavigation.map((item) => {
          const Icon = item.icon;
          const selected = activeTab === item.id;
          return (
            <button key={item.id} type="button" onClick={() => onNavigate(item.id)} aria-current={selected ? "page" : undefined} className={`flex flex-1 flex-col items-center gap-1 rounded-lg py-2 text-[11px] font-medium ${selected ? "bg-slate-100 text-slate-950" : "text-slate-500"}`}>
              <Icon size={16} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}

function AllToolsMenu({
  activeTab,
  accountName,
  signedIn,
  walletAddress,
  language,
  setLanguage,
  menuGroups,
  role,
  entitlements,
  founderAuthorized,
  founderMode,
  premiumSetupRequired,
  onNavigate,
  onDisconnectWallet,
  onEnterFounder,
  onExitFounder,
  onOpenFounderConsole,
  onClose,
}: {
  activeTab: ActiveTab;
  accountName: string;
  signedIn: boolean;
  walletAddress: string;
  language: TerminalLanguage;
  setLanguage: (language: TerminalLanguage) => void;
  menuGroups: MenuGroup[];
  role: OttRole;
  entitlements: PremiumEntitlements;
  founderAuthorized: boolean;
  founderMode: boolean;
  premiumSetupRequired: boolean;
  onNavigate: (target: ActiveTab) => void;
  onDisconnectWallet: () => void;
  onEnterFounder: () => void;
  onExitFounder: () => void;
  onOpenFounderConsole: (consoleId: FounderConsole) => void;
  onClose: () => void;
}) {
  const walletConnected = Boolean(walletAddress && walletAddress !== "guest");

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = document.getElementById("all-tools-dialog");
    const focusable = dialog?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
    focusable?.[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    dialog?.addEventListener("keydown", onKeyDown);
    return () => {
      dialog?.removeEventListener("keydown", onKeyDown);
      previous?.focus();
    };
  }, [onClose]);

  return (
    <div id="all-tools-dialog" className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/30 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-labelledby="all-tools-title">
      <button type="button" className="absolute inset-0" onClick={onClose} aria-label={language === "en" ? "Close menu" : "Menu sluiten"} />

      <div className="relative mx-auto my-3 max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:my-8">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5 sm:px-7">
          <div>
            <h2 id="all-tools-title" className="text-xl font-semibold tracking-tight text-slate-950">
              {founderMode ? (language === "en" ? "Founder Control" : "Founder Control") : (language === "en" ? "Explore OTT" : "Ontdek OTT")}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {founderMode
                ? (language === "en" ? "Private operations, QA and issuer tools." : "Privé operatie-, QA- en issuer-tools.")
                : (language === "en" ? "Nine clear destinations. Advanced pages live inside these hubs." : "Negen duidelijke bestemmingen. Geavanceerde pagina's staan binnen deze hubs.")}
            </p>
          </div>
          <button type="button" onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50" aria-label={language === "en" ? "Close menu" : "Menu sluiten"}>
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-8 px-5 py-7 sm:px-7 lg:grid-cols-2">
          {menuGroups.map((group) => (
            <section key={group.title}>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{group.title}</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onNavigate(item.id)}
                    aria-current={activeTab === item.id ? "page" : undefined}
                    className={`relative rounded-xl border p-4 text-left transition-colors ${activeTab === item.id ? "border-blue-700 bg-ott-gradient text-white shadow-lg" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}
                  >
                    <p className={`text-sm font-semibold ${activeTab === item.id ? "text-white" : "text-slate-900"}`}>{item.label}</p>
                    <p className={`mt-1 text-xs leading-5 ${activeTab === item.id ? "text-white/90" : "text-slate-500"}`}>{item.description}</p>
                    {item.audience === "account" && !signedIn && <span className="mt-3 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">{language === "en" ? "Free account" : "Gratis account"}</span>}
                    {activeTab === item.id && <CheckCircle2 className="absolute right-3 top-3 text-white" size={18} aria-hidden="true" />}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>

        {founderMode && (
          <section className="border-t border-slate-200 bg-slate-50 px-5 py-5 sm:px-7">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{language === "en" ? "Secure consoles" : "Beveiligde consoles"}</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              <FounderConsoleButton label="Access Pass issuer" onClick={() => onOpenFounderConsole("accessissuer")} />
              <FounderConsoleButton label="Certificate issuer" onClick={() => onOpenFounderConsole("issuer")} />
              <FounderConsoleButton label="Access manager" onClick={() => onOpenFounderConsole("accessmanager")} />
              <FounderConsoleButton label="Research review" onClick={() => onOpenFounderConsole("research")} />
            </div>
          </section>
        )}

        <div className="border-t border-slate-200 bg-slate-50 px-5 py-5 sm:px-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-slate-900">{signedIn ? accountName || (language === "en" ? "OTT account" : "OTT-account") : (language === "en" ? "Not signed in" : "Niet ingelogd")}</p>
                <AccessTierBadge language={language} role={role} signedIn={signedIn} entitlements={entitlements} founderMode={founderMode} />
              </div>
              <p className="mt-1 text-xs text-slate-500">{walletConnected ? `Wallet: ${shortWallet(walletAddress)}` : (language === "en" ? "No wallet connected" : "Geen wallet gekoppeld")}</p>
              {premiumSetupRequired && signedIn && <p className="mt-2 text-xs font-medium text-amber-700">{language === "en" ? "Premium database setup is still required." : "De premiumdatabase moet nog worden geactiveerd."}</p>}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => setLanguage("en")} aria-pressed={language === "en"} className={`rounded-lg px-3 py-2 text-xs font-semibold ${language === "en" ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-600"}`}>English</button>
              <button type="button" onClick={() => setLanguage("nl")} aria-pressed={language === "nl"} className={`rounded-lg px-3 py-2 text-xs font-semibold ${language === "nl" ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-600"}`}>Nederlands</button>
              <button type="button" onClick={() => onNavigate("wallet")} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">{signedIn ? (language === "en" ? "Open profile" : "Open profiel") : (language === "en" ? "Sign in" : "Inloggen")}</button>
              {walletConnected && <button type="button" onClick={onDisconnectWallet} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500"><LogOut size={14} />{language === "en" ? "Disconnect wallet" : "Wallet loskoppelen"}</button>}
              {founderAuthorized && (founderMode
                ? <button type="button" onClick={onExitFounder} className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white">{language === "en" ? "Exit founder" : "Founder afsluiten"}</button>
                : <button type="button" onClick={onEnterFounder} className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white">{language === "en" ? "Founder control" : "Founder control"}</button>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FounderConsoleButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">{label}</button>;
}

function AccessTierBadge({
  language,
  role,
  signedIn,
  entitlements,
  founderMode,
}: {
  language: TerminalLanguage;
  role: OttRole;
  signedIn: boolean;
  entitlements: PremiumEntitlements;
  founderMode: boolean;
}) {
  const premium = entitlements.allPremium || entitlements.accessPassIssued;
  const label = founderMode || role === "founder" || role === "admin"
    ? getOttRoleLabel(role, language)
    : premium
      ? (language === "en" ? "Access Pass / Premium" : "Access Pass / Premium")
      : getOttRoleLabel(signedIn ? "member" : "public", language);

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${founderMode || role === "founder" || role === "admin" ? "bg-slate-950 text-white" : premium ? "bg-violet-100 text-violet-800" : "bg-slate-100 text-slate-600"}`}>{label}</span>;
}

function LockedPreview({
  language,
  activeItem,
  lockReason,
  signedIn,
  walletAddress,
  premiumSetupRequired,
  onNavigate,
}: {
  language: TerminalLanguage;
  activeItem: RouteItem;
  lockReason: LockReason;
  signedIn: boolean;
  walletAddress: string;
  premiumSetupRequired: boolean;
  onNavigate: (target: ActiveTab) => void;
}) {
  const walletConnected = Boolean(walletAddress && walletAddress !== "guest");
  const copy = lockReason === "founder"
    ? {
        title: language === "en" ? "Founder authorization required" : "Founderautorisatie vereist",
        text: language === "en" ? "This internal route requires a trusted founder or admin role. A URL, wallet or NFT cannot grant this permission." : "Deze interne route vereist een vertrouwde founder- of adminrol. Een URL, wallet of NFT kan deze toestemming niet geven.",
        cta: language === "en" ? "Back home" : "Terug naar start",
        target: "home" as ActiveTab,
      }
    : lockReason === "account"
      ? {
          title: language === "en" ? "Free OTT account required" : "Gratis OTT-account vereist",
          text: language === "en" ? "Sign in so progress, results and verified actions can be attached to your account across devices." : "Log in zodat voortgang, resultaten en geverifieerde acties op al je apparaten aan je account worden gekoppeld.",
          cta: language === "en" ? "Open sign in" : "Inloggen openen",
          target: "wallet" as ActiveTab,
        }
      : {
          title: language === "en" ? "Verified premium access required" : "Geverifieerde premiumtoegang vereist",
          text: premiumSetupRequired
            ? (language === "en" ? "The premium access interface is ready, but the prepared Supabase grant migration must still be active." : "De premiuminterface is klaar, maar de voorbereide Supabase-grantmigratie moet nog actief worden gemaakt.")
            : (language === "en" ? "OTT checks your signed-in account and verified wallet links on the server. Local browser data alone never unlocks this feature." : "OTT controleert je ingelogde account en geverifieerde walletkoppelingen op de server. Alleen lokale browserdata ontgrendelt deze functie nooit."),
          cta: language === "en" ? "View access & credentials" : "Bekijk toegang en certificaten",
          target: "accessgate" as ActiveTab,
        };

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-5 py-16 sm:px-8">
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700"><Lock size={21} /></div>
        <p className="mt-6 text-sm font-semibold text-blue-700">{activeItem.label}</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{copy.title}</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">{copy.text}</p>
        {lockReason === "premium" && signedIn && !walletConnected && <p className="mx-auto mt-3 max-w-xl text-xs leading-5 text-slate-500">{language === "en" ? "A wallet is only required when your entitlement or Access Pass must be linked and verified." : "Een wallet is alleen nodig wanneer je recht of Access Pass gekoppeld en geverifieerd moet worden."}</p>}
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={() => onNavigate(copy.target)} className="rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">{copy.cta}</button>
          {copy.target !== "home" && <button type="button" onClick={() => onNavigate("home")} className="rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">{language === "en" ? "Back home" : "Terug naar start"}</button>}
        </div>
      </div>
    </section>
  );
}

function RouteLoadingState({ language }: { language: TerminalLanguage }) {
  return <div className="flex min-h-[55vh] items-center justify-center px-6"><p className="text-sm text-slate-500">{language === "en" ? "Loading secure access…" : "Beveiligde toegang laden…"}</p></div>;
}

function StatusBanner({ text }: { text: string }) {
  return <div role="status" aria-live="polite" className="fixed left-1/2 top-24 z-[60] -translate-x-1/2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-lg">{text}</div>;
}

function shortWallet(address: string) {
  if (!address || address === "guest") return "Guest";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
