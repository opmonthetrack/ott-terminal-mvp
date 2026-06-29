import { useState } from "react";
import type { ElementType } from "react";
import {
  Activity,
  BadgeCheck,
  CalendarCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Fingerprint,
  Flame,
  Loader2,
  Lock,
  QrCode,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Wallet,
  Waves,
  Zap,
} from "lucide-react";
import {
  MAKE_WAVES_SOURCE_TAG,
  buildMakeWavesStatusLine,
  getMakeWavesSourceTagLabel,
} from "../lib/makeWaves";
import {
  createDailyCheckInPayload,
  getMakeWavesVerificationLabel,
  getXamanPayloadQr,
  getXamanPayloadUrl,
  isMakeWavesRewardAllowed,
  openXamanPayload,
  verifyMakeWavesPayload,
  type XamanCreatePayloadResponse,
  type XamanVerifyPayloadResponse,
} from "../lib/xamanClient";

type DailyCheckInTabProps = {
  walletAddress: string;
};

type CheckInStep = {
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

type RewardItem = {
  title: string;
  value: string;
  text: string;
  icon: ElementType;
};

const checkInSteps: CheckInStep[] = [
  {
    title: "Start Check-In",
    status: "Step 1",
    text: "Gebruiker start de dagelijkse Make Waves check-in vanuit de terminal.",
    icon: CalendarCheck,
  },
  {
    title: "Create Xaman Payload",
    status: "Step 2",
    text: "Backend maakt een payload met SourceTag 2606170002.",
    icon: QrCode,
  },
  {
    title: "User Signs In Xaman",
    status: "Step 3",
    text: "Gebruiker bevestigt bewust in Xaman. Geen seed phrase, geen private key.",
    icon: Wallet,
  },
  {
    title: "Verify And Reward",
    status: "Step 4",
    text: "Pas na signed + resolved + juiste SourceTag telt XP.",
    icon: BadgeCheck,
  },
];

const rewards: RewardItem[] = [
  {
    title: "Daily XP",
    value: "+10",
    text: "Wordt pas actief na correcte Xaman verification.",
    icon: Zap,
  },
  {
    title: "Streak",
    value: "Live",
    text: "Streak groeit door dagelijkse terugkeer.",
    icon: Flame,
  },
  {
    title: "SourceTag",
    value: getMakeWavesSourceTagLabel(),
    text: "Vaste Make Waves tracking tag.",
    icon: Fingerprint,
  },
  {
    title: "Proof",
    value: "Ledger",
    text: "Proof wordt later gekoppeld aan tx hash.",
    icon: ShieldCheck,
  },
];

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

  return "Unknown check-in error.";
}

export function DailyCheckInTab({ walletAddress }: DailyCheckInTabProps) {
  const [selectedStep, setSelectedStep] = useState<CheckInStep>(checkInSteps[0]);
  const [destinationWallet, setDestinationWallet] = useState("");
  const [payloadUuid, setPayloadUuid] = useState("");
  const [createResponse, setCreateResponse] =
    useState<XamanCreatePayloadResponse | null>(null);
  const [verifyResponse, setVerifyResponse] =
    useState<XamanVerifyPayloadResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    buildMakeWavesStatusLine("daily-checkin")
  );

  const SelectedStepIcon = selectedStep.icon;
  const qrUrl = getXamanPayloadQr(createResponse);
  const payloadUrl = getXamanPayloadUrl(createResponse);
  const rewardAllowed = isMakeWavesRewardAllowed(verifyResponse);

  async function handleCreateCheckIn() {
    if (!destinationWallet.trim()) {
      setStatusMessage("Vul eerst je OTT destination wallet in.");
      return;
    }

    setBusy(true);
    setVerifyResponse(null);
    setStatusMessage("Creating Daily Check-In payload...");

    try {
      const response = await createDailyCheckInPayload({
        userWallet: walletAddress.startsWith("r") ? walletAddress : undefined,
        destinationWallet: destinationWallet.trim(),
        amountDrops: "1000000",
      });

      setCreateResponse(response);
      setPayloadUuid(response.payload?.uuid ?? "");
      setStatusMessage(`Payload ready with SourceTag ${MAKE_WAVES_SOURCE_TAG}.`);
    } catch (error) {
      setStatusMessage(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function handleVerifyCheckIn() {
    const cleanUuid = payloadUuid.trim();

    if (!cleanUuid) {
      setStatusMessage("Geen payload UUID om te verifyen.");
      return;
    }

    setBusy(true);
    setStatusMessage("Verifying Daily Check-In...");

    try {
      const response = await verifyMakeWavesPayload(cleanUuid);
      setVerifyResponse(response);
      setStatusMessage(getMakeWavesVerificationLabel(response));
    } catch (error) {
      setStatusMessage(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 mb-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="flex items-center gap-2 mb-4 text-white/45">
              <Waves size={17} />

              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                Make Waves Daily Check-In
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              Daily Activity With SourceTag Proof
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              Deze check-in flow maakt een Xaman payload met jouw vaste Make
              Waves SourceTag {MAKE_WAVES_SOURCE_TAG}. XP telt pas na correcte
              verification.
            </p>
          </div>

          <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-3">
            {rewards.map((reward) => (
              <RewardBox key={reward.title} reward={reward} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-4 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Target size={18} className="text-white/60" />

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
              <Lock size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Safety Rule
              </p>
            </div>

            <p className="font-mono text-xs text-white/45 leading-relaxed">
              No seed phrase. No private keys. User confirmation in Xaman first.
              Reward only after SourceTag {MAKE_WAVES_SOURCE_TAG} verification.
            </p>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-5 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Wallet size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Create Daily Payload
              </p>
            </div>

            <InputField
              label="Connected Wallet"
              value={walletAddress}
              placeholder="debug or r..."
              disabled
              onChange={() => undefined}
            />

            <div className="mt-4">
              <InputField
                label="OTT Destination Wallet Required"
                value={destinationWallet}
                placeholder="r..."
                onChange={setDestinationWallet}
              />
            </div>

            <button
              onClick={handleCreateCheckIn}
              disabled={busy}
              className="w-full bg-white text-black py-4 mt-5 font-orbitron text-xs font-black uppercase tracking-widest hover:bg-white/80 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
              Create Check-In Payload
            </button>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <QrCode size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Xaman QR / Link
              </p>
            </div>

            {qrUrl ? (
              <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-4 items-center">
                <img
                  src={qrUrl}
                  alt="Daily Check-In Xaman QR"
                  className="w-32 h-32 bg-white p-2"
                />

                <div>
                  <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
                    Payload URL
                  </p>

                  <p className="font-mono text-xs text-white/45 break-all mb-4">
                    {payloadUrl}
                  </p>

                  <button
                    onClick={() => openXamanPayload(createResponse)}
                    className="border border-white/15 px-4 py-3 font-orbitron text-xs font-black uppercase tracking-widest text-white/70 hover:bg-white/[0.03] transition-all flex items-center gap-2"
                  >
                    <ExternalLink size={15} />
                    Open Xaman
                  </button>
                </div>
              </div>
            ) : (
              <EmptyState text="Maak eerst een Daily Check-In payload." />
            )}
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <CheckCircle2 size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Verify Check-In
              </p>
            </div>

            <InputField
              label="Payload UUID"
              value={payloadUuid}
              placeholder="uuid from Xaman"
              onChange={setPayloadUuid}
            />

            <button
              onClick={handleVerifyCheckIn}
              disabled={busy}
              className="w-full border border-white/15 py-4 mt-4 font-orbitron text-xs font-black uppercase tracking-widest text-white/70 hover:bg-white/[0.03] disabled:opacity-40 transition-all flex items-center justify-center gap-2"
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : <BadgeCheck size={16} />}
              Verify And Unlock XP
            </button>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-3 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Status
              </p>
            </div>

            <div className="border border-white/10 bg-black p-4 mb-3">
              <p className="font-mono text-xs text-white/50 leading-relaxed">
                {statusMessage}
              </p>
            </div>

            <MiniStatus label="Reward Allowed" value={rewardAllowed ? "Yes" : "No"} />
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Trophy size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Verification
              </p>
            </div>

            {verifyResponse?.verified ? (
              <div className="space-y-3">
                <ResultLine label="Signed" value={String(verifyResponse.verified.signed)} />
                <ResultLine label="Resolved" value={String(verifyResponse.verified.resolved)} />
                <ResultLine label="SourceTag" value={String(verifyResponse.verified.sourceTag)} />
                <ResultLine label="XP" value={String(verifyResponse.verified.xp ?? 0)} />
              </div>
            ) : (
              <EmptyState text="Nog geen verified check-in." />
            )}
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Clock size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Daily Rules
              </p>
            </div>

            <div className="space-y-3">
              <RuleLine label="One check-in per day later" />
              <RuleLine label="XP only after verification" />
              <RuleLine label="SourceTag must match" />
              <RuleLine label="Ledger proof before badge" />
            </div>
          </div>
        </div>

        <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <FeatureBox icon={Activity} title="Daily Loop" text="Return every day" />
          <FeatureBox icon={FingerPrintIcon} title="SourceTag" text={`${MAKE_WAVES_SOURCE_TAG}`} />
          <FeatureBox icon={Flame} title="Streak" text="Retention layer" />
          <FeatureBox icon={ShieldCheck} title="Safety" text="Verify first" />
        </div>
      </div>
    </div>
  );
}

const FingerPrintIcon = Fingerprint;

function RewardBox({ reward }: { reward: RewardItem }) {
  const Icon = reward.icon;

  return (
    <div className="border border-white/10 bg-black/60 p-4">
      <Icon size={18} className="text-white/60 mb-3" />

      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
        {reward.title}
      </p>

      <p className="font-orbitron text-sm font-black uppercase mb-1 break-all">
        {reward.value}
      </p>

      <p className="font-mono text-[10px] text-white/30 uppercase">
        {reward.text}
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
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  disabled?: boolean;
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
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-black border border-white/10 px-4 py-4 font-mono text-xs text-white/70 outline-none focus:border-white/30 placeholder:text-white/20 disabled:text-white/30"
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

      <p className="font-orbitron text-sm font-black uppercase">{value}</p>
    </div>
  );
}

function ResultLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/10 bg-black p-3">
      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-1">
        {label}
      </p>

      <p className="font-mono text-[10px] text-white/55 break-all">{value}</p>
    </div>
  );
}

function RuleLine({ label }: { label: string }) {
  return (
    <div className="border border-white/10 bg-black p-3 flex items-center gap-2">
      <CheckCircle2 size={14} className="text-white/60" />

      <p className="font-mono text-xs text-white/50">{label}</p>
    </div>
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
