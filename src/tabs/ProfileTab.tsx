import { useState } from "react";
import type { ElementType } from "react";
import {
  Activity,
  BadgeCheck,
  Brain,
  Calendar,
  CheckCircle2,
  Coins,
  Crown,
  Fingerprint,
  Flame,
  GraduationCap,
  Lock,
  Medal,
  Radio,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  User,
  Wallet,
  Waves,
  Zap,
} from "lucide-react";

type ProfileStat = {
  label: string;
  value: string;
  subtitle: string;
  icon: ElementType;
};

type BadgeItem = {
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

type ActivityItem = {
  title: string;
  status: string;
  time: string;
  xp: string;
};

type ProfileModule = {
  id: string;
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

const profileStats: ProfileStat[] = [
  {
    label: "OTT XP",
    value: "130 XP",
    subtitle: "Current demo score",
    icon: Zap,
  },
  {
    label: "Streak",
    value: "3 Days",
    subtitle: "Daily return loop",
    icon: Flame,
  },
  {
    label: "Badges",
    value: "4",
    subtitle: "Identity proof",
    icon: BadgeCheck,
  },
  {
    label: "Rank",
    value: "Builder",
    subtitle: "MVP profile role",
    icon: Crown,
  },
];

const badges: BadgeItem[] = [
  {
    title: "XRPL Starter",
    status: "Unlocked",
    text: "Started the XRPL Academy path.",
    icon: GraduationCap,
  },
  {
    title: "Wallet Guardian",
    status: "Progress",
    text: "Learning wallet safety and trustline rules.",
    icon: ShieldCheck,
  },
  {
    title: "Make Waves Tester",
    status: "Unlocked",
    text: "Active in the source tag 2606 flow.",
    icon: Waves,
  },
  {
    title: "AI Explorer",
    status: "Locked",
    text: "Complete AI Hub prompts and safety flows.",
    icon: Brain,
  },
  {
    title: "DeFi Scout",
    status: "Locked",
    text: "Complete DeFi lessons and AMM education.",
    icon: Coins,
  },
  {
    title: "OTT Founder",
    status: "Future",
    text: "Early supporter proof for the OTT Terminal.",
    icon: Medal,
  },
];

const activities: ActivityItem[] = [
  {
    title: "Daily Check-In",
    status: "Completed",
    time: "Today",
    xp: "+10 XP",
  },
  {
    title: "Wallet Safety Review",
    status: "Completed",
    time: "Today",
    xp: "+15 XP",
  },
  {
    title: "Academy Lesson",
    status: "Started",
    time: "Yesterday",
    xp: "+5 XP",
  },
  {
    title: "Source Tag 2606",
    status: "Reviewed",
    time: "This week",
    xp: "+20 XP",
  },
];

const profileModules: ProfileModule[] = [
  {
    id: "identity",
    title: "Wallet Identity",
    status: "Active",
    text: "Profile identity built around wallet, badges, XP and source tag activity.",
    icon: Wallet,
  },
  {
    id: "reputation",
    title: "Reputation Score",
    status: "Mock",
    text: "User reputation grows through learning, safety checks, check-ins and community actions.",
    icon: Star,
  },
  {
    id: "achievements",
    title: "Achievements",
    status: "Live UI",
    text: "Badges, trophies, ranks and NFT certificates will become visible identity layers.",
    icon: Trophy,
  },
  {
    id: "history",
    title: "Activity History",
    status: "Timeline",
    text: "Wallet actions, Academy progress, check-ins and rewards become a profile timeline.",
    icon: Calendar,
  },
];

const roadmap = [
  "Save profile data per wallet",
  "Connect XP from Academy",
  "Connect Daily Check-In streak",
  "Connect source tag 2606 activity",
  "Add NFT badge minting later",
  "Add public profile link",
  "Add leaderboard ranking",
  "Add partner proof badges",
];

export function ProfileTab() {
  const [selectedModule, setSelectedModule] = useState<ProfileModule>(
    profileModules[0]
  );

  const SelectedModuleIcon = selectedModule.icon;

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 mb-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="flex items-center gap-2 mb-4 text-white/45">
              <User size={17} />

              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                OTT Profile
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              Your XRPL Identity Layer
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              De profiel-laag van OTT Terminal. Hier komen wallet identity,
              XP, streaks, badges, Academy progress, Make Waves activity,
              source tag 2606 en community reputation samen.
            </p>
          </div>

          <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-3">
            {profileStats.map((stat) => (
              <StatBox key={stat.label} stat={stat} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-4 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <User size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Profile Card
              </p>
            </div>

            <div className="border border-white/10 bg-black p-5 mb-4">
              <div className="w-20 h-20 bg-white text-black flex items-center justify-center font-orbitron font-black text-2xl mb-5">
                OTT
              </div>

              <p className="font-orbitron text-xl font-black uppercase mb-2">
                TruthOnTheTrack
              </p>

              <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-4">
                XRPL Terminal Builder
              </p>

              <p className="font-mono text-xs text-white/45 leading-relaxed">
                Building the Home Screen of the XRP Ledger with education,
                safety, intelligence and Make Waves activation.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <MiniStatus label="Role" value="Founder" />
              <MiniStatus label="Mode" value="MVP" />
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Target size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Profile Modules
              </p>
            </div>

            <div className="space-y-3">
              {profileModules.map((module) => (
                <ModuleButton
                  key={module.id}
                  module={module}
                  active={selectedModule.id === module.id}
                  onClick={() => setSelectedModule(module)}
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
                  Selected Profile Layer
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  {selectedModule.title}
                </h3>
              </div>

              <SelectedModuleIcon size={22} className="text-white/60" />
            </div>

            <p className="font-mono text-sm text-white/45 leading-relaxed mb-5">
              {selectedModule.text}
            </p>

            <MiniStatus label="Status" value={selectedModule.status} />
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Badge Vault
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  Achievements
                </h3>
              </div>

              <Trophy size={20} className="text-white/60" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {badges.map((badge) => (
                <BadgeCard key={badge.title} badge={badge} />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Activity size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Activity Timeline
              </p>
            </div>

            <div className="space-y-3">
              {activities.map((item) => (
                <ActivityRow key={`${item.title}-${item.time}`} item={item} />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-3 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Fingerprint size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Identity Signals
              </p>
            </div>

            <div className="space-y-3">
              <SignalLine icon={Wallet} label="Wallet linked" value="Debug" />
              <SignalLine icon={Waves} label="Make Waves" value="2606" />
              <SignalLine icon={Radio} label="Network" value="XRPL" />
              <SignalLine icon={ShieldCheck} label="Safety" value="Good" />
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Lock size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Privacy Rules
              </p>
            </div>

            <div className="space-y-3">
              <PrivacyLine label="No private keys stored" />
              <PrivacyLine label="No seed phrase request" />
              <PrivacyLine label="Public profile later optional" />
              <PrivacyLine label="Wallet confirmation required" />
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={18} className="text-white/60" />

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
          <FeatureBox icon={BadgeCheck} title="Badges" text="Identity proof" />
          <FeatureBox icon={Zap} title="XP" text="Learning rewards" />
          <FeatureBox icon={Waves} title="2606" text="Make Waves activity" />
          <FeatureBox icon={Crown} title="Rank" text="Community status" />
        </div>
      </div>
    </div>
  );
}

function StatBox({ stat }: { stat: ProfileStat }) {
  const Icon = stat.icon;

  return (
    <div className="border border-white/10 bg-black/60 p-4">
      <Icon size={18} className="text-white/60 mb-3" />

      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
        {stat.label}
      </p>

      <p className="font-orbitron text-sm font-black uppercase mb-1">
        {stat.value}
      </p>

      <p className="font-mono text-[10px] text-white/30 uppercase">
        {stat.subtitle}
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

      <p className="font-orbitron text-sm font-black uppercase">{value}</p>
    </div>
  );
}

function ModuleButton({
  module,
  active,
  onClick,
}: {
  module: ProfileModule;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = module.icon;

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
            {module.title}
          </p>
        </div>

        <p className="font-mono text-[10px] text-white/35 uppercase">
          {module.status}
        </p>
      </div>
    </button>
  );
}

function BadgeCard({ badge }: { badge: BadgeItem }) {
  const Icon = badge.icon;

  return (
    <div className="border border-white/10 bg-black p-4">
      <div className="flex items-start justify-between mb-3">
        <Icon size={17} className="text-white/60" />

        <p className="font-mono text-[10px] text-white/30 uppercase">
          {badge.status}
        </p>
      </div>

      <p className="font-orbitron text-xs font-bold uppercase mb-2">
        {badge.title}
      </p>

      <p className="font-mono text-[10px] text-white/40 leading-relaxed">
        {badge.text}
      </p>
    </div>
  );
}

function ActivityRow({ item }: { item: ActivityItem }) {
  return (
    <div className="border border-white/10 bg-black p-4 flex items-center justify-between gap-4">
      <div>
        <p className="font-orbitron text-sm font-bold uppercase mb-1">
          {item.title}
        </p>

        <p className="font-mono text-[10px] text-white/35 uppercase">
          {item.status} • {item.time}
        </p>
      </div>

      <p className="font-mono text-[10px] text-white/45 uppercase">
        {item.xp}
      </p>
    </div>
  );
}

function SignalLine({
  icon: Icon,
  label,
  value,
}: {
  icon: ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="border border-white/10 bg-black p-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Icon size={14} className="text-white/60" />

        <p className="font-mono text-xs text-white/50">{label}</p>
      </div>

      <p className="font-mono text-[10px] text-white/35 uppercase">{value}</p>
    </div>
  );
}

function PrivacyLine({ label }: { label: string }) {
  return (
    <div className="border border-white/10 bg-black p-3 flex items-center gap-2">
      <CheckCircle2 size={14} className="text-white/60" />

      <p className="font-mono text-xs text-white/50">{label}</p>
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
