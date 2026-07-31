import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { isXamanXappLaunch } from "./lib/xamanXappRuntime";
import "./bootstrap.css";

const XamanXapp = lazy(() => import("./xapp/XamanXapp").then((module) => ({ default: module.XamanXapp })));
const OttWebApplication = lazy(() => import("./web/OttWebApplication"));

function RootRouter() {
  const xappLaunch = isXamanXappLaunch();

  return (
    <Suspense
      fallback={(
        <div
          className={xappLaunch ? "xaman-xapp-boot-status" : "ott-web-boot-status"}
          role="status"
          aria-live="polite"
        >
          {xappLaunch ? "Opening OTT for Xaman…" : "Opening OTT Terminal…"}
        </div>
      )}
    >
      {xappLaunch ? <XamanXapp /> : <OttWebApplication />}
    </Suspense>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <RootRouter />
    </ErrorBoundary>
  </StrictMode>,
);
