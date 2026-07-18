import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  CircleDot,
  Compass,
  ExternalLink,
  Lock,
  Radio,
  ShieldCheck,
  Sparkles,
  Vote,
  Wallet,
} from "lucide-react";
import { OTTLogo, OTTProofBadge } from "../components/OTTLogo";
import { MAKE_WAVES_SOURCE_TAG } from "../lib/makeWaves";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

type RoadmapTabProps = {
  walletAddress?: string;
  onNavigate?: (target: string) => void;
};

type PhaseOption = {
  id: string;
  phase: string;
  title: string;
  status: string;
  text: string;
  bullets: string[];
};

const VOTE_STORAGE_KEY = "ott-terminal-roadmap-vote-v1";
const VOTE_COUNTS_STORAGE_KEY = "ott-terminal-roadmap-vote-counts-v1";
const SUPPORT_DONATION_URL = "/support-donation.html";

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
  return phaseOptions.reduce<Record<string, number>>((counts, option) => {
    counts[option.id] = 0;
    return counts;
  }, {});
}

function loadStoredVote() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(VOTE_STORAGE_KEY) ?? "";
}

function loadStoredCounts() {
  const emptyCounts = createEmptyCounts();

  if (typeof window === "undefined") {
    return emptyCounts;
  }

  try {
    const raw = window.localStorage.getItem(VOTE_COUNTS_STORAGE_KEY);

    if (!raw) {
      return emptyCounts;
    }

    const parsed = JSON.parse(raw) as Record<string, number>;

    return phaseOptions.reduce<Record<string, number>>((counts, option) => {
      const value = parsed[option.id];
      counts[option.id] = Number.isFinite(value) && value > 0 ? value : 0;
      return counts;
    }, {});
  } catch {
    return emptyCounts;
  }
}

export function RoadmapTab({ walletAddress = "guest", onNavigate }: RoadmapTabProps) {
  const { language } = useTerminalLanguage();
  const isEnglish = language === "en";
  const [selectedVote, setSelectedVote] = useState(() => loadStoredVote());
  const [voteCounts, setVoteCounts] = useState(() => loadStoredCounts());
  const [status, setStatus] = useState(
    isEnglish
      ? "Choose the phase you want OTT Terminal to focus on next. This is community feedback, not governance or financial rights."
      : "Kies op welke fase OTT Terminal hierna moet focussen. Dit is community feedback, geen governance of financiële rechten.",
  );

  const isGuest = !walletAddress || walletAddress === "guest";
  const totalVotes = useMemo(
    () => Object.values(voteCounts).reduce((total, value) => total + value, 0),
    [voteCounts],
  );
  const selectedOption = phaseOptions.find((option) => option.id === selectedVote) ?? null;

  useEffect(() => {
    setStatus(
      selectedVote
        ? isEnglish
          ? "Your local vote is saved in this browser. Public on-chain tallying can be added later after the main customer flow is stable."
          : "Je lokale stem is opgeslagen in deze browser. Publieke on-chain telling kan later worden toegevoegd nadat de klantflow stabiel is."
        : isEnglish
          ? "Choose the phase you want OTT Terminal to focus on next. This is community feedback, not governance or financial rights."
          : "Kies op welke fase OTT Terminal hierna moet focussen. Dit is community feedback, geen governance of financiële rechten.",
    );
  }, [isEnglish, selectedVote]);

  function castVote(optionId: string) {
    const nextCounts = { ...voteCounts };

    if (selectedVote && nextCounts[selectedVote] > 0) {
      nextCounts[selectedVote] -= 1;
    }

    nextCounts[optionId] = (nextCounts[optionId] ?? 0) + 1;

    setSelectedVote(optionId);
    setVoteCounts(nextCounts);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(VOTE_STORAGE_KEY, optionId);
      window.localStorage.setItem(VOTE_COUNTS_STORAGE_KEY, JSON.stringify(nextCounts));
    }

    const option = phaseOptions.find((phase) => phase.id === optionId);
    setStatus(
      isEnglish
        ? `Vote saved locally for ${option?.title ?? "the next phase"}. This helps guide build order, but does not create governance, token or financial rights.`
        : `Stem lokaal opgeslagen voor ${option?.title ?? "de volgende fase"}. Dit helpt de bouwvolgorde bepalen, maar geeft geen governance-, token- of financiële rechten.`,
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#080808]">
      <section className="relative overflow-hidden border-b border-black/10 bg-[radial-gradient(circle_at_82%_12%,rgba(200,56,136,0.16),transparent_32%),radial-gradient(circle_at_12%_88%,rgba(56,152,232,0.16),transparent_34%),#ffffff] p-4 md:p-8 xl:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="text-[#080808]">
            <OTTLogo
              size="lg"
              subtitle={isEnglish ? "Community roadmap vote — phase by phase" : "Community roadmap vote — fase voor fase"}
            />
          </div>
          <OTTProofBadge sourceTag={String(MAKE_WAVES_SOURCE_TAG)} />
        </div>

        <div className="max-w-5xl">
          <div className="inline-flex items-center gap-2 border border-black/10 bg-white/80 shadow-sm px-4 py-2 mb-6">
            <Vote size={15} className="text-[#C83888]" />
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/55">
              {isEnglish ? "Phase Voting V1" : "Fase Voting V1"}
            </p>
          </div>

          <h1 className="font-orbitron text-4xl md:text-6xl font-black uppercase leading-none tracking-tight mb-6">
            {isEnglish ? "Help choose" : "Kies mee"}
            <br />
            <span className="bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] bg-clip-text text-transparent">
              {isEnglish ? "the next phase." : "de volgende fase."}
            </span>
          </h1>

          <p className="font-mono text-sm md:text-base text-black/60 leading-relaxed max-w-3xl">
            {isEnglish
              ? "OTT Terminal ships in clear phases. The community vote helps decide what should receive focus next, without pretending that unfinished features are already live. Votes are product feedback signals only."
              : "OTT Terminal wordt in duidelijke fases gebouwd. De community vote helpt bepalen waar de volgende focus heen moet, zonder te doen alsof toekomstige features al live zijn. Stemmen zijn alleen product-feedbacksignalen."}
          </p>
        </div>
      </section>

      <section className="p-4 md:p-8 xl:p-10 bg-white">
        <div className="grid grid-cols-12 gap-4 mb-6">
          <MetricCard icon={Compass} label="Current Focus" value="Phase 1" text="Learn, Xaman, proof, Access Pass, vote and support." />
          <MetricCard icon={Wallet} label="Wallet" value={isGuest ? "Optional" : "Connected"} text={isGuest ? "Voting works without login in V1." : walletAddress} />
          <MetricCard icon={Radio} label="Local Signals" value={String(totalVotes)} text="Stored in this browser for phase 1 feedback." />
          <MetricCard icon={Lock} label="Rights" value="None" text="No governance, token or financial rights." />
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-8">
            <Panel>
              <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#3898E8] mb-2">
                    {isEnglish ? "Community Build Order" : "Community Bouwvolgorde"}
                  </p>
                  <h2 className="font-orbitron text-2xl font-black uppercase">
                    {isEnglish ? "Choose the next focus" : "Kies de volgende focus"}
                  </h2>
                </div>
                {selectedOption && (
                  <div className="border border-[#3898E8]/25 bg-[#3898E8]/10 px-4 py-3">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-black/45">
                      {isEnglish ? "Your vote" : "Jouw stem"}
                    </p>
                    <p className="font-orbitron text-xs font-black uppercase">{selectedOption.title}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {phaseOptions.map((option) => {
                  const votes = voteCounts[option.id] ?? 0;
                  const percent = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
                  const isSelected = selectedVote === option.id;

                  return (
                    <article
                      key={option.id}
                      className={`border p-5 flex flex-col min-h-[360px] ${
                        isSelected ? "border-[#3898E8] bg-[#3898E8]/5" : "border-black/10 bg-[#F7F8FC]"
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
                        <span className="font-mono text-[10px] uppercase tracking-widest text-black/40">
                          {option.status}
                        </span>
                      </div>

                      <p className="font-mono text-xs text-black/58 leading-relaxed mb-5">{option.text}</p>

                      <div className="space-y-2 mb-6 flex-1">
                        {option.bullets.map((bullet) => (
                          <InfoLine key={bullet} text={bullet} />
                        ))}
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-black/40 mb-2">
                          <span>{isEnglish ? "Local votes" : "Lokale stemmen"}</span>
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
                        onClick={() => castVote(option.id)}
                        className={`min-h-12 px-4 py-3 font-orbitron text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                          isSelected ? "bg-[#3898E8] text-white" : "bg-black text-white hover:opacity-90"
                        }`}
                      >
                        {isSelected ? <BadgeCheck size={16} /> : <Vote size={16} />}
                        {isSelected ? (isEnglish ? "Selected" : "Gekozen") : (isEnglish ? "Vote for this phase" : "Stem op deze fase")}
                      </button>
                    </article>
                  );
                })}
              </div>
            </Panel>
          </div>

          <div className="col-span-12 xl:col-span-4 space-y-4">
            <Panel>
              <div className="flex items-center gap-2 mb-5">
                <ShieldCheck size={18} className="text-[#3898E8]" />
                <p className="font-orbitron text-xs uppercase tracking-widest">
                  {isEnglish ? "Safe Voting Scope" : "Veilige Voting Scope"}
                </p>
              </div>

              <div className="space-y-3">
                <InfoLine text={isEnglish ? "Votes are product feedback signals only." : "Stemmen zijn alleen product-feedbacksignalen."} />
                <InfoLine text={isEnglish ? "No governance rights, token rights or financial rights." : "Geen governance-, token- of financiële rechten."} />
                <InfoLine text={isEnglish ? "Founder remains responsible for final build order and legal review." : "Founder blijft verantwoordelijk voor definitieve bouwvolgorde en legal review."} />
                <InfoLine text={isEnglish ? "On-chain vote validation can be added later after the main flow is stable." : "On-chain votevalidatie kan later worden toegevoegd nadat de hoofdflow stabiel is."} />
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
                <ExternalLink size={18} className="text-[#C83888]" />
                <p className="font-orbitron text-xs uppercase tracking-widest">
                  {isEnglish ? "Support Phase 1" : "Support Fase 1"}
                </p>
              </div>

              <p className="font-mono text-xs text-black/60 leading-relaxed mb-4">
                {isEnglish
                  ? "Voluntary support helps fund XRPL education, onboarding, Make Waves delivery, content and continued product development. It does not create investment rights, yield, token rights or guaranteed access."
                  : "Vrijwillige support helpt XRPL-educatie, onboarding, Make Waves delivery, content en verdere productontwikkeling. Het geeft geen investeringsrechten, yield, tokenrechten of gegarandeerde toegang."}
              </p>

              <a
                href={SUPPORT_DONATION_URL}
                target="_blank"
                rel="noreferrer"
                className="block w-full bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] p-4 text-left text-white hover:brightness-95 transition-all"
              >
                <div className="flex items-center gap-3">
                  <ExternalLink size={17} />
                  <div>
                    <p className="font-orbitron text-xs font-black uppercase">
                      {isEnglish ? "Open Support Page" : "Open Supportpagina"}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-white/75">
                      {isEnglish ? "Voluntary donation info" : "Vrijwillige donatie-info"}
                    </p>
                  </div>
                </div>
              </a>
            </Panel>

            <Panel>
              <div className="flex items-center gap-2 mb-5">
                <CircleDot size={18} className="text-[#3898E8]" />
                <p className="font-orbitron text-xs uppercase tracking-widest">
                  {isEnglish ? "Phase 1 Boundary" : "Fase 1 Grens"}
                </p>
              </div>
              <div className="space-y-3">
                <InfoLine text="Home / Learn / Intelligence" />
                <InfoLine text="Xaman / Proof / Reward Ledger" />
                <InfoLine text="Access Gate / Buy Access Pass" />
                <InfoLine text="Roadmap Vote / Support Donation" />
              </div>
            </Panel>

            {isGuest && (
              <button
                type="button"
                onClick={() => onNavigate?.("xaman")}
                className="w-full border border-black/10 bg-white p-4 text-left hover:bg-[#F7F8FC] transition-all"
              >
                <p className="font-orbitron text-xs font-bold uppercase text-black">
                  {isEnglish ? "Connect Xaman for proof" : "Connect Xaman voor proof"}
                </p>
                <p className="font-mono text-[10px] text-black/40 uppercase mt-1">
                  {isEnglish ? "Voting is local now; proof actions use Xaman." : "Voting is nu lokaal; proof-acties gebruiken Xaman."}
                </p>
              </button>
            )}
          </div>
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
      <p className="font-orbitron text-sm font-black uppercase break-all mb-2">{value}</p>
      <p className="font-mono text-xs text-black/50 leading-relaxed break-all">{text}</p>
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
