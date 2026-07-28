import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AcademyCoachPopup } from "./components/AcademyCoachPopup";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { TerminalStartTour } from "./components/TerminalStartTour";
import { hasFounderAccess } from "./lib/ottRoles";
import { useOttAuthSession } from "./lib/useOttAuthSession";
import { AccessPassIssuerConsole } from "./tabs/AccessPassIssuerConsole";
import { CertificateIssuerConsole } from "./tabs/CertificateIssuerConsole";
import { FounderAccessManager } from "./tabs/FounderAccessManager";
import { FounderResearchReview } from "./tabs/FounderResearchReview";

// Suppress known extension injection errors
window.addEventListener("unhandledrejection", (event) => {
  if (event.reason?.message?.includes("MetaMask") || event.reason?.message?.includes("ethereum")) {
    event.preventDefault();
  }
});

window.addEventListener("error", (event) => {
  if (event.message.includes("MetaMask")) {
    event.preventDefault();
  }
});

const FOUNDER_QUERY_KEYS = ["founder", "issuer", "accessissuer", "accessmanager", "research"] as const;
const FOUNDER_TAB_IDS = new Set([
  "pitchmode",
  "submission",
  "smoketest",
  "launch",
  "truthdesk",
  "marketplace",
  "otttestnet",
  "portfolio",
  "partners",
  "factory",
  "profile",
  "token",
  "rewardpolicy",
  "ai",
]);

function readFounderRequest() {
  const params = new URLSearchParams(window.location.search);
  const founderFlag = params.get("founder") === "1";
  const consoleRequested = FOUNDER_QUERY_KEYS.slice(1).some((key) => params.get(key) === "1");
  const founderTabRequested = FOUNDER_TAB_IDS.has(params.get("tab") ?? "");

  return {
    params,
    requested: founderFlag || consoleRequested || founderTabRequested,
    founderFlag,
    showCertificateIssuer: params.get("issuer") === "1",
    showAccessPassIssuer: params.get("accessissuer") === "1",
    showAccessManager: params.get("accessmanager") === "1",
    showResearchReview: params.get("research") === "1",
  };
}

function sanitizeFounderUrl() {
  const url = new URL(window.location.href);
  FOUNDER_QUERY_KEYS.forEach((key) => url.searchParams.delete(key));

  if (FOUNDER_TAB_IDS.has(url.searchParams.get("tab") ?? "")) {
    url.searchParams.delete("tab");
  }

  window.history.replaceState({}, document.title, url.toString());
  return url;
}

function PublicLegalFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white px-5 py-8 text-sm text-slate-500 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 TruthOnTheTrack / OnTheTrack — OTT Terminal</p>
        <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Legal information">
          <a className="font-medium text-slate-600 hover:text-blue-700" href="/privacy.html">
            Privacy Policy
          </a>
          <a className="font-medium text-slate-600 hover:text-blue-700" href="/terms.html">
            Terms of Use
          </a>
        </nav>
      </div>
    </footer>
  );
}

function AuthLoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 text-slate-950">
      <div role="status" aria-live="polite" className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700" />
        <p className="mt-5 text-sm font-medium text-slate-600">Verifying secure account access…</p>
      </div>
    </main>
  );
}

function FounderAccessDenied({ signedIn }: { signedIn: boolean }) {
  useEffect(() => {
    sanitizeFounderUrl();
  }, []);

  function continueToOtt() {
    const url = sanitizeFounderUrl();
    if (!signedIn) {
      url.searchParams.set("tab", "wallet");
    }
    window.location.assign(url.toString());
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-16 text-slate-950">
      <section className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl sm:p-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-2xl" aria-hidden="true">
          🔒
        </div>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">Founder access protected</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          Founder, issuer, research and launch controls are only available to an authenticated OTT account with a trusted
          <code className="mx-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-800">app_metadata.ott_role</code>
          value of <strong>founder</strong> or <strong>admin</strong>.
        </p>
        <p className="mt-3 text-sm leading-7 text-slate-500">
          A URL parameter, wallet connection or Access Pass can never grant founder permissions.
        </p>
        <button
          type="button"
          onClick={continueToOtt}
          className="mt-8 inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          {signedIn ? "Back to OTT Terminal" : "Open OTT sign in"}
        </button>
      </section>
    </main>
  );
}

function ApplicationRoot() {
  const { user, signedIn, loading } = useOttAuthSession();
  const founderRequest = readFounderRequest();
  const founderAuthorized = hasFounderAccess(user);

  if (loading && founderRequest.requested) {
    return <AuthLoadingScreen />;
  }

  if (founderRequest.requested && !founderAuthorized) {
    return <FounderAccessDenied signedIn={signedIn} />;
  }

  if (founderAuthorized) {
    if (founderRequest.showResearchReview) {
      return <FounderResearchReview />;
    }
    if (founderRequest.showAccessManager) {
      return <FounderAccessManager />;
    }
    if (founderRequest.showAccessPassIssuer) {
      return <AccessPassIssuerConsole />;
    }
    if (founderRequest.showCertificateIssuer) {
      return <CertificateIssuerConsole />;
    }
  }

  return (
    <>
      <App />
      <PublicLegalFooter />
      <AcademyCoachPopup />
      <TerminalStartTour />
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <ApplicationRoot />
    </ErrorBoundary>
  </StrictMode>,
);
