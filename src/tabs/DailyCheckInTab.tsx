import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  ExternalLink,
  Fingerprint,
  Gift,
  Info,
  Loader2,
  QrCode,
  Radio,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Trophy,
  Wallet,
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
    loadRewardState(walletAddress),
  );
  const [busy, setBusy] = useState(false);
  const [verifyBusy, setVerifyBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Connect Xaman, create a Make Waves proof payload, sign it, verify it and credit XP only after Mainnet validation.",
  );

  const selectedAction = useMemo(
    () =>
      MAKE_WAVES_ACTIONS.find((action) => action.id === selectedActionId) ??
      MAKE_WAVES_ACTIONS[0],
    [selectedActionId],
  );

  const payloadUuid = getXamanPayloadUuid(payload);
  const payloadUrl = getXamanPayloadUrl(payload);
  const payloadQr = getXamanPayloadQr(payload);
  const selectedOttCredits = getOttCreditsForAction(selectedActionId);
  const isGuest = !walletAddress || walletAddress === "guest";

  useEffect(() => {
    setRewardState(loadRewardState(walletAddress));
    setPayload(null);
    setVerification(null);
    setStatusMessage(
      walletAddress === "guest"
        ? "Connect Xaman first. Daily proof actions only work with a connected wallet."
        : "Wallet loaded. Choose a proof action, create a Xaman payload and verify after signing.",
    );
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
        `Payload ready for ${selectedAction.title} with SourceTag ${MAKE_WAVES_SOURCE_TAG}.`,
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
        walletAddress,
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
            : `${getMakeWavesVerificationLabel(response)}. This transaction was already processed; no duplicate reward was added.`,
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
    <div className="min-h-screen bg-white text-[#080808]">
      <section className="relative overflow-hidden border-b border-black/10 bg-[radial-gradient(circle_at_18%_18%,rgba(56,152,232,0.16),transparent_28%),radial-gradient(circle_at_82%_8%,rgba(200,56,136,0.16),transparent_28%),radial-gradient(circle_at_85%_82%,rgba(216,72,88,0.12),transparent_30%),#ffffff]">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.24),#ffffff_92%)]" />

        <div className="relative z-10 p-4 md:p-6 xl:p-10">
          <div className="grid grid-cols-12 gap-6 items-center">
            <div className="col-span-12 xl:col-span-8">
              <div className="inline-flex items-center gap-2 border border-black/10 bg-white/80 shadow-sm px-4 py-2 mb-6">
                <Radio size={15} className="text-[#C83888]" />

                <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/55">
                  Make Waves Mainnet Proof
                </p>
              </div>

              <h1 className="font-orbitron text-4xl md:text-5xl xl:text-6xl font-black uppercase leading-none tracking-tight mb-6">
                Daily
                <br />
                <span className="bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] bg-clip-text text-transparent">
                  Proof Check-In
                </span>
              </h1>

              <p className="font-mono text-sm xl:text-base text-black/60 max-w-3xl leading-relaxed mb-8">
                This is the clean Make Waves demo action: connect Xaman, create a SourceTag payload,
                sign with self-custody, verify the Mainnet result, then credit XP and OTT Credits
                only after proof is validated.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 max-w-5xl">
                <FlowStep number="01" title="Connect" text="Xaman wallet" />
                <FlowStep number="02" title="Sign" text="Payload" />
                <FlowStep number="03" title="Verify" text="Mainnet proof" />
                <FlowStep number="04" title="Credit" text="XP + OTT Credits" />
              </div>
            </div>

            <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-3">
              <MetricBox
                label="SourceTag"
                value={String(MAKE_WAVES_SOURCE_TAG)}
                text="Make Waves identity"
                icon={<Fingerprint size={18} />}
              />

              <MetricBox
                label="Selected"
                value={`+${selectedAction.xp} XP`}
                text={`+${selectedOttCredits} OTT Credits`}
                icon={<Gift size={18} />}
              />

              <MetricBox
                label="Total XP"
                value={String(rewardState.totalXp)}
                text="Reward Ledger"
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
      </section>

      <section className="p-4 md:p-6 xl:p-10 bg-white">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-4">
            <Panel title="Choose Proof Action" icon={<Sparkles size={18} />}>
              <div className="space-y-3">
                {MAKE_WAVES_ACTIONS.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => {
                      setSelectedActionId(action.id);
                      setPayload(null);
                      setVerification(null);
                      setStatusMessage(
                        `${action.title} selected. Create a fresh Xaman payload for this action.`,
                      );
                    }}
                    className={`w-full border p-4 text-left transition-all ${
                      selectedActionId === action.id
                        ? "border-[#C83888] bg-[#C83888]/10"
                        : "border-black/10 bg-[#F7F8FC] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-orbitron text-xs font-bold uppercase mb-2 text-black">
                          {action.title}
                        </p>

                        <p className="font-mono text-[10px] text-black/40 uppercase leading-relaxed">
                          +{action.xp} XP • +{getOttCreditsForAction(action.id)} OTT Credits
                        </p>
                      </div>

                      {selectedActionId === action.id ? (
                        <CheckCircle2 size={17} className="text-[#C83888] shrink-0" />
                      ) : (
                        <ArrowRight size={17} className="text-black/20 shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </Panel>

            <Panel title="Why this counts" icon={<Info size={18} />}>
              <div className="space-y-3">
                <InfoLine text="The action creates a real Xaman signing request." />
                <InfoLine text={`The payload must include SourceTag ${MAKE_WAVES_SOURCE_TAG}.`} />
                <InfoLine text="XP and OTT Credits are credited only after verification." />
                <InfoLine text="Duplicate rewards are blocked by the Reward Ledger." />
              </div>
            </Panel>
          </div>

          <div className="col-span-12 xl:col-span-5 space-y-4">
            <Panel title="Xaman Payload" icon={<QrCode size={18} />}>
              {isGuest && (
                <div className="border border-[#D84858]/25 bg-[#D84858]/10 p-4 mb-5">
                  <p className="font-mono text-xs text-black/60 leading-relaxed">
                    Connect Xaman first. Guest mode can read the terminal, but cannot create reward proof.
                  </p>
                </div>
              )}

              <button
                onClick={createPayload}
                disabled={busy || isGuest}
                className="w-full bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] text-white py-4 font-orbitron text-xs font-black uppercase tracking-widest hover:brightness-95 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
              >
                {busy ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <QrCode size={16} />
                )}
                Create Xaman Proof Payload
              </button>

              {payloadUuid && (
                <div className="space-y-4 mt-5">
                  {payloadQr && (
                    <div className="border border-black/10 bg-white p-4 inline-block shadow-sm">
                      <img src={payloadQr} alt="Xaman QR" className="w-40 h-40" />
                    </div>
                  )}

                  <MiniStatus label="Payload UUID" value={payloadUuid} />
                  <MiniStatus label="Payload URL" value={payloadUrl ?? "None"} />
                  <MiniStatus label="SourceTag" value={String(MAKE_WAVES_SOURCE_TAG)} />

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
            </Panel>

            <Panel title="Verify + Credit Rewards" icon={<CheckCircle2 size={18} />}>
              <button
                onClick={verifyPayload}
                disabled={verifyBusy || !payloadUuid || isGuest}
                className="w-full border border-black/10 bg-white p-4 text-left hover:bg-[#F7F8FC] disabled:opacity-40 transition-all"
              >
                <div className="flex items-center gap-3">
                  {verifyBusy ? (
                    <Loader2 size={18} className="text-[#C83888] animate-spin" />
                  ) : (
                    <RefreshCcw size={18} className="text-[#3898E8]" />
                  )}

                  <div>
                    <p className="font-orbitron text-xs font-bold uppercase text-black">
                      Verify Signed Payload
                    </p>

                    <p className="font-mono text-[10px] text-black/40 uppercase leading-relaxed">
                      Mainnet validation credits XP + OTT Credits
                    </p>
                  </div>
                </div>
              </button>

              <div className="border border-black/10 bg-[#F7F8FC] p-4 mt-5">
                <p className="font-mono text-xs text-black/55 leading-relaxed">
                  Reward logic stays local/off-chain for V1. Future on-chain OTT token conversion remains disabled until utility, profitability and legal review are complete.
                </p>
              </div>
            </Panel>
          </div>

          <div className="col-span-12 xl:col-span-3 space-y-4">
            <Panel title="Status" icon={<Radio size={18} />}>
              <div className="border border-black/10 bg-[#F7F8FC] p-4">
                <p className="font-mono text-xs text-black/55 leading-relaxed">
                  {statusMessage}
                </p>
              </div>
            </Panel>

            <Panel title="Verification" icon={<ShieldCheck size={18} />}>
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
            </Panel>

            <Panel title="Demo Route" icon={<Wallet size={18} />}>
              <div className="space-y-3">
                <InfoLine text="1. Connect Xaman in the Xaman Center." />
                <InfoLine text="2. Return here and create proof." />
                <InfoLine text="3. Verify after signing." />
                <InfoLine text="4. Open Reward Ledger to show progress." />
                <InfoLine text="5. Open SourceTag page to explain tracking." />
              </div>
            </Panel>
          </div>
        </div>
      </section>
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

function Panel({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-black/10 bg-white p-5 md:p-6 shadow-sm mb-4">
      <div className="flex items-center gap-2 mb-5 text-[#3898E8]">
        {icon}

        <p className="font-orbitron text-xs uppercase tracking-widest text-black">
          {title}
        </p>
      </div>

      {children}
    </div>
  );
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
    <div className="border border-black/10 bg-white/90 p-4 shadow-sm">
      <div className="text-[#C83888] mb-3">{icon}</div>

      <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">
        {label}
      </p>

      <p className="font-orbitron text-sm font-black uppercase mb-1 break-all text-black">
        {value}
      </p>

      <p className="font-mono text-[10px] text-black/35 uppercase">{text}</p>
    </div>
  );
}

function MiniStatus({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-4">
      <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">
        {label}
      </p>

      <p className="font-orbitron text-sm font-black uppercase break-all text-black">
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
      className="border border-black/10 bg-white p-4 text-left hover:bg-[#F7F8FC] transition-all"
    >
      <div className="text-[#C83888] mb-3">{icon}</div>

      <p className="font-orbitron text-xs font-bold uppercase mb-2 text-black">
        {title}
      </p>

      <p className="font-mono text-[10px] text-black/40 uppercase">{text}</p>
    </button>
  );
}

function InfoLine({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 border border-black/10 bg-[#F7F8FC] p-3">
      <CheckCircle2 size={14} className="text-[#3898E8] mt-0.5 shrink-0" />

      <p className="font-mono text-xs text-black/55 leading-relaxed">{text}</p>
    </div>
  );
}

function FlowStep({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="border border-black/10 bg-white/90 p-4 shadow-sm">
      <p className="font-orbitron text-xs font-black text-[#C83888] mb-4">
        {number}
      </p>

      <p className="font-orbitron text-xs font-black uppercase mb-2 text-black">
        {title}
      </p>

      <p className="font-mono text-[10px] text-black/40 uppercase">{text}</p>
    </div>
  );
}

export default DailyCheckInTab;
