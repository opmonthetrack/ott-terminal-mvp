import { useState } from "react";
import type { ElementType } from "react";
import {
  Activity,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  Globe2,
  Lock,
  Network,
  Radio,
  Server,
  ShieldCheck,
  Signal,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Vote,
  Waves,
  Zap,
} from "lucide-react";

type ValidatorMetric = {
  label: string;
  value: string;
  subtitle: string;
  icon: ElementType;
};

type ValidatorNode = {
  name: string;
  country: string;
  status: string;
  uptime: string;
  description: string;
};

type Amendment = {
  title: string;
  status: string;
  impact: string;
  description: string;
};

type NetworkLayer = {
  title: string;
  value: string;
  text: string;
  icon: ElementType;
};

const validatorMetrics: ValidatorMetric[] = [
  {
    label: "Network",
    value: "XRPL",
    subtitle: "Mainnet focus",
    icon: Globe2,
  },
  {
    label: "Consensus",
    value: "Active",
    subtitle: "Live concept",
    icon: Network,
  },
  {
    label: "UNL",
    value: "Watch",
    subtitle: "Validator list",
    icon: ShieldCheck,
  },
  {
    label: "Health",
    value: "Good",
    subtitle: "Mock score",
    icon: Activity,
  },
];

const validators: ValidatorNode[] = [
  {
    name: "XRPL Foundation",
    country: "Global",
    status: "Trusted",
    uptime: "99.9%",
    description:
      "Publieke validator-laag voor educatie, UNL awareness en network monitoring.",
  },
  {
    name: "Ripple Validator",
    country: "Global",
    status: "Core",
    uptime: "99.9%",
    description:
      "Belangrijke infrastructuurlaag binnen het XRPL ecosysteem en consensus monitoring.",
  },
  {
    name: "Community Validator",
    country: "EU",
    status: "Watch",
    uptime: "99.5%",
    description:
      "Community node voorbeeld voor decentralisatie, governance en uptime uitleg.",
  },
  {
    name: "OTT Future Node",
    country: "Netherlands",
    status: "Planned",
    uptime: "Soon",
    description:
      "Toekomstige OTT validator of observer node voor education, metrics en transparency.",
  },
];

const amendments: Amendment[] = [
  {
    title: "AMM",
    status: "Education",
    impact: "DeFi",
    description:
      "AMM uitleg voor liquidity pools, swaps, fees, risico en XRPL DeFi adoptie.",
  },
  {
    title: "Clawback",
    status: "Watch",
    impact: "Tokens",
    description:
      "Token issuer control, compliance discussie en user risk education.",
  },
  {
    title: "DID",
    status: "Identity",
    impact: "Web3 ID",
    description:
      "Decentralized identity als toekomstige laag voor profiles, credentials en badges.",
  },
  {
    title: "Hooks / Smart Features",
    status: "Research",
    impact: "Builders",
    description:
      "Educatieve researchlaag voor automatisering, logic en developer tooling.",
  },
];

const networkLayers: NetworkLayer[] = [
  {
    title: "Consensus",
    value: "Fast Finality",
    text: "XRPL validators bereiken consensus zonder mining.",
    icon: Signal,
  },
  {
    title: "Validators",
    value: "UNL",
    text: "Node operators helpen het netwerk betrouwbaar houden.",
    icon: Server,
  },
  {
    title: "Governance",
    value: "Amendments",
    text: "Protocolwijzigingen worden via amendment voting gevolgd.",
    icon: Vote,
  },
  {
    title: "Education",
    value: "OTT Layer",
    text: "OTT vertaalt technische data naar begrijpelijke uitleg.",
    icon: Sparkles,
  },
];

const roadmap = [
  "Live validator list koppelen",
  "UNL status zichtbaar maken",
  "Amendment voting feed bouwen",
  "Network health score maken",
  "XRPL node endpoint toevoegen",
  "Validator education cards maken",
  "OTT observer node onderzoeken",
  "Alerts voor network changes toevoegen",
];

export function ValidatorTab() {
  const [selectedValidator, setSelectedValidator] = useState<ValidatorNode>(
    validators[0]
  );
  const [selectedAmendment, setSelectedAmendment] = useState<Amendment>(
    amendments[0]
  );

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 mb-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="flex items-center gap-2 mb-4 text-white/45">
              <Server size={17} />

              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                XRPL Validator Monitor
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              Network Health & Consensus
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              De validator-laag van OTT Terminal. Hier maken we XRPL consensus,
              UNL, amendments, validator health en governance begrijpelijk voor
              gebruikers, builders en partners.
            </p>
          </div>

          <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-3">
            {validatorMetrics.map((metric) => (
              <MetricBox key={metric.label} metric={metric} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-8 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Validators
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  Validator Directory
                </h3>
              </div>

              <Users size={20} className="text-white/60" />
            </div>

            <div className="space-y-3">
              {validators.map((validator) => (
                <ValidatorRow
                  key={validator.name}
                  validator={validator}
                  active={selectedValidator.name === validator.name}
                  onClick={() => setSelectedValidator(validator)}
                />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Selected Validator
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  {selectedValidator.name}
                </h3>
              </div>

              <ShieldCheck size={22} className="text-white/60" />
            </div>

            <p className="font-mono text-sm text-white/45 leading-relaxed mb-5">
              {selectedValidator.description}
            </p>

            <div className="grid grid-cols-3 gap-3">
              <MiniStatus label="Country" value={selectedValidator.country} />
              <MiniStatus label="Status" value={selectedValidator.status} />
              <MiniStatus label="Uptime" value={selectedValidator.uptime} />
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Network Layers
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  How XRPL Stays Online
                </h3>
              </div>

              <Database size={20} className="text-white/60" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {networkLayers.map((layer) => (
                <LayerCard key={layer.title} layer={layer} />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-4 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Vote size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Amendments
              </p>
            </div>

            <div className="space-y-3">
              {amendments.map((amendment) => (
                <AmendmentButton
                  key={amendment.title}
                  amendment={amendment}
                  active={selectedAmendment.title === amendment.title}
                  onClick={() => setSelectedAmendment(amendment)}
                />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Target size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Selected Amendment
              </p>
            </div>

            <p className="font-orbitron text-2xl font-black uppercase mb-2">
              {selectedAmendment.title}
            </p>

            <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-4">
              {selectedAmendment.status} • {selectedAmendment.impact}
            </p>

            <p className="font-mono text-xs text-white/45 leading-relaxed">
              {selectedAmendment.description}
            </p>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Clock size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Roadmap
              </p>
            </div>

            <div className="space-y-3">
              {roadmap.map((item) => (
                <RoadmapLine key={item} label={item} />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <FeatureBox icon={Cpu} title="Nodes" text="Network infrastructure" />
          <FeatureBox icon={TrendingUp} title="Health" text="Metrics later" />
          <FeatureBox icon={Waves} title="Make Waves" text="Mainnet proof" />
          <FeatureBox icon={Lock} title="Trust Layer" text="Safety education" />
        </div>
      </div>
    </div>
  );
}

function MetricBox({ metric }: { metric: ValidatorMetric }) {
  const Icon = metric.icon;

  return (
    <div className="border border-white/10 bg-black/60 p-4">
      <Icon size={18} className="text-white/60 mb-3" />

      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
        {metric.label}
      </p>

      <p className="font-orbitron text-sm font-black uppercase mb-1">
        {metric.value}
      </p>

      <p className="font-mono text-[10px] text-white/30 uppercase">
        {metric.subtitle}
      </p>
    </div>
  );
}

function ValidatorRow({
  validator,
  active,
  onClick,
}: {
  validator: ValidatorNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full border p-4 text-left transition-all ${
        active
          ? "border-white/30 bg-white/[0.08]"
          : "border-white/10 bg-black hover:bg-white/[0.03]"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-orbitron text-sm font-bold uppercase mb-1">
            {validator.name}
          </p>

          <p className="font-mono text-[10px] text-white/35 uppercase">
            {validator.country}
          </p>
        </div>

        <div className="text-right">
          <p className="font-mono text-[10px] text-white/45 uppercase mb-1">
            {validator.status}
          </p>

          <p className="font-mono text-[10px] text-white/30 uppercase">
            {validator.uptime}
          </p>
        </div>
      </div>
    </button>
  );
}

function MiniStatus({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/10 bg-black p-4">
      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
        {label}
      </p>

      <p className="font-orbitron text-sm font-black uppercase">{value}</p>
    </div>
  );
}

function LayerCard({ layer }: { layer: NetworkLayer }) {
  const Icon = layer.icon;

  return (
    <div className="border border-white/10 bg-black p-5">
      <div className="flex items-start justify-between mb-4">
        <Icon size={20} className="text-white/60" />

        <p className="font-mono text-[10px] uppercase text-white/35">
          {layer.value}
        </p>
      </div>

      <p className="font-orbitron text-sm font-bold uppercase mb-2">
        {layer.title}
      </p>

      <p className="font-mono text-xs text-white/40 leading-relaxed">
        {layer.text}
      </p>
    </div>
  );
}

function AmendmentButton({
  amendment,
  active,
  onClick,
}: {
  amendment: Amendment;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full border p-4 text-left transition-all ${
        active
          ? "border-white/30 bg-white/[0.08]"
          : "border-white/10 bg-black hover:bg-white/[0.03]"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-orbitron text-xs font-bold uppercase">
          {amendment.title}
        </p>

        <p className="font-mono text-[10px] text-white/35 uppercase">
          {amendment.status}
        </p>
      </div>
    </button>
  );
}

function RoadmapLine({ label }: { label: string }) {
  return (
    <div className="border border-white/10 bg-black p-3 flex items-center gap-2">
      <CheckCircle2 size={14} className="text-white/60" />

      <p className="font-mono text-xs text-white/50">{label}</p>
    </div>
  );
}

function FeatureBox({
  icon: Icon,
  title,
  text,
}: {
  icon: ElementType;
  title: string;
  text: string;
}) {
  return (
    <div className="border border-white/10 bg-white/[0.02] p-5">
      <Icon size={19} className="text-white/60 mb-4" />

      <p className="font-orbitron text-sm font-bold uppercase mb-2">{title}</p>

      <p className="font-mono text-xs text-white/40">{text}</p>
    </div>
  );
}
