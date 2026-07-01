import { useState } from "react";
import { LoginScreen } from "./components/LoginScreen";
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
import { LanguageProvider, useLanguage } from "./LanguageContext";

type ActiveTab =
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

function MainApp() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");

  const { lang, setLang, t } = useLanguage();

  if (!walletAddress) {
    return <LoginScreen onLoginSuccess={setWalletAddress} />;
  }

  const menuItems: { id: ActiveTab; label: string; status?: string }[] = [
    { id: "dashboard", label: t("menu_dashboard"), status: "Live" },
    { id: "checkin", label: "Check-In", status: "XP" },
    { id: "source", label: "Source Tag", status: "2606170002" },
    { id: "xaman", label: "Xaman Center", status: "Sign" },
    { id: "xrplverify", label: "XRPL Verify", status: "Proof" },
    { id: "network", label: "Network State", status: "Live" },
    { id: "wallet", label: "Wallet", status: "Safe" },
    { id: "portfolio", label: "Portfolio", status: "Mock" },
    { id: "ecosystem", label: "Ecosystem", status: "Map" },
    { id: "validator", label: "Validators", status: "UNL" },
    { id: "developer", label: "Developer", status: "Build" },
    { id: "tokenization", label: "Tokenization", status: "RWA" },
    { id: "factory", label: "Token Factory", status: "Create" },
    { id: "profile", label: "Profile", status: "New" },
    { id: "token", label: "OTT Token", status: "XP" },
    { id: "rewardpolicy", label: "Reward Policy", status: "Legal" },
    { id: "rewardledger", label: "Reward Ledger", status: "Store" },
    { id: "otttestnet", label: "OTT Testnet", status: "Sim" },
    { id: "partners", label: "Partner Hub", status: "Learn" },
    { id: "truthdesk", label: "Truth Desk", status: "Ask" },
    { id: "accessgate", label: "Access Gate", status: "Pay" },
    { id: "pitchmode", label: "Pitch Mode", status: "Demo" },
    { id: "submission", label: "Submission Pack", status: "Ship" },
    { id: "smoketest", label: "Smoke Test", status: "QA" },
    { id: "ottintelligence", label: "OTT Intelligence", status: "AI" },
    { id: "launch", label: "Launch Control", status: "Demo" },
    { id: "ai", label: "AI Hub", status: "Tools" },
    { id: "marketplace", label: "Marketplace", status: "Shop" },
    { id: "news", label: "Newsroom", status: "News" },
    { id: "defi", label: t("menu_defi"), status: "MVP" },
    { id: "academy", label: t("menu_academy"), status: "Learn" },
    { id: "intel", label: t("menu_intel"), status: "Beta" },
  ];

  return (
    <div className="flex h-screen bg-black text-white selection:bg-white/20">
      <aside className="w-64 border-r border-white/10 flex flex-col justify-between bg-black z-10 relative shrink-0">
        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 bg-white flex items-center justify-center font-black text-black font-orbitron rounded-sm">
              OTT
            </div>

            <div>
              <p className="font-orbitron font-bold text-xs tracking-widest uppercase">
                XRPL Terminal
              </p>

              <p className="font-mono text-[8px] text-gray-500 uppercase tracking-widest">
                OnTheTrack / Make Waves MVP
              </p>
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-4 mb-6">
            <p className="font-orbitron text-[10px] uppercase tracking-widest text-white/60 mb-2">
              Terminal Status
            </p>

            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-white/60"></span>

              <p className="font-mono text-xs text-white/70">
                Debug Mode Active
              </p>
            </div>

            <p className="font-mono text-[10px] text-white/35 leading-relaxed break-all">
              Wallet: {walletAddress}
            </p>

            <p className="font-mono text-[10px] text-white/35 leading-relaxed mt-2">
              Make Waves SourceTag: 2606170002
            </p>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left px-4 py-3 rounded font-orbitron text-xs font-bold uppercase tracking-widest transition-all border-l-2 ${
                    isActive
                      ? "bg-white/10 text-white border-white"
                      : "text-gray-500 border-transparent hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span>{item.label}</span>

                    {item.status && (
                      <span
                        className={`font-mono text-[8px] uppercase tracking-widest ${
                          isActive ? "text-white/60" : "text-white/25"
                        }`}
                      >
                        {item.status}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6 space-y-6 border-t border-white/10">
          <div className="bg-gray-950 border border-white/10 rounded-lg p-1 flex relative">
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded shadow transition-all duration-300 ${
                lang === "nl" ? "left-1" : "left-[calc(50%+2px)]"
              }`}
            ></div>

            <button
              onClick={() => setLang("nl")}
              className={`flex-1 relative z-10 text-[10px] font-bold uppercase tracking-widest py-2 rounded transition-colors ${
                lang === "nl"
                  ? "text-black"
                  : "text-gray-500 hover:text-white"
              }`}
            >
              NL
            </button>

            <button
              onClick={() => setLang("en")}
              className={`flex-1 relative z-10 text-[10px] font-bold uppercase tracking-widest py-2 rounded transition-colors ${
                lang === "en"
                  ? "text-black"
                  : "text-gray-500 hover:text-white"
              }`}
            >
              EN
            </button>
          </div>

          <button
            onClick={() => setWalletAddress(null)}
            className="w-full text-left px-4 py-3 text-[10px] font-mono font-bold text-gray-600 uppercase tracking-widest hover:text-white transition-colors"
          >
            {t("menu_logout")}
          </button>
        </div>
      </aside>

      <main className="flex-1 h-screen overflow-y-auto bg-black">
        <div className="border-b border-white/10 px-8 py-5 flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
              XRPL OnTheTrack Terminal
            </p>

            <h1 className="font-orbitron text-xl font-black uppercase tracking-widest">
              The Home Screen of the XRP Ledger
            </h1>
          </div>

          <div className="text-right">
            <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest">
              Make Waves SourceTag
            </p>

            <p className="font-orbitron text-xs text-white/70 uppercase">
              2606170002
            </p>
          </div>
        </div>

        {activeTab === "dashboard" && (
          <DashboardTab walletAddress={walletAddress} />
        )}

        {activeTab === "checkin" && (
          <DailyCheckInTab walletAddress={walletAddress} />
        )}

        {activeTab === "source" && (
          <SourceTagMonitorTab walletAddress={walletAddress} />
        )}

        {activeTab === "xaman" && <XamanCenterTab />}

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
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}
