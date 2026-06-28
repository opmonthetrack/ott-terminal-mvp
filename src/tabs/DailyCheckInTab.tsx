import { useState } from "react";
import type { ElementType } from "react";
import {
  Activity,
  BadgeCheck,
  CheckCircle2,
  Clock,
  Coins,
  Flame,
  Gift,
  Lock,
  Radio,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Wallet,
  Waves,
  Zap,
} from "lucide-react";

type DailyCheckInTabProps = {
  walletAddress: string;
};

type Step = {
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

type Reward = {
  title: string;
  value: string;
  status: string;
  icon: ElementType;
};

const steps: Step[] = [
  {
    title: "Open Terminal",
    status: "Live",
    text: "Gebruiker opent dagelijks de OTT Terminal en ziet zijn wallet/profiel.",
    icon: Activity,
  },
  {
    title: "Read Daily Signal",
    status: "Mock",
    text: "Gebruiker leest korte XRPL briefing, safety tip of Academy item.",
    icon: Sparkles,
  },
  {
    title: "Complete Check-In",
    status: "Mock",
    text: "Gebruiker voltooit een off-chain check-in voor XP en streak.",
    icon: CheckCircle2,
  },
  {
    title: "Xaman Mainnet Action",
    status: "Later",
    text: "Later wordt dit een echte Xaman transactie met source tag 2606.",
    icon: Wallet,
  },
];

const rewards: Reward[] = [
  {
    title: "Daily XP",
    value: "+10 XP",
    status: "Live Mock",
    icon: Zap,
  },
  {
    title: "Streak Bonus",
    value: "+5 XP",
    status: "3+ Days",
    icon: Flame,
  },
  {
    title: "Badge Progress",
    value: "1 Step",
    status: "Active",
    icon: BadgeCheck,
  },
  {
    title: "Future OTT",
    value: "+1 OTT",
    status: "Later",
    icon: Coins,
  },
];

function shortAddress(address: string) {
  if (!address) return "Unknown";
  if (address.length <= 18) return address;
  return `${address.slice(0, 9)}...${address.slice(-7)}`;
}

export function DailyCheckInTab({ walletAddress }: DailyCheckInTabProps) {
  const [checkedIn, setCheckedIn] = useState(false);
  const [readSignal, setReadSignal] = useState(false);
  const [safetyConfirmed, setSafetyConfirmed] = useState(false);

  const xp = 130 + (readSignal ? 5 : 0) + (safetyConfirmed ? 5 : 0) + (checkedIn ? 10 : 0);
  const streak = checkedIn ? 4 : 3;
  const progress = [readSignal, safetyConfirmed, checkedIn].filter(Boolean).length;

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 mb-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="flex items-center gap-2 mb-4 text-white/45">
              <Waves size={17} />
              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                Make Waves Daily Check-In
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              Daily Action. Real Users.
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              De dagelijkse activatie-laag van OTT Terminal. Eerst veilig als
              off-chain XP en streak systeem. Later koppelen we dit aan Xaman
              met een mainnet transactie en source tag 2606.
            </p>
          </div>

          <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-3">
            <StatBox icon={Wallet} label="Wallet" value={shortAddress(walletAddress)} />
            <StatBox icon={Zap} label="OTT XP" value={`${xp} XP`} />
            <StatBox icon={Flame} label="Streak" value={`${streak} Days`} />
            <StatBox icon={Radio} label="Source Tag" value="2606" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-8 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Today&apos;s Check-In
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  Complete Daily Flow
                </h3>
              </div>

              <Target size={20} className="text-white/60" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              <ActionCard
                title="Read Signal"
                text="Lees de dagelijkse XRPL safety/intel note."
                active={readSignal}
                buttonLabel={readSignal ? "Read +5 XP" : "Mark As Read"}
                onClick={() => setReadSignal(true)}
              />

              <ActionCard
                title="Safety Confirm"
                text="Bevestig dat je geen automatische signing verwacht."
                active={safetyConfirmed}
                buttonLabel={safetyConfirmed ? "Confirmed +5 XP" : "Confirm Safety"}
                onClick={() => setSafetyConfirmed(true)}
              />

              <ActionCard
                title="Daily Check-In"
                text="Voltooi je dagelijkse aanwezigheid in de terminal."
                active={checkedIn}
                buttonLabel={checkedIn ? "Done +10 XP" : "Complete Check-In"}
                onClick={() => setCheckedIn(true)}
              />
            </div>

            <div className="border border-white/10 bg-black p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="font-orbitron text-sm font-bold uppercase">
                  Daily Progress
                </p>

                <p className="font-mono text-[10px] text-white/35 uppercase">
                  {progress}/3 Steps
                </p>
              </div>

              <div className="h-2 bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-white transition-all"
                  style={{ width: `${(progress / 3) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Flow Design
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  From Mock To Mainnet
                </h3>
              </div>

              <Activity size={20} className="text-white/60" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {steps.map((step) => (
                <StepCard key={step.title} step={step} />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-4 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Trophy size={18} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                Rewards
              </p>
            </div>

            <div className="space-y-3">
              {rewards.map((reward) => (
                <RewardRow key={reward.title} reward={reward} />
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
              <RuleLine label="No hidden transactions" />
              <RuleLine label="No automatic wallet signing" />
              <RuleLine label="Xaman confirmation required" />
              <RuleLine label="Source tag visible before signing" />
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Lock size={18} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                Mainnet Later
              </p>
            </div>

            <p className="font-mono text-xs text-white/45 leading-relaxed">
              Deze module blijft eerst mock. Pas daarna bouwen we de echte Xaman
              payload met source tag 2606 voor Make Waves activatie.
            </p>
          </div>
        </div>

        <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <FeatureBox icon={Clock} title="Daily Habit" text="Return loop" />
          <FeatureBox icon={Gift} title="Rewards" text="XP and badges" />
          <FeatureBox icon={Waves} title="Make Waves" text="Source tag 2606" />
          <FeatureBox icon={ShieldCheck} title="Safe Signing" text="Xaman later" />
        </div>
      </div>
    </div>
  );
}

function StatBox({
  icon: Icon,
  label,
  value,
}: {
  icon: ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="border border-white/10 bg-black/60 p-4">
      <Icon size={18} className="text-white/60 mb-3" />

      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
        {label}
      </p>

      <p className="font-orbitron text-lg font-black uppercase">{value}</p>
    </div>
  );
}

function ActionCard({
  title,
  text,
  active,
  buttonLabel,
  onClick,
}: {
  title: string;
  text: string;
  active: boolean;
  buttonLabel: string;
  onClick: () => void;
}) {
  return (
    <div className="border border-white/10 bg-black p-5">
      <CheckCircle2
        size={20}
        className={`mb-4 ${active ? "text-white" : "text-white/30"}`}
      />

      <p className="font-orbitron text-sm font-bold uppercase mb-2">{title}</p>

      <p className="font-mono text-xs text-white/40 leading-relaxed mb-5">
        {text}
      </p>

      <button
        onClick={onClick}
        disabled={active}
        className={`w-full py-3 font-orbitron text-[10px] uppercase tracking-widest transition-all ${
          active
            ? "bg-white/10 text-white/35 cursor-not-allowed"
            : "bg-white text-black hover:bg-white/80"
        }`}
      >
        {buttonLabel}
      </button>
    </div>
  );
}

function StepCard({ step }: { step: Step }) {
  const Icon = step.icon;

  return (
    <div className="border border-white/10 bg-black p-5">
      <div className="flex items-start justify-between mb-4">
        <Icon size={20} className="text-white/60" />

        <p className="font-mono text-[10px] uppercase text-white/35">
          {step.status}
        </p>
      </div>

      <p className="font-orbitron text-sm font-bold uppercase mb-2">
        {step.title}
      </p>

      <p className="font-mono text-xs text-white/40 leading-relaxed">
        {step.text}
      </p>
    </div>
  );
}

function RewardRow({ reward }: { reward: Reward }) {
  const Icon = reward.icon;

  return (
    <div className="border border-white/10 bg-black p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Icon size={17} className="text-white/60" />

        <div>
          <p className="font-orbitron text-xs font-bold uppercase mb-1">
            {reward.title}
          </p>

          <p className="font-mono text-[10px] text-white/35 uppercase">
            {reward.status}
          </p>
        </div>
      </div>

      <p className="font-mono text-[10px] text-white/45 uppercase">
        {reward.value}
      </p>
    </div>
  );
}

function RuleLine({ label }: { label: string }) {
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
