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
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

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

function getAnalysisOptions(isEnglish: boolean): AnalysisOption[] {
  return [
    {
      id: "builder",
      title: isEnglish ? "Builder Lens" : "Bouwersblik",
      status: isEnglish ? "Impact" : "Impact",
      icon: Brain,
      text: isEnglish
        ? "What does this mean for XRPL builders, dApps, standards or tooling?"
        : "Wat betekent dit voor XRPL-bouwers, dApps, standaarden of hulpmiddelen?",
    },
    {
      id: "beginner",
      title: isEnglish ? "Beginner Explanation" : "Uitleg voor beginners",
      status: isEnglish ? "Simple" : "Eenvoudig",
      icon: BookOpen,
      text: isEnglish
        ? "Explain it as if someone has just started learning about XRPL."
        : "Leg het uit alsof iemand net met XRPL begint.",
    },
    {
      id: "risk",
      title: isEnglish ? "Risk Context" : "Risicocontext",
      status: isEnglish ? "Safe" : "Veilig",
      icon: ShieldCheck,
      text: isEnglish
        ? "Which claims are safe and which need additional verification?"
        : "Welke claims zijn veilig en welke vereisen aanvullende verificatie?",
    },
    {
      id: "content",
      title: isEnglish ? "Content Angle" : "Contentinvalshoek",
      status: isEnglish ? "Reach" : "Bereik",
      icon: Sparkles,
      text: isEnglish
        ? "Which hook, angle and call to action fit this item?"
        : "Welke opening, invalshoek en oproep tot actie passen bij dit item?",
    },
    {
      id: "verify",
      title: isEnglish ? "Verification Checklist" : "Verificatiechecklist",
      status: isEnglish ? "Check" : "Controle",
      icon: FileSearch,
      text: isEnglish
        ? "What should be checked before this is shared or published?"
        : "Wat moet worden gecontroleerd voordat dit wordt gedeeld of gepubliceerd?",
    },
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
    whyItMatters: isEnglish
      ? "Load the intelligence feed and select an item."
      : "Laad de intelligence-feed en selecteer een item.",
    description: isEnglish
      ? "Waiting for live intelligence data."
      : "Wachten op live intelligence-data.",
  };
}

export function OTTIntelligence() {
  const { language } = useTerminalLanguage();
  const isEnglish = language === "en";
  const analysisOptions = getAnalysisOptions(isEnglish);
  const emptyItem = getEmptyItem(isEnglish);
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
          : isEnglish
            ? "The OTT Intelligence feed could not be loaded."
            : "De OTT Intelligence-feed kon niet worden geladen.",
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
    () => buildAnalysisOutput(selectedItem, selectedMode, isEnglish),
    [selectedItem, selectedMode, isEnglish],
  );

  const scores = useMemo(
    () => buildScores(selectedItem, isEnglish),
    [selectedItem, isEnglish],
  );

  async function copyAnalysis() {
    try {
      await navigator.clipboard.writeText(analysisText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setError(
        isEnglish
          ? "Copy failed. Select the text manually and copy it."
          : "Kopiëren is mislukt. Selecteer de tekst en kopieer deze handmatig.",
      );
    }
  }

  function openSource() {
    if (!selectedItem.link || selectedItem.link === "#") {
      setError(
        isEnglish
          ? "No source link is available for this item."
          : "Voor dit item is geen bronlink beschikbaar.",
      );
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
                {isEnglish
                  ? "Analyze XRPL Intelligence items before turning them into content. This studio supports beginner explanations, builder impact, risk context, verification checks and reach-safe angles. No automatic posting and no trading signals."
                  : "Analyseer XRPL Intelligence-items voordat je ze omzet in content. Deze studio ondersteunt uitleg voor beginners, impact voor bouwers, risicocontext, verificatiecontroles en bereikveilige invalshoeken. Geen automatische publicatie en geen handelssignalen."}
              </p>

              <div className="flex flex-wrap gap-3 mt-5">
                <ActionButton
                  icon={RefreshCcw}
                  label={refreshing
                    ? isEnglish ? "Refreshing" : "Verversen"
                    : isEnglish ? "Refresh Studio" : "Studio verversen"}
                  onClick={() => void loadIntel("refresh")}
                  disabled={loading || refreshing}
                  gradient
                  spinning={refreshing}
                />

                <ActionButton
                  icon={Clipboard}
                  label={copied
                    ? isEnglish ? "Copied" : "Gekopieerd"
                    : isEnglish ? "Copy Analysis" : "Analyse kopiëren"}
                  onClick={copyAnalysis}
                />

                <ActionButton icon={ExternalLink} label={isEnglish ? "Open Source" : "Open bron"} onClick={openSource} />
              </div>
            </div>

            <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-3">
              <StatBox icon={Bot} label={isEnglish ? "Mode" : "Modus"} value={selectedOption.status} />
              <StatBox icon={Target} label="SourceTag" value={String(data?.sourceTag ?? SOURCE_TAG)} />
              <StatBox icon={CheckCircle2} label={isEnglish ? "Fallback" : "Terugval"} value={data?.fallback ? (isEnglish ? "Yes" : "Ja") : (isEnglish ? "No" : "Nee")} />
              <StatBox icon={BarChart3} label={isEnglish ? "Items" : "Items"} value={loading ? "..." : String(items.length)} />
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
            <Panel title={isEnglish ? "Analysis Modes" : "Analysemodi"} icon={Zap}>
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

            <Panel title={isEnglish ? "Buckets" : "Categorieën"} icon={Search}>
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
            <Panel title={isEnglish ? "Intelligence Queue" : "Intelligence-wachtrij"} icon={FileSearch}>
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

            <Panel title={isEnglish ? "Selected Item" : "Geselecteerd item"} icon={BookOpen}>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                {scores.map((score) => (
                  <ScoreBox key={score.label} score={score} />
                ))}
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
            <Panel title={`${selectedOption.title} ${isEnglish ? "Output" : "Uitvoer"}`} icon={selectedOption.icon}>
              <div className="border border-black/10 bg-[#F7F8FC] p-5 min-h-[420px]">
                <pre className="font-mono text-xs text-black/65 whitespace-pre-wrap leading-relaxed">
                  {analysisText}
                </pre>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <ActionButton icon={Clipboard} label={isEnglish ? "Copy" : "Kopiëren"} onClick={copyAnalysis} />
                <ActionButton icon={ArrowUpRight} label={isEnglish ? "Open Source" : "Open bron"} onClick={openSource} />
              </div>
            </Panel>

            <Panel title={isEnglish ? "AI Studio Rules" : "AI-studioregels"} icon={ShieldCheck}>
              <div className="space-y-3">
                <RuleLine
                  icon={Eye}
                  title={isEnglish ? "Human Review" : "Menselijke controle"}
                  text={isEnglish
                    ? "Use this as analysis support. You remain responsible for checking the source and context before publishing."
                    : "Gebruik dit als analysehulp. Je blijft zelf verantwoordelijk voor het controleren van bron en context vóór publicatie."}
                />
                <RuleLine
                  icon={Globe2}
                  title={isEnglish ? "Macro Context" : "Macrocontext"}
                  text={isEnglish
                    ? "CBDC, ISO and BRICS signals provide context and are not automatic proof of XRPL or XRP usage."
                    : "Signalen rond CBDC, ISO en BRICS bieden context en zijn geen automatisch bewijs van XRPL- of XRP-gebruik."}
                />
                <RuleLine
                  icon={AlertTriangle}
                  title={isEnglish ? "No Financial Advice" : "Geen financieel advies"}
                  text={isEnglish
                    ? "No trading signals, price expectations or promises of adoption or profit."
                    : "Geen handelssignalen, prijsverwachtingen of beloften over adoptie of winst."}
                />
              </div>
            </Panel>
          </div>

          <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
            <FeatureBox icon={Brain} title={isEnglish ? "Analyze" : "Analyseer"} text={isEnglish ? "Builder impact and context" : "Impact voor bouwers en context"} />
            <FeatureBox icon={BookOpen} title={isEnglish ? "Explain" : "Leg uit"} text={isEnglish ? "Beginner-friendly notes" : "Toegankelijke uitleg voor beginners"} />
            <FeatureBox icon={ShieldCheck} title={isEnglish ? "Verify" : "Controleer"} text={isEnglish ? "Checklist before posting" : "Checklist vóór publicatie"} />
            <FeatureBox icon={Lightbulb} title={isEnglish ? "Angle" : "Invalshoek"} text={isEnglish ? "Reach without hype" : "Bereik zonder hype"} />
          </div>
        </div>
      </div>
    </div>
  );
}

function buildScores(item: XrplIntelItem, isEnglish: boolean): ScoreCard[] {
  const safetyScore = item.needsConfirmation ? "Medium" : item.confidenceScore >= 85 ? "High" : "Review";
  const reachScore = item.bucket.includes("XLS") || item.bucket.includes("XRPL") ? "Builder" : item.bucket.includes("CBDC") || item.bucket.includes("ISO") ? "Macro" : "Community";
  const complexityScore = item.bucket.includes("XLS") || item.title.toLowerCase().includes("mpt") ? "Advanced" : item.bucket.includes("CBDC") ? "Context" : "Medium";

  return [
    {
      label: isEnglish ? "Safety" : "Veiligheid",
      value: safetyScore,
      text: item.needsConfirmation
        ? isEnglish ? "Needs an extra source check" : "Extra broncontrole nodig"
        : isEnglish ? "Source-weighted" : "Gewogen op bron",
      icon: ShieldCheck,
    },
    {
      label: isEnglish ? "Audience" : "Doelgroep",
      value: reachScore,
      text: isEnglish ? "Best matching angle" : "Best passende invalshoek",
      icon: Target,
    },
    {
      label: isEnglish ? "Complexity" : "Complexiteit",
      value: complexityScore,
      text: isEnglish ? "Explain before posting" : "Leg uit vóór publicatie",
      icon: Brain,
    },
  ];
}

function buildAnalysisOutput(item: XrplIntelItem, mode: AnalysisMode, isEnglish: boolean) {
  const date = formatIntelDate(item.pubDate);
  const sourceLine = `${item.source} (${getSourceTypeLabel(item.sourceType)})`;
  const tags = item.tags.length > 0 ? item.tags.map((tag) => `#${tag.replace(/\s+/g, "")}`).join(" ") : "#XRPL #OnTheTrack";

  if (!isEnglish) {
    if (mode === "beginner") {
      return `UITLEG VOOR BEGINNERS

Onderwerp:
${item.title}

Eenvoudige betekenis:
Dit is een signaal van ${sourceLine}. Het valt onder ${item.bucket}.

Uitleg:
${item.description}

Waarom een beginner dit moet weten:
${item.whyItMatters}

Wat je niet mag aannemen:
- Dit is geen financieel advies.
- Dit is geen prijsvoorspelling.
- Macro-items betekenen niet automatisch adoptie van XRP of XRPL.

Brondatum: ${date}
${tags}`;
    }

    if (mode === "risk") {
      return `RISICO- EN CONTEXTCONTROLE

Item:
${item.title}

Bron:
${sourceLine}
Datum: ${date}
Betrouwbaarheid: ${item.confidenceScore}%
Extra bevestiging nodig: ${item.needsConfirmation ? "Ja" : "Nee"}

Veilig om te zeggen:
- De bron heeft dit item gepubliceerd of ernaar verwezen.
- Het is relevant voor ${item.bucket}.
- Het kan belangrijk zijn omdat: ${item.whyItMatters}

Zeg NIET:
- Dit garandeert adoptie.
- Dit is een koop- of verkoopsignaal.
- Dit bevestigt XRP- of XRPL-gebruik, tenzij de bron dat expliciet zegt.

Controle vóór publicatie:
- Open de oorspronkelijke bron.
- Controleer de datum.
- Controleer het brontype.
- Verwijder hypetaal.`;
    }

    if (mode === "content") {
      return `CONTENTINVALSHOEK

Beste opening:
🚨 De meeste mensen kijken naar prijs. Bouwers kijken naar infrastructuur.

Invalshoek:
${item.title}

Waarom dit kan werken:
- Het is gebaseerd op een bron.
- Het sluit aan op ${item.bucket}.
- Het kan informeren zonder hype.

Richting voor de tekst:
${item.whyItMatters}

Oproep tot actie:
Open de bron. Leer de infrastructuur. Blijf 589 stappen vooruit.

Voorgestelde hashtags:
${tags} #TruthOnTheTrack #OnTheTrack

Naamsvermelding:
Mogelijk gemaakt door XRPL OnTheTrack Terminal
SourceTag 2606170002
${TERMINAL_URL}`;
    }

    if (mode === "verify") {
      return `CONTROLEER VÓÓR PUBLICATIE

1. Open de bron
${item.link}

2. Controleer het brontype
${sourceLine}

3. Controleer de datum
${date}

4. Controleer het claimniveau
- Is het officieel? ${item.officialSource ? "Ja" : "Nee"}
- Extra bevestiging nodig? ${item.needsConfirmation ? "Ja" : "Nee"}

5. Verwijder onveilige claims
- Geen gegarandeerde adoptie.
- Geen prijsvoorspelling.
- Geen handelssignaal.
- Geen aanname dat macro automatisch XRP betekent.

6. Publiceer alleen als educatie of context
Categorie: ${item.bucket}
Betrouwbaarheid: ${item.confidenceScore}%`;
    }

    return `BOUWERSBLIK

Item:
${item.title}

Bron:
${sourceLine}
Datum: ${date}
Categorie: ${item.bucket}
Betrouwbaarheid: ${item.confidenceScore}%

Impact voor bouwers:
${item.whyItMatters}

Technische of contextuele toelichting:
${item.description}

Waar bouwers hierna op moeten letten:
- Heeft dit invloed op standaarden, hulpmiddelen, wallets of integraties?
- Levert dit een nieuwe Academy-module op?
- Verdient dit een Newsroom-post of Medium-artikel?
- Is vóór publicatie nog een extra bron nodig?

Veilige formulering:
Educatie eerst. Bronnen eerst. Geen hype. Geen handelssignaal.

${tags}`;
  }

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