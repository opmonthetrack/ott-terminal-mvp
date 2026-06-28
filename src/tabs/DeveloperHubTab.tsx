import type { ElementType } from "react";
import {
  Activity,
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  Bot,
  Braces,
  CheckCircle2,
  Code2,
  Coins,
  Cpu,
  Database,
  FileCode2,
  GitBranch,
  Globe2,
  KeyRound,
  Layers,
  Lock,
  Network,
  Rocket,
  Server,
  ShieldCheck,
  Sparkles,
  Terminal,
  Wallet,
  Zap,
} from "lucide-react";

type DevTool = {
  title: string;
  category: string;
  status: string;
  description: string;
  icon: ElementType;
};

type CodeExample = {
  title: string;
  language: string;
  status: string;
  snippet: string;
};

type Integration = {
  title: string;
  status: string;
  description: string;
  icon: ElementType;
};

const devTools: DevTool[] = [
  {
    title: "XRPL JS Starter",
    category: "SDK",
    status: "Planned",
    description:
      "Basisvoorbeelden voor payments, account info, trustlines, NFTs, AMM en ledger data.",
    icon: Code2,
  },
  {
    title: "Xaman Payload Builder",
    category: "Wallet Actions",
    status: "Priority",
    description:
      "Maak veilige Xaman payloads voor login, payments, trustlines en Daily Check-In transacties.",
    icon: Wallet,
  },
  {
    title: "Source Tag 2606 Helper",
    category: "Make Waves",
    status: "Priority",
    description:
      "Helper voor mainnet transacties met de juiste source tag zodat actieve gebruikers meetellen.",
    icon: Zap,
  },
  {
    title: "API Explorer",
    category: "Data",
    status: "Soon",
    description:
      "Test XRPL endpoints, backend routes, news feeds, wallet data en toekomstige OTT APIs.",
    icon: Server,
  },
  {
    title: "Trustline Lab",
    category: "Token Tools",
    status: "Planned",
    description:
      "Educatieve omgeving om trustlines, issuers, risico's en token settings beter te begrijpen.",
    icon: ShieldCheck,
  },
  {
    title: "AI Code Assistant",
    category: "AI Developer Mode",
    status: "Future",
    description:
      "AI helpt developers met voorbeeldcode, uitleg, debugging en XRPL integraties.",
    icon: Bot,
  },
];

const codeExamples: CodeExample[] = [
  {
    title: "Xaman Payment Payload",
    language: "TypeScript",
    status: "Mock",
    snippet: [
      "const payload = {",
      '  txjson: {',
      '    TransactionType: "Payment",',
      '    Destination: "rDestinationAddress",',
      '    Amount: "1000000",',
      "    SourceTag: 2606,",
      "  },",
      "};",
    ].join("\n"),
  },
  {
    title: "XRPL Account Info",
    language: "JavaScript",
    status: "Mock",
    snippet: [
      "const request = {",
      '  method: "account_info",',
      '  params: [{',
      '    account: walletAddress,',
      '    ledger_index: "validated",',
      "  }],",
      "};",
    ].join("\n"),
  },
  {
    title: "Trustline Warning Flow",
    language: "Pseudo",
    status: "Planned",
    snippet: [
      "checkIssuer();",
      "checkTokenMetadata();",
      "showRiskWarning();",
      "requireUserConfirm();",
      "openXamanPayload();",
    ].join("\n"),
  },
];

const integrations: Integration[] = [
  {
    title: "XRPL Mainnet",
    status: "Core",
    description:
      "Ledger data, payments, account activity, trustlines, NFT badges en AMM informatie.",
    icon: Globe2,
  },
  {
    title: "Xaman",
    status: "Priority",
    description:
      "Veilige wallet login, payload signing, user consent en mainnet transacties.",
    icon: Wallet,
  },
  {
    title: "OTT Backend",
    status: "Build",
    description:
      "Server routes voor API keys, AI, news feeds, source tag checks en toekomstige rewards.",
    icon: Database,
  },
  {
    title: "AI Layer",
    status: "Future",
    description:
      "AI summaries, code helper, wallet uitleg, risk scanner en Academy tutor.",
    icon: Cpu,
  },
];

const devRoadmap = [
  "Maak developer hub interface",
  "Voeg code examples en API explorer toe",
  "Koppel Xaman payload builder",
  "Voeg Daily Check-In source tag helper toe",
  "Voeg XRPL account info endpoint toe",
  "Voeg trustline safety lab toe",
  "Voeg AI code assistant toe",
  "Maak builder docs voor externe developers",
];

export function DeveloperHubTab() {
  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 mb-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="flex items-center gap-2 mb-4 text-white/45">
              <Terminal size={17} />
              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                OTT Developer Hub
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              Build On The XRP Ledger
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              De developer-laag van de OTT Terminal. Hier komen XRPL examples,
              Xaman payloads, API tools, source tag helpers, trustline labs,
              AI-code support en builder documentatie samen.
            </p>
          </div>

          <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-3">
            <StatBox icon={Code2} label="Dev Tools" value="6" />
            <StatBox icon={FileCode2} label="Examples" value="3" />
            <StatBox icon={Wallet} label="Xaman" value="Priority" />
            <StatBox icon={Zap} label="Source Tag" value="2606" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-8 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Builder Tools
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  Developer Modules
                </h3>
              </div>

              <Braces size={20} className="text-white/60" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {devTools.map((tool) => (
                <DevToolCard key={tool.title} tool={tool} />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Code Examples
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  Copy-Paste Starters
                </h3>
              </div>

              <FileCode2 size={20} className="text-white/60" />
            </div>

            <div className="space-y-3">
              {codeExamples.map((example) => (
                <CodeExampleCard key={example.title} example={example} />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Integrations
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  Technical Stack
                </h3>
              </div>

              <Network size={20} className="text-white/60" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {integrations.map((item) => (
                <IntegrationCard key={item.title} item={item} />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-4 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <ShieldCheck size={18} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                Developer Safety
              </p>
            </div>

            <p className="font-mono text-xs text-white/45 leading-relaxed mb-5">
              Elke walletactie moet zichtbaar, begrijpelijk en veilig zijn.
              Developers mogen nooit geheime transacties of automatische signing
              flows bouwen.
            </p>

            <div className="space-y-3">
              <SafetyLine label="No hidden transactions" />
              <SafetyLine label="No secret client keys" />
              <SafetyLine label="Server-side API secrets only" />
              <SafetyLine label="User confirms before signing" />
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Rocket size={18} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                Builder Roadmap
              </p>
            </div>

            <div className="space-y-3">
              {devRoadmap.map((item) => (
                <RoadmapLine key={item} label={item} />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={18} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                AI Builder Mode
              </p>
            </div>

            <p className="font-mono text-xs text-white/45 leading-relaxed">
              Later kan AI developers helpen met XRPL code, Xaman payloads,
              API calls, debugging, uitleg en veilige voorbeeldflows.
            </p>
          </div>
        </div>

        <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <FeatureBox icon={BookOpen} title="Docs" text="Developer guides" />
          <FeatureBox icon={GitBranch} title="Examples" text="Code starters" />
          <FeatureBox icon={KeyRound} title="Security" text="Safe flows" />
          <FeatureBox icon={ArrowUpRight} title="APIs" text="Explorer later" />
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

function DevToolCard({ tool }: { tool: DevTool }) {
  const Icon = tool.icon;

  return (
    <div className="border border-white/10 bg-black hover:bg-white/[0.03] transition-all p-5 cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <Icon size={20} className="text-white/70" />

        <span className="font-mono text-[10px] uppercase text-white/45">
          {tool.status}
        </span>
      </div>

      <h4 className="font-orbitron text-sm font-bold uppercase mb-2">
        {tool.title}
      </h4>

      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-4">
        {tool.category}
      </p>

      <p className="font-mono text-xs text-white/45 leading-relaxed">
        {tool.description}
      </p>
    </div>
  );
}

function CodeExampleCard({ example }: { example: CodeExample }) {
  return (
    <div className="border border-white/10 bg-black p-5 hover:bg-white/[0.03] transition-all">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="font-orbitron text-sm font-bold uppercase mb-1">
            {example.title}
          </p>

          <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest">
            {example.language} • {example.status}
          </p>
        </div>

        <ArrowUpRight size={15} className="text-white/20 shrink-0" />
      </div>

      <pre className="border border-white/10 bg-white/[0.02] p-4 overflow-x-auto text-[11px] text-white/50 font-mono leading-relaxed">
        {example.snippet}
      </pre>
    </div>
  );
}

function IntegrationCard({ item }: { item: Integration }) {
  const Icon = item.icon;

  return (
    <div className="border border-white/10 bg-black p-5">
      <div className="flex items-start justify-between mb-4">
        <Icon size={20} className="text-white/70" />

        <span className="font-mono text-[10px] uppercase text-white/45">
          {item.status}
        </span>
      </div>

      <h4 className="font-orbitron text-sm font-bold uppercase mb-3">
        {item.title}
      </h4>

      <p className="font-mono text-xs text-white/45 leading-relaxed">
        {item.description}
      </p>
    </div>
  );
}

function SafetyLine({ label }: { label: string }) {
  return (
    <div className="border border-white/10 bg-black p-3 flex items-center gap-2">
      <CheckCircle2 size={14} className="text-white/60" />

      <p className="font-mono text-xs text-white/50">{label}</p>
    </div>
  );
}

function RoadmapLine({ label }: { label: string }) {
  return (
    <div className="border-b border-white/10 pb-3 last:border-b-0 last:pb-0">
      <p className="font-mono text-xs text-white/45 leading-relaxed">{label}</p>
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
