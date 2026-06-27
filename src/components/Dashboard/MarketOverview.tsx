import {
  ArrowUpRight,
  Landmark,
  Coins,
  Building2,
  Globe,
  ShieldCheck,
  Cpu,
  TrendingUp,
} from "lucide-react";

export function MarketOverview() {
  const markets = [
    {
      title: "XRP",
      value: "$-.--",
      change: "-- %",
      icon: Coins,
    },
    {
      title: "RLUSD",
      value: "$1.00",
      change: "Stable",
      icon: Landmark,
    },
    {
      title: "Stablecoins",
      value: "Tracking",
      change: "Live Soon",
      icon: ShieldCheck,
    },
    {
      title: "CBDC",
      value: "Countries",
      change: "Monitoring",
      icon: Globe,
    },
    {
      title: "ISO20022",
      value: "Status",
      change: "Watching",
      icon: Building2,
    },
    {
      title: "AI Payments",
      value: "XRPL AI",
      change: "Research",
      icon: Cpu,
    },
    {
      title: "RWA",
      value: "Assets",
      change: "Coming",
      icon: TrendingUp,
    },
    {
      title: "Institutional",
      value: "Banks",
      change: "Growing",
      icon: ArrowUpRight,
    },
  ];

  return (
    <div className="border border-white/10 bg-white/[0.02] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/35 mb-2">
            Market Overview
          </p>

          <h2 className="font-orbitron text-xl font-black uppercase">
            Global XRPL Markets
          </h2>
        </div>

        <p className="font-mono text-[10px] uppercase text-white/35">
          Live Module
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {markets.map((market) => {
          const Icon = market.icon;

          return (
            <div
              key={market.title}
              className="border border-white/10 bg-black hover:bg-white/[0.03] transition-all p-5 cursor-pointer"
            >
              <div className="flex justify-between items-center mb-5">
                <Icon className="text-white/70" size={20} />

                <ArrowUpRight
                  className="text-white/20"
                  size={15}
                />
              </div>

              <p className="font-orbitron text-sm font-bold uppercase mb-2">
                {market.title}
              </p>

              <p className="font-orbitron text-xl font-black mb-2">
                {market.value}
              </p>

              <p className="font-mono text-[10px] uppercase tracking-widest text-white/35">
                {market.change}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
