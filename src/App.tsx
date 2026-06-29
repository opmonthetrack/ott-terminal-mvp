import { useEffect, useState } from "react";
import type { ElementType } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  Coins,
  Database,
  Eraser,
  Fingerprint,
  Gift,
  History,
  Layers,
  Lock,
  Radio,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  TestTube2,
  Trophy,
  Wallet,
  Zap,
} from "lucide-react";
import { MAKE_WAVES_SOURCE_TAG, type MakeWavesActionId } from "../lib/makeWaves";
import {
  addMainnetLockedEvent,
  addTestnetTokenSimulation,
  addXpRewardEvent,
  clearRewardState,
  getAvailableRewardActions,
  loadRewardState,
  type RewardEvent,
  type RewardState,
} from "../lib/rewardStore";

type RewardLedgerTabProps = {
  walletAddress: string;
};

type Metric = {
  label: string;
  value: string;
  text: string;
  icon: ElementType;
};

type Rule = {
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

const rules: Rule[] = [
  {
    title: "XP First",
    status: "Safe MVP",
    text: "XP wordt lokaal bijgehouden in de terminal zonder mainnet token transfer.",
    icon: Zap,
  },
  {
    title: "OTT Eligibility",
    status: "Tracked",
    text: "Geverifieerde acties kunnen eligibility opbouwen voor latere OTT rewards.",
    icon: BadgeCheck,
  },
  {
    title: "Mainnet Locked",
    status: "Legal Gate",
    text: "Mainnet OTT token airdrops blijven locked tot juridische check klaar is.",
    icon: Lock,
  },
  {
    title: "SourceTag Proof",
    status: "2606170002",
    text: `Reward events horen aan SourceTag ${MAKE_WAVES_SOURCE_TAG} gekoppeld te zijn.`,
    icon: Fingerprint,
  },
];

export function RewardLedgerTab({ walletAddress }: RewardLedgerTabProps) {
  const actions = getAvailableRewardActions();
  const [rewardState, setRewardState] = useState<RewardState>(() =>
    loadRewardState(walletAddress)
  );
  const [selectedActionId, setSelectedActionId] = useState<MakeWavesActionId>(
    "daily-checkin"
  );

  useEffect(() => {
    setRewardState(loadRewardState(walletAddress));
  }, [walletAddress]);

  const metrics: Metric[] = [
    {
      label: "Total XP",
      value: String(rewardState.totalXp),
      text: "Terminal reward points.",
      icon: Trophy,
    },
    {
      label: "OTT Eligible",
      value: String(rewardState.ottTokenEligibleXp),
      text: "Eligibility score, not a claim.",
      icon: Coins,
    },
    {
      label: "Testnet Sim",
      value: String(rewardState.testnetTokenSimulated),
      text: "OTT token test flow only.",
      icon: TestTube2,
    },
    {
      label: "Mainnet",
      value: rewardState.mainnetTokenLocked ? "Locked" : "Open",
      text: "Legal gate status.",
      icon: ShieldCheck,
    },
  ];

  function refresh() {
    setRewardState(loadRewardState(walletAddress));
  }

  function addXp() {
    const next = addXpRewardEvent({
      walletAddress,
      actionId: selectedActionId,
      note: `Manual MVP reward event for ${selectedActionId}.`,
    });

    setRewardState(next);
  }

  function addTestnet() {
    const next = addTestnetTokenSimulation({
      walletAddress,
      actionId: selectedActionId,
    });

    setRewardState(next);
  }

  function lockMainnet() {
    const next = addMainnetLockedEvent({
      walletAddress,
      actionId: selectedActionId,
    });

    setRewardState(next);
  }

  function resetWalletRewards() {
    clearRewardState(walletAddress);
    setRewardState(loadRewardState(walletAddress));
  }

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 mb-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="flex items-center gap-2 mb-4 text-white/45">
              <Database size={17} />

              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                Reward Ledger
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              XP Ledger + OTT Eligibility
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              Lokale MVP reward ledger voor XP, testnet OTT simulatie en
              legal-gated mainnet token rewards. Geen mainnet airdrop zonder
              extra check.
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
                Wallet Reward State
              </p>
            </div>

            <MiniStatus label="Wallet" value={rewardState.walletAddress} />
            <div className="h-3" />
            <MiniStatus label="SourceTag" value={String(rewardState.sourceTag)} />
            <div className="h-3" />
            <MiniStatus label="Updated" value={rewardState.updatedAt} />
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Layers size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Select Action
              </p>
            </div>

            <div className="space-y-3">
              {actions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => setSelectedActionId(action.id)}
                  className={`w-full border p-4 text-left transition-all ${
                    selectedActionId === action.id
                      ? "border-white/30 bg-white/[0.08]"
                      : "border-white/10 bg-black hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-orbitron text-xs font-bold uppercase">
                      {action.title}
                    </p>

                    <p className="font-mono text-[10px] text-white/35 uppercase">
                      +{action.xp} XP
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-5 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Reward Controls
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <ActionButton
                icon={Zap}
                title="Add XP"
                text="Off-chain XP + eligibility"
                onClick={addXp}
              />

              <ActionButton
                icon={TestTube2}
                title="Testnet Sim"
                text="OTT token simulation"
                onClick={addTestnet}
              />

              <ActionButton
                icon={Lock}
                title="Lock Mainnet"
                text="Legal gate event"
                onClick={lockMainnet}
              />

              <ActionButton
                icon={RefreshCcw}
                title="Refresh"
                text="Reload local state"
                onClick={refresh}
              />
            </div>

            <button
              onClick={resetWalletRewards}
              className="w-full border border-white/10 bg-black p-4 mt-4 text-left hover:bg-white/[0.03] transition-all"
            >
              <div className="flex items-center gap-3">
                <Eraser size={17} className="text-white/60" />

                <div>
                  <p className="font-orbitron text-xs font-bold uppercase">
                    Reset Wallet Rewards
                  </p>

                  <p className="font-mono text-[10px] text-white/35 uppercase">
                    Alleen lokale MVP data wissen
                  </p>
                </div>
              </div>
            </button>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <History size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Reward Events
              </p>
            </div>

            {rewardState.events.length > 0 ? (
              <div className="space-y-3">
                {rewardState.events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <EmptyState text="Nog geen reward events voor deze wallet." />
            )}
          </div>
        </div>

        <div className="col-span-12 xl:col-span-3 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <ShieldCheck size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Reward Rules
              </p>
            </div>

            <div className="space-y-3">
              {rules.map((rule) => (
                <RuleCard key={rule.title} rule={rule} />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Radio size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Summary
              </p>
            </div>

            <div className="space-y-3">
              <MiniStatus label="Events" value={String(rewardState.events.length)} />
              <MiniStatus label="Mainnet Token" value="Locked" />
              <MiniStatus label="Mode" value="Local MVP" />
            </div>
          </div>
        </div>

        <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <FeatureBox icon={Zap} title="XP" text="Visible now" />
          <FeatureBox icon={Coins} title="OTT" text="Eligibility only" />
          <FeatureBox icon={TestTube2} title="Testnet" text="Simulation next" />
          <FeatureBox icon={AlertTriangle} title="Mainnet" text="Legal gate" />
        </div>
      </div>
    </div>
  );
}

function MetricBox({ metric }: { metric: Metric }) {
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

function ActionButton({
  icon: Icon,
  title,
  text,
  onClick,
}: {
  icon: ElementType;
  title: string;
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="border border-white/10 bg-black p-4 text-left hover:bg-white/[0.03] transition-all"
    >
      <Icon size={18} className="text-white/60 mb-3" />

      <p className="font-orbitron text-xs font-bold uppercase mb-2">{title}</p>

      <p className="font-mono text-[10px] text-white/35 uppercase">{text}</p>
    </button>
  );
}

function EventCard({ event }: { event: RewardEvent }) {
  return (
    <div className="border border-white/10 bg-black p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="font-orbitron text-xs font-bold uppercase">
            {event.type}
          </p>

          <p className="font-mono text-[10px] text-white/35 uppercase">
            {event.actionId} • +{event.xp} XP
          </p>
        </div>

        <Gift size={17} className="text-white/60" />
      </div>

      <p className="font-mono text-xs text-white/45 leading-relaxed mb-3">
        {event.note}
      </p>

      <p className="font-mono text-[10px] text-white/30 uppercase break-all">
        {event.createdAt}
      </p>
    </div>
  );
}

function RuleCard({ rule }: { rule: Rule }) {
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
