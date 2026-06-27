import type { ElementType } from "react";
import {
  Award,
  Coins,
  Flame,
  Gift,
  Lock,
  Medal,
  ShieldCheck,
  ShoppingBag,
  Star,
  Trophy,
  Vote,
  Wallet,
  Zap,
} from "lucide-react";

const rewardItems = [
  { title: "Daily Login", value: "+5 XP", status: "Live" },
  { title: "Read Intel", value: "+10 XP", status: "Live" },
  { title: "Finish Lesson", value: "+25 XP", status: "Soon" },
  { title: "Daily Check-In", value: "+1 OTT", status: "Soon" },
  { title: "Quiz Passed", value: "+50 XP", status: "Soon" },
  { title: "Refer Friend", value: "+25 OTT", status: "Later" },
];

export function OTTTokenCenterTab() {
  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="border border-white/10 bg-white/[0.02] p-6 mb-6">
        <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-4">
          OTT Economy System
        </p>

        <h2 className="font-orbitron text-3xl font-black uppercase mb-4">
          OTT Token Center
        </h2>

        <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
          Centrale plek voor XP, OTT Tokens, rewards, staking, governance,
          badges, marketplace korting en toekomstige Learn & Earn claims.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <StatBox icon={Wallet} label="Wallet" value="Connected" />
        <StatBox icon={Star} label="OTT XP" value="130 XP" />
        <StatBox icon={Coins} label="OTT Token" value="0 OTT" />
        <StatBox icon={Flame} label="Daily Streak" value="3 Days" />

        <div className="col-span-12 xl:col-span-8 border border-white/10 bg-white/[0.02] p-6">
          <div className="flex items-center gap-2 mb-5">
            <Gift size={18} className="text-white/60" />
            <h3 className="font-orbitron text-lg font-black uppercase">
              Reward Missions
            </h3>
          </div>

          <div className="space-y-3">
            {rewardItems.map((item) => (
              <div
                key={item.title}
                className="border border-white/10 bg-black p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-orbitron text-sm font-bold uppercase mb-1">
                    {item.title}
                  </p>
                  <p className="font-mono text-[10px] text-white/35 uppercase">
                    Reward: {item.value}
                  </p>
                </div>

                <p className="font-mono text-[10px] text-white/45 uppercase">
                  {item.status}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 xl:col-span-4 space-y-4">
          <SideBox icon={Lock} title="Staking" text="Later: lock OTT voor access, boosts en governance weight." />
          <SideBox icon={Vote} title="Governance" text="Later: stemmen op modules, features, rewards en community keuzes." />
          <SideBox icon={ShoppingBag} title="Marketplace" text="Later: XP en OTT gebruiken voor korting, merch, NFT badges en courses." />
        </div>

        <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <FeatureBox icon={Award} title="Badges" />
          <FeatureBox icon={Trophy} title="Leaderboard" />
          <FeatureBox icon={Medal} title="Season Rewards" />
          <FeatureBox icon={ShieldCheck} title="Anti-Bot Shield" />
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
    <div className="col-span-12 md:col-span-6 xl:col-span-3 border border-white/10 bg-white/[0.02] p-5">
      <Icon size={20} className="text-white/60 mb-4" />
      <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-2">
        {label}
      </p>
      <p className="font-orbitron text-xl font-black uppercase">{value}</p>
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
    <div className="border border-white/10 bg-white/[0.02] p-5">
      <Icon size={18} className="text-white/60 mb-4" />
      <p className="font-orbitron text-sm font-bold uppercase mb-2">{title}</p>
      <p className="font-mono text-xs text-white/45 leading-relaxed">{text}</p>
    </div>
  );
}

function FeatureBox({
  icon: Icon,
  title,
}: {
  icon: ElementType;
  title: string;
}) {
  return (
    <div className="border border-white/10 bg-black p-5 text-center">
      <Icon size={20} className="mx-auto mb-3 text-white/60" />
      <p className="font-mono text-[10px] uppercase tracking-widest text-white/45">
        {title}
      </p>
    </div>
  );
}
