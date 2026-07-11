import { useMemo, useState } from "react";
import type { ElementType, ReactNode } from "react";
import {
  Award,
  BadgeCheck,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  ClipboardCheck,
  Crown,
  FileCheck2,
  Gift,
  GraduationCap,
  LockKeyhole,
  Medal,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Wallet,
} from "lucide-react";
import { OTTLogo, OTTProofBadge } from "../components/OTTLogo";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

type RewardLedgerTabProps = {
  walletAddress?: string;
};

type RewardView = "overview" | "xp" | "proof" | "policy";

type RewardItem = {
  id: string;
  titleNl: string;
  titleEn: string;
  textNl: string;
  textEn: string;
  xp: number;
  status: "available" | "locked" | "completed";
  proofType: string;
  icon: ElementType;
};

const rewards: RewardItem[] = [
  {
    id: "xaman-login",
    titleNl: "Xaman Login",
    titleEn: "Xaman Login",
    textNl: "Koppel je wallet veilig zonder custody.",
    textEn: "Connect your wallet safely without custody.",
    xp: 15,
    status: "completed",
    proofType: "Wallet proof",
    icon: Wallet,
  },
  {
    id: "academy-starter",
    titleNl: "Academy Starter Les",
    titleEn: "Academy Starter Lesson",
    textNl: "Rond de eerste XRPL starter les af.",
    textEn: "Complete the first XRPL starter lesson.",
    xp: 25,
    status: "available",
    proofType: "Education proof",
    icon: GraduationCap,
  },
  {
    id: "sourcetag-proof",
    titleNl: "SourceTag Proof",
    titleEn: "SourceTag Proof",
    textNl: "Verifieer een transactie met SourceTag 2606170002.",
    textEn: "Verify a transaction with SourceTag 2606170002.",
    xp: 50,
    status: "available",
    proofType: "XRPL proof",
    icon: BadgeCheck,
  },
  {
    id: "access-pass",
    titleNl: "Access Pass Holder",
    titleEn: "Access Pass Holder",
    textNl: "Unlock premium toegang via OTT Access Pass NFT.",
    textEn: "Unlock premium access through the OTT Access Pass NFT.",
    xp: 100,
    status: "locked",
    proofType: "NFT proof",
    icon: Crown,
  },
  {
    id: "partner-brief",
    titleNl: "Partner Brief Klaar",
    titleEn: "Partner Brief Ready",
    textNl: "Maak een partner brief voor educatie, commerce of builder route.",
    textEn: "Create a partner brief for education, commerce or builder route.",
    xp: 75,
    status: "locked",
    proofType: "Partner proof",
    icon: FileCheck2,
  },
];

const levels = [
  { level: "L1", titleNl: "Starter", titleEn: "Starter", minXp: 0 },
  { level: "L2", titleNl: "Explorer", titleEn: "Explorer", minXp: 50 },
  { level: "L3", titleNl: "Builder", titleEn: "Builder", minXp: 150 },
  { level: "L4", titleNl: "Proof Holder", titleEn: "Proof Holder", minXp: 300 },
];

export function RewardLedgerTab({ walletAddress = "guest" }: RewardLedgerTabProps) {
  const { language } = useTerminalLanguage();
  const isEnglish = language === "en";

  const [view, setView] = useState<RewardView>("overview");
  const [completedIds, setCompletedIds] = useState<string[]>(() =>
    rewards.filter((reward) => reward.status === "completed").map((reward) => reward.id),
  );

  const totalXp = useMemo(
    () =>
      rewards
        .filter((reward) => completedIds.includes(reward.id))
        .reduce((sum, reward) => sum + reward.xp, 0),
    [completedIds],
  );

  const currentLevel = useMemo(() => {
    return [...levels].reverse().find((level) => totalXp >= level.minXp) ?? levels[0];
  }, [totalXp]);

  const nextLevel = useMemo(() => {
    return levels.find((level) => totalXp < level.minXp) ?? null;
  }, [totalXp]);

  const progressToNext = nextLevel
    ? Math.min(100, Math.round((totalXp / nextLevel.minXp) * 100))
    : 100;

  function toggleComplete(rewardId: string) {
    setCompletedIds((current) =>
      current.includes(rewardId)
        ? current.filter((id) => id !== rewardId)
        : [...current, rewardId],
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#080808]">
      <section className="relative overflow-hidden border-b border-black/10 bg-[radial-gradient(circle_at_18%_18%,rgba(56,152,232,0.16),transparent_28%),radial-gradient(circle_at_82%_8%,rgba(200,56,136,0.16),transparent_28%),radial-gradient(circle_at_85%_82%,rgba(216,72,88,0.12),transparent_30%),#ffffff]">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.26),#ffffff_92%)]" />

        <div className="relative z-10 p-4 md:p-6 xl:p-10">
          <div className="grid grid-cols-12 gap-6 items-end">
            <div className="col-span-12 xl:col-span-8">
              <div className="mb-6">
                <OTTLogo
                  size="lg"
                  subtitle={isEnglish ? "XP, proof and learning progress" : "XP, proof en leerprogressie"}
                />
              </div>

              <div className="inline-flex items-center gap-2 border border-black/10 bg-white/80 shadow-sm px-4 py-2 mb-6">
                <Trophy size={15} className="text-[#C83888]" />

                <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/55">
                  {isEnglish ? "Reward Ledger V1.0" : "Beloningsoverzicht V1.0"}
                </p>
              </div>

              <h1 className="font-orbitron text-4xl xl:text-6xl font-black uppercase leading-none tracking-tight mb-6">
                {isEnglish ? "Track XP." : "Track XP."}
                <br />
                <span className="bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] bg-clip-text text-transparent">
                  {isEnglish ? "Prove Growth." : "Bewijs Groei."}
                </span>
              </h1>

              <p className="font-mono text-sm xl:text-base text-black/60 leading-relaxed max-w-3xl mb-8">
                {isEnglish
                  ? "Reward Ledger turns learning actions, wallet proofs and service tasks into XP and proof-ready milestones. XP is off-chain and has no token value promise."
                  : "Reward Ledger zet leeracties, wallet proofs en service taken om in XP en proof-ready mijlpalen. XP is off-chain en heeft geen token-waarde belofte."}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl">
                <MetricCard label="XP" value={String(totalXp)} text={isEnglish ? "Off-chain score" : "Off-chain score"} icon={Sparkles} />
                <MetricCard label={isEnglish ? "Level" : "Level"} value={currentLevel.level} text={isEnglish ? currentLevel.titleEn : currentLevel.titleNl} icon={Medal} />
                <MetricCard label={isEnglish ? "Proofs" : "Proofs"} value={String(completedIds.length)} text={isEnglish ? "Completed" : "Afgerond"} icon={BadgeCheck} />
                <MetricCard label="Wallet" value={walletAddress === "guest" ? "Guest" : "Linked"} text="Xaman" icon={Wallet} />
              </div>
            </div>

            <div className="col-span-12 xl:col-span-4">
              <div className="border border-black/10 bg-white/90 backdrop-blur p-5 shadow-xl shadow-black/5">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <p className="font-orbitron text-xs uppercase tracking-widest">
                    {isEnglish ? "Ledger Status" : "Ledgerstatus"}
                  </p>

                  <div className="border border-black/10 bg-[#F7F8FC] px-3 py-2">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-black/55">
                      V1
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <OTTProofBadge sourceTag="2606170002" />
                </div>

                <div className="space-y-3">
                  <InfoRow label="Wallet" value={walletAddress === "guest" ? "Guest / Free Preview" : walletAddress} />
                  <InfoRow label={isEnglish ? "Current Level" : "Huidig Level"} value={`${currentLevel.level} · ${isEnglish ? currentLevel.titleEn : currentLevel.titleNl}`} />
                  <InfoRow label={isEnglish ? "Next Level" : "Volgend Level"} value={nextLevel ? `${nextLevel.level} · ${nextLevel.minXp} XP` : "Max"} />
                  <InfoRow label={isEnglish ? "Progress" : "Voortgang"} value={`${progressToNext}%`} />
                </div>

                <div className="border border-[#C83888]/25 bg-[#C83888]/10 p-4 mt-5">
                  <div className="flex items-start gap-3">
                    <ShieldCheck size={18} className="text-[#C83888] mt-0.5 shrink-0" />

                    <p className="font-mono text-xs text-black/60 leading-relaxed">
                      {isEnglish
                        ? "XP is a learning and engagement score only. No yield, no resale value and no token conversion until legal review."
                        : "XP is alleen een leer- en engagementscore. Geen yield, geen resale waarde en geen token conversie tot legal review."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-8">
            <ModeButton active={view === "overview"} label={isEnglish ? "Overview" : "Overzicht"} onClick={() => setView("overview")} />
            <ModeButton active={view === "xp"} label="XP" onClick={() => setView("xp")} />
            <ModeButton active={view === "proof"} label="Proof" onClick={() => setView("proof")} />
            <ModeButton active={view === "policy"} label={isEnglish ? "Policy" : "Beleid"} onClick={() => setView("policy")} />
          </div>
        </div>
      </section>

      <section className="p-4 md:p-6 xl:p-10 bg-white">
        {view === "overview" && (
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 xl:col-span-8">
              <Panel title={isEnglish ? "Reward Milestones" : "Reward Mijlpalen"} icon={ClipboardCheck}>
                <div className="space-y-3">
                  {rewards.map((reward) => (
                    <RewardRow
                      key={reward.id}
                      reward={reward}
                      language={language}
                      completed={completedIds.includes(reward.id)}
                      onToggle={() => toggleComplete(reward.id)}
                    />
                  ))}
                </div>
              </Panel>
            </div>

            <div className="col-span-12 xl:col-span-4 space-y-4">
              <Panel title={isEnglish ? "Level Path" : "Level Pad"} icon={BarChart3}>
                <div className="space-y-3">
                  {levels.map((level) => (
                    <LevelLine
                      key={level.level}
                      level={level}
                      language={language}
                      active={currentLevel.level === level.level}
                      unlocked={totalXp >= level.minXp}
                    />
                  ))}
                </div>
              </Panel>

              <Panel title={isEnglish ? "V1 Next Build" : "Volgende V1 Bouw"} icon={Target}>
                <div className="space-y-3">
                  <StatusLine text={isEnglish ? "Save XP server-side." : "XP server-side opslaan."} />
                  <StatusLine text={isEnglish ? "Connect Academy completion." : "Academy afronding koppelen."} />
                  <StatusLine text={isEnglish ? "Connect Access Pass holder proof." : "Access Pass holder proof koppelen."} />
                  <StatusLine text={isEnglish ? "Generate certificate/proof record." : "Certificaat/proof record genereren."} />
                </div>
              </Panel>
            </div>
          </div>
        )}

        {view === "xp" && (
          <Panel title={isEnglish ? "XP Dashboard" : "XP Dashboard"} icon={Sparkles}>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 xl:col-span-7 border border-black/10 bg-[#F7F8FC] p-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/35 mb-4">
                  {isEnglish ? "Current XP" : "Huidige XP"}
                </p>

                <p className="font-orbitron text-6xl font-black uppercase mb-5">
                  {totalXp}
                </p>

                <div className="h-3 bg-white border border-black/10 mb-4 overflow-hidden">
                  <div
                    className="h-full bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)]"
                    style={{ width: `${progressToNext}%` }}
                  />
                </div>

                <p className="font-mono text-xs text-black/55 leading-relaxed">
                  {nextLevel
                    ? isEnglish
                      ? `${nextLevel.minXp - totalXp} XP until ${nextLevel.level}.`
                      : `${nextLevel.minXp - totalXp} XP tot ${nextLevel.level}.`
                    : isEnglish
                      ? "Highest V1 level reached."
                      : "Hoogste V1 level bereikt."}
                </p>
              </div>

              <div className="col-span-12 xl:col-span-5">
                <div className="grid grid-cols-1 gap-3">
                  <InfoRow label={isEnglish ? "Current Level" : "Huidig Level"} value={`${currentLevel.level} · ${isEnglish ? currentLevel.titleEn : currentLevel.titleNl}`} />
                  <InfoRow label={isEnglish ? "Completed Proofs" : "Afgeronde Proofs"} value={String(completedIds.length)} />
                  <InfoRow label={isEnglish ? "Available XP" : "Beschikbare XP"} value={String(rewards.reduce((sum, reward) => sum + reward.xp, 0))} />
                  <InfoRow label={isEnglish ? "Token Status" : "Token Status"} value={isEnglish ? "Locked / legal review" : "Locked / legal review"} />
                </div>
              </div>
            </div>
          </Panel>
        )}

        {view === "proof" && (
          <Panel title={isEnglish ? "Proof Ledger" : "Proof Ledger"} icon={FileCheck2}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rewards.map((reward) => (
                <ProofCard
                  key={reward.id}
                  reward={reward}
                  language={language}
                  completed={completedIds.includes(reward.id)}
                />
              ))}
            </div>
          </Panel>
        )}

        {view === "policy" && (
          <Panel title={isEnglish ? "Reward Policy" : "Beloningsbeleid"} icon={ShieldCheck}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PolicyBox
                title={isEnglish ? "What XP Is" : "Wat XP Is"}
                lines={[
                  isEnglish ? "Learning progress score." : "Leerprogressie score.",
                  isEnglish ? "Engagement and completion marker." : "Engagement en afrondingsmarker.",
                  isEnglish ? "Can support certificates and proof." : "Kan certificaten en proof ondersteunen.",
                ]}
              />
              <PolicyBox
                title={isEnglish ? "What XP Is Not" : "Wat XP Niet Is"}
                premium
                lines={[
                  isEnglish ? "Not a token." : "Geen token.",
                  isEnglish ? "No guaranteed value." : "Geen gegarandeerde waarde.",
                  isEnglish ? "No yield or investment promise." : "Geen yield- of investeringsbelofte.",
                  isEnglish ? "No conversion before legal review." : "Geen conversie vóór legal review.",
                ]}
              />
            </div>
          </Panel>
        )}
      </section>
    </div>
  );
}

function RewardRow({
  reward,
  language,
  completed,
  onToggle,
}: {
  reward: RewardItem;
  language: "nl" | "en";
  completed: boolean;
  onToggle: () => void;
}) {
  const isEnglish = language === "en";
  const Icon = reward.icon;
  const locked = reward.status === "locked" && !completed;

  return (
    <div className={`border p-4 md:p-5 ${completed ? "border-[#3898E8]/25 bg-[#3898E8]/10" : "border-black/10 bg-[#F7F8FC]"}`}>
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="w-12 h-12 border border-black/10 bg-white flex items-center justify-center shrink-0">
          <Icon size={21} className={completed ? "text-[#3898E8]" : locked ? "text-black/30" : "text-[#C83888]"} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-widest text-black/35 mb-2">
            {reward.proofType} · +{reward.xp} XP
          </p>

          <p className="font-orbitron text-sm font-black uppercase text-black mb-2">
            {isEnglish ? reward.titleEn : reward.titleNl}
          </p>

          <p className="font-mono text-xs text-black/55 leading-relaxed">
            {isEnglish ? reward.textEn : reward.textNl}
          </p>
        </div>

        <button
          onClick={onToggle}
          className={`border px-4 py-3 transition-all ${
            completed
              ? "border-[#3898E8]/25 bg-white text-[#3898E8]"
              : locked
                ? "border-black/10 bg-white text-black/30"
                : "border-black/10 bg-white text-black/55 hover:text-black"
          }`}
        >
          <span className="font-orbitron text-[10px] font-black uppercase">
            {completed
              ? isEnglish
                ? "Done"
                : "Klaar"
              : locked
                ? isEnglish
                  ? "Locked"
                  : "Locked"
                : isEnglish
                  ? "Mark"
                  : "Markeer"}
          </span>
        </button>
      </div>
    </div>
  );
}

function LevelLine({
  level,
  language,
  active,
  unlocked,
}: {
  level: (typeof levels)[number];
  language: "nl" | "en";
  active: boolean;
  unlocked: boolean;
}) {
  const isEnglish = language === "en";

  return (
    <div className={`border p-4 ${active ? "border-[#C83888] bg-[#C83888]/10" : "border-black/10 bg-[#F7F8FC]"}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-orbitron text-sm font-black uppercase">
            {level.level} · {isEnglish ? level.titleEn : level.titleNl}
          </p>
          <p className="font-mono text-[10px] text-black/40 uppercase tracking-widest mt-1">
            {level.minXp} XP
          </p>
        </div>

        {unlocked ? (
          <CheckCircle2 size={18} className="text-[#3898E8]" />
        ) : (
          <LockKeyhole size={18} className="text-black/25" />
        )}
      </div>
    </div>
  );
}

function ProofCard({
  reward,
  language,
  completed,
}: {
  reward: RewardItem;
  language: "nl" | "en";
  completed: boolean;
}) {
  const isEnglish = language === "en";
  const Icon = reward.icon;

  return (
    <div className={`border p-5 ${completed ? "border-[#3898E8]/25 bg-[#3898E8]/10" : "border-black/10 bg-[#F7F8FC]"}`}>
      <div className="flex items-start gap-3 mb-4">
        <Icon size={22} className={completed ? "text-[#3898E8]" : "text-[#C83888]"} />

        <div>
          <p className="font-orbitron text-sm font-black uppercase mb-2">
            {isEnglish ? reward.titleEn : reward.titleNl}
          </p>
          <p className="font-mono text-xs text-black/55 leading-relaxed">
            {reward.proofType}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <InfoRow label="XP" value={String(reward.xp)} />
        <InfoRow label="Status" value={completed ? "Completed" : reward.status === "locked" ? "Locked" : "Available"} />
        <InfoRow label="SourceTag" value="2606170002" />
      </div>
    </div>
  );
}

function PolicyBox({
  title,
  lines,
  premium = false,
}: {
  title: string;
  lines: string[];
  premium?: boolean;
}) {
  return (
    <div className={`border p-5 ${premium ? "border-[#C83888]/25 bg-[#C83888]/10" : "border-[#3898E8]/25 bg-[#3898E8]/10"}`}>
      <p className="font-orbitron text-lg font-black uppercase mb-5">{title}</p>

      <div className="space-y-3">
        {lines.map((line) => (
          <StatusLine key={line} text={line} />
        ))}
      </div>
    </div>
  );
}

function StatusLine({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 border border-black/10 bg-white p-3">
      <CheckCircle2 size={14} className="text-[#3898E8] shrink-0 mt-0.5" />
      <p className="font-mono text-xs text-black/55 leading-relaxed">{text}</p>
    </div>
  );
}

function ModeButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 border font-orbitron text-[10px] font-black uppercase tracking-widest transition-all ${
        active
          ? "bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] text-white border-transparent"
          : "bg-white text-black/50 border-black/10 hover:text-black hover:bg-[#F7F8FC]"
      }`}
    >
      {label}
    </button>
  );
}

function MetricCard({
  label,
  value,
  text,
  icon: Icon,
}: {
  label: string;
  value: string;
  text: string;
  icon: ElementType;
}) {
  return (
    <div className="border border-black/10 bg-white/90 p-4 shadow-sm">
      <Icon size={18} className="text-[#C83888] mb-3" />
      <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">{label}</p>
      <p className="font-orbitron text-sm font-black uppercase mb-1 break-all">{value}</p>
      <p className="font-mono text-[10px] text-black/35 uppercase">{text}</p>
    </div>
  );
}

function Panel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: ElementType;
  children: ReactNode;
}) {
  return (
    <div className="border border-black/10 bg-white p-5 md:p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <Icon size={18} className="text-[#3898E8]" />
        <p className="font-orbitron text-xs uppercase tracking-widest">{title}</p>
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-3">
      <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">{label}</p>
      <p className="font-orbitron text-xs font-black uppercase break-all">{value}</p>
    </div>
  );
}

export default RewardLedgerTab;
