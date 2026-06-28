import { useState } from "react";
import type { ElementType } from "react";
import {
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Coins,
  Crown,
  Flame,
  Gift,
  GraduationCap,
  Layers,
  Lock,
  Medal,
  Radio,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Ticket,
  Trophy,
  UserCheck,
  Vault,
  Wallet,
  Waves,
  Zap,
} from "lucide-react";

type TokenUtility = {
  id: string;
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

type RewardTier = {
  title: string;
  level: string;
  requirement: string;
  reward: string;
};

type TokenRule = {
  title: string;
  status: string;
  text: string;
  icon: ElementType;
};

const utilities: TokenUtility[] = [
  {
    id: "xp",
    title: "OTT XP",
    status: "Live Mock",
    text: "Off-chain reputation points voor Academy, Check-In, safety reviews en Make Waves activity.",
    icon: Zap,
  },
  {
    id: "badges",
    title: "Badge Utility",
    status: "Identity",
    text: "Badges worden gebruikt voor proof, access, achievements, ranks en community status.",
    icon: BadgeCheck,
  },
  {
    id: "access",
    title: "Access Passes",
    status: "Future",
    text: "Gebruik XP, badges of token proof later voor events, courses, tools en partner access.",
    icon: Ticket,
  },
  {
    id: "marketplace",
    title: "Marketplace Rewards",
    status: "Shop",
    text: "XP en badges kunnen later unlocks geven in merch, tickets, courses en partner perks.",
    icon: Gift,
  },
  {
    id: "governance",
    title: "Community Voice",
    status: "Later",
    text: "Community voting, feedback, feature requests en builder support kunnen later gekoppeld worden.",
    icon: UserCheck,
  },
  {
    id: "founder",
    title: "Founder Layer",
    status: "Proof",
    text: "Early users, testers, builders en partners kunnen later founder proof of status krijgen.",
    icon: Crown,
  },
];

const rewardTiers: RewardTier[] = [
  {
    title: "Starter",
    level: "Level 1",
    requirement: "100 XP",
    reward: "XRPL Starter Badge",
  },
  {
    title: "Guardian",
    level: "Level 2",
    requirement: "250 XP",
    reward: "Wallet Safety Badge",
  },
  {
    title: "Builder",
    level: "Level 3",
    requirement: "589 XP",
    reward: "Make Waves Badge",
  },
  {
    title: "Founder",
    level: "Level 4",
    requirement: "2606 XP",
    reward: "Founder Access",
  },
];

const tokenRules: TokenRule[] = [
  {
    title: "No Token Promise",
    status: "Rule",
    text: "OTT XP is nu mock/off-chain. Geen winstbelofte, geen investment promise.",
    icon: ShieldCheck,
  },
  {
    title: "Utility First",
    status: "Design",
    text: "Eerst echte utility bouwen: learning, safety, access, rewards en community proof.",
    icon: Sparkles,
  },
  {
    title: "Wallet Proof Later",
    status: "Future",
    text: "Echte on-chain badges of tokens komen later pas met veilige wallet confirmation.",
    icon: Wallet,
  },
  {
    title: "Transparent Rules",
    status: "Required",
    text: "Gebruikers moeten altijd weten hoe XP, badges, tiers en rewards werken.",
    icon: Lock,
  },
];

const roadmap = [
  "XP systeem lokaal zichtbaar maken",
  "Academy XP koppelen",
  "Daily Check-In XP koppelen",
  "Badge vault uitbreiden",
  "Reward tiers opslaan per wallet",
  "Marketplace unlocks koppelen",
  "NFT badge minting later bouwen",
  "OTT utility paper schrijven",
];

export function OTTTokenCenterTab() {
  const [selectedUtility, setSelectedUtility] = useState<TokenUtility>(
    utilities[0]
  );
  const [selectedTier, setSelectedTier] = useState<RewardTier>(rewardTiers[0]);

  const SelectedUtilityIcon = selectedUtility.icon;

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 mb-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_35%)]" />

        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 xl:col-span-8">
            <div className="flex items-center gap-2 mb-4 text-white/45">
              <Coins size={17} />

              <p className="font-mono text-[10px] uppercase tracking-[0.35em]">
                OTT Token Center
              </p>
            </div>

            <h2 className="font-orbitron text-3xl xl:text-4xl font-black uppercase mb-4">
              XP. Badges. Rewards. Utility.
            </h2>

            <p className="font-mono text-sm text-white/45 max-w-3xl leading-relaxed">
              De OTT utility-laag van de terminal. Hier komen XP, badges,
              reward tiers, marketplace unlocks, founder proof, Make Waves
              activiteit en toekomstige on-chain utility samen.
            </p>
          </div>

          <div className="col-span-12 xl:col-span-4 grid grid-cols-2 gap-3">
            <StatBox icon={Zap} label="OTT XP" value="130" />
            <StatBox icon={BadgeCheck} label="Badges" value="4" />
            <StatBox icon={Flame} label="Streak" value="3 Days" />
            <StatBox icon={Waves} label="Source Tag" value="2606" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-4 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Layers size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Utility Modules
              </p>
            </div>

            <div className="space-y-3">
              {utilities.map((utility) => (
                <UtilityButton
                  key={utility.id}
                  utility={utility}
                  active={selectedUtility.id === utility.id}
                  onClick={() => setSelectedUtility(utility)}
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
                  Selected Utility
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  {selectedUtility.title}
                </h3>
              </div>

              <SelectedUtilityIcon size={22} className="text-white/60" />
            </div>

            <p className="font-mono text-sm text-white/45 leading-relaxed mb-5">
              {selectedUtility.text}
            </p>

            <MiniStatus label="Status" value={selectedUtility.status} />
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-2">
                  Reward Tiers
                </p>

                <h3 className="font-orbitron text-xl font-black uppercase">
                  Progression System
                </h3>
              </div>

              <Trophy size={20} className="text-white/60" />
            </div>

            <div className="space-y-3">
              {rewardTiers.map((tier) => (
                <TierRow
                  key={tier.title}
                  tier={tier}
                  active={selectedTier.title === tier.title}
                  onClick={() => setSelectedTier(tier)}
                />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Medal size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Selected Tier
              </p>
            </div>

            <p className="font-orbitron text-2xl font-black uppercase mb-2">
              {selectedTier.title}
            </p>

            <p className="font-mono text-[10px] text-white/35 uppercase tracking-widest mb-4">
              {selectedTier.level} • {selectedTier.requirement}
            </p>

            <p className="font-mono text-sm text-white/45 leading-relaxed">
              Reward: {selectedTier.reward}
            </p>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-3 space-y-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Target size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                Token Rules
              </p>
            </div>

            <div className="space-y-3">
              {tokenRules.map((rule) => (
                <RuleCard key={rule.title} rule={rule} />
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 size={18} className="text-white/60" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                XP Sources
              </p>
            </div>

            <div className="space-y-3">
              <SourceLine icon={GraduationCap} label="Academy lessons" value="+10" />
              <SourceLine icon={Zap} label="Daily Check-In" value="+10" />
              <SourceLine icon={ShieldCheck} label="Safety review" value="+15" />
              <SourceLine icon={Waves} label="Make Waves" value="+26" />
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
          <FeatureBox icon={Vault} title="Utility" text="Access and rewards" />
          <FeatureBox icon={Star} title="Badges" text="Identity proof" />
          <FeatureBox icon={Gift} title="Rewards" text="Marketplace unlocks" />
          <FeatureBox icon={Radio} title="On-chain Later" text="Safe launch path" />
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

function UtilityButton({
  utility,
  active,
  onClick,
}: {
  utility: TokenUtility;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = utility.icon;

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
            {utility.title}
          </p>
        </div>

        <p className="font-mono text-[10px] text-white/35 uppercase">
          {utility.status}
        </p>
      </div>
    </button>
  );
}

function TierRow({
  tier,
  active,
  onClick,
}: {
  tier: RewardTier;
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
          {tier.title}
        </p>

        <p className="font-mono text-[10px] text-white/45 uppercase">
          {tier.requirement}
        </p>
      </div>

      <p className="font-mono text-[10px] text-white/35 uppercase">
        {tier.level} • {tier.reward}
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

function RuleCard({ rule }: { rule: TokenRule }) {
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

function SourceLine({
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
