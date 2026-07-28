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
import { loadWalletSession } from "../lib/walletSession";
import type { WalletProviderId } from "../lib/walletRegistry";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

type AccessGateTabProps = {
  walletAddress?: string;
  onNavigate?: (target: string) => void;
};

type AccessView = "overview" | "collections" | "verify" | "checkout";
type CheckoutCurrency = "XRP" | "RLUSD";
type CheckoutProvider = Extract<WalletProviderId, "xaman" | "crossmark" | "gemwallet">;

const PROVIDERS: Array<{ id: CheckoutProvider; label: string; detail: string }> = [
  { id: "xaman", label: "Xaman", detail: "Mobile / xApp" },
  { id: "crossmark", label: "CROSSMARK", detail: "Browser extension" },
  { id: "gemwallet", label: "GemWallet", detail: "Browser extension" },
];

export function AccessGateTab({ walletAddress = "guest", onNavigate }: AccessGateTabProps) {
  const { language } = useTerminalLanguage();
  const en = language === "en";
  const guest = walletAddress === "guest" || !walletAddress;
  const [view, setView] = useState<AccessView>("overview");
  const [accessState, setAccessState] = useState<AccessState>(() => loadAccessState(walletAddress));
  const [scan, setScan] = useState<AccessPassOwnershipResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [currency, setCurrency] = useState<CheckoutCurrency>("XRP");
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
      description: en ? "Choose wallet and payment asset" : "Kies wallet en betaalmiddel",
      icon: CreditCard,
      badge: "0.589",
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
                ? "Overview, collections, eligibility, ownership verification and the future Public Pass checkout now have one fixed place."
                : "Overzicht, collecties, eligibility, eigendomsverificatie en de toekomstige Public Pass-checkout hebben nu één vaste plek."}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Badge text={en ? "Genesis · not for sale" : "Genesis · niet te koop"} />
              <Badge text="Public · 0.589 XRP / 1.00 RLUSD" />
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
        <OttFeatureTabs items={tabs} activeId={view} onChange={setView} ariaLabel={en ? "NFT and access sections" : "NFT- en toegangssecties"} />
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
        <CheckoutPanel
          en={en}
          guest={guest}
          walletAddress={walletAddress}
          connectedProvider={session?.providerId}
          provider={provider}
          currency={currency}
          setProvider={setProvider}
          setCurrency={setCurrency}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
}

function OverviewPanel({ en, onOpenCollections }: { en: boolean; onOpenCollections: () => void }) {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-12 pt-2 sm:px-8 sm:pb-16">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <figure className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 shadow-xl">
          <img
            src="/nft/overview/ott-nft-progression-overview.png"
            alt={en ? "OTT NFT progression overview" : "OTT NFT-voortgangsoverzicht"}
            className="h-auto w-full object-cover"
          />
        </figure>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
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
  currency,
  setProvider,
  setCurrency,
  onNavigate,
}: {
  en: boolean;
  guest: boolean;
  walletAddress: string;
  connectedProvider?: WalletProviderId;
  provider: CheckoutProvider;
  currency: CheckoutCurrency;
  setProvider: (provider: CheckoutProvider) => void;
  setCurrency: (currency: CheckoutCurrency) => void;
  onNavigate?: (target: string) => void;
}) {
  const providerMatches = connectedProvider === provider;
  const price = currency === "XRP" ? "0.589 XRP" : "1.00 RLUSD";

  return (
    <section className="mx-auto max-w-7xl px-5 pb-12 pt-2 sm:px-8 sm:pb-16">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#315cff_0%,#8249ed_52%,#ef2f91_100%)] text-white"><ShoppingBag size={22} /></span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">Public Access Pass</p>
              <h2 className="mt-2 text-2xl font-semibold">{en ? "Choose the receiving wallet and payment asset." : "Kies de ontvangende wallet en het betaalmiddel."}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{en ? "The signing wallet must be the same wallet that receives and later proves ownership of the Access Pass." : "De signingwallet moet dezelfde wallet zijn die de Access Pass ontvangt en later het bezit bewijst."}</p>
            </div>
          </div>

          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">1. Wallet provider</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {PROVIDERS.map((item) => (
              <button key={item.id} type="button" onClick={() => setProvider(item.id)} className={`rounded-2xl border p-4 text-left ${provider === item.id ? "border-violet-500 bg-violet-50 ring-2 ring-violet-100" : "border-slate-200"}`}>
                <p className="font-semibold">{item.label}</p>
                <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
                <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{connectedProvider === item.id ? (en ? "Connected" : "Gekoppeld") : (en ? "Select in wallet hub" : "Selecteer in wallet-hub")}</p>
              </button>
            ))}
          </div>

          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">2. Payment asset</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {(["XRP", "RLUSD"] as CheckoutCurrency[]).map((asset) => (
              <button key={asset} type="button" onClick={() => setCurrency(asset)} className={`flex items-center justify-between rounded-2xl border p-4 ${currency === asset ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100" : "border-slate-200"}`}>
                <span className="flex items-center gap-3"><Coins size={19} className="text-blue-700" /><span className="font-semibold">{asset}</span></span>
                <span className="text-sm font-semibold">{asset === "XRP" ? "0.589" : "1.00"}</span>
              </button>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
            <p className="font-semibold">{en ? "Checkout safety lock" : "Checkout-veiligheidsslot"}</p>
            <p className="mt-2">{en ? "The provider and currency selector is ready. Live payment remains locked until payment verification and automatic NFT delivery pass the same end-to-end production test." : "De provider- en valutakiezer is klaar. Live betaling blijft vergrendeld totdat betalingsverificatie en automatische NFT-levering dezelfde end-to-end productietest doorstaan."}</p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate?.("xaman")}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white"
          >
            <Wallet size={18} />
            {guest || !providerMatches ? (en ? `Connect ${PROVIDERS.find((item) => item.id === provider)?.label}` : `Koppel ${PROVIDERS.find((item) => item.id === provider)?.label}`) : (en ? "Review wallet connection" : "Controleer walletverbinding")}
          </button>
        </div>

        <aside className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">Order preview</p>
          <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-3">
            <img src="/nft/artwork/public-access-pass.png" alt="OTT Public Access Pass" className="mx-auto max-h-64 rounded-xl object-contain" />
          </div>
          <div className="mt-6 space-y-4 text-sm">
            <OrderLine label={en ? "Price" : "Prijs"} value={price} />
            <OrderLine label={en ? "Provider" : "Provider"} value={PROVIDERS.find((item) => item.id === provider)?.label ?? provider} />
            <OrderLine label={en ? "Receiver" : "Ontvanger"} value={guest ? (en ? "Not connected" : "Niet gekoppeld") : `${walletAddress.slice(0, 8)}…${walletAddress.slice(-6)}`} />
            <OrderLine label={en ? "Delivery" : "Levering"} value={en ? "Locked pending E2E" : "Vergrendeld tot E2E"} />
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
