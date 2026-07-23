import {
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  Loader2,
  Lock,
  RefreshCcw,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import type { PremiumEntitlements } from "../lib/premiumAccessClient";

type Props = {
  isEnglish: boolean;
  signedIn: boolean;
  hasWallet: boolean;
  walletAddress: string;
  setupRequired: boolean;
  loading: boolean;
  linkBusy: boolean;
  walletLinked: boolean;
  walletGrantAvailable: boolean;
  entitlements: PremiumEntitlements;
  source: string;
  error: string;
  onStartProof: () => void;
  onRefresh: () => void;
  onNavigate?: (target: string) => void;
};

export function WalletGrantProofPanel(props: Props) {
  const {
    isEnglish,
    signedIn,
    hasWallet,
    walletAddress,
    setupRequired,
    loading,
    linkBusy,
    walletLinked,
    walletGrantAvailable,
    entitlements,
    source,
    error,
    onStartProof,
    onRefresh,
    onNavigate,
  } = props;

  if (entitlements.walletAcademy) {
    return (
      <section className="mx-auto mt-6 max-w-6xl px-4 sm:px-8">
        <div className="flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-700" size={22} />
            <div>
              <p className="font-semibold text-emerald-950">
                {isEnglish ? "Wallet Academy access verified" : "Toegang tot Wallet Academy geverifieerd"}
              </p>
              <p className="mt-1 text-sm leading-6 text-emerald-900">
                {source === "access-pass"
                  ? (isEnglish ? "Unlocked by an issued OTT Access Pass." : "Geopend door een uitgegeven OTT Access Pass.")
                  : source === "wallet-grant"
                    ? (isEnglish ? "Unlocked by a founder wallet grant after Xaman proof." : "Geopend door een founder-walletgrant na Xaman-bewijs.")
                    : (isEnglish ? "Unlocked by a founder account grant." : "Geopend door een founder-accountgrant.")}
              </p>
            </div>
          </div>
          <button type="button" onClick={onRefresh} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-900 disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" size={16} /> : <RefreshCcw size={16} />}
            {isEnglish ? "Refresh" : "Vernieuwen"}
          </button>
        </div>
      </section>
    );
  }

  if (setupRequired) {
    return (
      <section className="mx-auto mt-6 max-w-6xl px-4 sm:px-8">
        <StatusBox icon={AlertTriangle} tone="amber" title={isEnglish ? "Premium access activation pending" : "Premiumtoegang wordt nog geactiveerd"} text={isEnglish ? "The protected grant and wallet-link database is not installed yet. No local unlock is used as a fallback." : "De beveiligde grant- en walletlinkdatabase is nog niet geïnstalleerd. Er wordt bewust geen lokale unlock als noodoplossing gebruikt."} />
      </section>
    );
  }

  if (!signedIn) {
    return (
      <section className="mx-auto mt-6 max-w-6xl px-4 sm:px-8">
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <div className="flex items-start gap-3"><Lock className="mt-0.5 shrink-0 text-blue-700" size={22} /><div><p className="font-semibold text-blue-950">{isEnglish ? "OTT account required" : "OTT-account vereist"}</p><p className="mt-1 text-sm leading-6 text-blue-900">{isEnglish ? "Founder grants are attached to an authenticated account or to a wallet proven by that account." : "Foundergrants zijn gekoppeld aan een ingelogd account of aan een wallet die door dat account is bewezen."}</p></div></div>
          <button type="button" onClick={() => onNavigate?.("wallet")} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-950 px-4 py-3 text-sm font-semibold text-white"><ShieldCheck size={17} />{isEnglish ? "Open account login" : "Open accountlogin"}</button>
        </div>
      </section>
    );
  }

  if (walletGrantAvailable && !walletLinked) {
    return (
      <section className="mx-auto mt-6 max-w-6xl px-4 sm:px-8">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3"><KeyRound className="mt-0.5 shrink-0 text-amber-800" size={22} /><div><p className="font-semibold text-amber-950">{isEnglish ? "Founder wallet grant found—ownership proof required" : "Founder-walletgrant gevonden—eigenaarsbewijs vereist"}</p><p className="mt-1 text-sm leading-6 text-amber-900">{isEnglish ? `Sign an off-ledger Xaman SignIn request with ${walletAddress}. No XRP payment or XRPL transaction is submitted.` : `Onderteken een off-ledger Xaman SignIn-verzoek met ${walletAddress}. Er wordt geen XRP-betaling of XRPL-transactie ingediend.`}</p></div></div>
          <button type="button" onClick={onStartProof} disabled={linkBusy || !hasWallet} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-40">{linkBusy ? <Loader2 className="animate-spin" size={17} /> : <Wallet size={17} />}{isEnglish ? "Prove wallet in Xaman" : "Bewijs wallet in Xaman"}</button>
        </div>
      </section>
    );
  }

  if (walletLinked) {
    return (
      <section className="mx-auto mt-6 max-w-6xl px-4 sm:px-8">
        <StatusBox icon={CheckCircle2} tone="blue" title={isEnglish ? "Wallet linked, no active Wallet Academy grant" : "Wallet gekoppeld, geen actieve Wallet Academy-grant"} text={isEnglish ? "The wallet proof is stored server-side. Premium content opens automatically when an active account or wallet grant is present." : "Het walletbewijs is server-side opgeslagen. Premiuminhoud opent automatisch zodra een actieve account- of walletgrant aanwezig is."} />
      </section>
    );
  }

  return (
    <section className="mx-auto mt-6 max-w-6xl px-4 sm:px-8">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-start gap-3"><Lock className="mt-0.5 shrink-0 text-slate-600" size={22} /><div><p className="font-semibold">{isEnglish ? "No active premium entitlement" : "Geen actieve premiumtoegang"}</p><p className="mt-1 text-sm leading-6 text-slate-600">{isEnglish ? "Access can come from an issued Access Pass, a founder account grant or a founder wallet grant with Xaman proof." : "Toegang kan komen uit een uitgegeven Access Pass, founder-accountgrant of founder-walletgrant met Xaman-bewijs."}</p></div></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => onNavigate?.("accessgate")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"><ShieldCheck size={17} />Access Pass</button>
          {hasWallet && <button type="button" onClick={onRefresh} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold disabled:opacity-50">{loading ? <Loader2 className="animate-spin" size={17} /> : <RefreshCcw size={17} />}{isEnglish ? "Check grants" : "Controleer grants"}</button>}
        </div>
        {error && <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">{error}</p>}
      </div>
    </section>
  );
}

function StatusBox({ icon: Icon, tone, title, text }: { icon: typeof AlertTriangle; tone: "amber" | "blue"; title: string; text: string }) {
  const classes = tone === "amber" ? "border-amber-200 bg-amber-50 text-amber-950" : "border-blue-200 bg-blue-50 text-blue-950";
  return <div className={`flex items-start gap-3 rounded-2xl border p-5 ${classes}`}><Icon className="mt-0.5 shrink-0" size={22} /><div><p className="font-semibold">{title}</p><p className="mt-1 text-sm leading-6 opacity-80">{text}</p></div></div>;
}
