import { useState } from "react";
import type { ElementType } from "react";
import {
  Activity,
  AlertTriangle,
  Bell,
  BookOpen,
  Bot,
  Calendar,
  CheckCircle2,
  Coins,
  Eye,
  FileSearch,
  Filter,
  Globe2,
  Landmark,
  Newspaper,
  Radio,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Wallet,
  Waves,
  Zap,
} from "lucide-react";

type NewsCategory = {
  id: string;
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

type NewsItem = {
  title: string;
  category: string;
  priority: string;
  time: string;
  text: string;
};

type NewsRule = {
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

const categories: NewsCategory[] = [
  {
    id: "xrpl",
    title: "XRPL Updates",
    status: "Core",
    text: "Protocol, validators, wallets, builders, amendments en ecosystem updates.",
    icon: Globe2,
  },
  {
    id: "ripple",
    title: "Ripple / RLUSD",
    status: "Watch",
    text: "Ripple news, RLUSD, payments, custody, partnerships en stablecoin rails.",
    icon: Landmark,
  },
  {
    id: "defi",
    title: "DeFi / AMM",
    status: "DeFi",
    text: "AMM pools, liquidity, swaps, DEX activity, risk education en LP signals.",
    icon: Coins,
  },
  {
    id: "ai",
    title: "AI + Blockchain",
    status: "AI",
    text: "AI agents, wallet assistants, automation, AI research en safety scanning.",
    icon: Bot,
  },
  {
    id: "make-waves",
    title: "Make Waves",
    status: "2606",
    text: "XRPL Commons challenge, source tag 2606, demo progress en active users.",
    icon: Waves,
  },
  {
    id: "security",
    title: "Security Alerts",
    status: "Safety",
    text: "Scams, fake tokens, bad links, risky trustlines en signing warnings.",
    icon: ShieldCheck,
  },
];

const newsItems: NewsItem[] = [
  {
    title: "OTT Terminal Daily Check-In Flow",
    category: "Make Waves",
    priority: "High",
    time: "Today",
    text: "Daily Check-In is klaar als mock flow en wordt later gekoppeld aan Xaman en source tag 2606.",
  },
  {
    title: "XRPL Wallet Safety Layer",
    category: "Security Alerts",
    priority: "High",
    time: "Today",
    text: "Wallet safety, trustline warnings en no-seed-phrase rules staan centraal in de terminal.",
  },
  {
    title: "Stablecoin Rail Watch",
    category: "Ripple / RLUSD",
    priority: "Medium",
    time: "Today",
    text: "Stablecoin education wordt gekoppeld aan portfolio, DeFi en payment rail awareness.",
  },
  {
    title: "AMM Education Cards",
    category: "DeFi / AMM",
    priority: "Medium",
    time: "This week",
    text: "AMM pools, slippage, LP risk en impermanent loss worden vertaald naar simpele uitleg.",
  },
  {
    title: "AI Research Hub",
    category: "AI + Blockchain",
    priority: "Future",
    time: "This week",
    text: "AI Hub krijgt prompt templates, wallet coach, risk scanner en research agent flow.",
  },
  {
    title: "XRPL Ecosystem Discovery",
    category: "XRPL Updates",
    priority: "Build",
    time: "This week",
    text: "Ecosystem Map maakt wallets, builders, DeFi, Academy, events en tools vindbaar.",
  },
];

const newsRules: NewsRule[] = [
  {
    title: "Verify Sources",
    status: "Rule",
    text: "Nieuws moet later altijd bron, datum en context krijgen voordat het live wordt gebruikt.",
    icon: Search,
  },
  {
    title: "No Hype Claims",
    status: "Safety",
    text: "Geen prijsvoorspellingen, winstbeloftes of onbevestigde claims als waarheid brengen.",
    icon: AlertTriangle,
  },
  {
    title: "Education First",
    status: "OTT",
    text: "Nieuws wordt vertaald naar simpele uitleg: wat is het, waarom telt het, wat is veilig.",
    icon: BookOpen,
  },
  {
    title: "Wallet Protection",
    status: "Guard",
    text: "Bij ieder nieuwsitem blijven wallet safety, trustlines en signing risico's zichtbaar.",
    icon: Wallet,
  },
];

const roadmap = [
  "Live news feed koppelen",
  "Bronnen en timestamps tonen",
  "XRPL updates filter bouwen",
  "Security alerts bovenaan zetten",
  "AI news samenvatting maken",
  "Daily briefing naar Dashboard sturen",
  "Social caption generator toevoegen",
  "TikTok/LinkedIn post export maken",
];

export function NewsTab() {
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>(
    categories[0]
  );
  const [selectedNews, setSelectedNews] = useState<NewsItem>(newsItems[0]);

  const SelectedCategoryIcon = selectedCategory.icon;

  const filteredNews = newsItems.filter(
    (item) => item.category === selectedCategory.title
  );

  const visibleNews = filteredNews.length > 0 ? filteredNews : newsItems.slice(0, 4);

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 mb-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="flex items-center gap-2 mb-4 text-white/45">
              <Newspaper size={17} />

              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                OTT Newsroom
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              XRPL News Into Clear Signals
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              De newsroom-laag van OTT Terminal. Hier zetten we XRPL nieuws,
              security alerts, stablecoins, DeFi, AI en Make Waves updates om
              naar duidelijke signalen voor gebruikers.
            </p>
          </div>

          <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-3">
            <StatBox icon={Newspaper} label="News Items" value="6" />
            <StatBox icon={Bell} label="Alerts" value="2" />
            <StatBox icon={Waves} label="Make Waves" value="2606" />
            <StatBox icon={Radio} label="Mode" value="Mock" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-4 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Filter size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                News Filters
              </p>
            </div>

            <div className="space-y-3">
              {categories.map((category) => (
                <CategoryButton
                  key={category.id}
                  category={category}
                  active={selectedCategory.id === category.id}
                  onClick={() => setSelectedCategory(category)}
                />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Target size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Selected Filter
              </p>
            </div>

            <SelectedCategoryIcon size={24} className="text-white/60 mb-4" />

            <p className="font-orbitron text-xl font-black uppercase mb-3">
              {selectedCategory.title}
            </p>

            <p className="font-mono text-xs text-white/45 leading-relaxed mb-5">
              {selectedCategory.text}
            </p>

            <MiniStatus label="Status" value={selectedCategory.status} />
          </div>
        </div>

        <div className="col-span-12 xl:col-span-5 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  News Feed
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  Active Updates
                </h3>
              </div>

              <FileSearch size={20} className="text-white/60" />
            </div>

            <div className="space-y-3">
              {visibleNews.map((item) => (
                <NewsRow
                  key={`${item.title}-${item.category}`}
                  item={item}
                  active={selectedNews.title === item.title}
                  onClick={() => setSelectedNews(item)}
                />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Eye size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Selected Update
              </p>
            </div>

            <p className="font-orbitron text-2xl font-black uppercase mb-2">
              {selectedNews.title}
            </p>

            <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-4">
              {selectedNews.category} • {selectedNews.priority} • {selectedNews.time}
            </p>

            <p className="font-mono text-sm text-white/45 leading-relaxed mb-5">
              {selectedNews.text}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <MiniStatus label="Priority" value={selectedNews.priority} />
              <MiniStatus label="Time" value={selectedNews.time} />
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Social Output Later
              </p>
            </div>

            <div className="border border-white/10 bg-black p-5">
              <p className="font-mono text-xs text-white/45 leading-relaxed">
                Later kan deze Newsroom direct TikTok scripts, X posts,
                LinkedIn captions en YouTube bullets maken vanuit één XRPL
                update.
              </p>
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-3 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <ShieldCheck size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                News Rules
              </p>
            </div>

            <div className="space-y-3">
              {newsRules.map((rule) => (
                <RuleCard key={rule.title} rule={rule} />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Calendar size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Roadmap
              </p>
            </div>

            <div className="space-y-3">
              {roadmap.map((item) => (
                <RoadmapLine key={item} label={item} />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <FeatureBox icon={Globe2} title="XRPL" text="Ecosystem updates" />
          <FeatureBox icon={TrendingUp} title="Signals" text="Daily awareness" />
          <FeatureBox icon={Zap} title="Socials" text="Captions later" />
          <FeatureBox icon={Activity} title="Alerts" text="Safety first" />
        </div>
      </div>
    </div>
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
    <div className="border border-white/10 bg-black/60 p-4">
      <Icon size={18} className="text-white/60 mb-3" />

      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
        {label}
      </p>

      <p className="font-orbitron text-sm font-black uppercase">{value}</p>
    </div>
  );
}

function CategoryButton({
  category,
  active,
  onClick,
}: {
  category: NewsCategory;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = category.icon;

  return (
    <button
      onClick={onClick}
      className={`w-full border p-4 text-left transition-all ${
        active
          ? "border-white/30 bg-white/[0.08]"
          : "border-white/10 bg-black hover:bg-white/[0.03]"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Icon size={16} className="text-white/60" />

          <p className="font-orbitron text-xs font-bold uppercase">
            {category.title}
          </p>
        </div>

        <p className="font-mono text-[10px] text-white/35 uppercase">
          {category.status}
        </p>
      </div>
    </button>
  );
}

function NewsRow({
  item,
  active,
  onClick,
}: {
  item: NewsItem;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full border p-4 text-left transition-all ${
        active
          ? "border-white/30 bg-white/[0.08]"
          : "border-white/10 bg-black hover:bg-white/[0.03]"
      }`}
    >
      <div className="flex items-center justify-between gap-4 mb-2">
        <p className="font-orbitron text-sm font-bold uppercase">
          {item.title}
        </p>

        <p className="font-mono text-[10px] text-white/45 uppercase">
          {item.priority}
        </p>
      </div>

      <p className="font-mono text-[10px] text-white/35 uppercase">
        {item.category} • {item.time}
      </p>
    </button>
  );
}

function MiniStatus({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/10 bg-black p-4">
      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
        {label}
      </p>

      <p className="font-orbitron text-sm font-black uppercase">{value}</p>
    </div>
  );
}

function RuleCard({ rule }: { rule: NewsRule }) {
  const Icon = rule.icon;

  return (
    <div className="border border-white/10 bg-black p-4">
      <div className="flex items-start justify-between mb-3">
        <Icon size={17} className="text-white/60" />

        <p className="font-mono text-[10px] text-white/30 uppercase">
          {rule.status}
        </p>
      </div>

      <p className="font-orbitron text-xs font-bold uppercase mb-2">
        {rule.title}
      </p>

      <p className="font-mono text-[10px] text-white/40 leading-relaxed">
        {rule.text}
      </p>
    </div>
  );
}

function RoadmapLine({ label }: { label: string }) {
  return (
    <div className="border border-white/10 bg-black p-3 flex items-center gap-2">
      <CheckCircle2 size={14} className="text-white/60" />

      <p className="font-mono text-xs text-white/50">{label}</p>
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
    <div className="border border-white/10 bg-white/[0.02] p-5">
      <Icon size={19} className="text-white/60 mb-4" />

      <p className="font-orbitron text-sm font-bold uppercase mb-2">{title}</p>

      <p className="font-mono text-xs text-white/40">{text}</p>
    </div>
  );
}
