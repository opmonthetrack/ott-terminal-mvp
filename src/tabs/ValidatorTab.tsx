import type { ElementType } from "react";
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  Clock,
  Globe2,
  Layers,
  Network,
  Radio,
  Server,
  ShieldCheck,
  Signal,
  Sparkles,
  Terminal,
  Users,
  Vote,
  Zap,
} from "lucide-react";

type Validator = {
  name: string;
  region: string;
  status: string;
  uptime: string;
  role: string;
};

type Amendment = {
  title: string;
  status: string;
  support: string;
  description: string;
};

type NetworkMetric = {
  label: string;
  value: string;
  subtitle: string;
  icon: ElementType;
};

const validators: Validator[] = [
  {
    name: "XRPL Foundation",
    region: "Global",
    status: "Active",
    uptime: "99.9%",
    role: "UNL",
  },
  {
    name: "Ripple Validator",
    region: "Global",
    status: "Active",
    uptime: "99.9%",
    role: "UNL",
  },
  {
    name: "Community Validator",
    region: "EU",
    status: "Watch",
    uptime: "99.5%",
    role: "Public",
  },
  {
    name: "University Validator",
    region: "Research",
    status: "Watch",
    uptime: "99.2%",
    role: "Education",
  },
];

const amendments: Amendment[] = [
  {
    title: "AMM Enhancements",
    status: "Watch",
    support: "Research",
    description:
      "Voor toekomstige DeFi, liquidity pools, LP analytics en AMM intelligence.",
  },
  {
    title: "Clawback",
    status: "Live / Research",
    support: "Compliance",
    description:
      "Belangrijk voor regulated assets, stablecoins en institutionele tokenization.",
  },
  {
    title: "DID",
    status: "Research",
    support: "Identity",
    description:
      "Kan later relevant zijn voor identity, reputation en verified user profiles.",
  },
  {
    title: "Permissioned Domains",
    status: "Watch",
    support: "Enterprise",
    description:
      "Interessant voor enterprise, compliance, institutions en regulated DeFi.",
  },
];

const networkMetrics: NetworkMetric[] = [
  {
    label: "Network",
    value: "XRPL Mainnet",
    subtitle: "Live network focus",
    icon: Globe2,
  },
  {
    label: "Consensus",
    value: "Active",
    subtitle: "Validator agreement",
    icon: Network,
  },
  {
    label: "Ledger Speed",
    value: "Fast",
    subtitle: "Low-cost settlement",
    icon: Zap,
  },
  {
    label: "Monitoring",
    value: "Mock",
    subtitle: "Live data later",
    icon: Activity,
  },
];

const validatorRoadmap = [
  "Live XRPL network status",
  "Validator uptime tracking",
  "UNL monitoring",
  "Amendment voting dashboard",
  "Governance education pages",
  "Validator risk labels",
  "AI amendment summaries",
  "Community voting explainers",
];

export function ValidatorTab() {
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
              Network. Validators. Governance.
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              De netwerklaag van de OTT Terminal. Hier komen validators, UNL,
              uptime, amendments, governance, consensus uitleg en AI-samenvattingen
              samen voor gebruikers die willen begrijpen hoe XRPL veilig blijft.
            </p>
          </div>

          <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-3">
            {networkMetrics.map((metric) => (
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
                  Validator Watchlist
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  Network Operators
                </h3>
              </div>

              <Radio size={20} className="text-white/60" />
            </div>

            <div className="space-y-3">
              {validators.map((validator) => (
                <ValidatorRow key={validator.name} validator={validator} />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Amendment Tracker
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  Governance Signals
                </h3>
              </div>

              <Vote size={20} className="text-white/60" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {amendments.map((amendment) => (
                <AmendmentCard key={amendment.title} amendment={amendment} />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Consensus Education
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  How XRPL Stays Online
                </h3>
              </div>

              <Terminal size={20} className="text-white/60" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <EducationBox
                icon={Users}
                title="Validators"
                text="Servers die transacties controleren en consensus bereiken."
              />
              <EducationBox
                icon={Layers}
                title="UNL"
                text="Trusted validator lists die helpen bepalen welke validators gevolgd worden."
              />
              <EducationBox
                icon={ShieldCheck}
                title="Consensus"
                text="Het proces waarmee XRPL snel en veilig overeenstemming bereikt."
              />
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-4 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Signal size={18} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                Network Signal
              </p>
            </div>

            <p className="font-mono text-xs text-white/45 leading-relaxed mb-5">
              Deze module wordt later verbonden met echte XRPL-data. Voor nu
              bouwen we de interface, structuur en educatielaag zodat de app
              straks snel kan groeien.
            </p>

            <div className="space-y-3">
              <SignalLine label="Mainnet monitoring" status="Soon" />
              <SignalLine label="UNL visibility" status="Planned" />
              <SignalLine label="Validator uptime" status="Planned" />
              <SignalLine label="Amendment alerts" status="Planned" />
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={18} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                AI Governance Explainer
              </p>
            </div>

            <p className="font-mono text-xs text-white/45 leading-relaxed">
              Later kan AI moeilijke governance onderwerpen simpel uitleggen:
              wat een amendment doet, waarom validators stemmen en wat het
              betekent voor gebruikers, builders en bedrijven.
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
              {validatorRoadmap.map((item) => (
                <RoadmapLine key={item} label={item} />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <FeatureBox icon={CheckCircle2} title="Uptime" text="Validator health" />
          <FeatureBox icon={Vote} title="Voting" text="Amendment support" />
          <FeatureBox icon={AlertTriangle} title="Alerts" text="Network warnings" />
          <FeatureBox icon={BadgeCheck} title="Trust" text="Education first" />
        </div>
      </div>
    </div>
  );
}

function MetricBox({ metric }: { metric: NetworkMetric }) {
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

      <p className="font-mono text-[10px] text-white/30">{metric.subtitle}</p>
    </div>
  );
}

function ValidatorRow({ validator }: { validator: Validator }) {
  return (
    <div className="border border-white/10 bg-black p-4 hover:bg-white/[0.03] transition-all">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-orbitron text-sm font-bold uppercase mb-1">
            {validator.name}
          </p>

          <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest">
            {validator.region} • {validator.role}
          </p>
        </div>

        <div className="text-right">
          <p className="font-orbitron text-sm font-black uppercase mb-1">
            {validator.uptime}
          </p>

          <p className="font-mono text-[10px] text-white/35 uppercase">
            {validator.status}
          </p>
        </div>
      </div>
    </div>
  );
}

function AmendmentCard({ amendment }: { amendment: Amendment }) {
  return (
    <div className="border border-white/10 bg-black p-5 hover:bg-white/[0.03] transition-all">
      <div className="flex items-start justify-between mb-4">
        <Vote size={20} className="text-white/70" />

        <span className="font-mono text-[10px] uppercase text-white/45">
          {amendment.status}
        </span>
      </div>

      <h4 className="font-orbitron text-sm font-bold uppercase mb-2">
        {amendment.title}
      </h4>

      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-4">
        {amendment.support}
      </p>

      <p className="font-mono text-xs text-white/45 leading-relaxed">
        {amendment.description}
      </p>
    </div>
  );
}

function EducationBox({
  icon: Icon,
  title,
  text,
}: {
  icon: ElementType;
  title: string;
  text: string;
}) {
  return (
    <div className="border border-white/10 bg-black p-5">
      <Icon size={19} className="text-white/60 mb-4" />

      <p className="font-orbitron text-sm font-bold uppercase mb-2">{title}</p>

      <p className="font-mono text-xs text-white/40 leading-relaxed">{text}</p>
    </div>
  );
}

function SignalLine({ label, status }: { label: string; status: string }) {
  return (
    <div className="border border-white/10 bg-black p-3 flex items-center justify-between gap-3">
      <p className="font-mono text-xs text-white/50">{label}</p>

      <p className="font-mono text-[10px] text-white/35 uppercase">{status}</p>
    </div>
  );
}

function RoadmapLine({ label }: { label: string }) {
  return (
    <div className="border-b border-white/10 pb-3 last:border-b-0 last:pb-0">
      <p className="font-mono text-xs text-white/45 leading-relaxed">{label}</p>
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
