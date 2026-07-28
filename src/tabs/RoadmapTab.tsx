import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Loader2,
  RefreshCcw,
  ShieldCheck,
  Vote,
  Wallet,
} from "lucide-react";
import { MAKE_WAVES_SOURCE_TAG } from "../lib/makeWaves";
import {
  createRoadmapVotePayload,
  getRoadmapVotePayloadUrl,
  getRoadmapVotePayloadUuid,
  getRoadmapVoteStats,
  type RoadmapVoteOptionId,
  type RoadmapVoteStatsResponse,
} from "../lib/roadmapVoteClient";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";
import { saveXamanMobileSession } from "../lib/xamanMobileSession";

const PENDING_KEY = "ott-terminal-roadmap-pending-vote-v3";
const PENDING_MAX_AGE = 30 * 60 * 1000;

type Props = { walletAddress?: string; onNavigate?: (target: string) => void };
type Phase = {
  id: RoadmapVoteOptionId;
  phase: string;
  title: string;
  summary: string;
  deliverables: string[];
};
type PendingVote = { voteId: RoadmapVoteOptionId; payloadUuid: string; createdAt: number };

function phases(en: boolean): Phase[] {
  return [
    {
      id: "academy-expansion",
      phase: en ? "Phase 2" : "Fase 2",
      title: en ? "Academy Expansion" : "Academy-uitbreiding",
      summary: en ? "More practical XRPL learning paths, wallet safety and proof-ready exercises." : "Meer praktische XRPL-leerpaden, walletveiligheid en proof-ready oefeningen.",
      deliverables: en ? ["Beginner learning paths", "Wallet-specific labs", "Verified completion credentials"] : ["Leerpaden voor beginners", "Walletspecifieke labs", "Geverifieerde voltooiingscredentials"],
    },
    {
      id: "web2-license",
      phase: en ? "Phase 3" : "Fase 3",
      title: en ? "Web2 License Access" : "Toegang via Web2-licentie",
      summary: en ? "A normal invoice and software-license route for people and companies not ready for crypto." : "Een normale factuur- en softwarelicentieroute voor mensen en bedrijven die nog niet klaar zijn voor crypto.",
      deliverables: en ? ["Invoice or payment-provider route", "Clear software access terms", "No forced crypto conversion"] : ["Factuur- of betaaldienstverlenersroute", "Duidelijke softwaretoegang", "Geen gedwongen crypto-omzetting"],
    },
    {
      id: "marketplace-merch",
      phase: en ? "Phase 4" : "Fase 4",
      title: en ? "Marketplace + Merch" : "Marktplaats + merchandise",
      summary: en ? "OTT products, learning bundles and community merchandise connected to the terminal." : "OTT-producten, leerbundels en communitymerchandise verbonden aan de terminal.",
      deliverables: en ? ["Product showcase", "Safe holder utility", "Education-first checkout"] : ["Productpresentatie", "Veilige holderutility", "Educatie vóór checkout"],
    },
    {
      id: "ai-research",
      phase: en ? "Phase 5" : "Fase 5",
      title: en ? "AI Research Assistant" : "AI-onderzoeksassistent",
      summary: en ? "A source-aware assistant for XRPL research, education and campaign preparation." : "Een bronbewuste assistent voor XRPL-onderzoek, educatie en campagnevoorbereiding.",
      deliverables: en ? ["Source-backed research", "Newsroom support", "Human review before publishing"] : ["Onderzoek met bronnen", "Newsroom-ondersteuning", "Menselijke controle vóór publicatie"],
    },
    {
      id: "token-tools-review",
      phase: en ? "Phase 6" : "Fase 6",
      title: en ? "Token Tools + Legal Review" : "Tokenhulpmiddelen + juridische toetsing",
      summary: en ? "Advanced token tooling only after demand, safety testing and legal review." : "Geavanceerde tokentools pas na vraag, veiligheidstests en juridische toetsing.",
      deliverables: en ? ["Labs-first tooling", "No value promise", "Legal review before public release"] : ["Eerst in labs", "Geen waardebelofte", "Juridische toetsing vóór publieke release"],
    },
  ];
}

function loadPending(): PendingVote | null {
  if (typeof window === "undefined") return null;
  try {
    const value = JSON.parse(window.localStorage.getItem(PENDING_KEY) ?? "null") as PendingVote | null;
    if (!value || Date.now() - value.createdAt > PENDING_MAX_AGE) {
      window.localStorage.removeItem(PENDING_KEY);
      return null;
    }
    return value;
  } catch {
    window.localStorage.removeItem(PENDING_KEY);
    return null;
  }
}

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "error" in error) return String((error as { error?: unknown }).error ?? fallback);
  return fallback;
}

function shortAddress(value: string) {
  return value.length > 15 ? `${value.slice(0, 8)}…${value.slice(-5)}` : value;
}

function voteTime(value: string | null) {
  if (!value) return "XRPL";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "XRPL" : date.toLocaleString([], { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function RoadmapTab({ walletAddress = "guest", onNavigate }: Props) {
  const { language } = useTerminalLanguage();
  const en = language === "en";
  const options = useMemo(() => phases(en), [en]);
  const validWallet = /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(walletAddress);
  const [stats, setStats] = useState<RoadmapVoteStatsResponse | null>(null);
  const [pending, setPending] = useState<PendingVote | null>(() => loadPending());
  const [busyVote, setBusyVote] = useState<RoadmapVoteOptionId | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState(en ? "Loading validated XRPL votes…" : "Gevalideerde XRPL-stemmen laden…");

  const byId = useMemo(() => new Map(options.map((item) => [item.id, item])), [options]);
  const ranking = useMemo(() => {
    const source = stats?.ranking ?? options.map((item) => ({ id: item.id, title: item.title, votes: stats?.counts?.[item.id] ?? 0 }));
    return source.map((item) => ({ ...item, title: byId.get(item.id)?.title ?? item.title }));
  }, [stats, options, byId]);
  const total = stats?.totals?.activeVerifiedVotes ?? 0;
  const selected = stats?.walletVote?.voteId ?? pending?.voteId ?? null;

  async function refresh(silent = false) {
    if (!silent) setRefreshing(true);
    try {
      const response = await getRoadmapVoteStats(validWallet ? walletAddress : undefined);
      setStats(response);
      const localPending = loadPending();
      if (localPending && response.walletVote?.voteId === localPending.voteId) {
        window.localStorage.removeItem(PENDING_KEY);
        setPending(null);
        setMessage(en ? "Vote validated on XRPL and included in the live ranking." : "Stem gevalideerd op XRPL en opgenomen in de live ranglijst.");
      } else if (localPending) {
        setPending(localPending);
        setMessage(en ? "Signing request exists. The vote appears only after XRPL validation." : "Signingverzoek bestaat. De stem verschijnt pas na XRPL-validatie.");
      } else if (response.walletVote) {
        setMessage(en ? "Your newest validated vote is active. A newer signed vote replaces it." : "Je nieuwste gevalideerde stem is actief. Een nieuwere ondertekende stem vervangt deze.");
      } else {
        setMessage(validWallet ? (en ? "Choose one priority and review the exact 1-drop proof before signing." : "Kies één prioriteit en controleer het exacte 1-dropbewijs vóór ondertekening.") : (en ? "Connect a verified XRPL wallet before voting." : "Koppel een geverifieerde XRPL-wallet voordat je stemt."));
      }
    } catch (error) {
      setMessage(errorMessage(error, en ? "The live tally could not be loaded." : "De live telling kon niet worden geladen."));
    } finally {
      if (!silent) setRefreshing(false);
    }
  }

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(true), 15000);
    return () => window.clearInterval(timer);
  }, [walletAddress, en]);

  async function castVote(option: Phase) {
    if (!validWallet) {
      setMessage(en ? "Connect and verify a wallet first. Guest votes are rejected by the server." : "Koppel en verifieer eerst een wallet. Gaststemmen worden door de server geweigerd.");
      onNavigate?.("wallet");
      return;
    }
    setBusyVote(option.id);
    setMessage(en ? `Creating an account-bound vote for ${option.title}…` : `Accountgebonden stem voor ${option.title} wordt gemaakt…`);
    try {
      const response = await createRoadmapVotePayload(option.id, walletAddress);
      const uuid = getRoadmapVotePayloadUuid(response);
      const url = getRoadmapVotePayloadUrl(response);
      if (!uuid || !url) throw new Error(en ? "Xaman did not return a valid vote request." : "Xaman gaf geen geldig stemverzoek terug.");
      saveXamanMobileSession({ payloadUuid: uuid, actionId: "roadmap-vote", returnTarget: "roadmap", expectedWallet: walletAddress });
      const next = { voteId: option.id, payloadUuid: uuid, createdAt: Date.now() } satisfies PendingVote;
      window.localStorage.setItem(PENDING_KEY, JSON.stringify(next));
      setPending(next);
      window.location.assign(url);
    } catch (error) {
      setMessage(errorMessage(error, en ? "The roadmap vote could not be created." : "De roadmapstem kon niet worden gemaakt."));
      setBusyVote(null);
    }
  }

  return (
    <div className="ott-core-tab min-h-screen bg-white text-slate-950">
      <section className="border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-4xl">
              <p className="text-sm font-semibold text-blue-700">OTT Roadmap Voting</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                {en ? "One wallet. One active priority. Public XRPL proof." : "Eén wallet. Eén actieve prioriteit. Openbaar XRPL-bewijs."}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
                {en ? "The server counts only validated 1-drop Mainnet payments that match the connected account, destination, SourceTag and roadmap memo. A newer valid vote replaces the previous vote from the same wallet." : "De server telt alleen gevalideerde Mainnetbetalingen van 1 drop die overeenkomen met het gekoppelde account, de bestemming, SourceTag en roadmapmemo. Een nieuwere geldige stem vervangt de vorige stem van dezelfde wallet."}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-medium text-slate-500">Make Waves SourceTag</p>
              <p className="mt-1 text-xl font-semibold">{MAKE_WAVES_SOURCE_TAG}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label={en ? "Active wallets" : "Actieve wallets"} value={total} />
            <Metric label={en ? "Validated vote transactions" : "Gevalideerde stemtransacties"} value={stats?.totals?.verifiedVoteTransactions ?? 0} />
            <Metric label={en ? "Transactions scanned" : "Gescande transacties"} value={stats?.totals?.scannedAccountTransactions ?? 0} />
            <Metric label={en ? "Ledger scan" : "Ledgerscan"} value={stats?.totals?.scanComplete === false ? (en ? "Limited" : "Begrensd") : (en ? "Complete" : "Volledig")} />
          </div>

          {stats?.totals?.scanComplete === false && (
            <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
              {en ? `The public tally reached the current scan limit of ${stats.totals.scanLimit ?? 1000} account transactions. Older votes need an indexer or persistent vote table before this cycle can be called complete.` : `De openbare telling bereikte de huidige scanlimiet van ${stats.totals.scanLimit ?? 1000} accounttransacties. Oudere stemmen vereisen een indexer of permanente stemtabel voordat deze cyclus volledig kan worden genoemd.`}
            </p>
          )}
        </div>
      </section>

      <div data-page-region="true" className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
          <section>
            <div className="flex items-center justify-between gap-4">
              <div><p className="text-sm font-semibold text-blue-700">{en ? "Choose the next priority" : "Kies de volgende prioriteit"}</p><h2 className="mt-2 text-3xl font-semibold">{en ? "Roadmap options" : "Roadmapopties"}</h2></div>
              <button type="button" onClick={() => void refresh()} disabled={refreshing} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-800 disabled:opacity-50"><RefreshCcw className={refreshing ? "animate-spin" : ""} size={18} />{en ? "Refresh" : "Vernieuwen"}</button>
            </div>

            <div className="mt-6 space-y-4">
              {options.map((option) => {
                const votes = stats?.counts?.[option.id] ?? 0;
                const percentage = total ? Math.round((votes / total) * 100) : 0;
                const active = selected === option.id;
                return (
                  <article key={option.id} className={`rounded-3xl border p-5 sm:p-7 ${active ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200"}`}>
                    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
                      <div className="max-w-2xl">
                        <div className="flex flex-wrap items-center gap-3"><span className="text-xs font-semibold text-slate-500">{option.phase}</span>{active && <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800"><BadgeCheck size={14} />{pending?.voteId === option.id && !stats?.walletVote ? (en ? "Awaiting validation" : "Wacht op validatie") : (en ? "Your active vote" : "Jouw actieve stem")}</span>}</div>
                        <h3 className="mt-3 text-2xl font-semibold">{option.title}</h3>
                        <p className="mt-3 text-sm leading-7 text-slate-600">{option.summary}</p>
                        <ul className="mt-4 grid gap-2 sm:grid-cols-3">{option.deliverables.map((item) => <li key={item} className="flex gap-2 text-xs leading-5 text-slate-600"><CheckCircle2 className="mt-0.5 shrink-0 text-emerald-700" size={15} />{item}</li>)}</ul>
                      </div>
                      <div className="min-w-40 rounded-2xl bg-slate-50 p-4 text-right"><p className="text-3xl font-semibold">{votes}</p><p className="mt-1 text-xs text-slate-500">{percentage}% · {en ? "active votes" : "actieve stemmen"}</p></div>
                    </div>
                    <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-slate-900" style={{ width: `${percentage}%` }} /></div>
                    <button type="button" onClick={() => void castVote(option)} disabled={busyVote !== null || !validWallet} className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">{busyVote === option.id ? <Loader2 className="animate-spin" size={18} /> : <Vote size={18} />}{active ? (en ? "Replace with a fresh signed vote" : "Vervang met nieuwe ondertekende stem") : (en ? "Vote with Xaman" : "Stem met Xaman")}</button>
                  </article>
                );
              })}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-slate-200 p-6">
              <div className="flex items-center gap-3"><BarChart3 className="text-blue-700" size={21} /><h2 className="text-lg font-semibold">{en ? "Live ranking" : "Live ranglijst"}</h2></div>
              <ol className="mt-5 space-y-3">{ranking.map((item, index) => <li key={item.id} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4"><div className="flex min-w-0 items-center gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold">{index + 1}</span><span className="truncate text-sm font-medium">{item.title}</span></div><span className="font-semibold">{item.votes}</span></li>)}</ol>
            </section>

            <section className="rounded-3xl border border-slate-200 p-6">
              <div className="flex items-center gap-3"><ShieldCheck className="text-emerald-700" size={21} /><h2 className="text-lg font-semibold">{en ? "Integrity rules" : "Integriteitsregels"}</h2></div>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
                <li>• {en ? "Connected account must match the signing account." : "Gekoppeld account moet gelijk zijn aan het signingaccount."}</li>
                <li>• {en ? "Payment must be validated with tesSUCCESS." : "Betaling moet gevalideerd zijn met tesSUCCESS."}</li>
                <li>• {en ? "Destination, 1 drop, memo and SourceTag must match exactly." : "Bestemming, 1 drop, memo en SourceTag moeten exact kloppen."}</li>
                <li>• {en ? "Only the newest valid vote per wallet remains active." : "Alleen de nieuwste geldige stem per wallet blijft actief."}</li>
              </ul>
              {!validWallet && <button type="button" onClick={() => onNavigate?.("wallet")} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"><Wallet size={18} />{en ? "Connect wallet" : "Wallet koppelen"}</button>}
            </section>

            <section className="rounded-3xl border border-slate-200 p-6">
              <div className="flex items-center gap-3"><Clock3 className="text-slate-600" size={21} /><h2 className="text-lg font-semibold">{en ? "Recent validated votes" : "Recente gevalideerde stemmen"}</h2></div>
              <div className="mt-5 space-y-3">{(stats?.recentVotes ?? []).slice(0, 8).map((vote) => <a key={vote.txHash ?? `${vote.account}-${vote.ledgerIndex}`} href={vote.txHash ? `https://livenet.xrpl.org/transactions/${vote.txHash}` : undefined} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4 text-sm"><div><p className="font-medium">{byId.get(vote.voteId)?.title ?? vote.title}</p><p className="mt-1 text-xs text-slate-500">{shortAddress(vote.account)} · {voteTime(vote.timestamp)}</p></div>{vote.txHash && <ExternalLink size={16} className="shrink-0 text-slate-500" />}</a>)}</div>
            </section>
          </aside>
        </div>

        {message && <p role="status" className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-950">{message}</p>}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p></div>;
}
