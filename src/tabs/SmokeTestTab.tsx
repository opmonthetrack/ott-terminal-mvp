import { useEffect, useMemo, useState, type ElementType } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  ExternalLink,
  Filter,
  MinusCircle,
  RotateCcw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { MAKE_WAVES_SOURCE_TAG } from "../lib/makeWaves";
import { useOttAuthSession } from "../lib/useOttAuthSession";

type SmokeTestTabProps = {
  walletAddress?: string;
};

type TestStatus = "todo" | "pass" | "fail" | "blocked";
type FilterStatus = "all" | TestStatus;

type TestItem = {
  id: string;
  area: string;
  title: string;
  expected: string;
  risk: string;
  action: string;
  href: string;
  requirement: "guest" | "account" | "wallet" | "founder";
};

type SavedSmokeState = {
  statuses: Record<string, TestStatus>;
  notes: Record<string, string>;
  updatedAt: string;
};

const STORAGE_KEY = "ott-current-smoke-test-v3";

const smokeTests: TestItem[] = [
  {
    id: "public-navigation",
    area: "Navigation",
    title: "All 17 public routes open correctly",
    expected: "Every public menu item opens its own page, the active title is correct, direct ?tab= links work and browser back/forward stays synchronized.",
    risk: "Visitors encounter blank pages, duplicate routes or return to Home after a refresh.",
    action: "Open the public menu, visit all route chips in Launch Control, refresh several pages and use browser back/forward.",
    href: "/?founder=1&tab=launch",
    requirement: "guest",
  },
  {
    id: "responsive-layout",
    area: "Responsive",
    title: "Desktop and mobile navigation remain usable",
    expected: "Top navigation, mobile menu, dialogs, cards and long wallet/hash values fit without horizontal overflow or hidden actions.",
    risk: "The product works on desktop but is unusable inside a mobile browser or Xaman return flow.",
    action: "Test approximately 390px, 768px and desktop widths. Open the menu, account dialog, Academy lesson and transaction pages.",
    href: "/",
    requirement: "guest",
  },
  {
    id: "guest-learning",
    area: "Guest",
    title: "A guest can learn without a wallet",
    expected: "Home, Academy, wallet education, network explorer, Intelligence, Newsroom, Support and Access information open without requiring Xaman.",
    risk: "New visitors hit a crypto wallet wall before understanding the terminal.",
    action: "Use a private browser window, continue as guest and follow the Learn and Explore routes.",
    href: "/?tab=home",
    requirement: "guest",
  },
  {
    id: "account-google",
    area: "Account",
    title: "Email and Google account flows return to Account",
    expected: "Email sign-in/create/reset and Google OAuth show friendly errors, never expose raw provider JSON and return to ?tab=wallet after confirmation.",
    risk: "Users authenticate successfully but land on Home, see a raw error or cannot continue their profile.",
    action: "Complete one email flow and one real Google sign-in using an allowed Google test user.",
    href: "/?tab=wallet",
    requirement: "account",
  },
  {
    id: "academy-progress",
    area: "Academy",
    title: "Learning progress survives refresh and account return",
    expected: "Lessons, explanations, glossary, sources and knowledge checks work; authenticated progress is restored and certificate qualification is calculated from verified completion.",
    risk: "The Academy looks complete but loses progress or awards readiness without earned completion.",
    action: "Finish a lesson, refresh, sign out/in and verify the progress and score summary.",
    href: "/?tab=academy",
    requirement: "account",
  },
  {
    id: "intelligence-feed",
    area: "Intelligence",
    title: "Dashboard and XRPL Intelligence load current source items",
    expected: "The Dashboard and Intelligence pages return items from /api/news, label fallback clearly, show source confidence and open the original source.",
    risk: "The daily product surface is empty, stale or presents fallback content as verified live reporting.",
    action: "Refresh Dashboard and XRPL Intelligence, change buckets and open at least two source links.",
    href: "/?tab=intel",
    requirement: "guest",
  },
  {
    id: "content-studio",
    area: "Content",
    title: "Newsroom and OTT Intelligence produce usable output",
    expected: "A selected source can produce platform-specific drafts and analysis modes; copy and source buttons work without inventing unsupported facts.",
    risk: "The UI appears functional while content output, clipboard or source grounding is broken.",
    action: "Test X, LinkedIn, WhatsApp and one OTT Intelligence analysis mode, then copy both outputs.",
    href: "/?tab=news",
    requirement: "guest",
  },
  {
    id: "xaman-connect",
    area: "Xaman",
    title: "Desktop QR and mobile deep-link connection work",
    expected: "Xaman payload creation, QR, same-device deep link, return routing and connected wallet persistence work without asking for a seed phrase.",
    risk: "The core signing route fails on the device type most visitors use.",
    action: "Test once on desktop with QR and once on mobile with Xaman installed; refresh after return.",
    href: "/?tab=xaman",
    requirement: "wallet",
  },
  {
    id: "proof-rewards",
    area: "Proof",
    title: "Daily proof is validated before rewards appear",
    expected: `A signed Daily Check-In uses SourceTag ${MAKE_WAVES_SOURCE_TAG}, returns to the correct page and adds the configured XP/credit event only once.`,
    risk: "Unsigned, mismatched or repeated payloads create local rewards or confusing duplicate records.",
    action: "Sign one Daily Check-In, verify it, inspect Reward Ledger, then repeat verification to test idempotency.",
    href: "/?tab=checkin",
    requirement: "wallet",
  },
  {
    id: "roadmap-voting",
    area: "Voting",
    title: "Roadmap votes require Xaman and update public totals",
    expected: "A vote creates a signing transaction, validates the returned hash and visibly updates totals so visitors can compare options.",
    risk: "Voting is only a local button click or the public result does not match validated transactions.",
    action: "Vote once, sign in Xaman, verify after return and compare the option totals.",
    href: "/?tab=roadmap",
    requirement: "wallet",
  },
  {
    id: "support-payment",
    area: "Support",
    title: "0.589, 1.589 and 2.589 XRP support works",
    expected: "Each fixed amount creates the correct Xaman payment, SourceTag and memo; only validated transactions appear in totals and public text requires explicit consent.",
    risk: "A wrong amount, wallet, consent state or unvalidated payment is counted publicly.",
    action: "Open all three amount choices. Complete one controlled payment and verify the live counter after ledger validation.",
    href: "/?tab=support",
    requirement: "wallet",
  },
  {
    id: "access-gate-safety",
    area: "Access",
    title: "Access Gate never charges before readiness is green",
    expected: "Before protected setup is complete, the page shows preparation status with no payment button. When ready, the customer sees the verified four-stage delivery flow.",
    risk: "A customer pays while migration, issuer or TESTNET configuration is incomplete.",
    action: "Inspect Access as guest, account-only and connected wallet; compare it with founder Access readiness.",
    href: "/?tab=accessgate",
    requirement: "account",
  },
  {
    id: "access-pass-testnet",
    area: "Access NFT",
    title: "Complete Access Pass #001–#500 lifecycle on TESTNET",
    expected: "Exact 1.589 XRP payment validation reserves one unique serial, founder mint and targeted offer validate, customer accepts and exact NFT ownership unlocks access.",
    risk: "Serial duplication, wrong network, wrong signer, wrong NFT or payment-only access bypass reaches production.",
    action: "Use dedicated TESTNET payment and issuer accounts: payment → reserve → mint → offer → accept → account_nfts ownership.",
    href: "/?founder=1&accessissuer=1",
    requirement: "founder",
  },
  {
    id: "certificate-delivery",
    area: "Certificate NFT",
    title: "Qualified Academy certificate reaches the learner wallet",
    expected: "Only a qualified account can reserve a serial; founder mint/offer and learner acceptance validate before status becomes issued.",
    risk: "Certificates are issued without qualification or marked delivered before actual wallet ownership.",
    action: "Use a completed Academy account and run the protected certificate issuer lifecycle end to end.",
    href: "/?founder=1&issuer=1",
    requirement: "founder",
  },
  {
    id: "return-routing",
    area: "Returns",
    title: "OAuth and Xaman returns stay on the correct page",
    expected: "Google returns to Account; support returns to Support; Access payment/accept returns to Access; proof and vote sessions preserve their target in ?tab=.",
    risk: "A successful external action appears lost because the terminal silently opens Home.",
    action: "Complete or cancel one action from each return type and refresh the resulting URL.",
    href: "/?tab=wallet",
    requirement: "wallet",
  },
  {
    id: "legal-discovery",
    area: "Public files",
    title: "Legal, SEO and install files are public",
    expected: "Privacy, Terms, robots.txt, sitemap.xml, manifest and social metadata are reachable and use the production URL.",
    risk: "OAuth review, search discovery, social sharing or install behavior looks incomplete.",
    action: "Open each public file and inspect a shared homepage preview on one social platform.",
    href: "/privacy.html",
    requirement: "guest",
  },
  {
    id: "founder-boundary",
    area: "Founder",
    title: "Internal tools remain outside the normal customer menu",
    expected: "Pitch, Submission, Smoke Test, Launch Control and issuer queues require founder URLs; normal users see only the 17 public routes.",
    risk: "Customers see unfinished labs, operational controls or issuer actions.",
    action: "Compare the normal app with ?founder=1 and attempt both issuer URLs while signed out.",
    href: "/?founder=1&tab=launch",
    requirement: "founder",
  },
  {
    id: "pitch-submission",
    area: "Delivery",
    title: "Pitch Mode and Submission Pack match the current product",
    expected: "The two-minute story, demo order, claims, screenshots and launch copy describe active features accurately and do not call live features coming soon.",
    risk: "The pitch contradicts the product or makes unsafe investment, yield, custody or guaranteed-value claims.",
    action: "Run Pitch Mode from start to finish and review every Submission Pack copy block against the live app.",
    href: "/?founder=1&tab=pitchmode",
    requirement: "founder",
  },
];

function blankStatuses() {
  return smokeTests.reduce<Record<string, TestStatus>>((result, test) => {
    result[test.id] = "todo";
    return result;
  }, {});
}

function loadSavedState(): SavedSmokeState {
  if (typeof window === "undefined") {
    return { statuses: blankStatuses(), notes: {}, updatedAt: "" };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { statuses: blankStatuses(), notes: {}, updatedAt: "" };
    const parsed = JSON.parse(raw) as Partial<SavedSmokeState>;
    const statuses = blankStatuses();

    for (const test of smokeTests) {
      const value = parsed.statuses?.[test.id];
      if (value === "todo" || value === "pass" || value === "fail" || value === "blocked") {
        statuses[test.id] = value;
      }
    }

    return {
      statuses,
      notes: parsed.notes ?? {},
      updatedAt: parsed.updatedAt ?? "",
    };
  } catch {
    return { statuses: blankStatuses(), notes: {}, updatedAt: "" };
  }
}

export function SmokeTestTab({ walletAddress = "guest" }: SmokeTestTabProps) {
  const { user, signedIn } = useOttAuthSession();
  const [saved, setSaved] = useState<SavedSmokeState>(loadSavedState);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }, [saved]);

  const counts = useMemo(() => {
    const values = smokeTests.map((test) => saved.statuses[test.id] ?? "todo");
    return {
      total: values.length,
      pass: values.filter((status) => status === "pass").length,
      fail: values.filter((status) => status === "fail").length,
      blocked: values.filter((status) => status === "blocked").length,
      todo: values.filter((status) => status === "todo").length,
    };
  }, [saved.statuses]);

  const filteredTests = useMemo(
    () => smokeTests.filter((test) => filter === "all" || saved.statuses[test.id] === filter),
    [filter, saved.statuses],
  );

  const readiness = Math.round((counts.pass / counts.total) * 100);
  const verdict = counts.fail > 0
    ? "Needs fixes"
    : counts.blocked > 0
      ? "Blocked by prerequisites"
      : counts.todo > 0
        ? "Human QA in progress"
        : "Human QA passed";

  const reportText = useMemo(() => {
    const lines = smokeTests.flatMap((test, index) => [
      `${index + 1}. ${(saved.statuses[test.id] ?? "todo").toUpperCase()} — ${test.area} — ${test.title}`,
      `Expected: ${test.expected}`,
      `Action: ${test.action}`,
      `Note: ${saved.notes[test.id]?.trim() || "—"}`,
      "",
    ]);

    return [
      "XRPL OnTheTrack Terminal — Human Smoke Test Report",
      `Generated: ${new Date().toISOString()}`,
      `Last saved: ${saved.updatedAt || "not yet"}`,
      `OTT account: ${user?.email ?? "not signed in"}`,
      `XRPL wallet: ${walletAddress}`,
      `SourceTag: ${MAKE_WAVES_SOURCE_TAG}`,
      `Verdict: ${verdict}`,
      `Readiness: ${readiness}%`,
      `Passed: ${counts.pass}/${counts.total}`,
      `Failed: ${counts.fail}`,
      `Blocked: ${counts.blocked}`,
      `Todo: ${counts.todo}`,
      "",
      "Checks:",
      ...lines,
      "Guardrails: education and utility only; no custody, seed collection, brokerage, yield, price promise, guaranteed resale value or financial advice.",
    ].join("\n");
  }, [counts, readiness, saved, user?.email, verdict, walletAddress]);

  function setStatus(testId: string, status: TestStatus) {
    setSaved((current) => ({
      ...current,
      statuses: { ...current.statuses, [testId]: status },
      updatedAt: new Date().toISOString(),
    }));
  }

  function setNote(testId: string, note: string) {
    setSaved((current) => ({
      ...current,
      notes: { ...current.notes, [testId]: note },
      updatedAt: new Date().toISOString(),
    }));
  }

  function resetTests() {
    setSaved({ statuses: blankStatuses(), notes: {}, updatedAt: new Date().toISOString() });
    setFilter("all");
    setCopied(false);
  }

  async function copyReport() {
    await navigator.clipboard.writeText(reportText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <section className="border-b border-slate-200 bg-[radial-gradient(circle_at_90%_0%,rgba(56,152,232,0.14),transparent_34%),radial-gradient(circle_at_0%_100%,rgba(200,56,136,0.12),transparent_34%),#fff]">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                <ClipboardCheck size={17} /> Founder human QA
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Test the product people actually use now.</h1>
              <p className="mt-5 text-base leading-7 text-slate-600">
                Launch Control performs automated endpoint checks. This runner records the human account, wallet, mobile, copy and transaction tests that automation cannot honestly approve.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="/?founder=1&tab=launch" className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
                  Open Launch Control <ExternalLink size={17} />
                </a>
                <button type="button" onClick={() => void copyReport()} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                  {copied ? <CheckCircle2 size={17} /> : <Copy size={17} />}{copied ? "Copied" : "Copy QA report"}
                </button>
                <button type="button" onClick={resetTests} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                  <RotateCcw size={17} /> Reset
                </button>
              </div>
              <p className="mt-4 text-xs text-slate-500">
                Account: {signedIn ? user?.email : "not signed in"} · Wallet: {walletAddress} · Saved locally: {saved.updatedAt ? new Date(saved.updatedAt).toLocaleString() : "not yet"}
              </p>
            </div>

            <div className={`w-full rounded-3xl border p-6 xl:max-w-sm ${counts.fail ? "border-rose-200 bg-rose-50" : counts.blocked ? "border-amber-200 bg-amber-50" : counts.todo ? "border-blue-200 bg-blue-50" : "border-emerald-200 bg-emerald-50"}`}>
              <div className="flex items-start gap-3">
                {counts.fail ? <XCircle className="text-rose-700" size={28} /> : counts.blocked ? <AlertTriangle className="text-amber-700" size={28} /> : <ShieldCheck className={counts.todo ? "text-blue-700" : "text-emerald-700"} size={28} />}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Current verdict</p>
                  <p className="mt-1 text-xl font-semibold">{verdict}</p>
                  <p className="mt-2 text-sm text-slate-600">{readiness}% passed</p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Summary label="Pass" value={counts.pass} />
                <Summary label="Fail" value={counts.fail} />
                <Summary label="Blocked" value={counts.blocked} />
                <Summary label="Todo" value={counts.todo} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div data-page-region="true" className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Test queue</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">{filteredTests.length} visible checks</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Filter size={17} className="text-slate-500" />
            {(["all", "todo", "pass", "fail", "blocked"] as FilterStatus[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`rounded-full px-4 py-2 text-xs font-semibold capitalize ${filter === value ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-7 space-y-5">
          {filteredTests.map((test) => (
            <TestCard
              key={test.id}
              number={smokeTests.indexOf(test) + 1}
              test={test}
              status={saved.statuses[test.id] ?? "todo"}
              note={saved.notes[test.id] ?? ""}
              onStatus={(status) => setStatus(test.id, status)}
              onNote={(note) => setNote(test.id, note)}
            />
          ))}
          {filteredTests.length === 0 && (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-600">No tests match this filter.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function TestCard({
  number,
  test,
  status,
  note,
  onStatus,
  onNote,
}: {
  number: number;
  test: TestItem;
  status: TestStatus;
  note: string;
  onStatus: (status: TestStatus) => void;
  onNote: (note: string) => void;
}) {
  const style = statusStyle(status);
  const StatusIcon = style.icon;

  return (
    <article className={`rounded-3xl border p-5 sm:p-7 ${style.card}`}>
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white">{number}</span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">{test.area}</span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 capitalize">{test.requirement}</span>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${style.badge}`}><StatusIcon size={14} />{style.label}</span>
          </div>

          <h3 className="mt-5 text-xl font-semibold tracking-tight">{test.title}</h3>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <Detail title="Expected" text={test.expected} />
            <Detail title="Risk" text={test.risk} tone="risk" />
            <Detail title="Test action" text={test.action} tone="action" />
          </div>

          <label className="mt-5 block">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Evidence or note</span>
            <textarea
              value={note}
              onChange={(event) => onNote(event.target.value)}
              rows={2}
              placeholder="Device, account, transaction hash, screenshot reference or problem…"
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
        </div>

        <div className="w-full space-y-3 xl:w-60">
          <a href={test.href} target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800">
            Open test <ExternalLink size={16} />
          </a>
          <div className="grid grid-cols-2 gap-2">
            <StatusButton label="Pass" active={status === "pass"} onClick={() => onStatus("pass")} tone="pass" />
            <StatusButton label="Fail" active={status === "fail"} onClick={() => onStatus("fail")} tone="fail" />
            <StatusButton label="Blocked" active={status === "blocked"} onClick={() => onStatus("blocked")} tone="blocked" />
            <StatusButton label="Todo" active={status === "todo"} onClick={() => onStatus("todo")} tone="todo" />
          </div>
        </div>
      </div>
    </article>
  );
}

function Detail({ title, text, tone = "default" }: { title: string; text: string; tone?: "default" | "risk" | "action" }) {
  const classes = tone === "risk" ? "border-rose-100 bg-rose-50" : tone === "action" ? "border-blue-100 bg-blue-50" : "border-slate-200 bg-white";
  return <div className={`rounded-2xl border p-4 ${classes}`}><p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{title}</p><p className="mt-2 text-sm leading-6 text-slate-700">{text}</p></div>;
}

function StatusButton({ label, active, onClick, tone }: { label: string; active: boolean; onClick: () => void; tone: TestStatus }) {
  const activeClass = tone === "pass" ? "border-emerald-600 bg-emerald-600 text-white" : tone === "fail" ? "border-rose-600 bg-rose-600 text-white" : tone === "blocked" ? "border-amber-600 bg-amber-600 text-white" : "border-slate-700 bg-slate-700 text-white";
  return <button type="button" onClick={onClick} className={`rounded-xl border px-3 py-2.5 text-xs font-semibold ${active ? activeClass : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>{label}</button>;
}

function Summary({ label, value }: { label: string; value: number }) {
  return <div className="rounded-2xl border border-black/5 bg-white/70 p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-2xl font-semibold">{value}</p></div>;
}

function statusStyle(status: TestStatus): { label: string; card: string; badge: string; icon: ElementType } {
  if (status === "pass") return { label: "Pass", card: "border-emerald-200 bg-emerald-50/30", badge: "bg-emerald-100 text-emerald-800", icon: CheckCircle2 };
  if (status === "fail") return { label: "Fail", card: "border-rose-200 bg-rose-50/40", badge: "bg-rose-100 text-rose-800", icon: XCircle };
  if (status === "blocked") return { label: "Blocked", card: "border-amber-200 bg-amber-50/40", badge: "bg-amber-100 text-amber-800", icon: AlertTriangle };
  return { label: "Todo", card: "border-slate-200 bg-white", badge: "bg-slate-100 text-slate-700", icon: MinusCircle };
}
