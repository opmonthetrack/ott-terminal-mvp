import { useState } from "react";
import type { ElementType } from "react";
import {
  BadgeCheck,
  BookOpen,
  Brain,
  CheckCircle2,
  Coins,
  Flame,
  GraduationCap,
  Layers,
  Lock,
  Medal,
  PlayCircle,
  Puzzle,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  Wallet,
  Waves,
  Zap,
} from "lucide-react";

type AcademyTrack = {
  id: string;
  title: string;
  level: string;
  lessons: string;
  reward: string;
  text: string;
  icon: ElementType;
};

type Lesson = {
  title: string;
  status: string;
  xp: number;
  text: string;
};

type Badge = {
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

const tracks: AcademyTrack[] = [
  {
    id: "xrpl-basics",
    title: "XRPL Basics",
    level: "Beginner",
    lessons: "6 Lessons",
    reward: "+60 XP",
    text: "Leer wat XRPL is, hoe ledgers werken, wat XRP doet en waarom snelheid belangrijk is.",
    icon: BookOpen,
  },
  {
    id: "wallet-safety",
    title: "Wallet Safety",
    level: "Essential",
    lessons: "5 Lessons",
    reward: "+75 XP",
    text: "Seed phrase veiligheid, Xaman confirmation, trustlines, scams en signing hygiene.",
    icon: ShieldCheck,
  },
  {
    id: "defi",
    title: "DeFi On XRPL",
    level: "Intermediate",
    lessons: "7 Lessons",
    reward: "+100 XP",
    text: "DEX, AMM, liquidity, stablecoins, slippage, LP risk en DeFi education.",
    icon: Coins,
  },
  {
    id: "builders",
    title: "Builder Path",
    level: "Developer",
    lessons: "8 Lessons",
    reward: "+150 XP",
    text: "XRPL API, Xaman payloads, source tag 2606, frontend modules en safe backend flows.",
    icon: Rocket,
  },
  {
    id: "ai",
    title: "AI + XRPL",
    level: "Future",
    lessons: "5 Lessons",
    reward: "+90 XP",
    text: "AI assistants, wallet explainers, risk scanners, prompts en research workflows.",
    icon: Brain,
  },
  {
    id: "make-waves",
    title: "Make Waves",
    level: "Challenge",
    lessons: "4 Lessons",
    reward: "+260 XP",
    text: "Daily Check-In, source tag 2606, active users, mainnet proof en demo readiness.",
    icon: Waves,
  },
];

const lessons: Lesson[] = [
  {
    title: "What Is The XRP Ledger?",
    status: "Open",
    xp: 10,
    text: "Introductie tot ledger finality, accounts, transactions en native XRP.",
  },
  {
    title: "How Xaman Signing Works",
    status: "Open",
    xp: 15,
    text: "Gebruiker moet altijd zelf bevestigen. Geen hidden signing of private keys.",
  },
  {
    title: "Trustline Safety",
    status: "Open",
    xp: 20,
    text: "Waarom issuers, limits en onbekende tokens belangrijk zijn voor wallet safety.",
  },
  {
    title: "Source Tag 2606",
    status: "Challenge",
    xp: 25,
    text: "Waarom OTT Make Waves transacties later source tag 2606 gebruiken.",
  },
];

const badges: Badge[] = [
  {
    title: "XRPL Starter",
    status: "Unlocked",
    text: "Eerste Academy flow gestart.",
    icon: BadgeCheck,
  },
  {
    title: "Wallet Guardian",
    status: "Locked",
    text: "Voltooi Wallet Safety track.",
    icon: Lock,
  },
  {
    title: "DeFi Explorer",
    status: "Locked",
    text: "Voltooi DeFi On XRPL track.",
    icon: Medal,
  },
  {
    title: "Make Waves Builder",
    status: "Locked",
    text: "Voltooi source tag 2606 challenge.",
    icon: Trophy,
  },
];

const roadmap = [
  "Lesson pages bouwen",
  "Quiz engine toevoegen",
  "XP opslaan per wallet",
  "Badge progress koppelen",
  "Daily Check-In reward verbinden",
  "Academy leaderboard maken",
  "AI tutor toevoegen",
  "NFT certificates later",
];

export function AcademyTab() {
  const [selectedTrack, setSelectedTrack] = useState<AcademyTrack>(tracks[0]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  const SelectedTrackIcon = selectedTrack.icon;

  const earnedXp = completedLessons.reduce((total, lessonTitle) => {
    const lesson = lessons.find((item) => item.title === lessonTitle);
    return total + (lesson?.xp || 0);
  }, 0);

  function toggleLesson(title: string) {
    setCompletedLessons((current) => {
      if (current.includes(title)) {
        return current.filter((item) => item !== title);
      }

      return [...current, title];
    });
  }

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 mb-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="flex items-center gap-2 mb-4 text-white/45">
              <GraduationCap size={17} />

              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                OTT Academy
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              Learn XRPL. Earn XP. Build Confidence.
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              De Academy-laag van OTT Terminal. Hier leren gebruikers XRPL,
              wallet safety, DeFi, AI, tokenization, source tag 2606 en builder
              skills via lessons, quizzes, badges en XP.
            </p>
          </div>

          <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-3">
            <StatBox icon={Zap} label="Earned XP" value={`${earnedXp} XP`} />
            <StatBox icon={CheckCircle2} label="Lessons" value={`${completedLessons.length}/4`} />
            <StatBox icon={Flame} label="Streak" value="3 Days" />
            <StatBox icon={Trophy} label="Badges" value="1/4" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-4 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Layers size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Learning Tracks
              </p>
            </div>

            <div className="space-y-3">
              {tracks.map((track) => (
                <TrackButton
                  key={track.id}
                  track={track}
                  active={selectedTrack.id === track.id}
                  onClick={() => setSelectedTrack(track)}
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
                  Selected Track
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  {selectedTrack.title}
                </h3>
              </div>

              <SelectedTrackIcon size={22} className="text-white/60" />
            </div>

            <p className="font-mono text-sm text-white/45 leading-relaxed mb-5">
              {selectedTrack.text}
            </p>

            <div className="grid grid-cols-3 gap-3">
              <MiniStatus label="Level" value={selectedTrack.level} />
              <MiniStatus label="Lessons" value={selectedTrack.lessons} />
              <MiniStatus label="Reward" value={selectedTrack.reward} />
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Lessons
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  Daily Learn & Earn
                </h3>
              </div>

              <PlayCircle size={20} className="text-white/60" />
            </div>

            <div className="space-y-3">
              {lessons.map((lesson) => (
                <LessonRow
                  key={lesson.title}
                  lesson={lesson}
                  completed={completedLessons.includes(lesson.title)}
                  onClick={() => toggleLesson(lesson.title)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-3 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Star size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Badges
              </p>
            </div>

            <div className="space-y-3">
              {badges.map((badge) => (
                <BadgeRow key={badge.title} badge={badge} />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Target size={18} className="text-white/60" />

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
          <FeatureBox icon={BookOpen} title="Lessons" text="XRPL education" />
          <FeatureBox icon={Puzzle} title="Quizzes" text="Test knowledge" />
          <FeatureBox icon={Wallet} title="Wallet XP" text="Progress by wallet" />
          <FeatureBox icon={Sparkles} title="AI Tutor" text="Personal guidance" />
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

function TrackButton({
  track,
  active,
  onClick,
}: {
  track: AcademyTrack;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = track.icon;

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
            {track.title}
          </p>
        </div>

        <p className="font-mono text-[10px] text-white/35 uppercase">
          {track.level}
        </p>
      </div>
    </button>
  );
}

function MiniStatus({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/10 bg-black p-4">
      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
        {label}
      </p>

      <p className="font-orbitron text-xs font-black uppercase">{value}</p>
    </div>
  );
}

function LessonRow({
  lesson,
  completed,
  onClick,
}: {
  lesson: Lesson;
  completed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full border p-4 text-left transition-all ${
        completed
          ? "border-white/30 bg-white/[0.08]"
          : "border-white/10 bg-black hover:bg-white/[0.03]"
      }`}
    >
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <CheckCircle2
            size={16}
            className={completed ? "text-white" : "text-white/30"}
          />

          <p className="font-orbitron text-sm font-bold uppercase">
            {lesson.title}
          </p>
        </div>

        <p className="font-mono text-[10px] text-white/35 uppercase">
          {completed ? "Done" : `+${lesson.xp} XP`}
        </p>
      </div>

      <p className="font-mono text-xs text-white/40 leading-relaxed">
        {lesson.text}
      </p>
    </button>
  );
}

function BadgeRow({ badge }: { badge: Badge }) {
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
