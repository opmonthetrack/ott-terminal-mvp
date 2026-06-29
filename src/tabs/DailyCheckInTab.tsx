import { useEffect, useState } from "react";
import type { ElementType } from "react";
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  Clock,
  Coins,
  Copy,
  ExternalLink,
  Fingerprint,
  Gift,
  History,
  Loader2,
  Lock,
  QrCode,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Trophy,
  Wallet,
  Waves,
  Zap,
} from "lucide-react";
import {
  MAKE_WAVES_SOURCE_TAG,
  buildMakeWavesStatusLine,
} from "../lib/makeWaves";
import {
  createDailyCheckInPayload,
  getMakeWavesVerificationLabel,
  getXamanPayloadQr,
  getXamanPayloadUrl,
  getXamanPayloadUuid,
  isMakeWavesRewardAllowed,
  openXamanPayload,
  verifyMakeWavesPayload,
  type XamanCreatePayloadResponse,
  type XamanVerifyPayloadResponse,
} from "../lib/xamanClient";
import {
  addMainnetLockedEvent,
  addXpRewardEvent,
  loadRewardState,
  type RewardState,
} from "../lib/rewardStore";

type DailyCheckInTabProps = {
  walletAddress: string;
};

type Metric = {
  label: string;
  value: string;
  text: string;
  icon: ElementType;
};

type CheckInStep = {
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

const checkInSteps: CheckInStep[] = [
  {
    title: "Create Xaman Payload",
    status: "Step 1",
    text: "Maak een payment payload met Make Waves SourceTag.",
    icon: QrCode,
  },
  {
    title: "Sign In Xaman",
    status: "Step 2",
    text: "Open Xaman, scan/sign en kom terug naar de terminal.",
    icon: Wallet,
  },
  {
    title: "Verify Payload",
    status: "Step 3",
    text: "Controleer signed/resolved en SourceTag match.",
    icon: ShieldCheck,
  },
  {
    title: "Credit XP",
    status: "Step 4",
    text: "Bij geldige proof wordt XP lokaal toegevoegd.",
    icon: Trophy,
  },
  {
    title: "Lock Mainnet OTT",
    status: "Policy",
    text: "OTT mainnet token blijft locked achter legal gate.",
    icon: Lock,
  },
];

export function DailyCheckInTab({ walletAddress }: DailyCheckInTabProps) {
  const [destinationWallet, setDestinationWallet] = useState(walletAddress);
  const [payloadResponse, setPayloadResponse] =
    useState<XamanCreatePayloadResponse | null>(null);
  const [verifyResponse, setVerifyResponse] =
    useState<XamanVerifyPayloadResponse | null>(null);
  const [rewardState, setRewardState] = useState<RewardState>(() =>
    loadRewardState(walletAddress)
  );
  const [selectedStep, setSelectedStep] = useState<CheckInStep>(
    checkInSteps[0]
  );
  const [busy, setBusy] = useState(false);
  const [verifyBusy, setVerifyBusy] = useState(false);
  const [rewardedUuid, setRewardedUuid] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState(
    buildMakeWavesStatusLine("daily-checkin")
  );

  useEffect(() => {
    setRewardState(loadRewardState(walletAddress));
  }, [walletAddress]);

  const payloadUuid = getXamanPayloadUuid(payloadResponse);
  const payloadUrl = getXamanPayloadUrl(payloadResponse);
  const payloadQr = getXamanPayloadQr(payloadResponse);
  const rewardAllowed = isMakeWavesRewardAllowed(verifyResponse);
  const SelectedStepIcon = selectedStep.icon;

  const metrics: Metric[] = [
    {
      label: "SourceTag",
      value: String(MAKE_WAVES_SOURCE_TAG),
      text: "Make Waves tracking.",
      icon: Fingerprint,
    },
    {
      label: "Daily XP",
      value: "+10",
      text: "Off-chain terminal XP.",
      icon: Zap,
    },
    {
      label: "Total XP",
      value: String(rewardState.totalXp),
      text: "Local reward ledger.",
      icon: Trophy,
    },
    {
      label: "OTT Eligible",
      value: String(rewardState.ottTokenEligibleXp),
      text: "Legal-gated score.",
      icon: Coins,
    },
  ];

  async function handleCreatePayload() {
    const cleanDestination = destinationWallet.trim();

    if (!cleanDestination) {
      setStatusMessage("Vul eerst een destination wallet in.");
      return;
    }

    setBusy(true);
    setStatusMessage("Creating Xaman Daily Check-In payload...");

    try {
      const response = await createDailyCheckInPayload({
        userWallet: walletAddress,
        destinationWallet: cleanDestination,
      });

      setPayloadResponse(response);
      setVerifyResponse(null);
      setStatusMessage("Daily Check-In payload created. Open Xaman to sign.");
    } catch (error) {
      setStatusMessage(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function handleVerifyPayload() {
    if (!payloadUuid) {
      setStatusMessage("Maak eerst een Xaman payload aan.");
      return;
    }

    setVerifyBusy(true);
    setStatusMessage("Verifying Xaman payload...");

    try {
      const response = await verifyMakeWavesPayload(payloadUuid);
      setVerifyResponse(response);
      setStatusMessage(getMakeWavesVerificationLabel(response));

      if (isMakeWavesRewardAllowed(response) && rewardedUuid !== payloadUuid) {
        const nextRewardState = addXpRewardEvent({
          walletAddress,
          actionId: "daily-checkin",
          txHash: response.verified?.txHash,
          note: `Daily Check-In verified with SourceTag ${MAKE_WAVES_SOURCE_TAG}.`,
        });

        const lockedState = addMainnetLockedEvent({
          walletAddress,
          actionId: "ott-token-eligibility",
          txHash: response.verified?.txHash,
          note: "OTT mainnet token reward locked until legal review is complete.",
        });

        setRewardState({
          ...lockedState,
          totalXp: nextRewardState.totalXp,
          ottTokenEligibleXp: nextRewardState.ottTokenEligibleXp,
          events: lockedState.events,
        });
        setRewardedUuid(payloadUuid);
        setStatusMessage("Daily Check-In verified. XP credited. OTT mainnet reward locked.");
      }
    } catch (error) {
      setStatusMessage(getErrorMessage(error));
    } finally {
      setVerifyBusy(false);
    }
  }

  function handleOpenXaman() {
    const opened = openXamanPayload(payloadResponse);

    if (!opened) {
      setStatusMessage("Geen Xaman payload link gevonden.");
    }
  }

  async function copyUuid() {
    if (!payloadUuid) {
      return;
    }

    await navigator.clipboard.writeText(payloadUuid);
    setStatusMessage("Payload UUID copied.");
  }

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 mb-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="flex items-center gap-2 mb-4 text-white/45">
              <Activity size={17} />

              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                Daily Check-In
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              Sign. Verify. Earn XP.
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              Daily activity proof via Xaman. Bij een geldige payload met
              SourceTag {MAKE_WAVES_SOURCE_TAG} wordt XP lokaal opgeslagen en
              OTT token eligibility klaargezet achter legal gate.
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
              <Waves size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Check-In Steps
              </p>
            </div>

            <div className="space-y-3">
              {checkInSteps.map((step) => (
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

            <p className="font-orbitron text-xl font-black uppercase mb-2">
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
              <History size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Reward Snapshot
              </p>
            </div>

            <div className="space-y-3">
              <MiniStatus label="Total XP" value={String(rewardState.totalXp)} />
              <MiniStatus
                label="OTT Eligible XP"
                value={String(rewardState.ottTokenEligibleXp)}
              />
              <MiniStatus label="Events" value={String(rewardState.events.length)} />
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-5 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Wallet size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Create Payload
              </p>
            </div>

            <InputField
              label="User Wallet"
              value={walletAddress}
              readOnly
              onChange={() => undefined}
            />

            <div className="h-4" />

            <InputField
              label="Destination Wallet"
              value={destinationWallet}
              placeholder="r..."
              onChange={setDestinationWallet}
            />

            <button
              onClick={handleCreatePayload}
              disabled={busy}
              className="w-full bg-white text-black py-4 mt-5 font-orbitron text-xs font-black uppercase tracking-widest hover:bg-white/80 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : <QrCode size={16} />}
              Create Xaman Check-In
            </button>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <QrCode size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Xaman Payload
              </p>
            </div>

            {payloadResponse ? (
              <div className="space-y-4">
                {payloadQr && (
                  <div className="border border-white/10 bg-white p-4 inline-block">
                    <img src={payloadQr} alt="Xaman QR" className="w-40 h-40" />
                  </div>
                )}

                <MiniStatus label="Payload UUID" value={payloadUuid ?? "None"} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <ActionButton
                    icon={ExternalLink}
                    title="Open Xaman"
                    text={payloadUrl ? "Launch payload" : "No link"}
                    onClick={handleOpenXaman}
                  />

                  <ActionButton
                    icon={Copy}
                    title="Copy UUID"
                    text="For verification"
                    onClick={copyUuid}
                  />
                </div>
              </div>
            ) : (
              <EmptyState text="Maak eerst een Xaman Daily Check-In payload." />
            )}
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <ShieldCheck size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Verify + Credit XP
              </p>
            </div>

            <div className="border border-white/10 bg-black p-5 mb-4">
              <p className="font-mono text-xs text-white/50 leading-relaxed">
                {statusMessage}
              </p>
            </div>

            <button
              onClick={handleVerifyPayload}
              disabled={verifyBusy || !payloadUuid}
              className="w-full bg-white text-black py-4 font-orbitron text-xs font-black uppercase tracking-widest hover:bg-white/80 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
            >
              {verifyBusy ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              Verify Payload + Add XP
            </button>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-3 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <BadgeCheck size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Verification Result
              </p>
            </div>

            {verifyResponse?.verified ? (
              <div className="space-y-3">
                <MiniStatus label="Signed" value={String(verifyResponse.verified.signed)} />
                <MiniStatus label="Resolved" value={String(verifyResponse.verified.resolved)} />
                <MiniStatus label="SourceTag" value={String(verifyResponse.verified.sourceTag)} />
                <MiniStatus label="Reward" value={rewardAllowed ? "Allowed" : "Locked"} />
              </div>
            ) : (
              <EmptyState text="Nog geen verified payload." />
            )}
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Lock size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                OTT Token Guard
              </p>
            </div>

            <div className="border border-white/10 bg-black p-5">
              <p className="font-orbitron text-2xl font-black uppercase mb-2">
                Locked
              </p>

              <p className="font-mono text-xs text-white/40 leading-relaxed">
                Mainnet OTT token airdrops blijven uit tot legal review klaar is.
                XP en eligibility mogen wel lokaal getoond worden.
              </p>
            </div>
          </div>
        </div>

        <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <FeatureBox icon={Zap} title="XP" text="Credited after verify" />
          <FeatureBox icon={Coins} title="OTT" text="Eligibility only" />
          <FeatureBox icon={Fingerprint} title="Tag" text={`${MAKE_WAVES_SOURCE_TAG}`} />
          <FeatureBox icon={AlertTriangle} title="Mainnet" text="Legal gate" />
        </div>
      </div>
    </div>
  );
}

function getErrorMessage(error: unknown) {
  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object" && "error" in error) {
    const apiError = error as { error?: unknown };

    if (typeof apiError.error === "string") {
      return apiError.error;
    }
  }

  return "Unknown Daily Check-In error.";
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

function StepButton({
  step,
  active,
  onClick,
}: {
  step: CheckInStep;
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

function InputField({
  label,
  value,
  placeholder,
  readOnly,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  readOnly?: boolean;
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
        readOnly={readOnly}
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

function EmptyState({ text }: { text: string }) {
  return (
    <div className="border border-white/10 bg-black p-4">
      <p className="font-mono text-xs text-white/35 leading-relaxed">{text}</p>
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
