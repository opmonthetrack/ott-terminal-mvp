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
      "Vercel live link naar XRPL OnTheTrack Terminal. Dit is de belangrijkste hackathon proof.",
    action: "Add final Vercel URL in submission form.",
    icon: Globe2,
  },
  {
    id: "source-code",
    title: "Source Code",
    status: "needs-link",
    description:
      "GitHub repository met React/Vite frontend, single api/ott.ts router en SourceTag flows.",
    action: "Add public or shared GitHub link.",
    icon: Github,
  },
  {
    id: "demo-video",
    title: "2-Min Demo Video",
    status: "needs-polish",
    description:
      "Gebruik Pitch Mode: Dashboard → Partner Hub → Proof Stamp → Truth Desk → Access Gate → Reward Ledger.",
    action: "Record 2-minute screen demo.",
    icon: Film,
  },
  {
    id: "pitch-deck",
    title: "Pitch Deck",
    status: "needs-polish",
    description:
      "6 slides: Problem, Solution, Demo, XRPL/Xaman proof, Business model, Roadmap.",
    action: "Turn outline into deck.",
    icon: FileText,
  },
  {
    id: "legal",
    title: "Legal-Safe Positioning",
    status: "ready",
    description:
      "Education-first, no custody, no broker, no yield provider, no trade execution.",
    action: "Use this exact wording in pitch and submission.",
    icon: ShieldCheck,
  },
  {
    id: "proof",
    title: "SourceTag Proof",
    status: "ready",
    description:
      "All meaningful proof routes use SourceTag 2606170002 for Make Waves / XRPL proof identity.",
    action: "Mention SourceTag during demo.",
    icon: Fingerprint,
  },
];

const copyBlocks: CopyBlock[] = [
  {
    id: "one-liner",
    title: "One-Liner",
    icon: Lightbulb,
    text:
      "XRPL OnTheTrack Terminal is an education-first onboarding, partner discovery and proof layer for XRPL users, builders and service routes.",
  },
  {
    id: "short-description",
    title: "Short Description",
    icon: BookOpen,
    text:
      "XRPL OnTheTrack Terminal helps users understand XRPL routes before taking action. It combines learning flows, partner discovery, Xaman payloads, optional on-ledger Proof Stamps, local XP and safe access/service routes. The MVP does not custody funds, does not act as broker, does not provide yield and does not execute trades. It explains, routes and verifies proof with SourceTag 2606170002.",
  },
  {
    id: "problem",
    title: "Problem",
    icon: ClipboardCheck,
    text:
      "XRPL has many powerful tools, but new users often meet them as separate doors: wallets, onramps, DEX routes, Xahau, bridges, partner apps and DeFi concepts. Without a guided education path, users can become confused or take high-risk actions without understanding the route.",
  },
  {
    id: "solution",
    title: "Solution",
    icon: Rocket,
    text:
      "The Terminal gives users a guided hallway: learn first, check risk notes, connect wallet, create Xaman payloads, verify XRPL transactions and record progress through XP or optional Proof Stamps. Partners get better discovery and users get safer onboarding.",
  },
  {
    id: "compliance",
    title: "Safe Compliance Line",
    icon: ShieldCheck,
    text:
      "The Terminal is education-first. It does not custody funds, does not act as broker, does not provide yield and does not execute trades. It routes users to official providers only after explanation and risk awareness.",
  },
  {
    id: "close",
    title: "Closing Line",
    icon: Sparkles,
    text:
      "This is not another wallet dashboard. It is a guided XRPL education and proof layer built to help users, builders and partners move safely on the track.",
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
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 mb-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="flex items-center gap-2 mb-4 text-white/45">
              <Rocket size={18} />

              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                Submission Pack
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              Hackathon Submission Ready Room
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              Alles wat je nodig hebt voor de Make Waves / XRPL Commons
              inzending: live link, GitHub, demo video, pitch deck tekst en
              legal-safe wording.
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
              <ClipboardCheck size={18} className="text-white/60" />

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
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <FileText size={18} className="text-white/60" />

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
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Video size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Demo Recording Order
              </p>
            </div>

            <div className="space-y-3">
              <StepLine number="01" text="Open Dashboard: XP + SourceTag." />
              <StepLine number="02" text="Open Partner Hub: route checks." />
              <StepLine number="03" text="Show Proof Stamp payload." />
              <StepLine number="04" text="Show XRPL verify / tx proof." />
              <StepLine number="05" text="Show Truth Desk paid question." />
              <StepLine number="06" text="Show Access Gate payment route." />
              <StepLine number="07" text="End with Reward Ledger legal lock." />
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Copy size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Full Text
              </p>
            </div>

            <button
              onClick={() => copyText("full", fullSubmissionText)}
              className="w-full bg-white text-black p-4 text-left hover:bg-white/80 transition-all"
            >
              <p className="font-orbitron text-xs font-black uppercase mb-2">
                {copiedId === "full" ? "Copied" : "Copy All"}
              </p>

              <p className="font-mono text-[10px] text-black/55 uppercase">
                Submission text pack
              </p>
            </button>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <ShieldCheck size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Red Flag Avoidance
              </p>
            </div>

            <div className="space-y-3">
              <InfoLine text="Do not say token reward has guaranteed value." />
              <InfoLine text="Do not say app bypasses regulation." />
              <InfoLine text="Do not promise yield or trading signals." />
              <InfoLine text="Say education-first and official provider routes." />
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
    <div className="border border-white/10 bg-black p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <Icon size={18} className="text-white/60" />

        <StatusBadge status={deliverable.status} />
      </div>

      <p className="font-orbitron text-xs font-black uppercase mb-2">
        {deliverable.title}
      </p>

      <p className="font-mono text-xs text-white/45 leading-relaxed mb-3">
        {deliverable.description}
      </p>

      <div className="border border-white/10 bg-white/[0.02] p-3">
        <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
          Action
        </p>

        <p className="font-mono text-xs text-white/50 leading-relaxed">
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
    <div className="border border-white/10 bg-black p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Icon size={18} className="text-white/60" />

          <p className="font-orbitron text-xs font-bold uppercase">
            {block.title}
          </p>
        </div>

        <button
          onClick={onCopy}
          className="border border-white/10 px-3 py-2 font-mono text-[10px] uppercase text-white/45 hover:text-white hover:bg-white/[0.04] transition-all"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <p className="font-mono text-sm text-white/50 leading-relaxed">
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
    <div className="border border-white/10 bg-white/[0.03] px-3 py-1">
      <p className="font-mono text-[9px] uppercase tracking-widest text-white/45">
        {label}
      </p>
    </div>
  );
}

function StepLine({ number, text }: { number: string; text: string }) {
  return (
    <div className="flex items-start gap-3 border border-white/10 bg-black p-3">
      <p className="font-orbitron text-xs font-black text-white/40">
        {number}
      </p>

      <p className="font-mono text-xs text-white/45 leading-relaxed">{text}</p>
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

function InfoLine({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <CheckCircle2 size={14} className="text-white/45 mt-0.5 shrink-0" />

      <p className="font-mono text-xs text-white/45 leading-relaxed">{text}</p>
    </div>
  );
}
