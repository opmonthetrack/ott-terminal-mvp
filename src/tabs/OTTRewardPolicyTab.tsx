import { useState } from "react";
import type { ElementType } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  Banknote,
  CheckCircle2,
  Coins,
  FileCheck,
  Fingerprint,
  Gift,
  Globe2,
  GraduationCap,
  Layers,
  Lock,
  Radio,
  Scale,
  ShieldCheck,
  Sparkles,
  Target,
  TestTube2,
  Trophy,
  Wallet,
  Waves,
  Zap,
} from "lucide-react";
import {
  MAKE_WAVES_ACTIONS,
  MAKE_WAVES_SOURCE_TAG,
  buildMakeWavesStatusLine,
} from "../lib/makeWaves";

type RewardMode = {
  id: string;
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

type PolicyRule = {
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

type RewardStep = {
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

const rewardModes: RewardMode[] = [
  {
    id: "offchain",
    title: "Off-Chain XP",
    status: "Safe Now",
    text: "XP blijft zichtbaar in de terminal zonder token transfer. Dit is de veilige MVP start.",
    icon: Zap,
  },
  {
    id: "testnet",
    title: "Testnet OTT Token",
    status: "Next",
    text: "Test echte token reward flows eerst op XRPL testnet zonder waarde of belofte.",
    icon: TestTube2,
  },
  {
    id: "badge",
    title: "Badge / Access Proof",
    status: "Utility",
    text: "Badges kunnen toegang, achievements en community status tonen zonder investment verhaal.",
    icon: BadgeCheck,
  },
  {
    id: "mainnet",
    title: "Mainnet Airdrop",
    status: "Legal Gate",
    text: "Mainnet OTT token rewards pas na legal check, token paper en duidelijke voorwaarden.",
    icon: Coins,
  },
  {
    id: "voucher",
    title: "Reward Voucher",
    status: "Option",
    text: "Alternatief: niet-financiële rewards zoals access, courses, merch korting of tickets.",
    icon: Gift,
  },
  {
    id: "partner",
    title: "Partner Rewards",
    status: "Later",
    text: "Partners kunnen later rewards sponsoren zonder dat OTT direct financieel product wordt.",
    icon: Globe2,
  },
];

const policyRules: PolicyRule[] = [
  {
    title: "No Investment Promise",
    status: "Rule",
    text: "Communiceer OTT rewards niet als belegging, rendement, winstkans of prijsverwachting.",
    icon: AlertTriangle,
  },
  {
    title: "Utility First",
    status: "Design",
    text: "Elke reward moet echte utility hebben: access, learning, status, proof of community value.",
    icon: Sparkles,
  },
  {
    title: "Legal Review Before Mainnet",
    status: "Gate",
    text: "Mainnet airdrops pas activeren na MiCAR/juridische check en duidelijke token voorwaarden.",
    icon: Scale,
  },
  {
    title: "Reward After Proof",
    status: "SourceTag",
    text: `OTT reward flow mag pas starten na verified SourceTag ${MAKE_WAVES_SOURCE_TAG}.`,
    icon: Fingerprint,
  },
  {
    title: "No Auto Airdrops",
    status: "Safety",
    text: "Geen automatische mainnet token transfers zonder user consent en backend verification.",
    icon: Lock,
  },
];

const rewardSteps: RewardStep[] = [
  {
    title: "User Action",
    status: "Step 1",
    text: "Gebruiker doet Daily Check-In, Academy lesson, wallet safety of Make Waves action.",
    icon: Wallet,
  },
  {
    title: "SourceTag Proof",
    status: "Step 2",
    text: `Payload of tx wordt gecontroleerd op SourceTag ${MAKE_WAVES_SOURCE_TAG}.`,
    icon: Fingerprint,
  },
  {
    title: "XP Credit",
    status: "Step 3",
    text: "Terminal XP wordt direct bijgewerkt als off-chain MVP reward.",
    icon: Zap,
  },
  {
    title: "Token Eligibility",
    status: "Step 4",
    text: "Gebruiker krijgt eligibility voor latere OTT token reward, nog geen financiële claim.",
    icon: FileCheck,
  },
  {
    title: "Legal Gate",
    status: "Step 5",
    text: "Pas na legal check kan mainnet token distribution geactiveerd worden.",
    icon: Scale,
  },
];

const roadmap = [
  "Off-chain XP behouden als veilige basis",
  "OTT token reward eligibility toevoegen",
  "Testnet OTT token flow bouwen",
  "Legal token paper maken",
  "MiCAR checklist toevoegen",
  "Mainnet airdrop pas na legal review",
  "Reward terms zichtbaar maken",
  "Partner reward model uitwerken",
];

export function OTTRewardPolicyTab() {
  const [selectedMode, setSelectedMode] = useState<RewardMode>(rewardModes[0]);
  const [selectedStep, setSelectedStep] = useState<RewardStep>(rewardSteps[0]);

  const SelectedModeIcon = selectedMode.icon;
  const SelectedStepIcon = selectedStep.icon;

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 mb-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="flex items-center gap-2 mb-4 text-white/45">
              <Banknote size={17} />

              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                OTT Reward Policy
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              XP Now. Token Rewards Later.
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              De veilige reward-laag van OTT Terminal. XP blijft nu off-chain,
              token rewards worden eerst testnet/eligibility, en mainnet OTT
              token airdrops gaan pas door een legal gate.
            </p>
          </div>

          <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-3">
            <StatBox icon={Zap} label="XP Mode" value="Off-Chain" />
            <StatBox icon={Coins} label="OTT Token" value="Legal Gate" />
            <StatBox icon={Fingerprint} label="SourceTag" value={`${MAKE_WAVES_SOURCE_TAG}`} />
            <StatBox icon={Radio} label="Status" value="Policy" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-4 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Layers size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Reward Modes
              </p>
            </div>

            <div className="space-y-3">
              {rewardModes.map((mode) => (
                <ModeButton
                  key={mode.id}
                  mode={mode}
                  active={selectedMode.id === mode.id}
                  onClick={() => setSelectedMode(mode)}
                />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Trophy size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Current Reward Actions
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
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Selected Reward Mode
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  {selectedMode.title}
                </h3>
              </div>

              <SelectedModeIcon size={22} className="text-white/60" />
            </div>

            <p className="font-mono text-sm text-white/45 leading-relaxed mb-5">
              {selectedMode.text}
            </p>

            <MiniStatus label="Status" value={selectedMode.status} />
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Target size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Reward Flow
              </p>
            </div>

            <div className="space-y-3">
              {rewardSteps.map((step) => (
                <StepButton
                  key={step.title}
                  step={step}
                  active={selectedStep.title === step.title}
                  onClick={() => setSelectedStep(step)}
                />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-5">
              <p className="font-orbitron text-xs uppercase tracking-widest">
                Selected Step
              </p>

              <SelectedStepIcon size={18} className="text-white/60" />
            </div>

            <p className="font-orbitron text-2xl font-black uppercase mb-2">
              {selectedStep.title}
            </p>

            <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-4">
              {selectedStep.status}
            </p>

            <p className="font-mono text-sm text-white/45 leading-relaxed">
              {selectedStep.text}
            </p>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Waves size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Make Waves Status Line
              </p>
            </div>

            <div className="border border-white/10 bg-black p-5">
              <p className="font-mono text-xs text-white/50 leading-relaxed">
                {buildMakeWavesStatusLine("daily-checkin")}
              </p>
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-3 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <ShieldCheck size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Policy Rules
              </p>
            </div>

            <div className="space-y-3">
              {policyRules.map((rule) => (
                <RuleCard key={rule.title} rule={rule} />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <CheckCircle2 size={18} className="text-white/60" />

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
          <FeatureBox icon={GraduationCap} title="XP" text="Terminal points now" />
          <FeatureBox icon={TestTube2} title="Testnet" text="Token flow first" />
          <FeatureBox icon={Scale} title="Legal Gate" text="Before mainnet" />
          <FeatureBox icon={Wallet} title="Airdrop" text="Only after consent" />
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

      <p className="font-orbitron text-sm font-black uppercase break-all">
        {value}
      </p>
    </div>
  );
}

function ModeButton({
  mode,
  active,
  onClick,
}: {
  mode: RewardMode;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = mode.icon;

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
            {mode.title}
          </p>
        </div>

        <p className="font-mono text-[10px] text-white/35 uppercase">
          {mode.status}
        </p>
      </div>
    </button>
  );
}

function StepButton({
  step,
  active,
  onClick,
}: {
  step: RewardStep;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = step.icon;

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
            {step.title}
          </p>
        </div>

        <p className="font-mono text-[10px] text-white/35 uppercase">
          {step.status}
        </p>
      </div>
    </button>
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

function RuleCard({ rule }: { rule: PolicyRule }) {
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

      <p className="font-mono text-xs text-white/40 break-all">{text}</p>
    </div>
  );
}
