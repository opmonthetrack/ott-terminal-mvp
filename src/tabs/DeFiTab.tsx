import { useMemo, useState, type ElementType } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Database,
  ExternalLink,
  FileCheck2,
  FileSearch,
  FolderLock,
  Globe2,
  Landmark,
  Layers,
  Loader2,
  Search,
  ShieldAlert,
  ShieldCheck,
  Upload,
  Wallet,
  XCircle,
} from "lucide-react";
import { DEFI_DIRECTORY, type DefiDirectoryCategory, type DefiDirectoryEntry } from "../lib/defiDirectory";
import {
  getLocalResearchEvidence,
  uploadResearchEvidence,
  type ResearchEvidenceKind,
} from "../lib/researchEvidenceStore";
import {
  analyzeXrplToken,
  type TokenResearchCategory,
  type TokenResearchResult,
} from "../lib/xrplTokenResearch";
import { useOttAuthSession } from "../lib/useOttAuthSession";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

type LabView = "research" | "directory" | "evidence";

const categoryLabels: Record<DefiDirectoryCategory | "all", { en: string; nl: string }> = {
  all: { en: "All", nl: "Alles" },
  yield: { en: "Yield and credit", nl: "Yield en krediet" },
  dex: { en: "DEX and liquidity", nl: "DEX en liquiditeit" },
  analytics: { en: "Analytics", nl: "Analyse" },
  nft: { en: "NFT", nl: "NFT" },
  xahau: { en: "Xahau", nl: "Xahau" },
};

function isXrplAddress(value: string) {
  return /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(value.trim());
}

function getProjectKey(currency: string, issuer: string) {
  const token = currency.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") || "token";
  const account = issuer.trim().slice(0, 12).toLowerCase() || "issuer";
  return `${token}-${account}`;
}

export function DeFiTab() {
  const { language } = useTerminalLanguage();
  const isEnglish = language === "en";
  const [view, setView] = useState<LabView>("research");

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <section className="border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
              {isEnglish ? "Token Research & DeFi Lab" : "Tokenonderzoek & DeFi Lab"}
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              {isEnglish
                ? "Investigate claims before you connect, trust or transact."
                : "Onderzoek claims voordat je koppelt, vertrouwt of handelt."}
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
              {isEnglish
                ? "OTT separates validated XRPL observations, supplied documents and human claims. The lab reports mismatches and uncertainty without declaring a project safe, fraudulent or suitable as an investment."
                : "OTT scheidt gevalideerde XRPL-observaties, aangeleverde documenten en menselijke claims. Het lab rapporteert afwijkingen en onzekerheid zonder een project veilig, frauduleus of geschikt als investering te noemen."}
            </p>
          </div>

          <div className="mt-9 flex flex-wrap gap-2" role="tablist" aria-label="Research lab views">
            <ViewButton active={view === "research"} icon={FileSearch} label={isEnglish ? "Token research" : "Tokenonderzoek"} onClick={() => setView("research")} />
            <ViewButton active={view === "directory"} icon={Globe2} label={isEnglish ? "DeFi directory" : "DeFi-overzicht"} onClick={() => setView("directory")} />
            <ViewButton active={view === "evidence"} icon={FolderLock} label={isEnglish ? "Evidence files" : "Bewijsbestanden"} onClick={() => setView("evidence")} />
          </div>
        </div>
      </section>

      {view === "research" && <TokenResearchView isEnglish={isEnglish} />}
      {view === "directory" && <DirectoryView isEnglish={isEnglish} />}
      {view === "evidence" && <EvidenceView isEnglish={isEnglish} />}
    </div>
  );
}

function TokenResearchView({ isEnglish }: { isEnglish: boolean }) {
  const [issuer, setIssuer] = useState("");
  const [currency, setCurrency] = useState("");
  const [claimText, setClaimText] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<TokenResearchResult | null>(null);

  const projectKey = getProjectKey(currency, issuer);
  const evidenceCount = getLocalResearchEvidence(projectKey).length;
  const formReady = isXrplAddress(issuer) && currency.trim().length >= 3;

  async function runAnalysis() {
    if (!formReady) {
      setStatus(isEnglish ? "Enter a valid XRPL issuer and currency code." : "Vul een geldig XRPL-issueradres en valutacode in.");
      return;
    }

    setBusy(true);
    setStatus("");
    setResult(null);

    try {
      const analysis = await analyzeXrplToken({
        issuer,
        currency,
        claimText,
        documentationCount: evidenceCount,
      });
      setResult(analysis);
      setStatus(
        isEnglish
          ? "Analysis completed using current validated XRPL responses."
          : "Analyse voltooid met actuele gevalideerde XRPL-antwoorden.",
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : (isEnglish ? "Analysis failed." : "Analyse mislukt."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div data-page-region="true" className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
        <section className="rounded-3xl border border-slate-200 p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                {isEnglish ? "Research input" : "Onderzoeksinvoer"}
              </p>
              <h2 className="mt-3 text-2xl font-semibold">
                {isEnglish ? "Identify the exact issued asset" : "Identificeer de exacte issued asset"}
              </h2>
            </div>
            <Database className="text-slate-300" size={28} />
          </div>

          <label className="mt-7 block">
            <span className="text-xs font-medium text-slate-600">{isEnglish ? "Issuer address" : "Issueradres"}</span>
            <input
              value={issuer}
              onChange={(event) => setIssuer(event.target.value)}
              placeholder="r…"
              spellCheck={false}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-mono text-sm outline-none focus:border-blue-500"
            />
          </label>

          <label className="mt-4 block">
            <span className="text-xs font-medium text-slate-600">{isEnglish ? "Currency code" : "Valutacode"}</span>
            <input
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              placeholder="USD, EUR, RLUSD or 40-character hex"
              spellCheck={false}
              maxLength={40}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-mono text-sm uppercase outline-none focus:border-blue-500"
            />
          </label>

          <label className="mt-4 block">
            <span className="text-xs font-medium text-slate-600">
              {isEnglish ? "Claim or research question" : "Claim of onderzoeksvraag"}
            </span>
            <textarea
              value={claimText}
              onChange={(event) => setClaimText(event.target.value.slice(0, 1000))}
              rows={5}
              placeholder={isEnglish ? "Example: the issuer says ownership is decentralized and liquidity is deep…" : "Voorbeeld: de issuer zegt dat eigendom gedecentraliseerd is en liquiditeit diep is…"}
              className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none focus:border-blue-500"
            />
            <span className="mt-1 block text-right text-[10px] text-slate-400">{claimText.length}/1000</span>
          </label>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-slate-500">{isEnglish ? "Evidence linked to this key" : "Bewijs gekoppeld aan deze sleutel"}</p>
                <p className="mt-1 break-all font-mono text-xs text-slate-700">{projectKey}</p>
              </div>
              <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">{evidenceCount}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void runAnalysis()}
            disabled={busy || !formReady}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? <Loader2 className="animate-spin" size={17} /> : <Search size={17} />}
            {isEnglish ? "Run neutral XRPL analysis" : "Start neutrale XRPL-analyse"}
          </button>

          {status && (
            <p className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-950">
              {status}
            </p>
          )}
        </section>

        {result ? (
          <ResearchResult result={result} isEnglish={isEnglish} />
        ) : (
          <ResearchEmptyState isEnglish={isEnglish} />
        )}
      </div>
    </div>
  );
}

function ResearchEmptyState({ isEnglish }: { isEnglish: boolean }) {
  const steps = isEnglish
    ? ["Confirm the issuer and currency code", "Read validated account flags", "Sample trustlines and order-book offers", "Compare documents and human claims", "Report uncertainty and limitations"]
    : ["Bevestig issuer en valutacode", "Lees gevalideerde accountflags", "Sample trustlines en orderboekaanbiedingen", "Vergelijk documenten en menselijke claims", "Rapporteer onzekerheid en beperkingen"];

  return (
    <section className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 sm:p-8">
      <ShieldCheck size={30} className="text-blue-700" />
      <h2 className="mt-5 text-2xl font-semibold">
        {isEnglish ? "Evidence before conclusions" : "Bewijs vóór conclusies"}
      </h2>
      <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
        {isEnglish
          ? "The result is an OTT research score based on the data available at the time of the scan. It is not a safety seal, price prediction or investment recommendation."
          : "Het resultaat is een OTT-onderzoeksscore op basis van de data die tijdens de scan beschikbaar is. Het is geen veiligheidskeurmerk, prijsvoorspelling of investeringsadvies."}
      </p>
      <div className="mt-7 space-y-3">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white">{index + 1}</span>
            <p className="text-sm text-slate-700">{step}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ResearchResult({ result, isEnglish }: { result: TokenResearchResult; isEnglish: boolean }) {
  const statusLabel = result.overallStatus === "more-transparent"
    ? (isEnglish ? "More evidence available" : "Meer bewijs beschikbaar")
    : result.overallStatus === "mixed-evidence"
      ? (isEnglish ? "Mixed evidence" : "Gemengd bewijs")
      : (isEnglish ? "Limited evidence" : "Beperkt bewijs");

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
              {isEnglish ? "OTT research result" : "OTT-onderzoeksresultaat"}
            </p>
            <h2 className="mt-3 text-2xl font-semibold">{result.currency}</h2>
            <p className="mt-2 break-all font-mono text-xs text-slate-500">{result.issuer}</p>
          </div>
          <div className="rounded-2xl bg-slate-950 px-5 py-4 text-center text-white">
            <p className="text-3xl font-semibold">{result.overallScore}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-slate-300">research / 100</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800">{statusLabel}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">Ledger {result.ledgerIndex}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">{new Date(result.observedAt).toLocaleString()}</span>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric label={isEnglish ? "Trustlines" : "Trustlines"} value={String(result.trustlineCount)} />
          <Metric label={isEnglish ? "Non-zero holders" : "Niet-nul holders"} value={String(result.nonZeroHolderCount)} />
          <Metric label={isEnglish ? "Offers sampled" : "Offers gesampled"} value={String(result.offerCount)} />
          <Metric label={isEnglish ? "Top 10 share" : "Top 10 aandeel"} value={`${result.topTenSharePercent.toFixed(1)}%`} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {result.categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>

      <div className="rounded-3xl border border-slate-200 p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <BarChart3 size={21} className="text-blue-700" />
          <h3 className="text-lg font-semibold">{isEnglish ? "Largest observed balances" : "Grootste waargenomen saldi"}</h3>
        </div>
        {result.topHolders.length > 0 ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-3 pr-3 font-medium">Account</th>
                  <th className="py-3 pr-3 font-medium">{isEnglish ? "Observed balance" : "Waargenomen saldo"}</th>
                  <th className="py-3 font-medium">{isEnglish ? "Share" : "Aandeel"}</th>
                </tr>
              </thead>
              <tbody>
                {result.topHolders.map((holder) => (
                  <tr key={holder.account} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 pr-3 font-mono text-[11px] text-slate-600">{holder.account}</td>
                    <td className="py-3 pr-3 font-medium">{holder.balance.toLocaleString(undefined, { maximumFractionDigits: 6 })}</td>
                    <td className="py-3 font-medium">{holder.sharePercent.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">{isEnglish ? "No non-zero matching trustline balances were returned in this sample." : "In deze sample zijn geen niet-nul overeenkomende trustlinesaldi teruggegeven."}</p>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ObservationList
          icon={CheckCircle2}
          title={isEnglish ? "Observed" : "Waargenomen"}
          items={result.observations}
          tone="positive"
        />
        <ObservationList
          icon={AlertTriangle}
          title={isEnglish ? "Limitations" : "Beperkingen"}
          items={result.limitations}
          tone="warning"
        />
      </div>
    </section>
  );
}

function CategoryCard({ category }: { category: TokenResearchCategory }) {
  const tone = category.status === "strong"
    ? "bg-emerald-50 text-emerald-800"
    : category.status === "mixed"
      ? "bg-amber-50 text-amber-800"
      : "bg-slate-100 text-slate-600";

  return (
    <article className="rounded-2xl border border-slate-200 p-5">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-sm font-semibold">{category.label}</h3>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>{category.score}/100</span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-blue-700" style={{ width: `${category.score}%` }} />
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-500">{category.explanation}</p>
    </article>
  );
}

function DirectoryView({ isEnglish }: { isEnglish: boolean }) {
  const [category, setCategory] = useState<DefiDirectoryCategory | "all">("all");
  const [selectedId, setSelectedId] = useState(DEFI_DIRECTORY[0]?.id ?? "");
  const entries = useMemo(
    () => category === "all" ? DEFI_DIRECTORY : DEFI_DIRECTORY.filter((entry) => entry.category === category),
    [category],
  );
  const selected = entries.find((entry) => entry.id === selectedId) ?? entries[0];

  return (
    <div data-page-region="true" className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
          {isEnglish ? "Learn before visiting" : "Leer vóór doorsturen"}
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">
          {isEnglish ? "What each platform does, how it works and where risk remains" : "Wat elk platform doet, hoe het werkt en waar risico blijft"}
        </h2>
        <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
          {isEnglish
            ? "A platform is linked only when OTT has a sufficiently verified official domain. Unresolved domains remain visible for research but cannot be opened from OTT."
            : "Een platform krijgt alleen een link wanneer OTT een voldoende geverifieerd officieel domein heeft. Onopgeloste domeinen blijven zichtbaar voor onderzoek maar kunnen niet vanuit OTT worden geopend."}
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {(Object.keys(categoryLabels) as Array<DefiDirectoryCategory | "all">).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setCategory(id);
              const first = id === "all" ? DEFI_DIRECTORY[0] : DEFI_DIRECTORY.find((entry) => entry.category === id);
              setSelectedId(first?.id ?? "");
            }}
            className={`rounded-full px-4 py-2 text-xs font-semibold ${category === id ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
          >
            {isEnglish ? categoryLabels[id].en : categoryLabels[id].nl}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="space-y-3">
          {entries.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setSelectedId(entry.id)}
              className={`w-full rounded-2xl border p-5 text-left transition ${selected?.id === entry.id ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{entry.name}</h3>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{isEnglish ? entry.summaryEn : entry.summaryNl}</p>
                </div>
                {entry.verifiedDomain ? (
                  <BadgeCheck className="shrink-0 text-emerald-600" size={19} />
                ) : (
                  <ShieldAlert className="shrink-0 text-amber-600" size={19} />
                )}
              </div>
            </button>
          ))}
        </div>

        {selected && <DirectoryDetail entry={selected} isEnglish={isEnglish} />}
      </div>
    </div>
  );
}

function DirectoryDetail({ entry, isEnglish }: { entry: DefiDirectoryEntry; isEnglish: boolean }) {
  const risks = isEnglish ? entry.risksEn : entry.risksNl;

  return (
    <article className="rounded-3xl border border-slate-200 p-6 sm:p-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div>
          <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${entry.verifiedDomain ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
            {entry.verifiedDomain ? <BadgeCheck size={14} /> : <AlertTriangle size={14} />}
            {entry.verifiedDomain
              ? (isEnglish ? "Official domain reviewed" : "Officieel domein gecontroleerd")
              : (isEnglish ? "Source review required" : "Broncontrole vereist")}
          </div>
          <h2 className="mt-5 text-3xl font-semibold">{entry.name}</h2>
          <p className="mt-2 text-xs text-slate-500">{entry.sourceLabel}</p>
        </div>
        {entry.verifiedDomain && entry.url ? (
          <a
            href={entry.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            {isEnglish ? "Visit platform" : "Bezoek platform"}
            <ExternalLink size={16} />
          </a>
        ) : (
          <button type="button" disabled className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-400">
            {isEnglish ? "Link withheld" : "Link tegengehouden"}
          </button>
        )}
      </div>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <InfoBlock title={isEnglish ? "What it does" : "Wat het doet"} text={isEnglish ? entry.summaryEn : entry.summaryNl} />
        <InfoBlock title={isEnglish ? "Technology" : "Technologie"} text={isEnglish ? entry.technologyEn : entry.technologyNl} />
        <InfoBlock title={isEnglish ? "Possible benefit" : "Mogelijk voordeel"} text={isEnglish ? entry.possibleBenefitEn : entry.possibleBenefitNl} />
        <InfoBlock title={isEnglish ? "Custody" : "Custody"} text={isEnglish ? entry.custodyEn : entry.custodyNl} />
        <InfoBlock title={isEnglish ? "Wallet requirements" : "Walletvereisten"} text={isEnglish ? entry.walletEn : entry.walletNl} />
      </div>

      <div className="mt-6 rounded-2xl bg-amber-50 p-5">
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-amber-700" size={20} />
          <h3 className="text-sm font-semibold text-amber-950">{isEnglish ? "Risks to review" : "Te controleren risico’s"}</h3>
        </div>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {risks.map((risk) => (
            <li key={risk} className="flex gap-2 text-xs leading-5 text-amber-950/80">
              <AlertTriangle className="mt-0.5 shrink-0" size={14} />
              <span>{risk}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function EvidenceView({ isEnglish }: { isEnglish: boolean }) {
  const { signedIn } = useOttAuthSession();
  const [projectKey, setProjectKey] = useState("");
  const [kind, setKind] = useState<ResearchEvidenceKind>("whitepaper");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const records = useMemo(() => getLocalResearchEvidence(projectKey || undefined), [projectKey, refreshKey]);

  async function upload() {
    if (!file || !projectKey.trim()) {
      setStatus(isEnglish ? "Choose a file and enter a project key." : "Kies een bestand en vul een projectsleutel in.");
      return;
    }

    setBusy(true);
    setStatus("");
    try {
      const result = await uploadResearchEvidence({ file, projectKey, kind, notes });
      setStatus(
        result.persisted
          ? (isEnglish ? "Evidence encrypted by the platform boundary and stored in the private user folder." : "Bewijs is binnen de platformgrens opgeslagen in de privémap van de gebruiker.")
          : (isEnglish ? "Evidence metadata saved locally. Sign in and configure the Supabase bucket for persistent private storage." : "Bewijsmetadata is lokaal opgeslagen. Log in en configureer de Supabase-bucket voor permanente privéopslag."),
      );
      setFile(null);
      setNotes("");
      setRefreshKey((value) => value + 1);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : (isEnglish ? "Upload failed." : "Upload mislukt."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div data-page-region="true" className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-3xl border border-slate-200 p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                {isEnglish ? "Private evidence" : "Privébewijs"}
              </p>
              <h2 className="mt-3 text-2xl font-semibold">{isEnglish ? "Attach documents to a research key" : "Koppel documenten aan een onderzoekssleutel"}</h2>
            </div>
            <FolderLock className="text-slate-300" size={28} />
          </div>

          <div className={`mt-5 rounded-xl p-4 text-sm leading-6 ${signedIn ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-950"}`}>
            {signedIn
              ? (isEnglish ? "Signed-in uploads can be stored in a user-private Supabase Storage folder after the migration is installed." : "Uploads van ingelogde gebruikers kunnen na installatie van de migratie in een privé Supabase Storage-map worden opgeslagen.")
              : (isEnglish ? "You are not signed in. File metadata will stay in this browser session; the file itself is not uploaded to OTT." : "Je bent niet ingelogd. Bestandsmetadata blijft in deze browsersessie; het bestand zelf wordt niet naar OTT geüpload.")}
          </div>

          <label className="mt-6 block">
            <span className="text-xs font-medium text-slate-600">{isEnglish ? "Project key" : "Projectsleutel"}</span>
            <input
              value={projectKey}
              onChange={(event) => setProjectKey(event.target.value.slice(0, 64))}
              placeholder="token-issuer-or-project"
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-mono text-sm outline-none focus:border-blue-500"
            />
          </label>

          <label className="mt-4 block">
            <span className="text-xs font-medium text-slate-600">{isEnglish ? "Document type" : "Documenttype"}</span>
            <select
              value={kind}
              onChange={(event) => setKind(event.target.value as ResearchEvidenceKind)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="whitepaper">Whitepaper</option>
              <option value="roadmap">Roadmap</option>
              <option value="audit">Audit</option>
              <option value="legal">Legal</option>
              <option value="other">{isEnglish ? "Other" : "Overig"}</option>
            </select>
          </label>

          <label className="mt-4 block">
            <span className="text-xs font-medium text-slate-600">{isEnglish ? "File" : "Bestand"}</span>
            <input
              type="file"
              accept=".pdf,.txt,.md,.json,.csv,.doc,.docx"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="mt-2 block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-xs file:font-semibold"
            />
            <p className="mt-2 text-[10px] text-slate-400">PDF, TXT, MD, JSON, CSV, DOC or DOCX · max 10 MB</p>
          </label>

          <label className="mt-4 block">
            <span className="text-xs font-medium text-slate-600">{isEnglish ? "Research notes" : "Onderzoeksnotities"}</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value.slice(0, 1000))}
              rows={4}
              className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none focus:border-blue-500"
            />
          </label>

          <button
            type="button"
            onClick={() => void upload()}
            disabled={busy || !file || !projectKey.trim()}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? <Loader2 className="animate-spin" size={17} /> : <Upload size={17} />}
            {isEnglish ? "Store evidence" : "Bewijs opslaan"}
          </button>

          {status && <p className="mt-4 rounded-xl bg-blue-50 p-4 text-sm leading-6 text-blue-950">{status}</p>}
        </section>

        <section className="rounded-3xl border border-slate-200 p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                {isEnglish ? "Evidence register" : "Bewijsregister"}
              </p>
              <h2 className="mt-3 text-2xl font-semibold">{isEnglish ? "Files known to this browser" : "Bestanden bekend in deze browser"}</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">{records.length}</span>
          </div>

          {records.length > 0 ? (
            <div className="mt-6 space-y-3">
              {records.map((record) => (
                <article key={record.id} className="rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <FileCheck2 className="shrink-0 text-blue-700" size={18} />
                        <h3 className="truncate text-sm font-semibold">{record.fileName}</h3>
                      </div>
                      <p className="mt-2 break-all font-mono text-[10px] text-slate-400">{record.projectKey}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase text-slate-600">{record.kind}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[10px] text-slate-500">
                    <span>{(record.sizeBytes / 1024).toFixed(1)} KB</span>
                    <span>{new Date(record.createdAt).toLocaleString()}</span>
                    <span>{record.storagePath.startsWith("local-session") ? (isEnglish ? "Local metadata" : "Lokale metadata") : (isEnglish ? "Private storage" : "Privéopslag")}</span>
                  </div>
                  {record.notes && <p className="mt-3 text-xs leading-5 text-slate-600">{record.notes}</p>}
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <BookOpen className="mx-auto text-slate-300" size={30} />
              <p className="mt-4 text-sm font-semibold">{isEnglish ? "No evidence registered yet" : "Nog geen bewijs geregistreerd"}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">{isEnglish ? "Upload a whitepaper, roadmap, audit or legal document to start a traceable research file." : "Upload een whitepaper, roadmap, audit of juridisch document om een traceerbaar onderzoeksdossier te starten."}</p>
            </div>
          )}
        </section>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <TrustCard icon={FolderLock} title={isEnglish ? "Private by default" : "Standaard privé"} text={isEnglish ? "User uploads are never automatically published." : "Uploads van gebruikers worden nooit automatisch gepubliceerd."} />
        <TrustCard icon={Layers} title={isEnglish ? "Version-ready" : "Klaar voor versies"} text={isEnglish ? "Each upload receives a unique path and timestamp for later comparison." : "Elke upload krijgt een uniek pad en tijdstip voor latere vergelijking."} />
        <TrustCard icon={ShieldCheck} title={isEnglish ? "Evidence, not endorsement" : "Bewijs, geen aanbeveling"} text={isEnglish ? "A document records a claim; it does not make that claim true." : "Een document registreert een claim; het maakt die claim niet automatisch waar."} />
      </section>
    </div>
  );
}

function ViewButton({ active, icon: Icon, label, onClick }: { active: boolean; icon: ElementType; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold ${active ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold">{value}</p>
    </div>
  );
}

function ObservationList({ icon: Icon, title, items, tone }: { icon: ElementType; title: string; items: string[]; tone: "positive" | "warning" }) {
  return (
    <article className={`rounded-3xl p-6 ${tone === "positive" ? "bg-emerald-50" : "bg-amber-50"}`}>
      <div className="flex items-center gap-3">
        <Icon className={tone === "positive" ? "text-emerald-700" : "text-amber-700"} size={20} />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-xs leading-5 text-slate-700">
            {tone === "positive" ? <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-700" size={14} /> : <AlertTriangle className="mt-0.5 shrink-0 text-amber-700" size={14} />}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function InfoBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5">
      <p className="text-xs font-semibold text-slate-700">{title}</p>
      <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}

function TrustCard({ icon: Icon, title, text }: { icon: ElementType; title: string; text: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 p-5">
      <Icon className="text-blue-700" size={20} />
      <h3 className="mt-4 text-sm font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
    </article>
  );
}
