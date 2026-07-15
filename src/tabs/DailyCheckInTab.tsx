import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Fingerprint,
  Gift,
  Loader2,
  QrCode,
  Radio,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import {
  MAKE_WAVES_ACTIONS,
  MAKE_WAVES_SOURCE_TAG,
  type MakeWavesActionId,
} from "../lib/makeWaves";
import {
  createMakeWavesPayload,
  getMakeWavesVerificationLabel,
  getXamanPayloadQr,
  isMakeWavesRewardAllowed,
  getXamanPayloadUrl,
  getXamanPayloadUuid,
  openXamanPayload,
  verifyMakeWavesPayload,
  type XamanPayloadResponse,
  type XamanPayloadVerificationResponse,
} from "../lib/xamanClient";
import {
  addMainnetLockedEvent,
  addXpRewardEvent,
  getOttCreditsForAction,
  loadRewardState,
  type RewardState,
} from "../lib/rewardStore";

type DailyCheckInTabProps = {
  walletAddress: string;
};

export function DailyCheckInTab({ walletAddress }: DailyCheckInTabProps) {
  const [selectedActionId, setSelectedActionId] =
    useState<MakeWavesActionId>("daily-checkin");
  const [payload, setPayload] = useState<XamanPayloadResponse | null>(null);
  const [verification, setVerification] =
    useState<XamanPayloadVerificationResponse | null>(null);
  const [rewardState, setRewardState] = useState<RewardState>(() =>
    loadRewardState(walletAddress)
  );
  const [busy, setBusy] = useState(false);
  const [verifyBusy, setVerifyBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Create, sign and validate a Mainnet proof to earn XP with SourceTag 2606170002."
  );

  const selectedAction = useMemo(
    () =>
      MAKE_WAVES_ACTIONS.find((action) => action.id === selectedActionId) ??
      MAKE_WAVES_ACTIONS[0],
    [selectedActionId]
  );

  const payloadUuid = getXamanPayloadUuid(payload);
  const payloadUrl = getXamanPayloadUrl(payload);
  const payloadQr = getXamanPayloadQr(payload);
  const selectedOttCredits = getOttCreditsForAction(selectedActionId);

  useEffect(() => {
    setRewardState(loadRewardState(walletAddress));
    setPayload(null);
    setVerification(null);
  }, [walletAddress]);

  async function createPayload() {
    if (!walletAddress || walletAddress === "guest") {
      setStatusMessage("Connect eerst met Xaman voordat je een reward-actie start.");
      return;
    }

    setBusy(true);
    setVerification(null);
    setStatusMessage("Creating Xaman Make Waves payload...");

    try {
      const response = await createMakeWavesPayload({
        actionId: selectedActionId,
        walletAddress,
      });

      setPayload(response);
      setStatusMessage(
        `Payload ready for ${selectedAction.title} with SourceTag ${MAKE_WAVES_SOURCE_TAG}.`
      );
    } catch (error) {
      setStatusMessage(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function verifyPayload() {
    const uuid = payloadUuid;

    if (!walletAddress || walletAddress === "guest") {
      setStatusMessage("Connect eerst met Xaman voordat je een reward verifieert.");
      return;
    }

    if (!uuid) {
      setStatusMessage("Geen Xaman payload UUID gevonden.");
      return;
    }

    setVerifyBusy(true);
    setStatusMessage("Verifying Xaman payload...");

    try {
      const response = await verifyMakeWavesPayload(
        uuid,
        selectedActionId,
        walletAddress
      );
      setVerification(response);

      if (isMakeWavesRewardAllowed(response, selectedActionId)) {
        const beforeReward = loadRewardState(walletAddress);

        const xpState = addXpRewardEvent({
          walletAddress,
          actionId: selectedActionId,
          txHash: response.verified?.txid,
          note: `${selectedAction.title} validated on XRPL Mainnet with SourceTag ${MAKE_WAVES_SOURCE_TAG}.`,
        });

        const finalState = addMainnetLockedEvent({
          walletAddress,
          actionId: selectedActionId,
          txHash: response.verified?.txid,
          note: "Future on-chain OTT token conversion stays disabled until utility, profitability and legal review are complete.",
        });

        const rewardWasAdded =
          xpState.totalXp > beforeReward.totalXp ||
          xpState.ottCredits > beforeReward.ottCredits;

        setRewardState(finalState);

        setStatusMessage(
          rewardWasAdded
            ? `${getMakeWavesVerificationLabel(response)}. Reward Ledger credited +${selectedAction.xp} XP and +${selectedOttCredits} OTT Credits.`
            : `${getMakeWavesVerificationLabel(response)}. This transaction was already processed; no duplicate reward was added.`
        );
        return;
      }

      setStatusMessage(getMakeWavesVerificationLabel(response));
    } catch (error) {
      setStatusMessage(getErrorMessage(error));
    } finally {
      setVerifyBusy(false);
    }
  }

  function openPayload() {
    const opened = openXamanPayload(payload);

    if (!opened) {
      setStatusMessage("Geen Xaman payload link gevonden.");
    }
  }

  async function copyUuid() {
    if (!payloadUuid) {
      setStatusMessage("Geen payload UUID om te kopiëren.");
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
              <Radio size={18} />

              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                Daily Check-In
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              Make Waves XP Check-In
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              Maak een Xaman payload, sign met wallet, verifieer de payload en
              verifieer daarna de Mainnet-transactie en credit pas dan XP in de Reward Ledger. Alles draait rond SourceTag{" "}
              {MAKE_WAVES_SOURCE_TAG}.
            </p>
          </div>

          <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-3">
            <MetricBox
              label="SourceTag"
              value={String(MAKE_WAVES_SOURCE_TAG)}
              text="Hackathon proof"
              icon={<Fingerprint size={18} />}
            />

            <MetricBox
              label="Selected XP"
              value={`+${selectedAction.xp}`}
              text={selectedAction.title}
              icon={<Gift size={18} />}
            />

            <MetricBox
              label="Total XP"
              value={String(rewardState.totalXp)}
              text="Local ledger"
              icon={<Trophy size={18} />}
            />

            <MetricBox
              label="OTT Credits"
              value={String(rewardState.ottCredits)}
              text="Internal utility"
              icon={<ShieldCheck size={18} />}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <p className="font-orbitron text-xs uppercase tracking-widest mb-5">
              Choose Action
            </p>

            <div className="space-y-3">
              {MAKE_WAVES_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  onClick={() => {
                    setSelectedActionId(action.id);
                    setPayload(null);
                    setVerification(null);
                  }}
                  className={`w-full border p-4 text-left transition-all ${
                    selectedActionId === action.id
                      ? "border-white/30 bg-white/[0.08]"
                      : "border-white/10 bg-black hover:bg-white/[0.03]"
                  }`}
                >
                  <p className="font-orbitron text-xs font-bold uppercase mb-2">
                    {action.title}
                  </p>

                  <p className="font-mono text-[10px] text-white/35 uppercase">
                    +{action.xp} XP • +{getOttCreditsForAction(action.id)} OTT • SourceTag {MAKE_WAVES_SOURCE_TAG}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-5 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <p className="font-orbitron text-xs uppercase tracking-widest mb-5">
              Xaman Payload
            </p>

            <button
              onClick={createPayload}
              disabled={busy}
              className="w-full bg-white text-black py-4 font-orbitron text-xs font-black uppercase tracking-widest hover:bg-white/80 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : <QrCode size={16} />}
              Create Xaman Payload
            </button>

            {payloadUuid && (
              <div className="space-y-4 mt-5">
                {payloadQr && (
                  <div className="border border-white/10 bg-white p-4 inline-block">
                    <img src={payloadQr} alt="Xaman QR" className="w-40 h-40" />
                  </div>
                )}

                <MiniStatus label="Payload UUID" value={payloadUuid} />
                <MiniStatus label="Payload URL" value={payloadUrl ?? "None"} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <ActionButton
                    icon={<ExternalLink size={18} />}
                    title="Open Xaman"
                    text="Launch payload"
                    onClick={openPayload}
                  />

                  <ActionButton
                    icon={<Copy size={18} />}
                    title="Copy UUID"
                    text="For verification"
                    onClick={copyUuid}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <p className="font-orbitron text-xs uppercase tracking-widest mb-5">
              Verify + Credit Rewards
            </p>

            <button
              onClick={verifyPayload}
              disabled={verifyBusy || !payloadUuid}
              className="w-full border border-white/10 bg-black p-4 text-left hover:bg-white/[0.03] disabled:opacity-40 transition-all"
            >
              <div className="flex items-center gap-3">
                {verifyBusy ? (
                  <Loader2 size={18} className="text-white/60 animate-spin" />
                ) : (
                  <CheckCircle2 size={18} className="text-white/60" />
                )}

                <div>
                  <p className="font-orbitron text-xs font-bold uppercase">
                    Verify Signed Payload
                  </p>

                  <p className="font-mono text-[10px] text-white/35 uppercase">
                    Validated Mainnet transaction credits XP + OTT Credits
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-3 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <p className="font-orbitron text-xs uppercase tracking-widest mb-5">
              Status
            </p>

            <div className="border border-white/10 bg-black p-4">
              <p className="font-mono text-xs text-white/45 leading-relaxed">
                {statusMessage}
              </p>
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <p className="font-orbitron text-xs uppercase tracking-widest mb-5">
              Verification
            </p>

            {verification?.verified ? (
              <div className="space-y-3">
                <MiniStatus
                  label="Mainnet verified"
                  value={verification.verified.makeWavesVerified ? "Yes" : "No"}
                />
                <MiniStatus
                  label="Ledger status"
                  value={verification.verified.ledgerStatus}
                />
                <MiniStatus
                  label="Result"
                  value={verification.verified.transactionResult ?? "Pending"}
                />
                <MiniStatus
                  label="Account"
                  value={verification.verified.account ?? "None"}
                />
                <MiniStatus
                  label="Txid"
                  value={verification.verified.txid ?? "None"}
                />
              </div>
            ) : (
              <MiniStatus label="Result" value="Not verified yet" />
            )}
          </div>
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

function MetricBox({
  label,
  value,
  text,
  icon,
}: {
  label: string;
  value: string;
  text: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="border border-white/10 bg-black/60 p-4">
      <div className="text-white/60 mb-3">{icon}</div>

      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
        {label}
      </p>

      <p className="font-orbitron text-sm font-black uppercase mb-1 break-all">
        {value}
      </p>

      <p className="font-mono text-[10px] text-white/30 uppercase">{text}</p>
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

function ActionButton({
  icon,
  title,
  text,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="border border-white/10 bg-black p-4 text-left hover:bg-white/[0.03] transition-all"
    >
      <div className="text-white/60 mb-3">{icon}</div>

      <p className="font-orbitron text-xs font-bold uppercase mb-2">{title}</p>

      <p className="font-mono text-[10px] text-white/35 uppercase">{text}</p>
    </button>
  );
}
