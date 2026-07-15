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

const rules: Rule[] = [
  {
    title: "Official First",
    status: "Rule",
    text: "XRPL, Ripple, Xaman, GitHub, BIS, IMF, SWIFT en centrale bank bronnen wegen zwaarder dan media of social claims.",
    icon: ShieldCheck,
  },
  {
    title: "No Trading Signals",
    status: "Guard",
    text: "Deze intelligence is education-only. Geen koopadvies, prijsvoorspelling of winstbelofte.",
    icon: AlertTriangle,
  },
  {
    title: "Macro Needs Context",
    status: "CBDC / BRICS",
    text: "CBDC, BRICS en ISO 20022 signalen zijn macro context. Niet automatisch bewijs dat XRP of XRPL gebruikt wordt.",
    icon: Globe2,
  },
  {
    title: "Verify Before Posting",
    status: "Social",
    text: "Gebruik bron, datum, confidence en needs-confirmation voordat je iets op X, TikTok of LinkedIn zet.",
    icon: FileSearch,
  },
];

const emptyItem: XrplIntelItem = {
  title: "No intelligence item selected",
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
  whyItMatters: "Load the intelligence feed and select an item.",
  description: "Waiting for live XRPL Intelligence data.",
};

export function LedgerIntelTab() {
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
          : "XRPL Intelligence feed kon niet worden geladen.",
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
      label: "Live Items",
      value: loading ? "..." : String(items.length),
      text: data?.fallback ? "Fallback mode" : "Fetched now",
      icon: Newspaper,
    },
    {
      label: "Official",
      value: loading ? "..." : String(officialCount),
      text: "Source weighted",
      icon: ShieldCheck,
    },
    {
      label: "Needs Review",
      value: loading ? "..." : String(reviewCount),
      text: "Verify before post",
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
                Live intelligence laag voor XRPL, XRP, Ripple, Xaman, XLS,
                amendments, CBDC, BRICS, ISO 20022, RWA en payments. Gebouwd
                voor awareness, niet voor trading signals.
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
                    {refreshing ? "Refreshing" : "Refresh Intel"}
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
                  Intelligence Feed Error
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
                  Buckets
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
                  Daily Brief
                </p>
              </div>

              <p className="font-orbitron text-lg font-black uppercase mb-3">
                {data?.brief?.title ?? "XRPL Intelligence Daily Brief"}
              </p>

              <p className="font-mono text-xs text-black/55 leading-relaxed mb-4">
                {data?.brief?.summary ??
                  "Feed laden. Daily brief verschijnt zodra /api/news antwoord geeft."}
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
                    Fallback active — live feeds konden niet schoon worden
                    opgehaald.
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
                    Live Feed
                  </p>

                  <h3 className="font-orbitron text-xl font-black uppercase">
                    {selectedBucket === "All" ? "All Intelligence" : selectedBucket}
                  </h3>
                </div>

                <FileSearch size={20} className="text-[#3898E8]" />
              </div>

              {loading ? (
                <LoadingPanel />
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
                <EmptyPanel />
              )}
            </div>

            <div className="border border-black/10 bg-white p-6">
              <div className="flex items-center gap-2 mb-5">
                <BookOpen size={18} className="text-[#3898E8]" />

                <p className="font-orbitron text-xs uppercase tracking-widest">
                  Selected Intelligence
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge label={selectedItem.bucket} />
                <Badge label={getSourceTypeLabel(selectedItem.sourceType)} />
                <Badge label={selectedItem.signalType} />

                {selectedItem.officialSource ? (
                  <Badge label="Official Weighted" />
                ) : (
                  <Badge label="Secondary / Review" />
                )}

                {selectedItem.needsConfirmation && (
                  <Badge label="Needs Confirmation" tone="warn" />
                )}
              </div>

              <h3 className="font-orbitron text-2xl font-black uppercase mb-3 leading-tight">
                {selectedItem.title}
              </h3>

              <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-4">
                {selectedItem.source} • {formatIntelDate(selectedItem.pubDate)}
              </p>

              <p className="font-mono text-sm text-black/55 leading-relaxed mb-5">
                {selectedItem.description || "Geen beschrijving meegeleverd."}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
                <MiniStatus
                  label="Confidence"
                  value={`${selectedItem.confidenceScore}% ${getConfidenceLabel(
                    selectedItem.confidenceScore,
                  )}`}
                />
                <MiniStatus
                  label="Source Type"
                  value={getSourceTypeLabel(selectedItem.sourceType)}
                />
                <MiniStatus
                  label="Review"
                  value={selectedItem.needsConfirmation ? "Required" : "Low"}
                />
              </div>

              <div className="border border-black/10 bg-[#F7F8FC] p-4 mb-5">
                <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">
                  Why it matters
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
                  Open Source
                </span>
              </a>
            </div>
          </div>

          <div className="col-span-12 xl:col-span-3 space-y-4">
            <div className="border border-black/10 bg-white p-6">
              <div className="flex items-center gap-2 mb-5">
                <ShieldCheck size={18} className="text-[#3898E8]" />

                <p className="font-orbitron text-xs uppercase tracking-widest">
                  Intel Rules
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
                  Source Health
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
                    Source debug verschijnt na live fetch.
                  </p>
                )}
              </div>
            </div>

            <div className="border border-black/10 bg-white p-6">
              <div className="flex items-center gap-2 mb-5">
                <Zap size={18} className="text-[#3898E8]" />

                <p className="font-orbitron text-xs uppercase tracking-widest">
                  Next Layer
                </p>
              </div>

              <div className="space-y-3">
                <StepLine number="01" text="NewsTab wordt later social output." />
                <StepLine number="02" text="OTTIntelligence wordt later AI agent layer." />
                <StepLine number="03" text="Dashboard kan later daily brief tonen." />
                <StepLine number="04" text="No auto-posting without human review." />
              </div>
            </div>
          </div>

          <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
            <FeatureBox icon={Globe2} title="XRPL" text="Core, XLS, amendments" />
            <FeatureBox icon={Landmark} title="Macro" text="CBDC, ISO, BRICS" />
            <FeatureBox icon={BarChart3} title="Signals" text="Context, not trades" />
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

function LoadingPanel() {
  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-6">
      <RefreshCcw size={18} className="text-[#3898E8] animate-spin mb-4" />

      <p className="font-orbitron text-sm font-black uppercase mb-2">
        Loading XRPL Intelligence
      </p>

      <p className="font-mono text-xs text-black/45 leading-relaxed">
        Fetching official, technical and institutional sources from /api/news.
      </p>
    </div>
  );
}

function EmptyPanel() {
  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-6">
      <AlertTriangle size={18} className="text-[#D84858] mb-4" />

      <p className="font-orbitron text-sm font-black uppercase mb-2">
        No items in this bucket
      </p>

      <p className="font-mono text-xs text-black/45 leading-relaxed">
        Select another bucket or refresh the intelligence feed.
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
