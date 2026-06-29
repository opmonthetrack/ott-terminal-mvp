import { useState } from "react";
import type { ElementType } from "react";
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  Database,
  Eye,
  Fingerprint,
  Hash,
  Loader2,
  Lock,
  Radio,
  ScanLine,
  ShieldCheck,
  Target,
  Trophy,
  Wallet,
  Waves,
  Zap,
} from "lucide-react";
import {
  MAKE_WAVES_SOURCE_TAG,
  buildMakeWavesStatusLine,
} from "../lib/makeWaves";
import {
  getXrplVerificationLabel,
  isMakeWavesTransactionVerified,
  shortTxHash,
  verifyXrplTransaction,
  type VerifyXrplTransactionResponse,
} from "../lib/xrplClient";

type XrplVerifyMetric = {
  label: string;
  value: string;
  text: string;
  icon: ElementType;
};

type VerifyRule = {
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

type VerifyStep = {
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

const metrics: XrplVerifyMetric[] = [
  {
    label: "SourceTag",
    value: `${MAKE_WAVES_SOURCE_TAG}`,
    text: "Vaste Make Waves tag.",
    icon: Fingerprint,
  },
  {
    label: "XRPL Check",
    value: "Live",
    text: "Controle via backend RPC.",
    icon: Database,
  },
  {
    label: "Reward Gate",
    value: "Verify",
    text: "Pas na ledger proof.",
    icon: ShieldCheck,
  },
  {
    label: "Status",
    value: "Ready",
    text: "Tx hash checker.",
    icon: Radio,
  },
];

const verifySteps: VerifyStep[] = [
  {
    title: "Paste Tx Hash",
    status: "Step 1",
    text: "Plak de XRPL transaction hash van de Xaman signed payload.",
    icon: Hash,
  },
  {
    title: "Call XRPL RPC",
    status: "Step 2",
    text: "Backend zoekt de transactie op via XRPL tx method.",
    icon: ScanLine,
  },
  {
    title: "Check SourceTag",
    status: "Step 3",
    text: `Alleen SourceTag ${MAKE_WAVES_SOURCE_TAG} telt als Make Waves proof.`,
    icon: Fingerprint,
  },
  {
    title: "Unlock Reward",
    status: "Step 4",
    text: "Reward/XP/eligibility mag pas door als validated, success en tag matchen.",
    icon: BadgeCheck,
  },
];

const rules: VerifyRule[] = [
  {
    title: "Validated Only",
    status: "Rule",
    text: "Alleen validated XRPL transacties mogen meetellen voor proof.",
    icon: CheckCircle2,
  },
  {
    title: "tesSUCCESS Required",
    status: "Rule",
    text: "Transactie moet succesvol zijn voordat reward open gaat.",
    icon: Trophy,
  },
  {
    title: "Exact SourceTag",
    status: "2606170002",
    text: `Foute of ontbrekende SourceTag wordt afgewezen.`,
    icon: Fingerprint,
  },
  {
    title: "No Manual Rewards",
    status: "Safety",
    text: "Geen XP, badge of token eligibility zonder echte verification.",
    icon: Lock,
  },
  {
    title: "Legal Gate Later",
    status: "OTT",
    text: "OTT token airdrops pas na policy/legal check. Nu proof en eligibility.",
    icon: AlertTriangle,
  },
];

export function XrplVerifyTab() {
  const [txHash, setTxHash] = useState("");
  const [expectedAccount, setExpectedAccount] = useState("");
  const [expectedDestination, setExpectedDestination] = useState("");
  const [result, setResult] = useState<VerifyXrplTransactionResponse | null>(
    null
  );
  const [selectedStep, setSelectedStep] = useState<VerifyStep>(verifySteps[0]);
  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    buildMakeWavesStatusLine("source-tag-proof")
  );

  const SelectedStepIcon = selectedStep.icon;
  const makeWavesVerified = isMakeWavesTransactionVerified(result);

  async function handleVerify() {
    const cleanHash = txHash.trim();

    if (!cleanHash) {
      setStatusMessage("Vul eerst een XRPL transaction hash in.");
      return;
    }

    setBusy(true);
    setStatusMessage("Checking XRPL transaction...");

    try {
      const response = await verifyXrplTransaction({
        txHash: cleanHash,
        expectedAccount: expectedAccount.trim() || undefined,
        expectedDestination: expectedDestination.trim() || undefined,
      });

      setResult(response);
      setStatusMessage(getXrplVerificationLabel(response));
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
                XRPL Verify
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              Verify Ledger Proof Before Rewards
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              Plak een XRPL transaction hash en controleer of de transactie
              validated, successful en gekoppeld is aan Make Waves SourceTag{" "}
              {MAKE_WAVES_SOURCE_TAG}.
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
              <Target size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Verification Steps
              </p>
            </div>

            <div className="space-y-3">
              {verifySteps.map((step) => (
                <StepButton
                  key={step.title}
                  step={step}
                  active={selectedStep.title === step.title}
                  onClick={() => setSelectedStep(step)}
                />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-5">
              <p className="font-orbitron text-xs uppercase tracking-widest">
                Selected Step
              </p>

              <SelectedStepIcon size={18} className="text-white/60" />
            </div>

            <p className="font-orbitron text-xl font-black uppercase mb-2">
              {selectedStep.title}
            </p>

            <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-4">
              {selectedStep.status}
            </p>

            <p className="font-mono text-xs text-white/45 leading-relaxed">
              {selectedStep.text}
            </p>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <ShieldCheck size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Verify Rules
              </p>
            </div>

            <div className="space-y-3">
              {rules.map((rule) => (
                <RuleCard key={rule.title} rule={rule} />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-5 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <ScanLine size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Transaction Hash Check
              </p>
            </div>

            <InputField
              label="XRPL Transaction Hash"
              value={txHash}
              placeholder="64-character transaction hash"
              onChange={setTxHash}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <InputField
                label="Expected Account Optional"
                value={expectedAccount}
                placeholder="r..."
                onChange={setExpectedAccount}
              />

              <InputField
                label="Expected Destination Optional"
                value={expectedDestination}
                placeholder="r..."
                onChange={setExpectedDestination}
              />
            </div>

            <button
              onClick={handleVerify}
              disabled={busy}
              className="w-full bg-white text-black py-4 mt-5 font-orbitron text-xs font-black uppercase tracking-widest hover:bg-white/80 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
              Verify XRPL SourceTag {MAKE_WAVES_SOURCE_TAG}
            </button>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Activity size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Current Status
              </p>
            </div>

            <div className="border border-white/10 bg-black p-5 mb-4">
              <p className="font-mono text-xs text-white/50 leading-relaxed">
                {statusMessage}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <MiniStatus
                label="Make Waves"
                value={makeWavesVerified ? "Verified" : "Locked"}
              />

              <MiniStatus
                label="Tx Hash"
                value={shortTxHash(result?.txHash ?? txHash)}
              />
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Eye size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Ledger Result
              </p>
            </div>

            {result?.verified ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ResultLine label="Validated" value={String(result.verified.validated)} />
                <ResultLine label="Success" value={String(result.verified.success)} />
                <ResultLine label="Result" value={result.verified.transactionResult} />
                <ResultLine label="SourceTag" value={String(result.verified.sourceTag)} />
                <ResultLine label="Tag Match" value={String(result.verified.sourceTagMatches)} />
                <ResultLine label="Tx Type" value={result.verified.transactionType ?? "None"} />
                <ResultLine label="Account" value={result.verified.account ?? "None"} />
                <ResultLine label="Destination" value={result.verified.destination ?? "None"} />
              </div>
            ) : (
              <EmptyState text="Nog geen XRPL transaction verified." />
            )}
          </div>
        </div>

        <div className="col-span-12 xl:col-span-3 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Trophy size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Reward Gate
              </p>
            </div>

            <div className="border border-white/10 bg-black p-5 mb-4">
              <p className="font-orbitron text-2xl font-black uppercase mb-2">
                {makeWavesVerified ? "Open" : "Locked"}
              </p>

              <p className="font-mono text-xs text-white/40 leading-relaxed">
                Open alleen bij validated, tesSUCCESS en SourceTag{" "}
                {MAKE_WAVES_SOURCE_TAG}.
              </p>
            </div>

            <MiniStatus
              label="Ledger Index"
              value={String(result?.verified?.ledgerIndex ?? "None")}
            />
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Wallet size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Wallet Match
              </p>
            </div>

            {result?.verified ? (
              <div className="space-y-3">
                <ResultLine
                  label="Account Match"
                  value={String(result.verified.accountMatches)}
                />

                <ResultLine
                  label="Destination Match"
                  value={String(result.verified.destinationMatches)}
                />
              </div>
            ) : (
              <EmptyState text="Optionele wallet checks verschijnen hier." />
            )}
          </div>
        </div>

        <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <FeatureBox icon={Database} title="XRPL RPC" text="Backend check" />
          <FeatureBox icon={Fingerprint} title="SourceTag" text={`${MAKE_WAVES_SOURCE_TAG}`} />
          <FeatureBox icon={BadgeCheck} title="Reward" text="After proof" />
          <FeatureBox icon={AlertTriangle} title="No Manual XP" text="Verify first" />
        </div>
      </div>
    </div>
  );
}

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

  return "Unknown XRPL verification error.";
}

function MetricBox({ metric }: { metric: XrplVerifyMetric }) {
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

function StepButton({
  step,
  active,
  onClick,
}: {
  step: VerifyStep;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = step.icon;

  return (
    <button
      onClick={onClick}
      className={`w-full border p-4 text-left transition-all ${
        active
          ? "border-white/30 bg-white/[0.08]"
          : "border-white/10 bg-black hover:bg-white/[0.03]"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Icon size={16} className="text-white/60" />

          <p className="font-orbitron text-xs font-bold uppercase">
            {step.title}
          </p>
        </div>

        <p className="font-mono text-[10px] text-white/35 uppercase">
          {step.status}
        </p>
      </div>
    </button>
  );
}

function InputField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
        {label}
      </p>

      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-black border border-white/10 px-4 py-4 font-mono text-xs text-white/70 outline-none focus:border-white/30 placeholder:text-white/20"
      />
    </label>
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

function RuleCard({ rule }: { rule: VerifyRule }) {
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
