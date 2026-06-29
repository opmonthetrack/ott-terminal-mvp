import { useState } from "react";
import type { ElementType } from "react";
import {
  Activity,
  BadgeCheck,
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  Code2,
  Flag,
  Gauge,
  GitBranch,
  Globe2,
  Layers,
  Presentation,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  Terminal,
  Trophy,
  Users,
  Wallet,
  Waves,
  Zap,
} from "lucide-react";

type LaunchArea = {
  id: string;
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

type ChecklistItem = {
  title: string;
  status: string;
  text: string;
};

type Milestone = {
  title: string;
  date: string;
  status: string;
  text: string;
};

type LaunchRule = {
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

const launchAreas: LaunchArea[] = [
  {
    id: "demo",
    title: "Demo Flow",
    status: "Build",
    text: "Maak een sterke 2 minuten demo waarin login, dashboard, check-in, source tag 2606 en modules logisch openen.",
    icon: Rocket,
  },
  {
    id: "mainnet",
    title: "Mainnet Readiness",
    status: "Next",
    text: "Bereid veilige mainnet acties voor via Xaman, backend payloads en duidelijke user confirmations.",
    icon: Globe2,
  },
  {
    id: "metrics",
    title: "User Metrics",
    status: "2606",
    text: "Track daily check-ins, active users, source tag 2606 activity en demo conversion signals.",
    icon: Users,
  },
  {
    id: "pitch",
    title: "Pitch Deck",
    status: "Deck",
    text: "Vertaal de terminal naar probleem, oplossing, doelgroep, XRPL waarde, traction en roadmap.",
    icon: Presentation,
  },
  {
    id: "qa",
    title: "QA / Bug Fix",
    status: "Safety",
    text: "Check Vercel build, imports, routes, responsive layout, wallet warnings en broken states.",
    icon: ShieldCheck,
  },
  {
    id: "release",
    title: "Release Plan",
    status: "Launch",
    text: "Plan weekly builds, social posts, feature drops, demo updates en community feedback loops.",
    icon: CalendarCheck,
  },
];

const checklist: ChecklistItem[] = [
  {
    title: "Vercel Build Green",
    status: "Required",
    text: "Geen unused imports, geen missing files, correcte named exports en case-sensitive paths.",
  },
  {
    title: "Demo Route Stable",
    status: "Required",
    text: "Login, dashboard, Daily Check-In, Source Tag en module navigation moeten foutloos werken.",
  },
  {
    title: "Source Tag Story",
    status: "2606",
    text: "Maak duidelijk waarom source tag 2606 belangrijk is voor Make Waves active user tracking.",
  },
  {
    title: "Wallet Safety Visible",
    status: "Safety",
    text: "No seed phrase, no private key en Xaman confirmation later moeten overal duidelijk blijven.",
  },
  {
    title: "Pitch Deck Ready",
    status: "Deck",
    text: "Maak slides met probleem, oplossing, demo, traction, mainnet path, roadmap en ask.",
  },
  {
    title: "Two Minute Script",
    status: "Demo",
    text: "Schrijf een korte demo voice-over zodat de pitch strak en professioneel klinkt.",
  },
];

const milestones: Milestone[] = [
  {
    title: "MVP Shell",
    date: "Now",
    status: "Built",
    text: "Complete clickable frontend with dashboard, modules, XP, profile, intel and marketplace.",
  },
  {
    title: "Source Tag Proof",
    date: "Next",
    status: "2606",
    text: "Connect active user flow to source tag 2606 and explain the metric clearly.",
  },
  {
    title: "Xaman Payloads",
    date: "Backend",
    status: "Build",
    text: "Move from debug mode to safe backend-generated Xaman payloads.",
  },
  {
    title: "Live Demo",
    date: "Pitch",
    status: "Prepare",
    text: "Record or present a clean 2 minute walkthrough of the terminal.",
  },
];

const rules: LaunchRule[] = [
  {
    title: "Safety Before Hype",
    status: "Rule",
    text: "Geen beloftes over winst, prijs of gegarandeerde uitkomsten. Focus op utility.",
    icon: ShieldCheck,
  },
  {
    title: "Show Working UI",
    status: "Demo",
    text: "Laat de terminal klikken en voelen als een echt product, niet alleen als idee.",
    icon: Terminal,
  },
  {
    title: "Keep Build Green",
    status: "Dev",
    text: "Elke nieuwe module moet Vercel groen houden met correcte imports en exports.",
    icon: GitBranch,
  },
  {
    title: "Explain 2606",
    status: "Make Waves",
    text: "Source tag 2606 moet simpel worden uitgelegd als tracking laag voor activiteit.",
    icon: Waves,
  },
];

const roadmap = [
  "Launch Control koppelen aan App.tsx",
  "Dashboard samenvatting uitbreiden",
  "2 minuten demo script schrijven",
  "Pitch deck structuur maken",
  "Xaman backend plan maken",
  "Source tag 2606 mainnet proof bouwen",
  "Active user metrics opslaan",
  "Final demo polish doen",
];

export function LaunchControlTab() {
  const [selectedArea, setSelectedArea] = useState<LaunchArea>(launchAreas[0]);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone>(
    milestones[0]
  );

  const SelectedAreaIcon = selectedArea.icon;

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 mb-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="flex items-center gap-2 mb-4 text-white/45">
              <Flag size={17} />

              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                Launch Control
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              Make The MVP Demo Ready
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              De launch-laag van OTT Terminal. Hier beheer je demo readiness,
              Vercel build health, source tag 2606 proof, pitch deck, active
              users, Xaman roadmap en final polish.
            </p>
          </div>

          <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-3">
            <StatBox icon={Gauge} label="Build" value="Green" />
            <StatBox icon={Waves} label="Source Tag" value="2606" />
            <StatBox icon={Trophy} label="Challenge" value="Make Waves" />
            <StatBox icon={Zap} label="Demo" value="2 Min" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-4 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Layers size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Launch Areas
              </p>
            </div>

            <div className="space-y-3">
              {launchAreas.map((area) => (
                <AreaButton
                  key={area.id}
                  area={area}
                  active={selectedArea.id === area.id}
                  onClick={() => setSelectedArea(area)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-5 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Selected Launch Area
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  {selectedArea.title}
                </h3>
              </div>

              <SelectedAreaIcon size={22} className="text-white/60" />
            </div>

            <p className="font-mono text-sm text-white/45 leading-relaxed mb-5">
              {selectedArea.text}
            </p>

            <MiniStatus label="Status" value={selectedArea.status} />
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Demo Checklist
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  Ready To Present
                </h3>
              </div>

              <ClipboardCheck size={20} className="text-white/60" />
            </div>

            <div className="space-y-3">
              {checklist.map((item) => (
                <ChecklistRow key={item.title} item={item} />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Target size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Milestone Tracker
              </p>
            </div>

            <div className="space-y-3">
              {milestones.map((milestone) => (
                <MilestoneRow
                  key={milestone.title}
                  milestone={milestone}
                  active={selectedMilestone.title === milestone.title}
                  onClick={() => setSelectedMilestone(milestone)}
                />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <p className="font-orbitron text-2xl font-black uppercase mb-2">
              {selectedMilestone.title}
            </p>

            <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-4">
              {selectedMilestone.date} • {selectedMilestone.status}
            </p>

            <p className="font-mono text-sm text-white/45 leading-relaxed">
              {selectedMilestone.text}
            </p>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-3 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <ShieldCheck size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Launch Rules
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
              <Rocket size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Roadmap
              </p>
            </div>

            <div className="space-y-3">
              {roadmap.map((item) => (
                <RoadmapLine key={item} label={item} />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <FeatureBox icon={Activity} title="Metrics" text="Active users" />
          <FeatureBox icon={Code2} title="Build" text="Vercel green" />
          <FeatureBox icon={BadgeCheck} title="Proof" text="2606 activity" />
          <FeatureBox icon={Wallet} title="Xaman" text="Backend later" />
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

function AreaButton({
  area,
  active,
  onClick,
}: {
  area: LaunchArea;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = area.icon;

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
            {area.title}
          </p>
        </div>

        <p className="font-mono text-[10px] text-white/35 uppercase">
          {area.status}
        </p>
      </div>
    </button>
  );
}

function ChecklistRow({ item }: { item: ChecklistItem }) {
  return (
    <div className="border border-white/10 bg-black p-4">
      <div className="flex items-center justify-between gap-4 mb-2">
        <p className="font-orbitron text-sm font-bold uppercase">
          {item.title}
        </p>

        <p className="font-mono text-[10px] text-white/45 uppercase">
          {item.status}
        </p>
      </div>

      <p className="font-mono text-[10px] text-white/40 leading-relaxed">
        {item.text}
      </p>
    </div>
  );
}

function MilestoneRow({
  milestone,
  active,
  onClick,
}: {
  milestone: Milestone;
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
          {milestone.title}
        </p>

        <p className="font-mono text-[10px] text-white/45 uppercase">
          {milestone.status}
        </p>
      </div>

      <p className="font-mono text-[10px] text-white/35 uppercase">
        {milestone.date}
      </p>
    </button>
  );
}

function MiniStatus({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/10 bg-black p-4">
      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
        {label}
      </p>

      <p className="font-orbitron text-sm font-black uppercase">{value}</p>
    </div>
  );
}

function RuleCard({ rule }: { rule: LaunchRule }) {
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

function RoadmapLine({ label }: { label: string }) {
  return (
    <div className="border border-white/10 bg-black p-3 flex items-center gap-2">
      <CheckCircle2 size={14} className="text-white/60" />

      <p className="font-mono text-xs text-white/50">{label}</p>
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
