import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Copy,
  Gift,
  Loader2,
  LockKeyhole,
  RefreshCcw,
  Share2,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { useOttAuthSession } from "../lib/useOttAuthSession";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";
import { submitWalletTestTransaction } from "../lib/walletConnectors";
import { getWalletProvider, type WalletProviderId } from "../lib/walletRegistry";
import {
  claimWalletTesterPass,
  createWalletTestChallenge,
  getWalletTestStatus,
  verifyWalletTestChallenge,
  type WalletTestStatusResponse,
} from "../lib/walletTestClient";

const TESTABLE = new Set<WalletProviderId>(["xaman", "crossmark", "gemwallet"]);

type Props = {
  walletAddress: string;
  providerId: WalletProviderId;
};

export function WalletTestingPanel({ walletAddress, providerId }: Props) {
  const { language } = useTerminalLanguage();
  const isEnglish = language === "en";
  const { signedIn } = useOttAuthSession();
  const [snapshot, setSnapshot] = useState<WalletTestStatusResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const provider = getWalletProvider(providerId);
  const connected = /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(walletAddress);
  const providerStats = useMemo(
    () => snapshot?.providers?.find((item) => item.providerId === providerId) ?? null,
    [providerId, snapshot],
  );

  useEffect(() => {
    void refresh();
  }, [signedIn, walletAddress, providerId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const challengeId = params.get("challenge") ?? "";
    if (params.get("wallet_test_return") !== "1" || !challengeId) return;
    void verify(challengeId);
    params.delete("wallet_test_return");
    params.delete("challenge");
    params.delete("payload");
    const url = `${window.location.pathname}?${params.toString()}`.replace(/\?$/, "");
    window.history.replaceState({}, document.title, url);
  }, []);

  async function refresh() {
    try {
      setSnapshot(await getWalletTestStatus());
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Wallet-test status could not be loaded.");
    }
  }

  async function startTest() {
    if (!signedIn) {
      setStatus(isEnglish ? "Sign in to bind the one-time proof and reward to your OTT account." : "Log in om het eenmalige bewijs en de beloning aan je OTT-account te koppelen.");
      return;
    }
    if (!connected || !TESTABLE.has(providerId)) {
      setStatus(isEnglish ? "Connect Xaman, CROSSMARK or GemWallet before starting the public proof." : "Koppel Xaman, CROSSMARK of GemWallet voordat je het openbare bewijs start.");
      return;
    }

    setBusy(true);
    setStatus(isEnglish ? "Creating an account-bound 1-drop XRPL challenge…" : "Accountgebonden XRPL-challenge van 1 drop wordt gemaakt…");
    try {
      const challenge = await createWalletTestChallenge(providerId, walletAddress);
      if (!challenge.challenge || !challenge.txjson) throw new Error("The server did not return a complete wallet-test challenge.");

      if (providerId === "xaman") {
        const url = challenge.payload?.next?.always ?? challenge.payload?.next?.no_push_msg_received;
        if (!url) throw new Error("Xaman did not return a signing URL.");
        window.location.assign(url);
        return;
      }

      const hash = await submitWalletTestTransaction(providerId, challenge.txjson);
      setStatus(isEnglish ? "Transaction submitted. Waiting for validated XRPL proof…" : "Transactie ingediend. Wachten op gevalideerd XRPL-bewijs…");
      await verify(challenge.challenge.id, hash);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Wallet test failed.");
    } finally {
      setBusy(false);
    }
  }

  async function verify(challengeId: string, transactionHash?: string) {
    setBusy(true);
    try {
      const result = await verifyWalletTestChallenge(challengeId, transactionHash);
      const next = result.status ?? result;
      setSnapshot(next);
      setStatus(
        result.pending
          ? (isEnglish ? "The signature exists; XRPL validation is still pending. Refresh shortly." : "De handtekening bestaat; XRPL-validatie is nog bezig. Vernieuw zo opnieuw.")
          : (isEnglish ? "100% individual wallet proof validated and saved." : "100% individueel walletbewijs gevalideerd en opgeslagen."),
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Wallet proof could not be verified.");
    } finally {
      setBusy(false);
    }
  }

  async function claimPass() {
    const resultId = snapshot?.user?.result?.id;
    if (!resultId) return;
    setBusy(true);
    try {
      const result = await claimWalletTesterPass(resultId);
      if (result.status) setSnapshot(result.status);
      setStatus(
        isEnglish
          ? `Wallet Tester Pass #${String(result.reservation?.serial_number ?? "").padStart(6, "0")} reserved. On-chain minting enters the verified issuer queue.`
          : `Wallet Tester Pass #${String(result.reservation?.serial_number ?? "").padStart(6, "0")} gereserveerd. On-chain minting gaat naar de geverifieerde issuerwachtrij.`,
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Tester Pass could not be reserved.");
    } finally {
      setBusy(false);
    }
  }

  function shareTest() {
    const text = isEnglish
      ? `Help test ${provider.name} in OTT Terminal and move the XRPL wallet integration toward 100%.`
      : `Help ${provider.name} testen in OTT Terminal en breng de XRPL-walletintegratie richting 100%.`;
    const url = `${window.location.origin}${window.location.pathname}?tab=wallet&testWallet=${providerId}`;
    if (navigator.share) void navigator.share({ title: "OTT Wallet Test", text, url });
    else void navigator.clipboard?.writeText(`${text} ${url}`);
    setStatus(isEnglish ? "Public test link copied or shared." : "Openbare testlink gekopieerd of gedeeld.");
  }

  const individual = snapshot?.user?.individualPercentage ?? 0;
  const publicPercentage = providerStats?.percentage ?? 0;
  const nftEligible = Boolean(snapshot?.user?.nftEligible);
  const reward = snapshot?.user?.reward;

  return (
    <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
        <div>
          <div className="flex items-center gap-3 text-blue-700">
            <ShieldCheck size={22} />
            <p className="text-sm font-semibold">{isEnglish ? "Public wallet verification" : "Openbare walletverificatie"}</p>
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
            {isEnglish ? "Test the connector. Publish the evidence. Earn eligibility." : "Test de connector. Publiceer het bewijs. Verdien eligibility."}
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            {isEnglish
              ? "OTT creates a one-time account-bound 1-drop Mainnet payment. The server verifies the signer, destination, amount, SourceTag 2606170002 and exact challenge memo before progress changes."
              : "OTT maakt een eenmalige accountgebonden Mainnetbetaling van 1 drop. De server controleert signer, bestemming, bedrag, SourceTag 2606170002 en exacte challengememo voordat voortgang verandert."}
          </p>
        </div>
        <img src="/nft/wallet-tester-pass.svg" alt="OTT Wallet Tester Pass" className="aspect-square w-full rounded-3xl bg-slate-950 object-cover shadow-lg" />
      </div>

      {snapshot?.setupRequired && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          {isEnglish ? "Database setup is still required before public wallet testing can store evidence." : "Database-installatie is nog vereist voordat openbare wallettests bewijs kunnen opslaan."}
        </div>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <ProgressCard title={isEnglish ? "Your proof" : "Jouw bewijs"} value={individual} detail={individual === 100 ? (isEnglish ? "Validated and saved" : "Gevalideerd en opgeslagen") : (isEnglish ? "Complete one signed proof" : "Voltooi één ondertekend bewijs")} />
        <ProgressCard title={`${provider.name} ${isEnglish ? "platform status" : "platformstatus"}`} value={publicPercentage} detail={`${providerStats?.validatedTests ?? 0}/${providerStats?.requiredTests ?? "—"} ${isEnglish ? "unique validated testers" : "unieke gevalideerde testers"}`} />
        <div className="rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-950">Wallet Tester Pass</p>
            {reward?.status === "reserved" || reward?.status === "issued" ? <BadgeCheck className="text-emerald-700" size={21} /> : nftEligible ? <Gift className="text-blue-700" size={21} /> : <LockKeyhole className="text-slate-400" size={21} />}
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            {reward?.serial_number
              ? `#${String(reward.serial_number).padStart(6, "0")} · ${reward.status}`
              : nftEligible
                ? (isEnglish ? "Eligible for one account-bound reservation." : "Eligible voor één accountgebonden reservering.")
                : (isEnglish ? "Unlocks only after your proof and provider are both 100%." : "Opent alleen wanneer jouw bewijs en de provider beide 100% zijn.")}
          </p>
        </div>
      </div>

      {status && <p role="status" className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-950">{status}</p>}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button type="button" onClick={() => void startTest()} disabled={busy || snapshot?.setupRequired || !providerStats?.publicTestingEnabled} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">
          {busy ? <Loader2 className="animate-spin" size={18} /> : individual === 100 ? <RefreshCcw size={18} /> : <WalletCards size={18} />}
          {individual === 100 ? (isEnglish ? "Run a fresh proof" : "Nieuw bewijs uitvoeren") : (isEnglish ? `Test ${provider.name}` : `${provider.name} testen`)}
        </button>
        {nftEligible && !reward?.serial_number && (
          <button type="button" onClick={() => void claimPass()} disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-300 bg-blue-50 px-5 py-3 text-sm font-semibold text-blue-950">
            <Gift size={18} />{isEnglish ? "Reserve my Tester Pass" : "Reserveer mijn Tester Pass"}<ArrowRight size={17} />
          </button>
        )}
        <button type="button" onClick={shareTest} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800">
          <Share2 size={18} />{isEnglish ? "Invite another tester" : "Nodig een tester uit"}
        </button>
        <button type="button" onClick={() => void refresh()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800">
          <RefreshCcw size={18} />{isEnglish ? "Refresh evidence" : "Bewijs vernieuwen"}
        </button>
      </div>

      <div className="mt-8 grid gap-3 md:grid-cols-3">
        {(snapshot?.providers ?? []).filter((item) => ["xaman", "crossmark", "gemwallet"].includes(item.providerId)).map((item) => (
          <div key={item.providerId} className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-900">{getWalletProvider(item.providerId).name}</p>
              <span className="text-sm font-semibold text-slate-700">{item.percentage}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-slate-900" style={{ width: `${item.percentage}%` }} /></div>
            <p className="mt-3 text-xs leading-5 text-slate-500">{item.validatedTests}/{item.requiredTests} {isEnglish ? "validated public proofs" : "gevalideerde openbare bewijzen"}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-600">
        <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-700" size={17} />
        <span>{isEnglish ? "No seed, mnemonic or private key enters OTT. A copied public transaction hash cannot claim another user's reward because every memo is tied to the signed-in account's one-time challenge." : "Geen seed, mnemonic of private key komt in OTT. Een gekopieerde openbare transactiehash kan de beloning van een andere gebruiker niet claimen omdat iedere memo aan de eenmalige challenge van het ingelogde account is gekoppeld."}</span>
      </div>
    </section>
  );
}

function ProgressCard({ title, value, detail }: { title: string; value: number; detail: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-slate-950">{title}</p><span className="text-lg font-semibold text-slate-950">{value}%</span></div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-slate-950" style={{ width: `${value}%` }} /></div>
      <p className="mt-3 text-xs leading-5 text-slate-500">{detail}</p>
    </div>
  );
}
