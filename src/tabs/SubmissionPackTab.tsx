import { useMemo, useState } from "react";
import type { ElementType } from "react";
import {
  BadgeCheck,
  BookOpen,
  Brain,
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
  Megaphone,
  Newspaper,
  Rocket,
  ShieldCheck,
  Sparkles,
  Timer,
  Video,
} from "lucide-react";
import { FounderNftMintConsole } from "../components/FounderNftMintConsole";
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

const TERMINAL_URL = "https://ott-terminal-mvp.vercel.app";
const REPO_URL = "https://github.com/opmonthetrack/ott-terminal-mvp";

const deliverables: Deliverable[] = [
  {
    id: "live-project",
    title: "Live Project",
    status: "ready",
    description:
      "Vercel live link naar XRPL OnTheTrack Terminal. Demo route: Home → XRPL Intelligence → Newsroom → Xaman Activation → Daily Check-In → Reward Ledger → Access Gate → Pitch Mode.",
    action: `Use live URL: ${TERMINAL_URL}`,
    icon: Globe2,
  },
  {
    id: "source-code",
    title: "Source Code",
    status: "ready",
    description:
      "GitHub repository met React/Vite frontend, api/ott.ts proof router, api/nft.ts founder mint router, Xaman flows, reward ledger en social newsroom.",
    action: `Use repo URL: ${REPO_URL}`,
    icon: Github,
  },
  {
    id: "demo-video",
    title: "2-Min Demo Video",
    status: "needs-polish",
    description:
      "Gebruik Pitch Mode: live intelligence, source-first explanation, Newsroom, Xaman proof, XP/OTT Credits, Access Gate and founder story.",
    action: "Record after final smoke test pass.",
    icon: Film,
  },
  {
    id: "mint-console",
    title: "Founder NFT Mint Console",
    status: "ready",
    description:
      "Founder-only NFTokenMint payload creator for OTT Access Pass. It creates a Xaman payload only; no automatic payment or access unlock runs here.",
    action: "Mint one controlled Access Pass first, then verify it through Access Gate scanner.",
    icon: BadgeCheck,
  },
  {
    id: "legal",
    title: "Legal-Safe Positioning",
    status: "ready",
    description:
      "Education-first, no custody, no broker, no yield provider, no trade execution, no token value promise and no trading signals.",
    action: "Use this exact wording in pitch, submission, NFT utility copy and social copy.",
    icon: ShieldCheck,
  },
  {
    id: "proof",
    title: "SourceTag Proof",
    status: "ready",
    description:
      "Make Waves proof identity is SourceTag 2606170002. Daily Proof, Xaman Center, Reward Ledger and SourceTag pages explain the proof loop.",
    action: "Mention SourceTag during demo and show it in proof and NFT settings.",
    icon: Fingerprint,
  },
  {
    id: "academy",
    title: "XRPL Academy",
    status: "ready",
    description:
      "Academy deep catalog explains XRPL, wallets, payments, DeFi, stablecoins, tokenization, DID, coding and AI agents through free and premium routes.",
    action: "Show free modules first, then premium depth and Certificate NFT coming soon.",
    icon: BookOpen,
  },
  {
    id: "access-gate",
    title: "Access Gate Scanner",
    status: "ready",
    description:
      "Access Gate checks account_nfts for exact issuer, taxon and metadata CID. Minting is now founder-controlled, not customer-automatic.",
    action: "Use scanner after mint to prove the Access Pass can unlock the matching wallet.",
    icon: BadgeCheck,
  },
];

const copyBlocks: CopyBlock[] = [
  {
    id: "one-liner",
    title: "One-Liner",
    icon: Lightbulb,
    text:
      "XRPL OnTheTrack Terminal is an education-first Make Waves terminal that turns live XRPL intelligence into learning, source verification, Xaman proof, XP and utility access through controlled NFT passes.",
  },
  {
    id: "short-description",
    title: "Short Description",
    icon: BookOpen,
    text:
      "XRPL OnTheTrack Terminal helps users understand XRPL before taking action. The live MVP combines XRPL Intelligence, OTT Intelligence, Social Newsroom, Xaman self-custody proof, SourceTag proof, Reward Ledger XP/OTT Credits, XRPL Academy, scanner-based Access Gate and founder-controlled OTT Access Pass minting. It does not custody funds, does not act as broker, does not provide yield and does not execute trades.",
  },
  {
    id: "live-demo",
    title: "Live Demo Route",
    icon: Video,
    text:
      "Home → XRPL Intelligence → Newsroom → Xaman Activation → Daily Check-In proof → Reward Ledger XP/OTT Credits → Access Gate scanner → Founder NFT Mint Console → Pitch Mode. This route shows free learning, user onboarding, self-custody proof, controlled utility access and legal-safe boundaries.",
  },
  {
    id: "launch-x-post",
    title: "Launch X Post",
    icon: Megaphone,
    text:
      `🌊 Live now: XRPL OnTheTrack Terminal\n\nA source-first XRPL terminal built for Make Waves.\n\nFree to learn.\nXaman to prove.\nPass to unlock.\n\nFollow live XRPL intelligence, understand the context, connect Xaman, prove actions with SourceTag ${MAKE_WAVES_SOURCE_TAG}, earn XP and use controlled utility access passes.\n\n${TERMINAL_URL}\n\nEducation only — no custody, no broker, no yield, no trading signals.\n\n#XRPL #XRP #Ripple #Xaman #MakeWaves #OnTheTrack`,
  },
  {
    id: "linkedin-post",
    title: "LinkedIn Post",
    icon: Newspaper,
    text:
      `I am building XRPL OnTheTrack Terminal for the XRPL Commons Make Waves challenge.\n\nThe goal is simple: help users understand XRPL before taking action.\n\nThe live MVP combines XRPL Intelligence, beginner-friendly analysis, a Social Newsroom, Xaman self-custody proof, SourceTag ${MAKE_WAVES_SOURCE_TAG}, Reward Ledger XP, Academy learning routes and controlled OTT Access Pass utility.\n\nThe model is:\nFree to Learn\nXaman to Prove\nPass to Unlock\n\nThis is education-first infrastructure. No custody, no brokerage, no yield, no trading signals and no token value promise.\n\nLive terminal: ${TERMINAL_URL}`,
  },
  {
    id: "whatsapp-status",
    title: "WhatsApp Status",
    icon: Globe2,
    text:
      `I launched a live XRPL learning + intelligence terminal for Make Waves 🌊\n\nFree to learn. Xaman to prove. Pass to unlock.\n\nCheck it here: ${TERMINAL_URL}\n\nEducation only. No investment advice.`,
  },
  {
    id: "community-invite",
    title: "XRPL Community Invite",
    icon: Fingerprint,
    text:
      `XRPL builders, educators and community members: I would love feedback on XRPL OnTheTrack Terminal.\n\nIt is a live Make Waves MVP focused on source-first XRPL intelligence, safe onboarding, Xaman proof, SourceTag ${MAKE_WAVES_SOURCE_TAG}, XP/OTT Credits, Academy learning routes and controlled Access Pass utility.\n\nThe terminal is not trying to be a broker, exchange or yield app. It is a guided education/proof layer for users who need context before action.\n\nLive: ${TERMINAL_URL}\nRepo: ${REPO_URL}`,
  },
  {
    id: "nft-utility-line",
    title: "NFT Utility Line",
    icon: BadgeCheck,
    text:
      "OTT Access Pass is a utility access pass for XRPL OnTheTrack Terminal services. It is not an investment, not a yield product, not a resale value promise and not a token value promise. Access is based on exact issuer, taxon and metadata match.",
  },
  {
    id: "compliance",
    title: "Safe Compliance Line",
    icon: ShieldCheck,
    text:
      "The Terminal is education-first. It does not custody funds, does not act as broker, does not provide yield and does not execute trades. XP and OTT Credits are internal progress/utility signals, not tradable tokens or value promises. NFT passes are utility access only.",
  },
  {
    id: "close",
    title: "Closing Line",
    icon: Sparkles,
    text:
      "This is not another wallet dashboard. It is a guided XRPL intelligence, education, proof and utility access layer built by TruthOnTheTrack to help users, builders and partners move safely OnTheTrack.",
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
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_#3898E8,_transparent_35%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="flex items-center gap-2 mb-4 text-black/55">
              <Rocket size={18} />

              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                Submission Pack
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              Make Waves Submission + Founder Mint Room
            </h2>

            <p className="font-mono text-sm text-black/55 max-w-3xl leading-relaxed">
              Alles voor de Make Waves inzending, launch en gecontroleerde OTT Access Pass minting:
              live route, GitHub, demo video, pitch copy, SourceTag proof, legal-safe wording,
              user promo copy en founder-only NFT payloads.
            </p>
          </div>

          <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-3">
            {metrics.map((metric) => (
              <MetricBox key={metric.label} metric={metric} />
            ))}
          </div>
        </div>
      </div>

      <FounderNftMintConsole walletAddress={walletAddress} />

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
                <DeliverableCard key={deliverable.id} deliverable={deliverable} />
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
          <Panel title="Demo Recording Order" icon={Video}>
            <div className="space-y-3">
              <StepLine number="01" text="Open Home: Free to Learn / Xaman to Prove / Pass to Unlock." />
              <StepLine number="02" text="Open XRPL Intelligence: source-first live feed." />
              <StepLine number="03" text="Open Newsroom: generate and copy social draft." />
              <StepLine number="04" text="Open Xaman Activation: onboarding without pressure." />
              <StepLine number="05" text="Open Daily Check-In: create and sign proof." />
              <StepLine number="06" text="Open Reward Ledger: XP + OTT Credits." />
              <StepLine number="07" text="Open Access Gate: scan exact Access Pass NFT." />
              <StepLine number="08" text="Show Founder Mint Console: controlled mint payload." />
              <StepLine number="09" text="Open Pitch Mode: finish with founder story." />
            </div>
          </Panel>

          <Panel title="Full Text" icon={Copy}>
            <button
              onClick={() => copyText("full", fullSubmissionText)}
              className="w-full bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] text-white p-4 text-left hover:brightness-95 transition-all"
            >
              <p className="font-orbitron text-xs font-black uppercase mb-2">
                {copiedId === "full" ? "Copied" : "Copy All"}
              </p>

              <p className="font-mono text-[10px] text-white/75 uppercase">
                Submission + launch copy pack
              </p>
            </button>
          </Panel>

          <Panel title="Red Flag Avoidance" icon={ShieldCheck}>
            <div className="space-y-3">
              <InfoLine text="Do not say XP or Credits have cash value." />
              <InfoLine text="Do not say NFT pass has investment, resale or yield value." />
              <InfoLine text="Do not say Newsroom output is financial advice or trading signal." />
              <InfoLine text="Do not promise profit, token value or guaranteed adoption." />
              <InfoLine text="Say education-first, source-first, self-custody and proof before trust." />
            </div>
          </Panel>

          <Panel title="Final Links" icon={Globe2}>
            <div className="space-y-3">
              <StepLine number="APP" text={TERMINAL_URL} />
              <StepLine number="GIT" text={REPO_URL} />
              <StepLine number="TAG" text={String(MAKE_WAVES_SOURCE_TAG)} />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Panel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-black/10 bg-white p-6">
      <div className="flex items-center gap-2 mb-5">
        <Icon size={18} className="text-[#3898E8]" />

        <p className="font-orbitron text-xs uppercase tracking-widest">
          {title}
        </p>
      </div>

      {children}
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

        <p className="font-mono text-xs text-black/55 leading-relaxed break-words">
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

      <p className="font-mono text-sm text-black/55 leading-relaxed whitespace-pre-line">
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
      <p className="font-orbitron text-xs font-black text-[#C83888] shrink-0">
        {number}
      </p>

      <p className="font-mono text-xs text-black/55 leading-relaxed break-words">{text}</p>
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
