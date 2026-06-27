import {
  ArrowUpRight,
  Award,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  Coins,
  GraduationCap,
  Lock,
  PlayCircle,
  Star,
  Trophy,
} from "lucide-react";

const courses = [
  {
    title: "Blockchain Basics",
    xp: 25,
    reward: "5 OTT",
    level: "Beginner",
    status: "Available",
  },
  {
    title: "Crypto Fundamentals",
    xp: 35,
    reward: "8 OTT",
    level: "Beginner",
    status: "Available",
  },
  {
    title: "XRP Ledger Essentials",
    xp: 50,
    reward: "15 OTT",
    level: "Intermediate",
    status: "Available",
  },
  {
    title: "Xaman Wallet",
    xp: 40,
    reward: "10 OTT",
    level: "Intermediate",
    status: "Coming Soon",
  },
  {
    title: "RLUSD & Stablecoins",
    xp: 45,
    reward: "12 OTT",
    level: "Intermediate",
    status: "Coming Soon",
  },
  {
    title: "CBDC & ISO 20022",
    xp: 60,
    reward: "20 OTT",
    level: "Advanced",
    status: "Locked",
  },
  {
    title: "AI on XRPL",
    xp: 80,
    reward: "25 OTT",
    level: "Advanced",
    status: "Locked",
  },
  {
    title: "Developer Bootcamp",
    xp: 150,
    reward: "50 OTT",
    level: "Expert",
    status: "Locked",
  },
];

export function LearnEarnWidget() {
  return (
    <div className="border border-white/10 bg-white/[0.02] p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/35 mb-2">
            Academy Ecosystem
          </p>

          <h2 className="font-orbitron text-xl font-black uppercase">
            Learn & Earn
          </h2>
        </div>

        <GraduationCap className="text-white/60" size={20} />
      </div>

      <div className="border border-white/10 bg-black p-5 mb-4">
        <div className="flex items-start gap-3">
          <BrainCircuit size={18} className="text-white/60 mt-0.5" />

          <div>
            <p className="font-orbitron text-sm font-bold uppercase mb-2">
              Vision
            </p>

            <p className="font-mono text-xs text-white/45 leading-relaxed">
              Voltooi lessen, sla quizzes, verdien XP, unlock NFT badges en
              ontvang OTT Tokens. Uiteindelijk wordt iedere cursus interactief,
              met AI Tutor, certificaten en on-chain achievements.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {courses.map((course) => (
          <div
            key={course.title}
            className="border border-white/10 bg-black hover:bg-white/[0.03] transition-all p-4 cursor-pointer"
          >
            <div className="flex justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {course.status === "Locked" ? (
                    <Lock size={15} className="text-white/60" />
                  ) : (
                    <BookOpen size={15} className="text-white/60" />
                  )}

                  <p className="font-orbitron text-sm font-bold uppercase">
                    {course.title}
                  </p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <span className="flex items-center gap-1 font-mono text-[10px] uppercase text-white/35">
                    <Award size={10} />
                    {course.level}
                  </span>

                  <span className="flex items-center gap-1 font-mono text-[10px] uppercase text-white/35">
                    <Star size={10} />
                    {course.xp} XP
                  </span>

                  <span className="flex items-center gap-1 font-mono text-[10px] uppercase text-white/35">
                    <Coins size={10} />
                    {course.reward}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <p className="font-mono text-[10px] uppercase text-white/45 mb-2">
                  {course.status}
                </p>

                <ArrowUpRight
                  size={15}
                  className="ml-auto text-white/20"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-3 mt-6">
        <Stat icon={CheckCircle2} value="0" label="Completed" />
        <Stat icon={PlayCircle} value="8" label="Courses" />
        <Stat icon={Trophy} value="0" label="Badges" />
        <Stat icon={Coins} value="0" label="OTT Earned" />
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
}) {
  return (
    <div className="border border-white/10 bg-black p-4 text-center">
      <Icon size={18} className="mx-auto mb-3 text-white/60" />

      <p className="font-orbitron text-lg font-black">{value}</p>

      <p className="font-mono text-[10px] uppercase text-white/35 mt-1">
        {label}
      </p>
    </div>
  );
}
