import { useState } from "react";
import type { ElementType } from "react";
import {
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Eye,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Mic2,
  PlayCircle,
  Presentation,
  Radio,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  Users,
  Wallet,
  Waves,
  Zap,
} from "lucide-react";

type DemoSection = {
  id: string;
  title: string;
  time: string;
  status: string;
  text: string;
  icon: ElementType;
};

type ScriptLine = {
  title: string;
  time: string;
  line: string;
};

type DemoRule = {
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

const sections: DemoSection[] = [
  {
    id: "open",
    title: "Opening",
    time: "0:00 - 0:15",
    status: "Hook",
    text: "Start met het probleem: XRPL is krachtig, maar voor nieuwe gebruikers voelt het verspreid en technisch.",
    icon: Mic2,
  },
  {
    id: "dashboard",
    title: "Dashboard",
    time: "0:15 - 0:35",
    status: "Product",
    text: "Laat zien dat OTT Terminal één home screen maakt voor wallet, learning, safety, DeFi en intelligence.",
    icon: LayoutDashboard,
  },
  {
    id: "checkin",
    title: "Daily Check-In",
    time: "0:35 - 0:55",
    status: "Retention",
    text: "Toon de dagelijkse user loop met XP, streaks en Make Waves activiteit.",
    icon: Zap,
  },
  {
    id: "source",
    title: "Source Tag 2606",
    time: "0:55 - 1:15",
    status: "Proof",
    text: "Leg uit hoe source tag 2606 later helpt om echte activiteit en transacties te meten.",
    icon: Waves,
  },
  {
    id: "modules",
    title: "Platform Modules",
    time: "1:15 - 1:40",
    status: "Scale",
    text: "Klik snel door Wallet, Academy, DeFi, AI, Marketplace, Token Factory en Ledger Intel.",
    icon: Presentation,
  },
  {
    id: "close",
    title: "Closing Ask",
    time: "1:40 - 2:00",
    status: "Pitch",
    text: "Sluit af met roadmap: Xaman backend, mainnet proof, active users en XRPL community growth.",
    icon: Rocket,
  },
];

const scriptLines: ScriptLine[] = [
  {
    title: "Opening Hook",
    time: "0:00",
    line: "XRPL has powerful tools, but new users still need one clear home screen to learn, act and stay safe.",
  },
  {
    title: "Product Line",
    time: "0:15",
    line: "OTT Terminal brings wallet, education, safety, DeFi, marketplace, AI and ledger intelligence into one xApp-style interface.",
  },
  {
    title: "Retention Line",
    time: "0:35",
    line: "The Daily Check-In creates a simple reason to return every day: XP, streaks, missions and user activation.",
  },
  {
    title: "2606 Line",
    time: "0:55",
    line: "For Make Waves we use source tag 2606 as the tracking layer for future mainnet proof and active user activity.",
  },
  {
    title: "Safety Line",
    time: "1:15",
    line: "The terminal never asks for seed phrases or private keys. Real actions later happen through secure Xaman confirmation.",
  },
  {
    title: "Closing Line",
    time: "1:40",
    line: "The next step is connecting safe backend payloads, live XRPL data and a clear demo path for real users.",
  },
];

const demoRules: DemoRule[] = [
  {
    title: "Keep It Moving",
    status: "Timing",
    text: "Blijf binnen 2 minuten. Klik alleen de belangrijkste schermen open.",
    icon: Timer,
  },
  {
    title: "Show Product First",
    status: "Demo",
    text: "Laat werkende UI zien voordat je diep uitlegt. Eerst zien, daarna begrijpen.",
    icon: Eye,
  },
  {
    title: "Safety Message",
    status: "Trust",
    text: "Benoem duidelijk: no seed phrase, no private keys, Xaman confirmation later.",
    icon: ShieldCheck,
  },
  {
    title: "End With Roadmap",
    status: "Ask",
    text: "Sluit af met wat je nodig hebt: users, feedback, partners en mainnet validation.",
    icon: Target,
  },
];

const checklist = [
  "Open app in debug mode",
  "Click Dashboard",
  "Click Daily Check-In",
  "Click Source Tag",
  "Click Wallet Safety",
  "Click Academy or AI Hub",
  "Click Launch Control",
  "End with roadmap",
];

export function DemoScriptTab() {
  const [selectedSection, setSelectedSection] = useState<DemoSection>(
    sections[0]
  );
  const [selectedLine, setSelectedLine] = useState<ScriptLine>(scriptLines[0]);

  const SelectedSectionIcon = selectedSection.icon;

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 mb-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="flex items-center gap-2 mb-4 text-white/45">
              <PlayCircle size={17} />

              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                Demo Script
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              Two Minute Make Waves Pitch
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              De demo-script laag van OTT Terminal. Gebruik dit scherm om jouw
              2 minuten pitch strak te houden: opening, dashboard, check-in,
              source tag 2606, modules, safety en closing ask.
            </p>
          </div>

          <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-3">
            <StatBox icon={Clock} label="Length" value="2 Min" />
            <StatBox icon={Waves} label="Source Tag" value="2606" />
            <StatBox icon={Users} label="Focus" value="Users" />
            <StatBox icon={Radio} label="Mode" value="Demo" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-4 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Presentation size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Demo Timeline
              </p>
            </div>

            <div className="space-y-3">
              {sections.map((section) => (
                <SectionButton
                  key={section.id}
                  section={section}
                  active={selectedSection.id === section.id}
                  onClick={() => setSelectedSection(section)}
                />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <ClipboardCheck size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Click Checklist
              </p>
            </div>

            <div className="space-y-3">
              {checklist.map((item) => (
                <ChecklistLine key={item} label={item} />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-5 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Selected Section
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  {selectedSection.title}
                </h3>
              </div>

              <SelectedSectionIcon size={22} className="text-white/60" />
            </div>

            <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-4">
              {selectedSection.time} • {selectedSection.status}
            </p>

            <p className="font-mono text-sm text-white/45 leading-relaxed">
              {selectedSection.text}
            </p>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Script Lines
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  Read This Out Loud
                </h3>
              </div>

              <MessageSquare size={20} className="text-white/60" />
            </div>

            <div className="space-y-3">
              {scriptLines.map((line) => (
                <ScriptRow
                  key={line.title}
                  line={line}
                  active={selectedLine.title === line.title}
                  onClick={() => setSelectedLine(line)}
                />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Mic2 size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Selected Line
              </p>
            </div>

            <p className="font-orbitron text-2xl font-black uppercase mb-2">
              {selectedLine.title}
            </p>

            <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-4">
              Start at {selectedLine.time}
            </p>

            <div className="border border-white/10 bg-black p-5">
              <p className="font-mono text-sm text-white/60 leading-relaxed">
                “{selectedLine.line}”
              </p>
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-3 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <ShieldCheck size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Demo Rules
              </p>
            </div>

            <div className="space-y-3">
              {demoRules.map((rule) => (
                <RuleCard key={rule.title} rule={rule} />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Final Close
              </p>
            </div>

            <div className="border border-white/10 bg-black p-5">
              <p className="font-mono text-xs text-white/45 leading-relaxed">
                OTT Terminal is the home screen for XRPL users: learn, connect,
                stay safe, discover tools and create daily activity through
                source tag 2606.
              </p>
            </div>
          </div>
        </div>

        <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <FeatureBox icon={Wallet} title="Wallet" text="Safety first" />
          <FeatureBox icon={Waves} title="2606" text="Make Waves proof" />
          <FeatureBox icon={Rocket} title="Pitch" text="2 minute demo" />
          <FeatureBox icon={FileText} title="Script" text="Ready to read" />
        </div>
      </div>
    </div>
  );
}

function StatBox({
  icon: Icon,
  label,
  value,
}: {
  icon: ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="border border-white/10 bg-black/60 p-4">
      <Icon size={18} className="text-white/60 mb-3" />

      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
        {label}
      </p>

      <p className="font-orbitron text-sm font-black uppercase">{value}</p>
    </div>
  );
}

function SectionButton({
  section,
  active,
  onClick,
}: {
  section: DemoSection;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = section.icon;

  return (
    <button
      onClick={onClick}
      className={`w-full border p-4 text-left transition-all ${
        active
          ? "border-white/30 bg-white/[0.08]"
          : "border-white/10 bg-black hover:bg-white/[0.03]"
      }`}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          <Icon size={16} className="text-white/60" />

          <p className="font-orbitron text-xs font-bold uppercase">
            {section.title}
          </p>
        </div>

        <p className="font-mono text-[10px] text-white/35 uppercase">
          {section.status}
        </p>
      </div>

      <p className="font-mono text-[10px] text-white/35 uppercase">
        {section.time}
      </p>
    </button>
  );
}

function ChecklistLine({ label }: { label: string }) {
  return (
    <div className="border border-white/10 bg-black p-3 flex items-center gap-2">
      <CheckCircle2 size={14} className="text-white/60" />

      <p className="font-mono text-xs text-white/50">{label}</p>
    </div>
  );
}

function ScriptRow({
  line,
  active,
  onClick,
}: {
  line: ScriptLine;
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
      <div className="flex items-center justify-between gap-4">
        <p className="font-orbitron text-sm font-bold uppercase">
          {line.title}
        </p>

        <p className="font-mono text-[10px] text-white/45 uppercase">
          {line.time}
        </p>
      </div>
    </button>
  );
}

function RuleCard({ rule }: { rule: DemoRule }) {
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

      <p className="font-mono text-xs text-white/40">{text}</p>
    </div>
  );
}
