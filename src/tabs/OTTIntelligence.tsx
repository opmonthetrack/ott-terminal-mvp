import { useEffect, useMemo, useState } from "react";
import type { ElementType, ReactNode } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Bot,
  Brain,
  CheckCircle2,
  Clipboard,
  ExternalLink,
  Eye,
  FileSearch,
  Globe2,
  Lightbulb,
  Loader2,
  Radio,
  RefreshCcw,
  Search,
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

type AnalysisMode = "builder" | "beginner" | "risk" | "content" | "verify";

type AnalysisOption = {
  id: AnalysisMode;
  title: string;
  status: string;
  icon: ElementType;
  text: string;
};

type ScoreCard = {
  label: string;
  value: string;
  text: string;
  icon: ElementType;
};

const SOURCE_TAG = 2606170002;
const TERMINAL_URL = "https://ott-terminal-mvp.vercel.app";

const analysisOptions: AnalysisOption[] = [
  {
    id: "builder",
    title: "Builder Lens",
    status: "Impact",
    icon: Brain,
    text: "Wat betekent dit voor XRPL builders, dApps, standards of tooling?",
  },
  {
    id: "beginner",
    title: "Beginner Explain",
    status: "Simple",
    icon: BookOpen,
    text: "Leg het uit alsof iemand net met XRPL begint.",
  },
  {
    id: "risk",
    title: "Risk Context",
    status: "Safe",
    icon: ShieldCheck,
    text: "Welke claims zijn veilig, welke hebben extra verificatie nodig?",
  },
  {
    id: "content",
    title: "Content Angle",
    status: "Reach",
    icon: Sparkles,
    text: "Welke hook, angle en CTA passen bij dit item?",
  },
  {
    id: "verify",
    title: "Verify Checklist",
    status: "Check",
    icon: FileSearch,
    text: "Wat moet je controleren voordat je dit deelt of publiceert?",
  },
];

const emptyItem: XrplIntelItem = {
  title: "No intelligence selected",
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
  description: "Waiting for live intelligence data.",
};

export function OTTIntelligence() {
  const [data, setData] = useState<XrplIntelResponse | null>(null);
  const [items, setItems] = useState<XrplIntelItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<XrplIntelItem>(emptyItem);
  const [selectedMode, setSelectedMode] = useState<AnalysisMode>("builder");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function loadIntel(mode: "initial" | "refresh" = "initial") {
    try {
      setError("");

      if (mode === "initial") {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const response = await fetchXrplIntelligence({ limit: 18 });
      setData(response);
      setItems(response.items);
      setSelectedItem(response.items[0] ?? emptyItem);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "OTT Intelligence feed kon niet worden geladen.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadIntel("initial");
  }, []);

  const buckets = useMemo(() => getIntelBuckets(items).slice(0, 6), [items]);

  const selectedOption =
    analysisOptions.find((option) => option.id === selectedMode) ?? analysisOptions[0];

  const analysisText = useMemo(
    () => buildAnalysisOutput(selectedItem, selectedMode),
    [selectedItem, selectedMode],
  );

  const scores = useMemo(() => buildScores(selectedItem), [selectedItem]);

  async function copyAnalysis() {
    try {
      await navigator.clipboard.writeText(analysisText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setError("Copy failed. Select the text manually and copy it.");
    }
  }

  function openSource() {
    if (!selectedItem.link || selectedItem.link === "#") {
      setError("No source link available for this item.");
      return;
    }

    window.open(selectedItem.link, "_blank", "noopener,noreferrer");
  }

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
                  AI Intelligence Studio
                </p>
              </div>

              <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
                Analyse Before You Post
              </h2>

              <p className="font-mono text-sm text-black/55 max-w-3xl leading-relaxed">
                Analyseer XRPL Intelligence items voordat je ze omzet naar content.
                Deze studio helpt met beginner-uitleg, builder-impact, risico-context,
                verify-checks en bereik-veilige angles. Geen auto-posting, geen trading signals.
              </p>

              <div className="flex flex-wrap gap-3 mt-5">
                <ActionButton
                  icon={RefreshCcw}
                  label={refreshing ? "Refreshing" : "Refresh Studio"}
                  onClick={() => void loadIntel("refresh")}
                  disabled={loading || refreshing}
                  gradient
                  spinning={refreshing}
                />

                <ActionButton
                  icon={Clipboard}
                  label={copied ? "Copied" : "Copy Analysis"}
                  onClick={copyAnalysis}
                />

                <ActionButton icon={ExternalLink} label="Open Source" onClick={openSource} />
              </div>
            </div>

            <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-3">
              <StatBox icon={Bot} label="Mode" value={selectedOption.status} />
              <StatBox icon={Target} label="SourceTag" value={String(data?.sourceTag ?? SOURCE_TAG)} />
              <StatBox icon={CheckCircle2} label="Fallback" value={data?.fallback ? "Yes" : "No"} />
              <StatBox icon={BarChart3} label="Items" value={loading ? "..." : String(items.length)} />
            </div>
          </div>
        </div>

        {error && (
          <div className="border border-[#D84858]/30 bg-[#D84858]/10 p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-[#D84858] mt-0.5" />

              <p className="font-mono text-xs text-black/60 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-3 space-y-4">
            <Panel title="Analysis Modes" icon={Zap}>
              <div className="space-y-3">
                {analysisOptions.map((option) => (
                  <ModeButton
                    key={option.id}
                    option={option}
                    active={selectedMode === option.id}
                    onClick={() => setSelectedMode(option.id)}
                  />
                ))}
              </div>
            </Panel>

            <Panel title="Buckets" icon={Search}>
              <div className="space-y-3">
                {buckets.map((bucket) => (
                  <div
                    key={bucket.bucket}
                    className="border border-black/10 bg-[#F7F8FC] p-3 flex items-center justify-between gap-3"
                  >
                    <p className="font-orbitron text-[10px] font-bold uppercase">
                      {bucket.bucket}
                    </p>

                    <p className="font-mono text-[10px] text-black/45 uppercase">
                      {bucket.count}
                    </p>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <div className="col-span-12 xl:col-span-5 space-y-4">
            <Panel title="Intelligence Queue" icon={FileSearch}>
              {loading ? (
                <div className="border border-black/10 bg-[#F7F8FC] p-5">
                  <Loader2 size={18} className="text-[#3898E8] animate-spin mb-4" />

                  <p className="font-mono text-xs text-black/45">
                    Loading /api/news intelligence...
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <IntelRow
                      key={`${item.link}-${item.title}`}
                      item={item}
                      active={selectedItem.link === item.link}
                      onClick={() => setSelectedItem(item)}
                    />
                  ))}
                </div>
              )}
            </Panel>

            <Panel title="Selected Item" icon={BookOpen}>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge label={selectedItem.bucket} />
                <Badge label={getSourceTypeLabel(selectedItem.sourceType)} />
                <Badge label={`${selectedItem.confidenceScore}% ${getConfidenceLabel(selectedItem.confidenceScore)}`} />
                {selectedItem.needsConfirmation && <Badge label="Needs review" tone="warn" />}
              </div>

              <h3 className="font-orbitron text-2xl font-black uppercase mb-3 leading-tight">
                {selectedItem.title}
              </h3>

              <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-4">
                {selectedItem.source} • {formatIntelDate(selectedItem.pubDate)}
              </p>

              <p className="font-mono text-sm text-black/55 leading-relaxed mb-4">
                {selectedItem.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                {scores.map((score) => (
                  <ScoreBox key={score.label} score={score} />
                ))}
              </div>

              <div className="border border-black/10 bg-[#F7F8FC] p-4">
                <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">
                  Why it matters
                </p>

                <p className="font-mono text-xs text-black/55 leading-relaxed">
                  {selectedItem.whyItMatters}
                </p>
              </div>
            </Panel>
          </div>

          <div className="col-span-12 xl:col-span-4 space-y-4">
            <Panel title={`${selectedOption.title} Output`} icon={selectedOption.icon}>
              <div className="border border-black/10 bg-[#F7F8FC] p-5 min-h-[420px]">
                <pre className="font-mono text-xs text-black/65 whitespace-pre-wrap leading-relaxed">
                  {analysisText}
                </pre>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <ActionButton icon={Clipboard} label="Copy" onClick={copyAnalysis} />
                <ActionButton icon={ArrowUpRight} label="Open Source" onClick={openSource} />
              </div>
            </Panel>

            <Panel title="AI Studio Rules" icon={ShieldCheck}>
              <div className="space-y-3">
                <RuleLine icon={Eye} title="Human review" text="Gebruik dit als analysehulp. Jij controleert de bron en context vóór publicatie." />
                <RuleLine icon={Globe2} title="Macro context" text="CBDC, ISO en BRICS signalen zijn context, geen automatisch XRPL/XRP bewijs." />
                <RuleLine icon={AlertTriangle} title="No financial advice" text="Geen trading signal, prijsverwachting of belofte van adoptie/winst." />
              </div>
            </Panel>
          </div>

          <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
            <FeatureBox icon={Brain} title="Analyse" text="Builder impact and context" />
            <FeatureBox icon={BookOpen} title="Explain" text="Beginner-friendly notes" />
            <FeatureBox icon={ShieldCheck} title="Verify" text="Checklist before posting" />
            <FeatureBox icon={Lightbulb} title="Angle" text="Reach without hype" />
          </div>
        </div>
      </div>
    </div>
  );
}

function buildScores(item: XrplIntelItem): ScoreCard[] {
  const safetyScore = item.needsConfirmation ? "Medium" : item.confidenceScore >= 85 ? "High" : "Review";
  const reachScore = item.bucket.includes("XLS") || item.bucket.includes("XRPL") ? "Builder" : item.bucket.includes("CBDC") || item.bucket.includes("ISO") ? "Macro" : "Community";
  const complexityScore = item.bucket.includes("XLS") || item.title.toLowerCase().includes("mpt") ? "Advanced" : item.bucket.includes("CBDC") ? "Context" : "Medium";

  return [
    {
      label: "Safety",
      value: safetyScore,
      text: item.needsConfirmation ? "Needs extra source check" : "Source-weighted",
      icon: ShieldCheck,
    },
    {
      label: "Audience",
      value: reachScore,
      text: "Best matching angle",
      icon: Target,
    },
    {
      label: "Complexity",
      value: complexityScore,
      text: "Explain before posting",
      icon: Brain,
    },
  ];
}

function buildAnalysisOutput(item: XrplIntelItem, mode: AnalysisMode) {
  const date = formatIntelDate(item.pubDate);
  const sourceLine = `${item.source} (${getSourceTypeLabel(item.sourceType)})`;
  const tags = item.tags.length > 0 ? item.tags.map((tag) => `#${tag.replace(/\s+/g, "")}`).join(" ") : "#XRPL #OnTheTrack";

  if (mode === "beginner") {
    return `BEGINNER EXPLAINER\n\nTopic:\n${item.title}\n\nSimple meaning:\nThis is a signal from ${sourceLine}. It belongs to ${item.bucket}.\n\nPlain explanation:\n${item.description}\n\nWhy someone new should care:\n${item.whyItMatters}\n\nWhat not to assume:\n- This is not financial advice.\n- This is not a price prediction.\n- Macro items do not automatically mean XRP/XRPL adoption.\n\nSource date: ${date}\n${tags}`;
  }

  if (mode === "risk") {
    return `RISK / CONTEXT REVIEW\n\nItem:\n${item.title}\n\nSource:\n${sourceLine}\nDate: ${date}\nConfidence: ${item.confidenceScore}%\nNeeds confirmation: ${item.needsConfirmation ? "Yes" : "No"}\n\nSafe to say:\n- Source published or referenced this item.\n- It is relevant to ${item.bucket}.\n- It may matter because: ${item.whyItMatters}\n\nDo NOT say:\n- This guarantees adoption.\n- This is a buy/sell signal.\n- This confirms XRP/XRPL usage unless the source explicitly says so.\n\nReview before posting:\n- Open original source.\n- Check date.\n- Check whether it is official, technical, institutional or media.\n- Remove hype language.`;
  }

  if (mode === "content") {
    return `CONTENT ANGLE\n\nBest hook:\n🚨 Most people watch price. Builders watch infrastructure.\n\nPost angle:\n${item.title}\n\nWhy this can work:\n- It is source-based.\n- It connects to ${item.bucket}.\n- It can educate without hype.\n\nSuggested caption direction:\n${item.whyItMatters}\n\nCTA:\nOpen the source. Learn the rails. Stay 589 steps ahead.\n\nSuggested hashtags:\n${tags} #TruthOnTheTrack #OnTheTrack\n\nAttribution:\nPowered by XRPL OnTheTrack Terminal\nSourceTag 2606170002\n${TERMINAL_URL}`;
  }

  if (mode === "verify") {
    return `VERIFY BEFORE POSTING\n\n1. Open source\n${item.link}\n\n2. Confirm source type\n${sourceLine}\n\n3. Confirm date\n${date}\n\n4. Confirm claim level\n- Is it official? ${item.officialSource ? "Yes" : "No"}\n- Needs extra confirmation? ${item.needsConfirmation ? "Yes" : "No"}\n\n5. Remove unsafe claims\n- No guaranteed adoption.\n- No price prediction.\n- No trading signal.\n- No macro = XRP assumption.\n\n6. Publish as education/context only\nBucket: ${item.bucket}\nConfidence: ${item.confidenceScore}%`;
  }

  return `BUILDER LENS\n\nItem:\n${item.title}\n\nSource:\n${sourceLine}\nDate: ${date}\nBucket: ${item.bucket}\nConfidence: ${item.confidenceScore}%\n\nBuilder impact:\n${item.whyItMatters}\n\nTechnical/context note:\n${item.description}\n\nWhat builders should watch next:\n- Does this affect standards, tooling, wallets or integrations?\n- Does it create a new education module for Academy?\n- Does it deserve a Newsroom post or Medium article?\n- Does it need another source before posting?\n\nSafe framing:\nEducation-first. Source-first. No hype. No trading signal.\n\n${tags}`;
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  gradient = false,
  spinning = false,
}: {
  icon: ElementType;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  gradient?: boolean;
  spinning?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 px-4 py-3 transition-all disabled:opacity-50 ${
        gradient
          ? "bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] text-white hover:brightness-95"
          : "border border-black/10 bg-[#F7F8FC] hover:bg-white"
      }`}
    >
      <Icon size={16} className={spinning ? "animate-spin" : "text-[#3898E8]"} />

      <span className="font-orbitron text-xs font-bold uppercase">{label}</span>
    </button>
  );
}

function StatBox({ icon: Icon, label, value }: { icon: ElementType; label: string; value: string }) {
  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-4">
      <Icon size={18} className="text-[#3898E8] mb-3" />
      <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">{label}</p>
      <p className="font-orbitron text-sm font-black uppercase break-all">{value}</p>
    </div>
  );
}

function ScoreBox({ score }: { score: ScoreCard }) {
  const Icon = score.icon;

  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-4">
      <Icon size={17} className="text-[#3898E8] mb-3" />
      <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">{score.label}</p>
      <p className="font-orbitron text-sm font-black uppercase mb-1">{score.value}</p>
      <p className="font-mono text-[10px] text-black/45 leading-relaxed">{score.text}</p>
    </div>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon: ElementType; children: ReactNode }) {
  return (
    <div className="border border-black/10 bg-white p-6">
      <div className="flex items-center gap-2 mb-5">
        <Icon size={18} className="text-[#3898E8]" />
        <p className="font-orbitron text-xs uppercase tracking-widest">{title}</p>
      </div>
      {children}
    </div>
  );
}

function ModeButton({ option, active, onClick }: { option: AnalysisOption; active: boolean; onClick: () => void }) {
  const Icon = option.icon;

  return (
    <button
      onClick={onClick}
      className={`w-full border p-4 text-left transition-all ${
        active ? "border-[#3898E8]/40 bg-[#3898E8]/10" : "border-black/10 bg-[#F7F8FC] hover:bg-white"
      }`}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          <Icon size={16} className="text-[#3898E8]" />
          <p className="font-orbitron text-xs font-bold uppercase">{option.title}</p>
        </div>
        <p className="font-mono text-[10px] text-black/35 uppercase">{option.status}</p>
      </div>
      <p className="font-mono text-[10px] text-black/45 leading-relaxed">{option.text}</p>
    </button>
  );
}

function IntelRow({ item, active, onClick }: { item: XrplIntelItem; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full border p-4 text-left transition-all ${
        active ? "border-[#3898E8]/40 bg-[#3898E8]/10" : "border-black/10 bg-[#F7F8FC] hover:bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="font-orbitron text-sm font-bold uppercase leading-snug">{item.title}</p>
        <p className="font-mono text-[10px] text-black/45 uppercase">{item.confidenceScore}%</p>
      </div>
      <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">
        {item.source} • {item.bucket}
      </p>
      <p className="font-mono text-xs text-black/50 leading-relaxed">{item.whyItMatters}</p>
    </button>
  );
}

function RuleLine({ icon: Icon, title, text }: { icon: ElementType; title: string; text: string }) {
  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-4">
      <Icon size={17} className="text-[#3898E8] mb-3" />
      <p className="font-orbitron text-xs font-bold uppercase mb-2">{title}</p>
      <p className="font-mono text-[10px] text-black/45 leading-relaxed">{text}</p>
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

function FeatureBox({ icon: Icon, title, text }: { icon: ElementType; title: string; text: string }) {
  return (
    <div className="border border-black/10 bg-white p-5">
      <Icon size={19} className="text-[#3898E8] mb-4" />
      <p className="font-orbitron text-sm font-bold uppercase mb-2">{title}</p>
      <p className="font-mono text-xs text-black/40">{text}</p>
    </div>
  );
}