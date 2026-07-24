import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Loader2,
  QrCode,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";
import type { AccessPassClaim, XamanAccessPayload } from "../lib/accessPassOrderClient";
import {
  loadAccessPassIssuerQueue,
  loadAccessPassReadiness,
  runAccessPassIssuerAction,
  type AccessPassIssuerAction,
  type AccessPassReadiness,
} from "../lib/accessPassIssuerClient";
import { getOttAccountName } from "../lib/ottAuth";
import { useOttAuthSession } from "../lib/useOttAuthSession";

const ACTIONS: Record<string, Array<{ action: AccessPassIssuerAction; label: string }>> = {
  reserved: [{ action: "create-mint", label: "Mintpayload maken" }],
  failed: [{ action: "create-mint", label: "Mint opnieuw starten" }],
  "mint-signing": [{ action: "verify-mint", label: "Mint controleren" }],
  minted: [{ action: "create-offer", label: "Transfer-offer maken" }],
  "offer-signing": [{ action: "verify-offer", label: "Transfer-offer controleren" }],
};

function errorText(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "error" in error) {
    const value = (error as { error?: unknown }).error;
    if (typeof value === "string") return value;
  }
  return fallback;
}

function short(value: string | null | undefined) {
  if (!value) return "—";
  return value.length > 24 ? `${value.slice(0, 11)}…${value.slice(-9)}` : value;
}

function label(claim: AccessPassClaim) {
  return claim.serial || `#${String(claim.serial_number).padStart(3, "0")}`;
}

export function AccessPassIssuerConsole() {
  const { user, signedIn, loading: authLoading } = useOttAuthSession();
  const [queue, setQueue] = useState<AccessPassClaim[]>([]);
  const [readiness, setReadiness] = useState<AccessPassReadiness | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [payloads, setPayloads] = useState<Record<string, XamanAccessPayload>>({});
  const accountName = getOttAccountName(user);

  async function refresh() {
    if (!signedIn) return;
    setLoading(true);
    setError("");
    try {
      const readinessResponse = await loadAccessPassReadiness();
      const nextReadiness = readinessResponse.readiness ?? null;
      setReadiness(nextReadiness);

      if (!nextReadiness?.ready) {
        setQueue([]);
        return;
      }

      const response = await loadAccessPassIssuerQueue();
      setQueue(response.queue ?? []);
    } catch (nextError) {
      setError(errorText(nextError, "De Access Pass readiness of issuerqueue kon niet worden geladen."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading && signedIn) void refresh();
  }, [authLoading, signedIn]);

  async function run(claim: AccessPassClaim, action: AccessPassIssuerAction) {
    if (!readiness?.ready) {
      setError("Issueracties blijven geblokkeerd totdat alle verplichte readinesscontroles groen zijn.");
      return;
    }

    const key = `${claim.id}:${action}`;
    setBusy(key);
    setError("");
    try {
      const response = await runAccessPassIssuerAction(claim.id, action);
      if (response.payload) {
        setPayloads((current) => ({ ...current, [claim.id]: response.payload as XamanAccessPayload }));
      }
      await refresh();
    } catch (nextError) {
      setError(errorText(nextError, "De issueractie is mislukt."));
    } finally {
      setBusy("");
    }
  }

  const counts = useMemo(() => ({
    total: queue.length,
    reserved: queue.filter((item) => item.lifecycle_step === "reserved").length,
    pending: queue.filter((item) => item.status === "pending").length,
    issued: queue.filter((item) => item.status === "issued").length,
  }), [queue]);

  if (authLoading) return <FullScreen text="Founderaccount controleren…" loading />;
  if (!signedIn) return <FullScreen text="Log eerst in via de normale OTT-profielpagina en open daarna opnieuw ?founder=1&accessissuer=1." />;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <a href="/?founder=1" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft size={16} />Terug naar OTT Terminal</a>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-pink-300">Founder only</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Access Pass Alpha Issuer Queue</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">Ingelogd als {accountName || user?.email}. Alleen gevalideerde betalingen verschijnen met een gereserveerd nummer #001–#500.</p>
          </div>
          <button type="button" onClick={() => void refresh()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold hover:bg-white/5 disabled:opacity-50">{loading ? <Loader2 className="animate-spin" size={17} /> : <RefreshCcw size={17} />}Alles vernieuwen</button>
        </div>
      </header>

      <div data-page-region="true" className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <ReadinessPanel readiness={readiness} loading={loading} />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Totaal" value={counts.total} />
          <Stat label="Gereserveerd" value={counts.reserved} />
          <Stat label="In behandeling" value={counts.pending} />
          <Stat label="Uitgegeven" value={counts.issued} />
        </div>

        <div className="mt-7 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-5 text-sm leading-6 text-amber-100">
          <div className="flex gap-3"><ShieldCheck className="mt-0.5 shrink-0" size={19} /><p>De issuer-seed staat nergens in de app. Iedere mint en gratis doelgerichte transfer-offer wordt afzonderlijk in Xaman gecontroleerd en ondertekend. MAINNET blijft technisch geblokkeerd totdat de TESTNET-cyclus expliciet is goedgekeurd.</p></div>
        </div>

        {error && <p className="mt-6 rounded-2xl border border-red-300/20 bg-red-300/5 p-5 text-sm text-red-100">{error}</p>}

        <section className="mt-8 space-y-5">
          {!loading && readiness?.ready && queue.length === 0 && <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center text-slate-400">Nog geen gevalideerde Access Pass-betalingen in de queue.</div>}
          {!loading && readiness && !readiness.ready && <div className="rounded-3xl border border-amber-300/20 bg-amber-300/5 p-10 text-center text-amber-100">Issuerqueue en ondertekenknoppen blijven gesloten totdat alle verplichte controles hierboven groen zijn.</div>}
          {queue.map((claim) => {
            const actions = ACTIONS[claim.lifecycle_step] ?? [];
            const payload = payloads[claim.id];
            return (
              <article key={claim.id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-7">
                <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-semibold">OTT Access Pass: Alpha {label(claim)}</h2>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${claim.status === "issued" ? "bg-emerald-400/15 text-emerald-200" : claim.lifecycle_step === "failed" ? "bg-red-400/15 text-red-200" : "bg-blue-400/15 text-blue-200"}`}>{claim.lifecycle_step}</span>
                    </div>
                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                      <Detail label="Ontvangende wallet" value={short(claim.wallet_address)} />
                      <Detail label="NFTokenID" value={short(claim.nftoken_id)} />
                      <Detail label="Metadata" value={short(claim.metadata_uri)} />
                    </div>
                    {claim.error_message && <p className="mt-5 rounded-xl border border-red-300/20 bg-red-300/5 p-4 text-sm text-red-100">{claim.error_message}</p>}
                    {payload && (
                      <div className="mt-6 grid gap-5 rounded-2xl border border-blue-300/20 bg-blue-300/5 p-5 md:grid-cols-[180px_1fr]">
                        <div className="flex h-[180px] items-center justify-center rounded-xl bg-white p-3">{payload.refs?.qr_png ? <img src={payload.refs.qr_png} alt="Xaman signing QR" className="h-full w-full object-contain" /> : <QrCode className="text-slate-900" size={72} />}</div>
                        <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">Xaman sign request</p><p className="mt-3 text-sm leading-6 text-slate-300">Controleer transactietype, issueraccount, metadata-URI of NFTokenID en de doelwallet vóór ondertekening.</p>{payload.next?.always && <a href={payload.next.always} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950">Open in Xaman <ExternalLink size={16} /></a>}</div>
                      </div>
                    )}
                  </div>

                  <div className="w-full space-y-3 xl:w-64">
                    {actions.map(({ action, label: actionLabel }) => {
                      const key = `${claim.id}:${action}`;
                      return <button key={action} type="button" onClick={() => void run(claim, action)} disabled={Boolean(busy) || !readiness?.ready} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-100 disabled:opacity-50">{busy === key ? <Loader2 className="animate-spin" size={17} /> : action.startsWith("verify") ? <CheckCircle2 size={17} /> : <ShieldCheck size={17} />}{actionLabel}</button>;
                    })}
                    {claim.status === "issued" && <div className="flex items-start gap-3 rounded-xl bg-emerald-400/10 p-4 text-sm text-emerald-100"><CheckCircle2 className="mt-0.5 shrink-0" size={18} />XRPL-eigendom is bevestigd.</div>}
                    {actions.length === 0 && claim.status !== "issued" && <div className="rounded-xl border border-white/10 p-4 text-sm leading-6 text-slate-400">{["offer-created", "accept-signing"].includes(claim.lifecycle_step) ? "Wachten op acceptatie door de klant." : "Geen founderactie nodig in deze stap."}</div>}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </div>
  );
}

function ReadinessPanel({ readiness, loading }: { readiness: AccessPassReadiness | null; loading: boolean }) {
  const readyLabel = readiness?.safeForMainnet
    ? "MAINNET READY"
    : readiness?.safeToTest
      ? "TESTNET READY"
      : "SETUP GEBLOKKEERD";
  const ready = Boolean(readiness?.safeForMainnet || readiness?.safeToTest);

  return (
    <section className={`rounded-3xl border p-6 sm:p-8 ${ready ? "border-emerald-300/25 bg-emerald-300/5" : "border-amber-300/20 bg-amber-300/5"}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Launch readiness</p>
          <h2 className="mt-2 text-2xl font-semibold">{loading && !readiness ? "Configuratie controleren…" : readyLabel}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">Netwerk: {readiness?.network ?? "onbekend"}. Secrets worden nooit weergegeven; alleen aanwezigheid, databaseonderdelen en veiligheidsblokkades worden gecontroleerd.</p>
        </div>
        <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold ${ready ? "bg-emerald-400/15 text-emerald-200" : "bg-amber-400/15 text-amber-100"}`}>
          {loading ? <Loader2 className="animate-spin" size={16} /> : ready ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          {readyLabel}
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {(readiness?.checks ?? []).map((check) => (
          <div key={check.id} className={`rounded-2xl border p-4 ${check.ok ? "border-emerald-300/15 bg-emerald-300/5" : check.blocking ? "border-red-300/20 bg-red-300/5" : "border-amber-300/15 bg-amber-300/5"}`}>
            <div className="flex items-start gap-3">
              {check.ok ? <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-300" size={18} /> : <AlertTriangle className={`mt-0.5 shrink-0 ${check.blocking ? "text-red-300" : "text-amber-300"}`} size={18} />}
              <div><p className="text-sm font-semibold">{check.label}</p><p className="mt-1 text-xs leading-5 text-slate-400">{check.detail}</p></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-3xl font-semibold">{value}</p></div>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs text-slate-500">{label}</p><p className="mt-1 break-all text-sm font-semibold text-slate-200">{value}</p></div>;
}

function FullScreen({ text, loading = false }: { text: string; loading?: boolean }) {
  return <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white"><div className="max-w-xl rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">{loading && <Loader2 className="mx-auto mb-5 animate-spin" size={28} />}<p className="text-sm leading-7 text-slate-300">{text}</p>{!loading && <a href="/?founder=1" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950"><ArrowLeft size={16} />Terug</a>}</div></div>;
}
