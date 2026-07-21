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
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

type DailyCheckInTabProps = {
  walletAddress: string;
};

export function DailyCheckInTab({ walletAddress }: DailyCheckInTabProps) {
  const { language } = useTerminalLanguage();
  const isEnglish = language === "en";
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
    isEnglish
      ? "Connect Xaman, create a Make Waves proof payload, sign it, verify it and credit XP only after Mainnet validation."
      : "Koppel Xaman, maak een Make Waves-proofverzoek, onderteken het, verifieer het en ken XP pas toe na Mainnet-validatie.",
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
        ? isEnglish
          ? "Connect Xaman first. Daily proof actions only work with a connected wallet."
          : "Koppel eerst Xaman. Dagelijkse proofacties werken alleen met een gekoppelde wallet."
        : isEnglish
          ? "Wallet loaded. Choose a proof action, create a Xaman payload and verify after signing."
          : "Wallet geladen. Kies een proofactie, maak een Xaman-verzoek en verifieer na ondertekening.",
    );
  }, [walletAddress, isEnglish]);

  async function createPayload() {
    if (!walletAddress || walletAddress === "guest") {
      setStatusMessage(isEnglish ? "Connect Xaman before starting a reward action." : "Koppel Xaman voordat je een beloningsactie start.");
      return;
    }

    setBusy(true);
    setVerification(null);
    setStatusMessage(isEnglish ? "Creating Xaman Make Waves payload..." : "Xaman Make Waves-verzoek maken...");

    try {
      const response = await createMakeWavesPayload({
        actionId: selectedActionId,
        walletAddress,
      });

      setPayload(response);
      setStatusMessage(
        isEnglish
          ? `Payload ready for ${getActionTitle(selectedActionId, true)} with SourceTag ${MAKE_WAVES_SOURCE_TAG}.`
          : `Verzoek klaar voor ${getActionTitle(selectedActionId, false)} met SourceTag ${MAKE_WAVES_SOURCE_TAG}.`,
      );
    } catch (error) {
      setStatusMessage(getErrorMessage(error, isEnglish));
    } finally {
      setBusy(false);
    }
  }

  async function verifyPayload() {
    const uuid = payloadUuid;

    if (!walletAddress || walletAddress === "guest") {
      setStatusMessage(isEnglish ? "Connect Xaman before verifying a reward." : "Koppel Xaman voordat je een beloning verifieert.");
      return;
    }

    if (!uuid) {
      setStatusMessage(isEnglish ? "No Xaman payload UUID was found." : "Geen Xaman-verzoek-ID gevonden.");
      return;
    }

    setVerifyBusy(true);
    setStatusMessage(isEnglish ? "Verifying Xaman payload..." : "Xaman-verzoek verifiëren...");

    try {
      const response = await verifyMakeWavesPayload(
        uuid,
        selectedActionId,
      );
      setVerification(response);

      if (isMakeWavesRewardAllowed(response, selectedActionId)) {
        const beforeReward = loadRewardState(walletAddress);

        const xpState = addXpRewardEvent({
          walletAddress,
          actionId: selectedActionId,
          txHash: response.verified?.txid,
          note: `${getActionTitle(selectedActionId, isEnglish)} ${isEnglish ? "validated on XRPL Mainnet with" : "gevalideerd op XRPL Mainnet met"} SourceTag ${MAKE_WAVES_SOURCE_TAG}.`,
        });

        const finalState = addMainnetLockedEvent({
          walletAddress,
          actionId: selectedActionId,
          txHash: response.verified?.txid,
          note: isEnglish
            ? "Future on-chain OTT token conversion stays disabled until utility, profitability and legal review are complete."
            : "Toekomstige on-chain omzetting naar OTT-tokens blijft uitgeschakeld totdat utility, haalbaarheid en juridische toetsing zijn afgerond.",
        });

        const rewardWasAdded =
          xpState.totalXp > beforeReward.totalXp ||
          xpState.ottCredits > beforeReward.ottCredits;

        setRewardState(finalState);

        setStatusMessage(
          rewardWasAdded
            ? isEnglish
              ? `${getMakeWavesVerificationLabel(response)}. Reward Ledger credited +${selectedAction.xp} XP and +${selectedOttCredits} OTT Credits.`
              : `${getMakeWavesVerificationLabel(response)}. Het beloningsoverzicht kreeg +${selectedAction.xp} XP en +${selectedOttCredits} OTT Credits.`
            : isEnglish
              ? `${getMakeWavesVerificationLabel(response)}. This transaction was already processed; no duplicate reward was added.`
              : `${getMakeWavesVerificationLabel(response)}. Deze transactie was al verwerkt; er is geen dubbele beloning toegevoegd.`,
        );
        return;
      }

      setStatusMessage(getMakeWavesVerificationLabel(response));
    } catch (error) {
      setStatusMessage(getErrorMessage(error, isEnglish));
    } finally {
      setVerifyBusy(false);
    }
  }

  function openPayload() {
    const opened = openXamanPayload(payload);

    if (!opened) {
      setStatusMessage(isEnglish ? "No Xaman payload link was found." : "Geen Xaman-verzoeklink gevonden.");
    }
  }

  async function copyUuid() {
    if (!payloadUuid) {
      setStatusMessage(isEnglish ? "There is no payload UUID to copy." : "Er is geen verzoek-ID om te kopiëren.");
      return;
    }

    await navigator.clipboard.writeText(payloadUuid);
    setStatusMessage(isEnglish ? "Payload UUID copied." : "Verzoek-ID gekopieerd.");
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
                {isEnglish
                  ? "This is the clear Make Waves proof flow: connect Xaman, create a SourceTag payload, sign with self-custody, verify the Mainnet result, then credit XP and OTT Credits only after the proof is validated."
                  : "Dit is de duidelijke Make Waves-proofflow: koppel Xaman, maak een SourceTag-verzoek, onderteken via self-custody, verifieer het Mainnet-resultaat en ken XP en OTT Credits pas toe nadat de proof is gevalideerd."}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 max-w-5xl">
                <FlowStep number="01" title={isEnglish ? "Connect" : "Koppelen"} text="Xaman wallet" />
                <FlowStep number="02" title={isEnglish ? "Sign" : "Ondertekenen"} text={isEnglish ? "Payload" : "Verzoek"} />
                <FlowStep number="03" title={isEnglish ? "Verify" : "Verifiëren"} text="Mainnet proof" />
                <FlowStep number="04" title={isEnglish ? "Credit" : "Toekennen"} text="XP + OTT Credits" />
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
                label={isEnglish ? "Selected" : "Geselecteerd"}
                value={`+${selectedAction.xp} XP`}
                text={`+${selectedOttCredits} OTT Credits`}
                icon={<Gift size={18} />}
              />

              <MetricBox
                label={isEnglish ? "Total XP" : "Totale XP"}
                value={String(rewardState.totalXp)}
                text={isEnglish ? "Reward Ledger" : "Beloningsoverzicht"}
                icon={<Trophy size={18} />}
              />

              <MetricBox
                label="OTT Credits"
                value={String(rewardState.ottCredits)}
                text={isEnglish ? "Internal utility" : "Interne utility"}
                icon={<ShieldCheck size={18} />}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="p-4 md:p-6 xl:p-10 bg-white">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-4">
            <Panel title={isEnglish ? "Choose Proof Action" : "Kies proofactie"} icon={<Sparkles size={18} />}>
              <div className="space-y-3">
                {MAKE_WAVES_ACTIONS.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => {
                      setSelectedActionId(action.id);
                      setPayload(null);
                      setVerification(null);
                      setStatusMessage(
                        isEnglish
                          ? `${getActionTitle(action.id, true)} selected. Create a fresh Xaman payload for this action.`
                          : `${getActionTitle(action.id, false)} geselecteerd. Maak voor deze actie een nieuw Xaman-verzoek.`,
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
                          {getActionTitle(action.id, isEnglish)}
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

            <Panel title={isEnglish ? "Why this counts" : "Waarom dit meetelt"} icon={<Info size={18} />}>
              <div className="space-y-3">
                <InfoLine text={isEnglish ? "The action creates a real Xaman signing request." : "De actie maakt een echt Xaman-ondertekenverzoek."} />
                <InfoLine text={isEnglish ? `The payload must include SourceTag ${MAKE_WAVES_SOURCE_TAG}.` : `Het verzoek moet SourceTag ${MAKE_WAVES_SOURCE_TAG} bevatten.`} />
                <InfoLine text={isEnglish ? "XP and OTT Credits are credited only after verification." : "XP en OTT Credits worden pas na verificatie toegekend."} />
                <InfoLine text={isEnglish ? "Duplicate rewards are blocked by the Reward Ledger." : "Dubbele beloningen worden door het beloningsoverzicht geblokkeerd."} />
              </div>
            </Panel>
          </div>

          <div className="col-span-12 xl:col-span-5 space-y-4">
            <Panel title="Xaman Payload" icon={<QrCode size={18} />}>
              {isGuest && (
                <div className="border border-[#D84858]/25 bg-[#D84858]/10 p-4 mb-5">
                  <p className="font-mono text-xs text-black/60 leading-relaxed">
                    {isEnglish ? "Connect Xaman first. Guest mode can read the terminal, but cannot create reward proof." : "Koppel eerst Xaman. In gastmodus kun je de terminal lezen, maar geen beloningsproof maken."}
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
                {isEnglish ? "Create Xaman Proof Payload" : "Maak Xaman-proofverzoek"}
              </button>

              {payloadUuid && (
                <div className="space-y-4 mt-5">
                  {payloadQr && (
                    <div className="border border-black/10 bg-white p-4 inline-block shadow-sm">
                      <img src={payloadQr} alt="Xaman QR" className="w-40 h-40" />
                    </div>
                  )}

                  <MiniStatus label="Payload UUID" value={payloadUuid} />
                  <MiniStatus label="Payload URL" value={payloadUrl ?? (isEnglish ? "None" : "Geen")} />
                  <MiniStatus label="SourceTag" value={String(MAKE_WAVES_SOURCE_TAG)} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <ActionButton
                      icon={<ExternalLink size={18} />}
                      title={isEnglish ? "Open Xaman" : "Open Xaman"}
                      text={isEnglish ? "Launch payload" : "Open verzoek"}
                      onClick={openPayload}
                    />

                    <ActionButton
                      icon={<Copy size={18} />}
                      title={isEnglish ? "Copy UUID" : "Kopieer ID"}
                      text={isEnglish ? "For verification" : "Voor verificatie"}
                      onClick={copyUuid}
                    />
                  </div>
                </div>
              )}
            </Panel>

            <Panel title={isEnglish ? "Verify + Credit Rewards" : "Verifieer + ken beloningen toe"} icon={<CheckCircle2 size={18} />}>
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
                      {isEnglish ? "Verify Signed Payload" : "Verifieer ondertekend verzoek"}
                    </p>

                    <p className="font-mono text-[10px] text-black/40 uppercase leading-relaxed">
                      {isEnglish ? "Mainnet validation credits XP + OTT Credits" : "Mainnet-validatie kent XP + OTT Credits toe"}
                    </p>
                  </div>
                </div>
              </button>

              <div className="border border-black/10 bg-[#F7F8FC] p-4 mt-5">
                <p className="font-mono text-xs text-black/55 leading-relaxed">
                  {isEnglish ? "Reward logic stays local and off-chain for V1. Future on-chain OTT token conversion remains disabled until utility, feasibility and legal review are complete." : "De beloningslogica blijft in V1 lokaal en off-chain. Toekomstige on-chain omzetting naar OTT-tokens blijft uitgeschakeld totdat utility, haalbaarheid en juridische toetsing zijn afgerond."}
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

            <Panel title={isEnglish ? "Verification" : "Verificatie"} icon={<ShieldCheck size={18} />}>
              {verification?.verified ? (
                <div className="space-y-3">
                  <MiniStatus
                    label={isEnglish ? "Signed in Xaman" : "Ondertekend in Xaman"}
                    value={verification.verified.signed ? (isEnglish ? "Yes" : "Ja") : (isEnglish ? "No" : "Nee")}
                  />
                  <MiniStatus
                    label={isEnglish ? "Payload resolved" : "Verzoek afgerond"}
                    value={verification.verified.resolved ? (isEnglish ? "Yes" : "Ja") : (isEnglish ? "No" : "Nee")}
                  />
                  <MiniStatus
                    label="SourceTag"
                    value={String(verification.verified.sourceTag)}
                  />
                  <MiniStatus
                    label="Account"
                    value={verification.verified.account ?? (isEnglish ? "None" : "Geen")}
                  />
                  <MiniStatus
                    label="Txid"
                    value={verification.verified.txid ?? (isEnglish ? "None" : "Geen")}
                  />
                </div>
              ) : (
                <MiniStatus label={isEnglish ? "Result" : "Resultaat"} value={isEnglish ? "Not verified yet" : "Nog niet geverifieerd"} />
              )}
            </Panel>

            <Panel title={isEnglish ? "Demo Route" : "Demoroute"} icon={<Wallet size={18} />}>
              <div className="space-y-3">
                <InfoLine text={isEnglish ? "1. Connect Xaman in the Xaman Center." : "1. Koppel Xaman in het Xaman Center."} />
                <InfoLine text={isEnglish ? "2. Return here and create proof." : "2. Kom hier terug en maak proof."} />
                <InfoLine text={isEnglish ? "3. Verify after signing." : "3. Verifieer na ondertekening."} />
                <InfoLine text={isEnglish ? "4. Open Reward Ledger to show progress." : "4. Open het beloningsoverzicht om voortgang te tonen."} />
                <InfoLine text={isEnglish ? "5. Open the SourceTag page to explain tracking." : "5. Open de SourceTag-pagina om tracking uit te leggen."} />
              </div>
            </Panel>
          </div>
        </div>
      </section>
    </div>
  );
}

function getActionTitle(actionId: MakeWavesActionId, isEnglish: boolean) {
  if (isEnglish) {
    return MAKE_WAVES_ACTIONS.find((action) => action.id === actionId)?.title ?? actionId;
  }

  const titles: Partial<Record<MakeWavesActionId, string>> = {
    "daily-checkin": "Dagelijkse check-in",
    "source-tag-proof": "SourceTag-proof",
    "wallet-safety": "Walletveiligheid",
    "academy-lesson": "Academyles",
    "xrpl-verify": "XRPL-verificatie",
  };

  return titles[actionId] ?? MAKE_WAVES_ACTIONS.find((action) => action.id === actionId)?.title ?? actionId;
}

function getErrorMessage(error: unknown, isEnglish = true) {
  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object" && "error" in error) {
    const apiError = error as { error?: unknown };

    if (typeof apiError.error === "string") {
      return apiError.error;
    }
  }

  return isEnglish ? "Unknown Daily Check-In error." : "Onbekende fout bij de dagelijkse check-in.";
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
