import { useMemo, useState } from "react";
import type { ElementType } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  Copy,
  Database,
  Fingerprint,
  Hash,
  Loader2,
  LockKeyhole,
  RefreshCcw,
  Search,
  ShieldCheck,
  Tag,
  Wallet,
  Zap,
} from "lucide-react";
import { OTTLogo, OTTProofBadge } from "../components/OTTLogo";
import { MAKE_WAVES_SOURCE_TAG } from "../lib/makeWaves";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

type SourceTagMonitorTabProps = {
  walletAddress?: string;
};

type VerifyStatus = "idle" | "loading" | "success" | "error";

type TxProof = {
  hash: string;
  type: string;
  account: string;
  destination: string;
  amount: string;
  fee: string;
  sourceTag: string;
  destinationTag: string;
  result: string;
  validated: string;
  matchesOttSourceTag: boolean;
};

type SourceCopy = {
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;
  intro: string;
  verifyTitle: string;
  verifyIntro: string;
  placeholder: string;
  verifyButton: string;
  verifying: string;
  proofStatus: string;
  officialSourceTag: string;
  matched: string;
  notMatched: string;
  wallet: string;
  currentWallet: string;
  sourceTagRole: string;
  proofLayer: string;
  readOnly: string;
  monitor: string;
  txHash: string;
  transactionType: string;
  account: string;
  destination: string;
  amount: string;
  fee: string;
  result: string;
  validated: string;
  destinationTag: string;
  sourceTag: string;
  noProof: string;
  safeTitle: string;
  safeLines: string[];
  futureTitle: string;
  futureLines: string[];
  invalidHash: string;
  lookupFailed: string;
  parseFailed: string;
  websocketFailed: string;
};

const sourceCopy: Record<"nl" | "en", SourceCopy> = {
  nl: {
    eyebrow: "OTT SourceTag Proof Layer",
    titleLine1: "Verify",
    titleLine2: "SourceTag Proof.",
    intro:
      "Deze laag controleert of een XRPL transactie de officiële OnTheTrack SourceTag gebruikt. Dit is read-only proof en geen custody.",
    verifyTitle: "Verify Transaction",
    verifyIntro:
      "Plak een XRPL transaction hash. De terminal controleert of SourceTag 2606170002 aanwezig is.",
    placeholder: "Plak XRPL transaction hash...",
    verifyButton: "Verify SourceTag",
    verifying: "Verifying...",
    proofStatus: "Proof Status",
    officialSourceTag: "Official SourceTag",
    matched: "Matched",
    notMatched: "Not matched",
    wallet: "Wallet",
    currentWallet: "Current Wallet",
    sourceTagRole: "SourceTag Role",
    proofLayer: "Proof Layer",
    readOnly: "Read-only verification. Geen private keys. Geen transacties uitvoeren.",
    monitor: "Monitor",
    txHash: "Transaction Hash",
    transactionType: "Transaction Type",
    account: "Account",
    destination: "Destination",
    amount: "Amount",
    fee: "Fee",
    result: "Result",
    validated: "Validated",
    destinationTag: "DestinationTag",
    sourceTag: "SourceTag",
    noProof:
      "Nog geen transaction hash geverifieerd. Plak een hash om proof te bekijken.",
    safeTitle: "Safe Position",
    safeLines: [
      "No custody",
      "No broker",
      "No yield provider",
      "No trade execution",
      "Only public XRPL proof",
    ],
    futureTitle: "Later uitbreiden",
    futureLines: [
      "Automatische SourceTag history per wallet",
      "Proof Stamps per taak of cursus",
      "Access Gate payment proof",
      "NFT Access Pass ownership proof",
      "Truth Desk payment proof",
    ],
    invalidHash: "Dit lijkt geen geldige XRPL transaction hash.",
    lookupFailed: "SourceTag verification is mislukt.",
    parseFailed: "Kon XRPL response niet lezen.",
    websocketFailed: "XRPL websocket verbinding mislukt.",
  },
  en: {
    eyebrow: "OTT SourceTag Proof Layer",
    titleLine1: "Verify",
    titleLine2: "SourceTag Proof.",
    intro:
      "This layer checks whether an XRPL transaction uses the official OnTheTrack SourceTag. It is read-only proof, not custody.",
    verifyTitle: "Verify Transaction",
    verifyIntro:
      "Paste an XRPL transaction hash. The terminal checks whether SourceTag 2606170002 is present.",
    placeholder: "Paste XRPL transaction hash...",
    verifyButton: "Verify SourceTag",
    verifying: "Verifying...",
    proofStatus: "Proof Status",
    officialSourceTag: "Official SourceTag",
    matched: "Matched",
    notMatched: "Not matched",
    wallet: "Wallet",
    currentWallet: "Current Wallet",
    sourceTagRole: "SourceTag Role",
    proofLayer: "Proof Layer",
    readOnly: "Read-only verification. No private keys. No transaction execution.",
    monitor: "Monitor",
    txHash: "Transaction Hash",
    transactionType: "Transaction Type",
    account: "Account",
    destination: "Destination",
    amount: "Amount",
    fee: "Fee",
    result: "Result",
    validated: "Validated",
    destinationTag: "DestinationTag",
    sourceTag: "SourceTag",
    noProof:
      "No transaction hash verified yet. Paste a hash to view proof details.",
    safeTitle: "Safe Position",
    safeLines: [
      "No custody",
      "No broker",
      "No yield provider",
      "No trade execution",
      "Only public XRPL proof",
    ],
    futureTitle: "Future expansion",
    futureLines: [
      "Automatic SourceTag history per wallet",
      "Proof Stamps per task or course",
      "Access Gate payment proof",
      "NFT Access Pass ownership proof",
      "Truth Desk payment proof",
    ],
    invalidHash: "This does not look like a valid XRPL transaction hash.",
    lookupFailed: "SourceTag verification failed.",
    parseFailed: "Could not read XRPL response.",
    websocketFailed: "XRPL websocket connection failed.",
  },
};

type XrplTxResponse = {
  result?: {
    error?: string;
    validated?: boolean;
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
    meta?: {
      TransactionResult?: string;
    };
  };
};

const XRPL_ENDPOINT = "wss://xrplcluster.com/";

export function SourceTagMonitorTab({
  walletAddress = "guest",
}: SourceTagMonitorTabProps) {
  const { language } = useTerminalLanguage();
  const c = sourceCopy[language];

  const [txHash, setTxHash] = useState("");
  const [status, setStatus] = useState<VerifyStatus>("idle");
  const [error, setError] = useState("");
  const [proof, setProof] = useState<TxProof | null>(null);
  const [lastChecked, setLastChecked] = useState("not checked");

  const proofMatched = Boolean(proof?.matchesOttSourceTag);

  const metrics = useMemo(
    () => [
      {
        label: c.officialSourceTag,
        value: String(MAKE_WAVES_SOURCE_TAG),
        text: "OnTheTrack identity",
        icon: Fingerprint,
      },
      {
        label: c.proofStatus,
        value: proof ? (proofMatched ? c.matched : c.notMatched) : "Idle",
        text: "Transaction proof",
        icon: proofMatched ? CheckCircle2 : BadgeCheck,
      },
      {
        label: c.wallet,
        value: walletAddress === "guest" ? "Guest" : "Connected",
        text: "Xaman state",
        icon: Wallet,
      },
      {
        label: "Updated",
        value: lastChecked,
        text: "Last verification",
        icon: RefreshCcw,
      },
    ],
    [c, proof, proofMatched, walletAddress, lastChecked],
  );

  async function verifySourceTag() {
    const cleanHash = txHash.trim();

    if (!isLikelyTxHash(cleanHash)) {
      setStatus("error");
      setError(c.invalidHash);
      return;
    }

    setStatus("loading");
    setError("");

    try {
      const response = await xrplRequest({
        command: "tx",
        transaction: cleanHash,
        binary: false,
      });

      if (response.result?.error) {
        throw new Error(response.result.error);
      }

      const tx = response.result?.tx_json;

      if (!tx) {
        throw new Error(c.lookupFailed);
      }

      const sourceTag = tx.SourceTag ? String(tx.SourceTag) : "—";

      setProof({
        hash: tx.hash ?? cleanHash,
        type: tx.TransactionType ?? "Unknown",
        account: tx.Account ?? "—",
        destination: tx.Destination ?? "—",
        amount: formatAmount(tx.Amount),
        fee: tx.Fee ? `${dropsToXrp(tx.Fee)} XRP` : "—",
        sourceTag,
        destinationTag: tx.DestinationTag ? String(tx.DestinationTag) : "—",
        result: response.result?.meta?.TransactionResult ?? "—",
        validated: response.result?.validated ? "Yes" : "No",
        matchesOttSourceTag: sourceTag === String(MAKE_WAVES_SOURCE_TAG),
      });

      setLastChecked(new Date().toLocaleTimeString());
      setStatus("success");
    } catch (lookupError) {
      setStatus("error");
      setError(lookupError instanceof Error ? lookupError.message : c.lookupFailed);
    }
  }

  function copyProofHash() {
    if (!proof?.hash) {
      return;
    }

    void navigator.clipboard?.writeText(proof.hash);
  }

  return (
    <div className="min-h-screen bg-white text-[#080808]">
      <section className="relative overflow-hidden border-b border-black/10 bg-[radial-gradient(circle_at_18%_18%,rgba(56,152,232,0.16),transparent_28%),radial-gradient(circle_at_82%_8%,rgba(200,56,136,0.16),transparent_28%),radial-gradient(circle_at_85%_82%,rgba(216,72,88,0.12),transparent_30%),#ffffff]">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.22),#ffffff_92%)]" />

        <div className="relative z-10 p-4 md:p-6 xl:p-10">
          <div className="grid grid-cols-12 gap-6 items-end">
            <div className="col-span-12 xl:col-span-8">
              <div className="mb-6">
                <OTTLogo size="lg" subtitle="SourceTag Proof Monitor" />
              </div>

              <div className="inline-flex items-center gap-2 border border-black/10 bg-white/80 shadow-sm px-4 py-2 mb-6">
                <Tag size={15} className="text-[#C83888]" />

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
                      value={txHash}
                      onChange={(event) => setTxHash(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          void verifySourceTag();
                        }
                      }}
                      placeholder={c.placeholder}
                      className="w-full bg-transparent py-4 outline-none font-mono text-xs text-black placeholder:text-black/25"
                    />
                  </div>

                  <button
                    onClick={() => void verifySourceTag()}
                    disabled={status === "loading"}
                    className="bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] text-white px-6 py-4 font-orbitron text-xs font-black uppercase tracking-widest hover:brightness-95 transition-all disabled:opacity-50"
                  >
                    {status === "loading" ? c.verifying : c.verifyButton}
                  </button>
                </div>

                {status === "error" && <ErrorBox text={error} />}
              </div>
            </div>

            <div className="col-span-12 xl:col-span-4">
              <div className="border border-black/10 bg-white/90 backdrop-blur p-5 shadow-xl shadow-black/5">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <p className="font-orbitron text-xs uppercase tracking-widest">
                    {c.proofStatus}
                  </p>

                  <StatusPill status={status} matched={proofMatched} />
                </div>

                <div className="mb-4 text-black">
                  <OTTProofBadge sourceTag={String(MAKE_WAVES_SOURCE_TAG)} />
                </div>

                <div className="space-y-3">
                  <InfoRow label={c.officialSourceTag} value={String(MAKE_WAVES_SOURCE_TAG)} />
                  <InfoRow
                    label={c.currentWallet}
                    value={walletAddress === "guest" ? "Guest" : walletAddress}
                  />
                  <InfoRow label={c.sourceTagRole} value="OTT proof identity" />
                  <InfoRow label="Updated" value={lastChecked} />
                </div>

                <div className="border border-black/10 bg-[#F7F8FC] p-4 mt-5">
                  <div className="flex items-start gap-3">
                    <LockKeyhole size={18} className="text-[#C83888] mt-0.5 shrink-0" />

                    <p className="font-mono text-xs text-black/55 leading-relaxed">
                      {c.readOnly}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mt-8">
            {metrics.map((metric) => (
              <MetricCard key={metric.label} metric={metric} />
            ))}
          </div>
        </div>
      </section>

      <section className="p-4 md:p-6 xl:p-10 bg-white">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-7 border border-black/10 bg-white p-5 md:p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/35 mb-3">
                  {c.monitor}
                </p>

                <h2 className="font-orbitron text-2xl font-black uppercase">
                  {c.verifyTitle}
                </h2>
              </div>

              <p className="font-mono text-xs text-black/45 max-w-md leading-relaxed">
                {c.verifyIntro}
              </p>
            </div>

            {status === "loading" ? (
              <LoadingBox text={c.verifying} />
            ) : !proof ? (
              <EmptyBox text={c.noProof} />
            ) : (
              <div className="space-y-4">
                <div
                  className={`border p-5 ${
                    proof.matchesOttSourceTag
                      ? "border-[#3898E8]/25 bg-[#3898E8]/10"
                      : "border-[#D84858]/25 bg-[#D84858]/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        {proof.matchesOttSourceTag ? (
                          <CheckCircle2 size={18} className="text-[#3898E8]" />
                        ) : (
                          <AlertTriangle size={18} className="text-[#D84858]" />
                        )}

                        <p className="font-orbitron text-sm font-black uppercase">
                          {proof.matchesOttSourceTag ? c.matched : c.notMatched}
                        </p>
                      </div>

                      <p className="font-mono text-xs text-black/55 leading-relaxed">
                        SourceTag {proof.sourceTag} / Official {MAKE_WAVES_SOURCE_TAG}
                      </p>
                    </div>

                    <button
                      onClick={copyProofHash}
                      className="border border-black/10 bg-white/70 p-3 hover:bg-white transition-all"
                    >
                      <Copy size={15} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <ProofData label={c.txHash} value={proof.hash} />
                  <ProofData label={c.transactionType} value={proof.type} />
                  <ProofData label={c.account} value={proof.account} />
                  <ProofData label={c.destination} value={proof.destination} />
                  <ProofData label={c.amount} value={proof.amount} />
                  <ProofData label={c.fee} value={proof.fee} />
                  <ProofData label={c.sourceTag} value={proof.sourceTag} />
                  <ProofData label={c.destinationTag} value={proof.destinationTag} />
                  <ProofData label={c.result} value={proof.result} />
                  <ProofData label={c.validated} value={proof.validated} />
                </div>
              </div>
            )}
          </div>

          <div className="col-span-12 xl:col-span-5 space-y-4">
            <Panel title={c.safeTitle} icon={ShieldCheck}>
              <div className="space-y-3">
                {c.safeLines.map((line) => (
                  <SafeLine key={line} text={line} />
                ))}
              </div>
            </Panel>

            <Panel title={c.futureTitle} icon={Zap}>
              <div className="space-y-3">
                {c.futureLines.map((line) => (
                  <FutureLine key={line} text={line} />
                ))}
              </div>
            </Panel>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatusPill({
  status,
  matched,
}: {
  status: VerifyStatus;
  matched: boolean;
}) {
  const label =
    status === "loading"
      ? "Loading"
      : status === "success"
        ? matched
          ? "Matched"
          : "Checked"
        : status === "error"
          ? "Error"
          : "Idle";

  return (
    <div className="border border-black/10 bg-[#F7F8FC] px-3 py-2">
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${
            matched ? "bg-[#3898E8]" : "bg-black/25"
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
  metric,
}: {
  metric: {
    label: string;
    value: string;
    text: string;
    icon: ElementType;
  };
}) {
  const Icon = metric.icon;

  return (
    <div className="border border-black/10 bg-white/90 p-4 shadow-sm">
      <Icon size={18} className="text-[#C83888] mb-3" />

      <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">
        {metric.label}
      </p>

      <p className="font-orbitron text-sm font-black uppercase mb-1 break-all">
        {metric.value}
      </p>

      <p className="font-mono text-[10px] text-black/35 uppercase">{metric.text}</p>
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

function ProofData({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-4">
      <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-3">
        {label}
      </p>

      <p className="font-mono text-xs text-black/60 break-all">{value}</p>
    </div>
  );
}

function Panel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-black/10 bg-white p-5 md:p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <Icon size={18} className="text-[#3898E8]" />

        <p className="font-orbitron text-xs uppercase tracking-widest">
          {title}
        </p>
      </div>

      {children}
    </div>
  );
}

function SafeLine({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 border border-black/10 bg-[#F7F8FC] p-3">
      <ShieldCheck size={14} className="text-[#3898E8] shrink-0" />

      <p className="font-mono text-xs text-black/55 uppercase tracking-widest">
        {text}
      </p>
    </div>
  );
}

function FutureLine({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 border border-black/10 bg-[#F7F8FC] p-3">
      <BadgeCheck size={14} className="text-[#C83888] shrink-0 mt-0.5" />

      <p className="font-mono text-xs text-black/55 leading-relaxed">
        {text}
      </p>
    </div>
  );
}

function ErrorBox({ text }: { text: string }) {
  return (
    <div className="border border-[#D84858]/25 bg-[#D84858]/10 p-4 mt-3">
      <div className="flex items-start gap-3">
        <AlertTriangle size={18} className="text-[#D84858] shrink-0 mt-0.5" />

        <p className="font-mono text-xs text-black/60 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function EmptyBox({ text }: { text: string }) {
  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-8 text-center">
      <Fingerprint size={26} className="mx-auto mb-4 text-black/30" />

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

function isLikelyTxHash(value: string): boolean {
  return /^[A-Fa-f0-9]{64}$/.test(value);
}

async function xrplRequest(payload: Record<string, unknown>): Promise<XrplTxResponse> {
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
        resolve(JSON.parse(event.data) as XrplTxResponse);
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
