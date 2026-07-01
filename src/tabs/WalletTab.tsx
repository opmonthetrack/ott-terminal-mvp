import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Copy,
  Database,
  Fingerprint,
  KeyRound,
  Layers3,
  Loader2,
  LockKeyhole,
  RefreshCcw,
  Search,
  ShieldCheck,
  Wallet,
  Zap,
} from "lucide-react";
import { MAKE_WAVES_SOURCE_TAG } from "../lib/makeWaves";

type WalletTabProps = {
  walletAddress?: string;
};

type AccountInfo = {
  address: string;
  balanceXrp: string;
  sequence: number | null;
  ownerCount: number | null;
  flags: number | null;
  ledgerIndex: number | null;
};

type Trustline = {
  currency: string;
  balance: string;
  limit: string;
  issuer: string;
};

type AccountTransaction = {
  hash: string;
  type: string;
  date: string;
  fee: string;
  sourceTag: string;
};

type LookupStatus = "idle" | "loading" | "success" | "error";

type XrplResponse = {
  result?: {
    status?: string;
    error?: string;
    account_data?: {
      Account?: string;
      Balance?: string;
      Sequence?: number;
      OwnerCount?: number;
      Flags?: number;
    };
    lines?: Array<{
      currency?: string;
      balance?: string;
      limit?: string;
      account?: string;
    }>;
    transactions?: Array<{
      tx?: {
        hash?: string;
        TransactionType?: string;
        Fee?: string;
        SourceTag?: number;
        date?: number;
      };
      validated?: boolean;
    }>;
    ledger_index?: number;
  };
};

const XRPL_ENDPOINT = "wss://xrplcluster.com/";

export function WalletTab({ walletAddress = "guest" }: WalletTabProps) {
  const [inputAddress, setInputAddress] = useState(
    walletAddress === "guest" ? "" : walletAddress,
  );
  const [activeAddress, setActiveAddress] = useState(
    walletAddress === "guest" ? "" : walletAddress,
  );
  const [status, setStatus] = useState<LookupStatus>("idle");
  const [error, setError] = useState("");
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [trustlines, setTrustlines] = useState<Trustline[]>([]);
  const [transactions, setTransactions] = useState<AccountTransaction[]>([]);
  const [lastUpdated, setLastUpdated] = useState("not loaded");

  const hasWallet = activeAddress.length > 0;
  const sourceTagHits = useMemo(
    () =>
      transactions.filter(
        (transaction) => transaction.sourceTag === String(MAKE_WAVES_SOURCE_TAG),
      ),
    [transactions],
  );

  useEffect(() => {
    if (walletAddress !== "guest" && walletAddress !== activeAddress) {
      setInputAddress(walletAddress);
      setActiveAddress(walletAddress);
    }
  }, [walletAddress, activeAddress]);

  useEffect(() => {
    if (!activeAddress) {
      return;
    }

    void loadWallet(activeAddress);
  }, [activeAddress]);

  async function loadWallet(address: string) {
    const cleanAddress = address.trim();

    if (!isLikelyXrplAddress(cleanAddress)) {
      setStatus("error");
      setError("Dit lijkt geen geldig XRPL accountadres.");
      return;
    }

    setStatus("loading");
    setError("");

    try {
      const [infoResponse, linesResponse, txResponse] = await Promise.all([
        xrplRequest({
          command: "account_info",
          account: cleanAddress,
          ledger_index: "validated",
        }),
        xrplRequest({
          command: "account_lines",
          account: cleanAddress,
          ledger_index: "validated",
          limit: 12,
        }),
        xrplRequest({
          command: "account_tx",
          account: cleanAddress,
          ledger_index_min: -1,
          ledger_index_max: -1,
          binary: false,
          limit: 10,
        }),
      ]);

      if (infoResponse.result?.error) {
        throw new Error(infoResponse.result.error);
      }

      const accountData = infoResponse.result?.account_data;

      if (!accountData?.Account) {
        throw new Error("Geen account data gevonden.");
      }

      setAccountInfo({
        address: accountData.Account,
        balanceXrp: dropsToXrp(accountData.Balance ?? "0"),
        sequence: accountData.Sequence ?? null,
        ownerCount: accountData.OwnerCount ?? null,
        flags: accountData.Flags ?? null,
        ledgerIndex: infoResponse.result?.ledger_index ?? null,
      });

      setTrustlines(
        (linesResponse.result?.lines ?? []).map((line) => ({
          currency: line.currency ?? "Unknown",
          balance: line.balance ?? "0",
          limit: line.limit ?? "0",
          issuer: line.account ?? "unknown",
        })),
      );

      setTransactions(
        (txResponse.result?.transactions ?? [])
          .map((entry) => {
            const tx = entry.tx;

            if (!tx?.hash) {
              return null;
            }

            return {
              hash: tx.hash,
              type: tx.TransactionType ?? "Unknown",
              date: tx.date ? formatRippleDate(tx.date) : "—",
              fee: tx.Fee ? `${dropsToXrp(tx.Fee)} XRP` : "—",
              sourceTag: tx.SourceTag ? String(tx.SourceTag) : "—",
            };
          })
          .filter((item): item is AccountTransaction => Boolean(item)),
      );

      setLastUpdated(new Date().toLocaleTimeString());
      setStatus("success");
    } catch (lookupError) {
      const message =
        lookupError instanceof Error
          ? lookupError.message
          : "Wallet lookup is mislukt.";

      setStatus("error");
      setError(message);
    }
  }

  function submitLookup() {
    const cleanAddress = inputAddress.trim();
    setActiveAddress(cleanAddress);
  }

  function copyAddress() {
    if (!activeAddress) {
      return;
    }

    void navigator.clipboard?.writeText(activeAddress);
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
                <Wallet size={15} className="text-white/60" />

                <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/50">
                  Xaman Wallet Dashboard Layer
                </p>
              </div>

              <h1 className="font-orbitron text-4xl xl:text-6xl font-black uppercase leading-none tracking-tight mb-6">
                Your XRPL
                <br />
                Command Center.
              </h1>

              <p className="font-mono text-sm xl:text-base text-white/50 leading-relaxed max-w-3xl mb-8">
                Dit is de connected dashboard laag. Voor nu kan je elk XRPL
                account opzoeken. Daarna koppelen we Xaman login zodat het adres
                automatisch binnenkomt.
              </p>

              <div className="border border-white/10 bg-black/80 backdrop-blur p-3 max-w-4xl">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex-1 flex items-center gap-3 border border-white/10 bg-white/[0.03] px-4">
                    <Search size={18} className="text-white/35 shrink-0" />

                    <input
                      value={inputAddress}
                      onChange={(event) => setInputAddress(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          submitLookup();
                        }
                      }}
                      placeholder="Paste XRPL wallet address starting with r..."
                      className="w-full bg-transparent py-4 outline-none font-mono text-xs text-white placeholder:text-white/25"
                    />
                  </div>

                  <button
                    onClick={submitLookup}
                    className="bg-white text-black px-6 py-4 font-orbitron text-xs font-black uppercase tracking-widest hover:bg-white/80 transition-all"
                  >
                    Load Wallet
                  </button>
                </div>

                {status === "error" && (
                  <div className="border border-white/10 bg-white/[0.02] p-4 mt-3">
                    <div className="flex items-start gap-3">
                      <AlertTriangle size={18} className="text-white/50 shrink-0 mt-0.5" />

                      <p className="font-mono text-xs text-white/55 leading-relaxed">
                        {error}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="col-span-12 xl:col-span-4">
              <div className="border border-white/10 bg-black/70 backdrop-blur p-5">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <p className="font-orbitron text-xs uppercase tracking-widest">
                    Wallet State
                  </p>

                  <StatusPill status={status} />
                </div>

                <div className="space-y-3">
                  <InfoRow
                    label="Address"
                    value={hasWallet ? activeAddress : "Guest mode"}
                  />
                  <InfoRow
                    label="Balance"
                    value={accountInfo ? `${accountInfo.balanceXrp} XRP` : "—"}
                  />
                  <InfoRow
                    label="Trustlines"
                    value={String(trustlines.length)}
                  />
                  <InfoRow label="Updated" value={lastUpdated} />
                </div>

                <div className="grid grid-cols-2 gap-3 mt-5">
                  <button
                    onClick={copyAddress}
                    disabled={!hasWallet}
                    className="border border-white/10 bg-white/[0.02] p-3 text-left hover:bg-white hover:text-black transition-all disabled:opacity-40 disabled:hover:bg-white/[0.02] disabled:hover:text-white"
                  >
                    <Copy size={15} className="mb-3 text-white/45" />

                    <p className="font-orbitron text-[10px] font-black uppercase">
                      Copy
                    </p>
                  </button>

                  <button
                    onClick={() => hasWallet && void loadWallet(activeAddress)}
                    disabled={!hasWallet || status === "loading"}
                    className="border border-white/10 bg-white/[0.02] p-3 text-left hover:bg-white hover:text-black transition-all disabled:opacity-40 disabled:hover:bg-white/[0.02] disabled:hover:text-white"
                  >
                    {status === "loading" ? (
                      <Loader2 size={15} className="mb-3 text-white/45 animate-spin" />
                    ) : (
                      <RefreshCcw size={15} className="mb-3 text-white/45" />
                    )}

                    <p className="font-orbitron text-[10px] font-black uppercase">
                      Refresh
                    </p>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mt-8">
            <MetricCard
              label="XRP Balance"
              value={accountInfo ? accountInfo.balanceXrp : "—"}
              text="Validated account"
              icon={Database}
            />
            <MetricCard
              label="Owner Count"
              value={accountInfo?.ownerCount !== null && accountInfo ? String(accountInfo.ownerCount) : "—"}
              text="Objects owned"
              icon={Layers3}
            />
            <MetricCard
              label="Trustlines"
              value={String(trustlines.length)}
              text="Issued assets"
              icon={Activity}
            />
            <MetricCard
              label="OTT SourceTag Hits"
              value={String(sourceTagHits.length)}
              text={String(MAKE_WAVES_SOURCE_TAG)}
              icon={Fingerprint}
            />
          </div>
        </div>
      </section>

      <section className="p-6 xl:p-10">
        {!hasWallet ? (
          <GuestPanel />
        ) : (
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 xl:col-span-7 border border-white/10 bg-white/[0.02] p-6">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/35 mb-3">
                    Account
                  </p>

                  <h2 className="font-orbitron text-2xl font-black uppercase">
                    Wallet Overview
                  </h2>
                </div>

                <p className="font-mono text-xs text-white/35 max-w-md leading-relaxed">
                  Read-only wallet dashboard. Geen custody. Geen private keys.
                  Alleen publieke XRPL data.
                </p>
              </div>

              {status === "loading" ? (
                <LoadingBox text="Wallet data laden via XRPL..." />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <InfoBlock label="Address" value={activeAddress} />
                  <InfoBlock
                    label="Ledger Index"
                    value={
                      accountInfo?.ledgerIndex
                        ? accountInfo.ledgerIndex.toLocaleString()
                        : "—"
                    }
                  />
                  <InfoBlock
                    label="Sequence"
                    value={accountInfo?.sequence ? String(accountInfo.sequence) : "—"}
                  />
                  <InfoBlock
                    label="Flags"
                    value={accountInfo?.flags !== null && accountInfo ? String(accountInfo.flags) : "—"}
                  />
                </div>
              )}

              <div className="border border-white/10 bg-black p-4 mt-4">
                <div className="flex items-start gap-3">
                  <LockKeyhole size={18} className="text-white/45 mt-0.5 shrink-0" />

                  <p className="font-mono text-xs text-white/45 leading-relaxed">
                    Xaman login komt als volgende koppeling. Deze dashboard-laag
                    is alvast klaar voor het adres dat straks via Xaman binnenkomt.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-span-12 xl:col-span-5 border border-white/10 bg-white/[0.02] p-6">
              <div className="flex items-center gap-2 mb-5">
                <BadgeCheck size={18} className="text-white/60" />

                <p className="font-orbitron text-xs uppercase tracking-widest">
                  OTT Proof Status
                </p>
              </div>

              <div className="space-y-3">
                <ProofRow label="Official SourceTag" value={String(MAKE_WAVES_SOURCE_TAG)} />
                <ProofRow label="Detected In Recent Txs" value={String(sourceTagHits.length)} />
                <ProofRow label="Proof Layer" value="Ready" />
              </div>

              <div className="border border-white/10 bg-black p-4 mt-5">
                <p className="font-mono text-xs text-white/45 leading-relaxed">
                  Later koppelen we hier volledige SourceTag proof history,
                  Proof Stamps, Access Gate status en Truth Desk betalingen.
                </p>
              </div>
            </div>

            <div className="col-span-12 xl:col-span-6 border border-white/10 bg-white/[0.02] p-6">
              <div className="flex items-center gap-2 mb-5">
                <Zap size={18} className="text-white/60" />

                <p className="font-orbitron text-xs uppercase tracking-widest">
                  Trustlines
                </p>
              </div>

              {trustlines.length === 0 ? (
                <EmptyBox text="Geen trustlines gevonden of account data nog niet geladen." />
              ) : (
                <div className="space-y-2">
                  {trustlines.map((line) => (
                    <TrustlineRow
                      key={`${line.currency}-${line.issuer}`}
                      line={line}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="col-span-12 xl:col-span-6 border border-white/10 bg-white/[0.02] p-6">
              <div className="flex items-center gap-2 mb-5">
                <Activity size={18} className="text-white/60" />

                <p className="font-orbitron text-xs uppercase tracking-widest">
                  Recent Transactions
                </p>
              </div>

              {transactions.length === 0 ? (
                <EmptyBox text="Geen recente transacties gevonden of account data nog niet geladen." />
              ) : (
                <div className="space-y-2">
                  {transactions.map((transaction) => (
                    <TransactionRow
                      key={transaction.hash}
                      transaction={transaction}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function GuestPanel() {
  return (
    <div className="border border-white/10 bg-white/[0.02] p-8">
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 border border-white/10 bg-black px-4 py-2 mb-6">
          <KeyRound size={15} className="text-white/50" />

          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/45">
            Guest Mode
          </p>
        </div>

        <h2 className="font-orbitron text-3xl font-black uppercase mb-5">
          Connect layer prepared.
        </h2>

        <p className="font-mono text-sm text-white/45 leading-relaxed mb-6">
          Plak nu handmatig een XRPL wallet adres om het dashboard te testen.
          Daarna koppelen we Xaman login zodat de wallet automatisch geladen
          wordt na connect/sign.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <GuestStep number="01" title="Paste Address" text="Read public wallet data." />
          <GuestStep number="02" title="Connect Xaman" text="Next frontend step." />
          <GuestStep number="03" title="Show Proof" text="Link SourceTag/XP." />
        </div>
      </div>
    </div>
  );
}

function GuestStep({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="border border-white/10 bg-black p-4">
      <p className="font-orbitron text-xs font-black text-white/35 mb-4">
        {number}
      </p>

      <p className="font-orbitron text-xs font-black uppercase mb-2">{title}</p>
      <p className="font-mono text-[10px] text-white/35 uppercase">{text}</p>
    </div>
  );
}

function StatusPill({ status }: { status: LookupStatus }) {
  const label =
    status === "loading"
      ? "Loading"
      : status === "success"
        ? "Loaded"
        : status === "error"
          ? "Error"
          : "Idle";

  return (
    <div className="border border-white/10 bg-white/[0.03] px-3 py-2">
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${
            status === "success" ? "bg-white" : "bg-white/25"
          }`}
        />

        <p className="font-mono text-[9px] uppercase tracking-widest text-white/55">
          {label}
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

function InfoRow({ label, value }: { label: string; value: string }) {
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

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/10 bg-black p-4">
      <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-3">
        {label}
      </p>

      <p className="font-mono text-sm text-white/60 break-all">{value}</p>
    </div>
  );
}

function ProofRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border border-white/10 bg-black p-4">
      <p className="font-mono text-xs text-white/35 uppercase tracking-widest">
        {label}
      </p>

      <p className="font-orbitron text-xs font-black uppercase text-right break-all">
        {value}
      </p>
    </div>
  );
}

function TrustlineRow({ line }: { line: Trustline }) {
  return (
    <div className="border border-white/10 bg-black p-4">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <p className="font-orbitron text-xs font-black uppercase mb-2">
            {line.currency}
          </p>

          <p className="font-mono text-[10px] text-white/35 uppercase">
            Balance: {line.balance}
          </p>
        </div>

        <p className="font-mono text-[10px] text-white/35 text-right uppercase">
          Limit: {line.limit}
        </p>
      </div>

      <p className="font-mono text-[10px] text-white/30 break-all">
        Issuer: {line.issuer}
      </p>
    </div>
  );
}

function TransactionRow({
  transaction,
}: {
  transaction: AccountTransaction;
}) {
  const isOttSourceTag =
    transaction.sourceTag === String(MAKE_WAVES_SOURCE_TAG);

  return (
    <div className="border border-white/10 bg-black p-4">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="font-orbitron text-xs font-black uppercase">
              {transaction.type}
            </p>

            {isOttSourceTag && (
              <span className="border border-white/10 bg-white text-black px-2 py-1 font-mono text-[8px] uppercase tracking-widest">
                OTT
              </span>
            )}
          </div>

          <p className="font-mono text-xs text-white/45 break-all">
            {shortHash(transaction.hash)}
          </p>
        </div>

        <div className="md:text-right">
          <p className="font-mono text-[10px] text-white/35 uppercase mb-2">
            SourceTag: {transaction.sourceTag}
          </p>

          <p className="font-mono text-[10px] text-white/35 uppercase">
            Fee: {transaction.fee}
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyBox({ text }: { text: string }) {
  return (
    <div className="border border-white/10 bg-black p-6 text-center">
      <p className="font-mono text-xs text-white/35 leading-relaxed">{text}</p>
    </div>
  );
}

function LoadingBox({ text }: { text: string }) {
  return (
    <div className="border border-white/10 bg-black p-8 text-center">
      <Loader2 size={22} className="animate-spin mx-auto mb-4 text-white/45" />

      <p className="font-mono text-xs text-white/35">{text}</p>
    </div>
  );
}

function isLikelyXrplAddress(value: string): boolean {
  return /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(value);
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
        reject(new Error("Kon XRPL response niet lezen."));
      }
    };

    socket.onerror = () => {
      window.clearTimeout(timeout);
      socket.close();
      reject(new Error("XRPL websocket verbinding mislukt."));
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
