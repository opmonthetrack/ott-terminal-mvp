import { useMemo, useState } from "react";
import type { ElementType } from "react";
import {
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  FileText,
  Film,
  Fingerprint,
  Github,
  Globe2,
  Lightbulb,
  Link2,
  Rocket,
  ShieldCheck,
  Sparkles,
  Timer,
  Video,
} from "lucide-react";
import { MAKE_WAVES_SOURCE_TAG } from "../lib/makeWaves";

type SubmissionPackTabProps = {
  walletAddress?: string;
};

type DeliverableStatus = "ready" | "needs-link" | "needs-polish";

type Deliverable = {
  id: string;
  title: string;
  status: DeliverableStatus;
  description: string;
  action: string;
  icon: ElementType;
};

type CopyBlock = {
  id: string;
  title: string;
  text: string;
  icon: ElementType;
};

type Metric = {
  label: string;
  value: string;
  text: string;
  icon: ElementType;
};

const deliverables: Deliverable[] = [
  {
    id: "live-project",
    title: "Live Project",
    status: "needs-link",
    description:
      "Vercel live link naar XRPL OnTheTrack Terminal. Jury route: Home → Xaman → Daily Proof → Reward Ledger → SourceTag Support → Academy.",
    action: "Add final Vercel URL in the Make Waves submission.",
    icon: Globe2,
  },
  {
    id: "source-code",
    title: "Source Code",
    status: "needs-link",
    description:
      "GitHub repository met React/Vite frontend, api/ott.ts router, Xaman flows, SourceTag proof en reward ledger.",
    action: "Add public or shared GitHub link.",
    icon: Github,
  },
  {
    id: "demo-video",
    title: "2-Min Demo Video",
    status: "needs-polish",
    description:
      "Gebruik Pitch Mode: Home → Xaman Center → Daily Check-In → Reward Ledger → SourceTag Support → Academy → Access Gate.",
    action: "Record 2-minute screen demo after final build is green.",
    icon: Film,
  },
  {
    id: "pitch-deck",
    title: "Pitch Deck",
    status: "needs-polish",
    description:
      "6 slides: Problem, Solution, Live Demo, SourceTag Proof, Business Model, Roadmap.",
    action: "Turn current Pitch Mode into a deck.",
    icon: FileText,
  },
  {
    id: "legal",
    title: "Legal-Safe Positioning",
    status: "ready",
    description:
      "Education-first, no custody, no broker, no yield provider, no trade execution, no token value promise.",
    action: "Use this exact wording in pitch, submission and social copy.",
    icon: ShieldCheck,
  },
  {
    id: "proof",
    title: "SourceTag Proof",
    status: "ready",
    description:
      "Make Waves proof identity is SourceTag 2606170002. Daily Proof and SourceTag pages explain how proof and memo awareness work.",
    action: "Mention SourceTag during demo and show it on Home, Xaman, Daily Check-In and Reward Ledger.",
    icon: Fingerprint,
  },
  {
    id: "academy",
    title: "XRPL Academy",
    status: "ready",
    description:
      "Academy deep catalog built from official XRPL learning themes, rewritten in OTT language with free and premium routes.",
    action: "Show free modules first, then premium depth.",
    icon: BookOpen,
  },
  {
    id: "not-active",
    title: "Coming Soon Clearly Marked",
    status: "ready",
    description:
      "Certificate NFT, donation/payment and XRP/RLUSD support are shown as future layers only. No active mint/payment flow in this V1 screen.",
    action: "Say coming soon clearly. Do not imply it is active.",
    icon: Lightbulb,
  },
];

const copyBlocks: CopyBlock[] = [
  {
    id: "one-liner",
    title: "One-Liner",
    icon: Lightbulb,
    text:
      "XRPL OnTheTrack Terminal is an education-first Make Waves terminal where users learn XRPL, connect Xaman, prove SourceTag actions, earn XP and discover safe premium utility routes.",
  },
  {
    id: "short-description",
    title: "Short Description",
    icon: BookOpen,
    text:
      "XRPL OnTheTrack Terminal helps users understand XRPL before taking action. The live MVP combines a social landingpage, Xaman self-custody connect, Daily SourceTag proof, Reward Ledger XP/OTT Credits, SourceTag verification/support awareness, XRPL Academy and scanner-only Access Pass gating. It does not custody funds, does not act as broker, does not provide yield and does not execute trades. SourceTag 2606170002 is used as the public Make Waves proof identity.",
  },
  {
    id: "problem",
    title: "Problem",
    icon: ClipboardCheck,
    text:
      "XRPL has strong tools and official learning material, but many new users get sent away to portals or apps and do not stay engaged. They need a guided path that explains wallet safety, payments, SourceTags, DeFi, tokens, identity, coding and AI agents in a way that keeps them returning.",
  },
  {
    id: "solution",
    title: "Solution",
    icon: Rocket,
    text:
      "The Terminal wraps XRPL learning and proof in an OTT experience: free onboarding, visible premium depth, Xaman signing, SourceTag tracking, XP, OTT Credits and clear next steps. Users learn, prove and return instead of getting lost between separate tools.",
  },
  {
    id: "live-demo",
    title: "Live Demo Route",
    icon: Video,
    text:
      "Home → Connect Xaman → Daily Check-In proof → Reward Ledger XP/OTT Credits → SourceTag Support page → Academy deep catalog → Access Pass scanner. This route shows the product, proof, retention loop and legal-safe premium roadmap.",
  },
  {
    id: "compliance",
    title: "Safe Compliance Line",
    icon: ShieldCheck,
    text:
      "The Terminal is education-first. It does not custody funds, does not act as broker, does not provide yield and does not execute trades. XP and OTT Credits are internal progress/utility signals, not tradable tokens or value promises.",
  },
  {
    id: "coming-soon",
    title: "Coming Soon Clarity",
    icon: Sparkles,
    text:
      "Certificate NFT, XRP/RLUSD support, donation/payment flows and event ticket utility are future layers only. They require payment verification, duplicate protection, clear legal copy and production safeguards before activation.",
  },
  {
    id: "close",
    title: "Closing Line",
    icon: BadgeCheck,
    text:
      "This is not another wallet dashboard. It is a guided XRPL education, proof and retention layer built by TruthOnTheTrack to help users, builders and partners move safely OnTheTrack.",
  },
];

export function SubmissionPackTab({
  walletAddress = "guest",
}: SubmissionPackTabProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const readyCount = deliverables.filter(
    (deliverable) => deliverable.status === "ready"
  ).length;

  const metrics: Metric[] = [
    {
      label: "Deliverables",
      value: `${readyCount}/${deliverables.length}`,
      text: "Ready now.",
      icon: BadgeCheck,
    },
    {
      label: "Demo",
      value: "2 min",
      text: "Pitch mode.",
      icon: Timer,
    },
    {
      label: "SourceTag",
      value: String(MAKE_WAVES_SOURCE_TAG),
      text: "Proof ID.",
      icon: Fingerprint,
    },
    {
      label: "Wallet",
      value: walletAddress === "guest" ? "Guest" : "Connected",
      text: "Demo state.",
      icon: Link2,
    },
  ];

  const fullSubmissionText = useMemo(
    () => copyBlocks.map((block) => `${block.title}\n${block.text}`).join("\n\n"),
    []
  );

  async function copyText(id: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);

    window.setTimeout(() => setCopiedId(null), 1600);
  }

  return (
    <div className="min-h-screen bg-white text-[#080808]">
      <div className="relative overflow-hidden border border-black/10 bg-white p-6 mb-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="flex items-center gap-2 mb-4 text-black/55">
              <Rocket size={18} />

              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                Submission Pack
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              Make Waves Submission Room
            </h2>

            <p className="font-mono text-sm text-black/55 max-w-3xl leading-relaxed">
              Alles voor de Make Waves inzending: live route, GitHub, demo video,
              pitch copy, SourceTag proof, legal-safe wording en duidelijke coming-soon grenzen.
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
              <ClipboardCheck size={18} className="text-[#3898E8]" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Deliverable Checklist
              </p>
            </div>

            <div className="space-y-3">
              {deliverables.map((deliverable) => (
                <DeliverableCard
                  key={deliverable.id}
                  deliverable={deliverable}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-5 space-y-4">
          <div className="border border-black/10 bg-white p-6">
            <div className="flex items-center gap-2 mb-5">
              <FileText size={18} className="text-[#3898E8]" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Copy Blocks
              </p>
            </div>

            <div className="space-y-4">
              {copyBlocks.map((block) => (
                <CopyBlockCard
                  key={block.id}
                  block={block}
                  copied={copiedId === block.id}
                  onCopy={() => copyText(block.id, block.text)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-3 space-y-4">
          <div className="border border-black/10 bg-white p-6">
            <div className="flex items-center gap-2 mb-5">
              <Video size={18} className="text-[#3898E8]" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Demo Recording Order
              </p>
            </div>

            <div className="space-y-3">
              <StepLine number="01" text="Open Home: social landing + SourceTag." />
              <StepLine number="02" text="Open Xaman Center: self-custody connect." />
              <StepLine number="03" text="Open Daily Check-In: create and verify proof." />
              <StepLine number="04" text="Open Reward Ledger: XP + OTT Credits." />
              <StepLine number="05" text="Open SourceTag Support: XRP/RLUSD + memo coming soon." />
              <StepLine number="06" text="Open Academy: free + premium deep catalog." />
              <StepLine number="07" text="Open Access Gate: scanner-only utility pass." />
            </div>
          </div>

          <div className="border border-black/10 bg-white p-6">
            <div className="flex items-center gap-2 mb-5">
              <Copy size={18} className="text-[#3898E8]" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Full Text
              </p>
            </div>

            <button
              onClick={() => copyText("full", fullSubmissionText)}
              className="w-full bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] text-white p-4 text-left hover:brightness-95 transition-all"
            >
              <p className="font-orbitron text-xs font-black uppercase mb-2">
                {copiedId === "full" ? "Copied" : "Copy All"}
              </p>

              <p className="font-mono text-[10px] text-white/75 uppercase">
                Submission text pack
              </p>
            </button>
          </div>

          <div className="border border-black/10 bg-white p-6">
            <div className="flex items-center gap-2 mb-5">
              <ShieldCheck size={18} className="text-[#3898E8]" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Red Flag Avoidance
              </p>
            </div>

            <div className="space-y-3">
              <InfoLine text="Do not say XP or Credits have cash value." />
              <InfoLine text="Do not say Certificate NFT or donations are active today." />
              <InfoLine text="Do not promise yield, profit, token value or trading signals." />
              <InfoLine text="Say education-first, self-custody and proof before trust." />
              <InfoLine text="Say support is voluntary and transparent, not an investment." />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeliverableCard({ deliverable }: { deliverable: Deliverable }) {
  const Icon = deliverable.icon;

  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <Icon size={18} className="text-[#3898E8]" />

        <StatusBadge status={deliverable.status} />
      </div>

      <p className="font-orbitron text-xs font-black uppercase mb-2">
        {deliverable.title}
      </p>

      <p className="font-mono text-xs text-black/55 leading-relaxed mb-3">
        {deliverable.description}
      </p>

      <div className="border border-black/10 bg-white p-3">
        <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">
          Action
        </p>

        <p className="font-mono text-xs text-black/55 leading-relaxed">
          {deliverable.action}
        </p>
      </div>
    </div>
  );
}

function CopyBlockCard({
  block,
  copied,
  onCopy,
}: {
  block: CopyBlock;
  copied: boolean;
  onCopy: () => void;
}) {
  const Icon = block.icon;

  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Icon size={18} className="text-[#3898E8]" />

          <p className="font-orbitron text-xs font-bold uppercase">
            {block.title}
          </p>
        </div>

        <button
          onClick={onCopy}
          className="border border-black/10 px-3 py-2 font-mono text-[10px] uppercase text-black/55 hover:text-black hover:bg-white transition-all"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <p className="font-mono text-sm text-black/55 leading-relaxed">
        {block.text}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: DeliverableStatus }) {
  const label =
    status === "ready"
      ? "Ready"
      : status === "needs-link"
        ? "Needs Link"
        : "Needs Polish";

  return (
    <div className="border border-black/10 bg-[#F7F8FC] px-3 py-1">
      <p className="font-mono text-[9px] uppercase tracking-widest text-black/55">
        {label}
      </p>
    </div>
  );
}

function StepLine({ number, text }: { number: string; text: string }) {
  return (
    <div className="flex items-start gap-3 border border-black/10 bg-[#F7F8FC] p-3">
      <p className="font-orbitron text-xs font-black text-[#C83888]">
        {number}
      </p>

      <p className="font-mono text-xs text-black/55 leading-relaxed">{text}</p>
    </div>
  );
}

function MetricBox({ metric }: { metric: Metric }) {
  const Icon = metric.icon;

  return (
    <div className="border border-black/10 bg-[#F7F8FC]/60 p-4">
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

function InfoLine({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <CheckCircle2 size={14} className="text-black/55 mt-0.5 shrink-0" />

      <p className="font-mono text-xs text-black/55 leading-relaxed">{text}</p>
    </div>
  );
}
