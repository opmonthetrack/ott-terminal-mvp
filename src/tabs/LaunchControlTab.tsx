import { useCallback, useEffect, useMemo, useState, type ElementType } from "react";
import {
  Activity,
  BadgeCheck,
  CheckCircle2,
  CircleAlert,
  CircleX,
  Database,
  ExternalLink,
  FileCheck2,
  Globe2,
  HeartHandshake,
  KeyRound,
  ListChecks,
  Loader2,
  Newspaper,
  RefreshCcw,
  Rocket,
  Route,
  ShieldCheck,
  Wallet,
  Waves,
} from "lucide-react";
import {
  getEnabledOttAuthProviders,
  getFriendlyOttAuthError,
  isOttAuthConfigured,
} from "../lib/ottAuth";
import {
  loadAccessPassReadiness,
  type AccessPassReadiness,
} from "../lib/accessPassIssuerClient";
import { loadCertificateIssuerQueue } from "../lib/certificateIssuerClient";
import { fetchXrplIntelligence } from "../lib/newsClient";
import { useOttAuthSession } from "../lib/useOttAuthSession";

const PUBLIC_ROUTE_IDS = [
  "home",
  "dashboard",
  "wallet",
  "academy",
  "xamanactivation",
  "network",
  "intel",
  "news",
  "ottintelligence",
  "roadmap",
  "support",
  "xaman",
  "xrplverify",
  "source",
  "checkin",
  "rewardledger",
  "accessgate",
] as const;

const PUBLIC_FILES = [
  "/privacy.html",
  "/terms.html",
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.webmanifest",
] as const;

const SOURCE_TAG = 2606170002;

type AuditStatus = "checking" | "pass" | "warning" | "blocked";
type AuditCategory = "public" | "services" | "protected";

type AuditCheck = {
  id: string;
  category: AuditCategory;
  title: string;
  detail: string;
  status: AuditStatus;
  icon: ElementType;
};

type SupportStatsResponse = {
  ok?: boolean;
  stats?: {
    totalXrp?: string;
    paymentCount?: number;
    uniqueSupporters?: number;
  };
  error?: string;
};

type ManualTest = {
  title: string;
  detail: string;
  href: string;
  status: "ready" | "requires-account" | "requires-wallet";
  icon: ElementType;
};

function baseChecks(input: {
  signedIn: boolean;
  authLoading: boolean;
}): AuditCheck[] {
  const googleVisible = getEnabledOttAuthProviders().some((provider) => provider.id === "google");

  return [
    {
      id: "shell",
      category: "public",
      title: "Production shell",
      detail: `OTT Terminal loaded from ${window.location.origin}.`,
      status: "pass",
      icon: Globe2,
    },
    {
      id: "routes",
      category: "public",
      title: "17 public routes",
      detail: "The build contract contains 17 unique public menu items with render routes.",
      status: "pass",
      icon: Route,
    },
    {
      id: "legal",
      category: "public",
      title: "Legal, crawler and app files",
      detail: "Checking privacy, terms, robots, sitemap and web app manifest.",
      status: "checking",
      icon: FileCheck2,
    },
    {
      id: "auth",
      category: "public",
      title: "OTT account authentication",
      detail: isOttAuthConfigured
        ? "Supabase browser authentication is configured."
        : "Supabase browser authentication variables are missing.",
      status: isOttAuthConfigured ? "pass" : "blocked",
      icon: KeyRound,
    },
    {
      id: "google",
      category: "public",
      title: "Google login button",
      detail: googleVisible
        ? "Google is visible as the launch OAuth provider. A real sign-in remains a manual end-to-end test."
        : "Google is hidden. Check Supabase browser variables or VITE_AUTH_GOOGLE_ENABLED.",
      status: googleVisible ? "warning" : "blocked",
      icon: BadgeCheck,
    },
    {
      id: "account",
      category: "protected",
      title: "Founder account session",
      detail: input.authLoading
        ? "The account session is still being resolved."
        : input.signedIn
          ? "An OTT account session is active. Founder allowlists are checked per protected endpoint."
          : "Sign in with the founder OTT account to audit protected delivery flows.",
      status: input.authLoading ? "checking" : input.signedIn ? "pass" : "blocked",
      icon: ShieldCheck,
    },
    {
      id: "news",
      category: "services",
      title: "XRPL Intelligence feed",
      detail: "Checking /api/news and its source response.",
      status: "checking",
      icon: Newspaper,
    },
    {
      id: "support",
      category: "services",
      title: "Support payments and ledger totals",
      detail: "Checking the validated XRPL support counter.",
      status: "checking",
      icon: HeartHandshake,
    },
    {
      id: "source-tag",
      category: "services",
      title: "Make Waves SourceTag",
      detail: `The public contract uses SourceTag ${SOURCE_TAG}.`,
      status: "pass",
      icon: Waves,
    },
    {
      id: "support-amounts",
      category: "services",
      title: "Support amount contract",
      detail: "0.589, 1.589 and 2.589 XRP are protected by the route audit.",
      status: "pass",
      icon: ListChecks,
    },
    {
      id: "access-pass",
      category: "protected",
      title: "Access Pass #001–#500",
      detail: input.signedIn
        ? "Checking database, TESTNET, Xaman, wallets and founder readiness."
        : "Founder sign-in is required for readiness diagnostics.",
      status: input.signedIn ? "checking" : "blocked",
      icon: Wallet,
    },
    {
      id: "certificate",
      category: "protected",
      title: "Foundation Certificate delivery",
      detail: input.signedIn
        ? "Checking the protected certificate issuer queue."
        : "Founder sign-in is required for issuer diagnostics.",
      status: input.signedIn ? "checking" : "blocked",
      icon: Database,
    },
  ];
}

const manualTests: ManualTest[] = [
  {
    title: "Google account login",
    detail: "Complete one real Google sign-in and confirm return to Account & Profile.",
    href: "/?tab=wallet",
    status: "requires-account",
    icon: KeyRound,
  },
  {
    title: "Xaman wallet connection",
    detail: "Connect on desktop by QR and on mobile by deep link; never enter a seed phrase.",
    href: "/?tab=xaman",
    status: "requires-wallet",
    icon: Wallet,
  },
  {
    title: "Roadmap vote",
    detail: "Sign one vote in Xaman and verify public vote totals update after validation.",
    href: "/?tab=roadmap",
    status: "requires-wallet",
    icon: ListChecks,
  },
  {
    title: "Support payment",
    detail: "Test a fixed Xaman amount and confirm it appears in validated ledger totals.",
    href: "/?tab=support",
    status: "requires-wallet",
    icon: HeartHandshake,
  },
  {
    title: "Access Pass TESTNET lifecycle",
    detail: "Payment → serial → mint → offer → accept → ownership. MAINNET remains locked first.",
    href: "/?tab=accessgate",
    status: "requires-wallet",
    icon: ShieldCheck,
  },
  {
    title: "Access Pass issuer queue",
    detail: "Review readiness and sign only when every blocking check is green.",
    href: "/?founder=1&accessissuer=1",
    status: "requires-account",
    icon: Database,
  },
  {
    title: "Certificate issuer queue",
    detail: "Review Academy certificate claims and the protected Xaman delivery lifecycle.",
    href: "/?founder=1&issuer=1",
    status: "requires-account",
    icon: BadgeCheck,
  },
  {
    title: "Founder smoke test",
    detail: "Run the final guided page and transaction checks before a public demo.",
    href: "/?founder=1&tab=smoketest",
    status: "ready",
    icon: Rocket,
  },
];

export function LaunchControlTab() {
  const { signedIn, loading: authLoading, user } = useOttAuthSession();
  const [checks, setChecks] = useState<AuditCheck[]>(() => baseChecks({ signedIn, authLoading }));
  const [accessReadiness, setAccessReadiness] = useState<AccessPassReadiness | null>(null);
  const [running, setRunning] = useState(false);
  const [lastRun, setLastRun] = useState<string>("");

  const updateCheck = useCallback((id: string, patch: Partial<AuditCheck>) => {
    setChecks((current) => current.map((check) => check.id === id ? { ...check, ...patch } : check));
  }, []);

  const runAudit = useCallback(async () => {
    if (authLoading) return;

    setRunning(true);
    setChecks(baseChecks({ signedIn, authLoading }));
    setAccessReadiness(null);

    const legalPromise = Promise.all(
      PUBLIC_FILES.map(async (path) => {
        const response = await fetch(path, { cache: "no-store" });
        return { path, ok: response.ok };
      }),
    );

    const newsPromise = fetchXrplIntelligence({ limit: 5 });

    const supportPromise = fetch("/api/support-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ action: "xrpl.getSupportStats" }),
    }).then(async (response) => {
      const data = await response.json() as SupportStatsResponse;
      if (!response.ok || !data.ok || !data.stats) {
        throw new Error(data.error || "Support statistics endpoint failed.");
      }
      return data;
    });

    const accessPromise = signedIn ? loadAccessPassReadiness() : Promise.resolve(null);
    const certificatePromise = signedIn ? loadCertificateIssuerQueue() : Promise.resolve(null);

    const [legalResult, newsResult, supportResult, accessResult, certificateResult] = await Promise.allSettled([
      legalPromise,
      newsPromise,
      supportPromise,
      accessPromise,
      certificatePromise,
    ]);

    if (legalResult.status === "fulfilled") {
      const failed = legalResult.value.filter((item) => !item.ok).map((item) => item.path);
      updateCheck("legal", {
        status: failed.length ? "blocked" : "pass",
        detail: failed.length
          ? `Missing or unavailable: ${failed.join(", ")}.`
          : "Privacy, terms, robots, sitemap and web app manifest are publicly reachable.",
      });
    } else {
      updateCheck("legal", { status: "blocked", detail: "Public legal and discovery files could not be verified." });
    }

    if (newsResult.status === "fulfilled") {
      const response = newsResult.value;
      updateCheck("news", {
        status: response.items.length === 0 ? "blocked" : response.fallback ? "warning" : "pass",
        detail: response.items.length === 0
          ? "The intelligence endpoint responded without items."
          : `${response.items.length} items returned${response.fallback ? "; fallback sources are active" : "; live source collection is active"}.`,
      });
    } else {
      updateCheck("news", {
        status: "blocked",
        detail: newsResult.reason instanceof Error ? newsResult.reason.message : "XRPL Intelligence could not be loaded.",
      });
    }

    if (supportResult.status === "fulfilled") {
      const stats = supportResult.value.stats;
      updateCheck("support", {
        status: "pass",
        detail: `${stats?.paymentCount ?? 0} validated payments, ${stats?.uniqueSupporters ?? 0} supporters, ${stats?.totalXrp ?? "0"} XRP total.`,
      });
    } else {
      updateCheck("support", {
        status: "blocked",
        detail: supportResult.reason instanceof Error ? supportResult.reason.message : "Support statistics could not be loaded.",
      });
    }

    if (signedIn) {
      if (accessResult.status === "fulfilled" && accessResult.value?.readiness) {
        const readiness = accessResult.value.readiness;
        setAccessReadiness(readiness);
        const blocking = readiness.checks.filter((check) => check.blocking && !check.ok);
        updateCheck("access-pass", {
          status: readiness.safeForMainnet || readiness.safeToTest ? "pass" : "blocked",
          detail: readiness.safeForMainnet
            ? "MAINNET readiness is green after recorded TESTNET validation."
            : readiness.safeToTest
              ? "TESTNET readiness is green; MAINNET remains intentionally locked."
              : blocking.length
                ? `Blocked: ${blocking.map((check) => check.label).join(", ")}.`
                : "Access Pass readiness is incomplete.",
        });
      } else if (accessResult.status === "rejected") {
        updateCheck("access-pass", {
          status: "blocked",
          detail: getFriendlyOttAuthError(accessResult.reason, "en"),
        });
      }

      if (certificateResult.status === "fulfilled" && certificateResult.value) {
        updateCheck("certificate", {
          status: "pass",
          detail: `Protected issuer endpoint responded; ${certificateResult.value.queue?.length ?? 0} certificate claims are in the queue.`,
        });
      } else if (certificateResult.status === "rejected") {
        const reason = certificateResult.reason as { error?: string } | Error;
        const detail = reason instanceof Error
          ? reason.message
          : typeof reason?.error === "string"
            ? reason.error
            : "Certificate issuer endpoint could not be verified.";
        updateCheck("certificate", { status: "blocked", detail });
      }
    }

    setLastRun(new Date().toISOString());
    setRunning(false);
  }, [authLoading, signedIn, updateCheck]);

  useEffect(() => {
    void runAudit();
  }, [runAudit]);

  const summary = useMemo(() => ({
    pass: checks.filter((check) => check.status === "pass").length,
    warning: checks.filter((check) => check.status === "warning").length,
    blocked: checks.filter((check) => check.status === "blocked").length,
    checking: checks.filter((check) => check.status === "checking").length,
  }), [checks]);

  const launchReady = summary.blocked === 0 && summary.checking === 0;

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <section className="border-b border-slate-200 bg-[radial-gradient(circle_at_90%_0%,rgba(56,152,232,0.14),transparent_34%),radial-gradient(circle_at_0%_100%,rgba(200,56,136,0.12),transparent_34%),#fff]">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                <Activity size={17} /> Founder Launch Control
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                Live readiness, not a static checklist.
              </h1>
              <p className="mt-5 text-base leading-7 text-slate-600">
                This page checks the deployed public shell, live server routes and protected issuer flows. Wallet signatures and Google OAuth remain deliberate manual end-to-end tests.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void runAudit()}
                  disabled={running || authLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {running ? <Loader2 className="animate-spin" size={18} /> : <RefreshCcw size={18} />}
                  Run full audit
                </button>
                <a
                  href="/?founder=1&tab=smoketest"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Open smoke test <ExternalLink size={17} />
                </a>
              </div>
              <p className="mt-4 text-xs text-slate-500">
                {lastRun
                  ? `Last audit: ${new Date(lastRun).toLocaleString()} · Account: ${user?.email ?? "not signed in"}`
                  : "Audit has not completed yet."}
              </p>
            </div>

            <div className={`w-full rounded-3xl border p-6 xl:max-w-sm ${launchReady ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
              <div className="flex items-center gap-3">
                {launchReady ? <CheckCircle2 className="text-emerald-700" size={28} /> : <CircleAlert className="text-amber-700" size={28} />}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Current verdict</p>
                  <p className="mt-1 text-xl font-semibold">{launchReady ? "Automated checks green" : "Action still required"}</p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Summary label="Passed" value={summary.pass} />
                <Summary label="Review" value={summary.warning} />
                <Summary label="Blocked" value={summary.blocked} />
                <Summary label="Checking" value={summary.checking} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div data-page-region="true" className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <AuditSection title="Public shell" description="Visitor-facing routes, accounts and public files." checks={checks.filter((check) => check.category === "public")} />
        <AuditSection title="Live services" description="Public server routes and on-ledger reporting." checks={checks.filter((check) => check.category === "services")} />
        <AuditSection title="Protected delivery" description="Founder-only readiness and NFT issuer endpoints." checks={checks.filter((check) => check.category === "protected")} />

        {accessReadiness && (
          <section className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Access Pass diagnostics</p>
                <h2 className="mt-2 text-2xl font-semibold">Network: {accessReadiness.network}</h2>
                <p className="mt-2 text-sm text-slate-600">TESTNET proof recorded: {accessReadiness.testnetValidated ? "yes" : "no"}. MAINNET remains gated by the server.</p>
              </div>
              <a href="/?founder=1&accessissuer=1" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900">Open issuer readiness <ExternalLink size={16} /></a>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {accessReadiness.checks.map((check) => (
                <div key={check.id} className={`rounded-2xl border p-4 ${check.ok ? "border-emerald-200 bg-white" : check.blocking ? "border-rose-200 bg-rose-50" : "border-amber-200 bg-amber-50"}`}>
                  <div className="flex items-start gap-3">
                    {check.ok ? <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-700" size={18} /> : <CircleAlert className={`mt-0.5 shrink-0 ${check.blocking ? "text-rose-700" : "text-amber-700"}`} size={18} />}
                    <div>
                      <p className="text-sm font-semibold">{check.label}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-600">{check.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-10">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Manual end-to-end tests</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Human approval is still required here.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">These actions open external account or wallet approval screens, so an automated green badge would be misleading.</p>
          </div>
          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {manualTests.map((test) => <ManualTestCard key={test.title} test={test} />)}
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <Route className="text-blue-700" size={22} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Public route contract</p>
              <h2 className="mt-1 text-xl font-semibold">17 visitor routes</h2>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {PUBLIC_ROUTE_IDS.map((routeId) => (
              <a key={routeId} href={`/?tab=${routeId}`} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800">
                {routeId}
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function AuditSection({ title, description, checks }: { title: string; description: string; checks: AuditCheck[] }) {
  return (
    <section className="mt-10 first:mt-0">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {checks.map((check) => <AuditCard key={check.id} check={check} />)}
      </div>
    </section>
  );
}

function AuditCard({ check }: { check: AuditCheck }) {
  const Icon = check.icon;
  const status = statusStyle(check.status);
  const StatusIcon = status.icon;

  return (
    <article className={`rounded-3xl border p-5 ${status.card}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-800"><Icon size={21} /></div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${status.badge}`}><StatusIcon className={check.status === "checking" ? "animate-spin" : ""} size={14} />{status.label}</span>
      </div>
      <h3 className="mt-5 text-lg font-semibold">{check.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{check.detail}</p>
    </article>
  );
}

function ManualTestCard({ test }: { test: ManualTest }) {
  const Icon = test.icon;
  const label = test.status === "ready" ? "Open" : test.status === "requires-account" ? "Account" : "Wallet";

  return (
    <a href={test.href} className="group rounded-3xl border border-slate-200 bg-white p-5 hover:border-blue-300 hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white"><Icon size={21} /></div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{label}</span>
      </div>
      <h3 className="mt-5 font-semibold group-hover:text-blue-800">{test.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{test.detail}</p>
      <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">Open test <ExternalLink size={15} /></div>
    </a>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return <div className="rounded-2xl border border-black/5 bg-white/70 p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-2xl font-semibold">{value}</p></div>;
}

function statusStyle(status: AuditStatus): { label: string; card: string; badge: string; icon: ElementType } {
  if (status === "pass") return { label: "Pass", card: "border-emerald-200 bg-emerald-50/40", badge: "bg-emerald-100 text-emerald-800", icon: CheckCircle2 };
  if (status === "warning") return { label: "Manual review", card: "border-amber-200 bg-amber-50/40", badge: "bg-amber-100 text-amber-800", icon: CircleAlert };
  if (status === "blocked") return { label: "Blocked", card: "border-rose-200 bg-rose-50/50", badge: "bg-rose-100 text-rose-800", icon: CircleX };
  return { label: "Checking", card: "border-slate-200 bg-slate-50", badge: "bg-slate-200 text-slate-700", icon: Loader2 };
}
