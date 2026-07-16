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
    headline: "XRPL has strong rails. New users need a safe track to follow.",
    script:
      "XRPL OnTheTrack Terminal is a guided intelligence, education and proof terminal. It lets people start for free, learn from live XRPL signals, connect Xaman only when proof is needed, and build trust through SourceTag actions, XP and OTT Credits.",
    proof: [
      "Home positioning: Free to Learn, Xaman to Prove, Pass to Unlock",
      "Dashboard Daily Intelligence Snapshot",
      `SourceTag ${MAKE_WAVES_SOURCE_TAG} visible across the product`,
    ],
    icon: Waves,
  },
  {
    id: "problem",
    time: "0:20",
    title: "Problem",
    headline: "Most crypto users jump from headlines to hype before they understand the source.",
    script:
      "The problem is not that XRPL lacks tools. The problem is that new users get scattered across news, wallets, docs, communities and social posts. They need one path that explains what matters, what to verify and what action is safe to take next.",
    proof: [
      "XRPL Intelligence filters official, technical and high-context signals",
      "OTT Intelligence separates fact, risk, angle and checklist",
      "Newsroom creates human-reviewed drafts instead of auto-posting hype",
    ],
    icon: Users,
  },
  {
    id: "solution",
    time: "0:45",
    title: "Solution",
    headline: "The terminal turns awareness into learning, proof and retention.",
    script:
      "The loop is simple: follow a live XRPL signal, understand it, turn it into safe social awareness, learn deeper in Academy, then prove selected actions through Xaman. When the proof is verified, the user earns XP and internal OTT Credits inside the Reward Ledger.",
    proof: [
      "Dashboard Snapshot → XRPL Intelligence → OTT Intelligence",
      "Newsroom supports X, LinkedIn, Instagram, Facebook, Medium, TikTok, WhatsApp and YouTube",
      "Daily Check-In now credits XP and OTT Credits after verified SourceTag proof",
    ],
    icon: Brain,
  },
  {
    id: "demo",
    time: "1:10",
    title: "Live Demo",
    headline: "Show the exact working route in 30 seconds.",
    script:
      "I open Home, show the free access model, open XRPL Intelligence, select a source, explain it in OTT Intelligence, generate a Newsroom draft, then move to Xaman proof. After signing, Reward Ledger shows the XP and OTT Credits credited to the connected wallet.",
    proof: [
      "Guest flow works without Xaman",
      "Daily proof payload signs through Xaman",
      "Reward Ledger shows XP and OTT Credits after verified proof",
      "Founder tools stay hidden behind Show Founder / Labs",
    ],
    icon: PlayCircle,
  },
  {
    id: "business",
    time: "1:40",
    title: "Growth",
    headline: "Free public value creates reach. Premium utility can grow later.",
    script:
      "The public layer brings users in with intelligence, education, Xaman activation guidance and social drafts with OTT attribution. Later premium routes can include deeper Academy paths, Web2 Access Licenses, XRPL Access Pass utility, certificate NFTs and branded output — only after payment verification, safeguards and legal review.",
    proof: [
      "Submission Pack contains launch posts for X, LinkedIn, WhatsApp, TikTok and XRPL community invite",
      "Access Gate is scanner-only in V1, with Web2 Access License coming soon",
      "Certificate NFT, donations and XRP/RLUSD support remain clearly marked as future layers",
    ],
    icon: KeyRound,
  },
  {
    id: "close",
    time: "2:00",
    title: "Close",
    headline: "A Make Waves terminal for users who verify before they trust.",
    script:
      "This is not a bank, exchange, broker or yield product. It is a source-first XRPL intelligence, education, proof and retention terminal built by TruthOnTheTrack to help users, builders and partners move safely OnTheTrack.",
    proof: [
      "No custody",
      "No broker or trade execution",
      "No yield, token value or profit promise",
      "Education-first, source-first and proof before trust",
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
      label: "Launch",
      value: "Ready",
      text: "Promo copy.",
      icon: ShieldCheck,
    },
  ];

  const fullScript = useMemo(
    () =>
      [
        "XRPL OnTheTrack Terminal — Make Waves Final 2-Minute Demo Script",
        `SourceTag: ${MAKE_WAVES_SOURCE_TAG}`,
        TERMINAL_URL,
        "",
        "Core line: Free to Learn. Xaman to Prove. Pass to Unlock.",
        "",
        ...pitchSteps.map(
          (step) =>
            `${step.time} — ${step.title}\n${step.headline}\n\n${step.script}\n\nShow:\n- ${step.proof.join("\n- ")}`
        ),
        "",
        "Safety line: Education-first. No custody, no broker, no yield, no trade execution, no financial advice and no token value promise.",
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
              Final Pitch Script
            </h2>

            <p className="font-mono text-sm text-black/55 max-w-3xl leading-relaxed">
              Een 2-minuten pitch flow voor jury, partners en social video. De route is nu:
              Home → XRPL Intelligence → OTT Intelligence → Newsroom → Xaman Proof → Reward Ledger → Launch Copy.
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
                act as broker, provide yield, execute trades or promise token value. It helps
                users verify sources, understand XRPL, connect Xaman and prove selected actions
                with SourceTag {MAKE_WAVES_SOURCE_TAG}.
              </p>
            </div>

            <div className="border border-[#C83888]/25 bg-[#C83888]/10 p-5">
              <p className="font-orbitron text-xs font-black uppercase mb-3">
                Launch caption core
              </p>
              <p className="font-mono text-xs text-black/60 leading-relaxed">
                I am building XRPL OnTheTrack Terminal for Make Waves: a source-first XRPL
                intelligence, education and proof terminal where users can learn for free,
                connect Xaman to prove, earn XP/OTT Credits and share safe XRPL awareness.
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
              <InfoLine text="Home: Free to Learn / Xaman to Prove / Pass to Unlock." />
              <InfoLine text="XRPL Intelligence: source queue + buckets." />
              <InfoLine text="OTT Intelligence: explain one signal." />
              <InfoLine text="Newsroom: copy social draft + open source." />
              <InfoLine text="Xaman Center: self-custody connect." />
              <InfoLine text="Daily Check-In: SourceTag proof." />
              <InfoLine text="Reward Ledger: XP + OTT Credits credited." />
              <InfoLine text="Submission Pack: launch copy for user acquisition." />
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
                sources, Xaman onboarding, education, SourceTag actions, XP, internal OTT Credits
                and launch-ready social awareness.
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
              <InfoLine text="User acquisition: invite people to try the free terminal first." />
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
