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
import { OTTLogo, OTTLogoMark, OTTProofBadge } from "../components/OTTLogo";
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
    loadAccessState(walletAddress),
  );
  const [destinationWallet, setDestinationWallet] = useState("");
  const [txHash, setTxHash] = useState("");
  const [payload, setPayload] = useState<AccessPaymentPayloadResponse | null>(
    null,
  );
  const [verification, setVerification] =
    useState<VerifyAccessPaymentResponse | null>(null);
  const [payloadBusy, setPayloadBusy] = useState(false);
  const [verifyBusy, setVerifyBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Choose an access route to unlock the terminal access flow.",
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
        : "Access route selected.",
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
        "Banxa is een externe fiat route. OTT Terminal verwerkt deze betaling niet intern.",
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
          destinationWallet.trim() || undefined,
        ),
      );

      setPayload(response);

      const nextState = markAccessPayloadCreated(
        walletAddress,
        selectedRoute.id,
        `${selectedRoute.title} payload created with SourceTag ${ACCESS_SOURCE_TAG}.`,
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
          durationDays: selectedRoute.id === "ott-access-pass" ? 36500 : 30,
          note: `${selectedRoute.title} verified with SourceTag ${ACCESS_SOURCE_TAG}.`,
        });

        setAccessState(nextState);
        setStatusMessage(
          selectedRoute.id === "ott-access-pass"
            ? `${label}. OTT Access Pass route verified. NFT ownership check/mint is next production step.`
            : `${label}. Terminal access unlocked for 30 days.`,
        );
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
    <div className="min-h-screen bg-white text-[#080808]">
      <section className="relative overflow-hidden border-b border-black/10 bg-[radial-gradient(circle_at_18%_18%,rgba(56,152,232,0.16),transparent_28%),radial-gradient(circle_at_82%_8%,rgba(200,56,136,0.16),transparent_28%),radial-gradient(circle_at_85%_82%,rgba(216,72,88,0.12),transparent_30%),#ffffff]">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.24),#ffffff_92%)]" />

        <div className="relative z-10 p-4 md:p-6 xl:p-10">
          <div className="grid grid-cols-12 gap-6 items-center">
            <div className="col-span-12 xl:col-span-8">
              <div className="mb-6 text-[#080808]">
                <OTTLogo size="lg" subtitle="Access Gate + NFT Access Pass" />
              </div>

              <div className="inline-flex items-center gap-2 border border-black/10 bg-white/80 shadow-sm px-4 py-2 mb-6">
                <KeyRound size={15} className="text-[#C83888]" />

                <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/55">
                  Access Gate Layer
                </p>
              </div>

              <h1 className="font-orbitron text-4xl md:text-5xl xl:text-6xl font-black uppercase leading-none tracking-tight mb-6">
                Buy Access.
                <br />
                <span className="bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] bg-clip-text text-transparent">
                  Receive Pass.
                </span>
                <br />
                Unlock Services.
              </h1>

              <p className="font-mono text-sm xl:text-base text-black/60 max-w-3xl leading-relaxed">
                Klanten kunnen toegang kopen voor OTT services. De lange termijn
                flow is: Xaman betalen → OTT Access Pass NFT ontvangen → bij
                volgende login NFT ownership check → automatisch toegang. De NFT
                is access utility, geen investering.
              </p>
            </div>

            <div className="col-span-12 xl:col-span-4">
              <div className="relative border border-black/10 bg-white/90 p-5 md:p-6 shadow-xl shadow-black/5 overflow-hidden">
                <div className="absolute -top-20 -right-20 w-52 h-52 rounded-full bg-[#C83888]/15 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-52 h-52 rounded-full bg-[#3898E8]/15 blur-3xl" />

                <div className="relative z-10">
                  <div className="flex justify-center mb-6">
                    <OTTLogoMark size="xl" />
                  </div>

                  <div className="mb-5 text-[#080808]">
                    <OTTProofBadge sourceTag={String(ACCESS_SOURCE_TAG)} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {metrics.map((metric) => (
                      <MetricBox key={metric.label} metric={metric} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-8">
            <FlowCard number="01" title="Connect" text="Xaman wallet" />
            <FlowCard number="02" title="Pay" text="Access route" />
            <FlowCard number="03" title="Pass" text="NFT utility" />
            <FlowCard number="04" title="Unlock" text="Services" />
          </div>
        </div>
      </section>

      <section className="p-4 md:p-6 xl:p-10 bg-white">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-4 space-y-4">
            <Panel>
              <div className="flex items-center gap-2 mb-5">
                <Sparkles size={18} className="text-[#C83888]" />

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
            </Panel>

            <Panel>
              <div className="flex items-center gap-2 mb-5">
                <KeyRound size={18} className="text-[#3898E8]" />

                <p className="font-orbitron text-xs uppercase tracking-widest">
                  NFT Access Pass
                </p>
              </div>

              <div className="space-y-3">
                <PassStep text="Pay once for service access." />
                <PassStep text="Receive OTT Access Pass NFT." />
                <PassStep text="Next login checks NFT ownership." />
                <PassStep text="Access opens without paying again." />
              </div>

              <div className="border border-[#C83888]/25 bg-[#C83888]/10 p-4 mt-5">
                <p className="font-mono text-xs text-black/60 leading-relaxed">
                  Production mint + ownership check is the next build step. This
                  screen prepares the customer journey and keeps the current
                  working payment flow intact.
                </p>
              </div>
            </Panel>
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
              <Panel>
                <div className="flex items-center gap-2 mb-5">
                  <Lock size={18} className="text-[#C83888]" />

                  <p className="font-orbitron text-xs uppercase tracking-widest">
                    No Route Selected
                  </p>
                </div>

                <p className="font-mono text-sm text-black/55 leading-relaxed">
                  Kies links een access route. Daarna zie je uitleg, risico’s,
                  bedrag en de volgende betaal/verificatie stap.
                </p>
              </Panel>
            )}

            <Panel>
              <div className="flex items-center gap-2 mb-5">
                <AlertTriangle size={18} className="text-[#D84858]" />

                <p className="font-orbitron text-xs uppercase tracking-widest">
                  Legal-Safe Language
                </p>
              </div>

              <div className="space-y-3">
                <InfoLine text="Access payments unlock app access only." />
                <InfoLine text="OTT Access Pass NFT is access utility only." />
                <InfoLine text="The NFT is not an investment product." />
                <InfoLine text="XP has no guaranteed financial value." />
                <InfoLine text="Mainnet token conversion requires legal review." />
              </div>
            </Panel>
          </div>

          <div className="col-span-12 xl:col-span-3 space-y-4">
            <Panel>
              <div className="flex items-center gap-2 mb-5">
                {verified ? (
                  <ShieldCheck size={18} className="text-[#3898E8]" />
                ) : (
                  <Lock size={18} className="text-[#D84858]" />
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
                <MiniStatus
                  label="Expires"
                  value={accessState.expiresAt ?? "None"}
                />
              </div>

              <button
                onClick={resetAccess}
                className="w-full border border-black/10 bg-white p-4 mt-4 text-left hover:bg-[#F7F8FC] transition-all"
              >
                <p className="font-orbitron text-xs font-bold uppercase mb-2 text-black">
                  Reset Access
                </p>

                <p className="font-mono text-[10px] text-black/40 uppercase">
                  Local state only
                </p>
              </button>
            </Panel>

            <Panel>
              <div className="flex items-center gap-2 mb-5">
                <CheckCircle2 size={18} className="text-[#3898E8]" />

                <p className="font-orbitron text-xs uppercase tracking-widest">
                  Status Message
                </p>
              </div>

              <div className="border border-black/10 bg-[#F7F8FC] p-4">
                <p className="font-mono text-xs text-black/55 leading-relaxed">
                  {statusMessage}
                </p>
              </div>
            </Panel>

            <Panel>
              <div className="flex items-center gap-2 mb-5">
                <Fingerprint size={18} className="text-[#C83888]" />

                <p className="font-orbitron text-xs uppercase tracking-widest">
                  Last Event
                </p>
              </div>

              {summary.lastEvent ? (
                <div className="border border-black/10 bg-[#F7F8FC] p-4">
                  <p className="font-orbitron text-xs font-bold uppercase mb-2">
                    {summary.lastEvent.status}
                  </p>

                  <p className="font-mono text-[10px] text-black/40 uppercase mb-3">
                    {summary.lastEvent.routeId}
                  </p>

                  <p className="font-mono text-xs text-black/55 leading-relaxed">
                    {summary.lastEvent.note}
                  </p>
                </div>
              ) : (
                <MiniStatus label="Event" value="None" />
              )}
            </Panel>
          </div>
        </div>
      </section>
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
      className={`w-full border p-4 text-left transition-all shadow-sm ${
        active
          ? "border-[#C83888] bg-[#C83888]/10"
          : "border-black/10 bg-white hover:bg-[#F7F8FC]"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <Icon
          size={18}
          className={
            route.id === "xrp-payment"
              ? "text-[#3898E8]"
              : route.id === "ott-access-pass"
                ? "text-[#C83888]"
                : "text-[#D84858]"
          }
        />

        {active ? (
          <CheckCircle2 size={16} className="text-[#C83888]" />
        ) : (
          <Circle size={16} className="text-black/20" />
        )}
      </div>

      <p className="font-orbitron text-xs font-black uppercase mb-2 text-black">
        {route.title}
      </p>

      <p className="font-mono text-[10px] text-black/40 uppercase">
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
    <Panel>
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-black/35 mb-3">
            {route.type} • SourceTag {ACCESS_SOURCE_TAG}
          </p>

          <h3 className="font-orbitron text-2xl font-black uppercase mb-3 text-black">
            {route.title}
          </h3>

          <p className="font-mono text-sm text-black/55 leading-relaxed">
            {route.description}
          </p>
        </div>

        <div className="text-right shrink-0">
          <p className="font-orbitron text-lg font-black bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] bg-clip-text text-transparent">
            €{route.targetEuroValue}
          </p>

          <p className="font-mono text-[10px] text-black/35 uppercase">
            Value target
          </p>
        </div>
      </div>

      {route.id === "ott-access-pass" && (
        <div className="border border-[#C83888]/25 bg-[#C83888]/10 p-4 mb-5">
          <div className="flex items-start gap-3">
            <KeyRound size={18} className="text-[#C83888] shrink-0 mt-0.5" />

            <p className="font-mono text-xs text-black/60 leading-relaxed">
              This route is the future one-time Access Pass flow: pay once,
              receive NFT pass, and unlock automatically on future logins after
              NFT ownership check.
            </p>
          </div>
        </div>
      )}

      <Section title="User Explanation" items={route.userExplanation} />

      <div className="border border-[#D84858]/25 bg-[#D84858]/10 p-5 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={17} className="text-[#D84858]" />

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

      <div className="border border-black/10 bg-[#F7F8FC] p-5 mb-5">
        <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">
          Proof Memo
        </p>

        <p className="font-mono text-xs text-black/60 break-all leading-relaxed">
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
        className="w-full bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] text-white py-4 font-orbitron text-xs font-black uppercase tracking-widest hover:brightness-95 disabled:opacity-40 transition-all flex items-center justify-center gap-2 mb-5"
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
            <div className="border border-black/10 bg-white p-4 inline-block shadow-sm">
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
            className="w-full border border-black/10 bg-white p-4 text-left hover:bg-[#F7F8FC] disabled:opacity-40 transition-all"
          >
            <div className="flex items-center gap-3">
              {verifyBusy ? (
                <Loader2 size={17} className="text-[#C83888] animate-spin" />
              ) : (
                <SearchCheck size={17} className="text-[#3898E8]" />
              )}

              <div>
                <p className="font-orbitron text-xs font-bold uppercase text-black">
                  Verify Access Payment
                </p>

                <p className="font-mono text-[10px] text-black/40 uppercase">
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
    </Panel>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-black/10 bg-white p-5 md:p-6 shadow-sm shadow-black/5">
      {children}
    </div>
  );
}

function MetricBox({ metric }: { metric: Metric }) {
  const Icon = metric.icon;

  return (
    <div className="border border-black/10 bg-white/90 p-4 shadow-sm">
      <Icon size={18} className="text-[#C83888] mb-3" />

      <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">
        {metric.label}
      </p>

      <p className="font-orbitron text-sm font-black uppercase mb-1 break-all text-black">
        {metric.value}
      </p>

      <p className="font-mono text-[10px] text-black/35 uppercase">
        {metric.text}
      </p>
    </div>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mb-5">
      <p className="font-orbitron text-xs font-bold uppercase mb-3 text-black">
        {title}
      </p>

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
      <CheckCircle2 size={14} className="text-[#3898E8] mt-0.5 shrink-0" />

      <p className="font-mono text-xs text-black/55 leading-relaxed">{text}</p>
    </div>
  );
}

function PassStep({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 border border-black/10 bg-[#F7F8FC] p-3">
      <BadgeCheck size={14} className="text-[#C83888] mt-0.5 shrink-0" />

      <p className="font-mono text-xs text-black/55 leading-relaxed">{text}</p>
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
      className="border border-black/10 bg-white p-4 text-left hover:bg-[#F7F8FC] transition-all"
    >
      <Icon size={18} className="text-[#C83888] mb-3" />

      <p className="font-orbitron text-xs font-bold uppercase mb-2 text-black">
        {title}
      </p>

      <p className="font-mono text-[10px] text-black/40 uppercase">{text}</p>
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
      <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">
        {label}
      </p>

      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-white border border-black/10 px-4 py-4 font-mono text-xs text-black/70 outline-none focus:border-[#C83888] placeholder:text-black/25"
      />
    </label>
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

function FlowCard({
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
