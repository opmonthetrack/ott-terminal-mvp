import { useState } from "react";
import { LoginScreen } from "./components/LoginScreen";
import { DashboardTab } from "./tabs/DashboardTab";
import { DeFiTab } from "./tabs/DeFiTab";
import { LedgerIntelTab } from "./tabs/LedgerIntelTab";
import { LanguageProvider, useLanguage } from "./LanguageContext";

type ActiveTab = "dashboard" | "defi" | "academy" | "intel";

function MainApp() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");

  const { lang, setLang, t } = useLanguage();

  if (!walletAddress) {
    return <LoginScreen onLoginSuccess={setWalletAddress} />;
  }

  const menuItems: { id: ActiveTab; label: string; status?: string }[] = [
    {
      id: "dashboard",
      label: t("menu_dashboard"),
      status: "Live",
    },
    {
      id: "defi",
      label: t("menu_defi"),
      status: "MVP",
    },
    {
      id: "academy",
      label: t("menu_academy"),
      status: "Soon",
    },
    {
      id: "intel",
      label: t("menu_intel"),
      status: "Beta",
    },
  ];

  return (
    <div className="flex min-h-screen bg-black text-white selection:bg-white/20">
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-white/10 flex flex-col justify-between bg-black z-10 relative">
        <div className="p-6">
          {/* BRAND */}
          <div className="flex items-center gap-3 mb-10">
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

          {/* STATUS BLOCK */}
          <div className="border border-white/10 bg-white/[0.02] p-4 mb-8">
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
          </div>

          {/* NAVIGATION */}
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

        <div className="p-6 space-y-6">
          {/* LANGUAGE SWITCH */}
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

      {/* MAIN CONTENT AREA */}
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
              Build Phase
            </p>
            <p className="font-orbitron text-xs text-white/70 uppercase">
              Dashboard MVP
            </p>
          </div>
        </div>

        {activeTab === "dashboard" && (
          <DashboardTab walletAddress={walletAddress} />
        )}

        {activeTab === "defi" && <DeFiTab />}

        {activeTab === "intel" && <LedgerIntelTab />}

        {activeTab === "academy" && (
          <div className="p-8">
            <div className="border border-white/10 bg-white/[0.02] p-8 text-center">
              <p className="font-mono text-xs text-white/35 uppercase tracking-[0.35em] mb-4">
                Coming Soon
              </p>

              <h2 className="font-orbitron text-2xl font-black uppercase mb-4">
                OTT Academy Module
              </h2>

              <p className="font-mono text-sm text-white/45 max-w-xl mx-auto leading-relaxed">
                Hier komt straks de leeromgeving voor XRPL, Xaman, wallets,
                security, DeFi, AMM, NFT's en onboarding voor nieuwe gebruikers.
              </p>
            </div>
          </div>
        )}
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
