import {
  ArrowUpRight,
  Banknote,
  Building2,
  Clock3,
  Globe2,
  Landmark,
  Network,
  ShieldCheck,
  Workflow,
} from "lucide-react";

const fedwireItems = [
  {
    title: "Fedwire Funds",
    category: "US High-Value Payments",
    status: "Live",
  },
  {
    title: "ISO 20022 Migration",
    category: "Financial Messaging",
    status: "Completed",
  },
  {
    title: "Federal Reserve",
    category: "Settlement Operator",
    status: "Active",
  },
  {
    title: "Bank Liquidity",
    category: "Real-Time Settlement",
    status: "Monitoring",
  },
  {
    title: "Tokenized Deposits",
    category: "Institutional Research",
    status: "Watch",
  },
  {
    title: "Stablecoins",
    category: "Future Settlement",
    status: "Research",
  },
  {
    title: "CBDC",
    category: "Policy Research",
    status: "Watching",
  },
  {
    title: "XRPL Opportunity",
    category: "Future Interoperability",
    status: "Research",
  },
];

export function FedwireTracker() {
  return (
    <div className="border border-white/10 bg-white/[0.02] p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/35 mb-2">
            United States Infrastructure
          </p>

          <h2 className="font-orbitron text-xl font-black uppercase">
            Fedwire Tracker
          </h2>
        </div>

        <Workflow className="text-white/60" size={20} />
      </div>

      <div className="border border-white/10 bg-black p-5 mb-4">
        <div className="flex items-start gap-3">
          <ShieldCheck size={18} className="text-white/60 mt-0.5" />

          <div>
            <p className="font-orbitron text-sm font-bold uppercase mb-2">
              Why Fedwire matters
            </p>

            <p className="font-mono text-xs text-white/45 leading-relaxed">
              Fedwire is het realtime betaalsysteem van de Federal Reserve.
              De Terminal volgt de ontwikkelingen rondom ISO 20022,
              institutionele settlement, tokenized deposits, stablecoins en de
              mogelijke rol van publieke blockchains zoals XRPL binnen het
              toekomstige financiële ecosysteem.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {fedwireItems.map((item) => (
          <div
            key={item.title}
            className="border border-white/10 bg-black hover:bg-white/[0.03] transition-all p-4 cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {getIcon(item.title)}

                  <p className="font-orbitron text-sm font-bold uppercase">
                    {item.title}
                  </p>
                </div>

                <p className="font-mono text-[10px] uppercase tracking-widest text-white/35">
                  {item.category}
                </p>
              </div>

              <div className="text-right">
                <p className="font-mono text-[10px] uppercase text-white/45 mb-2">
                  {item.status}
                </p>

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

function getIcon(title: string) {
  const value = title.toLowerCase();

  if (value.includes("fedwire"))
    return <Network size={15} className="text-white/70" />;

  if (value.includes("iso"))
    return <Clock3 size={15} className="text-white/70" />;

  if (value.includes("reserve"))
    return <Landmark size={15} className="text-white/70" />;

  if (value.includes("liquidity"))
    return <Building2 size={15} className="text-white/70" />;

  if (value.includes("stable"))
    return <Banknote size={15} className="text-white/70" />;

  if (value.includes("cbdc"))
    return <Globe2 size={15} className="text-white/70" />;

  return <Workflow size={15} className="text-white/70" />;
}
