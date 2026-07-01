import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Clock3,
  Database,
  Fingerprint,
  Gauge,
  Link2,
  Loader2,
  Network,
  Search,
  Server,
  ShieldCheck,
  Wallet,
  Zap,
} from "lucide-react";
import { MAKE_WAVES_SOURCE_TAG } from "../lib/makeWaves";

type ConnectionStatus = "connecting" | "connected" | "offline";

type ExplorerStats = {
  ledgerIndex: number | null;
  ledgerHash: string;
  loadFactor: string;
  networkId: string;
  serverState: string;
  endpoint: string;
};

type LatestTransaction = {
  hash: string;
  type: string;
  account: string;
  destination: string;
  amount: string;
  fee: string;
};

type SearchKind = "account" | "transaction" | "sourcetag" | "asset" | "unknown";

type SearchResult = {
  kind: SearchKind;
  value: string;
  title: string;
  description: string;
};

type XrplMessage = {
  type?: string;
  ledger_index?: number;
  ledger_hash?: string;
  ledger_time?: number;
  result?: {
    ledger_current_index?: number;
    ledger?: {
      ledger_index?: string | number;
      ledger_hash?: string;
      transactions?: XrplTransaction[];
    };
    info?: {
      complete_ledgers?: string;
      load_factor?: number | string;
      network_id?: number | string;
      server_state?: string;
      validated_ledger?: {
        seq?: number;
        hash?: string;
      };
    };
  };
};

type XrplTransaction = {
  hash?: string;
  TransactionType?: string;
  Account?: string;
  Destination?: string;
  Amount?: string | { currency?: string; value?: string; issuer?: string };
  Fee?: string;
};

const XRPL_WEBSOCKET_ENDPOINT = "wss://xrplcluster.com/";

const initialStats: ExplorerStats = {
  ledgerIndex: null,
  ledgerHash: "waiting for ledger stream",
  loadFactor: "—",
  networkId: "mainnet",
  serverState: "connecting",
  endpoint: XRPL_WEBSOCKET_ENDPOINT,
};

export function NetworkState() {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [stats, setStats] = useState<ExplorerStats>(initialStats);
  const [transactions, setTransactions] = useState<LatestTransaction[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("waiting");

  const visibleTransactions = useMemo(
    () => transactions.slice(0, 8),
    [transactions],
  );

  useEffect(() => {
    let isClosed = false;
    let requestId = 1;
    let refreshTimer: number | undefined;

    const socket = new WebSocket(XRPL_WEBSOCKET_ENDPOINT);

    function send(command: string, payload: Record<string, unknown> = {}) {
      if (socket.readyState !== WebSocket.OPEN) {
        return;
      }

      socket.send(
        JSON.stringify({
          id: requestId,
          command,
          ...payload,
        }),
      );

      requestId += 1;
    }

    socket.onopen = () => {
      if (isClosed) {
        return;
      }

      setStatus("connected");
      setLastUpdated(new Date().toLocaleTimeString());

      send("server_info");
      send("ledger_current");
      send("subscribe", { streams: ["ledger"] });

      refreshTimer = window.setInterval(() => {
        send("server_info");
      }, 15000);
    };

    socket.onmessage = (event) => {
      const message = safeParse(event.data);

      if (!message) {
        return;
      }

      if (message.type === "ledgerClosed") {
        const nextLedgerIndex = message.ledger_index ?? null;

        setStats((current) => ({
          ...current,
          ledgerIndex: nextLedgerIndex ?? current.ledgerIndex,
          ledgerHash: message.ledger_hash ?? current.ledgerHash,
          serverState: "connected",
        }));

        setLastUpdated(new Date().toLocaleTimeString());

        if (nextLedgerIndex) {
          send("ledger", {
            ledger_index: nextLedgerIndex,
            transactions: true,
            expand: true,
          });
        }
      }

      if (message.result?.ledger_current_index) {
        setStats((current) => ({
          ...current,
          ledgerIndex: message.result?.ledger_current_index ?? current.ledgerIndex,
        }));
      }

      if (message.result?.info) {
        const info = message.result.info;

        setStats((current) => ({
          ...current,
          loadFactor: info.load_factor ? String(info.load_factor) : current.loadFactor,
          networkId: info.network_id ? String(info.network_id) : current.networkId,
          serverState: info.server_state ?? current.serverState,
          ledgerIndex: info.validated_ledger?.seq ?? current.ledgerIndex,
          ledgerHash: info.validated_ledger?.hash ?? current.ledgerHash,
        }));

        setLastUpdated(new Date().toLocaleTimeString());
      }

      if (message.result?.ledger?.transactions) {
        const latest = message.result.ledger.transactions
          .map(normalizeTransaction)
          .filter((item): item is LatestTransaction => Boolean(item));

        if (latest.length > 0) {
          setTransactions(latest);
          setLastUpdated(new Date().toLocaleTimeString());
        }

        setStats((current) => ({
          ...current,
          ledgerIndex:
            Number(message.result?.ledger?.ledger_index) || current.ledgerIndex,
          ledgerHash: message.result?.ledger?.ledger_hash ?? current.ledgerHash,
        }));
      }
    };

    socket.onerror = () => {
      setStatus("offline");
      setStats((current) => ({
        ...current,
        serverState: "offline",
      }));
    };

    socket.onclose = () => {
      if (!isClosed) {
        setStatus("offline");
        setStats((current) => ({
          ...current,
          serverState: "offline",
        }));
      }
    };

    return () => {
      isClosed = true;

      if (refreshTimer) {
        window.clearInterval(refreshTimer);
      }

      socket.close();
    };
  }, []);

  function handleSearch() {
    const value = searchValue.trim();

    if (!value) {
      setSearchResult(null);
      return;
    }

    setSearchResult(buildSearchResult(value));
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,_white,_transparent_26%),radial-gradient(circle_at_90%_10%,_white,_transparent_22%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,_transparent,_black_88%)]" />

        <div className="relative z-10 p-6 xl:p-10">
          <div className="grid grid-cols-12 gap-6 items-end">
            <div className="col-span-12 xl:col-span-8">
              <div className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.03] px-4 py-2 mb-6">
                {status === "connected" ? (
                  <Zap size={15} className="text-white/70" />
                ) : (
                  <Loader2 size={15} className="text-white/50 animate-spin" />
                )}

                <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/50">
                  Live XRPL Explorer Layer
                </p>
              </div>

              <h1 className="font-orbitron text-4xl xl:text-6xl font-black uppercase leading-none tracking-tight mb-6">
                Search XRPL.
                <br />
                Track Ledgers.
                <br />
                Verify Proof.
              </h1>

              <p className="font-mono text-sm xl:text-base text-white/50 leading-relaxed max-w-3xl mb-8">
                De nieuwe publieke voorkant van OTT Terminal. Eerst echte XRPL
                data, daarna Xaman dashboard en daarna OTT Proof / Education
                rond SourceTag {MAKE_WAVES_SOURCE_TAG}.
              </p>

              <div className="border border-white/10 bg-black/80 backdrop-blur p-3 max-w-4xl">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex-1 flex items-center gap-3 border border-white/10 bg-white/[0.03] px-4">
                    <Search size={18} className="text-white/35 shrink-0" />

                    <input
                      value={searchValue}
                      onChange={(event) => setSearchValue(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          handleSearch();
                        }
                      }}
                      placeholder="Search account / tx hash / asset / SourceTag"
                      className="w-full bg-transparent py-4 outline-none font-mono text-xs text-white placeholder:text-white/25"
                    />
                  </div>

                  <button
                    onClick={handleSearch}
                    className="bg-white text-black px-6 py-4 font-orbitron text-xs font-black uppercase tracking-widest hover:bg-white/80 transition-all"
                  >
                    Search
                  </button>
                </div>

                {searchResult && (
                  <div className="border border-white/10 bg-white/[0.02] p-4 mt-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/35 mb-3">
                      {searchResult.kind} result
                    </p>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <p className="font-orbitron text-sm font-black uppercase mb-2 break-all">
                          {searchResult.title}
                        </p>

                        <p className="font-mono text-xs text-white/45 leading-relaxed">
                          {searchResult.description}
                        </p>
                      </div>

                      <div className="font-mono text-[10px] text-white/35 uppercase break-all md:text-right">
                        {searchResult.value}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="col-span-12 xl:col-span-4">
              <div className="border border-white/10 bg-black/70 backdrop-blur p-5">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <p className="font-orbitron text-xs uppercase tracking-widest">
                    Network Status
                  </p>

                  <StatusPill status={status} />
                </div>

                <div className="space-y-3">
                  <ExplorerRow label="Endpoint" value={stats.endpoint} />
                  <ExplorerRow label="Server State" value={stats.serverState} />
                  <ExplorerRow label="Network ID" value={stats.networkId} />
                  <ExplorerRow label="Last Update" value={lastUpdated} />
                </div>

                <div className="border border-white/10 bg-white/[0.02] p-4 mt-5">
                  <div className="flex items-start gap-3">
                    <ShieldCheck size={18} className="text-white/55 shrink-0 mt-0.5" />

                    <p className="font-mono text-xs text-white/45 leading-relaxed">
                      Explorer mode is read-only. No custody, no broker, no
                      yield, no trade execution.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mt-8">
            <StatCard
              label="Current Ledger"
              value={stats.ledgerIndex ? formatNumber(stats.ledgerIndex) : "Loading"}
              text="Live XRPL stream"
              icon={Database}
            />
            <StatCard
              label="Load Factor"
              value={stats.loadFactor}
              text="Server info"
              icon={Gauge}
            />
            <StatCard
              label="SourceTag"
              value={String(MAKE_WAVES_SOURCE_TAG)}
              text="OTT proof identity"
              icon={Fingerprint}
            />
            <StatCard
              label="Latest Txs"
              value={String(visibleTransactions.length)}
              text="From latest ledger"
              icon={Activity}
            />
          </div>
        </div>
      </section>

      <section className="p-6 xl:p-10">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-8 border border-white/10 bg-white/[0.02] p-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/35 mb-3">
                  Live Stream
                </p>

                <h2 className="font-orbitron text-2xl font-black uppercase">
                  Latest Transactions
                </h2>
              </div>

              <p className="font-mono text-xs text-white/35 max-w-md leading-relaxed">
                Real-time concept view. Voor productie kunnen we later een
                eigen XRPL indexer/cache toevoegen voor snellere search pages.
              </p>
            </div>

            {visibleTransactions.length === 0 ? (
              <div className="border border-white/10 bg-black p-8 text-center">
                <Loader2 size={22} className="animate-spin mx-auto mb-4 text-white/45" />

                <p className="font-orbitron text-xs font-black uppercase mb-2">
                  Waiting for next validated ledger
                </p>

                <p className="font-mono text-xs text-white/35">
                  De live XRPL stream laadt de nieuwste ledger transacties.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {visibleTransactions.map((tx) => (
                  <TransactionRow key={tx.hash} tx={tx} />
                ))}
              </div>
            )}
          </div>

          <div className="col-span-12 xl:col-span-4 space-y-4">
            <div className="border border-white/10 bg-white/[0.02] p-6">
              <div className="flex items-center gap-2 mb-5">
                <Fingerprint size={18} className="text-white/60" />

                <p className="font-orbitron text-xs uppercase tracking-widest">
                  SourceTag Search
                </p>
              </div>

              <p className="font-mono text-xs text-white/45 leading-relaxed mb-5">
                OTT proof identity blijft gekoppeld aan SourceTag{" "}
                {MAKE_WAVES_SOURCE_TAG}. Later krijgt dit een eigen publieke
                proof explorer.
              </p>

              <button
                onClick={() => {
                  setSearchValue(String(MAKE_WAVES_SOURCE_TAG));
                  setSearchResult(buildSearchResult(String(MAKE_WAVES_SOURCE_TAG)));
                }}
                className="w-full border border-white/10 bg-black p-4 text-left hover:bg-white hover:text-black transition-all group"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-orbitron text-xs font-black uppercase mb-2">
                      Search OTT SourceTag
                    </p>
                    <p className="font-mono text-[10px] uppercase text-white/35 group-hover:text-black/55">
                      {MAKE_WAVES_SOURCE_TAG}
                    </p>
                  </div>

                  <ArrowRight size={17} className="text-white/40 group-hover:text-black/70" />
                </div>
              </button>
            </div>

            <div className="border border-white/10 bg-white/[0.02] p-6">
              <div className="flex items-center gap-2 mb-5">
                <Wallet size={18} className="text-white/60" />

                <p className="font-orbitron text-xs uppercase tracking-widest">
                  Next Layer
                </p>
              </div>

              <div className="space-y-3">
                <MiniRoute
                  icon={Wallet}
                  title="Xaman Dashboard"
                  text="Connect wallet and view XRPL profile."
                />
                <MiniRoute
                  icon={BadgeCheck}
                  title="Proof / Verify"
                  text="Check tx hash, SourceTag and route proof."
                />
                <MiniRoute
                  icon={Link2}
                  title="OTT Education"
                  text="Partner routes, risk notes and Proof Stamps."
                />
              </div>
            </div>

            <div className="border border-white/10 bg-white/[0.02] p-6">
              <div className="flex items-center gap-2 mb-5">
                <Server size={18} className="text-white/60" />

                <p className="font-orbitron text-xs uppercase tracking-widest">
                  Ledger Hash
                </p>
              </div>

              <p className="font-mono text-xs text-white/45 leading-relaxed break-all">
                {stats.ledgerHash}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function safeParse(input: string): XrplMessage | null {
  try {
    return JSON.parse(input) as XrplMessage;
  } catch {
    return null;
  }
}

function normalizeTransaction(tx: XrplTransaction): LatestTransaction | null {
  if (!tx.hash) {
    return null;
  }

  return {
    hash: tx.hash,
    type: tx.TransactionType ?? "Unknown",
    account: tx.Account ?? "unknown",
    destination: tx.Destination ?? "—",
    amount: formatAmount(tx.Amount),
    fee: tx.Fee ? `${dropsToXrp(tx.Fee)} XRP` : "—",
  };
}

function formatAmount(amount: XrplTransaction["Amount"]): string {
  if (!amount) {
    return "—";
  }

  if (typeof amount === "string") {
    return `${dropsToXrp(amount)} XRP`;
  }

  const value = amount.value ?? "0";
  const currency = amount.currency ?? "Issued";

  return `${value} ${currency}`;
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

function buildSearchResult(value: string): SearchResult {
  const trimmedValue = value.trim();
  const upperValue = trimmedValue.toUpperCase();

  if (trimmedValue === String(MAKE_WAVES_SOURCE_TAG)) {
    return {
      kind: "sourcetag",
      value: trimmedValue,
      title: "OTT SourceTag Proof",
      description:
        "Dit is de officiële OTT proof identity. Later koppelen we hier een publieke SourceTag proof explorer aan.",
    };
  }

  if (/^[A-Fa-f0-9]{64}$/.test(trimmedValue)) {
    return {
      kind: "transaction",
      value: trimmedValue,
      title: "Transaction Hash",
      description:
        "Deze waarde lijkt op een XRPL transaction hash. Volgende stap is detail lookup met tx verification.",
    };
  }

  if (/^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(trimmedValue)) {
    return {
      kind: "account",
      value: trimmedValue,
      title: "XRPL Account",
      description:
        "Deze waarde lijkt op een XRPL account. Volgende stap is account lookup met balances, trustlines en history.",
    };
  }

  if (/^[A-Z0-9]{3,40}$/.test(upperValue)) {
    return {
      kind: "asset",
      value: upperValue,
      title: "Asset / Currency Search",
      description:
        "Deze waarde lijkt op een asset of issued currency code. Volgende stap is asset lookup en issuer filtering.",
    };
  }

  return {
    kind: "unknown",
    value: trimmedValue,
    title: "Search Prepared",
    description:
      "De zoekstructuur staat klaar. Volgende stap is volledige XRPL lookup routing toevoegen.",
  };
}

function formatNumber(value: number): string {
  return value.toLocaleString();
}

function StatusPill({ status }: { status: ConnectionStatus }) {
  const label =
    status === "connected"
      ? "Live"
      : status === "connecting"
        ? "Connecting"
        : "Offline";

  return (
    <div className="border border-white/10 bg-white/[0.03] px-3 py-2">
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${
            status === "connected" ? "bg-white" : "bg-white/25"
          }`}
        />

        <p className="font-mono text-[9px] uppercase tracking-widest text-white/55">
          {label}
        </p>
      </div>
    </div>
  );
}

function ExplorerRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/10 bg-white/[0.02] p-3">
      <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-2">
        {label}
      </p>

      <p className="font-orbitron text-xs font-black uppercase break-all">
        {value}
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  text,
  icon: Icon,
}: {
  label: string;
  value: string;
  text: string;
  icon: typeof Activity;
}) {
  return (
    <div className="border border-white/10 bg-black/60 p-4">
      <Icon size={18} className="text-white/60 mb-3" />

      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
        {label}
      </p>

      <p className="font-orbitron text-sm font-black uppercase mb-1 break-all">
        {value}
      </p>

      <p className="font-mono text-[10px] text-white/30 uppercase">{text}</p>
    </div>
  );
}

function TransactionRow({ tx }: { tx: LatestTransaction }) {
  return (
    <div className="border border-white/10 bg-black p-4 hover:bg-white/[0.03] transition-all">
      <div className="grid grid-cols-12 gap-4 items-center">
        <div className="col-span-12 md:col-span-3">
          <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-2">
            Type
          </p>

          <p className="font-orbitron text-xs font-black uppercase">{tx.type}</p>
        </div>

        <div className="col-span-12 md:col-span-4">
          <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-2">
            Hash
          </p>

          <p className="font-mono text-xs text-white/55 break-all">
            {shortHash(tx.hash)}
          </p>
        </div>

        <div className="col-span-12 md:col-span-3">
          <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-2">
            Amount
          </p>

          <p className="font-mono text-xs text-white/55">{tx.amount}</p>
        </div>

        <div className="col-span-12 md:col-span-2 md:text-right">
          <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-2">
            Fee
          </p>

          <p className="font-mono text-xs text-white/55">{tx.fee}</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 mt-4 pt-4 border-t border-white/10">
        <div className="col-span-12 md:col-span-6">
          <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-2">
            Account
          </p>

          <p className="font-mono text-xs text-white/45 break-all">{tx.account}</p>
        </div>

        <div className="col-span-12 md:col-span-6">
          <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-2">
            Destination
          </p>

          <p className="font-mono text-xs text-white/45 break-all">
            {tx.destination}
          </p>
        </div>
      </div>
    </div>
  );
}

function MiniRoute({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Activity;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3 border border-white/10 bg-black p-4">
      <Icon size={16} className="text-white/40 mt-0.5 shrink-0" />

      <div>
        <p className="font-orbitron text-xs font-black uppercase mb-2">{title}</p>
        <p className="font-mono text-xs text-white/35 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function shortHash(hash: string): string {
  if (hash.length <= 18) {
    return hash;
  }

  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}
