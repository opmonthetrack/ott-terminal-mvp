import { useMemo, useState } from "react";
import type { ElementType, ReactNode } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FileText,
  GraduationCap,
  Handshake,
  Layers,
  Loader2,
  LockKeyhole,
  MessageSquareText,
  Network,
  Rocket,
  Send,
  ShieldCheck,
  Sparkles,
  Store,
  Target,
  Video,
  Wallet,
} from "lucide-react";
import { OTTLogo, OTTProofBadge } from "../components/OTTLogo";
import { createSupportPayment } from "../lib/supportPaymentClient";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

type PartnerHubTabProps = {
  walletAddress?: string;
};

type PartnerView = "map" | "ask" | "onboarding" | "brief" | "access";

type PartnerRoute = {
  id: string;
  titleNl: string;
  titleEn: string;
  textNl: string;
  textEn: string;
  tagNl: string;
  tagEn: string;
  access: "free" | "premium";
  icon: ElementType;
};

const partnerRoutes: PartnerRoute[] = [
  {
    id: "education",
    titleNl: "Educatie Partner",
    titleEn: "Education Partner",
    textNl: "Voor trainers, scholen, communities en creators die XRPL lessen willen aanbieden.",
    textEn: "For trainers, schools, communities and creators who want to offer XRPL lessons.",
    tagNl: "Academy",
    tagEn: "Academy",
    access: "free",
    icon: GraduationCap,
  },
  {
    id: "commerce",
    titleNl: "Commerce Partner",
    titleEn: "Commerce Partner",
    textNl: "Voor shops en merken die producten willen koppelen aan NFT badges of toegang.",
    textEn: "For shops and brands that want to connect products to NFT badges or access.",
    tagNl: "Webshop",
    tagEn: "Shop",
    access: "premium",
    icon: Store,
  },
  {
    id: "xrpl",
    titleNl: "XRPL Builder Partner",
    titleEn: "XRPL Builder Partner",
    textNl: "Voor builders die proof, SourceTag, wallet access of tokenisatie willen testen.",
    textEn: "For builders testing proof, SourceTag, wallet access or tokenization.",
    tagNl: "Build",
    tagEn: "Build",
    access: "premium",
    icon: Network,
  },
  {
    id: "business",
    titleNl: "Business Onboarding",
    titleEn: "Business Onboarding",
    textNl: "Voor bedrijven die veilig willen starten met wallet-based access en XRPL educatie.",
    textEn: "For businesses starting safely with wallet-based access and XRPL education.",
    tagNl: "B2B",
    tagEn: "B2B",
    access: "premium",
    icon: Building2,
  },
];

const onboardingSteps = [
  {
    nl: "Doel bepalen",
    en: "Define goal",
    textNl: "Educatie, webshop, access, proof of community onboarding.",
    textEn: "Education, webshop, access, proof or community onboarding.",
    icon: Target,
  },
  {
    nl: "Wallet route kiezen",
    en: "Choose wallet route",
    textNl: "Xaman login, wallet scan, Access Pass of purchase badge.",
    textEn: "Xaman login, wallet scan, Access Pass or purchase badge.",
    icon: Wallet,
  },
  {
    nl: "Proof model maken",
    en: "Build proof model",
    textNl: "SourceTag, XP, certificaat, NFT of order proof.",
    textEn: "SourceTag, XP, certificate, NFT or order proof.",
    icon: BadgeCheck,
  },
  {
    nl: "Pilot lanceren",
    en: "Launch pilot",
    textNl: "Kleine pilot live zetten en meten wat werkt.",
    textEn: "Launch a small pilot and measure what works.",
    icon: Rocket,
  },
];

export function PartnerHubTab({ walletAddress = "guest" }: PartnerHubTabProps) {
  const { language } = useTerminalLanguage();
  const isEnglish = language === "en";

  const [view, setView] = useState<PartnerView>("map");
  const [selectedRouteId, setSelectedRouteId] = useState("education");
  const [briefReady, setBriefReady] = useState(false);

  // Community Ask & Consultation State
  const [questionText, setQuestionText] = useState("");
  const [questionContact, setQuestionContact] = useState("");
  const [sessionTopic, setSessionTopic] = useState("");
  const [sessionTime, setSessionTime] = useState("");
  const [sessionContact, setSessionContact] = useState("");
  const [sessionNotes, setSessionNotes] = useState("");
  const [busyAction, setBusyAction] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  async function handleAskQuestion() {
    if (!questionText.trim()) {
      setActionError(isEnglish ? "Please enter your question or opinion prompt." : "Vul je vraag of meningverzoek in.");
      return;
    }
    if (questionText.length > 200) {
      setActionError(isEnglish ? "Maximum 200 characters allowed." : "Maximaal 200 tekens toegestaan.");
      return;
    }
    setBusyAction("question");
    setActionError("");
    setActionMessage(isEnglish ? "Creating Xaman payload for 1.589 XRP…" : "Xaman-verzoek voor 1.589 XRP wordt gemaakt…");
    try {
      const response = await createSupportPayment({
        amountXrp: "1.589",
        supporterName: questionContact.trim() || "Anonymous",
        publicMessage: `[Question/Opinion] ${questionText.trim()}`,
        publicConsent: true,
      });
      const nextUrl = response.payload?.next?.always || response.payload?.next?.no_push_msg_received;
      if (!nextUrl) throw new Error(isEnglish ? "Xaman payload URL not returned." : "Geen Xaman-betaallink ontvangen.");
      window.location.assign(nextUrl);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
      setBusyAction("");
    }
  }

  async function handleBookSession() {
    if (!sessionTopic.trim()) {
      setActionError(isEnglish ? "Please enter a topic or project title for the 15-minute session." : "Vul een onderwerp of projecttitel in voor de 15-minuten sessie.");
      return;
    }
    setBusyAction("session");
    setActionError("");
    setActionMessage(isEnglish ? "Creating Xaman payload for 23.589 XRP…" : "Xaman-verzoek voor 23.589 XRP wordt gemaakt…");
    try {
      const fullMsg = `[15-Min Session] ${sessionTopic.trim()} | Time: ${sessionTime.trim()} | Contact: ${sessionContact.trim()} | Notes: ${sessionNotes.trim()}`;
      const response = await createSupportPayment({
        amountXrp: "23.589",
        supporterName: sessionContact.trim() || "Anonymous",
        publicMessage: fullMsg.slice(0, 400),
        publicConsent: true,
      });
      const nextUrl = response.payload?.next?.always || response.payload?.next?.no_push_msg_received;
      if (!nextUrl) throw new Error(isEnglish ? "Xaman payload URL not returned." : "Geen Xaman-betaallink ontvangen.");
      window.location.assign(nextUrl);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
      setBusyAction("");
    }
  }

  const selectedRoute =
    partnerRoutes.find((route) => route.id === selectedRouteId) ?? partnerRoutes[0];

  const premiumRoutes = useMemo(
    () => partnerRoutes.filter((route) => route.access === "premium").length,
    [],
  );

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
                  subtitle={isEnglish ? "Partner onboarding and proof routes" : "Partner onboarding en proof routes"}
                />
              </div>

              <div className="inline-flex items-center gap-2 border border-black/10 bg-white/80 shadow-sm px-4 py-2 mb-6">
                <Handshake size={15} className="text-[#3898E8]" />

                <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/55">
                  Partner Hub V1.0
                </p>
              </div>

              <h1 className="font-orbitron text-4xl xl:text-6xl font-black uppercase leading-none tracking-tight mb-6">
                {isEnglish ? "Build With" : "Bouw Met"}
                <br />
                <span className="bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] bg-clip-text text-transparent">
                  OnTheTrack.
                </span>
              </h1>

              <p className="font-mono text-sm xl:text-base text-black/60 leading-relaxed max-w-3xl mb-8">
                {isEnglish
                  ? "A professional partner layer for education, commerce, builder pilots and business onboarding. Every route stays education-first, utility-first and proof-ready."
                  : "Een professionele partnerlaag voor educatie, commerce, builder pilots en business onboarding. Elke route blijft education-first, utility-first en proof-ready."}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl">
                <MetricCard label={isEnglish ? "Routes" : "Routes"} value={String(partnerRoutes.length)} text="V1" icon={Layers} />
                <MetricCard label="Premium" value={String(premiumRoutes)} text={isEnglish ? "Access gated" : "Achter toegang"} icon={LockKeyhole} />
                <MetricCard label="Wallet" value={walletAddress === "guest" ? "Guest" : "Linked"} text="Xaman" icon={Wallet} />
                <MetricCard label="Proof" value="2606170002" text="SourceTag" icon={BadgeCheck} />
              </div>
            </div>

            <div className="col-span-12 xl:col-span-4">
              <div className="border border-black/10 bg-white/90 backdrop-blur p-5 shadow-xl shadow-black/5">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <p className="font-orbitron text-xs uppercase tracking-widest">
                    {isEnglish ? "Partner Status" : "Partnerstatus"}
                  </p>

                  <div className="border border-black/10 bg-[#F7F8FC] px-3 py-2">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-black/55">V1</p>
                  </div>
                </div>

                <div className="mb-4">
                  <OTTProofBadge sourceTag="2606170002" />
                </div>

                <div className="space-y-3">
                  <InfoRow label="Wallet" value={walletAddress === "guest" ? "Guest / Free Preview" : walletAddress} />
                  <InfoRow label={isEnglish ? "Selected" : "Gekozen"} value={isEnglish ? selectedRoute.titleEn : selectedRoute.titleNl} />
                  <InfoRow label="Access" value={selectedRoute.access === "free" ? "Free" : "Premium"} />
                  <InfoRow label={isEnglish ? "Brief" : "Brief"} value={briefReady ? "Ready" : "Not created"} />
                </div>

                <div className="border border-[#C83888]/25 bg-[#C83888]/10 p-4 mt-5">
                  <div className="flex items-start gap-3">
                    <ShieldCheck size={18} className="text-[#C83888] mt-0.5 shrink-0" />

                    <p className="font-mono text-xs text-black/60 leading-relaxed">
                      {isEnglish
                        ? "No investment promise. Partner routes focus on education, access, proof and utility."
                        : "Geen investeringsbelofte. Partner routes focussen op educatie, toegang, proof en utility."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-8">
            <ModeButton active={view === "map"} label={isEnglish ? "Partner Map" : "Partnerkaart"} onClick={() => setView("map")} />
            <ModeButton active={view === "ask"} label={isEnglish ? "Ask & Consultation (1.589 / 23.589 XRP)" : "Vraag & Consult (1.589 / 23.589 XRP)"} onClick={() => setView("ask")} />
            <ModeButton active={view === "onboarding"} label={isEnglish ? "Onboarding" : "Onboarding"} onClick={() => setView("onboarding")} />
            <ModeButton active={view === "brief"} label={isEnglish ? "Partner Brief" : "Partner Brief"} onClick={() => setView("brief")} />
            <ModeButton active={view === "access"} label={isEnglish ? "Access" : "Toegang"} onClick={() => setView("access")} />
          </div>
        </div>
      </section>

      <section className="p-4 md:p-6 xl:p-10 bg-white">
        {actionMessage && (
          <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-blue-900 flex items-center gap-3">
            <Loader2 className="animate-spin" size={18} />
            <span>{actionMessage}</span>
          </div>
        )}

        {actionError && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-900 flex items-center gap-3">
            <AlertTriangle size={18} className="shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {view === "ask" && (
          <div className="grid grid-cols-12 gap-6">
            {/* Form 1: Ask Question / Request Opinion */}
            <div className="col-span-12 lg:col-span-6">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <MessageSquareText className="text-pink-600" size={22} />
                      <h2 className="font-orbitron text-xl font-bold text-slate-950">
                        {isEnglish ? "Ask Question / Request Opinion" : "Stel een Vraag / Vraag om Mening"}
                      </h2>
                    </div>
                    <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-bold text-pink-700">
                      1.589 XRP
                    </span>
                  </div>

                  <p className="text-xs leading-5 text-slate-600 mb-5">
                    {isEnglish
                      ? "Submit a question or request an opinion on XRPL projects, tokens or strategy. Max 200 characters cap."
                      : "Stel een vraag of vraag om een mening over XRPL-projecten, tokens of strategie. Maximaal 200 tekens (200 caps max)."}
                  </p>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                        <label>{isEnglish ? "Your Question / Opinion Prompt" : "Je Vraag / Meningverzoek"}</label>
                        <span className={questionText.length > 200 ? "text-rose-600 font-bold" : "text-slate-500"}>
                          {questionText.length} / 200 caps max
                        </span>
                      </div>
                      <textarea
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value.slice(0, 200))}
                        rows={4}
                        placeholder={isEnglish ? "What is your opinion on XLS-30 liquidity pools or RLUSD integration?" : "Wat is jouw mening over XLS-30 liquidity pools of RLUSD integratie?"}
                        className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {isEnglish ? "Your Contact (X Handle, Telegram or Email)" : "Je Contact (X Handle, Telegram of E-mail)"}
                      </label>
                      <input
                        type="text"
                        value={questionContact}
                        onChange={(e) => setQuestionContact(e.target.value)}
                        placeholder="@yourhandle or name@example.com"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => void handleAskQuestion()}
                    disabled={busyAction === "question" || !questionText.trim()}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#315cff_0%,#8249ed_52%,#ef2f91_100%)] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-pink-200 transition hover:brightness-95 disabled:opacity-50"
                  >
                    {busyAction === "question" ? <Loader2 className="animate-spin" size={17} /> : <Send size={17} />}
                    <span>
                      {isEnglish ? "Ask Question via Xaman (1.589 XRP)" : "Stel Vraag via Xaman (1.589 XRP)"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Form 2: 15-Minute Consultation Session */}
            <div className="col-span-12 lg:col-span-6">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Video className="text-blue-600" size={22} />
                      <h2 className="font-orbitron text-xl font-bold text-slate-950">
                        {isEnglish ? "15-Min Live Consultation Session" : "15-Min Live Consultatiesessie"}
                      </h2>
                    </div>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                      23.589 XRP
                    </span>
                  </div>

                  <p className="text-xs leading-5 text-slate-600 mb-5">
                    {isEnglish
                      ? "Book a 15-minute 1-on-1 video/audio session for deep XRPL strategy, project architecture or token review."
                      : "Boek een 15-minuten 1-op-1 video/audio sessie voor diepe XRPL strategie, projectarchitectuur of token review."}
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {isEnglish ? "Project / Topic Title" : "Project / Onderwerp Titel"}
                      </label>
                      <input
                        type="text"
                        value={sessionTopic}
                        onChange={(e) => setSessionTopic(e.target.value)}
                        placeholder={isEnglish ? "e.g. XRPL Tokenization & Access Pass Strategy" : "bijv. XRPL Tokenisatie & Access Pass Strategie"}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {isEnglish ? "Preferred Date / Time" : "Voorkeursdatum / Tijd"}
                        </label>
                        <input
                          type="text"
                          value={sessionTime}
                          onChange={(e) => setSessionTime(e.target.value)}
                          placeholder="Thu 14:00 CET"
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {isEnglish ? "Your Contact Info" : "Je Contactgegevens"}
                        </label>
                        <input
                          type="text"
                          value={sessionContact}
                          onChange={(e) => setSessionContact(e.target.value)}
                          placeholder="@handle or email"
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {isEnglish ? "Session Goals / Notes" : "Sessiedoelen / Notities"}
                      </label>
                      <textarea
                        value={sessionNotes}
                        onChange={(e) => setSessionNotes(e.target.value)}
                        rows={2}
                        placeholder={isEnglish ? "Briefly explain what you want to cover during the 15 minutes..." : "Kort uitleggen wat je wilt behandelen tijdens de 15 minuten..."}
                        className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => void handleBookSession()}
                    disabled={busyAction === "session" || !sessionTopic.trim()}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#315cff_0%,#8249ed_52%,#ef2f91_100%)] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:brightness-95 disabled:opacity-50"
                  >
                    {busyAction === "session" ? <Loader2 className="animate-spin" size={17} /> : <Clock size={17} />}
                    <span>
                      {isEnglish ? "Book 15 Min Session via Xaman (23.589 XRP)" : "Boek 15 Min Sessie via Xaman (23.589 XRP)"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {view === "map" && (
          <Panel title={isEnglish ? "Partner Route Map" : "Partner Routekaart"} icon={Network}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {partnerRoutes.map((route) => (
                <PartnerRouteCard
                  key={route.id}
                  route={route}
                  language={language}
                  selected={selectedRouteId === route.id}
                  onSelect={() => setSelectedRouteId(route.id)}
                />
              ))}
            </div>
          </Panel>
        )}

        {view === "onboarding" && (
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 xl:col-span-8">
              <Panel title={isEnglish ? "Partner Onboarding Flow" : "Partner Onboarding Flow"} icon={ClipboardCheck}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {onboardingSteps.map((step, index) => (
                    <StepCard
                      key={step.en}
                      number={`0${index + 1}`}
                      step={step}
                      language={language}
                    />
                  ))}
                </div>
              </Panel>
            </div>

            <div className="col-span-12 xl:col-span-4">
              <Panel title={isEnglish ? "Selected Route" : "Gekozen Route"} icon={FileText}>
                <SelectedRoute route={selectedRoute} language={language} />
              </Panel>
            </div>
          </div>
        )}

        {view === "brief" && (
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 xl:col-span-8">
              <Panel title={isEnglish ? "Partner Brief Template" : "Partner Brief Template"} icon={FileText}>
                <div className="space-y-3">
                  <BriefLine title="1. Goal" text={isEnglish ? "What does the partner want to build or teach?" : "Wat wil de partner bouwen of onderwijzen?"} />
                  <BriefLine title="2. Audience" text={isEnglish ? "Who will use it: students, customers, community or business users?" : "Wie gebruikt het: studenten, klanten, community of zakelijke gebruikers?"} />
                  <BriefLine title="3. Access Model" text={isEnglish ? "Free preview, paid access, NFT pass or purchase proof." : "Gratis preview, betaalde toegang, NFT pass of purchase proof."} />
                  <BriefLine title="4. Proof Model" text={isEnglish ? "SourceTag, XP, certificate, badge, order proof or task proof." : "SourceTag, XP, certificaat, badge, order proof of task proof."} />
                  <BriefLine title="5. Launch Plan" text={isEnglish ? "Small pilot, measure, improve and scale." : "Kleine pilot, meten, verbeteren en opschalen."} />
                </div>

                <button
                  onClick={() => setBriefReady(true)}
                  className="mt-5 w-full bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] text-white p-4 font-orbitron text-xs font-black uppercase tracking-widest hover:brightness-95 transition-all"
                >
                  {isEnglish ? "Create Partner Brief" : "Maak Partner Brief"}
                </button>
              </Panel>
            </div>

            <div className="col-span-12 xl:col-span-4 space-y-4">
              <Panel title={isEnglish ? "Brief Status" : "Brief Status"} icon={CheckCircle2}>
                <div className="space-y-3">
                  <StatusLine text={briefReady ? (isEnglish ? "Partner brief ready." : "Partner brief klaar.") : (isEnglish ? "Brief not created yet." : "Brief nog niet gemaakt.")} />
                  <StatusLine text={isEnglish ? "Next: save server-side." : "Volgende: server-side opslaan."} />
                  <StatusLine text={isEnglish ? "Next: route to Truth Desk / email." : "Volgende: routeren naar Truth Desk / e-mail."} />
                </div>
              </Panel>

              <Panel title={isEnglish ? "Make Waves Angle" : "Make Waves Angle"} icon={Sparkles}>
                <p className="font-mono text-xs text-black/60 leading-relaxed">
                  {isEnglish
                    ? "Partner Hub shows that OTT Terminal is not just a dashboard. It is an onboarding engine for education, commerce and proof-based XRPL adoption."
                    : "Partner Hub laat zien dat OTT Terminal niet zomaar een dashboard is. Het is een onboarding engine voor educatie, commerce en proof-based XRPL adoptie."}
                </p>
              </Panel>
            </div>
          </div>
        )}

        {view === "access" && (
          <Panel title={isEnglish ? "Free vs Premium Partner Access" : "Gratis vs Premium Partner Toegang"} icon={LockKeyhole}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AccessBox
                title={isEnglish ? "Free Partner Preview" : "Gratis Partner Preview"}
                lines={[
                  isEnglish ? "Education partner route" : "Educatie partner route",
                  isEnglish ? "Basic brief template" : "Basis brief template",
                  isEnglish ? "Public onboarding explanation" : "Publieke onboarding uitleg",
                ]}
              />
              <AccessBox
                title={isEnglish ? "Premium Partner Hub" : "Premium Partner Hub"}
                premium
                lines={[
                  isEnglish ? "Commerce and business routes" : "Commerce en business routes",
                  isEnglish ? "Proof model planning" : "Proof model planning",
                  isEnglish ? "Truth Desk partner support" : "Truth Desk partner support",
                  isEnglish ? "Access Pass gated" : "Access Pass gated",
                ]}
              />
            </div>
          </Panel>
        )}
      </section>
    </div>
  );
}

function PartnerRouteCard({
  route,
  language,
  selected,
  onSelect,
}: {
  route: PartnerRoute;
  language: "nl" | "en";
  selected: boolean;
  onSelect: () => void;
}) {
  const isEnglish = language === "en";
  const Icon = route.icon;

  return (
    <button
      onClick={onSelect}
      className={`border p-5 text-left transition-all ${
        selected
          ? "border-[#C83888] bg-[#C83888]/10"
          : "border-black/10 bg-[#F7F8FC] hover:bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="w-12 h-12 border border-black/10 bg-white flex items-center justify-center">
          <Icon size={22} className={route.access === "free" ? "text-[#3898E8]" : "text-[#C83888]"} />
        </div>

        <div className="border border-black/10 bg-white px-3 py-2">
          <p className="font-mono text-[9px] uppercase tracking-widest text-black/45">
            {isEnglish ? route.tagEn : route.tagNl}
          </p>
        </div>
      </div>

      <p className="font-orbitron text-sm font-black uppercase text-black mb-3">
        {isEnglish ? route.titleEn : route.titleNl}
      </p>

      <p className="font-mono text-xs text-black/55 leading-relaxed mb-4">
        {isEnglish ? route.textEn : route.textNl}
      </p>

      <div className="flex items-center gap-2">
        {route.access === "premium" ? (
          <LockKeyhole size={14} className="text-[#C83888]" />
        ) : (
          <CheckCircle2 size={14} className="text-[#3898E8]" />
        )}

        <p className="font-mono text-[10px] uppercase tracking-widest text-black/40">
          {route.access === "premium" ? "Premium" : "Free"}
        </p>
      </div>
    </button>
  );
}

function SelectedRoute({
  route,
  language,
}: {
  route: PartnerRoute;
  language: "nl" | "en";
}) {
  const isEnglish = language === "en";
  const Icon = route.icon;

  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-5">
      <div className="flex items-start gap-3 mb-4">
        <Icon size={22} className="text-[#C83888] shrink-0 mt-0.5" />

        <div>
          <p className="font-orbitron text-sm font-black uppercase text-black mb-2">
            {isEnglish ? route.titleEn : route.titleNl}
          </p>

          <p className="font-mono text-xs text-black/55 leading-relaxed">
            {isEnglish ? route.textEn : route.textNl}
          </p>
        </div>
      </div>

      <InfoRow label="Access" value={route.access === "free" ? "Free" : "Premium"} />
    </div>
  );
}

function StepCard({
  number,
  step,
  language,
}: {
  number: string;
  step: (typeof onboardingSteps)[number];
  language: "nl" | "en";
}) {
  const isEnglish = language === "en";
  const Icon = step.icon;

  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <p className="font-orbitron text-xs font-black text-[#C83888]">{number}</p>
        <Icon size={18} className="text-black/35" />
      </div>

      <p className="font-orbitron text-sm font-black uppercase mb-2">
        {isEnglish ? step.en : step.nl}
      </p>

      <p className="font-mono text-xs text-black/55 leading-relaxed">
        {isEnglish ? step.textEn : step.textNl}
      </p>
    </div>
  );
}

function AccessBox({
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

function BriefLine({ title, text }: { title: string; text: string }) {
  return (
    <div className="border border-black/10 bg-white p-4">
      <p className="font-orbitron text-xs font-black uppercase mb-2">{title}</p>
      <p className="font-mono text-xs text-black/55 leading-relaxed">{text}</p>
    </div>
  );
}

function StatusLine({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 border border-black/10 bg-[#F7F8FC] p-3">
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

export default PartnerHubTab;
