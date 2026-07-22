import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Award,
  CheckCircle2,
  ExternalLink,
  Loader2,
  RefreshCcw,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { AcademyTab as AcademyCore } from "./AcademyTabV4";
import {
  createAcademyCertificateAcceptPayload,
  getAcademyFoundationCertificateStatus,
  verifyAcademyCertificateAcceptPayload,
  type AcademyCertificateClaim,
} from "../lib/academyCertificateClient";
import { useOttAuthSession } from "../lib/useOttAuthSession";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

type AcademyTabProps = {
  walletAddress?: string;
  onNavigate?: (target: string) => void;
};

const LIFECYCLE_ORDER = [
  "reserved",
  "mint-signing",
  "minted",
  "offer-signing",
  "offer-created",
  "accept-signing",
  "issued",
] as const;

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "error" in error) {
    const value = (error as { error?: unknown }).error;
    if (typeof value === "string") return value;
  }
  return fallback;
}

function shortHash(value: string | null | undefined) {
  if (!value) return "—";
  return value.length > 18 ? `${value.slice(0, 9)}…${value.slice(-7)}` : value;
}

function lifecycleIndex(step: string | undefined) {
  const index = LIFECYCLE_ORDER.indexOf(step as (typeof LIFECYCLE_ORDER)[number]);
  return index < 0 ? 0 : index;
}

export function AcademyTab(props: AcademyTabProps) {
  const { language } = useTerminalLanguage();
  const { signedIn, loading: authLoading } = useOttAuthSession();
  const isEnglish = language === "en";
  const [claim, setClaim] = useState<AcademyCertificateClaim | null>(null);
  const [loading, setLoading] = useState(false);
  const [busyAction, setBusyAction] = useState("");
  const [message, setMessage] = useState("");

  const refreshStatus = useCallback(async (silent = false) => {
    if (!signedIn || authLoading) {
      setClaim(null);
      return;
    }

    if (!silent) setLoading(true);
    try {
      const response = await getAcademyFoundationCertificateStatus();
      setClaim(response.claim ?? null);
      if (!silent) setMessage("");
    } catch (error) {
      if (!silent) {
        setMessage(getErrorMessage(
          error,
          isEnglish
            ? "Certificate status is not available yet."
            : "De certificaatstatus is nog niet beschikbaar.",
        ));
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [authLoading, isEnglish, signedIn]);

  useEffect(() => {
    void refreshStatus(true);
    if (!signedIn) return;

    const refreshOnFocus = () => void refreshStatus(true);
    const interval = window.setInterval(() => void refreshStatus(true), 15_000);
    window.addEventListener("focus", refreshOnFocus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshOnFocus);
    };
  }, [refreshStatus, signedIn]);

  useEffect(() => {
    if (typeof window === "undefined" || !signedIn) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("certificate_accept_return") !== "1") return;

    let cancelled = false;
    setBusyAction("verify-accept");
    setMessage(isEnglish ? "Verifying the wallet acceptance…" : "De walletacceptatie wordt gecontroleerd…");
    void verifyAcademyCertificateAcceptPayload()
      .then((response) => {
        if (cancelled) return;
        setClaim(response.claim ?? null);
        setMessage(response.stage === "issued"
          ? (isEnglish ? "Certificate issued to your XRPL wallet." : "Certificaat uitgegeven aan je XRPL-wallet.")
          : (isEnglish ? "The ledger is still confirming the transfer." : "De ledger bevestigt de overdracht nog."));
      })
      .catch((error) => {
        if (!cancelled) {
          setMessage(getErrorMessage(error, isEnglish ? "Acceptance verification failed." : "Controle van de acceptatie is mislukt."));
        }
      })
      .finally(() => {
        if (cancelled) return;
        setBusyAction("");
        params.delete("certificate_accept_return");
        params.delete("payload");
        const query = params.toString();
        window.history.replaceState({}, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
      });

    return () => {
      cancelled = true;
    };
  }, [isEnglish, signedIn]);

  async function startAccept() {
    setBusyAction("create-accept");
    setMessage(isEnglish ? "Preparing the wallet acceptance request…" : "Het walletacceptatieverzoek wordt voorbereid…");
    try {
      const response = await createAcademyCertificateAcceptPayload();
      setClaim(response.claim ?? null);
      const nextUrl = response.payload?.next?.always;
      if (!nextUrl) {
        throw new Error("Xaman did not return a signing link.");
      }
      window.location.assign(nextUrl);
    } catch (error) {
      setMessage(getErrorMessage(error, isEnglish ? "The acceptance request could not be created." : "Het acceptatieverzoek kon niet worden gemaakt."));
      setBusyAction("");
    }
  }

  async function verifyAccept() {
    setBusyAction("verify-accept");
    setMessage(isEnglish ? "Checking the validated XRPL transfer…" : "De gevalideerde XRPL-overdracht wordt gecontroleerd…");
    try {
      const response = await verifyAcademyCertificateAcceptPayload();
      setClaim(response.claim ?? null);
      setMessage(response.stage === "issued"
        ? (isEnglish ? "Certificate issued to your XRPL wallet." : "Certificaat uitgegeven aan je XRPL-wallet.")
        : (isEnglish ? "The transaction is still pending. Check again shortly." : "De transactie is nog in behandeling. Controleer straks opnieuw."));
    } catch (error) {
      setMessage(getErrorMessage(error, isEnglish ? "The acceptance could not be verified." : "De acceptatie kon niet worden gecontroleerd."));
    } finally {
      setBusyAction("");
    }
  }

  const progress = useMemo(() => lifecycleIndex(claim?.lifecycle_step), [claim?.lifecycle_step]);

  return (
    <>
      <AcademyCore {...props} />
      <CertificateDeliveryPanel
        isEnglish={isEnglish}
        signedIn={signedIn}
        authLoading={authLoading}
        loading={loading}
        busyAction={busyAction}
        claim={claim}
        message={message}
        progress={progress}
        onRefresh={() => void refreshStatus()}
        onAccept={() => void startAccept()}
        onVerify={() => void verifyAccept()}
      />
    </>
  );
}

type DeliveryPanelProps = {
  isEnglish: boolean;
  signedIn: boolean;
  authLoading: boolean;
  loading: boolean;
  busyAction: string;
  claim: AcademyCertificateClaim | null;
  message: string;
  progress: number;
  onRefresh: () => void;
  onAccept: () => void;
  onVerify: () => void;
};

function CertificateDeliveryPanel(props: DeliveryPanelProps) {
  const {
    isEnglish,
    signedIn,
    authLoading,
    loading,
    busyAction,
    claim,
    message,
    progress,
    onRefresh,
    onAccept,
    onVerify,
  } = props;

  if (authLoading || (!signedIn && !claim)) return null;

  const step = claim?.lifecycle_step ?? "reserved";
  const issued = claim?.status === "issued" && step === "issued";
  const canAccept = step === "offer-created";
  const canVerify = step === "accept-signing";
  const metadataUrl = claim?.metadata_uri ?? "";
  const explorerUrl = claim?.transaction_hash
    ? `https://livenet.xrpl.org/transactions/${claim.transaction_hash}`
    : "";

  return (
    <section className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
              {isEnglish ? "Certificate delivery" : "Certificaatuitgifte"}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              {claim
                ? `${isEnglish ? "Foundation Certificate" : "Foundation-certificaat"} ${claim.serial ?? `#${String(claim.serial_number).padStart(4, "0")}`}`
                : (isEnglish ? "No certificate claim yet" : "Nog geen certificaatclaim")}
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              {issued
                ? (isEnglish
                    ? "The XRPL confirms that the NFT is owned by your receiving wallet."
                    : "De XRPL bevestigt dat het NFT eigendom is van je ontvangende wallet.")
                : claim
                  ? (isEnglish
                      ? "OTT verifies every stage: issuer mint, targeted free transfer offer and wallet acceptance."
                      : "OTT controleert iedere stap: issuer-mint, doelgerichte gratis overdrachts-offer en walletacceptatie.")
                  : (isEnglish
                      ? "After all Academy requirements are complete, reserve the certificate in the NFT certificate section above."
                      : "Reserveer na alle Academy-voorwaarden het certificaat in het NFT-certificaatgedeelte hierboven.")}
            </p>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={17} /> : <RefreshCcw size={17} />}
            {isEnglish ? "Refresh status" : "Status vernieuwen"}
          </button>
        </div>

        {claim && (
          <>
            <div className="mt-9 grid gap-3 md:grid-cols-4">
              <DeliveryStep done={progress >= 1} current={step === "reserved" || step === "mint-signing"} label={isEnglish ? "Issuer mint" : "Issuer-mint"} />
              <DeliveryStep done={progress >= 3} current={step === "minted" || step === "offer-signing"} label={isEnglish ? "Transfer offer" : "Overdrachts-offer"} />
              <DeliveryStep done={progress >= 5} current={step === "offer-created" || step === "accept-signing"} label={isEnglish ? "Wallet acceptance" : "Walletacceptatie"} />
              <DeliveryStep done={issued} current={step === "issued"} label={isEnglish ? "Issued" : "Uitgegeven"} />
            </div>

            <div className="mt-7 grid gap-4 lg:grid-cols-[1fr_320px]">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Detail label={isEnglish ? "Lifecycle" : "Processtap"} value={step} />
                  <Detail label={isEnglish ? "Receiving wallet" : "Ontvangende wallet"} value={shortHash(claim.wallet_address)} />
                  <Detail label="NFTokenID" value={shortHash(claim.nftoken_id)} />
                  <Detail label={isEnglish ? "Final transaction" : "Definitieve transactie"} value={shortHash(claim.transaction_hash)} />
                </div>
                {claim.error_message && (
                  <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    {claim.error_message}
                  </p>
                )}
                {message && (
                  <p className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-950">
                    {message}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                {canAccept && (
                  <button
                    type="button"
                    onClick={onAccept}
                    disabled={Boolean(busyAction)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    {busyAction === "create-accept" ? <Loader2 className="animate-spin" size={17} /> : <Wallet size={17} />}
                    {isEnglish ? "Accept NFT in wallet" : "NFT accepteren in wallet"}
                  </button>
                )}
                {canVerify && (
                  <button
                    type="button"
                    onClick={onVerify}
                    disabled={Boolean(busyAction)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    {busyAction === "verify-accept" ? <Loader2 className="animate-spin" size={17} /> : <ShieldCheck size={17} />}
                    {isEnglish ? "Verify wallet acceptance" : "Walletacceptatie controleren"}
                  </button>
                )}
                {issued && (
                  <div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-900">
                    <CheckCircle2 className="mt-0.5 shrink-0" size={20} />
                    <p className="text-sm leading-6">
                      {isEnglish ? "Issued and ownership verified on XRPL." : "Uitgegeven en eigendom geverifieerd op XRPL."}
                    </p>
                  </div>
                )}
                {!canAccept && !canVerify && !issued && (
                  <div className="flex items-start gap-3 rounded-xl bg-slate-100 p-4 text-slate-700">
                    <Award className="mt-0.5 shrink-0" size={20} />
                    <p className="text-sm leading-6">
                      {step === "failed"
                        ? (isEnglish ? "The issuer will review this failed step." : "De issuer controleert deze mislukte stap.")
                        : (isEnglish ? "No wallet action is required at this stage." : "In deze stap is geen walletactie nodig.")}
                    </p>
                  </div>
                )}

                <div className="mt-4 space-y-2">
                  {metadataUrl && (
                    <a href={metadataUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium hover:bg-slate-50">
                      <span>{isEnglish ? "View NFT metadata" : "NFT-metadata bekijken"}</span>
                      <ExternalLink size={16} />
                    </a>
                  )}
                  {explorerUrl && (
                    <a href={explorerUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium hover:bg-slate-50">
                      <span>{isEnglish ? "Open XRPL transaction" : "XRPL-transactie openen"}</span>
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function DeliveryStep({ done, current, label }: { done: boolean; current: boolean; label: string }) {
  return (
    <div className={`rounded-2xl border p-4 ${done ? "border-emerald-200 bg-emerald-50" : current ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white"}`}>
      <div className="flex items-center gap-3">
        {done ? <CheckCircle2 className="text-emerald-700" size={19} /> : current ? <Loader2 className="animate-spin text-blue-700" size={19} /> : <div className="h-4 w-4 rounded-full border border-slate-300" />}
        <span className="text-sm font-semibold">{label}</span>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 break-all text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
