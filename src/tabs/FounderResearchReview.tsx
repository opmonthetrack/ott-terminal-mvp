import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Eye,
  FileText,
  Loader2,
  RefreshCcw,
  Save,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import {
  loadResearchReviewCase,
  loadResearchReviewQueue,
  openFounderEvidence,
  publishResearchWatchlist,
  saveFounderResearchScore,
  unpublishResearchWatchlist,
  type ResearchCase,
  type ResearchEvidenceItem,
  type ResearchQueueItem,
  type ResearchScoreItem,
} from "../lib/researchReviewClient";
import {
  calculateOttResearchScore,
  OTT_RESEARCH_CATEGORIES,
  OTT_RESEARCH_MINIMUM_SCORE,
  type OttEvidenceStatus,
  type OttResearchCategoryId,
} from "../lib/ottResearchScore";
import { getOttAccountName } from "../lib/ottAuth";
import { useOttAuthSession } from "../lib/useOttAuthSession";

type EditableScore = {
  categoryId: OttResearchCategoryId;
  awardedPoints: number;
  evidenceStatus: OttEvidenceStatus;
  rationale: string;
  evidenceIds: string[];
};

const evidenceStatuses: Array<{ id: OttEvidenceStatus; label: string }> = [
  { id: "verified", label: "Verified" },
  { id: "partial", label: "Partial" },
  { id: "unverified", label: "Unverified" },
  { id: "missing", label: "Missing" },
  { id: "conflict", label: "Conflict" },
];

const reviewStatuses = [
  { id: "triage", label: "Triage" },
  { id: "needs-evidence", label: "Needs evidence" },
  { id: "in-review", label: "In review" },
  { id: "scored", label: "Scored" },
  { id: "rejected", label: "Rejected" },
];

const watchlistStatuses = [
  { id: "research", label: "Research" },
  { id: "monitor", label: "Monitor" },
  { id: "documented", label: "Documented" },
  { id: "caution", label: "Caution" },
];

function errorText(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "error" in error) {
    const value = (error as { error?: unknown }).error;
    if (typeof value === "string") return value;
  }
  return fallback;
}

function makeEditableScores(scoreItems: ResearchScoreItem[]): EditableScore[] {
  return OTT_RESEARCH_CATEGORIES.map((category) => {
    const saved = scoreItems.find((item) => item.category_id === category.id);
    return {
      categoryId: category.id,
      awardedPoints: saved?.awarded_points ?? 0,
      evidenceStatus: saved?.evidence_status ?? "missing",
      rationale: saved?.rationale ?? "",
      evidenceIds: saved?.evidence_ids ?? [],
    };
  });
}

export function FounderResearchReview() {
  const { user, signedIn, loading: authLoading } = useOttAuthSession();
  const [queue, setQueue] = useState<ResearchQueueItem[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [researchCase, setResearchCase] = useState<ResearchCase | null>(null);
  const [scores, setScores] = useState<EditableScore[]>(makeEditableScores([]));
  const [reviewStatus, setReviewStatus] = useState("in-review");
  const [neutralConclusion, setNeutralConclusion] = useState("");
  const [founderReviewNote, setFounderReviewNote] = useState("");
  const [watchlistStatus, setWatchlistStatus] = useState("research");
  const [watchlistRationale, setWatchlistRationale] = useState("");
  const [evidenceSummary, setEvidenceSummary] = useState("");
  const [displayOrder, setDisplayOrder] = useState(100);
  const [queueFilter, setQueueFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<OttResearchCategoryId | null>("issuer-ledger");
  const [busy, setBusy] = useState("");
  const [setupRequired, setSetupRequired] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function refreshQueue(silent = false) {
    if (!signedIn) return;
    if (!silent) setBusy("queue");
    setError("");
    try {
      const response = await loadResearchReviewQueue();
      const next = response.queue ?? [];
      setQueue(next);
      setSetupRequired(Boolean(response.setupRequired));
      setSelectedId((current) => current && next.some((item) => item.id === current)
        ? current
        : next[0]?.id ?? "");
    } catch (nextError) {
      setError(errorText(nextError, "Researchqueue kon niet worden geladen."));
    } finally {
      if (!silent) setBusy("");
    }
  }

  async function loadCase(requestId: string, silent = false) {
    if (!requestId) return;
    if (!silent) setBusy("case");
    setError("");
    try {
      const response = await loadResearchReviewCase(requestId);
      if (!response.case) throw new Error("Researchcase ontbreekt in serverrespons.");
      const nextCase = response.case;
      setResearchCase(nextCase);
      setScores(makeEditableScores(nextCase.scoreItems));
      setReviewStatus(nextCase.request.status === "submitted" ? "triage" : nextCase.request.status);
      setNeutralConclusion(nextCase.request.neutral_conclusion ?? "");
      setFounderReviewNote(nextCase.request.founder_review_note ?? "");
      setWatchlistStatus(nextCase.watchlist?.status ?? "research");
      setWatchlistRationale(nextCase.watchlist?.neutral_rationale ?? "");
      setEvidenceSummary(nextCase.watchlist?.evidence_summary ?? "");
      setDisplayOrder(nextCase.watchlist?.display_order ?? 100);
    } catch (nextError) {
      setError(errorText(nextError, "Researchcase kon niet worden geladen."));
    } finally {
      if (!silent) setBusy("");
    }
  }

  useEffect(() => {
    if (!authLoading && signedIn) void refreshQueue(true);
  }, [authLoading, signedIn]);

  useEffect(() => {
    if (selectedId) void loadCase(selectedId, true);
    else setResearchCase(null);
  }, [selectedId]);

  const scorePreview = useMemo(() => calculateOttResearchScore(scores.map((item) => ({
    categoryId: item.categoryId,
    awardedPoints: item.awardedPoints,
    evidenceStatus: item.evidenceStatus,
    rationale: item.rationale,
    evidenceCount: item.evidenceIds.length,
  }))), [scores]);

  const filteredQueue = useMemo(() => queue.filter((item) => {
    const filterMatches = queueFilter === "all" || item.status === queueFilter;
    const needle = searchQuery.trim().toLowerCase();
    const searchMatches = !needle || [
      item.token_name,
      item.currency_code,
      item.issuer_address,
      item.requester?.email ?? "",
      item.claimed_legal_entity ?? "",
    ].some((value) => value.toLowerCase().includes(needle));
    return filterMatches && searchMatches;
  }), [queue, queueFilter, searchQuery]);

  function updateScore(categoryId: OttResearchCategoryId, patch: Partial<EditableScore>) {
    setScores((current) => current.map((item) => item.categoryId === categoryId
      ? { ...item, ...patch }
      : item));
  }

  function toggleEvidence(categoryId: OttResearchCategoryId, evidenceId: string) {
    const current = scores.find((item) => item.categoryId === categoryId);
    if (!current) return;
    const selected = current.evidenceIds.includes(evidenceId);
    updateScore(categoryId, {
      evidenceIds: selected
        ? current.evidenceIds.filter((id) => id !== evidenceId)
        : [...current.evidenceIds, evidenceId],
    });
  }

  async function saveScore() {
    if (!researchCase) return;
    setBusy("save");
    setError("");
    setMessage("");
    try {
      const response = await saveFounderResearchScore({
        requestId: researchCase.request.id,
        status: reviewStatus,
        neutralConclusion,
        founderReviewNote,
        items: scores,
      });
      setMessage(`Score opgeslagen: ${response.scoreResult?.finalScore ?? scorePreview.finalScore}% van 100.`);
      await Promise.all([refreshQueue(true), loadCase(researchCase.request.id, true)]);
    } catch (nextError) {
      setError(errorText(nextError, "Score kon niet worden opgeslagen."));
    } finally {
      setBusy("");
    }
  }

  async function publishWatchlist() {
    if (!researchCase) return;
    setBusy("publish");
    setError("");
    setMessage("");
    try {
      await publishResearchWatchlist({
        requestId: researchCase.request.id,
        watchlistStatus,
        neutralRationale: watchlistRationale,
        evidenceSummary,
        displayOrder,
      });
      setMessage("Project is gepubliceerd op de neutrale OTT Research Watchlist.");
      await Promise.all([refreshQueue(true), loadCase(researchCase.request.id, true)]);
    } catch (nextError) {
      setError(errorText(nextError, "Watchlistpublicatie is mislukt."));
    } finally {
      setBusy("");
    }
  }

  async function unpublishWatchlist() {
    if (!researchCase) return;
    setBusy("unpublish");
    setError("");
    try {
      await unpublishResearchWatchlist(researchCase.request.id);
      setMessage("Project is van de publieke watchlist gehaald; researchdata blijft privé bewaard.");
      await Promise.all([refreshQueue(true), loadCase(researchCase.request.id, true)]);
    } catch (nextError) {
      setError(errorText(nextError, "Depubliceren is mislukt."));
    } finally {
      setBusy("");
    }
  }

  if (authLoading) return <FullScreen text="Founderaccount controleren…" loading />;
  if (!signedIn) return <FullScreen text="Log eerst in via Account & Profile en open daarna opnieuw ?founder=1&research=1." />;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-6 px-5 py-8 sm:px-8 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <a href="/?founder=1" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft size={16} />Terug naar OTT Terminal</a>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-blue-300">Founder only · evidence review</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">OTT Token Research Review</h1>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-400">Ingelogd als {getOttAccountName(user) || user?.email}. Iedere puntentoekenning moet gekoppeld zijn aan bewijs en een onderbouwing. De server berekent de eindscore en past caps toe.</p>
          </div>
          <button type="button" onClick={() => void refreshQueue()} disabled={Boolean(busy)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold hover:bg-white/5 disabled:opacity-50">{busy === "queue" ? <Loader2 className="animate-spin" size={17} /> : <RefreshCcw size={17} />}Queue vernieuwen</button>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8">
        {setupRequired && <Notice tone="amber" text="Researchdatabase is nog niet geactiveerd. Voer de researchmigraties uit voordat scores of watchlistpublicaties worden opgeslagen." />}
        {message && <Notice tone="blue" text={message} />}
        {error && <Notice tone="red" text={error} />}

        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 xl:sticky xl:top-5 xl:max-h-[calc(100vh-40px)] xl:overflow-y-auto">
            <div className="flex items-center gap-3"><Search className="text-blue-300" size={20} /><h2 className="font-semibold">Researchqueue</h2></div>
            <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Token, issuer of e-mail…" className="mt-4 w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-blue-400" />
            <select value={queueFilter} onChange={(event) => setQueueFilter(event.target.value)} className="mt-3 w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-sm">
              <option value="all">Alle statussen</option>
              {["submitted", "triage", "needs-evidence", "in-review", "scored", "published", "rejected"].map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
            <div className="mt-5 space-y-3">
              {filteredQueue.map((item) => <QueueCard key={item.id} item={item} active={selectedId === item.id} onSelect={() => setSelectedId(item.id)} />)}
              {!busy && filteredQueue.length === 0 && <p className="rounded-2xl border border-white/10 p-6 text-center text-sm text-slate-400">Geen cases voor deze filter.</p>}
            </div>
          </aside>

          <div className="min-w-0">
            {!researchCase ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-12 text-center text-slate-400">Selecteer een researchcase.</div>
            ) : (
              <div className="space-y-6">
                <CaseHeader researchCase={researchCase} />
                <ScoreSummary score={scorePreview} />
                <EvidenceSection evidence={researchCase.evidence} onOpen={(id) => void openFounderEvidence(id)} busy={busy} />

                <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-7">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">Scoremodel</p><h2 className="mt-2 text-2xl font-semibold">Acht categorieën · maximaal 100%</h2></div>
                    <select value={reviewStatus} onChange={(event) => setReviewStatus(event.target.value)} className="rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-sm">{reviewStatuses.map((status) => <option key={status.id} value={status.id}>{status.label}</option>)}</select>
                  </div>
                  <div className="mt-6 space-y-4">
                    {OTT_RESEARCH_CATEGORIES.map((category) => {
                      const score = scores.find((item) => item.categoryId === category.id) as EditableScore;
                      return <ScoreCategoryCard key={category.id} category={category} score={score} evidence={researchCase.evidence} expanded={expandedCategory === category.id} onToggle={() => setExpandedCategory((current) => current === category.id ? null : category.id)} onUpdate={(patch) => updateScore(category.id, patch)} onToggleEvidence={(evidenceId) => toggleEvidence(category.id, evidenceId)} />;
                    })}
                  </div>

                  <div className="mt-7 grid gap-5 lg:grid-cols-2">
                    <label><span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Neutrale conclusie</span><textarea value={neutralConclusion} onChange={(event) => setNeutralConclusion(event.target.value.slice(0, 10000))} rows={6} placeholder="Wat is feitelijk vastgesteld, wat blijft onzeker en welke vervolgstappen zijn nodig?" className="mt-2 w-full rounded-2xl border border-white/15 bg-slate-900 px-4 py-3 text-sm leading-6 outline-none focus:border-blue-400" /></label>
                    <label><span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Privé foundernotitie</span><textarea value={founderReviewNote} onChange={(event) => setFounderReviewNote(event.target.value.slice(0, 5000))} rows={6} placeholder="Interne vragen, conflictpunten of vervolgonderzoek…" className="mt-2 w-full rounded-2xl border border-white/15 bg-slate-900 px-4 py-3 text-sm leading-6 outline-none focus:border-blue-400" /></label>
                  </div>

                  <button type="button" onClick={() => void saveScore()} disabled={busy === "save" || setupRequired} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 py-3.5 text-sm font-semibold text-white hover:bg-blue-400 disabled:opacity-40">{busy === "save" ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}Score en review opslaan</button>
                </section>

                <WatchlistPublisher researchCase={researchCase} score={scorePreview.finalScore} status={watchlistStatus} setStatus={setWatchlistStatus} rationale={watchlistRationale} setRationale={setWatchlistRationale} evidenceSummary={evidenceSummary} setEvidenceSummary={setEvidenceSummary} displayOrder={displayOrder} setDisplayOrder={setDisplayOrder} busy={busy} onPublish={() => void publishWatchlist()} onUnpublish={() => void unpublishWatchlist()} setupRequired={setupRequired} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function QueueCard({ item, active, onSelect }: { item: ResearchQueueItem; active: boolean; onSelect: () => void }) {
  return <button type="button" onClick={onSelect} className={`w-full rounded-2xl border p-4 text-left ${active ? "border-blue-400 bg-blue-400/10" : "border-white/10 bg-slate-950/50 hover:bg-white/5"}`}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-semibold">{item.token_name}</p><p className="mt-1 font-mono text-xs text-blue-200">{item.currency_code}</p></div><span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold">{item.status}</span></div><p className="mt-3 truncate font-mono text-[11px] text-slate-500">{item.issuer_address}</p><div className="mt-3 flex items-center justify-between text-xs text-slate-500"><span>{item.evidence_count} bewijs</span><span>{item.final_score ?? "—"}%</span></div></button>;
}

function CaseHeader({ researchCase }: { researchCase: ResearchCase }) {
  const request = researchCase.request;
  return <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-7"><div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-blue-400/15 px-3 py-1 text-xs font-semibold text-blue-200">{request.currency_code}</span><span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">{request.status}</span></div><h2 className="mt-4 text-3xl font-semibold">{request.token_name}</h2><p className="mt-2 break-all font-mono text-sm text-slate-400">{request.issuer_address}</p></div><a href={`https://livenet.xrpl.org/accounts/${request.issuer_address}`} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold hover:bg-white/5">Issuer explorer <ExternalLink size={16} /></a></div><div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4"><Info label="Aanvrager" value={request.requester?.email || request.requester?.name || request.user_id} /><Info label="Landclaim" value={request.claimed_country || "—"} /><Info label="Juridische entiteit" value={request.claimed_legal_entity || "—"} /><Info label="Registratienummer" value={request.claimed_registration_number || "—"} /></div>{request.official_website && <a href={request.official_website} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-300 hover:text-blue-200">Officiële website volgens aanvrager <ExternalLink size={15} /></a>}{request.requester_summary && <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Aanvragersamenvatting</p><p className="mt-2 text-sm leading-6 text-slate-300">{request.requester_summary}</p></div>}</section>;
}

function ScoreSummary({ score }: { score: ReturnType<typeof calculateOttResearchScore> }) {
  const reached = score.thresholdReached;
  return <section className={`rounded-3xl border p-5 sm:p-7 ${reached ? "border-emerald-300/20 bg-emerald-300/5" : "border-amber-300/20 bg-amber-300/5"}`}><div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Live scorepreview</p><p className="mt-2 text-5xl font-semibold">{score.finalScore}%</p><p className="mt-2 text-sm text-slate-300">Ruw {score.rawScore}% · onderzoeksdrempel {OTT_RESEARCH_MINIMUM_SCORE}% · {score.label}</p></div>{reached ? <CheckCircle2 className="text-emerald-300" size={34} /> : <AlertTriangle className="text-amber-300" size={34} />}</div>{score.scoreCap !== null && <div className="mt-5 rounded-2xl border border-amber-300/20 bg-slate-950/40 p-4"><p className="font-semibold text-amber-100">Score begrensd op {score.scoreCap}%</p>{score.capReasons.map((reason) => <p key={reason} className="mt-2 text-sm leading-6 text-amber-100/80">• {reason}</p>)}</div>}</section>;
}

function EvidenceSection({ evidence, onOpen, busy }: { evidence: ResearchEvidenceItem[]; onOpen: (id: string) => void; busy: string }) {
  return <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-7"><div className="flex items-center gap-3"><FileText className="text-blue-300" size={21} /><h2 className="text-xl font-semibold">Privé bewijsstukken ({evidence.length})</h2></div><div className="mt-5 grid gap-3 lg:grid-cols-2">{evidence.map((item) => <button key={item.id} type="button" onClick={() => onOpen(item.id)} disabled={busy === `evidence:${item.id}`} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-left hover:border-blue-300/40"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-semibold">{item.file_name}</p><p className="mt-1 text-xs text-slate-500">{item.evidence_kind} · {formatBytes(item.size_bytes)} · {new Date(item.created_at).toLocaleDateString()}</p></div><Eye className="shrink-0 text-blue-300" size={18} /></div>{item.notes && <p className="mt-3 text-xs leading-5 text-slate-400">{item.notes}</p>}</button>)}{evidence.length === 0 && <p className="rounded-2xl border border-amber-300/20 bg-amber-300/5 p-5 text-sm text-amber-100 lg:col-span-2">Geen bewijs aangeleverd. Kerncategorieën kunnen de score daarom niet boven 54% brengen.</p>}</div></section>;
}

function ScoreCategoryCard({ category, score, evidence, expanded, onToggle, onUpdate, onToggleEvidence }: { category: (typeof OTT_RESEARCH_CATEGORIES)[number]; score: EditableScore; evidence: ResearchEvidenceItem[]; expanded: boolean; onToggle: () => void; onUpdate: (patch: Partial<EditableScore>) => void; onToggleEvidence: (evidenceId: string) => void }) {
  return <article className="rounded-2xl border border-white/10 bg-slate-950/50"><button type="button" onClick={onToggle} className="flex w-full items-center justify-between gap-4 p-4 text-left"><div><p className="font-semibold">{category.labelNl}</p><p className="mt-1 text-xs text-slate-500">{score.awardedPoints}/{category.maxPoints} punten · {score.evidenceStatus} · {score.evidenceIds.length} bewijs</p></div>{expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}</button>{expanded && <div className="border-t border-white/10 p-4"><p className="text-sm leading-6 text-slate-400">{category.descriptionNl}</p><div className="mt-4 grid gap-4 md:grid-cols-[180px_220px_1fr]"><label><span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Punten</span><input type="number" min={0} max={category.maxPoints} value={score.awardedPoints} onChange={(event) => onUpdate({ awardedPoints: Math.max(0, Math.min(category.maxPoints, Number(event.target.value) || 0)) })} className="mt-2 w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-sm" /></label><label><span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Bewijsstatus</span><select value={score.evidenceStatus} onChange={(event) => onUpdate({ evidenceStatus: event.target.value as OttEvidenceStatus })} className="mt-2 w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-sm">{evidenceStatuses.map((status) => <option key={status.id} value={status.id}>{status.label}</option>)}</select></label><label><span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Onderbouwing</span><textarea value={score.rationale} onChange={(event) => onUpdate({ rationale: event.target.value.slice(0, 5000) })} rows={3} className="mt-2 w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-sm leading-6" /></label></div><div className="mt-5"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Koppel bewijsstukken</p><div className="mt-3 grid gap-2 md:grid-cols-2">{evidence.map((item) => <label key={item.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${score.evidenceIds.includes(item.id) ? "border-blue-400 bg-blue-400/10" : "border-white/10 bg-white/[0.02]"}`}><input type="checkbox" checked={score.evidenceIds.includes(item.id)} onChange={() => onToggleEvidence(item.id)} className="mt-1" /><span className="min-w-0"><span className="block truncate text-sm font-semibold">{item.file_name}</span><span className="mt-1 block text-xs text-slate-500">{item.evidence_kind}</span></span></label>)}{evidence.length === 0 && <p className="text-sm text-slate-500">Geen bewijs beschikbaar.</p>}</div></div></div>}</article>;
}

function WatchlistPublisher({ researchCase, score, status, setStatus, rationale, setRationale, evidenceSummary, setEvidenceSummary, displayOrder, setDisplayOrder, busy, onPublish, onUnpublish, setupRequired }: { researchCase: ResearchCase; score: number; status: string; setStatus: (value: string) => void; rationale: string; setRationale: (value: string) => void; evidenceSummary: string; setEvidenceSummary: (value: string) => void; displayOrder: number; setDisplayOrder: (value: number) => void; busy: string; onPublish: () => void; onUnpublish: () => void; setupRequired: boolean }) {
  const published = Boolean(researchCase.watchlist?.published_at);
  return <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-7"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">Publieke watchlist</p><h2 className="mt-2 text-2xl font-semibold">Publiceer alleen de neutrale reviewlaag</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Onderliggende bestanden en foundernotities blijven privé. Status “Documented” vereist minimaal 55%; “Caution”, “Research” en “Monitor” mogen lager scoren wanneer de onderbouwing dat duidelijk maakt.</p></div>{published && <span className="rounded-full bg-emerald-400/15 px-3 py-1.5 text-xs font-semibold text-emerald-200">public</span>}</div><div className="mt-6 grid gap-4 md:grid-cols-[220px_160px_1fr]"><label><span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Publieke status</span><select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-sm">{watchlistStatuses.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><label><span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Volgorde</span><input type="number" min={0} max={10000} value={displayOrder} onChange={(event) => setDisplayOrder(Math.max(0, Math.min(10000, Number(event.target.value) || 0)))} className="mt-2 w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-sm" /></label><div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4"><p className="text-xs text-slate-500">Huidige score</p><p className="mt-1 text-3xl font-semibold">{score}%</p></div></div><div className="mt-5 grid gap-4 lg:grid-cols-2"><label><span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Neutrale publieke onderbouwing</span><textarea value={rationale} onChange={(event) => setRationale(event.target.value.slice(0, 5000))} rows={5} className="mt-2 w-full rounded-2xl border border-white/15 bg-slate-900 px-4 py-3 text-sm leading-6" /></label><label><span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Publieke bewijssamenvatting</span><textarea value={evidenceSummary} onChange={(event) => setEvidenceSummary(event.target.value.slice(0, 5000))} rows={5} className="mt-2 w-full rounded-2xl border border-white/15 bg-slate-900 px-4 py-3 text-sm leading-6" /></label></div><div className="mt-6 grid gap-3 sm:grid-cols-2"><button type="button" onClick={onPublish} disabled={busy === "publish" || setupRequired} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-40">{busy === "publish" ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}{published ? "Publicatie bijwerken" : "Publiceren"}</button><button type="button" onClick={onUnpublish} disabled={!published || busy === "unpublish"} className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-300/20 px-5 py-3.5 text-sm font-semibold text-red-200 hover:bg-red-300/5 disabled:opacity-30">{busy === "unpublish" ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}Van publieke lijst halen</button></div></section>;
}

function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 break-all text-sm font-semibold">{value}</p></div>; }
function Notice({ tone, text }: { tone: "amber" | "blue" | "red"; text: string }) { const classes = tone === "amber" ? "border-amber-300/20 bg-amber-300/5 text-amber-100" : tone === "red" ? "border-red-300/20 bg-red-300/5 text-red-100" : "border-blue-300/20 bg-blue-300/5 text-blue-100"; return <p className={`mb-6 rounded-2xl border p-5 text-sm ${classes}`}>{text}</p>; }
function FullScreen({ text, loading = false }: { text: string; loading?: boolean }) { return <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white"><div className="max-w-xl rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">{loading && <Loader2 className="mx-auto mb-5 animate-spin" size={28} />}<p className="text-sm leading-7 text-slate-300">{text}</p>{!loading && <a href="/?founder=1" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950"><ArrowLeft size={16} />Terug</a>}</div></div>; }
function formatBytes(bytes: number) { if (bytes < 1024) return `${bytes} B`; if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`; return `${(bytes / 1024 / 1024).toFixed(1)} MB`; }
