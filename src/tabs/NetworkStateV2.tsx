import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Blocks,
  Copy,
  Database,
  Fingerprint,
  Gauge,
  Loader2,
  RefreshCcw,
  Search,
  Server,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { OttFeatureTabs, type OttFeatureTab } from "../components/OttFeatureTabs";
import { MAKE_WAVES_SOURCE_TAG } from "../lib/makeWaves";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

type ExplorerView = "network" | "search" | "proof" | "transactions";
type ExplorerStatus = "idle" | "loading" | "success" | "error";

type LedgerInfo = {
  ledgerIndex: number;
  ledgerHash: string;
  closeTime: string;
  txCount: number;
};

type ServerInfo = {
  completeLedgers: string;
  loadFactor: string;
  peers: string;
  serverState: string;
  validatedLedger: string;
};

type RecentTransaction = {
  hash: string;
  type: string;
  account: string;
  destination: string;
  amount: string;
  fee: string;
  sourceTag: string;
};

type SearchResult = {
  title: string;
  subtitle: string;
  rows: Array<{ label: string; value: string }>;
};

type XrplResponse = {
  id?: number;
  status?: string;
  error?: string;
  result?: {
    error?: string;
    error_message?: string;
    ledger_index?: number;
    ledger_hash?: string;
    ledger?: {
      ledger_index?: string | number;
      ledger_hash?: string;
      close_time?: number;
      transactions?: Array<string | Record<string, unknown>>;
    };
    info?: {
      complete_ledgers?: string;
      load_factor?: number;
      peers?: number;
      server_state?: string;
      validated_ledger?: { seq?: number; hash?: string };
    };
    account_data?: {
      Account?: string;
      Balance?: string;
      Sequence?: number;
      OwnerCount?: number;
      Flags?: number;
    };
    tx_json?: Record<string, unknown>;
    hash?: string;
    validated?: boolean;
    meta?: { TransactionResult?: string };
  };
};

const XRPL_ENDPOINT = "wss://xrplcluster.com/";

export function NetworkState() {
  const { language } = useTerminalLanguage();
  const en = language === "en";
  const [view, setView] = useState<ExplorerView>("network");
  const [networkStatus, setNetworkStatus] = useState<ExplorerStatus>("idle");
  const [searchStatus, setSearchStatus] = useState<ExplorerStatus>("idle");
  const [error, setError] = useState("");
  const [searchError, setSearchError] = useState("");
  const [ledgerInfo, setLedgerInfo] = useState<LedgerInfo | null>(null);
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [lastUpdated, setLastUpdated] = useState("—");

  const sourceTagHits = useMemo(
    () => recentTransactions.filter((transaction) => transaction.sourceTag === String(MAKE_WAVES_SOURCE_TAG)),
    [recentTransactions],
  );

  const tabs = useMemo<Array<OttFeatureTab<ExplorerView>>>(() => [
    {
      id: "network",
      label: en ? "Live network" : "Live netwerk",
      description: en ? "Validated ledger and server state" : "Gevalideerde ledger en serverstatus",
      icon: Activity,
      badge: networkStatus === "success" ? "LIVE" : "…",
    },
    {
      id: "search",
      label: en ? "XRPL search" : "XRPL zoeken",
      description: en ? "Account or transaction lookup" : "Account- of transactiezoekopdracht",
      icon: Search,
    },
    {
      id: "proof",
      label: "OTT SourceTag proof",
      description: String(MAKE_WAVES_SOURCE_TAG),
      icon: Fingerprint,
      badge: String(sourceTagHits.length),
    },
    {
      id: "transactions",
      label: en ? "Recent transactions" : "Recente transacties",
      description: en ? "Latest validated ledger sample" : "Laatste gevalideerde ledgersample",
      icon: Blocks,
      badge: String(recentTransactions.length),
    },
  ], [en, networkStatus, recentTransactions.length, sourceTagHits.length]);

  useEffect(() => {
    void loadNetworkState();
  }, []);

  async function loadNetworkState() {
    setNetworkStatus("loading");
    setError("");

    try {
      const [ledgerResponse, serverResponse] = await Promise.all([
        xrplRequest({ command: "ledger", ledger_index: "validated", transactions: true, expand: true }),
        xrplRequest({ command: "server_info" }),
      ]);

      if (ledgerResponse.result?.error || serverResponse.result?.error) {
        throw new Error(ledgerResponse.result?.error_message || ledgerResponse.result?.error || serverResponse.result?.error_message || serverResponse.result?.error || "XRPL request failed.");
      }

      const ledger = ledgerResponse.result?.ledger;
      if (!ledger) throw new Error(en ? "The validated ledger was not returned." : "De gevalideerde ledger werd niet teruggegeven.");

      const transactions = ledger.transactions ?? [];
      setLedgerInfo({
        ledgerIndex: Number(ledger.ledger_index ?? ledgerResponse.result?.ledger_index ?? 0),
        ledgerHash: ledger.ledger_hash ?? ledgerResponse.result?.ledger_hash ?? "—",
        closeTime: ledger.close_time ? formatRippleDate(ledger.close_time) : "—",
        txCount: transactions.length,
      });
      setRecentTransactions(
        transactions
          .map(normalizeTransaction)
          .filter((transaction): transaction is RecentTransaction => Boolean(transaction))
          .slice(0, 18),
      );

      const info = serverResponse.result?.info;
      setServerInfo({
        completeLedgers: info?.complete_ledgers ?? "—",
        loadFactor: info?.load_factor !== undefined ? String(info.load_factor) : "—",
        peers: info?.peers !== undefined ? String(info.peers) : "—",
        serverState: info?.server_state ?? "unknown",
        validatedLedger: info?.validated_ledger?.seq !== undefined ? String(info.validated_ledger.seq) : "—",
      });
      setLastUpdated(new Date().toLocaleTimeString(language === "nl" ? "nl-NL" : "en-GB"));
      setNetworkStatus("success");
    } catch (loadError) {
      setNetworkStatus("error");
      setError(loadError instanceof Error ? loadError.message : "XRPL network request failed.");
    }
  }

  async function runSearch() {
    const value = searchValue.trim();
    if (!value) {
      setSearchError(en ? "Enter an XRPL account, transaction hash or the OTT SourceTag." : "Voer een XRPL-account, transactiehash of de OTT SourceTag in.");
      return;
    }

    setSearchStatus("loading");
    setSearchError("");
    setSearchResult(null);

    try {
      if (value === String(MAKE_WAVES_SOURCE_TAG)) {
        setSearchResult({
          title: "OTT SourceTag proof",
          subtitle: String(MAKE_WAVES_SOURCE_TAG),
          rows: [
            { label: en ? "Official SourceTag" : "Officiële SourceTag", value: String(MAKE_WAVES_SOURCE_TAG) },
            { label: en ? "Hits in loaded ledger" : "Hits in geladen ledger", value: String(sourceTagHits.length) },
            { label: en ? "Mode" : "Modus", value: en ? "Read-only public verification" : "Publieke alleen-lezen verificatie" },
          ],
        });
        setSearchStatus("success");
        return;
      }

      if (isLikelyXrplAddress(value)) {
        const response = await xrplRequest({ command: "account_info", account: value, ledger_index: "validated" });
        if (response.result?.error) throw new Error(response.result.error_message || response.result.error);
        const data = response.result?.account_data;
        if (!data?.Account) throw new Error(en ? "Account data was not returned." : "Accountdata werd niet teruggegeven.");
        setSearchResult({
          title: en ? "XRPL account" : "XRPL-account",
          subtitle: data.Account,
          rows: [
            { label: "Balance", value: `${dropsToXrp(data.Balance ?? "0")} XRP` },
            { label: "Sequence", value: data.Sequence !== undefined ? String(data.Sequence) : "—" },
            { label: "Owner Count", value: data.OwnerCount !== undefined ? String(data.OwnerCount) : "0" },
            { label: "Flags", value: data.Flags !== undefined ? String(data.Flags) : "0" },
          ],
        });
        setSearchStatus("success");
        return;
      }

      if (isLikelyTxHash(value)) {
        const response = await xrplRequest({ command: "tx", transaction: value, binary: false });
        if (response.result?.error) throw new Error(response.result.error_message || response.result.error);
        const tx = response.result?.tx_json;
        if (!tx) throw new Error(en ? "Transaction data was not returned." : "Transactiedata werd niet teruggegeven.");
        setSearchResult({
          title: en ? "XRPL transaction" : "XRPL-transactie",
          subtitle: String(tx.hash ?? response.result?.hash ?? value),
          rows: [
            { label: "Type", value: String(tx.TransactionType ?? "—") },
            { label: "Account", value: String(tx.Account ?? "—") },
            { label: "Destination", value: String(tx.Destination ?? "—") },
            { label: "Amount", value: formatAmount(tx.Amount) },
            { label: "Fee", value: tx.Fee ? `${dropsToXrp(String(tx.Fee))} XRP` : "—" },
            { label: "SourceTag", value: tx.SourceTag !== undefined ? String(tx.SourceTag) : "—" },
            { label: "Result", value: response.result?.meta?.TransactionResult ?? "—" },
            { label: "Validated", value: response.result?.validated ? (en ? "Yes" : "Ja") : (en ? "No" : "Nee") },
          ],
        });
        setSearchStatus("success");
        return;
      }

      throw new Error(en ? "No valid XRPL account or transaction hash recognized." : "Geen geldig XRPL-account of transactiehash herkend.");
    } catch (searchLookupError) {
      setSearchStatus("error");
      setSearchError(searchLookupError instanceof Error ? searchLookupError.message : "XRPL search failed.");
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <section className="relative overflow-hidden border-b border-blue-200 bg-[radial-gradient(circle_at_15%_15%,rgba(49,92,255,0.24),transparent_34%),radial-gradient(circle_at_84%_12%,rgba(239,47,145,0.19),transparent_30%),linear-gradient(135deg,#eef4ff_0%,#ffffff_52%,#fff1fa_100%)]">
        <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(37,99,235,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.08)_1px,transparent_1px)] [background-size:34px_34px]" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_340px] lg:items-center lg:py-14">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">XRPL Tools</p>
            <h1 className="mt-4 max-w-4xl font-orbitron text-4xl font-semibold tracking-tight sm:text-5xl">{en ? "Live XRPL data in one clear OTT workspace." : "Live XRPL-data in één duidelijke OTT-werkruimte."}</h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-700">{en ? "Inspect the validated ledger, search public accounts and transactions, and verify the official OTT SourceTag without custody or transaction execution." : "Bekijk de gevalideerde ledger, zoek publieke accounts en transacties en verifieer de officiële OTT SourceTag zonder custody of transactie-uitvoering."}</p>
          </div>
          <div className="rounded-[2rem] border border-white/80 bg-slate-950 p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10"><Activity size={22} /></span><StatusPill status={networkStatus} /></div>
            <p className="mt-7 text-xs font-semibold text-white/45">Validated ledger</p>
            <p className="mt-2 text-3xl font-semibold">{ledgerInfo?.ledgerIndex.toLocaleString() ?? "—"}</p>
            <div className="mt-5 grid grid-cols-2 gap-3"><DarkMetric label={en ? "Transactions" : "Transacties"} value={String(ledgerInfo?.txCount ?? 0)} /><DarkMetric label={en ? "Updated" : "Bijgewerkt"} value={lastUpdated} /></div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8"><OttFeatureTabs items={tabs} activeId={view} onChange={(id) => setView(id as ExplorerView)} ariaLabel={en ? "XRPL tool sections" : "XRPL-toolsecties"} /></div>

      {view === "network" && <NetworkPanel en={en} ledgerInfo={ledgerInfo} serverInfo={serverInfo} status={networkStatus} error={error} onRefresh={() => void loadNetworkState()} />}
      {view === "search" && <SearchPanel en={en} value={searchValue} setValue={setSearchValue} status={searchStatus} error={searchError} result={searchResult} onSearch={() => void runSearch()} />}
      {view === "proof" && <ProofPanel en={en} hits={sourceTagHits.length} ledgerInfo={ledgerInfo} />}
      {view === "transactions" && <TransactionsPanel en={en} transactions={recentTransactions} status={networkStatus} />}
    </div>
  );
}

function NetworkPanel({ en, ledgerInfo, serverInfo, status, error, onRefresh }: { en: boolean; ledgerInfo: LedgerInfo | null; serverInfo: ServerInfo | null; status: ExplorerStatus; error: string; onRefresh: () => void }) {
  return <section className="mx-auto max-w-7xl px-5 pb-12 pt-2 sm:px-8 sm:pb-16"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard icon={Gauge} label={en ? "Validated ledger" : "Gevalideerde ledger"} value={serverInfo?.validatedLedger ?? "—"} text={serverInfo?.serverState ?? "—"} /><MetricCard icon={Server} label="Load factor" value={serverInfo?.loadFactor ?? "—"} text={en ? "XRPL server" : "XRPL-server"} /><MetricCard icon={Zap} label="Peers" value={serverInfo?.peers ?? "—"} text={en ? "Peer network" : "Peernetwerk"} /><MetricCard icon={Database} label={en ? "Ledger range" : "Ledgerbereik"} value={serverInfo?.completeLedgers ?? "—"} text={ledgerInfo?.closeTime ?? "—"} /></div>{error && <p className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">{error}</p>}<div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">Network status</p><h2 className="mt-2 text-2xl font-semibold">{status === "success" ? (en ? "Validated data loaded" : "Gevalideerde data geladen") : (en ? "Load the current network state" : "Laad de actuele netwerkstatus")}</h2><p className="mt-2 break-all text-xs leading-5 text-slate-500">{ledgerInfo?.ledgerHash ?? (en ? "No ledger hash loaded." : "Geen ledgerhash geladen.")}</p></div><button type="button" onClick={onRefresh} disabled={status === "loading"} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{status === "loading" ? <Loader2 className="animate-spin" size={18} /> : <RefreshCcw size={18} />}{en ? "Refresh XRPL" : "Ververs XRPL"}</button></div></div></section>;
}

function SearchPanel({ en, value, setValue, status, error, result, onSearch }: { en: boolean; value: string; setValue: (value: string) => void; status: ExplorerStatus; error: string; result: SearchResult | null; onSearch: () => void }) {
  return <section className="mx-auto max-w-7xl px-5 pb-12 pt-2 sm:px-8 sm:pb-16"><div className="grid gap-6 lg:grid-cols-[1fr_420px]"><div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">Public XRPL lookup</p><h2 className="mt-3 text-3xl font-semibold">{en ? "Search an account or transaction." : "Zoek een account of transactie."}</h2><div className="mt-7 flex flex-col gap-3 sm:flex-row"><div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4"><Search size={18} className="text-slate-400" /><input value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => event.key === "Enter" && onSearch()} placeholder={en ? `r-address, transaction hash or ${MAKE_WAVES_SOURCE_TAG}` : `r-adres, transactiehash of ${MAKE_WAVES_SOURCE_TAG}`} className="w-full bg-transparent py-3.5 text-sm outline-none" /></div><button type="button" onClick={onSearch} disabled={status === "loading"} className="rounded-xl bg-[linear-gradient(135deg,#315cff_0%,#8249ed_52%,#ef2f91_100%)] px-6 py-3.5 text-sm font-semibold text-white disabled:opacity-50">{status === "loading" ? (en ? "Searching…" : "Zoeken…") : (en ? "Search XRPL" : "Zoek XRPL")}</button></div>{error && <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">{error}</p>}</div><ResultCard en={en} result={result} /></div></section>;
}

function ResultCard({ en, result }: { en: boolean; result: SearchResult | null }) {
  if (!result) return <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6"><Search className="text-slate-400" size={22} /><p className="mt-4 font-semibold">{en ? "Search result" : "Zoekresultaat"}</p><p className="mt-2 text-sm leading-6 text-slate-500">{en ? "Public data appears here after a valid lookup." : "Publieke data verschijnt hier na een geldige zoekopdracht."}</p></div>;
  return <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">{result.title}</p><p className="mt-2 break-all text-sm font-semibold">{result.subtitle}</p></div><button type="button" onClick={() => void navigator.clipboard?.writeText(result.subtitle)} className="rounded-xl bg-white/10 p-2.5"><Copy size={16} /></button></div><div className="mt-6 space-y-3">{result.rows.map((row) => <div key={row.label} className="flex items-start justify-between gap-4 border-b border-white/10 pb-3 text-sm"><span className="text-white/45">{row.label}</span><span className="max-w-[230px] break-all text-right font-semibold">{row.value}</span></div>)}</div></div>;
}

function ProofPanel({ en, hits, ledgerInfo }: { en: boolean; hits: number; ledgerInfo: LedgerInfo | null }) {
  return <section className="mx-auto max-w-7xl px-5 pb-12 pt-2 sm:px-8 sm:pb-16"><div className="grid gap-6 lg:grid-cols-[1fr_360px]"><div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#315cff_0%,#8249ed_52%,#ef2f91_100%)] text-white"><Fingerprint size={23} /></span><p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">OTT on-ledger identity</p><h2 className="mt-3 font-orbitron text-3xl font-semibold">SourceTag {MAKE_WAVES_SOURCE_TAG}</h2><p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">{en ? "OTT uses this SourceTag as a public project identifier for relevant XRPL transactions. A SourceTag is evidence context, not proof that every transaction is endorsed by OTT." : "OTT gebruikt deze SourceTag als publieke projectidentificatie voor relevante XRPL-transacties. Een SourceTag geeft bewijscontext, maar bewijst niet dat iedere transactie door OTT wordt onderschreven."}</p></div><div className="rounded-3xl bg-slate-950 p-6 text-white"><ShieldCheck className="text-emerald-300" size={25} /><p className="mt-6 text-xs text-white/45">{en ? "Hits in loaded ledger" : "Hits in geladen ledger"}</p><p className="mt-2 text-4xl font-semibold">{hits}</p><div className="mt-6 space-y-3"><DarkMetric label={en ? "Ledger" : "Ledger"} value={ledgerInfo?.ledgerIndex.toLocaleString() ?? "—"} /><DarkMetric label={en ? "Mode" : "Modus"} value={en ? "Read-only" : "Alleen-lezen"} /></div></div></div></section>;
}

function TransactionsPanel({ en, transactions, status }: { en: boolean; transactions: RecentTransaction[]; status: ExplorerStatus }) {
  return <section className="mx-auto max-w-7xl px-5 pb-12 pt-2 sm:px-8 sm:pb-16"><div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">Validated ledger sample</p><h2 className="mt-2 text-2xl font-semibold">{en ? "Recent transactions" : "Recente transacties"}</h2></div>{status === "loading" ? <p className="mt-6 text-sm text-slate-500">{en ? "Loading transactions…" : "Transacties laden…"}</p> : transactions.length === 0 ? <p className="mt-6 text-sm text-slate-500">{en ? "No expanded transactions were returned in this ledger sample." : "Er werden geen uitgebreide transacties in deze ledgersample teruggegeven."}</p> : <div className="mt-6 grid gap-3 lg:grid-cols-2">{transactions.map((transaction) => <article key={transaction.hash} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center justify-between gap-3"><p className="font-semibold">{transaction.type}</p><span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500">{transaction.amount}</span></div><p className="mt-3 truncate text-xs text-slate-500">{transaction.account}</p><div className="mt-3 flex justify-between text-xs text-slate-500"><span>Fee {transaction.fee}</span><span>Tag {transaction.sourceTag}</span></div></article>)}</div>}</div></section>;
}

function MetricCard({ icon: Icon, label, value, text }: { icon: typeof Gauge; label: string; value: string; text: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><Icon className="text-blue-700" size={20} /><span className="max-w-[190px] truncate text-xs text-slate-400">{text}</span></div><p className="mt-5 text-xs font-medium text-slate-500">{label}</p><p className="mt-2 break-all text-xl font-semibold">{value}</p></div>;
}

function DarkMetric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-white/45">{label}</p><p className="mt-2 break-all text-sm font-semibold">{value}</p></div>;
}

function StatusPill({ status }: { status: ExplorerStatus }) {
  const label = status === "success" ? "LIVE" : status === "loading" ? "SYNC" : status === "error" ? "ERROR" : "IDLE";
  return <span className={`rounded-full px-3 py-1 text-[10px] font-semibold ${status === "success" ? "bg-emerald-400/15 text-emerald-300" : status === "error" ? "bg-rose-400/15 text-rose-300" : "bg-white/10 text-white/60"}`}>{label}</span>;
}

function xrplRequest(request: Record<string, unknown>) {
  return new Promise<XrplResponse>((resolve, reject) => {
    const socket = new WebSocket(XRPL_ENDPOINT);
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const timer = window.setTimeout(() => {
      socket.close();
      reject(new Error("XRPL websocket request timed out."));
    }, 12000);

    socket.addEventListener("open", () => socket.send(JSON.stringify({ id, ...request })));
    socket.addEventListener("message", (event) => {
      try {
        const response = JSON.parse(String(event.data)) as XrplResponse;
        if (response.id !== id) return;
        window.clearTimeout(timer);
        socket.close();
        resolve(response);
      } catch {
        window.clearTimeout(timer);
        socket.close();
        reject(new Error("Could not parse the XRPL response."));
      }
    });
    socket.addEventListener("error", () => {
      window.clearTimeout(timer);
      socket.close();
      reject(new Error("XRPL websocket connection failed."));
    });
  });
}

function normalizeTransaction(value: string | Record<string, unknown>): RecentTransaction | null {
  if (typeof value === "string") return null;
  const hash = String(value.hash ?? "");
  if (!hash) return null;
  return {
    hash,
    type: String(value.TransactionType ?? "Unknown"),
    account: String(value.Account ?? "—"),
    destination: String(value.Destination ?? "—"),
    amount: formatAmount(value.Amount),
    fee: value.Fee ? `${dropsToXrp(String(value.Fee))} XRP` : "—",
    sourceTag: value.SourceTag !== undefined ? String(value.SourceTag) : "—",
  };
}

function formatAmount(value: unknown) {
  if (typeof value === "string") return `${dropsToXrp(value)} XRP`;
  if (value && typeof value === "object") {
    const amount = value as { value?: unknown; currency?: unknown };
    return `${String(amount.value ?? "—")} ${String(amount.currency ?? "token")}`;
  }
  return "—";
}

function dropsToXrp(value: string) {
  const drops = Number(value);
  return Number.isFinite(drops) ? (drops / 1_000_000).toLocaleString("en-US", { maximumFractionDigits: 6 }) : "0";
}

function formatRippleDate(value: number) {
  return new Date((value + 946684800) * 1000).toLocaleString();
}

function isLikelyXrplAddress(value: string) {
  return /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(value);
}

function isLikelyTxHash(value: string) {
  return /^[A-Fa-f0-9]{64}$/.test(value);
}
