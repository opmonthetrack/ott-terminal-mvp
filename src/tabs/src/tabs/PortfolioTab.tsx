import type { ElementType } from "react";
import {
  ArrowUpRight,
  BarChart3,
  Coins,
  Eye,
  PieChart,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";

type PortfolioTabProps = {
  walletAddress: string;
};

type Asset = {
  symbol: string;
  name: string;
  balance: string;
  value: string;
  status: string;
};

const assets: Asset[] = [
  {
    symbol: "XRP",
    name: "XRP Ledger Native Asset",
    balance: "589.0000",
    value: "$1,178.00",
    status: "Mock",
  },
  {
    symbol: "RLUSD",
    name: "Ripple USD",
    balance: "250.00",
    value: "$250.00",
    status: "Watch",
  },
  {
    symbol: "USDC",
    name: "Circle USD",
    balance: "100.00",
    value: "$100.00",
    status: "Research",
  },
  {
    symbol: "OTT XP",
    name: "Off-chain Reputation Points",
    balance: "130 XP",
    value: "Utility",
    status: "Live",
  },
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
              tokenwaarden, stablecoins, NFT badges, AMM-posities, wallet
              health, risico-analyse en AI-uitleg samen.
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
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={18} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                AI Portfolio Notes
              </p>
            </div>

            <p className="font-mono text-xs text-white/45 leading-relaxed">
              Later kan AI jouw portfolio uitleggen in gewone taal. Niet als
              financieel advies, maar als educatieve analyse van balans,
              stablecoin exposure, trustlines en risico.
            </p>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-4 space-y-4">
          <SideBox icon={Eye} title="Wallet Health" text="Risk scanner later" />
          <SideBox icon={ShieldCheck} title="Trustline Safety" text="Warnings before action" />
          <SideBox icon={ArrowUpRight} title="Explorer Links" text="Bithomp / XRPL.org later" />
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

function AssetRow({ asset }: { asset: Asset }) {
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
            {asset.value} • {asset.status}
          </p>
        </div>
      </div>
    </div>
  );
}

function SideBox({
  icon: Icon,
  title,
  text,
}: {
  icon: ElementType;
  title: string;
  text: string;
}) {
  return (
    <div className="border border-white/10 bg-white/[0.02] p-6">
      <Icon size={19} className="text-white/60 mb-4" />

      <p className="font-orbitron text-sm font-bold uppercase mb-2">{title}</p>

      <p className="font-mono text-xs text-white/40">{text}</p>
    </div>
  );
}
