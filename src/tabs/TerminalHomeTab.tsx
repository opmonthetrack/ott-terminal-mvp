import type { ElementType } from "react";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Fingerprint,
  Gauge,
  KeyRound,
  Layers3,
  Link2,
  LockKeyhole,
  Newspaper,
  Radio,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
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

type AccessStep = {
  title: string;
  label: string;
  text: string;
  icon: ElementType;
  target: string;
  accent: "blue" | "magenta" | "coral";
};

export function TerminalHomeTab({
  walletAddress = "guest",
  onNavigate,
}: TerminalHomeTabProps) {
  const { language, copy } = useTerminalLanguage();
  const common = copy.common;
  const isEnglish = language === "en";
  const isGuest = !walletAddress || walletAddress === "guest";

  const accessSteps: AccessStep[] = [
    {
      title: isEnglish ? "Free to learn" : "Gratis leren",
      label: isEnglish ? "No wallet required" : "Geen wallet nodig",
      text: isEnglish
        ? "Start with intelligence, Academy previews and safe XRPL context before connecting anything."
        : "Start met intelligence, Academy previews en veilige XRPL-context voordat je iets connect.",
      icon: BookOpen,
      target: "academy",
      accent: "blue",
    },
    {
      title: isEnglish ? "Xaman to prove" : "Xaman voor proof",
      label: isEnglish ? "Wallet optional until proof" : "Wallet pas nodig bij proof",
      text: isEnglish
        ? "When users are ready, Xaman unlocks SourceTag proof, XP and Reward Ledger activity."
        : "Wanneer gebruikers klaar zijn, activeert Xaman SourceTag-bewijs, XP en activiteit in het beloningsoverzicht.",
      icon: Wallet,
      target: isGuest ? "xamanactivation" : "xaman",
      accent: "magenta",
    },
    {
      title: isEnglish ? "Pass to unlock" : "Ontgrendel met toegangspas",
      label: isEnglish ? "Premium later" : "Later premium",
      text: isEnglish
        ? "Paid users can later unlock through a Web2 Access License or XRPL Access Pass scan."
        : "Gebruikers kunnen later premiumfuncties ontgrendelen via een Web2-toegangslicentie of een scan van de XRPL Access Pass.",
      icon: KeyRound,
      target: "accessgate",
      accent: "coral",
    },
  ];

  const productLayers: ProductLayer[] = [
    {
      id: "xrpl-intelligence",
      title: "XRPL Intelligence",
      label: isEnglish ? "Live source layer" : "Live bronlaag",
      description: isEnglish
        ? "Follow XRPL, XLS, Ripple, CBDC and ISO 20022 signals from a source-first feed."
        : "Volg XRPL-, XLS-, Ripple-, CBDC- en ISO 20022-signalen vanuit een source-first feed.",
      bullets: [
        isEnglish ? "Live /api/news intelligence queue." : "Live intelligencewachtrij via /api/news.",
        isEnglish ? "Official-source weighting and review flags." : "Weging van officiële bronnen en controlevlaggen.",
        isEnglish ? "Macro context without overclaiming XRP usage." : "Macrocontext zonder XRP-gebruik te overdrijven.",
      ],
      icon: Radio,
      actionLabel: "Open XRPL Intelligence",
      target: "intel",
      accent: "blue",
    },
    {
      id: "social-newsroom",
      title: "Social Newsroom",
      label: isEnglish ? "Content engine" : "Contentmotor",
      description: isEnglish
        ? "Turn intelligence into source-first drafts for X, LinkedIn, Instagram, Facebook, Medium, TikTok, WhatsApp and YouTube."
        : "Zet intelligentie om in brongebaseerde concepten voor X, LinkedIn, Instagram, Facebook, Medium, TikTok, WhatsApp en YouTube.",
      bullets: [
        isEnglish ? "Copy-ready posts with emoji, hashtags and safe mentions." : "Direct bruikbare berichten met emoji, hashtags en veilige vermeldingen.",
        isEnglish ? "Open source and platform buttons." : "Knoppen naar de bron en het platform.",
        isEnglish ? "OTT / TruthOnTheTrack attribution stays visible." : "OTT / TruthOnTheTrack attribution blijft zichtbaar.",
      ],
      icon: Newspaper,
      actionLabel: "Open Newsroom",
      target: "news",
      accent: "magenta",
    },
    {
      id: "xaman-activation",
      title: isEnglish ? "Xaman Activation" : "Xaman Activatie",
      label: isEnglish ? "Beginner onboarding" : "Begeleiding voor beginners",
      description: isEnglish
        ? "Explain why a new XRPL wallet needs activation and guide users safely before they use proof actions."
        : "Leg uit waarom een nieuwe XRPL-wallet activatie nodig heeft en begeleid gebruikers veilig vóór bewijsacties.",
      bullets: [
        isEnglish ? "No seed phrase sharing." : "Nooit seed phrase delen.",
        isEnglish ? "Self activation or assisted support later." : "Zelf activeren of later begeleide ondersteuning gebruiken.",
        isEnglish ? "No custody, no brokerage, no investment promise." : "Geen custody, geen broker, geen investeringsbelofte.",
      ],
      icon: Wallet,
      actionLabel: isEnglish ? "Open Activation Guide" : "Open Activatiegids",
      target: "xamanactivation",
      accent: "blue",
    },
    {
      id: "access-model",
      title: isEnglish ? "Access Model" : "Toegangsmodel",
      label: isEnglish ? "Web2 + XRPL routes" : "Web2- en XRPL-routes",
      description: isEnglish
        ? "Premium access is separated into a future fiat Web2 license and the current XRPL Access Pass scanner."
        : "Premiumtoegang is verdeeld over een toekomstige Web2-licentie in euro's en de huidige XRPL Access Pass-scanner.",
      bullets: [
        isEnglish ? "Free users are not blocked by wallet setup." : "Gratis gebruikers worden niet tegengehouden door walletinstellingen.",
        isEnglish ? "Fiat payment flow is coming later, not active now." : "Betalen in euro's komt later en is nu niet actief.",
        isEnglish ? "XRPL Access Pass uses Xaman payment, manual delivery and scanner-based unlock." : "De XRPL Access Pass gebruikt Xaman-betaling, handmatige levering en scanner-unlock.",
      ],
      icon: KeyRound,
      actionLabel: isEnglish ? "Open Access Gate" : "Open Toegangspoort",
      target: "accessgate",
      accent: "coral",
    },
  ];

  const metrics: Metric[] = [
    {
      label: "Start",
      value: isEnglish ? "Free" : "Gratis",
      text: isEnglish ? "No wallet required" : "Geen wallet nodig",
      icon: Layers3,
    },
    {
      label: common.sourceTag,
      value: String(MAKE_WAVES_SOURCE_TAG),
      text: isEnglish ? "Make Waves identity" : "Make Waves-identiteit",
      icon: Fingerprint,
    },
    {
      label: common.wallet,
      value: isGuest
        ? isEnglish ? "Optional" : "Optioneel"
        : isEnglish ? "Linked" : "Gekoppeld",
      text: isGuest
        ? isEnglish ? "Activate when ready" : "Activeer wanneer je klaar bent"
        : isEnglish ? "Xaman connected" : "Xaman gekoppeld",
      icon: Wallet,
    },
    {
      label: isEnglish ? "Position" : "Positie",
      value: isEnglish ? "Safe" : "Veilig",
      text: isEnglish ? "No custody / no broker" : "Geen custody / geen broker",
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
          <div className="grid grid-cols-12 gap-6 items-center">
            <div className="col-span-12 xl:col-span-7">
              <div className="mb-8 text-[#080808]">
                <OTTLogo
                  size="lg"
                  subtitle={isEnglish
                    ? "Free Learning + Xaman Proof + Access Pass Unlock"
                    : "Gratis Leren + Xaman-Bewijs + Ontgrendelen Met Toegangspas"}
                />
              </div>

              <div className="inline-flex items-center gap-2 border border-black/10 bg-white/80 shadow-sm px-4 py-2 mb-6">
                <Activity size={15} className="text-[#3898E8]" />
                <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/55">
                  {isEnglish ? "Education-first XRPL Terminal" : "Educatiegerichte XRPL Terminal"}
                </p>
              </div>

              <h1 className="font-orbitron text-[1.85rem] sm:text-4xl md:text-5xl xl:text-7xl font-black uppercase leading-none tracking-tight mb-6">
                {isEnglish ? "Free to Learn." : "Gratis Leren."}
                <br />
                <span className="bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] bg-clip-text text-transparent">
                  {isEnglish ? "Xaman to Prove." : "Xaman Voor Bewijs."}
                </span>
                <br />
                {isEnglish ? "Pass to Unlock." : "Pas Voor Toegang."}
              </h1>

              <p className="font-mono text-sm xl:text-base text-black/60 leading-relaxed max-w-3xl mb-8">
                {isEnglish
                  ? `Built by TruthOnTheTrack with years of XRPL community knowledge and Make Waves proof identity: SourceTag ${MAKE_WAVES_SOURCE_TAG}. Visitors can start without a wallet, learn safely, follow source-first intelligence, activate Xaman when ready, then use proof, XP and access routes without custody or brokerage.`
                  : `Gebouwd door TruthOnTheTrack met jaren XRPL community-kennis en Make Waves proof-identiteit: SourceTag ${MAKE_WAVES_SOURCE_TAG}. Bezoekers kunnen starten zonder wallet, veilig leren, source-first intelligence volgen, Xaman activeren wanneer ze klaar zijn en daarna proof, XP en access routes gebruiken zonder custody of brokerrol.`}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 max-w-5xl">
                <PrimaryAction
                  title={isEnglish ? "Start Free" : "Start Gratis"}
                  text={isEnglish ? "Academy + intel" : "Academie + intelligentie"}
                  icon={BookOpen}
                  accent="blue"
                  onClick={() => navigate("academy")}
                />
                <PrimaryAction
                  title={isEnglish ? "Activate" : "Activeer"}
                  text={isEnglish ? "Xaman guide" : "Xaman gids"}
                  icon={Wallet}
                  accent="magenta"
                  onClick={() => navigate("xamanactivation")}
                />
                <PrimaryAction
                  title={isEnglish ? "Daily Proof" : "Dagelijks Bewijs"}
                  text={isEnglish ? "Xaman + XP" : "Xaman + XP"}
                  icon={Fingerprint}
                  accent="blue"
                  onClick={() => navigate("checkin")}
                />
                <PrimaryAction
                  title={isEnglish ? "Access" : "Toegang"}
                  text={isEnglish ? "License / pass" : "Licentie / pas"}
                  icon={KeyRound}
                  accent="coral"
                  onClick={() => navigate("accessgate")}
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
                    <IdentityRow
                      label={isEnglish ? "Public Mode" : "Open modus"}
                      value={isEnglish ? "Free Learning" : "Gratis leren"}
                    />
                    <IdentityRow
                      label={isEnglish ? "Proof Mode" : "Bewijsmodus"}
                      value={isEnglish ? "Xaman Optional" : "Xaman optioneel"}
                    />
                    <IdentityRow
                      label={isEnglish ? "Premium Mode" : "Premiummodus"}
                      value={isEnglish ? "License / Pass" : "Licentie / Toegangspas"}
                    />
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
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-8">
          {accessSteps.map((step) => (
            <AccessStepCard key={step.title} step={step} onNavigate={navigate} />
          ))}
        </div>

        <div className="grid grid-cols-12 gap-4 mb-8">
          <div className="col-span-12 xl:col-span-7 border border-black/10 bg-[#F7F8FC] p-5 md:p-6">
            <div className="flex items-center gap-2 mb-5">
              <Gauge size={18} className="text-[#3898E8]" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                {isEnglish ? "User Flow" : "Gebruikersroute"}
              </p>
            </div>

            <h2 className="font-orbitron text-2xl xl:text-3xl font-black uppercase mb-5">
              {isEnglish
                ? "Start open. Prove when ready. Unlock with access."
                : "Start vrij. Lever bewijs wanneer je klaar bent. Ontgrendel met toegang."}
            </h2>

            <p className="font-mono text-sm text-black/55 leading-relaxed mb-5">
              {isEnglish
                ? "OTT Terminal is no longer a wallet-first wall. Guests can read sources, use the Academy preview and understand XRPL before connecting Xaman. Xaman is used for proof, XP and ledger activity. Premium access uses a 1.589 XRP service payment, manual founder delivery and an NFT scanner; Web2 access remains a future option."
                : "OTT Terminal begint niet langer met een walletdrempel. Gasten kunnen bronnen lezen, de Academy-preview gebruiken en XRPL begrijpen voordat ze Xaman koppelen. Xaman wordt gebruikt voor bewijs, XP en ledgeractiviteit. Premiumtoegang gebruikt een servicebetaling van 1,589 XRP, handmatige founder-levering en een NFT-scanner; Web2-toegang blijft een toekomstige optie."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-3">
              <FlowStep number="01" title={isEnglish ? "Learn" : "Leer"} text={isEnglish ? "Free" : "Gratis"} />
              <FlowStep number="02" title={isEnglish ? "Intel" : "Inzicht"} text={isEnglish ? "Sources" : "Bronnen"} />
              <FlowStep number="03" title={isEnglish ? "Activate" : "Activeer"} text={isEnglish ? "Xaman guide" : "Xaman-gids"} />
              <FlowStep number="04" title={isEnglish ? "Prove" : "Bewijs"} text="SourceTag" />
              <FlowStep number="05" title={isEnglish ? "Ledger" : "Overzicht"} text="XP / Credits" />
              <FlowStep
                number="06"
                title={isEnglish ? "Unlock" : "Ontgrendel"}
                text={isEnglish ? "License / Pass" : "Licentie / Pas"}
              />
            </div>
          </div>

          <div className="col-span-12 xl:col-span-5 border border-[#C83888]/25 bg-[#C83888]/10 p-5 md:p-6">
            <div className="flex items-center gap-2 mb-5">
              <BadgeCheck size={18} className="text-[#C83888]" />
              <p className="font-orbitron text-xs uppercase tracking-widest">
                {isEnglish ? "Access Boundaries" : "Toegangsgrenzen"}
              </p>
            </div>

            <h3 className="font-orbitron text-xl font-black uppercase mb-4">
              {isEnglish ? "Clear for users, safe for V1." : "Duidelijk voor gebruikers, veilig voor V1."}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <ReuseItem text={isEnglish ? "Free learning stays open." : "Gratis leren blijft open."} />
              <ReuseItem text={isEnglish ? "Xaman is optional until proof." : "Xaman is optioneel totdat bewijs nodig is."} />
              <ReuseItem text={isEnglish ? "Web2 Access License is coming later." : "De Web2-toegangslicentie komt later."} />
              <ReuseItem text={isEnglish ? "XRPL Access Pass unlocks after payment, manual delivery and NFT scan." : "De XRPL Access Pass ontgrendelt na betaling, handmatige levering en NFT-scan."} />
              <ReuseItem text={isEnglish ? "No automatic mint or automatic unlock runs after payment." : "Na betaling vindt geen automatische mint of ontgrendeling plaats."} />
              <ReuseItem text={isEnglish ? "No custody, broker or yield promise." : "Geen custody, broker of rendementsbelofte."} />
            </div>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4 mb-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/35 mb-3">
              {isEnglish ? "Live Product Structure" : "Live Productstructuur"}
            </p>
            <h2 className="font-orbitron text-2xl xl:text-3xl font-black uppercase">
              {isEnglish ? "Intelligence, activation, proof and access." : "Intelligentie, activatie, bewijs en toegang."}
            </h2>
          </div>

          <p className="font-mono text-xs text-black/50 max-w-xl leading-relaxed">
            {isEnglish
              ? "Founder demo and QA tools are hidden behind Labs. The public landing now focuses on normal users, non-Xaman starters and safe XRPL onboarding."
              : "Founder-demo en QA-tools zitten achter Labs. De publieke startpagina richt zich op gewone gebruikers, starters zonder Xaman en veilige XRPL-onboarding."}
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

function AccessStepCard({
  step,
  onNavigate,
}: {
  step: AccessStep;
  onNavigate: (target: string) => void;
}) {
  const Icon = step.icon;
  const accentClasses = getAccentClasses(step.accent);

  return (
    <button
      onClick={() => onNavigate(step.target)}
      className={`group border bg-white p-5 md:p-6 text-left shadow-sm hover:shadow-xl transition-all ${accentClasses.border}`}
    >
      <div className="flex items-start justify-between gap-4 mb-6">
        <Icon size={24} className={accentClasses.icon} />
        <ArrowRight size={17} className="text-black/25 group-hover:text-black" />
      </div>
      <p className="font-mono text-[10px] text-black/35 uppercase tracking-[0.28em] mb-3">
        {step.label}
      </p>
      <h3 className="font-orbitron text-xl font-black uppercase text-black mb-4">
        {step.title}
      </h3>
      <p className="font-mono text-sm text-black/55 leading-relaxed">
        {step.text}
      </p>
    </button>
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
