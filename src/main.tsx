import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      {showCertificateIssuer ? <CertificateIssuerConsole /> : <App />}
    </ErrorBoundary>
  </StrictMode>,
);
