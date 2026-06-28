import type { ElementType } from "react";
import {
  Activity,
  ArrowUpRight,
  Bot,
  BrainCircuit,
  CheckCircle2,
  Code2,
  Coins,
  Cpu,
  CreditCard,
  FileSearch,
  GraduationCap,
  MessageSquareText,
  Network,
  Newspaper,
  Server,
  ShieldCheck,
  Sparkles,
  Terminal,
  Wallet,
  Zap,
} from "lucide-react";

type AiModule = {
  title: string;
  category: string;
  status: string;
  description: string;
  icon: ElementType;
};

type PromptItem = {
  title: string;
  prompt: string;
  category: string;
};

const aiModules: AiModule[] = [
  {
    title: "OTT AI Assistant",
    category: "Terminal Copilot",
    status: "Core",
    description:
      "De centrale AI-assistent die gebruikers helpt met XRPL, wallets, tokens, stablecoins, risico's, educatie en app-navigatie.",
    icon: MessageSquareText,
  },
  {
    title: "XRPL AI Starter Kit",
    category: "Ripple AI Layer",
    status: "Watch",
    description:
      "Researchlaag voor nieuwe AI-tools rond XRPL, agentic payments, developer tooling en AI-integraties.",
    icon: Sparkles,
  },
  {
    title: "X402 Protocol",
    category: "Agentic Payments",
    status: "Research",
    description:
      "Nieuwe betaalflow voor AI-agents, microbetalingen en machine-to-machine commerce met crypto rails.",
    icon: CreditCard,
  },
  {
    title: "MCP Server",
    category: "AI Tool Gateway",
    status: "Build Later",
    description:
      "Mogelijke tool-laag waarmee AI veilig toegang krijgt tot functies, data, documentatie en later wallet-acties.",
    icon: Server,
  },
  {
    title: "AI Wallet Explainer",
    category: "User Safety",
    status: "Planned",
    description:
      "Legt transacties, trustlines, token risks, NFT acties en walletstatus uit in gewone taal voor beginners.",
    icon: Wallet,
  },
  {
    title: "AI Risk Scanner",
    category: "Security",
    status: "Planned",
    description:
      "Controleert later tokens, trustlines, verdachte issuers, fake airdrops, phishing-signalen en wallet-risico's.",
    icon: ShieldCheck,
  },
  {
    title: "AI Learn Tutor",
    category: "Academy",
    status: "Planned",
    description:
      "Iedere les krijgt later een AI Tutor die samenvat, vragen beantwoordt, quizzen maakt en voorbeelden geeft.",
    icon: GraduationCap,
  },
  {
    title: "AI Code Helper",
    category: "Developer Mode",
    status: "Planned",
    description:
      "Helpt developers met XRPL JavaScript, Xaman payloads, trustlines, payments, AMM, NFTs en API-voorbeelden.",
    icon: Code2,
  },
];

const promptLibrary: PromptItem[] = [
  {
    title: "Beginner Explanation",
    prompt: "Explain XRP Ledger like I am completely new to blockchain.",
    category: "Education",
  },
  {
    title: "Transaction Explainer",
    prompt: "Explain this XRPL transaction in simple language and tell me the risk.",
    category: "Wallet",
  },
  {
    title: "Stablecoin Analysis",
    prompt: "Compare RLUSD, USDC and USDT from a user, issuer and regulation perspective.",
    category: "Stablecoins",
  },
  {
    title: "CBDC Research",
    prompt: "Summarize the latest CBDC developments and explain how they relate to XRPL.",
    category: "CBDC",
  },
  {
    title: "Learn Quiz",
    prompt: "Create 10 quiz questions about XRPL trustlines for beginners.",
    category: "Academy",
  },
  {
    title: "Developer Help",
    prompt: "Show me how to create a simple XRPL payment payload with Xaman.",
    category: "Developer",
  },
];

const aiRoadmap = [
  "AI summaries for daily XRPL news",
  "AI assistant inside every Academy lesson",
  "AI wallet and transaction explainer",
  "AI stablecoin, CBDC and ISO research tools",
  "AI risk scanner for trustlines and suspicious tokens",
  "AI developer helper for XRPL and Xaman",
  "AI prompt library for creators, builders and retailers",
  "Agentic payments research with X402, XRP and RLUSD",
];

export function AIHubTab() {
  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 mb-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="flex items-center gap-2 mb-4 text-white/45">
              <Bot size={17} />
              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                OTT AI Hub
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              AI For The XRP Ledger
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              De AI-laag van de OTT Terminal. Hier komen XRPL research,
              wallet-uitleg, Academy begeleiding, developer tools, risk scanning
              en agentic payments samen in één intelligente interface.
            </p>
          </div>

          <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-3">
            <StatBox icon={Bot} label="AI Modules" value="8" />
            <StatBox icon={BrainCircuit} label="Prompt Library" value="6" />
            <StatBox icon={CreditCard} label="X402" value="Research" />
            <StatBox icon={Zap} label="Agentic Pay" value="Future" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-8 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  AI Modules
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  Intelligence Layer
                </h3>
              </div>

              <Sparkles size={20} className="text-white/60" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {aiModules.map((module) => (
                <AIModuleCard key={module.title} module={module} />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Prompt Library
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  Ready-To-Use AI Prompts
                </h3>
              </div>

              <MessageSquareText size={20} className="text-white/60" />
            </div>

            <div className="space-y-3">
              {promptLibrary.map((item) => (
                <PromptRow key={item.title} item={item} />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-4 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <ShieldCheck size={18} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                Safety First
              </p>
            </div>

            <p className="font-mono text-xs text-white/45 leading-relaxed mb-5">
              AI mag nooit zomaar wallet-acties uitvoeren. Eerst uitleg,
              samenvatten en risico's tonen. Daarna pas veilige Xaman flows met
              duidelijke gebruikerstoestemming.
            </p>

            <div className="space-y-3">
              <SafetyLine label="No automatic signing" />
              <SafetyLine label="No hidden transactions" />
              <SafetyLine label="Clear wallet warnings" />
              <SafetyLine label="Human confirmation first" />
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Terminal size={18} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                AI Roadmap
              </p>
            </div>

            <div className="space-y-3">
              {aiRoadmap.map((item) => (
                <RoadmapLine key={item} label={item} />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Network size={18} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                Future Integrations
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <MiniBox icon={Cpu} label="MCP" />
              <MiniBox icon={CreditCard} label="X402" />
              <MiniBox icon={Coins} label="RLUSD" />
              <MiniBox icon={FileSearch} label="Docs AI" />
            </div>
          </div>
        </div>

        <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <FeatureBox icon={Newspaper} title="AI News" text="Daily summaries" />
          <FeatureBox icon={Wallet} title="AI Wallet" text="Explain actions" />
          <FeatureBox icon={GraduationCap} title="AI Tutor" text="Learn faster" />
          <FeatureBox icon={Code2} title="AI Dev" text="Build on XRPL" />
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

      <p className="font-orbitron text-lg font-black uppercase">{value}</p>
    </div>
  );
}

function AIModuleCard({ module }: { module: AiModule }) {
  const Icon = module.icon;

  return (
    <div className="border border-white/10 bg-black hover:bg-white/[0.03] transition-all p-5 cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <Icon size={20} className="text-white/70" />

        <span className="font-mono text-[10px] uppercase text-white/45">
          {module.status}
        </span>
      </div>

      <h4 className="font-orbitron text-sm font-bold uppercase mb-2">
        {module.title}
      </h4>

      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-4">
        {module.category}
      </p>

      <p className="font-mono text-xs text-white/45 leading-relaxed">
        {module.description}
      </p>
    </div>
  );
}

function PromptRow({ item }: { item: PromptItem }) {
  return (
    <div className="border border-white/10 bg-black p-4 hover:bg-white/[0.03] transition-all cursor-pointer">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-orbitron text-sm font-bold uppercase mb-2">
            {item.title}
          </p>

          <p className="font-mono text-xs text-white/45 leading-relaxed mb-3">
            “{item.prompt}”
          </p>

          <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest">
            {item.category}
          </p>
        </div>

        <ArrowUpRight size={15} className="text-white/20 shrink-0" />
      </div>
    </div>
  );
}

function SafetyLine({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 border border-white/10 bg-black p-3">
      <CheckCircle2 size={14} className="text-white/60" />
      <p className="font-mono text-xs text-white/50">{label}</p>
    </div>
  );
}

function RoadmapLine({ label }: { label: string }) {
  return (
    <div className="flex items-start gap-2 border-b border-white/10 pb-3 last:border-b-0 last:pb-0">
      <Activity size={14} className="text-white/45 mt-0.5" />
      <p className="font-mono text-xs text-white/45 leading-relaxed">{label}</p>
    </div>
  );
}

function MiniBox({
  icon: Icon,
  label,
}: {
  icon: ElementType;
  label: string;
}) {
  return (
    <div className="border border-white/10 bg-black p-4 text-center">
      <Icon size={18} className="mx-auto mb-3 text-white/60" />

      <p className="font-mono text-[10px] uppercase tracking-widest text-white/45">
        {label}
      </p>
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
