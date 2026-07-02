import { useEffect, useMemo, useState } from "react";
import type { ElementType } from "react";
import {
  Activity,
  AlertTriangle,
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
import { OTTLogo, OTTProofBadge } from "../components/OTTLogo";
import { MAKE_WAVES_SOURCE_TAG } from "../lib/makeWaves";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

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

type WalletCopy = {
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;
  intro: string;
  placeholder: string;
  loadWallet: string;
  walletState: string;
  guestMode: string;
  balance: string;
  trustlines: string;
  updated: string;
  copy: string;
  refresh: string;
  xrpBalance: string;
  validatedAccount: string;
  ownerCount: string;
  objectsOwned: string;
  issuedAssets: string;
  sourceTagHits: string;
  account: string;
  walletOverview: string;
  readOnly: string;
  loadingWallet: string;
  noCustodyNote: string;
  proofStatus: string;
  officialSourceTag: string;
  detectedRecentTxs: string;
  proofLayer: string;
  ready: string;
  proofLater: string;
  recentTransactions: string;
  noTrustlines: string;
  noTransactions: string;
  guestTitle: string;
  guestIntro: string;
  pasteAddress: string;
  pasteAddressText: string;
  connectXaman: string;
  connectXamanText: string;
  showProof: string;
  showProofText: string;
  invalidAddress: string;
  noAccountData: string;
  lookupFailed: string;
  parseFailed: string;
  websocketFailed: string;
};

const walletCopy: Record<"nl" | "en", WalletCopy> = {
  nl: {
    eyebrow: "Xaman Wallet Dashboard Layer",
    titleLine1: "Your XRPL",
    titleLine2: "Command Center.",
    intro:
      "Dit is de connected dashboard laag. Na Xaman login komt het wallet adres automatisch binnen en wordt publieke XRPL data read-only geladen.",
    placeholder: "Plak XRPL wallet adres dat begint met r...",
    loadWallet: "Load Wallet",
    walletState: "Wallet State",
    guestMode: "Guest mode",
    balance: "Balance",
    trustlines: "Trustlines",
    updated: "Updated",
    copy: "Copy",
    refresh: "Refresh",
    xrpBalance: "XRP Balance",
    validatedAccount: "Validated account",
    ownerCount: "Owner Count",
    objectsOwned: "Objects owned",
    issuedAssets: "Issued assets",
    sourceTagHits: "OTT SourceTag Hits",
    account: "Account",
    walletOverview: "Wallet Overview",
    readOnly:
      "Read-only wallet dashboard. Geen custody. Geen private keys. Alleen publieke XRPL data.",
    loadingWallet: "Wallet data laden via XRPL...",
    noCustodyNote:
      "Xaman login is gekoppeld. Deze dashboard-laag gebruikt alleen het publieke wallet adres dat via Xaman binnenkomt.",
    proofStatus: "OTT Proof Status",
    officialSourceTag: "Official SourceTag",
    detectedRecentTxs: "Detected In Recent Txs",
    proofLayer: "Proof Layer",
    ready: "Ready",
    proofLater:
      "Later koppelen we hier volledige SourceTag proof history, Proof Stamps, Access Gate status, NFT Access Pass en Truth Desk betalingen.",
    recentTransactions: "Recent Transactions",
    noTrustlines: "Geen trustlines gevonden of account data nog niet geladen.",
    noTransactions:
      "Geen recente transacties gevonden of account data nog niet geladen.",
    guestTitle: "Connect layer prepared.",
    guestIntro:
      "Plak nu handmatig een XRPL wallet adres om het dashboard te testen. Of connect via Xaman zodat de wallet automatisch geladen wordt na sign.",
    pasteAddress: "Paste Address",
    pasteAddressText: "Read public wallet data.",
    connectXaman: "Connect Xaman",
    connectXamanText: "Automatic wallet load.",
    showProof: "Show Proof",
    showProofText: "Link SourceTag/XP.",
    invalidAddress: "Dit lijkt geen geldig XRPL accountadres.",
    noAccountData: "Geen account data gevonden.",
    lookupFailed: "Wallet lookup is mislukt.",
    parseFailed: "Kon XRPL response niet lezen.",
    websocketFailed: "XRPL websocket verbinding mislukt.",
  },
  en: {
    eyebrow: "Xaman Wallet Dashboard Layer",
    titleLine1: "Your XRPL",
    titleLine2: "Command Center.",
    intro:
      "This is the connected dashboard layer. After Xaman login, the wallet address is loaded automatically and public XRPL data is shown read-only.",
    placeholder: "Paste XRPL wallet address starting with r...",
    loadWallet: "Load Wallet",
    walletState: "Wallet State",
    guestMode: "Guest mode",
    balance: "Balance",
    trustlines: "Trustlines",
    updated: "Updated",
    copy: "Copy",
    refresh: "Refresh",
    xrpBalance: "XRP Balance",
    validatedAccount: "Validated account",
    ownerCount: "Owner Count",
    objectsOwned: "Objects owned",
    issuedAssets: "Issued assets",
    sourceTagHits: "OTT SourceTag Hits",
    account: "Account",
    walletOverview: "Wallet Overview",
    readOnly:
      "Read-only wallet dashboard. No custody. No private keys. Public XRPL data only.",
    loadingWallet: "Loading wallet data from XRPL...",
    noCustodyNote:
      "Xaman login is connected. This dashboard layer only uses the public wallet address returned by Xaman.",
    proofStatus: "OTT Proof Status",
    officialSourceTag: "Official SourceTag",
    detectedRecentTxs: "Detected In Recent Txs",
    proofLayer: "Proof Layer",
    ready: "Ready",
    proofLater:
      "Later, this section will include full SourceTag proof history, Proof Stamps, Access Gate status, NFT Access Pass, and Truth Desk payments.",
    recentTransactions: "Recent Transactions",
    noTrustlines: "No trustlines found or account data has not loaded yet.",
    noTransactions:
      "No recent transactions found or account data has not loaded yet.",
    guestTitle: "Connect layer prepared.",
    guestIntro:
      "Paste an XRPL wallet address to test the dashboard manually. Or connect with Xaman so the wallet loads automatically after signing.",
    pasteAddress: "Paste Address",
    pasteAddressText: "Read public wallet data.",
    connectXaman: "Connect Xaman",
    connectXamanText: "Automatic wallet load.",
    showProof: "Show Proof",
    showProofText: "Link SourceTag/XP.",
    invalidAddress: "This does not look like a valid XRPL account address.",
    noAccountData: "No account data found.",
    lookupFailed: "Wallet lookup failed.",
    parseFailed: "Could not read XRPL response.",
    websocketFailed: "XRPL websocket connection failed.",
  },
};

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
  const { language } = useTerminalLanguage();
  const c = walletCopy[language];

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
      setError(c.invalidAddress);
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
        throw new Error(c.noAccountData);
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
        lookupError instanceof Error ? lookupError.message : c.lookupFailed;

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
    <div className="min-h-screen bg-white text-[#080808]">
      <section className="relative overflow-hidden border-b border-black/10 bg-[radial-gradient(circle_at_18%_18%,rgba(56,152,232,0.16),transparent_28%),radial-gradient(circle_at_82%_8%,rgba(200,56,136,0.16),transparent_28%),radial-gradient(circle_at_85%_82%,rgba(216,72,88,0.12),transparent_30%),#ffffff]">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.22),#ffffff_92%)]" />

        <div className="relative z-10 p-4 md:p-6 xl:p-10">
          <div className="grid grid-cols-12 gap-6 items-end">
            <div className="col-span-12 xl:col-span-8">
              <div className="mb-6">
                <OTTLogo size="lg" subtitle="Xaman Wallet Dashboard" />
              </div>

              <div className="inline-flex items-center gap-2 border border-black/10 bg-white/80 shadow-sm px-4 py-2 mb-6">
                <Wallet size={15} className="text-[#C83888]" />

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
                      value={inputAddress}
                      onChange={(event) => setInputAddress(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          submitLookup();
                        }
                      }}
                      placeholder={c.placeholder}
                      className="w-full bg-transparent py-4 outline-none font-mono text-xs text-black placeholder:text-black/25"
                    />
                  </div>

                  <button
                    onClick={submitLookup}
                    className="bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] text-white px-6 py-4 font-orbitron text-xs font-black uppercase tracking-widest hover:brightness-95 transition-all"
                  >
                    {c.loadWallet}
                  </button>
                </div>

                {status === "error" && (
                  <div className="border border-[#D84858]/25 bg-[#D84858]/10 p-4 mt-3">
                    <div className="flex items-start gap-3">
                      <AlertTriangle size={18} className="text-[#D84858] shrink-0 mt-0.5" />

                      <p className="font-mono text-xs text-black/60 leading-relaxed">
                        {error}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="col-span-12 xl:col-span-4">
              <div className="border border-black/10 bg-white/90 backdrop-blur p-5 shadow-xl shadow-black/5">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <p className="font-orbitron text-xs uppercase tracking-widest">
                    {c.walletState}
                  </p>

                  <StatusPill status={status} />
                </div>

                <div className="mb-4 text-black">
                  <OTTProofBadge sourceTag={String(MAKE_WAVES_SOURCE_TAG)} />
                </div>

                <div className="space-y-3">
                  <InfoRow
                    label="Address"
                    value={hasWallet ? activeAddress : c.guestMode}
                  />
                  <InfoRow
                    label={c.balance}
                    value={accountInfo ? `${accountInfo.balanceXrp} XRP` : "—"}
                  />
                  <InfoRow label={c.trustlines} value={String(trustlines.length)} />
                  <InfoRow label={c.updated} value={lastUpdated} />
                </div>

                <div className="grid grid-cols-2 gap-3 mt-5">
                  <button
                    onClick={copyAddress}
                    disabled={!hasWallet}
                    className="border border-black/10 bg-[#F7F8FC] p-3 text-left hover:bg-white hover:shadow-md transition-all disabled:opacity-40"
                  >
                    <Copy size={15} className="mb-3 text-[#C83888]" />

                    <p className="font-orbitron text-[10px] font-black uppercase">
                      {c.copy}
                    </p>
                  </button>

                  <button
                    onClick={() => hasWallet && void loadWallet(activeAddress)}
                    disabled={!hasWallet || status === "loading"}
                    className="border border-black/10 bg-[#F7F8FC] p-3 text-left hover:bg-white hover:shadow-md transition-all disabled:opacity-40"
                  >
                    {status === "loading" ? (
                      <Loader2 size={15} className="mb-3 text-[#C83888] animate-spin" />
                    ) : (
                      <RefreshCcw size={15} className="mb-3 text-[#3898E8]" />
                    )}

                    <p className="font-orbitron text-[10px] font-black uppercase">
                      {c.refresh}
                    </p>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mt-8">
            <MetricCard
              label={c.xrpBalance}
              value={accountInfo ? accountInfo.balanceXrp : "—"}
              text={c.validatedAccount}
              icon={Database}
            />
            <MetricCard
              label={c.ownerCount}
              value={
                accountInfo?.ownerCount !== null && accountInfo
                  ? String(accountInfo.ownerCount)
                  : "—"
              }
              text={c.objectsOwned}
              icon={Layers3}
            />
            <MetricCard
              label={c.trustlines}
              value={String(trustlines.length)}
              text={c.issuedAssets}
              icon={Activity}
            />
            <MetricCard
              label={c.sourceTagHits}
              value={String(sourceTagHits.length)}
              text={String(MAKE_WAVES_SOURCE_TAG)}
              icon={Fingerprint}
            />
          </div>
        </div>
      </section>

      <section className="p-4 md:p-6 xl:p-10 bg-white">
        {!hasWallet ? (
          <GuestPanel copy={c} />
        ) : (
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 xl:col-span-7 border border-black/10 bg-white p-5 md:p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/35 mb-3">
                    {c.account}
                  </p>

                  <h2 className="font-orbitron text-2xl font-black uppercase">
                    {c.walletOverview}
                  </h2>
                </div>

                <p className="font-mono text-xs text-black/45 max-w-md leading-relaxed">
                  {c.readOnly}
                </p>
              </div>

              {status === "loading" ? (
                <LoadingBox text={c.loadingWallet} />
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
                    value={
                      accountInfo?.flags !== null && accountInfo
                        ? String(accountInfo.flags)
                        : "—"
                    }
                  />
                </div>
              )}

              <div className="border border-black/10 bg-[#F7F8FC] p-4 mt-4">
                <div className="flex items-start gap-3">
                  <LockKeyhole size={18} className="text-[#C83888] mt-0.5 shrink-0" />

                  <p className="font-mono text-xs text-black/55 leading-relaxed">
                    {c.noCustodyNote}
                  </p>
                </div>
              </div>
            </div>

            <div className="col-span-12 xl:col-span-5 border border-black/10 bg-white p-5 md:p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <BadgeCheck size={18} className="text-[#C83888]" />

                <p className="font-orbitron text-xs uppercase tracking-widest">
                  {c.proofStatus}
                </p>
              </div>

              <div className="space-y-3">
                <ProofRow label={c.officialSourceTag} value={String(MAKE_WAVES_SOURCE_TAG)} />
                <ProofRow label={c.detectedRecentTxs} value={String(sourceTagHits.length)} />
                <ProofRow label={c.proofLayer} value={c.ready} />
              </div>

              <div className="border border-[#C83888]/25 bg-[#C83888]/10 p-4 mt-5">
                <p className="font-mono text-xs text-black/55 leading-relaxed">
                  {c.proofLater}
                </p>
              </div>
            </div>

            <div className="col-span-12 xl:col-span-6 border border-black/10 bg-white p-5 md:p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <Zap size={18} className="text-[#3898E8]" />

                <p className="font-orbitron text-xs uppercase tracking-widest">
                  {c.trustlines}
                </p>
              </div>

              {trustlines.length === 0 ? (
                <EmptyBox text={c.noTrustlines} />
              ) : (
                <div className="space-y-2">
                  {trustlines.map((line) => (
                    <TrustlineRow key={`${line.currency}-${line.issuer}`} line={line} />
                  ))}
                </div>
              )}
            </div>

            <div className="col-span-12 xl:col-span-6 border border-black/10 bg-white p-5 md:p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <Activity size={18} className="text-[#3898E8]" />

                <p className="font-orbitron text-xs uppercase tracking-widest">
                  {c.recentTransactions}
                </p>
              </div>

              {transactions.length === 0 ? (
                <EmptyBox text={c.noTransactions} />
              ) : (
                <div className="space-y-2">
                  {transactions.map((transaction) => (
                    <TransactionRow key={transaction.hash} transaction={transaction} />
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

function GuestPanel({ copy }: { copy: WalletCopy }) {
  return (
    <div className="border border-black/10 bg-white p-6 md:p-8 shadow-sm">
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 border border-black/10 bg-[#F7F8FC] px-4 py-2 mb-6">
          <KeyRound size={15} className="text-[#C83888]" />

          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/45">
            {copy.guestMode}
          </p>
        </div>

        <h2 className="font-orbitron text-3xl font-black uppercase mb-5">
          {copy.guestTitle}
        </h2>

        <p className="font-mono text-sm text-black/55 leading-relaxed mb-6">
          {copy.guestIntro}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <GuestStep
            number="01"
            title={copy.pasteAddress}
            text={copy.pasteAddressText}
          />
          <GuestStep
            number="02"
            title={copy.connectXaman}
            text={copy.connectXamanText}
          />
          <GuestStep number="03" title={copy.showProof} text={copy.showProofText} />
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
    <div className="border border-black/10 bg-[#F7F8FC] p-4">
      <p className="font-orbitron text-xs font-black text-[#C83888] mb-4">
        {number}
      </p>

      <p className="font-orbitron text-xs font-black uppercase mb-2">{title}</p>
      <p className="font-mono text-[10px] text-black/40 uppercase">{text}</p>
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
    <div className="border border-black/10 bg-[#F7F8FC] px-3 py-2">
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${
            status === "success" ? "bg-[#3898E8]" : "bg-black/25"
          }`}
        />

        <p className="font-mono text-[9px] uppercase tracking-widest text-black/55">
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

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-4">
      <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-3">
        {label}
      </p>

      <p className="font-mono text-sm text-black/60 break-all">{value}</p>
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

function TrustlineRow({ line }: { line: Trustline }) {
  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-4">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <p className="font-orbitron text-xs font-black uppercase mb-2">
            {line.currency}
          </p>

          <p className="font-mono text-[10px] text-black/45 uppercase">
            Balance: {line.balance}
          </p>
        </div>

        <p className="font-mono text-[10px] text-black/45 text-right uppercase">
          Limit: {line.limit}
        </p>
      </div>

      <p className="font-mono text-[10px] text-black/40 break-all">
        Issuer: {line.issuer}
      </p>
    </div>
  );
}

function TransactionRow({ transaction }: { transaction: AccountTransaction }) {
  const isOttSourceTag =
    transaction.sourceTag === String(MAKE_WAVES_SOURCE_TAG);

  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-4">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
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
