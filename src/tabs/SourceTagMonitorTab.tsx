import { useMemo, useState } from "react";
import type { ElementType, ReactNode } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  Copy,
  ExternalLink,
  Eye,
  Fingerprint,
  HeartHandshake,
  Loader2,
  LockKeyhole,
  MessageSquareText,
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
  memo: string;
  result: string;
  validated: string;
  matchesOttSourceTag: boolean;
};

type Metric = {
  label: string;
  value: string;
  text: string;
  icon: ElementType;
};

type SupportTier = {
  value: string;
  label: string;
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
  memo: string;
  noProof: string;
  safeTitle: string;
  safeLines: string[];
  futureTitle: string;
  futureLines: string[];
  invalidHash: string;
  lookupFailed: string;
};

const sourceCopy: Record<"nl" | "en", SourceCopy> = {
  nl: {
    eyebrow: "Make Waves SourceTag Landing",
    titleLine1: "Support",
    titleLine2: "The Build.",
    intro:
      "Deze pagina is de publieke Make Waves landing voor OTT Terminal. Hier leren bezoekers waarom SourceTag 2606170002 bestaat, hoe proof werkt en hoe support/donaties later transparant met XRP of RLUSD kunnen worden gevolgd.",
    verifyTitle: "Verify Transaction",
    verifyIntro:
      "Plak een XRPL transaction hash. De terminal controleert of SourceTag 2606170002 aanwezig is en toont eventuele memo/comment.",
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
    memo: "Memo / Comment",
    noProof:
      "Nog geen transaction hash geverifieerd. Plak een hash om SourceTag proof en memo/comment te bekijken.",
    safeTitle: "Safe Position",
    safeLines: [
      "Vrijwillige support, geen investering",
      "Geen rendement, yield of tokenwaarde-belofte",
      "Geen gegarandeerde NFT, Access Pass of reward",
      "Memo/comment kan publiek of technisch uitleesbaar zijn",
      "Alleen publieke XRPL proof en transparantie",
    ],
    futureTitle: "Later uitbreiden",
    futureLines: [
      "XRP support payload met SourceTag",
      "RLUSD support payload met SourceTag",
      "Memo/comment voor persoonlijke boodschap of tip",
      "Transparant support dashboard",
      "Project funding: terminal, educatie, events en community tools",
    ],
    invalidHash: "Dit lijkt geen geldige XRPL transaction hash.",
    lookupFailed: "SourceTag verification is mislukt.",
  },
  en: {
    eyebrow: "Make Waves SourceTag Landing",
    titleLine1: "Support",
    titleLine2: "The Build.",
    intro:
      "This page is the public Make Waves landing for OTT Terminal. Visitors learn why SourceTag 2606170002 exists, how proof works and how future XRP or RLUSD support/donations can be tracked transparently.",
    verifyTitle: "Verify Transaction",
    verifyIntro:
      "Paste an XRPL transaction hash. The terminal checks whether SourceTag 2606170002 is present and shows any memo/comment.",
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
    memo: "Memo / Comment",
    noProof:
      "No transaction hash verified yet. Paste a hash to view SourceTag proof and memo/comment.",
    safeTitle: "Safe Position",
    safeLines: [
      "Voluntary support, not an investment",
      "No return, yield or token value promise",
      "No guaranteed NFT, Access Pass or reward",
      "Memo/comment can be public or technically readable",
      "Only public XRPL proof and transparency",
    ],
    futureTitle: "Future expansion",
    futureLines: [
      "XRP support payload with SourceTag",
      "RLUSD support payload with SourceTag",
      "Memo/comment for a personal message or tip",
      "Transparent support dashboard",
      "Project funding: terminal, education, events and community tools",
    ],
    invalidHash: "This does not look like a valid XRPL transaction hash.",
    lookupFailed: "SourceTag verification failed.",
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
      Memos?: Array<{
        Memo?: {
          MemoType?: string;
          MemoData?: string;
          MemoFormat?: string;
        };
      }>;
    };
    meta?: {
      TransactionResult?: string;
    };
  };
};

const XRPL_ENDPOINT = "wss://xrplcluster.com/";

const supportTiers: SupportTier[] = [
  { value: "0.0589", label: "Signal" },
  { value: "0.589", label: "Proof" },
  { value: "1.0589", label: "Builder" },
  { value: "1.589", label: "Support" },
  { value: "2.0589", label: "Community" },
  { value: "2.589", label: "Make Waves" },
];

export function SourceTagMonitorTab({
  walletAddress = "guest",
}: SourceTagMonitorTabProps) {
  const { language } = useTerminalLanguage();
  const c = sourceCopy[language];
  const isEnglish = language === "en";

  const [txHash, setTxHash] = useState("");
  const [status, setStatus] = useState<VerifyStatus>("idle");
  const [error, setError] = useState("");
  const [proof, setProof] = useState<TxProof | null>(null);
  const [lastChecked, setLastChecked] = useState("not checked");

  const proofMatched = Boolean(proof?.matchesOttSourceTag);

  const metrics: Metric[] = useMemo(
    () => [
      {
        label: c.officialSourceTag,
        value: String(MAKE_WAVES_SOURCE_TAG),
        text: "Make Waves identity",
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
        label: "Support",
        value: "Soon",
        text: "XRP / RLUSD",
        icon: HeartHandshake,
      },
    ],
    [c, proof, proofMatched, walletAddress],
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
        memo: decodeMemos(tx.Memos),
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
                <OTTLogo size="lg" subtitle="Make Waves + SourceTag + Support" />
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-4xl">
                <HeroAction
                  icon={Wallet}
                  title={isEnglish ? "Connect Xaman" : "Connect Xaman"}
                  text={isEnglish ? "Start proof journey" : "Start proof journey"}
                />
                <HeroAction
                  icon={Eye}
                  title={isEnglish ? "Verify SourceTag" : "Verify SourceTag"}
                  text={String(MAKE_WAVES_SOURCE_TAG)}
                />
                <HeroAction
                  icon={HeartHandshake}
                  title={isEnglish ? "Support Soon" : "Support Soon"}
                  text="XRP / RLUSD / Memo"
                />
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
                  <InfoRow label={c.sourceTagRole} value="OTT / Make Waves proof identity" />
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
        <div className="grid grid-cols-12 gap-4 mb-4">
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

            <div className="border border-black/10 bg-white/90 backdrop-blur p-3 mb-5 shadow-sm">
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
                  <ProofData label={c.memo} value={proof.memo} />
                  <ProofData label={c.result} value={proof.result} />
                  <ProofData label={c.validated} value={proof.validated} />
                </div>
              </div>
            )}
          </div>

          <div className="col-span-12 xl:col-span-5 space-y-4">
            <Panel title={isEnglish ? "Future Transparent Support" : "Toekomstige Transparante Support"} icon={HeartHandshake}>
              <p className="font-mono text-xs text-black/55 leading-relaxed mb-5">
                {isEnglish
                  ? "Later this page can create XRP/RLUSD support payloads with SourceTag and a memo/comment. For now it only explains the model and keeps verification read-only."
                  : "Later kan deze pagina XRP/RLUSD support-payloads maken met SourceTag en memo/comment. Voor nu legt hij alleen het model uit en blijft verificatie read-only."}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {supportTiers.map((tier) => (
                  <div key={tier.value} className="border border-black/10 bg-[#F7F8FC] p-3">
                    <p className="font-orbitron text-sm font-black uppercase text-black">
                      {tier.value}
                    </p>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-black/35">
                      {tier.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border border-[#C83888]/25 bg-[#C83888]/10 p-4 mt-5">
                <p className="font-mono text-xs text-black/60 leading-relaxed">
                  {isEnglish
                    ? "Standard tiers stay small. Anything above that is a voluntary personal choice from the supporter."
                    : "Standaard tiers blijven klein. Alles daarboven is een vrijwillige persoonlijke keuze van de supporter."}
                </p>
              </div>
            </Panel>

            <Panel title={isEnglish ? "Memo / Comment Awareness" : "Memo / Comment Awareness"} icon={MessageSquareText}>
              <p className="font-mono text-xs text-black/55 leading-relaxed mb-4">
                {isEnglish
                  ? "A supporter can later add a short message, tip or personal note through a transaction memo. This teaches users that XRPL transactions can carry contextual proof."
                  : "Een supporter kan later een korte boodschap, tip of persoonlijke note meesturen via een transaction memo. Zo leren gebruikers dat XRPL-transacties contextuele proof kunnen dragen."}
              </p>

              <div className="border border-black/10 bg-[#F7F8FC] p-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-black/35 mb-2">
                  Example memo
                </p>

                <p className="font-mono text-xs text-black/60 leading-relaxed">
                  {isEnglish
                    ? "Keep building. This support is for the OTT Terminal and Make Waves journey."
                    : "Blijf bouwen. Deze support is voor de OTT Terminal en Make Waves journey."}
                </p>
              </div>
            </Panel>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-6">
            <Panel title={c.safeTitle} icon={ShieldCheck}>
              <div className="space-y-3">
                {c.safeLines.map((line) => (
                  <SafeLine key={line} text={line} />
                ))}
              </div>
            </Panel>
          </div>

          <div className="col-span-12 xl:col-span-6">
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

function HeroAction({
  icon: Icon,
  title,
  text,
}: {
  icon: ElementType;
  title: string;
  text: string;
}) {
  return (
    <div className="border border-black/10 bg-white/90 p-4 shadow-sm">
      <Icon size={18} className="text-[#C83888] mb-3" />
      <p className="font-orbitron text-xs font-black uppercase mb-2 text-black">
        {title}
      </p>
      <p className="font-mono text-[10px] uppercase tracking-widest text-black/40">
        {text}
      </p>
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

function MetricCard({ metric }: { metric: Metric }) {
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

function decodeMemos(
  memos:
    | Array<{
        Memo?: {
          MemoType?: string;
          MemoData?: string;
          MemoFormat?: string;
        };
      }>
    | undefined,
): string {
  if (!Array.isArray(memos) || memos.length === 0) {
    return "—";
  }

  const decoded = memos
    .map((entry) => decodeHexMemo(entry.Memo?.MemoData))
    .filter((value) => value.trim().length > 0);

  return decoded.length > 0 ? decoded.join(" / ") : "Memo present";
}

function decodeHexMemo(value: string | undefined): string {
  if (!value || value.length % 2 !== 0 || !/^[A-Fa-f0-9]+$/.test(value)) {
    return "";
  }

  try {
    const bytes = value.match(/.{1,2}/g) ?? [];
    return decodeURIComponent(
      bytes
        .map((byte) => `%${byte}`)
        .join(""),
    );
  } catch {
    try {
      return String.fromCharCode(
        ...value.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)),
      );
    } catch {
      return "";
    }
  }
}

export default SourceTagMonitorTab;
