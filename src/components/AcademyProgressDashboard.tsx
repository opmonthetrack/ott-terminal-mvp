import { useCallback, useEffect, useState } from "react";
import {
  Award,
  BarChart3,
  CheckCircle2,
  Circle,
  Loader2,
  LockKeyhole,
  RefreshCcw,
  UserCircle,
  Wallet,
  X,
} from "lucide-react";
import {
  getAcademyProgressSnapshot,
  type AcademyProgressSnapshot,
} from "../lib/academyProgressClient";
import { useOttAuthSession } from "../lib/useOttAuthSession";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

type Props = {
  walletAddress?: string;
  onNavigate?: (target: string) => void;
};

const isWallet = (value: string) => /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(value);

export function AcademyProgressDashboard({ walletAddress = "guest", onNavigate }: Props) {
  const { language } = useTerminalLanguage();
  const { signedIn, loading: authLoading } = useOttAuthSession();
  const en = language === "en";
  const hasWallet = isWallet(walletAddress);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<AcademyProgressSnapshot | null>(null);

  const refresh = useCallback(async (silent = false) => {
    if (!signedIn || authLoading) {
      setData(null);
      return;
    }
    if (!silent) setBusy(true);
    try {
      setData(await getAcademyProgressSnapshot());
      setError("");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : (en ? "Progress could not be loaded." : "Voortgang kon niet worden geladen."));
    } finally {
      if (!silent) setBusy(false);
    }
  }, [authLoading, en, signedIn]);

  useEffect(() => {
    if (!signedIn || authLoading) return;
    void refresh(true);
    const update = () => void refresh(true);
    window.addEventListener("ott-academy-progress-changed", update);
    window.addEventListener("focus", update);
    return () => {
      window.removeEventListener("ott-academy-progress-changed", update);
      window.removeEventListener("focus", update);
    };
  }, [authLoading, refresh, signedIn]);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  const completed = data?.completedCount ?? 0;
  const total = data?.totalLessons ?? 14;
  const unfinished = Math.max(0, total - completed);
  const average = data?.averageScore ?? 0;
  const minimum = data?.minimumAverage ?? 75;
  const ready = Boolean(data?.nftEligible && signedIn && hasWallet);

  return (
    <>
      <button
        type="button"
        onClick={() => { setOpen(true); if (signedIn) void refresh(); }}
        className="fixed bottom-5 left-5 z-[140] inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl hover:shadow-2xl"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white"><BarChart3 size={19} /></span>
        <span className="text-left">
          <span className="block text-sm font-semibold">{en ? "My results" : "Mijn resultaten"}</span>
          <span className="block text-xs text-slate-500">{signedIn ? `${completed}/${total} ${en ? "lessons" : "lessen"}` : (en ? "Sign in to save" : "Log in om op te slaan")}</span>
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[220] flex items-end justify-center bg-slate-950/50 backdrop-blur-sm sm:items-center sm:p-6" onMouseDown={(event) => event.currentTarget === event.target && setOpen(false)}>
          <section role="dialog" aria-modal="true" className="max-h-[94vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-5xl sm:rounded-3xl">
            <header className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white/95 px-5 py-5 backdrop-blur sm:px-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">OTT Academy</p>
                <h2 className="mt-1 text-2xl font-semibold">{en ? "My verified results" : "Mijn geverifieerde resultaten"}</h2>
                <p className="mt-1 text-sm text-slate-500">{en ? "Your highest verified score is kept per lesson." : "Je hoogste geverifieerde score blijft per les bewaard."}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-slate-200 p-2 text-slate-500"><X size={19} /></button>
            </header>

            <div className="space-y-6 px-5 py-6 sm:px-8 sm:py-8">
              {authLoading ? <Loading en={en} /> : !signedIn ? (
                <div className="rounded-3xl border border-blue-100 bg-blue-50 p-8 text-center">
                  <UserCircle className="mx-auto text-blue-700" size={34} />
                  <h3 className="mt-4 text-xl font-semibold text-blue-950">{en ? "Sign in to save results" : "Log in om resultaten te bewaren"}</h3>
                  <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-blue-900/75">{en ? "Guest practice does not count toward the Foundation Certificate NFT." : "Oefenen als gast telt niet mee voor het Foundation Certificate NFT."}</p>
                  <button type="button" onClick={() => { setOpen(false); onNavigate?.("wallet"); }} className="mt-5 rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white">{en ? "Sign in" : "Inloggen"}</button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-slate-600">{en ? "Read from the trusted Academy record." : "Gelezen uit het vertrouwde Academy-register."}</p>
                    <button type="button" onClick={() => void refresh()} disabled={busy} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold disabled:opacity-50">
                      {busy ? <Loader2 className="animate-spin" size={16} /> : <RefreshCcw size={16} />}{en ? "Refresh" : "Vernieuwen"}
                    </button>
                  </div>
                  {error && <p className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">{error}</p>}
                  {data?.setupRequired && <p className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">{en ? "The dashboard is ready. The prepared Supabase Academy migration must be active before verified scores are stored across devices." : "Het dashboard is klaar. De voorbereide Supabase Academy-migratie moet actief zijn voordat geverifieerde scores op al je apparaten worden bewaard."}</p>}
                  {!data && !busy && !error && <Loading en={en} />}

                  {data && !data.setupRequired && (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Metric label={en ? "Completed" : "Afgerond"} value={`${completed}/${total}`} sub={`${data.completionPercent}%`} />
                        <Metric label={en ? "Average" : "Gemiddelde"} value={completed ? `${average}%` : "—"} sub={`${minimum}% ${en ? "required" : "vereist"}`} />
                        <Metric label={en ? "Verified XP" : "Geverifieerde XP"} value={`${data.totalXp}`} sub={`${data.maximumXp} XP max`} />
                        <Metric label="Foundation NFT" value={ready ? (en ? "Ready" : "Vrijgegeven") : (en ? "Locked" : "Vergrendeld")} sub="#0001–#5000" />
                      </div>

                      <section className="rounded-3xl border border-slate-200 p-5 sm:p-7">
                        <h3 className="text-2xl font-semibold">{ready ? (en ? "Certificate unlocked" : "Certificaat vrijgegeven") : (en ? "NFT requirements" : "NFT-voorwaarden")}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{unfinished ? (en ? `${unfinished} verified lesson result(s) remaining.` : `Nog ${unfinished} geverifieerde lesresultaat/resultaten nodig.`) : average < minimum ? (en ? `Raise the average by ${minimum - average} point(s).` : `Verhoog het gemiddelde nog met ${minimum - average} punt(en).`) : (en ? "The verified score requirements are complete." : "De geverifieerde scorevoorwaarden zijn voltooid.")}</p>
                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                          <Requirement done={signedIn} text={en ? "Verified OTT account" : "Geverifieerd OTT-account"} />
                          <Requirement done={data.allLessonsComplete} text={`${total} ${en ? "lessons completed" : "lessen afgerond"}`} />
                          <Requirement done={data.averageQualified} text={`${minimum}% ${en ? "Academy average" : "Academy-gemiddelde"}`} />
                          <Requirement done={hasWallet} text={en ? "XRPL receiving wallet connected" : "XRPL-ontvangstwallet gekoppeld"} />
                        </div>
                        <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-blue-600 via-violet-600 to-pink-600" style={{ width: `${data.completionPercent}%` }} /></div>
                      </section>

                      {!hasWallet && data.nftEligible && (
                        <button type="button" onClick={() => { setOpen(false); onNavigate?.("xaman"); }} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white"><Wallet size={18} />{en ? "Connect receiving wallet" : "Ontvangstwallet koppelen"}</button>
                      )}

                      <section>
                        <h3 className="text-2xl font-semibold">{en ? "Highest score per lesson" : "Hoogste score per les"}</h3>
                        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                          {data.lessons.map((lesson, index) => (
                            <article key={lesson.id} className={`grid gap-3 px-4 py-4 sm:grid-cols-[65px_1fr_110px] sm:items-center ${index ? "border-t border-slate-200" : ""}`}>
                              <span className="inline-flex h-9 w-12 items-center justify-center rounded-xl bg-slate-100 text-xs font-semibold">{lesson.module}</span>
                              <div><p className="font-semibold">{lesson.title}</p><p className="mt-1 text-xs text-slate-500">{lesson.completed ? `${lesson.xp} XP · ${en ? "verified" : "geverifieerd"}` : (en ? "No verified score yet" : "Nog geen geverifieerde score")}</p></div>
                              <div className="flex items-center gap-2 sm:justify-end">{lesson.completed ? <Award className="text-violet-600" size={18} /> : <LockKeyhole className="text-slate-300" size={18} />}<span className="text-lg font-semibold">{lesson.score === null ? "—" : `${lesson.score}%`}</span></div>
                            </article>
                          ))}
                        </div>
                      </section>
                    </>
                  )}
                </>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function Loading({ en }: { en: boolean }) {
  return <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 p-10 text-sm text-slate-600"><Loader2 className="animate-spin" size={18} />{en ? "Loading results…" : "Resultaten laden…"}</div>;
}

function Metric({ label, value, sub }: { label: string; value: string; sub: string }) {
  return <article className="rounded-2xl border border-slate-200 p-5"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p><p className="mt-1 text-xs text-slate-500">{sub}</p></article>;
}

function Requirement({ done, text }: { done: boolean; text: string }) {
  return <div className="flex items-center gap-3 text-sm">{done ? <CheckCircle2 className="text-emerald-600" size={18} /> : <Circle className="text-slate-300" size={18} />}<span className={done ? "font-medium" : "text-slate-500"}>{text}</span></div>;
}
