import { useEffect, useMemo, useState } from "react";
import type { ElementType, ReactNode } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Bell,
  BookOpen,
  CheckCircle2,
  Clipboard,
  ExternalLink,
  FileSearch,
  FileText,
  Globe2,
  Linkedin,
  Loader2,
  MessageCircle,
  Newspaper,
  Radio,
  RefreshCcw,
  Search,
  Send,
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

type OutputMode =
  | "x"
  | "linkedin"
  | "instagram"
  | "facebook"
  | "medium"
  | "tiktok"
  | "whatsapp"
  | "youtube";

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
const TERMINAL_URL = "https://ott-terminal-mvp.vercel.app";
const ATTRIBUTION = `Powered by XRPL OnTheTrack Terminal\nSourceTag ${SOURCE_TAG}\nBuilt by TruthOnTheTrack\n${TERMINAL_URL}`;

const outputOptions: OutputOption[] = [
  {
    id: "x",
    title: "X Post",
    status: "Share",
    icon: Newspaper,
    text: "Korte post met bron, context, attribution en share-link.",
  },
  {
    id: "linkedin",
    title: "LinkedIn",
    status: "Share",
    icon: Linkedin,
    text: "Zakelijke caption met infrastructuur-context en builder angle.",
  },
  {
    id: "instagram",
    title: "Instagram",
    status: "Copy",
    icon: Sparkles,
    text: "Caption voor carousel/reel. Instagram opent zonder prefilled post.",
  },
  {
    id: "facebook",
    title: "Facebook",
    status: "Share",
    icon: MessageCircle,
    text: "Community post met bronlink en OTT attribution.",
  },
  {
    id: "medium",
    title: "Medium Article",
    status: "Article",
    icon: FileText,
    text: "Artikel-outline met intro, bullets, context en CTA.",
  },
  {
    id: "tiktok",
    title: "TikTok Hook",
    status: "Upload",
    icon: Video,
    text: "Snelle hook + talking points voor short-form video.",
  },
  {
    id: "whatsapp",
    title: "WhatsApp Status",
    status: "Send",
    icon: Send,
    text: "Compacte update voor community en status sharing.",
  },
  {
    id: "youtube",
    title: "YouTube Bullets",
    status: "Studio",
    icon: BookOpen,
    text: "Bullet flow voor video, short of livestream segment.",
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
    title: "Public Attribution",
    status: "OTT",
    text: "Free/public output bevat standaard OnTheTrack attribution, SourceTag en terminal-link.",
    icon: Target,
  },
  {
    title: "No Auto-Posting",
    status: "Safe",
    text: "Buttons openen platformen of share dialogs. Account-koppeling/OAuth komt later als aparte privacy-laag.",
    icon: ShieldCheck,
  },
  {
    title: "No Hype",
    status: "Guard",
    text: "Geen prijsvoorspellingen, koopadvies, gegarandeerde adoptie of winstbelofte.",
    icon: AlertTriangle,
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
      setCopied(`copy-${selectedOutput}`);
      window.setTimeout(() => setCopied(""), 1800);
    } catch {
      setError("Copy failed. Select the text manually and copy it.");
    }
  }

  function openExternal(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function openSource() {
    if (!selectedItem.link || selectedItem.link === "#") {
      setError("No source link available for this item.");
      return;
    }

    openExternal(selectedItem.link);
  }

  function openPlatformAction() {
    openExternal(getPlatformActionUrl(selectedOutput, selectedItem, generatedOutput));
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
                  Public Social Newsroom
                </p>
              </div>

              <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
                Turn Intel Into Action
              </h2>

              <p className="font-mono text-sm text-black/55 max-w-3xl leading-relaxed">
                Zet XRPL Intelligence om naar posts, captions, video hooks en
                article outlines. Gebruik copy, open source en platform-buttons.
                Public output houdt standaard OTT attribution zichtbaar.
              </p>

              <div className="flex flex-wrap gap-3 mt-5">
                <ActionButton
                  icon={RefreshCcw}
                  label={refreshing ? "Refreshing" : "Refresh Newsroom"}
                  onClick={() => void loadNews("refresh")}
                  disabled={loading || refreshing}
                  gradient
                  spinning={refreshing}
                />

                <ActionButton
                  icon={Clipboard}
                  label={copied ? "Copied" : "Copy Output"}
                  onClick={copyOutput}
                />

                <ActionButton
                  icon={ExternalLink}
                  label="Open Source"
                  onClick={openSource}
                />

                <ActionButton
                  icon={ArrowUpRight}
                  label={`Open ${selectedOutputOption.title}`}
                  onClick={openPlatformAction}
                />
              </div>
            </div>

            <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-3">
              <StatBox icon={Newspaper} label="Items" value={loading ? "..." : String(items.length)} />
              <StatBox icon={Bell} label="Fallback" value={data?.fallback ? "Yes" : "No"} />
              <StatBox icon={Target} label="SourceTag" value={String(data?.sourceTag ?? SOURCE_TAG)} />
              <StatBox icon={Sparkles} label="Mode" value={selectedOutputOption.status} />
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

              <div className="flex flex-wrap gap-3 mb-4">
                <ActionButton icon={ExternalLink} label="Open Original Source" onClick={openSource} />
                <ActionButton icon={Clipboard} label="Copy Draft" onClick={copyOutput} />
                <ActionButton icon={ArrowUpRight} label="Open Platform" onClick={openPlatformAction} />
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
            <Panel title={`${selectedOutputOption.title} Draft`} icon={selectedOutputOption.icon}>
              <div className="border border-black/10 bg-[#F7F8FC] p-5 min-h-[360px]">
                <pre className="font-mono text-xs text-black/65 whitespace-pre-wrap leading-relaxed">
                  {generatedOutput}
                </pre>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                <ActionButton icon={Clipboard} label="Copy" onClick={copyOutput} />
                <ActionButton icon={ArrowUpRight} label="Open Platform" onClick={openPlatformAction} />
                <ActionButton icon={ExternalLink} label="Open Source" onClick={openSource} />
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
            <FeatureBox icon={Newspaper} title="Share Buttons" text="X, LinkedIn, Facebook, WhatsApp" />
            <FeatureBox icon={FileText} title="Article Mode" text="Medium outline with attribution" />
            <FeatureBox icon={Video} title="Video Mode" text="TikTok and YouTube workflows" />
            <FeatureBox icon={Globe2} title="Public Attribution" text="OTT + TruthOnTheTrack visible" />
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
  const footer = `\n\n${ATTRIBUTION}`;

  if (mode === "linkedin") {
    return `XRPL Intelligence note\n\n${item.title}\n\n${item.whyItMatters}\n\nContext:\n${item.description}\n\n${sourceLine}\nDate: ${date}\nConfidence: ${item.confidenceScore}%\n\nThis is infrastructure awareness, not financial advice or a trading signal.\n${footer}\n\n#XRPL #Ripple #XRP #Tokenization #DigitalAssets`;
  }

  if (mode === "instagram") {
    return `${item.title}\n\nWhat matters:\n${item.whyItMatters}\n\nContext:\n${item.description}\n\nSave this for later and always check the source before sharing.\n\n${sourceLine}\n${date}\n${footer}\n\n#XRPL #XRP #Ripple #DigitalAssets #OnTheTrack #TruthOnTheTrack`;
  }

  if (mode === "facebook") {
    return `XRPL Intelligence update\n\n${item.title}\n\n${item.whyItMatters}\n\n${sourceLine}\nDate: ${date}\n\nEducation only. No hype, no trading signal.\n${footer}`;
  }

  if (mode === "medium") {
    return `# ${item.title}\n\n## Summary\n${item.description}\n\n## Why it matters\n${item.whyItMatters}\n\n## Source context\n- ${sourceLine}\n- Date: ${date}\n- Bucket: ${item.bucket}\n- Confidence: ${item.confidenceScore}%\n\n## What builders should watch\n- Protocol or infrastructure impact\n- Ecosystem adoption context\n- What still needs verification\n\n## Safety note\nThis article is education only. It is not financial advice, not a trading signal and not a claim of guaranteed adoption.\n${footer}`;
  }

  if (mode === "tiktok") {
    return `HOOK:\nMost people only see crypto headlines. Builders watch infrastructure signals.\n\nTOPIC:\n${item.title}\n\n3 TALKING POINTS:\n1. What happened: ${item.description}\n2. Why it matters: ${item.whyItMatters}\n3. Safety: ${safetyLine}\n\nCTA:\nFollow the sources. Learn the rails. Stay 589 steps ahead.\n\n${sourceLine}\n${footer}`;
  }

  if (mode === "whatsapp") {
    return `XRPL Intelligence update\n\n${item.title}\n\n${item.whyItMatters}\n\n${sourceLine}\n${date}\n\nEducation only. No hype, no trading signal.\n${footer}`;
  }

  if (mode === "youtube") {
    return `YouTube / Live bullets\n\nTitle: ${item.title}\n\n- Source: ${item.source}\n- Date: ${date}\n- Bucket: ${item.bucket}\n- Confidence: ${item.confidenceScore}%\n- What happened: ${item.description}\n- Why it matters: ${item.whyItMatters}\n- Safety note: ${safetyLine}\n- Closing: This is awareness and education, not financial advice.\n${footer}`;
  }

  return `${item.title}\n\n${item.whyItMatters}\n\n${sourceLine}\nConfidence: ${item.confidenceScore}%\n\nEducation only. Not financial advice. Not a trading signal.\n${footer}\n\n#XRPL #XRP #Ripple #OnTheTrack`;
}

function getPlatformActionUrl(
  mode: OutputMode,
  item: XrplIntelItem,
  output: string,
) {
  const sourceUrl = item.link && item.link !== "#" ? item.link : TERMINAL_URL;
  const encodedOutput = encodeURIComponent(output);
  const encodedSource = encodeURIComponent(sourceUrl);
  const encodedTitle = encodeURIComponent(item.title);

  if (mode === "x") {
    return `https://twitter.com/intent/tweet?text=${encodedOutput}`;
  }

  if (mode === "linkedin") {
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedSource}`;
  }

  if (mode === "facebook") {
    return `https://www.facebook.com/sharer/sharer.php?u=${encodedSource}`;
  }

  if (mode === "whatsapp") {
    return `https://wa.me/?text=${encodedOutput}`;
  }

  if (mode === "medium") {
    return `https://medium.com/new-story`;
  }

  if (mode === "instagram") {
    return `https://www.instagram.com/`;
  }

  if (mode === "tiktok") {
    return `https://www.tiktok.com/upload?lang=en`;
  }

  if (mode === "youtube") {
    return `https://studio.youtube.com/`;
  }

  return `${TERMINAL_URL}?title=${encodedTitle}`;
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
