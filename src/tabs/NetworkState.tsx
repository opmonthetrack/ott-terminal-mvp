import { useEffect, useMemo, useState } from "react";
import type { ElementType } from "react";
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  Blocks,
  Clock,
  Copy,
  Database,
  Fingerprint,
  Gauge,
  Hash,
  Loader2,
  RefreshCcw,
  Search,
  Server,
  ShieldCheck,
  Wallet,
  Zap,
} from "lucide-react";
import { OTTLogo, OTTProofBadge } from "../components/OTTLogo";
import { MAKE_WAVES_SOURCE_TAG } from "../lib/makeWaves";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

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

type SearchResult = {
  type: "account" | "transaction" | "unknown";
  title: string;
  subtitle: string;
  rows: Array<{ label: string; value: string }>;
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

type ExplorerCopy = {
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;
  intro: string;
  searchPlaceholder: string;
  searchButton: string;
  refresh: string;
  networkState: string;
  live: string;
  ledger: string;
  txCount: string;
  closeTime: string;
  server: string;
  loadFactor: string;
  peers: string;
  validatedLedger: string;
  sourceTagProof: string;
  officialSourceTag: string;
  recentHits: string;
  explorerMode: string;
  readOnly: string;
  recentTransactions: string;
  noTransactions: string;
  searchResult: string;
  noSearch: string;
  account: string;
  transaction: string;
  invalidSearch: string;
  loadingNetwork: string;
  loadingSearch: string;
  networkFailed: string;
  searchFailed: string;
  websocketFailed: string;
  parseFailed: string;
};

const explorerCopy: Record<"nl" | "en", ExplorerCopy> = {
  nl: {
    eyebrow: "XRPL Explorer Layer",
    titleLine1: "Explore Live",
    titleLine2: "XRPL Data.",
    intro:
      "Publieke explorer-laag voor ledgers, transacties, accounts en OTT SourceTag proof. Alles is read-only en direct vanuit XRPL.",
    searchPlaceholder: "Zoek account r..., transaction hash of SourceTag 2606170002",
    searchButton: "Search XRPL",
    refresh: "Refresh",
    networkState: "Network State",
    live: "Live",
    ledger: "Ledger",
    txCount: "Transactions",
    closeTime: "Close Time",
    server: "Server",
    loadFactor: "Load Factor",
    peers: "Peers",
    validatedLedger: "Validated Ledger",
    sourceTagProof: "SourceTag Proof",
    officialSourceTag: "Official SourceTag",
    recentHits: "Recent hits",
    explorerMode: "Explorer Mode",
    readOnly:
      "Read-only XRPL explorer. Geen custody. Geen broker. Geen transacties uitvoeren.",
    recentTransactions: "Recent Ledger Transactions",
    noTransactions: "Geen transacties gevonden in de laatst geladen ledger.",
    searchResult: "Search Result",
    noSearch: "Voer een account of transaction hash in om publieke XRPL data te bekijken.",
    account: "Account",
    transaction: "Transaction",
    invalidSearch: "Geen geldig account of transaction hash herkend.",
    loadingNetwork: "XRPL network data laden...",
    loadingSearch: "XRPL search uitvoeren...",
    networkFailed: "Kon XRPL network state niet laden.",
    searchFailed: "XRPL search is mislukt.",
    websocketFailed: "XRPL websocket verbinding mislukt.",
    parseFailed: "Kon XRPL response niet lezen.",
  },
  en: {
    eyebrow: "XRPL Explorer Layer",
    titleLine1: "Explore Live",
    titleLine2: "XRPL Data.",
    intro:
      "Public explorer layer for ledgers, transactions, accounts, and OTT SourceTag proof. Everything is read-only and loaded directly from XRPL.",
    searchPlaceholder: "Search account r..., transaction hash, or SourceTag 2606170002",
    searchButton: "Search XRPL",
    refresh: "Refresh",
    networkState: "Network State",
    live: "Live",
    ledger: "Ledger",
    txCount: "Transactions",
    closeTime: "Close Time",
    server: "Server",
    loadFactor: "Load Factor",
    peers: "Peers",
    validatedLedger: "Validated Ledger",
    sourceTagProof: "SourceTag Proof",
    officialSourceTag: "Official SourceTag",
    recentHits: "Recent hits",
    explorerMode: "Explorer Mode",
    readOnly:
      "Read-only XRPL explorer. No custody. No broker. No transaction execution.",
    recentTransactions: "Recent Ledger Transactions",
    noTransactions: "No transactions found in the latest loaded ledger.",
    searchResult: "Search Result",
    noSearch: "Enter an account or transaction hash to view public XRPL data.",
    account: "Account",
    transaction: "Transaction",
    invalidSearch: "No valid account or transaction hash recognized.",
    loadingNetwork: "Loading XRPL network data...",
    loadingSearch: "Searching XRPL...",
    networkFailed: "Could not load XRPL network state.",
    searchFailed: "XRPL search failed.",
    websocketFailed: "XRPL websocket connection failed.",
    parseFailed: "Could not read XRPL response.",
  },
};

type XrplResponse = {
  result?: {
    error?: string;
    ledger_index?: number;
    ledger_hash?: string;
    ledger?: {
      ledger_index?: string | number;
      ledger_hash?: string;
      close_time?: number;
      transactions?: Array<
        | string
        | {
            hash?: string;
            TransactionType?: string;
            Account?: string;
            Destination?: string;
            Amount?: string | Record<string, unknown>;
            Fee?: string;
            SourceTag?: number;
          }
      >;
    };
    info?: {
      complete_ledgers?: string;
      load_factor?: number;
      peers?: number;
      server_state?: string;
      validated_ledger?: {
        seq?: number;
        hash?: string;
      };
    };
    account_data?: {
      Account?: string;
      Balance?: string;
      Sequence?: number;
      OwnerCount?: number;
      Flags?: number;
    };
    tx_json?: {
      hash?: string;
      TransactionType?: string;
      Account?: string;
      Destination?: string;
      Amount?: string | Record<string, unknown>;
      Fee?: string;
      SourceTag?: number;
      DestinationTag?: number;
    };
    validated?: boolean;
    meta?: {
      TransactionResult?: string;
    };
  };
};

const XRPL_ENDPOINT = "wss://xrplcluster.com/";

export function NetworkState() {
  const { language } = useTerminalLanguage();
  const c = explorerCopy[language];

  const [networkStatus, setNetworkStatus] = useState<ExplorerStatus>("idle");
  const [searchStatus, setSearchStatus] = useState<ExplorerStatus>("idle");
  const [error, setError] = useState("");
  const [searchError, setSearchError] = useState("");
  const [ledgerInfo, setLedgerInfo] = useState<LedgerInfo | null>(null);
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [lastUpdated, setLastUpdated] = useState("not loaded");

  const sourceTagHits = useMemo(
    () =>
      recentTransactions.filter(
        (transaction) => transaction.sourceTag === String(MAKE_WAVES_SOURCE_TAG),
      ),
    [recentTransactions],
  );

  useEffect(() => {
    void loadNetworkState();
  }, [language]);

  async function loadNetworkState() {
    setNetworkStatus("loading");
    setError("");

    try {
      const [ledgerResponse, serverResponse] = await Promise.all([
        xrplRequest({
          command: "ledger",
          ledger_index: "validated",
          transactions: true,
          expand: true,
        }),
        xrplRequest({
          command: "server_info",
        }),
      ]);

      if (ledgerResponse.result?.error) {
        throw new Error(ledgerResponse.result.error);
      }

      const ledger = ledgerResponse.result?.ledger;

      if (!ledger) {
        throw new Error(c.networkFailed);
      }

      const transactions = ledger.transactions ?? [];

      setLedgerInfo({
        ledgerIndex: Number(ledger.ledger_index ?? ledgerResponse.result?.ledger_index ?? 0),
        ledgerHash: ledger.ledger_hash ?? ledgerResponse.result?.ledger_hash ?? "unknown",
        closeTime: ledger.close_time ? formatRippleDate(ledger.close_time) : "—",
        txCount: transactions.length,
      });

      setRecentTransactions(
        transactions
          .map(normalizeTransaction)
          .filter((transaction): transaction is RecentTransaction => Boolean(transaction))
          .slice(0, 16),
      );

      const info = serverResponse.result?.info;

      setServerInfo({
        completeLedgers: info?.complete_ledgers ?? "—",
        loadFactor: info?.load_factor ? String(info.load_factor) : "—",
        peers: info?.peers ? String(info.peers) : "—",
        serverState: info?.server_state ?? "unknown",
        validatedLedger: info?.validated_ledger?.seq
          ? String(info.validated_ledger.seq)
          : "—",
      });

      setLastUpdated(new Date().toLocaleTimeString());
      setNetworkStatus("success");
    } catch (loadError) {
      setNetworkStatus("error");
      setError(loadError instanceof Error ? loadError.message : c.networkFailed);
    }
  }

  async function runSearch() {
    const value = searchValue.trim();

    if (!value) {
      setSearchError(c.invalidSearch);
      return;
    }

    setSearchStatus("loading");
    setSearchError("");
    setSearchResult(null);

    try {
      if (isLikelyXrplAddress(value)) {
        const response = await xrplRequest({
          command: "account_info",
          account: value,
          ledger_index: "validated",
        });

        if (response.result?.error) {
          throw new Error(response.result.error);
        }

        const data = response.result?.account_data;

        if (!data?.Account) {
          throw new Error(c.searchFailed);
        }

        setSearchResult({
          type: "account",
          title: c.account,
          subtitle: data.Account,
          rows: [
            { label: "Balance", value: `${dropsToXrp(data.Balance ?? "0")} XRP` },
            { label: "Sequence", value: data.Sequence ? String(data.Sequence) : "—" },
            { label: "Owner Count", value: data.OwnerCount ? String(data.OwnerCount) : "0" },
            { label: "Flags", value: data.Flags ? String(data.Flags) : "0" },
          ],
        });
        setSearchStatus("success");
        return;
      }

      if (isLikelyTxHash(value)) {
        const response = await xrplRequest({
          command: "tx",
          transaction: value,
          binary: false,
        });

        if (response.result?.error) {
          throw new Error(response.result.error);
        }

        const tx = response.result?.tx_json;

        if (!tx) {
          throw new Error(c.searchFailed);
        }

        setSearchResult({
          type: "transaction",
          title: c.transaction,
          subtitle: tx.hash ?? value,
          rows: [
            { label: "Type", value: tx.TransactionType ?? "—" },
            { label: "Account", value: tx.Account ?? "—" },
            { label: "Destination", value: tx.Destination ?? "—" },
            { label: "Amount", value: formatAmount(tx.Amount) },
            { label: "Fee", value: tx.Fee ? `${dropsToXrp(tx.Fee)} XRP` : "—" },
            { label: "SourceTag", value: tx.SourceTag ? String(tx.SourceTag) : "—" },
            { label: "Result", value: response.result?.meta?.TransactionResult ?? "—" },
            { label: "Validated", value: response.result?.validated ? "Yes" : "No" },
          ],
        });
        setSearchStatus("success");
        return;
      }

      if (value === String(MAKE_WAVES_SOURCE_TAG)) {
        setSearchResult({
          type: "unknown",
          title: c.sourceTagProof,
          subtitle: String(MAKE_WAVES_SOURCE_TAG),
          rows: [
            { label: c.officialSourceTag, value: String(MAKE_WAVES_SOURCE_TAG) },
            { label: c.recentHits, value: String(sourceTagHits.length) },
            { label: c.explorerMode, value: c.readOnly },
          ],
        });
        setSearchStatus("success");
        return;
      }

      throw new Error(c.invalidSearch);
    } catch (searchLookupError) {
      setSearchStatus("error");
      setSearchError(
        searchLookupError instanceof Error
          ? searchLookupError.message
          : c.searchFailed,
      );
    }
  }

  function copySearchValue() {
    if (!searchResult?.subtitle) {
      return;
    }

    void navigator.clipboard?.writeText(searchResult.subtitle);
  }

  return (
    <div className="min-h-screen bg-white text-[#080808]">
      <section className="relative overflow-hidden border-b border-black/10 bg-[radial-gradient(circle_at_18%_18%,rgba(56,152,232,0.16),transparent_28%),radial-gradient(circle_at_82%_8%,rgba(200,56,136,0.16),transparent_28%),radial-gradient(circle_at_85%_82%,rgba(216,72,88,0.12),transparent_30%),#ffffff]">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.22),#ffffff_92%)]" />

        <div className="relative z-10 p-4 md:p-6 xl:p-10">
          <div className="grid grid-cols-12 gap-6 items-end">
            <div className="col-span-12 xl:col-span-8">
              <div className="mb-6">
                <OTTLogo size="lg" subtitle="Live XRPL Explorer" />
              </div>

              <div className="inline-flex items-center gap-2 border border-black/10 bg-white/80 shadow-sm px-4 py-2 mb-6">
                <Blocks size={15} className="text-[#3898E8]" />

                <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/55">
                  {c.eyebrow}
                </p>
              </div>

              <h1 className="font-orbitron text-4xl xl:text-6xl font-black uppercase leading-none tracking-tight mb-6">
                {c.titleLine1}
                <br />
                <span className="bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] bg-clip-text text-transparent">
                  {c.titleLine2}
                </span>
              </h1>

              <p className="font-mono text-sm xl:text-base text-black/60 leading-relaxed max-w-3xl mb-8">
                {c.intro}
              </p>

              <div className="border border-black/10 bg-white/90 backdrop-blur p-3 max-w-4xl shadow-xl shadow-black/5">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex-1 flex items-center gap-3 border border-black/10 bg-[#F7F8FC] px-4">
                    <Search size={18} className="text-black/35 shrink-0" />

                    <input
                      value={searchValue}
                      onChange={(event) => setSearchValue(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          void runSearch();
                        }
                      }}
                      placeholder={c.searchPlaceholder}
                      className="w-full bg-transparent py-4 outline-none font-mono text-xs text-black placeholder:text-black/25"
                    />
                  </div>

                  <button
                    onClick={() => void runSearch()}
                    disabled={searchStatus === "loading"}
                    className="bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] text-white px-6 py-4 font-orbitron text-xs font-black uppercase tracking-widest hover:brightness-95 transition-all disabled:opacity-50"
                  >
                    {searchStatus === "loading" ? c.loadingSearch : c.searchButton}
                  </button>
                </div>

                {searchStatus === "error" && (
                  <ErrorBox text={searchError} />
                )}
              </div>
            </div>

            <div className="col-span-12 xl:col-span-4">
              <div className="border border-black/10 bg-white/90 backdrop-blur p-5 shadow-xl shadow-black/5">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <p className="font-orbitron text-xs uppercase tracking-widest">
                    {c.networkState}
                  </p>

                  <StatusPill status={networkStatus} label={c.live} />
                </div>

                <div className="mb-4 text-black">
                  <OTTProofBadge sourceTag={String(MAKE_WAVES_SOURCE_TAG)} />
                </div>

                <div className="space-y-3">
                  <InfoRow
                    label={c.ledger}
                    value={ledgerInfo ? ledgerInfo.ledgerIndex.toLocaleString() : "—"}
                  />
                  <InfoRow
                    label={c.txCount}
                    value={ledgerInfo ? String(ledgerInfo.txCount) : "—"}
                  />
                  <InfoRow
                    label={c.closeTime}
                    value={ledgerInfo?.closeTime ?? "—"}
                  />
                  <InfoRow label="Updated" value={lastUpdated} />
                </div>

                <button
                  onClick={() => void loadNetworkState()}
                  disabled={networkStatus === "loading"}
                  className="w-full border border-black/10 bg-[#F7F8FC] p-4 mt-5 text-left hover:bg-white hover:shadow-md transition-all disabled:opacity-40"
                >
                  <div className="flex items-center gap-3">
                    {networkStatus === "loading" ? (
                      <Loader2 size={16} className="text-[#C83888] animate-spin" />
                    ) : (
                      <RefreshCcw size={16} className="text-[#3898E8]" />
                    )}

                    <p className="font-orbitron text-xs font-black uppercase">
                      {c.refresh}
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {networkStatus === "error" && <ErrorBox text={error} />}

          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mt-8">
            <MetricCard
              label={c.validatedLedger}
              value={serverInfo?.validatedLedger ?? "—"}
              text={serverInfo?.serverState ?? c.server}
              icon={Gauge}
            />
            <MetricCard
              label={c.loadFactor}
              value={serverInfo?.loadFactor ?? "—"}
              text={c.server}
              icon={Server}
            />
            <MetricCard
              label={c.peers}
              value={serverInfo?.peers ?? "—"}
              text="XRPL peer network"
              icon={Zap}
            />
            <MetricCard
              label={c.recentHits}
              value={String(sourceTagHits.length)}
              text={String(MAKE_WAVES_SOURCE_TAG)}
              icon={Fingerprint}
            />
          </div>
        </div>
      </section>

      <section className="p-4 md:p-6 xl:p-10 bg-white">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-7 border border-black/10 bg-white p-5 md:p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/35 mb-3">
                  XRPL
                </p>

                <h2 className="font-orbitron text-2xl font-black uppercase">
                  {c.recentTransactions}
                </h2>
              </div>

              <p className="font-mono text-xs text-black/45 max-w-md leading-relaxed">
                {c.readOnly}
              </p>
            </div>

            {networkStatus === "loading" ? (
              <LoadingBox text={c.loadingNetwork} />
            ) : recentTransactions.length === 0 ? (
              <EmptyBox text={c.noTransactions} />
            ) : (
              <div className="space-y-2">
                {recentTransactions.map((transaction) => (
                  <TransactionRow key={transaction.hash} transaction={transaction} />
                ))}
              </div>
            )}
          </div>

          <div className="col-span-12 xl:col-span-5 space-y-4">
            <div className="border border-black/10 bg-white p-5 md:p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-2">
                  <Search size={18} className="text-[#C83888]" />

                  <p className="font-orbitron text-xs uppercase tracking-widest">
                    {c.searchResult}
                  </p>
                </div>

                {searchResult && (
                  <button
                    onClick={copySearchValue}
                    className="border border-black/10 bg-[#F7F8FC] p-2 hover:bg-white transition-all"
                  >
                    <Copy size={14} />
                  </button>
                )}
              </div>

              {!searchResult ? (
                <EmptyBox text={c.noSearch} />
              ) : (
                <SearchResultCard result={searchResult} />
              )}
            </div>

            <div className="border border-black/10 bg-white p-5 md:p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <ShieldCheck size={18} className="text-[#3898E8]" />

                <p className="font-orbitron text-xs uppercase tracking-widest">
                  {c.sourceTagProof}
                </p>
              </div>

              <div className="space-y-3">
                <ProofRow label={c.officialSourceTag} value={String(MAKE_WAVES_SOURCE_TAG)} />
                <ProofRow label={c.recentHits} value={String(sourceTagHits.length)} />
                <ProofRow label={c.explorerMode} value={c.live} />
              </div>

              <div className="border border-[#C83888]/25 bg-[#C83888]/10 p-4 mt-5">
                <p className="font-mono text-xs text-black/55 leading-relaxed">
                  {c.readOnly}
                </p>
              </div>
            </div>

            <div className="border border-black/10 bg-white p-5 md:p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <Database size={18} className="text-[#3898E8]" />

                <p className="font-orbitron text-xs uppercase tracking-widest">
                  {c.server}
                </p>
              </div>

              <div className="space-y-3">
                <InfoRow
                  label="Complete Ledgers"
                  value={serverInfo?.completeLedgers ?? "—"}
                />
                <InfoRow
                  label="Server State"
                  value={serverInfo?.serverState ?? "—"}
                />
                <InfoRow
                  label="Ledger Hash"
                  value={ledgerInfo?.ledgerHash ?? "—"}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatusPill({ status, label }: { status: ExplorerStatus; label: string }) {
  const isLive = status === "success";

  return (
    <div className="border border-black/10 bg-[#F7F8FC] px-3 py-2">
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${
            isLive ? "bg-[#3898E8]" : "bg-black/25"
          }`}
        />

        <p className="font-mono text-[9px] uppercase tracking-widest text-black/55">
          {status === "loading" ? "Loading" : isLive ? label : "Idle"}
        </p>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  text,
  icon: Icon,
}: {
  label: string;
  value: string;
  text: string;
  icon: ElementType;
}) {
  return (
    <div className="border border-black/10 bg-white/90 p-4 shadow-sm">
      <Icon size={18} className="text-[#C83888] mb-3" />

      <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">
        {label}
      </p>

      <p className="font-orbitron text-sm font-black uppercase mb-1 break-all">
        {value}
      </p>

      <p className="font-mono text-[10px] text-black/35 uppercase">{text}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-3">
      <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">
        {label}
      </p>

      <p className="font-orbitron text-xs font-black uppercase break-all">
        {value}
      </p>
    </div>
  );
}

function ProofRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border border-black/10 bg-[#F7F8FC] p-4">
      <p className="font-mono text-xs text-black/45 uppercase tracking-widest">
        {label}
      </p>

      <p className="font-orbitron text-xs font-black uppercase text-right break-all">
        {value}
      </p>
    </div>
  );
}

function SearchResultCard({ result }: { result: SearchResult }) {
  const Icon =
    result.type === "account"
      ? Wallet
      : result.type === "transaction"
        ? Hash
        : Fingerprint;

  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-4">
      <div className="flex items-start gap-3 mb-5">
        <Icon size={20} className="text-[#C83888] shrink-0 mt-1" />

        <div className="min-w-0">
          <p className="font-orbitron text-sm font-black uppercase mb-2">
            {result.title}
          </p>

          <p className="font-mono text-xs text-black/50 break-all">
            {result.subtitle}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {result.rows.map((row) => (
          <InfoRow key={row.label} label={row.label} value={row.value} />
        ))}
      </div>
    </div>
  );
}

function TransactionRow({ transaction }: { transaction: RecentTransaction }) {
  const isOttSourceTag =
    transaction.sourceTag === String(MAKE_WAVES_SOURCE_TAG);

  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-4">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <p className="font-orbitron text-xs font-black uppercase">
              {transaction.type}
            </p>

            {isOttSourceTag && (
              <span className="border border-transparent bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] text-white px-2 py-1 font-mono text-[8px] uppercase tracking-widest">
                OTT
              </span>
            )}
          </div>

          <p className="font-mono text-xs text-black/55 break-all">
            {shortHash(transaction.hash)}
          </p>

          <p className="font-mono text-[10px] text-black/40 uppercase mt-2">
            {transaction.account}
          </p>
        </div>

        <div className="md:text-right">
          <p className="font-mono text-[10px] text-black/45 uppercase mb-2">
            SourceTag: {transaction.sourceTag}
          </p>

          <p className="font-mono text-[10px] text-black/45 uppercase">
            Fee: {transaction.fee}
          </p>
        </div>
      </div>
    </div>
  );
}

function ErrorBox({ text }: { text: string }) {
  return (
    <div className="border border-[#D84858]/25 bg-[#D84858]/10 p-4 mt-4">
      <div className="flex items-start gap-3">
        <AlertTriangle size={18} className="text-[#D84858] shrink-0 mt-0.5" />

        <p className="font-mono text-xs text-black/60 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function EmptyBox({ text }: { text: string }) {
  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-6 text-center">
      <p className="font-mono text-xs text-black/45 leading-relaxed">{text}</p>
    </div>
  );
}

function LoadingBox({ text }: { text: string }) {
  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-8 text-center">
      <Loader2 size={22} className="animate-spin mx-auto mb-4 text-[#C83888]" />

      <p className="font-mono text-xs text-black/45">{text}</p>
    </div>
  );
}

function normalizeTransaction(
  input:
    | string
    | {
        hash?: string;
        TransactionType?: string;
        Account?: string;
        Destination?: string;
        Amount?: string | Record<string, unknown>;
        Fee?: string;
        SourceTag?: number;
      },
): RecentTransaction | null {
  if (typeof input === "string") {
    return {
      hash: input,
      type: "Unknown",
      account: "—",
      destination: "—",
      amount: "—",
      fee: "—",
      sourceTag: "—",
    };
  }

  if (!input.hash) {
    return null;
  }

  return {
    hash: input.hash,
    type: input.TransactionType ?? "Unknown",
    account: input.Account ?? "—",
    destination: input.Destination ?? "—",
    amount: formatAmount(input.Amount),
    fee: input.Fee ? `${dropsToXrp(input.Fee)} XRP` : "—",
    sourceTag: input.SourceTag ? String(input.SourceTag) : "—",
  };
}

function isLikelyXrplAddress(value: string): boolean {
  return /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(value);
}

function isLikelyTxHash(value: string): boolean {
  return /^[A-Fa-f0-9]{64}$/.test(value);
}

async function xrplRequest(payload: Record<string, unknown>): Promise<XrplResponse> {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(XRPL_ENDPOINT);
    const timeout = window.setTimeout(() => {
      socket.close();
      reject(new Error("XRPL request timeout."));
    }, 12000);

    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          id: 1,
          ...payload,
        }),
      );
    };

    socket.onmessage = (event) => {
      window.clearTimeout(timeout);
      socket.close();

      try {
        resolve(JSON.parse(event.data) as XrplResponse);
      } catch {
        reject(new Error("Could not parse XRPL response."));
      }
    };

    socket.onerror = () => {
      window.clearTimeout(timeout);
      socket.close();
      reject(new Error("XRPL websocket connection failed."));
    };
  });
}

function dropsToXrp(value: string): string {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return value;
  }

  return (numericValue / 1_000_000).toLocaleString(undefined, {
    maximumFractionDigits: 6,
  });
}

function formatAmount(value: string | Record<string, unknown> | undefined): string {
  if (!value) {
    return "—";
  }

  if (typeof value === "string") {
    return `${dropsToXrp(value)} XRP`;
  }

  const currency = typeof value.currency === "string" ? value.currency : "Issued";
  const amount = typeof value.value === "string" ? value.value : "—";
  const issuer = typeof value.issuer === "string" ? value.issuer : "";

  return `${amount} ${currency}${issuer ? ` / ${issuer}` : ""}`;
}

function formatRippleDate(rippleDate: number): string {
  const rippleEpochOffset = 946684800;
  const unixSeconds = rippleDate + rippleEpochOffset;

  return new Date(unixSeconds * 1000).toLocaleString();
}

function shortHash(hash: string): string {
  if (hash.length <= 18) {
    return hash;
  }

  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}
