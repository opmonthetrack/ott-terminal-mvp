import {
  Activity,
  Award,
  BadgeCheck,
  BookOpen,
  Clock,
  Gem,
  GraduationCap,
  Lock,
  Medal,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Star,
  Trophy,
  User,
  Wallet,
  Zap,
} from "lucide-react";

export function ProfileTab() {
  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="border border-white/10 bg-white/[0.02] p-6 mb-6">
        <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-4">
          OTT Identity System
        </p>

        <h2 className="font-orbitron text-3xl font-black uppercase mb-4">
          My Profile
        </h2>

        <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
          Jouw centrale profiel voor XP, levels, badges, certificaten,
          marketplace toegang, Learn & Earn voortgang en toekomstige token
          rewards.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-4 border border-white/10 bg-white/[0.02] p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 border border-white/10 bg-white text-black flex items-center justify-center">
              <User size={28} />
            </div>

            <div>
              <h3 className="font-orbitron text-xl font-black uppercase">
                TruthOnTheTrack
              </h3>
              <p className="font-mono text-xs text-white/45 uppercase tracking-widest">
                XRPL Explorer
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <ProfileStat icon={Wallet} label="Wallet" value="rDEBUG...123" />
            <ProfileStat icon={Zap} label="OTT XP" value="130 XP" />
            <ProfileStat icon={Trophy} label="Level" value="1" />
            <ProfileStat icon={Clock} label="Daily Streak" value="3 Days" />
            <ProfileStat icon={BadgeCheck} label="Rank" value="Explorer" />
          </div>
        </div>

        <div className="col-span-12 xl:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <ProfileBox icon={Award} label="Achievements" value="2 / 8" />
          <ProfileBox icon={GraduationCap} label="Certificates" value="0" />
          <ProfileBox icon={Gem} label="NFT Badges" value="0" />
          <ProfileBox icon={BookOpen} label="Lessons Completed" value="0" />
          <ProfileBox icon={ShoppingBag} label="Marketplace Level" value="Locked" />
          <ProfileBox icon={ShieldCheck} label="Security Score" value="Safe" />
        </div>

        <div className="col-span-12 xl:col-span-7 border border-white/10 bg-white/[0.02] p-6">
          <div className="flex items-center gap-2 mb-5">
            <Activity size={17} className="text-white/60" />
            <p className="font-orbitron text-xs font-black uppercase tracking-widest">
              Activity Log
            </p>
          </div>

          <div className="space-y-3">
            <ActivityItem title="Daily Login" subtitle="+5 XP earned" status="Done" />
            <ActivityItem title="Profile Created" subtitle="OTT Identity activated" status="Done" />
            <ActivityItem title="Daily Check-In" subtitle="Xaman action coming soon" status="Soon" />
            <ActivityItem title="First Lesson" subtitle="Academy module not started" status="Locked" />
          </div>
        </div>

        <div className="col-span-12 xl:col-span-5 border border-white/10 bg-white/[0.02] p-6">
          <div className="flex items-center gap-2 mb-5">
            <Medal size={17} className="text-white/60" />
            <p className="font-orbitron text-xs font-black uppercase tracking-widest">
              Badge Vault
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Badge label="First Login" unlocked />
            <Badge label="XRPL Beginner" unlocked />
            <Badge label="News Reader" />
            <Badge label="Daily Streak" />
            <Badge label="NFT Collector" />
            <Badge label="OTT Legend" />
          </div>
        </div>

        <div className="col-span-12 border border-white/10 bg-white/[0.02] p-6">
          <div className="flex items-center gap-2 mb-5">
            <Settings size={17} className="text-white/60" />
            <p className="font-orbitron text-xs font-black uppercase tracking-widest">
              Future Profile Modules
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <FutureModule label="Referral System" />
            <FutureModule label="Invite Friends" />
            <FutureModule label="OTT Token Balance" />
            <FutureModule label="Marketplace Discounts" />
            <FutureModule label="Connected Devices" />
            <FutureModule label="Security Settings" />
            <FutureModule label="Certificates" />
            <FutureModule label="NFT Collection" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="border border-white/10 bg-black p-4">
      <div className="flex items-center gap-2 mb-2 text-white/45">
        <Icon size={15} />
        <p className="font-mono text-[10px] uppercase tracking-widest">
          {label}
        </p>
      </div>
      <p className="font-orbitron text-sm font-black uppercase">{value}</p>
    </div>
  );
}

function ProfileBox({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="border border-white/10 bg-white/[0.02] p-5">
      <Icon size={20} className="text-white/60 mb-4" />
      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
        {label}
      </p>
      <p className="font-orbitron text-xl font-black uppercase">{value}</p>
    </div>
  );
}

function ActivityItem({
  title,
  subtitle,
  status,
}: {
  title: string;
  subtitle: string;
  status: string;
}) {
  return (
    <div className="flex items-center justify-between border border-white/10 bg-black p-4">
      <div>
        <p className="font-mono text-xs text-white/75">{title}</p>
        <p className="font-mono text-[10px] text-white/35 mt-1">{subtitle}</p>
      </div>

      <p className="font-mono text-[10px] text-white/45 uppercase">
        {status}
      </p>
    </div>
  );
}

function Badge({ label, unlocked = false }: { label: string; unlocked?: boolean }) {
  return (
    <div
      className={`border p-3 ${
        unlocked
          ? "border-white/20 bg-white text-black"
          : "border-white/10 bg-black text-white/35"
      }`}
    >
      <div className="flex items-center gap-2">
        {unlocked ? <Star size={14} /> : <Lock size={14} />}
        <p className="font-mono text-[10px] uppercase tracking-widest">
          {label}
        </p>
      </div>
    </div>
  );
}

function FutureModule({ label }: { label: string }) {
  return (
    <div className="border border-white/10 bg-black p-4">
      <p className="font-mono text-xs text-white/50">{label}</p>
    </div>
  );
}
