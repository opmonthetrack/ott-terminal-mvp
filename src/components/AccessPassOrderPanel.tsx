import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Loader2,
  RefreshCcw,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import {
  createAccessPassAcceptPayload,
  createAccessPassPayment,
  getAccessPassOrderStatus,
  verifyAccessPassAcceptPayload,
  verifyAccessPassPayment,
  type AccessPassClaim,
  type AccessPassOrder,
} from "../lib/accessPassOrderClient";
import { useOttAuthSession } from "../lib/useOttAuthSession";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

type Props = {
  walletAddress?: string;
  onNavigate?: (target: string) => void;
};

const VALID_WALLET = /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/;
const STAGES = ["payment", "reserved", "delivery", "issued"] as const;

type Stage = (typeof STAGES)[number];

function getMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "error" in error) {
    const value = (error as { error?: unknown }).error;
    if (typeof value === "string") return value;
  }
  return fallback;
}

function currentStage(order: AccessPassOrder | null, claim: AccessPassClaim | null): Stage {
  if (claim?.status === "issued" || order?.status === "issued") return "issued";
  if (claim && ["mint-signing", "minted", "offer-signing", "offer-created", "accept-signing"].includes(claim.lifecycle_step)) return "delivery";
  if (claim || order?.serial_number) return "reserved";
  return "payment";
}

export function AccessPassOrderPanel({ walletAddress = "guest", onNavigate }: Props) {
  const { language } = useTerminalLanguage();
  const { signedIn, loading: authLoading } = useOttAuthSession();
  const en = language === "en";
  const hasWallet = VALID_WALLET.test(walletAddress);
  const [order, setOrder] = useState<AccessPassOrder | null>(null);
  const [claim, setClaim] = useState<AccessPassClaim | null>(null);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const refresh = useCallback(async (silent = false) => {
    if (!signedIn || authLoading) {
      setOrder(null);
      setClaim(null);
      return;
    }
    if (!silent) setBusy("refresh");
    try {
      const response = await getAccessPassOrderStatus();
      setOrder(response.order ?? null);
      setClaim(response.claim ?? null);
      setError("");
    } catch (nextError) {
      if (!silent) setError(getMessage(nextError, en ? "Access Pass status could not be loaded." : "Access Pass-status kon niet worden geladen."));
    } finally {
      if (!silent) setBusy("");
    }
  }, [authLoading, en, signedIn]);

  useEffect(() => {
    void refresh(true);
    if (!signedIn) return;
    const timer = window.setInterval(() => void refresh(true), 15_000);
    const onFocus = () => void refresh(true);
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh, signedIn]);

  useEffect(() => {
    if (!signedIn || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const paymentReturn = params.get("access_payment_return") === "1";
    const acceptReturn = params.get("access_accept_return") === "1";
    const uuid = params.get("payload") ?? undefined;
    if (!paymentReturn && !acceptReturn) return;

    let cancelled = false;
    setBusy(paymentReturn ? "verify-payment" : "verify-accept");
    setMessage(paymentReturn
      ? (en ? "Verifying the validated XRP payment…" : "De gevalideerde XRP-betaling wordt gecontroleerd…")
      : (en ? "Verifying NFT acceptance…" : "NFT-acceptatie wordt gecontroleerd…"));

    const run = paymentReturn ? verifyAccessPassPayment(uuid) : verifyAccessPassAcceptPayload();
    void run.then((response) => {
      if (cancelled) return;
      setOrder(response.order ?? order);
      setClaim(response.claim ?? claim);
      setError("");
      setMessage(paymentReturn
        ? (en ? "Payment verified. Your unique Access Pass number is reserved." : "Betaling geverifieerd. Je unieke Access Pass-nummer is gereserveerd.")
        : response.stage === "issued"
          ? (en ? "Access Pass delivered to your XRPL wallet." : "Access Pass afgeleverd in je XRPL-wallet.")
          : (en ? "The ledger is still confirming delivery." : "De ledger bevestigt de levering nog."));
    }).catch((nextError) => {
      if (!cancelled) setError(getMessage(nextError, en ? "Return verification failed." : "Controle na terugkeer is mislukt."));
    }).finally(() => {
      if (cancelled) return;
      setBusy("");
      ["access_payment_return", "access_accept_return", "order", "payload"].forEach((key) => params.delete(key));
      const query = params.toString();
      window.history.replaceState({}, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
      void refresh(true);
    });
    return () => { cancelled = true; };
  }, [en, signedIn]);

  async function startPayment() {
    if (!signedIn) {
      onNavigate?.("wallet");
      return;
    }
    if (!hasWallet) {
      onNavigate?.("xaman");
      return;
    }
    setBusy("create-payment");
    setError("");
    setMessage(en ? "Preparing the 1.589 XRP Xaman payment…" : "De Xaman-betaling van 1.589 XRP wordt voorbereid…");
    try {
      const response = await createAccessPassPayment(walletAddress);
      setOrder(response.order ?? null);
      setClaim(response.claim ?? null);
      if (response.alreadyPaid) {
        setMessage(en ? "This account already has a paid or reserved Access Pass order." : "Dit account heeft al een betaalde of gereserveerde Access Pass-bestelling.");
        return;
      }
      const nextUrl = response.payload?.next?.always || response.payload?.next?.no_push_msg_received;
      if (!nextUrl) throw new Error("Xaman did not return a payment link.");
      window.location.assign(nextUrl);
    } catch (nextError) {
      setError(getMessage(nextError, en ? "Payment request could not be created." : "Betaalverzoek kon niet worden gemaakt."));
    } finally {
      setBusy("");
    }
  }

  async function verifyPayment() {
    setBusy("verify-payment");
    setError("");
    try {
      const response = await verifyAccessPassPayment();
      setOrder(response.order ?? order);
      setClaim(response.claim ?? claim);
      setMessage(response.pending
        ? (en ? "Payment is still awaiting signature or ledger validation." : "Betaling wacht nog op ondertekening of ledgervalidatie.")
        : (en ? "Payment verified and Access Pass number reserved." : "Betaling geverifieerd en Access Pass-nummer gereserveerd."));
    } catch (nextError) {
      setError(getMessage(nextError, en ? "Payment verification failed." : "Betalingscontrole is mislukt."));
    } finally {
      setBusy("");
      void refresh(true);
    }
  }

  async function acceptPass() {
    setBusy("create-accept");
    setError("");
    try {
      const response = await createAccessPassAcceptPayload();
      setClaim(response.claim ?? claim);
      const nextUrl = response.payload?.next?.always || response.payload?.next?.no_push_msg_received;
      if (!nextUrl) throw new Error("Xaman did not return an acceptance link.");
      window.location.assign(nextUrl);
    } catch (nextError) {
      setError(getMessage(nextError, en ? "NFT acceptance could not be prepared." : "NFT-acceptatie kon niet worden voorbereid."));
      setBusy("");
    }
  }

  async function verifyAccept() {
    setBusy("verify-accept");
    setError("");
    try {
      const response = await verifyAccessPassAcceptPayload();
      setClaim(response.claim ?? claim);
      setMessage(response.stage === "issued"
        ? (en ? "Access Pass ownership confirmed." : "Eigendom van de Access Pass bevestigd.")
        : (en ? "Delivery is still being confirmed." : "Levering wordt nog bevestigd."));
    } catch (nextError) {
      setError(getMessage(nextError, en ? "Delivery verification failed." : "Leveringscontrole is mislukt."));
    } finally {
      setBusy("");
      void refresh(true);
    }
  }

  const stage = useMemo(() => currentStage(order, claim), [claim, order]);
  const stageIndex = STAGES.indexOf(stage);
  const serial = claim?.serial || order?.serial || (order?.serial_number ? `#${String(order.serial_number).padStart(3, "0")}` : "");
  const canAccept = claim?.lifecycle_step === "offer-created";
  const canVerifyAccept = claim?.lifecycle_step === "accept-signing";
  const issued = stage === "issued";

  return (
    <section className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">OTT Access Pass Alpha</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              {serial ? `${en ? "Your reserved pass" : "Jouw gereserveerde pass"} ${serial}` : (en ? "Verified purchase and delivery" : "Geverifieerde aankoop en levering")}
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              {en
                ? "The server checks the validated XRPL payment before reserving one unique number from #001 to #500. Access unlocks only after the NFT is actually owned by the receiving wallet."
                : "De server controleert de gevalideerde XRPL-betaling voordat één uniek nummer van #001 tot #500 wordt gereserveerd. Toegang opent pas wanneer de ontvangende wallet het NFT werkelijk bezit."}
            </p>
          </div>
          <button type="button" onClick={() => void refresh()} disabled={Boolean(busy)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold hover:bg-slate-100 disabled:opacity-50">
            {busy === "refresh" ? <Loader2 className="animate-spin" size={17} /> : <RefreshCcw size={17} />}
            {en ? "Refresh status" : "Status vernieuwen"}
          </button>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-4">
          <Step done={stageIndex > 0} current={stageIndex === 0} icon={CreditCard} label={en ? "1.589 XRP payment" : "1.589 XRP-betaling"} />
          <Step done={stageIndex > 1} current={stageIndex === 1} icon={BadgeCheck} label={en ? "Serial reserved" : "Nummer gereserveerd"} />
          <Step done={stageIndex > 2} current={stageIndex === 2} icon={ShieldCheck} label={en ? "Founder delivery" : "Founderlevering"} />
          <Step done={issued} current={stageIndex === 3} icon={Wallet} label={en ? "Wallet ownership" : "Walletbezit"} />
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_340px]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Metric label={en ? "Price" : "Prijs"} value="1.589 XRP" />
              <Metric label={en ? "Receiving wallet" : "Ontvangstwallet"} value={hasWallet ? `${walletAddress.slice(0, 8)}…${walletAddress.slice(-6)}` : "—"} />
              <Metric label={en ? "Order status" : "Bestelstatus"} value={order?.status ?? (signedIn ? "not started" : "sign in")} />
              <Metric label="Access Pass" value={serial || "#001–#500"} />
            </div>
            {message && <p className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-950">{message}</p>}
            {(error || order?.error_message || claim?.error_message) && <p className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-950">{error || claim?.error_message || order?.error_message}</p>}
            <p className="mt-6 text-xs leading-5 text-slate-500">
              {en ? "Utility access only. No investment, yield, profit or resale value promise." : "Alleen utility-toegang. Geen investering, yield, winst- of doorverkoopwaardebelofte."}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            {authLoading ? (
              <ActionLoading text={en ? "Checking account…" : "Account controleren…"} />
            ) : !signedIn ? (
              <ActionButton onClick={() => onNavigate?.("wallet")} icon={ShieldCheck} text={en ? "Sign in with OTT account" : "Inloggen met OTT-account"} />
            ) : !hasWallet ? (
              <ActionButton onClick={() => onNavigate?.("xaman")} icon={Wallet} text={en ? "Connect receiving wallet" : "Ontvangstwallet koppelen"} />
            ) : issued ? (
              <div className="rounded-2xl bg-emerald-50 p-5 text-emerald-950">
                <CheckCircle2 size={26} />
                <p className="mt-3 font-semibold">{en ? "Access Pass delivered" : "Access Pass afgeleverd"}</p>
                <p className="mt-2 text-sm leading-6">{en ? "The XRPL confirms ownership in your connected wallet." : "De XRPL bevestigt eigendom in je gekoppelde wallet."}</p>
              </div>
            ) : canAccept ? (
              <ActionButton busy={busy === "create-accept"} onClick={() => void acceptPass()} icon={Wallet} text={en ? "Accept NFT in Xaman" : "NFT accepteren in Xaman"} />
            ) : canVerifyAccept ? (
              <ActionButton busy={busy === "verify-accept"} onClick={() => void verifyAccept()} icon={CheckCircle2} text={en ? "Verify NFT delivery" : "NFT-levering controleren"} />
            ) : order?.payment_payload_uuid && ["payment-signing", "payment-pending", "created"].includes(order.status) ? (
              <ActionButton busy={busy === "verify-payment"} onClick={() => void verifyPayment()} icon={CheckCircle2} text={en ? "Verify XRP payment" : "XRP-betaling controleren"} />
            ) : claim ? (
              <div className="rounded-2xl bg-slate-100 p-5 text-slate-700">
                <Loader2 className="animate-spin" size={22} />
                <p className="mt-3 font-semibold">{en ? "Founder delivery in progress" : "Founderlevering in behandeling"}</p>
                <p className="mt-2 text-sm leading-6">{en ? "No extra payment is needed. Refresh later for the next wallet step." : "Geen extra betaling nodig. Vernieuw later voor de volgende walletstap."}</p>
              </div>
            ) : (
              <ActionButton busy={busy === "create-payment"} onClick={() => void startPayment()} icon={ExternalLink} text={en ? "Pay 1.589 XRP with Xaman" : "Betaal 1.589 XRP met Xaman"} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Step({ done, current, icon: Icon, label }: { done: boolean; current: boolean; icon: typeof CreditCard; label: string }) {
  return <div className={`flex items-center gap-3 rounded-2xl border p-4 ${done ? "border-emerald-200 bg-emerald-50" : current ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white"}`}><Icon size={19} className={done ? "text-emerald-700" : current ? "text-blue-700" : "text-slate-400"} /><span className="text-sm font-semibold">{label}</span></div>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs text-slate-500">{label}</p><p className="mt-1 break-all text-sm font-semibold text-slate-900">{value}</p></div>;
}

function ActionButton({ onClick, icon: Icon, text, busy = false }: { onClick: () => void; icon: typeof CreditCard; text: string; busy?: boolean }) {
  return <button type="button" onClick={onClick} disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">{busy ? <Loader2 className="animate-spin" size={18} /> : <Icon size={18} />}{text}</button>;
}

function ActionLoading({ text }: { text: string }) {
  return <div className="flex items-center justify-center gap-3 rounded-xl bg-slate-100 p-5 text-sm text-slate-600"><Loader2 className="animate-spin" size={18} />{text}</div>;
}
