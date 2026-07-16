import { useEffect, useState } from "react";
import type { ElementType, ReactNode } from "react";
import {
  BadgeCheck,
  Banknote,
  CheckCircle2,
  Fingerprint,
  KeyRound,
  Loader2,
  Lock,
  RefreshCcw,
  SearchCheck,
  ShieldCheck,
  Smartphone,
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

type RouteCardData = {
  icon: ElementType;
  title: string;
  status: string;
  text: string;
  lines: string[];
};

export function AccessGateTab({ walletAddress = "guest" }: AccessGateTabProps) {
  const { language, setLanguage } = useTerminalLanguage();
  const isEnglish = language === "en";

  const [accessState, setAccessState] = useState<AccessState>(() =>
    loadAccessState(walletAddress),
  );
  const [statusMessage, setStatusMessage] = useState(
    isEnglish
      ? "Access Gate V1 is scanner-only. Fiat/Web2 access is explained as coming soon; no payment or crypto conversion runs here."
      : "Access Gate V1 is scanner-only. Fiat/Web2 access wordt uitgelegd als coming soon; er loopt hier geen betaling of crypto-conversie.",
  );
  const [accessPassCheck, setAccessPassCheck] =
    useState<AccessPassOwnershipResult | null>(null);
  const [accessPassBusy, setAccessPassBusy] = useState(false);

  const isGuest = !walletAddress || walletAddress === "guest";
  const summary = getAccessSummary(accessState);
  const verified =
    isAccessVerified(accessState) || Boolean(accessPassCheck?.hasAccessPass);

  useEffect(() => {
    setAccessState(loadAccessState(walletAddress));
    setAccessPassCheck(null);
    setStatusMessage(
      isEnglish
        ? "Access Gate loaded. Guests can read the access model; connected Xaman users can scan for the XRPL Access Pass."
        : "Access Gate geladen. Guests kunnen het toegangsmodel lezen; gekoppelde Xaman users kunnen scannen op de XRPL Access Pass.",
    );

    if (!isGuest) {
      void scanAccessPass({ automatic: true });
    }
  }, [walletAddress, language]);

  const metrics: Metric[] = [
    {
      label: "Access",
      value: verified ? "Unlocked" : "Preview",
      text: verified ? "Access pass found." : "Free area active.",
      icon: verified ? ShieldCheck : Lock,
    },
    {
      label: "Fiat Route",
      value: "Coming Soon",
      text: "Web2 license, no swap.",
      icon: Banknote,
    },
    {
      label: "Wallet",
      value: isGuest ? "Optional" : "Linked",
      text: isGuest ? "No Xaman required to learn." : "Xaman scan ready.",
      icon: Wallet,
    },
    {
      label: "NFT Pass",
      value: accessPassCheck?.hasAccessPass ? "Found" : "Scanner",
      text: "Issuer + taxon + CID.",
      icon: KeyRound,
    },
  ];

  const accessRoutes: RouteCardData[] = [
    {
      icon: ShieldCheck,
      title: isEnglish ? "Free Public Access" : "Gratis Publieke Toegang",
      status: "Open",
      text: isEnglish
        ? "People can use the education and intelligence layer without Xaman."
        : "Mensen kunnen de educatie- en intelligence-laag gebruiken zonder Xaman.",
      lines: isEnglish
        ? ["Home, XRPL Intelligence, Newsroom preview", "Academy preview and SourceTag explanation", "No wallet required for reading and learning"]
        : ["Home, XRPL Intelligence, Newsroom preview", "Academy preview en SourceTag uitleg", "Geen wallet nodig voor lezen en leren"],
    },
    {
      icon: Smartphone,
      title: isEnglish ? "Xaman User Access" : "Xaman User Toegang",
      status: "Proof",
      text: isEnglish
        ? "Users who activate and connect Xaman can create proof, XP and wallet-native actions."
        : "Users die Xaman activeren en koppelen kunnen proof, XP en wallet-native acties gebruiken.",
      lines: isEnglish
        ? ["Xaman Activation guide", "Daily Check-In and Reward Ledger", "XRPL Verify and SourceTag proof"]
        : ["Xaman Activatie guide", "Daily Check-In en Reward Ledger", "XRPL Verify en SourceTag proof"],
    },
    {
      icon: Banknote,
      title: isEnglish ? "Web2 Access License" : "Web2 Access Licentie",
      status: "Coming Soon",
      text: isEnglish
        ? "For users without Xaman who want paid access through fiat later."
        : "Voor users zonder Xaman die later via fiat betaalde toegang willen.",
      lines: isEnglish
        ? ["Payment to business account / PSP later", "Access as software/service license", "No automatic fiat-to-crypto conversion"]
        : ["Betaling naar zakelijke rekening / PSP later", "Toegang als software/service licentie", "Geen automatische fiat-naar-crypto conversie"],
    },
    {
      icon: KeyRound,
      title: isEnglish ? "XRPL Access Pass" : "XRPL Access Pass",
      status: "Scanner",
      text: isEnglish
        ? "For crypto-native users who hold the exact OTT Access Pass NFT."
        : "Voor crypto-native users die de exacte OTT Access Pass NFT houden.",
      lines: isEnglish
        ? ["Connect Xaman", "Scan account_nfts", "Unlock only after exact issuer, taxon and CID match"]
        : ["Connect Xaman", "Scan account_nfts", "Unlock alleen na exacte issuer, taxon en CID match"],
    },
  ];

  async function scanAccessPass(options?: { automatic?: boolean }) {
    if (isGuest) {
      setAccessPassCheck(null);

      if (!options?.automatic) {
        setStatusMessage(
          isEnglish
            ? "Connect Xaman first to scan for an XRPL Access Pass. Without Xaman you can still use public education, intelligence and the activation guide."
            : "Connect eerst Xaman om te scannen op een XRPL Access Pass. Zonder Xaman kun je nog steeds publieke educatie, intelligence en de activatieguide gebruiken.",
        );
      }

      return;
    }

    setAccessPassBusy(true);

    if (!options?.automatic) {
      setStatusMessage(
        isEnglish
          ? "Scanning this wallet for the exact OTT Access Pass NFT..."
          : "Deze wallet wordt gescand op de exacte OTT Access Pass NFT...",
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
            ? `${label} found. XRPL Access Pass unlocked for this wallet.`
            : `${label} gevonden. XRPL Access Pass unlocked voor deze wallet.`,
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
                      ? "Access model: public, Xaman, fiat license and XRPL pass"
                      : "Access model: public, Xaman, fiat licentie en XRPL pass"
                  }
                />
              </div>

              <div className="inline-flex items-center gap-2 border border-black/10 bg-white/80 shadow-sm px-4 py-2 mb-6">
                <KeyRound size={15} className="text-[#C83888]" />

                <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/55">
                  ACCESS MODEL V1
                </p>
              </div>

              <h1 className="font-orbitron text-4xl md:text-5xl xl:text-6xl font-black uppercase leading-none tracking-tight mb-6">
                {isEnglish ? "Free to learn." : "Gratis leren."}
                <br />
                <span className="bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] bg-clip-text text-transparent">
                  {isEnglish ? "Xaman to prove." : "Xaman voor proof."}
                </span>
                <br />
                {isEnglish ? "Pass to unlock." : "Pass voor unlock."}
              </h1>

              <p className="font-mono text-sm xl:text-base text-black/60 max-w-3xl leading-relaxed">
                {isEnglish
                  ? "OTT Terminal does not force every user into crypto first. Public users can learn and use intelligence without Xaman. Xaman users can create proof and XP. Access Pass holders can unlock premium areas. A Web2 fiat license route is planned later without automatic fiat-to-crypto conversion."
                  : "OTT Terminal dwingt niet iedere user eerst crypto in. Publieke users kunnen leren en intelligence gebruiken zonder Xaman. Xaman users kunnen proof en XP maken. Access Pass holders kunnen premiumdelen unlocken. Een Web2 fiat licentieroute komt later zonder automatische fiat-naar-crypto conversie."}
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
            <FlowCard number="01" title="Public" text="Learn + intelligence" />
            <FlowCard number="02" title="Activate" text="Xaman guide" />
            <FlowCard number="03" title="Prove" text="XP + SourceTag" />
            <FlowCard number="04" title="Unlock" text="License or NFT pass" />
          </div>
        </div>
      </section>

      <section className="p-4 md:p-6 xl:p-10 bg-white">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {accessRoutes.map((route) => (
                <RouteCard key={route.title} route={route} />
              ))}
            </div>
          </div>

          <div className="col-span-12 xl:col-span-4 space-y-4">
            <Panel>
              <div className="flex items-center gap-2 mb-5">
                <SearchCheck size={18} className="text-[#3898E8]" />

                <p className="font-orbitron text-xs uppercase tracking-widest">
                  XRPL Access Pass Scanner
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
                          ? "Scan XRPL Access Pass"
                          : "Scan XRPL Access Pass"}
                    </p>

                    <p className="font-mono text-[10px] text-black/40 uppercase">
                      Issuer + taxon + metadata CID
                    </p>
                  </div>
                </div>
              </button>

              {isGuest && (
                <div className="border border-[#C83888]/25 bg-[#C83888]/10 p-4 mb-5">
                  <p className="font-mono text-xs text-black/60 leading-relaxed">
                    {isEnglish
                      ? "No Xaman yet? Use the Xaman Activation guide first. The public terminal remains usable without a wallet."
                      : "Nog geen Xaman? Gebruik eerst de Xaman Activatie guide. De publieke terminal blijft bruikbaar zonder wallet."}
                  </p>
                </div>
              )}

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
                      ? "After Xaman login this scanner checks account_nfts for the exact Access Pass issuer, taxon and metadata CID. It does not mint or move XRP."
                      : "Na Xaman login checkt deze scanner account_nfts op de exacte Access Pass issuer, taxon en metadata CID. Hij mint niets en verplaatst geen XRP."}
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
                <InfoLine text={isEnglish ? "No mint function is active." : "Geen mintfunctie actief."} />
                <InfoLine text={isEnglish ? "No Access payment is created from this screen." : "Geen Access-betaling vanuit dit scherm."} />
                <InfoLine text={isEnglish ? "No automatic fiat-to-crypto conversion." : "Geen automatische fiat-naar-crypto conversie."} />
                <InfoLine text={isEnglish ? "No custody, no broker service and no investment promise." : "Geen custody, geen brokerdienst en geen investeringsbelofte."} />
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
                <MiniStatus label="Status" value={verified ? "Verified" : accessState.status} />
                <MiniStatus label="Route" value={summary.selectedRoute?.label ?? "Free Preview"} />
                <MiniStatus label="Unlocked" value={accessState.unlockedAt ?? "None"} />
                <MiniStatus label="Expires" value={accessState.expiresAt ?? "None"} />
              </div>

              <div
                className={`border p-5 ${
                  verified
                    ? "border-[#3898E8]/25 bg-[#3898E8]/10"
                    : "border-black/10 bg-[#F7F8FC]"
                }`}
              >
                <div className="flex items-start gap-3">
                  {verified ? (
                    <BadgeCheck size={20} className="text-[#3898E8] mt-0.5 shrink-0" />
                  ) : (
                    <Lock size={20} className="text-[#D84858] mt-0.5 shrink-0" />
                  )}

                  <p className="font-mono text-sm text-black/60 leading-relaxed">
                    {verified
                      ? isEnglish
                        ? "XRPL Access Pass verified. Premium terminal areas may now unlock for this wallet."
                        : "XRPL Access Pass geverifieerd. Premium terminaldelen kunnen nu unlocken voor deze wallet."
                      : isEnglish
                        ? "No matching Access Pass found. Free public areas remain open; Web2 license access is planned later."
                        : "Geen matchende Access Pass gevonden. Gratis publieke onderdelen blijven open; Web2 licentie toegang komt later."}
                  </p>
                </div>
              </div>
            </Panel>

            <Panel>
              <div className="flex items-center gap-2 mb-5">
                <Banknote size={18} className="text-[#C83888]" />

                <p className="font-orbitron text-xs uppercase tracking-widest">
                  {isEnglish ? "Fiat Access Direction" : "Fiat Access Richting"}
                </p>
              </div>

              <div className="space-y-3">
                <InfoLine text={isEnglish ? "Fiat payment should unlock software/service access, not crypto exposure." : "Fiat betaling moet software/service toegang unlocken, geen crypto exposure."} />
                <InfoLine text={isEnglish ? "Money route later: business account / payment provider / invoice." : "Geldroute later: zakelijke rekening / payment provider / factuur."} />
                <InfoLine text={isEnglish ? "Users may connect Xaman later if they want proof or wallet-native features." : "Users kunnen later Xaman koppelen als ze proof of wallet-native functies willen."} />
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
                  Reset Access
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
                  ? "When Access Pass NFTs are manually distributed later, this scanner can recognize holders without activating mint or payment functions."
                  : "Wanneer Access Pass NFT's later handmatig worden uitgedeeld, kan deze scanner holders herkennen zonder mint- of paymentfunctie te activeren."}
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

function RouteCard({ route }: { route: RouteCardData }) {
  const Icon = route.icon;

  return (
    <div className="border border-black/10 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-4">
        <Icon size={19} className="text-[#3898E8]" />
        <span className="font-mono text-[9px] uppercase tracking-widest text-black/35">
          {route.status}
        </span>
      </div>
      <p className="font-orbitron text-sm font-black uppercase mb-3">
        {route.title}
      </p>
      <p className="font-mono text-xs text-black/55 leading-relaxed mb-4">
        {route.text}
      </p>
      <div className="space-y-2">
        {route.lines.map((line) => (
          <InfoLine key={line} text={line} />
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

function AccessPassCard({ nft }: { nft: OttAccessPassNft }) {
  return (
    <div className="border border-[#3898E8]/25 bg-[#3898E8]/10 p-4">
      <div className="flex items-start gap-3 mb-3">
        <BadgeCheck size={18} className="text-[#3898E8] shrink-0 mt-0.5" />
        <div>
          <p className="font-orbitron text-xs font-bold uppercase mb-2 text-black">
            Access Pass Found
          </p>
          <p className="font-mono text-xs text-black/55 leading-relaxed">
            {buildOttAccessPassLabel(nft)}
          </p>
        </div>
      </div>
      <MiniStatus label="NFTokenID" value={shortNftId(nft.nftokenId)} />
    </div>
  );
}

function MiniStatus({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-3">
      <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">
        {label}
      </p>
      <p className="font-orbitron text-xs font-black uppercase break-all text-black">
        {value}
      </p>
    </div>
  );
}

function FlowCard({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <div className="border border-black/10 bg-white/90 p-4 shadow-sm">
      <p className="font-mono text-[10px] text-black/30 uppercase tracking-widest mb-3">
        {number}
      </p>
      <p className="font-orbitron text-sm font-black uppercase mb-2 text-black">
        {title}
      </p>
      <p className="font-mono text-xs text-black/45 uppercase tracking-widest">
        {text}
      </p>
    </div>
  );
}

export default AccessGateTab;
