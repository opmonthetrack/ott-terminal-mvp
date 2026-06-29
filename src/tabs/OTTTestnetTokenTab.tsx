import { useEffect, useState } from "react";
import type { ElementType } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  Coins,
  Database,
  Fingerprint,
  Gift,
  History,
  Layers,
  Lock,
  Radio,
  Send,
  ShieldCheck,
  TestTube2,
  Trophy,
  Wallet,
  Waves,
  Zap,
} from "lucide-react";
import {
  MAKE_WAVES_SOURCE_TAG,
  type MakeWavesActionId,
} from "../lib/makeWaves";
import {
  addTestnetTokenSimulation,
  getAvailableRewardActions,
  loadRewardState,
  type RewardEvent,
  type RewardState,
} from "../lib/rewardStore";

type OTTTestnetTokenTabProps = {
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

const testnetRules: Rule[] = [
  {
    title: "Testnet Only",
    status: "Safe",
    text: "Deze module simuleert OTT token rewards zonder mainnet waarde.",
    icon: TestTube2,
  },
  {
    title: "No Mainnet Airdrop",
    status: "Locked",
    text: "Mainnet OTT token distributie blijft uit tot legal review klaar is.",
    icon: Lock,
  },
  {
    title: "SourceTag Proof",
    status: "2606170002",
    text: `Reward simulaties blijven gekoppeld aan SourceTag ${MAKE_WAVES_SOURCE_TAG}.`,
    icon: Fingerprint,
  },
  {
    title: "Utility First",
    status: "Rule",
    text: "OTT token blijft gepositioneerd als utility/access/reward, niet als investering.",
    icon: ShieldCheck,
  },
  {
    title: "No Price Talk",
    status: "Guard",
    text: "Geen beloftes over waarde, rendement, winst of prijsverwachting.",
    icon: AlertTriangle,
  },
];

export function OTTTestnetTokenTab({ walletAddress }: OTTTestnetTokenTabProps) {
  const actions = getAvailableRewardActions();
  const [rewardState, setRewardState] = useState<RewardState>(() =>
    loadRewardState(walletAddress)
  );
  const [selectedActionId, setSelectedActionId] = useState<MakeWavesActionId>(
    "daily-checkin"
  );
  const [issuerWallet, setIssuerWallet] = useState("rTESTNET_OTT_ISSUER");
  const [currencyCode, setCurrencyCode] = useState("OTT");
  const [tokenAmount, setTokenAmount] = useState("10");
  const [statusMessage, setStatusMessage] = useState(
    "Testnet OTT token simulation ready."
  );

  useEffect(() => {
    setRewardState(loadRewardState(walletAddress));
  }, [walletAddress]);

  const lastEvent = rewardState.events.find(
    (event) => event.type === "testnet-token-simulated"
  );

  const metrics: Metric[] = [
    {
      label: "SourceTag",
      value: String(MAKE_WAVES_SOURCE_TAG),
      text: "Make Waves proof.",
      icon: Fingerprint,
    },
    {
      label: "Testnet OTT",
      value: String(rewardState.testnetTokenSimulated),
      text: "Simulated reward score.",
      icon: Coins,
    },
    {
      label: "Total XP",
      value: String(rewardState.totalXp),
      text: "Terminal XP balance.",
      icon: Trophy,
    },
    {
      label: "Mainnet",
      value: "Locked",
      text: "Legal gate first.",
      icon: Lock,
    },
  ];

  function simulateTestnetReward() {
    const nextState = addTestnetTokenSimulation({
      walletAddress,
      actionId: selectedActionId,
      note: `${tokenAmount} ${currencyCode} testnet reward simulated for ${selectedActionId}.`,
    });

    setRewardState(nextState);
    setStatusMessage(
      `${tokenAmount} ${currencyCode} testnet reward simulated. Mainnet remains locked.`
    );
  }

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 mb-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="flex items-center gap-2 mb-4 text-white/45">
              <TestTube2 size={17} />

              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                OTT Testnet Token
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              Simulate Rewards Before Mainnet
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              Testnet laag voor OTT token rewards. Hiermee kun je het verhaal,
              reward logic en ledger activiteit voorbereiden zonder mainnet
              distributie of juridische druk.
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
                Reward Action
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

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <ShieldCheck size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Safety Rules
              </p>
            </div>

            <div className="space-y-3">
              {testnetRules.map((rule) => (
                <RuleCard key={rule.title} rule={rule} />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-5 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Wallet size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Testnet Token Setup
              </p>
            </div>

            <InputField
              label="Reward Wallet"
              value={walletAddress}
              readOnly
              onChange={() => undefined}
            />

            <div className="h-4" />

            <InputField
              label="Testnet Issuer Wallet"
              value={issuerWallet}
              onChange={setIssuerWallet}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <InputField
                label="Currency Code"
                value={currencyCode}
                onChange={setCurrencyCode}
              />

              <InputField
                label="Token Amount"
                value={tokenAmount}
                onChange={setTokenAmount}
              />
            </div>

            <button
              onClick={simulateTestnetReward}
              className="w-full bg-white text-black py-4 mt-5 font-orbitron text-xs font-black uppercase tracking-widest hover:bg-white/80 transition-all flex items-center justify-center gap-2"
            >
              <Send size={16} />
              Simulate OTT Testnet Reward
            </button>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Radio size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Simulation Status
              </p>
            </div>

            <div className="border border-white/10 bg-black p-5 mb-4">
              <p className="font-mono text-xs text-white/50 leading-relaxed">
                {statusMessage}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <MiniStatus label="Token" value={currencyCode || "OTT"} />
              <MiniStatus label="Amount" value={tokenAmount || "0"} />
              <MiniStatus label="Issuer" value={issuerWallet || "None"} />
              <MiniStatus label="Mode" value="Testnet Only" />
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Database size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Reward Ledger Snapshot
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <MiniStatus label="Total XP" value={String(rewardState.totalXp)} />
              <MiniStatus
                label="OTT Eligible"
                value={String(rewardState.ottTokenEligibleXp)}
              />
              <MiniStatus
                label="Testnet Sim"
                value={String(rewardState.testnetTokenSimulated)}
              />
              <MiniStatus
                label="Events"
                value={String(rewardState.events.length)}
              />
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-3 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <History size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Last Testnet Event
              </p>
            </div>

            {lastEvent ? (
              <EventCard event={lastEvent} />
            ) : (
              <EmptyState text="Nog geen testnet token simulatie." />
            )}
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <BadgeCheck size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Next Build Steps
              </p>
            </div>

            <div className="space-y-3">
              <ChecklistLine text="Add real testnet issuer wallet" />
              <ChecklistLine text="Build trustline payload" />
              <ChecklistLine text="Build testnet token payment" />
              <ChecklistLine text="Verify token tx hash" />
              <ChecklistLine text="Keep mainnet locked" />
            </div>
          </div>
        </div>

        <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <FeatureBox icon={TestTube2} title="Testnet" text="Safe simulation" />
          <FeatureBox icon={Coins} title="OTT" text="Token flow preview" />
          <FeatureBox icon={Gift} title="Rewards" text="After proof" />
          <FeatureBox icon={Lock} title="Mainnet" text="Still locked" />
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

function InputField({
  label,
  value,
  readOnly,
  onChange,
}: {
  label: string;
  value: string;
  readOnly?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
        {label}
      </p>

      <input
        value={value}
        readOnly={readOnly}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-black border border-white/10 px-4 py-4 font-mono text-xs text-white/70 outline-none focus:border-white/30 placeholder:text-white/20"
      />
    </label>
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

function EventCard({ event }: { event: RewardEvent }) {
  return (
    <div className="border border-white/10 bg-black p-4">
      <p className="font-orbitron text-xs font-bold uppercase mb-2">
        {event.type}
      </p>

      <p className="font-mono text-[10px] text-white/35 uppercase mb-3">
        {event.actionId} • +{event.xp}
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
