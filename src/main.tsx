import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AcademyCoachPopup } from "./components/AcademyCoachPopup";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { CertificateIssuerConsole } from "./tabs/CertificateIssuerConsole";

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

const params = new URLSearchParams(window.location.search);
const showCertificateIssuer = params.get("founder") === "1" && params.get("issuer") === "1";

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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      {showCertificateIssuer ? (
        <CertificateIssuerConsole />
      ) : (
        <>
          <App />
          <PublicLegalFooter />
          <AcademyCoachPopup />
        </>
      )}
    </ErrorBoundary>
  </StrictMode>,
);
