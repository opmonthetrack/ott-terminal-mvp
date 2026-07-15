import type { ElementType } from "react";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Brain,
  Fingerprint,
  Gauge,
  HeartHandshake,
  KeyRound,
  Layers3,
  Link2,
  LockKeyhole,
  MessageSquareText,
  Newspaper,
  Radio,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  Wallet,
} from "lucide-react";
import { LanguageToggle } from "../components/LanguageToggle";
import { OTTLogo, OTTLogoMark, OTTProofBadge } from "../components/OTTLogo";
import { MAKE_WAVES_SOURCE_TAG } from "../lib/makeWaves";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

type TerminalHomeTabProps = {
  walletAddress?: string;
  onNavigate?: (target: string) => void;
};

type ProductLayer = {
  id: string;
  title: string;
  label: string;
  description: string;
  bullets: string[];
  icon: ElementType;
  actionLabel: string;
  target: string;
  accent: "blue" | "magenta" | "coral";
};

type Metric = {
  label: string;
  value: string;
  text: string;
  icon: ElementType;
};

export function TerminalHomeTab({
  walletAddress = "guest",
  onNavigate,
}: TerminalHomeTabProps) {
  const { language, setLanguage, copy } = useTerminalLanguage();
  const common = copy.common;
  const isEnglish = language === "en";

  const productLayers: ProductLayer[] = [
    {
      id: "xrpl-intelligence",
      title: isEnglish ? "XRPL Intelligence" : "XRPL Intelligence",
      label: isEnglish ? "Live source layer" : "Live bronlaag",
      description: isEnglish
        ? "Follow XRPL, XLS, Ripple, CBDC and ISO 20022 signals from a source-first feed."
        : "Volg XRPL-, XLS-, Ripple-, CBDC- en ISO 20022-signalen vanuit een source-first feed.",
      bullets: [
        isEnglish ? "Live /api/news intelligence queue." : "Live /api/news intelligence queue.",
        isEnglish ? "Official-source weighting and review flags." : "Official-source weighting en review flags.",
        isEnglish ? "Macro context without overclaiming XRP usage." : "Macro-context zonder XRP-gebruik te overclaimen.",
      ],
      icon: Radio,
      actionLabel: isEnglish ? "Open XRPL Intelligence" : "Open XRPL Intelligence",
      target: "intel",
      accent: "blue",
    },
    {
      id: "social-newsroom",
      title: isEnglish ? "Social Newsroom" : "Social Newsroom",
      label: isEnglish ? "Content engine" : "Content engine",
      description: isEnglish
        ? "Turn intelligence into source-first drafts for X, LinkedIn, Instagram, Facebook, Medium, TikTok, WhatsApp and YouTube."
        : "Zet intelligence om naar source-first drafts voor X, LinkedIn, Instagram, Facebook, Medium, TikTok, WhatsApp en YouTube.",
      bullets: [
        isEnglish ? "Copy-ready posts with emoji, hashtags and safe mentions." : "Copy-ready posts met emoji, hashtags en veilige mentions.",
        isEnglish ? "Open source and platform buttons." : "Open source- en platformbuttons.",
        isEnglish ? "OTT / TruthOnTheTrack attribution stays visible." : "OTT / TruthOnTheTrack attribution blijft zichtbaar.",
      ],
      icon: Newspaper,
      actionLabel: isEnglish ? "Open Newsroom" : "Open Newsroom",
      target: "news",
      accent: "magenta",
    },
    {
      id: "academy-proof",
      title: isEnglish ? "Academy + Proof" : "Academy + Proof",
      label: isEnglish ? "Learn to verify" : "Leer verifiëren",
      description: isEnglish
        ? "Learn wallet safety, XRPL basics and proof actions before touching advanced tools."
        : "Leer walletveiligheid, XRPL-basics en proof-acties voordat je geavanceerde tools gebruikt.",
      bullets: [
        isEnglish ? "Start with free education." : "Start met gratis educatie.",
        isEnglish ? "Earn XP through verified SourceTag actions." : "Verdien XP via geverifieerde SourceTag-acties.",
        isEnglish ? "SourceTag proof identity: 2606170002." : "SourceTag proof-identiteit: 2606170002.",
      ],
      icon: BookOpen,
      actionLabel: isEnglish ? "Start Academy" : "Start Academy",
      target: "academy",
      accent: "magenta",
    },
    {
      id: "access-pass",
      title: isEnglish ? "Access Pass" : "Access Pass",
      label: isEnglish ? "Utility gate" : "Utility gate",
      description: isEnglish
        ? "Premium areas unlock only when the connected wallet holds the exact OTT Access Pass NFT."
        : "Premiumdelen unlocken alleen wanneer de gekoppelde wallet de exacte OTT Access Pass NFT bezit.",
      bullets: [
        isEnglish ? "Scanner-only V1 gate." : "Scanner-only V1 gate.",
        isEnglish ? "Issuer, taxon and metadata CID match." : "Issuer, taxon en metadata CID match.",
        isEnglish ? "No mint or payment flow active here." : "Geen mint- of paymentflow actief hier.",
      ],
      icon: KeyRound,
      actionLabel: isEnglish ? "Scan Access Pass" : "Scan Access Pass",
      target: "accessgate",
      accent: "coral",
    },
  ];

  const metrics: Metric[] = [
    {
      label: "Product",
      value: "V1 Live",
      text: "Intelligence + proof",
      icon: Layers3,
    },
    {
      label: common.sourceTag,
      value: String(MAKE_WAVES_SOURCE_TAG),
      text: "Make Waves identity",
      icon: Fingerprint,
    },
    {
      label: common.wallet,
      value: "Xaman",
      text: "Self-custody connect",
      icon: Wallet,
    },
    {
      label: "Position",
      value: "Safe",
      text: "No custody / no broker",
      icon: ShieldCheck,
    },
  ];

  function navigate(target: string) {
    onNavigate?.(target);
  }

  return (
    <div className="min-h-screen bg-white text-[#080808]">
      <section className="relative overflow-hidden border-b border-black/10 bg-[radial-gradient(circle_at_18%_18%,rgba(56,152,232,0.18),transparent_28%),radial-gradient(circle_at_82%_8%,rgba(200,56,136,0.18),transparent_28%),radial-gradient(circle_at_85%_82%,rgba(216,72,88,0.12),transparent_30%),#ffffff]">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.15),#ffffff_92%)]" />

        <div className="relative z-10 p-4 md:p-6 xl:p-10">
          <div className="flex justify-end mb-4">
            <LanguageToggle language={language} onChange={setLanguage} />
          </div>

          <div className="grid grid-cols-12 gap-6 items-center">
            <div className="col-span-12 xl:col-span-7">
              <div className="mb-8 text-[#080808]">
                <OTTLogo
                  size="lg"
                  subtitle="Make Waves + Xaman + XRPL Intelligence + SourceTag Proof"
                />
              </div>

              <div className="inline-flex items-center gap-2 border border-black/10 bg-white/80 shadow-sm px-4 py-2 mb-6">
                <Activity size={15} className="text-[#3898E8]" />

                <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/55">
                  {isEnglish
                    ? "Make Waves Intelligence Terminal"
                    : "Make Waves Intelligence Terminal"}
                </p>
              </div>

              <h1 className="font-orbitron text-4xl md:text-5xl xl:text-7xl font-black uppercase leading-none tracking-tight mb-6">
                XRPL
                <br />
                <span className="bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] bg-clip-text text-transparent">
                  OnTheTrack
                </span>
                <br />
                Terminal
              </h1>

              <p className="font-mono text-sm xl:text-base text-black/60 leading-relaxed max-w-3xl mb-8">
                {isEnglish
                  ? `Built by TruthOnTheTrack with years of XRPL community knowledge, love for education and a clear Make Waves proof identity: SourceTag ${MAKE_WAVES_SOURCE_TAG}. Start free, follow verified intelligence, connect Xaman, learn safely and verify before you trust.`
                  : `Gebouwd door TruthOnTheTrack met jaren XRPL community-kennis, liefde voor educatie en een duidelijke Make Waves proof-identiteit: SourceTag ${MAKE_WAVES_SOURCE_TAG}. Start gratis, volg geverifieerde intelligence, connect Xaman, leer veilig en verifieer voordat je vertrouwt.`}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 max-w-5xl">
                <PrimaryAction
                  title={isEnglish ? "XRPL Intel" : "XRPL Intel"}
                  text={isEnglish ? "Live sources" : "Live bronnen"}
                  icon={Radio}
                  accent="blue"
                  onClick={() => navigate("intel")}
                />
                <PrimaryAction
                  title={isEnglish ? "Newsroom" : "Newsroom"}
                  text={isEnglish ? "Create posts" : "Maak posts"}
                  icon={Newspaper}
                  accent="magenta"
                  onClick={() => navigate("news")}
                />
                <PrimaryAction
                  title={isEnglish ? "Daily Proof" : "Daily Proof"}
                  text={isEnglish ? "Make Waves XP" : "Make Waves XP"}
                  icon={Fingerprint}
                  accent="blue"
                  onClick={() => navigate("checkin")}
                />
                <PrimaryAction
                  title={isEnglish ? "Start Academy" : "Start Academy"}
                  text={isEnglish ? "Deep XRPL learning" : "Diepe XRPL educatie"}
                  icon={BookOpen}
                  accent="coral"
                  onClick={() => navigate("academy")}
                />
              </div>
            </div>

            <div className="col-span-12 xl:col-span-5">
              <div className="relative border border-black/10 bg-white/90 backdrop-blur p-5 md:p-8 overflow-hidden shadow-2xl shadow-black/5">
                <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#C83888]/15 blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-[#3898E8]/15 blur-3xl" />

                <div className="relative z-10">
                  <div className="flex justify-center mb-8">
                    <div className="relative">
                      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(56,152,232,0.28),rgba(200,56,136,0.22),rgba(216,72,88,0.18))] blur-3xl" />
                      <OTTLogoMark size="hero" className="relative z-10" />
                    </div>
                  </div>

                  <div className="mb-5 text-[#080808]">
                    <OTTProofBadge sourceTag={String(MAKE_WAVES_SOURCE_TAG)} />
                  </div>

                  <div className="space-y-3">
                    <IdentityRow
                      label={common.connectedWallet}
                      value={walletAddress === "guest" ? common.guestMode : walletAddress}
                    />
                    <IdentityRow label="Builder" value="TruthOnTheTrack" />
                    <IdentityRow label="Live Layer" value="XRPL Intelligence" />
                    <IdentityRow label={common.custody} value={common.never} />
                  </div>

                  <div className="border border-black/10 bg-[#F7F8FC] p-4 mt-5">
                    <div className="flex items-start gap-3">
                      <LockKeyhole size={18} className="text-[#C83888] shrink-0 mt-0.5" />

                      <p className="font-mono text-xs text-black/55 leading-relaxed">
                        {common.noCustodyLine}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mt-8">
            {metrics.map((metric) => (
              <MetricCard key={metric.label} metric={metric} />
            ))}
          </div>
        </div>
      </section>

      <section className="p-4 md:p-6 xl:p-10 bg-white">
        <div className="grid grid-cols-12 gap-4 mb-8">
          <div className="col-span-12 xl:col-span-7 border border-black/10 bg-[#F7F8FC] p-5 md:p-6">
            <div className="flex items-center gap-2 mb-5">
              <Trophy size={18} className="text-[#C83888]" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                {isEnglish ? "Make Waves Mission" : "Make Waves Missie"}
              </p>
            </div>

            <h2 className="font-orbitron text-2xl xl:text-3xl font-black uppercase mb-5">
              {isEnglish
                ? "From learning to proof to public intelligence."
                : "Van leren naar proof naar publieke intelligence."}
            </h2>

            <p className="font-mono text-sm text-black/55 leading-relaxed mb-5">
              {isEnglish
                ? "OTT Terminal is now a practical XRPL onboarding and intelligence layer: visitors can follow source-first updates, turn them into safe social drafts, learn XRPL basics, connect Xaman, verify SourceTag proof, earn XP and understand why premium routes exist. The goal is not hype, custody or speculation. The goal is to make real XRPL activity understandable, trackable and usable."
                : "OTT Terminal is nu een praktische XRPL-onboarding- en intelligence-laag: bezoekers kunnen source-first updates volgen, ze omzetten naar veilige social drafts, XRPL-basics leren, Xaman connecten, SourceTag proof verifiëren, XP verdienen en begrijpen waarom premiumroutes bestaan. Het doel is geen hype, custody of speculatie. Het doel is echte XRPL-activiteit begrijpelijk, controleerbaar en bruikbaar maken."}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <MissionPoint
                title={isEnglish ? "Read" : "Lees"}
                text={isEnglish ? "Source-first intelligence." : "Source-first intelligence."}
              />
              <MissionPoint
                title={isEnglish ? "Create" : "Creëer"}
                text={isEnglish ? "Safe social drafts." : "Veilige social drafts."}
              />
              <MissionPoint
                title={isEnglish ? "Prove" : "Bewijs"}
                text={`SourceTag ${MAKE_WAVES_SOURCE_TAG}.`}
              />
              <MissionPoint
                title={isEnglish ? "Learn" : "Leer"}
                text={isEnglish ? "Academy + XP." : "Academy + XP."}
              />
            </div>
          </div>

          <div className="col-span-12 xl:col-span-5 border border-[#C83888]/25 bg-[#C83888]/10 p-5 md:p-6">
            <div className="flex items-center gap-2 mb-5">
              <HeartHandshake size={18} className="text-[#C83888]" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                {isEnglish ? "Future XRP / RLUSD Support" : "Toekomstige XRP / RLUSD Support"}
              </p>
            </div>

            <h3 className="font-orbitron text-xl font-black uppercase mb-4">
              {isEnglish ? "Transparent support later." : "Transparante support later."}
            </h3>

            <p className="font-mono text-xs text-black/60 leading-relaxed mb-4">
              {isEnglish
                ? "A later support area can create voluntary XRP or RLUSD support transactions with SourceTag 2606170002 and an optional memo/comment. Support stays voluntary, not an investment or guaranteed reward."
                : "Een latere support-sectie kan vrijwillige XRP- of RLUSD-supporttransacties maken met SourceTag 2606170002 en optionele memo/comment. Support blijft vrijwillig, geen investering of gegarandeerde reward."}
            </p>

            <div className="grid grid-cols-3 gap-2">
              {["0.0589", "0.589", "1.0589", "1.589", "2.0589", "2.589"].map((amount) => (
                <div key={amount} className="border border-black/10 bg-white p-3">
                  <p className="font-orbitron text-[11px] font-black uppercase text-black">
                    {amount}
                  </p>
                  <p className="font-mono text-[8px] uppercase tracking-widest text-black/35">
                    XRP / RLUSD
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              <SupportMini
                icon={MessageSquareText}
                title={isEnglish ? "Memo / Comment" : "Memo / Comment"}
                text={
                  isEnglish
                    ? "Supporters can later add a short message, tip or personal note."
                    : "Supporters kunnen later een korte boodschap, tip of persoonlijke note meesturen."
                }
              />
              <SupportMini
                icon={Search}
                title={isEnglish ? "Transparent Use" : "Transparant Gebruik"}
                text={
                  isEnglish
                    ? "Funds can be shown as terminal, education, tools and events."
                    : "Funds kunnen worden getoond als terminal, educatie, tools en events."
                }
              />
            </div>

            <p className="font-mono text-[10px] text-black/45 leading-relaxed mt-4">
              {isEnglish
                ? "Draft only: no donation/payment flow is active in this V1 screen."
                : "Concept alleen: geen donatie/paymentflow actief in dit V1-scherm."}
            </p>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4 mb-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/35 mb-3">
              {isEnglish ? "Live Product Structure" : "Live Productstructuur"}
            </p>

            <h2 className="font-orbitron text-2xl xl:text-3xl font-black uppercase">
              {isEnglish ? "Intelligence, proof and access." : "Intelligence, proof en access."}
            </h2>
          </div>

          <p className="font-mono text-xs text-black/50 max-w-xl leading-relaxed">
            {isEnglish
              ? "The terminal is structured so users can read sources, understand context and verify first. Premium services remain behind the Access Pass scanner."
              : "De terminal is zo opgebouwd dat gebruikers eerst bronnen lezen, context begrijpen en verifiëren. Premiumservices blijven achter de Access Pass scanner."}
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 mb-8">
          {productLayers.map((layer) => (
            <LayerCard
              key={layer.id}
              layer={layer}
              continueText={common.continueRoute}
              onNavigate={navigate}
            />
          ))}
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-7 border border-black/10 bg-[#F7F8FC] p-4 md:p-6">
            <div className="flex items-center gap-2 mb-5">
              <Gauge size={18} className="text-[#3898E8]" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                {isEnglish ? "Main Flow" : "Main Flow"}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-3">
              <FlowStep number="01" title="Intel" text="Live sources" />
              <FlowStep number="02" title="Newsroom" text="Social drafts" />
              <FlowStep number="03" title="Connect" text="Xaman wallet" />
              <FlowStep number="04" title="Learn" text="Academy" />
              <FlowStep number="05" title="Prove" text="SourceTag" />
              <FlowStep number="06" title="Ledger" text="XP / Credits" />
            </div>
          </div>

          <div className="col-span-12 xl:col-span-5 border border-black/10 bg-[#F7F8FC] p-4 md:p-6">
            <div className="flex items-center gap-2 mb-5">
              <BadgeCheck size={18} className="text-[#C83888]" />

              <p className="font-orbitron text-xs uppercase tracking-widest">
                {isEnglish ? "Legal-safe V1" : "Legal-safe V1"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <ReuseItem text={isEnglish ? "No custody." : "Geen custody."} />
              <ReuseItem text={isEnglish ? "No broker." : "Geen broker."} />
              <ReuseItem text={isEnglish ? "No yield promise." : "Geen yield-belofte."} />
              <ReuseItem text={isEnglish ? "No token value promise." : "Geen tokenwaarde-belofte."} />
              <ReuseItem text={isEnglish ? "No trading signal." : "Geen trading signal."} />
              <ReuseItem text={isEnglish ? "Support is voluntary." : "Support is vrijwillig."} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function PrimaryAction({
  title,
  text,
  icon: Icon,
  accent,
  onClick,
}: {
  title: string;
  text: string;
  icon: ElementType;
  accent: "blue" | "magenta" | "coral";
  onClick: () => void;
}) {
  const accentClasses = getAccentClasses(accent);

  return (
    <button
      onClick={onClick}
      className={`group border bg-white p-4 text-left transition-all min-h-28 shadow-sm hover:-translate-y-0.5 hover:shadow-xl ${accentClasses.border}`}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <Icon size={20} className={accentClasses.icon} />
        <ArrowRight size={17} className="text-black/25 group-hover:text-black" />
      </div>

      <p className="font-orbitron text-xs font-black uppercase mb-2 text-black">
        {title}
      </p>
      <p className="font-mono text-[10px] uppercase text-black/45">{text}</p>
    </button>
  );
}

function MetricCard({ metric }: { metric: Metric }) {
  const Icon = metric.icon;

  return (
    <div className="border border-black/10 bg-white/90 p-4 shadow-sm">
      <Icon size={18} className="text-[#C83888] mb-3" />

      <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">
        {metric.label}
      </p>

      <p className="font-orbitron text-sm font-black uppercase mb-1 break-all text-black">
        {metric.value}
      </p>

      <p className="font-mono text-[10px] text-black/35 uppercase">
        {metric.text}
      </p>
    </div>
  );
}

function LayerCard({
  layer,
  continueText,
  onNavigate,
}: {
  layer: ProductLayer;
  continueText: string;
  onNavigate: (target: string) => void;
}) {
  const Icon = layer.icon;
  const accentClasses = getAccentClasses(layer.accent);

  return (
    <div className={`border bg-white p-5 md:p-6 transition-all shadow-sm hover:shadow-xl ${accentClasses.border}`}>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="font-mono text-[10px] text-black/35 uppercase tracking-[0.28em] mb-3">
            {layer.label}
          </p>

          <h3 className="font-orbitron text-xl font-black uppercase text-black">
            {layer.title}
          </h3>
        </div>

        <Icon size={30} className={`${accentClasses.icon} shrink-0`} />
      </div>

      <p className="font-mono text-sm text-black/55 leading-relaxed mb-5">
        {layer.description}
      </p>

      <div className="space-y-3 mb-6">
        {layer.bullets.map((bullet) => (
          <div key={bullet} className="flex items-start gap-2">
            <Sparkles size={13} className={`${accentClasses.icon} mt-0.5 shrink-0`} />
            <p className="font-mono text-xs text-black/50 leading-relaxed">
              {bullet}
            </p>
          </div>
        ))}
      </div>

      <button
        onClick={() => onNavigate(layer.target)}
        className="w-full border border-black/10 bg-[#F7F8FC] p-4 text-left hover:bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] hover:text-white transition-all group"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-orbitron text-xs font-black uppercase mb-2">
              {layer.actionLabel}
            </p>
            <p className="font-mono text-[10px] uppercase text-black/45 group-hover:text-white/75">
              {continueText}
            </p>
          </div>

          <ArrowRight size={17} className="text-black/40 group-hover:text-white" />
        </div>
      </button>
    </div>
  );
}

function IdentityRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-black/10 bg-white p-3">
      <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">
        {label}
      </p>

      <p className="font-orbitron text-xs font-black uppercase break-all text-black">
        {value}
      </p>
    </div>
  );
}

function SupportMini({
  icon: Icon,
  title,
  text,
}: {
  icon: ElementType;
  title: string;
  text: string;
}) {
  return (
    <div className="border border-black/10 bg-white p-3">
      <Icon size={15} className="text-[#C83888] mb-2" />

      <p className="font-orbitron text-[10px] font-black uppercase text-black mb-2">
        {title}
      </p>

      <p className="font-mono text-[10px] text-black/50 leading-relaxed">
        {text}
      </p>
    </div>
  );
}

function MissionPoint({ title, text }: { title: string; text: string }) {
  return (
    <div className="border border-black/10 bg-white p-4">
      <p className="font-orbitron text-xs font-black uppercase text-black mb-2">
        {title}
      </p>

      <p className="font-mono text-xs text-black/45 leading-relaxed">
        {text}
      </p>
    </div>
  );
}

function FlowStep({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="border border-black/10 bg-white p-4">
      <p className="font-orbitron text-xs font-black text-[#C83888] mb-4">
        {number}
      </p>

      <p className="font-orbitron text-xs font-black uppercase mb-2 text-black">
        {title}
      </p>
      <p className="font-mono text-[10px] text-black/40 uppercase">{text}</p>
    </div>
  );
}

function ReuseItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 border border-black/10 bg-white p-3">
      <Link2 size={13} className="text-[#3898E8] mt-0.5 shrink-0" />

      <p className="font-mono text-xs text-black/50 leading-relaxed">{text}</p>
    </div>
  );
}

function getAccentClasses(accent: "blue" | "magenta" | "coral") {
  if (accent === "blue") {
    return {
      border: "border-[#3898E8]/30 hover:border-[#3898E8]",
      icon: "text-[#3898E8]",
    };
  }

  if (accent === "coral") {
    return {
      border: "border-[#D84858]/30 hover:border-[#D84858]",
      icon: "text-[#D84858]",
    };
  }

  return {
    border: "border-[#C83888]/30 hover:border-[#C83888]",
    icon: "text-[#C83888]",
  };
}

export default TerminalHomeTab;
