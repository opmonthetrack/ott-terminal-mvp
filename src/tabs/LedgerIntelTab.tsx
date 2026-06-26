import { useEffect, useState, type ElementType } from "react";
import {
  AlertTriangle,
  Clock,
  ExternalLink,
  FileText,
  Globe,
  Landmark,
  Loader2,
  Newspaper,
  Radio,
  Scale,
  Search,
  Server,
  ShieldCheck,
  Zap,
} from "lucide-react";

type ActiveIntelTab =
  | "news"
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
  description?: string;
};

type IntelTab = {
  id: ActiveIntelTab;
  label: string;
  icon: ElementType;
  status: string;
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

export function LedgerIntelTab() {
  const [activeTab, setActiveTab] = useState<ActiveIntelTab>("news");
  const [news, setNews] = useState<NewsItem[]>(fallbackNews);
  const [isLoading, setIsLoading] = useState(false);

  const tabs: IntelTab[] = [
    {
      id: "news",
      label: "XRPL News",
      icon: Newspaper,
      status: "Live",
    },
    {
      id: "unl_voting",
      label: "UNL Voting",
      icon: Server,
      status: "Soon",
    },
    {
      id: "hackathon",
      label: "Make Waves",
      icon: Zap,
      status: "MVP",
    },
    {
      id: "cbdc",
      label: "CBDC Tracker",
      icon: Globe,
      status: "Research",
    },
    {
      id: "stable",
      label: "Stable Tokens",
      icon: Landmark,
      status: "Soon",
    },
    {
      id: "xls",
      label: "XLS Roadmap",
      icon: FileText,
      status: "Soon",
    },
    {
      id: "iso",
      label: "ISO 20022 & Law",
      icon: Scale,
      status: "Research",
    },
  ];

  useEffect(() => {
    if (activeTab !== "news") return;

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

  return (
    <div className="p-6 bg-black text-white min-h-screen">
      {/* HEADER */}
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

      {/* TAB NAV */}
      <div className="border border-white/10 bg-white/[0.02] p-2 mb-6 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-2">
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

      {/* NEWS */}
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
                        {item.author || "XRPL Source"}
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

          <div className="col-span-12 xl:col-span-4 space-y-4">
            <div className="border border-white/10 bg-white/[0.02] p-6">
              <div className="flex items-center gap-2 mb-5">
                <Newspaper size={17} className="text-white/60" />
                <p className="font-orbitron text-xs uppercase tracking-widest">
                  Feed Status
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs border-b border-white/10 pb-3">
                  <span className="font-mono text-white/45">RSS/API</span>
                  <span className="font-mono text-white/70">
                    {news === fallbackNews ? "Fallback" : "Connected"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs border-b border-white/10 pb-3">
                  <span className="font-mono text-white/45">Items</span>
                  <span className="font-mono text-white/70">
                    {news.length}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-white/45">AI Summary</span>
                  <span className="font-mono text-white/35">Soon</span>
                </div>
              </div>
            </div>

            <div className="border border-white/10 bg-white/[0.02] p-6">
              <div className="flex items-center gap-2 mb-5">
                <AlertTriangle size={17} className="text-white/60" />
                <p className="font-orbitron text-xs uppercase tracking-widest">
                  Build Note
                </p>
              </div>

              <p className="font-mono text-xs text-white/45 leading-relaxed">
                Deze tab werkt nu ook zonder echte nieuws-API. Als `/api/news`
                nog niet bestaat, toont de terminal automatisch veilige
                placeholder-intelligence.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MAKE WAVES */}
      {activeTab === "hackathon" && (
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-8 border border-white/10 bg-white/[0.02] p-8">
            <Zap className="w-14 h-14 mb-6 text-white/60" />

            <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-4">
              Make Waves Challenge
            </p>

            <h3 className="font-orbitron text-2xl font-black uppercase mb-4">
              Mainnet User Activation
            </h3>

            <p className="font-mono text-sm text-white/45 leading-relaxed mb-8">
              Deze module wordt de challenge cockpit: live projectstatus,
              source tag, daily check-ins, gebruikersactivatie, demo flow en
              pitch voorbereiding.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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

      {/* OTHER MODULES */}
      {activeTab !== "news" && activeTab !== "hackathon" && (
        <div className="border border-white/10 bg-white/[0.02] p-10 text-center">
          {(() => {
            const currentTab = tabs.find((tab) => tab.id === activeTab);
            const Icon = currentTab?.icon || FileText;

            return (
              <>
                <Icon className="w-14 h-14 mx-auto text-white/35 mb-6" />

                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-4">
                  Intelligence Module
                </p>

                <h3 className="font-orbitron text-2xl font-black uppercase mb-4">
                  {currentTab?.label}
                </h3>

                <p className="font-mono text-sm text-white/45 max-w-2xl mx-auto leading-relaxed mb-8">
                  Deze data stream staat klaar voor de volgende bouwfase. Eerst
                  maken we de basis veilig: Xaman login, Daily Check-In en
                  source-tagged mainnet activiteit.
                </p>

                <div className="inline-flex items-center gap-2 border border-white/10 px-5 py-3 text-white/40 font-mono text-xs uppercase tracking-widest">
                  <Clock size={14} />
                  Module in development
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
