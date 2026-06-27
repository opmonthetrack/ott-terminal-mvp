import {
  ArrowUpRight,
  Banknote,
  Building2,
  Cable,
  Globe2,
  Landmark,
  Network,
  Radio,
  ShieldCheck,
} from "lucide-react";

const swiftItems = [
  {
    title: "SWIFT Network",
    category: "Global Bank Messaging",
    status: "Core",
  },
  {
    title: "SWIFT MX",
    category: "ISO 20022 Messages",
    status: "Migration",
  },
  {
    title: "Cross-Border Payments",
    category: "International Settlement",
    status: "Monitoring",
  },
  {
    title: "CBDC Experiments",
    category: "Digital Currency Trials",
    status: "Research",
  },
  {
    title: "Tokenized Assets",
    category: "Institutional Finance",
    status: "Watch",
  },
  {
    title: "Bank Connectivity",
    category: "Financial Infrastructure",
    status: "Live",
  },
  {
    title: "RLUSD / Stablecoins",
    category: "Settlement Research",
    status: "Watch",
  },
  {
    title: "XRPL Relationship",
    category: "Ledger Research Layer",
    status: "Research",
  },
];

export function SwiftTracker() {
  return (
    <div className="border border-white/10 bg-white/[0.02] p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/35 mb-2">
            Global Banking Rail
          </p>

          <h2 className="font-orbitron text-xl font-black uppercase">
            SWIFT Tracker
          </h2>
        </div>

        <Network className="text-white/60" size={20} />
      </div>

      <div className="border border-white/10 bg-black p-5 mb-4">
        <div className="flex items-start gap-3">
          <ShieldCheck size={18} className="text-white/60 mt-0.5" />

          <div>
            <p className="font-orbitron text-sm font-bold uppercase mb-2">
              Why SWIFT matters
            </p>

            <p className="font-mono text-xs text-white/45 leading-relaxed">
              SWIFT is geen blockchain. Het is een wereldwijd netwerk voor
              financiële berichten tussen banken. De Terminal volgt SWIFT omdat
              ISO 20022, CBDC, tokenized deposits, stablecoins en XRPL
              settlement allemaal rond dezelfde infrastructuur bewegen.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {swiftItems.map((item) => (
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

                <ArrowUpRight size={15} className="ml-auto text-white/20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getIcon(title: string) {
  const normalized = title.toLowerCase();

  if (normalized.includes("network")) {
    return <Network size={15} className="text-white/70" />;
  }

  if (normalized.includes("mx")) {
    return <Cable size={15} className="text-white/70" />;
  }

  if (normalized.includes("cross")) {
    return <Globe2 size={15} className="text-white/70" />;
  }

  if (normalized.includes("cbdc")) {
    return <Landmark size={15} className="text-white/70" />;
  }

  if (normalized.includes("tokenized")) {
    return <Building2 size={15} className="text-white/70" />;
  }

  if (normalized.includes("stable")) {
    return <Banknote size={15} className="text-white/70" />;
  }

  if (normalized.includes("xrpl")) {
    return <Radio size={15} className="text-white/70" />;
  }

  return <Network size={15} className="text-white/70" />;
}
