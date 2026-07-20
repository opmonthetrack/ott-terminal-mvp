import { useEffect, useMemo, useState } from "react";
import type { ElementType, ReactNode } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  CheckCircle2,
  Database,
  Eye,
  FileSearch,
  Fingerprint,
  Layers,
  Loader2,
  Newspaper,
  Radio,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import {
  fetchXrplIntelligence,
  formatIntelDate,
  getConfidenceLabel,
  getIntelBuckets,
  getSourceTypeLabel,
  type XrplIntelItem,
  type XrplIntelResponse,
} from "../lib/newsClient";

type MetricCard = {
  label: string;
  value: string;
  text: string;
  icon: ElementType;
};

type QuickRoute = {
  title: string;
  status: string;
  text: string;
  icon: ElementType;
  tabId: string;
};

type DashboardTabProps = {
  onNavigate?: (tabId: string) => void;
};

const SOURCE_TAG = 2606170002;
const TERMINAL_URL = "https://ott-terminal-mvp.vercel.app";

const quickRoutes: QuickRoute[] = [
  {
    title: "XRPL Intelligence",
    status: "Raw Feed",
    text: "Open de bronlaag met buckets, source health en live intelligence items.",
    icon: Radio,
    tabId: "intel",
  },
  {
    title: "Newsroom",
    status: "Social",
    text: "Maak copy-ready drafts voor X, LinkedIn, Instagram, Medium en meer.",
    icon: Newspaper,
    tabId: "news",
  },
  {
    title: "OTT Intelligence",
    status: "AI Studio",
    text: "Analyseer elk item met builder lens, risico-context en verify checklist.",
    icon: Sparkles,
    tabId: "ottintelligence",
  },
  {
    title: "Reward Ledger",
    status: "XP",
    text: "Bekijk lokale XP, OTT Credits en Make Waves proof context.",
    icon: BookOpen,
    tabId: "rewardledger",
  },
];

const emptyItem: XrplIntelItem = {
  title: "No intelligence loaded yet",
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
  whyItMatters: "Load the daily snapshot to see today’s top signal.",
  description: "Waiting for /api/news intelligence data.",
};

export function DashboardTab({ onNavigate }: DashboardTabProps) {
  const [data, setData] = useState<XrplIntelResponse | null>(null);
  const [items, setItems] = useState<XrplIntelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function loadDashboard(mode: "initial" | "refresh" = "initial") {
    try {
      setError("");

      if (mode === "initial") {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const response = await fetchXrplIntelligence({ limit: 12 });
      setData(response);
      setItems(response.items);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Daily Intelligence Snapshot kon niet worden geladen.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadDashboard("initial");
  }, []);

  const topItem = items[0] ?? emptyItem;
  const buckets = useMemo(() => getIntelBuckets(items).slice(0, 5), [items]);
  const officialCount = useMemo(
    () => items.filter((item) => item.officialSource).length,
    [items],
  );
  const reviewCount = useMemo(
    () => items.filter((item) => item.needsConfirmation).length,
    [items],
  );
  const technicalCount = useMemo(
    () => items.filter((item) => item.signalType === "technical-signal").length,
    [items],
  );

  const metrics: MetricCard[] = [
    {
      label: "Live Items",
      value: loading ? "..." : String(items.length),
      text: data?.fallback ? "Fallback active" : "Daily feed",
      icon: Newspaper,
    },
    {
      label: "Official Sources",
      value: loading ? "..." : String(officialCount),
      text: "Source weighted",
      icon: ShieldCheck,
    },
    {
      label: "Tech Signals",
      value: loading ? "..." : String(technicalCount),
      text: "XLS / Core / Protocol",
      icon: Layers,
    },
    {
      label: "SourceTag",
      value: String(data?.sourceTag ?? SOURCE_TAG),
      text: "Make Waves",
      icon: Fingerprint,
    },
  ];

  function openSource() {
    if (!topItem.link || topItem.link === "#") {
      setError("No source link available for today’s top signal.");
      return;
    }

    window.open(topItem.link, "_blank", "noopener,noreferrer");
  }

  function goTo(tabId: string) {
    if (onNavigate) {
      onNavigate(tabId);
      return;
    }

    window.location.hash = tabId;
  }

  return (
    <div className="min-h-screen bg-white text-[#080808]">
      <div className="p-6">
        <div className="relative overflow-hidden border border-black/10 bg-white p-6 mb-6">
          <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_top_right,_#3898E8,_transparent_34%),radial-gradient(circle_at_bottom_left,_#C83888,_transparent_32%)]" />

          <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
            <div className="col-span-12 xl:col-span-8">
              <div className="flex items-center gap-2 mb-4 text-black/45">
                <Database size={17} />

                <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                  OTT Command Dashboard
                </p>
              </div>

              <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
                Daily Intelligence Snapshot
              </h2>

              <p className="font-mono text-sm text-black/55 max-w-3xl leading-relaxed">
                Eén dashboard voor de dagelijkse XRPL Intelligence-flow: top
                signal, source health, buckets en snelle routes naar Intelligence,
                Newsroom en OTT AI Studio.
              </p>

              <div className="flex flex-wrap gap-3 mt-5">
                <button
                  onClick={() => void loadDashboard("refresh")}
                  disabled={loading || refreshing}
                  className="inline-flex items-center gap-2 bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] text-white px-4 py-3 hover:brightness-95 transition-all disabled:opacity-50"
                >
                  <RefreshCcw
                    size={16}
                    className={refreshing ? "animate-spin" : ""}
                  />

                  <span className="font-orbitron text-xs font-black uppercase">
                    {refreshing ? "Refreshing" : "Refresh Snapshot"}
                  </span>
                </button>

                <button
                  onClick={openSource}
                  className="inline-flex items-center gap-2 border border-black/10 bg-[#F7F8FC] px-4 py-3 hover:bg-white transition-all"
                >
                  <ArrowUpRight size={16} className="text-[#3898E8]" />

                  <span className="font-orbitron text-xs font-bold uppercase">
                    Open Top Source
                  </span>
                </button>
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

              <p className="font-mono text-xs text-black/60 leading-relaxed">
                {error}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-5 space-y-4">
            <Panel title="Today’s Top Signal" icon={Radio}>
              {loading ? (
                <div className="border border-black/10 bg-[#F7F8FC] p-5">
                  <Loader2 size={18} className="text-[#3898E8] animate-spin mb-4" />
                  <p className="font-mono text-xs text-black/45">
                    Loading /api/news daily snapshot...
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge label={topItem.bucket} />
                    <Badge label={getSourceTypeLabel(topItem.sourceType)} />
                    <Badge
                      label={`${topItem.confidenceScore}% ${getConfidenceLabel(
                        topItem.confidenceScore,
                      )}`}
                    />
                    {topItem.needsConfirmation && <Badge label="Needs review" tone="warn" />}
                  </div>

                  <h3 className="font-orbitron text-2xl font-black uppercase mb-3 leading-tight">
                    {topItem.title}
                  </h3>

                  <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-4">
                    {topItem.source} • {formatIntelDate(topItem.pubDate)}
                  </p>

                  <p className="font-mono text-sm text-black/55 leading-relaxed mb-4">
                    {topItem.description}
                  </p>

                  <div className="border border-black/10 bg-[#F7F8FC] p-4 mb-4">
                    <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">
                      Why it matters
                    </p>

                    <p className="font-mono text-xs text-black/55 leading-relaxed">
                      {topItem.whyItMatters}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <MiniBox label="Bucket" value={topItem.bucket} />
                    <MiniBox label="Signal" value={topItem.signalType} />
                    <MiniBox label="Review" value={topItem.needsConfirmation ? "Required" : "Low"} />
                  </div>
                </div>
              )}
            </Panel>

            <Panel title="Source Health" icon={Eye}>
              <div className="space-y-3">
                {(data?.debug ?? []).slice(0, 7).map((source) => (
                  <div
                    key={`${source.source}-${source.category}`}
                    className="border border-black/10 bg-[#F7F8FC] p-3 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-orbitron text-[10px] font-bold uppercase">
                        {source.source}
                      </p>
                      <p className="font-mono text-[10px] text-black/35 uppercase mt-1">
                        {source.sourceType ?? "source"} • {source.category ?? "feed"}
                      </p>
                    </div>

                    <p className="font-orbitron text-xs font-black text-[#3898E8]">
                      {source.count}
                    </p>
                  </div>
                ))}

                {!data?.debug?.length && (
                  <p className="font-mono text-xs text-black/45 leading-relaxed">
                    Source health verschijnt na live fetch.
                  </p>
                )}
              </div>
            </Panel>
          </div>

          <div className="col-span-12 xl:col-span-4 space-y-4">
            <Panel title="Top Buckets" icon={BarChart3}>
              <div className="space-y-3">
                {buckets.map((bucket) => (
                  <div
                    key={bucket.bucket}
                    className="border border-black/10 bg-[#F7F8FC] p-4"
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <p className="font-orbitron text-xs font-bold uppercase">
                        {bucket.bucket}
                      </p>

                      <p className="font-mono text-[10px] text-black/45 uppercase">
                        {bucket.count}
                      </p>
                    </div>

                    <div className="h-2 bg-white border border-black/10 overflow-hidden">
                      <div
                        className="h-full bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_48%,#C83888_100%)]"
                        style={{
                          width: `${Math.max(
                            10,
                            Math.min(100, (bucket.count / Math.max(1, items.length)) * 100),
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Signal Queue" icon={FileSearch}>
              <div className="space-y-3">
                {items.slice(0, 5).map((item) => (
                  <button
                    key={`${item.link}-${item.title}`}
                    onClick={() => window.open(item.link, "_blank", "noopener,noreferrer")}
                    className="w-full border border-black/10 bg-[#F7F8FC] p-3 text-left hover:bg-white transition-all"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="font-orbitron text-[10px] font-bold uppercase leading-snug">
                        {item.title}
                      </p>

                      <ArrowUpRight size={14} className="text-[#3898E8] shrink-0" />
                    </div>

                    <p className="font-mono text-[10px] text-black/35 uppercase">
                      {item.source} • {item.bucket}
                    </p>
                  </button>
                ))}
              </div>
            </Panel>
          </div>

          <div className="col-span-12 xl:col-span-3 space-y-4">
            <Panel title="Quick Actions" icon={Zap}>
              <div className="space-y-3">
                {quickRoutes.map((route) => (
                  <QuickAction key={route.title} route={route} onClick={() => goTo(route.tabId)} />
                ))}
              </div>
            </Panel>

            <Panel title="Safety Position" icon={ShieldCheck}>
              <div className="space-y-3">
                <SafetyLine icon={CheckCircle2} text="Education-first intelligence." />
                <SafetyLine icon={CheckCircle2} text="No financial advice or trading signals." />
                <SafetyLine icon={CheckCircle2} text="SourceTag 2606170002 remains visible." />
                <SafetyLine icon={CheckCircle2} text="Human review before publishing." />
              </div>
            </Panel>

            <Panel title="Build Status" icon={Bell}>
              <div className="space-y-3">
                <MiniBox label="Terminal" value="V1 Live" />
                <MiniBox label="News API" value={data?.fallback ? "Fallback" : "Live"} />
                <MiniBox label="Public URL" value={TERMINAL_URL.replace("https://", "")} />
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricBox({ metric }: { metric: MetricCard }) {
  const Icon = metric.icon;

  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-4">
      <Icon size={18} className="text-[#3898E8] mb-3" />

      <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">
        {metric.label}
      </p>

      <p className="font-orbitron text-sm font-black uppercase break-all mb-1">
        {metric.value}
      </p>

      <p className="font-mono text-[10px] text-black/35 uppercase">
        {metric.text}
      </p>
    </div>
  );
}

function Panel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: ElementType;
  children: ReactNode;
}) {
  return (
    <div className="border border-black/10 bg-white p-6">
      <div className="flex items-center gap-2 mb-5">
        <Icon size={18} className="text-[#3898E8]" />

        <p className="font-orbitron text-xs uppercase tracking-widest">
          {title}
        </p>
      </div>

      {children}
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

function MiniBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-4">
      <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">
        {label}
      </p>

      <p className="font-orbitron text-xs font-black uppercase break-words">
        {value}
      </p>
    </div>
  );
}

function QuickAction({ route, onClick }: { route: QuickRoute; onClick: () => void }) {
  const Icon = route.icon;

  return (
    <button
      onClick={onClick}
      className="w-full border border-black/10 bg-[#F7F8FC] p-4 text-left hover:bg-white transition-all"
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          <Icon size={16} className="text-[#3898E8]" />
          <p className="font-orbitron text-xs font-bold uppercase">
            {route.title}
          </p>
        </div>

        <p className="font-mono text-[10px] text-black/35 uppercase">
          {route.status}
        </p>
      </div>

      <p className="font-mono text-[10px] text-black/45 leading-relaxed">
        {route.text}
      </p>
    </button>
  );
}

function SafetyLine({ icon: Icon, text }: { icon: ElementType; text: string }) {
  return (
    <div className="flex items-start gap-3 border border-black/10 bg-[#F7F8FC] p-3">
      <Icon size={15} className="text-[#3898E8] mt-0.5" />
      <p className="font-mono text-xs text-black/45 leading-relaxed">{text}</p>
    </div>
  );
}
