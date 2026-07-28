import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  Coins,
  CreditCard,
  Images,
  KeyRound,
  Loader2,
  Lock,
  RefreshCcw,
  ShieldCheck,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { OttFeatureTabs, type OttFeatureTab } from "../components/OttFeatureTabs";
import { OTTLogoMark } from "../components/OTTLogo";
import { OTT_NFT_COLLECTIONS, type NftCollectionCard } from "../components/NftCollectionGallery";
import { AccessPassOrderPanel } from "../components/AccessPassOrderPanel";
import { createAccessPassPayment } from "../lib/accessPassOrderClient";
import {
  clearAccessState,
  isAccessVerified,
  loadAccessState,
  markAccessVerified,
  type AccessState,
} from "../lib/accessStore";
import {
  OTT_ACCESS_PASS_METADATA_CID,
  OTT_ACCESS_PASS_TAXON,
  buildOttAccessPassLabel,
  checkOttAccessPassOwnership,
  getAccessPassStatusLabel,
  shortNftId,
  type AccessPassOwnershipResult,
} from "../lib/accessNftPass";
import { connectWalletProvider } from "../lib/walletConnectors";
import { loadWalletSession, saveWalletSession } from "../lib/walletSession";
import type {
  WalletProviderId,
  WalletVerificationMethod,
  XrplNetwork,
} from "../lib/walletRegistry";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";
import { useOttAuthSession } from "../lib/useOttAuthSession";

type AccessGateTabProps = {
  walletAddress?: string;
  onNavigate?: (target: string) => void;
  onWalletConnected?: (
    address: string,
    providerId: WalletProviderId,
    network: XrplNetwork,
    verificationMethod: WalletVerificationMethod,
  ) => void;
};

type AccessView = "overview" | "collections" | "verify" | "checkout";
type CheckoutProvider = Extract<WalletProviderId, "xaman" | "crossmark" | "gemwallet">;

const PROVIDERS: Array<{ id: CheckoutProvider; label: string; detail: string }> = [
  { id: "xaman", label: "Xaman", detail: "Mobile / xApp" },
  { id: "crossmark", label: "CROSSMARK", detail: "Browser extension" },
  { id: "gemwallet", label: "GemWallet", detail: "Browser extension" },
];

export function AccessGateTab({ walletAddress = "guest", onNavigate, onWalletConnected }: AccessGateTabProps) {
  const { language } = useTerminalLanguage();
  const { signedIn, loading: authLoading } = useOttAuthSession();
  const en = language === "en";
  const guest = walletAddress === "guest" || !walletAddress;
  const [view, setView] = useState<AccessView>("overview");
  const [accessState, setAccessState] = useState<AccessState>(() => loadAccessState(walletAddress));
  const [scan, setScan] = useState<AccessPassOwnershipResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [connectingProvider, setConnectingProvider] = useState<CheckoutProvider | null>(null);
  const [purchaseBusy, setPurchaseBusy] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const session = loadWalletSession();
  const initialProvider = session?.providerId === "crossmark" || session?.providerId === "gemwallet"
    ? session.providerId
    : "xaman";
  const [provider, setProvider] = useState<CheckoutProvider>(initialProvider);
  const unlocked = isAccessVerified(accessState) || Boolean(scan?.hasAccessPass);

  const tabs = useMemo<Array<OttFeatureTab<AccessView>>>(() => [
    {
      id: "overview",
      label: en ? "NFT overview" : "NFT-overzicht",
      description: en ? "Progression and access status" : "Voortgang en toegangsstatus",
      icon: ShieldCheck,
      badge: "7",
    },
    {
      id: "collections",
      label: en ? "Collections" : "Collecties",
      description: en ? "Artwork, supply and rules" : "Artwork, voorraad en regels",
      icon: Images,
      badge: "7",
    },
    {
      id: "verify",
      label: en ? "Verify access" : "Toegang verifiëren",
      description: en ? "Read-only ownership scan" : "Alleen-lezen eigendomsscan",
      icon: KeyRound,
    },
    {
      id: "checkout",
      label: en ? "Public Pass checkout" : "Public Pass-checkout",
      description: en ? "Connect a wallet and pay 1.589 XRP" : "Koppel een wallet en betaal 1.589 XRP",
      icon: CreditCard,
      badge: "1.589",
    },
  ], [en]);

  useEffect(() => {
    setAccessState(loadAccessState(walletAddress));
    setScan(null);
    setMessage("");
    if (!guest) void scanWallet(true);
  }, [walletAddress, language]);

  async function scanWallet(silent = false) {
    if (guest) {
      if (!silent) setMessage(en ? "Connect an XRPL wallet before scanning." : "Koppel eerst een XRPL-wallet om te scannen.");
      return;
    }

    setBusy(true);
    if (!silent) {
      setMessage(en ? "Scanning the validated XRPL ledger…" : "De gevalideerde XRPL-ledger wordt gescand…");
    }

    try {
      const result = await checkOttAccessPassOwnership(walletAddress);
      setScan(result);

      if (result.hasAccessPass && result.matchedNft) {
        const label = buildOttAccessPassLabel(result.matchedNft);
        const next = markAccessVerified({
          walletAddress,
          routeId: "ott-access-pass",
          txHash: result.matchedNft.nftokenId,
          durationDays: 36500,
          note: `${label} verified by issuer, taxon and metadata URI.`,
        });
        setAccessState(next);
        setMessage(en ? `${label} verified. Premium utility is unlocked.` : `${label} geverifieerd. Premiumutility is ontgrendeld.`);
      } else if (!silent) {
        setMessage(getAccessPassStatusLabel(result));
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : (en ? "Access Pass scan failed." : "Access Pass-scan is mislukt."));
    } finally {
      setBusy(false);
    }
  }

  function resetLocalAccess() {
    setAccessState(clearAccessState(walletAddress));
    setScan(null);
    setMessage(en ? "Local access cache cleared. Ledger ownership was not changed." : "Lokale toegangscache gewist. Ledgerbezit is niet gewijzigd.");
  }

  async function connectCheckoutProvider(selectedProvider: CheckoutProvider) {
    setProvider(selectedProvider);
    setCheckoutMessage("");

    if (selectedProvider === "xaman") {
      onNavigate?.("xaman");
      return;
    }

    setConnectingProvider(selectedProvider);
    try {
      const result = await connectWalletProvider(selectedProvider);
      saveWalletSession({
        walletAddress: result.walletAddress,
        providerId: result.providerId,
        network: result.network,
        verificationMethod: result.verificationMethod,
      });
      onWalletConnected?.(
        result.walletAddress,
        result.providerId,
        result.network,
        result.verificationMethod,
      );
      setCheckoutMessage(
        en
          ? `${PROVIDERS.find((item) => item.id === selectedProvider)?.label} connected successfully.`
          : `${PROVIDERS.find((item) => item.id === selectedProvider)?.label} is succesvol gekoppeld.`,
      );
    } catch (error) {
      setCheckoutMessage(
        error instanceof Error
          ? error.message
          : (en ? "Wallet connection failed." : "Walletverbinding is mislukt."),
      );
    } finally {
      setConnectingProvider(null);
    }
  }

  async function startCheckoutPurchase() {
    if (unlocked) {
      setCheckoutMessage(
        en
          ? "This wallet already owns a verified Access Pass. No additional purchase is required."
          : "Deze wallet bezit al een geverifieerde Access Pass. Een extra aankoop is niet nodig.",
      );
      return;
    }
    if (guest) {
      await connectCheckoutProvider(provider);
      return;
    }
    if (!signedIn) {
      setCheckoutMessage(
        en
          ? "Sign in with your OTT account to create and recover the verified order."
          : "Log in met je OTT-account om de geverifieerde bestelling te maken en later terug te kunnen vinden.",
      );
      onNavigate?.("wallet");
      return;
    }

    setPurchaseBusy(true);
    setCheckoutMessage(en ? "Creating the secure 1.589 XRP payment request…" : "Het beveiligde betaalverzoek van 1,589 XRP wordt gemaakt…");
    try {
      const response = await createAccessPassPayment(walletAddress);
      if (response.alreadyPaid) {
        setCheckoutMessage(
          en
            ? "This OTT account already has a paid or reserved Access Pass order."
            : "Dit OTT-account heeft al een betaalde of gereserveerde Access Pass-bestelling.",
        );
        return;
      }
      const paymentUrl = response.payload?.next?.always || response.payload?.next?.no_push_msg_received;
      if (!paymentUrl) throw new Error(en ? "Xaman did not return a payment link." : "Xaman heeft geen betaallink teruggegeven.");
      window.location.assign(paymentUrl);
    } catch (error) {
      const apiError = typeof error === "object" && error !== null && "error" in error
        ? String((error as { error?: unknown }).error ?? "")
        : "";
      setCheckoutMessage(
        apiError
        || (error instanceof Error ? error.message : "")
        || (en ? "The payment link could not be created." : "De betaallink kon niet worden gemaakt."),
      );
    } finally {
      setPurchaseBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <section className="relative overflow-hidden border-b border-blue-200 bg-[radial-gradient(circle_at_15%_15%,rgba(49,92,255,0.26),transparent_34%),radial-gradient(circle_at_84%_12%,rgba(239,47,145,0.20),transparent_30%),linear-gradient(135deg,#eef4ff_0%,#ffffff_52%,#fff1fa_100%)]">
        <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(37,99,235,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.08)_1px,transparent_1px)] [background-size:34px_34px]" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_340px] lg:items-center lg:py-14">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">OTT NFT & Access</p>
            <h1 className="mt-4 max-w-4xl font-orbitron text-4xl font-semibold tracking-tight sm:text-5xl">
              {en ? "Seven NFT routes. One clear OTT hub." : "Zeven NFT-routes. Eén duidelijke OTT-hub."}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-700">
              {en
                ? "Overview, collections, eligibility, ownership verification and the verified Public Pass checkout now have one fixed place."
                : "Overzicht, collecties, eligibility, eigendomsverificatie en de geverifieerde Public Pass-checkout hebben nu één vaste plek."}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Badge text={en ? "Genesis · not for sale" : "Genesis · niet te koop"} />
              <Badge text="Public · 1.589 XRP" />
              <Badge text={en ? "4 earned credentials" : "4 verdiende credentials"} />
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/80 bg-slate-950 p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <OTTLogoMark size="lg" />
              {unlocked ? <ShieldCheck className="text-emerald-300" size={29} /> : <Lock className="text-slate-500" size={27} />}
            </div>
            <p className="mt-7 text-xs font-semibold text-slate-400">Current access</p>
            <p className="mt-2 text-3xl font-semibold">{unlocked ? (en ? "Unlocked" : "Ontgrendeld") : (en ? "Public preview" : "Publieke preview")}</p>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <DarkMetric label="Wallet" value={guest ? (en ? "Not linked" : "Niet gekoppeld") : `${walletAddress.slice(0, 7)}…${walletAddress.slice(-5)}`} />
              <DarkMetric label="NFT" value={scan?.hasAccessPass ? (en ? "Verified" : "Geverifieerd") : (en ? "Not verified" : "Niet geverifieerd")} />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8">
        <OttFeatureTabs items={tabs} activeId={view} onChange={(id) => setView(id as AccessView)} ariaLabel={en ? "NFT and access sections" : "NFT- en toegangssecties"} />
      </div>

      {view === "overview" && <OverviewPanel en={en} onOpenCollections={() => setView("collections")} />}
      {view === "collections" && <CollectionsPanel en={en} />}
      {view === "verify" && (
        <VerificationPanel
          en={en}
          guest={guest}
          walletAddress={walletAddress}
          busy={busy}
          scan={scan}
          message={message}
          onScan={() => void scanWallet()}
          onReset={resetLocalAccess}
          onNavigate={onNavigate}
        />
      )}
      {view === "checkout" && (
        <>
          <CheckoutPanel
            en={en}
            guest={guest}
            walletAddress={walletAddress}
            connectedProvider={session?.providerId}
            provider={provider}
            connectingProvider={connectingProvider}
            purchaseBusy={purchaseBusy}
            signedIn={signedIn}
            authLoading={authLoading}
            unlocked={unlocked}
            message={checkoutMessage}
            setProvider={setProvider}
            onConnect={(selectedProvider) => void connectCheckoutProvider(selectedProvider)}
            onPurchase={() => void startCheckoutPurchase()}
            onNavigate={onNavigate}
          />
          <AccessPassOrderPanel walletAddress={walletAddress} onNavigate={onNavigate} />
        </>
      )}
    </div>
  );
}

function OverviewPanel({ en, onOpenCollections }: { en: boolean; onOpenCollections: () => void }) {
  const statusLabel = (status: NftCollectionCard["status"]) => {
    if (status === "reward") return en ? "Founder reward" : "Founderbeloning";
    if (status === "purchase") return en ? "Public · 1.589 XRP" : "Publiek · 1,589 XRP";
    if (status === "earned") return en ? "Earned credential" : "Verdiende credential";
    return en ? "Planned" : "Gepland";
  };

  return (
    <section className="mx-auto max-w-7xl px-5 pb-12 pt-2 sm:px-8 sm:pb-16">
      <div className="mb-6 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">OTT NFT progression</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          {en ? "Seven clear routes, from access to achievement." : "Zeven duidelijke routes, van toegang tot prestatie."}
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          {en
            ? "Every title, status and supply remains crisp and readable. Open Collections for the complete acquisition and eligibility rules."
            : "Elke titel, status en voorraad blijft scherp en leesbaar. Open Collecties voor alle verkrijgings- en eligibilityregels."}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {OTT_NFT_COLLECTIONS.map((collection, index) => (
            <li key={collection.id} className={`rounded-2xl border bg-white p-4 shadow-sm ${index === OTT_NFT_COLLECTIONS.length - 1 ? "sm:col-span-2 lg:col-span-1" : ""}`}>
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-700">{statusLabel(collection.status)}</p>
                  <h3 className="mt-1 text-sm font-semibold leading-5 text-slate-950">
                    {en ? collection.titleEn : collection.titleNl}
                  </h3>
                </div>
              </div>
              <p className="mt-4 text-xs leading-5 text-slate-600">
                {en ? collection.descriptionEn : collection.descriptionNl}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                <span className="text-slate-500">{en ? "Maximum supply" : "Maximale voorraad"}</span>
                <strong className="text-slate-900">{collection.supply}</strong>
              </div>
            </li>
          ))}
        </ol>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <SummaryCard icon={ShoppingBag} label="Access" value="2" text={en ? "Genesis and Public Pass" : "Genesis en Public Pass"} />
          <SummaryCard icon={BadgeCheck} label={en ? "Earned" : "Verdiend"} value="4" text={en ? "Verified learning credentials" : "Geverifieerde leercredentials"} />
          <SummaryCard icon={Lock} label={en ? "Planned" : "Gepland"} value="1" text={en ? "Operations credential" : "Operations-credential"} />
          <button type="button" onClick={onOpenCollections} className="rounded-2xl bg-[linear-gradient(135deg,#315cff_0%,#8249ed_52%,#ef2f91_100%)] p-5 text-left text-white shadow-lg shadow-violet-200/40">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/65">OTT Collection</p>
            <p className="mt-2 text-lg font-semibold">{en ? "Open all seven cards" : "Open alle zeven kaarten"}</p>
          </button>
        </div>
      </div>
    </section>
  );
}

function CollectionsPanel({ en }: { en: boolean }) {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-12 pt-2 sm:px-8 sm:pb-16">
      <div className="mb-7 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">OTT Collection Registry</p>
        <h2 className="mt-3 font-orbitron text-3xl font-semibold">{en ? "Artwork, supply and eligibility." : "Artwork, voorraad en eligibility."}</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">{en ? "Cards stay compact. Open the rules only when you need them." : "Kaarten blijven compact. Open de regels alleen wanneer je ze nodig hebt."}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {OTT_NFT_COLLECTIONS.map((collection) => <CollectionCard key={collection.id} collection={collection} en={en} />)}
      </div>
    </section>
  );
}

function CollectionCard({ collection, en }: { collection: NftCollectionCard; en: boolean }) {
  const status = collection.status === "purchase"
    ? (en ? "Public checkout" : "Publieke checkout")
    : collection.status === "reward"
      ? (en ? "Founder reward" : "Founderbeloning")
      : collection.status === "earned"
        ? (en ? "Earned only" : "Alleen te verdienen")
        : (en ? "In verification" : "In verificatie");

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="grid grid-cols-[112px_1fr]">
        <div className="bg-slate-950 p-2.5">
          <img src={collection.image} alt={en ? collection.titleEn : collection.titleNl} loading="lazy" className="h-full min-h-44 w-full rounded-2xl object-cover object-top" />
        </div>
        <div className="min-w-0 p-5">
          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">{status}</span>
          <h3 className="mt-3 font-orbitron text-base font-semibold leading-5">{en ? collection.titleEn : collection.titleNl}</h3>
          <p className="mt-2 text-xs text-slate-500">{en ? "Maximum edition" : "Maximale editie"}: {collection.supply}</p>
          <details className="mt-4 rounded-xl border border-slate-200 bg-slate-50">
            <summary className="cursor-pointer list-none px-3 py-2.5 text-xs font-semibold">{en ? "Rules and eligibility" : "Regels en eligibility"}</summary>
            <div className="border-t border-slate-200 p-3 text-xs leading-5 text-slate-600">
              <p className="font-semibold text-slate-800">{en ? collection.acquisitionEn : collection.acquisitionNl}</p>
              <p className="mt-2">{en ? collection.ruleEn : collection.ruleNl}</p>
            </div>
          </details>
        </div>
      </div>
    </article>
  );
}

function VerificationPanel({
  en,
  guest,
  walletAddress,
  busy,
  scan,
  message,
  onScan,
  onReset,
  onNavigate,
}: {
  en: boolean;
  guest: boolean;
  walletAddress: string;
  busy: boolean;
  scan: AccessPassOwnershipResult | null;
  message: string;
  onScan: () => void;
  onReset: () => void;
  onNavigate?: (target: string) => void;
}) {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-12 pt-2 sm:px-8 sm:pb-16">
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#315cff_0%,#8249ed_52%,#ef2f91_100%)] text-white"><KeyRound size={22} /></span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">XRPL ownership scanner</p>
              <h2 className="mt-2 text-2xl font-semibold">{en ? "Check the connected wallet" : "Controleer de gekoppelde wallet"}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{en ? "Read-only verification by trusted issuer, taxon and metadata URI. No funds or NFTs move." : "Alleen-lezen verificatie via vertrouwde issuer, taxon en metadata-URI. Er worden geen funds of NFT's verplaatst."}</p>
            </div>
          </div>
          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            <Metric label="Metadata CID" value={OTT_ACCESS_PASS_METADATA_CID} />
            <Metric label="Taxon" value={String(OTT_ACCESS_PASS_TAXON)} />
            <Metric label="NFTokenID" value={shortNftId(scan?.matchedNft?.nftokenId)} />
          </div>
          {message && <p className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-950">{message}</p>}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {guest ? (
              <button type="button" onClick={() => onNavigate?.("xaman")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"><Wallet size={18} />{en ? "Open wallet hub" : "Open wallet-hub"}</button>
            ) : (
              <button type="button" onClick={onScan} disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy ? <Loader2 className="animate-spin" size={18} /> : <RefreshCcw size={18} />}{en ? "Scan Access Pass" : "Scan Access Pass"}</button>
            )}
            <button type="button" onClick={onReset} disabled={guest} className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold disabled:opacity-40">{en ? "Clear local cache" : "Lokale cache wissen"}</button>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Security model</p>
          <div className="mt-5 space-y-4">
            <SecurityLine text={en ? "Eligibility is verified before minting" : "Eligibility wordt vóór minting geverifieerd"} />
            <SecurityLine text={en ? "No duplicate wallet or curriculum credential" : "Geen dubbele wallet- of curriculumcredential"} />
            <SecurityLine text={en ? "Issuer signs mint and targeted delivery" : "Issuer tekent mint en gerichte levering"} />
            <SecurityLine text={guest ? (en ? "No wallet connected" : "Geen wallet gekoppeld") : `${walletAddress.slice(0, 10)}…${walletAddress.slice(-6)}`} />
          </div>
        </div>
      </div>
    </section>
  );
}

function CheckoutPanel({
  en,
  guest,
  walletAddress,
  connectedProvider,
  provider,
  connectingProvider,
  purchaseBusy,
  signedIn,
  authLoading,
  unlocked,
  message,
  setProvider,
  onConnect,
  onPurchase,
  onNavigate,
}: {
  en: boolean;
  guest: boolean;
  walletAddress: string;
  connectedProvider?: WalletProviderId;
  provider: CheckoutProvider;
  connectingProvider: CheckoutProvider | null;
  purchaseBusy: boolean;
  signedIn: boolean;
  authLoading: boolean;
  unlocked: boolean;
  message: string;
  setProvider: (provider: CheckoutProvider) => void;
  onConnect: (provider: CheckoutProvider) => void;
  onPurchase: () => void;
  onNavigate?: (target: string) => void;
}) {
  const providerMatches = connectedProvider === provider;
  const selectedProviderLabel = PROVIDERS.find((item) => item.id === provider)?.label ?? provider;

  return (
    <section className="mx-auto max-w-7xl px-5 pb-12 pt-2 sm:px-8 sm:pb-16">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#315cff_0%,#8249ed_52%,#ef2f91_100%)] text-white"><ShoppingBag size={22} /></span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">Public Access Pass</p>
              <h2 className="mt-2 text-2xl font-semibold">{en ? "Choose the receiving wallet and pay 1.589 XRP." : "Kies de ontvangende wallet en betaal 1,589 XRP."}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{en ? "The signing wallet must be the same wallet that receives and later proves ownership of the Access Pass." : "De signingwallet moet dezelfde wallet zijn die de Access Pass ontvangt en later het bezit bewijst."}</p>
            </div>
          </div>

          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">1. Wallet provider</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {PROVIDERS.map((item) => (
              <button key={item.id} type="button" onClick={() => setProvider(item.id)} className={`rounded-2xl border p-4 text-left ${provider === item.id ? "border-violet-500 bg-violet-50 ring-2 ring-violet-100" : "border-slate-200"}`}>
                <p className="font-semibold">{item.label}</p>
                <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
                <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{connectedProvider === item.id ? (en ? "Connected" : "Gekoppeld") : (en ? "Select, then connect below" : "Selecteer en koppel hieronder")}</p>
              </button>
            ))}
          </div>

          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">2. Payment</p>
          <div className="mt-3 flex items-center justify-between rounded-2xl border border-blue-500 bg-blue-50 p-4 ring-2 ring-blue-100">
            <span className="flex items-center gap-3"><Coins size={19} className="text-blue-700" /><span className="font-semibold">XRP</span></span>
            <span className="text-sm font-semibold">1.589</span>
          </div>

          <div className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm leading-6 text-blue-950">
            <p className="font-semibold">{en ? "Verified payment flow" : "Geverifieerde betaalflow"}</p>
            <p className="mt-2">{en ? "Connect the wallet that will receive the Access Pass. The payment link below always requests exactly 1.589 XRP and the server verifies the validated ledger transaction before reserving an NFT." : "Koppel de wallet die de Access Pass ontvangt. De betaallink hieronder vraagt altijd exact 1.589 XRP en de server controleert de gevalideerde ledgertransactie voordat een NFT wordt gereserveerd."}</p>
          </div>

          {message && <p role="status" aria-live="polite" className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">{message}</p>}

          {unlocked && (
            <p className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-950">
              {en ? "This receiving wallet already owns a verified Access Pass." : "Deze ontvangende wallet bezit al een geverifieerde Access Pass."}
            </p>
          )}

          {!providerMatches || guest ? (
            <button
              type="button"
              onClick={() => onConnect(provider)}
              disabled={connectingProvider !== null}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {connectingProvider === provider ? <Loader2 className="animate-spin" size={18} /> : <Wallet size={18} />}
              {en ? `Connect ${selectedProviderLabel}` : `Koppel ${selectedProviderLabel}`}
            </button>
          ) : (
            <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
              <button
                type="button"
                onClick={onPurchase}
                disabled={purchaseBusy || authLoading || unlocked}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#315cff_0%,#8249ed_52%,#ef2f91_100%)] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-200/40 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {purchaseBusy || authLoading ? <Loader2 className="animate-spin" size={18} /> : <CreditCard size={18} />}
                {unlocked
                  ? (en ? "Access Pass already owned" : "Access Pass al in bezit")
                  : signedIn
                    ? (en ? "Buy Access Pass · 1.589 XRP" : "Koop Access Pass · 1,589 XRP")
                    : (en ? "Sign in to buy · 1.589 XRP" : "Log in om te kopen · 1,589 XRP")}
              </button>
              <button
                type="button"
                onClick={() => onNavigate?.("wallet")}
                className="rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {en ? "Wallet details" : "Walletdetails"}
              </button>
            </div>
          )}
        </div>

        <aside className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">Order preview</p>
          <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-3">
            <img src="/nft/artwork/public-access-pass.png" alt="OTT Public Access Pass" className="mx-auto max-h-64 rounded-xl object-contain" />
          </div>
          <div className="mt-6 space-y-4 text-sm">
            <OrderLine label={en ? "Price" : "Prijs"} value="1.589 XRP" />
            <OrderLine label={en ? "Provider" : "Provider"} value={PROVIDERS.find((item) => item.id === provider)?.label ?? provider} />
            <OrderLine label={en ? "Receiver" : "Ontvanger"} value={guest ? (en ? "Not connected" : "Niet gekoppeld") : `${walletAddress.slice(0, 8)}…${walletAddress.slice(-6)}`} />
            <OrderLine label={en ? "Payment link" : "Betaallink"} value={en ? "Available below" : "Hieronder beschikbaar"} />
          </div>
        </aside>
      </div>
    </section>
  );
}

function Badge({ text }: { text: string }) {
  return <span className="rounded-full border border-blue-200 bg-white/90 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm">{text}</span>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs text-slate-500">{label}</p><p className="mt-1 break-all text-sm font-semibold text-slate-900">{value}</p></div>;
}

function DarkMetric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">{label}</p><p className="mt-2 break-all font-semibold text-slate-100">{value}</p></div>;
}

function SummaryCard({ icon: Icon, label, value, text }: { icon: typeof ShoppingBag; label: string; value: string; text: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><Icon className="text-blue-700" size={20} /><span className="text-2xl font-semibold">{value}</span></div><p className="mt-4 text-sm font-semibold">{label}</p><p className="mt-1 text-xs leading-5 text-slate-500">{text}</p></div>;
}

function SecurityLine({ text }: { text: string }) {
  return <div className="flex items-start gap-3 text-sm leading-6 text-slate-700"><CheckCircle2 className="mt-0.5 shrink-0 text-emerald-700" size={18} /><span>{text}</span></div>;
}

function OrderLine({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3"><span className="text-white/45">{label}</span><span className="max-w-[190px] break-all text-right font-semibold">{value}</span></div>;
}
