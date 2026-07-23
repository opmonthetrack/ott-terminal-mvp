import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Eye,
  Loader2,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";
import {
  loadPublicResearchWatchlist,
  type PublicWatchlistItem,
} from "../lib/researchReviewClient";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

export function PublicResearchWatchlist() {
  const { language } = useTerminalLanguage();
  const en = language === "en";
  const [items, setItems] = useState<PublicWatchlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [setupRequired, setSetupRequired] = useState(false);
  const [error, setError] = useState("");

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const response = await loadPublicResearchWatchlist();
      setItems(response.items ?? []);
      setSetupRequired(Boolean(response.setupRequired));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : (en ? "Watchlist could not be loaded." : "Watchlist kon niet worden geladen."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <section className="border-t border-slate-200 bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8 sm:py-16">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-300"><Eye size={17} />OTT Research Watchlist</div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{en ? "Projects worth examining—not instructions to buy." : "Projecten die onderzoek verdienen—geen koopinstructies."}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">{en ? "Every published item has a founder-reviewed evidence score, neutral rationale and review date. A score of 55% or more means the minimum research threshold was reached, not that price performance or safety is guaranteed." : "Ieder gepubliceerd item heeft een founder-beoordeelde bewijsscore, neutrale onderbouwing en controledatum. Een score van 55% of hoger betekent dat de minimale onderzoeksdrempel is gehaald, niet dat koersprestatie of veiligheid is gegarandeerd."}</p>
          </div>
          <button type="button" onClick={() => void refresh()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold hover:bg-white/5 disabled:opacity-50">{loading ? <Loader2 className="animate-spin" size={17} /> : <RefreshCcw size={17} />}{en ? "Refresh" : "Vernieuwen"}</button>
        </div>

        {setupRequired && <p className="mt-7 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-5 text-sm text-amber-100">{en ? "The research database is being activated. No placeholder projects are displayed." : "De researchdatabase wordt geactiveerd. Er worden geen placeholderprojecten getoond."}</p>}
        {error && <p className="mt-7 rounded-2xl border border-red-300/20 bg-red-300/5 p-5 text-sm text-red-100">{error}</p>}

        {!loading && !setupRequired && items.length === 0 && (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <ShieldCheck className="mx-auto text-blue-300" size={30} />
            <p className="mt-4 font-semibold">{en ? "No project has passed founder publication review yet." : "Nog geen project is door de founderpublicatiereview gekomen."}</p>
            <p className="mt-2 text-sm text-slate-400">{en ? "The list remains empty rather than presenting unreviewed tokens." : "De lijst blijft leeg in plaats van onbeoordeelde tokens te tonen."}</p>
          </div>
        )}

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {items.map((item) => <WatchlistCard key={item.id} item={item} en={en} />)}
        </div>
      </div>
    </section>
  );
}

function WatchlistCard({ item, en }: { item: PublicWatchlistItem; en: boolean }) {
  const score = item.research?.final_score;
  const thresholdReached = typeof score === "number" && score >= 55;
  const explorer = `https://livenet.xrpl.org/accounts/${item.issuer_address}`;

  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-400/15 px-3 py-1 text-xs font-semibold text-blue-200">{item.status}</span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${thresholdReached ? "bg-emerald-400/15 text-emerald-200" : "bg-amber-400/15 text-amber-200"}`}>{score ?? "—"}% OTT score</span>
          </div>
          <h3 className="mt-4 text-2xl font-semibold">{item.token_name}</h3>
          <p className="mt-1 font-mono text-sm text-blue-200">{item.currency_code}</p>
        </div>
        {thresholdReached ? <CheckCircle2 className="shrink-0 text-emerald-300" size={26} /> : <AlertTriangle className="shrink-0 text-amber-300" size={26} />}
      </div>

      <p className="mt-5 text-sm leading-7 text-slate-300">{item.neutral_rationale}</p>
      {item.evidence_summary && <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{en ? "Evidence summary" : "Bewijssamenvatting"}</p><p className="mt-2 text-sm leading-6 text-slate-300">{item.evidence_summary}</p></div>}
      {item.research?.neutral_conclusion && <div className="mt-4 rounded-2xl border border-blue-300/10 bg-blue-300/5 p-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-300">{en ? "Neutral conclusion" : "Neutrale conclusie"}</p><p className="mt-2 text-sm leading-6 text-slate-300">{item.research.neutral_conclusion}</p></div>}

      <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">{en ? "Reviewed" : "Gecontroleerd"}: {new Date(item.research?.reviewed_at || item.reviewed_at || item.published_at || "").toLocaleDateString()} · confidence {item.research?.evidence_confidence ?? "—"}</p>
        <a href={explorer} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-300 hover:text-blue-200">Issuer explorer <ExternalLink size={15} /></a>
      </div>
    </article>
  );
}
