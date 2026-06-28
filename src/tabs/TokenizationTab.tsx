import { useState } from "react";
import type { ElementType } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Coins,
  FileText,
  Fingerprint,
  Gem,
  Globe2,
  Landmark,
  Layers,
  Lock,
  Scale,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Target,
  Ticket,
  Vault,
  Wallet,
} from "lucide-react";

type AssetType = {
  id: string;
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

type TokenStep = {
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

type ComplianceRule = {
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

const assetTypes: AssetType[] = [
  {
    id: "real-estate",
    title: "Real Estate",
    status: "RWA",
    text: "Tokenized property certificates, ownership proof, rental rights en investor dashboards.",
    icon: Building2,
  },
  {
    id: "gold",
    title: "Gold & Metals",
    status: "Vault",
    text: "Tokenized gold, silver, storage proof, audit trail en redemption logic.",
    icon: Gem,
  },
  {
    id: "tickets",
    title: "Tickets",
    status: "Events",
    text: "Event tickets, access passes, QR proof, resale rules en NFT badges.",
    icon: Ticket,
  },
  {
    id: "certificates",
    title: "Certificates",
    status: "Proof",
    text: "Education certificates, membership proof, achievements en wallet identity.",
    icon: BadgeCheck,
  },
  {
    id: "funds",
    title: "Funds",
    status: "Research",
    text: "Investment baskets, treasury assets, pension proof en regulated participation.",
    icon: Landmark,
  },
  {
    id: "invoices",
    title: "Invoices",
    status: "Business",
    text: "Invoice tokens, payment tracking, settlement proof en business accounting.",
    icon: FileText,
  },
];

const tokenSteps: TokenStep[] = [
  {
    title: "Asset Intake",
    status: "Step 1",
    text: "Leg vast wat het asset is, wie eigenaar is, welke rechten bestaan en welke documenten horen bij het asset.",
    icon: FileText,
  },
  {
    title: "Compliance Check",
    status: "Step 2",
    text: "Controleer regels, KYC, issuer rights, jurisdiction, redemption en risico voordat er iets wordt uitgegeven.",
    icon: Scale,
  },
  {
    title: "Token Design",
    status: "Step 3",
    text: "Bepaal supply, issuer, metadata, transfer rules, holder rights, badges en utility.",
    icon: Layers,
  },
  {
    title: "XRPL Issue",
    status: "Step 4",
    text: "Later kan de token via veilige backend en wallet confirmation op XRPL worden uitgegeven.",
    icon: Coins,
  },
];

const complianceRules: ComplianceRule[] = [
  {
    title: "No Fake Ownership",
    status: "Rule",
    text: "Een token mag nooit meer rechten beloven dan juridisch en praktisch gedekt zijn.",
    icon: ShieldCheck,
  },
  {
    title: "Issuer Transparency",
    status: "Rule",
    text: "Gebruikers moeten weten wie de issuer is, wat het asset is en welke risico's bestaan.",
    icon: ScanLine,
  },
  {
    title: "Wallet Confirmation",
    status: "Safety",
    text: "Elke echte XRPL actie moet door de gebruiker worden bevestigd via wallet signing.",
    icon: Wallet,
  },
  {
    title: "Legal Layer",
    status: "Required",
    text: "RWA tokenization heeft altijd juridische, fiscale en compliance controle nodig.",
    icon: Lock,
  },
];

const futureFeatures = [
  "RWA asset intake form",
  "Issuer profile page",
  "Document upload checklist",
  "Token supply planner",
  "Trustline setup helper",
  "NFT certificate preview",
  "Compliance warning engine",
  "Investor dashboard later",
];

export function TokenizationTab() {
  const [selectedAsset, setSelectedAsset] = useState<AssetType>(assetTypes[0]);
  const [selectedStep, setSelectedStep] = useState<TokenStep>(tokenSteps[0]);

  const SelectedAssetIcon = selectedAsset.icon;
  const SelectedStepIcon = selectedStep.icon;

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 mb-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="flex items-center gap-2 mb-4 text-white/45">
              <Vault size={17} />

              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                XRPL Tokenization Center
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              Real World Assets On XRPL
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              De tokenization-laag van OTT Terminal. Hier ontwerpen we RWA
              flows, issuer pages, certificate tokens, document proof,
              compliance checks en veilige XRPL uitgifte.
            </p>
          </div>

          <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-3">
            <StatBox icon={Vault} label="Asset Layer" value="RWA" />
            <StatBox icon={Coins} label="Token Type" value="XRPL" />
            <StatBox icon={ShieldCheck} label="Safety" value="Required" />
            <StatBox icon={Fingerprint} label="Proof" value="Metadata" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-4 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Target size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Asset Types
              </p>
            </div>

            <div className="space-y-3">
              {assetTypes.map((asset) => (
                <AssetButton
                  key={asset.id}
                  asset={asset}
                  active={selectedAsset.id === asset.id}
                  onClick={() => setSelectedAsset(asset)}
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
                  Selected Asset
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  {selectedAsset.title}
                </h3>
              </div>

              <SelectedAssetIcon size={22} className="text-white/60" />
            </div>

            <p className="font-mono text-sm text-white/45 leading-relaxed mb-5">
              {selectedAsset.text}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <MiniStatus label="Category" value={selectedAsset.status} />
              <MiniStatus label="Network" value="XRPL" />
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Token Flow
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  From Asset To Token
                </h3>
              </div>

              <Sparkles size={20} className="text-white/60" />
            </div>

            <div className="space-y-3 mb-5">
              {tokenSteps.map((step) => (
                <StepButton
                  key={step.title}
                  step={step}
                  active={selectedStep.title === step.title}
                  onClick={() => setSelectedStep(step)}
                />
              ))}
            </div>

            <div className="border border-white/10 bg-black p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="font-orbitron text-sm font-bold uppercase">
                  {selectedStep.title}
                </p>

                <SelectedStepIcon size={18} className="text-white/60" />
              </div>

              <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-3">
                {selectedStep.status}
              </p>

              <p className="font-mono text-xs text-white/45 leading-relaxed">
                {selectedStep.text}
              </p>
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-3 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <AlertTriangle size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Compliance Rules
              </p>
            </div>

            <div className="space-y-3">
              {complianceRules.map((rule) => (
                <RuleCard key={rule.title} rule={rule} />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Globe2 size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Future Features
              </p>
            </div>

            <div className="space-y-3">
              {futureFeatures.map((item) => (
                <FutureLine key={item} label={item} />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <FeatureBox icon={FileText} title="Documents" text="Proof and terms" />
          <FeatureBox icon={Coins} title="Issue Token" text="XRPL later" />
          <FeatureBox icon={Scale} title="Compliance" text="Required checks" />
          <FeatureBox icon={Wallet} title="Wallet Flow" text="User confirms" />
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

function AssetButton({
  asset,
  active,
  onClick,
}: {
  asset: AssetType;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = asset.icon;

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
            {asset.title}
          </p>
        </div>

        <p className="font-mono text-[10px] text-white/35 uppercase">
          {asset.status}
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
  step: TokenStep;
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

function RuleCard({ rule }: { rule: ComplianceRule }) {
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

function FutureLine({ label }: { label: string }) {
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
