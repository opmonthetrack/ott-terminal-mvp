import { useState } from "react";
import type { ElementType } from "react";
import {
  Activity,
  AlertTriangle,
  BookOpen,
  Bot,
  Brain,
  CheckCircle2,
  Database,
  Eye,
  FileSearch,
  Fingerprint,
  Globe2,
  Layers,
  MessageSquare,
  Radio,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";

type IntelligenceModule = {
  id: string;
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

type BriefItem = {
  title: string;
  category: string;
  priority: string;
  text: string;
};

type SafetyRule = {
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

const modules: IntelligenceModule[] = [
  {
    id: "research",
    title: "Research Agent",
    status: "AI",
    text: "Vat XRPL, DeFi, AI, stablecoins, tokenization en wallet safety samen in simpele taal.",
    icon: Brain,
  },
  {
    id: "source",
    title: "Source Checker",
    status: "Verify",
    text: "Controleert later bronnen, datums, claims, screenshots en context voordat iets live gaat.",
    icon: Search,
  },
  {
    id: "trend",
    title: "Trend Watcher",
    status: "Signals",
    text: "Herkent terugkerende patronen in news, builders, wallet activity en community topics.",
    icon: TrendingUp,
  },
  {
    id: "content",
    title: "Content Engine",
    status: "Social",
    text: "Maakt later captions, TikTok scripts, LinkedIn posts en YouTube bullets vanuit één brief.",
    icon: MessageSquare,
  },
  {
    id: "risk",
    title: "Risk Explainer",
    status: "Safety",
    text: "Legt risico's uit zonder hype: wallet, trustlines, fake tokens, DeFi en issuer risk.",
    icon: ShieldCheck,
  },
  {
    id: "community",
    title: "Community Pulse",
    status: "2606",
    text: "Meet later Make Waves activity, source tag 2606, check-ins, feedback en user intent.",
    icon: Fingerprint,
  },
];

const briefs: BriefItem[] = [
  {
    title: "Daily XRPL Brief",
    category: "Research",
    priority: "High",
    text: "Een dagelijkse samenvatting van XRPL updates, veiligheidszaken en kansen voor builders.",
  },
  {
    title: "Wallet Safety Summary",
    category: "Risk",
    priority: "High",
    text: "Gebruikers krijgen korte waarschuwingen over signing, trustlines, seed phrases en fake links.",
  },
  {
    title: "Make Waves Signal",
    category: "2606",
    priority: "High",
    text: "Source tag 2606 activiteit, daily check-ins en demo metrics worden begrijpelijk gemaakt.",
  },
  {
    title: "DeFi Education Brief",
    category: "DeFi",
    priority: "Medium",
    text: "AMM, liquidity, slippage, LP risk en stablecoin exposure worden vertaald naar simpele uitleg.",
  },
  {
    title: "Social Content Pack",
    category: "Content",
    priority: "Medium",
    text: "Eén update wordt later omgezet naar X post, TikTok hook, LinkedIn caption en video bullets.",
  },
];

const rules: SafetyRule[] = [
  {
    title: "Cite Before Publish",
    status: "Rule",
    text: "AI output moet later bron, datum en confidence krijgen voordat het als nieuws gebruikt wordt.",
    icon: FileSearch,
  },
  {
    title: "No Price Promises",
    status: "Guard",
    text: "Geen koopadvies, winstclaims of gegarandeerde uitkomsten in intelligence output.",
    icon: AlertTriangle,
  },
  {
    title: "Wallet Safety First",
    status: "Safety",
    text: "AI mag nooit vragen om seed phrase, private key of geheime wallet informatie.",
    icon: Wallet,
  },
  {
    title: "Human Review",
    status: "Review",
    text: "Belangrijke posts, claims en partner info moeten eerst door een mens bekeken worden.",
    icon: Eye,
  },
];

const roadmap = [
  "AI brief generator bouwen",
  "Source checker toevoegen",
  "Newsroom koppelen",
  "Ledger Intel koppelen",
  "Social caption export maken",
  "Community pulse dashboard maken",
  "Confidence score toevoegen",
  "Daily AI digest activeren",
];

export function OTTIntelligence() {
  const [selectedModule, setSelectedModule] = useState<IntelligenceModule>(
    modules[0]
  );
  const [selectedBrief, setSelectedBrief] = useState<BriefItem>(briefs[0]);

  const SelectedModuleIcon = selectedModule.icon;

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 mb-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="flex items-center gap-2 mb-4 text-white/45">
              <Bot size={17} />

              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                OTT Intelligence
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              AI Research Layer For The Terminal
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              De intelligence-laag van OTT Terminal. Hier komen AI research,
              source checking, risk uitleg, social content, community pulse en
              Make Waves metrics samen.
            </p>
          </div>

          <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-3">
            <StatBox icon={Brain} label="AI Modules" value="6" />
            <StatBox icon={FileSearch} label="Briefs" value="5" />
            <StatBox icon={Fingerprint} label="Source Tag" value="2606" />
            <StatBox icon={Radio} label="Mode" value="Mock" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-4 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Layers size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Intelligence Modules
              </p>
            </div>

            <div className="space-y-3">
              {modules.map((module) => (
                <ModuleButton
                  key={module.id}
                  module={module}
                  active={selectedModule.id === module.id}
                  onClick={() => setSelectedModule(module)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-5 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Selected AI Module
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  {selectedModule.title}
                </h3>
              </div>

              <SelectedModuleIcon size={22} className="text-white/60" />
            </div>

            <p className="font-mono text-sm text-white/45 leading-relaxed mb-5">
              {selectedModule.text}
            </p>

            <MiniStatus label="Status" value={selectedModule.status} />
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  AI Brief Queue
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  Daily Intelligence
                </h3>
              </div>

              <Database size={20} className="text-white/60" />
            </div>

            <div className="space-y-3">
              {briefs.map((brief) => (
                <BriefRow
                  key={brief.title}
                  brief={brief}
                  active={selectedBrief.title === brief.title}
                  onClick={() => setSelectedBrief(brief)}
                />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Selected Brief
              </p>
            </div>

            <p className="font-orbitron text-2xl font-black uppercase mb-2">
              {selectedBrief.title}
            </p>

            <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-4">
              {selectedBrief.category} • {selectedBrief.priority}
            </p>

            <p className="font-mono text-sm text-white/45 leading-relaxed">
              {selectedBrief.text}
            </p>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-3 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <ShieldCheck size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                AI Guardrails
              </p>
            </div>

            <div className="space-y-3">
              {rules.map((rule) => (
                <RuleCard key={rule.title} rule={rule} />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Target size={18} className="text-white/60" />

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
          <FeatureBox icon={BookOpen} title="Research" text="XRPL summaries" />
          <FeatureBox icon={Globe2} title="Sources" text="Verify before post" />
          <FeatureBox icon={Zap} title="Socials" text="Content engine" />
          <FeatureBox icon={Activity} title="Pulse" text="Community signals" />
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

function ModuleButton({
  module,
  active,
  onClick,
}: {
  module: IntelligenceModule;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = module.icon;

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
            {module.title}
          </p>
        </div>

        <p className="font-mono text-[10px] text-white/35 uppercase">
          {module.status}
        </p>
      </div>
    </button>
  );
}

function BriefRow({
  brief,
  active,
  onClick,
}: {
  brief: BriefItem;
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
          {brief.title}
        </p>

        <p className="font-mono text-[10px] text-white/45 uppercase">
          {brief.priority}
        </p>
      </div>

      <p className="font-mono text-[10px] text-white/35 uppercase">
        {brief.category}
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

function RuleCard({ rule }: { rule: SafetyRule }) {
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
