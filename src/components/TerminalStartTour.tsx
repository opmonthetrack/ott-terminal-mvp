import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Compass,
  ShieldCheck,
  Wallet,
  X,
} from "lucide-react";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

const TOUR_STORAGE_KEY = "ott-terminal-tour-seen-v1";

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
    },
  ], [en]);

  useEffect(() => {
    const sync = () => setVisible(isPublicHome());
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
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
        className="fixed bottom-5 right-5 z-[135] inline-flex min-h-12 items-center gap-3 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-2xl transition hover:-translate-y-0.5 hover:bg-slate-800"
        aria-label={en ? "Start the OTT Terminal tour" : "Start de OTT Terminal-tour"}
      >
        <ShieldCheck size={18} />
        {en ? "Start Tour" : "Start Tour"}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[240] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="terminal-tour-title"
          onMouseDown={(event) => event.currentTarget === event.target && setOpen(false)}
        >
          <section className="w-full max-w-2xl overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-2xl sm:rounded-3xl">
            <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-8">
              <div>
                <p className="text-xs font-semibold text-blue-700">OTT Terminal · Quick Start</p>
                <h2 id="terminal-tour-title" className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                  {en ? "Understand the first move in under a minute" : "Begrijp je eerste stap binnen één minuut"}
                </h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-slate-200 p-2 text-slate-500" aria-label={en ? "Close tour" : "Tour sluiten"}>
                <X size={18} />
              </button>
            </header>

            <div className="px-5 py-7 sm:px-8 sm:py-9">
              <div className="flex gap-2" aria-label={en ? "Tour progress" : "Tourvoortgang"}>
                {steps.map((item, index) => (
                  <button
                    key={item.eyebrow}
                    type="button"
                    onClick={() => setStep(index)}
                    aria-label={`${en ? "Open step" : "Open stap"} ${index + 1}`}
                    aria-current={index === step ? "step" : undefined}
                    className={`h-2 min-h-2 flex-1 rounded-full ${index <= step ? "bg-blue-700" : "bg-slate-200"}`}
                  />
                ))}
              </div>

              <div className="mt-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <Icon size={25} />
              </div>
              <p className="mt-6 text-xs font-semibold text-blue-700">{current.eyebrow}</p>
              <h3 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{current.title}</h3>
              <p className="mt-4 text-base leading-7 text-slate-600">{current.text}</p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => navigate(current.target)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                >
                  {current.action}
                  <ArrowRight size={17} />
                </button>

                <div className="flex items-center justify-between gap-2 sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setStep((value) => Math.max(0, value - 1))}
                    disabled={step === 0}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 disabled:opacity-40"
                  >
                    {en ? "Previous" : "Vorige"}
                  </button>
                  {step < steps.length - 1 ? (
                    <button type="button" onClick={() => setStep((value) => Math.min(steps.length - 1, value + 1))} className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-900">
                      {en ? "Next" : "Volgende"}
                    </button>
                  ) : (
                    <button type="button" onClick={() => setOpen(false)} className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                      <CheckCircle2 size={17} />
                      {en ? "Tour complete" : "Tour voltooid"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
