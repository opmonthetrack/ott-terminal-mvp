import { useState } from "react";
import type { ElementType } from "react";
import {
  AlertTriangle,
  BookOpen,
  Bot,
  Brain,
  CheckCircle2,
  Code2,
  Cpu,
  Database,
  Eye,
  FileSearch,
  Fingerprint,
  GraduationCap,
  Layers,
  Lock,
  MessageSquare,
  Radio,
  Search,
  ShieldCheck,
  Sparkles,
  Terminal,
  Wallet,
  Wand2,
  Zap,
} from "lucide-react";

type AiTool = {
  id: string;
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

type PromptTemplate = {
  title: string;
  category: string;
  prompt: string;
};

type AiRule = {
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

const aiTools: AiTool[] = [
  {
    id: "wallet-coach",
    title: "Wallet Coach",
    status: "Safety",
    text: "Legt wallet acties, Xaman signing, trustlines en source tag 2606 simpel uit.",
    icon: Wallet,
  },
  {
    id: "risk-scanner",
    title: "Risk Scanner",
    status: "Guard",
    text: "Helpt gebruikers risico's begrijpen rond onbekende tokens, issuers, links en DeFi.",
    icon: ShieldCheck,
  },
  {
    id: "research-agent",
    title: "XRPL Research Agent",
    status: "Intel",
    text: "Vat XRPL nieuws, ecosystem updates, tokenization, DeFi en builders samen.",
    icon: FileSearch,
  },
  {
    id: "academy-tutor",
    title: "Academy Tutor",
    status: "Learn",
    text: "Begeleidt gebruikers door lessen, quizzes, XP, badges en Make Waves opdrachten.",
    icon: GraduationCap,
  },
  {
    id: "developer-agent",
    title: "Developer Agent",
    status: "Build",
    text: "Helpt builders met XRPL API, Xaman payloads, source tag helpers en code snippets.",
    icon: Code2,
  },
  {
    id: "market-agent",
    title: "Market Explainer",
    status: "Explain",
    text: "Legt portfolio, stablecoins, AMM pools en wallet exposure uit zonder financieel advies.",
    icon: Sparkles,
  },
];

const promptTemplates: PromptTemplate[] = [
  {
    title: "Explain My Wallet",
    category: "Wallet",
    prompt:
      "Leg mijn XRPL wallet uit in simpele taal. Focus op safety, trustlines en wat ik wel/niet moet doen.",
  },
  {
    title: "Check Token Risk",
    category: "Safety",
    prompt:
      "Analyseer deze token of trustline educatief. Benoem issuer risk, liquidity, red flags en safety stappen.",
  },
  {
    title: "Daily XRPL Briefing",
    category: "Intel",
    prompt:
      "Maak een korte dagelijkse XRPL briefing met nieuws, ecosystem signalen, DeFi, stablecoins en builder updates.",
  },
  {
    title: "Build Xaman Payload",
    category: "Developer",
    prompt:
      "Help mij een veilige Xaman payload flow ontwerpen met source tag 2606 en duidelijke user confirmation.",
  },
  {
    title: "Make Waves Demo Script",
    category: "Pitch",
    prompt:
      "Schrijf een korte demo uitleg voor OTT Terminal, Daily Check-In, source tag 2606 en active user tracking.",
  },
];

const aiRules: AiRule[] = [
  {
    title: "No Financial Advice",
    status: "Rule",
    text: "AI mag uitleg geven, maar geen koop/verkoop advies of winstbelofte maken.",
    icon: AlertTriangle,
  },
  {
    title: "No Seed Phrase",
    status: "Critical",
    text: "AI vraagt nooit om seed phrase, private key, recovery words of geheime wallet data.",
    icon: Lock,
  },
  {
    title: "Verify Before Signing",
    status: "Safety",
    text: "Elke walletactie moet zichtbaar worden gecontroleerd voordat gebruiker tekent.",
    icon: Eye,
  },
  {
    title: "Source Tag Clear",
    status: "2606",
    text: "Bij Make Waves acties moet source tag 2606 duidelijk zichtbaar zijn.",
    icon: Fingerprint,
  },
];

const roadmap = [
  "AI chat interface koppelen",
  "Prompt library opslaan",
  "Wallet explain mode toevoegen",
  "Trustline risk scanner bouwen",
  "Academy tutor koppelen aan XP",
  "Developer agent koppelen aan snippets",
  "Daily XRPL research feed toevoegen",
  "Safety disclaimers centraal maken",
];

export function AIHubTab() {
  const [selectedTool, setSelectedTool] = useState<AiTool>(aiTools[0]);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate>(
    promptTemplates[0]
  );
  const [draftPrompt, setDraftPrompt] = useState(promptTemplates[0].prompt);

  const SelectedToolIcon = selectedTool.icon;

  function useTemplate(template: PromptTemplate) {
    setSelectedPrompt(template);
    setDraftPrompt(template.prompt);
  }

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
              AI Layer For XRPL Users
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              De AI-laag van OTT Terminal. Hier komen wallet uitleg, safety
              scanning, XRPL research, Academy tutoring, developer support en
              Make Waves demo scripts samen.
            </p>
          </div>

          <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-3">
            <StatBox icon={Brain} label="AI Mode" value="Assistant" />
            <StatBox icon={ShieldCheck} label="Safety" value="Guarded" />
            <StatBox icon={Radio} label="Data" value="Mock" />
            <StatBox icon={Fingerprint} label="Source Tag" value="2606" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-4 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Layers size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                AI Tools
              </p>
            </div>

            <div className="space-y-3">
              {aiTools.map((tool) => (
                <ToolButton
                  key={tool.id}
                  tool={tool}
                  active={selectedTool.id === tool.id}
                  onClick={() => setSelectedTool(tool)}
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
                  Selected AI Tool
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  {selectedTool.title}
                </h3>
              </div>

              <SelectedToolIcon size={22} className="text-white/60" />
            </div>

            <p className="font-mono text-sm text-white/45 leading-relaxed mb-5">
              {selectedTool.text}
            </p>

            <MiniStatus label="Status" value={selectedTool.status} />
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Prompt Builder
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  {selectedPrompt.title}
                </h3>
              </div>

              <Terminal size={20} className="text-white/60" />
            </div>

            <textarea
              value={draftPrompt}
              onChange={(event) => setDraftPrompt(event.target.value)}
              className="w-full min-h-40 bg-black border border-white/10 p-4 font-mono text-xs text-white/70 outline-none focus:border-white/30 resize-none"
            />

            <div className="grid grid-cols-2 gap-2 mt-4">
              <button className="bg-white text-black py-3 font-orbitron text-xs font-black uppercase">
                Mock Run
              </button>

              <button
                onClick={() => setDraftPrompt(selectedPrompt.prompt)}
                className="border border-white/15 py-3 font-orbitron text-xs font-black uppercase text-white/70 hover:bg-white/[0.03] transition-all"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <MessageSquare size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Mock AI Response
              </p>
            </div>

            <div className="border border-white/10 bg-black p-5">
              <p className="font-mono text-xs text-white/45 leading-relaxed">
                AI antwoord komt hier later live. Voor nu bouwen we eerst de
                veilige interface, prompt templates, safety rules en module
                structuur.
              </p>
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-3 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Wand2 size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Prompt Templates
              </p>
            </div>

            <div className="space-y-3">
              {promptTemplates.map((template) => (
                <PromptButton
                  key={template.title}
                  template={template}
                  active={selectedPrompt.title === template.title}
                  onClick={() => useTemplate(template)}
                />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <ShieldCheck size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                AI Safety Rules
              </p>
            </div>

            <div className="space-y-3">
              {aiRules.map((rule) => (
                <RuleCard key={rule.title} rule={rule} />
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
          <FeatureBox icon={Search} title="Research" text="XRPL intel agent" />
          <FeatureBox icon={Wallet} title="Wallet AI" text="Explain actions" />
          <FeatureBox icon={Database} title="Data Layer" text="Live feeds later" />
          <FeatureBox icon={Cpu} title="Automation" text="Safe workflows" />
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

function ToolButton({
  tool,
  active,
  onClick,
}: {
  tool: AiTool;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = tool.icon;

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
            {tool.title}
          </p>
        </div>

        <p className="font-mono text-[10px] text-white/35 uppercase">
          {tool.status}
        </p>
      </div>
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

function PromptButton({
  template,
  active,
  onClick,
}: {
  template: PromptTemplate;
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
      <p className="font-orbitron text-xs font-bold uppercase mb-2">
        {template.title}
      </p>

      <p className="font-mono text-[10px] text-white/35 uppercase">
        {template.category}
      </p>
    </button>
  );
}

function RuleCard({ rule }: { rule: AiRule }) {
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
