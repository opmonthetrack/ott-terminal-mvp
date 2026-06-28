import type { ElementType } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Coins,
  Eye,
  Gem,
  Layers,
  LineChart,
  PieChart,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";

type PortfolioTabProps = {
  walletAddress: string;
};

type Asset = {
  symbol: string;
  name: string;
  balance: string;
  value: string;
  change: string;
  trend: "up" | "down";
};

type Allocation = {
  label: string;
  percentage: number;
  value: string;
};

type Signal = {
  title: string;
  value: string;
  status: string;
  icon: ElementType;
};

const assets: Asset[] = [
  {
    symbol: "XRP",
    name: "XRP Ledger Native Asset",
    balance: "589.0000",
    value: "$1,178.00",
    change: "+4.8%",
    trend: "up",
  },
  {
    symbol: "RLUSD",
    name: "Ripple USD",
    balance: "250.00",
    value: "$250.00",
    change: "0.0%",
    trend: "up",
  },
  {
    symbol: "USDC",
    name: "Circle USD",
    balance: "100.00",
    value: "$100.00",
    change: "0.0%",
    trend: "up",
  },
  {
    symbol: "OTT XP",
    name: "Off-chain Reputation Points",
    balance: "130 XP",
    value: "Utility",
    change: "+25 XP",
    trend: "up",
  },
];

const allocations: Allocation[] = [
  {
    label: "XRP",
    percentage: 72,
    value: "$1,178.00",
  },
  {
    label: "Stablecoins",
    percentage: 21,
    value: "$350.00",
  },
  {
    label: "NFT Badges",
    percentage: 4,
    value: "Future",
  },
  {
    label: "OTT XP",
    percentage: 3,
    value: "Utility",
  },
];

const signals: Signal[] = [
  {
    title: "Wallet Health",
    value: "Good",
    status: "Mock",
    icon: ShieldCheck,
  },
  {
    title: "Risk Exposure",
    value: "Low",
    status: "Mock",
    icon: Eye,
  },
  {
    title: "Learning Score",
    value: "130 XP",
    status: "Live",
    icon: Sparkles,
  },
  {
    title: "Make Waves",
    value: "Ready",
    status: "Soon",
    icon: Zap,
  },
];

const futureModules = [
  "Live XRPL balances",
  "Token trustline values",
  "NFT badge portfolio",
  "AMM liquidity positions",
  "LP rewards and impermanent loss",
  "Stablecoin exposure",
  "Wallet reputation score",
  "AI portfolio explanation",
];

function shortAddress(address: string) {
  if (!address) return "Unknown";
  if (address.length <= 18) return address;
  return `${address.slice(0, 9)}...${address.slice(-7)}`;
}

export function PortfolioTab({ walletAddress }: PortfolioTabProps) {
  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 mb-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="flex items-center gap-2 mb-4 text-white/45">
              <PieChart size={17} />
              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                OTT Portfolio Center
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              Portfolio. Risk. Intelligence.
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              De portfolio-laag van de OTT Terminal. Hier komen balances,
              tokenwaarden, stablecoins, NFT badges, AMM-posities, wallet health,
              risico-analyse en AI-uitleg samen.
            </p>
          </div>

          <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-3">
            <StatBox icon={Wallet} label="Wallet" value={shortAddress(walletAddress)} />
            <StatBox icon={Coins} label="Mock Value" value="$1,528" />
            <StatBox icon={TrendingUp} label="Daily Move" value="+4.8%" />
            <StatBox icon={ShieldCheck} label="Risk" value="Low" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {signals.map((signal) => (
              <SignalBox key={signal.title} signal={signal} />
            ))}
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Assets
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  Portfolio Holdings
                </h3>
              </div>

              <BarChart3 size={20} className="text-white/60" />
            </div>

            <div className="space-y-3">
              {assets.map((asset) => (
                <AssetRow key={asset.symbol} asset={asset} />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Performance
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  Mock Portfolio Chart
                </h3>
              </div>

              <LineChart size={20} className="text-white/60" />
            </div>

            <div className="border border-white/10 bg-black p-5">
              <div className="h-52 flex items-end gap-2">
                {[35, 42, 38, 55, 51, 64, 72, 68, 78, 83, 76, 89].map(
                  (height, index) => (
                    <div
                      key={index}
                      className="flex-1 bg-white/20 hover:bg-white/40 transition-all"
                      style={{ height: `${height}%` }}
                    />
                  )
                )}
              </div>

              <div className="flex items-center justify-between mt-4">
                <p className="font-mono text-[10px] text-white/30 uppercase">
                  12 Month Mock View
                </p>

                <p className="font-mono text-[10px] text-white/45 uppercase">
                  Demo Data
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-4 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Target size={18} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                Allocation
              </p>
            </div>

            <div className="space-y-4">
              {allocations.map((item) => (
                <AllocationRow key={item.label} item={item} />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Activity size={18} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                AI Portfolio Notes
              </p>
            </div>

            <p className="font-mono text-xs text-white/45 leading-relaxed mb-5">
              Later kan AI jouw portfolio uitleggen in gewone taal. Niet als
              financieel advies, maar als educatieve analyse van balans,
              concentratie, stablecoin exposure, trustlines en risico.
            </p>

            <div className="space-y-3">
              <NoteLine label="Explain my portfolio" />
              <NoteLine label="Show concentration risk" />
              <NoteLine label="Compare stablecoin exposure" />
              <NoteLine label="Summarize wallet activity" />
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <RefreshCw size={18} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                Future Modules
              </p>
            </div>

            <div className="space-y-3">
              {futureModules.map((item) => (
                <FutureLine key={item} label={item} />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <FeatureBox icon={Gem} title="NFT Badges" text="Portfolio identity" />
          <FeatureBox icon={Layers} title="AMM Positions" text="LP data later" />
          <FeatureBox icon={TrendingDown} title="Risk Alerts" text="Warnings" />
          <FeatureBox icon={ArrowUpRight} title="Explorer Links" text="External data" />
        </div>
      </div>
    </div>
  );
}

function StatBox({
  icon: Icon,
  label,
  value,
}: {
  icon: ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="border border-white/10 bg-black/60 p-4">
      <Icon size={18} className="text-white/60 mb-3" />

      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
        {label}
      </p>

      <p className="font-orbitron text-lg font-black uppercase">{value}</p>
    </div>
  );
}

function SignalBox({ signal }: { signal: Signal }) {
  const Icon = signal.icon;

  return (
    <div className="border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-start justify-between mb-4">
        <Icon size={18} className="text-white/60" />

        <p className="font-mono text-[10px] uppercase text-white/35">
          {signal.status}
        </p>
      </div>

      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
        {signal.title}
      </p>

      <p className="font-orbitron text-lg font-black uppercase">
        {signal.value}
      </p>
    </div>
  );
}

function AssetRow({ asset }: { asset: Asset }) {
  const isUp = asset.trend === "up";

  return (
    <div className="border border-white/10 bg-black p-4 hover:bg-white/[0.03] transition-all">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-orbitron text-sm font-bold uppercase mb-1">
            {asset.symbol}
          </p>

          <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest">
            {asset.name}
          </p>
        </div>

        <div className="text-right">
          <p className="font-orbitron text-sm font-black uppercase mb-1">
            {asset.balance}
          </p>

          <p className="font-mono text-[10px] text-white/35 uppercase">
            {asset.value}
          </p>
        </div>

        <div className="text-right min-w-20">
          <div className="flex items-center justify-end gap-1 text-white/45">
            {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <p className="font-mono text-[10px] uppercase">{asset.change}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AllocationRow({ item }: { item: Allocation }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="font-mono text-xs text-white/55 uppercase">{item.label}</p>
        <p className="font-mono text-[10px] text-white/35">{item.value}</p>
      </div>

      <div className="h-2 bg-white/10 overflow-hidden">
        <div
          className="h-full bg-white transition-all"
          style={{ width: `${Math.max(0, Math.min(item.percentage, 100))}%` }}
        />
      </div>

      <p className="font-mono text-[10px] text-white/25 mt-2">
        {item.percentage}%
      </p>
    </div>
  );
}

function NoteLine({ label }: { label: string }) {
  return (
    <div className="border border-white/10 bg-black p-3 flex items-center gap-2">
      <Sparkles size={14} className="text-white/60" />
      <p className="font-mono text-xs text-white/50">{label}</p>
    </div>
  );
}

function FutureLine({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-white/10 pb-3 last:border-b-0 last:pb-0">
      <Activity size={14} className="text-white/40" />
      <p className="font-mono text-xs text-white/45">{label}</p>
    </div>
  );
}

function FeatureBox({
  icon: Icon,
  title,
  text,
}: {
  icon: ElementType;
  title: string;
  text: string;
}) {
  return (
    <div className="border border-white/10 bg-white/[0.02] p-5">
      <Icon size={19} className="text-white/60 mb-4" />

      <p className="font-orbitron text-sm font-bold uppercase mb-2">{title}</p>

      <p className="font-mono text-xs text-white/40">{text}</p>
    </div>
  );
}
