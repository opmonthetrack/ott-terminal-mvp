import { useEffect, useState } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  KeyRound,
  Loader2,
  Lock,
  RefreshCcw,
  ShieldCheck,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { NftCollectionGallery } from "../components/NftCollectionGallery";
import { OTTLogoMark } from "../components/OTTLogo";
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
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

type AccessGateTabProps = {
  walletAddress?: string;
  onNavigate?: (target: string) => void;
};

export function AccessGateTab({ walletAddress = "guest", onNavigate }: AccessGateTabProps) {
  const { language } = useTerminalLanguage();
  const en = language === "en";
  const guest = walletAddress === "guest" || !walletAddress;
  const [accessState, setAccessState] = useState<AccessState>(() => loadAccessState(walletAddress));
  const [scan, setScan] = useState<AccessPassOwnershipResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const unlocked = isAccessVerified(accessState) || Boolean(scan?.hasAccessPass);

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
      setMessage(
        en
          ? "Scanning the validated ledger for the currently configured OTT Access Pass collection…"
          : "De gevalideerde ledger wordt gescand op de momenteel geconfigureerde OTT Access Pass-collectie…",
      );
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
      <section className="relative overflow-hidden border-b border-blue-200 bg-[radial-gradient(circle_at_15%_15%,rgba(59,130,246,0.38),transparent_34%),radial-gradient(circle_at_84%_12%,rgba(124,58,237,0.28),transparent_30%),linear-gradient(135deg,#eef5ff_0%,#ffffff_52%,#f6f0ff_100%)]">
        <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(37,99,235,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.08)_1px,transparent_1px)] [background-size:34px_34px]" />

        <div className="relative mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_360px] lg:items-center lg:py-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">OTT NFT & Access</p>
            <h1 className="mt-4 max-w-4xl font-orbitron text-4xl font-semibold tracking-tight sm:text-5xl">
              {en ? "All seven NFT routes in one clear place." : "Alle zeven NFT-routes op één duidelijke plek."}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-700">
              {en
                ? "Start with the progression overview, compare compact collection cards and open eligibility details only when needed. Access verification remains separate and never moves funds."
                : "Begin met het voortgangsoverzicht, vergelijk compacte collectiekaarten en open eligibilitydetails alleen wanneer nodig. Toegangsverificatie blijft apart en verplaatst nooit geld."}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Badge text={en ? "Genesis · not for sale" : "Genesis · niet te koop"} />
              <Badge text="Public · 0.589 XRP / 1.00 RLUSD" />
              <Badge text={en ? "4 earned credentials" : "4 verdiende credentials"} />
              <Badge text={en ? "1 planned credential" : "1 geplande credential"} />
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/80 bg-slate-950 p-7 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <OTTLogoMark size="lg" />
              {unlocked ? <ShieldCheck className="text-emerald-300" size={30} /> : <Lock className="text-slate-500" size={28} />}
            </div>
            <p className="mt-8 text-xs font-semibold text-slate-400">Current access</p>
            <p className="mt-2 text-3xl font-semibold">{unlocked ? (en ? "Unlocked" : "Ontgrendeld") : (en ? "Public preview" : "Publieke preview")}</p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <DarkMetric label={en ? "Wallet" : "Wallet"} value={guest ? (en ? "Not linked" : "Niet gekoppeld") : `${walletAddress.slice(0, 7)}…${walletAddress.slice(-5)}`} />
              <DarkMetric label="NFT" value={scan?.hasAccessPass ? (en ? "Found" : "Gevonden") : (en ? "Not verified" : "Niet geverifieerd")} />
            </div>
          </div>
        </div>
      </section>

      <NftCollectionGallery />

      <section className="border-t border-slate-200 bg-slate-50/60">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-12">
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><KeyRound size={22} /></span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">XRPL ownership scanner</p>
                  <h2 className="mt-2 text-2xl font-semibold">{en ? "Check the connected wallet" : "Controleer de gekoppelde wallet"}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {en
                      ? "This scanner checks the configured Access Pass by trusted issuer, taxon and metadata URI. It never moves XRP or NFTs."
                      : "Deze scanner controleert de geconfigureerde Access Pass via vertrouwde issuer, taxon en metadata-URI. Hij verplaatst nooit XRP of NFT's."}
                  </p>
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
                  <button type="button" onClick={() => onNavigate?.("xaman")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"><Wallet size={18} />{en ? "Sync wallet" : "Wallet synchroniseren"}</button>
                ) : (
                  <button type="button" onClick={() => void scanWallet()} disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy ? <Loader2 className="animate-spin" size={18} /> : <RefreshCcw size={18} />}{en ? "Scan Access Pass" : "Scan Access Pass"}</button>
                )}
                <button type="button" onClick={resetLocalAccess} disabled={guest} className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold hover:bg-slate-50 disabled:opacity-40">{en ? "Clear local cache" : "Lokale cache wissen"}</button>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Security model</p>
                <div className="mt-5 space-y-4">
                  <SecurityLine icon={CheckCircle2} text={en ? "Eligibility is verified before minting" : "Eligibility wordt vóór minting geverifieerd"} />
                  <SecurityLine icon={BadgeCheck} text={en ? "No duplicate wallet/course-version credential" : "Geen dubbele wallet/curriculumversie-credential"} />
                  <SecurityLine icon={ShieldCheck} text={en ? "Founder or issuer signs the actual mint and delivery" : "Founder of issuer tekent de echte mint en levering"} />
                  <SecurityLine icon={Wallet} text={en ? "Utility unlocks after confirmed wallet ownership" : "Utility opent na bevestigd walletbezit"} />
                </div>
              </div>

              <div className="rounded-3xl border border-blue-200 bg-blue-50 p-6">
                <div className="flex items-start gap-3">
                  <ShoppingBag className="mt-0.5 shrink-0 text-blue-700" size={21} />
                  <div>
                    <p className="text-sm font-semibold text-blue-950">{en ? "Public Access checkout status" : "Status Public Access-checkout"}</p>
                    <p className="mt-2 text-sm leading-6 text-blue-950/80">
                      {en
                        ? "Terms are fixed at 0.589 XRP or 1.00 RLUSD. Checkout stays disabled until issuer, metadata, payment verification and delivery pass end-to-end testing."
                        : "De voorwaarden staan vast op 0,589 XRP of 1,00 RLUSD. Checkout blijft uit totdat issuer, metadata, betalingsverificatie en levering end-to-end zijn getest."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
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

function SecurityLine({ icon: Icon, text }: { icon: typeof ShieldCheck; text: string }) {
  return <div className="flex items-start gap-3 text-sm leading-6 text-slate-700"><Icon className="mt-0.5 shrink-0 text-blue-700" size={18} /><span>{text}</span></div>;
}
