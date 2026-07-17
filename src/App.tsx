import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Fingerprint,
  Home,
  KeyRound,
  Lock,
  Menu,
  MoreHorizontal,
  Search,
  ShieldCheck,
  Smartphone,
  Wallet,
  X,
} from "lucide-react";
import { GlobalLanguageBar } from "./components/GlobalLanguageBar";
import { OTTLogo, OTTLogoMark, OTTProofBadge } from "./components/OTTLogo";
import { TerminalHomeTab } from "./tabs/TerminalHomeTab";
import { DashboardTab } from "./tabs/DashboardTab";
import { DailyCheckInTab } from "./tabs/DailyCheckInTab";
import { SourceTagMonitorTab } from "./tabs/SourceTagMonitorTab";
import { XamanCenterTab } from "./tabs/XamanCenterTab";
import { XamanActivationTab } from "./tabs/XamanActivationTab";
import { XrplVerifyTab } from "./tabs/XrplVerifyTab";
import { NetworkState } from "./tabs/NetworkState";
import { WalletTab } from "./tabs/WalletTab";
import { PortfolioTab } from "./tabs/PortfolioTab";
import { EcosystemTab } from "./tabs/EcosystemTab";
import { ValidatorTab } from "./tabs/ValidatorTab";
import { DeveloperHubTab } from "./tabs/DeveloperHubTab";
import { TokenizationTab } from "./tabs/TokenizationTab";
import { TokenFactory } from "./tabs/TokenFactory";
import { ProfileTab } from "./tabs/ProfileTab";
import { OTTTokenCenterTab } from "./tabs/OTTTokenCenterTab";
import { OTTRewardPolicyTab } from "./tabs/OTTRewardPolicyTab";
import { RewardLedgerTab } from "./tabs/RewardLedgerTab";
import { OTTTestnetTokenTab } from "./tabs/OTTTestnetTokenTab";
import { PartnerHubTab } from "./tabs/PartnerHubTab";
import { TruthDeskTab } from "./tabs/TruthDeskTab";
import { AccessGateTab } from "./tabs/AccessGateTab";
import { PitchModeTab } from "./tabs/PitchModeTab";
import { SubmissionPackTab } from "./tabs/SubmissionPackTab";
import { SmokeTestTab } from "./tabs/SmokeTestTab";
import { OTTIntelligence } from "./tabs/OTTIntelligence";
import { LaunchControlTab } from "./tabs/LaunchControlTab";
import { AIHubTab } from "./tabs/AIHubTab";
import { MarketplaceTab } from "./tabs/MarketplaceTab";
import { NewsTab } from "./tabs/NewsTab";
import { DeFiTab } from "./tabs/DeFiTab";
import { AcademyTab } from "./tabs/AcademyTab";
import { LedgerIntelTab } from "./tabs/LedgerIntelTab";
import { RoadmapTab } from "./tabs/RoadmapTab";
import { isAccessVerified, loadAccessState } from "./lib/accessStore";
import { verifyMakeWavesPayload } from "./lib/xamanClient";
import {
  cleanXamanReturnUrl,
  clearXamanMobileSession,
  getXamanReturnState,
} from "./lib/xamanMobileSession";
import { useTerminalLanguage } from "./lib/useTerminalLanguage";
import type { TerminalLanguage } from "./lib/terminalCopy";

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
  | "intel";

type MenuItem = {
  id: ActiveTab;
  label: string;
  status?: string;
};

type MenuGroup = {
  title: string;
  items: MenuItem[];
};

const sourceTag = "2606170002";

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
      title: "V1 Terminal",
      items: [
        { id: "home", label: isEnglish ? "Home" : "Start", status: "V1" },
        { id: "dashboard", label: "Daily Snapshot", status: "Live" },
        { id: "network", label: isEnglish ? "XRPL Explorer" : "XRPL Verkenner", status: "Live" },
        { id: "wallet", label: isEnglish ? "Wallet Dashboard" : "Wallet Overzicht", status: "Xaman" },
      ],
    },
    {
      title: "Intelligence",
      items: [
        { id: "intel", label: "XRPL Intelligence", status: "Live" },
        { id: "ottintelligence", label: "OTT Intelligence", status: "AI" },
        { id: "news", label: "Newsroom", status: "Social" },
      ],
    },
    {
      title: isEnglish ? "Proof / Education" : "Proof / Educatie",
      items: [
        { id: "source", label: "SourceTag", status: sourceTag },
        { id: "roadmap", label: isEnglish ? "Roadmap & Vote" : "Roadmap & Stem", status: "Vote" },
        { id: "xamanactivation", label: isEnglish ? "Xaman Activation" : "Xaman Activatie", status: "Guide" },
        { id: "xaman", label: "Xaman Center", status: "Sign" },
        { id: "xrplverify", label: isEnglish ? "XRPL Verify" : "XRPL Verificatie", status: "Proof" },
        { id: "checkin", label: isEnglish ? "Daily Check-In" : "Dagelijkse Check-in", status: "XP" },
        { id: "rewardledger", label: isEnglish ? "Reward Ledger" : "Beloningsoverzicht", status: "XP" },
        { id: "academy", label: isEnglish ? "Academy" : "Academie", status: isEnglish ? "Learn" : "Leer" },
      ],
    },
    {
      title: isEnglish ? "Services / Access" : "Services / Toegang",
      items: [
        { id: "accessgate", label: isEnglish ? "Access Gate" : "Toegangspoort", status: "Scan" },
        { id: "truthdesk", label: "Truth Desk", status: "Pass" },
        { id: "marketplace", label: isEnglish ? "Marketplace" : "Webshop", status: "Pass" },
        { id: "otttestnet", label: "OTT Testnet", status: "Pass" },
      ],
    },
  ];
}

function getFounderMenuGroup(language: TerminalLanguage): MenuGroup {
  const isEnglish = language === "en";

  return {
    title: isEnglish ? "Founder / Demo / QA" : "Founder / Demo / QA",
    items: [
      { id: "pitchmode", label: isEnglish ? "Pitch Mode" : "Pitch Modus", status: "Demo" },
      { id: "submission", label: isEnglish ? "Submission Pack" : "Inzendpakket", status: "Ship" },
      { id: "smoketest", label: "Smoke Test", status: "QA" },
    ],
  };
}

function getLabsMenuGroup(language: TerminalLanguage): MenuGroup {
  const isEnglish = language === "en";

  return {
    title: isEnglish ? "Labs / Advanced" : "Labs / Geavanceerd",
    items: [
      { id: "portfolio", label: "Portfolio", status: isEnglish ? "View" : "Bekijk" },
      { id: "partners", label: "Partner Hub", status: isEnglish ? "Learn" : "Leer" },
      { id: "ecosystem", label: isEnglish ? "Ecosystem" : "Ecosysteem", status: isEnglish ? "Map" : "Kaart" },
      { id: "validator", label: "Validators", status: "UNL" },
      { id: "developer", label: "Developer Hub", status: isEnglish ? "Build" : "Bouw" },
      { id: "tokenization", label: isEnglish ? "Tokenization" : "Tokenisatie", status: "RWA" },
      { id: "factory", label: isEnglish ? "Token Factory" : "Token Fabriek", status: isEnglish ? "Create" : "Maak" },
      { id: "profile", label: isEnglish ? "Profile" : "Profiel", status: "User" },
      { id: "token", label: "OTT Token", status: "XP" },
      { id: "rewardpolicy", label: isEnglish ? "Reward Policy" : "Beloningsbeleid", status: "Legal" },
      { id: "launch", label: "Launch Control", status: "Demo" },
      { id: "ai", label: "AI Hub", status: "Tools" },
      { id: "defi", label: "DeFi", status: "MVP" },
    ],
  };
}

function getMenuGroups(language: TerminalLanguage, showLabs: boolean): MenuGroup[] {
  const coreGroups = getCoreMenuGroups(language);

  if (!showLabs) {
    return coreGroups;
  }

  return [
    ...coreGroups,
    getFounderMenuGroup(language),
    getLabsMenuGroup(language),
  ];
}

function getAllRouteItems(language: TerminalLanguage): MenuItem[] {
  return [
    ...getCoreMenuGroups(language),
    getFounderMenuGroup(language),
    getLabsMenuGroup(language),
  ].flatMap((group) => group.items);
}

function getMobilePrimaryItems(language: TerminalLanguage): MenuItem[] {
  const isEnglish = language === "en";

  return [
    { id: "home", label: isEnglish ? "Home" : "Start", status: "V1" },
    { id: "intel", label: "Intel", status: "Live" },
    { id: "news", label: "News", status: "Social" },
    { id: "roadmap", label: "Vote", status: "Pass" },
  ];
}

function MainApp() {
  const [walletAddress, setWalletAddress] = useState<string>("guest");
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [xamanReturnStatus, setXamanReturnStatus] = useState("");
  const [showLabs, setShowLabs] = useState(false);
  const [accessUnlocked, setAccessUnlocked] = useState(() =>
    getAccessUnlocked(walletAddress),
  );

  const { language, setLanguage } = useTerminalLanguage();

  const menuGroups = useMemo(
    () => getMenuGroups(language, showLabs),
    [language, showLabs],
  );

  const allRouteItems = useMemo(
    () => getAllRouteItems(language),
    [language],
  );

  const mobilePrimaryItems = useMemo(
    () => getMobilePrimaryItems(language),
    [language],
  );

  const activeItem =
    allRouteItems.find((item) => item.id === activeTab) ?? allRouteItems[0];

  const activeTabLocked = !accessUnlocked && !isFreeTab(activeTab);

  useEffect(() => {
    const refreshAccess = () => {
      setAccessUnlocked(getAccessUnlocked(walletAddress));
    };

    refreshAccess();
    window.addEventListener("focus", refreshAccess);
    window.addEventListener("storage", refreshAccess);

    return () => {
      window.removeEventListener("focus", refreshAccess);
      window.removeEventListener("storage", refreshAccess);
    };
  }, [walletAddress]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const returnState = getXamanReturnState();

    if (
      !returnState.hasReturnedFromXaman ||
      !returnState.payloadUuid ||
      !returnState.actionId
    ) {
      return;
    }

    let isMounted = true;

    async function verifyReturnedPayload() {
      setXamanReturnStatus("Xaman return detected. Verifying signature...");

      try {
        const response = await verifyMakeWavesPayload(
          returnState.payloadUuid as string,
          returnState.actionId,
        );

        if (!isMounted) {
          return;
        }

        if (response.verified?.signed && response.verified?.account) {
          setWalletAddress(response.verified.account);
          setActiveTab(returnState.returnTarget);
          setXamanReturnStatus("Wallet connected. Opening dashboard...");
          clearXamanMobileSession();
        } else if (response.verified?.resolved && !response.verified?.signed) {
          setActiveTab("xaman");
          setXamanReturnStatus("Xaman request was rejected or expired.");
        } else {
          setActiveTab("xaman");
          setXamanReturnStatus("Xaman signing is still waiting.");
        }
      } catch {
        if (!isMounted) {
          return;
        }

        setActiveTab("xaman");
        setXamanReturnStatus("Could not verify Xaman return. Try verify again.");
      } finally {
        cleanXamanReturnUrl();

        window.setTimeout(() => {
          if (isMounted) {
            setXamanReturnStatus("");
          }
        }, 4500);
      }
    }

    void verifyReturnedPayload();

    return () => {
      isMounted = false;
    };
  }, []);

  function goTo(target: ActiveTab) {
    setAccessUnlocked(getAccessUnlocked(walletAddress));
    setActiveTab(target);
    setIsMobileMenuOpen(false);
  }

  function navigateTo(target: string) {
    const isValid = allRouteItems.some((item) => item.id === target);

    if (isValid) {
      goTo(target as ActiveTab);
    }
  }

  function connectWallet(address: string) {
    setWalletAddress(address);
    setActiveTab("wallet");
    setIsMobileMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-white text-[#080808] selection:bg-[#C83888]/20 lg:flex">
      <GlobalLanguageBar />

      <DesktopSidebar
        activeTab={activeTab}
        walletAddress={walletAddress}
        menuGroups={menuGroups}
        language={language}
        setLanguage={setLanguage}
        showLabs={showLabs}
        setShowLabs={setShowLabs}
        goTo={goTo}
      />

      <MobileHeader
        activeItem={activeItem}
        walletAddress={walletAddress}
        onOpenMenu={() => setIsMobileMenuOpen(true)}
      />

      {xamanReturnStatus && <XamanReturnBanner text={xamanReturnStatus} />}

      {isMobileMenuOpen && (
        <MobileMenu
          activeTab={activeTab}
          walletAddress={walletAddress}
          menuGroups={menuGroups}
          language={language}
          setLanguage={setLanguage}
          showLabs={showLabs}
          setShowLabs={setShowLabs}
          goTo={goTo}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      )}

      <main className="w-full min-h-screen bg-white lg:flex-1 lg:h-screen lg:overflow-y-auto pb-24 lg:pb-0">
        <div className="hidden lg:flex sticky top-0 z-20 border-b border-black/10 px-6 xl:px-8 py-4 items-center justify-between bg-white/90 backdrop-blur">
          <PageHeader activeItem={activeItem} />
        </div>

        {activeTabLocked ? (
          <LockedPremiumPreview
            activeItem={activeItem}
            walletAddress={walletAddress}
            language={language}
            goTo={goTo}
          />
        ) : (
          <>
            {activeTab === "home" && (
              <TerminalHomeTab walletAddress={walletAddress} onNavigate={navigateTo} />
            )}
            {activeTab === "dashboard" && <DashboardTab walletAddress={walletAddress} />}
            {activeTab === "checkin" && <DailyCheckInTab walletAddress={walletAddress} />}
            {activeTab === "source" && <SourceTagMonitorTab walletAddress={walletAddress} />}
            {activeTab === "roadmap" && <RoadmapTab walletAddress={walletAddress} onNavigate={navigateTo} />}
            {activeTab === "xamanactivation" && <XamanActivationTab />}
            {activeTab === "xaman" && (
              <XamanCenterTab walletAddress={walletAddress} onWalletConnected={connectWallet} />
            )}
            {activeTab === "xrplverify" && <XrplVerifyTab walletAddress={walletAddress} />}
            {activeTab === "network" && <NetworkState />}
            {activeTab === "wallet" && <WalletTab walletAddress={walletAddress} />}
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
            {activeTab === "academy" && <AcademyTab />}
            {activeTab === "intel" && <LedgerIntelTab />}
          </>
        )}
      </main>

      <MobileBottomNav activeTab={activeTab} items={mobilePrimaryItems} goTo={goTo} />
    </div>
  );
}

function DesktopSidebar({
  activeTab,
  walletAddress,
  menuGroups,
  language,
  setLanguage,
  showLabs,
  setShowLabs,
  goTo,
}: {
  activeTab: ActiveTab;
  walletAddress: string;
  menuGroups: MenuGroup[];
  language: TerminalLanguage;
  setLanguage: (language: TerminalLanguage) => void;
  showLabs: boolean;
  setShowLabs: (value: boolean) => void;
  goTo: (target: ActiveTab) => void;
}) {
  return (
    <aside className="hidden lg:flex w-72 border-r border-black/10 flex-col justify-between bg-white z-10 relative shrink-0 h-screen">
      <div className="p-6 overflow-y-auto flex-1">
        <BrandButton goTo={goTo} />
        <IdentityPanel walletAddress={walletAddress} goTo={goTo} language={language} />
        <DesktopNav activeTab={activeTab} menuGroups={menuGroups} goTo={goTo} />
      </div>

      <SidebarFooter
        language={language}
        setLanguage={setLanguage}
        showLabs={showLabs}
        onToggleLabs={() => setShowLabs(!showLabs)}
        onReset={() => goTo("home")}
      />
    </aside>
  );
}

function MobileHeader({
  activeItem,
  walletAddress,
  onOpenMenu,
}: {
  activeItem: MenuItem;
  walletAddress: string;
  onOpenMenu: () => void;
}) {
  return (
    <header className="lg:hidden sticky top-0 z-40 border-b border-black/10 bg-white/95 backdrop-blur">
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <button
          onClick={onOpenMenu}
          className="w-11 h-11 border border-black/10 bg-[#F7F8FC] flex items-center justify-center text-black"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <div className="flex-1 min-w-0">
          <p className="font-mono text-[9px] text-black/35 uppercase tracking-[0.25em] truncate">
            {walletAddress === "guest" ? "Guest / " : "Connected / "}
            XRPL Terminal
          </p>
          <h1 className="font-orbitron text-sm font-black uppercase tracking-widest truncate text-black">
            {activeItem.label}
          </h1>
        </div>

        <OTTLogoMark size="md" />
      </div>
    </header>
  );
}

function MobileMenu({
  activeTab,
  walletAddress,
  menuGroups,
  language,
  setLanguage,
  showLabs,
  setShowLabs,
  goTo,
  onClose,
}: {
  activeTab: ActiveTab;
  walletAddress: string;
  menuGroups: MenuGroup[];
  language: TerminalLanguage;
  setLanguage: (language: TerminalLanguage) => void;
  showLabs: boolean;
  setShowLabs: (value: boolean) => void;
  goTo: (target: ActiveTab) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="lg:hidden fixed inset-0 z-[90] bg-white text-black"
      role="dialog"
      aria-modal="true"
      aria-label="Terminal navigation"
    >
      <div className="h-full flex flex-col">
        <div className="border-b border-black/10 px-4 py-3 flex items-center justify-between gap-3">
          <OTTLogo size="md" />
          <button
            onClick={onClose}
            className="w-11 h-11 border border-black/10 bg-[#F7F8FC] flex items-center justify-center"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          <IdentityPanel walletAddress={walletAddress} goTo={goTo} language={language} />
          <DesktopNav activeTab={activeTab} menuGroups={menuGroups} goTo={goTo} />
        </div>

        <SidebarFooter
          language={language}
          setLanguage={setLanguage}
          showLabs={showLabs}
          onToggleLabs={() => setShowLabs(!showLabs)}
          onReset={() => goTo("home")}
        />
      </div>
    </div>
  );
}

function BrandButton({ goTo }: { goTo: (target: ActiveTab) => void }) {
  return (
    <button onClick={() => goTo("home")} className="w-full text-left mb-7">
      <OTTLogo size="md" />
    </button>
  );
}

function IdentityPanel({
  walletAddress,
  goTo,
  language,
}: {
  walletAddress: string;
  goTo: (target: ActiveTab) => void;
  language: TerminalLanguage;
}) {
  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-4 mb-6 shadow-sm">
      <div className="mb-4 text-black">
        <OTTProofBadge sourceTag={sourceTag} />
      </div>

      <div className="space-y-2">
        <StatusRow label="Wallet" value={walletAddress} />
        <StatusRow label="Mode" value={language === "en" ? "Education-first" : "Educatie-eerst"} />
      </div>

      <button
        onClick={() => goTo("xaman")}
        className="w-full bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] text-white p-3 mt-4 text-left hover:brightness-95 transition-all"
      >
        <p className="font-orbitron text-[10px] font-black uppercase tracking-widest">
          {language === "en" ? "Connect / Sign with Xaman" : "Connect / Sign met Xaman"}
        </p>
      </button>
    </div>
  );
}

function DesktopNav({
  activeTab,
  menuGroups,
  goTo,
}: {
  activeTab: ActiveTab;
  menuGroups: MenuGroup[];
  goTo: (target: ActiveTab) => void;
}) {
  return (
    <nav className="space-y-6">
      {menuGroups.map((group) => (
        <div key={group.title}>
          <p className="font-mono text-[9px] text-black/35 uppercase tracking-[0.35em] mb-2 px-2">
            {group.title}
          </p>
          <div className="space-y-1">
            {group.items.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => goTo(item.id)}
                  className={`w-full text-left px-3 py-3 font-orbitron text-[11px] font-bold uppercase tracking-widest transition-all border-l-2 ${
                    isActive
                      ? "bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] text-white border-transparent shadow-sm"
                      : "text-black/48 border-transparent hover:text-black hover:bg-[#F7F8FC]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span>{item.label}</span>
                    {item.status && (
                      <span className={`font-mono text-[8px] uppercase tracking-widest ${isActive ? "text-white/75" : "text-black/28"}`}>
                        {item.status}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function SidebarFooter({
  language,
  setLanguage,
  showLabs,
  onToggleLabs,
  onReset,
}: {
  language: TerminalLanguage;
  setLanguage: (language: TerminalLanguage) => void;
  showLabs: boolean;
  onToggleLabs: () => void;
  onReset: () => void;
}) {
  return (
    <div className="p-4 lg:p-6 space-y-5 border-t border-black/10">
      <div className="bg-[#F7F8FC] border border-black/10 rounded-lg p-1 flex relative">
        <div
          className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] rounded shadow transition-all duration-300 ${
            language === "nl" ? "left-1" : "left-[calc(50%+2px)]"
          }`}
        />
        <button
          onClick={() => setLanguage("nl")}
          className={`flex-1 relative z-10 text-[10px] font-bold uppercase tracking-widest py-2 rounded transition-colors ${
            language === "nl" ? "text-white" : "text-black/40 hover:text-black"
          }`}
        >
          NL
        </button>
        <button
          onClick={() => setLanguage("en")}
          className={`flex-1 relative z-10 text-[10px] font-bold uppercase tracking-widest py-2 rounded transition-colors ${
            language === "en" ? "text-white" : "text-black/40 hover:text-black"
          }`}
        >
          EN
        </button>
      </div>
      <button
        onClick={onToggleLabs}
        className={`w-full text-left px-3 py-3 text-[10px] font-mono font-bold uppercase tracking-widest border border-black/10 transition-colors ${
          showLabs
            ? "bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] text-white"
            : "bg-[#F7F8FC] text-black/45 hover:text-black"
        }`}
      >
        {showLabs
          ? language === "en"
            ? "Hide Founder / Labs"
            : "Verberg Founder / Labs"
          : language === "en"
            ? "Show Founder / Labs"
            : "Toon Founder / Labs"}
      </button>
      <button
        onClick={onReset}
        className="w-full text-left px-3 py-3 text-[10px] font-mono font-bold text-black/40 uppercase tracking-widest hover:text-black transition-colors"
      >
        {language === "en" ? "Reset to home" : "Terug naar start"}
      </button>
    </div>
  );
}

function PageHeader({ activeItem }: { activeItem: MenuItem }) {
  return (
    <>
      <div>
        <p className="font-mono text-[10px] text-black/35 uppercase tracking-[0.35em] mb-2">
          {activeItem.status ? `${activeItem.status} / ` : ""}
          XRPL OnTheTrack Terminal
        </p>
        <h1 className="font-orbitron text-lg xl:text-xl font-black uppercase tracking-widest text-black">
          {activeItem.label}
        </h1>
      </div>
      <div className="pr-28">
        <OTTLogo size="sm" subtitle="Intelligence + Xaman + Proof" />
      </div>
    </>
  );
}

function LockedPremiumPreview({
  activeItem,
  walletAddress,
  language,
  goTo,
}: {
  activeItem: MenuItem;
  walletAddress: string;
  language: TerminalLanguage;
  goTo: (target: ActiveTab) => void;
}) {
  const isEnglish = language === "en";
  const isGuest = !walletAddress || walletAddress === "guest";

  return (
    <section className="min-h-screen bg-white p-4 md:p-6 xl:p-10">
      <div className="relative overflow-hidden border border-black/10 bg-[radial-gradient(circle_at_18%_18%,rgba(56,152,232,0.16),transparent_28%),radial-gradient(circle_at_82%_8%,rgba(200,56,136,0.16),transparent_28%),#ffffff] p-6 md:p-8 xl:p-10 shadow-sm">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.22),#ffffff_94%)]" />
        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="inline-flex items-center gap-2 border border-black/10 bg-white/80 shadow-sm px-4 py-2 mb-6">
              <Lock size={15} className="text-[#C83888]" />
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/55">
                {isEnglish ? "Access Pass Area" : "Access Pass Gebied"}
              </p>
            </div>
            <h2 className="font-orbitron text-4xl xl:text-6xl font-black uppercase leading-none tracking-tight mb-6">
              {activeItem.label}
              <br />
              <span className="bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] bg-clip-text text-transparent">
                Locked Preview
              </span>
            </h2>
            <p className="font-mono text-sm xl:text-base text-black/60 leading-relaxed max-w-3xl mb-8">
              {isEnglish
                ? "This part of the terminal is reserved for Access Pass holders. Free preview stays open for learning, proof, wallet activation, intelligence and Make Waves verification."
                : "Dit deel van de terminal is gereserveerd voor Access Pass holders. Free preview blijft open voor leren, proof, walletactivatie, intelligence en Make Waves verificatie."}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl">
              <button
                onClick={() => goTo(isGuest ? "xamanactivation" : "accessgate")}
                className="border border-transparent bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] p-4 text-left text-white hover:brightness-95 transition-all"
              >
                <KeyRound size={18} className="mb-3" />
                <p className="font-orbitron text-xs font-black uppercase tracking-widest mb-2">
                  {isGuest ? "Activate / Connect Xaman" : "Scan Access Pass"}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-white/75">
                  {isGuest ? "Wallet onboarding" : "Scanner-only"}
                </p>
              </button>
              <button
                onClick={() => goTo("academy")}
                className="border border-black/10 bg-white p-4 text-left hover:bg-[#F7F8FC] transition-all"
              >
                <ShieldCheck size={18} className="text-[#3898E8] mb-3" />
                <p className="font-orbitron text-xs font-black uppercase tracking-widest mb-2 text-black">
                  {isEnglish ? "Continue Free Preview" : "Ga door met Free Preview"}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-black/40">
                  Academy / Proof / XP
                </p>
              </button>
            </div>
          </div>
          <div className="col-span-12 xl:col-span-4">
            <div className="border border-black/10 bg-white/90 p-5 shadow-xl shadow-black/5">
              <p className="font-orbitron text-xs uppercase tracking-widest mb-5">
                Live Access Model
              </p>
              <div className="space-y-3">
                <LockInfoRow label="Free" value="Home, Intel, Newsroom, Activation, Academy, Proof" />
                <LockInfoRow label="Premium" value="Truth Desk, Marketplace, partner tools" />
                <LockInfoRow label="Unlock" value="Exact OTT Access Pass NFT match" />
                <LockInfoRow label="Safety" value="No mint, no payment, scanner-only gate" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LockInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-3">
      <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">
        {label}
      </p>
      <p className="font-orbitron text-xs font-black uppercase break-words text-black">
        {value}
      </p>
    </div>
  );
}

function MobileBottomNav({
  activeTab,
  items,
  goTo,
}: {
  activeTab: ActiveTab;
  items: MenuItem[];
  goTo: (target: ActiveTab) => void;
}) {
  const iconMap = {
    home: Home,
    intel: BarChart3,
    news: Search,
    xamanactivation: Smartphone,
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-black/10 bg-white/95 backdrop-blur px-2 py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
      <div className="grid grid-cols-5 gap-1">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = iconMap[item.id as keyof typeof iconMap] ?? MoreHorizontal;
          return (
            <button
              key={item.id}
              onClick={() => goTo(item.id)}
              className={`min-h-14 rounded-sm border px-2 py-2 transition-all ${
                isActive
                  ? "border-transparent bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] text-white"
                  : "border-black/10 bg-[#F7F8FC] text-black/45"
              }`}
            >
              <Icon size={16} className="mx-auto mb-1" />
              <span className="font-mono text-[8px] uppercase tracking-widest">
                {item.label}
              </span>
            </button>
          );
        })}
        <button
          onClick={() => goTo("xaman")}
          className={`min-h-14 rounded-sm border px-2 py-2 transition-all ${
            activeTab === "xaman"
              ? "border-transparent bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] text-white"
              : "border-black/10 bg-[#F7F8FC] text-black/45"
          }`}
        >
          <Wallet size={16} className="mx-auto mb-1" />
          <span className="font-mono text-[8px] uppercase tracking-widest">XAMAN</span>
        </button>
      </div>
    </nav>
  );
}

function XamanReturnBanner({ text }: { text: string }) {
  return (
    <div className="fixed top-[69px] lg:top-4 left-4 right-4 lg:left-auto lg:right-36 lg:w-[420px] z-[60] border border-black/10 bg-white text-black p-4 shadow-2xl shadow-black/10">
      <p className="font-orbitron text-xs font-black uppercase tracking-widest mb-2">
        Xaman Mobile Return
      </p>
      <p className="font-mono text-xs uppercase tracking-widest text-black/60">
        {text}
      </p>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border border-black/10 bg-white p-2">
      <p className="font-mono text-[9px] text-black/35 uppercase tracking-widest">
        {label}
      </p>
      <p className="font-mono text-[9px] text-black/60 uppercase break-all text-right">
        {value}
      </p>
    </div>
  );
}

export default function App() {
  return <MainApp />;
}
