import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownLeft,
  BarChart3,
  Bot,
  CheckCircle2,
  Clock,
  History,
  Loader2,
  Lock,
  Radio,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Terminal,
  TrendingUp,
  Wallet,
  Waves,
} from "lucide-react";

type BalanceData = {
  total: string;
  liquid: string;
  locked: string;
};

type DashboardTabProps = {
  walletAddress: string;
};

function shortAddress(address: string) {
  if (!address) return "Unknown";
  if (address.length <= 16) return address;
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

export function DashboardTab({ walletAddress }: DashboardTabProps) {
  const [balanceData, setBalanceData] = useState<BalanceData>({
    total: "0.0000",
    liquid: "0.0000",
    locked: "0.0000",
  });

  const [loading, setLoading] = useState(true);

  const isDebugWallet = walletAddress.includes("DEBUG");

  useEffect(() => {
    const fetchWalletData = async () => {
      setLoading(true);

      try {
        if (isDebugWallet) {
          setBalanceData({
            total: "589.0000",
            liquid: "579.0000",
            locked: "10.0000",
          });

          setLoading(false);
          return;
        }

        const infoRes = await fetch("https://s1.ripple.com:51234/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            method: "account_info",
            params: [
              {
                account: walletAddress,
                ledger_index: "validated",
              },
            ],
          }),
        });

        const infoData = await infoRes.json();

        if (infoData.result?.account_data) {
          const total =
            parseFloat(infoData.result.account_data.Balance) / 1000000;

          const locked = 10;
          const liquid = Math.max(total - locked, 0);

          setBalanceData({
            total: total.toFixed(4),
            liquid: liquid.toFixed(4),
            locked: locked.toFixed(4),
          });
        }
      } catch (error) {
        console.error("Wallet fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, [walletAddress, isDebugWallet]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto w-10 h-10 mb-4 text-white/70" />
          <p className="font-orbitron text-xs uppercase tracking-[0.35em] text-white/40">
            Loading XRPL Terminal
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      {/* TOP HERO */}
      <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 mb-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]"></div>

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-7">
            <div className="flex items-center gap-2 mb-4 text-white/45">
              <Terminal size={16} />
              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                XRPL OnTheTrack Terminal
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase leading-tight mb-4">
              The Home Screen
              <br />
              of the XRP Ledger
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-2xl leading-relaxed">
              Een premium command center voor wallet inzicht, XRPL intelligence,
              AI briefing, risk scanning en Make Waves user activation.
            </p>
          </div>

          <div className="col-span-12 xl:col-span-5 grid grid-cols-2 gap-3">
            <div className="border border-white/10 bg-black/60 p-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/35 mb-2">
                Network
              </p>
              <div className="flex items-center gap-2">
                <Radio size={16} className="text-white/70" />
                <p className="font-orbitron text-sm uppercase">XRPL Mainnet</p>
              </div>
            </div>

            <div className="border border-white/10 bg-black/60 p-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/35 mb-2">
                Mode
              </p>
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-white/70" />
                <p className="font-orbitron text-sm uppercase">
                  {isDebugWallet ? "Debug" : "Live"}
                </p>
              </div>
            </div>

            <div className="col-span-2 border border-white/10 bg-black/60 p-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/35 mb-2">
                Connected Wallet
              </p>
              <p className="font-mono text-xs text-white/70 break-all">
                {shortAddress(walletAddress)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-12 gap-4">
        {/* LEFT COLUMN */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          <div className="border border-white/10 bg-white/[0.04] p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
                  Total Balance
                </p>
                <h1 className="font-orbitron text-3xl font-black">
                  {balanceData.total}
                </h1>
                <p className="font-mono text-xs text-white/45 mt-1">XRP</p>
              </div>

              <div className="w-12 h-12 border border-white/10 flex items-center justify-center">
                <Wallet size={22} className="text-white/70" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <button className="flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-200 py-3 text-xs font-orbitron font-black uppercase transition-all">
                <ArrowDownLeft size={15} />
                Receive
              </button>

              <button className="flex items-center justify-center gap-2 border border-white/15 hover:bg-white/10 py-3 text-xs font-orbitron font-black uppercase transition-all">
                <Send size={15} />
                Send
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
              <div>
                <p className="font-mono text-[10px] text-white/30 uppercase mb-1">
                  Liquid
                </p>
                <p className="font-mono text-xs text-white/70">
                  {balanceData.liquid}
                </p>
              </div>

              <div>
                <p className="font-mono text-[10px] text-white/30 uppercase mb-1">
                  Locked
                </p>
                <p className="font-mono text-xs text-white/70">
                  {balanceData.locked}
                </p>
              </div>
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Waves size={16} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                Make Waves
              </p>
            </div>

            <p className="font-mono text-xs text-white/45 leading-relaxed mb-5">
              Daily Check-In wordt straks de eerste echte mainnet actie met jouw
              XRPL Commons source tag.
            </p>

            <button className="w-full border border-white/15 py-3 font-orbitron text-xs uppercase tracking-widest text-white/40 cursor-not-allowed">
              Check-In Coming Soon
            </button>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-5">
            <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-4">
              Wallet Health
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/50">Reserve</span>
                <span className="text-white/80">OK</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-white/50">Trustlines</span>
                <span className="text-white/80">Scanning Soon</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-white/50">Risk Tokens</span>
                <span className="text-white/80">0 Found</span>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN */}
        <div className="col-span-12 lg:col-span-6 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
                  Daily AI Briefing
                </p>
                <h3 className="font-orbitron text-xl font-black uppercase">
                  Today on XRPL
                </h3>
              </div>

              <div className="w-10 h-10 border border-white/10 flex items-center justify-center">
                <Bot size={20} className="text-white/70" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="border border-white/10 bg-black/50 p-4 flex gap-3">
                <Sparkles size={18} className="text-white/60 mt-0.5" />
                <div>
                  <p className="font-orbitron text-xs uppercase mb-1">
                    Terminal Insight
                  </p>
                  <p className="font-mono text-xs text-white/45 leading-relaxed">
                    De terminal is klaar voor dashboardontwikkeling. De volgende
                    grote stap is de Daily Check-In transactie via Xaman.
                  </p>
                </div>
              </div>

              <div className="border border-white/10 bg-black/50 p-4 flex gap-3">
                <TrendingUp size={18} className="text-white/60 mt-0.5" />
                <div>
                  <p className="font-orbitron text-xs uppercase mb-1">
                    User Activation
                  </p>
                  <p className="font-mono text-xs text-white/45 leading-relaxed">
                    Focus voor Make Waves: gebruikers moeten een reden krijgen om
                    dagelijks terug te komen.
                  </p>
                </div>
              </div>

              <div className="border border-white/10 bg-black/50 p-4 flex gap-3">
                <AlertTriangle size={18} className="text-white/60 mt-0.5" />
                <div>
                  <p className="font-orbitron text-xs uppercase mb-1">
                    Risk Scanner
                  </p>
                  <p className="font-mono text-xs text-white/45 leading-relaxed">
                    Binnenkort: wallet-risico, verdachte tokens, NFT-checks en
                    trustline alerts.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
                  Assets
                </p>
                <h3 className="font-orbitron text-lg font-black uppercase">
                  Portfolio Overview
                </h3>
              </div>

              <div className="flex gap-2">
                <button className="px-3 py-2 bg-white text-black font-mono text-[10px] uppercase">
                  Tokens
                </button>
                <button className="px-3 py-2 border border-white/10 text-white/40 font-mono text-[10px] uppercase">
                  LPs
                </button>
                <button className="px-3 py-2 border border-white/10 text-white/40 font-mono text-[10px] uppercase">
                  NFTs
                </button>
              </div>
            </div>

            <div className="relative mb-5">
              <Search
                className="absolute left-3 top-3 text-white/30"
                size={16}
              />
              <input
                className="w-full bg-black border border-white/10 py-3 pl-10 pr-4 text-sm font-mono outline-none focus:border-white/30"
                placeholder="Search assets..."
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 border border-white/10 bg-white text-black flex items-center justify-center font-orbitron font-black text-xs">
                    X
                  </div>

                  <div>
                    <p className="text-sm font-bold">XRP</p>
                    <p className="font-mono text-[10px] text-white/35">
                      Native XRP Ledger asset
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-mono">{balanceData.total}</p>
                  <p className="font-mono text-[10px] text-white/35">XRP</p>
                </div>
              </div>

              <div className="flex justify-between items-center py-4 border-b border-white/10 opacity-60">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 border border-white/10 flex items-center justify-center">
                    <Lock size={15} />
                  </div>

                  <div>
                    <p className="text-sm font-bold">RLUSD</p>
                    <p className="font-mono text-[10px] text-white/35">
                      Stablecoin module coming soon
                    </p>
                  </div>
                </div>

                <p className="font-mono text-xs text-white/35">Soon</p>
              </div>

              <div className="flex justify-between items-center py-4 opacity-60">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 border border-white/10 flex items-center justify-center">
                    <Activity size={15} />
                  </div>

                  <div>
                    <p className="text-sm font-bold">AMM / LP</p>
                    <p className="font-mono text-[10px] text-white/35">
                      Liquidity module coming soon
                    </p>
                  </div>
                </div>

                <p className="font-mono text-xs text-white/35">Soon</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex gap-4 mb-6 border-b border-white/10 pb-4">
              <button className="flex items-center gap-2 text-sm font-bold">
                <History size={16} />
                History
              </button>

              <button className="flex items-center gap-2 text-sm text-white/35">
                <BarChart3 size={16} />
                Stats
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-start text-xs border-b border-white/10 pb-3">
                <div>
                  <p className="font-bold">Debug Login</p>
                  <p className="text-[10px] text-white/35 font-mono">
                    Terminal opened
                  </p>
                </div>

                <p className="text-white/60">Active</p>
              </div>

              <div className="flex justify-between items-start text-xs border-b border-white/10 pb-3">
                <div>
                  <p className="font-bold">Wallet Scan</p>
                  <p className="text-[10px] text-white/35 font-mono">
                    Balance loaded
                  </p>
                </div>

                <p className="text-white/60">OK</p>
              </div>

              <div className="flex justify-between items-start text-xs">
                <div>
                  <p className="font-bold">Source Tag</p>
                  <p className="text-[10px] text-white/35 font-mono">
                    Waiting for transaction module
                  </p>
                </div>

                <p className="text-white/35">Soon</p>
              </div>
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Clock size={16} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                Roadmap
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <CheckCircle2 size={17} className="text-white/70 mt-0.5" />
                <div>
                  <p className="font-mono text-xs text-white/70">
                    Debug terminal live
                  </p>
                  <p className="font-mono text-[10px] text-white/30">
                    UI build phase
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Clock size={17} className="text-white/40 mt-0.5" />
                <div>
                  <p className="font-mono text-xs text-white/60">
                    Xaman login restore
                  </p>
                  <p className="font-mono text-[10px] text-white/30">
                    Secure server flow
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Clock size={17} className="text-white/40 mt-0.5" />
                <div>
                  <p className="font-mono text-xs text-white/60">
                    Daily Check-In
                  </p>
                  <p className="font-mono text-[10px] text-white/30">
                    Mainnet source tag
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Clock size={17} className="text-white/40 mt-0.5" />
                <div>
                  <p className="font-mono text-xs text-white/60">
                    AI intelligence layer
                  </p>
                  <p className="font-mono text-[10px] text-white/30">
                    Briefings and alerts
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-3">
              OTT Signal
            </p>

            <p className="font-orbitron text-lg font-black uppercase mb-3">
              589 Steps Ahead
            </p>

            <p className="font-mono text-xs text-white/45 leading-relaxed">
              Stay focused, stay aware, stay on the track with Truth.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
