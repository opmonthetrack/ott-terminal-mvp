import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Copy,
  ExternalLink,
  FileCheck2,
  FileKey2,
  Flame,
  FlaskConical,
  FolderSearch2,
  Loader2,
  RefreshCcw,
  Search,
  Share2,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import type { DefiDirectoryEntry } from "../lib/defiDirectory";
import "./xaman-explore.css";

type ExploreSection = "heatmap" | "research" | "directory" | "evidence";
type ResearchSeed = { issuer: string; currency: string };
type LoadState = "idle" | "loading" | "success" | "error";

type LiveMarketToken = {
  id: string;
  currency: string;
  name: string;
  issuer: string;
  priceXrp: number | null;
  priceUsd: number | null;
  change24h: number | null;
  volume24hXrp: number | null;
};

type EvidenceKind = "whitepaper" | "audit" | "legal" | "roadmap" | "source" | "other";

type SessionEvidence = {
  id: string;
  project: string;
  kind: EvidenceKind;
  fileName: string;
  size: number;
  mime: string;
  sha256: string;
  sourceUrl: string;
  notes: string;
  addedAt: string;
};

type RawMarketToken = Record<string, unknown>;

const MARKET_SOURCE = "https://api.onthedex.live/public/v1/ticker";
const XRPL_ADDRESS = /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/;
const MAX_EVIDENCE_BYTES = 10 * 1024 * 1024;

const SECTION_OPTIONS: Array<{ id: ExploreSection; label: string; icon: typeof Flame }> = [
  { id: "heatmap", label: "Heatmap", icon: Flame },
  { id: "research", label: "Research", icon: FlaskConical },
  { id: "directory", label: "Directory", icon: FolderSearch2 },
  { id: "evidence", label: "Evidence", icon: FileCheck2 },
];

function textValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function numericValue(value: unknown) {
  const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : null;
}

function formatCompact(value: number | null, suffix = "") {
  if (value === null) return "Unavailable";
  return `${new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 2 }).format(value)}${suffix}`;
}

function formatPrice(value: number | null, currency: "XRP" | "USD") {
  if (value === null) return "Unavailable";
  const maximumFractionDigits = value < 0.01 ? 6 : value < 1 ? 4 : 2;
  return currency === "USD"
    ? new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits }).format(value)
    : `${new Intl.NumberFormat(undefined, { maximumFractionDigits }).format(value)} XRP`;
}

function normalizeMarketToken(token: RawMarketToken, index: number): LiveMarketToken | null {
  const currency = textValue(token.currency).toUpperCase();
  const issuer = textValue(token.issuer);
  const native = currency === "XRP" && (!issuer || issuer.toLowerCase().includes("native"));
  if (!currency || (!native && !XRPL_ADDRESS.test(issuer))) return null;

  const priceXrp = numericValue(token.priceXrp);
  const priceUsd = numericValue(token.priceUsd);
  const change24h = numericValue(token.change24h);
  const volume24hXrp = numericValue(token.volume24hXrp);
  if ([priceXrp, priceUsd, change24h, volume24hXrp].every((value) => value === null)) return null;

  return {
    id: textValue(token.id) || `${currency}-${issuer || "native"}-${index}`,
    currency,
    name: textValue(token.name) || currency,
    issuer: native ? "XRPL native asset" : issuer,
    priceXrp,
    priceUsd,
    change24h,
    volume24hXrp,
  };
}

async function loadLiveMarketTokens() {
  const response = await fetch(MARKET_SOURCE, { signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error(`Market source returned HTTP ${response.status}.`);
  const payload = await response.json() as { tokens?: unknown };
  if (!Array.isArray(payload.tokens)) throw new Error("Market source returned an unsupported response.");
  const tokens = payload.tokens
    .map((token, index) => token && typeof token === "object" ? normalizeMarketToken(token as RawMarketToken, index) : null)
    .filter((token): token is LiveMarketToken => token !== null)
    .sort((left, right) => (right.volume24hXrp ?? -1) - (left.volume24hXrp ?? -1))
    .slice(0, 50);
  if (!tokens.length) throw new Error("No complete live token records were returned.");
  return tokens;
}

async function sha256(file: File) {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export default function XamanExploreView({ onBack, onResearch, onExternal, onCopy, onShare }: {
  onBack: () => void;
  onResearch: (seed?: ResearchSeed) => void;
  onExternal: (url: string) => void;
  onCopy: (value: string, label: string) => void;
  onShare: (text: string) => void;
}) {
  const [section, setSection] = useState<ExploreSection>("heatmap");

  return (
    <>
      <button type="button" className="xaman-back-button" onClick={onBack}><ArrowLeft size={18} />Back to wallet</button>
      <header className="xaman-page-header">
        <p className="xaman-eyebrow">Explore XRPL</p>
        <h1>Research, don&apos;t rush</h1>
        <p>Four read-only tools for market context, issuer checks, ecosystem research and local evidence verification. No swap and no signing request.</p>
      </header>

      <div className="xaman-explore-tabs" role="tablist" aria-label="Explore XRPL tools">
        {SECTION_OPTIONS.map((option) => {
          const Icon = option.icon;
          return <button type="button" role="tab" aria-selected={section === option.id} className={section === option.id ? "is-active" : ""} key={option.id} onClick={() => setSection(option.id)}><Icon size={18} /><span>{option.label}</span></button>;
        })}
      </div>

      {section === "heatmap" ? <HeatmapSection onResearch={onResearch} /> : null}
      {section === "research" ? <ResearchSection onResearch={onResearch} /> : null}
      {section === "directory" ? <DirectorySection onExternal={onExternal} /> : null}
      {section === "evidence" ? <EvidenceSection onCopy={onCopy} onShare={onShare} /> : null}

      <p className="xaman-boundary">Independent research utility · public or local evidence only · no custody, promotion, trading or financial advice.</p>
    </>
  );
}

function HeatmapSection({ onResearch }: { onResearch: (seed?: ResearchSeed) => void }) {
  const [state, setState] = useState<LoadState>("idle");
  const [tokens, setTokens] = useState<LiveMarketToken[]>([]);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle ? tokens.filter((token) => `${token.currency} ${token.name} ${token.issuer}`.toLowerCase().includes(needle)) : tokens;
  }, [query, tokens]);

  async function load() {
    setState("loading");
    setError("");
    try {
      setTokens(await loadLiveMarketTokens());
      setUpdatedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      setState("success");
    } catch (nextError) {
      setTokens([]);
      setError(nextError instanceof Error ? nextError.message : "Live market data is unavailable.");
      setState("error");
    }
  }

  useEffect(() => { void load(); }, []);

  return (
    <section className="xaman-card xaman-explore-panel">
      <ExploreHeading icon={<Flame size={22} />} eyebrow="Live public source" title="Top 50 XRPL Heatmap" />
      <p className="xaman-muted">Tokens are ordered by the reported 24-hour XRP volume. Market values are third-party observations, can be delayed and are never a recommendation.</p>
      <div className="xaman-explore-toolbar">
        <label><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Token, ticker or issuer" aria-label="Search heatmap" /></label>
        <button type="button" onClick={() => void load()} disabled={state === "loading"} aria-label="Refresh live market data"><RefreshCcw className={state === "loading" ? "animate-spin" : ""} size={19} /></button>
      </div>
      {state === "loading" ? <ExploreMessage icon={<Loader2 className="animate-spin" size={21} />} text="Loading current market observations…" /> : null}
      {state === "error" ? <ExploreMessage warning icon={<AlertTriangle size={21} />} text={`${error} No estimated or fallback prices are shown.`} /> : null}
      {state === "success" ? <p className="xaman-explore-source"><CheckCircle2 size={16} />{tokens.length} live records · updated {updatedAt} · OnTheDEX API</p> : null}
      {state === "success" && filtered.length ? (
        <div className="xaman-heatmap-grid" aria-label="Live XRPL market heatmap">
          {filtered.map((token) => {
            const change = token.change24h;
            const tone = change === null ? "neutral" : change > 0 ? "positive" : change < 0 ? "negative" : "neutral";
            const researchable = XRPL_ADDRESS.test(token.issuer);
            return (
              <article className={`xaman-heatmap-tile is-${tone}`} key={token.id}>
                <div><strong>{token.currency}</strong><span>{change === null ? "24h unavailable" : `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`}</span></div>
                <p>{token.name}</p>
                <dl>
                  <div><dt>Price</dt><dd>{formatPrice(token.priceXrp, "XRP")}</dd></div>
                  <div><dt>USD</dt><dd>{formatPrice(token.priceUsd, "USD")}</dd></div>
                  <div><dt>24h volume</dt><dd>{formatCompact(token.volume24hXrp, " XRP")}</dd></div>
                </dl>
                <small>{token.issuer === "XRPL native asset" ? token.issuer : `${token.issuer.slice(0, 8)}…${token.issuer.slice(-6)}`}</small>
                {researchable ? <button type="button" onClick={() => onResearch({ issuer: token.issuer, currency: token.currency })}>Research issuer <ChevronRight size={16} /></button> : null}
              </article>
            );
          })}
        </div>
      ) : null}
      {state === "success" && !filtered.length ? <ExploreMessage icon={<Search size={21} />} text="No live records match this search." /> : null}
    </section>
  );
}

function ResearchSection({ onResearch }: { onResearch: (seed?: ResearchSeed) => void }) {
  return (
    <section className="xaman-card xaman-explore-panel">
      <ExploreHeading icon={<FlaskConical size={22} />} eyebrow="Validated ledger evidence" title="Token Research" />
      <p className="xaman-muted">Check an exact issuer and currency pair. OTT samples public account controls, holder distribution and order-book evidence without assigning approval or predicting performance.</p>
      <div className="xaman-explore-checklist">
        <p><CheckCircle2 size={18} /><span><strong>Exact identity</strong>Currency and issuer are checked together.</span></p>
        <p><CheckCircle2 size={18} /><span><strong>Risk controls</strong>Issuer flags and freeze-related evidence remain visible.</span></p>
        <p><CheckCircle2 size={18} /><span><strong>Clear limitations</strong>Off-ledger claims still need independent verification.</span></p>
      </div>
      <button type="button" className="xaman-button xaman-button-primary xaman-full-button" onClick={() => onResearch()}><FlaskConical size={19} />Open Token Research</button>
    </section>
  );
}

function DirectorySection({ onExternal }: { onExternal: (url: string) => void }) {
  const [state, setState] = useState<LoadState>("loading");
  const [entries, setEntries] = useState<DefiDirectoryEntry[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [expanded, setExpanded] = useState("");

  useEffect(() => {
    let active = true;
    void import("../lib/defiDirectory")
      .then(({ DEFI_DIRECTORY }) => { if (active) { setEntries(DEFI_DIRECTORY.filter((entry) => entry.status !== "deprecated")); setState("success"); } })
      .catch(() => { if (active) setState("error"); });
    return () => { active = false; };
  }, []);

  const categories = useMemo(() => Array.from(new Set(entries.map((entry) => entry.category))).sort(), [entries]);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return entries.filter((entry) => (category === "all" || entry.category === category) && (!needle || `${entry.name} ${entry.summaryEn} ${entry.category}`.toLowerCase().includes(needle)));
  }, [category, entries, query]);

  return (
    <section className="xaman-card xaman-explore-panel">
      <ExploreHeading icon={<FolderSearch2 size={22} />} eyebrow="Risk-first ecosystem map" title="DeFi Directory" />
      <p className="xaman-muted">Neutral project summaries with technology, custody and risk context. Inclusion is not endorsement. Opening an external project can expose actions that this xApp itself does not provide.</p>
      <div className="xaman-explore-toolbar is-stacked">
        <label><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects" aria-label="Search directory" /></label>
        <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter directory category">
          <option value="all">All categories</option>
          {categories.map((item) => <option value={item} key={item}>{item}</option>)}
        </select>
      </div>
      {state === "loading" ? <ExploreMessage icon={<Loader2 className="animate-spin" size={21} />} text="Loading the reviewed directory…" /> : null}
      {state === "error" ? <ExploreMessage warning icon={<AlertTriangle size={21} />} text="The directory could not be loaded." /> : null}
      <div className="xaman-directory-list">
        {filtered.map((entry) => {
          const open = expanded === entry.id;
          return (
            <article key={entry.id}>
              <button type="button" className="xaman-directory-summary" onClick={() => setExpanded(open ? "" : entry.id)} aria-expanded={open}>
                <span><small>{entry.category}</small><strong>{entry.name}</strong><em>{entry.summaryEn}</em></span>
                <ChevronRight className={open ? "is-open" : ""} size={19} />
              </button>
              {open ? (
                <div className="xaman-directory-detail">
                  <p><strong>Technology</strong>{entry.technologyEn}</p>
                  <p><strong>Custody</strong>{entry.custodyEn}</p>
                  <p><strong>Wallet context</strong>{entry.walletEn}</p>
                  <div><strong>Risks to verify</strong><ul>{entry.risksEn.map((risk) => <li key={risk}>{risk}</li>)}</ul></div>
                  {entry.verifiedDomain && entry.url ? <button type="button" className="xaman-button xaman-button-secondary xaman-full-button" onClick={() => onExternal(entry.url)}><ExternalLink size={18} />Open reviewed official source</button> : <p className="xaman-explore-warning"><AlertTriangle size={18} />No reviewed official destination is available.</p>}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
      {state === "success" && !filtered.length ? <ExploreMessage icon={<Search size={21} />} text="No directory entries match these filters." /> : null}
    </section>
  );
}

function EvidenceSection({ onCopy, onShare }: {
  onCopy: (value: string, label: string) => void;
  onShare: (text: string) => void;
}) {
  const [records, setRecords] = useState<SessionEvidence[]>([]);
  const [project, setProject] = useState("");
  const [kind, setKind] = useState<EvidenceKind>("whitepaper");
  const [sourceUrl, setSourceUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [state, setState] = useState<LoadState>("idle");
  const [error, setError] = useState("");

  async function addFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > MAX_EVIDENCE_BYTES) {
      setState("error");
      setError("Choose a file smaller than 10 MB. The limit protects mobile memory.");
      return;
    }
    setState("loading");
    setError("");
    try {
      const hash = await sha256(file);
      setRecords((current) => [{
        id: crypto.randomUUID(),
        project: project.trim() || "Unnamed project",
        kind,
        fileName: file.name,
        size: file.size,
        mime: file.type || "Unknown type",
        sha256: hash,
        sourceUrl: sourceUrl.trim(),
        notes: notes.trim(),
        addedAt: new Date().toISOString(),
      }, ...current]);
      setNotes("");
      setState("success");
    } catch {
      setState("error");
      setError("This device could not calculate the SHA-256 fingerprint.");
    }
  }

  function summary(record: SessionEvidence) {
    return `OTT Evidence Record\nProject: ${record.project}\nCategory: ${record.kind}\nFile: ${record.fileName}\nSHA-256: ${record.sha256}\nRecorded: ${record.addedAt}${record.sourceUrl ? `\nSource: ${record.sourceUrl}` : ""}`;
  }

  return (
    <section className="xaman-card xaman-explore-panel">
      <ExploreHeading icon={<FileKey2 size={22} />} eyebrow="Private on-device check" title="Evidence Files" />
      <div className="xaman-privacy-callout"><ShieldCheck size={22} /><p><strong>Your file never leaves this device.</strong>Only its name, size, notes and SHA-256 fingerprint are held in memory. Everything disappears when this xApp session closes.</p></div>
      <div className="xaman-evidence-form">
        <label>Project or subject<input value={project} onChange={(event) => setProject(event.target.value)} placeholder="Project name" /></label>
        <label>Evidence category<select value={kind} onChange={(event) => setKind(event.target.value as EvidenceKind)}><option value="whitepaper">Whitepaper</option><option value="audit">Audit</option><option value="legal">Legal / registration</option><option value="roadmap">Roadmap</option><option value="source">Source code</option><option value="other">Other</option></select></label>
        <label>Public source URL (optional)<input type="url" value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="https://official-source.example" /></label>
        <label>Research note (optional)<textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="What should be independently verified?" rows={3} /></label>
        <label className="xaman-file-button"><FileCheck2 size={19} />{state === "loading" ? "Calculating SHA-256…" : "Choose file and create fingerprint"}<input type="file" disabled={state === "loading"} onChange={(event) => void addFile(event)} accept=".pdf,.txt,.md,.json,.csv,.doc,.docx,application/pdf,text/plain,application/json,text/csv" /></label>
        <p className="xaman-footnote">Maximum 10 MB. OTT does not read or judge the file contents; the fingerprint only helps detect whether a file changes later.</p>
        {state === "error" ? <p className="xaman-explore-warning"><AlertTriangle size={18} />{error}</p> : null}
      </div>

      <div className="xaman-evidence-list">
        {records.map((record) => (
          <article key={record.id}>
            <div><span>{record.kind}</span><strong>{record.project}</strong><small>{record.fileName} · {formatCompact(record.size, " bytes")}</small></div>
            <code>{record.sha256}</code>
            {record.sourceUrl ? <p>Source noted: {record.sourceUrl}</p> : null}
            {record.notes ? <p>{record.notes}</p> : null}
            <div className="xaman-evidence-actions">
              <button type="button" onClick={() => onCopy(record.sha256, "SHA-256 fingerprint")}><Copy size={17} />Copy hash</button>
              <button type="button" onClick={() => onShare(summary(record))}><Share2 size={17} />Share record</button>
              <button type="button" className="is-danger" onClick={() => setRecords((current) => current.filter((item) => item.id !== record.id))}><Trash2 size={17} />Remove</button>
            </div>
          </article>
        ))}
        {!records.length ? <ExploreMessage icon={<FileCheck2 size={21} />} text="No evidence fingerprints in this session yet." /> : null}
      </div>
    </section>
  );
}

function ExploreHeading({ icon, eyebrow, title }: { icon: ReactNode; eyebrow: string; title: string }) {
  return <div className="xaman-section-heading"><div className="xaman-section-title-row"><span className="xaman-section-icon">{icon}</span><div><p className="xaman-eyebrow">{eyebrow}</p><h2>{title}</h2></div></div></div>;
}

function ExploreMessage({ icon, text, warning = false }: { icon: ReactNode; text: string; warning?: boolean }) {
  return <div className={`xaman-explore-message ${warning ? "is-warning" : ""}`}>{icon}<span>{text}</span></div>;
}
