import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Globe2,
  Loader2,
  RefreshCcw,
  Save,
  Search,
  Trash2,
} from "lucide-react";
import {
  deleteResearchWebSource,
  loadResearchWebSources,
  runResearchEvidenceScout,
  saveResearchWebSource,
  updateResearchWebSource,
  type ResearchWebSource,
  type ScoutCandidate,
  type ScoutResult,
} from "../lib/researchEvidenceScoutClient";

const focusOptions = [
  ["legal-jurisdiction", "Wetgeving en jurisdictie"],
  ["company-registration", "Bedrijfsregistratie"],
  ["regulatory-warnings", "Toezichthouder en waarschuwingen"],
  ["issuer-identity", "Issueridentiteit"],
  ["whitepaper-product", "Whitepaper en productclaims"],
  ["roadmap-execution", "Roadmap en uitvoering"],
  ["team-transparency", "Teamtransparantie"],
  ["market-data", "Marktdata"],
  ["general", "Algemeen vervolgonderzoek"],
] as const;

const sourceKinds = [
  "official-legislation",
  "regulator",
  "company-register",
  "project-official",
  "audit-provider",
  "market-provider",
  "news",
  "social",
  "other",
];
const authorityLevels = ["official", "primary", "secondary", "unverified"];
const reviewStatuses = ["candidate", "verified", "rejected", "conflict"];

function errorText(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "error" in error) {
    const value = (error as { error?: unknown }).error;
    if (typeof value === "string") return value;
  }
  return fallback;
}

export function ResearchEvidenceScout({
  requestId,
  onSourcesChange,
}: {
  requestId: string;
  onSourcesChange: (sources: ResearchWebSource[]) => void;
}) {
  const [sources, setSources] = useState<ResearchWebSource[]>([]);
  const [scout, setScout] = useState<ScoutResult | null>(null);
  const [focus, setFocus] = useState("legal-jurisdiction");
  const [instructions, setInstructions] = useState("");
  const [busy, setBusy] = useState("");
  const [setupRequired, setSetupRequired] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function applySources(next: ResearchWebSource[]) {
    setSources(next);
    onSourcesChange(next);
  }

  async function refresh(silent = false) {
    if (!requestId) return;
    if (!silent) setBusy("load");
    try {
      const response = await loadResearchWebSources(requestId);
      applySources(response.sources ?? []);
      setSetupRequired(Boolean(response.setupRequired));
      setError("");
    } catch (nextError) {
      setError(errorText(nextError, "Webbronnen konden niet worden geladen."));
    } finally {
      if (!silent) setBusy("");
    }
  }

  useEffect(() => {
    setScout(null);
    setMessage("");
    setError("");
    void refresh(true);
  }, [requestId]);

  async function searchWeb() {
    setBusy("search");
    setError("");
    setMessage("");
    try {
      const response = await runResearchEvidenceScout({ requestId, focus, instructions });
      if (!response.scout) throw new Error("Evidence scout gaf geen onderzoeksresultaat terug.");
      setScout(response.scout);
      setMessage(`${response.scout.sources.length} gegronde bronkandidaten gevonden. Nog niets is geverifieerd of gescoord.`);
    } catch (nextError) {
      setError(errorText(nextError, "Evidence scout is mislukt."));
    } finally {
      setBusy("");
    }
  }

  async function saveCandidate(candidate: ScoutCandidate) {
    setBusy(`save:${candidate.canonicalUrl}`);
    setError("");
    try {
      await saveResearchWebSource({
        requestId,
        url: candidate.url,
        title: candidate.title,
        summary: "",
        focus,
        sourceKind: candidate.suggestedSourceKind,
        authorityLevel: candidate.suggestedAuthorityLevel,
        reviewStatus: "candidate",
      });
      await refresh(true);
      setMessage("Bronkandidaat opgeslagen. Open en beoordeel hem voordat je hem verifieert.");
    } catch (nextError) {
      setError(errorText(nextError, "Bron kon niet worden opgeslagen."));
    } finally {
      setBusy("");
    }
  }

  async function updateSource(source: ResearchWebSource, patch: Partial<ResearchWebSource>) {
    setBusy(`update:${source.id}`);
    setError("");
    try {
      await updateResearchWebSource({
        sourceId: source.id,
        sourceKind: patch.source_kind ?? source.source_kind,
        authorityLevel: patch.authority_level ?? source.authority_level,
        reviewStatus: patch.review_status ?? source.review_status,
        summary: patch.summary ?? source.summary,
      });
      await refresh(true);
    } catch (nextError) {
      setError(errorText(nextError, "Bronreview kon niet worden opgeslagen."));
    } finally {
      setBusy("");
    }
  }

  async function removeSource(sourceId: string) {
    setBusy(`delete:${sourceId}`);
    setError("");
    try {
      await deleteResearchWebSource(sourceId);
      await refresh(true);
      setMessage("Webbron verwijderd uit deze researchcase.");
    } catch (nextError) {
      setError(errorText(nextError, "Webbron kon niet worden verwijderd."));
    } finally {
      setBusy("");
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3"><Globe2 className="text-blue-300" size={21} /><h2 className="text-xl font-semibold">Grounded Evidence Scout</h2></div>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-400">De AI zoekt actuele webbronnen met Google Search-grounding. Zoekresultaten blijven kandidaten. Alleen een door jou geopende en gecontroleerde bron kan `verified` worden en aan punten worden gekoppeld.</p>
        </div>
        <button type="button" onClick={() => void refresh()} disabled={Boolean(busy)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold hover:bg-white/5 disabled:opacity-50">{busy === "load" ? <Loader2 className="animate-spin" size={16} /> : <RefreshCcw size={16} />}Bronnen vernieuwen</button>
      </div>

      {setupRequired && <p className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-4 text-sm text-amber-100">Voer eerst de webbronnenmigratie uit. De scout mag niet terugvallen op tijdelijke browseropslag.</p>}
      {message && <p className="mt-5 rounded-2xl border border-blue-300/20 bg-blue-300/5 p-4 text-sm text-blue-100">{message}</p>}
      {error && <p className="mt-5 rounded-2xl border border-red-300/20 bg-red-300/5 p-4 text-sm text-red-100">{error}</p>}

      <div className="mt-6 grid gap-4 lg:grid-cols-[260px_1fr_auto]">
        <label><span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Onderzoeksfocus</span><select value={focus} onChange={(event) => setFocus(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-sm">{focusOptions.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
        <label><span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Founderzoekinstructie</span><input value={instructions} onChange={(event) => setInstructions(event.target.value.slice(0, 2000))} placeholder="Bijvoorbeeld: controleer registratie en waarschuwingen in Nederland en Singapore" className="mt-2 w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-sm" /></label>
        <button type="button" onClick={() => void searchWeb()} disabled={busy === "search" || setupRequired} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-400 disabled:opacity-40 lg:self-end">{busy === "search" ? <Loader2 className="animate-spin" size={17} /> : <Search size={17} />}Zoek webbewijs</button>
      </div>

      {scout && (
        <div className="mt-7 grid gap-5 xl:grid-cols-[1fr_420px]">
          <div className="rounded-2xl border border-blue-300/15 bg-blue-300/5 p-5">
            <div className="flex items-center justify-between gap-3"><p className="font-semibold">Founderbriefing</p><span className="text-xs text-slate-500">{scout.model}</span></div>
            <pre className="mt-4 whitespace-pre-wrap font-sans text-sm leading-7 text-slate-300">{scout.briefing || "Geen briefingtekst ontvangen."}</pre>
            {scout.searchQueries.length > 0 && <div className="mt-5 border-t border-white/10 pt-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Zoekopdrachten</p>{scout.searchQueries.map((query) => <p key={query} className="mt-2 text-xs text-slate-400">• {query}</p>)}</div>}
          </div>
          <div className="space-y-3">
            {scout.sources.map((candidate) => {
              const stored = sources.some((source) => source.canonical_url === candidate.canonicalUrl);
              return <div key={candidate.canonicalUrl} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="line-clamp-2 font-semibold">{candidate.title}</p><p className="mt-1 truncate text-xs text-slate-500">{candidate.domain}</p></div><a href={candidate.url} target="_blank" rel="noreferrer" className="shrink-0 text-blue-300"><ExternalLink size={17} /></a></div><div className="mt-3 flex flex-wrap gap-2"><span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px]">suggested: {candidate.suggestedSourceKind}</span><span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px]">{candidate.suggestedAuthorityLevel}</span></div><button type="button" onClick={() => void saveCandidate(candidate)} disabled={stored || busy === `save:${candidate.canonicalUrl}`} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 px-3 py-2.5 text-xs font-semibold hover:bg-white/5 disabled:opacity-40">{busy === `save:${candidate.canonicalUrl}` ? <Loader2 className="animate-spin" size={15} /> : stored ? <CheckCircle2 size={15} /> : <Save size={15} />}{stored ? "Opgeslagen" : "Bewaar als kandidaat"}</button></div>;
            })}
          </div>
        </div>
      )}

      <div className="mt-8 border-t border-white/10 pt-6">
        <div className="flex items-center justify-between gap-3"><h3 className="font-semibold">Opgeslagen webbronnen</h3><span className="text-xs text-slate-500">{sources.length}</span></div>
        <div className="mt-4 space-y-4">
          {sources.map((source) => <SavedSourceCard key={source.id} source={source} busy={busy} onUpdate={(patch) => void updateSource(source, patch)} onDelete={() => void removeSource(source.id)} />)}
          {sources.length === 0 && <p className="rounded-2xl border border-white/10 p-6 text-center text-sm text-slate-500">Nog geen webbron opgeslagen.</p>}
        </div>
      </div>
    </section>
  );
}

function SavedSourceCard({ source, busy, onUpdate, onDelete }: { source: ResearchWebSource; busy: string; onUpdate: (patch: Partial<ResearchWebSource>) => void; onDelete: () => void }) {
  const [summary, setSummary] = useState(source.summary);
  useEffect(() => setSummary(source.summary), [source.summary]);
  const isBusy = busy === `update:${source.id}` || busy === `delete:${source.id}`;
  return <article className={`rounded-2xl border p-4 ${source.review_status === "verified" ? "border-emerald-300/20 bg-emerald-300/5" : source.review_status === "conflict" ? "border-red-300/20 bg-red-300/5" : "border-white/10 bg-slate-950/50"}`}><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold">{source.review_status}</span><span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px]">{source.authority_level}</span><span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px]">{source.source_kind}</span></div><a href={source.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex max-w-full items-start gap-2 font-semibold text-blue-300 hover:text-blue-200"><span className="line-clamp-2">{source.title || source.domain}</span><ExternalLink className="mt-0.5 shrink-0" size={15} /></a><p className="mt-1 text-xs text-slate-500">{source.domain} · gecontroleerd {new Date(source.checked_at).toLocaleDateString()}</p></div><button type="button" onClick={onDelete} disabled={isBusy} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-300/20 px-3 py-2 text-xs font-semibold text-red-200 disabled:opacity-40">{busy === `delete:${source.id}` ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}Verwijder</button></div><div className="mt-4 grid gap-3 md:grid-cols-3"><select value={source.source_kind} onChange={(event) => onUpdate({ source_kind: event.target.value })} disabled={isBusy} className="rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-xs">{sourceKinds.map((value) => <option key={value} value={value}>{value}</option>)}</select><select value={source.authority_level} onChange={(event) => onUpdate({ authority_level: event.target.value })} disabled={isBusy} className="rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-xs">{authorityLevels.map((value) => <option key={value} value={value}>{value}</option>)}</select><select value={source.review_status} onChange={(event) => onUpdate({ review_status: event.target.value })} disabled={isBusy} className="rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-xs">{reviewStatuses.map((value) => <option key={value} value={value}>{value}</option>)}</select></div><textarea value={summary} onChange={(event) => setSummary(event.target.value.slice(0, 8000))} rows={3} placeholder="Wat ondersteunt of weerspreekt deze bron precies?" className="mt-3 w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-sm leading-6" /><button type="button" onClick={() => onUpdate({ summary })} disabled={isBusy} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-slate-950 disabled:opacity-40">{busy === `update:${source.id}` ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}Review opslaan</button>{source.review_status === "candidate" && <div className="mt-3 flex gap-2 rounded-xl border border-amber-300/20 bg-amber-300/5 p-3 text-xs leading-5 text-amber-100"><AlertTriangle className="mt-0.5 shrink-0" size={14} />Kandidaatbronnen tellen niet mee voor de score.</div>}</article>;
}
