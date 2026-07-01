import { useMemo, useState } from "react";
import type { ElementType } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  Fingerprint,
  ListChecks,
  PlayCircle,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import { MAKE_WAVES_SOURCE_TAG } from "../lib/makeWaves";

type SmokeTestTabProps = {
  walletAddress?: string;
};

type TestStatus = "todo" | "pass" | "fail";

type TestItem = {
  id: string;
  area: string;
  title: string;
  expected: string;
  risk: string;
};

type Metric = {
  label: string;
  value: string;
  text: string;
  icon: ElementType;
};

const smokeTests: TestItem[] = [
  {
    id: "dashboard",
    area: "Core",
    title: "Dashboard loads",
    expected: "Dashboard opent zonder blanco scherm en toont SourceTag / XP overview.",
    risk: "Import fout of Reward Store fout.",
  },
  {
    id: "daily-checkin",
    area: "Xaman",
    title: "Daily Check-In loads",
    expected: "Tab opent en Create Xaman Payload knop is zichtbaar.",
    risk: "xamanClient import of api/ott route fout.",
  },
  {
    id: "xaman-center",
    area: "Xaman",
    title: "Xaman Center loads",
    expected: "Xaman Center opent en SourceTag 2606170002 wordt getoond.",
    risk: "Verkeerde export uit xamanClient.ts.",
  },
  {
    id: "xrpl-verify",
    area: "XRPL",
    title: "XRPL Verify loads",
    expected: "Tx hash input en verification knop zijn zichtbaar.",
    risk: "xrplClient import of type fout.",
  },
  {
    id: "partner-hub",
    area: "Partner",
    title: "Partner Hub loads",
    expected: "Partner cards, education checks en Proof Stamp flow zijn zichtbaar.",
    risk: "partnerCatalog, proofStampClient of rewardStore fout.",
  },
  {
    id: "truth-desk",
    area: "Service",
    title: "Truth Desk loads",
    expected: "Ask Truth en 1-on-1 routes zijn zichtbaar.",
    risk: "truthDeskClient of truthDeskVerifyClient fout.",
  },
  {
    id: "access-gate",
    area: "Access",
    title: "Access Gate loads",
    expected: "Banxa, XRP, RLUSD en NFT access routes zijn zichtbaar.",
    risk: "accessStore of accessClient fout.",
  },
  {
    id: "reward-ledger",
    area: "Rewards",
    title: "Reward Ledger loads",
    expected: "Local XP events en legal lock status zijn zichtbaar.",
    risk: "Reward event type mismatch.",
  },
  {
    id: "pitch-mode",
    area: "Demo",
    title: "Pitch Mode loads",
    expected: "2-minute pitch steps zijn zichtbaar.",
    risk: "App import of tab type fout.",
  },
  {
    id: "submission-pack",
    area: "Submission",
    title: "Submission Pack loads",
    expected: "Checklist, copy blocks en demo order zijn zichtbaar.",
    risk: "App import of lucide unused/missing icon fout.",
  },
];

export function SmokeTestTab({ walletAddress = "guest" }: SmokeTestTabProps) {
  const [statuses, setStatuses] = useState<Record<string, TestStatus>>(() =>
    smokeTests.reduce<Record<string, TestStatus>>((accumulator, test) => {
      accumulator[test.id] = "todo";
      return accumulator;
    }, {})
  );
  const [copied, setCopied] = useState(false);

  const counts = useMemo(() => {
    const values = Object.values(statuses);

    return {
      total: smokeTests.length,
      pass: values.filter((status) => status === "pass").length,
      fail: values.filter((status) => status === "fail").length,
      todo: values.filter((status) => status === "todo").length,
    };
  }, [statuses]);

  const buildState =
    counts.fail > 0 ? "Needs Fix" : counts.todo > 0 ? "Testing" : "Ready";

  const metrics: Metric[] = [
    {
      label: "Build State",
      value: buildState,
      text: "Smoke test.",
      icon: buildState === "Ready" ? ShieldCheck : AlertTriangle,
    },
    {
      label: "Passed",
      value: `${counts.pass}/${counts.total}`,
      text: "Manual checks.",
      icon: CheckCircle2,
    },
    {
      label: "Failed",
      value: String(counts.fail),
      text: "Needs red fix.",
      icon: XCircle,
    },
    {
      label: "SourceTag",
      value: String(MAKE_WAVES_SOURCE_TAG),
      text: "Must match.",
      icon: Fingerprint,
    },
  ];

  const reportText = useMemo(() => {
    const lines = smokeTests.map((test) => {
      const status = statuses[test.id].toUpperCase();

      return `${status} — ${test.title}: ${test.expected}`;
    });

    return [
      "XRPL OnTheTrack Terminal — Smoke Test Report",
      `Wallet: ${walletAddress}`,
      `SourceTag: ${MAKE_WAVES_SOURCE_TAG}`,
      `Passed: ${counts.pass}/${counts.total}`,
      `Failed: ${counts.fail}`,
      `Todo: ${counts.todo}`,
      "",
      ...lines,
    ].join("\n");
  }, [counts, statuses, walletAddress]);

  function setStatus(testId: string, status: TestStatus) {
    setStatuses((current) => ({
      ...current,
      [testId]: status,
    }));
  }

  function resetTests() {
    setStatuses(
      smokeTests.reduce<Record<string, TestStatus>>((accumulator, test) => {
        accumulator[test.id] = "todo";
        return accumulator;
      }, {})
    );
    setCopied(false);
  }

  async function copyReport() {
    await navigator.clipboard.writeText(reportText);
    setCopied(true);

    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 mb-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="flex items-center gap-2 mb-4 text-white/45">
              <ListChecks size={18} />

              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                Smoke Test
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              Final App Function Check
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              Gebruik deze tab vóór UI polish. Klik elke hoofdtab in de app,
              markeer pass/fail en fix eerst rode meldingen voordat we design
              gaan doen.
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
        <div className="col-span-12 xl:col-span-8">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <ClipboardCheck size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Manual Test Checklist
              </p>
            </div>

            <div className="space-y-3">
              {smokeTests.map((test) => (
                <TestCard
                  key={test.id}
                  test={test}
                  status={statuses[test.id]}
                  onPass={() => setStatus(test.id, "pass")}
                  onFail={() => setStatus(test.id, "fail")}
                  onReset={() => setStatus(test.id, "todo")}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-4 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <PlayCircle size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Test Order
              </p>
            </div>

            <div className="space-y-3">
              <StepLine number="01" text="Open each tab from sidebar." />
              <StepLine number="02" text="Check blank screen or red console." />
              <StepLine number="03" text="Create payload only where safe." />
              <StepLine number="04" text="Verify SourceTag stays 2606170002." />
              <StepLine number="05" text="Mark each item pass/fail." />
              <StepLine number="06" text="Copy report after full check." />
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Copy size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Report
              </p>
            </div>

            <button
              onClick={copyReport}
              className="w-full bg-white text-black p-4 text-left hover:bg-white/80 transition-all mb-3"
            >
              <p className="font-orbitron text-xs font-black uppercase mb-2">
                {copied ? "Copied" : "Copy Test Report"}
              </p>

              <p className="font-mono text-[10px] text-black/55 uppercase">
                Share result before UI polish
              </p>
            </button>

            <button
              onClick={resetTests}
              className="w-full border border-white/10 bg-black p-4 text-left hover:bg-white/[0.03] transition-all"
            >
              <RotateCcw size={18} className="text-white/60 mb-3" />

              <p className="font-orbitron text-xs font-bold uppercase mb-2">
                Reset Checklist
              </p>

              <p className="font-mono text-[10px] text-white/35 uppercase">
                Start smoke test again
              </p>
            </button>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Go / No-Go
              </p>
            </div>

            <div className="border border-white/10 bg-black p-4">
              <p className="font-mono text-xs text-white/45 leading-relaxed">
                {counts.fail > 0
                  ? "No-Go: fix failed items first."
                  : counts.todo > 0
                    ? "Testing: finish all todo checks."
                    : "Go: app is ready for UI polish and demo recording."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TestCard({
  test,
  status,
  onPass,
  onFail,
  onReset,
}: {
  test: TestItem;
  status: TestStatus;
  onPass: () => void;
  onFail: () => void;
  onReset: () => void;
}) {
  return (
    <div
      className={`border p-5 transition-all ${
        status === "pass"
          ? "border-white/25 bg-white/[0.06]"
          : status === "fail"
            ? "border-white/25 bg-white/[0.03]"
            : "border-white/10 bg-black"
      }`}
    >
      <div className="grid grid-cols-12 gap-4 items-start">
        <div className="col-span-12 xl:col-span-8">
          <div className="flex items-center gap-2 mb-3">
            <StatusIcon status={status} />

            <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.25em]">
              {test.area}
            </p>
          </div>

          <h3 className="font-orbitron text-sm font-black uppercase mb-3">
            {test.title}
          </h3>

          <p className="font-mono text-xs text-white/50 leading-relaxed mb-3">
            {test.expected}
          </p>

          <div className="border border-white/10 bg-white/[0.02] p-3">
            <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-2">
              Risk if red
            </p>

            <p className="font-mono text-xs text-white/45 leading-relaxed">
              {test.risk}
            </p>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-4 grid grid-cols-3 gap-2">
          <SmallButton label="Pass" onClick={onPass} />
          <SmallButton label="Fail" onClick={onFail} />
          <SmallButton label="Todo" onClick={onReset} />
        </div>
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: TestStatus }) {
  if (status === "pass") {
    return <CheckCircle2 size={16} className="text-white/70" />;
  }

  if (status === "fail") {
    return <XCircle size={16} className="text-white/70" />;
  }

  return <BadgeCheck size={16} className="text-white/25" />;
}

function SmallButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="border border-white/10 bg-black p-3 text-center hover:bg-white/[0.04] transition-all"
    >
      <p className="font-mono text-[10px] uppercase text-white/45">{label}</p>
    </button>
  );
}

function StepLine({ number, text }: { number: string; text: string }) {
  return (
    <div className="flex items-start gap-3 border border-white/10 bg-black p-3">
      <p className="font-orbitron text-xs font-black text-white/40">
        {number}
      </p>

      <p className="font-mono text-xs text-white/45 leading-relaxed">{text}</p>
    </div>
  );
}

function MetricBox({ metric }: { metric: Metric }) {
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
