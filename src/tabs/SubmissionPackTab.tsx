import { useMemo, useState, type ElementType } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  ExternalLink,
  FileText,
  Film,
  Fingerprint,
  Github,
  Globe2,
  HeartHandshake,
  Link2,
  ListChecks,
  Rocket,
  ShieldCheck,
  Smartphone,
  Timer,
  Video,
  Wallet,
} from "lucide-react";
import { MAKE_WAVES_SOURCE_TAG } from "../lib/makeWaves";

type SubmissionPackTabProps = {
  walletAddress?: string;
};

type DeliverableStatus = "ready" | "manual" | "blocked";

type Deliverable = {
  id: string;
  title: string;
  status: DeliverableStatus;
  description: string;
  nextAction: string;
  href: string;
  icon: ElementType;
};

type CopyBlock = {
  id: string;
  title: string;
  text: string;
  icon: ElementType;
};

const TERMINAL_URL = "https://ott-terminal-mvp.vercel.app";
const REPO_URL = "https://github.com/opmonthetrack/ott-terminal-mvp";

const deliverables: Deliverable[] = [
  {
    id: "live-project",
    title: "Live production project",
    status: "ready",
    description: "The public terminal is deployed with 17 customer routes, account-first entry, legal files and URL-aware navigation.",
    nextAction: "Use the production URL in every submission field and demo description.",
    href: TERMINAL_URL,
    icon: Globe2,
  },
  {
    id: "source-code",
    title: "Public source repository",
    status: "ready",
    description: "The repository contains the React/Vite app, consolidated Vercel functions, Supabase migrations, route audit and protected Xaman/XRPL delivery flows.",
    nextAction: "Link directly to the repository and reference the green quality checks.",
    href: REPO_URL,
    icon: Github,
  },
  {
    id: "route-quality",
    title: "17-route quality contract",
    status: "ready",
    description: "CI rejects missing or duplicated public routes and verifies TypeScript, production build and public legal/discovery files.",
    nextAction: "Show Launch Control as operational proof rather than describing an old static checklist.",
    href: "/?founder=1&tab=launch",
    icon: ListChecks,
  },
  {
    id: "account-entry",
    title: "Email and Google account entry",
    status: "manual",
    description: "The launch provider and account return routing are built. One real Google login remains a human end-to-end proof.",
    nextAction: "Record a short Google login and return-to-Account clip using an allowed test user.",
    href: "/?tab=wallet",
    icon: BadgeCheck,
  },
  {
    id: "pitch",
    title: "Current two-minute pitch",
    status: "ready",
    description: "Pitch Mode now separates live functions, protected TESTNET functions and claims that must never be made.",
    nextAction: "Rehearse the six timed steps and open the linked proof page for each step.",
    href: "/?founder=1&tab=pitchmode",
    icon: Timer,
  },
  {
    id: "demo-video",
    title: "Final two-minute video",
    status: "manual",
    description: "The script and demo route are ready, but the final recording, captions and public video URL require a human recording session.",
    nextAction: "Record only after the human Smoke Test has no Fail items.",
    href: "/?founder=1&tab=smoketest",
    icon: Film,
  },
  {
    id: "support-voting",
    title: "Verified participation proof",
    status: "manual",
    description: "Xaman-backed roadmap voting and fixed 0.589, 1.589 and 2.589 XRP support are live with validated public totals.",
    nextAction: "Capture one controlled vote and one controlled support transaction as evidence.",
    href: "/?tab=roadmap",
    icon: HeartHandshake,
  },
  {
    id: "academy-certificate",
    title: "Academy certificate delivery",
    status: "blocked",
    description: "Qualification, serial reservation and protected mint/offer/accept delivery are built, but a complete configured TESTNET lifecycle is still required.",
    nextAction: "Complete a qualified learner claim and document exact wallet ownership on TESTNET.",
    href: "/?founder=1&issuer=1",
    icon: BadgeCheck,
  },
  {
    id: "access-pass",
    title: "Access Pass #001–#500",
    status: "blocked",
    description: "Payment validation, atomic serial reservation and NFT ownership unlock are live in protected code. Customer payment remains closed until readiness is green.",
    nextAction: "Run migration and full TESTNET payment → mint → offer → accept → ownership proof before any MAINNET activation.",
    href: "/?founder=1&accessissuer=1",
    icon: Wallet,
  },
  {
    id: "human-qa",
    title: "Human Smoke Test evidence",
    status: "manual",
    description: "The current QA runner stores Pass, Fail, Blocked and Todo states with evidence notes across refreshes.",
    nextAction: "Complete all guest, account, mobile, Xaman, content and transaction checks; copy the final QA report.",
    href: "/?founder=1&tab=smoketest",
    icon: ClipboardCheck,
  },
  {
    id: "legal",
    title: "Legal-safe public position",
    status: "ready",
    description: "Privacy, Terms and product copy separate education and utility from custody, brokerage, trading, yield and guaranteed NFT value.",
    nextAction: "Use the same wording in the submission form, video description and every social launch post.",
    href: "/terms.html",
    icon: ShieldCheck,
  },
  {
    id: "mobile-proof",
    title: "Mobile and Xaman return proof",
    status: "manual",
    description: "URL-aware return routing is built for OAuth, support, Access and general Xaman sessions. Real mobile screenshots remain required.",
    nextAction: "Record one same-device Xaman deep-link return and one mobile menu walkthrough.",
    href: "/?tab=xaman",
    icon: Smartphone,
  },
];

const copyBlocks: CopyBlock[] = [
  {
    id: "one-liner",
    title: "One-liner",
    icon: Rocket,
    text: "XRPL OnTheTrack Terminal is an account-first learning, intelligence and verified-action platform that helps people understand XRPL before connecting a wallet or signing on-ledger actions.",
  },
  {
    id: "short-description",
    title: "Short product description",
    icon: FileText,
    text: `OTT Terminal combines 17 public routes for XRPL learning, source-led intelligence, social content preparation, wallet safety and transparent participation. Visitors can explore as guests or save progress through email or Google. Xaman is used only when proof is needed, including roadmap voting, daily proof and fixed support actions linked to SourceTag ${MAKE_WAVES_SOURCE_TAG}.`,
  },
  {
    id: "submission-summary",
    title: "Submission summary",
    icon: ClipboardCheck,
    text: `For Make Waves, TruthOnTheTrack built a live XRPL terminal that connects onboarding, education, source verification and on-ledger participation. The app has a CI-enforced 17-route public shell, persistent Academy progress, XRPL Intelligence, Newsroom and analysis tools, Google/email accounts, Xaman-backed voting and support, plus protected NFT delivery systems. Access Pass and Foundation Certificate delivery are built but remain gated until database and TESTNET readiness are proven before MAINNET activation.`,
  },
  {
    id: "demo-route",
    title: "Two-minute demo route",
    icon: Video,
    text: "Home guest/account choice → Account with Google → Academy progress → XRPL Intelligence source item → Xaman-backed Roadmap vote → validated Support totals → Access safety gate → Launch Control readiness → close with legal-safe boundaries.",
  },
  {
    id: "technical-proof",
    title: "Technical proof line",
    icon: Link2,
    text: "Every pull request runs a 17-route contract audit, TypeScript validation, a production Vite build and required public-file checks. Xaman return routes preserve the correct page, support totals count validated XRPL transactions, and Access Pass issuance validates payment, serial reservation, mint, targeted offer, acceptance and final wallet ownership.",
  },
  {
    id: "launch-x",
    title: "Launch post for X",
    icon: Fingerprint,
    text: `🌊 XRPL OnTheTrack Terminal is live.

Learn before you sign.
Explore as a guest or use email/Google to save progress.
Connect Xaman only when an on-ledger action needs proof.

✅ XRPL learning + intelligence
✅ Xaman-backed voting
✅ Transparent XRP support
✅ SourceTag ${MAKE_WAVES_SOURCE_TAG}
✅ Protected NFT utility delivery

${TERMINAL_URL}

Education and utility only. No custody, brokerage, yield or guaranteed NFT value.

#XRPL #XRP #Xaman #MakeWaves #OnTheTrack`,
  },
  {
    id: "linkedin",
    title: "LinkedIn launch post",
    icon: Globe2,
    text: `I have built XRPL OnTheTrack Terminal as a live account-first learning and verified-action platform for the XRP Ledger ecosystem.

A visitor can start as a guest, create an OTT account with email or Google, follow source-led XRPL intelligence, save Academy progress and connect Xaman only when an action requires an on-ledger signature.

The current terminal includes 17 public routes, transparent roadmap voting, fixed XRP support with validated totals, SourceTag ${MAKE_WAVES_SOURCE_TAG}, and protected NFT delivery architecture. Access Pass and certificate delivery remain safely gated until complete TESTNET validation is documented before MAINNET activation.

Live: ${TERMINAL_URL}
Source: ${REPO_URL}

No custody, brokerage, trade execution, yield or guaranteed value promise.`,
  },
  {
    id: "whatsapp",
    title: "WhatsApp status",
    icon: Smartphone,
    text: `I built a live XRPL learning + verified-action terminal 🌊

Start as a guest or with Google/email.
Learn first. Use Xaman only when proof is needed.

${TERMINAL_URL}

Education + utility only.`,
  },
  {
    id: "community",
    title: "XRPL community invite",
    icon: BadgeCheck,
    text: `XRPL builders, educators and community members: I would value practical feedback on XRPL OnTheTrack Terminal.

Please test the guest onboarding, Academy flow, Intelligence source layer, Xaman-backed roadmap voting and transparent support page. Protected NFT delivery remains TESTNET-gated until the complete payment and ownership lifecycle is proven.

Live: ${TERMINAL_URL}
Repo: ${REPO_URL}
SourceTag: ${MAKE_WAVES_SOURCE_TAG}`,
  },
  {
    id: "support-line",
    title: "Support transparency line",
    icon: HeartHandshake,
    text: "Support is voluntary and uses fixed 0.589, 1.589 or 2.589 XRP Xaman payments. Only validated XRPL transactions with the official destination, SourceTag and support memo count in the public total. Support creates no investment, governance, token, equity or guaranteed access rights.",
  },
  {
    id: "access-line",
    title: "Access Pass utility line",
    icon: Wallet,
    text: "OTT Access Pass Alpha is utility access only. The protected flow reserves one unique serial from #001 to #500 after exact payment validation and unlocks only after the connected wallet owns the exact NFT. Customer payment remains disabled until database and TESTNET readiness are green, and MAINNET requires explicit recorded TESTNET evidence.",
  },
  {
    id: "certificate-line",
    title: "Certificate line",
    icon: BadgeCheck,
    text: "The OTT XRPL Foundation Certificate is proof of verified Academy completion, not an investment or value promise. Qualification, issuer mint, targeted transfer offer, learner acceptance and final wallet ownership must all be validated.",
  },
  {
    id: "safe-line",
    title: "Safe compliance line",
    icon: ShieldCheck,
    text: "OTT Terminal provides education, research and utility workflows. It does not collect seed phrases, custody funds, act as broker or exchange, execute trades, provide yield, promise profit or guarantee NFT resale value. Human review remains required before public content publication and production activation.",
  },
  {
    id: "closing",
    title: "Closing line",
    icon: Rocket,
    text: "OTT Terminal gives XRPL users one clear track from curiosity to understanding, and from understanding to verified participation—without forcing a wallet before they are ready.",
  },
];

export function SubmissionPackTab({ walletAddress = "guest" }: SubmissionPackTabProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const counts = useMemo(() => ({
    ready: deliverables.filter((item) => item.status === "ready").length,
    manual: deliverables.filter((item) => item.status === "manual").length,
    blocked: deliverables.filter((item) => item.status === "blocked").length,
  }), []);

  const fullSubmissionText = useMemo(
    () => copyBlocks.map((block) => `${block.title}\n${block.text}`).join("\n\n"),
    [],
  );

  async function copyText(id: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 1600);
  }

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <section className="border-b border-slate-200 bg-[radial-gradient(circle_at_90%_0%,rgba(56,152,232,0.14),transparent_34%),radial-gradient(circle_at_0%_100%,rgba(200,56,136,0.12),transparent_34%),#fff]">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700"><Rocket size={17} /> Current Submission Pack</div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Submission evidence and launch copy that match the live product.</h1>
              <p className="mt-5 text-base leading-7 text-slate-600">
                Ready means it exists and can be linked. Manual means a human recording or transaction is still required. Blocked means a protected TESTNET lifecycle must be completed before the claim can become production-ready.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button type="button" onClick={() => void copyText("all", fullSubmissionText)} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
                  {copiedId === "all" ? <CheckCircle2 size={17} /> : <Copy size={17} />}{copiedId === "all" ? "Copied" : "Copy all submission copy"}
                </button>
                <a href="/?founder=1&tab=pitchmode" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">Pitch Mode <ExternalLink size={17} /></a>
                <a href="/?founder=1&tab=smoketest" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">Smoke Test <ExternalLink size={17} /></a>
              </div>
            </div>

            <div className="grid w-full grid-cols-2 gap-3 xl:max-w-sm">
              <Metric icon={BadgeCheck} label="Ready" value={String(counts.ready)} />
              <Metric icon={Film} label="Manual proof" value={String(counts.manual)} />
              <Metric icon={ShieldCheck} label="Blocked" value={String(counts.blocked)} />
              <Metric icon={Link2} label="Wallet" value={walletAddress === "guest" ? "Guest" : "Connected"} />
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <section>
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Deliverable status</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">What can be submitted today—and what still needs proof.</h2>
          </div>
          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {deliverables.map((deliverable) => <DeliverableCard key={deliverable.id} deliverable={deliverable} />)}
          </div>
        </section>

        <section className="mt-12">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Copy library</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Current product wording, ready to copy.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">Every block distinguishes live functionality from TESTNET-gated delivery and preserves the legal-safe utility position.</p>
          </div>
          <div className="mt-7 grid gap-5 xl:grid-cols-2">
            {copyBlocks.map((block) => (
              <CopyCard key={block.id} block={block} copied={copiedId === block.id} onCopy={() => void copyText(block.id, block.text)} />
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
          <div className="flex items-center gap-3"><Link2 className="text-blue-700" size={21} /><h2 className="text-xl font-semibold">Official submission links</h2></div>
          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <OfficialLink label="Live terminal" href={TERMINAL_URL} icon={Globe2} />
            <OfficialLink label="GitHub repository" href={REPO_URL} icon={Github} />
            <OfficialLink label="Launch Control" href="/?founder=1&tab=launch" icon={ListChecks} />
            <OfficialLink label="Pitch Mode" href="/?founder=1&tab=pitchmode" icon={Video} />
          </div>
          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-700">Proof identity</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">Make Waves SourceTag: <strong>{MAKE_WAVES_SOURCE_TAG}</strong>. Use the full value consistently; do not shorten it to 2606 in submission evidence.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

function DeliverableCard({ deliverable }: { deliverable: Deliverable }) {
  const Icon = deliverable.icon;
  const status = deliverableStatus(deliverable.status);
  return (
    <article className={`rounded-3xl border p-5 ${status.card}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-sm"><Icon size={21} /></div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.badge}`}>{status.label}</span>
      </div>
      <h3 className="mt-5 text-lg font-semibold">{deliverable.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{deliverable.description}</p>
      <div className="mt-5 rounded-2xl border border-black/5 bg-white/70 p-4"><p className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-500">Next action</p><p className="mt-2 text-sm leading-6 text-slate-700">{deliverable.nextAction}</p></div>
      <a href={deliverable.href} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900">Open evidence <ExternalLink size={15} /></a>
    </article>
  );
}

function CopyCard({ block, copied, onCopy }: { block: CopyBlock; copied: boolean; onCopy: () => void }) {
  const Icon = block.icon;
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white"><Icon size={19} /></div><h3 className="font-semibold">{block.title}</h3></div>
        <button type="button" onClick={onCopy} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">{copied ? <CheckCircle2 size={15} /> : <Copy size={15} />}{copied ? "Copied" : "Copy"}</button>
      </div>
      <pre className="mt-5 whitespace-pre-wrap break-words rounded-2xl border border-slate-100 bg-slate-50 p-4 font-sans text-sm leading-7 text-slate-700">{block.text}</pre>
    </article>
  );
}

function OfficialLink({ label, href, icon: Icon }: { label: string; href: string; icon: ElementType }) {
  return <a href={href} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-800 hover:border-blue-300 hover:bg-blue-50"><span className="flex items-center gap-3"><Icon size={18} className="text-blue-700" />{label}</span><ExternalLink size={15} /></a>;
}

function Metric({ icon: Icon, label, value }: { icon: ElementType; label: string; value: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white/90 p-4"><Icon size={18} className="text-blue-700" /><p className="mt-3 text-xs text-slate-500">{label}</p><p className="mt-1 break-all text-lg font-semibold">{value}</p></div>;
}

function deliverableStatus(status: DeliverableStatus) {
  if (status === "ready") return { label: "Ready", card: "border-emerald-200 bg-emerald-50/40", badge: "bg-emerald-100 text-emerald-800" };
  if (status === "manual") return { label: "Manual proof", card: "border-blue-200 bg-blue-50/35", badge: "bg-blue-100 text-blue-800" };
  return { label: "Blocked", card: "border-amber-200 bg-amber-50/45", badge: "bg-amber-100 text-amber-800" };
}
