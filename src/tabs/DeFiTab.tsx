import { useState } from "react";
import type { ElementType } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownUp,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Coins,
  Droplets,
  Eye,
  Flame,
  Gauge,
  Landmark,
  Layers,
  Lock,
  PieChart,
  Radio,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";

type DefiModule = {
  id: string;
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

type Pool = {
  pair: string;
  tvl: string;
  apr: string;
  risk: string;
};

type RiskRule = {
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

const defiModules: DefiModule[] = [
  {
    id: "dex",
    title: "XRPL DEX",
    status: "Core",
    text: "Order books, swaps, issued assets en trading routes binnen het XRPL ecosysteem.",
    icon: ArrowDownUp,
  },
  {
    id: "amm",
    title: "AMM Pools",
    status: "DeFi",
    text: "Liquidity pools, LP tokens, fees, impermanent loss en pool health education.",
    icon: Droplets,
  },
  {
    id: "stablecoins",
    title: "Stablecoin Rails",
    status: "Watch",
    text: "RLUSD, USDC, EUR rails, payment flows, liquidity en stablecoin exposure.",
    icon: Landmark,
  },
  {
    id: "yield",
    title: "Yield Tracker",
    status: "Later",
    text: "APY, fees, rewards, LP positions, daily changes en risk warnings.",
    icon: TrendingUp,
  },
  {
    id: "risk",
    title: "Risk Scanner",
    status: "Safety",
    text: "Token issuer warnings, pool risk, slippage, fake tokens en trustline checks.",
    icon: ShieldAlert,
  },
  {
    id: "education",
    title: "DeFi Academy",
    status: "Learn",
    text: "Leer swaps, liquidity, AMM, stablecoins, fees en wallet safety stap voor stap.",
    icon: Sparkles,
  },
];

const pools: Pool[] = [
  {
    pair: "XRP / RLUSD",
    tvl: "$2.4M",
    apr: "4.8%",
    risk: "Low",
  },
  {
    pair: "XRP / USDC",
    tvl: "$1.1M",
    apr: "5.2%",
    risk: "Medium",
  },
  {
    pair: "XRP / EUR",
    tvl: "$860K",
    apr: "3.9%",
    risk: "Medium",
  },
  {
    pair: "XRP / MEME",
    tvl: "$120K",
    apr: "18.4%",
    risk: "High",
  },
];

const riskRules: RiskRule[] = [
  {
    title: "Issuer Check",
    status: "Required",
    text: "Controleer altijd wie de token issuer is voordat je een trustline of swap gebruikt.",
    icon: Eye,
  },
  {
    title: "Slippage Warning",
    status: "Safety",
    text: "Hoge slippage betekent dat je minder krijgt dan verwacht bij een swap.",
    icon: AlertTriangle,
  },
  {
    title: "Impermanent Loss",
    status: "LP Risk",
    text: "Liquidity providers kunnen verlies ervaren door prijsverandering tussen assets.",
    icon: Gauge,
  },
  {
    title: "No Financial Advice",
    status: "Rule",
    text: "Deze terminal geeft educatieve uitleg, geen financieel advies.",
    icon: Lock,
  },
];

const roadmap = [
  "Live XRPL DEX data koppelen",
  "AMM pool explorer bouwen",
  "Swap quote preview maken",
  "Trustline safety waarschuwingen toevoegen",
  "LP position tracker maken",
  "Stablecoin exposure dashboard bouwen",
  "AI DeFi uitleg per wallet toevoegen",
  "Learn & Earn DeFi lessons koppelen",
];

export function DeFiTab() {
  const [selectedModule, setSelectedModule] = useState<DefiModule>(
    defiModules[0]
  );
  const [selectedPool, setSelectedPool] = useState<Pool>(pools[0]);

  const SelectedModuleIcon = selectedModule.icon;

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 mb-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="flex items-center gap-2 mb-4 text-white/45">
              <Droplets size={17} />

              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                XRPL DeFi Center
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              Swaps. AMM. Liquidity. Safety.
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              De DeFi-laag van OTT Terminal. Hier komen XRPL DEX, AMM pools,
              stablecoin rails, risk scanner, LP education en AI uitleg samen.
            </p>
          </div>

          <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-3">
            <StatBox icon={Coins} label="DEX" value="XRPL" />
            <StatBox icon={Droplets} label="AMM" value="Pools" />
            <StatBox icon={ShieldCheck} label="Risk" value="Scanner" />
            <StatBox icon={Radio} label="Mode" value="Mock" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-4 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Layers size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                DeFi Modules
              </p>
            </div>

            <div className="space-y-3">
              {defiModules.map((module) => (
                <ModuleButton
                  key={module.id}
                  module={module}
                  active={selectedModule.id === module.id}
                  onClick={() => setSelectedModule(module)}
                />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Target size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Selected Module
              </p>
            </div>

            <SelectedModuleIcon size={24} className="text-white/60 mb-4" />

            <p className="font-orbitron text-xl font-black uppercase mb-3">
              {selectedModule.title}
            </p>

            <p className="font-mono text-xs text-white/45 leading-relaxed mb-5">
              {selectedModule.text}
            </p>

            <MiniStatus label="Status" value={selectedModule.status} />
          </div>
        </div>

        <div className="col-span-12 xl:col-span-5 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  AMM Pools
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  Liquidity Pool Watchlist
                </h3>
              </div>

              <BarChart3 size={20} className="text-white/60" />
            </div>

            <div className="space-y-3">
              {pools.map((pool) => (
                <PoolRow
                  key={pool.pair}
                  pool={pool}
                  active={selectedPool.pair === pool.pair}
                  onClick={() => setSelectedPool(pool)}
                />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Selected Pool
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  {selectedPool.pair}
                </h3>
              </div>

              <PieChart size={20} className="text-white/60" />
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              <MiniStatus label="TVL" value={selectedPool.tvl} />
              <MiniStatus label="APR" value={selectedPool.apr} />
              <MiniStatus label="Risk" value={selectedPool.risk} />
            </div>

            <div className="border border-white/10 bg-black p-5">
              <p className="font-orbitron text-sm font-bold uppercase mb-3">
                Pool Education
              </p>

              <p className="font-mono text-xs text-white/45 leading-relaxed">
                AMM pools laten gebruikers liquidity toevoegen aan een pair.
                Je verdient mogelijk fees, maar loopt ook risico door
                prijsbeweging, slippage en tokenkwaliteit.
              </p>
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-3 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <ShieldAlert size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Risk Rules
              </p>
            </div>

            <div className="space-y-3">
              {riskRules.map((rule) => (
                <RiskRuleCard key={rule.title} rule={rule} />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Activity size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Roadmap
              </p>
            </div>

            <div className="space-y-3">
              {roadmap.map((item) => (
                <RoadmapLine key={item} label={item} />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <FeatureBox icon={ArrowDownUp} title="Swap" text="Quote preview later" />
          <FeatureBox icon={Droplets} title="AMM" text="Liquidity pools" />
          <FeatureBox icon={Wallet} title="Wallet Risk" text="Trustline checks" />
          <FeatureBox icon={BadgeCheck} title="Learn & Earn" text="DeFi education" />
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

      <p className="font-orbitron text-sm font-black uppercase">{value}</p>
    </div>
  );
}

function ModuleButton({
  module,
  active,
  onClick,
}: {
  module: DefiModule;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = module.icon;

  return (
    <button
      onClick={onClick}
      className={`w-full border p-4 text-left transition-all ${
        active
          ? "border-white/30 bg-white/[0.08]"
          : "border-white/10 bg-black hover:bg-white/[0.03]"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Icon size={16} className="text-white/60" />

          <p className="font-orbitron text-xs font-bold uppercase">
            {module.title}
          </p>
        </div>

        <p className="font-mono text-[10px] text-white/35 uppercase">
          {module.status}
        </p>
      </div>
    </button>
  );
}

function PoolRow({
  pool,
  active,
  onClick,
}: {
  pool: Pool;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full border p-4 text-left transition-all ${
        active
          ? "border-white/30 bg-white/[0.08]"
          : "border-white/10 bg-black hover:bg-white/[0.03]"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-orbitron text-sm font-bold uppercase mb-1">
            {pool.pair}
          </p>

          <p className="font-mono text-[10px] text-white/35 uppercase">
            TVL {pool.tvl}
          </p>
        </div>

        <div className="text-right">
          <p className="font-mono text-[10px] text-white/45 uppercase mb-1">
            APR {pool.apr}
          </p>

          <p className="font-mono text-[10px] text-white/30 uppercase">
            Risk {pool.risk}
          </p>
        </div>
      </div>
    </button>
  );
}

function MiniStatus({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/10 bg-black p-4">
      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
        {label}
      </p>

      <p className="font-orbitron text-sm font-black uppercase">{value}</p>
    </div>
  );
}

function RiskRuleCard({ rule }: { rule: RiskRule }) {
  const Icon = rule.icon;

  return (
    <div className="border border-white/10 bg-black p-4">
      <div className="flex items-start justify-between mb-3">
        <Icon size={17} className="text-white/60" />

        <p className="font-mono text-[10px] text-white/30 uppercase">
          {rule.status}
        </p>
      </div>

      <p className="font-orbitron text-xs font-bold uppercase mb-2">
        {rule.title}
      </p>

      <p className="font-mono text-[10px] text-white/40 leading-relaxed">
        {rule.text}
      </p>
    </div>
  );
}

function RoadmapLine({ label }: { label: string }) {
  return (
    <div className="border border-white/10 bg-black p-3 flex items-center gap-2">
      <CheckCircle2 size={14} className="text-white/60" />

      <p className="font-mono text-xs text-white/50">{label}</p>
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
