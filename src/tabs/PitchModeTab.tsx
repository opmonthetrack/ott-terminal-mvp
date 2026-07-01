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
    headline: "XRPL is powerful, but new users need a safe path.",
    script:
      "XRPL OnTheTrack Terminal turns onboarding into an education-first journey: learn first, connect wallet second, and only then route to official providers.",
    proof: [
      "Education-first onboarding",
      "No custody, no broker, no yield provider",
      "Risk awareness before action",
    ],
    icon: Waves,
  },
  {
    id: "problem",
    time: "0:20",
    title: "Problem",
    headline: "The ecosystem has many doors, but no simple guided hallway.",
    script:
      "Users discover tools like Xaman, Xahau, DEX, onramps, bridges, DeFi routes and partner apps separately. That creates confusion and risk.",
    proof: [
      "Fragmented user journey",
      "High-risk actions need explanation",
      "Builders need better discovery",
    ],
    icon: Users,
  },
  {
    id: "solution",
    time: "0:45",
    title: "Solution",
    headline: "A terminal that explains, routes and records proof.",
    script:
      "The Terminal gives structured routes: Partner Hub, Daily XP, Proof Stamps, Truth Desk, Access Gate and Reward Ledger. Every meaningful proof can use SourceTag 2606170002.",
    proof: [
      "Partner discovery layer",
      "Optional on-ledger Proof Stamps",
      "Local XP and reward ledger",
    ],
    icon: Fingerprint,
  },
  {
    id: "demo",
    time: "1:10",
    title: "Demo Flow",
    headline: "Show the path in 30 seconds.",
    script:
      "Open Partner Hub, complete education checks, create a Proof Stamp, verify tx hash, then show Reward Ledger and Access Gate.",
    proof: [
      "Partner route completion",
      "Xaman payload creation",
      "XRPL tx verification",
    ],
    icon: PlayCircle,
  },
  {
    id: "business",
    time: "1:40",
    title: "Business",
    headline: "Access, education and verified service routes.",
    script:
      "OTT can grow with safe access routes, Ask Truth, 1-on-1 sessions, partner discovery and later legal-reviewed token eligibility.",
    proof: [
      "Access Gate: fiat, XRP, RLUSD, NFT route",
      "Truth Desk: ask or book",
      "Mainnet token rewards locked until legal review",
    ],
    icon: KeyRound,
  },
  {
    id: "close",
    time: "2:00",
    title: "Close",
    headline: "XRPL onboarding that is 589 steps ahead.",
    script:
      "This is not another wallet dashboard. It is a guided XRPL education and proof layer built for users, builders and partners.",
    proof: [
      "Education-first",
      "Proof-based engagement",
      "Built around XRPL and Xaman",
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
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 mb-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="flex items-center gap-2 mb-4 text-white/45">
              <PlayCircle size={18} />

              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                Pitch Mode
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              XRPL OnTheTrack Terminal Demo
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              Een 2-minuten hackathon pitch flow voor jury, partners en demo
              video. Houd de taal simpel: education-first, no custody, no broker,
              no yield provider, no trade execution.
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
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <BookOpen size={18} className="text-white/60" />

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
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.3em] mb-3">
                  {activeStep.time} • {activeStep.title}
                </p>

                <h3 className="font-orbitron text-2xl font-black uppercase mb-3">
                  {activeStep.headline}
                </h3>

                <p className="font-mono text-sm text-white/55 leading-relaxed">
                  {activeStep.script}
                </p>
              </div>

              <activeStep.icon size={34} className="text-white/50 shrink-0" />
            </div>

            <div className="border border-white/10 bg-black p-5 mb-5">
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
                className="border border-white/10 bg-black p-4 text-left hover:bg-white/[0.03] transition-all"
              >
                <p className="font-orbitron text-xs font-bold uppercase mb-2">
                  Previous
                </p>

                <p className="font-mono text-[10px] text-white/35 uppercase">
                  Back one step
                </p>
              </button>

              <button
                onClick={goNext}
                className="bg-white text-black p-4 text-left hover:bg-white/80 transition-all"
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

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <ShieldCheck size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Exact Safe Pitch Line
              </p>
            </div>

            <div className="border border-white/10 bg-black p-5">
              <p className="font-mono text-sm text-white/55 leading-relaxed">
                XRPL OnTheTrack Terminal is education-first. It does not custody
                funds, does not act as broker, does not provide yield, and does
                not execute trades. It explains routes, shows risk awareness and
                directs users to official providers.
              </p>
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-3 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Copy size={18} className="text-white/60" />

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

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Brain size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Demo Checklist
              </p>
            </div>

            <div className="space-y-3">
              <InfoLine text="Start at Dashboard: SourceTag + XP overview." />
              <InfoLine text="Show Partner Hub: education checks." />
              <InfoLine text="Show Proof Stamp: Xaman payload + tx verify." />
              <InfoLine text="Show Truth Desk: paid question route." />
              <InfoLine text="Show Access Gate: access payment routes." />
              <InfoLine text="End with Reward Ledger and legal lock." />
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <BadgeCheck size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Judge Answer
              </p>
            </div>

            <div className="border border-white/10 bg-black p-4">
              <p className="font-mono text-xs text-white/45 leading-relaxed">
                The MVP is not trying to be a bank or exchange. It is a guided
                XRPL learning, partner discovery and proof layer that can help
                users take safer first steps.
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
          ? "border-white/30 bg-white/[0.08]"
          : "border-white/10 bg-black hover:bg-white/[0.03]"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <Icon size={18} className="text-white/60" />

        <p className="font-mono text-[10px] text-white/35 uppercase">
          {step.time}
        </p>
      </div>

      <p className="font-orbitron text-xs font-black uppercase mb-2">
        {step.title}
      </p>

      <p className="font-mono text-[10px] text-white/35 uppercase leading-relaxed">
        {step.headline}
      </p>
    </button>
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
      className="w-full border border-white/10 bg-black p-4 text-left hover:bg-white/[0.03] transition-all mb-3"
    >
      <Icon size={18} className="text-white/60 mb-3" />

      <p className="font-orbitron text-xs font-bold uppercase mb-2">{title}</p>

      <p className="font-mono text-[10px] text-white/35 uppercase">{text}</p>
    </button>
  );
}

function InfoLine({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <CheckCircle2 size={14} className="text-white/45 mt-0.5 shrink-0" />

      <p className="font-mono text-xs text-white/45 leading-relaxed">{text}</p>
    </div>
  );
}
