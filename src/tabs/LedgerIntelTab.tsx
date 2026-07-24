import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileSearch,
  Loader2,
  Newspaper,
  RefreshCcw,
  Search,
  ShieldCheck,
} from "lucide-react";
import { OttCategoryTabs, type OttCategoryTabItem } from "../components/OttCategoryTabs";
import {
  OTT_VISUAL_LANGUAGE,
  getOttVisualKey,
  type OttVisualKey,
} from "../lib/ottVisualLanguage";
import {
  fetchXrplIntelligence,
  formatIntelDate,
  getConfidenceLabel,
  getSourceTypeLabel,
  type XrplIntelItem,
  type XrplIntelResponse,
} from "../lib/newsClient";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";
import { DeFiTab } from "./DeFiTab";

type ExploreView = "intelligence" | "research";

const SOURCE_PAGE_SIZE = 6;
const CORE_SOURCE_CATEGORIES: OttVisualKey[] = [
  "all",
  "xls",
  "cbdc",
  "xrpl-core",
  "iso-20022",
];

export function LedgerIntelTab() {
  const { language } = useTerminalLanguage();
  const isEnglish = language === "en";
  const [view, setView] = useState<ExploreView>("intelligence");

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <section className="border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
            {isEnglish ? "Explore XRPL" : "Ontdek XRPL"}
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl">
            {isEnglish
              ? "Follow sourced developments or investigate a project yourself."
              : "Volg ontwikkelingen met bronnen of onderzoek zelf een project."}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600">
            {isEnglish
              ? "Live intelligence separates official facts, secondary reporting and items that still need confirmation. The research lab compares XRPL observations with documents and claims."
              : "Live intelligence scheidt officiële feiten, secundaire berichtgeving en items die nog bevestiging nodig hebben. Het onderzoekslab vergelijkt XRPL-observaties met documenten en claims."}
          </p>

          <div className="mt-8 inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1" role="tablist" aria-label="Explore views">
            <button
              type="button"
              role="tab"
              aria-selected={view === "intelligence"}
              onClick={() => setView("intelligence")}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold ${view === "intelligence" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}
            >
              <Newspaper size={16} />
              {isEnglish ? "Live intelligence" : "Live intelligence"}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === "research"}
              onClick={() => setView("research")}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold ${view === "research" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}
            >
              <FileSearch size={16} />
              {isEnglish ? "Research lab" : "Onderzoekslab"}
            </button>
          </div>
        </div>
      </section>

      {view === "intelligence" ? <IntelligenceFeed isEnglish={isEnglish} /> : <DeFiTab />}
    </div>
  );
}

function IntelligenceFeed({ isEnglish }: { isEnglish: boolean }) {
  const emptyItem = useMemo(() => createEmptyItem(isEnglish), [isEnglish]);
  const sourcePanelRef = useRef<HTMLElement | null>(null);
  const detailPanelRef = useRef<HTMLElement | null>(null);
  const [data, setData] = useState<XrplIntelResponse | null>(null);
  const [items, setItems] = useState<XrplIntelItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<OttVisualKey>("all");
  const [selectedItem, setSelectedItem] = useState<XrplIntelItem>(emptyItem);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function loadIntel(mode: "initial" | "refresh" = "initial") {
    try {
      setError("");
      mode === "initial" ? setLoading(true) : setRefreshing(true);

      const response = await fetchXrplIntelligence({ limit: 36 });
      setData(response);
      setItems(response.items);
      setSelectedCategory("all");
      setSelectedItem(response.items[0] ?? emptyItem);
      setPage(0);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : isEnglish
            ? "The XRPL Intelligence feed could not be loaded."
            : "De XRPL Intelligence-feed kon niet worden geladen.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadIntel("initial");
  }, []);

  useEffect(() => {
    if (!selectedItem.title || selectedItem.link === "#") {
      setSelectedItem(emptyItem);
    }
  }, [emptyItem]);

  useEffect(() => {
    setPage(0);
  }, [query, selectedCategory]);

  const sourceTabs = useMemo<OttCategoryTabItem[]>(() => {
    const counts: Record<OttVisualKey, number> = {
      all: items.length,
      xls: 0,
      cbdc: 0,
      "xrpl-core": 0,
      "iso-20022": 0,
      other: 0,
    };

    for (const item of items) {
      const key = getItemVisualKey(item);
      if (key !== "all") counts[key] += 1;
    }

    const tabs = CORE_SOURCE_CATEGORIES.map((key) => ({
      id: key,
      label: OTT_VISUAL_LANGUAGE[key].shortLabel,
      count: counts[key],
    }));

    if (counts.other > 0) {
      tabs.push({
        id: "other",
        label: isEnglish ? "Other" : "Overig",
        count: counts.other,
      });
    }

    return tabs;
  }, [isEnglish, items]);

  const categoryItems = useMemo(
    () => filterItemsByCategory(items, selectedCategory),
    [items, selectedCategory],
  );

  const visibleItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return categoryItems;

    return categoryItems.filter((item) =>
      [item.title, item.source, item.description, item.whyItMatters, ...item.tags]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [categoryItems, query]);

  const totalPages = Math.max(1, Math.ceil(visibleItems.length / SOURCE_PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = visibleItems.slice(
    safePage * SOURCE_PAGE_SIZE,
    safePage * SOURCE_PAGE_SIZE + SOURCE_PAGE_SIZE,
  );
  const officialCount = items.filter((item) => item.officialSource).length;
  const reviewCount = items.filter((item) => item.needsConfirmation).length;

  function jumpTo(element: HTMLElement | null) {
    if (!element) return;
    window.requestAnimationFrame(() => {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function selectCategory(id: string) {
    const category = id as OttVisualKey;
    const nextItems = filterItemsByCategory(items, category);
    setSelectedCategory(category);
    setSelectedItem(nextItems[0] ?? emptyItem);
    setQuery("");
    setPage(0);
    jumpTo(sourcePanelRef.current);
  }

  function selectItem(item: XrplIntelItem) {
    setSelectedItem(item);
    if (window.matchMedia("(max-width: 1023px)").matches) {
      jumpTo(detailPanelRef.current);
    }
  }

  function changePage(nextPage: number) {
    setPage(Math.min(totalPages - 1, Math.max(0, nextPage)));
    jumpTo(sourcePanelRef.current);
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label={isEnglish ? "Items" : "Items"} value={loading ? "…" : String(items.length)} note={data?.fallback ? (isEnglish ? "Fallback active" : "Terugval actief") : (isEnglish ? "Current feed" : "Actuele feed")} />
        <Metric label={isEnglish ? "Official sources" : "Officiële bronnen"} value={loading ? "…" : String(officialCount)} note={isEnglish ? "Weighted higher" : "Zwaarder gewogen"} />
        <Metric label={isEnglish ? "Needs confirmation" : "Bevestiging nodig"} value={loading ? "…" : String(reviewCount)} note={isEnglish ? "Review before sharing" : "Controleer vóór delen"} />
      </div>

      {error && (
        <div className="mt-6 flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-900">
          <AlertTriangle className="mt-0.5 shrink-0" size={18} />
          <span>{error}</span>
        </div>
      )}

      <section className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
              {isEnglish ? "Jump directly" : "Spring direct"}
            </p>
            <h2 className="mt-2 text-xl font-semibold">
              {isEnglish ? "Choose a source category" : "Kies een broncategorie"}
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            {isEnglish ? "The count is shown inside every tab." : "Het aantal staat in iedere tab."}
          </p>
        </div>
        <div className="mt-4">
          <OttCategoryTabs
            items={sourceTabs}
            selectedId={selectedCategory}
            isEnglish={isEnglish}
            onSelect={selectCategory}
            disabled={loading || refreshing}
          />
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
        <section
          ref={sourcePanelRef}
          id="ott-source-results"
          className="scroll-mt-4 rounded-3xl border border-slate-200 p-5 sm:p-6"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
                {isEnglish ? "Source feed" : "Bronfeed"}
              </p>
              <h2 className="mt-2 text-xl font-semibold">
                {OTT_VISUAL_LANGUAGE[selectedCategory].shortLabel} · {visibleItems.length}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => void loadIntel("refresh")}
              disabled={loading || refreshing}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              aria-label={isEnglish ? "Refresh feed" : "Feed verversen"}
            >
              <RefreshCcw className={refreshing ? "animate-spin" : ""} size={17} />
            </button>
          </div>

          <label className="relative mt-5 block">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={isEnglish ? "Search titles and sources" : "Zoek titels en bronnen"}
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500"
            />
          </label>

          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
            <span>{isEnglish ? "Page" : "Pagina"} {safePage + 1}/{totalPages}</span>
            <span>{pageItems.length} {isEnglish ? "shown" : "zichtbaar"}</span>
          </div>

          <div className="mt-4 space-y-3">
            {loading ? (
              <div className="flex min-h-52 items-center justify-center">
                <Loader2 className="animate-spin text-slate-400" size={23} />
              </div>
            ) : pageItems.length > 0 ? (
              pageItems.map((item) => (
                <button
                  key={`${item.link}-${item.title}`}
                  type="button"
                  onClick={() => selectItem(item)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${selectedItem.link === item.link ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-semibold leading-5 text-slate-900">{item.title}</h3>
                    <span className="shrink-0 text-xs font-semibold text-slate-500">{item.confidenceScore}%</span>
                  </div>
                  <p className="mt-2 text-[10px] uppercase tracking-wide text-slate-400">
                    {item.source} · {formatIntelDate(item.pubDate)}
                  </p>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{item.whyItMatters}</p>
                </button>
              ))
            ) : (
              <p className="rounded-2xl bg-slate-50 p-5 text-sm leading-6 text-slate-500">
                {isEnglish ? "No matching items were found." : "Geen overeenkomende items gevonden."}
              </p>
            )}
          </div>

          {visibleItems.length > SOURCE_PAGE_SIZE && (
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => changePage(safePage - 1)}
                disabled={safePage === 0}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-50 disabled:opacity-35"
              >
                <ChevronLeft size={17} />
                {isEnglish ? "Previous" : "Vorige"}
              </button>
              <button
                type="button"
                onClick={() => changePage(safePage + 1)}
                disabled={safePage >= totalPages - 1}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-35"
              >
                {isEnglish ? "Next" : "Volgende"}
                <ChevronRight size={17} />
              </button>
            </div>
          )}
        </section>

        <article
          ref={detailPanelRef}
          id="ott-source-detail"
          className="scroll-mt-4 rounded-3xl border border-slate-200 p-6 sm:p-8"
        >
          <button
            type="button"
            onClick={() => jumpTo(sourcePanelRef.current)}
            className="mb-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 lg:hidden"
          >
            <ArrowLeft size={15} />
            {isEnglish ? "Back to source feed" : "Terug naar bronfeed"}
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <SourceBadge label={selectedItem.officialSource ? (isEnglish ? "Official source" : "Officiële bron") : (isEnglish ? "Secondary source" : "Secundaire bron")} verified={selectedItem.officialSource} />
            <SourceBadge label={getSourceTypeLabel(selectedItem.sourceType)} />
            {selectedItem.needsConfirmation && <SourceBadge label={isEnglish ? "Needs confirmation" : "Bevestiging nodig"} warning />}
          </div>

          <h2 className="mt-6 text-3xl font-semibold leading-tight tracking-tight">{selectedItem.title}</h2>
          <p className="mt-3 text-xs text-slate-400">{selectedItem.source} · {formatIntelDate(selectedItem.pubDate)}</p>

          <p className="mt-6 text-sm leading-7 text-slate-600">
            {selectedItem.description || (isEnglish ? "No description was supplied." : "Er is geen beschrijving aangeleverd.")}
          </p>

          <div className="mt-7 rounded-2xl bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              {isEnglish ? "Why it may matter" : "Waarom dit relevant kan zijn"}
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-700">{selectedItem.whyItMatters}</p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <DetailMetric label={isEnglish ? "Confidence" : "Betrouwbaarheid"} value={`${selectedItem.confidenceScore}%`} note={getConfidenceLabel(selectedItem.confidenceScore)} />
            <DetailMetric label={isEnglish ? "Source type" : "Brontype"} value={getSourceTypeLabel(selectedItem.sourceType)} note={selectedItem.officialSource ? (isEnglish ? "Official weighted" : "Officieel gewogen") : (isEnglish ? "Review context" : "Controlecontext")} />
            <DetailMetric label={isEnglish ? "Review" : "Controle"} value={selectedItem.needsConfirmation ? (isEnglish ? "Required" : "Vereist") : (isEnglish ? "Lower" : "Lager")} note={isEnglish ? "Human judgement" : "Menselijk oordeel"} />
          </div>

          {selectedItem.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {selectedItem.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-500">#{tag}</span>
              ))}
            </div>
          )}

          {selectedItem.link !== "#" && (
            <a
              href={selectedItem.link}
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              {isEnglish ? "Open original source" : "Open oorspronkelijke bron"}
              <ArrowUpRight size={16} />
            </a>
          )}

          <div className="mt-8 grid gap-4 border-t border-slate-200 pt-7 sm:grid-cols-2">
            <RuleCard
              icon={ShieldCheck}
              title={isEnglish ? "Sources before conclusions" : "Bronnen vóór conclusies"}
              text={isEnglish ? "Official documents and primary technical sources receive more weight than social claims." : "Officiële documenten en primaire technische bronnen krijgen meer gewicht dan socialmediaclaims."}
            />
            <RuleCard
              icon={CheckCircle2}
              title={isEnglish ? "No automatic publishing" : "Geen automatische publicatie"}
              text={isEnglish ? "Date, source, confidence and confirmation status must be reviewed before sharing." : "Datum, bron, betrouwbaarheid en bevestigingsstatus moeten vóór delen worden gecontroleerd."}
            />
          </div>
        </article>
      </div>
    </main>
  );
}

function getItemVisualKey(item: XrplIntelItem): OttVisualKey {
  return getOttVisualKey([
    item.bucket,
    item.category,
    item.signalType,
    ...item.tags,
  ].join(" "));
}

function filterItemsByCategory(items: XrplIntelItem[], category: OttVisualKey) {
  if (category === "all") return items;
  return items.filter((item) => getItemVisualKey(item) === category);
}

function createEmptyItem(isEnglish: boolean): XrplIntelItem {
  return {
    title: isEnglish ? "No intelligence item selected" : "Geen intelligence-item geselecteerd",
    link: "#",
    pubDate: new Date().toISOString(),
    source: "OTT Terminal",
    sourceType: "fallback",
    category: "XRPL Intelligence",
    bucket: "XRPL Intelligence",
    tags: [],
    signalType: "ecosystem-signal",
    officialSource: false,
    needsConfirmation: true,
    confidenceScore: 50,
    whyItMatters: isEnglish ? "Load the feed and select an item." : "Laad de feed en selecteer een item.",
    description: isEnglish ? "Waiting for sourced XRPL information." : "Wachten op XRPL-informatie met bronnen.",
  };
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className="mt-2 text-xs text-slate-400">{note}</p>
    </div>
  );
}

function DetailMetric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 break-words text-sm font-semibold">{value}</p>
      <p className="mt-1 text-[10px] text-slate-400">{note}</p>
    </div>
  );
}

function SourceBadge({ label, verified = false, warning = false }: { label: string; verified?: boolean; warning?: boolean }) {
  const classes = warning
    ? "bg-amber-50 text-amber-800"
    : verified
      ? "bg-emerald-50 text-emerald-800"
      : "bg-slate-100 text-slate-600";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${classes}`}>
      {verified && <BadgeCheck size={14} />}
      {warning && <AlertTriangle size={14} />}
      {label}
    </span>
  );
}

function RuleCard({ icon: Icon, title, text }: { icon: typeof ShieldCheck; title: string; text: string }) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 shrink-0 text-blue-700" size={18} />
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-2 text-xs leading-5 text-slate-500">{text}</p>
      </div>
    </div>
  );
}
