import { useEffect, useState } from "react";
import type { ElementType } from "react";
import {
  Activity,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  Coins,
  Database,
  Fingerprint,
  Gauge,
  Globe2,
  Lock,
  Radio,
  Rocket,
  ShieldCheck,
  Sparkles,
  Terminal,
  Trophy,
  Wallet,
  Waves,
  Zap,
} from "lucide-react";
import {
  MAKE_WAVES_ACTIONS,
  MAKE_WAVES_SOURCE_TAG,
} from "../lib/makeWaves";
import {
  loadRewardState,
  type RewardEvent,
  type RewardState,
} from "../lib/rewardStore";

type DashboardTabProps = {
  walletAddress: string;
};

type DashboardMetric = {
  label: string;
  value: string;
  text: string;
  icon: ElementType;
};

type ModuleCard = {
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

const modules: ModuleCard[] = [
  {
    title: "Daily Check-In",
    status: "XP",
    text: "Maak Xaman proof en schrijf XP naar Reward Ledger.",
    icon: Activity,
  },
  {
    title: "XRPL Verify",
    status: "Proof",
    text: "Controleer live tx hashes op SourceTag 2606170002.",
    icon: Fingerprint,
  },
  {
    title: "Reward Ledger",
    status: "Store",
    text: "Bekijk XP, OTT eligibility en legal-gated rewards.",
    icon: Database,
  },
  {
    title: "Reward Policy",
    status: "Legal",
    text: "Houd mainnet OTT token rewards veilig achter legal gate.",
    icon: ShieldCheck,
  },
  {
    title: "Xaman Center",
    status: "Sign",
    text: "Centrale plek voor payloads, signing en verification.",
    icon: Wallet,
  },
  {
    title: "Launch Control",
    status: "Demo",
    text: "Gebruik dit als Make Waves pitch/demo cockpit.",
    icon: Rocket,
  },
];

export function DashboardTab({ walletAddress }: DashboardTabProps) {
  const [rewardState, setRewardState] = useState<RewardState>(() =>
    loadRewardState(walletAddress)
  );

  useEffect(() => {
    setRewardState(loadRewardState(walletAddress));
  }, [walletAddress]);

  const lastEvent = rewardState.events[0] ?? null;

  const metrics: DashboardMetric[] = [
    {
      label: "SourceTag",
      value: String(MAKE_WAVES_SOURCE_TAG),
      text: "Make Waves proof tag.",
      icon: Fingerprint,
    },
    {
      label: "Total XP",
      value: String(rewardState.totalXp),
      text: "Off-chain terminal score.",
      icon: Trophy,
    },
    {
      label: "OTT Eligible",
      value: String(rewardState.ottTokenEligibleXp),
      text: "Legal-gated reward score.",
      icon: Coins,
    },
    {
      label: "Mainnet OTT",
      value: rewardState.mainnetTokenLocked ? "Locked" : "Open",
      text: "No airdrop before legal gate.",
      icon: Lock,
    },
  ];

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 mb-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="flex items-center gap-2 mb-4 text-white/45">
              <Terminal size={17} />

              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                Dashboard
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              XRPL OnTheTrack Command Center
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              Overzicht van je Make Waves MVP: SourceTag proof, Xaman signing,
              XP, OTT eligibility en legal-gated mainnet rewards.
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
              <Wallet size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Wallet State
              </p>
            </div>

            <MiniStatus label="Wallet" value={walletAddress} />
            <div className="h-3" />
            <MiniStatus label="Reward Events" value={String(rewardState.events.length)} />
            <div className="h-3" />
            <MiniStatus label="Updated" value={rewardState.updatedAt} />
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Waves size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Make Waves Actions
              </p>
            </div>

            <div className="space-y-3">
              {MAKE_WAVES_ACTIONS.map((action) => (
                <ActionLine
                  key={action.id}
                  label={action.title}
                  xp={action.xp}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-5 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Gauge size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Build Progress
              </p>
            </div>

            <ProgressRow label="Frontend MVP" value="90%" />
            <ProgressRow label="Xaman Flow" value="65%" />
            <ProgressRow label="SourceTag Proof" value="70%" />
            <ProgressRow label="Reward Ledger" value="45%" />
            <ProgressRow label="AIKit Layer" value="0%" />
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Core Modules
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {modules.map((module) => (
                <ModuleBox key={module.title} module={module} />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-3 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Radio size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Last Reward Event
              </p>
            </div>

            {lastEvent ? (
              <EventPreview event={lastEvent} />
            ) : (
              <EmptyState text="Nog geen reward event voor deze wallet." />
            )}
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <BadgeCheck size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Next Best Steps
              </p>
            </div>

            <div className="space-y-3">
              <ChecklistLine text="Set XAMAN_API_KEY in Vercel" />
              <ChecklistLine text="Set XAMAN_API_SECRET in Vercel" />
              <ChecklistLine text="Test Daily Check-In payload" />
              <ChecklistLine text="Verify real XRPL tx hash" />
              <ChecklistLine text="Keep OTT mainnet locked" />
            </div>
          </div>
        </div>

        <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <FeatureBox icon={Zap} title="XP" text="Visible in terminal" />
          <FeatureBox icon={Coins} title="OTT" text="Eligibility only" />
          <FeatureBox icon={Globe2} title="XRPL" text="More tx proof" />
          <FeatureBox icon={BookOpen} title="Demo" text="Ready for pitch" />
        </div>
      </div>
    </div>
  );
}

function MetricBox({ metric }: { metric: DashboardMetric }) {
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

function MiniStatus({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/10 bg-black p-4">
      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
        {label}
      </p>

      <p className="font-orbitron text-sm font-black uppercase break-all">
        {value}
      </p>
    </div>
  );
}

function ActionLine({ label, xp }: { label: string; xp: number }) {
  return (
    <div className="border border-white/10 bg-black p-3 flex items-center justify-between gap-3">
      <p className="font-mono text-xs text-white/50">{label}</p>

      <p className="font-mono text-[10px] text-white/35 uppercase">+{xp} XP</p>
    </div>
  );
}

function ProgressRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/10 bg-black p-4 mb-3">
      <div className="flex items-center justify-between gap-4 mb-3">
        <p className="font-orbitron text-xs font-bold uppercase">{label}</p>

        <p className="font-mono text-[10px] text-white/40 uppercase">{value}</p>
      </div>

      <div className="h-1 bg-white/10 overflow-hidden">
        <div className="h-full bg-white" style={{ width: value }} />
      </div>
    </div>
  );
}

function ModuleBox({ module }: { module: ModuleCard }) {
  const Icon = module.icon;

  return (
    <div className="border border-white/10 bg-black p-4">
      <div className="flex items-start justify-between mb-3">
        <Icon size={18} className="text-white/60" />

        <p className="font-mono text-[10px] text-white/30 uppercase">
          {module.status}
        </p>
      </div>

      <p className="font-orbitron text-xs font-bold uppercase mb-2">
        {module.title}
      </p>

      <p className="font-mono text-[10px] text-white/40 leading-relaxed">
        {module.text}
      </p>
    </div>
  );
}

function EventPreview({ event }: { event: RewardEvent }) {
  return (
    <div className="border border-white/10 bg-black p-4">
      <p className="font-orbitron text-xs font-bold uppercase mb-2">
        {event.type}
      </p>

      <p className="font-mono text-[10px] text-white/35 uppercase mb-3">
        {event.actionId} • +{event.xp} XP
      </p>

      <p className="font-mono text-xs text-white/45 leading-relaxed mb-3">
        {event.note}
      </p>

      <p className="font-mono text-[10px] text-white/30 uppercase">
        {event.createdAt}
      </p>
    </div>
  );
}

function ChecklistLine({ text }: { text: string }) {
  return (
    <div className="border border-white/10 bg-black p-3 flex items-center gap-2">
      <CheckCircle2 size={14} className="text-white/60" />

      <p className="font-mono text-xs text-white/50">{text}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="border border-white/10 bg-black p-4">
      <p className="font-mono text-xs text-white/35 leading-relaxed">{text}</p>
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

      <p className="font-mono text-xs text-white/40 break-all">{text}</p>
    </div>
  );
}
