import { useState } from "react";
import type { ElementType } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  Fingerprint,
  Gauge,
  Globe2,
  Layers,
  Lock,
  Network,
  Radio,
  ScanLine,
  Server,
  ShieldCheck,
  Signal,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  Vote,
  Waves,
  Zap,
} from "lucide-react";

type NetworkMetric = {
  label: string;
  value: string;
  subtitle: string;
  icon: ElementType;
};

type NetworkLayer = {
  id: string;
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

type LedgerEvent = {
  title: string;
  status: string;
  time: string;
  text: string;
};

type HealthRule = {
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

const metrics: NetworkMetric[] = [
  {
    label: "Ledger",
    value: "Live",
    subtitle: "Mock monitor",
    icon: Database,
  },
  {
    label: "Consensus",
    value: "Active",
    subtitle: "XRPL health",
    icon: Network,
  },
  {
    label: "Close Time",
    value: "~4 sec",
    subtitle: "Education view",
    icon: Timer,
  },
  {
    label: "Source Tag",
    value: "2606",
    subtitle: "Make Waves",
    icon: Fingerprint,
  },
];

const layers: NetworkLayer[] = [
  {
    id: "ledger",
    title: "Ledger State",
    status: "Core",
    text: "Laat later live ledger index, close time, validated ledgers en network availability zien.",
    icon: Database,
  },
  {
    id: "consensus",
    title: "Consensus Layer",
    status: "Active",
    text: "Maakt duidelijk hoe XRPL validators consensus bereiken zonder mining of proof-of-work.",
    icon: Signal,
  },
  {
    id: "transactions",
    title: "Transaction Flow",
    status: "Track",
    text: "Volgt later payments, trustlines, AMM actions, NFT badges en source-tagged activiteit.",
    icon: Activity,
  },
  {
    id: "amendments",
    title: "Amendments",
    status: "Governance",
    text: "Toont later protocol changes, voting status, activatie en impact op gebruikers.",
    icon: Vote,
  },
  {
    id: "performance",
    title: "Performance",
    status: "Metrics",
    text: "Meet later ledger close time, throughput, failed transactions en latency trends.",
    icon: Gauge,
  },
  {
    id: "alerts",
    title: "Network Alerts",
    status: "Safety",
    text: "Geeft waarschuwingen bij network issues, issuer risk, wallet risk of abnormal activity.",
    icon: AlertTriangle,
  },
];

const ledgerEvents: LedgerEvent[] = [
  {
    title: "Validated Ledger",
    status: "Mock",
    time: "Now",
    text: "Latest validated ledger information will appear here after live XRPL API connection.",
  },
  {
    title: "Consensus Round",
    status: "Healthy",
    time: "Recent",
    text: "Consensus education layer shows how validators agree on the next ledger state.",
  },
  {
    title: "Source Tag Activity",
    status: "2606",
    time: "Today",
    text: "Make Waves transactions with source tag 2606 will later be tracked here.",
  },
  {
    title: "Amendment Watch",
    status: "Monitor",
    time: "This week",
    text: "Protocol amendment changes can later be surfaced as clear user-friendly notes.",
  },
];

const healthRules: HealthRule[] = [
  {
    title: "Validated Data Only",
    status: "Rule",
    text: "Network state should use validated ledger data when we connect the real XRPL API.",
    icon: ShieldCheck,
  },
  {
    title: "No Panic Alerts",
    status: "Safety",
    text: "Alerts must explain what happened without hype or fear language.",
    icon: AlertTriangle,
  },
  {
    title: "Explain Before Action",
    status: "UX",
    text: "Users should understand network status before taking wallet or DeFi actions.",
    icon: Sparkles,
  },
  {
    title: "Backend For Keys",
    status: "Security",
    text: "API keys and private service config stay backend only, never in frontend.",
    icon: Lock,
  },
];

const roadmap = [
  "Live XRPL websocket koppelen",
  "Ledger index tonen",
  "Validated close time tonen",
  "Network health score maken",
  "Transaction feed toevoegen",
  "Source tag 2606 monitor koppelen",
  "Amendment watch live maken",
  "AI network explainer toevoegen",
];

export function NetworkState() {
  const [selectedLayer, setSelectedLayer] = useState<NetworkLayer>(layers[0]);
  const [selectedEvent, setSelectedEvent] = useState<LedgerEvent>(ledgerEvents[0]);

  const SelectedLayerIcon = selectedLayer.icon;

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 mb-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="flex items-center gap-2 mb-4 text-white/45">
              <Radio size={17} />

              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                XRPL Network State
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              Ledger Health In Plain Language
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              De network-state laag van OTT Terminal. Hier komen ledger health,
              consensus, validated data, transaction flow, amendments, alerts en
              source tag 2606 activiteit samen.
            </p>
          </div>

          <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-3">
            {metrics.map((metric) => (
              <MetricBox key={metric.label} metric={metric} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-4 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Layers size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Network Layers
              </p>
            </div>

            <div className="space-y-3">
              {layers.map((layer) => (
                <LayerButton
                  key={layer.id}
                  layer={layer}
                  active={selectedLayer.id === layer.id}
                  onClick={() => setSelectedLayer(layer)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-5 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Selected Layer
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  {selectedLayer.title}
                </h3>
              </div>

              <SelectedLayerIcon size={22} className="text-white/60" />
            </div>

            <p className="font-mono text-sm text-white/45 leading-relaxed mb-5">
              {selectedLayer.text}
            </p>

            <MiniStatus label="Status" value={selectedLayer.status} />
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Ledger Events
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  Network Feed
                </h3>
              </div>

              <ScanLine size={20} className="text-white/60" />
            </div>

            <div className="space-y-3">
              {ledgerEvents.map((event) => (
                <EventRow
                  key={`${event.title}-${event.time}`}
                  event={event}
                  active={selectedEvent.title === event.title}
                  onClick={() => setSelectedEvent(event)}
                />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Target size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Selected Event
              </p>
            </div>

            <p className="font-orbitron text-2xl font-black uppercase mb-2">
              {selectedEvent.title}
            </p>

            <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-4">
              {selectedEvent.status} • {selectedEvent.time}
            </p>

            <p className="font-mono text-sm text-white/45 leading-relaxed">
              {selectedEvent.text}
            </p>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-3 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <ShieldCheck size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Health Rules
              </p>
            </div>

            <div className="space-y-3">
              {healthRules.map((rule) => (
                <RuleCard key={rule.title} rule={rule} />
              ))}
            </div>
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
          <FeatureBox icon={Globe2} title="Mainnet" text="XRPL network focus" />
          <FeatureBox icon={Server} title="Nodes" text="Validator layer" />
          <FeatureBox icon={TrendingUp} title="Health" text="Score later" />
          <FeatureBox icon={Waves} title="2606" text="Make Waves tracking" />
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

      <p className="font-mono text-[10px] text-white/30 uppercase">
        {metric.subtitle}
      </p>
    </div>
  );
}

function LayerButton({
  layer,
  active,
  onClick,
}: {
  layer: NetworkLayer;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = layer.icon;

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
        <div className="flex items-center gap-3">
          <Icon size={16} className="text-white/60" />

          <p className="font-orbitron text-xs font-bold uppercase">
            {layer.title}
          </p>
        </div>

        <p className="font-mono text-[10px] text-white/35 uppercase">
          {layer.status}
        </p>
      </div>
    </button>
  );
}

function EventRow({
  event,
  active,
  onClick,
}: {
  event: LedgerEvent;
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
      <div className="flex items-center justify-between gap-4 mb-2">
        <p className="font-orbitron text-sm font-bold uppercase">
          {event.title}
        </p>

        <p className="font-mono text-[10px] text-white/45 uppercase">
          {event.status}
        </p>
      </div>

      <p className="font-mono text-[10px] text-white/35 uppercase">
        {event.time}
      </p>
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

function RuleCard({ rule }: { rule: HealthRule }) {
  const Icon = rule.icon;

  return (
    <div className="border border-white/10 bg-black p-4">
      <div className="flex items-start justify-between mb-3">
        <Icon size={17} className="text-white/60" />

        <p className="font-mono text-[10px] text-white/30 uppercase">
          {rule.status}
        </p>
      </div>

      <p className="font-orbitron text-xs font-bold uppercase mb-2">
        {rule.title}
      </p>

      <p className="font-mono text-[10px] text-white/40 leading-relaxed">
        {rule.text}
      </p>
    </div>
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
