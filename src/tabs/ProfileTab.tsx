import type { ElementType } from "react";
import {
  Activity,
  Award,
  BadgeCheck,
  BookOpen,
  Clock,
  Gem,
  Medal,
  ShieldCheck,
  Star,
  Trophy,
  User,
  Wallet,
  Zap,
} from "lucide-react";

type Stat = {
  label: string;
  value: string;
  icon: ElementType;
};

type Badge = {
  title: string;
  status: string;
  icon: ElementType;
};

const stats: Stat[] = [
  {
    label: "OTT XP",
    value: "130 XP",
    icon: Star,
  },
  {
    label: "Daily Streak",
    value: "3 Days",
    icon: Zap,
  },
  {
    label: "Badges",
    value: "4",
    icon: Award,
  },
  {
    label: "Wallet Rank",
    value: "Builder",
    icon: ShieldCheck,
  },
];

const badges: Badge[] = [
  {
    title: "Early Builder",
    status: "Unlocked",
    icon: BadgeCheck,
  },
  {
    title: "XRPL Student",
    status: "Unlocked",
    icon: BookOpen,
  },
  {
    title: "Daily Streak",
    status: "Active",
    icon: Trophy,
  },
  {
    title: "Make Waves",
    status: "Soon",
    icon: Gem,
  },
];

const activity = [
  "Logged into OTT Terminal",
  "Opened Academy module",
  "Reviewed Ledger Intelligence",
  "Earned 25 XP",
  "Checked Wallet Center",
];

export function ProfileTab() {
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
              Identity. Progress. Reputation.
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              Jouw profiel binnen de OTT Terminal. Hier komen XP, badges,
              wallet reputation, Academy progress, daily streaks en toekomstige
              OTT Token utility samen.
            </p>
          </div>

          <div className="col-span-12 xl:col-span-4 border border-white/10 bg-black/60 p-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white text-black flex items-center justify-center font-orbitron font-black text-xl">
                OTT
              </div>

              <div>
                <p className="font-orbitron text-lg font-black uppercase">
                  Oswald
                </p>
                <p className="font-mono text-xs text-white/35">
                  TruthOnTheTrack / Founder
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <StatBox key={stat.label} stat={stat} />
            ))}
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Activity size={18} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                Recent Activity
              </p>
            </div>

            <div className="space-y-3">
              {activity.map((item) => (
                <ActivityLine key={item} label={item} />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Award size={18} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                Badge Vault
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {badges.map((badge) => (
                <BadgeCard key={badge.title} badge={badge} />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-4 space-y-4">
          <SideBox
            icon={Wallet}
            title="Wallet Identity"
            text="Later koppelen we echte XRPL wallet identity, badges en reputation score."
          />

          <SideBox
            icon={Medal}
            title="Founder Rank"
            text="Ranks worden later gebaseerd op leren, dagelijkse activiteit, check-ins en community bijdrage."
          />

          <SideBox
            icon={Clock}
            title="Daily Progress"
            text="Daily missions zorgen straks voor terugkerende gebruikers en meetbare engagement."
          />
        </div>
      </div>
    </div>
  );
}

function StatBox({ stat }: { stat: Stat }) {
  const Icon = stat.icon;

  return (
    <div className="border border-white/10 bg-white/[0.02] p-5">
      <Icon size={18} className="text-white/60 mb-4" />

      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
        {stat.label}
      </p>

      <p className="font-orbitron text-lg font-black uppercase">
        {stat.value}
      </p>
    </div>
  );
}

function ActivityLine({ label }: { label: string }) {
  return (
    <div className="border border-white/10 bg-black p-4 flex items-center justify-between">
      <p className="font-mono text-xs text-white/50">{label}</p>

      <p className="font-mono text-[10px] text-white/30 uppercase">Now</p>
    </div>
  );
}

function BadgeCard({ badge }: { badge: Badge }) {
  const Icon = badge.icon;

  return (
    <div className="border border-white/10 bg-black p-5">
      <Icon size={20} className="text-white/60 mb-4" />

      <p className="font-orbitron text-sm font-bold uppercase mb-2">
        {badge.title}
      </p>

      <p className="font-mono text-[10px] text-white/35 uppercase">
        {badge.status}
      </p>
    </div>
  );
}

function SideBox({
  icon: Icon,
  title,
  text,
}: {
  icon: ElementType;
  title: string;
  text: string;
}) {
  return (
    <div className="border border-white/10 bg-white/[0.02] p-6">
      <Icon size={19} className="text-white/60 mb-4" />

      <p className="font-orbitron text-sm font-bold uppercase mb-2">{title}</p>

      <p className="font-mono text-xs text-white/40 leading-relaxed">{text}</p>
    </div>
  );
}
