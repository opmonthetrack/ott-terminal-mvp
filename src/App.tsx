import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Compass,
  Home,
  Lock,
  LogOut,
  Menu,
  UserCircle,
  Wallet,
  X,
} from "lucide-react";
import { OTTLogoMark } from "./components/OTTLogo";
import { TerminalHomeTab } from "./tabs/TerminalHomeTab";
import { isAccessVerified, loadAccessState } from "./lib/accessStore";
import { getOttAccountName } from "./lib/ottAuth";
import { useOttAuthSession } from "./lib/useOttAuthSession";
import { verifyMakeWavesPayload } from "./lib/xamanClient";
import {
  cleanXamanReturnUrl,
  clearXamanMobileSession,
  getXamanReturnState,
} from "./lib/xamanMobileSession";
import { useTerminalLanguage } from "./lib/useTerminalLanguage";
import type { TerminalLanguage } from "./lib/terminalCopy";
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

type MenuItem = {
  id: ActiveTab;
  label: string;
  description?: string;
};

type MenuGroup = {
  title: string;
  items: MenuItem[];
};

const SOURCE_TAG = "2606170002";

const FREE_TABS: ActiveTab[] = [
  "home",
  "dashboard",
  "network",
  "wallet",
  "source",
  "roadmap",
  "xaman",
  "xamanactivation",
  "xrplverify",
  "checkin",
  "rewardledger",
  "academy",
  "intel",
  "news",
  "ottintelligence",
  "accessgate",
  "support",
  "pitchmode",
  "submission",
  "smoketest",
];

function isFreeTab(tab: ActiveTab) {
  return FREE_TABS.includes(tab);
}

function getAccessUnlocked(walletAddress: string) {
  if (!walletAddress || walletAddress === "guest") {
    return false;
  }

  return isAccessVerified(loadAccessState(walletAddress));
}

function getCoreMenuGroups(language: TerminalLanguage): MenuGroup[] {
  const isEnglish = language === "en";

  return [
    {
      title: isEnglish ? "Start" : "Start",
      items: [
        {
          id: "home",
          label: isEnglish ? "Home" : "Start",
          description: isEnglish ? "A clear introduction to OTT." : "Een duidelijke introductie tot OTT.",
        },
        {
          id: "dashboard",
          label: isEnglish ? "Daily overview" : "Dagoverzicht",
          description: isEnglish ? "Your most relevant information today." : "Jouw belangrijkste informatie van vandaag.",
        },
        {
          id: "wallet",
          label: isEnglish ? "Account and profile" : "Account en profiel",
          description: isEnglish
            ? "Sign in, track learning and optionally connect a wallet."
            : "Log in, volg je leertraject en koppel optioneel een wallet.",
        },
      ],
    },
    {
      title: isEnglish ? "Learn" : "Leren",
      items: [
        {
          id: "academy",
          label: isEnglish ? "Academy" : "Academie",
          description: isEnglish ? "Learn XRPL step by step." : "Leer XRPL stap voor stap.",
        },
        {
          id: "xamanactivation",
          label: isEnglish ? "Wallet learning" : "Leren over wallets",
          description: isEnglish
            ? "Compare wallet types, custody and recovery."
            : "Vergelijk walletsoorten, custody en herstel.",
        },
        {
          id: "network",
          label: isEnglish ? "XRPL explorer" : "XRPL-verkenner",
          description: isEnglish
            ? "Explore the network without technical overload."
            : "Verken het netwerk zonder technische overload.",
        },
      ],
    },
    {
      title: isEnglish ? "Explore" : "Ontdekken",
      items: [
        {
          id: "intel",
          label: "XRPL Intelligence",
          description: isEnglish ? "Source-led XRPL updates." : "XRPL-updates met duidelijke bronnen.",
        },
        {
          id: "news",
          label: isEnglish ? "Newsroom" : "Nieuwsruimte",
          description: isEnglish
            ? "Turn verified information into content."
            : "Zet geverifieerde informatie om in content.",
        },
        {
          id: "ottintelligence",
          label: "OTT Intelligence",
          description: isEnglish
            ? "Follow the terminal's verified research and operational signals."
            : "Volg geverifieerd onderzoek en operationele signalen van de terminal.",
        },
        {
          id: "roadmap",
          label: isEnglish ? "Roadmap voting" : "Roadmap stemmen",
          description: isEnglish
            ? "Sign and verify a community vote."
            : "Onderteken en verifieer een communitystem.",
        },
        {
          id: "support",
          label: isEnglish ? "Support OTT" : "Steun OTT",
          description: isEnglish
            ? "Transparent on-ledger support."
            : "Transparante ondersteuning op de ledger.",
        },
      ],
    },
    {
      title: isEnglish ? "Wallet tools" : "Wallettools",
      items: [
        {
          id: "xaman",
          label: isEnglish ? "Connect XRPL wallet" : "XRPL-wallet koppelen",
          description: isEnglish
            ? "Xaman is supported first; more wallets are planned."
            : "Xaman wordt als eerste ondersteund; meer wallets volgen.",
        },
        { id: "xrplverify", label: isEnglish ? "Verify transaction" : "Transactie verifiëren" },
        { id: "source", label: `SourceTag ${SOURCE_TAG}` },
        { id: "checkin", label: isEnglish ? "Daily proof" : "Dagelijks bewijs" },
        { id: "rewardledger", label: isEnglish ? "Progress ledger" : "Voortgangsoverzicht" },
        { id: "accessgate", label: isEnglish ? "Access" : "Toegang" },
      ],
    },
  ];
}

function getFounderMenuGroups(language: TerminalLanguage): MenuGroup[] {
  const isEnglish = language === "en";

  return [
    {
      title: isEnglish ? "Founder and QA" : "Founder en QA",
      items: [
        { id: "pitchmode", label: isEnglish ? "Pitch mode" : "Pitchmodus" },
        { id: "submission", label: isEnglish ? "Submission pack" : "Inzendpakket" },
        { id: "smoketest", label: "Smoke test" },
        { id: "launch", label: "Launch control" },
      ],
    },
    {
      title: "Labs",
      items: [
        { id: "truthdesk", label: "Truth Desk" },
        { id: "marketplace", label: isEnglish ? "Marketplace" : "Webshop" },
        { id: "otttestnet", label: "OTT Testnet" },
        { id: "portfolio", label: "Portfolio" },
        { id: "partners", label: "Partner Hub" },
        { id: "ecosystem", label: isEnglish ? "Ecosystem" : "Ecosysteem" },
        { id: "validator", label: "Validators" },
        { id: "developer", label: "Developer Hub" },
        { id: "tokenization", label: isEnglish ? "Tokenization" : "Tokenisatie" },
        { id: "factory", label: isEnglish ? "Token factory" : "Tokenfabriek" },
        { id: "profile", label: isEnglish ? "Legacy profile" : "Oud profiel" },
        { id: "token", label: "OTT Token" },
        { id: "rewardpolicy", label: isEnglish ? "Reward policy" : "Beloningsbeleid" },
        { id: "ai", label: "AI Hub" },
        { id: "defi", label: "DeFi" },
        { id: "ottintelligence", label: "OTT Intelligence" },
      ],
    },
  ];
}

function getAllRouteItems(language: TerminalLanguage): MenuItem[] {
  return [...getCoreMenuGroups(language), ...getFounderMenuGroups(language)].flatMap(
    (group) => group.items,
  );
}

function getInitialActiveTab(): ActiveTab {
  if (typeof window === "undefined") {
    return "home";
  }

  const params = new URLSearchParams(window.location.search);

  if (params.get("support_payment_return") === "1") {
    return "support";
  }

  if (
    params.get("access_payment_return") === "1" ||
    params.get("access_accept_return") === "1"
  ) {
    return "accessgate";
  }

  const requestedTab = params.get("tab");
  if (!requestedTab) {
    return "home";
  }

  const founderMode = params.get("founder") === "1";
  const allowedItems = founderMode
    ? getAllRouteItems("en")
    : getCoreMenuGroups("en").flatMap((group) => group.items);

  return allowedItems.some((item) => item.id === requestedTab)
    ? requestedTab as ActiveTab
    : "home";
}

function getPrimaryNavigation(language: TerminalLanguage): Array<{
  id: ActiveTab;
  label: string;
  icon: typeof Home;
}> {
  const isEnglish = language === "en";

  return [
    { id: "home", label: isEnglish ? "Home" : "Start", icon: Home },
    { id: "academy", label: isEnglish ? "Learn" : "Leren", icon: BookOpen },
    { id: "intel", label: isEnglish ? "Explore" : "Ontdekken", icon: Compass },
    { id: "wallet", label: isEnglish ? "Profile" : "Profiel", icon: UserCircle },
  ];
}

export default function App() {
  const [walletAddress, setWalletAddress] = useState<string>(() => getStoredWalletAddress());
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => getInitialActiveTab());
  const [menuOpen, setMenuOpen] = useState(false);
  const [walletStatus, setWalletStatus] = useState("");
  const [accessUnlocked, setAccessUnlocked] = useState(() => getAccessUnlocked(walletAddress));
  const { language, setLanguage } = useTerminalLanguage();
  const { user, signedIn, loading: authLoading } = useOttAuthSession();

  const founderMode = useMemo(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return new URLSearchParams(window.location.search).get("founder") === "1";
  }, []);

  const coreMenuGroups = useMemo(() => getCoreMenuGroups(language), [language]);
  const menuGroups = useMemo(
    () => founderMode ? [...coreMenuGroups, ...getFounderMenuGroups(language)] : coreMenuGroups,
    [coreMenuGroups, founderMode, language],
  );
  const allRouteItems = useMemo(() => getAllRouteItems(language), [language]);
  const primaryNavigation = useMemo(() => getPrimaryNavigation(language), [language]);
  const activeItem = allRouteItems.find((item) => item.id === activeTab) ?? allRouteItems[0];
  const activeTabLocked = !accessUnlocked && !isFreeTab(activeTab);
  const accountName = getOttAccountName(user);

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
      : (activeItem?.label ?? "OTT") + " | OTT Terminal";
  }, [activeItem?.label, activeTab]);

  useEffect(() => {
    const refreshAccess = () => setAccessUnlocked(getAccessUnlocked(walletAddress));

    refreshAccess();
    window.addEventListener("focus", refreshAccess);
    window.addEventListener("storage", refreshAccess);

    return () => {
      window.removeEventListener("focus", refreshAccess);
      window.removeEventListener("storage", refreshAccess);
    };
  }, [walletAddress]);

  useEffect(() => {
    const syncWalletSession = () => {
      const storedAddress = getStoredWalletAddress();
      setWalletAddress((currentAddress) =>
        currentAddress === storedAddress ? currentAddress : storedAddress,
      );
    };

    window.addEventListener("storage", syncWalletSession);
    window.addEventListener("ott-wallet-session-changed", syncWalletSession);

    return () => {
      window.removeEventListener("storage", syncWalletSession);
      window.removeEventListener("ott-wallet-session-changed", syncWalletSession);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  useEffect(() => {
    const returnState = getXamanReturnState();

    if (!returnState.hasReturnedFromXaman || !returnState.payloadUuid || !returnState.actionId) {
      return;
    }

    let mounted = true;

    async function verifyReturnedPayload() {
      setWalletStatus(
        language === "en"
          ? "Verifying your wallet signature…"
          : "Je wallethandtekening wordt gecontroleerd…",
      );

      try {
        const response = await verifyMakeWavesPayload(
          returnState.payloadUuid as string,
          returnState.actionId,
        );

        if (!mounted) {
          return;
        }

        if (response.verified?.signed && response.verified?.account) {
          saveWalletSession(response.verified.account);
          setWalletAddress(response.verified.account);
          setActiveTab(returnState.returnTarget);
          setWalletStatus(language === "en" ? "Wallet connected." : "Wallet gekoppeld.");
          clearXamanMobileSession();
        } else if (response.verified?.resolved && !response.verified?.signed) {
          setActiveTab("xaman");
          setWalletStatus(
            language === "en"
              ? "The wallet request was declined or expired."
              : "Het walletverzoek is geweigerd of verlopen.",
          );
        } else {
          setActiveTab("xaman");
          setWalletStatus(language === "en" ? "Waiting for wallet approval." : "Wachten op walletgoedkeuring.");
        }
      } catch {
        if (!mounted) {
          return;
        }

        setActiveTab("xaman");
        setWalletStatus(
          language === "en"
            ? "We could not verify the wallet return."
            : "De terugkeer van de wallet kon niet worden geverifieerd.",
        );
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
    setAccessUnlocked(getAccessUnlocked(walletAddress));
    setActiveTab(target);
    setMenuOpen(false);

    const url = new URL(window.location.href);
    if (target === "home") {
      url.searchParams.delete("tab");
    } else {
      url.searchParams.set("tab", target);
    }
    window.history.pushState({}, document.title, url.toString());
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function navigateTo(target: string) {
    if (allRouteItems.some((item) => item.id === target)) {
      goTo(target as ActiveTab);
    }
  }

  function connectWallet(address: string) {
    saveWalletSession(address);
    setWalletAddress(address);
    setActiveTab("wallet");
    setMenuOpen(false);
  }

  function disconnectWallet() {
    clearWalletSession();
    setWalletAddress("guest");
    setAccessUnlocked(false);
    setMenuOpen(false);
    setWalletStatus(language === "en" ? "Wallet disconnected." : "Wallet losgekoppeld.");
    window.setTimeout(() => setWalletStatus(""), 2500);
  }

  return (
    <div className="min-h-screen bg-white text-[#111827] selection:bg-[#2563EB]/15">
      <TopNavigation
        activeTab={activeTab}
        accountName={accountName}
        signedIn={signedIn}
        authLoading={authLoading}
        walletConnected={walletAddress !== "guest"}
        language={language}
        setLanguage={setLanguage}
        primaryNavigation={primaryNavigation}
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
          founderMode={founderMode}
          onNavigate={goTo}
          onDisconnectWallet={disconnectWallet}
          onClose={() => setMenuOpen(false)}
        />
      )}

      <main className="min-h-[calc(100vh-72px)] bg-white">
        {activeTab !== "home" && (
          <div className="border-b border-slate-200 bg-white">
            <div className="mx-auto max-w-7xl px-5 py-4 sm:px-8">
              <p className="text-xs font-medium text-slate-500">
                {activeItem?.label ?? "OTT"}
              </p>
            </div>
          </div>
        )}

        {activeTabLocked ? (
          <LockedPreview
            language={language}
            activeItem={activeItem}
            walletAddress={walletAddress}
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
            {activeTab === "wallet" && <WalletTab walletAddress={walletAddress} onDisconnect={disconnectWallet} />}
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
            {activeTab === "accessgate" && <AccessGateTab walletAddress={walletAddress} />}
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
  primaryNavigation: Array<{ id: ActiveTab; label: string; icon: typeof Home }>;
  onNavigate: (target: ActiveTab) => void;
  onOpenMenu: () => void;
}) {
  const accountLabel = authLoading
    ? "…"
    : signedIn
      ? accountName || (language === "en" ? "My account" : "Mijn account")
      : language === "en"
        ? "Sign in"
        : "Inloggen";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="flex shrink-0 items-center gap-3 text-left"
          aria-label="OTT home"
        >
          <OTTLogoMark size={36} />
          <div className="hidden sm:block">
            <p className="text-sm font-semibold tracking-tight text-slate-950">OnTheTrack</p>
            <p className="text-[11px] text-slate-500">XRPL learning platform</p>
          </div>
        </button>

        <nav className="mx-auto hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          {primaryNavigation.map((item) => {
            const Icon = item.icon;
            const selected = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  selected
                    ? "bg-slate-100 text-slate-950"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-950"
                }`}
              >
                <Icon size={16} strokeWidth={1.8} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center rounded-lg border border-slate-200 p-1 sm:flex">
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`rounded-md px-2.5 py-1.5 text-[11px] font-semibold ${
                language === "en" ? "bg-slate-900 text-white" : "text-slate-500"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage("nl")}
              className={`rounded-md px-2.5 py-1.5 text-[11px] font-semibold ${
                language === "nl" ? "bg-slate-900 text-white" : "text-slate-500"
              }`}
            >
              NL
            </button>
          </div>

          <button
            type="button"
            onClick={() => onNavigate("wallet")}
            className="hidden max-w-44 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 lg:flex"
          >
            <span className="relative">
              <UserCircle size={17} />
              {walletConnected && (
                <span
                  className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white"
                  title={language === "en" ? "Wallet connected" : "Wallet gekoppeld"}
                />
              )}
            </span>
            <span className="truncate">{accountLabel}</span>
          </button>

          <button
            type="button"
            onClick={onOpenMenu}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
            aria-label={language === "en" ? "Open all tools" : "Open alle tools"}
          >
            <Menu size={19} />
          </button>
        </div>
      </div>

      <nav className="flex border-t border-slate-100 px-2 py-2 md:hidden" aria-label="Mobile primary navigation">
        {primaryNavigation.map((item) => {
          const Icon = item.icon;
          const selected = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`flex flex-1 flex-col items-center gap-1 rounded-lg py-2 text-[11px] font-medium ${
                selected ? "bg-slate-100 text-slate-950" : "text-slate-500"
              }`}
            >
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
  founderMode,
  onNavigate,
  onDisconnectWallet,
  onClose,
}: {
  activeTab: ActiveTab;
  accountName: string;
  signedIn: boolean;
  walletAddress: string;
  language: TerminalLanguage;
  setLanguage: (language: TerminalLanguage) => void;
  menuGroups: MenuGroup[];
  founderMode: boolean;
  onNavigate: (target: ActiveTab) => void;
  onDisconnectWallet: () => void;
  onClose: () => void;
}) {
  const walletConnected = Boolean(walletAddress && walletAddress !== "guest");

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/30 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <button type="button" className="absolute inset-0" onClick={onClose} aria-label="Close menu" />

      <div className="relative mx-auto my-3 max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:my-8">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5 sm:px-7">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-950">
              {language === "en" ? "Explore OTT" : "Ontdek OTT"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {language === "en" ? "Choose one destination." : "Kies één bestemming."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            aria-label={language === "en" ? "Close menu" : "Menu sluiten"}
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-8 px-5 py-7 sm:px-7 lg:grid-cols-2">
          {menuGroups.map((group) => (
            <section key={group.title}>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                {group.title}
              </h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onNavigate(item.id)}
                    className={`rounded-xl border p-4 text-left transition-colors ${
                      activeTab === item.id
                        ? "border-blue-200 bg-blue-50"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                    {item.description && (
                      <p className="mt-1 text-xs leading-5 text-slate-500">{item.description}</p>
                    )}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="border-t border-slate-200 bg-slate-50 px-5 py-5 sm:px-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {signedIn
                  ? accountName || (language === "en" ? "OTT account" : "OTT-account")
                  : language === "en"
                    ? "Not signed in"
                    : "Niet ingelogd"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {walletConnected
                  ? `${language === "en" ? "Wallet" : "Wallet"}: ${shortWallet(walletAddress)}`
                  : language === "en"
                    ? "No wallet connected"
                    : "Geen wallet gekoppeld"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                  language === "en"
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 bg-white text-slate-600"
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage("nl")}
                className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                  language === "nl"
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 bg-white text-slate-600"
                }`}
              >
                Nederlands
              </button>
              <button
                type="button"
                onClick={() => onNavigate("wallet")}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
              >
                {signedIn
                  ? language === "en" ? "Open profile" : "Open profiel"
                  : language === "en" ? "Sign in" : "Inloggen"}
              </button>
              {walletConnected && (
                <button
                  type="button"
                  onClick={onDisconnectWallet}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500"
                >
                  <LogOut size={14} />
                  {language === "en" ? "Disconnect wallet" : "Wallet loskoppelen"}
                </button>
              )}
            </div>
          </div>

          {founderMode && (
            <p className="mt-4 border-t border-slate-200 pt-4 text-xs text-slate-400">
              {language === "en" ? "Founder mode active." : "Foundermodus actief."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function LockedPreview({
  language,
  activeItem,
  walletAddress,
  onNavigate,
}: {
  language: TerminalLanguage;
  activeItem?: MenuItem;
  walletAddress: string;
  onNavigate: (target: ActiveTab) => void;
}) {
  const walletConnected = Boolean(walletAddress && walletAddress !== "guest");

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-5 py-16 sm:px-8">
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700">
          <Lock size={21} />
        </div>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950">
          {activeItem?.label ?? (language === "en" ? "Access feature" : "Toegangsfunctie")}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
          {walletConnected
            ? language === "en"
              ? "This feature requires a verified OTT Access Pass."
              : "Deze functie vereist een geverifieerde OTT Access Pass."
            : language === "en"
              ? "A wallet is only needed here to verify ownership of an OTT Access Pass."
              : "Alleen hier is een wallet nodig om eigendom van een OTT Access Pass te verifiëren."}
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => onNavigate(walletConnected ? "accessgate" : "xaman")}
            className="rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            {walletConnected
              ? language === "en" ? "View access" : "Bekijk toegang"
              : language === "en" ? "Connect wallet" : "Wallet koppelen"}
          </button>
          <button
            type="button"
            onClick={() => onNavigate("home")}
            className="rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {language === "en" ? "Back home" : "Terug naar start"}
          </button>
        </div>
      </div>
    </section>
  );
}

function RouteLoadingState({ language }: { language: TerminalLanguage }) {
  return (
    <div className="flex min-h-[55vh] items-center justify-center px-6">
      <p className="text-sm text-slate-500">
        {language === "en" ? "Loading…" : "Laden…"}
      </p>
    </div>
  );
}

function StatusBanner({ text }: { text: string }) {
  return (
    <div className="fixed left-1/2 top-24 z-[60] -translate-x-1/2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-lg">
      {text}
    </div>
  );
}

function shortWallet(address: string) {
  if (!address || address === "guest") {
    return "Guest";
  }

  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
