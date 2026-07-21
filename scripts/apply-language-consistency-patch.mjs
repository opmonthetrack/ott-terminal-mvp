import fs from "node:fs/promises";

async function patchFile(path, replacements) {
  let content = await fs.readFile(path, "utf8");
  let changed = false;

  for (const { before, after, label } of replacements) {
    if (content.includes(after)) {
      continue;
    }

    if (!content.includes(before)) {
      throw new Error(`Missing patch target in ${path}: ${label}`);
    }

    content = content.replace(before, after);
    changed = true;
  }

  if (changed) {
    await fs.writeFile(path, content);
  }

  return changed;
}

const appChanged = await patchFile("src/App.tsx", [
  {
    label: "pass language to mobile header",
    before: `      <MobileHeader
        activeItem={activeItem}
        walletAddress={walletAddress}
        onOpenMenu={() => setIsMobileMenuOpen(true)}
      />`,
    after: `      <MobileHeader
        activeItem={activeItem}
        walletAddress={walletAddress}
        language={language}
        onOpenMenu={() => setIsMobileMenuOpen(true)}
      />`,
  },
  {
    label: "mobile header language prop",
    before: `function MobileHeader({
  activeItem,
  walletAddress,
  onOpenMenu,
}: {
  activeItem: MenuItem;
  walletAddress: string;
  onOpenMenu: () => void;
}) {`,
    after: `function MobileHeader({
  activeItem,
  walletAddress,
  language,
  onOpenMenu,
}: {
  activeItem: MenuItem;
  walletAddress: string;
  language: TerminalLanguage;
  onOpenMenu: () => void;
}) {`,
  },
  {
    label: "mobile open menu aria",
    before: `          aria-label="Open menu"`,
    after: `          aria-label={language === "en" ? "Open menu" : "Open menu"}`,
  },
  {
    label: "mobile guest connected label",
    before: `            {walletAddress === "guest" ? "Guest / " : "Connected / "}
            XRPL Terminal`,
    after: `            {walletAddress === "guest"
              ? language === "en"
                ? "Guest / "
                : "Gast / "
              : language === "en"
                ? "Connected / "
                : "Verbonden / "}
            XRPL Terminal`,
  },
  {
    label: "mobile close aria",
    before: `            aria-label="Close menu"`,
    after: `            aria-label={language === "en" ? "Close menu" : "Sluit menu"}`,
  },
  {
    label: "language switch English first",
    before: `        <div
          className={\`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] rounded shadow transition-all duration-300 \${
            language === "nl" ? "left-1" : "left-[calc(50%+2px)]"
          }\`}
        />
        <button
          onClick={() => setLanguage("nl")}
          className={\`flex-1 relative z-10 text-[10px] font-bold uppercase tracking-widest py-2 rounded transition-colors \${
            language === "nl" ? "text-white" : "text-black/40 hover:text-black"
          }\`}
        >
          NL
        </button>
        <button
          onClick={() => setLanguage("en")}
          className={\`flex-1 relative z-10 text-[10px] font-bold uppercase tracking-widest py-2 rounded transition-colors \${
            language === "en" ? "text-white" : "text-black/40 hover:text-black"
          }\`}
        >
          EN
        </button>`,
    after: `        <div
          className={\`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] rounded shadow transition-all duration-300 \${
            language === "en" ? "left-1" : "left-[calc(50%+2px)]"
          }\`}
        />
        <button
          onClick={() => setLanguage("en")}
          className={\`flex-1 relative z-10 text-[10px] font-bold uppercase tracking-widest py-2 rounded transition-colors \${
            language === "en" ? "text-white" : "text-black/40 hover:text-black"
          }\`}
        >
          ENGLISH
        </button>
        <button
          onClick={() => setLanguage("nl")}
          className={\`flex-1 relative z-10 text-[10px] font-bold uppercase tracking-widest py-2 rounded transition-colors \${
            language === "nl" ? "text-white" : "text-black/40 hover:text-black"
          }\`}
        >
          NEDERLANDS
        </button>`,
  },
]);

const dashboardChanged = await patchFile("src/tabs/DashboardTab.tsx", [
  {
    label: "dashboard language import",
    before: `} from "../lib/newsClient";
`,
    after: `} from "../lib/newsClient";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";
`,
  },
  {
    label: "dashboard quick routes bilingual",
    before: `const quickRoutes: QuickRoute[] = [
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
];`,
    after: `function getQuickRoutes(isEnglish: boolean): QuickRoute[] {
  return [
    {
      title: "XRPL Intelligence",
      status: "Raw Feed",
      text: isEnglish
        ? "Open the source layer with buckets, source health and live intelligence items."
        : "Open de bronlaag met buckets, bronstatus en live intelligence-items.",
      icon: Radio,
      tabId: "intel",
    },
    {
      title: "Newsroom",
      status: "Social",
      text: isEnglish
        ? "Create copy-ready drafts for X, LinkedIn, Instagram, Medium and more."
        : "Maak direct bruikbare concepten voor X, LinkedIn, Instagram, Medium en meer.",
      icon: Newspaper,
      tabId: "news",
    },
    {
      title: "OTT Intelligence",
      status: "AI Studio",
      text: isEnglish
        ? "Analyze every item through a builder lens, risk context and verification checklist."
        : "Analyseer elk item met een bouwersblik, risicocontext en verificatiechecklist.",
      icon: Sparkles,
      tabId: "ottintelligence",
    },
    {
      title: isEnglish ? "Reward Ledger" : "Beloningsoverzicht",
      status: "XP",
      text: isEnglish
        ? "View local XP, OTT Credits and Make Waves proof context."
        : "Bekijk lokale XP, OTT Credits en Make Waves-bewijscontext.",
      icon: BookOpen,
      tabId: "rewardledger",
    },
  ];
}`,
  },
  {
    label: "dashboard fallback item function",
    before: `const emptyItem: XrplIntelItem = {
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
};`,
    after: `function getEmptyItem(isEnglish: boolean): XrplIntelItem {
  return {
    title: isEnglish ? "No intelligence loaded yet" : "Nog geen intelligence geladen",
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
      ? "Load the daily snapshot to see today’s top signal."
      : "Laad de dagelijkse momentopname om het belangrijkste signaal van vandaag te zien.",
    description: isEnglish
      ? "Waiting for /api/news intelligence data."
      : "Wachten op intelligence-data van /api/news.",
  };
}`,
  },
  {
    label: "dashboard language state",
    before: `export function DashboardTab({ onNavigate }: DashboardTabProps) {
  const [data, setData] = useState<XrplIntelResponse | null>(null);`,
    after: `export function DashboardTab({ onNavigate }: DashboardTabProps) {
  const { language } = useTerminalLanguage();
  const isEnglish = language === "en";
  const quickRoutes = getQuickRoutes(isEnglish);
  const [data, setData] = useState<XrplIntelResponse | null>(null);`,
  },
  {
    label: "dashboard load error bilingual",
    before: `          : "Daily Intelligence Snapshot kon niet worden geladen.",`,
    after: `          : isEnglish
            ? "Daily Intelligence Snapshot could not be loaded."
            : "De dagelijkse intelligence-momentopname kon niet worden geladen.",`,
  },
  {
    label: "dashboard empty item call",
    before: `  const topItem = items[0] ?? emptyItem;`,
    after: `  const topItem = items[0] ?? getEmptyItem(isEnglish);`,
  },
  {
    label: "dashboard metrics bilingual",
    before: `      label: "Live Items",
      value: loading ? "..." : String(items.length),
      text: data?.fallback ? "Fallback active" : "Daily feed",`,
    after: `      label: isEnglish ? "Live Items" : "Live-items",
      value: loading ? "..." : String(items.length),
      text: data?.fallback
        ? isEnglish ? "Fallback active" : "Terugval actief"
        : isEnglish ? "Daily feed" : "Dagelijkse feed",`,
  },
  {
    label: "dashboard official metric",
    before: `      label: "Official Sources",
      value: loading ? "..." : String(officialCount),
      text: "Source weighted",`,
    after: `      label: isEnglish ? "Official Sources" : "Officiële bronnen",
      value: loading ? "..." : String(officialCount),
      text: isEnglish ? "Source weighted" : "Gewogen op bron",`,
  },
  {
    label: "dashboard tech metric",
    before: `      label: "Tech Signals",
      value: loading ? "..." : String(technicalCount),`,
    after: `      label: isEnglish ? "Tech Signals" : "Technische signalen",
      value: loading ? "..." : String(technicalCount),`,
  },
  {
    label: "dashboard source error",
    before: `      setError("No source link available for today’s top signal.");`,
    after: `      setError(
        isEnglish
          ? "No source link is available for today’s top signal."
          : "Er is geen bronlink beschikbaar voor het belangrijkste signaal van vandaag.",
      );`,
  },
  {
    label: "dashboard intro bilingual",
    before: `              <p className="font-mono text-sm text-black/55 max-w-3xl leading-relaxed">
                Eén dashboard voor de dagelijkse XRPL Intelligence-flow: top
                signal, source health, buckets en snelle routes naar Intelligence,
                Newsroom en OTT AI Studio.
              </p>`,
    after: `              <p className="font-mono text-sm text-black/55 max-w-3xl leading-relaxed">
                {isEnglish
                  ? "One dashboard for the daily XRPL Intelligence flow: top signal, source health, buckets and fast routes to Intelligence, Newsroom and OTT AI Studio."
                  : "Eén dashboard voor de dagelijkse XRPL Intelligence-stroom: belangrijkste signaal, bronstatus, categorieën en snelle routes naar Intelligence, Newsroom en OTT AI Studio."}
              </p>`,
  },
  {
    label: "dashboard refresh label",
    before: `{refreshing ? "Refreshing" : "Refresh Snapshot"}`,
    after: `{refreshing
                      ? isEnglish ? "Refreshing" : "Verversen"
                      : isEnglish ? "Refresh Snapshot" : "Momentopname verversen"}`,
  },
  {
    label: "dashboard open source label",
    before: `                    Open Top Source`,
    after: `                    {isEnglish ? "Open Top Source" : "Open belangrijkste bron"}`,
  },
  {
    label: "dashboard top signal panel",
    before: `<Panel title="Today’s Top Signal" icon={Radio}>`,
    after: `<Panel title={isEnglish ? "Today’s Top Signal" : "Belangrijkste signaal van vandaag"} icon={Radio}>`,
  },
  {
    label: "dashboard loading text",
    before: `                    Loading /api/news daily snapshot...`,
    after: `                    {isEnglish
                      ? "Loading /api/news daily snapshot..."
                      : "Dagelijkse momentopname van /api/news laden..."}`,
  },
  {
    label: "dashboard review badge",
    before: `<Badge label="Needs review" tone="warn" />`,
    after: `<Badge label={isEnglish ? "Needs review" : "Controle nodig"} tone="warn" />`,
  },
  {
    label: "dashboard why matters",
    before: `                      Why it matters`,
    after: `                      {isEnglish ? "Why it matters" : "Waarom dit belangrijk is"}`,
  },
  {
    label: "dashboard mini labels",
    before: `                    <MiniBox label="Bucket" value={topItem.bucket} />
                    <MiniBox label="Signal" value={topItem.signalType} />
                    <MiniBox label="Review" value={topItem.needsConfirmation ? "Required" : "Low"} />`,
    after: `                    <MiniBox label={isEnglish ? "Bucket" : "Categorie"} value={topItem.bucket} />
                    <MiniBox label={isEnglish ? "Signal" : "Signaal"} value={topItem.signalType} />
                    <MiniBox
                      label={isEnglish ? "Review" : "Controle"}
                      value={topItem.needsConfirmation
                        ? isEnglish ? "Required" : "Vereist"
                        : isEnglish ? "Low" : "Laag"}
                    />`,
  },
  {
    label: "dashboard source health panel",
    before: `<Panel title="Source Health" icon={Eye}>`,
    after: `<Panel title={isEnglish ? "Source Health" : "Bronstatus"} icon={Eye}>`,
  },
  {
    label: "dashboard source health empty",
    before: `                    Source health verschijnt na live fetch.`,
    after: `                    {isEnglish
                      ? "Source health appears after a live fetch."
                      : "De bronstatus verschijnt na een live-ophaalactie."}`,
  },
  {
    label: "dashboard buckets panel",
    before: `<Panel title="Top Buckets" icon={BarChart3}>`,
    after: `<Panel title={isEnglish ? "Top Buckets" : "Belangrijkste categorieën"} icon={BarChart3}>`,
  },
  {
    label: "dashboard queue panel",
    before: `<Panel title="Signal Queue" icon={FileSearch}>`,
    after: `<Panel title={isEnglish ? "Signal Queue" : "Signalenwachtrij"} icon={FileSearch}>`,
  },
  {
    label: "dashboard quick actions panel",
    before: `<Panel title="Quick Actions" icon={Zap}>`,
    after: `<Panel title={isEnglish ? "Quick Actions" : "Snelle acties"} icon={Zap}>`,
  },
  {
    label: "dashboard safety panel",
    before: `<Panel title="Safety Position" icon={ShieldCheck}>`,
    after: `<Panel title={isEnglish ? "Safety Position" : "Veiligheidspositie"} icon={ShieldCheck}>`,
  },
  {
    label: "dashboard safety lines",
    before: `                <SafetyLine icon={CheckCircle2} text="Education-first intelligence." />
                <SafetyLine icon={CheckCircle2} text="No financial advice or trading signals." />
                <SafetyLine icon={CheckCircle2} text="SourceTag 2606170002 remains visible." />
                <SafetyLine icon={CheckCircle2} text="Human review before publishing." />`,
    after: `                <SafetyLine icon={CheckCircle2} text={isEnglish ? "Education-first intelligence." : "Intelligence met educatie voorop."} />
                <SafetyLine icon={CheckCircle2} text={isEnglish ? "No financial advice or trading signals." : "Geen financieel advies of handelssignalen."} />
                <SafetyLine icon={CheckCircle2} text={isEnglish ? "SourceTag 2606170002 remains visible." : "SourceTag 2606170002 blijft zichtbaar."} />
                <SafetyLine icon={CheckCircle2} text={isEnglish ? "Human review before publishing." : "Menselijke controle vóór publicatie."} />`,
  },
  {
    label: "dashboard build panel",
    before: `<Panel title="Build Status" icon={Bell}>`,
    after: `<Panel title={isEnglish ? "Build Status" : "Bouwstatus"} icon={Bell}>`,
  },
  {
    label: "dashboard public url label",
    before: `<MiniBox label="Public URL" value={TERMINAL_URL.replace("https://", "")} />`,
    after: `<MiniBox label={isEnglish ? "Public URL" : "Publieke URL"} value={TERMINAL_URL.replace("https://", "")} />`,
  },
]);

console.log(JSON.stringify({ appChanged, dashboardChanged }));
