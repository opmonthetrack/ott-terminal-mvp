import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Cpu,
  ExternalLink,
  Image as ImageIcon,
  Landmark,
  Link,
  Lock,
  Network,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Waves,
} from "lucide-react";

type ActiveSubTab = "amm_pulse" | "nft_forge" | "token_factory" | "yield_matrix";

export function DeFiTab() {
  const [activeSubTab, setActiveSubTab] = useState<ActiveSubTab>("amm_pulse");

  const subTabs: {
    id: ActiveSubTab;
    label: string;
    icon: React.ElementType;
    status: string;
  }[] = [
    {
      id: "amm_pulse",
      label: "AMM Pulse",
      icon: Activity,
      status: "MVP",
    },
    {
      id: "nft_forge",
      label: "NFT Forge",
      icon: ImageIcon,
      status: "Soon",
    },
    {
      id: "token_factory",
      label: "Token Factory",
      icon: Link,
      status: "Locked",
    },
    {
      id: "yield_matrix",
      label: "Yield Matrix",
      icon: Landmark,
      status: "Soon",
    },
  ];

  return (
    <div className="p-6 bg-black text-white min-h-screen">
      {/* HEADER */}
      <div className="border border-white/10 bg-white/[0.02] p-6 mb-6">
        <div className="flex items-center gap-2 mb-4 text-white/45">
          <Network size={16} />
          <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
            XRPL DeFi Command Center
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 xl:col-span-8">
            <h2 className="font-orbitron text-3xl font-black uppercase mb-4">
              DeFi Intelligence
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              Hier komt straks alles samen rondom XRPL AMM, DEX, LP-posities,
              token opportunities, NFT assets en yield kansen binnen de
              OnTheTrack Terminal.
            </p>
          </div>

          <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-3">
            <div className="border border-white/10 bg-black p-4">
              <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
                Mode
              </p>
              <p className="font-orbitron text-xs uppercase">Safe Preview</p>
            </div>

            <div className="border border-white/10 bg-black p-4">
              <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
                Transactions
              </p>
              <p className="font-orbitron text-xs uppercase">Disabled</p>
            </div>
          </div>
        </div>
      </div>

      {/* SUB NAV */}
      <div className="border border-white/10 bg-white/[0.02] p-2 mb-6 grid grid-cols-2 xl:grid-cols-4 gap-2">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`p-4 text-left border transition-all ${
                isActive
                  ? "bg-white text-black border-white"
                  : "bg-black border-white/10 text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <Icon size={18} />
                <span className="font-mono text-[9px] uppercase tracking-widest">
                  {tab.status}
                </span>
              </div>

              <p className="font-orbitron text-xs font-black uppercase tracking-widest">
                {tab.label}
              </p>
            </button>
          );
        })}
      </div>

      {/* AMM PULSE */}
      {activeSubTab === "amm_pulse" && (
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-8 space-y-4">
            <div className="border border-white/10 bg-white/[0.02] p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
                    AMM Market Pulse
                  </p>
                  <h3 className="font-orbitron text-xl font-black uppercase">
                    XRPL Liquidity Overview
                  </h3>
                </div>

                <div className="w-10 h-10 border border-white/10 flex items-center justify-center">
                  <BarChart3 size={20} className="text-white/70" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                <div className="border border-white/10 bg-black p-4">
                  <p className="font-mono text-[10px] text-white/35 uppercase mb-2">
                    Tracked Pools
                  </p>
                  <p className="font-orbitron text-2xl font-black">Soon</p>
                </div>

                <div className="border border-white/10 bg-black p-4">
                  <p className="font-mono text-[10px] text-white/35 uppercase mb-2">
                    Yield Signals
                  </p>
                  <p className="font-orbitron text-2xl font-black">0</p>
                </div>

                <div className="border border-white/10 bg-black p-4">
                  <p className="font-mono text-[10px] text-white/35 uppercase mb-2">
                    Risk Alerts
                  </p>
                  <p className="font-orbitron text-2xl font-black">0</p>
                </div>
              </div>

              <div className="relative mb-5">
                <Search
                  className="absolute left-3 top-3 text-white/30"
                  size={16}
                />
                <input
                  className="w-full bg-black border border-white/10 py-3 pl-10 pr-4 text-sm font-mono outline-none focus:border-white/30"
                  placeholder="Search AMM pools, assets or issuers..."
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between border border-white/10 bg-black p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white text-black flex items-center justify-center font-orbitron font-black text-xs">
                      X
                    </div>

                    <div>
                      <p className="font-bold text-sm">XRP / RLUSD</p>
                      <p className="font-mono text-[10px] text-white/35">
                        Stable liquidity pool placeholder
                      </p>
                    </div>
                  </div>

                  <p className="font-mono text-xs text-white/40">Coming Soon</p>
                </div>

                <div className="flex items-center justify-between border border-white/10 bg-black p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 border border-white/10 flex items-center justify-center">
                      <TrendingUp size={16} />
                    </div>

                    <div>
                      <p className="font-bold text-sm">Top Yield Pools</p>
                      <p className="font-mono text-[10px] text-white/35">
                        Future ranking by volume, liquidity and risk
                      </p>
                    </div>
                  </div>

                  <p className="font-mono text-xs text-white/40">Soon</p>
                </div>

                <div className="flex items-center justify-between border border-white/10 bg-black p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 border border-white/10 flex items-center justify-center">
                      <ShieldCheck size={16} />
                    </div>

                    <div>
                      <p className="font-bold text-sm">Pool Risk Scanner</p>
                      <p className="font-mono text-[10px] text-white/35">
                        Future scan for thin liquidity and suspicious issuers
                      </p>
                    </div>
                  </div>

                  <p className="font-mono text-xs text-white/40">Soon</p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-12 xl:col-span-4 space-y-4">
            <div className="border border-white/10 bg-white/[0.02] p-6">
              <div className="flex items-center gap-2 mb-5">
                <Sparkles size={17} className="text-white/60" />
                <p className="font-orbitron text-xs uppercase tracking-widest">
                  AI DeFi Brief
                </p>
              </div>

              <p className="font-mono text-xs text-white/45 leading-relaxed mb-4">
                Deze module wordt straks de plek waar gebruikers in normale taal
                begrijpen welke XRPL DeFi kansen interessant of juist risicovol
                zijn.
              </p>

              <div className="border border-white/10 bg-black p-4">
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
                  Next Build Step
                </p>
                <p className="font-mono text-xs text-white/60 leading-relaxed">
                  Eerst maken we de Daily Check-In transactie. Daarna kunnen we
                  echte AMM-data toevoegen.
                </p>
              </div>
            </div>

            <div className="border border-white/10 bg-white/[0.02] p-6">
              <div className="flex items-center gap-2 mb-5">
                <Waves size={17} className="text-white/60" />
                <p className="font-orbitron text-xs uppercase tracking-widest">
                  Make Waves Fit
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <CheckCircle2 size={16} className="text-white/70 mt-0.5" />
                  <p className="font-mono text-xs text-white/50">
                    User-focused dashboard
                  </p>
                </div>

                <div className="flex gap-3">
                  <CheckCircle2 size={16} className="text-white/70 mt-0.5" />
                  <p className="font-mono text-xs text-white/50">
                    Daily return behavior
                  </p>
                </div>

                <div className="flex gap-3">
                  <CheckCircle2 size={16} className="text-white/70 mt-0.5" />
                  <p className="font-mono text-xs text-white/50">
                    Future source-tagged actions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NFT FORGE */}
      {activeSubTab === "nft_forge" && (
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-7 border border-white/10 bg-white/[0.02] p-8">
            <ImageIcon className="w-14 h-14 mb-6 text-white/70" />

            <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-4">
              NFT Minting Forge
            </p>

            <h3 className="font-orbitron text-2xl font-black uppercase mb-4">
              OTT Asset Minting
            </h3>

            <p className="font-mono text-sm text-white/45 leading-relaxed mb-8">
              Hier komt straks de mint-module voor exclusieve OTT assets. Voor
              nu staat echte minting bewust uit, zodat er geen onveilige
              frontend API keys of test-transacties doorheen gaan.
            </p>

            <button
              disabled
              className="w-full md:w-auto px-8 py-4 border border-white/15 text-white/35 font-orbitron font-black uppercase tracking-widest cursor-not-allowed"
            >
              Minting Disabled
            </button>
          </div>

          <div className="col-span-12 xl:col-span-5 border border-white/10 bg-white/[0.02] p-8">
            <Lock className="w-10 h-10 mb-6 text-white/50" />

            <h4 className="font-orbitron text-lg font-black uppercase mb-4">
              Safety First
            </h4>

            <p className="font-mono text-xs text-white/45 leading-relaxed mb-5">
              Echte Xaman-transacties zetten we pas terug wanneer de login,
              serverless API en source tag flow stabiel zijn.
            </p>

            <div className="space-y-3">
              <div className="border border-white/10 bg-black p-3">
                <p className="font-mono text-xs text-white/60">
                  Geen API secret in frontend
                </p>
              </div>

              <div className="border border-white/10 bg-black p-3">
                <p className="font-mono text-xs text-white/60">
                  Geen mint zonder Xaman approval
                </p>
              </div>

              <div className="border border-white/10 bg-black p-3">
                <p className="font-mono text-xs text-white/60">
                  Geen mainnet actie zonder source tag
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOKEN FACTORY */}
      {activeSubTab === "token_factory" && (
        <div className="border border-white/10 bg-white/[0.02] p-10 text-center">
          <Cpu className="w-14 h-14 mx-auto text-white/35 mb-6" />

          <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-4">
            Token Factory
          </p>

          <h3 className="font-orbitron text-2xl font-black uppercase mb-4">
            Issued Asset Studio
          </h3>

          <p className="font-mono text-sm text-white/45 max-w-2xl mx-auto leading-relaxed mb-8">
            Deze module wordt later gebruikt voor educatie en veilige uitleg
            rondom XRPL issued currencies, trustlines, issuers en token launch
            risico’s.
          </p>

          <div className="inline-flex items-center gap-2 border border-white/10 px-5 py-3 text-white/40 font-mono text-xs uppercase tracking-widest">
            <Lock size={14} />
            Locked Until Core MVP
          </div>
        </div>
      )}

      {/* YIELD MATRIX */}
      {activeSubTab === "yield_matrix" && (
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-8 border border-white/10 bg-white/[0.02] p-8">
            <Landmark className="w-14 h-14 mb-6 text-white/50" />

            <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-4">
              Global Yield Matrix
            </p>

            <h3 className="font-orbitron text-2xl font-black uppercase mb-4">
              Yield, Risk & Liquidity
            </h3>

            <p className="font-mono text-sm text-white/45 leading-relaxed mb-8">
              Straks vergelijkt deze module AMM-kansen, liquiditeit, risico,
              volume en rendement. Eerst bouwen we de betrouwbare basis.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="border border-white/10 bg-black p-4">
                <Rocket size={18} className="mb-3 text-white/50" />
                <p className="font-orbitron text-xs uppercase mb-2">
                  Opportunity
                </p>
                <p className="font-mono text-xs text-white/35">Coming Soon</p>
              </div>

              <div className="border border-white/10 bg-black p-4">
                <AlertTriangle size={18} className="mb-3 text-white/50" />
                <p className="font-orbitron text-xs uppercase mb-2">Risk</p>
                <p className="font-mono text-xs text-white/35">Coming Soon</p>
              </div>

              <div className="border border-white/10 bg-black p-4">
                <ExternalLink size={18} className="mb-3 text-white/50" />
                <p className="font-orbitron text-xs uppercase mb-2">DEX</p>
                <p className="font-mono text-xs text-white/35">Coming Soon</p>
              </div>
            </div>
          </div>

          <div className="col-span-12 xl:col-span-4 border border-white/10 bg-white/[0.02] p-8">
            <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-4">
              Build Order
            </p>

            <div className="space-y-4">
              <div className="border-l border-white/20 pl-4">
                <p className="font-mono text-xs text-white/70">
                  1. Xaman login herstellen
                </p>
              </div>

              <div className="border-l border-white/10 pl-4">
                <p className="font-mono text-xs text-white/50">
                  2. Daily Check-In transactie
                </p>
              </div>

              <div className="border-l border-white/10 pl-4">
                <p className="font-mono text-xs text-white/50">
                  3. Source tag toevoegen
                </p>
              </div>

              <div className="border-l border-white/10 pl-4">
                <p className="font-mono text-xs text-white/50">
                  4. AMM data koppelen
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
