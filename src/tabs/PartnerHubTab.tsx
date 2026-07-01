import { useMemo, useState } from "react";
import type { ElementType } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Circle,
  Compass,
  ExternalLink,
  Fingerprint,
  Flame,
  GraduationCap,
  Layers,
  Link2,
  Lock,
  MessageCircle,
  Route,
  ShieldAlert,
  Sparkles,
  Trophy,
  Wallet,
} from "lucide-react";
import {
  PARTNER_SOURCE_TAG,
  getPartnerCompletionXp,
  getRiskLabel,
  getStatusLabel,
  partnerCatalog,
  type PartnerEducationCard,
  type PartnerId,
} from "../lib/partnerCatalog";

type PartnerHubTabProps = {
  walletAddress?: string;
};

type StepKey = "read" | "risk" | "opened";

type PartnerProgress = {
  read?: boolean;
  risk?: boolean;
  opened?: boolean;
};

type ProgressStore = Record<string, PartnerProgress>;

type Metric = {
  label: string;
  value: string;
  text: string;
  icon: ElementType;
};

const categoryIcons: Record<string, ElementType> = {
  DeFi: Flame,
  Onramp: Wallet,
  Ecosystem: Compass,
  "Market Data": Layers,
  NFT: Sparkles,
  "Cross-chain": Link2,
  Service: MessageCircle,
};

function getStorageKey(walletAddress: string) {
  return `ott-partner-hub-progress-${walletAddress}`;
}

function loadProgress(walletAddress: string): ProgressStore {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const value = window.localStorage.getItem(getStorageKey(walletAddress));
    return value ? (JSON.parse(value) as ProgressStore) : {};
  } catch {
    return {};
  }
}

function saveProgress(walletAddress: string, progress: ProgressStore) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getStorageKey(walletAddress), JSON.stringify(progress));
}

function isComplete(progress: PartnerProgress | undefined) {
  return Boolean(progress?.read && progress.risk && progress.opened);
}

export function PartnerHubTab({ walletAddress = "guest" }: PartnerHubTabProps) {
  const [selectedId, setSelectedId] = useState<PartnerId>("anodos");
  const [progress, setProgress] = useState<ProgressStore>(() =>
    loadProgress(walletAddress)
  );

  const selectedPartner = useMemo(
    () => partnerCatalog.find((partner) => partner.id === selectedId) ?? partnerCatalog[0],
    [selectedId]
  );

  const completedRoutes = partnerCatalog.filter((partner) =>
    isComplete(progress[partner.id])
  ).length;

  const totalXpReady = partnerCatalog.reduce((total, partner) => {
    if (!isComplete(progress[partner.id])) {
      return total;
    }

    return total + getPartnerCompletionXp(partner);
  }, 0);

  const metrics: Metric[] = [
    {
      label: "SourceTag",
      value: String(PARTNER_SOURCE_TAG),
      text: "Make Waves stamp.",
      icon: Fingerprint,
    },
    {
      label: "Routes",
      value: String(partnerCatalog.length),
      text: "Education cards.",
      icon: Route,
    },
    {
      label: "Completed",
      value: String(completedRoutes),
      text: "Ready for proof.",
      icon: CheckCircle2,
    },
    {
      label: "XP Ready",
      value: String(totalXpReady),
      text: "After proof stamps.",
      icon: Trophy,
    },
  ];

  function updateStep(partnerId: PartnerId, step: StepKey, value: boolean) {
    const nextProgress: ProgressStore = {
      ...progress,
      [partnerId]: {
        ...progress[partnerId],
        [step]: value,
      },
    };

    setProgress(nextProgress);
    saveProgress(walletAddress, nextProgress);
  }

  function openOfficialLink(partner: PartnerEducationCard) {
    updateStep(partner.id, "opened", true);
    window.open(partner.officialUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 mb-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="flex items-center gap-2 mb-4 text-white/45">
              <GraduationCap size={18} />

              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                Partner Education Hub
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              Read First. Route Second. Stamp After.
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              Elke partner krijgt uitleg, risico-check en officiële link voordat
              de gebruiker het platform opent. SourceTag {PARTNER_SOURCE_TAG} is
              alleen voor betekenisvolle Proof Stamps, niet voor spammy clicks.
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
          <div className="border border-white/10 bg-white/[0.02] p-5">
            <div className="flex items-center gap-2 mb-5">
              <BookOpen size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Routes
              </p>
            </div>

            <div className="space-y-3">
              {partnerCatalog.map((partner) => (
                <PartnerButton
                  key={partner.id}
                  partner={partner}
                  selected={selectedPartner.id === partner.id}
                  completed={isComplete(progress[partner.id])}
                  onClick={() => setSelectedId(partner.id)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-5 space-y-4">
          <PartnerDetailCard
            partner={selectedPartner}
            progress={progress[selectedPartner.id]}
            onStepChange={(step, value) =>
              updateStep(selectedPartner.id, step, value)
            }
            onOpen={() => openOfficialLink(selectedPartner)}
          />
        </div>

        <div className="col-span-12 xl:col-span-3 space-y-4">
          <ProofStatusCard
            partner={selectedPartner}
            progress={progress[selectedPartner.id]}
          />

          <div className="border border-white/10 bg-white/[0.02] p-5">
            <div className="flex items-center gap-2 mb-5">
              <ShieldAlert size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Compliance Language
              </p>
            </div>

            <div className="space-y-3">
              <InfoLine text="Education-first, not broker-first." />
              <InfoLine text="Official provider handles the real service." />
              <InfoLine text="No custody, no yield promise, no trade execution." />
              <InfoLine text="XP is off-chain engagement until legal review." />
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-5">
            <div className="flex items-center gap-2 mb-5">
              <Lock size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Next Build
              </p>
            </div>

            <div className="space-y-3">
              <InfoLine text="Create Proof Stamp payload API." />
              <InfoLine text="Connect route completion to Xaman." />
              <InfoLine text="Verify tx hash with SourceTag 2606170002." />
              <InfoLine text="Credit Reward Ledger after verification." />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PartnerButton({
  partner,
  selected,
  completed,
  onClick,
}: {
  partner: PartnerEducationCard;
  selected: boolean;
  completed: boolean;
  onClick: () => void;
}) {
  const Icon = categoryIcons[partner.category] ?? Layers;

  return (
    <button
      onClick={onClick}
      className={`w-full border p-4 text-left transition-all ${
        selected
          ? "border-white/35 bg-white/[0.08]"
          : "border-white/10 bg-black hover:bg-white/[0.03]"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <Icon size={18} className="text-white/60" />

        {completed ? (
          <CheckCircle2 size={16} className="text-white/70" />
        ) : (
          <Circle size={16} className="text-white/20" />
        )}
      </div>

      <p className="font-orbitron text-xs font-black uppercase mb-2">
        {partner.name}
      </p>

      <p className="font-mono text-[10px] text-white/35 uppercase mb-3">
        {partner.label}
      </p>

      <div className="flex flex-wrap gap-2">
        <MiniPill text={partner.category} />
        <MiniPill text={partner.riskLevel} />
      </div>
    </button>
  );
}

function PartnerDetailCard({
  partner,
  progress,
  onStepChange,
  onOpen,
}: {
  partner: PartnerEducationCard;
  progress: PartnerProgress | undefined;
  onStepChange: (step: StepKey, value: boolean) => void;
  onOpen: () => void;
}) {
  return (
    <div className="border border-white/10 bg-white/[0.02] p-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/35 mb-3">
            {partner.category} • {getStatusLabel(partner.status)}
          </p>

          <h3 className="font-orbitron text-2xl font-black uppercase mb-3">
            {partner.name}
          </h3>

          <p className="font-mono text-sm text-white/50 leading-relaxed">
            {partner.headline}
          </p>
        </div>

        <div className="text-right">
          <p className="font-orbitron text-lg font-black">
            +{partner.xpReward}
          </p>

          <p className="font-mono text-[10px] text-white/35 uppercase">
            Learn XP
          </p>
        </div>
      </div>

      <div className="border border-white/10 bg-black p-5 mb-5">
        <p className="font-mono text-xs text-white/55 leading-relaxed">
          {partner.oneLine}
        </p>
      </div>

      <Section title="Why it matters" items={[partner.whyItMatters]} />
      <Section title="What it does" items={partner.whatItDoes} />
      <Section title="How to use" items={partner.howToUse} />

      <div className="border border-white/10 bg-black p-5 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={17} className="text-white/60" />

          <p className="font-orbitron text-xs font-bold uppercase">
            {getRiskLabel(partner.riskLevel)}
          </p>
        </div>

        <div className="space-y-3">
          {partner.riskNotes.map((note) => (
            <InfoLine key={note} text={note} />
          ))}
        </div>
      </div>

      <Section title="OTT Angle" items={partner.ottAngle} />

      <div className="border border-white/10 bg-black p-5 mb-5">
        <p className="font-orbitron text-xs font-bold uppercase mb-4">
          Completion Checklist
        </p>

        <div className="space-y-3">
          <CheckButton
            checked={Boolean(progress?.read)}
            title="I read this route"
            text="The user understands the basic partner route."
            onClick={() => onStepChange("read", !progress?.read)}
          />

          <CheckButton
            checked={Boolean(progress?.risk)}
            title="I understand the risk notes"
            text="The user confirms this is external and education-first."
            onClick={() => onStepChange("risk", !progress?.risk)}
          />

          <CheckButton
            checked={Boolean(progress?.opened)}
            title="Official link opened"
            text="The user has been routed to the official provider link."
            onClick={() => onStepChange("opened", !progress?.opened)}
          />
        </div>
      </div>

      <button
        onClick={onOpen}
        className="w-full bg-white text-black py-4 font-orbitron text-xs font-black uppercase tracking-widest hover:bg-white/80 transition-all flex items-center justify-center gap-2"
      >
        <ExternalLink size={16} />
        {partner.ctaLabel}
      </button>
    </div>
  );
}

function ProofStatusCard({
  partner,
  progress,
}: {
  partner: PartnerEducationCard;
  progress: PartnerProgress | undefined;
}) {
  const completed = isComplete(progress);

  return (
    <div className="border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-center gap-2 mb-5">
        <Fingerprint size={18} className="text-white/60" />

        <p className="font-orbitron text-xs uppercase tracking-widest">
          Proof Stamp
        </p>
      </div>

      <div className="space-y-3 mb-5">
        <MiniStatus label="Route" value={partner.name} />
        <MiniStatus label="Status" value={completed ? "Ready" : "Locked"} />
        <MiniStatus label="Proof XP" value={`+${partner.proofStampXp}`} />
        <MiniStatus label="SourceTag" value={String(PARTNER_SOURCE_TAG)} />
      </div>

      <div className="border border-white/10 bg-black p-4">
        <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
          Memo
        </p>

        <p className="font-mono text-xs text-white/55 break-all leading-relaxed">
          {partner.proofStampMemo}
        </p>
      </div>

      <button
        disabled
        className="w-full border border-white/10 bg-black p-4 mt-4 text-left opacity-45"
      >
        <div className="flex items-center gap-3">
          <Lock size={17} className="text-white/60" />

          <div>
            <p className="font-orbitron text-xs font-bold uppercase">
              Proof Stamp Build Next
            </p>

            <p className="font-mono text-[10px] text-white/35 uppercase">
              Xaman payload komt in volgende stap
            </p>
          </div>
        </div>
      </button>
    </div>
  );
}

function MetricBox({ metric }: { metric: Metric }) {
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

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mb-5">
      <p className="font-orbitron text-xs font-bold uppercase mb-3">{title}</p>

      <div className="space-y-2">
        {items.map((item) => (
          <InfoLine key={item} text={item} />
        ))}
      </div>
    </div>
  );
}

function CheckButton({
  checked,
  title,
  text,
  onClick,
}: {
  checked: boolean;
  title: string;
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full border p-4 text-left transition-all ${
        checked
          ? "border-white/30 bg-white/[0.08]"
          : "border-white/10 bg-black hover:bg-white/[0.03]"
      }`}
    >
      <div className="flex items-start gap-3">
        {checked ? (
          <CheckCircle2 size={17} className="text-white/70 mt-0.5" />
        ) : (
          <Circle size={17} className="text-white/25 mt-0.5" />
        )}

        <div>
          <p className="font-orbitron text-xs font-bold uppercase mb-2">
            {title}
          </p>

          <p className="font-mono text-[10px] text-white/40 leading-relaxed">
            {text}
          </p>
        </div>
      </div>
    </button>
  );
}

function InfoLine({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <ArrowUpRight size={13} className="text-white/35 mt-0.5 shrink-0" />

      <p className="font-mono text-xs text-white/45 leading-relaxed">{text}</p>
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

function MiniPill({ text }: { text: string }) {
  return (
    <span className="border border-white/10 px-2 py-1 font-mono text-[9px] text-white/35 uppercase">
      {text}
    </span>
  );
}
