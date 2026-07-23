import { useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  Database,
  ExternalLink,
  KeyRound,
  Loader2,
  Search,
  ShieldAlert,
  ShieldCheck,
  Users,
  Waves,
} from "lucide-react";
import { auditXrplIssuer, type IssuerAuditResponse } from "../lib/issuerAuditClient";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

const ADDRESS = /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/;
const CURRENCY = /^(?:[A-Za-z0-9?!@#$%^&*<>()[\]{}|]{3}|[0-9A-Fa-f]{40})$/;

export function IssuerResearchAudit() {
  const { language } = useTerminalLanguage();
  const en = language === "en";
  const [issuer, setIssuer] = useState("");
  const [currency, setCurrency] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<IssuerAuditResponse | null>(null);

  async function runAudit() {
    const cleanIssuer = issuer.trim();
    const cleanCurrency = currency.trim().toUpperCase();

    if (!ADDRESS.test(cleanIssuer)) {
      setError(en ? "Enter a valid XRPL issuer r-address." : "Voer een geldig XRPL issuer-r-adres in.");
      return;
    }
    if (!CURRENCY.test(cleanCurrency)) {
      setError(en ? "Use a 3-character or 40-hex XRPL currency code." : "Gebruik een XRPL-currencycode van 3 tekens of 40 hextekens.");
      return;
    }

    setBusy(true);
    setError("");
    setResult(null);
    try {
      setResult(await auditXrplIssuer(cleanIssuer, cleanCurrency));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : (en ? "Issuer audit failed." : "Issueranalyse is mislukt."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8 sm:py-16">
        <div className="flex flex-col gap-7 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
              <Database size={17} /> OTT Issuer Research · Live XRPL
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              {en ? "Inspect the issuer before judging the token." : "Onderzoek de issuer voordat je het token beoordeelt."}
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
              {en
                ? "This read-only audit combines validated account settings, blackhole indicators, issuer obligations, trustline holders, XRP order books, AMM data and recent transactions. It forms the ledger-evidence category of the 0–100 OTT Research Score."
                : "Deze read-onlyanalyse combineert gevalideerde accountinstellingen, blackhole-indicatoren, issuerverplichtingen, trustlinehouders, XRP-orderboeken, AMM-data en recente transacties. Dit vormt de ledgerbewijscategorie van de OTT Research Score van 0–100%."}
            </p>
          </div>
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 xl:w-80">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-700">OTT Research Score</p>
            <p className="mt-2 text-3xl font-semibold">20 / 100</p>
            <p className="mt-2 text-sm leading-6 text-blue-950">
              {en
                ? "Issuer and ledger evidence is one category. Legal identity, documents, execution and market evidence are still required before any final score."
                : "Issuer- en ledgerbewijs is één categorie. Juridische identiteit, documenten, uitvoering en marktgegevens blijven nodig voor een eindscore."}
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-4 sm:p-6">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto]">
            <label>
              <span className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-500">Issuer wallet</span>
              <input
                value={issuer}
                onChange={(event) => setIssuer(event.target.value)}
                placeholder="r..."
                spellCheck={false}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
            <label>
              <span className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-500">Currency</span>
              <input
                value={currency}
                onChange={(event) => setCurrency(event.target.value.toUpperCase())}
                placeholder="USD or 40-hex"
                spellCheck={false}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
            <button
              type="button"
              onClick={() => void runAudit()}
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 lg:self-end"
            >
              {busy ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
              {busy ? (en ? "Auditing…" : "Onderzoeken…") : (en ? "Audit issuer" : "Onderzoek issuer")}
            </button>
          </div>
          {error && <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">{error}</p>}
        </div>

        {!result && !busy && (
          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Preview icon={ShieldCheck} title={en ? "Account controls" : "Accountcontroles"} text={en ? "Master key, regular key, flags, signer list and delegates." : "Master key, regular key, flags, signerlist en delegates."} />
            <Preview icon={Users} title={en ? "Holders" : "Houders"} text={en ? "Trustline count, balances, concentration indicators and scan completeness." : "Trustlineaantal, saldi, concentratie-indicatoren en volledigheid."} />
            <Preview icon={Waves} title={en ? "Liquidity" : "Liquiditeit"} text={en ? "Funded XRP books, best bid/ask, spread and AMM reserves." : "Gefinancierde XRP-boeken, beste bid/ask, spread en AMM-reserves."} />
            <Preview icon={BookOpen} title={en ? "Evidence boundary" : "Bewijsgrens"} text={en ? "Observed ledger facts are separated from ownership or legal assumptions." : "Waargenomen ledgerfeiten worden gescheiden van eigendoms- of juridische aannames."} />
          </div>
        )}

        {result && <IssuerAuditResult result={result} en={en} />}
      </div>
    </section>
  );
}

function IssuerAuditResult({ result, en }: { result: IssuerAuditResponse; en: boolean }) {
  const flags = Object.entries(result.account.flags).filter(([, active]) => active);
  const blackholeTone = result.blackhole.status === "conditions-met"
    ? "border-emerald-200 bg-emerald-50"
    : result.blackhole.status === "incomplete"
      ? "border-amber-200 bg-amber-50"
      : "border-rose-200 bg-rose-50";

  return (
    <div className="mt-8 space-y-6">
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-700">{result.currency}</p>
              <h3 className="mt-2 break-all text-xl font-semibold">{result.issuer}</h3>
              <p className="mt-2 text-xs text-slate-500">Ledger {result.ledgerIndex ?? "—"} · {new Date(result.checkedAt).toLocaleString()}</p>
            </div>
            <a
              href={`https://livenet.xrpl.org/accounts/${result.issuer}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
            >
              XRPL explorer <ExternalLink size={16} />
            </a>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="XRP balance" value={`${result.account.balanceXrp} XRP`} />
            <Metric label={en ? "Owner objects" : "Ownerobjecten"} value={String(result.account.ownerCount)} />
            <Metric label={en ? "Token obligation" : "Tokenverplichting"} value={result.token.obligation ?? "—"} />
            <Metric label={en ? "Observed holders" : "Waargenomen houders"} value={`${result.token.holderCount}${result.token.holderScanComplete ? "" : "+"}`} />
          </div>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{en ? "Active account flags" : "Actieve accountflags"}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {flags.length > 0
                ? flags.map(([flag]) => <span key={flag} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold">{flag}</span>)
                : <span className="text-sm text-slate-500">{en ? "No active flags reported." : "Geen actieve flags gerapporteerd."}</span>}
            </div>
          </div>
        </section>

        <section className={`rounded-3xl border p-6 ${blackholeTone}`}>
          <div className="flex items-start gap-3">
            {result.blackhole.status === "conditions-met"
              ? <BadgeCheck className="mt-0.5 shrink-0 text-emerald-700" size={25} />
              : <ShieldAlert className="mt-0.5 shrink-0 text-amber-800" size={25} />}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">Blackhole assessment</p>
              <h3 className="mt-2 text-xl font-semibold">
                {result.blackhole.status === "conditions-met"
                  ? (en ? "Checkable conditions met" : "Controleerbare voorwaarden kloppen")
                  : result.blackhole.status === "incomplete"
                    ? (en ? "Incomplete evidence" : "Onvolledig bewijs")
                    : (en ? "Not established" : "Niet vastgesteld")}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-700">{result.blackhole.explanation}</p>
            </div>
          </div>
          <div className="mt-5 space-y-2">
            <Condition label="Master key disabled" value={result.blackhole.disableMaster} />
            <Condition label="Known blackhole RegularKey" value={result.blackhole.regularKeyIsKnownBlackhole} />
            <Condition label="No signer list" value={result.blackhole.noSignerList} />
            <Condition label="No delegates" value={result.blackhole.noDelegates} />
            <Condition label="Object scan complete" value={result.blackhole.accountObjectsComplete} />
          </div>
          <p className="mt-5 break-all rounded-xl bg-white/60 p-3 font-mono text-xs text-slate-700">
            RegularKey: {result.account.regularKey ?? "—"}
          </p>
        </section>
      </div>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3"><Users className="text-blue-700" size={21} /><h3 className="text-xl font-semibold">{en ? "Largest observed holders" : "Grootste waargenomen houders"}</h3></div>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            {en ? "Trustline balances are public ledger observations. Similar behavior or funding does not prove common ownership." : "Trustlinesaldi zijn openbare ledgerwaarnemingen. Vergelijkbaar gedrag of financiering bewijst geen gezamenlijk eigendom."}
          </p>
          <div className="mt-5 space-y-3">
            {result.token.topHolders.length > 0 ? result.token.topHolders.map((holder, index) => (
              <div key={holder.account} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-slate-500">#{index + 1}</span>
                  <span className="font-mono text-sm font-semibold">{holder.balance} {result.currency}</span>
                </div>
                <p className="mt-2 break-all font-mono text-xs text-slate-600">{holder.account}</p>
                <div className="mt-2 flex gap-2 text-[11px] text-slate-500">
                  {holder.freeze && <span className="rounded bg-amber-100 px-2 py-1 text-amber-800">frozen</span>}
                  {holder.authorized === true && <span className="rounded bg-blue-100 px-2 py-1 text-blue-800">authorized</span>}
                </div>
              </div>
            )) : <p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">{en ? "No non-zero holder balances found in the returned trustlines." : "Geen niet-nulhouders gevonden in de geretourneerde trustlines."}</p>}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3"><Waves className="text-blue-700" size={21} /><h3 className="text-xl font-semibold">{en ? "XRP liquidity" : "XRP-liquiditeit"}</h3></div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Metric label="Best bid" value={formatPrice(result.liquidity.orderBook.bestBidXrp)} />
            <Metric label="Best ask" value={formatPrice(result.liquidity.orderBook.bestAskXrp)} />
            <Metric label="Spread" value={result.liquidity.orderBook.spreadPercent === null ? "—" : `${result.liquidity.orderBook.spreadPercent.toFixed(2)}%`} />
            <Metric label={en ? "Funded offers" : "Gefinancierde offers"} value={`${result.liquidity.orderBook.bidCount} / ${result.liquidity.orderBook.askCount}`} />
          </div>
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold">AMM</p>
            {result.liquidity.amm.exists ? (
              <div className="mt-3 grid gap-2 text-sm text-slate-600">
                <p>XRP: <strong>{result.liquidity.amm.xrpAmount ?? "—"}</strong></p>
                <p>{result.currency}: <strong>{result.liquidity.amm.tokenAmount ?? "—"}</strong></p>
                <p>{en ? "Trading fee" : "Trading fee"}: <strong>{result.liquidity.amm.tradingFee ?? "—"}</strong></p>
              </div>
            ) : <p className="mt-2 text-sm text-slate-600">{result.liquidity.amm.error || (en ? "No XRP AMM found." : "Geen XRP-AMM gevonden.")}</p>}
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-500">
            {en ? "Visible liquidity is not a guarantee that a large order can exit near the displayed price." : "Zichtbare liquiditeit garandeert niet dat een grote order rond de getoonde prijs kan uitstappen."}
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-3"><KeyRound className="text-blue-700" size={21} /><h3 className="text-xl font-semibold">{en ? "Recent issuer transactions" : "Recente issuertransacties"}</h3></div>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-[760px] w-full text-left text-sm">
            <thead><tr className="border-b border-slate-200 text-xs uppercase tracking-[0.12em] text-slate-500"><th className="pb-3">Type</th><th className="pb-3">Result</th><th className="pb-3">Ledger</th><th className="pb-3">Date</th><th className="pb-3">Hash</th></tr></thead>
            <tbody>
              {result.recentTransactions.map((tx) => (
                <tr key={tx.hash} className="border-b border-slate-100">
                  <td className="py-3 font-semibold">{tx.type}</td>
                  <td className="py-3">{tx.result}</td>
                  <td className="py-3">{tx.ledgerIndex ?? "—"}</td>
                  <td className="py-3">{tx.date ? new Date(tx.date).toLocaleDateString() : "—"}</td>
                  <td className="py-3"><a href={`https://livenet.xrpl.org/transactions/${tx.hash}`} target="_blank" rel="noreferrer" className="font-mono text-xs text-blue-700 hover:underline">{short(tx.hash)}</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
        <div className="flex gap-3"><AlertTriangle className="mt-0.5 shrink-0 text-amber-800" size={22} /><div><h3 className="font-semibold text-amber-950">{en ? "What this audit does not prove" : "Wat deze analyse niet bewijst"}</h3><div className="mt-3 space-y-2">{result.limitations.map((item) => <p key={item} className="text-sm leading-6 text-amber-900">• {item}</p>)}</div></div></div>
      </section>
    </div>
  );
}

function Preview({ icon: Icon, title, text }: { icon: typeof ShieldCheck; title: string; text: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5"><Icon size={21} className="text-blue-700" /><p className="mt-4 font-semibold">{title}</p><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></div>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 break-all font-semibold">{value}</p></div>;
}

function Condition({ label, value }: { label: string; value: boolean }) {
  return <div className="flex items-center justify-between gap-3 rounded-xl bg-white/60 px-3 py-2 text-sm"><span>{label}</span>{value ? <CheckCircle2 className="text-emerald-700" size={17} /> : <AlertTriangle className="text-amber-700" size={17} />}</div>;
}

function short(value: string) {
  return value.length > 22 ? `${value.slice(0, 10)}…${value.slice(-8)}` : value;
}

function formatPrice(value: number | null) {
  if (value === null || !Number.isFinite(value)) return "—";
  if (value >= 1) return `${value.toFixed(6)} XRP`;
  return `${value.toPrecision(6)} XRP`;
}
