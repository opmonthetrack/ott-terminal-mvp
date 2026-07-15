import { useEffect, useMemo, useState } from "react";
import type { ElementType } from "react";
import {
  AlertTriangle,
  Bell,
  BookOpen,
  CheckCircle2,
  Clipboard,
  FileSearch,
  Globe2,
  Linkedin,
  Loader2,
  MessageCircle,
  Newspaper,
  Radio,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Video,
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

type OutputMode = "x" | "linkedin" | "tiktok" | "whatsapp" | "youtube";

type OutputOption = {
  id: OutputMode;
  title: string;
  status: string;
  icon: ElementType;
  text: string;
};

type Rule = {
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

const SOURCE_TAG = 2606170002;

const outputOptions: OutputOption[] = [
  {
    id: "x",
    title: "X Post",
    status: "Short",
    icon: Newspaper,
    text: "Korte post met source, context en no-hype framing.",
  },
  {
    id: "linkedin",
    title: "LinkedIn",
    status: "Pro",
    icon: Linkedin,
    text: "Zakelijke caption met infrastructuur-context en builder angle.",
  },
  {
    id: "tiktok",
    title: "TikTok Hook",
    status: "Hook",
    icon: Video,
    text: "Snelle hook + 3 talking points voor short-form video.",
  },
  {
    id: "whatsapp",
    title: "WhatsApp Status",
    status: "Status",
    icon: MessageCircle,
    text: "Compacte update voor community en status sharing.",
  },
  {
    id: "youtube",
    title: "YouTube Bullets",
    status: "Video",
    icon: BookOpen,
    text: "Bullet flow voor korte video of livestream segment.",
  },
];

const rules: Rule[] = [
  {
    title: "Source First",
    status: "Rule",
    text: "Elke output noemt bron, datum en context. Geen losse claims zonder herleidbare bron.",
    icon: FileSearch,
  },
  {
    title: "No Hype",
    status: "Guard",
    text: "Geen prijsvoorspellingen, koopadvies, gegarandeerde adoptie of winstbelofte.",
    icon: AlertTriangle,
  },
  {
    title: "Macro Context",
    status: "CBDC / ISO",
    text: "CBDC, BRICS en ISO 20022 zijn payments-context. Niet automatisch XRP/XRPL bevestiging.",
    icon: Globe2,
  },
  {
    title: "Human Review",
    status: "Publish",
    text: "Gebruik dit als draft. Lees en check altijd voordat je publiceert.",
    icon: ShieldCheck,
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

export function NewsTab() {
  const [data, setData] = useState<XrplIntelResponse | null>(null);
  const [items, setItems] = useState<XrplIntelItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<XrplIntelItem>(emptyItem);
  const [selectedOutput, setSelectedOutput] = useState<OutputMode>("x");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  async function loadNews(mode: "initial" | "refresh" = "initial") {
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
          : "XRPL Intelligence feed kon niet worden geladen.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadNews("initial");
  }, []);

  const buckets = useMemo(() => getIntelBuckets(items).slice(0, 6), [items]);

  const selectedOutputOption =
    outputOptions.find((option) => option.id === selectedOutput) ?? outputOptions[0];

  const generatedOutput = useMemo(
    () => buildSocialOutput(selectedItem, selectedOutput),
    [selectedItem, selectedOutput],
  );

  async function copyOutput() {
    try {
      await navigator.clipboard.writeText(generatedOutput);
      setCopied(selectedOutput);

      window.setTimeout(() => {
        setCopied("");
      }, 1800);
    } catch {
      setError("Copy failed. Select the text manually and copy it.");
    }
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
                  Social Newsroom
                </p>
              </div>

              <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
                Turn Intel Into Posts
              </h2>

              <p className="font-mono text-sm text-black/55 max-w-3xl leading-relaxed">
                Zet XRPL Intelligence om naar X posts, LinkedIn captions,
                TikTok hooks, WhatsApp updates en YouTube bullets. Altijd met
                bron, context en no-hype guardrails.
              </p>

              <div className="flex flex-wrap gap-3 mt-5">
                <button
                  onClick={() => void loadNews("refresh")}
                  disabled={loading || refreshing}
                  className="inline-flex items-center gap-2 bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] text-white px-4 py-3 hover:brightness-95 transition-all disabled:opacity-50"
                >
                  <RefreshCcw
                    size={16}
                    className={refreshing ? "animate-spin" : ""}
                  />

                  <span className="font-orbitron text-xs font-black uppercase">
                    {refreshing ? "Refreshing" : "Refresh Newsroom"}
                  </span>
                </button>

                <button
                  onClick={copyOutput}
                  className="inline-flex items-center gap-2 border border-black/10 bg-[#F7F8FC] px-4 py-3 hover:bg-white transition-all"
                >
                  <Clipboard size={16} className="text-[#3898E8]" />

                  <span className="font-orbitron text-xs font-bold uppercase">
                    {copied ? "Copied" : "Copy Output"}
                  </span>
                </button>
              </div>
            </div>

            <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-3">
              <StatBox icon={Newspaper} label="Items" value={loading ? "..." : String(items.length)} />
              <StatBox icon={Bell} label="Fallback" value={data?.fallback ? "Yes" : "No"} />
              <StatBox icon={Target} label="SourceTag" value={String(data?.sourceTag ?? SOURCE_TAG)} />
              <StatBox icon={Sparkles} label="Output" value={selectedOutputOption.status} />
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
          <div className="col-span-12 xl:col-span-3 space-y-4">
            <Panel title="Output Modes" icon={Zap}>
              <div className="space-y-3">
                {outputOptions.map((option) => (
                  <OutputButton
                    key={option.id}
                    option={option}
                    active={selectedOutput === option.id}
                    onClick={() => setSelectedOutput(option.id)}
                  />
                ))}
              </div>
            </Panel>

            <Panel title="Top Buckets" icon={Search}>
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
            <Panel title="Live Intelligence Queue" icon={FileSearch}>
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
                    <NewsRow
                      key={`${item.link}-${item.title}`}
                      item={item}
                      active={selectedItem.link === item.link}
                      onClick={() => setSelectedItem(item)}
                    />
                  ))}
                </div>
              )}
            </Panel>

            <Panel title="Selected Source" icon={BookOpen}>
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
            <Panel title={`${selectedOutputOption.title} Draft`} icon={selectedOutputOption.icon}>
              <div className="border border-black/10 bg-[#F7F8FC] p-5 min-h-[360px]">
                <pre className="font-mono text-xs text-black/65 whitespace-pre-wrap leading-relaxed">
                  {generatedOutput}
                </pre>
              </div>
            </Panel>

            <Panel title="Publishing Rules" icon={ShieldCheck}>
              <div className="space-y-3">
                {rules.map((rule) => (
                  <RuleCard key={rule.title} rule={rule} />
                ))}
              </div>
            </Panel>
          </div>

          <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
            <FeatureBox icon={Newspaper} title="X" text="Short source-first posts" />
            <FeatureBox icon={Linkedin} title="LinkedIn" text="Professional captions" />
            <FeatureBox icon={Video} title="TikTok" text="Hooks and talking points" />
            <FeatureBox icon={MessageCircle} title="WhatsApp" text="Status/community updates" />
          </div>
        </div>
      </div>
    </div>
  );
}

function buildSocialOutput(item: XrplIntelItem, mode: OutputMode) {
  const date = formatIntelDate(item.pubDate);
  const sourceLine = `Source: ${item.source} (${getSourceTypeLabel(item.sourceType)})`;
  const safetyLine = item.needsConfirmation
    ? "Needs confirmation before publishing."
    : "Source-weighted signal, still review before publishing.";

  if (mode === "linkedin") {
    return `XRPL Intelligence note\n\n${item.title}\n\n${item.whyItMatters}\n\nContext:\n${item.description}\n\n${sourceLine}\nDate: ${date}\nConfidence: ${item.confidenceScore}%\n\nThis is infrastructure awareness, not financial advice or a trading signal.\n\n#XRPL #Ripple #XRP #Tokenization #DigitalAssets`;
  }

  if (mode === "tiktok") {
    return `HOOK:\nMost people only see crypto headlines. Builders watch infrastructure signals.\n\nTOPIC:\n${item.title}\n\n3 TALKING POINTS:\n1. What happened: ${item.description}\n2. Why it matters: ${item.whyItMatters}\n3. Safety: ${safetyLine}\n\nCTA:\nFollow the sources. Learn the rails. Stay 589 steps ahead.\n\n${sourceLine}`;
  }

  if (mode === "whatsapp") {
    return `XRPL Intelligence update\n\n${item.title}\n\n${item.whyItMatters}\n\n${sourceLine}\n${date}\n\nEducation only. No hype, no trading signal.`;
  }

  if (mode === "youtube") {
    return `YouTube / Live bullets\n\nTitle: ${item.title}\n\n- Source: ${item.source}\n- Date: ${date}\n- Bucket: ${item.bucket}\n- Confidence: ${item.confidenceScore}%\n- What happened: ${item.description}\n- Why it matters: ${item.whyItMatters}\n- Safety note: ${safetyLine}\n- Closing: This is awareness and education, not financial advice.`;
  }

  return `${item.title}\n\n${item.whyItMatters}\n\n${sourceLine}\nConfidence: ${item.confidenceScore}%\n\nEducation only. Not financial advice. Not a trading signal.\n\n#XRPL #XRP #Ripple #OnTheTrack`;
}

function StatBox({
  icon: Icon,
  label,
  value,
}: {
  icon: ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-4">
      <Icon size={18} className="text-[#3898E8] mb-3" />

      <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">
        {label}
      </p>

      <p className="font-orbitron text-sm font-black uppercase break-all">
        {value}
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
  children: React.ReactNode;
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

function OutputButton({
  option,
  active,
  onClick,
}: {
  option: OutputOption;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = option.icon;

  return (
    <button
      onClick={onClick}
      className={`w-full border p-4 text-left transition-all ${
        active
          ? "border-[#3898E8]/40 bg-[#3898E8]/10"
          : "border-black/10 bg-[#F7F8FC] hover:bg-white"
      }`}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          <Icon size={16} className="text-[#3898E8]" />

          <p className="font-orbitron text-xs font-bold uppercase">
            {option.title}
          </p>
        </div>

        <p className="font-mono text-[10px] text-black/35 uppercase">
          {option.status}
        </p>
      </div>

      <p className="font-mono text-[10px] text-black/45 leading-relaxed">
        {option.text}
      </p>
    </button>
  );
}

function NewsRow({
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
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="font-orbitron text-sm font-bold uppercase leading-snug">
          {item.title}
        </p>

        <p className="font-mono text-[10px] text-black/45 uppercase">
          {item.confidenceScore}%
        </p>
      </div>

      <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">
        {item.source} • {item.bucket}
      </p>

      <p className="font-mono text-xs text-black/50 leading-relaxed">
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
