import { useState } from "react";
import type { ElementType } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  Boxes,
  CheckCircle2,
  Coins,
  Factory,
  FileText,
  Fingerprint,
  Gem,
  Hash,
  Layers,
  Lock,
  Package,
  Radio,
  Rocket,
  Scale,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Target,
  Ticket,
  Wallet,
  Zap,
} from "lucide-react";

type TokenType = {
  id: string;
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

type FactoryStep = {
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

type SafetyRule = {
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

const tokenTypes: TokenType[] = [
  {
    id: "issued-token",
    title: "Issued Token",
    status: "XRPL",
    text: "Maak later een issued currency met issuer, supply, trustlines en duidelijke token metadata.",
    icon: Coins,
  },
  {
    id: "badge",
    title: "Badge Token",
    status: "Proof",
    text: "Achievement badges voor Academy, wallet safety, Make Waves en community status.",
    icon: BadgeCheck,
  },
  {
    id: "ticket",
    title: "Ticket Token",
    status: "Access",
    text: "Event tickets, AMA access, workshop passes en community entry proof.",
    icon: Ticket,
  },
  {
    id: "certificate",
    title: "Certificate Token",
    status: "Education",
    text: "NFT-style proof voor afgeronde lessen, courses, workshops en credentials.",
    icon: FileText,
  },
  {
    id: "rwa",
    title: "RWA Token",
    status: "Compliance",
    text: "Real-world-asset token design met legal layer, documents, issuer en redemption rules.",
    icon: Gem,
  },
  {
    id: "reward",
    title: "Reward Token",
    status: "Utility",
    text: "Reward logic voor XP, streaks, marketplace unlocks en future OTT utility.",
    icon: Sparkles,
  },
];

const factorySteps: FactoryStep[] = [
  {
    title: "Choose Token Type",
    status: "Step 1",
    text: "Kies eerst het type token: issued token, badge, ticket, certificate, RWA of reward.",
    icon: Target,
  },
  {
    title: "Set Token Details",
    status: "Step 2",
    text: "Vul naam, symbol, supply, issuer info, description, metadata en utility in.",
    icon: Hash,
  },
  {
    title: "Review Safety",
    status: "Step 3",
    text: "Controleer claims, issuer, compliance, wallet warnings en user confirmation.",
    icon: ShieldCheck,
  },
  {
    title: "Create Payload",
    status: "Step 4",
    text: "Later maakt de backend een veilige Xaman payload. Geen secrets in frontend.",
    icon: Wallet,
  },
];

const safetyRules: SafetyRule[] = [
  {
    title: "No Fake Claims",
    status: "Rule",
    text: "Een token mag nooit eigendom, rendement of rechten beloven die niet echt gedekt zijn.",
    icon: AlertTriangle,
  },
  {
    title: "Issuer Visible",
    status: "Required",
    text: "Gebruikers moeten duidelijk zien wie de issuer is en wat de token betekent.",
    icon: ScanLine,
  },
  {
    title: "Wallet Confirms",
    status: "Safety",
    text: "Elke echte XRPL tokenactie moet door de gebruiker bevestigd worden in Xaman.",
    icon: Wallet,
  },
  {
    title: "Backend Secrets",
    status: "Security",
    text: "Xaman API keys, XRPL secrets en private config blijven altijd op de backend.",
    icon: Lock,
  },
];

const roadmap = [
  "Token form opslaan in state",
  "Symbol en supply validatie bouwen",
  "Issuer profile koppelen",
  "Metadata preview maken",
  "Trustline helper toevoegen",
  "Xaman payload backend koppelen",
  "Token launch checklist maken",
  "Mint / issue flow later bouwen",
];

export function TokenFactory() {
  const [selectedType, setSelectedType] = useState<TokenType>(tokenTypes[0]);
  const [selectedStep, setSelectedStep] = useState<FactoryStep>(factorySteps[0]);
  const [tokenName, setTokenName] = useState("OTT Founder Badge");
  const [tokenSymbol, setTokenSymbol] = useState("OTTF");
  const [tokenSupply, setTokenSupply] = useState("2606");

  const SelectedTypeIcon = selectedType.icon;
  const SelectedStepIcon = selectedStep.icon;

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 mb-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="flex items-center gap-2 mb-4 text-white/45">
              <Factory size={17} />

              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                OTT Token Factory
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              Create Tokens With Safety First
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              De token factory-laag van OTT Terminal. Hier ontwerpen we issued
              tokens, badges, tickets, certificates, RWA tokens en reward flows
              voordat er ooit een echte XRPL actie plaatsvindt.
            </p>
          </div>

          <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-3">
            <StatBox icon={Factory} label="Factory" value="MVP" />
            <StatBox icon={Coins} label="Token Types" value="6" />
            <StatBox icon={Fingerprint} label="Source Tag" value="2606" />
            <StatBox icon={ShieldCheck} label="Safety" value="First" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-4 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Boxes size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Token Types
              </p>
            </div>

            <div className="space-y-3">
              {tokenTypes.map((type) => (
                <TokenTypeButton
                  key={type.id}
                  type={type}
                  active={selectedType.id === type.id}
                  onClick={() => setSelectedType(type)}
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
                  Selected Token Type
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  {selectedType.title}
                </h3>
              </div>

              <SelectedTypeIcon size={22} className="text-white/60" />
            </div>

            <p className="font-mono text-sm text-white/45 leading-relaxed mb-5">
              {selectedType.text}
            </p>

            <MiniStatus label="Status" value={selectedType.status} />
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Token Draft
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  Factory Form
                </h3>
              </div>

              <Package size={20} className="text-white/60" />
            </div>

            <div className="space-y-4">
              <InputField
                label="Token Name"
                value={tokenName}
                onChange={setTokenName}
              />

              <InputField
                label="Symbol"
                value={tokenSymbol}
                onChange={setTokenSymbol}
              />

              <InputField
                label="Supply"
                value={tokenSupply}
                onChange={setTokenSupply}
              />
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Rocket size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Token Preview
              </p>
            </div>

            <div className="border border-white/10 bg-black p-5">
              <p className="font-orbitron text-2xl font-black uppercase mb-2">
                {tokenName || "Unnamed Token"}
              </p>

              <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-4">
                {tokenSymbol || "SYMBOL"} • Supply {tokenSupply || "0"}
              </p>

              <p className="font-mono text-xs text-white/45 leading-relaxed">
                Type: {selectedType.title}. Status: mock draft only. Real
                issuing comes later through safe backend and Xaman confirmation.
              </p>
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-3 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Layers size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Factory Steps
              </p>
            </div>

            <div className="space-y-3">
              {factorySteps.map((step) => (
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

            <p className="font-orbitron text-lg font-black uppercase mb-2">
              {selectedStep.title}
            </p>

            <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-4">
              {selectedStep.status}
            </p>

            <p className="font-mono text-xs text-white/45 leading-relaxed">
              {selectedStep.text}
            </p>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Scale size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Safety Rules
              </p>
            </div>

            <div className="space-y-3">
              {safetyRules.map((rule) => (
                <RuleCard key={rule.title} rule={rule} />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <FeatureBox icon={Coins} title="Issued Tokens" text="XRPL currencies" />
          <FeatureBox icon={BadgeCheck} title="Badges" text="Proof and access" />
          <FeatureBox icon={Wallet} title="Xaman Later" text="Safe payloads" />
          <FeatureBox icon={Radio} title="Roadmap" text={`${roadmap.length} steps`} />
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

function TokenTypeButton({
  type,
  active,
  onClick,
}: {
  type: TokenType;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = type.icon;

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
            {type.title}
          </p>
        </div>

        <p className="font-mono text-[10px] text-white/35 uppercase">
          {type.status}
        </p>
      </div>
    </button>
  );
}

function InputField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
        {label}
      </p>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-black border border-white/10 px-4 py-4 font-mono text-xs text-white/70 outline-none focus:border-white/30"
      />
    </label>
  );
}

function StepButton({
  step,
  active,
  onClick,
}: {
  step: FactoryStep;
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
