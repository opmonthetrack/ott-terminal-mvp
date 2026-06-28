import { useState } from "react";
import type { ElementType } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock,
  Coins,
  Database,
  Eye,
  FileSearch,
  Fingerprint,
  Globe2,
  Landmark,
  Newspaper,
  Radio,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
  Waves,
  Zap,
} from "lucide-react";

type IntelCategory = {
  id: string;
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

type IntelItem = {
  title: string;
  category: string;
  priority: string;
  status: string;
  text: string;
};

type WatchSignal = {
  title: string;
  value: string;
  status: string;
  icon: ElementType;
};

type RiskNote = {
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

const categories: IntelCategory[] = [
  {
    id: "xrpl-news",
    title: "XRPL News",
    status: "Daily",
    text: "Ecosystem updates, builder news, wallet releases, amendments en network changes.",
    icon: Newspaper,
  },
  {
    id: "stablecoins",
    title: "Stablecoins",
    status: "Watch",
    text: "RLUSD, USDC, EUR rails, liquidity, payment corridors en stablecoin adoption.",
    icon: Coins,
  },
  {
    id: "defi",
    title: "DeFi Signals",
    status: "AMM",
    text: "DEX, AMM pools, liquidity, yield, slippage, issuer risk en wallet exposure.",
    icon: BarChart3,
  },
  {
    id: "tokenization",
    title: "Tokenization",
    status: "RWA",
    text: "Real world assets, certificates, issuers, compliance en on-chain proof.",
    icon: Landmark,
  },
  {
    id: "ai",
    title: "AI + Web3",
    status: "AI",
    text: "AI agents, wallet assistants, automation, prompt tools en safety scanning.",
    icon: Brain,
  },
  {
    id: "make-waves",
    title: "Make Waves",
    status: "2606",
    text: "Source tag 2606, active users, daily check-ins, demo readiness en metrics.",
    icon: Waves,
  },
];

const intelItems: IntelItem[] = [
  {
    title: "Daily Check-In Metrics",
    category: "Make Waves",
    priority: "High",
    status: "Build",
    text: "Track active users, source tag 2606 readiness and mainnet proof flow.",
  },
  {
    title: "Stablecoin Rail Watch",
    category: "Stablecoins",
    priority: "Medium",
    status: "Watch",
    text: "Monitor stablecoin liquidity, issuer transparency and payment rail adoption.",
  },
  {
    title: "AMM Pool Education",
    category: "DeFi Signals",
    priority: "Medium",
    status: "Learn",
    text: "Explain pool health, liquidity risk, impermanent loss and slippage to users.",
  },
  {
    title: "Wallet Safety Alerts",
    category: "XRPL News",
    priority: "High",
    status: "Safety",
    text: "Surface warnings for trustlines, unknown issuers, risky links and signing behavior.",
  },
  {
    title: "RWA Compliance Notes",
    category: "Tokenization",
    priority: "High",
    status: "Research",
    text: "Collect tokenization checks around issuers, documents, rights and legal clarity.",
  },
  {
    title: "AI Research Agent",
    category: "AI + Web3",
    priority: "Future",
    status: "AI",
    text: "Summarize XRPL, AI, DeFi and tokenization updates inside the terminal.",
  },
];

const watchSignals: WatchSignal[] = [
  {
    title: "Network",
    value: "XRPL",
    status: "Live Focus",
    icon: Globe2,
  },
  {
    title: "Source Tag",
    value: "2606",
    status: "Make Waves",
    icon: Fingerprint,
  },
  {
    title: "Risk Level",
    value: "Guarded",
    status: "Safety",
    icon: ShieldCheck,
  },
  {
    title: "AI Brief",
    value: "Ready",
    status: "Mock",
    icon: Sparkles,
  },
];

const riskNotes: RiskNote[] = [
  {
    title: "Verify Sources",
    status: "Rule",
    text: "Intel moet altijd gecontroleerd worden voordat het als waarheid of actie wordt gebruikt.",
    icon: Search,
  },
  {
    title: "No Financial Advice",
    status: "Rule",
    text: "Signalering en uitleg zijn educatief. Geen koop-, verkoop- of winstadvies.",
    icon: AlertTriangle,
  },
  {
    title: "Wallet Safety First",
    status: "Safety",
    text: "Elke intel flow moet gebruikers beschermen tegen scams, fake tokens en hidden signing.",
    icon: Wallet,
  },
  {
    title: "Timestamp Everything",
    status: "Data",
    text: "Nieuws, signals en research moeten later datum, bron en status meekrijgen.",
    icon: Clock,
  },
];

const roadmap = [
  "Daily intel cards bouwen",
  "XRPL news feed koppelen",
  "Stablecoin monitor toevoegen",
  "AMM signal feed maken",
  "Source tag 2606 metrics tonen",
  "AI research summaries toevoegen",
  "Risk alerts koppelen aan wallet",
  "Partner signal dashboard bouwen",
];

export function LedgerIntelTab() {
  const [selectedCategory, setSelectedCategory] = useState<IntelCategory>(
    categories[0]
  );
  const [selectedIntel, setSelectedIntel] = useState<IntelItem>(intelItems[0]);

  const SelectedCategoryIcon = selectedCategory.icon;

  const filteredIntel = intelItems.filter(
    (item) => item.category === selectedCategory.title
  );

  const visibleIntel = filteredIntel.length > 0 ? filteredIntel : intelItems.slice(0, 4);

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 mb-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="flex items-center gap-2 mb-4 text-white/45">
              <Radar size={17} />

              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                XRPL Ledger Intel
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              Signals. Research. Risk. Awareness.
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              De intelligence-laag van OTT Terminal. Hier komen XRPL nieuws,
              stablecoins, DeFi signals, tokenization, AI research, risk alerts
              en Make Waves metrics samen.
            </p>
          </div>

          <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-3">
            {watchSignals.map((signal) => (
              <SignalBox key={signal.title} signal={signal} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-4 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Database size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Intel Categories
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
                Selected Category
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
                  Intel Feed
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  Active Signals
                </h3>
              </div>

              <FileSearch size={20} className="text-white/60" />
            </div>

            <div className="space-y-3">
              {visibleIntel.map((item) => (
                <IntelRow
                  key={`${item.title}-${item.category}`}
                  item={item}
                  active={selectedIntel.title === item.title}
                  onClick={() => setSelectedIntel(item)}
                />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Bell size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Selected Signal
              </p>
            </div>

            <p className="font-orbitron text-2xl font-black uppercase mb-2">
              {selectedIntel.title}
            </p>

            <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-4">
              {selectedIntel.category} • {selectedIntel.priority} • {selectedIntel.status}
            </p>

            <p className="font-mono text-sm text-white/45 leading-relaxed mb-5">
              {selectedIntel.text}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <MiniStatus label="Priority" value={selectedIntel.priority} />
              <MiniStatus label="Status" value={selectedIntel.status} />
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <BookOpen size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                AI Brief Preview
              </p>
            </div>

            <div className="border border-white/10 bg-black p-5">
              <p className="font-mono text-xs text-white/45 leading-relaxed">
                Later vat AI deze signals samen in gewone taal. De gebruiker
                krijgt dan: wat is gebeurd, waarom het belangrijk is, wat het
                risico is en welke actie veilig is.
              </p>
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-3 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <ShieldCheck size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Intel Rules
              </p>
            </div>

            <div className="space-y-3">
              {riskNotes.map((note) => (
                <RiskNoteCard key={note.title} note={note} />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Zap size={18} className="text-white/60" />

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
          <FeatureBox icon={Newspaper} title="News" text="Daily XRPL updates" />
          <FeatureBox icon={TrendingUp} title="Signals" text="Market awareness" />
          <FeatureBox icon={Activity} title="Metrics" text="2606 and users" />
          <FeatureBox icon={Eye} title="Risk" text="Safety monitoring" />
        </div>
      </div>
    </div>
  );
}

function SignalBox({ signal }: { signal: WatchSignal }) {
  const Icon = signal.icon;

  return (
    <div className="border border-white/10 bg-black/60 p-4">
      <Icon size={18} className="text-white/60 mb-3" />

      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
        {signal.title}
      </p>

      <p className="font-orbitron text-sm font-black uppercase mb-1">
        {signal.value}
      </p>

      <p className="font-mono text-[10px] text-white/30 uppercase">
        {signal.status}
      </p>
    </div>
  );
}

function CategoryButton({
  category,
  active,
  onClick,
}: {
  category: IntelCategory;
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

function IntelRow({
  item,
  active,
  onClick,
}: {
  item: IntelItem;
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
        {item.category} • {item.status}
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

function RiskNoteCard({ note }: { note: RiskNote }) {
  const Icon = note.icon;

  return (
    <div className="border border-white/10 bg-black p-4">
      <div className="flex items-start justify-between mb-3">
        <Icon size={17} className="text-white/60" />

        <p className="font-mono text-[10px] text-white/30 uppercase">
          {note.status}
        </p>
      </div>

      <p className="font-orbitron text-xs font-bold uppercase mb-2">
        {note.title}
      </p>

      <p className="font-mono text-[10px] text-white/40 leading-relaxed">
        {note.text}
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
