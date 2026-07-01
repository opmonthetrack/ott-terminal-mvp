import { useState } from "react";
import type { ElementType } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  Banknote,
  CheckCircle2,
  Circle,
  Copy,
  CreditCard,
  ExternalLink,
  Fingerprint,
  KeyRound,
  Loader2,
  Lock,
  QrCode,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import {
  ACCESS_ROUTES,
  ACCESS_SOURCE_TAG,
  clearAccessState,
  getAccessRoute,
  getAccessSummary,
  isAccessVerified,
  loadAccessState,
  markAccessPayloadCreated,
  markAccessVerified,
  selectAccessRoute,
  type AccessRoute,
  type AccessRouteId,
  type AccessState,
} from "../lib/accessStore";
import {
  buildAccessPaymentInput,
  createAccessPaymentPayload,
  getAccessClientErrorMessage,
  getAccessPayloadQr,
  getAccessPayloadStatusLabel,
  getAccessPayloadUrl,
  getAccessPayloadUuid,
  getAccessVerificationLabel,
  isAccessPaymentVerified,
  openAccessPayload,
  shortAccessTxHash,
  verifyAccessPayment,
  type AccessPaymentPayloadResponse,
  type VerifyAccessPaymentResponse,
} from "../lib/accessClient";

type AccessGateTabProps = {
  walletAddress?: string;
};

type Metric = {
  label: string;
  value: string;
  text: string;
  icon: ElementType;
};

const routeIcons: Record<AccessRouteId, ElementType> = {
  "banxa-fiat": Banknote,
  "xrp-payment": Wallet,
  "rlusd-payment": CreditCard,
  "ott-access-pass": KeyRound,
};

export function AccessGateTab({ walletAddress = "guest" }: AccessGateTabProps) {
  const [accessState, setAccessState] = useState<AccessState>(() =>
    loadAccessState(walletAddress)
  );
  const [destinationWallet, setDestinationWallet] = useState("");
  const [txHash, setTxHash] = useState("");
  const [payload, setPayload] = useState<AccessPaymentPayloadResponse | null>(
    null
  );
  const [verification, setVerification] =
    useState<VerifyAccessPaymentResponse | null>(null);
  const [payloadBusy, setPayloadBusy] = useState(false);
  const [verifyBusy, setVerifyBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Choose an access route to unlock the terminal access flow."
  );

  const summary = getAccessSummary(accessState);
  const selectedRoute = getAccessRoute(accessState.selectedRouteId);
  const verified = isAccessVerified(accessState);
  const paymentVerified = isAccessPaymentVerified(verification);

  const payloadUuid = getAccessPayloadUuid(payload);
  const payloadUrl = getAccessPayloadUrl(payload);
  const payloadQr = getAccessPayloadQr(payload);

  const metrics: Metric[] = [
    {
      label: "Access",
      value: verified ? "Unlocked" : "Locked",
      text: "Terminal gate.",
      icon: verified ? ShieldCheck : Lock,
    },
    {
      label: "SourceTag",
      value: String(ACCESS_SOURCE_TAG),
      text: "Payment proof.",
      icon: Fingerprint,
    },
    {
      label: "Route",
      value: selectedRoute?.label ?? "None",
      text: "Selected option.",
      icon: Sparkles,
    },
    {
      label: "Verified",
      value: paymentVerified ? "Yes" : "No",
      text: "Tx hash proof.",
      icon: BadgeCheck,
    },
  ];

  function chooseRoute(routeId: AccessRouteId) {
    const nextState = selectAccessRoute(walletAddress, routeId);
    const route = getAccessRoute(routeId);

    setAccessState(nextState);
    setPayload(null);
    setVerification(null);
    setTxHash("");
    setStatusMessage(
      route
        ? `${route.title} selected. Next step: create or verify access payment.`
        : "Access route selected."
    );
  }

  async function createPayload() {
    if (!selectedRoute) {
      setStatusMessage("Selecteer eerst een access route.");
      return;
    }

    if (selectedRoute.id === "banxa-fiat") {
      window.open("https://banxa.com/", "_blank", "noopener,noreferrer");
      setStatusMessage(
        "Banxa is een externe fiat route. OTT Terminal verwerkt deze betaling niet intern."
      );
      return;
    }

    setPayloadBusy(true);
    setVerification(null);
    setStatusMessage("Creating Access Gate payment payload...");

    try {
      const response = await createAccessPaymentPayload(
        buildAccessPaymentInput(
          selectedRoute,
          walletAddress === "guest" ? undefined : walletAddress,
          destinationWallet.trim() || undefined
        )
      );

      setPayload(response);

      const nextState = markAccessPayloadCreated(
        walletAddress,
        selectedRoute.id,
        `${selectedRoute.title} payload created with SourceTag ${ACCESS_SOURCE_TAG}.`
      );

      setAccessState(nextState);
      setStatusMessage(getAccessPayloadStatusLabel(response));
    } catch (error) {
      setStatusMessage(getAccessClientErrorMessage(error));
    } finally {
      setPayloadBusy(false);
    }
  }

  async function verifyPaymentHash() {
    if (!selectedRoute) {
      setStatusMessage("Selecteer eerst een access route.");
      return;
    }

    const cleanHash = txHash.trim();

    if (!cleanHash) {
      setStatusMessage("Vul eerst een access payment tx hash in.");
      return;
    }

    setVerifyBusy(true);
    setStatusMessage("Verifying Access Gate payment...");

    try {
      const response = await verifyAccessPayment({
        txHash: cleanHash,
        expectedWallet: walletAddress === "guest" ? undefined : walletAddress,
        expectedDestination: destinationWallet.trim() || undefined,
        expectedAmountDrops: selectedRoute.demoAmountDrops ?? "1000000",
        expectedMemoContains: selectedRoute.proofMemo,
      });

      setVerification(response);

      const label = getAccessVerificationLabel(response);

      if (isAccessPaymentVerified(response)) {
        const nextState = markAccessVerified({
          walletAddress,
          routeId: selectedRoute.id,
          txHash: cleanHash,
          durationDays: 30,
          note: `${selectedRoute.title} verified with SourceTag ${ACCESS_SOURCE_TAG}.`,
        });

        setAccessState(nextState);
        setStatusMessage(`${label}. Terminal access unlocked for 30 days.`);
        return;
      }

      setStatusMessage(label);
    } catch (error) {
      setStatusMessage(getAccessClientErrorMessage(error));
    } finally {
      setVerifyBusy(false);
    }
  }

  function openPayload() {
    const opened = openAccessPayload(payload);

    if (!opened) {
      setStatusMessage("Geen Access Gate payload link gevonden.");
    }
  }

  async function copyUuid() {
    if (!payloadUuid) {
      setStatusMessage("Geen Access Gate payload UUID gevonden.");
      return;
    }

    await navigator.clipboard.writeText(payloadUuid);
    setStatusMessage("Access Gate payload UUID copied.");
  }

  function resetAccess() {
    const nextState = clearAccessState(walletAddress);

    setAccessState(nextState);
    setPayload(null);
    setVerification(null);
    setTxHash("");
    setStatusMessage("Access state reset.");
  }

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 mb-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="flex items-center gap-2 mb-4 text-white/45">
              <KeyRound size={18} />

              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                Access Gate
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              Choose Access Route
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              Terminal access kan via fiat route, XRP payment, RLUSD payment of
              OTT Access Pass NFT. Dit is access utility, geen investering.
              Alles blijft gekoppeld aan SourceTag {ACCESS_SOURCE_TAG}.
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
              <Sparkles size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Access Routes
              </p>
            </div>

            <div className="space-y-3">
              {ACCESS_ROUTES.map((route) => (
                <RouteButton
                  key={route.id}
                  route={route}
                  active={accessState.selectedRouteId === route.id}
                  onClick={() => chooseRoute(route.id)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-5 space-y-4">
          {selectedRoute ? (
            <RouteDetailCard
              route={selectedRoute}
              destinationWallet={destinationWallet}
              txHash={txHash}
              payloadUuid={payloadUuid}
              payloadQr={payloadQr}
              payloadUrl={payloadUrl}
              payloadBusy={payloadBusy}
              verifyBusy={verifyBusy}
              verification={verification}
              onDestinationChange={setDestinationWallet}
              onTxHashChange={setTxHash}
              onCreatePayload={createPayload}
              onVerify={verifyPaymentHash}
              onOpenPayload={openPayload}
              onCopyUuid={copyUuid}
            />
          ) : (
            <div className="border border-white/10 bg-white/[0.02] p-6">
              <div className="flex items-center gap-2 mb-5">
                <Lock size={18} className="text-white/60" />

                <p className="font-orbitron text-xs uppercase tracking-widest">
                  No Route Selected
                </p>
              </div>

              <p className="font-mono text-sm text-white/45 leading-relaxed">
                Kies links een access route. Daarna zie je uitleg, risico’s,
                bedrag en de volgende betaal/verificatie stap.
              </p>
            </div>
          )}

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <AlertTriangle size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Legal-Safe Language
              </p>
            </div>

            <div className="space-y-3">
              <InfoLine text="Access payments unlock app access only." />
              <InfoLine text="OTT Access Pass NFT is not an investment product." />
              <InfoLine text="XP has no guaranteed financial value." />
              <InfoLine text="Mainnet token conversion requires legal review." />
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-3 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              {verified ? (
                <ShieldCheck size={18} className="text-white/60" />
              ) : (
                <Lock size={18} className="text-white/60" />
              )}

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Access Status
              </p>
            </div>

            <div className="space-y-3">
              <MiniStatus
                label="Status"
                value={verified ? "Verified" : accessState.status}
              />
              <MiniStatus
                label="Route"
                value={summary.selectedRoute?.label ?? "None"}
              />
              <MiniStatus
                label="Unlocked"
                value={accessState.unlockedAt ?? "None"}
              />
              <MiniStatus label="Expires" value={accessState.expiresAt ?? "None"} />
            </div>

            <button
              onClick={resetAccess}
              className="w-full border border-white/10 bg-black p-4 mt-4 text-left hover:bg-white/[0.03] transition-all"
            >
              <p className="font-orbitron text-xs font-bold uppercase mb-2">
                Reset Access
              </p>

              <p className="font-mono text-[10px] text-white/35 uppercase">
                Local state only
              </p>
            </button>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <CheckCircle2 size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Status Message
              </p>
            </div>

            <div className="border border-white/10 bg-black p-4">
              <p className="font-mono text-xs text-white/45 leading-relaxed">
                {statusMessage}
              </p>
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Fingerprint size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Last Event
              </p>
            </div>

            {summary.lastEvent ? (
              <div className="border border-white/10 bg-black p-4">
                <p className="font-orbitron text-xs font-bold uppercase mb-2">
                  {summary.lastEvent.status}
                </p>

                <p className="font-mono text-[10px] text-white/35 uppercase mb-3">
                  {summary.lastEvent.routeId}
                </p>

                <p className="font-mono text-xs text-white/45 leading-relaxed">
                  {summary.lastEvent.note}
                </p>
              </div>
            ) : (
              <MiniStatus label="Event" value="None" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RouteButton({
  route,
  active,
  onClick,
}: {
  route: AccessRoute;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = routeIcons[route.id];

  return (
    <button
      onClick={onClick}
      className={`w-full border p-4 text-left transition-all ${
        active
          ? "border-white/30 bg-white/[0.08]"
          : "border-white/10 bg-black hover:bg-white/[0.03]"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <Icon size={18} className="text-white/60" />

        {active ? (
          <CheckCircle2 size={16} className="text-white/70" />
        ) : (
          <Circle size={16} className="text-white/20" />
        )}
      </div>

      <p className="font-orbitron text-xs font-black uppercase mb-2">
        {route.title}
      </p>

      <p className="font-mono text-[10px] text-white/35 uppercase">
        {route.label}
      </p>
    </button>
  );
}

function RouteDetailCard({
  route,
  destinationWallet,
  txHash,
  payloadUuid,
  payloadQr,
  payloadUrl,
  payloadBusy,
  verifyBusy,
  verification,
  onDestinationChange,
  onTxHashChange,
  onCreatePayload,
  onVerify,
  onOpenPayload,
  onCopyUuid,
}: {
  route: AccessRoute;
  destinationWallet: string;
  txHash: string;
  payloadUuid: string | null;
  payloadQr: string | null;
  payloadUrl: string | null;
  payloadBusy: boolean;
  verifyBusy: boolean;
  verification: VerifyAccessPaymentResponse | null;
  onDestinationChange: (value: string) => void;
  onTxHashChange: (value: string) => void;
  onCreatePayload: () => void;
  onVerify: () => void;
  onOpenPayload: () => void;
  onCopyUuid: () => void;
}) {
  const isBanxa = route.id === "banxa-fiat";
  const amountDrops = route.demoAmountDrops ?? "1000000";
  const amountXrp = Number(amountDrops) / 1000000;

  return (
    <div className="border border-white/10 bg-white/[0.02] p-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/35 mb-3">
            {route.type} • SourceTag {ACCESS_SOURCE_TAG}
          </p>

          <h3 className="font-orbitron text-2xl font-black uppercase mb-3">
            {route.title}
          </h3>

          <p className="font-mono text-sm text-white/50 leading-relaxed">
            {route.description}
          </p>
        </div>

        <div className="text-right">
          <p className="font-orbitron text-lg font-black">
            €{route.targetEuroValue}
          </p>

          <p className="font-mono text-[10px] text-white/35 uppercase">
            Value target
          </p>
        </div>
      </div>

      <Section title="User Explanation" items={route.userExplanation} />

      <div className="border border-white/10 bg-black p-5 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={17} className="text-white/60" />

          <p className="font-orbitron text-xs font-bold uppercase">
            Risk Notes
          </p>
        </div>

        <div className="space-y-3">
          {route.riskNotes.map((note) => (
            <InfoLine key={note} text={note} />
          ))}
        </div>
      </div>

      <div className="border border-white/10 bg-black p-5 mb-5">
        <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
          Proof Memo
        </p>

        <p className="font-mono text-xs text-white/55 break-all leading-relaxed">
          {route.proofMemo}
        </p>
      </div>

      {!isBanxa && (
        <div className="space-y-4 mb-5">
          <InputField
            label="Destination Wallet"
            value={destinationWallet}
            placeholder="Optional if OTT_ACCESS_WALLET is set"
            onChange={onDestinationChange}
          />

          <div className="grid grid-cols-2 gap-3">
            <MiniStatus label="Demo Amount" value={`${amountXrp} XRP`} />
            <MiniStatus label="Drops" value={amountDrops} />
          </div>
        </div>
      )}

      <button
        onClick={onCreatePayload}
        disabled={payloadBusy}
        className="w-full bg-white text-black py-4 font-orbitron text-xs font-black uppercase tracking-widest hover:bg-white/80 disabled:opacity-40 transition-all flex items-center justify-center gap-2 mb-5"
      >
        {payloadBusy ? (
          <Loader2 size={16} className="animate-spin" />
        ) : isBanxa ? (
          <ExternalLink size={16} />
        ) : (
          <QrCode size={16} />
        )}
        {isBanxa ? "Open Banxa" : "Create Access Payload"}
      </button>

      {payloadUuid && (
        <div className="space-y-4 mb-5">
          {payloadQr && (
            <div className="border border-white/10 bg-white p-4 inline-block">
              <img src={payloadQr} alt="Access Gate QR" className="w-40 h-40" />
            </div>
          )}

          <MiniStatus label="Payload UUID" value={payloadUuid} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <ActionButton
              icon={ExternalLink}
              title="Open Xaman"
              text={payloadUrl ? "Launch payload" : "No link"}
              onClick={onOpenPayload}
            />

            <ActionButton
              icon={Copy}
              title="Copy UUID"
              text="For tracking"
              onClick={onCopyUuid}
            />
          </div>
        </div>
      )}

      {!isBanxa && (
        <div className="space-y-4">
          <InputField
            label="Access Payment Tx Hash"
            value={txHash}
            placeholder="Paste signed XRPL payment tx hash"
            onChange={onTxHashChange}
          />

          <button
            onClick={onVerify}
            disabled={verifyBusy}
            className="w-full border border-white/10 bg-black p-4 text-left hover:bg-white/[0.03] disabled:opacity-40 transition-all"
          >
            <div className="flex items-center gap-3">
              {verifyBusy ? (
                <Loader2 size={17} className="text-white/60 animate-spin" />
              ) : (
                <SearchCheck size={17} className="text-white/60" />
              )}

              <div>
                <p className="font-orbitron text-xs font-bold uppercase">
                  Verify Access Payment
                </p>

                <p className="font-mono text-[10px] text-white/35 uppercase">
                  SourceTag + memo + amount proof
                </p>
              </div>
            </div>
          </button>

          {verification?.verified && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <MiniStatus
                label="Verified"
                value={
                  verification.verified.accessPaymentVerified ? "Yes" : "No"
                }
              />
              <MiniStatus
                label="Tx"
                value={shortAccessTxHash(verification.txHash)}
              />
              <MiniStatus
                label="Result"
                value={verification.verified.transactionResult}
              />
              <MiniStatus
                label="Amount"
                value={verification.verified.amountDrops ?? "None"}
              />
            </div>
          )}
        </div>
      )}
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

function InfoLine({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <CheckCircle2 size={14} className="text-white/45 mt-0.5 shrink-0" />

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
