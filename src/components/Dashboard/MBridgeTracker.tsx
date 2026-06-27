import {
  ArrowUpRight,
  Banknote,
  Building2,
  Globe2,
  Landmark,
  Network,
  Route,
  ShieldCheck,
  Workflow,
} from "lucide-react";

const mbridgeItems = [
  {
    title: "mBridge",
    category: "Cross-Border CBDC Bridge",
    status: "Watch",
  },
  {
    title: "BIS Innovation Hub",
    category: "Global Research",
    status: "Core",
  },
  {
    title: "China",
    category: "e-CNY Corridor",
    status: "Participant",
  },
  {
    title: "Hong Kong",
    category: "HKMA Corridor",
    status: "Participant",
  },
  {
    title: "Thailand",
    category: "BOT Corridor",
    status: "Participant",
  },
  {
    title: "UAE",
    category: "Digital Dirham Corridor",
    status: "Participant",
  },
  {
    title: "Saudi Arabia",
    category: "Cross-Border Expansion",
    status: "Watch",
  },
  {
    title: "Commercial Banks",
    category: "Wholesale Settlement",
    status: "Institutional",
  },
  {
    title: "Stablecoin Impact",
    category: "Settlement Competition",
    status: "Research",
  },
  {
    title: "XRPL Opportunity",
    category: "Interoperability Layer",
    status: "Research",
  },
];

export function MBridgeTracker() {
  return (
    <div className="border border-white/10 bg-white/[0.02] p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/35 mb-2">
            Cross-Border CBDC Intelligence
          </p>

          <h2 className="font-orbitron text-xl font-black uppercase">
            mBridge Tracker
          </h2>
        </div>

        <Route className="text-white/60" size={20} />
      </div>

      <div className="border border-white/10 bg-black p-5 mb-4">
        <div className="flex items-start gap-3">
          <ShieldCheck size={18} className="text-white/60 mt-0.5" />

          <div>
            <p className="font-orbitron text-sm font-bold uppercase mb-2">
              Why mBridge matters
            </p>

            <p className="font-mono text-xs text-white/45 leading-relaxed">
              mBridge onderzoekt hoe centrale banken en commerciële banken
              grensoverschrijdende wholesale CBDC-betalingen kunnen afwikkelen.
              De Terminal volgt dit omdat CBDC, stablecoins, RLUSD, tokenized
              deposits en XRPL settlement allemaal onderdeel zijn van dezelfde
              wereldwijde betalingsverschuiving.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {mbridgeItems.map((item) => (
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
  const value = title.toLowerCase();

  if (value.includes("mbridge"))
    return <Route size={15} className="text-white/70" />;

  if (value.includes("bis"))
    return <Network size={15} className="text-white/70" />;

  if (
    value.includes("china") ||
    value.includes("hong") ||
    value.includes("thailand") ||
    value.includes("uae") ||
    value.includes("saudi")
  )
    return <Globe2 size={15} className="text-white/70" />;

  if (value.includes("commercial"))
    return <Landmark size={15} className="text-white/70" />;

  if (value.includes("stable"))
    return <Banknote size={15} className="text-white/70" />;

  if (value.includes("xrpl"))
    return <Workflow size={15} className="text-white/70" />;

  return <Building2 size={15} className="text-white/70" />;
}
