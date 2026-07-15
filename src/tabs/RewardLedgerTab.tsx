import { useEffect, useMemo, useState } from "react";
import type { ElementType, ReactNode } from "react";
import {
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  GraduationCap,
  LockKeyhole,
  Medal,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Wallet,
} from "lucide-react";
import { OTTLogo, OTTProofBadge } from "../components/OTTLogo";
import {
  createEmptyRewardState,
  getAvailableRewardActions,
  getRewardSummary,
  loadRewardState,
  type RewardEvent,
  type RewardState,
} from "../lib/rewardStore";
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
  ottCredits: number;
  completed: boolean;
  proofType: string;
  icon: ElementType;
};

const rewardMeta: Record<
  string,
  {
    titleNl: string;
    titleEn: string;
    textNl: string;
    textEn: string;
    proofType: string;
    icon: ElementType;
  }
> = {
  "daily-checkin": {
    titleNl: "Dagelijkse Check-in",
    titleEn: "Daily Check-In",
    textNl: "Voltooi een geldige dagelijkse XRPL-actie.",
    textEn: "Complete a valid daily XRPL action.",
    proofType: "Activity proof",
    icon: CheckCircle2,
  },
  "source-tag-proof": {
    titleNl: "SourceTag Proof",
    titleEn: "SourceTag Proof",
    textNl: "Verifieer een transactie met SourceTag 2606170002.",
    textEn: "Verify a transaction with SourceTag 2606170002.",
    proofType: "XRPL proof",
    icon: BadgeCheck,
  },
  "wallet-safety": {
    titleNl: "Wallet Safety",
    titleEn: "Wallet Safety",
    textNl: "Rond de walletveiligheidsopdracht af.",
    textEn: "Complete the wallet safety assignment.",
    proofType: "Safety proof",
    icon: ShieldCheck,
  },
  "academy-lesson": {
    titleNl: "Academy Les",
    titleEn: "Academy Lesson",
    textNl: "Rond een geldige Academy-leeractie af.",
    textEn: "Complete a valid Academy learning action.",
    proofType: "Education proof",
    icon: GraduationCap,
  },
  "xrpl-verify": {
    titleNl: "XRPL Verificatie",
    titleEn: "XRPL Verify",
    textNl: "Controleer een live XRPL-transactie.",
    textEn: "Verify a live XRPL transaction.",
    proofType: "Verification proof",
    icon: FileCheck2,
  },
};

const levels = [
  { level: "L1", titleNl: "Starter", titleEn: "Starter", minXp: 0 },
  { level: "L2", titleNl: "Explorer", titleEn: "Explorer", minXp: 50 },
  { level: "L3", titleNl: "Builder", titleEn: "Builder", minXp: 150 },
  { level: "L4", titleNl: "Proof Holder", titleEn: "Proof Holder", minXp: 300 },
];

export function RewardLedgerTab({
  walletAddress = "guest",
}: RewardLedgerTabProps) {
  const { language } = useTerminalLanguage();
  const isEnglish = language === "en";
  const isGuest = walletAddress.trim() === "" || walletAddress === "guest";

  const [view, setView] = useState<RewardView>("overview");
  const [rewardState, setRewardState] = useState<RewardState>(() =>
    loadStateForWallet(walletAddress),
  );

  useEffect(() => {
    const refresh = () => {
      setRewardState(loadStateForWallet(walletAddress));
    };

    refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [walletAddress]);

  const summary = useMemo(
    () => getRewardSummary(rewardState),
    [rewardState],
  );

  const completedActionIds = useMemo(
    () =>
      new Set(
        rewardState.events
          .filter((event) => event.type === "xp-earned")
          .map((event) => event.actionId),
      ),
    [rewardState.events],
  );

  const rewards = useMemo<RewardItem[]>(() => {
    return getAvailableRewardActions()
      .filter((action) => action.id !== "ott-token-eligibility")
      .map((action) => {
        const meta = rewardMeta[action.id] ?? {
          titleNl: action.title,
          titleEn: action.title,
          textNl: "Geverifieerde OTT reward-actie.",
          textEn: "Verified OTT reward action.",
          proofType: "OTT proof",
          icon: BadgeCheck,
        };

        return {
          id: action.id,
          titleNl: meta.titleNl,
          titleEn: meta.titleEn,
          textNl: meta.textNl,
          textEn: meta.textEn,
          xp: action.xp,
          ottCredits: action.ottCredits,
          completed: completedActionIds.has(action.id),
          proofType: meta.proofType,
          icon: meta.icon,
        };
      });
  }, [completedActionIds]);

  const totalXp = summary.totalXp;
  const ottCredits = summary.ottCredits;
  const proofEvents = useMemo(
    () =>
      rewardState.events.filter(
        (event) =>
          Boolean(event.txHash) &&
          (event.type === "xp-earned" ||
            event.type === "partner-proof-stamp"),
      ),
    [rewardState.events],
  );

  const currentLevel = useMemo(() => {
    return (
      [...levels]
        .reverse()
        .find((level) => totalXp >= level.minXp) ?? levels[0]
    );
  }, [totalXp]);

  const nextLevel = useMemo(() => {
    return levels.find((level) => totalXp < level.minXp) ?? null;
  }, [totalXp]);

  const progressToNext = nextLevel
    ? Math.min(100, Math.round((totalXp / nextLevel.minXp) * 100))
    : 100;

  const totalAvailableXp = rewards.reduce(
    (sum, reward) => sum + reward.xp,
    0,
  );

  const totalAvailableCredits = rewards.reduce(
    (sum, reward) => sum + reward.ottCredits,
    0,
  );

  function refreshLedger() {
    setRewardState(loadStateForWallet(walletAddress));
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
                  subtitle={
                    isEnglish
                      ? "Make Waves proof ledger, XP and internal credits"
                      : "Make Waves proof ledger, XP en interne credits"
                  }
                />
              </div>

              <div className="inline-flex items-center gap-2 border border-black/10 bg-white/80 shadow-sm px-4 py-2 mb-6">
                <Trophy size={15} className="text-[#C83888]" />

                <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/55">
                  {isEnglish
                    ? "Make Waves Reward Ledger V1.0"
                    : "Make Waves Beloningsoverzicht V1.0"}
                </p>
              </div>

              <h1 className="font-orbitron text-4xl xl:text-6xl font-black uppercase leading-none tracking-tight mb-6">
                {isEnglish ? "Proof Earns XP." : "Proof Verdient XP."}
                <br />
                <span className="bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] bg-clip-text text-transparent">
                  {isEnglish ? "Credits Stay Safe." : "Credits Blijven Veilig."}
                </span>
              </h1>

              <p className="font-mono text-sm xl:text-base text-black/60 leading-relaxed max-w-3xl mb-8">
                {isEnglish
                  ? "This is the live Make Waves proof ledger for the connected wallet. It shows which SourceTag actions earned XP, which OTT Credits were added, which transaction hashes support the proof, and why future token conversion remains locked."
                  : "Dit is de live Make Waves proof ledger voor de gekoppelde wallet. Het toont welke SourceTag-acties XP verdienden, welke OTT Credits zijn toegevoegd, welke transaction hashes de proof ondersteunen en waarom toekomstige tokenconversie locked blijft."}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl">
                <MetricCard
                  label="XP"
                  value={String(totalXp)}
                  text={isEnglish ? "Learning score" : "Leerscore"}
                  icon={Trophy}
                />
                <MetricCard
                  label="OTT Credits"
                  value={String(ottCredits)}
                  text={isEnglish ? "Internal utility" : "Interne utility"}
                  icon={Sparkles}
                />
                <MetricCard
                  label={isEnglish ? "Proofs" : "Proofs"}
                  value={String(proofEvents.length)}
                  text={isEnglish ? "TX-linked" : "TX-gekoppeld"}
                  icon={BadgeCheck}
                />
                <MetricCard
                  label="SourceTag"
                  value="2606170002"
                  text="Make Waves"
                  icon={Fingerprint}
                />
              </div>
            </div>

            <div className="col-span-12 xl:col-span-4">
              <div className="border border-black/10 bg-white/90 backdrop-blur p-5 shadow-xl shadow-black/5">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <p className="font-orbitron text-xs uppercase tracking-widest">
                    {isEnglish ? "Ledger Status" : "Ledgerstatus"}
                  </p>

                  <button
                    onClick={refreshLedger}
                    className="border border-black/10 bg-[#F7F8FC] p-2 text-black/45 hover:text-black transition-colors"
                    title={isEnglish ? "Refresh ledger" : "Ververs overzicht"}
                  >
                    <RefreshCcw size={14} />
                  </button>
                </div>

                <div className="mb-4">
                  <OTTProofBadge sourceTag="2606170002" />
                </div>

                <div className="space-y-3">
                  <InfoRow
                    label="Wallet"
                    value={
                      isGuest
                        ? "Guest / Free Preview"
                        : walletAddress
                    }
                  />
                  <InfoRow
                    label={isEnglish ? "Current Level" : "Huidig Level"}
                    value={`${currentLevel.level} · ${
                      isEnglish
                        ? currentLevel.titleEn
                        : currentLevel.titleNl
                    }`}
                  />
                  <InfoRow
                    label={isEnglish ? "Events" : "Gebeurtenissen"}
                    value={String(summary.eventCount)}
                  />
                  <InfoRow
                    label={isEnglish ? "Updated" : "Bijgewerkt"}
                    value={formatDate(rewardState.updatedAt, language)}
                  />
                </div>

                <div className="border border-[#C83888]/25 bg-[#C83888]/10 p-4 mt-5">
                  <div className="flex items-start gap-3">
                    <ShieldCheck
                      size={18}
                      className="text-[#C83888] mt-0.5 shrink-0"
                    />

                    <p className="font-mono text-xs text-black/60 leading-relaxed">
                      {isEnglish
                        ? "V1 uses local browser storage for demo flow. The proof transactions remain verifiable on XRPL through tx hashes and SourceTag 2606170002."
                        : "V1 gebruikt lokale browseropslag voor de demo-flow. De proof-transacties blijven verifieerbaar op XRPL via tx hashes en SourceTag 2606170002."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-8">
            <ModeButton
              active={view === "overview"}
              label={isEnglish ? "Overview" : "Overzicht"}
              onClick={() => setView("overview")}
            />
            <ModeButton
              active={view === "xp"}
              label="XP / Credits"
              onClick={() => setView("xp")}
            />
            <ModeButton
              active={view === "proof"}
              label="Proof"
              onClick={() => setView("proof")}
            />
            <ModeButton
              active={view === "policy"}
              label={isEnglish ? "Policy" : "Beleid"}
              onClick={() => setView("policy")}
            />
          </div>
        </div>
      </section>

      <section className="p-4 md:p-6 xl:p-10 bg-white">
        {view === "overview" && (
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 xl:col-span-8">
              <Panel
                title={
                  isEnglish
                    ? "Verified Reward Milestones"
                    : "Geverifieerde Reward Mijlpalen"
                }
                icon={ClipboardCheck}
              >
                <div className="space-y-3">
                  {rewards.map((reward) => (
                    <RewardRow
                      key={reward.id}
                      reward={reward}
                      language={language}
                    />
                  ))}
                </div>
              </Panel>
            </div>

            <div className="col-span-12 xl:col-span-4 space-y-4">
              <Panel
                title={isEnglish ? "Level Path" : "Levelpad"}
                icon={BarChart3}
              >
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

              <Panel
                title={isEnglish ? "Current V1 State" : "Huidige V1-status"}
                icon={Target}
              >
                <div className="space-y-3">
                  <StatusLine
                    text={
                      isEnglish
                        ? `${totalXp} XP stored for this wallet.`
                        : `${totalXp} XP opgeslagen voor deze wallet.`
                    }
                  />
                  <StatusLine
                    text={
                      isEnglish
                        ? `${ottCredits} internal OTT Credits available.`
                        : `${ottCredits} interne OTT Credits beschikbaar.`
                    }
                  />
                  <StatusLine
                    text={
                      isEnglish
                        ? "Duplicate TX rewards are blocked locally."
                        : "Dubbele TX-rewards worden lokaal geblokkeerd."
                    }
                  />
                  <StatusLine
                    text={
                      isEnglish
                        ? "Server-side balances remain the next production step."
                        : "Server-side saldi blijven de volgende productiestap."
                    }
                  />
                </div>
              </Panel>

              <Panel
                title={isEnglish ? "Make Waves Demo Route" : "Make Waves Demo Route"}
                icon={Fingerprint}
              >
                <div className="space-y-3">
                  <StatusLine
                    text={
                      isEnglish
                        ? "1. Open Daily Check-In and sign a SourceTag proof."
                        : "1. Open Daily Check-In en teken een SourceTag proof."
                    }
                  />
                  <StatusLine
                    text={
                      isEnglish
                        ? "2. Return here to show XP, Credits and tx proof."
                        : "2. Kom hier terug om XP, Credits en tx proof te tonen."
                    }
                  />
                  <StatusLine
                    text={
                      isEnglish
                        ? "3. Open SourceTag page to verify the tx hash publicly."
                        : "3. Open SourceTag pagina om de tx hash publiek te verifiëren."
                    }
                  />
                  <StatusLine
                    text={
                      isEnglish
                        ? "4. Explain that token conversion is locked until legal review."
                        : "4. Leg uit dat tokenconversie locked blijft tot juridische review."
                    }
                  />
                </div>
              </Panel>
            </div>
          </div>
        )}

        {view === "xp" && (
          <Panel title="XP / OTT Credits" icon={Sparkles}>
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
                      ? `${Math.max(0, nextLevel.minXp - totalXp)} XP until ${nextLevel.level}.`
                      : `${Math.max(0, nextLevel.minXp - totalXp)} XP tot ${nextLevel.level}.`
                    : isEnglish
                      ? "Highest V1 level reached."
                      : "Hoogste V1-level bereikt."}
                </p>
              </div>

              <div className="col-span-12 xl:col-span-5">
                <div className="grid grid-cols-1 gap-3">
                  <InfoRow
                    label="OTT Credits"
                    value={String(ottCredits)}
                  />
                  <InfoRow
                    label={isEnglish ? "Current Level" : "Huidig Level"}
                    value={`${currentLevel.level} · ${
                      isEnglish
                        ? currentLevel.titleEn
                        : currentLevel.titleNl
                    }`}
                  />
                  <InfoRow
                    label={isEnglish ? "V1 Available XP" : "V1 Beschikbare XP"}
                    value={String(totalAvailableXp)}
                  />
                  <InfoRow
                    label={
                      isEnglish
                        ? "V1 Available Credits"
                        : "V1 Beschikbare Credits"
                    }
                    value={String(totalAvailableCredits)}
                  />
                  <InfoRow
                    label={isEnglish ? "On-chain Token" : "On-chain Token"}
                    value={isEnglish ? "Inactive / review" : "Inactief / beoordeling"}
                  />
                </div>
              </div>
            </div>
          </Panel>
        )}

        {view === "proof" && (
          <Panel
            title={isEnglish ? "Real Event Ledger" : "Echte Event Ledger"}
            icon={FileCheck2}
          >
            {rewardState.events.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rewardState.events.map((event) => (
                  <ProofCard
                    key={event.id}
                    event={event}
                    language={language}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title={
                  isEnglish
                    ? "No reward events yet"
                    : "Nog geen reward-events"
                }
                text={
                  isEnglish
                    ? "Complete Daily Check-In or another eligible SourceTag action. The event will appear here with XP, credits and tx proof after verification."
                    : "Rond Daily Check-In of een andere geschikte SourceTag-actie af. Het event verschijnt hier met XP, credits en tx proof na verificatie."
                }
              />
            )}
          </Panel>
        )}

        {view === "policy" && (
          <Panel
            title={isEnglish ? "Reward Policy" : "Beloningsbeleid"}
            icon={ShieldCheck}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <PolicyBox
                title="XP"
                lines={[
                  isEnglish
                    ? "Permanent learning and reputation score."
                    : "Permanente leer- en reputatiescore.",
                  isEnglish
                    ? "Not spendable or transferable."
                    : "Niet besteedbaar of overdraagbaar.",
                  isEnglish
                    ? "Supports levels, progress and certificates."
                    : "Ondersteunt levels, voortgang en certificaten.",
                ]}
              />

              <PolicyBox
                title="OTT Credits"
                lines={[
                  isEnglish
                    ? "Internal terminal utility points."
                    : "Interne utility-punten voor de terminal.",
                  isEnglish
                    ? "Can later unlock eligible services, certificates, events or discounts."
                    : "Kunnen later geschikte services, certificaten, events of kortingen openen.",
                  isEnglish
                    ? "No cash value and no withdrawal."
                    : "Geen geldwaarde en niet opneembaar.",
                ]}
              />

              <PolicyBox
                title={isEnglish ? "Future OTT Token" : "Toekomstige OTT Token"}
                premium
                lines={[
                  isEnglish
                    ? "Not active in V1."
                    : "Niet actief in V1.",
                  isEnglish
                    ? "No automatic XP or credit conversion."
                    : "Geen automatische XP- of creditconversie.",
                  isEnglish
                    ? "Requires proven utility, profitability and legal review."
                    : "Vereist bewezen utility, winstgevendheid en juridische beoordeling.",
                ]}
              />
            </div>
          </Panel>
        )}
      </section>
    </div>
  );
}

function loadStateForWallet(walletAddress: string) {
  const cleanWallet = walletAddress.trim();

  if (!cleanWallet || cleanWallet === "guest") {
    return createEmptyRewardState("guest");
  }

  return loadRewardState(cleanWallet);
}

function RewardRow({
  reward,
  language,
}: {
  reward: RewardItem;
  language: "nl" | "en";
}) {
  const isEnglish = language === "en";
  const Icon = reward.icon;

  return (
    <div
      className={`border p-4 md:p-5 ${
        reward.completed
          ? "border-[#3898E8]/25 bg-[#3898E8]/10"
          : "border-black/10 bg-[#F7F8FC]"
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="w-12 h-12 border border-black/10 bg-white flex items-center justify-center shrink-0">
          <Icon
            size={21}
            className={
              reward.completed
                ? "text-[#3898E8]"
                : "text-[#C83888]"
            }
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-widest text-black/35 mb-2">
            {reward.proofType} · +{reward.xp} XP · +{reward.ottCredits} OTT
          </p>

          <p className="font-orbitron text-sm font-black uppercase text-black mb-2">
            {isEnglish ? reward.titleEn : reward.titleNl}
          </p>

          <p className="font-mono text-xs text-black/55 leading-relaxed">
            {isEnglish ? reward.textEn : reward.textNl}
          </p>
        </div>

        <div
          className={`border px-4 py-3 ${
            reward.completed
              ? "border-[#3898E8]/25 bg-white text-[#3898E8]"
              : "border-black/10 bg-white text-black/35"
          }`}
        >
          <span className="font-orbitron text-[10px] font-black uppercase">
            {reward.completed
              ? isEnglish
                ? "Verified"
                : "Geverifieerd"
              : isEnglish
                ? "Available"
                : "Beschikbaar"}
          </span>
        </div>
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
    <div
      className={`border p-4 ${
        active
          ? "border-[#C83888] bg-[#C83888]/10"
          : "border-black/10 bg-[#F7F8FC]"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-orbitron text-sm font-black uppercase">
            {level.level} ·{" "}
            {isEnglish ? level.titleEn : level.titleNl}
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
  event,
  language,
}: {
  event: RewardEvent;
  language: "nl" | "en";
}) {
  const isEnglish = language === "en";
  const isVerifiedReward =
    event.type === "xp-earned" ||
    event.type === "partner-proof-stamp";

  return (
    <div
      className={`border p-5 ${
        isVerifiedReward
          ? "border-[#3898E8]/25 bg-[#3898E8]/10"
          : "border-black/10 bg-[#F7F8FC]"
      }`}
    >
      <div className="flex items-start gap-3 mb-4">
        <BadgeCheck
          size={22}
          className={
            isVerifiedReward
              ? "text-[#3898E8]"
              : "text-[#C83888]"
          }
        />

        <div>
          <p className="font-orbitron text-sm font-black uppercase mb-2">
            {getEventTitle(event, language)}
          </p>

          <p className="font-mono text-xs text-black/55 leading-relaxed">
            {event.note}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <InfoRow label="XP" value={String(event.xp)} />
        <InfoRow
          label="OTT Credits"
          value={String(event.ottCredits ?? 0)}
        />
        <InfoRow
          label="Status"
          value={
            isVerifiedReward
              ? isEnglish
                ? "Recorded"
                : "Opgeslagen"
              : event.type
          }
        />
        <InfoRow
          label="TX Hash"
          value={event.txHash ?? "No TX"}
        />
        <InfoRow
          label={isEnglish ? "Created" : "Aangemaakt"}
          value={formatDate(event.createdAt, language)}
        />
      </div>
    </div>
  );
}

function EmptyState({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-6 text-center">
      <BadgeCheck size={28} className="text-black/25 mx-auto mb-4" />

      <p className="font-orbitron text-sm font-black uppercase mb-3">
        {title}
      </p>

      <p className="font-mono text-xs text-black/50 leading-relaxed max-w-xl mx-auto">
        {text}
      </p>
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
    <div
      className={`border p-5 ${
        premium
          ? "border-[#C83888]/25 bg-[#C83888]/10"
          : "border-[#3898E8]/25 bg-[#3898E8]/10"
      }`}
    >
      <p className="font-orbitron text-lg font-black uppercase mb-5">
        {title}
      </p>

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
      <CheckCircle2
        size={14}
        className="text-[#3898E8] shrink-0 mt-0.5"
      />
      <p className="font-mono text-xs text-black/55 leading-relaxed">
        {text}
      </p>
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
      <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">
        {label}
      </p>
      <p className="font-orbitron text-sm font-black uppercase mb-1 break-all">
        {value}
      </p>
      <p className="font-mono text-[10px] text-black/35 uppercase">
        {text}
      </p>
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
        <p className="font-orbitron text-xs uppercase tracking-widest">
          {title}
        </p>
      </div>
      {children}
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-3">
      <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">
        {label}
      </p>
      <p className="font-orbitron text-xs font-black uppercase break-all">
        {value}
      </p>
    </div>
  );
}

function getEventTitle(
  event: RewardEvent,
  language: "nl" | "en",
) {
  const meta = rewardMeta[event.actionId];

  if (meta) {
    return language === "en" ? meta.titleEn : meta.titleNl;
  }

  if (event.type === "partner-proof-stamp") {
    return language === "en"
      ? "Partner Proof Stamp"
      : "Partner Proof Stamp";
  }

  if (event.type === "mainnet-token-locked") {
    return language === "en"
      ? "Future Token Locked"
      : "Toekomstige Token Geblokkeerd";
  }

  if (event.type === "testnet-token-simulated") {
    return language === "en"
      ? "Testnet Simulation"
      : "Testnet Simulatie";
  }

  return String(event.actionId);
}

function formatDate(
  value: string,
  language: "nl" | "en",
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    language === "en" ? "en-GB" : "nl-NL",
    {
      dateStyle: "short",
      timeStyle: "short",
    },
  ).format(date);
}

export default RewardLedgerTab;
