import { useState } from "react";
import type { ElementType, ReactNode } from "react";
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
  Search,
  ShieldCheck,
  Wallet,
  Zap,
} from "lucide-react";
import { OTTLogo, OTTProofBadge } from "../components/OTTLogo";
import { MAKE_WAVES_SOURCE_TAG } from "../lib/makeWaves";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

type XrplVerifyTabProps = {
  walletAddress?: string;
};

type VerifyStatus = "idle" | "loading" | "success" | "error";
type VerifyMode = "transaction" | "account";

type VerifyResult = {
  mode: VerifyMode;
  title: string;
  subtitle: string;
  rows: Array<{ label: string; value: string }>;
  sourceTagMatch: boolean;
};

type VerifyCopy = {
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;
  intro: string;
  verifyTitle: string;
  verifyIntro: string;
  placeholder: string;
  verifyButton: string;
  verifying: string;
  resultTitle: string;
  noResult: string;
  currentWallet: string;
  officialSourceTag: string;
  proofMode: string;
  readOnly: string;
  txVerified: string;
  accountLoaded: string;
  sourceTagMatch: string;
  sourceTagMissing: string;
  safeTitle: string;
  safeLines: string[];
  futureTitle: string;
  futureLines: string[];
  invalidInput: string;
  lookupFailed: string;
  parseFailed: string;
  websocketFailed: string;
};

const verifyCopy: Record<"nl" | "en", VerifyCopy> = {
  nl: {
    eyebrow: "XRPL Verify Layer",
    titleLine1: "Verify",
    titleLine2: "XRPL Proof.",
    intro:
      "Controleer publieke XRPL data: transaction hash of wallet account. Deze laag is read-only en verandert niets op de ledger.",
    verifyTitle: "Verify Public XRPL Data",
    verifyIntro:
      "Plak een transaction hash of XRPL wallet adres. De terminal leest publieke XRPL data en checkt OTT SourceTag als die aanwezig is.",
    placeholder: "Plak tx hash of wallet adres r...",
    verifyButton: "Verify XRPL",
    verifying: "Verifying...",
    resultTitle: "Verification Result",
    noResult:
      "Nog geen verify uitgevoerd. Plak een wallet adres of transaction hash om publieke XRPL proof te bekijken.",
    currentWallet: "Current Wallet",
    officialSourceTag: "Official SourceTag",
    proofMode: "Proof Mode",
    readOnly: "Read-only XRPL verification. Geen custody. Geen private keys. Geen transacties uitvoeren.",
    txVerified: "Transaction verified",
    accountLoaded: "Account loaded",
    sourceTagMatch: "OTT SourceTag matched",
    sourceTagMissing: "No OTT SourceTag match",
    safeTitle: "Safe Position",
    safeLines: [
      "Alleen publieke XRPL data",
      "Geen wallet seed nodig",
      "Geen custody",
      "Geen broker",
      "Geen transacties uitvoeren",
    ],
    futureTitle: "Later koppelen",
    futureLines: [
      "Access Gate payment verification",
      "NFT Access Pass ownership verification",
      "Course completion proof",
      "Task completion proof",
      "Shopify purchase proof",
    ],
    invalidInput: "Geen geldig XRPL wallet adres of transaction hash herkend.",
    lookupFailed: "XRPL verify is mislukt.",
    parseFailed: "Kon XRPL response niet lezen.",
    websocketFailed: "XRPL websocket verbinding mislukt.",
  },
  en: {
    eyebrow: "XRPL Verify Layer",
    titleLine1: "Verify",
    titleLine2: "XRPL Proof.",
    intro:
      "Verify public XRPL data: transaction hash or wallet account. This layer is read-only and does not change anything on the ledger.",
    verifyTitle: "Verify Public XRPL Data",
    verifyIntro:
      "Paste a transaction hash or XRPL wallet address. The terminal reads public XRPL data and checks the OTT SourceTag when available.",
    placeholder: "Paste tx hash or wallet address r...",
    verifyButton: "Verify XRPL",
    verifying: "Verifying...",
    resultTitle: "Verification Result",
    noResult:
      "No verification yet. Paste a wallet address or transaction hash to view public XRPL proof.",
    currentWallet: "Current Wallet",
    officialSourceTag: "Official SourceTag",
    proofMode: "Proof Mode",
    readOnly: "Read-only XRPL verification. No custody. No private keys. No transaction execution.",
    txVerified: "Transaction verified",
    accountLoaded: "Account loaded",
    sourceTagMatch: "OTT SourceTag matched",
    sourceTagMissing: "No OTT SourceTag match",
    safeTitle: "Safe Position",
    safeLines: [
      "Public XRPL data only",
      "No wallet seed needed",
      "No custody",
      "No broker",
      "No transaction execution",
    ],
    futureTitle: "Future connections",
    futureLines: [
      "Access Gate payment verification",
      "NFT Access Pass ownership verification",
      "Course completion proof",
      "Task completion proof",
      "Shopify purchase proof",
    ],
    invalidInput: "No valid XRPL wallet address or transaction hash recognized.",
    lookupFailed: "XRPL verification failed.",
    parseFailed: "Could not read XRPL response.",
    websocketFailed: "XRPL websocket connection failed.",
  },
};

type XrplResponse = {
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
    account_data?: {
      Account?: string;
      Balance?: string;
      Sequence?: number;
      OwnerCount?: number;
      Flags?: number;
    };
    ledger_index?: number;
  };
};

const XRPL_ENDPOINT = "wss://xrplcluster.com/";

export function XrplVerifyTab({ walletAddress = "guest" }: XrplVerifyTabProps) {
  const { language } = useTerminalLanguage();
  const c = verifyCopy[language];

  const [inputValue, setInputValue] = useState("");
  const [status, setStatus] = useState<VerifyStatus>("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [lastChecked, setLastChecked] = useState("not checked");

  async function verifyInput() {
    const cleanValue = inputValue.trim();

    if (!cleanValue) {
      setStatus("error");
      setError(c.invalidInput);
      return;
    }

    setStatus("loading");
    setError("");
    setResult(null);

    try {
      if (isLikelyTxHash(cleanValue)) {
        await verifyTransaction(cleanValue);
        return;
      }

      if (isLikelyXrplAddress(cleanValue)) {
        await verifyAccount(cleanValue);
        return;
      }

      throw new Error(c.invalidInput);
    } catch (verifyError) {
      setStatus("error");
      setError(verifyError instanceof Error ? verifyError.message : c.lookupFailed);
    }
  }

  async function verifyTransaction(hash: string) {
    const response = await xrplRequest({
      command: "tx",
      transaction: hash,
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
    const sourceTagMatch = sourceTag === String(MAKE_WAVES_SOURCE_TAG);

    setResult({
      mode: "transaction",
      title: c.txVerified,
      subtitle: tx.hash ?? hash,
      sourceTagMatch,
      rows: [
        { label: "Transaction Type", value: tx.TransactionType ?? "—" },
        { label: "Account", value: tx.Account ?? "—" },
        { label: "Destination", value: tx.Destination ?? "—" },
        { label: "Amount", value: formatAmount(tx.Amount) },
        { label: "Fee", value: tx.Fee ? `${dropsToXrp(tx.Fee)} XRP` : "—" },
        { label: "SourceTag", value: sourceTag },
        { label: "DestinationTag", value: tx.DestinationTag ? String(tx.DestinationTag) : "—" },
        { label: "Result", value: response.result?.meta?.TransactionResult ?? "—" },
        { label: "Validated", value: response.result?.validated ? "Yes" : "No" },
      ],
    });

    setLastChecked(new Date().toLocaleTimeString());
    setStatus("success");
  }

  async function verifyAccount(account: string) {
    const response = await xrplRequest({
      command: "account_info",
      account,
      ledger_index: "validated",
    });

    if (response.result?.error) {
      throw new Error(response.result.error);
    }

    const data = response.result?.account_data;

    if (!data?.Account) {
      throw new Error(c.lookupFailed);
    }

    setResult({
      mode: "account",
      title: c.accountLoaded,
      subtitle: data.Account,
      sourceTagMatch: false,
      rows: [
        { label: "Balance", value: `${dropsToXrp(data.Balance ?? "0")} XRP` },
        { label: "Sequence", value: data.Sequence ? String(data.Sequence) : "—" },
        { label: "Owner Count", value: data.OwnerCount ? String(data.OwnerCount) : "0" },
        { label: "Flags", value: data.Flags ? String(data.Flags) : "0" },
        { label: "Ledger Index", value: response.result?.ledger_index ? String(response.result.ledger_index) : "—" },
      ],
    });

    setLastChecked(new Date().toLocaleTimeString());
    setStatus("success");
  }

  function copyResult() {
    if (!result?.subtitle) {
      return;
    }

    void navigator.clipboard?.writeText(result.subtitle);
  }

  return (
    <div className="min-h-screen bg-white text-[#080808]">
      <section className="relative overflow-hidden border-b border-black/10 bg-[radial-gradient(circle_at_18%_18%,rgba(56,152,232,0.16),transparent_28%),radial-gradient(circle_at_82%_8%,rgba(200,56,136,0.16),transparent_28%),radial-gradient(circle_at_85%_82%,rgba(216,72,88,0.12),transparent_30%),#ffffff]">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.22),#ffffff_92%)]" />

        <div className="relative z-10 p-4 md:p-6 xl:p-10">
          <div className="grid grid-cols-12 gap-6 items-end">
            <div className="col-span-12 xl:col-span-8">
              <div className="mb-6">
                <OTTLogo size="lg" subtitle="XRPL Public Verification" />
              </div>

              <div className="inline-flex items-center gap-2 border border-black/10 bg-white/80 shadow-sm px-4 py-2 mb-6">
                <ShieldCheck size={15} className="text-[#3898E8]" />

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
                      value={inputValue}
                      onChange={(event) => setInputValue(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          void verifyInput();
                        }
                      }}
                      placeholder={c.placeholder}
                      className="w-full bg-transparent py-4 outline-none font-mono text-xs text-black placeholder:text-black/25"
                    />
                  </div>

                  <button
                    onClick={() => void verifyInput()}
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
                    {c.proofMode}
                  </p>

                  <StatusPill status={status} />
                </div>

                <div className="mb-4 text-black">
                  <OTTProofBadge sourceTag={String(MAKE_WAVES_SOURCE_TAG)} />
                </div>

                <div className="space-y-3">
                  <InfoRow
                    label={c.currentWallet}
                    value={walletAddress === "guest" ? "Guest" : walletAddress}
                  />
                  <InfoRow label={c.officialSourceTag} value={String(MAKE_WAVES_SOURCE_TAG)} />
                  <InfoRow
                    label="Last Checked"
                    value={lastChecked}
                  />
                  <InfoRow
                    label="Status"
                    value={result ? result.title : "Idle"}
                  />
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
            <MetricCard
              label={c.officialSourceTag}
              value={String(MAKE_WAVES_SOURCE_TAG)}
              text="OnTheTrack proof"
              icon={Fingerprint}
            />
            <MetricCard
              label="Mode"
              value={result?.mode ?? "Idle"}
              text="Account or transaction"
              icon={Database}
            />
            <MetricCard
              label="SourceTag"
              value={result ? (result.sourceTagMatch ? "Matched" : "Checked") : "Waiting"}
              text={result?.sourceTagMatch ? c.sourceTagMatch : c.sourceTagMissing}
              icon={BadgeCheck}
            />
            <MetricCard
              label="Wallet"
              value={walletAddress === "guest" ? "Guest" : "Connected"}
              text="Xaman state"
              icon={Wallet}
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
                  {c.resultTitle}
                </h2>
              </div>

              {result && (
                <button
                  onClick={copyResult}
                  className="border border-black/10 bg-[#F7F8FC] px-4 py-3 hover:bg-white transition-all flex items-center gap-2"
                >
                  <Copy size={15} className="text-[#C83888]" />
                  <span className="font-orbitron text-[10px] font-black uppercase">
                    Copy
                  </span>
                </button>
              )}
            </div>

            {status === "loading" ? (
              <LoadingBox text={c.verifying} />
            ) : !result ? (
              <EmptyBox text={c.noResult} />
            ) : (
              <ResultCard result={result} copy={c} />
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

function ResultCard({
  result,
  copy,
}: {
  result: VerifyResult;
  copy: VerifyCopy;
}) {
  const Icon = result.mode === "transaction" ? Hash : Wallet;

  return (
    <div className="space-y-4">
      <div
        className={`border p-5 ${
          result.sourceTagMatch
            ? "border-[#3898E8]/25 bg-[#3898E8]/10"
            : "border-black/10 bg-[#F7F8FC]"
        }`}
      >
        <div className="flex items-start gap-3">
          <Icon size={22} className="text-[#C83888] shrink-0 mt-1" />

          <div className="min-w-0">
            <p className="font-orbitron text-lg font-black uppercase mb-2">
              {result.title}
            </p>

            <p className="font-mono text-xs text-black/55 break-all">
              {result.subtitle}
            </p>

            {result.mode === "transaction" && (
              <p className="font-mono text-[10px] uppercase tracking-widest text-black/40 mt-3">
                {result.sourceTagMatch ? copy.sourceTagMatch : copy.sourceTagMissing}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {result.rows.map((row) => (
          <ProofData key={row.label} label={row.label} value={row.value} />
        ))}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: VerifyStatus }) {
  const label =
    status === "loading"
      ? "Loading"
      : status === "success"
        ? "Verified"
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
  children: ReactNode;
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
      <CheckCircle2 size={14} className="text-[#C83888] shrink-0 mt-0.5" />

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
      <Database size={26} className="mx-auto mb-4 text-black/30" />

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
