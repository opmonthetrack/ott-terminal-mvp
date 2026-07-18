import { useEffect, useState } from "react";
import type { ElementType, ReactNode } from "react";
import {
  BadgeCheck,
  Banknote,
  CheckCircle2,
  ExternalLink,
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

const ACCESS_PAYMENT_URL = "/access-payment.html";
const ACCESS_PRICE_XRP = "1.589 XRP";

export function AccessGateTab({ walletAddress = "guest" }: AccessGateTabProps) {
  const { language, setLanguage } = useTerminalLanguage();
  const isEnglish = language === "en";

  const [accessState, setAccessState] = useState<AccessState>(() =>
    loadAccessState(walletAddress),
  );
  const [statusMessage, setStatusMessage] = useState(
    isEnglish
      ? "Access Gate loaded. Connect Xaman once, buy an Access Pass when ready, then scan the same wallet to unlock premium areas."
      : "Access Gate geladen. Connect Xaman eenmalig, koop een Access Pass wanneer je klaar bent en scan daarna dezelfde wallet om premiumdelen te unlocken.",
  );
  const [accessPassCheck, setAccessPassCheck] =
    useState<AccessPassOwnershipResult | null>(null);
  const [accessPassBusy, setAccessPassBusy] = useState(false);

  const isGuest = !walletAddress || walletAddress === "guest";
  const summary = getAccessSummary(accessState);
  const verified =
    isAccessVerified(accessState) || Boolean(accessPassCheck?.hasAccessPass);
  const activeCustomerWallet = isGuest ? "Connect Xaman first" : walletAddress;
  const accessPaymentUrl = isGuest
    ? ACCESS_PAYMENT_URL
    : `${ACCESS_PAYMENT_URL}?wallet=${encodeURIComponent(walletAddress)}`;

  useEffect(() => {
    setAccessState(loadAccessState(walletAddress));
    setAccessPassCheck(null);
    setStatusMessage(
      isEnglish
        ? "Access Gate loaded. Guests can read the access model; connected Xaman users can buy, receive and scan the XRPL Access Pass."
        : "Access Gate geladen. Guests kunnen het toegangsmodel lezen; gekoppelde Xaman users kunnen de XRPL Access Pass kopen, ontvangen en scannen.",
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
      label: "Pass Price",
      value: ACCESS_PRICE_XRP,
      text: "Utility access only.",
      icon: Banknote,
    },
    {
      label: "Wallet",
      value: isGuest ? "Optional" : "Linked",
      text: isGuest ? "Learn without login." : "One login active.",
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
        ? [
            "Home, XRPL Intelligence and Newsroom preview",
            "Academy preview and SourceTag explanation",
            "No wallet required for reading and learning",
          ]
        : [
            "Home, XRPL Intelligence en Newsroom preview",
            "Academy preview en SourceTag uitleg",
            "Geen wallet nodig voor lezen en leren",
          ],
    },
    {
      icon: Smartphone,
      title: isEnglish ? "Xaman User Access" : "Xaman User Toegang",
      status: "Proof",
      text: isEnglish
        ? "Users connect Xaman once and reuse the same wallet across proof, XP and access checks."
        : "Users connecten Xaman eenmalig en gebruiken dezelfde wallet voor proof, XP en access checks.",
      lines: isEnglish
        ? [
            "One Xaman connection for the terminal session",
            "Daily Check-In and Reward Ledger",
            "XRPL Verify and SourceTag proof",
          ]
        : [
            "Een Xaman-connectie voor de terminalsessie",
            "Daily Check-In en Reward Ledger",
            "XRPL Verify en SourceTag proof",
          ],
    },
    {
      icon: Banknote,
      title: isEnglish ? "Buy Access Pass" : "Access Pass Kopen",
      status: ACCESS_PRICE_XRP,
      text: isEnglish
        ? "Pay for utility access with Xaman. After verified payment, the founder sends the Access Pass NFT to your wallet."
        : "Betaal voor utility access met Xaman. Na verified payment stuurt de founder de Access Pass NFT naar je wallet.",
      lines: isEnglish
        ? [
            "Payment: 1.589 XRP to OTT Access wallet",
            "No investment, yield or profit promise",
            "Founder-controlled mint and send after payment verification",
          ]
        : [
            "Betaling: 1.589 XRP naar OTT Access wallet",
            "Geen investering, yield of winstbelofte",
            "Founder-controlled mint en send na payment verification",
          ],
    },
    {
      icon: KeyRound,
      title: "XRPL Access Pass",
      status: "Scanner",
      text: isEnglish
        ? "Access unlocks only when the connected wallet holds the exact OTT Access Pass NFT."
        : "Access unlockt alleen wanneer de connected wallet de exacte OTT Access Pass NFT houdt.",
      lines: isEnglish
        ? [
            "Connect Xaman once",
            "Scan account_nfts",
            "Unlock only after exact issuer, taxon and CID match",
          ]
        : [
            "Connect Xaman eenmalig",
            "Scan account_nfts",
            "Unlock alleen na exacte issuer, taxon en CID match",
          ],
    },
  ];

  async function scanAccessPass(options?: { automatic?: boolean }) {
    if (isGuest) {
      setAccessPassCheck(null);

      if (!options?.automatic) {
        setStatusMessage(
          isEnglish
            ? "Connect Xaman first to scan for an XRPL Access Pass. You can still use public education, intelligence and the activation guide without a wallet."
            : "Connect eerst Xaman om te scannen op een XRPL Access Pass. Zonder wallet kun je nog steeds publieke educatie, intelligence en de activatieguide gebruiken.",
        );
      }

      return;
    }

    setAccessPassBusy(true);

    if (!options?.automatic) {
      setStatusMessage(
        isEnglish
          ? "Scanning this connected wallet for the exact OTT Access Pass NFT..."
          : "Deze connected wallet wordt gescand op de exacte OTT Access Pass NFT...",
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
                      ? "One Xaman login: learn, prove, pay, scan and unlock"
                      : "Een Xaman-login: leren, proof, betalen, scannen en unlocken"
                  }
                />
              </div>

              <div className="inline-flex items-center gap-2 border border-black/10 bg-white/80 shadow-sm px-4 py-2 mb-6">
                <KeyRound size={15} className="text-[#C83888]" />

                <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/55">
                  ACCESS GATE V1
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
                  ? "OTT Terminal keeps the customer journey simple: users learn for free, connect Xaman once, prove activity, buy the Access Pass when ready, receive the NFT manually from the founder, then scan the same wallet to unlock premium utility areas."
                  : "OTT Terminal houdt de klantreis simpel: users leren gratis, connecten Xaman eenmalig, doen proof-acties, kopen de Access Pass wanneer ze klaar zijn, ontvangen de NFT handmatig van de founder en scannen daarna dezelfde wallet om premium utility-delen te unlocken."}
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
            <FlowCard number="01" title="Learn" text="Public education" />
            <FlowCard number="02" title="Connect" text="One Xaman login" />
            <FlowCard number="03" title="Pay" text="1.589 XRP pass" />
            <FlowCard number="04" title="Unlock" text="NFT scan" />
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
                <Banknote size={18} className="text-[#C83888]" />

                <p className="font-orbitron text-xs uppercase tracking-widest">
                  {isEnglish ? "Buy Access Pass" : "Access Pass Kopen"}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 mb-5">
                <MiniStatus label="Price" value={ACCESS_PRICE_XRP} />
                <MiniStatus label="Customer Wallet" value={activeCustomerWallet} />
                <MiniStatus label="Payment" value="Xaman Payment" />
                <MiniStatus label="Delivery" value="Founder sends NFT" />
              </div>

              <div className="border border-[#C83888]/25 bg-[#C83888]/10 p-4 mb-5">
                <p className="font-mono text-xs text-black/60 leading-relaxed">
                  {isEnglish
                    ? "Payment creates a verified service payment record. It does not automatically mint or unlock access. After verification, the founder mints and sends the utility Access Pass NFT to the customer wallet."
                    : "Betaling maakt een verified service payment record. Het mint of unlockt niet automatisch. Na verificatie mint en verstuurt de founder de utility Access Pass NFT naar de customer wallet."}
                </p>
              </div>

              <a
                href={accessPaymentUrl}
                target="_blank"
                rel="noreferrer"
                className="block w-full bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] p-4 text-left text-white hover:brightness-95 transition-all mb-4"
              >
                <div className="flex items-center gap-3">
                  <ExternalLink size={17} />
                  <div>
                    <p className="font-orbitron text-xs font-black uppercase">
                      {isEnglish ? "Open Payment Page" : "Open Betaalpagina"}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-white/75">
                      {isGuest
                        ? isEnglish
                          ? "Connect Xaman first for wallet prefill"
                          : "Connect eerst Xaman voor wallet prefill"
                        : isEnglish
                          ? "Wallet prefilled from this session"
                          : "Wallet vooraf ingevuld vanuit deze sessie"}
                    </p>
                  </div>
                </div>
              </a>

              <div className="space-y-2">
                <InfoLine text={isEnglish ? "Use the same Xaman wallet that should receive the Access Pass NFT." : "Gebruik dezelfde Xaman wallet die de Access Pass NFT moet ontvangen."} />
                <InfoLine text={isEnglish ? "Utility access only; no investment, yield or resale value promise." : "Alleen utility access; geen investering, yield of resale value belofte."} />
              </div>
            </Panel>

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
                        ? "No matching Access Pass found yet. Learn for free, connect Xaman once, pay for the pass when ready, then scan again after the founder sends the NFT."
                        : "Nog geen matchende Access Pass gevonden. Leer gratis, connect Xaman eenmalig, betaal voor de pass wanneer je klaar bent en scan opnieuw nadat de founder de NFT heeft gestuurd."}
                  </p>
                </div>
              </div>
            </Panel>

            <Panel>
              <div className="flex items-center gap-2 mb-5">
                <Sparkles size={18} className="text-[#C83888]" />

                <p className="font-orbitron text-xs uppercase tracking-widest">
                  {isEnglish ? "Customer Flow" : "Klantflow"}
                </p>
              </div>

              <div className="space-y-3">
                <StepLine number="01" text={isEnglish ? "Learn for free inside the public terminal." : "Leer gratis in de publieke terminal."} />
                <StepLine number="02" text={isEnglish ? "Connect Xaman once for proof, XP and wallet-native features." : "Connect Xaman eenmalig voor proof, XP en wallet-native functies."} />
                <StepLine number="03" text={isEnglish ? "Pay 1.589 XRP for the Access Pass service." : "Betaal 1.589 XRP voor de Access Pass service."} />
                <StepLine number="04" text={isEnglish ? "Founder verifies payment, then mints and sends the Access Pass NFT." : "Founder verifieert betaling en mint/verstuurt daarna de Access Pass NFT."} />
                <StepLine number="05" text={isEnglish ? "Scan the same wallet to unlock premium utility areas." : "Scan dezelfde wallet om premium utility-delen te unlocken."} />
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
                <ShieldCheck size={18} className="text-[#3898E8]" />

                <p className="font-orbitron text-xs uppercase tracking-widest">
                  {isEnglish ? "Safe V1 Scope" : "Veilige V1-scope"}
                </p>
              </div>

              <div className="space-y-3">
                <InfoLine text={isEnglish ? "Payment page creates a Xaman payment payload only." : "Betaalpagina maakt alleen een Xaman payment payload."} />
                <InfoLine text={isEnglish ? "No automatic mint runs after payment." : "Geen automatische mint na betaling."} />
                <InfoLine text={isEnglish ? "Founder-controlled NFT mint and send." : "Founder-controlled NFT mint en send."} />
                <InfoLine text={isEnglish ? "No custody, no broker service and no investment promise." : "Geen custody, geen brokerdienst en geen investeringsbelofte."} />
              </div>
            </Panel>

            {verified && (
              <Panel>
                <div className="flex items-center gap-2 mb-5">
                  <Sparkles size={18} className="text-[#C83888]" />

                  <p className="font-orbitron text-xs uppercase tracking-widest">
                    Premium Ready
                  </p>
                </div>

                <p className="font-mono text-xs text-black/55 leading-relaxed">
                  {isEnglish
                    ? "This wallet can now access premium utility areas where enabled by the terminal."
                    : "Deze wallet kan nu premium utility-delen openen waar dat in de terminal actief is."}
                </p>
              </Panel>
            )}

            {!isGuest && (
              <button
                onClick={resetAccess}
                className="w-full border border-black/10 bg-white p-4 text-left hover:bg-[#F7F8FC] transition-all"
              >
                <p className="font-orbitron text-xs font-bold uppercase text-black">
                  Reset Local Access
                </p>
                <p className="font-mono text-[10px] text-black/40 uppercase mt-1">
                  Does not change NFT ownership
                </p>
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function Panel({ children }: { children: ReactNode }) {
  return <div className="border border-black/10 bg-white p-5 shadow-sm shadow-black/5">{children}</div>;
}

function MetricBox({ metric }: { metric: Metric }) {
  const Icon = metric.icon;

  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-4">
      <Icon size={17} className="text-[#3898E8] mb-3" />
      <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">
        {metric.label}
      </p>
      <p className="font-orbitron text-xs font-black uppercase break-all">{metric.value}</p>
      <p className="font-mono text-[10px] text-black/45 leading-relaxed mt-2">{metric.text}</p>
    </div>
  );
}

function RouteCard({ route }: { route: RouteCardData }) {
  const Icon = route.icon;

  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-5 min-h-[260px]">
      <div className="flex items-start justify-between gap-3 mb-5">
        <Icon size={20} className="text-[#3898E8]" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-black/40">
          {route.status}
        </span>
      </div>

      <h3 className="font-orbitron text-lg font-black uppercase mb-3">{route.title}</h3>
      <p className="font-mono text-xs text-black/55 leading-relaxed mb-4">{route.text}</p>

      <div className="space-y-2">
        {route.lines.map((line) => (
          <InfoLine key={line} text={line} />
        ))}
      </div>
    </div>
  );
}

function FlowCard({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <div className="border border-black/10 bg-white/80 p-4 shadow-sm shadow-black/5">
      <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">{number}</p>
      <p className="font-orbitron text-sm font-black uppercase mb-1">{title}</p>
      <p className="font-mono text-xs text-black/55">{text}</p>
    </div>
  );
}

function MiniStatus({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-4">
      <p className="font-mono text-[10px] uppercase tracking-widest text-black/35 mb-2">
        {label}
      </p>
      <p className="font-mono text-xs text-black/65 leading-relaxed break-all">{value}</p>
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

function StepLine({ number, text }: { number: string; text: string }) {
  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-4 flex items-start gap-3">
      <span className="font-orbitron text-xs font-black text-[#C83888] shrink-0">{number}</span>
      <p className="font-mono text-xs text-black/60 leading-relaxed">{text}</p>
    </div>
  );
}

function AccessPassCard({ nft }: { nft: OttAccessPassNft }) {
  return (
    <div className="border border-[#3898E8]/25 bg-[#3898E8]/10 p-4">
      <div className="flex items-center gap-2 mb-4">
        <BadgeCheck size={17} className="text-[#3898E8]" />
        <p className="font-orbitron text-xs font-black uppercase">Access Pass Found</p>
      </div>

      <div className="space-y-3">
        <MiniStatus label="NFTokenID" value={nft.nftokenId} />
        <MiniStatus label="Short ID" value={shortNftId(nft.nftokenId)} />
        <MiniStatus label="Issuer" value={nft.issuer} />
        <MiniStatus label="Taxon" value={String(nft.taxon)} />
      </div>
    </div>
  );
}
