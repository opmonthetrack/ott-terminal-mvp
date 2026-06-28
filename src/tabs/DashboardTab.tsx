import { useEffect, useState } from "react";
import {
  Activity,
  ArrowDownLeft,
  BarChart3,
  Eye,
  ExternalLink,
  Loader2,
  Radio,
  Send,
  ShieldCheck,
  Terminal,
  Wallet,
  Zap,
} from "lucide-react";
import { OTTProfileCard } from "../components/OTTProfileCard";
import { MarketOverview } from "../components/dashboard/MarketOverview";
import { NewsWidget } from "../components/dashboard/NewsWidget";
import { StablecoinTracker } from "../components/dashboard/StablecoinTracker";
import { CBDCTracker } from "../components/dashboard/CBDCTracker";
import { ISO20022Tracker } from "../components/dashboard/ISO20022Tracker";
import { SwiftTracker } from "../components/dashboard/SwiftTracker";
import { FedwireTracker } from "../components/dashboard/FedwireTracker";
import { MBridgeTracker } from "../components/dashboard/MBridgeTracker";
import { AIHubWidget } from "../components/dashboard/AIHubWidget";
import { LearnEarnWidget } from "../components/dashboard/LearnEarnWidget";
import { OTTUniverseWidget } from "../components/dashboard/OTTUniverseWidget";
import { RewardCenterWidget } from "../components/dashboard/RewardCenterWidget";

type DashboardTabProps = {
  walletAddress: string;
};

type StatCardProps = {
  label: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
};

function shortAddress(address: string) {
  if (!address) return "Unknown";
  if (address.length <= 16) return address;
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

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
            <StatCard
              icon={Radio}
              label="Network"
              value="XRPL Mainnet"
              subtitle="Live ledger focus"
            />
            <StatCard
              icon={ShieldCheck}
              label="Mode"
              value={isDebugWallet ? "Debug" : "Live"}
              subtitle="Safe build mode"
            />
            <StatCard
              icon={Wallet}
              label="Wallet"
              value={shortAddress(walletAddress)}
              subtitle="Connected identity"
            />
            <StatCard
              icon={Zap}
              label="Build Phase"
              value="Platform"
              subtitle="Widgets connected"
            />
          </div>
        </div>
      </div>

      <OTTProfileCard walletAddress={walletAddress} />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-3 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Wallet size={18} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                Wallet Overview
              </p>
            </div>

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

          <RewardCenterWidget />
        </div>

        <div className="col-span-12 xl:col-span-6 space-y-4">
          <AIHubWidget />
          <MarketOverview />
          <NewsWidget />
          <LearnEarnWidget />
        </div>

        <div className="col-span-12 xl:col-span-3 space-y-4">
          <StablecoinTracker />
          <CBDCTracker />
        </div>

        <div className="col-span-12 grid grid-cols-1 xl:grid-cols-2 gap-4">
          <ISO20022Tracker />
          <SwiftTracker />
          <FedwireTracker />
          <MBridgeTracker />
        </div>

        <div className="col-span-12">
          <OTTUniverseWidget />
        </div>

        <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <DashboardModule
            icon={Activity}
            title="Network Health"
            value="Validator data later"
          />
          <DashboardModule
            icon={BarChart3}
            title="Portfolio Analytics"
            value="Coming soon"
          />
          <DashboardModule
            icon={Eye}
            title="Risk Scanner"
            value="Trustline alerts"
          />
          <DashboardModule
            icon={ExternalLink}
            title="Explorer Links"
            value="Bithomp / XRPL.org"
          />
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
