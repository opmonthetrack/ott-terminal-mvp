import {
  Award,
  Coins,
  Flame,
  Gift,
  Medal,
  ShieldCheck,
  Star,
  Trophy,
  Wallet,
} from "lucide-react";

const rewards = [
  {
    title: "Daily Login",
    reward: "+5 XP",
    status: "Available",
  },
  {
    title: "Read News",
    reward: "+10 XP",
    status: "Available",
  },
  {
    title: "Complete Lesson",
    reward: "+25 XP",
    status: "Available",
  },
  {
    title: "Pass Quiz",
    reward: "+50 XP",
    status: "Available",
  },
  {
    title: "Daily Check-In",
    reward: "+1 OTT",
    status: "Soon",
  },
  {
    title: "Refer Friend",
    reward: "+25 OTT",
    status: "Soon",
  },
];

export function RewardCenterWidget() {
  return (
    <div className="border border-white/10 bg-white/[0.02] p-6">

      <div className="flex justify-between items-center mb-6">

        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/35 mb-2">
            Community Rewards
          </p>

          <h2 className="font-orbitron text-xl font-black uppercase">
            Reward Center
          </h2>
        </div>

        <Gift className="text-white/60" size={20} />

      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">

        <Stat icon={Star} value="130" label="XP" />

        <Stat icon={Coins} value="0" label="OTT" />

        <Stat icon={Flame} value="3" label="Streak" />

        <Stat icon={Trophy} value="1" label="Level" />

      </div>

      <div className="space-y-3">

        {rewards.map((reward) => (

          <div
            key={reward.title}
            className="border border-white/10 bg-black p-4 hover:bg-white/[0.03] transition-all cursor-pointer"
          >

            <div className="flex justify-between">

              <div>

                <div className="flex items-center gap-2 mb-2">

                  <Award size={15} className="text-white/70" />

                  <p className="font-orbitron text-sm font-bold uppercase">
                    {reward.title}
                  </p>

                </div>

                <p className="font-mono text-[10px] uppercase tracking-widest text-white/35">
                  Reward: {reward.reward}
                </p>

              </div>

              <span className="font-mono text-[10px] uppercase text-white/45">
                {reward.status}
              </span>

            </div>

          </div>

        ))}

      </div>

      <div className="grid grid-cols-3 gap-3 mt-6">

        <BottomCard
          icon={Wallet}
          title="Wallet Rewards"
        />

        <BottomCard
          icon={ShieldCheck}
          title="Security Bonus"
        />

        <BottomCard
          icon={Medal}
          title="Season Rewards"
        />

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

      <Icon className="mx-auto mb-3 text-white/60" size={18} />

      <p className="font-orbitron text-lg font-black">
        {value}
      </p>

      <p className="font-mono text-[10px] uppercase text-white/35 mt-1">
        {label}
      </p>

    </div>
  );
}

function BottomCard({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="border border-white/10 bg-black p-4 text-center">

      <Icon className="mx-auto mb-3 text-white/60" size={18} />

      <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
        {title}
      </p>

    </div>
  );
}
