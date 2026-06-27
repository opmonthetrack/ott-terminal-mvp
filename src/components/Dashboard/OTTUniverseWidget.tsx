import {
  ArrowUpRight,
  Building2,
  Coins,
  Globe2,
  GraduationCap,
  Landmark,
  Link2,
  Network,
  ShieldCheck,
  Wallet,
  Waves,
} from "lucide-react";

const universeItems = [
  { title: "XRPL", category: "Core Ledger", status: "Foundation", icon: Network },
  { title: "Ripple", category: "Enterprise Payments", status: "Company", icon: Building2 },
  { title: "Xaman", category: "Wallet / xApp", status: "Core", icon: Wallet },
  { title: "XRPL Commons", category: "Education / Builders", status: "Ecosystem", icon: GraduationCap },
  { title: "XRPL Foundation", category: "Governance / Support", status: "Ecosystem", icon: ShieldCheck },
  { title: "RLUSD", category: "Stablecoin", status: "Priority", icon: Coins },
  { title: "Bithomp", category: "Explorer", status: "Tool", icon: Link2 },
  { title: "Xahau", category: "Hooks / Smart Logic", status: "Research", icon: Waves },
  { title: "Evernode", category: "Compute Layer", status: "Research", icon: Globe2 },
  { title: "Sologenic", category: "Tokenization / DEX", status: "Watch", icon: Landmark },
  { title: "Coreum", category: "Tokenization", status: "Watch", icon: Landmark },
  { title: "Archax", category: "RWA / Institutional", status: "Watch", icon: Building2 },
];

export function OTTUniverseWidget() {
  return (
    <div className="border border-white/10 bg-white/[0.02] p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/35 mb-2">
            Ecosystem Intelligence Map
          </p>

          <h2 className="font-orbitron text-xl font-black uppercase">
            OTT Universe
          </h2>
        </div>

        <Globe2 className="text-white/60" size={20} />
      </div>

      <div className="border border-white/10 bg-black p-5 mb-4">
        <div className="flex items-start gap-3">
          <Network size={18} className="text-white/60 mt-0.5" />

          <div>
            <p className="font-orbitron text-sm font-bold uppercase mb-2">
              XRPL Ecosystem Map
            </p>

            <p className="font-mono text-xs text-white/45 leading-relaxed">
              De OTT Universe wordt de interactieve kaart van alles rondom XRPL:
              projecten, bedrijven, wallets, explorers, education hubs,
              stablecoins, tokenization, AI, validators en builders. Later wordt
              elke tegel klikbaar met eigen researchpagina, nieuws, links en AI
              uitleg.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {universeItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="border border-white/10 bg-black hover:bg-white/[0.03] transition-all p-4 cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4">
                <Icon size={18} className="text-white/70" />
                <ArrowUpRight size={15} className="text-white/20" />
              </div>

              <p className="font-orbitron text-sm font-bold uppercase mb-2">
                {item.title}
              </p>

              <p className="font-mono text-[10px] uppercase tracking-widest text-white/35 mb-2">
                {item.category}
              </p>

              <p className="font-mono text-[10px] uppercase text-white/45">
                {item.status}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
