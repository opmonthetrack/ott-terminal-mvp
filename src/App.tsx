import { useEffect, useMemo, useState } from "react";
import {
  Fingerprint,
  Home,
  Menu,
  MoreHorizontal,
  Search,
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
import { verifyMakeWavesPayload } from "./lib/xamanClient";
import {
  cleanXamanReturnUrl,
  clearXamanMobileSession,
  getXamanReturnState,
} from "./lib/xamanMobileSession";
import {
  useTerminalLanguage,
} from "./lib/useTerminalLanguage";
import type { TerminalLanguage } from "./lib/terminalCopy";

type ActiveTab =
  | "home"
  | "dashboard"
  | "checkin"
  | "source"
  | "xaman"
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

function getMenuGroups(language: TerminalLanguage): MenuGroup[] {
  const isEnglish = language === "en";

  return [
    {
      title: "Terminal",
      items: [
        { id: "home", label: "Home", status: "V2" },
        { id: "network", label: "XRPL Explorer", status: "Live" },
        { id: "wallet", label: isEnglish ? "Wallet Dashboard" : "Wallet Dashboard", status: "Xaman" },
        { id: "portfolio", label: "Portfolio", status: isEnglish ? "View" : "View" },
      ],
    },
    {
      title: isEnglish ? "Proof / Education" : "Proof / Educatie",
      items: [
        { id: "source", label: "SourceTag", status: sourceTag },
        { id: "xaman", label: "Xaman Center", status: "Sign" },
        { id: "xrplverify", label: "XRPL Verify", status: "Proof" },
        { id: "partners", label: "Partner Hub", status: isEnglish ? "Learn" : "Leer" },
        { id: "rewardledger", label: "Reward Ledger", status: "XP" },
      ],
    },
    {
      title: isEnglish ? "Services / Access" : "Services / Toegang",
      items: [
        { id: "truthdesk", label: "Truth Desk", status: isEnglish ? "Ask" : "Vraag" },
        { id: "accessgate", label: "Access Gate", status: "Pay" },
        { id: "otttestnet", label: "OTT Testnet", status: "Sim" },
      ],
    },
    {
      title: "Demo / QA",
      items: [
        { id: "pitchmode", label: "Pitch Mode", status: "Demo" },
        { id: "submission", label: "Submission Pack", status: "Ship" },
        { id: "smoketest", label: "Smoke Test", status: "QA" },
      ],
    },
    {
      title: "Advanced",
      items: [
        { id: "dashboard", label: "Legacy Dashboard", status: "Old" },
        { id: "checkin", label: "Daily Check-In", status: "XP" },
        { id: "ecosystem", label: "Ecosystem", status: "Map" },
        { id: "validator", label: "Validators", status: "UNL" },
        { id: "developer", label: "Developer Hub", status: "Build" },
        { id: "tokenization", label: "Tokenization", status: "RWA" },
        { id: "factory", label: "Token Factory", status: "Create" },
        { id: "profile", label: "Profile", status: "User" },
        { id: "token", label: "OTT Token", status: "XP" },
        { id: "rewardpolicy", label: "Reward Policy", status: "Legal" },
        { id: "ottintelligence", label: "OTT Intelligence", status: "AI" },
        { id: "launch", label: "Launch Control", status: "Demo" },
        { id: "ai", label: "AI Hub", status: "Tools" },
        { id: "marketplace", label: "Marketplace", status: "Shop" },
        { id: "news", label: "Newsroom", status: "News" },
        { id: "defi", label: "DeFi", status: "MVP" },
        { id: "academy", label: "Academy", status: "Learn" },
        { id: "intel", label: "Ledger Intel", status: "Beta" },
      ],
    },
  ];
}

const mobilePrimaryItems: MenuItem[] = [
  { id: "home", label: "Home", status: "V2" },
  { id: "network", label: "Explore", status: "Live" },
  { id: "wallet", label: "Wallet", status: "Xaman" },
  { id: "source", label: "Proof", status: sourceTag },
];

function MainApp() {
  const [walletAddress, setWalletAddress] = useState<string>("guest");
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [xamanReturnStatus, setXamanReturnStatus] = useState("");

  const { language, setLanguage } = useTerminalLanguage();

  const menuGroups = useMemo(() => getMenuGroups(language), [language]);

  const allItems = useMemo(
    () => menuGroups.flatMap((group) => group.items),
    [menuGroups],
  );

  const activeItem =
    allItems.find((item) => item.id === activeTab) ?? menuGroups[0].items[0];

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
    setActiveTab(target);
    setIsMobileMenuOpen(false);
  }

  function navigateTo(target: string) {
    const isValid = allItems.some((item) => item.id === target);

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
        goTo={goTo}
      />

      <MobileHeader
        activeItem={activeItem}
        walletAddress={walletAddress}
        onOpenMenu={() => setIsMobileMenuOpen(true)}
      />

      {xamanReturnStatus && (
        <XamanReturnBanner text={xamanReturnStatus} />
      )}

      {isMobileMenuOpen && (
        <MobileMenu
          activeTab={activeTab}
          walletAddress={walletAddress}
          menuGroups={menuGroups}
          language={language}
          setLanguage={setLanguage}
          goTo={goTo}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      )}

      <main className="w-full min-h-screen bg-white lg:flex-1 lg:h-screen lg:overflow-y-auto pb-24 lg:pb-0">
        <div className="hidden lg:flex sticky top-0 z-20 border-b border-black/10 px-6 xl:px-8 py-4 items-center justify-between bg-white/90 backdrop-blur">
          <PageHeader activeItem={activeItem} />
        </div>

        {activeTab === "home" && (
          <TerminalHomeTab walletAddress={walletAddress} onNavigate={navigateTo} />
        )}

        {activeTab === "dashboard" && (
          <DashboardTab walletAddress={walletAddress} />
        )}

        {activeTab === "checkin" && (
          <DailyCheckInTab walletAddress={walletAddress} />
        )}

        {activeTab === "source" && (
          <SourceTagMonitorTab walletAddress={walletAddress} />
        )}

        {activeTab === "xaman" && (
          <XamanCenterTab
            walletAddress={walletAddress}
            onWalletConnected={connectWallet}
          />
        )}

        {activeTab === "xrplverify" && (
          <XrplVerifyTab walletAddress={walletAddress} />
        )}

        {activeTab === "network" && <NetworkState />}

        {activeTab === "wallet" && <WalletTab walletAddress={walletAddress} />}

        {activeTab === "portfolio" && (
          <PortfolioTab walletAddress={walletAddress} />
        )}

        {activeTab === "ecosystem" && <EcosystemTab />}

        {activeTab === "validator" && <ValidatorTab />}

        {activeTab === "developer" && <DeveloperHubTab />}

        {activeTab === "tokenization" && <TokenizationTab />}

        {activeTab === "factory" && <TokenFactory />}

        {activeTab === "profile" && <ProfileTab />}

        {activeTab === "token" && <OTTTokenCenterTab />}

        {activeTab === "rewardpolicy" && <OTTRewardPolicyTab />}

        {activeTab === "rewardledger" && (
          <RewardLedgerTab walletAddress={walletAddress} />
        )}

        {activeTab === "otttestnet" && (
          <OTTTestnetTokenTab walletAddress={walletAddress} />
        )}

        {activeTab === "partners" && (
          <PartnerHubTab walletAddress={walletAddress} />
        )}

        {activeTab === "truthdesk" && (
          <TruthDeskTab walletAddress={walletAddress} />
        )}

        {activeTab === "accessgate" && (
          <AccessGateTab walletAddress={walletAddress} />
        )}

        {activeTab === "pitchmode" && (
          <PitchModeTab walletAddress={walletAddress} />
        )}

        {activeTab === "submission" && (
          <SubmissionPackTab walletAddress={walletAddress} />
        )}

        {activeTab === "smoketest" && (
          <SmokeTestTab walletAddress={walletAddress} />
        )}

        {activeTab === "ottintelligence" && <OTTIntelligence />}

        {activeTab === "launch" && <LaunchControlTab />}

        {activeTab === "ai" && <AIHubTab />}

        {activeTab === "marketplace" && <MarketplaceTab />}

        {activeTab === "news" && <NewsTab />}

        {activeTab === "defi" && <DeFiTab />}

        {activeTab === "academy" && <AcademyTab />}

        {activeTab === "intel" && <LedgerIntelTab />}
      </main>

      <MobileBottomNav activeTab={activeTab} goTo={goTo} />
    </div>
  );
}

function DesktopSidebar({
  activeTab,
  walletAddress,
  menuGroups,
  language,
  setLanguage,
  goTo,
}: {
  activeTab: ActiveTab;
  walletAddress: string;
  menuGroups: MenuGroup[];
  language: TerminalLanguage;
  setLanguage: (language: TerminalLanguage) => void;
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
      <div className="px-4 py-3 flex items-center justify-between gap-3 pr-28">
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
  goTo,
  onClose,
}: {
  activeTab: ActiveTab;
  walletAddress: string;
  menuGroups: MenuGroup[];
  language: TerminalLanguage;
  setLanguage: (language: TerminalLanguage) => void;
  goTo: (target: ActiveTab) => void;
  onClose: () => void;
}) {
  return (
    <div className="lg:hidden fixed inset-0 z-50 bg-white text-black">
      <div className="h-full flex flex-col">
        <div className="border-b border-black/10 px-4 py-3 flex items-center justify-between gap-3 pr-28">
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
          onReset={() => goTo("home")}
        />
      </div>
    </div>
  );
}

function BrandButton({ goTo }: { goTo: (target: ActiveTab) => void }) {
  return (
    <button
      onClick={() => goTo("home")}
      className="w-full text-left mb-7"
    >
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
        <StatusRow
          label="Mode"
          value={language === "en" ? "Education-first" : "Education-first"}
        />
      </div>

      <button
        onClick={() => goTo("xaman")}
        className="w-full bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] text-white p-3 mt-4 text-left hover:brightness-95 transition-all"
      >
        <p className="font-orbitron text-[10px] font-black uppercase tracking-widest">
          {language === "en" ? "Connect / Sign with Xaman" : "Connect / Sign with Xaman"}
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
                      ? "bg-[#C83888]/10 text-black border-[#C83888]"
                      : "text-black/48 border-transparent hover:text-black hover:bg-[#F7F8FC]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span>{item.label}</span>

                    {item.status && (
                      <span
                        className={`font-mono text-[8px] uppercase tracking-widest ${
                          isActive ? "text-[#C83888]" : "text-black/28"
                        }`}
                      >
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
  onReset,
}: {
  language: TerminalLanguage;
  setLanguage: (language: TerminalLanguage) => void;
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
        onClick={onReset}
        className="w-full text-left px-3 py-3 text-[10px] font-mono font-bold text-black/40 uppercase tracking-widest hover:text-black transition-colors"
      >
        Reset to home
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
        <OTTLogo size="sm" subtitle="Explorer + Xaman + Proof" />
      </div>
    </>
  );
}

function MobileBottomNav({
  activeTab,
  goTo,
}: {
  activeTab: ActiveTab;
  goTo: (target: ActiveTab) => void;
}) {
  const iconMap = {
    home: Home,
    network: Search,
    wallet: Wallet,
    source: Fingerprint,
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-black/10 bg-white/95 backdrop-blur px-2 py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
      <div className="grid grid-cols-5 gap-1">
        {mobilePrimaryItems.map((item) => {
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

          <span className="font-mono text-[8px] uppercase tracking-widest">
            Xaman
          </span>
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
