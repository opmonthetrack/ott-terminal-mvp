import { useMemo, useState } from "react";
import {
  Award,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  Flame,
  Gem,
  GraduationCap,
  Lock,
  Medal,
  ShieldCheck,
  ShoppingBag,
  Star,
  Trophy,
  Wallet,
  Zap,
} from "lucide-react";

type OTTProfileCardProps = {
  walletAddress?: string;
};

type MissionItem = {
  id: string;
  label: string;
  xp: number;
  done: boolean;
};

type ProgressItem = {
  label: string;
  value: number;
};

type BadgeItem = {
  label: string;
  unlocked: boolean;
};

const baseProfile = {
  name: "TruthOnTheTrack",
  rank: "XRPL Explorer",
  level: 1,
  startingXp: 125,
  nextLevelXp: 500,
  dailyStreak: 3,
  weeklyStreak: 1,
  wallet: "rDEBUG_MOCK_ADDRESS_123",
};

const initialMissions: MissionItem[] = [
  { id: "login", label: "Daily Login", xp: 5, done: true },
  { id: "intel", label: "Read 3 Intel Items", xp: 10, done: false },
  { id: "lesson", label: "Finish 1 Lesson", xp: 25, done: false },
  { id: "checkin", label: "Daily Check-In", xp: 15, done: false },
  { id: "quiz", label: "Complete Quiz", xp: 20, done: false },
];

const progressItems: ProgressItem[] = [
  { label: "Academy", value: 12 },
  { label: "Ledger Intel", value: 40 },
  { label: "Rewards", value: 18 },
  { label: "Marketplace", value: 0 },
  { label: "Developer", value: 0 },
];

function shortenWallet(address: string) {
  if (!address) return "Unknown";
  if (address.length <= 14) return address;
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full bg-white/10 overflow-hidden">
      <div
        className="h-full bg-white transition-all duration-500"
        style={{ width: `${Math.max(0, Math.min(value, 100))}%` }}
      />
    </div>
  );
}

export function OTTProfileCard({ walletAddress }: OTTProfileCardProps) {
  const [missions, setMissions] = useState<MissionItem[]>(initialMissions);

  const currentWallet = walletAddress || baseProfile.wallet;

  const completedXp = useMemo(
    () =>
      missions
        .filter((mission) => mission.done)
        .reduce((total, mission) => total + mission.xp, 0),
    [missions]
  );

  const totalMissionXp = useMemo(
    () => missions.reduce((total, mission) => total + mission.xp, 0),
    [missions]
  );

  const currentXp = baseProfile.startingXp + completedXp;
  const xpProgress = Math.round((currentXp / baseProfile.nextLevelXp) * 100);

  const badges: BadgeItem[] = [
    { label: "First Login", unlocked: true },
    { label: "XRPL Beginner", unlocked: true },
    { label: "News Reader", unlocked: missions.find((m) => m.id === "intel")?.done || false },
    { label: "Daily Streak", unlocked: missions.find((m) => m.id === "checkin")?.done || false },
    { label: "NFT Collector", unlocked: false },
    { label: "Academy Graduate", unlocked: missions.find((m) => m.id === "lesson")?.done || false },
    { label: "Validator Watcher", unlocked: false },
    { label: "OTT Legend", unlocked: false },
  ];

  const toggleMission = (missionId: string) => {
    setMissions((currentMissions) =>
      currentMissions.map((mission) =>
        mission.id === missionId ? { ...mission, done: !mission.done } : mission
      )
    );
  };

  return (
    <div className="grid grid-cols-12 gap-4 mb-6">
      <div className="col-span-12 xl:col-span-5 border border-white/10 bg-white/[0.02] p-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-3">
              OTT Identity
            </p>

            <h2 className="font-orbitron text-2xl font-black uppercase mb-2">
              {baseProfile.name}
            </h2>

            <div className="flex items-center gap-2 text-white/50">
              <BadgeCheck size={15} />
              <p className="font-mono text-xs uppercase tracking-widest">
                {baseProfile.rank}
              </p>
            </div>
          </div>

          <div className="border border-white/10 bg-black p-4 text-center min-w-24">
            <p className="font-mono text-[9px] text-white/35 uppercase mb-2">
              Level
            </p>
            <p className="font-orbitron text-3xl font-black">
              {baseProfile.level}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="border border-white/10 bg-black p-4">
            <div className="flex items-center gap-2 mb-2 text-white/45">
              <Wallet size={15} />
              <p className="font-mono text-[10px] uppercase">Wallet</p>
            </div>
            <p className="font-mono text-xs text-white/70">
              {shortenWallet(currentWallet)}
            </p>
          </div>

          <div className="border border-white/10 bg-black p-4">
            <div className="flex items-center gap-2 mb-2 text-white/45">
              <Zap size={15} />
              <p className="font-mono text-[10px] uppercase">OTT XP</p>
            </div>
            <p className="font-orbitron text-xl font-black">{currentXp}</p>
          </div>

          <div className="border border-white/10 bg-black p-4">
            <div className="flex items-center gap-2 mb-2 text-white/45">
              <Flame size={15} />
              <p className="font-mono text-[10px] uppercase">Daily Streak</p>
            </div>
            <p className="font-orbitron text-xl font-black">
              {baseProfile.dailyStreak} Days
            </p>
          </div>

          <div className="border border-white/10 bg-black p-4">
            <div className="flex items-center gap-2 mb-2 text-white/45">
              <Trophy size={15} />
              <p className="font-mono text-[10px] uppercase">Weekly</p>
            </div>
            <p className="font-orbitron text-xl font-black">
              {baseProfile.weeklyStreak} Week
            </p>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest">
              Level Progress
            </p>
            <p className="font-mono text-[10px] text-white/45">
              {currentXp}/{baseProfile.nextLevelXp} XP
            </p>
          </div>

          <ProgressBar value={xpProgress} />
        </div>
      </div>

      <div className="col-span-12 xl:col-span-4 border border-white/10 bg-white/[0.02] p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={17} className="text-white/60" />
            <p className="font-orbitron text-xs font-black uppercase tracking-widest">
              Today&apos;s Missions
            </p>
          </div>

          <p className="font-mono text-[10px] text-white/40">
            {completedXp}/{totalMissionXp} XP
          </p>
        </div>

        <div className="space-y-3">
          {missions.map((mission) => (
            <button
              key={mission.id}
              onClick={() => toggleMission(mission.id)}
              className="w-full flex items-center justify-between border border-white/10 bg-black p-3 hover:bg-white/5 transition-all"
            >
              <div className="flex items-center gap-3">
                {mission.done ? (
                  <CheckCircle2 size={16} className="text-white" />
                ) : (
                  <div className="w-4 h-4 border border-white/20" />
                )}

                <p
                  className={`font-mono text-xs ${
                    mission.done ? "text-white/75" : "text-white/40"
                  }`}
                >
                  {mission.label}
                </p>
              </div>

              <p className="font-mono text-[10px] text-white/45">
                +{mission.xp} XP
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="col-span-12 xl:col-span-3 border border-white/10 bg-white/[0.02] p-6">
        <div className="flex items-center gap-2 mb-5">
          <Medal size={17} className="text-white/60" />
          <p className="font-orbitron text-xs font-black uppercase tracking-widest">
            Quick Stats
          </p>
        </div>

        <div className="space-y-3">
          <div className="border border-white/10 bg-black p-4">
            <div className="flex items-center gap-2 mb-2 text-white/45">
              <GraduationCap size={15} />
              <p className="font-mono text-[10px] uppercase">Certificates</p>
            </div>
            <p className="font-orbitron text-xl font-black">0</p>
          </div>

          <div className="border border-white/10 bg-black p-4">
            <div className="flex items-center gap-2 mb-2 text-white/45">
              <Gem size={15} />
              <p className="font-mono text-[10px] uppercase">NFT Badges</p>
            </div>
            <p className="font-orbitron text-xl font-black">0</p>
          </div>

          <div className="border border-white/10 bg-black p-4">
            <div className="flex items-center gap-2 mb-2 text-white/45">
              <ShoppingBag size={15} />
              <p className="font-mono text-[10px] uppercase">Marketplace</p>
            </div>
            <p className="font-orbitron text-xl font-black">Locked</p>
          </div>
        </div>
      </div>

      <div className="col-span-12 xl:col-span-7 border border-white/10 bg-white/[0.02] p-6">
        <div className="flex items-center gap-2 mb-5">
          <BookOpen size={17} className="text-white/60" />
          <p className="font-orbitron text-xs font-black uppercase tracking-widest">
            Progress Map
          </p>
        </div>

        <div className="space-y-4">
          {progressItems.map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-mono text-xs text-white/55 uppercase">
                  {item.label}
                </p>
                <p className="font-mono text-[10px] text-white/35">
                  {item.value}%
                </p>
              </div>

              <ProgressBar value={item.value} />
            </div>
          ))}
        </div>
      </div>

      <div className="col-span-12 xl:col-span-5 border border-white/10 bg-white/[0.02] p-6">
        <div className="flex items-center gap-2 mb-5">
          <Award size={17} className="text-white/60" />
          <p className="font-orbitron text-xs font-black uppercase tracking-widest">
            Achievements
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {badges.map((badge) => (
            <div
              key={badge.label}
              className={`border p-3 ${
                badge.unlocked
                  ? "border-white/20 bg-white text-black"
                  : "border-white/10 bg-black text-white/35"
              }`}
            >
              <div className="flex items-center gap-2">
                {badge.unlocked ? <Star size={14} /> : <Lock size={14} />}
                <p className="font-mono text-[10px] uppercase tracking-widest">
                  {badge.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
