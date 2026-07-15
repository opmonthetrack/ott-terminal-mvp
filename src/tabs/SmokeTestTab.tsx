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
    id: "home",
    area: "Landing",
    title: "Home social landing loads",
    expected: "Home opent, toont Make Waves, SourceTag 2606170002 en CTA's naar Xaman, Daily Proof, Academy en Support.",
    risk: "onNavigate target fout of import fout in TerminalHomeTab.",
  },
  {
    id: "xaman-center",
    area: "Xaman",
    title: "Xaman Center connects",
    expected: "Xaman Center opent, SourceTag route is zichtbaar, payload/deeplink/QR fallback blijft werken.",
    risk: "xamanClient of mobile session import fout.",
  },
  {
    id: "daily-checkin",
    area: "Proof",
    title: "Daily Check-In proof works",
    expected: "Create Xaman Proof Payload werkt, signed payload kan worden verified en SourceTag 2606170002 blijft zichtbaar.",
    risk: "api/ott action, xamanClient of MakeWaves action mismatch.",
  },
  {
    id: "reward-ledger",
    area: "Rewards",
    title: "Reward Ledger records proof",
    expected: "XP, OTT Credits, SourceTag en tx-linked proof events zijn zichtbaar na verified action.",
    risk: "rewardStore type mismatch of local storage wallet mismatch.",
  },
  {
    id: "source-tag",
    area: "Proof",
    title: "SourceTag Support page loads",
    expected: "SourceTag verifier, support coming soon, XRP/RLUSD concept en memo awareness zijn zichtbaar.",
    risk: "SourceTagMonitorTab import of XRPL websocket verifier fout.",
  },
  {
    id: "academy",
    area: "Education",
    title: "Academy deep catalog loads",
    expected: "Free modules, premium depth, AI agents route en Certificate NFT coming soon zijn zichtbaar.",
    risk: "Academy state/import fout of te zware component render.",
  },
  {
    id: "access-gate",
    area: "Access",
    title: "Access Gate scanner-only loads",
    expected: "Access Gate opent als scanner-only utility pass check. Geen mint, payment, claim of XRP move actief.",
    risk: "accessStore/accessNftPass import fout of oude payment copy teruggekomen.",
  },
  {
    id: "pitch-mode",
    area: "Demo",
    title: "Pitch Mode works",
    expected: "2-minute Make Waves demo script opent, steps werken en Copy Full Script werkt.",
    risk: "PitchModeTab import, icon of clipboard issue.",
  },
  {
    id: "submission-pack",
    area: "Submission",
    title: "Submission Pack works",
    expected: "Make Waves checklist, copy blocks, demo order and red flag avoidance zijn zichtbaar.",
    risk: "SubmissionPackTab import, unused icon or clipboard issue.",
  },
  {
    id: "legal-safe",
    area: "Legal",
    title: "Coming-soon boundaries are clear",
    expected: "Certificate NFT, XRP/RLUSD support, donations and payments staan als future/concept, niet als actieve flow.",
    risk: "Jury/user denkt dat er actieve payment, mint, yield or token promise is.",
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
      "XRPL OnTheTrack Terminal — Make Waves Final QA Report",
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
    <div className="min-h-screen bg-white text-[#080808]">
      <div className="relative overflow-hidden border border-black/10 bg-white p-6 mb-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="flex items-center gap-2 mb-4 text-black/55">
              <ListChecks size={18} />

              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                Smoke Test
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              Make Waves Final QA Check
            </h2>

            <p className="font-mono text-sm text-black/55 max-w-3xl leading-relaxed">
              Gebruik deze tab vlak vóór deploy, demo-opname en social posts. Klik de live
              Make Waves route door, markeer pass/fail en fix alleen rode punten voordat je publiceert.
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
          <div className="border border-black/10 bg-white p-6">
            <div className="flex items-center gap-2 mb-5">
              <ClipboardCheck size={18} className="text-[#3898E8]" />

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
          <div className="border border-black/10 bg-white p-6">
            <div className="flex items-center gap-2 mb-5">
              <PlayCircle size={18} className="text-[#3898E8]" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Test Order
              </p>
            </div>

            <div className="space-y-3">
              <StepLine number="01" text="Home → Xaman → Daily Proof." />
              <StepLine number="02" text="Verify XP/Credits in Reward Ledger." />
              <StepLine number="03" text="Check SourceTag Support page." />
              <StepLine number="04" text="Check Academy + Access Gate." />
              <StepLine number="05" text="Check Pitch + Submission screens." />
              <StepLine number="06" text="Check legal-safe coming-soon copy." />
              <StepLine number="07" text="Copy report after all items pass." />
            </div>
          </div>

          <div className="border border-black/10 bg-white p-6">
            <div className="flex items-center gap-2 mb-5">
              <Copy size={18} className="text-[#3898E8]" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Report
              </p>
            </div>

            <button
              onClick={copyReport}
              className="w-full bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] text-white p-4 text-left hover:brightness-95 transition-all mb-3"
            >
              <p className="font-orbitron text-xs font-black uppercase mb-2">
                {copied ? "Copied" : "Copy Test Report"}
              </p>

              <p className="font-mono text-[10px] text-white/75 uppercase">
                Share before deploy/social
              </p>
            </button>

            <button
              onClick={resetTests}
              className="w-full border border-black/10 bg-[#F7F8FC] p-4 text-left hover:bg-[#D84858]/10 transition-all"
            >
              <RotateCcw size={18} className="text-[#3898E8] mb-3" />

              <p className="font-orbitron text-xs font-bold uppercase mb-2">
                Reset Checklist
              </p>

              <p className="font-mono text-[10px] text-black/35 uppercase">
                Start smoke test again
              </p>
            </button>
          </div>

          <div className="border border-black/10 bg-white p-6">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={18} className="text-[#3898E8]" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Go / No-Go
              </p>
            </div>

            <div className="border border-black/10 bg-[#F7F8FC] p-4">
              <p className="font-mono text-xs text-black/55 leading-relaxed">
                {counts.fail > 0
                  ? "No-Go: fix failed items first."
                  : counts.todo > 0
                    ? "Testing: finish all todo checks."
                    : "Go: app is ready for deploy, demo recording and social posts."}
              </p>
            </div>
          </div>

          <div className="border border-black/10 bg-white p-6">
            <div className="flex items-center gap-2 mb-5">
              <ShieldCheck size={18} className="text-[#C83888]" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Final Legal / Social Check
              </p>
            </div>

            <div className="space-y-3">
              <StepLine number="A" text="No custody, no broker, no yield, no trade execution." />
              <StepLine number="B" text="XP and OTT Credits are internal progress/utility signals." />
              <StepLine number="C" text="No token value, conversion or profit promise." />
              <StepLine number="D" text="Certificate NFT and XRP/RLUSD support are coming soon only." />
              <StepLine number="E" text="Support is voluntary and not guaranteed reward." />
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
          ? "border-[#3898E8]/30 bg-[#3898E8]/10"
          : status === "fail"
            ? "border-[#3898E8]/30 bg-[#D84858]/10"
            : "border-black/10 bg-[#F7F8FC]"
      }`}
    >
      <div className="grid grid-cols-12 gap-4 items-start">
        <div className="col-span-12 xl:col-span-8">
          <div className="flex items-center gap-2 mb-3">
            <StatusIcon status={status} />

            <p className="font-mono text-[10px] text-black/35 uppercase tracking-[0.25em]">
              {test.area}
            </p>
          </div>

          <h3 className="font-orbitron text-sm font-black uppercase mb-3">
            {test.title}
          </h3>

          <p className="font-mono text-xs text-black/55 leading-relaxed mb-3">
            {test.expected}
          </p>

          <div className="border border-black/10 bg-white p-3">
            <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">
              Risk if red
            </p>

            <p className="font-mono text-xs text-black/55 leading-relaxed">
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
    return <CheckCircle2 size={16} className="text-[#3898E8]" />;
  }

  if (status === "fail") {
    return <XCircle size={16} className="text-[#D84858]" />;
  }

  return <BadgeCheck size={16} className="text-black/25" />;
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
      className="border border-black/10 bg-[#F7F8FC] p-3 text-center hover:bg-white transition-all"
    >
      <p className="font-mono text-[10px] uppercase text-black/55">{label}</p>
    </button>
  );
}

function StepLine({ number, text }: { number: string; text: string }) {
  return (
    <div className="flex items-start gap-3 border border-black/10 bg-[#F7F8FC] p-3">
      <p className="font-orbitron text-xs font-black text-[#C83888]">
        {number}
      </p>

      <p className="font-mono text-xs text-black/55 leading-relaxed">{text}</p>
    </div>
  );
}

function MetricBox({ metric }: { metric: Metric }) {
  const Icon = metric.icon;

  return (
    <div className="border border-black/10 bg-[#F7F8FC]/60 p-4">
      <Icon size={18} className="text-[#3898E8] mb-3" />

      <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">
        {metric.label}
      </p>

      <p className="font-orbitron text-sm font-black uppercase mb-1 break-all">
        {metric.value}
      </p>

      <p className="font-mono text-[10px] text-black/35 uppercase">
        {metric.text}
      </p>
    </div>
  );
}
