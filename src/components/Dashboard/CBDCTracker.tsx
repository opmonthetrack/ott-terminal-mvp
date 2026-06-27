import {
  Globe,
  Landmark,
  Building2,
  ArrowUpRight,
  CircleCheck,
  Clock3,
  FlaskConical,
} from "lucide-react";

const cbdcs = [
  {
    country: "European Union",
    project: "Digital Euro",
    status: "Preparation",
    phase: "ECB",
  },
  {
    country: "China",
    project: "e-CNY",
    status: "Live Pilot",
    phase: "Advanced",
  },
  {
    country: "United States",
    project: "Fed Research",
    status: "Research",
    phase: "Federal Reserve",
  },
  {
    country: "United Kingdom",
    project: "Digital Pound",
    status: "Research",
    phase: "BoE",
  },
  {
    country: "Brazil",
    project: "Drex",
    status: "Pilot",
    phase: "Central Bank",
  },
  {
    country: "India",
    project: "Digital Rupee",
    status: "Pilot",
    phase: "RBI",
  },
  {
    country: "Singapore",
    project: "Project Orchid",
    status: "Research",
    phase: "MAS",
  },
  {
    country: "Hong Kong",
    project: "e-HKD",
    status: "Pilot",
    phase: "HKMA",
  },
  {
    country: "UAE",
    project: "Digital Dirham",
    status: "Pilot",
    phase: "CBUAE",
  },
  {
    country: "Saudi Arabia",
    project: "mBridge",
    status: "Cross-border",
    phase: "BIS",
  },
];

function StatusIcon(status: string) {
  if (status.toLowerCase().includes("live"))
    return <CircleCheck size={14} className="text-white/70" />;

  if (
    status.toLowerCase().includes("pilot") ||
    status.toLowerCase().includes("cross")
  )
    return <FlaskConical size={14} className="text-white/70" />;

  return <Clock3 size={14} className="text-white/70" />;
}

export function CBDCTracker() {
  return (
    <div className="border border-white/10 bg-white/[0.02] p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/35 mb-2">
            Global CBDC Intelligence
          </p>

          <h2 className="font-orbitron text-xl font-black uppercase">
            CBDC Tracker
          </h2>
        </div>

        <Globe className="text-white/60" size={20} />
      </div>

      <div className="space-y-3">
        {cbdcs.map((item) => (
          <div
            key={item.country}
            className="border border-white/10 bg-black hover:bg-white/[0.03] transition-all cursor-pointer p-4"
          >
            <div className="flex justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Landmark size={15} className="text-white/70" />

                  <p className="font-orbitron text-sm font-bold uppercase">
                    {item.country}
                  </p>
                </div>

                <p className="font-mono text-xs text-white/65 mb-2">
                  {item.project}
                </p>

                <div className="flex gap-4 flex-wrap">
                  <span className="flex items-center gap-1 font-mono text-[10px] uppercase text-white/35">
                    <Building2 size={10} />
                    {item.phase}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center justify-end gap-1 mb-2">
                  {StatusIcon(item.status)}

                  <span className="font-mono text-[10px] uppercase text-white/45">
                    {item.status}
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
