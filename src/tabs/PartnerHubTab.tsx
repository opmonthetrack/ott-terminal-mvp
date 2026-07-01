import { useMemo, useState } from "react";
import type { ElementType } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Circle,
  Compass,
  Copy,
  ExternalLink,
  Fingerprint,
  Flame,
  GraduationCap,
  Layers,
  Link2,
  Loader2,
  Lock,
  MessageCircle,
  QrCode,
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
import {
  createProofStampPayload,
  getProofStampErrorMessage,
  getProofStampPayloadQr,
  getProofStampPayloadUrl,
  getProofStampPayloadUuid,
  getProofStampStatusLabel,
  openProofStampPayload,
  type ProofStampPayloadResponse,
} from "../lib/proofStampClient";

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
  const [proofDestinationWallet, setProofDestinationWallet] = useState("");
  const [proofPayload, setProofPayload] =
    useState<ProofStampPayloadResponse | null>(null);
  const [proofBusy, setProofBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Complete a partner route to unlock the Proof Stamp payload."
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

  function selectPartner(partnerId: PartnerId) {
    setSelectedId(partnerId);
    setProofPayload(null);
    setStatusMessage("Complete this route to unlock the Proof Stamp payload.");
  }

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

  async function createProofStamp(partner: PartnerEducationCard) {
    if (!isComplete(progress[partner.id])) {
      setStatusMessage("Proof Stamp blijft locked tot lezen, risico-check en officiële link klaar zijn.");
      return;
    }

    setProofBusy(true);
    setStatusMessage("Creating Partner Proof Stamp payload...");

    try {
      const response = await createProofStampPayload({
        walletAddress: walletAddress === "guest" ? undefined : walletAddress,
        destinationWallet: proofDestinationWallet.trim() || undefined,
        partnerId: partner.id,
        routeName: partner.name,
        amountDrops: "1",
      });

      setProofPayload(response);
      setStatusMessage(getProofStampStatusLabel(response));
    } catch (error) {
      setStatusMessage(getProofStampErrorMessage(error));
    } finally {
      setProofBusy(false);
    }
  }

  async function copyProofStampUuid() {
    const uuid = getProofStampPayloadUuid(proofPayload);

    if (!uuid) {
      setStatusMessage("Geen Proof Stamp UUID gevonden.");
      return;
    }

    await navigator.clipboard.writeText(uuid);
    setStatusMessage("Proof Stamp UUID copied.");
  }

  function openProofStamp() {
    const opened = openProofStampPayload(proofPayload);

    if (!opened) {
      setStatusMessage("Geen Proof Stamp payload link gevonden.");
    }
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
                  onClick={() => selectPartner(partner.id)}
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
            destinationWallet={proofDestinationWallet}
            payload={proofPayload}
            busy={proofBusy}
            statusMessage={statusMessage}
            onDestinationChange={setProofDestinationWallet}
            onCreate={() => createProofStamp(selectedPartner)}
            onOpen={openProofStamp}
            onCopy={copyProofStampUuid}
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
              <InfoLine text="Verify Proof Stamp tx hash." />
              <InfoLine text="Credit Reward Ledger after verification." />
              <InfoLine text="Add Truth Desk service payments." />
              <InfoLine text="Polish XRPL Foundation pitch flow." />
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
  destinationWallet,
  payload,
  busy,
  statusMessage,
  onDestinationChange,
  onCreate,
  onOpen,
  onCopy,
}: {
  partner: PartnerEducationCard;
  progress: PartnerProgress | undefined;
  destinationWallet: string;
  payload: ProofStampPayloadResponse | null;
  busy: boolean;
  statusMessage: string;
  onDestinationChange: (value: string) => void;
  onCreate: () => void;
  onOpen: () => void;
  onCopy: () => void;
}) {
  const completed = isComplete(progress);
  const uuid = getProofStampPayloadUuid(payload);
  const url = getProofStampPayloadUrl(payload);
  const qr = getProofStampPayloadQr(payload);

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

      <InputField
        label="Destination Wallet"
        value={destinationWallet}
        placeholder="Optional if Vercel env is set"
        onChange={onDestinationChange}
      />

      <div className="border border-white/10 bg-black p-4 my-4">
        <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
          Memo
        </p>

        <p className="font-mono text-xs text-white/55 break-all leading-relaxed">
          {partner.proofStampMemo}
        </p>
      </div>

      <button
        onClick={onCreate}
        disabled={!completed || busy}
        className="w-full bg-white text-black py-4 font-orbitron text-xs font-black uppercase tracking-widest hover:bg-white/80 disabled:opacity-40 transition-all flex items-center justify-center gap-2 mb-4"
      >
        {busy ? <Loader2 size={16} className="animate-spin" /> : <QrCode size={16} />}
        Create Proof Stamp
      </button>

      {uuid && (
        <div className="space-y-4">
          {qr && (
            <div className="border border-white/10 bg-white p-4 inline-block">
              <img src={qr} alt="Proof Stamp QR" className="w-36 h-36" />
            </div>
          )}

          <MiniStatus label="Payload UUID" value={uuid} />

          <div className="grid grid-cols-1 gap-3">
            <ActionButton
              icon={ExternalLink}
              title="Open Xaman"
              text={url ? "Launch proof payload" : "No link"}
              onClick={onOpen}
            />

            <ActionButton
              icon={Copy}
              title="Copy UUID"
              text="For payload tracking"
              onClick={onCopy}
            />
          </div>
        </div>
      )}

      <div className="border border-white/10 bg-black p-4 mt-4">
        <p className="font-mono text-xs text-white/45 leading-relaxed">
          {statusMessage}
        </p>
      </div>
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

function ActionButton({
  icon: Icon,
  title,
  text,
  onClick,
}: {
  icon: ElementType;
  title: string;
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="border border-white/10 bg-black p-4 text-left hover:bg-white/[0.03] transition-all"
    >
      <Icon size={18} className="text-white/60 mb-3" />

      <p className="font-orbitron text-xs font-bold uppercase mb-2">{title}</p>

      <p className="font-mono text-[10px] text-white/35 uppercase">{text}</p>
    </button>
  );
}

function InputField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
        {label}
      </p>

      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-black border border-white/10 px-4 py-4 font-mono text-xs text-white/70 outline-none focus:border-white/30 placeholder:text-white/20"
      />
    </label>
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
