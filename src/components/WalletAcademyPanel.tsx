import { useCallback, useEffect, useState } from "react";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Loader2,
  LockKeyhole,
  RefreshCcw,
  ShieldCheck,
  UserCircle,
  Wallet,
} from "lucide-react";
import { getWalletAcademyStats, WALLET_ACADEMY_MODULES } from "../lib/walletAcademy";
import { hasFounderAccess } from "../lib/ottRoles";
import {
  EMPTY_ENTITLEMENTS,
  loadPremiumAccessStatus,
  type PremiumEntitlements,
} from "../lib/premiumAccessClient";
import { useOttAuthSession } from "../lib/useOttAuthSession";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

type Props = {
  walletAddress?: string;
  onNavigate?: (target: string) => void;
};

const isWallet = (value: string) => /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(value);

export function WalletAcademyPanel({ walletAddress = "guest", onNavigate }: Props) {
  const { language } = useTerminalLanguage();
  const { user, signedIn, loading: authLoading } = useOttAuthSession();
  const isEnglish = language === "en";
  const stats = getWalletAcademyStats();
  const founder = hasFounderAccess(user);
  const [entitlements, setEntitlements] = useState<PremiumEntitlements>(EMPTY_ENTITLEMENTS);
  const [busy, setBusy] = useState(false);
  const [setupRequired, setSetupRequired] = useState(false);
  const [walletLinked, setWalletLinked] = useState(false);
  const [walletGrantAvailable, setWalletGrantAvailable] = useState(false);
  const [error, setError] = useState("");

  const unlocked = founder || entitlements.allPremium || entitlements.academyPremium || entitlements.walletAcademy;

  const refreshAccess = useCallback(async (silent = false) => {
    if (!signedIn || authLoading) {
      setEntitlements(EMPTY_ENTITLEMENTS);
      setSetupRequired(false);
      setWalletLinked(false);
      setWalletGrantAvailable(false);
      return;
    }

    if (!silent) setBusy(true);
    try {
      const response = await loadPremiumAccessStatus(isWallet(walletAddress) ? walletAddress : undefined);
      setEntitlements(response.entitlements ?? EMPTY_ENTITLEMENTS);
      setSetupRequired(Boolean(response.setupRequired));
      setWalletLinked(Boolean(response.walletLinked));
      setWalletGrantAvailable(Boolean(response.walletGrantAvailable));
      setError("");
    } catch (nextError) {
      setEntitlements(EMPTY_ENTITLEMENTS);
      setError(nextError instanceof Error
        ? nextError.message
        : (isEnglish ? "Premium access could not be verified." : "Premiumtoegang kon niet worden geverifieerd."));
    } finally {
      if (!silent) setBusy(false);
    }
  }, [authLoading, isEnglish, signedIn, walletAddress]);

  useEffect(() => {
    void refreshAccess(true);
    const refresh = () => void refreshAccess(true);
    window.addEventListener("focus", refresh);
    window.addEventListener("ott-premium-access-changed", refresh);
    window.addEventListener("ott-wallet-session-changed", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("ott-premium-access-changed", refresh);
      window.removeEventListener("ott-wallet-session-changed", refresh);
    };
  }, [refreshAccess]);

  return (
    <section className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3 text-blue-700">
              <BookOpen size={21} />
              <p className="text-sm font-semibold">XRPL Wallet Academy</p>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${unlocked ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`}>
                {unlocked
                  ? (isEnglish ? "Server verified · unlocked" : "Servergeverifieerd · ontgrendeld")
                  : (isEnglish ? "Premium course · preview" : "Premiumopleiding · preview")}
              </span>
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              {isEnglish
                ? "Learn the account first. Choose the wallet second. Sign only after you understand the transaction."
                : "Leer eerst het account. Kies daarna de wallet. Onderteken pas wanneer je de transactie begrijpt."}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              {isEnglish
                ? "Every supported wallet follows the same XRPL foundation, security and Testnet practice path. A wallet brand never replaces ledger knowledge."
                : "Iedere ondersteunde wallet volgt hetzelfde XRPL-fundament, beveiligingspad en Testnet-praktijktraject. Een walletmerk vervangt nooit ledgerkennis."}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Stat label={isEnglish ? "Modules" : "Modules"} value={stats.moduleCount} />
            <Stat label={isEnglish ? "Lessons" : "Lessen"} value={stats.lessonCount} />
            <Stat label="XP" value={stats.totalXp} />
          </div>
        </div>

        {!unlocked && (
          <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex max-w-3xl items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-900 text-white">
                  {authLoading ? <Loader2 className="animate-spin" size={21} /> : signedIn ? <LockKeyhole size={21} /> : <UserCircle size={21} />}
                </span>
                <div>
                  <h3 className="text-xl font-semibold text-amber-950">
                    {!signedIn
                      ? (isEnglish ? "Sign in for verified learning progress" : "Log in voor geverifieerde leervoortgang")
                      : (isEnglish ? "The complete Wallet Academy is locked" : "De volledige Wallet Academy is vergrendeld")}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-amber-950/80">
                    {!signedIn
                      ? (isEnglish
                          ? "Guests can inspect the structure, but lesson results, premium content and certificate eligibility require an OTT account."
                          : "Gasten kunnen de structuur bekijken, maar lesresultaten, premiumcontent en certificaattoelating vereisen een OTT-account.")
                      : setupRequired
                        ? (isEnglish
                            ? "The interface is ready, but the prepared Supabase premium-access migration must still be applied."
                            : "De interface is klaar, maar de voorbereide Supabase-migratie voor premiumtoegang moet nog worden uitgevoerd.")
                        : walletGrantAvailable && !walletLinked
                          ? (isEnglish
                              ? "A grant exists for this wallet. Prove wallet ownership from Profile & wallet to attach it safely to your OTT account."
                              : "Er bestaat een recht voor deze wallet. Bewijs het walletbezit via Profiel en wallet om dit veilig aan je OTT-account te koppelen.")
                          : (isEnglish
                              ? "A verified Access Pass, founder grant or eligible premium account unlocks every lesson. Local browser data alone never unlocks this course."
                              : "Een geverifieerde Access Pass, foundergrant of geldig premiumaccount ontgrendelt alle lessen. Alleen lokale browserdata ontgrendelt deze opleiding nooit.")}
                  </p>
                  {error && <p className="mt-3 text-sm font-medium text-rose-800">{error}</p>}
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate?.(signedIn && walletGrantAvailable && !walletLinked ? "wallet" : signedIn ? "accessgate" : "wallet")}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-950 px-5 py-3 text-sm font-semibold text-white"
                >
                  {signedIn && walletGrantAvailable && !walletLinked ? <Wallet size={17} /> : <LockKeyhole size={17} />}
                  {!signedIn
                    ? (isEnglish ? "Sign in" : "Inloggen")
                    : walletGrantAvailable && !walletLinked
                      ? (isEnglish ? "Verify wallet link" : "Walletkoppeling verifiëren")
                      : (isEnglish ? "View access options" : "Bekijk toegangsopties")}
                </button>
                {signedIn && (
                  <button type="button" onClick={() => void refreshAccess()} disabled={busy} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-3 text-sm font-semibold text-amber-950 disabled:opacity-50">
                    {busy ? <Loader2 className="animate-spin" size={17} /> : <RefreshCcw size={17} />}
                    {isEnglish ? "Refresh" : "Vernieuwen"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {WALLET_ACADEMY_MODULES.map((module, index) => (
            <article key={module.id} className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-blue-700">{isEnglish ? `Module ${index + 1}` : `Module ${index + 1}`}</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-950">{module.title[language]}</h3>
                </div>
                {unlocked
                  ? (index === 1 ? <ShieldCheck className="text-blue-700" /> : index === 2 ? <Award className="text-blue-700" /> : <BookOpen className="text-blue-700" />)
                  : <LockKeyhole className="text-slate-400" />}
              </div>

              <ol className="mt-6 space-y-4">
                {module.lessons.map((lesson) => (
                  <li key={lesson.id} className="flex gap-3">
                    {unlocked ? <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={18} /> : <LockKeyhole className="mt-0.5 shrink-0 text-slate-300" size={18} />}
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{lesson.title[language]}</p>
                      {unlocked ? (
                        <>
                          <p className="mt-1 text-sm leading-6 text-slate-600">{lesson.summary[language]}</p>
                          <p className="mt-1 text-xs font-medium text-blue-700">+{lesson.xp} XP</p>
                        </>
                      ) : (
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {isEnglish ? "Full explanation, security checks and practical assignment unlock with verified access." : "Volledige uitleg, beveiligingscontroles en praktijkopdracht worden ontgrendeld met geverifieerde toegang."}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">{isEnglish ? "Credential after verified completion" : "Credential na geverifieerde voltooiing"}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{module.certificateType}</p>
                <p className="mt-2 text-xs text-slate-500">{isEnglish ? "Earned only · not for sale" : "Alleen te verdienen · niet te koop"}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-24 rounded-2xl border border-slate-200 bg-white p-4 text-center">
      <p className="text-2xl font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  );
}
