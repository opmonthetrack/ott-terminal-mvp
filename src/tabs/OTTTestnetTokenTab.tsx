import { useState } from "react";
import type { ElementType } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  Banknote,
  BookOpen,
  CheckCircle2,
  Coins,
  FileCheck,
  Fingerprint,
  Gift,
  Globe2,
  Layers,
  Lock,
  Radio,
  Scale,
  ShieldCheck,
  Sparkles,
  TestTube2,
  Trophy,
  Wallet,
  Waves,
  Zap,
} from "lucide-react";
import {
  MAKE_WAVES_ACTIONS,
  MAKE_WAVES_SOURCE_TAG,
} from "../lib/makeWaves";

type TokenMetric = {
  label: string;
  value: string;
  text: string;
  icon: ElementType;
};

type TokenLayer = {
  id: string;
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

type TokenRule = {
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

const tokenLayers: TokenLayer[] = [
  {
    id: "xp",
    title: "Terminal XP",
    status: "Active",
    text: "Off-chain punten voor gebruik, check-ins, academy en verified XRPL proof.",
    icon: Zap,
  },
  {
    id: "eligibility",
    title: "OTT Eligibility",
    status: "Tracked",
    text: "Score die laat zien wie later mogelijk in aanmerking komt voor OTT rewards.",
    icon: BadgeCheck,
  },
  {
    id: "testnet",
    title: "OTT Testnet Token",
    status: "Next",
    text: "Veilige testfase om token rewards te simuleren zonder mainnet waarde.",
    icon: TestTube2,
  },
  {
    id: "mainnet",
    title: "OTT Mainnet Token",
    status: "Locked",
    text: "Mainnet distributie blijft uit tot legal review, token terms en policy klaar zijn.",
    icon: Lock,
  },
  {
    id: "utility",
    title: "Utility Access",
    status: "Design",
    text: "Token/eligibility kan later toegang geven tot tools, academy, events en partner perks.",
    icon: Gift,
  },
];

const tokenRules: TokenRule[] = [
  {
    title: "No Investment Language",
    status: "Rule",
    text: "Niet communiceren als belegging, winstkans, rendement of prijsverwachting.",
    icon: AlertTriangle,
  },
  {
    title: "Utility First",
    status: "Design",
    text: "OTT moet draaien om toegang, community, proof, learning en terminal utility.",
    icon: Sparkles,
  },
  {
    title: "Legal Gate",
    status: "Required",
    text: "Mainnet token rewards pas na juridische check en duidelijke voorwaarden.",
    icon: Scale,
  },
  {
    title: "SourceTag Proof",
    status: "2606170002",
    text: `Reward eligibility wordt gekoppeld aan SourceTag ${MAKE_WAVES_SOURCE_TAG}.`,
    icon: Fingerprint,
  },
  {
    title: "User Consent",
    status: "Safety",
    text: "Geen automatische mainnet airdrops zonder duidelijke user consent flow.",
    icon: ShieldCheck,
  },
];

const tokenRoadmap = [
  "XP zichtbaar houden in terminal",
  "OTT eligibility score tonen",
  "Testnet token reward flow bouwen",
  "Issuer wallet en trustline scherm ontwerpen",
  "Token terms en risk disclaimer schrijven",
  "Legal/MiCAR review afronden",
  "Partner utility model toevoegen",
  "Mainnet pas openen na groen licht",
];

export function OTTTokenCenterTab() {
  const [selectedLayer, setSelectedLayer] = useState<TokenLayer>(tokenLayers[0]);
  const SelectedIcon = selectedLayer.icon;

  const metrics: TokenMetric[] = [
    {
      label: "SourceTag",
      value: String(MAKE_WAVES_SOURCE_TAG),
      text: "Make Waves reward proof.",
      icon: Fingerprint,
    },
    {
      label: "XP Layer",
      value: "Active",
      text: "Safe MVP reward.",
      icon: Trophy,
    },
    {
      label: "OTT Token",
      value: "Locked",
      text: "Legal gate first.",
      icon: Coins,
    },
    {
      label: "Testnet",
      value: "Next",
      text: "Token simulation.",
      icon: TestTube2,
    },
  ];

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 mb-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="flex items-center gap-2 mb-4 text-white/45">
              <Coins size={17} />

              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                OTT Token Center
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              Token Utility Without Rushing Mainnet
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              OTT Token Center houdt de tokenstrategie veilig: XP nu, eligibility
              zichtbaar, testnet als volgende stap, en mainnet distributie pas
              na legal gate.
            </p>
          </div>

          <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-3">
            {metrics.map((metric) => (
              <MetricBox key={metric.label} metric={metric} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-4 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Layers size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Token Layers
              </p>
            </div>

            <div className="space-y-3">
              {tokenLayers.map((layer) => (
                <LayerButton
                  key={layer.id}
                  layer={layer}
                  active={selectedLayer.id === layer.id}
                  onClick={() => setSelectedLayer(layer)}
                />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Waves size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Reward Actions
              </p>
            </div>

            <div className="space-y-3">
              {MAKE_WAVES_ACTIONS.map((action) => (
                <ActionLine
                  key={action.id}
                  label={action.title}
                  xp={action.xp}
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
                  Selected Layer
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  {selectedLayer.title}
                </h3>
              </div>

              <SelectedIcon size={22} className="text-white/60" />
            </div>

            <p className="font-mono text-sm text-white/45 leading-relaxed mb-5">
              {selectedLayer.text}
            </p>

            <MiniStatus label="Status" value={selectedLayer.status} />
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Banknote size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Token Design
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <DesignBox
                icon={Wallet}
                title="Issuer Wallet"
                text="Later aparte XRPL issuer wallet voor OTT token."
              />
              <DesignBox
                icon={FileCheck}
                title="Trustline"
                text="Gebruiker moet bewust trustline zetten."
              />
              <DesignBox
                icon={BookOpen}
                title="Terms"
                text="Voorwaarden en disclaimers zichtbaar in terminal."
              />
              <DesignBox
                icon={Globe2}
                title="Utility"
                text="Access, academy, events en partner perks."
              />
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Radio size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Token Status
              </p>
            </div>

            <div className="border border-white/10 bg-black p-5">
              <p className="font-orbitron text-2xl font-black uppercase mb-2">
                Mainnet Locked
              </p>

              <p className="font-mono text-xs text-white/40 leading-relaxed">
                XP en eligibility kunnen nu gebruikt worden. Echte OTT token
                distributie blijft uit tot legal review en user consent klaar
                zijn.
              </p>
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-3 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <ShieldCheck size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Token Rules
              </p>
            </div>

            <div className="space-y-3">
              {tokenRules.map((rule) => (
                <RuleCard key={rule.title} rule={rule} />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <CheckCircle2 size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Roadmap
              </p>
            </div>

            <div className="space-y-3">
              {tokenRoadmap.map((item) => (
                <RoadmapLine key={item} label={item} />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <FeatureBox icon={Zap} title="XP" text="Use now" />
          <FeatureBox icon={BadgeCheck} title="Eligibility" text="Track now" />
          <FeatureBox icon={TestTube2} title="Testnet" text="Build next" />
          <FeatureBox icon={Lock} title="Mainnet" text="Legal gate" />
        </div>
      </div>
    </div>
  );
}

function MetricBox({ metric }: { metric: TokenMetric }) {
  const Icon = metric.icon;

  return (
    <div className="border border-white/10 bg-black/60 p-4">
      <Icon size={18} className="text-white/60 mb-3" />

      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
        {metric.label}
      </p>

      <p className="font-orbitron text-sm font-black uppercase mb-1 break-all">
        {metric.value}
      </p>

      <p className="font-mono text-[10px] text-white/30 uppercase">
        {metric.text}
      </p>
    </div>
  );
}

function LayerButton({
  layer,
  active,
  onClick,
}: {
  layer: TokenLayer;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = layer.icon;

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
            {layer.title}
          </p>
        </div>

        <p className="font-mono text-[10px] text-white/35 uppercase">
          {layer.status}
        </p>
      </div>
    </button>
  );
}

function ActionLine({ label, xp }: { label: string; xp: number }) {
  return (
    <div className="border border-white/10 bg-black p-3 flex items-center justify-between gap-3">
      <p className="font-mono text-xs text-white/50">{label}</p>

      <p className="font-mono text-[10px] text-white/35 uppercase">+{xp} XP</p>
    </div>
  );
}

function MiniStatus({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/10 bg-black p-4">
      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
        {label}
      </p>

      <p className="font-orbitron text-sm font-black uppercase break-all">
        {value}
      </p>
    </div>
  );
}

function DesignBox({
  icon: Icon,
  title,
  text,
}: {
  icon: ElementType;
  title: string;
  text: string;
}) {
  return (
    <div className="border border-white/10 bg-black p-4">
      <Icon size={18} className="text-white/60 mb-3" />

      <p className="font-orbitron text-xs font-bold uppercase mb-2">{title}</p>

      <p className="font-mono text-[10px] text-white/40 leading-relaxed">
        {text}
      </p>
    </div>
  );
}

function RuleCard({ rule }: { rule: TokenRule }) {
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
