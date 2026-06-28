import { useState } from "react";
import type { ElementType } from "react";
import {
  Activity,
  BadgeCheck,
  BookOpen,
  Boxes,
  Braces,
  Code2,
  Database,
  FileCode2,
  Fingerprint,
  KeyRound,
  Layers,
  Lock,
  Radio,
  Rocket,
  ScanLine,
  Server,
  ShieldCheck,
  Terminal,
  Wallet,
  Waves,
  Zap,
} from "lucide-react";

type DevTool = {
  id: string;
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

type CodeExample = {
  title: string;
  status: string;
  description: string;
  code: string;
};

type BuildStep = {
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

const devTools: DevTool[] = [
  {
    id: "xaman",
    title: "Xaman Payload Builder",
    status: "Soon",
    text: "Maak later veilige Xaman payloads voor Daily Check-In, source tag 2606 en user confirmation.",
    icon: Wallet,
  },
  {
    id: "source",
    title: "Source Tag Helper",
    status: "2606",
    text: "Helper om Make Waves transacties altijd met de juiste source tag zichtbaar te maken.",
    icon: Fingerprint,
  },
  {
    id: "xrpl",
    title: "XRPL API Explorer",
    status: "Build",
    text: "Lees wallet info, account lines, ledger data, AMM info en transaction history.",
    icon: Database,
  },
  {
    id: "docs",
    title: "Developer Docs",
    status: "Live UI",
    text: "Interne documentatie voor builders, partners, API routes en frontend modules.",
    icon: BookOpen,
  },
];

const codeExamples: CodeExample[] = [
  {
    title: "Source Tag 2606",
    status: "Make Waves",
    description: "Voorbeeldstructuur voor een XRPL transactie met source tag.",
    code: `{
  TransactionType: "Payment",
  Account: userWallet,
  Destination: ottWallet,
  Amount: "1000",
  SourceTag: 2606
}`,
  },
  {
    title: "Safe Xaman Flow",
    status: "Wallet",
    description: "Echte signing gebeurt later alleen via Xaman bevestiging.",
    code: `const payload = {
  txjson: transaction,
  options: {
    submit: true
  }
};`,
  },
  {
    title: "Read Account Lines",
    status: "XRPL",
    description: "Trustlines uitlezen voor wallet safety en portfolio data.",
    code: `{
  command: "account_lines",
  account: walletAddress,
  ledger_index: "validated"
}`,
  },
];

const buildSteps: BuildStep[] = [
  {
    title: "Frontend Modules",
    status: "Active",
    text: "Dashboard, Wallet, Portfolio, Ecosystem, Validators en Check-In staan in de terminal.",
    icon: Layers,
  },
  {
    title: "Mock Safety First",
    status: "Safe",
    text: "Alle walletacties blijven eerst mock tot de UX en warnings goed staan.",
    icon: ShieldCheck,
  },
  {
    title: "API Layer",
    status: "Next",
    text: "Serverless API routes voor Xaman, XRPL reads en secure secrets komen later.",
    icon: Server,
  },
  {
    title: "Mainnet Proof",
    status: "Later",
    text: "Daily Check-In krijgt later echte mainnet proof met source tag 2606.",
    icon: Waves,
  },
];

const apiRoutes = [
  {
    path: "/api/xaman",
    status: "Secure Backend",
  },
  {
    path: "/api/xrpl-account",
    status: "Wallet Reads",
  },
  {
    path: "/api/source-tag",
    status: "2606 Helper",
  },
  {
    path: "/api/check-in",
    status: "Daily Action",
  },
];

export function DeveloperHubTab() {
  const [selectedTool, setSelectedTool] = useState<DevTool>(devTools[0]);
  const [selectedExample, setSelectedExample] = useState<CodeExample>(
    codeExamples[0]
  );

  const SelectedToolIcon = selectedTool.icon;

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
              Build Layer For XRPL
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              De builder-laag van OTT Terminal. Hier komen Xaman payloads,
              XRPL API voorbeelden, source tag helpers, docs, code snippets en
              partner integrations samen.
            </p>
          </div>

          <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-3">
            <StatBox icon={Code2} label="Modules" value="14+" />
            <StatBox icon={Fingerprint} label="Source Tag" value="2606" />
            <StatBox icon={Lock} label="Secrets" value="Backend" />
            <StatBox icon={Rocket} label="Build" value="MVP" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-4 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Boxes size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Developer Tools
              </p>
            </div>

            <div className="space-y-3">
              {devTools.map((tool) => (
                <ToolButton
                  key={tool.id}
                  tool={tool}
                  active={selectedTool.id === tool.id}
                  onClick={() => setSelectedTool(tool)}
                />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Radio size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                API Routes
              </p>
            </div>

            <div className="space-y-3">
              {apiRoutes.map((route) => (
                <ApiRouteRow key={route.path} path={route.path} status={route.status} />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-5 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Selected Tool
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

            <div className="border border-white/10 bg-black p-4">
              <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
                Status
              </p>

              <p className="font-orbitron text-sm font-black uppercase">
                {selectedTool.status}
              </p>
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Code Examples
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  Copy-Ready Snippets
                </h3>
              </div>

              <FileCode2 size={20} className="text-white/60" />
            </div>

            <div className="space-y-3 mb-5">
              {codeExamples.map((example) => (
                <ExampleButton
                  key={example.title}
                  example={example}
                  active={selectedExample.title === example.title}
                  onClick={() => setSelectedExample(example)}
                />
              ))}
            </div>

            <div className="border border-white/10 bg-black p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="font-orbitron text-sm font-bold uppercase">
                  {selectedExample.title}
                </p>

                <p className="font-mono text-[10px] text-white/35 uppercase">
                  {selectedExample.status}
                </p>
              </div>

              <p className="font-mono text-xs text-white/45 leading-relaxed mb-4">
                {selectedExample.description}
              </p>

              <pre className="bg-white/[0.03] border border-white/10 p-4 overflow-x-auto">
                <code className="font-mono text-xs text-white/65 whitespace-pre">
                  {selectedExample.code}
                </code>
              </pre>
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-3 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <ShieldCheck size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Security Rules
              </p>
            </div>

            <div className="space-y-3">
              <SecurityLine icon={KeyRound} label="Never expose Xaman secrets" />
              <SecurityLine icon={Wallet} label="User confirms in Xaman" />
              <SecurityLine icon={Fingerprint} label="Show source tag before sign" />
              <SecurityLine icon={Lock} label="Backend handles secrets only" />
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Activity size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Build Steps
              </p>
            </div>

            <div className="space-y-3">
              {buildSteps.map((step) => (
                <BuildStepCard key={step.title} step={step} />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <FeatureBox icon={Braces} title="Code" text="Snippets and helpers" />
          <FeatureBox icon={Zap} title="Xaman" text="Payloads later" />
          <FeatureBox icon={ScanLine} title="XRPL API" text="Read ledger data" />
          <FeatureBox icon={BadgeCheck} title="Partners" text="Builder ready" />
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
  tool: DevTool;
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

function ApiRouteRow({ path, status }: { path: string; status: string }) {
  return (
    <div className="border border-white/10 bg-black p-3">
      <p className="font-mono text-xs text-white/60 mb-1">{path}</p>

      <p className="font-mono text-[10px] text-white/30 uppercase">
        {status}
      </p>
    </div>
  );
}

function ExampleButton({
  example,
  active,
  onClick,
}: {
  example: CodeExample;
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
      <div className="flex items-center justify-between gap-3">
        <p className="font-orbitron text-xs font-bold uppercase">
          {example.title}
        </p>

        <p className="font-mono text-[10px] text-white/35 uppercase">
          {example.status}
        </p>
      </div>
    </button>
  );
}

function SecurityLine({
  icon: Icon,
  label,
}: {
  icon: ElementType;
  label: string;
}) {
  return (
    <div className="border border-white/10 bg-black p-3 flex items-center gap-2">
      <Icon size={14} className="text-white/60" />

      <p className="font-mono text-xs text-white/50">{label}</p>
    </div>
  );
}

function BuildStepCard({ step }: { step: BuildStep }) {
  const Icon = step.icon;

  return (
    <div className="border border-white/10 bg-black p-4">
      <div className="flex items-start justify-between mb-3">
        <Icon size={17} className="text-white/60" />

        <p className="font-mono text-[10px] text-white/30 uppercase">
          {step.status}
        </p>
      </div>

      <p className="font-orbitron text-xs font-bold uppercase mb-2">
        {step.title}
      </p>

      <p className="font-mono text-[10px] text-white/40 leading-relaxed">
        {step.text}
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
