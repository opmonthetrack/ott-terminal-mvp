import { useMemo, useState } from "react";
import type { ElementType } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  ExternalLink,
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
  action?: string;
};

type Metric = {
  label: string;
  value: string;
  text: string;
  icon: ElementType;
};

const TERMINAL_URL = "https://ott-terminal-mvp.vercel.app";
const NEWS_API_URL = "https://ott-terminal-mvp.vercel.app/api/news";

const smokeTests: TestItem[] = [
  {
    id: "guest-flow",
    area: "Public",
    title: "Guest flow works without Xaman",
    expected:
      "Guest user can open Home, XRPL Intelligence, Newsroom, Xaman Activation, Academy and Access Gate without application errors.",
    risk: "New users hit a wallet wall before they understand the product.",
    action: "Open as guest → Home → XRPL Intelligence → Newsroom → Xaman Activation → Academy → Access Gate.",
  },
  {
    id: "home-access-model",
    area: "Landing",
    title: "Home explains the access model",
    expected:
      "Home clearly shows Free to Learn, Xaman to Prove and Pass to Unlock. Xaman is not required to start learning.",
    risk: "Users think the app is only for existing crypto users or only for paid access.",
    action: "Open Home → check the primary CTA cards and product structure copy.",
  },
  {
    id: "dashboard-intel",
    area: "Dashboard",
    title: "Daily Intelligence Snapshot loads",
    expected:
      "Dashboard shows top signal, live item count, SourceTag, source health, top buckets and quick actions to XRPL Intelligence / Newsroom / OTT Intelligence.",
    risk: "Dashboard fetch or navigation target is broken. Daily snapshot is not demo-ready.",
    action: "Open Dashboard → refresh snapshot → open top source → test quick actions.",
  },
  {
    id: "xrpl-intelligence",
    area: "Intel",
    title: "XRPL Intelligence live feed works",
    expected:
      "XRPL Intelligence opens, /api/news items appear, buckets work, selected item shows source, confidence, why it matters and Open Source works.",
    risk: "newsClient/API mismatch, empty feed or low-quality sources return to the UI.",
    action: "Open XRPL Intelligence → refresh → click bucket → open source.",
  },
  {
    id: "newsroom-social",
    area: "Social",
    title: "Newsroom drafts and buttons work",
    expected:
      "Newsroom shows X, LinkedIn, Instagram, Facebook, Medium, TikTok, WhatsApp and YouTube modes. Copy Output, Open Source and Open Platform work.",
    risk: "Beautiful UI without working sharing flow; user acquisition loses value.",
    action: "Open Newsroom → select item → select X/LinkedIn/WhatsApp/TikTok → copy → open platform.",
  },
  {
    id: "ott-intelligence",
    area: "AI Studio",
    title: "OTT Intelligence analysis works",
    expected:
      "OTT Intelligence loads /api/news and shows Builder Lens, Beginner Explain, Risk Context, Content Angle and Verify Checklist.",
    risk: "Analysis layer is empty or not connected to intelligence feed.",
    action: "Open OTT Intelligence → select item → test all analysis modes → copy analysis.",
  },
  {
    id: "xaman-activation",
    area: "Onboarding",
    title: "Xaman Activation guide is clear",
    expected:
      "Xaman Activation explains why activation is needed, self activation, existing-user support and OTT assisted activation coming soon without custody or broker claims.",
    risk: "New Dutch/non-technical users do not understand wallet activation.",
    action: "Open Xaman Activation → read the activation options and safety checklist.",
  },
  {
    id: "xaman-center",
    area: "Xaman",
    title: "Xaman Center connects/signs",
    expected:
      "Xaman Center opens, SourceTag route is visible, payload/deeplink/QR fallback works and wallet can return connected.",
    risk: "xamanClient or mobile session import breaks the proof route.",
    action: "Open Xaman Center → create payload → sign or verify connected wallet route.",
  },
  {
    id: "daily-checkin",
    area: "Proof",
    title: "Daily Check-In proof works",
    expected:
      "Create Xaman Proof Payload works, signed payload returns or verifies, SourceTag 2606170002 stays visible and no duplicate rewards are added.",
    risk: "api/ott action, xamanClient or MakeWaves action mismatch.",
    action: "Open Daily Check-In → create payload → sign in Xaman → return/verify.",
  },
  {
    id: "xp-credits",
    area: "Rewards",
    title: "XP and OTT Credits are credited",
    expected:
      "After a valid signed proof, Reward Ledger shows +10 XP and +1 OTT Credit for Daily Check-In, or the correct action-specific reward.",
    risk: "Pitch proof works but retention loop is invisible, making the demo weaker.",
    action: "After signing Daily Check-In → open Reward Ledger → confirm XP / OTT Credits / proof event.",
  },
  {
    id: "source-tag",
    area: "Proof",
    title: "SourceTag page loads",
    expected:
      "SourceTag page explains Make Waves identity, verification, support coming soon and SourceTag 2606170002 without active payment claims.",
    risk: "Old donation/payment wording or verifier confusion returns.",
    action: "Open SourceTag page → verify copy and optional tx hash flow if available.",
  },
  {
    id: "academy",
    area: "Education",
    title: "Academy deep catalog loads",
    expected:
      "Free modules, premium depth, AI agents route and Certificate NFT coming soon are visible and legal-safe.",
    risk: "Academy import/state breaks or premium language overpromises.",
    action: "Open Academy → switch free/premium/certificate views.",
  },
  {
    id: "access-gate",
    area: "Access",
    title: "Access Gate payment and scanner flow loads",
    expected:
      "Access Gate shows free public access, Xaman onboarding, the active 1.589 XRP service-payment page, manual founder delivery and the NFT scanner. No automatic mint or unlock runs after payment.",
    risk: "Payment, manual NFT delivery and scanner copy become inconsistent or non-Xaman users feel blocked.",
    action: "Open Access Gate as guest and connected wallet → confirm payment, delivery and scanner copy.",
  },
  {
    id: "pitch-mode",
    area: "Demo",
    title: "Pitch Mode works",
    expected:
      "2-minute Make Waves demo script opens, steps work and Copy Full Script works.",
    risk: "PitchModeTab import, icon or clipboard issue.",
    action: "Show Founder / Labs → Pitch Mode → run script steps → copy full script.",
  },
  {
    id: "submission-pack",
    area: "Submission",
    title: "Submission Pack works",
    expected:
      "Make Waves checklist, copy blocks, launch X post, LinkedIn post, WhatsApp status, TikTok hook, XRPL invite and red flag avoidance are visible.",
    risk: "User acquisition copy is not ready for launch week.",
    action: "Open Submission Pack → copy Launch X Post, LinkedIn Post, WhatsApp Status and XRPL Community Invite.",
  },
  {
    id: "founder-labs",
    area: "Founder",
    title: "Founder tools stay behind Labs",
    expected:
      "Pitch Mode, Submission Pack and Smoke Test are hidden from normal users and visible after Show Founder / Labs.",
    risk: "Normal users see internal QA/pitch tools and the app feels unfinished.",
    action: "Reload app → confirm hidden → click Show Founder / Labs → confirm visible.",
  },
  {
    id: "legal-safe",
    area: "Legal",
    title: "Legal and coming-soon boundaries are clear",
    expected:
      "Certificate NFT, XRP/RLUSD support, donations and Web2 license are clearly future/coming soon. The active Access Pass payment is presented only as a utility service payment with manual NFT delivery, never as an investment product.",
    risk: "Jury/user thinks there is active brokerage, yield, token value promise, paid minting or financial advice.",
    action: "Read Home, SourceTag, Academy, Access Gate, Submission Pack and Newsroom copy for hype/legal issues.",
  },
];

const quickRouteSteps = [
  "Home → explain Free to Learn / Xaman to Prove / Pass to Unlock",
  "XRPL Intelligence → refresh feed → open source",
  "Newsroom → select item → copy social draft → open platform",
  "OTT Intelligence → analysis mode → copy analysis",
  "Xaman Activation → explain wallet onboarding for new users",
  "Daily Check-In → create proof → sign in Xaman → return/verify",
  "Reward Ledger → confirm XP / OTT Credits",
  "Access Gate → 1.589 XRP service payment + manual NFT delivery + scanner unlock",
  "Pitch Mode → 2-minute demo",
  "Submission Pack → launch promo copy",
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

  const readiness = Math.round((counts.pass / counts.total) * 100);

  const metrics: Metric[] = [
    {
      label: "Build State",
      value: buildState,
      text: "Manual QA state.",
      icon: buildState === "Ready" ? ShieldCheck : AlertTriangle,
    },
    {
      label: "Readiness",
      value: `${readiness}%`,
      text: `${counts.pass}/${counts.total} passed.`,
      icon: CheckCircle2,
    },
    {
      label: "Failed",
      value: String(counts.fail),
      text: "Fix red only.",
      icon: XCircle,
    },
    {
      label: "SourceTag",
      value: String(MAKE_WAVES_SOURCE_TAG),
      text: "Must match live.",
      icon: Fingerprint,
    },
  ];

  const reportText = useMemo(() => {
    const lines = smokeTests.map((test, index) => {
      const status = statuses[test.id].toUpperCase();

      return `${index + 1}. ${status} — ${test.area} — ${test.title}\nExpected: ${test.expected}\nAction: ${test.action ?? "Manual check."}`;
    });

    return [
      "XRPL OnTheTrack Terminal — Make Waves Final QA Report",
      `Wallet: ${walletAddress}`,
      `SourceTag: ${MAKE_WAVES_SOURCE_TAG}`,
      `Readiness: ${readiness}%`,
      `Passed: ${counts.pass}/${counts.total}`,
      `Failed: ${counts.fail}`,
      `Todo: ${counts.todo}`,
      "",
      "Final demo route:",
      ...quickRouteSteps.map((step, index) => `${index + 1}. ${step}`),
      "",
      "Checks:",
      ...lines,
      "",
      "Launch guardrails: education only, no custody, no broker, no yield, no trade execution, no token value promise, no financial advice, human review before posting.",
    ].join("\n");
  }, [counts, readiness, statuses, walletAddress]);

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
        <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_top_right,_#3898E8,_transparent_34%),radial-gradient(circle_at_bottom_left,_#C83888,_transparent_32%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="flex items-center gap-2 mb-4 text-black/55">
              <ListChecks size={18} />

              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                Final QA / Pitch / Launch Readiness
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              Make Waves Smoke Test
            </h2>

            <p className="font-mono text-sm text-black/55 max-w-3xl leading-relaxed">
              Gebruik deze tab vlak vóór demo-opname, pitch en promotieposts. Test de live route:
              public onboarding → intelligence → social output → Xaman proof → XP/Credits → access model → submission copy.
              Markeer pass/fail en fix alleen rode punten.
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
          <Panel title="Demo Order" icon={PlayCircle}>
            <div className="space-y-3">
              {quickRouteSteps.map((step, index) => (
                <StepLine key={step} number={String(index + 1).padStart(2, "0")} text={step} />
              ))}
            </div>
          </Panel>

          <Panel title="Report" icon={Copy}>
            <button
              onClick={copyReport}
              className="w-full bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] text-white p-4 text-left hover:brightness-95 transition-all mb-3"
            >
              <p className="font-orbitron text-xs font-black uppercase mb-2">
                {copied ? "Copied" : "Copy QA Report"}
              </p>

              <p className="font-mono text-[10px] text-white/75 uppercase">
                Use before deploy / demo / social
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
          </Panel>

          <Panel title="Go / No-Go" icon={Sparkles}>
            <div className="border border-black/10 bg-[#F7F8FC] p-4">
              <p className="font-mono text-xs text-black/55 leading-relaxed">
                {counts.fail > 0
                  ? "No-Go: fix failed items first. Touch only the file causing the red result."
                  : counts.todo > 0
                    ? "Testing: finish all todo checks before recording, pitching or posting."
                    : "Go: app is ready for demo recording, pitch and launch promotion posts."}
              </p>
            </div>
          </Panel>

          <Panel title="Final Legal / Social Check" icon={ShieldCheck}>
            <div className="space-y-3">
              <StepLine number="A" text="No custody, no broker, no yield, no trade execution." />
              <StepLine number="B" text="XP and OTT Credits are internal progress/utility signals." />
              <StepLine number="C" text="No token value, conversion, profit or adoption promise." />
              <StepLine number="D" text="Certificate NFT, Web2 license and XRP/RLUSD support are coming soon only." />
              <StepLine number="E" text="Newsroom and promo drafts need human review before posting." />
            </div>
          </Panel>

          <Panel title="Live URLs" icon={ExternalLink}>
            <div className="space-y-3">
              <UrlLine label="Terminal" url={TERMINAL_URL} />
              <UrlLine label="News API" url={NEWS_API_URL} />
            </div>
          </Panel>
        </div>
      </div>
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
    <div className="border border-black/10 bg-white p-6">
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
            ? "border-[#D84858]/30 bg-[#D84858]/10"
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

          {test.action && (
            <div className="border border-black/10 bg-white p-3 mb-3">
              <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">
                Action
              </p>

              <p className="font-mono text-xs text-black/55 leading-relaxed">
                {test.action}
              </p>
            </div>
          )}

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
      className="border border-black/10 bg-white p-3 text-center hover:bg-[#F7F8FC] transition-all"
    >
      <p className="font-mono text-[10px] uppercase text-black/55">{label}</p>
    </button>
  );
}

function StepLine({ number, text }: { number: string; text: string }) {
  return (
    <div className="flex items-start gap-3 border border-black/10 bg-[#F7F8FC] p-3">
      <p className="font-orbitron text-xs font-black text-[#C83888] shrink-0">
        {number}
      </p>

      <p className="font-mono text-xs text-black/55 leading-relaxed">{text}</p>
    </div>
  );
}

function UrlLine({ label, url }: { label: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-between gap-3 border border-black/10 bg-[#F7F8FC] p-3 hover:bg-white transition-all"
    >
      <div>
        <p className="font-orbitron text-[10px] font-bold uppercase mb-1">
          {label}
        </p>

        <p className="font-mono text-[10px] text-black/35 break-all">{url}</p>
      </div>

      <ExternalLink size={15} className="text-[#3898E8] shrink-0" />
    </a>
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
