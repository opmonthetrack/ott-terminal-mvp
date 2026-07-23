import { useMemo, useState, type ElementType } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock3,
  Copy,
  ExternalLink,
  Fingerprint,
  Globe2,
  KeyRound,
  PlayCircle,
  Route,
  ShieldCheck,
  Users,
  Wallet,
  Waves,
} from "lucide-react";
import { MAKE_WAVES_SOURCE_TAG } from "../lib/makeWaves";

type PitchModeTabProps = {
  walletAddress?: string;
};

type PitchProof = {
  label: string;
  href: string;
};

type PitchStep = {
  id: string;
  time: string;
  title: string;
  headline: string;
  script: string;
  proof: PitchProof[];
  icon: ElementType;
};

const TERMINAL_URL = "https://ott-terminal-mvp.vercel.app";

const pitchSteps: PitchStep[] = [
  {
    id: "opening",
    time: "0:00–0:18",
    title: "Opening",
    headline: "Start with an account or as a guest. A wallet comes later.",
    script:
      "XRPL OnTheTrack Terminal is an account-first learning, intelligence and verified-action platform for the XRP Ledger. A new visitor can explore as a guest or use email or Google to save progress. Xaman is only introduced when an on-ledger signature is genuinely needed.",
    proof: [
      { label: "Home: guest or free account", href: "/?tab=home" },
      { label: "Account: email and Google", href: "/?tab=wallet" },
      { label: "17 public routes", href: "/?founder=1&tab=launch" },
    ],
    icon: KeyRound,
  },
  {
    id: "problem",
    time: "0:18–0:38",
    title: "Problem",
    headline: "New users are sent from headlines to wallets before they understand the source.",
    script:
      "XRPL already has strong payment and tokenization rails, but the learning journey is fragmented across documentation, social media, wallets and communities. People need one track that separates source, explanation, risk and the next safe action.",
    proof: [
      { label: "XRPL Intelligence source layer", href: "/?tab=intel" },
      { label: "Wallet learning before connection", href: "/?tab=xamanactivation" },
      { label: "Transaction verification", href: "/?tab=xrplverify" },
    ],
    icon: Users,
  },
  {
    id: "learning-loop",
    time: "0:38–1:00",
    title: "Learning loop",
    headline: "Source → explanation → learning → verified progress.",
    script:
      "The terminal collects XRPL source items, labels confidence and fallback state, turns them into beginner explanations and human-reviewed content drafts, and connects that awareness to structured Academy lessons. Logged-in users keep their progress and can qualify for a certificate only after verified completion.",
    proof: [
      { label: "Daily Dashboard", href: "/?tab=dashboard" },
      { label: "Newsroom and OTT Intelligence", href: "/?tab=news" },
      { label: "Academy progress", href: "/?tab=academy" },
    ],
    icon: Brain,
  },
  {
    id: "verified-actions",
    time: "1:00–1:28",
    title: "Verified actions",
    headline: "Xaman confirms actions; the browser button alone is never proof.",
    script:
      `When a user checks in, votes or supports the project, the terminal creates a Xaman request and verifies the returned ledger result. Roadmap totals show what others voted for. Support uses fixed 0.589, 1.589 and 2.589 XRP choices, and validated activity remains traceable through SourceTag ${MAKE_WAVES_SOURCE_TAG}.`,
    proof: [
      { label: "Daily proof", href: "/?tab=checkin" },
      { label: "Xaman-backed roadmap voting", href: "/?tab=roadmap" },
      { label: "Validated support totals", href: "/?tab=support" },
    ],
    icon: Waves,
  },
  {
    id: "protected-utility",
    time: "1:28–1:48",
    title: "Protected utility",
    headline: "NFT delivery is built, but payment stays closed until readiness is green.",
    script:
      "The Access Pass flow validates the exact payment, atomically reserves one serial from number 001 to 500, lets the founder sign the mint and targeted offer in Xaman, and unlocks only after the receiving wallet owns the exact NFT. The code is live, but customer payment remains disabled until database and TESTNET readiness pass. MAINNET is separately locked behind recorded TESTNET evidence.",
    proof: [
      { label: "Customer Access safety gate", href: "/?tab=accessgate" },
      { label: "Founder Access readiness", href: "/?founder=1&accessissuer=1" },
      { label: "Foundation Certificate issuer", href: "/?founder=1&issuer=1" },
    ],
    icon: BadgeCheck,
  },
  {
    id: "close",
    time: "1:48–2:00",
    title: "Close",
    headline: "A source-first XRPL track from curiosity to verified participation.",
    script:
      "OTT Terminal is not a bank, broker, exchange, custody service or yield product. It is a transparent education, research and utility platform designed to help users verify before they trust and connect a wallet only when they understand the action.",
    proof: [
      { label: "Privacy policy", href: "/privacy.html" },
      { label: "Terms of use", href: "/terms.html" },
      { label: "Human Smoke Test", href: "/?founder=1&tab=smoketest" },
    ],
    icon: ShieldCheck,
  },
];

export function PitchModeTab({ walletAddress = "guest" }: PitchModeTabProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const activeStep = pitchSteps[activeStepIndex];
  const ActiveIcon = activeStep.icon;

  const fullScript = useMemo(
    () => [
      "XRPL OnTheTrack Terminal — Current 2-Minute Pitch",
      `Live: ${TERMINAL_URL}`,
      `SourceTag: ${MAKE_WAVES_SOURCE_TAG}`,
      "",
      ...pitchSteps.flatMap((step) => [
        `${step.time} — ${step.title}`,
        step.headline,
        step.script,
        `Show: ${step.proof.map((item) => item.label).join(" | ")}`,
        "",
      ]),
      "Safe claim: education, research and utility only. No custody, brokerage, trade execution, yield, profit promise, guaranteed NFT value or financial advice.",
      "Activation claim: Access Pass payment remains closed until protected database and TESTNET readiness are green; MAINNET requires separately recorded TESTNET evidence.",
    ].join("\n"),
    [],
  );

  async function copyFullScript() {
    await navigator.clipboard.writeText(fullScript);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function nextStep() {
    setActiveStepIndex((current) => (current + 1) % pitchSteps.length);
  }

  function previousStep() {
    setActiveStepIndex((current) => (current - 1 + pitchSteps.length) % pitchSteps.length);
  }

  const progress = Math.round(((activeStepIndex + 1) / pitchSteps.length) * 100);

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <section className="border-b border-slate-200 bg-[radial-gradient(circle_at_90%_0%,rgba(56,152,232,0.14),transparent_34%),radial-gradient(circle_at_0%_100%,rgba(200,56,136,0.12),transparent_34%),#fff]">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                <PlayCircle size={17} /> Current Pitch Mode
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Two minutes. Only claims the live product can support.</h1>
              <p className="mt-5 text-base leading-7 text-slate-600">
                Use the script in order, open the linked proof pages and keep protected TESTNET functionality separate from customer-ready production functionality.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button type="button" onClick={() => void copyFullScript()} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
                  {copied ? <CheckCircle2 size={17} /> : <Copy size={17} />}{copied ? "Copied" : "Copy full script"}
                </button>
                <a href={TERMINAL_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                  Open live terminal <ExternalLink size={17} />
                </a>
                <a href="/?founder=1&tab=launch" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                  Launch Control <ExternalLink size={17} />
                </a>
              </div>
            </div>

            <div className="grid w-full grid-cols-2 gap-3 xl:max-w-sm">
              <Metric icon={Clock3} label="Runtime" value="2 min" />
              <Metric icon={Route} label="Public routes" value="17" />
              <Metric icon={Fingerprint} label="SourceTag" value={String(MAKE_WAVES_SOURCE_TAG)} />
              <Metric icon={Wallet} label="Demo wallet" value={walletAddress === "guest" ? "Guest" : "Connected"} />
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="grid gap-6 xl:grid-cols-[330px_1fr_320px]">
          <aside className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <BookOpen className="text-blue-700" size={20} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Pitch steps</p>
                <p className="mt-1 font-semibold">{activeStepIndex + 1} of {pitchSteps.length}</p>
              </div>
            </div>
            <div className="mt-5 space-y-2">
              {pitchSteps.map((step, index) => {
                const Icon = step.icon;
                const active = index === activeStepIndex;
                return (
                  <button key={step.id} type="button" onClick={() => setActiveStepIndex(index)} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left ${active ? "border-blue-300 bg-white text-blue-900 shadow-sm" : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-white"}`}>
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${active ? "bg-blue-700 text-white" : "bg-slate-200 text-slate-600"}`}><Icon size={18} /></span>
                    <span className="min-w-0"><span className="block text-xs text-slate-500">{step.time}</span><span className="block truncate text-sm font-semibold">{step.title}</span></span>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">{activeStep.time} · {activeStep.title}</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight">{activeStep.headline}</h2>
              </div>
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white"><ActiveIcon size={27} /></div>
            </div>

            <div className="mt-7 rounded-3xl border border-blue-100 bg-blue-50 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-700">Say this</p>
              <p className="mt-3 text-base leading-8 text-slate-800">{activeStep.script}</p>
            </div>

            <div className="mt-7">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Show these live proofs</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {activeStep.proof.map((item) => (
                  <a key={item.label} href={item.href} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-800 hover:border-blue-300 hover:bg-blue-50">
                    {item.label}<ExternalLink size={16} className="shrink-0 text-blue-700" />
                  </a>
                ))}
              </div>
            </div>

            <div className="mt-8 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-700 transition-all" style={{ width: `${progress}%` }} /></div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button type="button" onClick={previousStep} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"><ArrowLeft size={17} /> Previous</button>
              <button type="button" onClick={nextStep} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800">Next <ArrowRight size={17} /></button>
            </div>
          </section>

          <aside className="space-y-4">
            <ClaimCard
              icon={Globe2}
              title="Live now"
              tone="live"
              lines={[
                "Guest, email and Google account entry",
                "17 public routes and persistent Academy progress",
                "Intelligence, Newsroom and analysis",
                "Xaman proof, voting and validated support totals",
              ]}
            />
            <ClaimCard
              icon={BadgeCheck}
              title="Built but gated"
              tone="gated"
              lines={[
                "Access Pass #001–#500 customer delivery",
                "Foundation Certificate NFT delivery",
                "TESTNET and founder readiness must be green",
                "MAINNET requires explicit recorded TESTNET proof",
              ]}
            />
            <ClaimCard
              icon={ShieldCheck}
              title="Never claim"
              tone="safe"
              lines={[
                "No custody or seed collection",
                "No brokerage or trade execution",
                "No yield, profit or price promise",
                "No guaranteed NFT resale value",
              ]}
            />
          </aside>
        </div>
      </main>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: ElementType; label: string; value: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white/90 p-4"><Icon size={18} className="text-blue-700" /><p className="mt-3 text-xs text-slate-500">{label}</p><p className="mt-1 break-all text-lg font-semibold">{value}</p></div>;
}

function ClaimCard({ icon: Icon, title, tone, lines }: { icon: ElementType; title: string; tone: "live" | "gated" | "safe"; lines: string[] }) {
  const classes = tone === "live" ? "border-emerald-200 bg-emerald-50" : tone === "gated" ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-slate-50";
  return (
    <div className={`rounded-3xl border p-5 ${classes}`}>
      <div className="flex items-center gap-3"><Icon size={20} /><h3 className="font-semibold">{title}</h3></div>
      <div className="mt-4 space-y-3">
        {lines.map((line) => <div key={line} className="flex items-start gap-2"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-slate-600" /><p className="text-sm leading-5 text-slate-700">{line}</p></div>)}
      </div>
    </div>
  );
}
