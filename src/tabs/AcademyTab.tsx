import { useMemo, useState } from "react";
import type { ElementType, ReactNode } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  BookOpenCheck,
  Brain,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  LockKeyhole,
  MessageSquareText,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  Wallet,
} from "lucide-react";
import { OTTLogo, OTTProofBadge } from "../components/OTTLogo";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

type TruthDeskTabProps = {
  walletAddress?: string;
};

type DeskMode = "intake" | "briefing" | "services" | "access";

type TruthDeskService = {
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

const services: TruthDeskService[] = [
  {
    id: "wallet-review",
    titleNl: "Wallet Safety Review",
    titleEn: "Wallet Safety Review",
    textNl: "Leer je walletstatus, risico's, trustlines, NFT's en basis XRPL hygiëne begrijpen.",
    textEn: "Understand your wallet status, risks, trustlines, NFTs and basic XRPL hygiene.",
    tagNl: "Starter",
    tagEn: "Starter",
    access: "free",
    icon: Wallet,
  },
  {
    id: "xrpl-plan",
    titleNl: "XRPL Onboarding Plan",
    titleEn: "XRPL Onboarding Plan",
    textNl: "Persoonlijk stappenplan voor Xaman, XRPL, SourceTag proof en academy voortgang.",
    textEn: "Personal path for Xaman, XRPL, SourceTag proof and academy progress.",
    tagNl: "Plan",
    tagEn: "Plan",
    access: "premium",
    icon: Target,
  },
  {
    id: "business-brief",
    titleNl: "Business / Partner Brief",
    titleEn: "Business / Partner Brief",
    textNl: "Vertaal je idee naar utility, proof, access, webshop en veilige XRPL positionering.",
    textEn: "Turn your idea into utility, proof, access, webshop and safe XRPL positioning.",
    tagNl: "Partner",
    tagEn: "Partner",
    access: "premium",
    icon: FileCheck2,
  },
  {
    id: "education-support",
    titleNl: "Academy Support",
    titleEn: "Academy Support",
    textNl: "Krijg hulp bij lessen, opdrachten, quizvragen en proof-ready afronding.",
    textEn: "Get help with lessons, assignments, quiz questions and proof-ready completion.",
    tagNl: "Leer",
    tagEn: "Learn",
    access: "premium",
    icon: BookOpenCheck,
  },
];

const intakeQuestions = {
  nl: [
    "Waar wil je hulp bij: wallet, XRPL, NFT, academy, webshop of business?",
    "Wat is je huidige ervaring met Xaman/XRPL?",
    "Wil je alleen leren, of ook een proof/actie uitvoeren?",
    "Heb je al een Access Pass of wil je eerst free preview gebruiken?",
  ],
  en: [
    "What do you need help with: wallet, XRPL, NFT, academy, webshop or business?",
    "What is your current Xaman/XRPL experience?",
    "Do you only want to learn, or also perform a proof/action?",
    "Do you already have an Access Pass or do you want to use free preview first?",
  ],
};

export function TruthDeskTab({ walletAddress = "guest" }: TruthDeskTabProps) {
  const { language } = useTerminalLanguage();
  const isEnglish = language === "en";

  const [mode, setMode] = useState<DeskMode>("intake");
  const [selectedServiceId, setSelectedServiceId] = useState("xrpl-plan");
  const [requestText, setRequestText] = useState("");
  const [draftCreated, setDraftCreated] = useState(false);

  const selectedService =
    services.find((service) => service.id === selectedServiceId) ?? services[1];

  const premiumCount = useMemo(
    () => services.filter((service) => service.access === "premium").length,
    [],
  );

  function createDraft() {
    setDraftCreated(true);
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
                  subtitle={isEnglish ? "Guided XRPL support desk" : "Begeleide XRPL support desk"}
                />
              </div>

              <div className="inline-flex items-center gap-2 border border-black/10 bg-white/80 shadow-sm px-4 py-2 mb-6">
                <MessageSquareText size={15} className="text-[#3898E8]" />

                <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/55">
                  {isEnglish ? "Truth Desk V1.0" : "Truth Desk V1.0"}
                </p>
              </div>

              <h1 className="font-orbitron text-4xl xl:text-6xl font-black uppercase leading-none tracking-tight mb-6">
                {isEnglish ? "Ask Better." : "Vraag Beter."}
                <br />
                <span className="bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] bg-clip-text text-transparent">
                  {isEnglish ? "Move Safer." : "Beweeg Veiliger."}
                </span>
              </h1>

              <p className="font-mono text-sm xl:text-base text-black/60 leading-relaxed max-w-3xl mb-8">
                {isEnglish
                  ? "Truth Desk is the premium service layer for guided XRPL onboarding, wallet safety, academy support and partner/business briefings. Education-first, no custody, no trading execution."
                  : "Truth Desk is de premium servicelaag voor begeleide XRPL onboarding, wallet veiligheid, academy support en partner/business briefings. Education-first, geen custody, geen trading-uitvoering."}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl">
                <MetricCard
                  label={isEnglish ? "Services" : "Services"}
                  value={String(services.length)}
                  text={isEnglish ? "Desk routes" : "Desk routes"}
                  icon={ClipboardList}
                />
                <MetricCard
                  label={isEnglish ? "Premium" : "Premium"}
                  value={String(premiumCount)}
                  text={isEnglish ? "Access-gated" : "Achter toegang"}
                  icon={LockKeyhole}
                />
                <MetricCard
                  label="Wallet"
                  value={walletAddress === "guest" ? "Guest" : "Linked"}
                  text="Xaman"
                  icon={Wallet}
                />
                <MetricCard
                  label="Mode"
                  value="No custody"
                  text={isEnglish ? "Education-first" : "Educatie-eerst"}
                  icon={ShieldCheck}
                />
              </div>
            </div>

            <div className="col-span-12 xl:col-span-4">
              <div className="border border-black/10 bg-white/90 backdrop-blur p-5 shadow-xl shadow-black/5">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <p className="font-orbitron text-xs uppercase tracking-widest">
                    {isEnglish ? "Desk Status" : "Desk Status"}
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
                  <InfoRow label={isEnglish ? "Selected" : "Gekozen"} value={isEnglish ? selectedService.titleEn : selectedService.titleNl} />
                  <InfoRow label="Access" value={selectedService.access === "free" ? "Free" : "Premium"} />
                  <InfoRow label={isEnglish ? "Draft" : "Concept"} value={draftCreated ? "Ready" : "Not created"} />
                </div>

                <div className="border border-[#C83888]/25 bg-[#C83888]/10 p-4 mt-5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={18} className="text-[#C83888] mt-0.5 shrink-0" />

                    <p className="font-mono text-xs text-black/60 leading-relaxed">
                      {isEnglish
                        ? "Truth Desk is not financial advice. It helps users understand risk, wallet actions and XRPL education."
                        : "Truth Desk is geen financieel advies. Het helpt gebruikers risico, wallet-acties en XRPL educatie begrijpen."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-8">
            <ModeButton active={mode === "intake"} label={isEnglish ? "Intake" : "Intake"} onClick={() => setMode("intake")} />
            <ModeButton active={mode === "services"} label={isEnglish ? "Services" : "Services"} onClick={() => setMode("services")} />
            <ModeButton active={mode === "briefing"} label={isEnglish ? "Briefing" : "Briefing"} onClick={() => setMode("briefing")} />
            <ModeButton active={mode === "access"} label={isEnglish ? "Access" : "Toegang"} onClick={() => setMode("access")} />
          </div>
        </div>
      </section>

      <section className="p-4 md:p-6 xl:p-10 bg-white">
        {mode === "intake" && (
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 xl:col-span-8">
              <Panel title={isEnglish ? "Guided Intake" : "Begeleide Intake"} icon={ClipboardList}>
                <div className="space-y-3 mb-5">
                  {(isEnglish ? intakeQuestions.en : intakeQuestions.nl).map((question, index) => (
                    <QuestionLine key={question} number={index + 1} text={question} />
                  ))}
                </div>

                <div className="border border-black/10 bg-[#F7F8FC] p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/35 mb-3">
                    {isEnglish ? "Your request" : "Jouw vraag"}
                  </p>

                  <textarea
                    value={requestText}
                    onChange={(event) => setRequestText(event.target.value)}
                    placeholder={
                      isEnglish
                        ? "Example: I want to understand my wallet, NFTs and how to access the premium terminal..."
                        : "Voorbeeld: ik wil mijn wallet, NFT's en toegang tot de premium terminal begrijpen..."
                    }
                    className="min-h-40 w-full border border-black/10 bg-white p-4 font-mono text-sm text-black outline-none placeholder:text-black/30"
                  />

                  <button
                    onClick={createDraft}
                    className="mt-4 w-full bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] text-white p-4 font-orbitron text-xs font-black uppercase tracking-widest hover:brightness-95 transition-all"
                  >
                    {isEnglish ? "Create Desk Brief" : "Maak Desk Brief"}
                  </button>
                </div>
              </Panel>
            </div>

            <div className="col-span-12 xl:col-span-4 space-y-4">
              <Panel title={isEnglish ? "Desk Output" : "Desk Output"} icon={Send}>
                {draftCreated ? (
                  <div className="space-y-3">
                    <StatusLine text={isEnglish ? "Request captured." : "Vraag vastgelegd."} />
                    <StatusLine text={isEnglish ? "Next: connect to backend tickets/email." : "Volgende: koppelen aan backend tickets/e-mail."} />
                    <StatusLine text={isEnglish ? "Premium routing can be gated by Access Pass." : "Premium routing kan via Access Pass gated worden."} />
                  </div>
                ) : (
                  <div className="border border-black/10 bg-[#F7F8FC] p-4">
                    <p className="font-mono text-xs text-black/55 leading-relaxed">
                      {isEnglish
                        ? "Fill in your request and create a desk brief. V1.0 next step: save this server-side or route it to email."
                        : "Vul je vraag in en maak een desk brief. V1.0 volgende stap: server-side opslaan of naar e-mail routeren."}
                    </p>
                  </div>
                )}
              </Panel>

              <Panel title={isEnglish ? "Safe Boundaries" : "Veilige Grenzen"} icon={ShieldCheck}>
                <div className="space-y-3">
                  <StatusLine text={isEnglish ? "No private keys or seed phrases." : "Geen private keys of seed phrases."} />
                  <StatusLine text={isEnglish ? "No trade execution." : "Geen trade-uitvoering."} />
                  <StatusLine text={isEnglish ? "No yield or profit promises." : "Geen yield- of winstbeloftes."} />
                  <StatusLine text={isEnglish ? "Education and risk awareness first." : "Educatie en risicobewustzijn eerst."} />
                </div>
              </Panel>
            </div>
          </div>
        )}

        {mode === "services" && (
          <Panel title={isEnglish ? "Truth Desk Services" : "Truth Desk Services"} icon={MessageSquareText}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  language={language}
                  selected={selectedServiceId === service.id}
                  onSelect={() => setSelectedServiceId(service.id)}
                />
              ))}
            </div>
          </Panel>
        )}

        {mode === "briefing" && (
          <Panel title={isEnglish ? "Professional Briefing Format" : "Professionele Briefing Format"} icon={Brain}>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 xl:col-span-8 border border-black/10 bg-[#F7F8FC] p-5 md:p-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/35 mb-4">
                  {isEnglish ? "Template" : "Template"}
                </p>

                <div className="space-y-3">
                  <BriefLine title="1. Situation" text={isEnglish ? "What does the user want to understand or solve?" : "Wat wil de gebruiker begrijpen of oplossen?"} />
                  <BriefLine title="2. Wallet Context" text={isEnglish ? "Wallet connected, NFT/pass status and visible public XRPL data." : "Wallet gekoppeld, NFT/pass status en zichtbare publieke XRPL data."} />
                  <BriefLine title="3. Education Route" text={isEnglish ? "Which lesson, support article or task should come next?" : "Welke les, support artikel of opdracht hoort hierna?"} />
                  <BriefLine title="4. Action Boundary" text={isEnglish ? "What is safe to do, and what should not be done?" : "Wat is veilig om te doen, en wat juist niet?"} />
                  <BriefLine title="5. Proof / Follow-up" text={isEnglish ? "What proof, XP or ticket should be created?" : "Welke proof, XP of ticket moet aangemaakt worden?"} />
                </div>
              </div>

              <div className="col-span-12 xl:col-span-4">
                <div className="border border-[#3898E8]/25 bg-[#3898E8]/10 p-5">
                  <Sparkles size={22} className="text-[#3898E8] mb-4" />
                  <p className="font-orbitron text-sm font-black uppercase mb-3">
                    {isEnglish ? "V1.0 Purpose" : "V1.0 Doel"}
                  </p>
                  <p className="font-mono text-xs text-black/60 leading-relaxed">
                    {isEnglish
                      ? "Truth Desk should feel like a premium learning/support desk, not a chatbot toy. The user gets a structured route, not random answers."
                      : "Truth Desk moet voelen als een premium leer/support desk, niet als chatbot speelgoed. De gebruiker krijgt een gestructureerde route, geen losse antwoorden."}
                  </p>
                </div>
              </div>
            </div>
          </Panel>
        )}

        {mode === "access" && (
          <Panel title={isEnglish ? "Free vs Premium Access" : "Gratis vs Premium Toegang"} icon={LockKeyhole}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AccessBox
                title={isEnglish ? "Free Preview" : "Gratis Preview"}
                lines={[
                  isEnglish ? "Wallet safety intake" : "Wallet safety intake",
                  isEnglish ? "Basic questions" : "Basisvragen",
                  isEnglish ? "Academy intro guidance" : "Academy intro begeleiding",
                ]}
              />
              <AccessBox
                title={isEnglish ? "Premium Desk" : "Premium Desk"}
                premium
                lines={[
                  isEnglish ? "Personal XRPL plan" : "Persoonlijk XRPL plan",
                  isEnglish ? "Partner/business briefing" : "Partner/business briefing",
                  isEnglish ? "Proof-ready support" : "Proof-ready support",
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

function ServiceCard({
  service,
  language,
  selected,
  onSelect,
}: {
  service: TruthDeskService;
  language: "nl" | "en";
  selected: boolean;
  onSelect: () => void;
}) {
  const isEnglish = language === "en";
  const Icon = service.icon;

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
          <Icon size={22} className={service.access === "free" ? "text-[#3898E8]" : "text-[#C83888]"} />
        </div>

        <div className="border border-black/10 bg-white px-3 py-2">
          <p className="font-mono text-[9px] uppercase tracking-widest text-black/45">
            {isEnglish ? service.tagEn : service.tagNl}
          </p>
        </div>
      </div>

      <p className="font-orbitron text-sm font-black uppercase text-black mb-3">
        {isEnglish ? service.titleEn : service.titleNl}
      </p>

      <p className="font-mono text-xs text-black/55 leading-relaxed mb-4">
        {isEnglish ? service.textEn : service.textNl}
      </p>

      <div className="flex items-center gap-2">
        {service.access === "premium" ? (
          <LockKeyhole size={14} className="text-[#C83888]" />
        ) : (
          <CheckCircle2 size={14} className="text-[#3898E8]" />
        )}

        <p className="font-mono text-[10px] uppercase tracking-widest text-black/40">
          {service.access === "premium" ? "Premium" : "Free"}
        </p>
      </div>
    </button>
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

function QuestionLine({ number, text }: { number: number; text: string }) {
  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-4">
      <div className="flex items-start gap-3">
        <p className="font-orbitron text-xs font-black text-[#C83888] mt-0.5">
          {String(number).padStart(2, "0")}
        </p>
        <p className="font-mono text-sm text-black/60 leading-relaxed">{text}</p>
      </div>
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
