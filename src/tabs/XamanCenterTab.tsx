import { useEffect, useMemo, useState, type ElementType } from "react";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Copy,
  ExternalLink,
  Fingerprint,
  KeyRound,
  Loader2,
  LockKeyhole,
  QrCode,
  RefreshCcw,
  ShieldCheck,
  Smartphone,
  Wallet,
  XCircle,
  Zap,
} from "lucide-react";
import {
  MAKE_WAVES_SOURCE_TAG,
  createDailyCheckInPayload,
  createSourceTagProofPayload,
  getMakeWavesVerificationLabel,
  getXamanPayloadQr,
  getXamanPayloadUrl,
  getXamanPayloadUuid,
  openXamanPayload,
  verifyMakeWavesPayload,
  type XamanPayloadResponse,
  type XamanPayloadVerificationResponse,
} from "../lib/xamanClient";
import type { MakeWavesActionId } from "../lib/makeWaves";

type XamanCenterTabProps = {
  walletAddress?: string;
  onWalletConnected?: (walletAddress: string) => void;
};

type ConnectMode = "source-tag-proof" | "daily-checkin";

type ConnectStep = {
  number: string;
  title: string;
  text: string;
  icon: ElementType;
};

type RouteCard = {
  id: ConnectMode;
  title: string;
  label: string;
  text: string;
  xp: string;
  icon: ElementType;
};

const connectRoutes: RouteCard[] = [
  {
    id: "source-tag-proof",
    title: "SourceTag Proof Connect",
    label: "Recommended",
    text: "Gebruik deze route als wallet-connect proof voor OTT Terminal V2.",
    xp: "+15 XP",
    icon: Fingerprint,
  },
  {
    id: "daily-checkin",
    title: "Daily Check-In",
    label: "Activity",
    text: "Gebruik deze route als simpele dagelijkse Xaman sign test.",
    xp: "+10 XP",
    icon: Activity,
  },
];

const connectSteps: ConnectStep[] = [
  {
    number: "01",
    title: "Create Payload",
    text: "Terminal maakt een Xaman payload via api/ott.ts.",
    icon: QrCode,
  },
  {
    number: "02",
    title: "Open Xaman",
    text: "Gebruiker scant QR of opent deeplink.",
    icon: Smartphone,
  },
  {
    number: "03",
    title: "Sign",
    text: "Gebruiker tekent zelf in Xaman. Geen custody.",
    icon: KeyRound,
  },
  {
    number: "04",
    title: "Verify",
    text: "Terminal leest signed account en SourceTag proof.",
    icon: BadgeCheck,
  },
];

export function XamanCenterTab({
  walletAddress = "guest",
  onWalletConnected,
}: XamanCenterTabProps) {
  const [selectedRoute, setSelectedRoute] =
    useState<ConnectMode>("source-tag-proof");
  const [payloadResponse, setPayloadResponse] =
    useState<XamanPayloadResponse | null>(null);
  const [verificationResponse, setVerificationResponse] =
    useState<XamanPayloadVerificationResponse | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [lastVerifiedAt, setLastVerifiedAt] = useState("not verified");

  const payloadUuid = getXamanPayloadUuid(payloadResponse);
  const payloadUrl = getXamanPayloadUrl(payloadResponse);
  const payloadQr = getXamanPayloadQr(payloadResponse);
  const verifiedAccount = verificationResponse?.verified?.account ?? null;
  const isSigned = Boolean(verificationResponse?.verified?.signed);
  const selectedActionId = selectedRoute as MakeWavesActionId;

  const connectLabel = useMemo(
    () => getMakeWavesVerificationLabel(verificationResponse),
    [verificationResponse],
  );

  useEffect(() => {
    if (!payloadUuid || isSigned) {
      return;
    }

    const interval = window.setInterval(() => {
      void verifyPayload(false);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [payloadUuid, isSigned, selectedRoute]);

  useEffect(() => {
    if (verifiedAccount) {
      onWalletConnected?.(verifiedAccount);
    }
  }, [verifiedAccount, onWalletConnected]);

  async function createPayload() {
    setIsCreating(true);
    setError("");
    setVerificationResponse(null);

    try {
      const response =
        selectedRoute === "source-tag-proof"
          ? await createSourceTagProofPayload(
              walletAddress === "guest" ? undefined : walletAddress,
            )
          : await createDailyCheckInPayload(
              walletAddress === "guest" ? undefined : walletAddress,
            );

      setPayloadResponse(response);
    } catch (createError) {
      setError(getErrorMessage(createError));
    } finally {
      setIsCreating(false);
    }
  }

  async function verifyPayload(showLoading = true) {
    if (!payloadUuid) {
      setError("Maak eerst een Xaman payload aan.");
      return;
    }

    if (showLoading) {
      setIsVerifying(true);
    }

    setError("");

    try {
      const response = await verifyMakeWavesPayload(payloadUuid, selectedActionId);

      setVerificationResponse(response);
      setLastVerifiedAt(new Date().toLocaleTimeString());

      if (response.verified?.account) {
        onWalletConnected?.(response.verified.account);
      }
    } catch (verifyError) {
      setError(getErrorMessage(verifyError));
    } finally {
      setIsVerifying(false);
    }
  }

  function resetFlow() {
    setPayloadResponse(null);
    setVerificationResponse(null);
    setError("");
    setLastVerifiedAt("not verified");
  }

  function openPayload() {
    const opened = openXamanPayload(payloadResponse);

    if (!opened) {
      setError("Geen Xaman deeplink gevonden.");
    }
  }

  function copyValue(value: string | null) {
    if (!value) {
      return;
    }

    void navigator.clipboard?.writeText(value);
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,_white,_transparent_26%),radial-gradient(circle_at_90%_10%,_white,_transparent_22%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,_transparent,_black_88%)]" />

        <div className="relative z-10 p-6 xl:p-10">
          <div className="grid grid-cols-12 gap-6 items-end">
            <div className="col-span-12 xl:col-span-8">
              <div className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.03] px-4 py-2 mb-6">
                <KeyRound size={15} className="text-white/60" />

                <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/50">
                  Xaman Connect Layer
                </p>
              </div>

              <h1 className="font-orbitron text-4xl xl:text-6xl font-black uppercase leading-none tracking-tight mb-6">
                Connect.
                <br />
                Sign.
                <br />
                Verify.
              </h1>

              <p className="font-mono text-sm xl:text-base text-white/50 leading-relaxed max-w-3xl mb-8">
                Dit is de eerste echte Xaman-connect laag voor OTT Terminal V2.
                De gebruiker tekent zelf in Xaman, daarna lezen we het signed
                wallet account terug en koppelen we die aan het dashboard.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl">
                {connectRoutes.map((route) => (
                  <RouteButton
                    key={route.id}
                    route={route}
                    isActive={selectedRoute === route.id}
                    onClick={() => {
                      setSelectedRoute(route.id);
                      resetFlow();
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="col-span-12 xl:col-span-4">
              <div className="border border-white/10 bg-black/70 backdrop-blur p-5">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <p className="font-orbitron text-xs uppercase tracking-widest">
                    Connect Status
                  </p>

                  <StatusPill isSigned={isSigned} isCreating={isCreating} />
                </div>

                <div className="space-y-3">
                  <InfoRow
                    label="Current Wallet"
                    value={walletAddress === "guest" ? "Guest mode" : walletAddress}
                  />
                  <InfoRow
                    label="Signed Account"
                    value={verifiedAccount ?? "Not connected"}
                  />
                  <InfoRow
                    label="SourceTag"
                    value={String(MAKE_WAVES_SOURCE_TAG)}
                  />
                  <InfoRow label="Verified At" value={lastVerifiedAt} />
                </div>

                <div className="border border-white/10 bg-white/[0.02] p-4 mt-5">
                  <div className="flex items-start gap-3">
                    <LockKeyhole size={18} className="text-white/55 shrink-0 mt-0.5" />

                    <p className="font-mono text-xs text-white/45 leading-relaxed">
                      Xaman blijft self-custody. OTT Terminal vraagt nooit om
                      private keys en bewaart geen seed phrase.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mt-8">
            <MetricCard
              label="Payload"
              value={payloadUuid ? "Created" : "None"}
              text="api/ott.ts"
              icon={QrCode}
            />
            <MetricCard
              label="Xaman"
              value={isSigned ? "Signed" : "Waiting"}
              text="Self-custody"
              icon={Wallet}
            />
            <MetricCard
              label="SourceTag"
              value={String(MAKE_WAVES_SOURCE_TAG)}
              text="OTT proof"
              icon={Fingerprint}
            />
            <MetricCard
              label="Dashboard"
              value={verifiedAccount ? "Linked" : "Guest"}
              text="Wallet layer"
              icon={Zap}
            />
          </div>
        </div>
      </section>

      <section className="p-6 xl:p-10">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-7 border border-white/10 bg-white/[0.02] p-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/35 mb-3">
                  Xaman Flow
                </p>

                <h2 className="font-orbitron text-2xl font-black uppercase">
                  Create Sign Payload
                </h2>
              </div>

              <p className="font-mono text-xs text-white/35 max-w-md leading-relaxed">
                Dit is geen exchange-login. Dit is een wallet proof sign route
                via Xaman en SourceTag {MAKE_WAVES_SOURCE_TAG}.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
              {connectSteps.map((step) => (
                <StepCard key={step.number} step={step} />
              ))}
            </div>

            <div className="border border-white/10 bg-black p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <ActionButton
                  title={isCreating ? "Creating..." : "Create Payload"}
                  text="Generate Xaman QR"
                  icon={isCreating ? Loader2 : QrCode}
                  disabled={isCreating}
                  onClick={createPayload}
                />

                <ActionButton
                  title="Open Xaman"
                  text="Open deeplink"
                  icon={ExternalLink}
                  disabled={!payloadUrl}
                  onClick={openPayload}
                />

                <ActionButton
                  title={isVerifying ? "Verifying..." : "Verify"}
                  text="Check signed payload"
                  icon={isVerifying ? Loader2 : RefreshCcw}
                  disabled={!payloadUuid || isVerifying}
                  onClick={() => void verifyPayload(true)}
                />
              </div>
            </div>

            {error && (
              <div className="border border-white/10 bg-white/[0.02] p-4 mb-4">
                <div className="flex items-start gap-3">
                  <XCircle size={18} className="text-white/50 shrink-0 mt-0.5" />

                  <p className="font-mono text-xs text-white/55 leading-relaxed">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {payloadResponse && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="border border-white/10 bg-black p-5">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <p className="font-orbitron text-xs font-black uppercase">
                      Payload Details
                    </p>

                    <button
                      onClick={() => copyValue(payloadUuid)}
                      className="border border-white/10 p-2 hover:bg-white hover:text-black transition-all"
                    >
                      <Copy size={14} />
                    </button>
                  </div>

                  <DetailRow label="UUID" value={payloadUuid ?? "—"} />
                  <DetailRow label="Route" value={selectedRoute} />
                  <DetailRow
                    label="Transaction Type"
                    value={payloadResponse.transactionMeta?.transactionType ?? "—"}
                  />
                  <DetailRow
                    label="Memo"
                    value={payloadResponse.transactionMeta?.memoText ?? "—"}
                  />
                  <DetailRow
                    label="SourceTag"
                    value={String(payloadResponse.sourceTag ?? MAKE_WAVES_SOURCE_TAG)}
                  />
                </div>

                <div className="border border-white/10 bg-black p-5">
                  <p className="font-orbitron text-xs font-black uppercase mb-4">
                    Scan With Xaman
                  </p>

                  {payloadQr ? (
                    <div className="bg-white p-4 inline-block">
                      <img
                        src={payloadQr}
                        alt="Xaman payload QR"
                        className="w-48 h-48 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="border border-white/10 bg-white/[0.02] p-8 text-center">
                      <QrCode size={28} className="mx-auto mb-4 text-white/35" />

                      <p className="font-mono text-xs text-white/35">
                        QR niet gevonden in payload response.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="col-span-12 xl:col-span-5 space-y-4">
            <div className="border border-white/10 bg-white/[0.02] p-6">
              <div className="flex items-center gap-2 mb-5">
                {isSigned ? (
                  <CheckCircle2 size={18} className="text-white/70" />
                ) : (
                  <BadgeCheck size={18} className="text-white/60" />
                )}

                <p className="font-orbitron text-xs uppercase tracking-widest">
                  Verification Result
                </p>
              </div>

              <div className="border border-white/10 bg-black p-4 mb-4">
                <p className="font-mono text-xs text-white/45 leading-relaxed">
                  {connectLabel}
                </p>
              </div>

              <div className="space-y-3">
                <InfoRow
                  label="Signed"
                  value={isSigned ? "Yes" : "No / waiting"}
                />
                <InfoRow
                  label="Resolved"
                  value={
                    verificationResponse?.verified?.resolved ? "Yes" : "No / waiting"
                  }
                />
                <InfoRow
                  label="Account"
                  value={verifiedAccount ?? "—"}
                />
                <InfoRow
                  label="TXID"
                  value={verificationResponse?.verified?.txid ?? "—"}
                />
              </div>

              {verifiedAccount && (
                <button
                  onClick={() => copyValue(verifiedAccount)}
                  className="w-full border border-white/10 bg-white text-black p-4 text-left mt-5 hover:bg-white/80 transition-all"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-orbitron text-xs font-black uppercase mb-2">
                        Copy Connected Wallet
                      </p>
                      <p className="font-mono text-[10px] uppercase text-black/55">
                        Use in Wallet Dashboard
                      </p>
                    </div>

                    <Copy size={16} />
                  </div>
                </button>
              )}
            </div>

            <div className="border border-white/10 bg-white/[0.02] p-6">
              <div className="flex items-center gap-2 mb-5">
                <ShieldCheck size={18} className="text-white/60" />

                <p className="font-orbitron text-xs uppercase tracking-widest">
                  Safe Position
                </p>
              </div>

              <div className="space-y-3">
                <SafeLine text="No custody" />
                <SafeLine text="No broker" />
                <SafeLine text="No yield provider" />
                <SafeLine text="No trade execution" />
                <SafeLine text="User signs inside Xaman" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function RouteButton({
  route,
  isActive,
  onClick,
}: {
  route: RouteCard;
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = route.icon;

  return (
    <button
      onClick={onClick}
      className={`border p-5 text-left transition-all ${
        isActive
          ? "border-white bg-white text-black"
          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-5">
        <Icon
          size={24}
          className={isActive ? "text-black/70" : "text-white/55"}
        />

        <span
          className={`font-mono text-[9px] uppercase tracking-widest ${
            isActive ? "text-black/55" : "text-white/35"
          }`}
        >
          {route.label}
        </span>
      </div>

      <p className="font-orbitron text-sm font-black uppercase mb-3">
        {route.title}
      </p>

      <p
        className={`font-mono text-xs leading-relaxed mb-4 ${
          isActive ? "text-black/55" : "text-white/42"
        }`}
      >
        {route.text}
      </p>

      <div className="flex items-center justify-between gap-3">
        <p
          className={`font-orbitron text-xs font-black uppercase ${
            isActive ? "text-black" : "text-white"
          }`}
        >
          {route.xp}
        </p>

        <ArrowRight
          size={16}
          className={isActive ? "text-black/70" : "text-white/35"}
        />
      </div>
    </button>
  );
}

function StatusPill({
  isSigned,
  isCreating,
}: {
  isSigned: boolean;
  isCreating: boolean;
}) {
  const label = isSigned ? "Connected" : isCreating ? "Creating" : "Waiting";

  return (
    <div className="border border-white/10 bg-white/[0.03] px-3 py-2">
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${
            isSigned ? "bg-white" : "bg-white/25"
          }`}
        />

        <p className="font-mono text-[9px] uppercase tracking-widest text-white/55">
          {label}
        </p>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  text,
  icon: Icon,
}: {
  label: string;
  value: string;
  text: string;
  icon: ElementType;
}) {
  return (
    <div className="border border-white/10 bg-black/60 p-4">
      <Icon size={18} className="text-white/60 mb-3" />

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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/10 bg-white/[0.02] p-3">
      <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-2">
        {label}
      </p>

      <p className="font-orbitron text-xs font-black uppercase break-all">
        {value}
      </p>
    </div>
  );
}

function StepCard({ step }: { step: ConnectStep }) {
  const Icon = step.icon;

  return (
    <div className="border border-white/10 bg-black p-4">
      <div className="flex items-center justify-between gap-3 mb-4">
        <p className="font-orbitron text-xs font-black text-white/35">
          {step.number}
        </p>

        <Icon size={15} className="text-white/35" />
      </div>

      <p className="font-orbitron text-xs font-black uppercase mb-2">
        {step.title}
      </p>

      <p className="font-mono text-[10px] text-white/35 leading-relaxed">
        {step.text}
      </p>
    </div>
  );
}

function ActionButton({
  title,
  text,
  icon: Icon,
  disabled,
  onClick,
}: {
  title: string;
  text: string;
  icon: ElementType;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="border border-white/10 bg-white/[0.02] p-4 text-left hover:bg-white hover:text-black transition-all disabled:opacity-40 disabled:hover:bg-white/[0.02] disabled:hover:text-white group"
    >
      <Icon
        size={18}
        className={`mb-4 ${
          title.toLowerCase().includes("creating") ||
          title.toLowerCase().includes("verifying")
            ? "animate-spin"
            : ""
        }`}
      />

      <p className="font-orbitron text-xs font-black uppercase mb-2">
        {title}
      </p>

      <p className="font-mono text-[10px] uppercase text-white/35 group-hover:text-black/55">
        {text}
      </p>
    </button>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-white/10 py-3">
      <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-2">
        {label}
      </p>

      <p className="font-mono text-xs text-white/55 break-all">{value}</p>
    </div>
  );
}

function SafeLine({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 border border-white/10 bg-black p-3">
      <ShieldCheck size={14} className="text-white/40 shrink-0" />

      <p className="font-mono text-xs text-white/45 uppercase tracking-widest">
        {text}
      </p>
    </div>
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "error" in error) {
    const value = (error as { error?: unknown }).error;

    if (typeof value === "string") {
      return value;
    }
  }

  return "Xaman actie is mislukt.";
}
