import { useState } from "react";
import type { ElementType } from "react";
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  Bell,
  CheckCircle2,
  Code2,
  Database,
  Eye,
  Fingerprint,
  KeyRound,
  Layers,
  Lock,
  Radio,
  ScanLine,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  Terminal,
  Wallet,
  Waves,
  Zap,
} from "lucide-react";

type XamanModule = {
  id: string;
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

type PayloadStep = {
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

type SecurityRule = {
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

const MAKE_WAVES_SOURCE_TAG = 2606170002;

const modules: XamanModule[] = [
  {
    id: "login",
    title: "Xaman Login",
    status: "Next",
    text: "Vervang debug mode later door echte Xaman wallet connectie met veilige sessie.",
    icon: Wallet,
  },
  {
    id: "payload",
    title: "Payload Signing",
    status: "Core",
    text: "Maak sign requests via backend zodat gebruikers acties bevestigen in Xaman.",
    icon: Send,
  },
  {
    id: "source-tag",
    title: "Make Waves Source Tag",
    status: "2606170002",
    text: "Elke Make Waves actie krijgt source tag 2606170002 voor tracking en proof.",
    icon: Fingerprint,
  },
  {
    id: "webhook",
    title: "Webhook Result",
    status: "Verify",
    text: "Payload status en transaction hash worden later opgehaald en gecontroleerd.",
    icon: Bell,
  },
  {
    id: "backend",
    title: "Backend API",
    status: "Secure",
    text: "Xaman API keys, webhooks, payloads en secrets blijven altijd server-side.",
    icon: Database,
  },
  {
    id: "audit",
    title: "Transaction Verify",
    status: "Safety",
    text: "Controleer later op-ledger of de juiste wallet, tag, amount en result kloppen.",
    icon: ScanLine,
  },
];

const payloadSteps: PayloadStep[] = [
  {
    title: "User Starts Action",
    status: "Step 1",
    text: "Gebruiker klikt Daily Check-In, badge claim, trustline helper of Make Waves action.",
    icon: Activity,
  },
  {
    title: "Backend Builds Payload",
    status: "Step 2",
    text: "Server maakt de XRPL transaction template met source tag 2606170002.",
    icon: Code2,
  },
  {
    title: "Xaman Shows Request",
    status: "Step 3",
    text: "Xaman toont de transactie zodat de gebruiker bewust kan accepteren of weigeren.",
    icon: Eye,
  },
  {
    title: "Verify On Ledger",
    status: "Step 4",
    text: "Na signing controleren we hash, wallet, result en source tag voordat XP telt.",
    icon: ShieldCheck,
  },
];

const securityRules: SecurityRule[] = [
  {
    title: "No Seed Phrase",
    status: "Rule",
    text: "De terminal vraagt nooit om seed phrase, private key of recovery words.",
    icon: Lock,
  },
  {
    title: "Backend Secrets",
    status: "Required",
    text: "Xaman API key, secret en webhook logic horen niet in frontend code.",
    icon: KeyRound,
  },
  {
    title: "User Confirmation",
    status: "Safety",
    text: "Elke echte XRPL actie moet zichtbaar en bewust bevestigd worden in Xaman.",
    icon: Wallet,
  },
  {
    title: "Verify Before Reward",
    status: "Proof",
    text: "XP, badges of streaks worden pas toegekend na correcte ledger verification.",
    icon: BadgeCheck,
  },
  {
    title: "No Auto Mainnet",
    status: "Guard",
    text: "AI of automation mag nooit automatisch mainnet transacties starten zonder user action.",
    icon: AlertTriangle,
  },
];

const roadmap = [
  "Xaman API keys naar backend zetten",
  "POST /api/xaman/payload maken",
  "Webhook endpoint maken",
  "Payload result ophalen",
  "Source tag 2606170002 valideren",
  "Daily Check-In transaction koppelen",
  "XP pas na ledger proof toekennen",
  "Debug login vervangen door Xaman login",
];

export function XamanCenterTab() {
  const [selectedModule, setSelectedModule] = useState<XamanModule>(modules[0]);
  const [selectedStep, setSelectedStep] = useState<PayloadStep>(payloadSteps[0]);

  const SelectedModuleIcon = selectedModule.icon;
  const SelectedStepIcon = selectedStep.icon;

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 mb-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="flex items-center gap-2 mb-4 text-white/45">
              <Terminal size={17} />

              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                Xaman Center
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              Real Wallet Actions Start Here
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              De Xaman-laag van OTT Terminal. Hier plannen we wallet login,
              payload signing, webhook results, ledger verification en Make Waves
              source tag {MAKE_WAVES_SOURCE_TAG}.
            </p>
          </div>

          <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-3">
            <StatBox icon={Wallet} label="Wallet" value="Xaman" />
            <StatBox icon={Fingerprint} label="Source Tag" value={`${MAKE_WAVES_SOURCE_TAG}`} />
            <StatBox icon={ShieldCheck} label="Mode" value="Safe" />
            <StatBox icon={Radio} label="Status" value="Build" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-4 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Layers size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Xaman Modules
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

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Waves size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Make Waves Tag
              </p>
            </div>

            <div className="border border-white/10 bg-black p-5">
              <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
                SourceTag
              </p>

              <p className="font-orbitron text-2xl font-black uppercase mb-3">
                {MAKE_WAVES_SOURCE_TAG}
              </p>

              <p className="font-mono text-xs text-white/45 leading-relaxed">
                Dit is de vaste source tag voor jouw Make Waves flow in de OTT
                Terminal.
              </p>
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-5 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Selected Module
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
                  Payload Flow
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  Sign Request Roadmap
                </h3>
              </div>

              <Zap size={20} className="text-white/60" />
            </div>

            <div className="space-y-3">
              {payloadSteps.map((step) => (
                <StepButton
                  key={step.title}
                  step={step}
                  active={selectedStep.title === step.title}
                  onClick={() => setSelectedStep(step)}
                />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-5">
              <p className="font-orbitron text-xs uppercase tracking-widest">
                Selected Step
              </p>

              <SelectedStepIcon size={18} className="text-white/60" />
            </div>

            <p className="font-orbitron text-2xl font-black uppercase mb-2">
              {selectedStep.title}
            </p>

            <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-4">
              {selectedStep.status}
            </p>

            <p className="font-mono text-sm text-white/45 leading-relaxed">
              {selectedStep.text}
            </p>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Code2 size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Payload Template Preview
              </p>
            </div>

            <pre className="border border-white/10 bg-black p-5 overflow-x-auto text-[10px] text-white/50 leading-relaxed">
{`{
  "TransactionType": "Payment",
  "Account": "{{userWallet}}",
  "Destination": "{{ottWallet}}",
  "Amount": "1000000",
  "SourceTag": ${MAKE_WAVES_SOURCE_TAG},
  "Memos": [
    {
      "Memo": {
        "MemoType": "4d616b655761766573",
        "MemoData": "4f54545f4441494c595f434845434b494e"
      }
    }
  ]
}`}
            </pre>
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
              {securityRules.map((rule) => (
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
          <FeatureBox icon={Wallet} title="Login" text="Xaman session later" />
          <FeatureBox icon={Send} title="Payloads" text="Backend generated" />
          <FeatureBox icon={Fingerprint} title="Source Tag" text={`${MAKE_WAVES_SOURCE_TAG}`} />
          <FeatureBox icon={CheckCircle2} title="Verify" text="Proof before XP" />
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

      <p className="font-orbitron text-sm font-black uppercase break-all">
        {value}
      </p>
    </div>
  );
}

function ModuleButton({
  module,
  active,
  onClick,
}: {
  module: XamanModule;
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

function StepButton({
  step,
  active,
  onClick,
}: {
  step: PayloadStep;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = step.icon;

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
            {step.title}
          </p>
        </div>

        <p className="font-mono text-[10px] text-white/35 uppercase">
          {step.status}
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

function RuleCard({ rule }: { rule: SecurityRule }) {
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

      <p className="font-mono text-xs text-white/40 break-all">{text}</p>
    </div>
  );
}
