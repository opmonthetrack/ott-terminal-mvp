import { useState } from "react";
import { useXrplMarketSnapshot } from "../lib/useXrplMarketSnapshot";

export function XrplTokenHeatmap({ isEnglish = true }: { isEnglish?: boolean }) {
  const { snapshot, state, refresh } = useXrplMarketSnapshot();
  const [search, setSearch] = useState("");
  const unknown = isEnglish ? "Unknown" : "Onbekend";
  const usd = (value: number | null) => value === null ? unknown : new Intl.NumberFormat(isEnglish ? "en-US" : "nl-NL", { style: "currency", currency: "USD", maximumSignificantDigits: 6 }).format(value);
  const tokens = snapshot?.tokens.filter(token => `${token.currency} ${token.name} ${token.issuer}`.toLowerCase().includes(search.toLowerCase())) ?? [];
  return <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 text-slate-950 sm:p-8">
    <h2 className="text-2xl font-semibold">{isEnglish ? "XRPL market observations" : "XRPL-marktgegevens"}</h2>
    <p className="mt-3 text-slate-600">{isEnglish ? "Up to 50 third-party records, ordered by reported 24-hour USD volume. Data may be delayed; missing values remain unknown. No swap and no signing request." : "Maximaal 50 gegevensrecords van externe bronnen, op gemeld 24-uursvolume in USD. Gegevens kunnen vertraagd zijn; ontbrekende waarden blijven onbekend. Geen swap en geen tekenverzoek."}</p>
    <div className="my-5 flex flex-wrap items-end gap-3">
      <label className="min-w-0 flex-1 text-sm font-medium">{isEnglish ? "Find a token or issuer" : "Zoek een token of issuer"}<input className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3" value={search} onChange={event => setSearch(event.target.value)} /></label>
      <button className="min-h-11 rounded-xl bg-blue-700 px-5 text-white disabled:opacity-60" disabled={state === "loading"} onClick={() => void refresh()}>{isEnglish ? "Refresh" : "Vernieuwen"}</button>
    </div>
    <div aria-live="polite" role="status" className="text-sm text-slate-600">
      {state === "loading" && (isEnglish ? "Loading market data…" : "Marktgegevens laden…")}
      {state === "error" && (isEnglish ? "Market data is unavailable. No estimated or fallback prices are shown. Try again later." : "Marktgegevens zijn niet beschikbaar. Er worden geen geschatte of vervangende prijzen getoond. Probeer het later opnieuw.")}
      {snapshot && `${snapshot.source} · ${isEnglish ? "Retrieved" : "Opgehaald"}: ${new Date(snapshot.fetchedAt).toLocaleString(isEnglish ? "en-GB" : "nl-NL")} · ${snapshot.tokens.length} ${isEnglish ? "records" : "records"}`}
    </div>
    {snapshot?.source === "XRPL.to API" && <a className="mt-3 inline-flex min-h-11 items-center text-blue-700 underline" href="https://xrpl.to/" target="_blank" rel="noopener noreferrer">Data by xrpl.to</a>}
    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tokens.map(token => <article key={token.id} className="min-w-0 rounded-2xl border border-slate-200 p-4 [overflow-wrap:anywhere]">
        <h3 className="font-semibold">{token.name}</h3><p className="text-sm text-slate-600">{token.currency}</p>
        <p className="mt-2 text-xs text-slate-600">{token.issuer}</p>
        <dl className="mt-4 space-y-2 text-sm">
          <div><dt>{isEnglish ? "Reported price (USD)" : "Gemelde prijs (USD)"}</dt><dd className="font-semibold">{usd(token.priceUsd)}</dd></div>
          <div><dt>{isEnglish ? "24h volume (USD)" : "24-uursvolume (USD)"}</dt><dd>{usd(token.volume24hUsd)}</dd></div>
          <div><dt>{isEnglish ? "Market cap (USD)" : "Marktkapitalisatie (USD)"}</dt><dd>{usd(token.marketCapUsd)}</dd></div>
          <div><dt>{isEnglish ? "Last trade" : "Laatste transactie"}</dt><dd>{token.lastTradeAt ? new Date(token.lastTradeAt).toLocaleString() : unknown}</dd></div>
        </dl>
      </article>)}
    </div>
    {state === "success" && tokens.length === 0 && <p>{isEnglish ? "No matching tokens." : "Geen passende tokens."}</p>}
  </section>;
}
