import { useEffect, useState } from "react";
import type { ElementType, ReactNode } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  Fingerprint,
  KeyRound,
  Loader2,
  Lock,
  RefreshCcw,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { LanguageToggle } from "../components/LanguageToggle";
import { OTTLogo, OTTLogoMark, OTTProofBadge } from "../components/OTTLogo";
import {
  ACCESS_SOURCE_TAG,
  clearAccessState,
  getAccessSummary,
  isAccessVerified,
  loadAccessState,
  markAccessVerified,
  type AccessState,
} from "../lib/accessStore";
import {
  OTT_ACCESS_PASS_METADATA_CID,
  OTT_ACCESS_PASS_METADATA_URI,
  OTT_ACCESS_PASS_TAXON,
  buildOttAccessPassLabel,
  checkOttAccessPassOwnership,
  getAccessPassStatusLabel,
  shortNftId,
  type AccessPassOwnershipResult,
  type OttAccessPassNft,
} from "../lib/accessNftPass";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

type AccessGateTabProps = {
  walletAddress?: string;
};

type Metric = {
  label: string;
  value: string;
  text: string;
  icon: ElementType;
};

export function AccessGateTab({ walletAddress = "guest" }: AccessGateTabProps) {
  const { language, setLanguage, copy } = useTerminalLanguage();
  const c = copy.access;
  const common = copy.common;
  const isEnglish = language === "en";

  const [accessState, setAccessState] = useState<AccessState>(() =>
    loadAccessState(walletAddress),
  );
  const [statusMessage, setStatusMessage] = useState(
    isEnglish
      ? "Scanner-only Access Gate is ready. Connect Xaman and scan for the OTT Access Pass NFT."
      : "Scanner-only Access Gate is klaar. Connect Xaman en scan op de OTT Access Pass NFT.",
  );
  const [accessPassCheck, setAccessPassCheck] =
    useState<AccessPassOwnershipResult | null>(null);
  const [accessPassBusy, setAccessPassBusy] = useState(false);

  const summary = getAccessSummary(accessState);
  const verified =
    isAccessVerified(accessState) || Boolean(accessPassCheck?.hasAccessPass);
  const isGuest = !walletAddress || walletAddress === "guest";

  useEffect(() => {
    setAccessState(loadAccessState(walletAddress));
    setAccessPassCheck(null);
    setStatusMessage(
      isEnglish
        ? "Scanner-only Access Gate loaded. No payment, mint or claim flow is active."
        : "Scanner-only Access Gate geladen. Geen payment-, mint- of claimflow is actief.",
    );

    if (!isGuest) {
      void scanAccessPass({ automatic: true });
    }
  }, [walletAddress, language]);

  const metrics: Metric[] = [
    {
      label: "Access",
      value: verified ? c.accessUnlocked : c.accessLocked,
      text: "NFT scanner gate.",
      icon: verified ? ShieldCheck : Lock,
    },
    {
      label: common.sourceTag,
      value: String(ACCESS_SOURCE_TAG),
      text: "Campaign tag.",
      icon: Fingerprint,
    },
    {
      label: "Wallet",
      value: isGuest ? "Guest" : "Linked",
      text: "Xaman.",
      icon: Wallet,
    },
    {
      label: "NFT Pass",
      value: accessPassCheck?.hasAccessPass ? "Found" : "Scan",
      text: "Issuer + taxon + CID.",
      icon: KeyRound,
    },
  ];

  async function scanAccessPass(options?: { automatic?: boolean }) {
    if (isGuest) {
      setAccessPassCheck(null);

      if (!options?.automatic) {
        setStatusMessage(
          isEnglish
            ? "Connect with Xaman first. Then the terminal can scan this wallet for the OTT Access Pass NFT."
            : "Connect eerst met Xaman. Daarna kan de terminal deze wallet scannen op de OTT Access Pass NFT.",
        );
      }

      return;
    }

    setAccessPassBusy(true);

    if (!options?.automatic) {
      setStatusMessage(
        isEnglish
          ? "Scanning this wallet for the OTT Access Pass NFT..."
          : "Deze wallet wordt gescand op de OTT Access Pass NFT...",
      );
    }

    try {
      const result = await checkOttAccessPassOwnership(walletAddress);

      setAccessPassCheck(result);

      if (result.hasAccessPass && result.matchedNft) {
        const label = buildOttAccessPassLabel(result.matchedNft);

        const nextState = markAccessVerified({
          walletAddress,
          routeId: "ott-access-pass",
          txHash: result.matchedNft.nftokenId,
          durationDays: 36500,
          note: `${label} found. Issuer, taxon and metadata CID matched.`,
        });

        setAccessState(nextState);
        setStatusMessage(
          isEnglish
            ? `${label} found. Access unlocked automatically.`
            : `${label} gevonden. Access automatisch unlocked.`,
        );

        return;
      }

      setAccessState(loadAccessState(walletAddress));

      if (!options?.automatic) {
        setStatusMessage(getAccessPassStatusLabel(result));
      }
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? error.message
          : isEnglish
            ? "Access Pass scanner failed."
            : "Access Pass scanner is mislukt.",
      );
    } finally {
      setAccessPassBusy(false);
    }
  }

  function resetAccess() {
    const nextState = clearAccessState(walletAddress);

    setAccessState(nextState);
    setAccessPassCheck(null);
    setStatusMessage(
      isEnglish
        ? "Local Access Gate state reset. NFT ownership was not changed."
        : "Lokale Access Gate-status gereset. NFT ownership is niet gewijzigd.",
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#080808]">
      <section className="relative overflow-hidden border-b border-black/10 bg-[radial-gradient(circle_at_18%_18%,rgba(56,152,232,0.16),transparent_28%),radial-gradient(circle_at_82%_8%,rgba(200,56,136,0.16),transparent_28%),radial-gradient(circle_at_85%_82%,rgba(216,72,88,0.12),transparent_30%),#ffffff]">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.24),#ffffff_92%)]" />

        <div className="relative z-10 p-4 md:p-6 xl:p-10">
          <div className="flex justify-end mb-4">
            <LanguageToggle language={language} onChange={setLanguage} />
          </div>

          <div className="grid grid-cols-12 gap-6 items-center">
            <div className="col-span-12 xl:col-span-8">
              <div className="mb-6 text-[#080808]">
                <OTTLogo
                  size="lg"
                  subtitle={
                    isEnglish
                      ? "Scanner-only Access Gate"
                      : "Scanner-only Access Gate"
                  }
                />
              </div>

              <div className="inline-flex items-center gap-2 border border-black/10 bg-white/80 shadow-sm px-4 py-2 mb-6">
                <KeyRound size={15} className="text-[#C83888]" />

                <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/55">
                  ACCESS PASS VERIFICATION
                </p>
              </div>

              <h1 className="font-orbitron text-4xl md:text-5xl xl:text-6xl font-black uppercase leading-none tracking-tight mb-6">
                {isEnglish ? "Scan." : "Scan."}
                <br />
                <span className="bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] bg-clip-text text-transparent">
                  {isEnglish ? "Verify Pass." : "Verifieer Pass."}
                </span>
                <br />
                {isEnglish ? "Unlock." : "Unlock."}
              </h1>

              <p className="font-mono text-sm xl:text-base text-black/60 max-w-3xl leading-relaxed">
                {isEnglish
                  ? "This V1 Access Gate only scans the connected wallet for the exact OTT Access Pass NFT. It does not create payments, mint NFTs, claim tokens or move XRP."
                  : "Deze V1 Access Gate scant alleen de gekoppelde wallet op de exacte OTT Access Pass NFT. Hij maakt geen betalingen, mint geen NFT's, claimt geen tokens en verplaatst geen XRP."}
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
            <FlowCard number="02" title="Scan" text="account_nfts" />
            <FlowCard number="03" title="Match" text="Issuer + taxon + CID" />
            <FlowCard number="04" title="Unlock" text="Access Pass holder" />
          </div>
        </div>
      </section>

      <section className="p-4 md:p-6 xl:p-10 bg-white">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-4 space-y-4">
            <Panel>
              <div className="flex items-center gap-2 mb-5">
                <SearchCheck size={18} className="text-[#3898E8]" />

                <p className="font-orbitron text-xs uppercase tracking-widest">
                  Access NFT Scanner
                </p>
              </div>

              <div className="space-y-3 mb-5">
                <MiniStatus
                  label="Wallet"
                  value={isGuest ? "Connect Xaman first" : walletAddress}
                />
                <MiniStatus label="Taxon" value={String(OTT_ACCESS_PASS_TAXON)} />
                <MiniStatus label="Metadata CID" value={OTT_ACCESS_PASS_METADATA_CID} />
              </div>

              <button
                onClick={() => void scanAccessPass()}
                disabled={accessPassBusy || isGuest}
                className="w-full border border-black/10 bg-white p-4 text-left hover:bg-[#F7F8FC] disabled:opacity-40 transition-all mb-5"
              >
                <div className="flex items-center gap-3">
                  {accessPassBusy ? (
                    <Loader2 size={17} className="text-[#C83888] animate-spin" />
                  ) : (
                    <RefreshCcw size={17} className="text-[#3898E8]" />
                  )}

                  <div>
                    <p className="font-orbitron text-xs font-bold uppercase text-black">
                      {accessPassBusy
                        ? isEnglish
                          ? "Scanning NFT Pass"
                          : "NFT Pass scannen"
                        : isEnglish
                          ? "Scan Access Pass"
                          : "Scan Access Pass"}
                    </p>

                    <p className="font-mono text-[10px] text-black/40 uppercase">
                      Issuer + taxon + metadata CID
                    </p>
                  </div>
                </div>
              </button>

              {accessPassCheck?.matchedNft ? (
                <AccessPassCard nft={accessPassCheck.matchedNft} />
              ) : accessPassCheck ? (
                <div className="border border-[#D84858]/25 bg-[#D84858]/10 p-4">
                  <p className="font-mono text-xs text-black/60 leading-relaxed">
                    {getAccessPassStatusLabel(accessPassCheck)}
                  </p>
                </div>
              ) : (
                <div className="border border-black/10 bg-[#F7F8FC] p-4">
                  <p className="font-mono text-xs text-black/55 leading-relaxed">
                    {isEnglish
                      ? "After Xaman login this scanner checks account_nfts for the exact Access Pass issuer, taxon and metadata CID."
                      : "Na Xaman login checkt deze scanner account_nfts op de exacte Access Pass issuer, taxon en metadata CID."}
                  </p>
                </div>
              )}
            </Panel>

            <Panel>
              <div className="flex items-center gap-2 mb-5">
                <ShieldCheck size={18} className="text-[#3898E8]" />

                <p className="font-orbitron text-xs uppercase tracking-widest">
                  {isEnglish ? "Safe V1 Scope" : "Veilige V1-scope"}
                </p>
              </div>

              <div className="space-y-3">
                <InfoLine
                  text={
                    isEnglish
                      ? "No mint function is active."
                      : "Geen mintfunctie actief."
                  }
                />
                <InfoLine
                  text={
                    isEnglish
                      ? "No Access payment is created from this screen."
                      : "Geen Access-betaling vanuit dit scherm."
                  }
                />
                <InfoLine
                  text={
                    isEnglish
                      ? "No XRP, RLUSD, trustline or token action is triggered."
                      : "Geen XRP-, RLUSD-, trustline- of tokenactie wordt gestart."
                  }
                />
                <InfoLine
                  text={
                    isEnglish
                      ? "Access is unlocked only when the exact NFT is found in the connected wallet."
                      : "Access unlockt alleen wanneer de exacte NFT in de gekoppelde wallet wordt gevonden."
                  }
                />
              </div>
            </Panel>
          </div>

          <div className="col-span-12 xl:col-span-5 space-y-4">
            <Panel>
              <div className="flex items-center gap-2 mb-5">
                {verified ? (
                  <ShieldCheck size={18} className="text-[#3898E8]" />
                ) : (
                  <Lock size={18} className="text-[#D84858]" />
                )}

                <p className="font-orbitron text-xs uppercase tracking-widest">
                  {isEnglish ? "Access Status" : "Accessstatus"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
                <MiniStatus
                  label="Status"
                  value={verified ? common.verified : accessState.status}
                />
                <MiniStatus
                  label="Route"
                  value={summary.selectedRoute?.label ?? "Access Pass"}
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

              <div
                className={`border p-5 ${
                  verified
                    ? "border-[#3898E8]/25 bg-[#3898E8]/10"
                    : "border-[#D84858]/25 bg-[#D84858]/10"
                }`}
              >
                <div className="flex items-start gap-3">
                  {verified ? (
                    <BadgeCheck
                      size={20}
                      className="text-[#3898E8] mt-0.5 shrink-0"
                    />
                  ) : (
                    <Lock
                      size={20}
                      className="text-[#D84858] mt-0.5 shrink-0"
                    />
                  )}

                  <p className="font-mono text-sm text-black/60 leading-relaxed">
                    {verified
                      ? isEnglish
                        ? "Access Pass verified. Premium terminal areas may now unlock for this wallet."
                        : "Access Pass geverifieerd. Premium terminaldelen kunnen nu unlocken voor deze wallet."
                      : isEnglish
                        ? "No matching Access Pass found yet. Free preview remains available."
                        : "Nog geen matchende Access Pass gevonden. Free preview blijft beschikbaar."}
                  </p>
                </div>
              </div>
            </Panel>

            <Panel>
              <div className="flex items-center gap-2 mb-5">
                <KeyRound size={18} className="text-[#C83888]" />

                <p className="font-orbitron text-xs uppercase tracking-widest">
                  {isEnglish ? "Exact NFT Match" : "Exacte NFT-match"}
                </p>
              </div>

              <div className="space-y-3">
                <MiniStatus label="SourceTag" value={String(ACCESS_SOURCE_TAG)} />
                <MiniStatus label="Taxon" value={String(OTT_ACCESS_PASS_TAXON)} />
                <MiniStatus label="Metadata URI" value={OTT_ACCESS_PASS_METADATA_URI} />
                <MiniStatus label="Metadata CID" value={OTT_ACCESS_PASS_METADATA_CID} />
              </div>

              <div className="border border-black/10 bg-[#F7F8FC] p-4 mt-5">
                <p className="font-mono text-xs text-black/55 leading-relaxed">
                  {isEnglish
                    ? "The scanner requires issuer, NFTokenTaxon and metadata CID to match. A random NFT in the wallet does not unlock access."
                    : "De scanner vereist dat issuer, NFTokenTaxon en metadata CID matchen. Een willekeurige NFT in de wallet unlockt geen toegang."}
                </p>
              </div>
            </Panel>
          </div>

          <div className="col-span-12 xl:col-span-3 space-y-4">
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

              <button
                onClick={resetAccess}
                className="w-full border border-black/10 bg-white p-4 mt-4 text-left hover:bg-[#F7F8FC] transition-all"
              >
                <p className="font-orbitron text-xs font-bold uppercase mb-2 text-black">
                  {common.reset} Access
                </p>

                <p className="font-mono text-[10px] text-black/40 uppercase">
                  Local state only
                </p>
              </button>
            </Panel>

            <Panel>
              <div className="flex items-center gap-2 mb-5">
                <Sparkles size={18} className="text-[#C83888]" />

                <p className="font-orbitron text-xs uppercase tracking-widest">
                  {isEnglish ? "Giveaway Ready" : "Giveaway Ready"}
                </p>
              </div>

              <p className="font-mono text-xs text-black/55 leading-relaxed">
                {isEnglish
                  ? "When you manually distribute Access Pass NFTs later, this gate can already recognize holders without activating a mint or payment function."
                  : "Wanneer je later handmatig Access Pass NFT's uitdeelt, kan deze gate holders al herkennen zonder mint- of paymentfunctie te activeren."}
              </p>
            </Panel>
          </div>
        </div>
      </section>
    </div>
  );
}

function Panel({ children }: { children: ReactNode }) {
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

function InfoLine({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <CheckCircle2 size={14} className="text-[#3898E8] mt-0.5 shrink-0" />

      <p className="font-mono text-xs text-black/55 leading-relaxed">{text}</p>
    </div>
  );
}

function AccessPassCard({ nft }: { nft: OttAccessPassNft }) {
  return (
    <div className="border border-[#3898E8]/25 bg-[#3898E8]/10 p-4">
      <div className="flex items-start gap-3 mb-4">
        <BadgeCheck size={18} className="text-[#3898E8] shrink-0 mt-0.5" />

        <div className="min-w-0">
          <p className="font-orbitron text-sm font-black uppercase text-black mb-2">
            {buildOttAccessPassLabel(nft)}
          </p>

          <p className="font-mono text-[10px] text-black/45 uppercase break-all">
            {shortNftId(nft.nftokenId)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <MiniStatus label="Issuer" value={nft.issuer} />
        <MiniStatus label="Taxon" value={String(nft.taxon)} />
        <MiniStatus
          label="Serial"
          value={nft.serial ? String(nft.serial) : "No serial returned"}
        />
        <MiniStatus
          label="Metadata URI"
          value={nft.decodedUri || OTT_ACCESS_PASS_METADATA_URI}
        />
      </div>
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

export default AccessGateTab;
