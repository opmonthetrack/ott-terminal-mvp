import { useEffect, useMemo, useState, type ElementType } from "react";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Copy,
  ExternalLink,
  Fingerprint,
  GraduationCap,
  KeyRound,
  Loader2,
  LockKeyhole,
  QrCode,
  RefreshCcw,
  ShieldCheck,
  Smartphone,
  Trophy,
  Wallet,
  XCircle,
  Zap,
} from "lucide-react";
import { OTTLogo, OTTProofBadge } from "../components/OTTLogo";
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
import {
  isMobileDevice,
  openXamanMobileDeepLink,
  saveXamanMobileSession,
} from "../lib/xamanMobileSession";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

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

function getConnectRoutes(language: string): RouteCard[] {
  return [
    {
      id: "source-tag-proof",
      title: "SourceTag Proof Connect",
      label: language === "en" ? "Recommended" : "Aanbevolen",
      text:
        language === "en"
          ? "Best first step for the Make Waves demo: connect, sign and prove the OTT SourceTag."
          : "Beste eerste stap voor de Make Waves demo: connect, teken en bewijs de OTT SourceTag.",
      xp: "+15 XP",
      icon: Fingerprint,
    },
    {
      id: "daily-checkin",
      title: "Daily Check-In",
      label: language === "en" ? "Activity" : "Activiteit",
      text:
        language === "en"
          ? "After connecting, use this route to create daily Mainnet proof and earn XP."
          : "Na connect gebruik je deze route voor dagelijkse Mainnet proof en XP.",
      xp: "+10 XP",
      icon: Activity,
    },
  ];
}

function getConnectSteps(language: string): ConnectStep[] {
  return [
    {
      number: "01",
      title: language === "en" ? "Create Payload" : "Payload maken",
      text:
        language === "en"
          ? "Terminal creates a safe Xaman request with the OTT Make Waves SourceTag."
          : "Terminal maakt een veilige Xaman request met de OTT Make Waves SourceTag.",
      icon: QrCode,
    },
    {
      number: "02",
      title: language === "en" ? "Open Xaman" : "Open Xaman",
      text:
        language === "en"
          ? "Mobile opens the Xaman app directly through a deeplink."
          : "Mobiel opent direct de Xaman app via deeplink.",
      icon: Smartphone,
    },
    {
      number: "03",
      title: language === "en" ? "Sign" : "Tekenen",
      text:
        language === "en"
          ? "The user signs inside Xaman. No custody."
          : "Gebruiker tekent zelf in Xaman. Geen custody.",
      icon: KeyRound,
    },
    {
      number: "04",
      title: language === "en" ? "Return + Verify" : "Terug + Verify",
      text:
        language === "en"
          ? "After returning, Terminal verifies the account, signature and proof route."
          : "Na terugkeer verifieert Terminal account, signature en proof-route.",
      icon: BadgeCheck,
    },
  ];
}

export function XamanCenterTab({
  walletAddress = "guest",
  onWalletConnected,
}: XamanCenterTabProps) {
  const { language, copy } = useTerminalLanguage();
  const xamanCopy = copy.xaman;
  const common = copy.common;

  const connectRoutes = useMemo(() => getConnectRoutes(language), [language]);
  const connectSteps = useMemo(() => getConnectSteps(language), [language]);

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
  const [mobileStatus, setMobileStatus] = useState(
    isMobileDevice()
      ? xamanCopy.mobileStatusReady
      : xamanCopy.desktopStatusReady,
  );

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

  async function createPayload(options?: { openAfterCreate?: boolean }) {
    setIsCreating(true);
    setError("");
    setVerificationResponse(null);
    setMobileStatus(xamanCopy.creatingPayload);

    try {
      const response =
        selectedRoute === "source-tag-proof"
          ? await createSourceTagProofPayload(
              walletAddress === "guest" ? undefined : walletAddress,
            )
          : await createDailyCheckInPayload(
              walletAddress === "guest" ? undefined : walletAddress,
            );

      const uuid = getXamanPayloadUuid(response);
      const url = getXamanPayloadUrl(response);

      if (uuid) {
        saveXamanMobileSession({
          payloadUuid: uuid,
          actionId: selectedActionId,
          returnTarget: "wallet",
          expectedWallet: walletAddress === "guest" ? undefined : walletAddress,
        });
      }

      setPayloadResponse(response);
      setMobileStatus(
        isMobileDevice()
          ? xamanCopy.openingXaman
          : "Payload created. Scan QR or open Xaman link.",
      );

      if (options?.openAfterCreate) {
        const opened = openXamanMobileDeepLink(url);

        if (!opened) {
          setMobileStatus("Payload created, but no Xaman link was found.");
        }
      }
    } catch (createError) {
      setError(getErrorMessage(createError, language));
      setMobileStatus(
        language === "en"
          ? "Could not create Xaman payload."
          : "Kon Xaman payload niet aanmaken.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function createAndOpenMobile() {
    await createPayload({ openAfterCreate: true });
  }

  async function verifyPayload(showLoading = true) {
    if (!payloadUuid) {
      setError(
        language === "en"
          ? "Create a Xaman payload first."
          : "Maak eerst een Xaman payload aan.",
      );
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

      if (response.verified?.signed && response.verified?.account) {
        setMobileStatus(xamanCopy.signatureFound);
        onWalletConnected?.(response.verified.account);
      } else if (response.verified?.resolved && !response.verified?.signed) {
        setMobileStatus(xamanCopy.rejectedExpired);
      } else {
        setMobileStatus(xamanCopy.signingWaiting);
      }
    } catch (verifyError) {
      setError(getErrorMessage(verifyError, language));
      setMobileStatus(
        language === "en"
          ? "Could not verify Xaman payload."
          : "Kon Xaman payload niet verifiëren.",
      );
    } finally {
      setIsVerifying(false);
    }
  }

  function resetFlow() {
    setPayloadResponse(null);
    setVerificationResponse(null);
    setError("");
    setLastVerifiedAt("not verified");
    setMobileStatus(
      isMobileDevice()
        ? xamanCopy.mobileStatusReady
        : xamanCopy.desktopStatusReady,
    );
  }

  function openPayload() {
    const opened = openXamanPayload(payloadResponse);

    if (!opened) {
      setError(
        language === "en"
          ? "No Xaman deeplink found."
          : "Geen Xaman deeplink gevonden.",
      );
      setMobileStatus(
        language === "en"
          ? "Open Xaman failed. Use QR or create a new payload."
          : "Open Xaman is mislukt. Gebruik QR of maak een nieuwe payload.",
      );
      return;
    }

    setMobileStatus(
      language === "en"
        ? "Xaman opened. Return here after signing."
        : "Xaman geopend. Kom hier terug na het tekenen.",
    );
  }

  function copyValue(value: string | null) {
    if (!value) {
      return;
    }

    void navigator.clipboard?.writeText(value);
  }

  return (
    <div className="min-h-screen bg-white text-[#080808]">
      <section className="relative overflow-hidden border-b border-black/10 bg-[radial-gradient(circle_at_18%_18%,rgba(56,152,232,0.16),transparent_28%),radial-gradient(circle_at_82%_8%,rgba(200,56,136,0.16),transparent_28%),radial-gradient(circle_at_85%_82%,rgba(216,72,88,0.12),transparent_30%),#ffffff]">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.24),#ffffff_92%)]" />

        <div className="relative z-10 p-4 md:p-6 xl:p-10">
          <div className="grid grid-cols-12 gap-6 items-end">
            <div className="col-span-12 xl:col-span-8">
              <div className="mb-6 text-[#080808]">
                <OTTLogo size="lg" />
              </div>

              <div className="inline-flex items-center gap-2 border border-black/10 bg-white/80 shadow-sm px-4 py-2 mb-6">
                <KeyRound size={15} className="text-[#C83888]" />

                <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/55">
                  {xamanCopy.eyebrow}
                </p>
              </div>

              <h1 className="font-orbitron text-4xl xl:text-6xl font-black uppercase leading-none tracking-tight mb-6">
                {language === "en" ? "Connect" : "Connect"}
                <br />
                <span className="bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] bg-clip-text text-transparent">
                  Xaman.
                </span>
                <br />
                {language === "en" ? "Prove SourceTag." : "Bewijs SourceTag."}
              </h1>

              <p className="font-mono text-sm xl:text-base text-black/60 leading-relaxed max-w-3xl mb-8">
                {language === "en"
                  ? "This is the first step of the Make Waves journey. Xaman stays self-custody, OTT never sees private keys, and the terminal only verifies signed proof with SourceTag 2606170002."
                  : "Dit is de eerste stap van de Make Waves journey. Xaman blijft self-custody, OTT ziet nooit private keys en de terminal verifieert alleen signed proof met SourceTag 2606170002."}
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
              <div className="border border-black/10 bg-white/90 backdrop-blur p-5 shadow-xl shadow-black/5">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <p className="font-orbitron text-xs uppercase tracking-widest">
                    Connect Status
                  </p>

                  <StatusPill isSigned={isSigned} isCreating={isCreating} />
                </div>

                <div className="mb-4 text-[#080808]">
                  <OTTProofBadge sourceTag={String(MAKE_WAVES_SOURCE_TAG)} />
                </div>

                <div className="space-y-3">
                  <InfoRow
                    label="Current Wallet"
                    value={walletAddress === "guest" ? common.guestMode : walletAddress}
                  />
                  <InfoRow
                    label="Signed Account"
                    value={verifiedAccount ?? "Not connected"}
                  />
                  <InfoRow label="Mobile Flow" value={mobileStatus} />
                  <InfoRow label="Verified At" value={lastVerifiedAt} />
                </div>

                <div className="border border-black/10 bg-[#F7F8FC] p-4 mt-5">
                  <div className="flex items-start gap-3">
                    <LockKeyhole size={18} className="text-[#C83888] shrink-0 mt-0.5" />

                    <p className="font-mono text-xs text-black/55 leading-relaxed">
                      {language === "en"
                        ? "Xaman stays self-custody. OTT Terminal never asks for private keys and never stores a seed phrase."
                        : "Xaman blijft self-custody. OTT Terminal vraagt nooit om private keys en bewaart geen seed phrase."}
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
              text="Stored for mobile return"
              icon={QrCode}
            />
            <MetricCard
              label="Xaman"
              value={isSigned ? "Signed" : "Waiting"}
              text="Self-custody"
              icon={Wallet}
            />
            <MetricCard
              label={common.sourceTag}
              value={String(MAKE_WAVES_SOURCE_TAG)}
              text="OTT proof"
              icon={Fingerprint}
            />
            <MetricCard
              label="Next"
              value={verifiedAccount ? "Check-In" : "Connect"}
              text="Demo route"
              icon={Zap}
            />
          </div>
        </div>
      </section>

      <section className="p-4 md:p-6 xl:p-10 bg-white">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-7 border border-black/10 bg-white p-4 md:p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/35 mb-3">
                  Xaman Flow
                </p>

                <h2 className="font-orbitron text-2xl font-black uppercase">
                  Mobile-First Sign Request
                </h2>
              </div>

              <p className="font-mono text-xs text-black/45 max-w-md leading-relaxed">
                {language === "en"
                  ? "On mobile, use the large button below. QR remains available as a fallback for desktop or if the deeplink does not open."
                  : "Op mobiel gebruik je vooral de grote knop hieronder. QR blijft als fallback voor desktop of als deeplink niet opent."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
              {connectSteps.map((step) => (
                <StepCard key={step.number} step={step} />
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              <TrustBox
                icon={ShieldCheck}
                title={language === "en" ? "Self-Custody" : "Self-Custody"}
                text={
                  language === "en"
                    ? "You sign inside Xaman. OTT never controls your wallet."
                    : "Je tekent in Xaman. OTT beheert nooit je wallet."
                }
              />
              <TrustBox
                icon={Fingerprint}
                title="SourceTag"
                text={`2606170002 · ${language === "en" ? "Make Waves proof identity" : "Make Waves proof identity"}`}
              />
              <TrustBox
                icon={GraduationCap}
                title={language === "en" ? "Education First" : "Education First"}
                text={
                  language === "en"
                    ? "Connect first, learn the action, then prove it."
                    : "Eerst connecten, actie begrijpen, daarna bewijzen."
                }
              />
            </div>

            <button
              onClick={createAndOpenMobile}
              disabled={isCreating}
              className="w-full bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] text-white p-5 md:p-6 text-left hover:brightness-95 transition-all disabled:opacity-50 mb-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-orbitron text-base md:text-lg font-black uppercase mb-2">
                    {isCreating ? xamanCopy.creatingPayload : xamanCopy.connectButton}
                  </p>
                  <p className="font-mono text-xs uppercase text-white/75 tracking-widest">
                    {xamanCopy.connectButtonText}
                  </p>
                </div>

                {isCreating ? (
                  <Loader2 size={24} className="animate-spin shrink-0" />
                ) : (
                  <Smartphone size={24} className="shrink-0" />
                )}
              </div>
            </button>

            <div className="border border-black/10 bg-[#F7F8FC] p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <ActionButton
                  title={isCreating ? common.loading : xamanCopy.createOnly}
                  text="Generate QR fallback"
                  icon={isCreating ? Loader2 : QrCode}
                  disabled={isCreating}
                  onClick={() => void createPayload()}
                />

                <ActionButton
                  title={xamanCopy.openXaman}
                  text="Open saved deeplink"
                  icon={ExternalLink}
                  disabled={!payloadUrl}
                  onClick={openPayload}
                />

                <ActionButton
                  title={isVerifying ? common.loading : xamanCopy.verify}
                  text="Check signed payload"
                  icon={isVerifying ? Loader2 : RefreshCcw}
                  disabled={!payloadUuid || isVerifying}
                  onClick={() => void verifyPayload(true)}
                />
              </div>
            </div>

            {error && (
              <div className="border border-[#D84858]/25 bg-[#D84858]/10 p-4 mb-4">
                <div className="flex items-start gap-3">
                  <XCircle size={18} className="text-[#D84858] shrink-0 mt-0.5" />

                  <p className="font-mono text-xs text-black/60 leading-relaxed">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {payloadResponse && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="border border-black/10 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <p className="font-orbitron text-xs font-black uppercase">
                      Payload Details
                    </p>

                    <button
                      onClick={() => copyValue(payloadUuid)}
                      className="border border-black/10 p-2 hover:bg-[#F7F8FC] transition-all"
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

                <div className="border border-black/10 bg-white p-5 shadow-sm">
                  <p className="font-orbitron text-xs font-black uppercase mb-4">
                    {xamanCopy.qrFallback}
                  </p>

                  {payloadQr ? (
                    <div className="bg-white border border-black/10 p-4 inline-block">
                      <img
                        src={payloadQr}
                        alt="Xaman payload QR"
                        className="w-48 h-48 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="border border-black/10 bg-[#F7F8FC] p-8 text-center">
                      <QrCode size={28} className="mx-auto mb-4 text-black/35" />

                      <p className="font-mono text-xs text-black/35">
                        {language === "en"
                          ? "QR not found in payload response."
                          : "QR niet gevonden in payload response."}
                      </p>
                    </div>
                  )}

                  {payloadUrl && (
                    <button
                      onClick={() => copyValue(payloadUrl)}
                      className="w-full border border-black/10 bg-[#F7F8FC] p-4 text-left hover:bg-white transition-all mt-4"
                    >
                      <p className="font-orbitron text-xs font-black uppercase mb-2">
                        Copy Xaman Link
                      </p>
                      <p className="font-mono text-[10px] uppercase text-black/40">
                        Fallback if app does not open
                      </p>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="col-span-12 xl:col-span-5 space-y-4">
            <div className="border border-black/10 bg-white p-4 md:p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                {isSigned ? (
                  <CheckCircle2 size={18} className="text-[#3898E8]" />
                ) : (
                  <BadgeCheck size={18} className="text-[#C83888]" />
                )}

                <p className="font-orbitron text-xs uppercase tracking-widest">
                  Verification Result
                </p>
              </div>

              <div className="border border-black/10 bg-[#F7F8FC] p-4 mb-4">
                <p className="font-mono text-xs text-black/55 leading-relaxed">
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
                <InfoRow label="Account" value={verifiedAccount ?? "—"} />
                <InfoRow
                  label="TXID"
                  value={verificationResponse?.verified?.txid ?? "—"}
                />
              </div>

              {verifiedAccount && (
                <button
                  onClick={() => copyValue(verifiedAccount)}
                  className="w-full bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] text-white p-4 text-left mt-5 hover:brightness-95 transition-all"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-orbitron text-xs font-black uppercase mb-2">
                        Copy Connected Wallet
                      </p>
                      <p className="font-mono text-[10px] uppercase text-white/75">
                        Wallet Dashboard opens automatically
                      </p>
                    </div>

                    <Copy size={16} />
                  </div>
                </button>
              )}
            </div>

            <div className="border border-black/10 bg-white p-4 md:p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <ShieldCheck size={18} className="text-[#3898E8]" />

                <p className="font-orbitron text-xs uppercase tracking-widest">
                  {xamanCopy.safeTitle}
                </p>
              </div>

              <div className="space-y-3">
                {xamanCopy.safeLines.map((line) => (
                  <SafeLine key={line} text={line} />
                ))}
              </div>
            </div>

            <div className="border border-black/10 bg-white p-4 md:p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <Trophy size={18} className="text-[#C83888]" />

                <p className="font-orbitron text-xs uppercase tracking-widest">
                  Make Waves Demo Route
                </p>
              </div>

              <div className="space-y-3">
                <SafeLine
                  text={
                    language === "en"
                      ? "1. Connect Xaman with SourceTag proof"
                      : "1. Connect Xaman met SourceTag proof"
                  }
                />
                <SafeLine
                  text={
                    language === "en"
                      ? "2. Go to Daily Check-In for Mainnet proof"
                      : "2. Ga naar Daily Check-In voor Mainnet proof"
                  }
                />
                <SafeLine
                  text={
                    language === "en"
                      ? "3. Show XP and OTT Credits in Reward Ledger"
                      : "3. Toon XP en OTT Credits in Reward Ledger"
                  }
                />
                <SafeLine
                  text={
                    language === "en"
                      ? "4. Verify tx hash on the SourceTag page"
                      : "4. Verifieer tx hash op de SourceTag pagina"
                  }
                />
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
      className={`border p-5 text-left transition-all shadow-sm ${
        isActive
          ? "border-[#C83888] bg-[#C83888]/10 text-black"
          : "border-black/10 bg-white hover:bg-[#F7F8FC]"
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-5">
        <Icon
          size={24}
          className={isActive ? "text-[#C83888]" : "text-black/45"}
        />

        <span
          className={`font-mono text-[9px] uppercase tracking-widest ${
            isActive ? "text-[#C83888]" : "text-black/35"
          }`}
        >
          {route.label}
        </span>
      </div>

      <p className="font-orbitron text-sm font-black uppercase mb-3">
        {route.title}
      </p>

      <p className="font-mono text-xs leading-relaxed mb-4 text-black/55">
        {route.text}
      </p>

      <div className="flex items-center justify-between gap-3">
        <p className="font-orbitron text-xs font-black uppercase text-black">
          {route.xp}
        </p>

        <ArrowRight size={16} className="text-black/35" />
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
    <div className="border border-black/10 bg-[#F7F8FC] px-3 py-2">
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${
            isSigned ? "bg-[#3898E8]" : "bg-black/25"
          }`}
        />

        <p className="font-mono text-[9px] uppercase tracking-widest text-black/55">
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
    <div className="border border-black/10 bg-white/90 p-4 shadow-sm">
      <Icon size={18} className="text-[#C83888] mb-3" />

      <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">
        {label}
      </p>

      <p className="font-orbitron text-sm font-black uppercase mb-1 break-all">
        {value}
      </p>

      <p className="font-mono text-[10px] text-black/35 uppercase">{text}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-3">
      <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">
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
    <div className="border border-black/10 bg-white p-4">
      <div className="flex items-center justify-between gap-3 mb-4">
        <p className="font-orbitron text-xs font-black text-[#C83888]">
          {step.number}
        </p>

        <Icon size={15} className="text-black/35" />
      </div>

      <p className="font-orbitron text-xs font-black uppercase mb-2">
        {step.title}
      </p>

      <p className="font-mono text-[10px] text-black/45 leading-relaxed">
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
      className="border border-black/10 bg-white p-4 text-left hover:bg-[#F7F8FC] transition-all disabled:opacity-40 group"
    >
      <Icon
        size={18}
        className={`mb-4 text-[#C83888] ${
          title.toLowerCase().includes("loading") ||
          title.toLowerCase().includes("creating") ||
          title.toLowerCase().includes("verifying")
            ? "animate-spin"
            : ""
        }`}
      />

      <p className="font-orbitron text-xs font-black uppercase mb-2">
        {title}
      </p>

      <p className="font-mono text-[10px] uppercase text-black/40">
        {text}
      </p>
    </button>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-black/10 py-3">
      <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">
        {label}
      </p>

      <p className="font-mono text-xs text-black/55 break-all">{value}</p>
    </div>
  );
}

function TrustBox({
  icon: Icon,
  title,
  text,
}: {
  icon: ElementType;
  title: string;
  text: string;
}) {
  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-4">
      <Icon size={18} className="text-[#C83888] mb-3" />

      <p className="font-orbitron text-xs font-black uppercase mb-2">
        {title}
      </p>

      <p className="font-mono text-xs text-black/55 leading-relaxed">
        {text}
      </p>
    </div>
  );
}

function SafeLine({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 border border-black/10 bg-[#F7F8FC] p-3">
      <ShieldCheck size={14} className="text-[#3898E8] shrink-0" />

      <p className="font-mono text-xs text-black/55 uppercase tracking-widest">
        {text}
      </p>
    </div>
  );
}

function getErrorMessage(error: unknown, language: string) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "error" in error) {
    const value = (error as { error?: unknown }).error;

    if (typeof value === "string") {
      return value;
    }
  }

  return language === "en"
    ? "Xaman action failed."
    : "Xaman actie is mislukt.";
}
