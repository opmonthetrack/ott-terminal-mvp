import type { ElementType } from "react";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Database,
  Fingerprint,
  Gauge,
  KeyRound,
  Layers3,
  Link2,
  LockKeyhole,
  Network,
  Search,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { MAKE_WAVES_SOURCE_TAG } from "../lib/makeWaves";

type TerminalHomeTabProps = {
  walletAddress?: string;
  onNavigate?: (target: string) => void;
};

type ProductLayer = {
  id: string;
  title: string;
  label: string;
  description: string;
  bullets: string[];
  icon: ElementType;
  actionLabel: string;
  target: string;
};

type Metric = {
  label: string;
  value: string;
  text: string;
  icon: ElementType;
};

const productLayers: ProductLayer[] = [
  {
    id: "explorer",
    title: "XRPL Explorer",
    label: "Public Layer",
    description:
      "De publieke voorkant: live XRPL data, search, ledgers, transactions, accounts, assets en SourceTag proof.",
    bullets: [
      "Live XRPL network overview",
      "Search account / transaction / asset",
      "SourceTag 2606170002 lookup",
      "Explorer-style first impression",
    ],
    icon: Network,
    actionLabel: "Open Explorer",
    target: "network",
  },
  {
    id: "dashboard",
    title: "Xaman Wallet Dashboard",
    label: "Connected Layer",
    description:
      "Na Xaman connect krijgt de gebruiker zijn eigen XRPL command center met wallet, balances, trustlines, proof history en XP.",
    bullets: [
      "Wallet address and balances",
      "Recent transactions",
      "Trustlines / NFTs later",
      "Reward Ledger and access status",
    ],
    icon: Wallet,
    actionLabel: "Open Wallet",
    target: "wallet",
  },
  {
    id: "ott-proof",
    title: "OTT Proof / Education",
    label: "OnTheTrack Layer",
    description:
      "De unieke OTT-laag: Partner Hub, Proof Stamps, Truth Desk, Access Gate en education-first routes.",
    bullets: [
      "Learn first, act second",
      "Risk notes before route",
      "Optional Proof Stamps",
      "Truth Desk and Access Gate",
    ],
    icon: Fingerprint,
    actionLabel: "Open Proof Layer",
    target: "partners",
  },
];

const metrics: Metric[] = [
  {
    label: "Product",
    value: "V2",
    text: "Explorer + Dashboard + Proof",
    icon: Layers3,
  },
  {
    label: "SourceTag",
    value: String(MAKE_WAVES_SOURCE_TAG),
    text: "OTT proof identity",
    icon: Fingerprint,
  },
  {
    label: "Wallet",
    value: "Xaman",
    text: "Self-custody connect",
    icon: KeyRound,
  },
  {
    label: "Position",
    value: "Safe",
    text: "No custody / no broker",
    icon: ShieldCheck,
  },
];

export function TerminalHomeTab({
  walletAddress = "guest",
  onNavigate,
}: TerminalHomeTabProps) {
  function navigate(target: string) {
    onNavigate?.(target);
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,_white,_transparent_28%),radial-gradient(circle_at_80%_0%,_white,_transparent_24%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,_transparent,_black_85%)]" />

        <div className="relative z-10 p-6 xl:p-10">
          <div className="grid grid-cols-12 gap-6 items-end">
            <div className="col-span-12 xl:col-span-8">
              <div className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.03] px-4 py-2 mb-6">
                <Activity size={15} className="text-white/60" />

                <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/50">
                  XRPL OnTheTrack Terminal V2
                </p>
              </div>

              <h1 className="font-orbitron text-4xl xl:text-6xl font-black uppercase leading-none tracking-tight mb-6">
                Explore XRPL.
                <br />
                Connect Xaman.
                <br />
                Prove What Matters.
              </h1>

              <p className="font-mono text-sm xl:text-base text-white/50 leading-relaxed max-w-3xl mb-8">
                Een XRPL-native terminal met drie lagen: een professionele
                explorer, een connected Xaman wallet dashboard en de unieke OTT
                Proof / Education laag rond SourceTag {MAKE_WAVES_SOURCE_TAG}.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-4xl">
                <PrimaryAction
                  title="Start Explorer"
                  text="Public XRPL layer"
                  icon={Search}
                  onClick={() => navigate("network")}
                />
                <PrimaryAction
                  title="Wallet Dashboard"
                  text="Xaman connected layer"
                  icon={Wallet}
                  onClick={() => navigate("wallet")}
                />
                <PrimaryAction
                  title="Proof / Education"
                  text="OTT unique layer"
                  icon={BookOpen}
                  onClick={() => navigate("partners")}
                />
              </div>
            </div>

            <div className="col-span-12 xl:col-span-4">
              <div className="border border-white/10 bg-black/70 backdrop-blur p-5">
                <p className="font-orbitron text-xs uppercase tracking-widest mb-5">
                  Terminal Identity
                </p>

                <div className="space-y-3">
                  <IdentityRow
                    label="Connected Wallet"
                    value={walletAddress === "guest" ? "Guest Mode" : walletAddress}
                  />
                  <IdentityRow
                    label="SourceTag"
                    value={String(MAKE_WAVES_SOURCE_TAG)}
                  />
                  <IdentityRow label="Mode" value="Education-first" />
                  <IdentityRow label="Custody" value="Never" />
                </div>

                <div className="border border-white/10 bg-white/[0.02] p-4 mt-5">
                  <div className="flex items-start gap-3">
                    <LockKeyhole size={18} className="text-white/55 shrink-0 mt-0.5" />

                    <p className="font-mono text-xs text-white/45 leading-relaxed">
                      No custody, no broker, no yield provider, no trade
                      execution. Official routes after explanation and risk
                      awareness.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mt-8">
            {metrics.map((metric) => (
              <MetricCard key={metric.label} metric={metric} />
            ))}
          </div>
        </div>
      </section>

      <section className="p-6 xl:p-10">
        <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4 mb-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/35 mb-3">
              Product Structure
            </p>

            <h2 className="font-orbitron text-2xl xl:text-3xl font-black uppercase">
              Three-Layer XRPL Terminal
            </h2>
          </div>

          <p className="font-mono text-xs text-white/40 max-w-xl leading-relaxed">
            Alles wat we al gebouwd hebben blijft bestaan. We tonen het alleen
            slimmer: explorer eerst, wallet dashboard tweede, OTT proof /
            education derde.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-8">
          {productLayers.map((layer) => (
            <LayerCard key={layer.id} layer={layer} onNavigate={navigate} />
          ))}
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-7 border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Gauge size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                New Main Flow
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <FlowStep number="01" title="Home" text="Terminal overview" />
              <FlowStep number="02" title="Explore" text="XRPL live data" />
              <FlowStep number="03" title="Connect" text="Xaman wallet" />
              <FlowStep number="04" title="Prove" text="SourceTag / tx" />
              <FlowStep number="05" title="Learn" text="OTT routes" />
            </div>
          </div>

          <div className="col-span-12 xl:col-span-5 border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <BadgeCheck size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                What We Reuse
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <ReuseItem text="api/ott.ts single router" />
              <ReuseItem text="Xaman payload logic" />
              <ReuseItem text="XRPL verification logic" />
              <ReuseItem text="Partner Hub content" />
              <ReuseItem text="Truth Desk / Access Gate" />
              <ReuseItem text="Reward Ledger / XP" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function PrimaryAction({
  title,
  text,
  icon: Icon,
  onClick,
}: {
  title: string;
  text: string;
  icon: ElementType;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group border border-white/10 bg-white/[0.03] p-4 text-left hover:bg-white hover:text-black transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <Icon size={20} className="text-white/65 group-hover:text-black/70" />
        <ArrowRight size={17} className="text-white/25 group-hover:text-black/70" />
      </div>

      <p className="font-orbitron text-xs font-black uppercase mb-2">{title}</p>
      <p className="font-mono text-[10px] uppercase text-white/35 group-hover:text-black/55">
        {text}
      </p>
    </button>
  );
}

function MetricCard({ metric }: { metric: Metric }) {
  const Icon = metric.icon;

  return (
    <div className="border border-white/10 bg-black/60 p-4">
      <Icon size={18} className="text-white/60 mb-3" />

      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
        {metric.label}
      </p>

      <p className="font-orbitron text-sm font-black uppercase mb-1 break-all">
        {metric.value}
      </p>

      <p className="font-mono text-[10px] text-white/30 uppercase">
        {metric.text}
      </p>
    </div>
  );
}

function LayerCard({
  layer,
  onNavigate,
}: {
  layer: ProductLayer;
  onNavigate: (target: string) => void;
}) {
  const Icon = layer.icon;

  return (
    <div className="border border-white/10 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-all">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.28em] mb-3">
            {layer.label}
          </p>

          <h3 className="font-orbitron text-xl font-black uppercase">
            {layer.title}
          </h3>
        </div>

        <Icon size={30} className="text-white/45 shrink-0" />
      </div>

      <p className="font-mono text-sm text-white/50 leading-relaxed mb-5">
        {layer.description}
      </p>

      <div className="space-y-3 mb-6">
        {layer.bullets.map((bullet) => (
          <div key={bullet} className="flex items-start gap-2">
            <Sparkles size={13} className="text-white/35 mt-0.5 shrink-0" />
            <p className="font-mono text-xs text-white/42 leading-relaxed">
              {bullet}
            </p>
          </div>
        ))}
      </div>

      <button
        onClick={() => onNavigate(layer.target)}
        className="w-full border border-white/10 bg-black p-4 text-left hover:bg-white hover:text-black transition-all group"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-orbitron text-xs font-black uppercase mb-2">
              {layer.actionLabel}
            </p>
            <p className="font-mono text-[10px] uppercase text-white/35 group-hover:text-black/55">
              Continue route
            </p>
          </div>

          <ArrowRight size={17} className="text-white/40 group-hover:text-black/70" />
        </div>
      </button>
    </div>
  );
}

function IdentityRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/10 bg-white/[0.02] p-3">
      <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-2">
        {label}
      </p>

      <p className="font-orbitron text-xs font-black uppercase break-all">
        {value}
      </p>
    </div>
  );
}

function FlowStep({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="border border-white/10 bg-black p-4">
      <p className="font-orbitron text-xs font-black text-white/35 mb-4">
        {number}
      </p>

      <p className="font-orbitron text-xs font-black uppercase mb-2">{title}</p>
      <p className="font-mono text-[10px] text-white/35 uppercase">{text}</p>
    </div>
  );
}

function ReuseItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 border border-white/10 bg-black p-3">
      <Link2 size={13} className="text-white/35 mt-0.5 shrink-0" />

      <p className="font-mono text-xs text-white/45 leading-relaxed">{text}</p>
    </div>
  );
}
