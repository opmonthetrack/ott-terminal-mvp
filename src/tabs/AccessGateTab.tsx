import { useEffect, useState } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  KeyRound,
  Loader2,
  Lock,
  RefreshCcw,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { AccessPassOrderPanel } from "../components/AccessPassOrderPanel";
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
    if (!silent) setMessage(en ? "Scanning the validated ledger for the exact OTT Access Pass…" : "De gevalideerde ledger wordt gescand op de exacte OTT Access Pass…");
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
      <section className="relative overflow-hidden border-b border-slate-200 bg-[radial-gradient(circle_at_18%_20%,rgba(56,152,232,0.18),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(200,56,136,0.16),transparent_30%),#fff]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1fr_380px] lg:items-center lg:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">OTT Access Gate</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">
              {en ? "Learn freely. Verify once. Unlock with the NFT you own." : "Leer gratis. Verifieer één keer. Ontgrendel met het NFT dat je bezit."}
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600">
              {en
                ? "The Alpha series contains 500 unique Access Pass numbers. The server validates the 1.589 XRP payment, reserves one number and only unlocks premium areas after XRPL ownership is confirmed."
                : "De Alpha-serie bevat 500 unieke Access Pass-nummers. De server valideert de betaling van 1.589 XRP, reserveert één nummer en ontgrendelt premiumdelen pas nadat XRPL-eigendom is bevestigd."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Badge text="1.589 XRP" />
              <Badge text="#001–#500" />
              <Badge text={`Taxon ${OTT_ACCESS_PASS_TAXON}`} />
              <Badge text={en ? "Utility only" : "Alleen utility"} />
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/80 bg-slate-950 p-7 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <OTTLogoMark size="lg" />
              {unlocked ? <ShieldCheck className="text-emerald-300" size={30} /> : <Lock className="text-slate-500" size={28} />}
            </div>
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Current access</p>
            <p className="mt-2 text-3xl font-semibold">{unlocked ? (en ? "Unlocked" : "Ontgrendeld") : (en ? "Public preview" : "Publieke preview")}</p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <DarkMetric label={en ? "Wallet" : "Wallet"} value={guest ? (en ? "Not linked" : "Niet gekoppeld") : `${walletAddress.slice(0, 7)}…${walletAddress.slice(-5)}`} />
              <DarkMetric label="NFT" value={scan?.hasAccessPass ? (en ? "Found" : "Gevonden") : (en ? "Not verified" : "Niet geverifieerd")} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-3xl border border-slate-200 p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><KeyRound size={22} /></span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">XRPL ownership scanner</p>
                <h2 className="mt-2 text-2xl font-semibold">{en ? "Check the connected wallet" : "Controleer de gekoppelde wallet"}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {en
                    ? "The scan matches the trusted issuer, collection taxon and approved metadata URI. It never moves XRP or NFTs."
                    : "De scan vergelijkt de vertrouwde issuer, collectietaxon en goedgekeurde metadata-URI. De scan verplaatst nooit XRP of NFT's."}
                </p>
              </div>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              <Metric label="Metadata CID" value={OTT_ACCESS_PASS_METADATA_CID} />
              <Metric label="NFTokenID" value={shortNftId(scan?.matchedNft?.nftokenId)} />
              <Metric label={en ? "Checked NFTs" : "Gecontroleerde NFT's"} value={String(scan?.totalNftsChecked ?? 0)} />
            </div>

            {message && <p className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-950">{message}</p>}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {guest ? (
                <button type="button" onClick={() => onNavigate?.("xaman")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"><Wallet size={18} />{en ? "Connect wallet" : "Wallet koppelen"}</button>
              ) : (
                <button type="button" onClick={() => void scanWallet()} disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy ? <Loader2 className="animate-spin" size={18} /> : <RefreshCcw size={18} />}{en ? "Scan Access Pass" : "Access Pass scannen"}</button>
              )}
              <button type="button" onClick={resetLocalAccess} disabled={guest} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold hover:bg-slate-50 disabled:opacity-40">{en ? "Clear local cache" : "Lokale cache wissen"}</button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Security model</p>
            <div className="mt-5 space-y-4">
              <SecurityLine icon={CheckCircle2} text={en ? "Validated XRPL payment, not only a signature" : "Gevalideerde XRPL-betaling, niet alleen een handtekening"} />
              <SecurityLine icon={BadgeCheck} text={en ? "Atomic unique number reservation" : "Atomaire reservering van een uniek nummer"} />
              <SecurityLine icon={ShieldCheck} text={en ? "Founder signs mint and targeted offer in Xaman" : "Founder tekent mint en doelgerichte offer in Xaman"} />
              <SecurityLine icon={Wallet} text={en ? "Access after confirmed wallet ownership" : "Toegang na bevestigd walletbezit"} />
            </div>
          </div>
        </div>
      </section>

      <AccessPassOrderPanel walletAddress={walletAddress} onNavigate={onNavigate} />
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm">{text}</span>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs text-slate-500">{label}</p><p className="mt-1 break-all text-sm font-semibold text-slate-900">{value}</p></div>;
}

function DarkMetric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 break-all font-semibold text-slate-100">{value}</p></div>;
}

function SecurityLine({ icon: Icon, text }: { icon: typeof ShieldCheck; text: string }) {
  return <div className="flex items-start gap-3 text-sm leading-6 text-slate-700"><Icon className="mt-0.5 shrink-0 text-blue-700" size={18} /><span>{text}</span></div>;
}
