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
  Gauge,
  KeyRound,
  MessageCircle,
  Newspaper,
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

const TERMINAL_URL = "https://ott-terminal-mvp.vercel.app";

const pitchSteps: PitchStep[] = [
  {
    id: "hook",
    time: "0:00",
    title: "Hook",
    headline: "XRPL has strong rails. Users need one terminal that turns signals into action.",
    script:
      "XRPL OnTheTrack Terminal is a guided intelligence, education and proof layer. It helps users understand what is happening in the XRPL ecosystem, learn safely, connect Xaman, prove real SourceTag actions and return for deeper Academy routes.",
    proof: [
      "Dashboard Daily Intelligence Snapshot",
      "Public social landing with Make Waves positioning",
      `Official SourceTag ${MAKE_WAVES_SOURCE_TAG} visible across the flow`,
    ],
    icon: Waves,
  },
  {
    id: "problem",
    time: "0:20",
    title: "Problem",
    headline: "Crypto users see noise. Builders need verified context before they act or post.",
    script:
      "Most people jump from headlines to hype. XRPL users need a safer path: source-first news, beginner explanation, risk context, wallet education and proof-based engagement without custody, broker activity or yield promises.",
    proof: [
      "XRPL Intelligence filters official, technical and macro sources",
      "OTT Intelligence explains the signal before users share it",
      "Newsroom creates drafts with source, disclaimer and OTT attribution",
    ],
    icon: Users,
  },
  {
    id: "solution",
    time: "0:45",
    title: "Solution",
    headline: "OTT connects intelligence, education, proof and content in one loop.",
    script:
      "The user journey is simple: see a daily XRPL signal, understand it in OTT Intelligence, turn it into safe social output in Newsroom, then continue into Academy and SourceTag proof actions with Xaman.",
    proof: [
      "Dashboard Snapshot → XRPL Intelligence → OTT Intelligence",
      "Newsroom output for X, LinkedIn, Instagram, Facebook, Medium, TikTok, WhatsApp and YouTube",
      "Academy routes for free preview, premium depth and certificate layer later",
    ],
    icon: Brain,
  },
  {
    id: "demo",
    time: "1:10",
    title: "Demo Flow",
    headline: "Show the product path in 30 seconds.",
    script:
      "Open Dashboard to show the live intelligence snapshot. Open XRPL Intelligence to show sources. Open OTT Intelligence to explain one signal. Open Newsroom to create a social draft. Then show Xaman, Daily Check-In, Reward Ledger and SourceTag proof.",
    proof: [
      "Daily Intelligence Snapshot loads from /api/news",
      "Open Source and Copy buttons work",
      "Daily proof payload and Reward Ledger stay separate from social tools",
      "SourceTag 2606170002 remains the proof identity",
    ],
    icon: PlayCircle,
  },
  {
    id: "business",
    time: "1:40",
    title: "Business",
    headline: "A safe path toward access, education, content utility and community support.",
    script:
      "The model can grow through premium Academy routes, Access Pass utility, optional certificate NFTs, transparent support and content tools. Free users keep OTT attribution in social output, while premium users can later unlock deeper tools and branding options.",
    proof: [
      "Access Gate is scanner-only in V1",
      "Certificate NFT and XRP/RLUSD support are coming soon, not active payment promises",
      "Public Newsroom output keeps Powered by OTT / TruthOnTheTrack attribution visible",
    ],
    icon: KeyRound,
  },
  {
    id: "close",
    time: "2:00",
    title: "Close",
    headline: "A Make Waves terminal that turns XRPL awareness into proof-based learning.",
    script:
      "This is not a bank, exchange or yield product. It is a safe XRPL intelligence, education, proof and content terminal built by TruthOnTheTrack for users, builders and partners who want to verify before they trust.",
    proof: [
      "No custody",
      "No broker",
      "No yield or trading signal",
      "Source-first intelligence plus Xaman proof-based onboarding",
    ],
    icon: Sparkles,
  },
];

export function PitchModeTab({ walletAddress = "guest" }: PitchModeTabProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const activeStep = pitchSteps[activeStepIndex];
  const ActiveIcon = activeStep.icon;

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
      text: "Proof identity.",
      icon: Fingerprint,
    },
    {
      label: "Wallet",
      value: walletAddress === "guest" ? "Guest" : "Connected",
      text: "Demo state.",
      icon: Wallet,
    },
    {
      label: "Positioning",
      value: "Safe",
      text: "No custody.",
      icon: ShieldCheck,
    },
  ];

  const fullScript = useMemo(
    () =>
      [
        "XRPL OnTheTrack Terminal — Make Waves 2-Minute Demo Script",
        `SourceTag: ${MAKE_WAVES_SOURCE_TAG}`,
        TERMINAL_URL,
        "",
        ...pitchSteps.map(
          (step) =>
            `${step.time} — ${step.title}\n${step.headline}\n\n${step.script}\n\nShow:\n- ${step.proof.join("\n- ")}`
        ),
        "",
        "Safety line: Education-first. No custody, no broker, no yield, no trade execution and no financial advice.",
      ].join("\n\n"),
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
        <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_top_right,_#3898E8,_transparent_34%),radial-gradient(circle_at_bottom_left,_#C83888,_transparent_32%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="flex items-center gap-2 mb-4 text-black/55">
              <PlayCircle size={18} />

              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                Pitch Mode
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              Intelligence Demo Script
            </h2>

            <p className="font-mono text-sm text-black/55 max-w-3xl leading-relaxed">
              Een 2-minuten pitch flow voor jury, partners en social video. De route is nu:
              Dashboard Snapshot → XRPL Intelligence → OTT Intelligence → Newsroom → Xaman Proof → Reward Ledger.
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

              <ActiveIcon size={34} className="text-[#C83888] shrink-0" />
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

                    <p className="font-mono text-[10px] text-white/70 uppercase">
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
                It helps users verify sources, understand XRPL, connect Xaman and prove
                selected actions with SourceTag {MAKE_WAVES_SOURCE_TAG}.
              </p>
            </div>

            <div className="border border-[#C83888]/25 bg-[#C83888]/10 p-5">
              <p className="font-orbitron text-xs font-black uppercase mb-3">
                Social caption core
              </p>
              <p className="font-mono text-xs text-black/60 leading-relaxed">
                I am building XRPL OnTheTrack Terminal for Make Waves: a source-first XRPL intelligence,
                education and proof terminal with Xaman, SourceTag {MAKE_WAVES_SOURCE_TAG}, safe social drafts and XP.
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
              title="Open Terminal"
              text="Live demo"
              onClick={() =>
                window.open(TERMINAL_URL, "_blank", "noopener,noreferrer")
              }
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
              <Gauge size={18} className="text-[#3898E8]" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Demo Order
              </p>
            </div>

            <div className="space-y-3">
              <InfoLine text="Dashboard: Daily Intelligence Snapshot." />
              <InfoLine text="XRPL Intelligence: source queue + buckets." />
              <InfoLine text="OTT Intelligence: explain one signal." />
              <InfoLine text="Newsroom: copy social draft + open source." />
              <InfoLine text="Xaman Center: self-custody connect." />
              <InfoLine text="Daily Check-In: Mainnet SourceTag proof." />
              <InfoLine text="Reward Ledger: XP + OTT Credits." />
              <InfoLine text="Close with Academy + Access Gate scanner-only." />
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
                The MVP is not trying to be a bank, exchange or trading bot. It is a guided
                XRPL intelligence and proof terminal that keeps users engaged through verified
                sources, Xaman onboarding, education, SourceTag actions, XP and future utility.
              </p>
            </div>
          </div>

          <div className="border border-black/10 bg-white p-6">
            <div className="flex items-center gap-2 mb-5">
              <Newspaper size={18} className="text-[#C83888]" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Content Angle
              </p>
            </div>

            <div className="space-y-3">
              <InfoLine text="Not hype: source-first awareness." />
              <InfoLine text="Not trading: education and verification." />
              <InfoLine text="Not closed: public tools include OTT attribution." />
              <InfoLine text="Premium later: deeper routes and branding options." />
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
