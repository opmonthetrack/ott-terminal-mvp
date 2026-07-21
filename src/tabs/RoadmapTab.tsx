import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  CircleDot,
  Clock3,
  Compass,
  ExternalLink,
  Fingerprint,
  Loader2,
  Radio,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Trophy,
  Vote,
  Wallet,
} from "lucide-react";
import { OTTLogo, OTTProofBadge } from "../components/OTTLogo";
import { MAKE_WAVES_SOURCE_TAG } from "../lib/makeWaves";
import {
  createRoadmapVotePayload,
  getRoadmapVotePayloadUrl,
  getRoadmapVotePayloadUuid,
  getRoadmapVoteStats,
  type RoadmapVoteOptionId,
  type RoadmapVoteStatsResponse,
} from "../lib/roadmapVoteClient";
import { saveXamanMobileSession } from "../lib/xamanMobileSession";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

const SUPPORT_DONATION_URL = "/support-donation.html";
const PENDING_VOTE_STORAGE_KEY = "ott-terminal-roadmap-pending-vote-v2";
const PENDING_VOTE_MAX_AGE_MS = 30 * 60 * 1000;

type RoadmapTabProps = {
  walletAddress?: string;
  onNavigate?: (target: string) => void;
};

type PhaseOption = {
  id: RoadmapVoteOptionId;
  phase: string;
  title: string;
  status: string;
  text: string;
  bullets: string[];
};

type PendingVote = {
  voteId: RoadmapVoteOptionId;
  payloadUuid: string;
  createdAt: number;
};

const phaseOptions: PhaseOption[] = [
  {
    id: "academy-expansion",
    phase: "Phase 2",
    title: "Academy Expansion",
    status: "Learn",
    text: "More beginner-friendly XRPL lessons, short learning paths and proof-ready education flows.",
    bullets: [
      "XRPL basics for new users",
      "Xaman safety and wallet habits",
      "Completion proof route for Make Waves activity",
    ],
  },
  {
    id: "web2-license",
    phase: "Phase 3",
    title: "Web2 License Access",
    status: "Fiat",
    text: "A clear fiat/software license route for users and companies that are not ready to pay with crypto.",
    bullets: [
      "Business invoice or payment provider route",
      "Access as software/service license",
      "No automatic fiat-to-crypto conversion",
    ],
  },
  {
    id: "marketplace-merch",
    phase: "Phase 4",
    title: "Marketplace + Merch",
    status: "Shop",
    text: "OTT merch, digital access bundles and community products connected to the terminal story.",
    bullets: [
      "OTT product showcase",
      "Access Pass holder perks where legally safe",
      "Education-first commerce flow",
    ],
  },
  {
    id: "ai-research",
    phase: "Phase 5",
    title: "AI Research Assistant",
    status: "AI",
    text: "A guided research layer for XRPL news, ecosystem tracking, education and campaign preparation.",
    bullets: [
      "XRPL source research assistant",
      "Newsroom and content support",
      "Clear human review before publishing",
    ],
  },
  {
    id: "token-tools-review",
    phase: "Phase 6",
    title: "Token Tools + Legal Review",
    status: "Legal",
    text: "Careful token tooling only after real demand, product-market feedback and legal review.",
    bullets: [
      "Token Factory remains advanced/labs first",
      "No token value promise",
      "Legal-first utility design",
    ],
  },
];

function createEmptyCounts() {
  return phaseOptions.reduce<Record<RoadmapVoteOptionId, number>>((counts, option) => {
    counts[option.id] = 0;
    return counts;
  }, {} as Record<RoadmapVoteOptionId, number>);
}

function loadPendingVote(): PendingVote | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(PENDING_VOTE_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const pendingVote = JSON.parse(rawValue) as PendingVote;

    if (
      !pendingVote.voteId ||
      !pendingVote.payloadUuid ||
      Date.now() - pendingVote.createdAt > PENDING_VOTE_MAX_AGE_MS
    ) {
      window.localStorage.removeItem(PENDING_VOTE_STORAGE_KEY);
      return null;
    }

    return pendingVote;
  } catch {
    window.localStorage.removeItem(PENDING_VOTE_STORAGE_KEY);
    return null;
  }
}

function savePendingVote(pendingVote: PendingVote) {
  window.localStorage.setItem(PENDING_VOTE_STORAGE_KEY, JSON.stringify(pendingVote));
}

function clearPendingVote() {
  window.localStorage.removeItem(PENDING_VOTE_STORAGE_KEY);
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "error" in error) {
    const value = (error as { error?: unknown }).error;
    return typeof value === "string" ? value : fallback;
  }

  return fallback;
}

function shortWallet(value: string) {
  if (value.length <= 14) {
    return value;
  }

  return `${value.slice(0, 7)}…${value.slice(-5)}`;
}

function formatVoteTime(value: string | null) {
  if (!value) {
    return "XRPL validated";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "XRPL validated";
  }

  return date.toLocaleString([], {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RoadmapTab({ walletAddress = "guest", onNavigate }: RoadmapTabProps) {
  const { language } = useTerminalLanguage();
  const isEnglish = language === "en";
  const isGuest = !walletAddress || walletAddress === "guest";
  const [voteStats, setVoteStats] = useState<RoadmapVoteStatsResponse | null>(null);
  const [pendingVote, setPendingVote] = useState<PendingVote | null>(() => loadPendingVote());
  const [creatingVoteId, setCreatingVoteId] = useState<RoadmapVoteOptionId | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [status, setStatus] = useState(
    isEnglish
      ? "Loading the verified XRPL roadmap vote tally..."
      : "De geverifieerde XRPL-roadmapstemming wordt geladen...",
  );

  const voteCounts = useMemo(() => {
    const counts = createEmptyCounts();

    for (const option of phaseOptions) {
      counts[option.id] = voteStats?.counts?.[option.id] ?? 0;
    }

    return counts;
  }, [voteStats]);

  const totalActiveVotes = voteStats?.totals?.activeVerifiedVotes ?? 0;
  const totalVoteTransactions = voteStats?.totals?.verifiedVoteTransactions ?? 0;
  const verifiedWalletVote = voteStats?.walletVote ?? null;
  const selectedVoteId = verifiedWalletVote?.voteId ?? pendingVote?.voteId ?? null;
  const ranking = useMemo(() => {
    if (voteStats?.ranking?.length) {
      return voteStats.ranking;
    }

    return phaseOptions.map((option) => ({
      id: option.id,
      title: option.title,
      votes: voteCounts[option.id],
    }));
  }, [voteCounts, voteStats]);
  const leader = voteStats?.mostVoted ?? ranking[0] ?? null;
  const leastVoted = voteStats?.leastVoted ?? ranking[ranking.length - 1] ?? null;

  async function refreshVoteStats(options?: { silent?: boolean }) {
    if (!options?.silent) {
      setIsRefreshing(true);
    }

    try {
      const response = await getRoadmapVoteStats(
        isGuest ? undefined : walletAddress,
      );
      setVoteStats(response);

      const currentPendingVote = loadPendingVote();

      if (
        currentPendingVote &&
        response.walletVote?.voteId === currentPendingVote.voteId
      ) {
        clearPendingVote();
        setPendingVote(null);
        setStatus(
          isEnglish
            ? `Vote verified on XRPL for ${response.walletVote.title}. The live public ranking has been updated.`
            : `Stem op XRPL geverifieerd voor ${response.walletVote.title}. De openbare ranglijst is bijgewerkt.`,
        );
      } else if (currentPendingVote) {
        setPendingVote(currentPendingVote);
        setStatus(
          isEnglish
            ? "Xaman vote request created. After signing, the vote appears when XRPL validation is complete."
            : "Xaman-stemverzoek aangemaakt. Na ondertekening verschijnt de stem zodra XRPL-validatie klaar is.",
        );
      } else if (response.walletVote) {
        setStatus(
          isEnglish
            ? `Your active verified vote is ${response.walletVote.title}. A newer signed vote will replace it.`
            : `Je actieve geverifieerde stem is ${response.walletVote.title}. Een nieuwere ondertekende stem vervangt deze.`,
        );
      } else {
        setStatus(
          isEnglish
            ? "Choose a phase and sign the 1-drop proof transaction in Xaman. Only validated XRPL votes are counted."
            : "Kies een fase en onderteken de 1-drop proof-transactie in Xaman. Alleen gevalideerde XRPL-stemmen tellen mee.",
        );
      }
    } catch (error) {
      setStatus(
        getErrorMessage(
          error,
          isEnglish
            ? "Could not load the live XRPL vote tally."
            : "De live XRPL-stemtelling kon niet worden geladen.",
        ),
      );
    } finally {
      if (!options?.silent) {
        setIsRefreshing(false);
      }
    }
  }

  useEffect(() => {
    void refreshVoteStats();

    const interval = window.setInterval(() => {
      void refreshVoteStats({ silent: true });
    }, 15_000);

    return () => window.clearInterval(interval);
  }, [walletAddress, isEnglish]);

  async function castVerifiedVote(option: PhaseOption) {
    setCreatingVoteId(option.id);
    setStatus(
      isEnglish
        ? `Creating the Xaman vote request for ${option.title}...`
        : `Xaman-stemverzoek voor ${option.title} wordt aangemaakt...`,
    );

    try {
      const response = await createRoadmapVotePayload(
        option.id,
        isGuest ? undefined : walletAddress,
      );
      const payloadUuid = getRoadmapVotePayloadUuid(response);
      const payloadUrl = getRoadmapVotePayloadUrl(response);

      if (!payloadUuid || !payloadUrl) {
        throw new Error(
          isEnglish
            ? "Xaman did not return a valid vote request."
            : "Xaman gaf geen geldig stemverzoek terug.",
        );
      }

      saveXamanMobileSession({
        payloadUuid,
        actionId: "roadmap-vote",
        returnTarget: "roadmap",
        expectedWallet: isGuest ? undefined : walletAddress,
      });

      const nextPendingVote: PendingVote = {
        voteId: option.id,
        payloadUuid,
        createdAt: Date.now(),
      };
      savePendingVote(nextPendingVote);
      setPendingVote(nextPendingVote);
      setStatus(
        isEnglish
          ? "Opening Xaman. Review the selected phase, 1-drop proof amount, destination and SourceTag before signing."
          : "Xaman wordt geopend. Controleer de gekozen fase, het 1-drop proofbedrag, de ontvanger en SourceTag voor ondertekening.",
      );

      window.location.assign(payloadUrl);
    } catch (error) {
      setStatus(
        getErrorMessage(
          error,
          isEnglish
            ? "Could not create the Xaman roadmap vote."
            : "De Xaman-roadmapstem kon niet worden aangemaakt.",
        ),
      );
      setCreatingVoteId(null);
    }
  }

  return (
    <div className="min-h-screen bg-white text-[#080808]">
      <section className="relative overflow-hidden border-b border-black/10 bg-[radial-gradient(circle_at_82%_12%,rgba(200,56,136,0.16),transparent_32%),radial-gradient(circle_at_12%_88%,rgba(56,152,232,0.16),transparent_34%),#ffffff] p-4 md:p-8 xl:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="text-[#080808]">
            <OTTLogo
              size="lg"
              subtitle={
                isEnglish
                  ? "Xaman-verified community roadmap voting"
                  : "Door Xaman geverifieerde community-roadmapstemming"
              }
            />
          </div>
          <OTTProofBadge sourceTag={String(MAKE_WAVES_SOURCE_TAG)} />
        </div>

        <div className="max-w-5xl">
          <div className="inline-flex items-center gap-2 border border-black/10 bg-white/80 shadow-sm px-4 py-2 mb-6">
            <Vote size={15} className="text-[#C83888]" />
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/55">
              {isEnglish ? "On-Chain Phase Voting" : "On-Chain Fasestemming"}
            </p>
          </div>

          <h1 className="font-orbitron text-4xl md:text-6xl font-black uppercase leading-none tracking-tight mb-6">
            {isEnglish ? "Sign your vote." : "Onderteken je stem."}
            <br />
            <span className="bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] bg-clip-text text-transparent">
              {isEnglish ? "See the live ranking." : "Bekijk de live ranglijst."}
            </span>
          </h1>

          <p className="font-mono text-sm md:text-base text-black/60 leading-relaxed max-w-4xl">
            {isEnglish
              ? "Every vote requires a Xaman-signed XRPL Mainnet transaction with SourceTag 2606170002 and the selected roadmap phase in the memo. One active vote counts per wallet; a newer verified vote replaces the wallet's previous choice."
              : "Elke stem vereist een via Xaman ondertekende XRPL Mainnet-transactie met SourceTag 2606170002 en de gekozen roadmapfase in de memo. Per wallet telt één actieve stem; een nieuwere geverifieerde stem vervangt de vorige keuze."}
          </p>
        </div>
      </section>

      <section className="p-4 md:p-8 xl:p-10 bg-white">
        <div className="grid grid-cols-12 gap-4 mb-6">
          <MetricCard
            icon={Radio}
            label={isEnglish ? "Active Votes" : "Actieve Stemmen"}
            value={String(totalActiveVotes)}
            text={isEnglish ? "One latest verified vote per wallet." : "Eén nieuwste geverifieerde stem per wallet."}
          />
          <MetricCard
            icon={Fingerprint}
            label={isEnglish ? "Signed Transactions" : "Ondertekende Transacties"}
            value={String(totalVoteTransactions)}
            text={isEnglish ? "All validated vote transactions in this cycle." : "Alle gevalideerde stemtransacties in deze cyclus."}
          />
          <MetricCard
            icon={Trophy}
            label={isEnglish ? "Current Leader" : "Huidige Koploper"}
            value={leader?.title ?? "No votes"}
            text={leader ? `${leader.votes} verified vote${leader.votes === 1 ? "" : "s"}.` : "Waiting for the first vote."}
          />
          <MetricCard
            icon={Wallet}
            label={isEnglish ? "Your Active Vote" : "Jouw Actieve Stem"}
            value={verifiedWalletVote?.title ?? (pendingVote ? "Pending Xaman" : "Not voted")}
            text={isGuest ? "Xaman identifies the signing wallet." : shortWallet(walletAddress)}
          />
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-8">
            <Panel>
              <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#3898E8] mb-2">
                    {isEnglish ? "Verified Community Build Order" : "Geverifieerde Community-Bouwvolgorde"}
                  </p>
                  <h2 className="font-orbitron text-2xl font-black uppercase">
                    {isEnglish ? "Choose and sign with Xaman" : "Kies en onderteken met Xaman"}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => void refreshVoteStats()}
                  disabled={isRefreshing}
                  className="border border-black/10 bg-[#F7F8FC] px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 disabled:opacity-50"
                >
                  <RefreshCcw size={14} className={isRefreshing ? "animate-spin" : ""} />
                  {isEnglish ? "Refresh tally" : "Ververs telling"}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {phaseOptions.map((option) => {
                  const votes = voteCounts[option.id] ?? 0;
                  const percent = totalActiveVotes > 0
                    ? Math.round((votes / totalActiveVotes) * 100)
                    : 0;
                  const rank = ranking.findIndex((item) => item.id === option.id) + 1;
                  const isVerifiedSelection = verifiedWalletVote?.voteId === option.id;
                  const isPendingSelection =
                    pendingVote?.voteId === option.id && !isVerifiedSelection;
                  const isCreating = creatingVoteId === option.id;

                  return (
                    <article
                      key={option.id}
                      className={`border p-5 flex flex-col min-h-[390px] ${
                        isVerifiedSelection
                          ? "border-[#3898E8] bg-[#3898E8]/5"
                          : isPendingSelection
                            ? "border-[#C83888] bg-[#C83888]/5"
                            : "border-black/10 bg-[#F7F8FC]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-5">
                        <div>
                          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#C83888] mb-2">
                            {option.phase}
                          </p>
                          <h3 className="font-orbitron text-xl font-black uppercase leading-tight">
                            {option.title}
                          </h3>
                        </div>
                        <div className="text-right">
                          <span className="block font-mono text-[10px] uppercase tracking-widest text-black/40">
                            {option.status}
                          </span>
                          <span className="block font-orbitron text-xs font-black uppercase mt-2">
                            #{rank || phaseOptions.length}
                          </span>
                        </div>
                      </div>

                      <p className="font-mono text-xs text-black/58 leading-relaxed mb-5">
                        {option.text}
                      </p>

                      <div className="space-y-2 mb-6 flex-1">
                        {option.bullets.map((bullet) => (
                          <InfoLine key={bullet} text={bullet} />
                        ))}
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-black/40 mb-2">
                          <span>{isEnglish ? "Verified votes" : "Geverifieerde stemmen"}</span>
                          <span>{votes} / {percent}%</span>
                        </div>
                        <div className="h-2 bg-white border border-black/10 overflow-hidden">
                          <div
                            className="h-full bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_100%)]"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => void castVerifiedVote(option)}
                        disabled={Boolean(creatingVoteId) || isVerifiedSelection}
                        className={`min-h-12 px-4 py-3 font-orbitron text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-60 ${
                          isVerifiedSelection
                            ? "bg-[#3898E8] text-white"
                            : isPendingSelection
                              ? "bg-[#C83888] text-white"
                              : "bg-black text-white hover:opacity-90"
                        }`}
                      >
                        {isCreating ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : isVerifiedSelection ? (
                          <BadgeCheck size={16} />
                        ) : isPendingSelection ? (
                          <Clock3 size={16} />
                        ) : (
                          <Vote size={16} />
                        )}
                        {isCreating
                          ? isEnglish ? "Creating Xaman vote" : "Xaman-stem maken"
                          : isVerifiedSelection
                            ? isEnglish ? "Verified active vote" : "Geverifieerde actieve stem"
                            : isPendingSelection
                              ? isEnglish ? "Awaiting Xaman / XRPL" : "Wacht op Xaman / XRPL"
                              : verifiedWalletVote
                                ? isEnglish ? "Change vote with Xaman" : "Wijzig stem met Xaman"
                                : isEnglish ? "Vote with Xaman" : "Stem met Xaman"}
                      </button>
                    </article>
                  );
                })}
              </div>
            </Panel>
          </div>

          <div className="col-span-12 xl:col-span-4 space-y-4">
            <Panel>
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-2">
                  <BarChart3 size={18} className="text-[#3898E8]" />
                  <p className="font-orbitron text-xs uppercase tracking-widest">
                    {isEnglish ? "Live Ranking" : "Live Ranglijst"}
                  </p>
                </div>
                <span className="font-mono text-[9px] uppercase tracking-widest text-black/35">
                  {voteStats?.cycle ?? "cycle-1"}
                </span>
              </div>

              <div className="space-y-2">
                {ranking.map((item, index) => {
                  const percent = totalActiveVotes > 0
                    ? Math.round((item.votes / totalActiveVotes) * 100)
                    : 0;

                  return (
                    <div
                      key={item.id}
                      className="border border-black/10 bg-[#F7F8FC] p-3 flex items-center gap-3"
                    >
                      <span className="w-8 h-8 bg-white border border-black/10 flex items-center justify-center font-orbitron text-xs font-black">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-orbitron text-[10px] font-black uppercase truncate">
                          {item.title}
                        </p>
                        <p className="font-mono text-[9px] uppercase tracking-widest text-black/35 mt-1">
                          {item.votes} votes · {percent}%
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <MiniStatus
                  label={isEnglish ? "Most" : "Meeste"}
                  value={leader ? `${leader.title} · ${leader.votes}` : "No votes"}
                />
                <MiniStatus
                  label={isEnglish ? "Least" : "Minste"}
                  value={leastVoted ? `${leastVoted.title} · ${leastVoted.votes}` : "No votes"}
                />
              </div>
            </Panel>

            <Panel>
              <div className="flex items-center gap-2 mb-5">
                <ShieldCheck size={18} className="text-[#3898E8]" />
                <p className="font-orbitron text-xs uppercase tracking-widest">
                  {isEnglish ? "On-Chain Proof Rules" : "On-Chain Proofregels"}
                </p>
              </div>

              <div className="space-y-3">
                <InfoLine text={isEnglish ? "Every vote is signed by the wallet owner inside Xaman." : "Elke stem wordt door de wallet-eigenaar in Xaman ondertekend."} />
                <InfoLine text={isEnglish ? "The proof payment is 1 drop plus the normal XRPL network fee." : "De proofbetaling is 1 drop plus de normale XRPL-netwerkkosten."} />
                <InfoLine text={isEnglish ? "Only validated tesSUCCESS transactions with the exact memo and SourceTag count." : "Alleen gevalideerde tesSUCCESS-transacties met de exacte memo en SourceTag tellen mee."} />
                <InfoLine text={isEnglish ? "One active vote per wallet; the latest verified choice replaces the previous one." : "Eén actieve stem per wallet; de nieuwste geverifieerde keuze vervangt de vorige."} />
                <InfoLine text={isEnglish ? "Votes are product feedback, not governance, token or financial rights." : "Stemmen zijn productfeedback, geen governance-, token- of financiële rechten."} />
              </div>

              <div className="grid grid-cols-1 gap-2 mt-4">
                <MiniStatus label="SourceTag" value={String(MAKE_WAVES_SOURCE_TAG)} />
                <MiniStatus label={isEnglish ? "Proof Wallet" : "Proofwallet"} value={voteStats?.proof?.destinationWallet ?? "Loading from XRPL"} />
                <MiniStatus label={isEnglish ? "Proof Amount" : "Proofbedrag"} value="1 drop" />
              </div>
            </Panel>

            <Panel>
              <div className="flex items-center gap-2 mb-5">
                <Sparkles size={18} className="text-[#C83888]" />
                <p className="font-orbitron text-xs uppercase tracking-widest">
                  {isEnglish ? "Status" : "Status"}
                </p>
              </div>
              <div className="border border-black/10 bg-[#F7F8FC] p-4">
                <p className="font-mono text-xs text-black/60 leading-relaxed">{status}</p>
              </div>
            </Panel>

            <Panel>
              <div className="flex items-center gap-2 mb-5">
                <Clock3 size={18} className="text-[#3898E8]" />
                <p className="font-orbitron text-xs uppercase tracking-widest">
                  {isEnglish ? "Recent Verified Votes" : "Recente Geverifieerde Stemmen"}
                </p>
              </div>

              <div className="space-y-2">
                {(voteStats?.recentVotes ?? []).slice(0, 6).map((voteRecord) => (
                  <div key={`${voteRecord.account}-${voteRecord.ledgerIndex}`} className="border border-black/10 bg-[#F7F8FC] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-orbitron text-[10px] font-black uppercase">
                        {voteRecord.title}
                      </p>
                      <span className="font-mono text-[9px] text-black/35">
                        {formatVoteTime(voteRecord.timestamp)}
                      </span>
                    </div>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-black/40 mt-2">
                      {shortWallet(voteRecord.account)} · Ledger {voteRecord.ledgerIndex}
                    </p>
                  </div>
                ))}

                {(voteStats?.recentVotes?.length ?? 0) === 0 && (
                  <div className="border border-black/10 bg-[#F7F8FC] p-4">
                    <p className="font-mono text-xs text-black/45 leading-relaxed">
                      {isEnglish
                        ? "No verified votes yet. The first signed Xaman vote will appear here."
                        : "Nog geen geverifieerde stemmen. De eerste ondertekende Xaman-stem verschijnt hier."}
                    </p>
                  </div>
                )}
              </div>
            </Panel>

            <Panel>
              <div className="flex items-center gap-2 mb-5">
                <ExternalLink size={18} className="text-[#C83888]" />
                <p className="font-orbitron text-xs uppercase tracking-widest">
                  {isEnglish ? "Support Phase 1" : "Support Fase 1"}
                </p>
              </div>

              <p className="font-mono text-xs text-black/60 leading-relaxed mb-4">
                {isEnglish
                  ? "Voluntary support helps fund promotion, XRPL education, onboarding, source-code distribution and continued product development."
                  : "Vrijwillige support helpt promotie, XRPL-educatie, onboarding, verspreiding van de sourcecode en verdere productontwikkeling."}
              </p>

              <a
                href={SUPPORT_DONATION_URL}
                className="block w-full bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] p-4 text-left text-white hover:brightness-95 transition-all"
              >
                <div className="flex items-center gap-3">
                  <ExternalLink size={17} />
                  <div>
                    <p className="font-orbitron text-xs font-black uppercase">
                      {isEnglish ? "Open Support Page" : "Open Supportpagina"}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-white/75">
                      {isEnglish ? "Live Xaman support payments" : "Live Xaman-supportbetalingen"}
                    </p>
                  </div>
                </div>
              </a>
            </Panel>

            {isGuest && (
              <button
                type="button"
                onClick={() => onNavigate?.("xaman")}
                className="w-full border border-black/10 bg-white p-4 text-left hover:bg-[#F7F8FC] transition-all"
              >
                <p className="font-orbitron text-xs font-bold uppercase text-black">
                  {isEnglish ? "Connect Xaman first" : "Koppel Xaman eerst"}
                </p>
                <p className="font-mono text-[10px] text-black/40 uppercase mt-1">
                  {isEnglish
                    ? "Optional: voting itself also identifies the signing wallet."
                    : "Optioneel: de stemming zelf identificeert ook de ondertekenende wallet."}
                </p>
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 border border-black/10 bg-[#F7F8FC] p-4 flex flex-wrap items-center gap-3">
          <CircleDot size={16} className="text-[#3898E8]" />
          <p className="font-mono text-[10px] uppercase tracking-widest text-black/45">
            {isEnglish
              ? `Live cycle: ${voteStats?.cycle ?? "cycle-1"} · Updated: ${voteStats?.updatedAt ? new Date(voteStats.updatedAt).toLocaleTimeString() : "loading"}`
              : `Live cyclus: ${voteStats?.cycle ?? "cycle-1"} · Bijgewerkt: ${voteStats?.updatedAt ? new Date(voteStats.updatedAt).toLocaleTimeString() : "laden"}`}
          </p>
        </div>
      </section>
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="border border-black/10 bg-white p-5 shadow-sm shadow-black/5">{children}</div>;
}

function MetricCard({
  icon: Icon,
  label,
  value,
  text,
}: {
  icon: typeof Compass;
  label: string;
  value: string;
  text: string;
}) {
  return (
    <div className="col-span-12 md:col-span-6 xl:col-span-3 border border-black/10 bg-[#F7F8FC] p-5">
      <Icon size={18} className="text-[#3898E8] mb-4" />
      <p className="font-mono text-[10px] uppercase tracking-widest text-black/35 mb-2">{label}</p>
      <p className="font-orbitron text-sm font-black uppercase break-words mb-2">{value}</p>
      <p className="font-mono text-xs text-black/50 leading-relaxed break-all">{text}</p>
    </div>
  );
}

function MiniStatus({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-3">
      <p className="font-mono text-[9px] uppercase tracking-widest text-black/35 mb-2">{label}</p>
      <p className="font-mono text-[10px] text-black/60 leading-relaxed break-all">{value}</p>
    </div>
  );
}

function InfoLine({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <CheckCircle2 size={14} className="text-[#3898E8] mt-0.5 shrink-0" />
      <p className="font-mono text-xs text-black/55 leading-relaxed">{text}</p>
    </div>
  );
}
