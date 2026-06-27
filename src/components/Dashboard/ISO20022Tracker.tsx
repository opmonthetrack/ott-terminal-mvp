import {
  ArrowUpRight,
  Banknote,
  Building2,
  Cpu,
  FileText,
  Globe2,
  Landmark,
  Link2,
  Network,
  ShieldCheck,
} from "lucide-react";

const isoItems = [
  {
    title: "ISO 20022",
    category: "Messaging Standard",
    status: "Core",
  },
  {
    title: "SWIFT MX",
    category: "Bank Messaging",
    status: "Live Migration",
  },
  {
    title: "Fedwire",
    category: "US Payment Rail",
    status: "Monitoring",
  },
  {
    title: "CHIPS",
    category: "US Clearing Rail",
    status: "Monitoring",
  },
  {
    title: "TARGET / T2",
    category: "Euro Settlement",
    status: "Core",
  },
  {
    title: "SEPA",
    category: "Euro Retail Payments",
    status: "Core",
  },
  {
    title: "RLUSD",
    category: "Stablecoin Settlement",
    status: "Watch",
  },
  {
    title: "XRPL",
    category: "Ledger Research Layer",
    status: "Research",
  },
  {
    title: "mBridge",
    category: "CBDC Bridge",
    status: "Watch",
  },
  {
    title: "Tokenized Deposits",
    category: "Bank Money",
    status: "Institutional",
  },
];

export function ISO20022Tracker() {
  return (
    <div className="border border-white/10 bg-white/[0.02] p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/35 mb-2">
            Financial Messaging Intelligence
          </p>

          <h2 className="font-orbitron text-xl font-black uppercase">
            ISO 20022 Tracker
          </h2>
        </div>

        <FileText className="text-white/60" size={20} />
      </div>

      <div className="border border-white/10 bg-black p-5 mb-4">
        <div className="flex items-start gap-3">
          <ShieldCheck size={18} className="text-white/60 mt-0.5" />

          <div>
            <p className="font-orbitron text-sm font-bold uppercase mb-2">
              Important distinction
            </p>

            <p className="font-mono text-xs text-white/45 leading-relaxed">
              ISO 20022 is geen token en geen blockchain. Het is een
              berichtstandaard voor rijkere betaaldata tussen financiële
              instellingen. De Terminal volgt hoe XRPL, stablecoins,
              banksoftware en settlement rails hieromheen bewegen.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {isoItems.map((item) => (
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

  if (normalized.includes("swift")) {
    return <Network size={15} className="text-white/70" />;
  }

  if (normalized.includes("fedwire") || normalized.includes("chips")) {
    return <Landmark size={15} className="text-white/70" />;
  }

  if (normalized.includes("target") || normalized.includes("sepa")) {
    return <Building2 size={15} className="text-white/70" />;
  }

  if (normalized.includes("rlusd")) {
    return <Banknote size={15} className="text-white/70" />;
  }

  if (normalized.includes("xrpl")) {
    return <Link2 size={15} className="text-white/70" />;
  }

  if (normalized.includes("mbridge")) {
    return <Globe2 size={15} className="text-white/70" />;
  }

  if (normalized.includes("tokenized")) {
    return <Cpu size={15} className="text-white/70" />;
  }

  return <FileText size={15} className="text-white/70" />;
}
