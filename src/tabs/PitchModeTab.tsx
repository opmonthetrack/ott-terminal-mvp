import { useMemo, useState } from "react";
import type { ElementType } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock3,
  Copy,
  ExternalLink,
  Fingerprint,
  KeyRound,
  MessageCircle,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
  Waves,
} from "lucide-react";
import { MAKE_WAVES_SOURCE_TAG } from "../lib/makeWaves";

type PitchModeTabProps = {
  walletAddress?: string;
};

type PitchStep = {
  id: string;
  time: string;
  title: string;
  headline: string;
  script: string;
  proof: string[];
  icon: ElementType;
};

type Metric = {
  label: string;
  value: string;
  text: string;
  icon: ElementType;
};

const pitchSteps: PitchStep[] = [
  {
    id: "hook",
    time: "0:00",
    title: "Hook",
    headline: "XRPL is powerful, but users need a guided path that keeps them coming back.",
    script:
      "XRPL OnTheTrack Terminal turns onboarding into a simple journey: learn, connect Xaman, prove a real SourceTag action, earn XP and return for deeper Academy modules.",
    proof: [
      "Home social landing",
      "Xaman self-custody onboarding",
      `Official SourceTag ${MAKE_WAVES_SOURCE_TAG} proof identity`,
    ],
    icon: Waves,
  },
  {
    id: "problem",
    time: "0:20",
    title: "Problem",
    headline: "People get sent to portals and tools, but they do not always stay engaged.",
    script:
      "The XRPL ecosystem has strong education and tools, but new users often leave before they understand wallets, payments, SourceTags, DeFi, tokens, identity or builder routes.",
    proof: [
      "Users need guided learning",
      "High-risk actions need context",
      "Retention needs XP, credits and clear next steps",
    ],
    icon: Users,
  },
  {
    id: "solution",
    time: "0:45",
    title: "Solution",
    headline: "OTT wraps official XRPL learning in a proof-based terminal.",
    script:
      "The Academy uses the XRPL learning path in an OTT jacket. Free users see enough to trust the product, while premium users see deeper routes: DeFi, business, tokenization, stablecoins, DID, coding and AI agents.",
    proof: [
      "XRPL Academy deep catalog",
      "Free preview plus premium depth",
      "Education-first, not investment advice",
    ],
    icon: BookOpen,
  },
  {
    id: "demo",
    time: "1:10",
    title: "Demo Flow",
    headline: "Show the product path in 30 seconds.",
    script:
      "Open Home, connect Xaman, run Daily Check-In, verify the Mainnet SourceTag proof, show XP and OTT Credits in Reward Ledger, then open SourceTag Support landing.",
    proof: [
      "Connect Xaman",
      "Daily proof payload",
      "Reward Ledger with tx-linked proof",
      "SourceTag support and memo awareness",
    ],
    icon: PlayCircle,
  },
  {
    id: "business",
    time: "1:40",
    title: "Business",
    headline: "A safe path toward access, certificates, support and events.",
    script:
      "The business model can grow through Access Pass utility, premium Academy routes, optional certificate NFTs, transparent XRP/RLUSD support and later event ticket utility.",
    proof: [
      "Access Pass scanner-only V1",
      "Certificate NFT coming soon, no active mint/payment yet",
      "Support stays voluntary, transparent and legal-safe",
    ],
    icon: KeyRound,
  },
  {
    id: "close",
    time: "2:00",
    title: "Close",
    headline: "A Make Waves terminal that turns learning into proof.",
    script:
      "This is not a bank, exchange or yield product. It is a guided XRPL education, proof and community terminal built by TruthOnTheTrack for users, builders and partners.",
    proof: [
      "No custody",
      "No broker",
      "No yield promise",
      "Proof-based engagement around XRPL and Xaman",
    ],
    icon: Sparkles,
  },
];

export function PitchModeTab({ walletAddress = "guest" }: PitchModeTabProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const activeStep = pitchSteps[activeStepIndex];

  const metrics: Metric[] = [
    {
      label: "Pitch Time",
      value: "2 min",
      text: "Judge ready.",
      icon: Clock3,
    },
    {
      label: "SourceTag",
      value: String(MAKE_WAVES_SOURCE_TAG),
      text: "Proof layer.",
      icon: Fingerprint,
    },
    {
      label: "Wallet",
      value: walletAddress === "guest" ? "Guest" : "Connected",
      text: "Demo state.",
      icon: Wallet,
    },
    {
      label: "Compliance",
      value: "Safe",
      text: "No custody.",
      icon: ShieldCheck,
    },
  ];

  const fullScript = useMemo(
    () =>
      pitchSteps
        .map(
          (step) =>
            `${step.time} — ${step.title}\n${step.headline}\n${step.script}`
        )
        .join("\n\n"),
    []
  );

  async function copyFullScript() {
    await navigator.clipboard.writeText(fullScript);
    setCopied(true);

    window.setTimeout(() => setCopied(false), 1800);
  }

  function goNext() {
    setActiveStepIndex((current) =>
      current >= pitchSteps.length - 1 ? 0 : current + 1
    );
  }

  function goPrevious() {
    setActiveStepIndex((current) =>
      current <= 0 ? pitchSteps.length - 1 : current - 1
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#080808]">
      <div className="relative overflow-hidden border border-black/10 bg-white p-6 mb-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="flex items-center gap-2 mb-4 text-black/55">
              <PlayCircle size={18} />

              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                Pitch Mode
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              Make Waves Demo Script
            </h2>

            <p className="font-mono text-sm text-black/55 max-w-3xl leading-relaxed">
              Een 2-minuten pitch flow voor jury, partners en social video. De route is simpel:
              Home → Xaman → Daily Proof → Reward Ledger → SourceTag Support → Academy.
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
        <div className="col-span-12 xl:col-span-4">
          <div className="border border-black/10 bg-white p-6">
            <div className="flex items-center gap-2 mb-5">
              <BookOpen size={18} className="text-[#3898E8]" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Pitch Steps
              </p>
            </div>

            <div className="space-y-3">
              {pitchSteps.map((step, index) => (
                <StepButton
                  key={step.id}
                  step={step}
                  active={index === activeStepIndex}
                  onClick={() => setActiveStepIndex(index)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-5 space-y-4">
          <div className="border border-black/10 bg-white p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <p className="font-mono text-[10px] text-black/35 uppercase tracking-[0.3em] mb-3">
                  {activeStep.time} • {activeStep.title}
                </p>

                <h3 className="font-orbitron text-2xl font-black uppercase mb-3">
                  {activeStep.headline}
                </h3>

                <p className="font-mono text-sm text-black/55 leading-relaxed">
                  {activeStep.script}
                </p>
              </div>

              <activeStep.icon size={34} className="text-[#C83888] shrink-0" />
            </div>

            <div className="border border-black/10 bg-[#F7F8FC] p-5 mb-5">
              <p className="font-orbitron text-xs font-bold uppercase mb-4">
                What to show
              </p>

              <div className="space-y-3">
                {activeStep.proof.map((item) => (
                  <InfoLine key={item} text={item} />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={goPrevious}
                className="border border-black/10 bg-[#F7F8FC] p-4 text-left hover:bg-white transition-all"
              >
                <p className="font-orbitron text-xs font-bold uppercase mb-2">
                  Previous
                </p>

                <p className="font-mono text-[10px] text-black/35 uppercase">
                  Back one step
                </p>
              </button>

              <button
                onClick={goNext}
                className="bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] text-white p-4 text-left hover:brightness-95 transition-all"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-orbitron text-xs font-black uppercase mb-2">
                      Next Step
                    </p>

                    <p className="font-mono text-[10px] text-black/55 uppercase">
                      Continue demo
                    </p>
                  </div>

                  <ArrowRight size={18} />
                </div>
              </button>
            </div>
          </div>

          <div className="border border-black/10 bg-white p-6">
            <div className="flex items-center gap-2 mb-5">
              <ShieldCheck size={18} className="text-[#3898E8]" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Exact Safe Pitch Line
              </p>
            </div>

            <div className="border border-black/10 bg-[#F7F8FC] p-5 mb-4">
              <p className="font-mono text-sm text-black/55 leading-relaxed">
                XRPL OnTheTrack Terminal is education-first. It does not custody funds,
                does not act as broker, does not provide yield and does not execute trades.
                It teaches users to verify before they trust, using Xaman, XRPL proof,
                SourceTag 2606170002, XP and transparent reward history.
              </p>
            </div>

            <div className="border border-[#C83888]/25 bg-[#C83888]/10 p-5">
              <p className="font-orbitron text-xs font-black uppercase mb-3">
                Social caption core
              </p>
              <p className="font-mono text-xs text-black/60 leading-relaxed">
                I am building XRPL OnTheTrack Terminal for Make Waves: a safe way to learn XRPL,
                connect Xaman, prove actions with SourceTag 2606170002 and turn education into XP.
              </p>
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-3 space-y-4">
          <div className="border border-black/10 bg-white p-6">
            <div className="flex items-center gap-2 mb-5">
              <Copy size={18} className="text-[#3898E8]" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Script Tools
              </p>
            </div>

            <ActionButton
              icon={Copy}
              title={copied ? "Copied" : "Copy Full Script"}
              text="Paste into notes"
              onClick={copyFullScript}
            />

            <ActionButton
              icon={ExternalLink}
              title="Open XRPL"
              text="Reference site"
              onClick={() =>
                window.open("https://xrpl.org/", "_blank", "noopener,noreferrer")
              }
            />
          </div>

          <div className="border border-black/10 bg-white p-6">
            <div className="flex items-center gap-2 mb-5">
              <Brain size={18} className="text-[#3898E8]" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Demo Checklist
              </p>
            </div>

            <div className="space-y-3">
              <InfoLine text="Start at Home: social landing + SourceTag." />
              <InfoLine text="Show Xaman Center: self-custody connect." />
              <InfoLine text="Show Daily Check-In: Mainnet proof payload." />
              <InfoLine text="Show Reward Ledger: XP + OTT Credits." />
              <InfoLine text="Show SourceTag Support: XRP/RLUSD + memo coming soon." />
              <InfoLine text="End with Academy depth + Access Pass utility." />
            </div>
          </div>

          <div className="border border-black/10 bg-white p-6">
            <div className="flex items-center gap-2 mb-5">
              <BadgeCheck size={18} className="text-[#3898E8]" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Judge Answer
              </p>
            </div>

            <div className="border border-black/10 bg-[#F7F8FC] p-4">
              <p className="font-mono text-xs text-black/55 leading-relaxed">
                The MVP is not trying to be a bank or exchange. It is a guided
                XRPL learning and proof terminal that keeps users engaged through
                education, SourceTag actions, XP, internal credits and future utility.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepButton({
  step,
  active,
  onClick,
}: {
  step: PitchStep;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = step.icon;

  return (
    <button
      onClick={onClick}
      className={`w-full border p-4 text-left transition-all ${
        active
          ? "border-[#C83888] bg-[#C83888]/10"
          : "border-black/10 bg-[#F7F8FC] hover:bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <Icon size={18} className="text-[#3898E8]" />

        <p className="font-mono text-[10px] text-black/35 uppercase">
          {step.time}
        </p>
      </div>

      <p className="font-orbitron text-xs font-black uppercase mb-2">
        {step.title}
      </p>

      <p className="font-mono text-[10px] text-black/35 uppercase leading-relaxed">
        {step.headline}
      </p>
    </button>
  );
}

function MetricBox({ metric }: { metric: Metric }) {
  const Icon = metric.icon;

  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-4">
      <Icon size={18} className="text-[#3898E8] mb-3" />

      <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">
        {metric.label}
      </p>

      <p className="font-orbitron text-sm font-black uppercase mb-1 break-all">
        {metric.value}
      </p>

      <p className="font-mono text-[10px] text-black/35 uppercase">
        {metric.text}
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
      className="w-full border border-black/10 bg-[#F7F8FC] p-4 text-left hover:bg-white transition-all mb-3"
    >
      <Icon size={18} className="text-[#3898E8] mb-3" />

      <p className="font-orbitron text-xs font-bold uppercase mb-2">{title}</p>

      <p className="font-mono text-[10px] text-black/35 uppercase">{text}</p>
    </button>
  );
}

function InfoLine({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <CheckCircle2 size={14} className="text-black/55 mt-0.5 shrink-0" />

      <p className="font-mono text-xs text-black/55 leading-relaxed">{text}</p>
    </div>
  );
}
