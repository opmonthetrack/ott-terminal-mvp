import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Dna, Loader2, RefreshCw, Search } from "lucide-react";
import { dnaAssetKey, dnaSymbol, quoteAgeWalletDna, scanAgeWalletDna, type DnaQuote, type DnaScan } from "../lib/ageWalletDna";
import type { XrplNetwork } from "../lib/walletRegistry";
import "./age-wallet-dna.css";

type Props = {
  account?: string; network?: XrplNetwork; language?: "en" | "nl";
  lockedContext?: boolean; onBack?: () => void;
  initialScan?: DnaScan | null; onScan?: (scan: DnaScan | null) => void;
};
export function AgeWalletDna({ account = "", network = "mainnet", language = "en", lockedContext = false, onBack, initialScan, onScan }: Props) {
  const en = language === "en";
  const text = (english: string, dutch: string) => en ? english : dutch;
  const message = (value: string) => en ? value : ({
    "Enter a public XRPL r-address.": "Voer een openbaar XRPL-walletadres in dat met r begint.",
    "Weighted average from validated wallet history, including directly attributable purchase fees.": "Gewogen gemiddelde uit gevalideerde wallethistorie, inclusief direct toe te rekenen aankoopkosten.",
    "The scan limit was reached or the history service is unavailable.": "De scanlimiet is bereikt of de dienst voor transactiehistorie is niet beschikbaar.",
    "The available history does not establish a complete opening balance.": "De beschikbare historie onderbouwt geen volledig beginsaldo.",
    "The reconstructed holdings do not match the ledger balance.": "Het berekende bezit komt niet overeen met het saldo op de ledger.",
    "An incoming transfer or unsupported acquisition has an unknown purchase cost.": "De aankoopkosten van een ontvangst of niet-ondersteunde aankoop zijn onbekend.",
    "The public XRPL server is busy. Wait at least a minute before trying again.": "De openbare XRPL-server is druk. Wacht minstens een minuut voordat je opnieuw probeert.",
    "XRPL did not answer in time. Try again.": "De XRPL-server antwoordde niet op tijd. Probeer opnieuw.",
    "Could not reach the selected XRP Ledger": "De geselecteerde XRP Ledger is niet bereikbaar.",
    "Wallet holdings changed or are restricted. Run a new scan.": "Het bezit is gewijzigd of heeft beperkingen. Voer een nieuwe scan uit.",
    "Issuer Global Freeze is active": "De uitgever heeft alle tegoeden bevroren.",
    "Issuer authorization has not been established": "Toestemming van de uitgever is niet vastgesteld.",
  } as Record<string, string>)[value] ?? value;
  const [address, setAddress] = useState(account === "guest" ? "" : account);
  const [selectedNetwork, setSelectedNetwork] = useState<XrplNetwork>(network);
  const [scan, setScan] = useState<DnaScan | null>(initialScan?.account === account && initialScan.network === network ? initialScan : null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [quotes, setQuotes] = useState<Record<string, DnaQuote>>({});
  const [quoteErrors, setQuoteErrors] = useState<Record<string, string>>({});
  const [quoting, setQuoting] = useState("");
  const scanAbort = useRef<AbortController | null>(null);
  const quoteAbort = useRef<AbortController | null>(null);
  const generation = useRef(0);
  const previousContext = useRef({ account, network });

  function clearResult() {
    generation.current++;
    scanAbort.current?.abort(); quoteAbort.current?.abort();
    setScan(null); onScan?.(null); setQuotes({}); setQuoteErrors({}); setQuoting(""); setBusy(false); setError("");
  }
  useEffect(() => {
    if (previousContext.current.account !== account || previousContext.current.network !== network) {
      previousContext.current = { account, network };
      clearResult(); setAddress(account === "guest" ? "" : account); setSelectedNetwork(network);
    }
  }, [account, network]);
  useEffect(() => () => { generation.current++; scanAbort.current?.abort(); quoteAbort.current?.abort(); }, []);

  async function runScan() {
    clearResult();
    const current = generation.current;
    const controller = new AbortController();
    scanAbort.current = controller;
    setBusy(true);
    try {
      const result = await scanAgeWalletDna(address, selectedNetwork, controller.signal);
      if (current !== generation.current) return;
      setScan(result); onScan?.(result);
    } catch (failure) {
      if (current === generation.current && !controller.signal.aborted) setError(failure instanceof Error ? failure.message : "Scan failed");
    } finally { if (current === generation.current) setBusy(false); }
  }
  async function loadQuote(asset: DnaScan["assets"][number]) {
    if (!scan) return;
    const key = dnaAssetKey(asset.currency, asset.issuer);
    const current = generation.current;
    quoteAbort.current?.abort();
    const controller = new AbortController();
    quoteAbort.current = controller;
    setQuoting(key);
    setQuotes(value => { const next = { ...value }; delete next[key]; return next; });
    setQuoteErrors(value => { const next = { ...value }; delete next[key]; return next; });
    try {
      const quote = await quoteAgeWalletDna(scan, asset, controller.signal);
      if (current === generation.current && !controller.signal.aborted) setQuotes(value => ({ ...value, [key]: quote }));
    } catch (failure) {
      if (current === generation.current && !controller.signal.aborted) setQuoteErrors(value => ({ ...value, [key]: failure instanceof Error ? failure.message : "Quote unavailable" }));
    } finally { if (current === generation.current && !controller.signal.aborted) setQuoting(""); }
  }
  const knownCount = scan?.assets.filter(asset => asset.basis.status === "known").length ?? 0;
  return <section className="age-dna" aria-labelledby="age-dna-title">
    {onBack && <button type="button" className="dna-back" onClick={onBack}><ArrowLeft size={18} />{text("Back", "Terug")}</button>}
    <header className="dna-header">
      <div className="dna-mark"><Dna size={30} aria-hidden="true" /></div>
      <div>
        <p className="dna-eyebrow">AGE · Adaptive Grid Engine</p>
        <h1 id="age-dna-title">Wallet DNA</h1>
        <p>{text("Understand what you paid. See what current bids can cover.", "Begrijp wat je hebt betaald. Bekijk wat huidige biedingen kunnen opbrengen.")}</p>
      </div>
    </header>
    <p className="dna-intro">{text(
      "Read your public XRPL holdings and acquisition evidence. This tool does not connect a signer or place orders.",
      "Bekijk je openbare XRPL-bezittingen en aankoopbewijs. Deze tool koppelt geen ondertekenaar en plaatst geen orders.",
    )}</p>
    <form className="dna-form" onSubmit={event => { event.preventDefault(); void runScan(); }}>
      <label>{text("Public wallet address", "Openbaar walletadres")}
        <input value={address} onChange={event => { clearResult(); setAddress(event.target.value); }} readOnly={lockedContext}
          placeholder="r…" autoComplete="off" spellCheck={false} aria-describedby="dna-context" required />
      </label>
      <label>{text("Network", "Netwerk")}
        <select value={selectedNetwork} disabled={lockedContext} onChange={event => { clearResult(); setSelectedNetwork(event.target.value as XrplNetwork); }}>
          <option value="mainnet">XRPL Mainnet</option><option value="testnet">XRPL Testnet</option><option value="devnet">XRPL Devnet</option>
        </select>
      </label>
      <button className="dna-primary" type="submit" disabled={busy || !address}>
        {busy ? <Loader2 size={18} className="dna-spin" /> : <Search size={18} />}
        {busy ? text("Reading ledger…", "Ledger lezen…") : text("Scan Wallet DNA", "Scan Wallet DNA")}
      </button>
    </form>
    <p id="dna-context" className="dna-muted">{lockedContext
      ? text("Account and network come from Xaman. No seed or signing request is needed.", "Account en netwerk komen uit Xaman. Er is geen seed of ondertekenverzoek nodig.")
      : text("Public addresses only. Never enter recovery words or private keys.", "Alleen openbare adressen. Voer nooit herstelwoorden of privésleutels in.")}</p>
    {error && <p className="dna-error" role="alert">{message(error)}</p>}
    <div aria-live="polite" role="status">{busy && <p className="dna-note">{text("Reading holdings and up to four history pages. Older or transferred holdings may have an unknown purchase price.", "Bezittingen en maximaal vier pagina’s historie worden gelezen. Bij oudere of ontvangen tokens kan de aankoopprijs onbekend blijven.")}</p>}</div>
    {scan && <>
      <div className="dna-summary">
        <div><span>{text("XRP balance", "XRP-saldo")}</span><strong>{scan.xrpBalance} XRP</strong></div>
        <div><span>{text("Positive token balances", "Positieve tokensaldi")}</span><strong>{scan.assets.length}{scan.assetsPartial ? "+" : ""}</strong></div>
        <div><span>{text("Purchase costs established", "Aankoopkosten onderbouwd")}</span><strong>{knownCount} / {scan.assets.length}</strong></div>
      </div>
      <p className="dna-muted">{scan.network.toUpperCase()} · Ledger {scan.ledger} · {text("Observed", "Gemeten")} {new Date(scan.scannedAt).toLocaleString(language)}
        <br />{scan.historyCount} {text("transactions inspected", "transacties bekeken")} · {text("Weighted-average cost in XRP", "Gewogen gemiddelde aankoopkosten in XRP")}</p>
      {(!scan.historyComplete || scan.assetsPartial) && <p className="dna-note">{text("This scan is partial. Missing data is not a zero balance or a zero purchase price.", "Deze scan is gedeeltelijk. Ontbrekende gegevens betekenen geen nulsaldo of aankoopprijs van nul.")}</p>}
      {!scan.assets.length && <p className="dna-note">{text("No positive issued-token balances were found in the loaded trustlines.", "In de geladen trustlines zijn geen positieve tokensaldi gevonden.")}</p>}
      <div className="dna-assets">{scan.assets.map(asset => {
        const key = dnaAssetKey(asset.currency, asset.issuer);
        const quote = quotes[key];
        return <article className="dna-asset" key={key}>
          <div className="dna-asset-heading"><h2>{dnaSymbol(asset.currency)}</h2><span>{asset.balance} {text("tokens", "tokens")}</span></div>
          <p className="dna-identity">{text("Issuer", "Uitgever")}: {asset.issuer}<br />{text("Currency code", "Valutacode")}: {asset.currency}</p>
          <dl className="dna-values">
            <div><dt>{text("Average purchase cost", "Gemiddelde aankoopkosten")}</dt><dd>{asset.basis.averageCostXrp === null ? text("Unknown", "Onbekend") : asset.basis.averageCostXrp + " XRP"}</dd></div>
            <div><dt>{text("Cost of current holdings", "Kosten huidige bezit")}</dt><dd>{asset.basis.totalCostXrp === null ? text("Unknown", "Onbekend") : asset.basis.totalCostXrp + " XRP"}</dd></div>
          </dl>
          {asset.frozen && <p className="dna-note">{text("A trustline freeze flag is present. A sale estimate is unavailable.", "Er staat een freeze-vlag op de trustline. Een verkoopschatting is niet beschikbaar.")}</p>}
          <details><summary>{text("Why this purchase-cost status?", "Waarom deze aankoopstatus?")}</summary>
            <p>{message(asset.basis.reason)}</p>
            <p>{text("Transfers and airdrops do not establish what you paid elsewhere. A partial history cannot establish the cost of the whole position.", "Ontvangsten en airdrops bewijzen niet wat je ergens anders hebt betaald. Gedeeltelijke historie bewijst niet de kosten van je hele positie.")}</p>
            {asset.basis.observedPurchases.length > 0 && <><h3>{text("Recent purchases observed in this scan", "Recente aankopen in deze scan")}</h3>
              <ul>{asset.basis.observedPurchases.map(buy => <li key={buy.hash}>{buy.quantity} {text("tokens for", "tokens voor")} {buy.costXrp} XRP <span className="dna-hash">{buy.hash}</span></li>)}</ul>
              <p>{text("These purchases are evidence, not automatically the cost of all remaining tokens.", "Deze aankopen zijn bewijs, maar vormen niet automatisch de aankoopkosten van alle resterende tokens.")}</p></>}
          </details>
          <button type="button" className="dna-secondary" onClick={() => void loadQuote(asset)} disabled={Boolean(quoting) || asset.frozen || busy}>
            {quoting === key ? <Loader2 size={17} className="dna-spin" /> : <RefreshCw size={17} />}
            {text("Check current bids", "Bekijk huidige biedingen")}
          </button>
          {quoteErrors[key] && <p className="dna-error" role="alert">{message(quoteErrors[key])}</p>}
          {quote && <div className="dna-quote">
            <h3>{text("Order-book estimate", "Schatting uit het orderboek")}</h3>
            <dl className="dna-values">
              <div><dt>{text("Holdings covered by sampled bids", "Bezit gedekt door bekeken biedingen")}</dt><dd>{quote.coveredTokens} / {quote.requestedTokens}</dd></div>
              <div><dt>{text("Gross XRP in sampled bids", "Bruto XRP in bekeken biedingen")}</dt><dd>{quote.grossXrp} XRP</dd></div>
              <div><dt>{text("Estimated network fee", "Geschatte netwerkkosten")}</dt><dd>{quote.feeXrp} XRP</dd></div>
              <div><dt>{text("Estimated net proceeds, full position", "Geschatte netto-opbrengst, hele positie")}</dt><dd>{quote.fullCoverage ? quote.netXrp + " XRP" : text("Insufficient sampled depth", "Onvoldoende bekeken biedingen")}</dd></div>
              <div><dt>{text("Estimated gain / loss", "Geschatte winst / verlies")}</dt><dd>{quote.estimatedPnlXrp === null ? text("Not established", "Niet vast te stellen") : quote.estimatedPnlXrp + " XRP"}</dd></div>
            </dl>
            {quote.estimatedPnlPercent !== null && <p>{new Intl.NumberFormat(language, { maximumFractionDigits: 2 }).format(Number(quote.estimatedPnlPercent))}% {text("relative to the reconstructed XRP cost", "ten opzichte van de gereconstrueerde XRP-kosten")}</p>}
            <p className="dna-muted">Ledger {quote.ledger} · {new Date(quote.quotedAt).toLocaleString(language)}</p>
            <p>{text("Direct XRP bids only; the issuer transfer rate and one estimated network fee are included. AMM paths and later market changes are not included. This is an estimate, not an executable quote or a prediction.", "Alleen directe XRP-biedingen; de overdrachtsfactor van de uitgever en één geschatte netwerkfee zijn meegenomen. AMM-routes en latere marktveranderingen niet. Dit is een schatting, geen uitvoerbare offerte of voorspelling.")}</p>
          </div>}
        </article>;
      })}</div>
    </>}
    <aside className="dna-about">
      <p className="dna-eyebrow">{text("Built from AGE's Wallet DNA concept", "Gebouwd vanuit AGE’s Wallet DNA-concept")}</p>
      <h2>{text("Your first step into AGE", "Je eerste stap naar AGE")}</h2>
      <p>{text("Adaptive Grid Engine brings wallet evidence, capital limits and strategy testing together. OTT introduces the analysis: understand your holdings and the limits of the available evidence before choosing your next step.", "Adaptive Grid Engine brengt walletbewijs, kapitaallimieten en strategietests samen. In OTT begin je met de analyse: begrijp je bezit en de grenzen van het beschikbare bewijs voordat je een volgende stap kiest.")}</p>
      <p className="dna-muted">{text("AGE and OTT are products by OnTheTrack. This tool is independent of Xaman. Trading and AGE access are separate from this read-only scan.", "AGE en OTT zijn producten van OnTheTrack. Deze tool is onafhankelijk van Xaman. Handelen en toegang tot AGE staan los van deze alleen-lezen scan.")}</p>
    </aside>
  </section>;
}
