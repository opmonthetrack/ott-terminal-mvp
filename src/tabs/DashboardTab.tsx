import { useEffect, useState } from "react";
import {
  Activity,
  ArrowDownLeft,
  BarChart3,
  Bot,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  Gem,
  GraduationCap,
  Landmark,
  Layers,
  Loader2,
  Newspaper,
  Radio,
  Search,
  Send,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Target,
  Terminal,
  TrendingUp,
  Wallet,
  Waves,
  Zap,
} from "lucide-react";
import { OTTProfileCard } from "../components/OTTProfileCard";

type DashboardTabProps = {
  walletAddress: string;
};

type StatCardProps = {
  label: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
};

type FeedItem = {
  title: string;
  category: string;
  status: string;
};

function shortAddress(address: string) {
  if (!address) return "Unknown";
  if (address.length <= 16) return address;
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

const intelFeed: FeedItem[] = [
  { title: "XRPL AI Starter Kit", category: "AI / Agentic Payments", status: "Watch" },
  { title: "X402 Protocol", category: "AI Payments", status: "Research" },
  { title: "RLUSD Liquidity", category: "Stablecoins", status: "Priority" },
  { title: "mBridge / SWIFT / Fedwire", category: "Macro Rails", status: "Daily" },
  { title: "XLS Roadmap", category: "XRPL Standards", status: "Build" },
];

export function DashboardTab({ walletAddress }: DashboardTabProps) {
  const [loading, setLoading] = useState(true);

  const isDebugWallet = walletAddress.includes("DEBUG");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto w-10 h-10 mb-4 text-white/70" />
          <p className="font-orbitron text-xs uppercase tracking-[0.35em] text-white/40">
            Loading XRPL OTT Terminal
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 mb-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-7">
            <div className="flex items-center gap-2 mb-4 text-white/45">
              <Terminal size={16} />
              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                XRPL OnTheTrack Terminal
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase leading-tight mb-4">
              Your XRPL Command Center
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              Wallet, intelligence, AI, Academy, rewards, marketplace,
              stablecoins, CBDC, ISO 20022 en Make Waves activatie in één
              terminal.
            </p>
          </div>

          <div className="col-span-12 xl:col-span-5 grid grid-cols-2 gap-3">
            <StatCard icon={Radio} label="Network" value="XRPL Mainnet" subtitle="Live ledger focus" />
            <StatCard icon={ShieldCheck} label="Mode" value={isDebugWallet ? "Debug" : "Live"} subtitle="Safe build mode" />
            <StatCard icon={Wallet} label="Wallet" value={shortAddress(walletAddress)} subtitle="Connected identity" />
            <StatCard icon={Zap} label="Build Phase" value="Identity" subtitle="XP + Profile system" />
          </div>
        </div>
      </div>

      <OTTProfileCard walletAddress={walletAddress} />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-3 space-y-4">
          <PanelTitle icon={Wallet} title="Wallet Overview" subtitle="Core account layer" />

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
              Mock Balance
            </p>

            <h3 className="font-orbitron text-3xl font-black mb-1">589.0000</h3>
            <p className="font-mono text-xs text-white/40 mb-6">XRP</p>

            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center justify-center gap-2 bg-white text-black py-3 font-orbitron text-xs font-black uppercase">
                <ArrowDownLeft size={15} />
                Receive
              </button>

              <button className="flex items-center justify-center gap-2 border border-white/15 py-3 font-orbitron text-xs font-black uppercase text-white/70">
                <Send size={15} />
                Send
              </button>
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
              Daily Check-In wordt straks de eerste source-tagged mainnet actie.
            </p>

            <button className="w-full border border-white/15 py-3 font-orbitron text-xs uppercase tracking-widest text-white/40">
              Check-In Soon
            </button>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-6 space-y-4">
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

              <Bot size={24} className="text-white/60" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <MiniBrief icon={Sparkles} title="AI Hub" text="XRPL AI Starter Kit, MCP en X402 komen in een aparte AI-module." />
              <MiniBrief icon={GraduationCap} title="Academy" text="Learn & Earn wordt de grootste reden voor dagelijkse terugkeer." />
              <MiniBrief icon={ShoppingBag} title="Marketplace" text="Merch, NFT badges, courses en payments met XRP/RLUSD later." />
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
                  Intelligence Watchlist
                </p>
                <h3 className="font-orbitron text-lg font-black uppercase">
                  What users should follow
                </h3>
              </div>

              <Search size={18} className="text-white/35" />
            </div>

            <div className="space-y-3">
              {intelFeed.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between border border-white/10 bg-black p-4 hover:bg-white/[0.03] transition-all"
                >
                  <div>
                    <p className="font-orbitron text-xs font-bold uppercase mb-1">
                      {item.title}
                    </p>
                    <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest">
                      {item.category}
                    </p>
                  </div>

                  <p className="font-mono text-[10px] text-white/45 uppercase">
                    {item.status}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DashboardModule icon={Landmark} title="Stablecoins" value="RLUSD / USDC" />
            <DashboardModule icon={Layers} title="Rails" value="SWIFT / mBridge" />
            <DashboardModule icon={Gem} title="NFT Badges" value="Coming Soon" />
          </div>
        </div>

        <div className="col-span-12 xl:col-span-3 space-y-4">
          <PanelTitle icon={Target} title="Mission Center" subtitle="Daily retention loop" />

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="space-y-4">
              <MissionLine label="Daily Login" status="Done" />
              <MissionLine label="Read 3 Intel Items" status="+10 XP" />
              <MissionLine label="Finish Lesson" status="+25 XP" />
              <MissionLine label="Daily Check-In" status="Soon" />
              <MissionLine label="Quiz" status="+20 XP" />
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Newspaper size={16} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                Next Modules
              </p>
            </div>

            <div className="space-y-3">
              <NextModule label="Academy Tab Upgrade" />
              <NextModule label="AI Hub" />
              <NextModule label="OTT Universe Map" />
              <NextModule label="Marketplace" />
              <NextModule label="Leaderboard" />
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

        <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <DashboardModule icon={Activity} title="Network Health" value="Validator data later" />
          <DashboardModule icon={BarChart3} title="Portfolio Analytics" value="Coming soon" />
          <DashboardModule icon={Eye} title="Risk Scanner" value="Trustline alerts" />
          <DashboardModule icon={ExternalLink} title="Explorer Links" value="Bithomp / XRPL.org" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, subtitle, icon: Icon }: StatCardProps) {
  return (
    <div className="border border-white/10 bg-black/60 p-4">
      <div className="flex items-center gap-2 mb-2 text-white/50">
        <Icon size={15} />
        <p className="font-mono text-[10px] uppercase tracking-widest">
          {label}
        </p>
      </div>
      <p className="font-orbitron text-sm font-black uppercase">{value}</p>
      <p className="font-mono text-[10px] text-white/30 mt-1">{subtitle}</p>
    </div>
  );
}

function PanelTitle({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className="text-white/60" />
        <p className="font-orbitron text-xs uppercase tracking-widest">
          {title}
        </p>
      </div>
      <p className="font-mono text-xs text-white/35">{subtitle}</p>
    </div>
  );
}

function MiniBrief({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ElementType;
  title: string;
  text: string;
}) {
  return (
    <div className="border border-white/10 bg-black p-4">
      <Icon size={18} className="text-white/60 mb-3" />
      <p className="font-orbitron text-xs uppercase mb-2">{title}</p>
      <p className="font-mono text-xs text-white/40 leading-relaxed">{text}</p>
    </div>
  );
}

function DashboardModule({
  icon: Icon,
  title,
  value,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
}) {
  return (
    <div className="border border-white/10 bg-white/[0.02] p-5">
      <Icon size={19} className="text-white/60 mb-4" />
      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
        {title}
      </p>
      <p className="font-orbitron text-sm font-black uppercase">{value}</p>
    </div>
  );
}

function MissionLine({ label, status }: { label: string; status: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 pb-3 last:border-b-0 last:pb-0">
      <div className="flex items-center gap-2">
        <CheckCircle2 size={15} className="text-white/50" />
        <p className="font-mono text-xs text-white/55">{label}</p>
      </div>

      <p className="font-mono text-[10px] text-white/35 uppercase">{status}</p>
    </div>
  );
}

function NextModule({ label }: { label: string }) {
  return (
    <div className="border border-white/10 bg-black p-3">
      <p className="font-mono text-xs text-white/45">{label}</p>
    </div>
  );
}
