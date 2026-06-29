import { useEffect, useState } from "react";
import type { ElementType } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  Coins,
  Copy,
  Database,
  ExternalLink,
  Fingerprint,
  Gift,
  History,
  Layers,
  Loader2,
  Lock,
  QrCode,
  Radio,
  Send,
  ShieldCheck,
  TestTube2,
  Trophy,
  Wallet,
} from "lucide-react";
import {
  MAKE_WAVES_SOURCE_TAG,
  type MakeWavesActionId,
} from "../lib/makeWaves";
import {
  addTestnetTokenSimulation,
  getAvailableRewardActions,
  loadRewardState,
  type RewardEvent,
  type RewardState,
} from "../lib/rewardStore";
import {
  createOttTokenPaymentPayload,
  createOttTrustlinePayload,
  getOttTokenPaymentPayloadQr,
  getOttTokenPaymentPayloadUrl,
  getOttTokenPaymentPayloadUuid,
  getOttTokenPaymentStatusLabel,
  getOttTrustlinePayloadQr,
  getOttTrustlinePayloadUrl,
  getOttTrustlinePayloadUuid,
  getOttTrustlineStatusLabel,
  openOttTokenPaymentPayload,
  openOttTrustlinePayload,
  type XamanTokenPaymentPayloadResponse,
  type XamanTrustlinePayloadResponse,
} from "../lib/ottTokenClient";

type OTTTestnetTokenTabProps = {
  walletAddress: string;
};

type Metric = {
  label: string;
  value: string;
  text: string;
  icon: ElementType;
};

type Rule = {
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

const testnetRules: Rule[] = [
  {
    title: "Trustline First",
    status: "Step 1",
    text: "Gebruiker moet eerst bewust een OTT trustline zetten.",
    icon: QrCode,
  },
  {
    title: "Payment After Trustline",
    status: "Step 2",
    text: "Daarna kan een testnet OTT token payment payload gemaakt worden.",
    icon: Send,
  },
  {
    title: "SourceTag Proof",
    status: "2606170002",
    text: `Trustline en payment payloads gebruiken SourceTag ${MAKE_WAVES_SOURCE_TAG}.`,
    icon: Fingerprint,
  },
  {
    title: "Mainnet Locked",
    status: "Legal",
    text: "Mainnet OTT token distributie blijft uit tot legal review klaar is.",
    icon: Lock,
  },
  {
    title: "No Price Talk",
    status: "Guard",
    text: "Geen beloftes over waarde, rendement, winst of prijsverwachting.",
    icon: AlertTriangle,
  },
];

export function OTTTestnetTokenTab({ walletAddress }: OTTTestnetTokenTabProps) {
  const actions = getAvailableRewardActions();
  const [rewardState, setRewardState] = useState<RewardState>(() =>
    loadRewardState(walletAddress)
  );
  const [selectedActionId, setSelectedActionId] = useState<MakeWavesActionId>(
    "daily-checkin"
  );
  const [issuerWallet, setIssuerWallet] = useState("");
  const [senderWallet, setSenderWallet] = useState("");
  const [destinationWallet, setDestinationWallet] = useState(walletAddress);
  const [currencyCode, setCurrencyCode] = useState("OTT");
  const [limitAmount, setLimitAmount] = useState("1000000");
  const [tokenAmount, setTokenAmount] = useState("10");
  const [trustlinePayload, setTrustlinePayload] =
    useState<XamanTrustlinePayloadResponse | null>(null);
  const [paymentPayload, setPaymentPayload] =
    useState<XamanTokenPaymentPayloadResponse | null>(null);
  const [trustlineBusy, setTrustlineBusy] = useState(false);
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Paste a real XRPL testnet issuer wallet to start."
  );

  useEffect(() => {
    setDestinationWallet(walletAddress);
    setRewardState(loadRewardState(walletAddress));
  }, [walletAddress]);

  const trustlineUuid = getOttTrustlinePayloadUuid(trustlinePayload);
  const trustlineUrl = getOttTrustlinePayloadUrl(trustlinePayload);
  const trustlineQr = getOttTrustlinePayloadQr(trustlinePayload);

  const paymentUuid = getOttTokenPaymentPayloadUuid(paymentPayload);
  const paymentUrl = getOttTokenPaymentPayloadUrl(paymentPayload);
  const paymentQr = getOttTokenPaymentPayloadQr(paymentPayload);

  const lastEvent = rewardState.events.find(
    (event) => event.type === "testnet-token-simulated"
  );

  const metrics: Metric[] = [
    {
      label: "SourceTag",
      value: String(MAKE_WAVES_SOURCE_TAG),
      text: "Make Waves proof.",
      icon: Fingerprint,
    },
    {
      label: "Trustline",
      value: trustlineUuid ? "Ready" : "Needed",
      text: "Xaman TrustSet.",
      icon: QrCode,
    },
    {
      label: "Payment",
      value: paymentUuid ? "Ready" : "Locked",
      text: "OTT token payload.",
      icon: Send,
    },
    {
      label: "Mainnet",
      value: "Locked",
      text: "Legal gate first.",
      icon: Lock,
    },
  ];

  async function createTrustlinePayload() {
    setTrustlineBusy(true);
    setStatusMessage("Creating OTT TrustSet payload...");

    try {
      const response = await createOttTrustlinePayload({
        userWallet: walletAddress,
        issuerWallet,
        currencyCode,
        limitAmount,
      });

      setTrustlinePayload(response);
      setStatusMessage(getOttTrustlineStatusLabel(response));
    } catch (error) {
      setStatusMessage(getErrorMessage(error));
    } finally {
      setTrustlineBusy(false);
    }
  }

  async function createTokenPaymentPayload() {
    setPaymentBusy(true);
    setStatusMessage("Creating OTT token payment payload...");

    try {
      const response = await createOttTokenPaymentPayload({
        senderWallet: senderWallet.trim() || undefined,
        destinationWallet,
        issuerWallet,
        currencyCode,
        tokenAmount,
      });

      setPaymentPayload(response);
      setStatusMessage(getOttTokenPaymentStatusLabel(response));
    } catch (error) {
      setStatusMessage(getErrorMessage(error));
    } finally {
      setPaymentBusy(false);
    }
  }

  function openTrustline() {
    const opened = openOttTrustlinePayload(trustlinePayload);

    if (!opened) {
      setStatusMessage("Geen OTT trustline payload link gevonden.");
    }
  }

  function openPayment() {
    const opened = openOttTokenPaymentPayload(paymentPayload);

    if (!opened) {
      setStatusMessage("Geen OTT token payment payload link gevonden.");
    }
  }

  async function copyTrustlineUuid() {
    if (!trustlineUuid) {
      return;
    }

    await navigator.clipboard.writeText(trustlineUuid);
    setStatusMessage("Trustline payload UUID copied.");
  }

  async function copyPaymentUuid() {
    if (!paymentUuid) {
      return;
    }

    await navigator.clipboard.writeText(paymentUuid);
    setStatusMessage("Payment payload UUID copied.");
  }

  function simulateTestnetReward() {
    const nextState = addTestnetTokenSimulation({
      walletAddress,
      actionId: selectedActionId,
      note: `${tokenAmount} ${currencyCode} testnet reward simulated for ${selectedActionId}.`,
    });

    setRewardState(nextState);
    setStatusMessage(
      `${tokenAmount} ${currencyCode} testnet reward simulated. Mainnet remains locked.`
    );
  }

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 mb-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="flex items-center gap-2 mb-4 text-white/45">
              <TestTube2 size={17} />

              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                OTT Testnet Token
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              Trustline + Token Payment Flow
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              Bouw de veilige OTT token reward flow eerst op testnet: trustline
              zetten, daarna token payment payload maken. Mainnet blijft locked.
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
                Reward Action
              </p>
            </div>

            <div className="space-y-3">
              {actions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => setSelectedActionId(action.id)}
                  className={`w-full border p-4 text-left transition-all ${
                    selectedActionId === action.id
                      ? "border-white/30 bg-white/[0.08]"
                      : "border-white/10 bg-black hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-orbitron text-xs font-bold uppercase">
                      {action.title}
                    </p>

                    <p className="font-mono text-[10px] text-white/35 uppercase">
                      +{action.xp} XP
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <ShieldCheck size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Safety Rules
              </p>
            </div>

            <div className="space-y-3">
              {testnetRules.map((rule) => (
                <RuleCard key={rule.title} rule={rule} />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-5 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Wallet size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Token Setup
              </p>
            </div>

            <InputField
              label="Receiver Wallet"
              value={destinationWallet}
              onChange={setDestinationWallet}
            />

            <div className="h-4" />

            <InputField
              label="Issuer Wallet"
              value={issuerWallet}
              placeholder="Paste real testnet issuer wallet r..."
              onChange={setIssuerWallet}
            />

            <div className="h-4" />

            <InputField
              label="Sender Wallet Optional"
              value={senderWallet}
              placeholder="Leave empty to let Xaman choose signer"
              onChange={setSenderWallet}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <InputField
                label="Currency"
                value={currencyCode}
                onChange={setCurrencyCode}
              />

              <InputField
                label="Limit"
                value={limitAmount}
                onChange={setLimitAmount}
              />

              <InputField
                label="Amount"
                value={tokenAmount}
                onChange={setTokenAmount}
              />
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <QrCode size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Step 1: Trustline Payload
              </p>
            </div>

            <button
              onClick={createTrustlinePayload}
              disabled={trustlineBusy}
              className="w-full bg-white text-black py-4 font-orbitron text-xs font-black uppercase tracking-widest hover:bg-white/80 disabled:opacity-40 transition-all flex items-center justify-center gap-2 mb-4"
            >
              {trustlineBusy ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <QrCode size={16} />
              )}
              Create OTT Trustline Payload
            </button>

            {trustlinePayload ? (
              <PayloadBox
                qr={trustlineQr}
                uuid={trustlineUuid}
                url={trustlineUrl}
                onOpen={openTrustline}
                onCopy={copyTrustlineUuid}
              />
            ) : (
              <EmptyState text="Nog geen TrustSet payload gemaakt." />
            )}
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Send size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Step 2: Token Payment Payload
              </p>
            </div>

            <button
              onClick={createTokenPaymentPayload}
              disabled={paymentBusy}
              className="w-full bg-white text-black py-4 font-orbitron text-xs font-black uppercase tracking-widest hover:bg-white/80 disabled:opacity-40 transition-all flex items-center justify-center gap-2 mb-4"
            >
              {paymentBusy ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              Create OTT Token Payment Payload
            </button>

            {paymentPayload ? (
              <PayloadBox
                qr={paymentQr}
                uuid={paymentUuid}
                url={paymentUrl}
                onOpen={openPayment}
                onCopy={copyPaymentUuid}
              />
            ) : (
              <EmptyState text="Nog geen token payment payload gemaakt." />
            )}
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Radio size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Status
              </p>
            </div>

            <div className="border border-white/10 bg-black p-5 mb-4">
              <p className="font-mono text-xs text-white/50 leading-relaxed">
                {statusMessage}
              </p>
            </div>

            <button
              onClick={simulateTestnetReward}
              className="w-full border border-white/10 bg-black p-4 text-left hover:bg-white/[0.03] transition-all"
            >
              <div className="flex items-center gap-3">
                <Gift size={18} className="text-white/60" />

                <div>
                  <p className="font-orbitron text-xs font-bold uppercase">
                    Simulate Reward Ledger Entry
                  </p>

                  <p className="font-mono text-[10px] text-white/35 uppercase">
                    Local testnet score only
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-3 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Database size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Reward Snapshot
              </p>
            </div>

            <div className="space-y-3">
              <MiniStatus label="Total XP" value={String(rewardState.totalXp)} />
              <MiniStatus
                label="OTT Eligible"
                value={String(rewardState.ottTokenEligibleXp)}
              />
              <MiniStatus
                label="Testnet Sim"
                value={String(rewardState.testnetTokenSimulated)}
              />
              <MiniStatus
                label="Events"
                value={String(rewardState.events.length)}
              />
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <History size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Last Testnet Event
              </p>
            </div>

            {lastEvent ? (
              <EventCard event={lastEvent} />
            ) : (
              <EmptyState text="Nog geen testnet token simulatie." />
            )}
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <BadgeCheck size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Next Build Steps
              </p>
            </div>

            <div className="space-y-3">
              <ChecklistLine text="Use real testnet issuer" />
              <ChecklistLine text="Sign TrustSet in Xaman" />
              <ChecklistLine text="Sign token payment" />
              <ChecklistLine text="Verify payment tx hash" />
              <ChecklistLine text="Keep mainnet locked" />
            </div>
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

  return "Unknown OTT testnet token error.";
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

function PayloadBox({
  qr,
  uuid,
  url,
  onOpen,
  onCopy,
}: {
  qr: string | null;
  uuid: string | null;
  url: string | null;
  onOpen: () => void;
  onCopy: () => void;
}) {
  return (
    <div className="space-y-4">
      {qr && (
        <div className="border border-white/10 bg-white p-4 inline-block">
          <img src={qr} alt="OTT Xaman QR" className="w-40 h-40" />
        </div>
      )}

      <MiniStatus label="Payload UUID" value={uuid ?? "None"} />
      <MiniStatus label="Payload URL" value={url ?? "None"} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ActionButton
          icon={ExternalLink}
          title="Open Xaman"
          text={url ? "Launch payload" : "No link"}
          onClick={onOpen}
        />

        <ActionButton
          icon={Copy}
          title="Copy UUID"
          text="For verification"
          onClick={onCopy}
        />
      </div>
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

function RuleCard({ rule }: { rule: Rule }) {
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

function EventCard({ event }: { event: RewardEvent }) {
  return (
    <div className="border border-white/10 bg-black p-4">
      <p className="font-orbitron text-xs font-bold uppercase mb-2">
        {event.type}
      </p>

      <p className="font-mono text-[10px] text-white/35 uppercase mb-3">
        {event.actionId} • +{event.xp}
      </p>

      <p className="font-mono text-xs text-white/45 leading-relaxed mb-3">
        {event.note}
      </p>

      <p className="font-mono text-[10px] text-white/30 uppercase">
        {event.createdAt}
      </p>
    </div>
  );
}

function ChecklistLine({ text }: { text: string }) {
  return (
    <div className="border border-white/10 bg-black p-3 flex items-center gap-2">
      <CheckCircle2 size={14} className="text-white/60" />

      <p className="font-mono text-xs text-white/50">{text}</p>
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
