import { useEffect, useMemo, useState } from "react";
import type { ElementType, ReactNode } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Bell,
  BookOpen,
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
  getHandlesForPlatform,
  getPlatformRule,
  getRecommendedTagSetIds,
  getTagSetById,
  type SocialPlatform,
} from "../data/socialTagPlaybook";
import {
  fetchXrplIntelligence,
  formatIntelDate,
  getConfidenceLabel,
  getIntelBuckets,
  getSourceTypeLabel,
  type XrplIntelItem,
  type XrplIntelResponse,
} from "../lib/newsClient";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

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

type TagStrategy = {
  platformLabel: string;
  hashtags: string;
  mentions: string;
  contexts: string[];
  ruleText: string;
  placement: string;
};

const SOURCE_TAG = 2606170002;
const TERMINAL_URL = "https://ott-terminal-mvp.vercel.app";
const BRAND_LINE = "Built by TruthOnTheTrack · XRPL OnTheTrack Terminal";
const ATTRIBUTION = `Powered by XRPL OnTheTrack Terminal\nSourceTag ${SOURCE_TAG}\nBuilt by TruthOnTheTrack\n${TERMINAL_URL}`;

function getOutputOptions(isEnglish: boolean): OutputOption[] {
  return [
    { id: "x", title: "X Post", status: isEnglish ? "Share" : "Delen", icon: Newspaper, text: isEnglish ? "A concise post with cashtags, hashtags, a source and verified mention suggestions." : "Een korte post met cashtags, hashtags, een bron en gecontroleerde vermeldingssuggesties." },
    { id: "linkedin", title: "LinkedIn", status: isEnglish ? "Share" : "Delen", icon: Linkedin, text: isEnglish ? "A professional caption with 3–5 tags and a business or compliance angle." : "Een professionele tekst met 3–5 tags en een zakelijke of compliance-invalshoek." },
    { id: "instagram", title: "Instagram", status: isEnglish ? "Copy" : "Kopiëren", icon: Sparkles, text: isEnglish ? "A carousel or reel caption with discovery hashtags at the bottom." : "Een tekst voor een carrousel of reel met ontdek-hashtags onderaan." },
    { id: "facebook", title: "Facebook", status: isEnglish ? "Share" : "Delen", icon: MessageCircle, text: isEnglish ? "A community post with an explanation, source link and accessible hashtags." : "Een communitybericht met uitleg, bronlink en toegankelijke hashtags." },
    { id: "medium", title: "Medium Article", status: isEnglish ? "Article" : "Artikel", icon: FileText, text: isEnglish ? "An article outline with source links, topics and careful explanations." : "Een artikelopzet met bronlinks, onderwerpen en zorgvuldige uitleg." },
    { id: "tiktok", title: "TikTok Hook", status: "Upload", icon: Video, text: isEnglish ? "A strong video hook, talking points and topic hashtags." : "Een sterke video-opening, gesprekspunten en onderwerp-hashtags." },
    { id: "whatsapp", title: "WhatsApp Status", status: isEnglish ? "Send" : "Verzenden", icon: Send, text: isEnglish ? "A compact community update without tag spam." : "Een compacte community-update zonder tagspam." },
    { id: "youtube", title: "YouTube Bullets", status: "Studio", icon: BookOpen, text: isEnglish ? "A video or Shorts outline with description hashtags and chapters." : "Een opzet voor video of Shorts met hashtags in de beschrijving en hoofdstukken." },
  ];
}

function getRules(isEnglish: boolean): Rule[] {
  return [
    { title: isEnglish ? "Source First" : "Bron eerst", status: isEnglish ? "Rule" : "Regel", text: isEnglish ? "Every output includes a source, date and context. No unsupported claims without a traceable source." : "Elke uitvoer bevat een bron, datum en context. Geen losse claims zonder herleidbare bron.", icon: FileSearch },
    { title: isEnglish ? "Playbook Tags" : "Tags uit het draaiboek", status: "Data", text: isEnglish ? "Hashtags, cashtags and mentions come from the social tag playbook for each platform and context." : "Hashtags, cashtags en vermeldingen komen uit het socialmediataalboek per platform en context.", icon: Target },
    { title: isEnglish ? "Verify Mentions" : "Controleer vermeldingen", status: isEnglish ? "Safe" : "Veilig", text: isEnglish ? "Account handles are suggestions and must be verified before posting to prevent spam and mistakes." : "Accounthandles zijn suggesties en moeten vóór publicatie worden gecontroleerd om spam en fouten te voorkomen.", icon: ShieldCheck },
    { title: isEnglish ? "No Hype" : "Geen hype", status: isEnglish ? "Guard" : "Beveiliging", text: isEnglish ? "Reach is welcome, but price predictions, buy advice and profit promises are not." : "Meer bereik is welkom, maar prijsvoorspellingen, koopadvies en winstbeloften niet.", icon: AlertTriangle },
  ];
}

function getEmptyItem(isEnglish: boolean): XrplIntelItem {
  return {
    title: isEnglish ? "No intelligence selected" : "Geen intelligence geselecteerd",
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
    whyItMatters: isEnglish ? "Load the intelligence feed and select an item." : "Laad de intelligence-feed en selecteer een item.",
    description: isEnglish ? "Waiting for live intelligence data." : "Wachten op live intelligence-data.",
  };
}

export function NewsTab() {
  const { language } = useTerminalLanguage();
  const isEnglish = language === "en";
  const outputOptions = getOutputOptions(isEnglish);
  const rules = getRules(isEnglish);
  const emptyItem = getEmptyItem(isEnglish);
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
    void loadNews("initial");
  }, []);

  const buckets = useMemo(() => getIntelBuckets(items).slice(0, 6), [items]);

  const selectedOutputOption =
    outputOptions.find((option) => option.id === selectedOutput) ?? outputOptions[0];

  const tagStrategy = useMemo(
    () => buildTagStrategy(selectedItem, selectedOutput, isEnglish),
    [selectedItem, selectedOutput, isEnglish],
  );

  const generatedOutput = useMemo(
    () => buildSocialOutput(selectedItem, selectedOutput, isEnglish),
    [selectedItem, selectedOutput, isEnglish],
  );

  async function copyOutput() {
    try {
      await navigator.clipboard.writeText(generatedOutput);
      setCopied(`copy-${selectedOutput}`);
      window.setTimeout(() => setCopied(""), 1800);
    } catch {
      setError(isEnglish ? "Copy failed. Select the text manually and copy it." : "Kopiëren is mislukt. Selecteer de tekst en kopieer deze handmatig.");
    }
  }

  function openExternal(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function openSource() {
    if (!selectedItem.link || selectedItem.link === "#") {
      setError(isEnglish ? "No source link is available for this item." : "Voor dit item is geen bronlink beschikbaar.");
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
                  {isEnglish ? "Public Social Newsroom" : "Publieke Sociale Newsroom"}
                </p>
              </div>

              <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
                {isEnglish ? "Turn Intel Into Reach" : "Maak Bereik Van Intelligence"}
              </h2>

              <p className="font-mono text-sm text-black/55 max-w-3xl leading-relaxed">
                {isEnglish
                  ? "Turn XRPL Intelligence into posts, captions, video hooks and article outlines. Tags come from the social tag playbook by platform and topic, with verify-before-posting guidance for mentions."
                  : "Zet XRPL Intelligence om in berichten, teksten, video-openingen en artikelopzetten. Tags komen uit het socialmediataalboek per platform en onderwerp, met controle vóór publicatie voor vermeldingen."}
              </p>

              <div className="flex flex-wrap gap-3 mt-5">
                <ActionButton
                  icon={RefreshCcw}
                  label={refreshing ? (isEnglish ? "Refreshing" : "Verversen") : (isEnglish ? "Refresh Newsroom" : "Newsroom verversen")}
                  onClick={() => void loadNews("refresh")}
                  disabled={loading || refreshing}
                  gradient
                  spinning={refreshing}
                />

                <ActionButton
                  icon={Clipboard}
                  label={copied ? (isEnglish ? "Copied" : "Gekopieerd") : (isEnglish ? "Copy Output" : "Uitvoer kopiëren")}
                  onClick={copyOutput}
                />

                <ActionButton
                  icon={ExternalLink}
                  label={isEnglish ? "Open Source" : "Open bron"}
                  onClick={openSource}
                />

                <ActionButton
                  icon={ArrowUpRight}
                  label={`${isEnglish ? "Open" : "Open"} ${selectedOutputOption.title}`}
                  onClick={openPlatformAction}
                />
              </div>
            </div>

            <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-3">
              <StatBox icon={Newspaper} label={isEnglish ? "Items" : "Items"} value={loading ? "..." : String(items.length)} />
              <StatBox icon={Bell} label={isEnglish ? "Fallback" : "Terugval"} value={data?.fallback ? (isEnglish ? "Yes" : "Ja") : (isEnglish ? "No" : "Nee")} />
              <StatBox icon={Target} label="SourceTag" value={String(data?.sourceTag ?? SOURCE_TAG)} />
              <StatBox icon={Sparkles} label="Tags" value={tagStrategy.platformLabel} />
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
            <Panel title={isEnglish ? "Output Modes" : "Uitvoermodi"} icon={Zap}>
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

            <Panel title={isEnglish ? "Top Buckets" : "Belangrijkste categorieën"} icon={Search}>
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
            <Panel title={isEnglish ? "Live Intelligence Queue" : "Live intelligence-wachtrij"} icon={FileSearch}>
              {loading ? (
                <div className="border border-black/10 bg-[#F7F8FC] p-5">
                  <Loader2 size={18} className="text-[#3898E8] animate-spin mb-4" />

                  <p className="font-mono text-xs text-black/45">
                    {isEnglish ? "Loading /api/news intelligence..." : "Intelligence van /api/news laden..."}
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

            <Panel title={isEnglish ? "Selected Source" : "Geselecteerde bron"} icon={BookOpen}>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge label={selectedItem.bucket} />
                <Badge label={getSourceTypeLabel(selectedItem.sourceType)} />
                <Badge label={`${selectedItem.confidenceScore}% ${getConfidenceLabel(selectedItem.confidenceScore)}`} />
                {selectedItem.needsConfirmation && <Badge label={isEnglish ? "Needs review" : "Controle nodig"} tone="warn" />}
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
                <ActionButton icon={ExternalLink} label={isEnglish ? "Open Original Source" : "Open oorspronkelijke bron"} onClick={openSource} />
                <ActionButton icon={Clipboard} label={isEnglish ? "Copy Draft" : "Concept kopiëren"} onClick={copyOutput} />
                <ActionButton icon={ArrowUpRight} label={isEnglish ? "Open Platform" : "Open platform"} onClick={openPlatformAction} />
              </div>

              <div className="border border-black/10 bg-[#F7F8FC] p-4">
                <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">
                  {isEnglish ? "Why it matters" : "Waarom dit belangrijk is"}
                </p>

                <p className="font-mono text-xs text-black/55 leading-relaxed">
                  {selectedItem.whyItMatters}
                </p>
              </div>
            </Panel>
          </div>

          <div className="col-span-12 xl:col-span-4 space-y-4">
            <Panel title={`${selectedOutputOption.title} ${isEnglish ? "Draft" : "Concept"}`} icon={selectedOutputOption.icon}>
              <div className="border border-black/10 bg-[#F7F8FC] p-5 min-h-[360px]">
                <pre className="font-mono text-xs text-black/65 whitespace-pre-wrap leading-relaxed">
                  {generatedOutput}
                </pre>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                <ActionButton icon={Clipboard} label={isEnglish ? "Copy" : "Kopiëren"} onClick={copyOutput} />
                <ActionButton icon={ArrowUpRight} label={isEnglish ? "Open Platform" : "Open platform"} onClick={openPlatformAction} />
                <ActionButton icon={ExternalLink} label={isEnglish ? "Open Source" : "Open bron"} onClick={openSource} />
              </div>
            </Panel>

            <Panel title={isEnglish ? "Tag Strategy" : "Tagstrategie"} icon={Globe2}>
              <div className="space-y-3">
                <TagInfo label={isEnglish ? "Platform" : "Platform"} value={tagStrategy.platformLabel} />
                <TagInfo label={isEnglish ? "Contexts" : "Contexten"} value={tagStrategy.contexts.join(", ")} />
                <TagInfo label={isEnglish ? "Placement" : "Plaatsing"} value={tagStrategy.placement} />
                <TagInfo label={isEnglish ? "Mentions" : "Vermeldingen"} value={tagStrategy.mentions || (isEnglish ? "No mentions for this mode" : "Geen vermeldingen voor deze modus")} warn />
                <TagInfo label="Hashtags" value={tagStrategy.hashtags || (isEnglish ? "No hashtags" : "Geen hashtags")} />
              </div>
            </Panel>

            <Panel title={isEnglish ? "Publishing Rules" : "Publicatieregels"} icon={ShieldCheck}>
              <div className="space-y-3">
                {rules.map((rule) => (
                  <RuleCard key={rule.title} rule={rule} />
                ))}
              </div>
            </Panel>
          </div>

          <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
            <FeatureBox icon={Newspaper} title={isEnglish ? "Share Buttons" : "Deelknoppen"} text="X, LinkedIn, Facebook, WhatsApp" />
            <FeatureBox icon={FileText} title={isEnglish ? "Playbook Data" : "Draaiboekdata"} text={isEnglish ? "Platform hashtags + mentions" : "Platformhashtags + vermeldingen"} />
            <FeatureBox icon={Video} title={isEnglish ? "Video Mode" : "Videomodus"} text={isEnglish ? "TikTok and YouTube workflows" : "TikTok- en YouTube-workflows"} />
            <FeatureBox icon={Globe2} title={isEnglish ? "Public Attribution" : "Openbare naamsvermelding"} text={isEnglish ? "OTT + TruthOnTheTrack visible" : "OTT + TruthOnTheTrack zichtbaar"} />
          </div>
        </div>
      </div>
    </div>
  );
}

function buildSocialOutput(item: XrplIntelItem, mode: OutputMode, isEnglish: boolean) {
  const date = formatIntelDate(item.pubDate);
  const sourceLine = `${isEnglish ? "Source" : "Bron"}: ${item.source} (${getSourceTypeLabel(item.sourceType)})`;
  const safetyLine = item.needsConfirmation
    ? isEnglish ? "⚠️ Needs confirmation before publishing." : "⚠️ Bevestiging nodig vóór publicatie."
    : isEnglish ? "✅ Source-weighted signal. Still review before publishing." : "✅ Op bron gewogen signaal. Controleer het alsnog vóór publicatie.";
  const sourceUrl = item.link && item.link !== "#" ? item.link : TERMINAL_URL;
  const strategy = buildTagStrategy(item, mode, isEnglish);
  const hashtags = strategy.hashtags;
  const mentions = strategy.mentions;

  if (!isEnglish) {
    if (mode === "linkedin") {
      return `🔎 XRPL Intelligence-notitie

${item.title}

Waarom dit belangrijk is:
${item.whyItMatters}

Context voor bouwers:
${item.description}

${sourceLine}
Datum: ${date}
Betrouwbaarheid: ${item.confidenceScore}%

${safetyLine}

Vraag voor bouwers:
Wat zou jij controleren voordat je dit omzet in productstrategie?

${BRAND_LINE}
${TERMINAL_URL}

Voorgestelde accounts om vóór publicatie te controleren: ${mentions}

${hashtags}`;
    }
    if (mode === "instagram") {
      return `🚨 XRPL Intelligence-update

${item.title}

🧠 Waarom dit belangrijk is:
${item.whyItMatters}

🔍 Context:
${item.description}

📌 Bewaar dit. Controleer de bron. Volg de infrastructuur, niet de hype.

${sourceLine}
📅 ${date}

${BRAND_LINE}
SourceTag ${SOURCE_TAG}
${TERMINAL_URL}

Voorgestelde accounts om vóór publicatie te controleren: ${mentions}

${hashtags}`;
    }
    if (mode === "facebook") {
      return `📡 XRPL Intelligence-update

${item.title}

${item.whyItMatters}

Wat je moet controleren:
1️⃣ Lees de bron
2️⃣ Scheid feiten van hype
3️⃣ Let op het infrastructuursignaal

${sourceLine}
Datum: ${date}

Alleen educatie. Geen hype en geen handelssignaal.

${BRAND_LINE}
${TERMINAL_URL}

Voorgestelde accounts om vóór publicatie te controleren: ${mentions}

${hashtags}`;
    }
    if (mode === "medium") {
      return `# ${item.title}

## Korte samenvatting
${item.description}

## Waarom dit belangrijk is
${item.whyItMatters}

## Broncontext
- ${sourceLine}
- Datum: ${date}
- Categorie: ${item.bucket}
- Betrouwbaarheid: ${item.confidenceScore}%
- Bron-URL: ${sourceUrl}

## Waar bouwers op moeten letten
- Impact op protocol of infrastructuur
- Context rond adoptie in het ecosysteem
- Wat nog moet worden gecontroleerd
- Of dit officiële, technische of macrocontext is

## Veiligheidsnotitie
Dit artikel is alleen voor educatie. Het is geen financieel advies, geen handelssignaal en geen claim van gegarandeerde adoptie.

## Over OTT
${ATTRIBUTION}

Medium-onderwerpen/tags:
${hashtags.replaceAll("#", "")}`;
    }
    if (mode === "tiktok") {
      return `🎬 OPENING:
De meeste mensen volgen cryptokoppen. Bouwers volgen infrastructuursignalen.

ONDERWERP:
${item.title}

GESPREKSPUNTEN:
1️⃣ Wat gebeurde er: ${item.description}
2️⃣ Waarom dit belangrijk is: ${item.whyItMatters}
3️⃣ Veiligheid: ${safetyLine}

OPROEP:
Volg de bron. Leer de infrastructuur. Blijf 589 stappen voor.

Tekst:
${item.title} ⚡ XRPL Intelligence met de bron voorop. Alleen educatie.

${BRAND_LINE}
${hashtags}`;
    }
    if (mode === "whatsapp") {
      return `📡 XRPL Intelligence-update

${item.title}

${item.whyItMatters}

${sourceLine}
${date}

Alleen educatie. Geen hype en geen handelssignaal.

${BRAND_LINE}
${TERMINAL_URL}`;
    }
    if (mode === "youtube") {
      return `YouTube / Shorts-opzet

🎥 Titelidee:
${item.title}

Openingszin:
Dit is geen prijssignaal. Dit is een infrastructuursignaal.

Videopunten:
- Bron: ${item.source}
- Datum: ${date}
- Categorie: ${item.bucket}
- Betrouwbaarheid: ${item.confidenceScore}%
- Wat gebeurde er: ${item.description}
- Waarom dit belangrijk is: ${item.whyItMatters}
- Veiligheidsnotitie: ${safetyLine}

Beschrijving:
XRPL Intelligence met de bron voorop vanuit XRPL OnTheTrack Terminal.
${sourceUrl}

${ATTRIBUTION}

Voorgestelde accounts om vóór publicatie te controleren: ${mentions}

${hashtags}`;
    }
    return `🚨 XRPL Intelligence

${item.title}

${item.whyItMatters}

${sourceLine}
Betrouwbaarheid: ${item.confidenceScore}%

${safetyLine}

${BRAND_LINE}
${TERMINAL_URL}

Voorgestelde accounts om te controleren: ${mentions}

${hashtags}`;
  }

  if (mode === "linkedin") {
    return `🔎 XRPL Intelligence Note\n\n${item.title}\n\nWhy this matters:\n${item.whyItMatters}\n\nBuilder context:\n${item.description}\n\n${sourceLine}\nDate: ${date}\nConfidence: ${item.confidenceScore}%\n\n${safetyLine}\n\nQuestion for builders:\nWhat would you verify before turning this into product strategy?\n\n${BRAND_LINE}\n${TERMINAL_URL}\n\nSuggested tags to verify before posting: ${mentions}\n\n${hashtags}`;
  }

  if (mode === "instagram") {
    return `🚨 XRPL Intel Drop\n\n${item.title}\n\n🧠 Why it matters:\n${item.whyItMatters}\n\n🔍 Context:\n${item.description}\n\n📌 Save this. Check the source. Follow the rails, not the hype.\n\n${sourceLine}\n📅 ${date}\n\n${BRAND_LINE}\nSourceTag ${SOURCE_TAG}\n${TERMINAL_URL}\n\nSuggested tags to verify before posting: ${mentions}\n\n${hashtags}`;
  }

  if (mode === "facebook") {
    return `📡 XRPL Intelligence Update\n\n${item.title}\n\n${item.whyItMatters}\n\nWhat to check:\n1️⃣ Read the source\n2️⃣ Separate facts from hype\n3️⃣ Watch the infrastructure signal\n\n${sourceLine}\nDate: ${date}\n\nEducation only. No hype, no trading signal.\n\n${BRAND_LINE}\n${TERMINAL_URL}\n\nSuggested tags to verify before posting: ${mentions}\n\n${hashtags}`;
  }

  if (mode === "medium") {
    return `# ${item.title}\n\n## Quick summary\n${item.description}\n\n## Why it matters\n${item.whyItMatters}\n\n## Source context\n- ${sourceLine}\n- Date: ${date}\n- Bucket: ${item.bucket}\n- Confidence: ${item.confidenceScore}%\n- Source URL: ${sourceUrl}\n\n## What builders should watch\n- Protocol or infrastructure impact\n- Ecosystem adoption context\n- What still needs verification\n- Whether this is official, technical or macro context\n\n## Safety note\nThis article is education only. It is not financial advice, not a trading signal and not a claim of guaranteed adoption.\n\n## About\n${ATTRIBUTION}\n\nMedium topics/tags:\n${hashtags.replaceAll("#", "")}`;
  }

  if (mode === "tiktok") {
    return `🎬 HOOK:\nMost people chase crypto headlines. Builders watch infrastructure signals.\n\nTOPIC:\n${item.title}\n\nTALKING POINTS:\n1️⃣ What happened: ${item.description}\n2️⃣ Why it matters: ${item.whyItMatters}\n3️⃣ Safety: ${safetyLine}\n\nCTA:\nFollow the source. Learn the rails. Stay 589 steps ahead.\n\nCaption:\n${item.title} ⚡ Source-first XRPL intelligence. Education only.\n\n${BRAND_LINE}\n${hashtags}`;
  }

  if (mode === "whatsapp") {
    return `📡 XRPL Intelligence Update\n\n${item.title}\n\n${item.whyItMatters}\n\n${sourceLine}\n${date}\n\nEducation only. No hype, no trading signal.\n\n${BRAND_LINE}\n${TERMINAL_URL}`;
  }

  if (mode === "youtube") {
    return `YouTube / Shorts Outline\n\n🎥 Title idea:\n${item.title}\n\nOpening hook:\nThis is not a price signal. This is an infrastructure signal.\n\nVideo bullets:\n- Source: ${item.source}\n- Date: ${date}\n- Bucket: ${item.bucket}\n- Confidence: ${item.confidenceScore}%\n- What happened: ${item.description}\n- Why it matters: ${item.whyItMatters}\n- Safety note: ${safetyLine}\n\nDescription:\nSource-first XRPL intelligence from XRPL OnTheTrack Terminal.\n${sourceUrl}\n\n${ATTRIBUTION}\n\nSuggested tags to verify before posting: ${mentions}\n\n${hashtags}`;
  }

  return `🚨 XRPL Intel\n\n${item.title}\n\n${item.whyItMatters}\n\n${sourceLine}\nConfidence: ${item.confidenceScore}%\n\n${safetyLine}\n\n${BRAND_LINE}\n${TERMINAL_URL}\n\nSuggested tags to verify: ${mentions}\n\n${hashtags}`;
}

function buildTagStrategy(item: XrplIntelItem, mode: OutputMode, isEnglish = true): TagStrategy {
  const platform = getSocialPlatform(mode);
  const contexts = detectTagContexts(item);

  if (!platform) {
    return {
      platformLabel: "WhatsApp",
      hashtags: "",
      mentions: "",
      contexts,
      ruleText: isEnglish ? "No hashtag strategy for WhatsApp status." : "Geen hashtagstrategie voor WhatsApp Status.",
      placement: isEnglish ? "Keep WhatsApp clean: source, summary, link." : "Houd WhatsApp rustig: bron, samenvatting en link.",
    };
  }

  const rule = getPlatformRule(platform);
  const contextSetIds = contexts.flatMap((context) => getRecommendedTagSetIds(context));
  const orderedSetIds = [...new Set([...contextSetIds, platformSpecificSetId(platform)].filter(Boolean))];
  const tagSets = orderedSetIds
    .map((id) => getTagSetById(id))
    .filter((set) => set && set.platforms.includes(platform));

  const maxTags = rule?.maxHashtags ?? 6;
  const hashtags = uniqueStrings(
    tagSets.flatMap((set) => [
      ...(rule?.useCashtags ? set?.cashtags ?? [] : []),
      ...(set?.hashtags ?? []),
    ]),
  ).slice(0, maxTags);

  const handles = getHandlesForPlatform(platform)
    .filter((handle) => isHandleRelevant(handle.useFor, item, contexts))
    .slice(0, 3)
    .map((handle) => handle.handle);

  return {
    platformLabel: rule?.label ?? platform,
    hashtags: hashtags.join(" "),
    mentions: uniqueStrings(handles).join(" "),
    contexts,
    ruleText: isEnglish
      ? rule?.mentionPolicy ?? "Use mentions only when directly relevant."
      : "Gebruik vermeldingen alleen wanneer ze direct relevant zijn en controleer de handle vóór publicatie.",
    placement: isEnglish
      ? rule?.placement ?? "Place tags at the bottom after source context."
      : "Plaats tags onderaan, na de broncontext.",
  };
}

function getSocialPlatform(mode: OutputMode): SocialPlatform | null {
  if (mode === "whatsapp") {
    return null;
  }

  return mode;
}

function platformSpecificSetId(platform: SocialPlatform) {
  if (platform === "instagram") {
    return "instagram-discovery";
  }

  if (platform === "tiktok") {
    return "tiktok-fyp";
  }

  if (platform === "linkedin") {
    return "linkedin-professional";
  }

  if (platform === "facebook") {
    return "facebook-community";
  }

  return "ott-brand";
}

function detectTagContexts(item: XrplIntelItem) {
  const text = `${item.title} ${item.bucket} ${item.category} ${item.description} ${item.tags.join(" ")}`.toLowerCase();
  const contexts: string[] = [];

  if (text.includes("ripple") || text.includes("rlusd") || text.includes("payments")) {
    contexts.push("ripple");
  }

  if (text.includes("rlusd") || text.includes("stablecoin")) {
    contexts.push("rlusd");
  }

  if (text.includes("xls") || text.includes("amendment") || text.includes("mpt") || text.includes("escrow")) {
    contexts.push("xls");
  }

  if (text.includes("cbdc")) {
    contexts.push("cbdc");
  }

  if (text.includes("iso") || text.includes("swift")) {
    contexts.push("iso20022");
  }

  if (text.includes("rwa") || text.includes("tokenization")) {
    contexts.push("rwa");
  }

  if (text.includes("defi") || text.includes("xahau") || text.includes("evernode") || text.includes("sologenic")) {
    contexts.push("defi");
  }

  if (text.includes("ott") || text.includes("make waves") || text.includes("mak ewaves")) {
    contexts.push("ott");
  }

  if (contexts.length === 0) {
    contexts.push("xrpl");
  }

  return uniqueStrings(contexts).slice(0, 4);
}

function isHandleRelevant(useFor: string[], item: XrplIntelItem, contexts: string[]) {
  const haystack = `${item.title} ${item.source} ${item.bucket} ${item.description} ${contexts.join(" ")}`.toLowerCase();

  return useFor.some((term) => {
    const normalized = term.toLowerCase();
    return normalized.split(/\s+/).some((part) => part.length > 3 && haystack.includes(part));
  });
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.filter(Boolean))];
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
    return "https://medium.com/new-story";
  }

  if (mode === "instagram") {
    return "https://www.instagram.com/";
  }

  if (mode === "tiktok") {
    return "https://www.tiktok.com/upload?lang=en";
  }

  if (mode === "youtube") {
    return "https://studio.youtube.com/";
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

function TagInfo({
  label,
  value,
  warn = false,
}: {
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div className={`border p-3 ${warn ? "border-[#D84858]/25 bg-[#D84858]/10" : "border-black/10 bg-[#F7F8FC]"}`}>
      <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">
        {label}
      </p>

      <p className="font-mono text-xs text-black/55 leading-relaxed break-words">
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
