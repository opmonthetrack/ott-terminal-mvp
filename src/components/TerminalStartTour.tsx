import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Compass,
  ShieldCheck,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";
import { OTTLogoMark } from "./OTTLogo";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

const TOUR_STORAGE_KEY = "ott-terminal-tour-seen-v1";
const TOUR_OPEN_EVENT = "ott-open-terminal-tour";

function isPublicHome() {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  const tab = params.get("tab");
  return !params.has("founder") && (!tab || tab === "home");
}

function navigate(target: string) {
  const url = new URL(window.location.href);
  url.searchParams.set("tab", target);
  ["founder", "issuer", "accessissuer", "accessmanager", "research"].forEach((key) => url.searchParams.delete(key));
  window.location.assign(url.toString());
}

export function TerminalStartTour() {
  const { language } = useTerminalLanguage();
  const en = language === "en";
  const [visible, setVisible] = useState(() => isPublicHome());
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  const steps = useMemo(() => [
    {
      icon: BookOpen,
      eyebrow: en ? "Step 1 · Learn" : "Stap 1 · Leren",
      title: en ? "Start without a wallet" : "Begin zonder wallet",
      text: en
        ? "Explore XRPL basics and the public Academy first. OTT never asks for a seed phrase and a wallet is not required just to learn."
        : "Verken eerst de XRPL-basis en de publieke Academy. OTT vraagt nooit om een seed phrase en een wallet is niet nodig om alleen te leren.",
      action: en ? "Open Academy" : "Open Academy",
      target: "academy",
      code: "LEARN_01",
    },
    {
      icon: Compass,
      eyebrow: en ? "Step 2 · Verify" : "Stap 2 · Verifiëren",
      title: en ? "Separate sources, data and analysis" : "Scheid bronnen, data en analyse",
      text: en
        ? "Use Explore and XRPL Tools to inspect projects, issuer information, transactions and evidence before drawing conclusions."
        : "Gebruik Ontdekken en XRPL-tools om projecten, issuerinformatie, transacties en bewijs te bekijken voordat je conclusies trekt.",
      action: en ? "Explore XRPL" : "Ontdek XRPL",
      target: "intel",
      code: "VERIFY_02",
    },
    {
      icon: Wallet,
      eyebrow: en ? "Step 3 · Initialize" : "Stap 3 · Initialiseren",
      title: en ? "Connect only when an action needs proof" : "Koppel alleen wanneer een actie bewijs nodig heeft",
      text: en
        ? "Initialize your OTT account first. Sync an XRPL wallet later for signatures, payments, votes or verified ownership."
        : "Initialiseer eerst je OTT-account. Synchroniseer later een XRPL-wallet voor handtekeningen, betalingen, stemmen of geverifieerd bezit.",
      action: en ? "Initialize Terminal" : "Initialiseer Terminal",
      target: "wallet",
      code: "SYNC_03",
    },
  ], [en]);

  useEffect(() => {
    const sync = () => setVisible(isPublicHome());
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  useEffect(() => {
    const launch = () => {
      if (!isPublicHome()) return;
      setStep(0);
      setOpen(true);
      window.localStorage.setItem(TOUR_STORAGE_KEY, "seen");
    };
    window.addEventListener(TOUR_OPEN_EVENT, launch);
    return () => window.removeEventListener(TOUR_OPEN_EVENT, launch);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const close = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", close);
    };
  }, [open]);

  if (!visible) return null;

  const current = steps[step];
  const Icon = current.icon;

  function openTour() {
    setStep(0);
    setOpen(true);
    window.localStorage.setItem(TOUR_STORAGE_KEY, "seen");
  }

  return (
    <>
      <button
        type="button"
        onClick={openTour}
        className="ott-tour-launch fixed bottom-5 right-5 z-[135] hidden min-h-12 items-center gap-3 rounded-2xl px-6 py-3 text-sm font-semibold shadow-2xl transition hover:-translate-y-0.5 md:inline-flex"
        aria-label={en ? "Start the OTT Terminal tour" : "Start de OTT Terminal-tour"}
      >
        <ShieldCheck size={18} />
        {en ? "Start Tour" : "Start Tour"}
      </button>

      {open && (
        <div
          className="ott-tour-backdrop fixed inset-0 z-[240] flex items-end justify-center p-0 backdrop-blur-md sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="terminal-tour-title"
          onMouseDown={(event) => event.currentTarget === event.target && setOpen(false)}
        >
          <section className="ott-tour-shell relative w-full max-w-3xl overflow-hidden rounded-t-[2rem] sm:rounded-[2rem]">
            <div className="ott-tour-orb ott-tour-orb-blue" />
            <div className="ott-tour-orb ott-tour-orb-pink" />
            <div className="ott-tour-grid" />

            <header className="relative z-10 flex items-start justify-between gap-4 border-b border-white/10 px-5 py-5 sm:px-8 sm:py-6">
              <div className="flex items-center gap-3">
                <span className="ott-tour-logo"><OTTLogoMark size={36} /></span>
                <div>
                  <p className="ott-tour-kicker">OTT Terminal · Quick Start</p>
                  <h2 id="terminal-tour-title" className="ott-tour-heading mt-1 text-lg font-semibold sm:text-xl">
                    {en ? "Your first verified route" : "Je eerste geverifieerde route"}
                  </h2>
                </div>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="ott-tour-icon-button rounded-xl p-2" aria-label={en ? "Close tour" : "Tour sluiten"}>
                <X size={18} />
              </button>
            </header>

            <div className="relative z-10 grid min-h-[470px] md:grid-cols-[0.34fr_0.66fr]">
              <aside className="ott-tour-side border-b border-white/10 p-5 md:border-b-0 md:border-r md:p-7">
                <p className="ott-tour-kicker">{en ? "Route map" : "Routekaart"}</p>
                <div className="mt-5 grid grid-cols-3 gap-2 md:grid-cols-1">
                  {steps.map((item, index) => {
                    const StepIcon = item.icon;
                    const selected = index === step;
                    return (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => setStep(index)}
                        aria-current={selected ? "step" : undefined}
                        className={`ott-tour-step flex min-w-0 items-center gap-3 rounded-2xl p-3 text-left ${selected ? "is-active" : ""}`}
                      >
                        <span className="ott-tour-step-icon"><StepIcon size={17} /></span>
                        <span className="hidden min-w-0 md:block">
                          <span className="block font-data text-[10px]">{item.code}</span>
                          <span className="mt-1 block truncate text-xs font-semibold">{item.eyebrow.replace(/^Step \d · |^Stap \d · /, "")}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="ott-tour-seal mt-6 hidden rounded-2xl p-4 md:block">
                  <Sparkles size={18} />
                  <p className="mt-3 text-xs font-semibold">{en ? "Learn → Verify → Initialize" : "Leer → Verifieer → Initialiseer"}</p>
                  <p className="mt-2 text-[11px] leading-5">{en ? "No wallet wall. No hidden transaction." : "Geen walletmuur. Geen verborgen transactie."}</p>
                </div>
              </aside>

              <div className="p-5 sm:p-8 md:p-9">
                <div className="flex items-center justify-between gap-4">
                  <span className="ott-tour-medallion"><Icon size={27} /></span>
                  <span className="ott-tour-code font-data text-[11px]">{current.code}</span>
                </div>

                <p className="ott-tour-kicker mt-7">{current.eyebrow}</p>
                <h3 className="ott-tour-title mt-3 text-3xl font-bold leading-tight sm:text-4xl">{current.title}</h3>
                <p className="ott-tour-copy mt-5 text-base leading-7">{current.text}</p>

                <div className="mt-8 flex gap-2" aria-label={en ? "Tour progress" : "Tourvoortgang"}>
                  {steps.map((item, index) => (
                    <button
                      key={item.code}
                      type="button"
                      data-compact-control
                      onClick={() => setStep(index)}
                      aria-label={`${en ? "Open step" : "Open stap"} ${index + 1}`}
                      aria-current={index === step ? "step" : undefined}
                      className={`ott-tour-progress h-2 min-h-2 flex-1 rounded-full ${index <= step ? "is-filled" : ""}`}
                    />
                  ))}
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button type="button" onClick={() => navigate(current.target)} className="ott-tour-primary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold">
                    {current.action}
                    <ArrowRight size={17} />
                  </button>

                  <div className="flex items-center justify-between gap-2 sm:justify-end">
                    <button type="button" onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0} className="ott-tour-secondary rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-35">
                      {en ? "Previous" : "Vorige"}
                    </button>
                    {step < steps.length - 1 ? (
                      <button type="button" onClick={() => setStep((value) => Math.min(steps.length - 1, value + 1))} className="ott-tour-secondary rounded-xl px-4 py-3 text-sm font-semibold">
                        {en ? "Next" : "Volgende"}
                      </button>
                    ) : (
                      <button type="button" onClick={() => setOpen(false)} className="ott-tour-complete inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold">
                        <CheckCircle2 size={17} />
                        {en ? "Tour complete" : "Tour voltooid"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
