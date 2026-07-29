import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  HeartHandshake,
  Loader2,
  Mail,
  MessageSquareText,
  RefreshCcw,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { OTTLogoMark } from "../components/OTTLogo";
import { MAKE_WAVES_SOURCE_TAG } from "../lib/makeWaves";
import {
  createSupportPayment,
  loadSupportStats,
  verifySupportPayment,
  type PublicSupporter,
  type SupportAmount,
  type SupportStats,
} from "../lib/supportPaymentClient";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

const AMOUNTS: SupportAmount[] = ["0.589", "1.589", "2.589"];

function errorText(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "error" in error) {
    const value = (error as { error?: unknown }).error;
    if (typeof value === "string") return value;
  }
  return fallback;
}

function delay(milliseconds: number) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

export function SupportDonationTab() {
  const { language } = useTerminalLanguage();
  const en = language === "en";
  const [stats, setStats] = useState<SupportStats | null>(null);
  const [supporters, setSupporters] = useState<PublicSupporter[]>([]);
  const [supportWallet, setSupportWallet] = useState("");
  const [selectedAmount, setSelectedAmount] = useState<SupportAmount>("1.589");
  const [supporterName, setSupporterName] = useState("");
  const [publicMessage, setPublicMessage] = useState("");
  const [publicConsent, setPublicConsent] = useState(false);
  const [busy, setBusy] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const refreshStats = useCallback(async (silent = false) => {
    if (!silent) setBusy("stats");
    try {
      const response = await loadSupportStats();
      setStats(response.stats ?? null);
      setSupporters(response.latestPublicSupporters ?? []);
      setSupportWallet(response.supportWallet ?? "");
      setError("");
    } catch (nextError) {
      if (!silent) {
        setError(errorText(
          nextError,
          en
            ? "Live support totals are temporarily unavailable."
            : "Live supporttotalen zijn tijdelijk niet beschikbaar.",
        ));
      }
    } finally {
      if (!silent) setBusy("");
    }
  }, [en]);

  useEffect(() => {
    void refreshStats(true);
    const interval = window.setInterval(() => void refreshStats(true), 30_000);
    return () => window.clearInterval(interval);
  }, [refreshStats]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("support_payment_return") !== "1") return;
    const uuid = params.get("payload") ?? "";
    const amount = params.get("amount") ?? "";
    if (!uuid) return;

    let cancelled = false;
    setBusy("verify");
    setStatus(en ? "Checking the Xaman support payment…" : "De Xaman-supportbetaling wordt gecontroleerd…");

    async function verifyUntilSettled() {
      for (let attempt = 0; attempt < 6; attempt += 1) {
        const response = await verifySupportPayment(uuid);
        if (cancelled) return;

        if (response.supportWallet) {
          setSupportWallet(response.supportWallet);
        }

        if (response.verified?.validated && response.verified.txid) {
          setStatus(en
            ? `${response.verified.amountXrp || amount || "Support"} XRP is validated on XRPL and qualifies for the public total.`
            : `${response.verified.amountXrp || amount || "Support"} XRP is op XRPL gevalideerd en telt mee voor het publieke totaal.`);
          setError("");
          await refreshStats(true);
          return;
        }

        if (response.verified?.resolved && !response.verified.signed) {
          setStatus(en
            ? "The support request was closed without payment."
            : "Het supportverzoek is gesloten zonder betaling.");
          setError("");
          return;
        }

        if (response.verified?.pendingLedgerValidation && attempt < 5) {
          setStatus(en
            ? "Payment signed. Waiting for XRPL ledger validation…"
            : "Betaling ondertekend. Wachten op XRPL-ledgervalidatie…");
          await delay(2_500);
          continue;
        }

        setStatus(response.verified?.signed
          ? (en
              ? "Payment signed, but final XRPL validation is still pending. Refresh the ledger total shortly."
              : "Betaling ondertekend, maar de definitieve XRPL-validatie loopt nog. Vernieuw het ledgertotaal zo meteen.")
          : (en
              ? "The support payment is still waiting for a signature."
              : "De supportbetaling wacht nog op een handtekening."));
        setError("");
        return;
      }
    }

    void verifyUntilSettled()
      .catch((nextError) => {
        if (!cancelled) {
          setError(errorText(
            nextError,
            en ? "Payment verification failed." : "Betalingscontrole is mislukt.",
          ));
        }
      })
      .finally(() => {
        if (cancelled) return;
        setBusy("");
        ["support_payment_return", "payload", "amount"].forEach((key) => params.delete(key));
        const query = params.toString();
        window.history.replaceState(
          {},
          "",
          `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`,
        );
      });

    return () => {
      cancelled = true;
    };
  }, [en, refreshStats]);

  async function startSupport() {
    const hasPublicContent = Boolean(supporterName.trim() || publicMessage.trim());
    if (hasPublicContent && !publicConsent) {
      setError(en
        ? "Confirm that your optional name/message may be stored publicly on XRPL, or clear those fields."
        : "Bevestig dat je optionele naam/boodschap publiek op XRPL mag worden opgeslagen, of maak die velden leeg.");
      return;
    }

    setBusy("payment");
    setError("");
    setStatus(en
      ? `Preparing ${selectedAmount} XRP in Xaman…`
      : `${selectedAmount} XRP wordt in Xaman voorbereid…`);

    try {
      const response = await createSupportPayment({
        amountXrp: selectedAmount,
        supporterName: supporterName.trim(),
        publicMessage: publicMessage.trim(),
        publicConsent,
      });
      setSupportWallet(response.supportWallet ?? response.support?.destinationWallet ?? "");
      const nextUrl = response.payload?.next?.always || response.payload?.next?.no_push_msg_received;
      if (!nextUrl) throw new Error("Xaman did not return a signing link.");
      window.location.assign(nextUrl);
    } catch (nextError) {
      setError(errorText(
        nextError,
        en
          ? "The Xaman support request could not be created."
          : "Het Xaman-supportverzoek kon niet worden gemaakt.",
      ));
      setBusy("");
    }
  }

  return (
    <div className="ott-core-tab min-h-screen bg-white text-slate-950">
      <section className="relative overflow-hidden border-b border-slate-200 bg-[radial-gradient(circle_at_15%_20%,rgba(56,152,232,0.12),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(200,56,136,0.10),transparent_32%),#fff]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1fr_390px] lg:items-center lg:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-pink-700">OTT Support</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">
              {en ? "Support the terminal directly on XRPL." : "Steun de terminal rechtstreeks op XRPL."}
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600">
              {en
                ? "Choose 0.589, 1.589 or 2.589 XRP. Xaman shows the exact destination, amount and SourceTag before you sign. Only a fully validated XRPL transaction counts in the public total."
                : "Kies 0.589, 1.589 of 2.589 XRP. Xaman toont vóór ondertekening de exacte bestemming, het bedrag en de SourceTag. Alleen een volledig gevalideerde XRPL-transactie telt mee in het publieke totaal."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Pill text={`SourceTag ${MAKE_WAVES_SOURCE_TAG}`} />
              <Pill text={en ? "Voluntary support" : "Vrijwillige support"} />
              <Pill text={en ? "No financial rights" : "Geen financiële rechten"} />
            </div>
          </div>

          <div className="rounded-[2rem] bg-slate-950 p-7 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <OTTLogoMark size="lg" />
              <HeartHandshake className="text-pink-300" size={30} />
            </div>
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {en ? "Validated total" : "Gevalideerd totaal"}
            </p>
            <p className="mt-2 text-4xl font-semibold">{stats ? `${stats.totalXrp} XRP` : "—"}</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <DarkMetric label={en ? "Payments" : "Betalingen"} value={String(stats?.paymentCount ?? 0)} />
              <DarkMetric label={en ? "Supporters" : "Supporters"} value={String(stats?.uniqueSupporters ?? 0)} />
            </div>
            <button
              type="button"
              onClick={() => void refreshStats()}
              disabled={Boolean(busy)}
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-slate-300 hover:text-white disabled:opacity-50"
            >
              {busy === "stats"
                ? <Loader2 className="animate-spin" size={16} />
                : <RefreshCcw size={16} />}
              {en ? "Refresh ledger total" : "Ledgertotaal vernieuwen"}
            </button>
          </div>
        </div>
      </section>

      <div data-page-region="true" className="mx-auto grid max-w-7xl gap-6 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_380px] lg:py-16">
        <section className="rounded-3xl border border-slate-200 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pink-50 text-pink-700">
              <Wallet size={22} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pink-700">
                {en ? "Xaman payment" : "Xaman-betaling"}
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                {en ? "Choose your support amount" : "Kies je supportbedrag"}
              </h2>
            </div>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {AMOUNTS.map((amount) => (
              <button
                key={amount}
                type="button"
                aria-pressed={selectedAmount === amount}
                aria-label={`${amount} XRP`}
                onClick={() => setSelectedAmount(amount)}
                className={`min-h-24 rounded-2xl border px-5 py-5 text-left transition ${
                  selectedAmount === amount
                    ? "border-slate-950 bg-slate-950 text-white shadow-lg"
                    : "border-slate-200 bg-white hover:border-slate-400"
                }`}
              >
                <p className="text-2xl font-semibold">{amount}</p>
                <p className={`mt-1 text-xs ${
                  selectedAmount === amount ? "text-slate-300" : "text-slate-500"
                }`}>XRP</p>
              </button>
            ))}
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              {en ? "Public name (optional)" : "Publieke naam (optioneel)"}
              <input
                value={supporterName}
                onChange={(event) => setSupporterName(event.target.value.slice(0, 40))}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                placeholder={en ? "Name or alias" : "Naam of alias"}
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              {en ? "Public message (optional)" : "Publieke boodschap (optioneel)"}
              <input
                value={publicMessage}
                onChange={(event) => setPublicMessage(event.target.value.slice(0, 160))}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                placeholder={en ? "A short message" : "Een korte boodschap"}
              />
            </label>
          </div>

          {(supporterName.trim() || publicMessage.trim()) && (
            <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
              <input
                type="checkbox"
                checked={publicConsent}
                onChange={(event) => setPublicConsent(event.target.checked)}
                className="mt-1 h-4 w-4"
              />
              <span>
                {en
                  ? "I understand that this optional name/message is permanently public in the XRPL transaction memo. OTT only republishes it after manual review."
                  : "Ik begrijp dat deze optionele naam/boodschap permanent openbaar in de XRPL-transactiememo staat. OTT publiceert deze pas opnieuw na handmatige beoordeling."}
              </span>
            </label>
          )}

          <button
            type="button"
            onClick={() => void startSupport()}
            disabled={Boolean(busy)}
            className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-4 text-sm font-semibold text-white shadow-lg hover:bg-slate-800 disabled:opacity-50"
          >
            {busy === "payment"
              ? <Loader2 className="animate-spin" size={19} />
              : <ExternalLink size={19} />}
            {en ? `Support with ${selectedAmount} XRP` : `Steun met ${selectedAmount} XRP`}
          </button>

          <div aria-live="polite">
            {status && (
              <p className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-950">
                {status}
              </p>
            )}
            {error && (
              <p className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-950">
                {error}
              </p>
            )}
          </div>

          {stats?.scanComplete === false && (
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
              <AlertTriangle className="mt-0.5 shrink-0" size={18} />
              <p>
                {en
                  ? `The live counter reached its scan limit of ${stats.scanLimit ?? 1_000} account transactions. The visible total may exclude older support payments.`
                  : `De live teller heeft de scanlimiet van ${stats.scanLimit ?? 1_000} accounttransacties bereikt. Oudere supportbetalingen kunnen buiten het zichtbare totaal vallen.`}
              </p>
            </div>
          )}
        </section>

        <aside className="space-y-5">
          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-blue-700" size={21} />
              <h3 className="font-semibold">{en ? "What is verified" : "Wat wordt gecontroleerd"}</h3>
            </div>
            <div className="mt-5 space-y-4 text-sm leading-6 text-slate-600">
              <Info text={en
                ? "The destination wallet comes directly from the server."
                : "De bestemmingswallet komt rechtstreeks van de server."} />
              <Info text={en
                ? "Only 0.589, 1.589 and 2.589 XRP are accepted."
                : "Alleen 0.589, 1.589 en 2.589 XRP worden geaccepteerd."} />
              <Info text={en
                ? "Every payment includes SourceTag 2606170002."
                : "Elke betaling bevat SourceTag 2606170002."} />
              <Info text={en
                ? "The counter requires validated = true and tesSUCCESS."
                : "De teller vereist validated = true en tesSUCCESS."} />
              <Info text={en
                ? "Support creates no NFT, access, token, equity or governance rights."
                : "Support geeft geen NFT-, toegangs-, token-, equity- of governancerechten."} />
            </div>
            <div className="mt-6 rounded-2xl bg-white p-4">
              <p className="text-xs text-slate-500">Support wallet</p>
              <p className="mt-2 break-all text-xs font-semibold text-slate-800">
                {supportWallet || (en ? "Loading verified server destination…" : "Geverifieerde serverbestemming laden…")}
              </p>
            </div>
            {typeof stats?.scannedTransactions === "number" && (
              <p className="mt-4 text-xs leading-5 text-slate-500">
                {en
                  ? `${stats.scannedTransactions} account transactions checked.`
                  : `${stats.scannedTransactions} accounttransacties gecontroleerd.`}
              </p>
            )}
          </section>

          <section className="rounded-3xl border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <MessageSquareText className="text-pink-700" size={20} />
              <h3 className="font-semibold">
                {en ? "Reviewed public supporters" : "Beoordeelde publieke supporters"}
              </h3>
            </div>
            <div className="mt-5 space-y-3">
              {supporters.length === 0
                ? (
                    <p className="text-sm leading-6 text-slate-500">
                      {en
                        ? "No manually reviewed public supporter entries yet."
                        : "Nog geen handmatig beoordeelde publieke supporteritems."}
                    </p>
                  )
                : supporters.slice(0, 5).map((supporter, index) => (
                    <div key={`${supporter.account}-${index}`} className="rounded-2xl bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold">{supporter.name}</p>
                        <span className="text-xs font-semibold text-pink-700">{supporter.amountXrp} XRP</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{supporter.account}</p>
                    </div>
                  ))}
            </div>
          <section className="rounded-3xl border border-slate-200 p-6 bg-slate-50">
            <div className="flex items-center gap-3">
              <Mail className="text-blue-600" size={20} />
              <h3 className="font-semibold">{en ? "Official Contact & Inquiries" : "Officieel Contact & Vragen"}</h3>
            </div>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              {en
                ? "Questions about Make Waves, partnership opportunities or platform support?"
                : "Vragen over Make Waves, partnerships of platformondersteuning?"}
            </p>
            <a
              href="mailto:info@onthetrack.com"
              className="mt-4 inline-flex items-center gap-2 font-mono text-xs font-bold text-blue-700 hover:text-blue-900 bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-sm"
            >
              <Mail size={14} />
              <span>info@onthetrack.com</span>
            </a>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Pill({ text }: { text: string }) {
  return (
    <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm">
      {text}
    </span>
  );
}

function DarkMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}

function Info({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={17} />
      <span>{text}</span>
    </div>
  );
}
