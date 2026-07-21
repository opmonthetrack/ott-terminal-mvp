import { useEffect, useMemo, useState } from "react";
import type { ElementType } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  Database,
  Eye,
  FileSearch,
  Fingerprint,
  Globe2,
  Landmark,
  Newspaper,
  Radio,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Waves,
  Zap,
} from "lucide-react";
import {
  fetchXrplIntelligence,
  formatIntelDate,
  getConfidenceLabel,
  getIntelBucketItems,
  getIntelBuckets,
  getSourceTypeLabel,
  type XrplIntelItem,
  type XrplIntelResponse,
} from "../lib/newsClient";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

type Metric = {
  label: string;
  value: string;
  text: string;
  icon: ElementType;
};

type Rule = {
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

const SOURCE_TAG = 2606170002;

function getRules(isEnglish: boolean): Rule[] {
  return [
    {
      title: isEnglish ? "Official Sources First" : "Officiële bronnen eerst",
      status: isEnglish ? "Rule" : "Regel",
      text: isEnglish
        ? "XRPL, Ripple, Xaman, GitHub, BIS, IMF, SWIFT and central-bank sources carry more weight than media or social claims."
        : "Bronnen van XRPL, Ripple, Xaman, GitHub, BIS, IMF, SWIFT en centrale banken wegen zwaarder dan media- of socialmediaclaims.",
      icon: ShieldCheck,
    },
    {
      title: isEnglish ? "No Trading Signals" : "Geen handelssignalen",
      status: isEnglish ? "Guard" : "Beveiliging",
      text: isEnglish
        ? "This intelligence is for education only. It is not buy advice, a price prediction or a profit promise."
        : "Deze intelligence is alleen voor educatie. Het is geen koopadvies, prijsvoorspelling of winstbelofte.",
      icon: AlertTriangle,
    },
    {
      title: isEnglish ? "Macro Needs Context" : "Macro vereist context",
      status: "CBDC / BRICS",
      text: isEnglish
        ? "CBDC, BRICS and ISO 20022 signals are macro context, not automatic proof that XRP or XRPL is being used."
        : "Signalen rond CBDC, BRICS en ISO 20022 zijn macrocontext en geen automatisch bewijs dat XRP of XRPL wordt gebruikt.",
      icon: Globe2,
    },
    {
      title: isEnglish ? "Verify Before Posting" : "Controleer vóór publicatie",
      status: "Social",
      text: isEnglish
        ? "Check the source, date, confidence and confirmation status before posting on X, TikTok or LinkedIn."
        : "Controleer bron, datum, betrouwbaarheid en bevestigingsstatus voordat je iets op X, TikTok of LinkedIn plaatst.",
      icon: FileSearch,
    },
  ];
}

function getEmptyItem(isEnglish: boolean): XrplIntelItem {
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
    whyItMatters: isEnglish
      ? "Load the intelligence feed and select an item."
      : "Laad de intelligence-feed en selecteer een item.",
    description: isEnglish
      ? "Waiting for live XRPL Intelligence data."
      : "Wachten op live XRPL Intelligence-data.",
  };
}

export function LedgerIntelTab() {
  const { language } = useTerminalLanguage();
  const isEnglish = language === "en";
  const rules = getRules(isEnglish);
  const emptyItem = getEmptyItem(isEnglish);
  const [data, setData] = useState<XrplIntelResponse | null>(null);
  const [items, setItems] = useState<XrplIntelItem[]>([]);
  const [selectedBucket, setSelectedBucket] = useState("All");
  const [selectedItem, setSelectedItem] = useState<XrplIntelItem>(emptyItem);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function loadIntel(mode: "initial" | "refresh" = "initial") {
    const controller = new AbortController();

    try {
      setError("");

      if (mode === "initial") {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const response = await fetchXrplIntelligence({
        limit: 36,
        signal: controller.signal,
      });

      setData(response);
      setItems(response.items);
      setSelectedBucket("All");
      setSelectedItem(response.items[0] ?? emptyItem);
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

    return () => controller.abort();
  }

  useEffect(() => {
    void loadIntel("initial");
  }, []);

  const bucketStats = useMemo(() => getIntelBuckets(items), [items]);

  const visibleItems = useMemo(
    () => getIntelBucketItems(items, selectedBucket),
    [items, selectedBucket],
  );

  const officialCount = useMemo(
    () => items.filter((item) => item.officialSource).length,
    [items],
  );

  const reviewCount = useMemo(
    () => items.filter((item) => item.needsConfirmation).length,
    [items],
  );

  const highConfidenceCount = useMemo(
    () => items.filter((item) => item.confidenceScore >= 85).length,
    [items],
  );

  const metrics: Metric[] = [
    {
      label: isEnglish ? "Live Items" : "Live-items",
      value: loading ? "..." : String(items.length),
      text: data?.fallback
        ? isEnglish ? "Fallback mode" : "Terugvalmodus"
        : isEnglish ? "Fetched now" : "Zojuist opgehaald",
      icon: Newspaper,
    },
    {
      label: isEnglish ? "Official" : "Officieel",
      value: loading ? "..." : String(officialCount),
      text: isEnglish ? "Source weighted" : "Gewogen op bron",
      icon: ShieldCheck,
    },
    {
      label: isEnglish ? "Needs Review" : "Controle nodig",
      value: loading ? "..." : String(reviewCount),
      text: isEnglish ? "Verify before posting" : "Controleer vóór publicatie",
      icon: Eye,
    },
    {
      label: "SourceTag",
      value: String(data?.sourceTag ?? SOURCE_TAG),
      text: "Make Waves",
      icon: Fingerprint,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-[#080808]">
      <div className="p-6">
        <div className="relative overflow-hidden border border-black/10 bg-white p-6 mb-6">
          <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_top_right,_#3898E8,_transparent_34%),radial-gradient(circle_at_bottom_left,_#C83888,_transparent_32%)]" />

          <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
            <div className="col-span-12 xl:col-span-8">
              <div className="flex items-center gap-2 mb-4 text-black/45">
                <Radio size={17} />

                <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                  XRPL Intelligence Center
                </p>
              </div>

              <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
                Signals. Sources. Context.
              </h2>

              <p className="font-mono text-sm text-black/55 max-w-3xl leading-relaxed">
                {isEnglish
                  ? "A live intelligence layer for XRPL, XRP, Ripple, Xaman, XLS amendments, CBDCs, BRICS, ISO 20022, real-world assets and payments. Built for awareness, not trading signals."
                  : "Een live intelligence-laag voor XRPL, XRP, Ripple, Xaman, XLS-amendementen, CBDC's, BRICS, ISO 20022, real-world assets en betalingen. Gebouwd voor bewustwording, niet voor handelssignalen."}
              </p>

              <div className="flex flex-wrap gap-3 mt-5">
                <button
                  onClick={() => void loadIntel("refresh")}
                  disabled={loading || refreshing}
                  className="inline-flex items-center gap-2 bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] text-white px-4 py-3 hover:brightness-95 transition-all disabled:opacity-50"
                >
                  <RefreshCcw
                    size={16}
                    className={refreshing ? "animate-spin" : ""}
                  />

                  <span className="font-orbitron text-xs font-black uppercase">
                    {refreshing
                      ? isEnglish ? "Refreshing" : "Verversen"
                      : isEnglish ? "Refresh Intel" : "Intelligence verversen"}
                  </span>
                </button>

                <a
                  href="/api/news?limit=12"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 border border-black/10 bg-[#F7F8FC] px-4 py-3 hover:bg-white transition-all"
                >
                  <Database size={16} className="text-[#3898E8]" />

                  <span className="font-orbitron text-xs font-bold uppercase">
                    Open API
                  </span>
                </a>
              </div>
            </div>

            <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-3">
              {metrics.map((metric) => (
                <MetricBox key={metric.label} metric={metric} />
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="border border-[#D84858]/30 bg-[#D84858]/10 p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-[#D84858] mt-0.5" />

              <div>
                <p className="font-orbitron text-xs font-black uppercase mb-2">
                  {isEnglish ? "Intelligence Feed Error" : "Fout in intelligence-feed"}
                </p>

                <p className="font-mono text-xs text-black/55 leading-relaxed">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-3 space-y-4">
            <div className="border border-black/10 bg-white p-6">
              <div className="flex items-center gap-2 mb-5">
                <Search size={18} className="text-[#3898E8]" />

                <p className="font-orbitron text-xs uppercase tracking-widest">
                  {isEnglish ? "Buckets" : "Categorieën"}
                </p>
              </div>

              <div className="space-y-3">
                {bucketStats.map((bucket) => (
                  <BucketButton
                    key={bucket.bucket}
                    label={bucket.bucket}
                    count={bucket.count}
                    active={selectedBucket === bucket.bucket}
                    onClick={() => {
                      const nextItems = getIntelBucketItems(items, bucket.bucket);
                      setSelectedBucket(bucket.bucket);
                      setSelectedItem(nextItems[0] ?? emptyItem);
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="border border-black/10 bg-white p-6">
              <div className="flex items-center gap-2 mb-5">
                <Sparkles size={18} className="text-[#C83888]" />

                <p className="font-orbitron text-xs uppercase tracking-widest">
                  {isEnglish ? "Daily Brief" : "Dagelijkse samenvatting"}
                </p>
              </div>

              <p className="font-orbitron text-lg font-black uppercase mb-3">
                {data?.brief?.title ?? "XRPL Intelligence Daily Brief"}
              </p>

              <p className="font-mono text-xs text-black/55 leading-relaxed mb-4">
                {data?.brief?.summary ??
                  (isEnglish
                    ? "Loading the feed. The daily brief appears when /api/news responds."
                    : "De feed wordt geladen. De dagelijkse samenvatting verschijnt zodra /api/news antwoord geeft.")}
              </p>

              <MiniStatus
                label="Generated"
                value={
                  data?.brief?.generatedAt
                    ? formatIntelDate(data.brief.generatedAt)
                    : "Pending"
                }
              />

              {data?.fallback && (
                <div className="mt-3 border border-[#D84858]/20 bg-[#D84858]/10 p-3">
                  <p className="font-mono text-[10px] text-black/55 uppercase leading-relaxed">
                    {isEnglish
                      ? "Fallback active — live feeds could not be retrieved cleanly."
                      : "Terugval actief — de live-feeds konden niet correct worden opgehaald."}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="col-span-12 xl:col-span-6 space-y-4">
            <div className="border border-black/10 bg-white p-6">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <p className="font-mono text-[10px] text-black/35 uppercase tracking-[0.35em] mb-2">
                    {isEnglish ? "Live Feed" : "Live-feed"}
                  </p>

                  <h3 className="font-orbitron text-xl font-black uppercase">
                    {selectedBucket === "All"
                      ? isEnglish ? "All Intelligence" : "Alle intelligence"
                      : selectedBucket}
                  </h3>
                </div>

                <FileSearch size={20} className="text-[#3898E8]" />
              </div>

              {loading ? (
                <LoadingPanel isEnglish={isEnglish} />
              ) : visibleItems.length > 0 ? (
                <div className="space-y-3">
                  {visibleItems.map((item) => (
                    <IntelRow
                      key={`${item.link}-${item.title}`}
                      item={item}
                      active={selectedItem.link === item.link}
                      onClick={() => setSelectedItem(item)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyPanel isEnglish={isEnglish} />
              )}
            </div>

            <div className="border border-black/10 bg-white p-6">
              <div className="flex items-center gap-2 mb-5">
                <BookOpen size={18} className="text-[#3898E8]" />

                <p className="font-orbitron text-xs uppercase tracking-widest">
                  {isEnglish ? "Selected Intelligence" : "Geselecteerde intelligence"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge label={selectedItem.bucket} />
                <Badge label={getSourceTypeLabel(selectedItem.sourceType)} />
                <Badge label={selectedItem.signalType} />

                {selectedItem.officialSource ? (
                  <Badge label={isEnglish ? "Official Weighted" : "Officieel gewogen"} />
                ) : (
                  <Badge label={isEnglish ? "Secondary / Review" : "Secundair / controle"} />
                )}

                {selectedItem.needsConfirmation && (
                  <Badge label={isEnglish ? "Needs Confirmation" : "Bevestiging nodig"} tone="warn" />
                )}
              </div>

              <h3 className="font-orbitron text-2xl font-black uppercase mb-3 leading-tight">
                {selectedItem.title}
              </h3>

              <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-4">
                {selectedItem.source} • {formatIntelDate(selectedItem.pubDate)}
              </p>

              <p className="font-mono text-sm text-black/55 leading-relaxed mb-5">
                {selectedItem.description ||
                  (isEnglish ? "No description was provided." : "Geen beschrijving meegeleverd.")}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
                <MiniStatus
                  label={isEnglish ? "Confidence" : "Betrouwbaarheid"}
                  value={`${selectedItem.confidenceScore}% ${getConfidenceLabel(
                    selectedItem.confidenceScore,
                  )}`}
                />
                <MiniStatus
                  label={isEnglish ? "Source Type" : "Brontype"}
                  value={getSourceTypeLabel(selectedItem.sourceType)}
                />
                <MiniStatus
                  label={isEnglish ? "Review" : "Controle"}
                  value={selectedItem.needsConfirmation
                    ? isEnglish ? "Required" : "Vereist"
                    : isEnglish ? "Low" : "Laag"}
                />
              </div>

              <div className="border border-black/10 bg-[#F7F8FC] p-4 mb-5">
                <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">
                  {isEnglish ? "Why it matters" : "Waarom dit belangrijk is"}
                </p>

                <p className="font-mono text-xs text-black/55 leading-relaxed">
                  {selectedItem.whyItMatters}
                </p>
              </div>

              {selectedItem.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {selectedItem.tags.map((tag) => (
                    <span
                      key={tag}
                      className="border border-black/10 bg-white px-3 py-2 font-mono text-[10px] uppercase text-black/45"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <a
                href={selectedItem.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 border border-black/10 bg-[#F7F8FC] px-4 py-3 hover:bg-white transition-all"
              >
                <ArrowUpRight size={16} className="text-[#3898E8]" />

                <span className="font-orbitron text-xs font-bold uppercase">
                  {isEnglish ? "Open Source" : "Open bron"}
                </span>
              </a>
            </div>
          </div>

          <div className="col-span-12 xl:col-span-3 space-y-4">
            <div className="border border-black/10 bg-white p-6">
              <div className="flex items-center gap-2 mb-5">
                <ShieldCheck size={18} className="text-[#3898E8]" />

                <p className="font-orbitron text-xs uppercase tracking-widest">
                  {isEnglish ? "Intelligence Rules" : "Intelligence-regels"}
                </p>
              </div>

              <div className="space-y-3">
                {rules.map((rule) => (
                  <RuleCard key={rule.title} rule={rule} />
                ))}
              </div>
            </div>

            <div className="border border-black/10 bg-white p-6">
              <div className="flex items-center gap-2 mb-5">
                <Target size={18} className="text-[#C83888]" />

                <p className="font-orbitron text-xs uppercase tracking-widest">
                  {isEnglish ? "Source Health" : "Bronstatus"}
                </p>
              </div>

              <div className="space-y-3">
                {(data?.debug ?? []).slice(0, 8).map((source) => (
                  <div
                    key={`${source.source}-${source.category}`}
                    className="border border-black/10 bg-[#F7F8FC] p-3"
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <p className="font-orbitron text-[10px] font-bold uppercase">
                        {source.source}
                      </p>

                      <p className="font-mono text-[10px] text-black/45 uppercase">
                        {source.count}
                      </p>
                    </div>

                    <p className="font-mono text-[10px] text-black/35 uppercase">
                      {source.sourceType ?? "source"} • {source.category ?? "feed"}
                    </p>
                  </div>
                ))}

                {!data?.debug?.length && (
                  <p className="font-mono text-xs text-black/45 leading-relaxed">
                    {isEnglish
                      ? "Source diagnostics appear after a live fetch."
                      : "Brondiagnostiek verschijnt na een live-ophaalactie."}
                  </p>
                )}
              </div>
            </div>

            <div className="border border-black/10 bg-white p-6">
              <div className="flex items-center gap-2 mb-5">
                <Zap size={18} className="text-[#3898E8]" />

                <p className="font-orbitron text-xs uppercase tracking-widest">
                  {isEnglish ? "Next Layer" : "Volgende laag"}
                </p>
              </div>

              <div className="space-y-3">
                <StepLine number="01" text={isEnglish ? "Newsroom turns intelligence into social output." : "Newsroom zet intelligence om in socialmedia-uitvoer."} />
                <StepLine number="02" text={isEnglish ? "OTT Intelligence adds an AI analysis layer." : "OTT Intelligence voegt een AI-analyselaag toe."} />
                <StepLine number="03" text={isEnglish ? "The dashboard can display the daily brief." : "Het dashboard kan de dagelijkse samenvatting tonen."} />
                <StepLine number="04" text={isEnglish ? "No automatic posting without human review." : "Geen automatische publicatie zonder menselijke controle."} />
              </div>
            </div>
          </div>

          <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
            <FeatureBox icon={Globe2} title="XRPL" text="Core, XLS, amendments" />
            <FeatureBox icon={Landmark} title="Macro" text="CBDC, ISO, BRICS" />
            <FeatureBox icon={BarChart3} title={isEnglish ? "Signals" : "Signalen"} text={isEnglish ? "Context, not trades" : "Context, geen handel"} />
            <FeatureBox icon={Waves} title="Make Waves" text="SourceTag 2606170002" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricBox({ metric }: { metric: Metric }) {
  const Icon = metric.icon;

  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-4">
      <Icon size={18} className="text-[#3898E8] mb-3" />

      <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">
        {metric.label}
      </p>

      <p className="font-orbitron text-sm font-black uppercase mb-1 break-all">
        {metric.value}
      </p>

      <p className="font-mono text-[10px] text-black/35 uppercase">
        {metric.text}
      </p>
    </div>
  );
}

function BucketButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full border p-4 text-left transition-all ${
        active
          ? "border-[#3898E8]/40 bg-[#3898E8]/10"
          : "border-black/10 bg-[#F7F8FC] hover:bg-white"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-orbitron text-xs font-bold uppercase">{label}</p>

        <p className="font-mono text-[10px] text-black/45 uppercase">{count}</p>
      </div>
    </button>
  );
}

function IntelRow({
  item,
  active,
  onClick,
}: {
  item: XrplIntelItem;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full border p-4 text-left transition-all ${
        active
          ? "border-[#3898E8]/40 bg-[#3898E8]/10"
          : "border-black/10 bg-[#F7F8FC] hover:bg-white"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <p className="font-orbitron text-sm font-bold uppercase max-w-xl leading-snug">
          {item.title}
        </p>

        <p className="font-mono text-[10px] text-black/45 uppercase">
          {item.confidenceScore}%
        </p>
      </div>

      <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">
        {item.source} • {getSourceTypeLabel(item.sourceType)}
      </p>

      <p className="font-mono text-xs text-black/50 leading-relaxed line-clamp-2">
        {item.whyItMatters}
      </p>
    </button>
  );
}

function RuleCard({ rule }: { rule: Rule }) {
  const Icon = rule.icon;

  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-4">
      <div className="flex items-start justify-between mb-3">
        <Icon size={17} className="text-[#3898E8]" />

        <p className="font-mono text-[10px] text-black/35 uppercase">
          {rule.status}
        </p>
      </div>

      <p className="font-orbitron text-xs font-bold uppercase mb-2">
        {rule.title}
      </p>

      <p className="font-mono text-[10px] text-black/45 leading-relaxed">
        {rule.text}
      </p>
    </div>
  );
}

function MiniStatus({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-4">
      <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">
        {label}
      </p>

      <p className="font-orbitron text-sm font-black uppercase break-words">
        {value}
      </p>
    </div>
  );
}

function Badge({ label, tone = "normal" }: { label: string; tone?: "normal" | "warn" }) {
  return (
    <span
      className={`border px-3 py-2 font-mono text-[10px] uppercase ${
        tone === "warn"
          ? "border-[#D84858]/25 bg-[#D84858]/10 text-black/55"
          : "border-black/10 bg-[#F7F8FC] text-black/45"
      }`}
    >
      {label}
    </span>
  );
}

function LoadingPanel({ isEnglish }: { isEnglish: boolean }) {
  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-6">
      <RefreshCcw size={18} className="text-[#3898E8] animate-spin mb-4" />

      <p className="font-orbitron text-sm font-black uppercase mb-2">
        {isEnglish ? "Loading XRPL Intelligence" : "XRPL Intelligence laden"}
      </p>

      <p className="font-mono text-xs text-black/45 leading-relaxed">
        {isEnglish
          ? "Fetching official, technical and institutional sources from /api/news."
          : "Officiële, technische en institutionele bronnen ophalen via /api/news."}
      </p>
    </div>
  );
}

function EmptyPanel({ isEnglish }: { isEnglish: boolean }) {
  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-6">
      <AlertTriangle size={18} className="text-[#D84858] mb-4" />

      <p className="font-orbitron text-sm font-black uppercase mb-2">
        {isEnglish ? "No items in this category" : "Geen items in deze categorie"}
      </p>

      <p className="font-mono text-xs text-black/45 leading-relaxed">
        {isEnglish
          ? "Select another category or refresh the intelligence feed."
          : "Selecteer een andere categorie of ververs de intelligence-feed."}
      </p>
    </div>
  );
}

function StepLine({ number, text }: { number: string; text: string }) {
  return (
    <div className="flex items-start gap-3 border border-black/10 bg-[#F7F8FC] p-3">
      <p className="font-orbitron text-xs font-black text-[#C83888]">
        {number}
      </p>

      <p className="font-mono text-xs text-black/45 leading-relaxed">{text}</p>
    </div>
  );
}

function FeatureBox({
  icon: Icon,
  title,
  text,
}: {
  icon: ElementType;
  title: string;
  text: string;
}) {
  return (
    <div className="border border-black/10 bg-white p-5">
      <Icon size={19} className="text-[#3898E8] mb-4" />

      <p className="font-orbitron text-sm font-bold uppercase mb-2">{title}</p>

      <p className="font-mono text-xs text-black/40">{text}</p>
    </div>
  );
}
