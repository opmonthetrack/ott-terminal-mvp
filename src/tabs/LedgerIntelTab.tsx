import { useEffect, useState, type ElementType } from "react";
import {
  AlertTriangle,
  Clock,
  ExternalLink,
  FileText,
  Globe,
  Landmark,
  Layers,
  Loader2,
  Newspaper,
  Radio,
  Scale,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

type ActiveIntelTab =
  | "daily"
  | "news"
  | "rails"
  | "unl_voting"
  | "hackathon"
  | "cbdc"
  | "stable"
  | "xls"
  | "iso";

type NewsItem = {
  title: string;
  link?: string;
  pubDate?: string;
  author?: string;
  source?: string;
  category?: string;
  description?: string;
};

type IntelTab = {
  id: ActiveIntelTab;
  label: string;
  icon: ElementType;
  status: string;
};

type WatchItem = {
  name: string;
  category: string;
  status: string;
  summary: string;
};

type StableWatchItem = {
  ticker: string;
  name: string;
  peg: string;
  issuer: string;
  status: string;
  summary: string;
};

type CbdcWatchItem = {
  name: string;
  region: string;
  type: string;
  status: string;
  summary: string;
};

const fallbackNews: NewsItem[] = [
  {
    title: "XRPL OnTheTrack Terminal intelligence layer ready for MVP build",
    author: "OTT Terminal",
    pubDate: new Date().toISOString(),
    description:
      "De Ledger Intel module is klaar om later live XRPL nieuws, amendments, validators en ecosystem updates te tonen.",
  },
  {
    title: "Make Waves focus: mainnet usage, real users and source-tagged activity",
    author: "Make Waves MVP",
    pubDate: new Date().toISOString(),
    description:
      "De terminal wordt gebouwd rondom echte gebruikersactivatie en dagelijkse terugkeer.",
  },
  {
    title: "Next technical milestone: Xaman login and Daily Check-In transaction",
    author: "Build Roadmap",
    pubDate: new Date().toISOString(),
    description:
      "De volgende grote stap is een veilige Xaman-flow met een mainnet-transactie en source tag.",
  },
];

const railsWatchItems: WatchItem[] = [
  {
    name: "mBridge",
    category: "Wholesale CBDC Rail",
    status: "Watch",
    summary:
      "Volgen als grensoverschrijdende wholesale CBDC-rail tussen centrale banken, banken en nieuwe settlement-systemen.",
  },
  {
    name: "SWIFT",
    category: "Global Messaging Network",
    status: "Core",
    summary:
      "Belangrijk voor ISO 20022 berichten, bankcommunicatie en de overgang van oude financiële rails naar rijkere data.",
  },
  {
    name: "Fedwire",
    category: "US Payment Rail",
    status: "Core",
    summary:
      "Volgen voor Amerikaanse interbancaire betalingen, dollar settlement, stablecoin-regulatie en ISO 20022 context.",
  },
  {
    name: "T2 / ECB",
    category: "Euro Settlement Rail",
    status: "Core",
    summary:
      "Belangrijk voor grote eurobetalingen, digitale euro research, Europese bankinfrastructuur en institutionele settlement.",
  },
  {
    name: "CHAPS",
    category: "UK Payment Rail",
    status: "Watch",
    summary:
      "Volgen voor Britse wholesale betalingen, Digital Pound onderzoek en tokenized deposit ontwikkelingen.",
  },
  {
    name: "Project Agorá",
    category: "Tokenized Deposits",
    status: "Research",
    summary:
      "Volgen als researchlaag rond tokenized commercial bank deposits, programmable settlement en internationale banken.",
  },
];

const stableWatchItems: StableWatchItem[] = [
  {
    ticker: "RLUSD",
    name: "Ripple USD",
    peg: "USD",
    issuer: "Ripple",
    status: "Priority",
    summary:
      "Belangrijk voor XRPL, institutionele betalingen, liquidity routes en toekomstige stablecoin modules binnen de terminal.",
  },
  {
    ticker: "USDC",
    name: "USD Coin",
    peg: "USD",
    issuer: "Circle",
    status: "Core",
    summary:
      "Fiat-backed dollar-stablecoin om te volgen voor gereguleerde betalingen, multi-chain liquiditeit en institutionele adoptie.",
  },
  {
    ticker: "USDT",
    name: "Tether USD",
    peg: "USD",
    issuer: "Tether",
    status: "Core",
    summary:
      "Grootste stablecoin-liquiditeit in de markt. Belangrijk voor volume, handelsroutes, exchange-activiteit en risk vergelijking.",
  },
  {
    ticker: "PYUSD",
    name: "PayPal USD",
    peg: "USD",
    issuer: "PayPal / Paxos",
    status: "Watch",
    summary:
      "Interessant voor e-commerce, consumentenbetalingen en stablecoin adoption buiten alleen trading.",
  },
  {
    ticker: "EURC",
    name: "Euro Coin",
    peg: "EUR",
    issuer: "Circle",
    status: "Watch",
    summary:
      "Belangrijk voor euro-stablecoin adoptie, MiCA-context en Europese on-chain betalingen.",
  },
  {
    ticker: "EURe",
    name: "Monerium Euro",
    peg: "EUR",
    issuer: "Monerium",
    status: "Research",
    summary:
      "Interessant door de koppeling tussen on-chain euro’s en traditionele bankrekeningstructuren.",
  },
  {
    ticker: "FDUSD",
    name: "First Digital USD",
    peg: "USD",
    issuer: "First Digital",
    status: "Watch",
    summary:
      "Aziatische stablecoin-liquiditeit volgen voor handelsvolume, exchange-activiteit en marktverschuivingen.",
  },
  {
    ticker: "USDG",
    name: "Global Dollar",
    peg: "USD",
    issuer: "Consortium / Paxos",
    status: "Watch",
    summary:
      "Volgen als mogelijk gereguleerd consortium-model voor stablecoin distributie en reserve-opbrengsten.",
  },
];

const cbdcWatchItems: CbdcWatchItem[] = [
  {
    name: "Digital Euro",
    region: "Eurozone",
    type: "Retail CBDC",
    status: "Research",
    summary:
      "Volgen voor privacy, bankenimpact, digitale euro wallet-modellen, offline betalingen en verhouding tot euro-stablecoins.",
  },
  {
    name: "Digital Dollar",
    region: "United States",
    type: "CBDC Debate",
    status: "Watch",
    summary:
      "Volgen in combinatie met Fedwire, FedNow, stablecoin-regulatie, tokenized deposits en dollar-dominantie.",
  },
  {
    name: "e-CNY",
    region: "China",
    type: "Retail CBDC",
    status: "Pilot",
    summary:
      "Belangrijk als grootschalige CBDC-pilot en mogelijke koppeling met wholesale corridors, handel en grensoverschrijdende betalingen.",
  },
  {
    name: "Drex",
    region: "Brazil",
    type: "Wholesale / Tokenization",
    status: "Pilot",
    summary:
      "Interessant vanwege programmable money, tokenized assets, zakelijke betalingen en financiële marktinfrastructuur.",
  },
  {
    name: "Digital Rupee",
    region: "India",
    type: "Retail / Wholesale CBDC",
    status: "Pilot",
    summary:
      "Volgen door grote markt, retailbetalingen, wholesale settlement, remittance en mogelijke massale adoptie.",
  },
  {
    name: "Digital Pound",
    region: "United Kingdom",
    type: "Retail CBDC",
    status: "Research",
    summary:
      "Volgen samen met CHAPS, tokenized deposits, stablecoin-regulatie en Britse bankinfrastructuur.",
  },
  {
    name: "mBridge",
    region: "Multi-Country",
    type: "Wholesale CBDC Bridge",
    status: "Watch",
    summary:
      "Belangrijk voor grensoverschrijdende wholesale CBDC settlement tussen centrale banken en commerciële banken.",
  },
  {
    name: "Project Agorá",
    region: "BIS / Global",
    type: "Tokenized Deposits",
    status: "Research",
    summary:
      "Volgen voor programmable settlement, tokenized commercial bank deposits en samenwerking tussen publieke en private financiële infrastructuur.",
  },
];

const isoWatchItems: WatchItem[] = [
  {
    name: "ISO 20022",
    category: "Financial Messaging Standard",
    status: "Core",
    summary:
      "Geen blockchain en geen token, maar een wereldwijde berichtstandaard voor rijkere betaaldata tussen financiële instellingen.",
  },
  {
    name: "SWIFT MX Messages",
    category: "Bank Messaging",
    status: "Core",
    summary:
      "Volgen omdat SWIFT banken helpt migreren van legacy MT-berichten naar ISO 20022 MX-berichten.",
  },
  {
    name: "Fedwire ISO Migration",
    category: "US Payment Rail",
    status: "Core",
    summary:
      "Belangrijk voor Amerikaanse interbancaire betalingen, dollar settlement en rijkere betaalinformatie.",
  },
  {
    name: "T2 / TARGET Services",
    category: "Euro Settlement",
    status: "Core",
    summary:
      "Belangrijk voor eurobetalingen, centrale bank settlement en ISO 20022-compatibele infrastructuur in Europa.",
  },
  {
    name: "Ripple Payments",
    category: "Payment Network",
    status: "Watch",
    summary:
      "Volgen als brug tussen institutionele betalingen, crypto rails, fiat settlement en enterprise payment software.",
  },
  {
    name: "XRPL / XRP",
    category: "Settlement Research Layer",
    status: "Research",
    summary:
      "Niet claimen als ISO coin. Wel volgen voor settlement, liquidity, tokenized assets en integratie met betaalinfrastructuur.",
  },
];

const xlsWatchItems: WatchItem[] = [
  {
    name: "XLS-20",
    category: "Native NFTs",
    status: "Enabled",
    summary:
      "Native NFT standaard op XRPL. Belangrijk voor badges, proof-of-learning, membership assets en toekomstige reward collectibles.",
  },
  {
    name: "XLS-30",
    category: "Automated Market Maker",
    status: "Enabled",
    summary:
      "Native AMM functionaliteit op XRPL. Belangrijk voor liquidity analytics, LP insights, swap routes en yield modules.",
  },
  {
    name: "XLS-40",
    category: "Decentralized Identity",
    status: "Research",
    summary:
      "DID-laag om te volgen voor reputation, credentials, wallet identity en later mogelijk proof-of-learning.",
  },
  {
    name: "XLS-65",
    category: "Single Asset Vaults",
    status: "Watch",
    summary:
      "Belangrijk om te volgen voor single-asset liquidity, vault-structuren en mogelijke passieve rendementmodules.",
  },
  {
    name: "XLS-66",
    category: "Lending Protocol",
    status: "Watch",
    summary:
      "Belangrijk voor mogelijke native lending, collateral, credit markets en institutionele XRPL DeFi.",
  },
  {
    name: "Credentials",
    category: "Compliance / Identity",
    status: "Watch",
    summary:
      "Volgen voor KYC-compatible flows, regulated assets, permissioned access en zakelijke XRPL use cases.",
  },
];

const unlWatchItems: WatchItem[] = [
  {
    name: "Validator Health",
    category: "Network Reliability",
    status: "Core",
    summary:
      "Volgen of validators online, stabiel en consistent zijn. Later kunnen we uptime, missed validations en server health live tonen.",
  },
  {
    name: "UNL Membership",
    category: "Trusted Validator List",
    status: "Core",
    summary:
      "Volgen welke validators op een trusted list staan en hoe dit invloed heeft op consensus, decentralisatie en netwerkvertrouwen.",
  },
  {
    name: "Amendment Voting",
    category: "Protocol Governance",
    status: "Watch",
    summary:
      "Volgen welke amendments open staan, hoeveel support ze hebben en wanneer ze mogelijk geactiveerd worden.",
  },
  {
    name: "Consensus Threshold",
    category: "Agreement Layer",
    status: "Research",
    summary:
      "Belangrijk voor begrip van hoe XRPL consensus werkt en waarom validator overlap en betrouwbaarheid essentieel zijn.",
  },
  {
    name: "Validator Operators",
    category: "Ecosystem Actors",
    status: "Watch",
    summary:
      "Volgen welke partijen validators draaien: community, bedrijven, universiteiten, infrastructuurpartijen en ecosystem builders.",
  },
  {
    name: "OTT Validator Path",
    category: "Future Infrastructure",
    status: "Future",
    summary:
      "Later onderzoeken of OnTheTrack een eigen node, validator of observer-dashboard kan draaien als educatieve infrastructuur.",
  },
];

const makeWavesItems: WatchItem[] = [
  {
    name: "Live Mainnet Project",
    category: "Challenge Requirement",
    status: "Required",
    summary:
      "De terminal moet live op XRPL mainnet bruikbaar zijn. Testnet of alleen demo telt niet als echte challenge-activiteit.",
  },
  {
    name: "Source Tag",
    category: "User Tracking",
    status: "Critical",
    summary:
      "Elke relevante transactie moet later de juiste source tag dragen zodat gebruikersactiviteit meetbaar wordt voor de leaderboard.",
  },
  {
    name: "Daily Check-In",
    category: "Mainnet Action",
    status: "Next",
    summary:
      "Een simpele dagelijkse Xaman actie waarmee gebruikers terugkomen en echte mainnet activiteit kunnen uitvoeren.",
  },
  {
    name: "Real Active Users",
    category: "Growth Metric",
    status: "Core",
    summary:
      "Niet alleen logins tellen. De focus ligt op echte gebruikers die via de terminal een XRPL mainnet actie doen.",
  },
  {
    name: "2 Minute Demo",
    category: "Pitch Asset",
    status: "Soon",
    summary:
      "Een korte demo waarin login, daily intel, check-in, source-tagged actie en user value helder worden getoond.",
  },
  {
    name: "Pitch Deck",
    category: "Submission Asset",
    status: "Soon",
    summary:
      "Deck moet het probleem, de oplossing, doelgroep, traction loop, XRPL gebruik en roadmap duidelijk uitleggen.",
  },
  {
    name: "Learn & Earn Loop",
    category: "Retention",
    status: "Build",
    summary:
      "Gebruikers komen dagelijks terug voor nieuws, educatie, quizvragen, XP en later mogelijke token/badge rewards.",
  },
  {
    name: "Anti-Bot Logic",
    category: "Fair Usage",
    status: "Later",
    summary:
      "Later toevoegen: limieten, wallet checks, streak-validatie en bescherming tegen nepactiviteit.",
  },
];

function formatDate(date?: string) {
  if (!date) return "Unknown date";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Unknown date";
  }

  return parsedDate.toLocaleDateString("nl-NL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getTodayLabel() {
  return new Date().toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function WatchCard({ item }: { item: WatchItem }) {
  return (
    <div className="border border-white/10 bg-black p-4 hover:bg-white/[0.03] transition-all">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h4 className="font-orbitron text-sm font-bold uppercase mb-1">
            {item.name}
          </h4>

          <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest">
            {item.category}
          </p>
        </div>

        <span className="border border-white/10 px-2 py-1 font-mono text-[9px] text-white/50 uppercase">
          {item.status}
        </span>
      </div>

      <p className="font-mono text-xs text-white/45 leading-relaxed">
        {item.summary}
      </p>
    </div>
  );
}

function StableWatchCard({ item }: { item: StableWatchItem }) {
  return (
    <div className="border border-white/10 bg-black p-4 hover:bg-white/[0.03] transition-all">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-orbitron text-sm font-bold uppercase">
              {item.ticker}
            </h4>
            <span className="font-mono text-[9px] text-white/30 uppercase">
              {item.peg}
            </span>
          </div>

          <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest">
            {item.name} • {item.issuer}
          </p>
        </div>

        <span className="border border-white/10 px-2 py-1 font-mono text-[9px] text-white/50 uppercase">
          {item.status}
        </span>
      </div>

      <p className="font-mono text-xs text-white/45 leading-relaxed">
        {item.summary}
      </p>
    </div>
  );
}

function CbdcWatchCard({ item }: { item: CbdcWatchItem }) {
  return (
    <div className="border border-white/10 bg-black p-4 hover:bg-white/[0.03] transition-all">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h4 className="font-orbitron text-sm font-bold uppercase mb-1">
            {item.name}
          </h4>

          <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest">
            {item.region} • {item.type}
          </p>
        </div>

        <span className="border border-white/10 px-2 py-1 font-mono text-[9px] text-white/50 uppercase">
          {item.status}
        </span>
      </div>

      <p className="font-mono text-xs text-white/45 leading-relaxed">
        {item.summary}
      </p>
    </div>
  );
}

export function LedgerIntelTab() {
  const [activeTab, setActiveTab] = useState<ActiveIntelTab>("daily");
  const [news, setNews] = useState<NewsItem[]>(fallbackNews);
  const [isLoading, setIsLoading] = useState(false);

  const tabs: IntelTab[] = [
    { id: "daily", label: "Daily Brief", icon: Sparkles, status: "Live" },
    { id: "news", label: "XRPL News", icon: Newspaper, status: "Live" },
    { id: "rails", label: "Rails Watch", icon: Layers, status: "Macro" },
    { id: "unl_voting", label: "UNL Voting", icon: Server, status: "Watch" },
    { id: "hackathon", label: "Make Waves", icon: Zap, status: "MVP" },
    { id: "cbdc", label: "CBDC Tracker", icon: Globe, status: "Watch" },
    { id: "stable", label: "Stable Tokens", icon: Landmark, status: "Watch" },
    { id: "xls", label: "XLS Roadmap", icon: FileText, status: "Watch" },
    { id: "iso", label: "ISO 20022 & Law", icon: Scale, status: "Map" },
  ];

  useEffect(() => {
    if (activeTab !== "news" && activeTab !== "daily") return;

    const fetchNews = async () => {
      setIsLoading(true);

      try {
        const res = await fetch("/api/news");

        if (!res.ok) {
          setNews(fallbackNews);
          return;
        }

        const data = await res.json();
        const items = Array.isArray(data.items) ? data.items : [];

        if (items.length > 0) {
          setNews(items);
        } else {
          setNews(fallbackNews);
        }
      } catch (error) {
        console.error("Nieuws feed error:", error);
        setNews(fallbackNews);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, [activeTab]);

  const dailyNews = news.slice(0, 3);

  return (
    <div className="p-6 bg-black text-white min-h-screen">
      <div className="border border-white/10 bg-white/[0.02] p-6 mb-6">
        <div className="flex items-center gap-2 mb-4 text-white/45">
          <Globe size={16} />
          <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
            XRPL Intelligence Engine
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 xl:col-span-8">
            <h2 className="font-orbitron text-3xl font-black uppercase mb-4">
              Ledger Intel Terminal
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              De intelligence-laag van XRPL OnTheTrack Terminal. Hier komen
              nieuws, validators, amendments, Make Waves updates, stablecoins,
              CBDC, XLS-roadmaps en wetgeving samen.
            </p>
          </div>

          <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-3">
            <div className="border border-white/10 bg-black p-4">
              <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
                Feed
              </p>
              <div className="flex items-center gap-2">
                <Radio size={15} className="text-white/60" />
                <p className="font-orbitron text-xs uppercase">Optional API</p>
              </div>
            </div>

            <div className="border border-white/10 bg-black p-4">
              <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
                Mode
              </p>
              <div className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-white/60" />
                <p className="font-orbitron text-xs uppercase">Safe Preview</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border border-white/10 bg-white/[0.02] p-2 mb-6 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-9 gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-4 text-left border transition-all ${
                isActive
                  ? "bg-white text-black border-white"
                  : "bg-black border-white/10 text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <Icon size={17} />
                <span className="font-mono text-[8px] uppercase tracking-widest">
                  {tab.status}
                </span>
              </div>

              <p className="font-orbitron text-[10px] font-black uppercase tracking-widest">
                {tab.label}
              </p>
            </button>
          );
        })}
      </div>

      {activeTab === "daily" && (
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-8 border border-white/10 bg-white/[0.02] p-6">
            <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-4">
              {getTodayLabel()}
            </p>

            <h3 className="font-orbitron text-2xl font-black uppercase mb-4">
              Daily XRPL Intel Brief
            </h3>

            <p className="font-mono text-sm text-white/45 leading-relaxed mb-6">
              Dit is straks de dagelijkse reden om terug te komen: nieuwe XRPL
              updates, Ripple/Xaman nieuws, stablecoins, CBDC, ISO 20022 en
              Make Waves voortgang.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              <div className="border border-white/10 bg-black p-4">
                <p className="font-mono text-[10px] text-white/35 uppercase mb-2">
                  News Items
                </p>
                <p className="font-orbitron text-2xl font-black">
                  {news.length}
                </p>
              </div>

              <div className="border border-white/10 bg-black p-4">
                <p className="font-mono text-[10px] text-white/35 uppercase mb-2">
                  Daily XP
                </p>
                <p className="font-orbitron text-2xl font-black">Soon</p>
              </div>

              <div className="border border-white/10 bg-black p-4">
                <p className="font-mono text-[10px] text-white/35 uppercase mb-2">
                  Token Rewards
                </p>
                <p className="font-orbitron text-2xl font-black">Later</p>
              </div>
            </div>

            <div className="space-y-3">
              {dailyNews.map((item, index) => (
                <div
                  key={`${item.title}-${index}`}
                  className="border border-white/10 bg-black p-4"
                >
                  <h4 className="font-orbitron text-sm font-bold uppercase mb-2 leading-relaxed">
                    {item.title}
                  </h4>

                  <p className="font-mono text-xs text-white/40 leading-relaxed mb-3">
                    {item.description ||
                      "Geen omschrijving beschikbaar voor dit item."}
                  </p>

                  <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest">
                    {formatDate(item.pubDate)} •{" "}
                    {item.author || item.source || "XRPL Source"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-12 xl:col-span-4 space-y-4">
            <div className="border border-white/10 bg-white/[0.02] p-6">
              <div className="flex items-center gap-2 mb-5">
                <Sparkles size={17} className="text-white/60" />
                <p className="font-orbitron text-xs uppercase tracking-widest">
                  Watch Today
                </p>
              </div>

              <div className="space-y-3">
                <div className="border border-white/10 bg-black p-3">
                  <p className="font-mono text-xs text-white/70">
                    mBridge / SWIFT / Fedwire
                  </p>
                </div>

                <div className="border border-white/10 bg-black p-3">
                  <p className="font-mono text-xs text-white/70">
                    RLUSD & fiat-backed stablecoins
                  </p>
                </div>

                <div className="border border-white/10 bg-black p-3">
                  <p className="font-mono text-xs text-white/70">
                    CBDC / Digital Euro / ISO 20022
                  </p>
                </div>

                <div className="border border-white/10 bg-black p-3">
                  <p className="font-mono text-xs text-white/70">
                    Learn & Earn: XP nu, token later
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "news" && (
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-8 border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
                  Live Intelligence Feed
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  XRPL News Stream
                </h3>
              </div>

              {isLoading && (
                <Loader2 className="animate-spin text-white/50" size={22} />
              )}
            </div>

            <div className="relative mb-5">
              <Search
                className="absolute left-3 top-3 text-white/30"
                size={16}
              />

              <input
                className="w-full bg-black border border-white/10 py-3 pl-10 pr-4 text-sm font-mono outline-none focus:border-white/30"
                placeholder="Search intelligence feed..."
              />
            </div>

            <div className="space-y-3">
              {news.map((item, index) => (
                <div
                  key={`${item.title}-${index}`}
                  className="border border-white/10 bg-black p-4 hover:bg-white/[0.03] transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-orbitron text-sm font-bold uppercase mb-2 leading-relaxed">
                        {item.title}
                      </h4>

                      <p className="font-mono text-xs text-white/40 leading-relaxed mb-3">
                        {item.description ||
                          "Geen omschrijving beschikbaar voor dit item."}
                      </p>

                      <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest">
                        {formatDate(item.pubDate)} •{" "}
                        {item.author || item.source || "XRPL Source"}
                      </p>
                    </div>

                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 border border-white/10 p-2 text-white/40 hover:text-white hover:bg-white/10 transition-all"
                      >
                        <ExternalLink size={15} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "rails" && (
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-8 border border-white/10 bg-white/[0.02] p-6">
            <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-4">
              Macro Payment Rails
            </p>

            <h3 className="font-orbitron text-2xl font-black uppercase mb-4">
              mBridge / SWIFT / Fedwire Watch
            </h3>

            <p className="font-mono text-sm text-white/45 leading-relaxed mb-6">
              Deze module volgt de grote betaalrails achter het wereldwijde
              financiële systeem. Dit is belangrijk voor stablecoins, CBDC,
              tokenized deposits, ISO 20022 en toekomstige settlement-routes.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {railsWatchItems.map((item) => (
                <WatchCard key={item.name} item={item} />
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "unl_voting" && (
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-8 border border-white/10 bg-white/[0.02] p-6">
            <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-4">
              Validator Governance & Network Health
            </p>

            <h3 className="font-orbitron text-2xl font-black uppercase mb-4">
              UNL Voting Watch
            </h3>

            <p className="font-mono text-sm text-white/45 leading-relaxed mb-6">
              Deze module volgt validators, UNL membership, amendment voting,
              consensus health en netwerk decentralisatie. Later koppelen we dit
              aan live XRPL validator data.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {unlWatchItems.map((item) => (
                <WatchCard key={item.name} item={item} />
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "stable" && (
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-8 border border-white/10 bg-white/[0.02] p-6">
            <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-4">
              Fiat-Backed Stablecoin Matrix
            </p>

            <h3 className="font-orbitron text-2xl font-black uppercase mb-4">
              Stable Tokens Watch
            </h3>

            <p className="font-mono text-sm text-white/45 leading-relaxed mb-6">
              Deze module volgt fiat-backed stablecoins, RLUSD, euro-stablecoins
              en gereguleerde betaalrails. Later voegen we live data, issuers,
              reserves, ledgers en risk scores toe.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {stableWatchItems.map((item) => (
                <StableWatchCard key={item.ticker} item={item} />
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "cbdc" && (
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-8 border border-white/10 bg-white/[0.02] p-6">
            <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-4">
              Central Bank Digital Currency Radar
            </p>

            <h3 className="font-orbitron text-2xl font-black uppercase mb-4">
              CBDC Tracker
            </h3>

            <p className="font-mono text-sm text-white/45 leading-relaxed mb-6">
              Deze module volgt CBDC-pilots, wholesale CBDC, retail CBDC,
              tokenized deposits, BIS-projecten en digitale valuta van centrale
              banken.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {cbdcWatchItems.map((item) => (
                <CbdcWatchCard key={item.name} item={item} />
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "iso" && (
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-8 border border-white/10 bg-white/[0.02] p-6">
            <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-4">
              ISO 20022 Intelligence Map
            </p>

            <h3 className="font-orbitron text-2xl font-black uppercase mb-4">
              ISO 20022 Monitor
            </h3>

            <p className="font-mono text-sm text-white/45 leading-relaxed mb-6">
              ISO 20022 is geen crypto-token, maar een financiële
              berichtstandaard. Deze module volgt banknetwerken,
              softwarelagen, settlement rails en ledger research zonder
              hype-taal.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {isoWatchItems.map((item) => (
                <WatchCard key={item.name} item={item} />
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "xls" && (
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-8 border border-white/10 bg-white/[0.02] p-6">
            <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-4">
              XRPL Standards & Protocol Roadmap
            </p>

            <h3 className="font-orbitron text-2xl font-black uppercase mb-4">
              XLS Roadmap
            </h3>

            <p className="font-mono text-sm text-white/45 leading-relaxed mb-6">
              Deze module volgt XRPL-standaarden en protocolrichtingen die
              belangrijk zijn voor NFTs, AMM, identity, vaults, lending,
              credentials, rewards en toekomstige terminal modules.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {xlsWatchItems.map((item) => (
                <WatchCard key={item.name} item={item} />
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "hackathon" && (
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-8 border border-white/10 bg-white/[0.02] p-6">
            <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-4">
              Make Waves Challenge Cockpit
            </p>

            <h3 className="font-orbitron text-2xl font-black uppercase mb-4">
              Mainnet User Activation
            </h3>

            <p className="font-mono text-sm text-white/45 leading-relaxed mb-6">
              Deze module bewaakt de challenge-flow: live mainnet project,
              source tag, echte gebruikers, daily check-in, demo video en pitch
              voorbereiding.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              <div className="border border-white/10 bg-black p-4">
                <p className="font-mono text-[10px] text-white/35 uppercase mb-2">
                  Source Tag
                </p>
                <p className="font-orbitron text-lg font-black">Pending</p>
              </div>

              <div className="border border-white/10 bg-black p-4">
                <p className="font-mono text-[10px] text-white/35 uppercase mb-2">
                  Mainnet Action
                </p>
                <p className="font-orbitron text-lg font-black">Soon</p>
              </div>

              <div className="border border-white/10 bg-black p-4">
                <p className="font-mono text-[10px] text-white/35 uppercase mb-2">
                  Demo Flow
                </p>
                <p className="font-orbitron text-lg font-black">Building</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {makeWavesItems.map((item) => (
                <WatchCard key={item.name} item={item} />
              ))}
            </div>
          </div>

          <div className="col-span-12 xl:col-span-4 border border-white/10 bg-white/[0.02] p-8">
            <Clock className="w-10 h-10 mb-6 text-white/50" />

            <h4 className="font-orbitron text-lg font-black uppercase mb-4">
              Next Steps
            </h4>

            <div className="space-y-4">
              <div className="border-l border-white/20 pl-4">
                <p className="font-mono text-xs text-white/70">
                  1. Xaman login herstellen
                </p>
              </div>

              <div className="border-l border-white/10 pl-4">
                <p className="font-mono text-xs text-white/50">
                  2. Source tag vastleggen
                </p>
              </div>

              <div className="border-l border-white/10 pl-4">
                <p className="font-mono text-xs text-white/50">
                  3. Daily Check-In bouwen
                </p>
              </div>

              <div className="border-l border-white/10 pl-4">
                <p className="font-mono text-xs text-white/50">
                  4. Pitch demo opnemen
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
