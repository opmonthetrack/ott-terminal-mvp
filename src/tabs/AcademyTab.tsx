import type { ElementType } from "react";
import {
  Award,
  BookOpen,
  Bot,
  BrainCircuit,
  CheckCircle2,
  Coins,
  FileText,
  GraduationCap,
  Layers,
  Lock,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Wallet,
  Zap,
} from "lucide-react";

type Track = {
  title: string;
  level: string;
  lessons: number;
  xp: number;
  status: string;
  icon: ElementType;
};

type Lesson = {
  title: string;
  track: string;
  duration: string;
  xp: number;
  status: string;
};

const tracks: Track[] = [
  {
    title: "Blockchain Basics",
    level: "Beginner",
    lessons: 8,
    xp: 200,
    status: "Open",
    icon: BookOpen,
  },
  {
    title: "Crypto Fundamentals",
    level: "Beginner",
    lessons: 10,
    xp: 250,
    status: "Open",
    icon: Coins,
  },
  {
    title: "XRP Ledger Essentials",
    level: "Intermediate",
    lessons: 14,
    xp: 500,
    status: "Open",
    icon: Layers,
  },
  {
    title: "Xaman Wallet Mastery",
    level: "Intermediate",
    lessons: 9,
    xp: 350,
    status: "Soon",
    icon: Wallet,
  },
  {
    title: "RLUSD & Stablecoins",
    level: "Intermediate",
    lessons: 12,
    xp: 450,
    status: "Soon",
    icon: ShieldCheck,
  },
  {
    title: "CBDC / ISO 20022 / Rails",
    level: "Advanced",
    lessons: 16,
    xp: 650,
    status: "Locked",
    icon: FileText,
  },
  {
    title: "AI on XRPL",
    level: "Advanced",
    lessons: 12,
    xp: 700,
    status: "Locked",
    icon: Bot,
  },
  {
    title: "Developer Bootcamp",
    level: "Expert",
    lessons: 24,
    xp: 1500,
    status: "Locked",
    icon: BrainCircuit,
  },
];

const lessons: Lesson[] = [
  {
    title: "What is blockchain?",
    track: "Blockchain Basics",
    duration: "8 min",
    xp: 25,
    status: "Start",
  },
  {
    title: "What makes XRPL different?",
    track: "XRP Ledger Essentials",
    duration: "12 min",
    xp: 40,
    status: "Start",
  },
  {
    title: "How wallets and keys work",
    track: "Crypto Fundamentals",
    duration: "10 min",
    xp: 35,
    status: "Start",
  },
  {
    title: "Understanding trustlines",
    track: "XRP Ledger Essentials",
    duration: "14 min",
    xp: 50,
    status: "Soon",
  },
  {
    title: "RLUSD and fiat-backed stablecoins",
    track: "Stablecoins",
    duration: "15 min",
    xp: 60,
    status: "Soon",
  },
  {
    title: "AI payments and X402",
    track: "AI on XRPL",
    duration: "18 min",
    xp: 80,
    status: "Locked",
  },
];

export function AcademyTab() {
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
              Learn. Earn. Build.
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              De educatiehub van de OTT Terminal. Gebruikers leren XRPL,
              wallets, stablecoins, CBDC, ISO 20022, AI en developer skills
              terwijl ze XP, badges, certificaten en later tokens verdienen.
            </p>
          </div>

          <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-3">
            <StatBox icon={BookOpen} label="Courses" value="8" />
            <StatBox icon={PlayCircle} label="Lessons" value="105+" />
            <StatBox icon={Star} label="XP Pool" value="4,605" />
            <StatBox icon={Award} label="Badges" value="Soon" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-8 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Course Tracks
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  Learning Paths
                </h3>
              </div>

              <Sparkles size={20} className="text-white/60" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tracks.map((track) => (
                <TrackCard key={track.title} track={track} />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Today&apos;s Lessons
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  Start Learning
                </h3>
              </div>

              <PlayCircle size={20} className="text-white/60" />
            </div>

            <div className="space-y-3">
              {lessons.map((lesson) => (
                <LessonRow key={lesson.title} lesson={lesson} />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-4 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Trophy size={18} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                Learn & Earn Progress
              </p>
            </div>

            <div className="space-y-4">
              <ProgressItem label="Academy Progress" value={12} />
              <ProgressItem label="XRPL Knowledge" value={18} />
              <ProgressItem label="Wallet Skills" value={8} />
              <ProgressItem label="Developer Path" value={0} />
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Bot size={18} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                AI Tutor
              </p>
            </div>

            <p className="font-mono text-xs text-white/45 leading-relaxed mb-5">
              Later krijgt iedere les een AI Tutor. Gebruikers kunnen vragen
              stellen, voorbeelden krijgen, quizvragen oefenen en moeilijke
              onderwerpen eenvoudig laten uitleggen.
            </p>

            <button className="w-full border border-white/15 py-3 font-orbitron text-xs uppercase tracking-widest text-white/40 cursor-not-allowed">
              AI Tutor Coming Soon
            </button>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <ShieldCheck size={18} className="text-white/60" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                Certificates
              </p>
            </div>

            <p className="font-mono text-xs text-white/45 leading-relaxed">
              Certificaten en NFT badges komen later als bewijs van afgeronde
              tracks. Eerst bouwen we XP, quizzen en voortgang veilig in de app.
            </p>
          </div>
        </div>

        <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <FeatureBox icon={CheckCircle2} title="Quizzes" text="Knowledge checks" />
          <FeatureBox icon={Award} title="NFT Badges" text="Proof of learning" />
          <FeatureBox icon={Coins} title="OTT Rewards" text="Token utility later" />
          <FeatureBox icon={Zap} title="Daily Missions" text="Retention engine" />
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

      <p className="font-orbitron text-lg font-black uppercase">{value}</p>
    </div>
  );
}

function TrackCard({ track }: { track: Track }) {
  const Icon = track.icon;
  const isLocked = track.status === "Locked";

  return (
    <div className="border border-white/10 bg-black hover:bg-white/[0.03] transition-all p-5 cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <Icon size={20} className="text-white/70" />

        <span className="font-mono text-[10px] uppercase text-white/45">
          {track.status}
        </span>
      </div>

      <h4 className="font-orbitron text-sm font-bold uppercase mb-2">
        {track.title}
      </h4>

      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-4">
        {track.level}
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="border border-white/10 p-3">
          <p className="font-mono text-[10px] text-white/35 uppercase mb-1">
            Lessons
          </p>
          <p className="font-orbitron text-sm font-black">{track.lessons}</p>
        </div>

        <div className="border border-white/10 p-3">
          <p className="font-mono text-[10px] text-white/35 uppercase mb-1">
            XP
          </p>
          <p className="font-orbitron text-sm font-black">{track.xp}</p>
        </div>
      </div>

      {isLocked && (
        <div className="flex items-center gap-2 mt-4 text-white/30">
          <Lock size={13} />
          <p className="font-mono text-[10px] uppercase">Unlock later</p>
        </div>
      )}
    </div>
  );
}

function LessonRow({ lesson }: { lesson: Lesson }) {
  const isLocked = lesson.status === "Locked";

  return (
    <div className="border border-white/10 bg-black p-4 flex items-center justify-between hover:bg-white/[0.03] transition-all cursor-pointer">
      <div className="flex items-center gap-3">
        {isLocked ? (
          <Lock size={17} className="text-white/35" />
        ) : (
          <PlayCircle size={17} className="text-white/60" />
        )}

        <div>
          <p className="font-orbitron text-sm font-bold uppercase mb-1">
            {lesson.title}
          </p>

          <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest">
            {lesson.track} • {lesson.duration} • {lesson.xp} XP
          </p>
        </div>
      </div>

      <p className="font-mono text-[10px] text-white/45 uppercase">
        {lesson.status}
      </p>
    </div>
  );
}

function ProgressItem({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="font-mono text-xs text-white/55 uppercase">{label}</p>
        <p className="font-mono text-[10px] text-white/35">{value}%</p>
      </div>

      <div className="h-2 bg-white/10 overflow-hidden">
        <div
          className="h-full bg-white transition-all"
          style={{ width: `${Math.max(0, Math.min(value, 100))}%` }}
        />
      </div>
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
