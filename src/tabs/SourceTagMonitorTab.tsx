import { useState } from "react";
import type { ElementType } from "react";
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Clock,
  Database,
  Eye,
  Fingerprint,
  Gauge,
  Hash,
  Loader2,
  Lock,
  Radio,
  ScanLine,
  ShieldCheck,
  Target,
  Trophy,
  UserCheck,
  Wallet,
  Waves,
  Zap,
} from "lucide-react";
import {
  MAKE_WAVES_ACTIONS,
  MAKE_WAVES_SOURCE_TAG,
  buildMakeWavesStatusLine,
  isMakeWavesSourceTag,
} from "../lib/makeWaves";
import {
  getMakeWavesVerificationLabel,
  isMakeWavesRewardAllowed,
  verifyMakeWavesPayload,
  type XamanVerifyPayloadResponse,
} from "../lib/xamanClient";

type SourceTagMonitorTabProps = {
  walletAddress: string;
};

type MonitorMetric = {
  label: string;
  value: string;
  text: string;
  icon: ElementType;
};

type MonitorRule = {
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

type MockTransaction = {
  id: string;
  action: string;
  wallet: string;
  sourceTag: number;
  status: string;
  xp: number;
};

const metrics: MonitorMetric[] = [
  {
    label: "Make Waves Tag",
    value: `${MAKE_WAVES_SOURCE_TAG}`,
    text: "Vaste SourceTag voor jouw Make Waves flow.",
    icon: Fingerprint,
  },
  {
    label: "Reward Gate",
    value: "Verify",
    text: "XP pas na signed + resolved + tag match.",
    icon: ShieldCheck,
  },
  {
    label: "Daily Loop",
    value: "Check-In",
    text: "Daily retention en active user proof.",
    icon: Activity,
  },
  {
    label: "Status",
    value: "Build",
    text: "Klaar voor Xaman verification flow.",
    icon: Radio,
  },
];

const mockTransactions: MockTransaction[] = [
  {
    id: "MW-001",
    action: "Daily Check-In",
    wallet: "rDEBUG...2606",
    sourceTag: MAKE_WAVES_SOURCE_TAG,
    status: "Verified",
    xp: 10,
  },
  {
    id: "MW-002",
    action: "Wallet Safety",
    wallet: "rDEBUG...SAFE",
    sourceTag: MAKE_WAVES_SOURCE_TAG,
    status: "Verified",
    xp: 15,
  },
  {
    id: "MW-003",
    action: "Academy Lesson",
    wallet: "rDEBUG...LEARN",
    sourceTag: MAKE_WAVES_SOURCE_TAG,
    status: "Pending",
    xp: 0,
  },
  {
    id: "MW-004",
    action: "Wrong Tag Test",
    wallet: "rDEBUG...TEST",
    sourceTag: 2606,
    status: "Rejected",
    xp: 0,
  },
];

const rules: MonitorRule[] = [
  {
    title: "Exact Tag Only",
    status: "Rule",
    text: `Alleen SourceTag ${MAKE_WAVES_SOURCE_TAG} telt voor Make Waves.`,
    icon: Fingerprint,
  },
  {
    title: "Verify First",
    status: "Proof",
    text: "Reward, badge of streak pas na correcte Xaman payload verification.",
    icon: BadgeCheck,
  },
  {
    title: "No Debug Rewards",
    status: "Safety",
    text: "Debug UI mag tonen, maar echte XP hoort later pas na ledger proof.",
    icon: Lock,
  },
  {
    title: "Wallet Match",
    status: "Check",
    text: "Later controleren we of de wallet, tx hash en payload result bij elkaar horen.",
    icon: Wallet,
  },
];

function getErrorMessage(error: unknown) {
  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object" && "error" in error) {
    const apiError = error as { error?: unknown };

    if (typeof apiError.error === "string") {
      return apiError.error;
    }
  }

  return "Unknown source tag monitor error.";
}

export function SourceTagMonitorTab({ walletAddress }: SourceTagMonitorTabProps) {
  const [payloadUuid, setPayloadUuid] = useState("");
  const [verifyResponse, setVerifyResponse] =
    useState<XamanVerifyPayloadResponse | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<MockTransaction>(
    mockTransactions[0]
  );
  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    buildMakeWavesStatusLine("source-tag-proof")
  );

  const rewardAllowed = isMakeWavesRewardAllowed(verifyResponse);
  const verifiedTag = verifyResponse?.verified?.sourceTag ?? null;
  const tagMatches = isMakeWavesSourceTag(verifiedTag);

  async function handleVerifyPayload() {
    const cleanUuid = payloadUuid.trim();

    if (!cleanUuid) {
      setStatusMessage("Vul eerst een Xaman payload UUID in.");
      return;
    }

    setBusy(true);
    setStatusMessage("Checking payload SourceTag...");

    try {
      const response = await verifyMakeWavesPayload(cleanUuid);
      setVerifyResponse(response);
      setStatusMessage(getMakeWavesVerificationLabel(response));
    } catch (error) {
      setStatusMessage(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 mb-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="flex items-center gap-2 mb-4 text-white/45">
              <Waves size={17} />

              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                Source Tag Monitor
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              Make Waves Proof Layer
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              Monitor en verify jouw vaste Make Waves SourceTag{" "}
              {MAKE_WAVES_SOURCE_TAG}. Alleen payloads met deze tag mogen later
              meetellen voor active users, XP, badges en demo proof.
            </p>
          </div>

          <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-3">
            {metrics.map((metric) => (
              <MetricBox key={metric.label} metric={metric} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-4 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Fingerprint size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Fixed SourceTag
              </p>
            </div>

            <div className="border border-white/10 bg-black p-5 mb-4">
              <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
                Make Waves
              </p>

              <p className="font-orbitron text-3xl font-black uppercase break-all mb-3">
                {MAKE_WAVES_SOURCE_TAG}
              </p>

              <p className="font-mono text-xs text-white/45 leading-relaxed">
                Deze waarde blijft de centrale tracking tag voor jouw terminal.
              </p>
            </div>

            <MiniStatus label="Connected Wallet" value={walletAddress} />
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Target size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Make Waves Actions
              </p>
            </div>

            <div className="space-y-3">
              {MAKE_WAVES_ACTIONS.map((action) => (
                <ActionLine
                  key={action.id}
                  label={action.title}
                  xp={action.xp}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-5 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <ScanLine size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Verify Payload UUID
              </p>
            </div>

            <label className="block">
              <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
                Xaman Payload UUID
              </p>

              <input
                value={payloadUuid}
                placeholder="uuid from Xaman"
                onChange={(event) => setPayloadUuid(event.target.value)}
                className="w-full bg-black border border-white/10 px-4 py-4 font-mono text-xs text-white/70 outline-none focus:border-white/30 placeholder:text-white/20"
              />
            </label>

            <button
              onClick={handleVerifyPayload}
              disabled={busy}
              className="w-full bg-white text-black py-4 mt-5 font-orbitron text-xs font-black uppercase tracking-widest hover:bg-white/80 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              Verify SourceTag {MAKE_WAVES_SOURCE_TAG}
            </button>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Gauge size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Verification Status
              </p>
            </div>

            <div className="border border-white/10 bg-black p-4 mb-4">
              <p className="font-mono text-xs text-white/50 leading-relaxed">
                {statusMessage}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <MiniStatus label="Tag Match" value={tagMatches ? "Yes" : "No"} />
              <MiniStatus label="Reward" value={rewardAllowed ? "Allowed" : "Locked"} />
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Database size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Mock Transaction Feed
              </p>
            </div>

            <div className="space-y-3">
              {mockTransactions.map((tx) => (
                <TransactionRow
                  key={tx.id}
                  tx={tx}
                  active={selectedTransaction.id === tx.id}
                  onClick={() => setSelectedTransaction(tx)}
                />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Eye size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Selected Transaction
              </p>
            </div>

            <p className="font-orbitron text-2xl font-black uppercase mb-2">
              {selectedTransaction.action}
            </p>

            <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-4">
              {selectedTransaction.id} • {selectedTransaction.status} • +{selectedTransaction.xp} XP
            </p>

            <MiniStatus
              label="SourceTag Valid"
              value={isMakeWavesSourceTag(selectedTransaction.sourceTag) ? "Yes" : "No"}
            />
          </div>
        </div>

        <div className="col-span-12 xl:col-span-3 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <ShieldCheck size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Monitor Rules
              </p>
            </div>

            <div className="space-y-3">
              {rules.map((rule) => (
                <RuleCard key={rule.title} rule={rule} />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Trophy size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Verified Result
              </p>
            </div>

            {verifyResponse?.verified ? (
              <div className="space-y-3">
                <ResultLine label="Signed" value={String(verifyResponse.verified.signed)} />
                <ResultLine label="Resolved" value={String(verifyResponse.verified.resolved)} />
                <ResultLine label="SourceTag" value={String(verifyResponse.verified.sourceTag)} />
                <ResultLine label="Tx Hash" value={verifyResponse.verified.txHash ?? "None"} />
              </div>
            ) : (
              <EmptyState text="Nog geen payload verified." />
            )}
          </div>
        </div>

        <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <FeatureBox icon={Hash} title="Tag" text={`${MAKE_WAVES_SOURCE_TAG}`} />
          <FeatureBox icon={BarChart3} title="Metrics" text="Active users later" />
          <FeatureBox icon={AlertTriangle} title="Reject" text="Wrong tag fails" />
          <FeatureBox icon={Zap} title="Reward" text="XP after proof" />
        </div>
      </div>
    </div>
  );
}

function MetricBox({ metric }: { metric: MonitorMetric }) {
  const Icon = metric.icon;

  return (
    <div className="border border-white/10 bg-black/60 p-4">
      <Icon size={18} className="text-white/60 mb-3" />

      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
        {metric.label}
      </p>

      <p className="font-orbitron text-sm font-black uppercase mb-1 break-all">
        {metric.value}
      </p>

      <p className="font-mono text-[10px] text-white/30 uppercase">
        {metric.text}
      </p>
    </div>
  );
}

function MiniStatus({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/10 bg-black p-4">
      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
        {label}
      </p>

      <p className="font-orbitron text-sm font-black uppercase break-all">
        {value}
      </p>
    </div>
  );
}

function ActionLine({ label, xp }: { label: string; xp: number }) {
  return (
    <div className="border border-white/10 bg-black p-3 flex items-center justify-between gap-3">
      <p className="font-mono text-xs text-white/50">{label}</p>

      <p className="font-mono text-[10px] text-white/35 uppercase">+{xp} XP</p>
    </div>
  );
}

function TransactionRow({
  tx,
  active,
  onClick,
}: {
  tx: MockTransaction;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full border p-4 text-left transition-all ${
        active
          ? "border-white/30 bg-white/[0.08]"
          : "border-white/10 bg-black hover:bg-white/[0.03]"
      }`}
    >
      <div className="flex items-center justify-between gap-4 mb-2">
        <p className="font-orbitron text-sm font-bold uppercase">
          {tx.action}
        </p>

        <p className="font-mono text-[10px] text-white/45 uppercase">
          {tx.status}
        </p>
      </div>

      <p className="font-mono text-[10px] text-white/35 uppercase break-all">
        {tx.id} • tag {tx.sourceTag}
      </p>
    </button>
  );
}

function RuleCard({ rule }: { rule: MonitorRule }) {
  const Icon = rule.icon;

  return (
    <div className="border border-white/10 bg-black p-4">
      <div className="flex items-start justify-between mb-3">
        <Icon size={17} className="text-white/60" />

        <p className="font-mono text-[10px] text-white/30 uppercase">
          {rule.status}
        </p>
      </div>

      <p className="font-orbitron text-xs font-bold uppercase mb-2">
        {rule.title}
      </p>

      <p className="font-mono text-[10px] text-white/40 leading-relaxed">
        {rule.text}
      </p>
    </div>
  );
}

function ResultLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/10 bg-black p-3">
      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-1">
        {label}
      </p>

      <p className="font-mono text-[10px] text-white/55 break-all">{value}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="border border-white/10 bg-black p-4">
      <p className="font-mono text-xs text-white/35 leading-relaxed">{text}</p>
    </div>
  );
}

function FeatureBox({
  icon: Icon,
  title,
  text,
}: {
  icon: ElementType;
  title: string;
  text: string;
}) {
  return (
    <div className="border border-white/10 bg-white/[0.02] p-5">
      <Icon size={19} className="text-white/60 mb-4" />

      <p className="font-orbitron text-sm font-bold uppercase mb-2">{title}</p>

      <p className="font-mono text-xs text-white/40 break-all">{text}</p>
    </div>
  );
}
