import {
  Coins,
  CircleDollarSign,
  Building2,
  ArrowUpRight,
  ShieldCheck,
  Landmark,
} from "lucide-react";

const stablecoins = [
  {
    name: "RLUSD",
    issuer: "Ripple",
    status: "Live",
    type: "Fiat-backed",
  },
  {
    name: "USDC",
    issuer: "Circle",
    status: "XRPL",
    type: "Fiat-backed",
  },
  {
    name: "EURØP",
    issuer: "Schuman Financial",
    status: "Live",
    type: "Euro Stablecoin",
  },
  {
    name: "USDT",
    issuer: "Tether",
    status: "Monitoring",
    type: "Fiat-backed",
  },
  {
    name: "XSGD",
    issuer: "Singapore",
    status: "Research",
    type: "Regional",
  },
  {
    name: "Future Assets",
    issuer: "Coming Soon",
    status: "Tracking",
    type: "Institutional",
  },
];

export function StablecoinTracker() {
  return (
    <div className="border border-white/10 bg-white/[0.02] p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/35 mb-2">
            Stablecoin Intelligence
          </p>

          <h2 className="font-orbitron text-xl font-black uppercase">
            Stablecoin Tracker
          </h2>
        </div>

        <CircleDollarSign className="text-white/60" size={20} />
      </div>

      <div className="space-y-3">
        {stablecoins.map((coin) => (
          <div
            key={coin.name}
            className="border border-white/10 bg-black hover:bg-white/[0.03] transition-all p-4 cursor-pointer"
          >
            <div className="flex justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Coins size={16} className="text-white/70" />

                  <p className="font-orbitron text-sm font-bold uppercase">
                    {coin.name}
                  </p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <span className="flex items-center gap-1 font-mono text-[10px] uppercase text-white/35">
                    <Building2 size={10} />
                    {coin.issuer}
                  </span>

                  <span className="flex items-center gap-1 font-mono text-[10px] uppercase text-white/35">
                    <Landmark size={10} />
                    {coin.type}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center justify-end gap-1 mb-2">
                  <ShieldCheck size={12} className="text-white/60" />
                  <span className="font-mono text-[10px] uppercase text-white/45">
                    {coin.status}
                  </span>
                </div>

                <ArrowUpRight
                  size={15}
                  className="ml-auto text-white/20"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
