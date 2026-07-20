import { useMemo } from "react";
import type { ElementType, ReactNode } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  CheckCircle2,
  ExternalLink,
  Fingerprint,
  HelpCircle,
  KeyRound,
  Lock,
  QrCode,
  ShieldCheck,
  Smartphone,
  Wallet,
} from "lucide-react";
import { OTTLogo, OTTProofBadge } from "../components/OTTLogo";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

const SOURCE_TAG = "2606170002";
const XAMAN_URL = "https://xaman.app";

const activationRoutes = [
  {
    id: "self",
    icon: Wallet,
    titleNl: "Zelf activeren",
    titleEn: "Self activation",
    status: "Safest",
    linesNl: [
      "Installeer Xaman en maak je eigen wallet aan.",
      "Koop of ontvang een kleine hoeveelheid XRP via je eigen route.",
      "Stuur genoeg XRP naar je eigen Xaman-adres om de XRPL reserve te activeren.",
    ],
    linesEn: [
      "Install Xaman and create your own wallet.",
      "Buy or receive a small amount of XRP through your own route.",
      "Send enough XRP to your own Xaman address to activate the XRPL reserve.",
    ],
  },
  {
    id: "friend",
    icon: QrCode,
    titleNl: "Via bestaande XRPL user",
    titleEn: "Through an active XRPL user",
    status: "Social",
    linesNl: [
      "Laat een bestaande Xaman/XRPL user je ontvangstadres scannen.",
      "Die user stuurt een kleine activatiebetaling naar jouw eigen wallet.",
      "Jij deelt nooit je geheime sleutel, recovery words of telefooncontrole.",
    ],
    linesEn: [
      "Ask an active Xaman/XRPL user to scan your receive address.",
      "That user sends a small activation payment to your own wallet.",
      "You never share your secret key, recovery words or phone control.",
    ],
  },
  {
    id: "assisted",
    icon: HelpCircle,
    titleNl: "OTT assisted activation",
    titleEn: "OTT assisted activation",
    status: "Coming soon",
    linesNl: [
      "Voor beginners die hulp nodig hebben met installatie, adrescontrole en eerste activatie.",
      "Betaling is voor onboarding support; niet voor investering of handelsadvies.",
      "OTT beheert nooit je wallet en vraagt nooit om je geheime sleutel.",
    ],
    linesEn: [
      "For beginners who need help with setup, address checks and first activation.",
      "Payment is for onboarding support; not investment or trading advice.",
      "OTT never controls your wallet and never asks for your secret key.",
    ],
  },
];

const safetyRules = [
  {
    icon: Lock,
    titleNl: "Deel nooit je secret",
    titleEn: "Never share your secret",
    textNl: "Geen enkele support-route mag vragen om je seed phrase, secret numbers, private key of herstelwoorden.",
    textEn: "No support route should ask for your seed phrase, secret numbers, private key or recovery words.",
  },
  {
    icon: Fingerprint,
    titleNl: "Controleer het adres",
    titleEn: "Verify the address",
    textNl: "Een activatiebetaling moet naar jouw eigen Xaman ontvangstadres gaan. Check altijd de eerste en laatste tekens.",
    textEn: "An activation payment must go to your own Xaman receive address. Always check the first and last characters.",
  },
  {
    icon: ShieldCheck,
    titleNl: "Geen investering",
    titleEn: "No investment",
    textNl: "Wallet activation is technische onboarding. Het is geen koopadvies, rendement, yield of tokenbelofte.",
    textEn: "Wallet activation is technical onboarding. It is not buy advice, yield, returns or a token promise.",
  },
];

export function XamanActivationTab() {
  const { language } = useTerminalLanguage();
  const isEnglish = language === "en";

  const steps = useMemo(
    () => [
      {
        number: "01",
        title: isEnglish ? "Install Xaman" : "Installeer Xaman",
        text: isEnglish
          ? "Create a self-custody wallet on your own device."
          : "Maak een self-custody wallet op je eigen toestel.",
      },
      {
        number: "02",
        title: isEnglish ? "Copy receive address" : "Kopieer ontvangstadres",
        text: isEnglish
          ? "Use the public r-address only. Never share secrets."
          : "Gebruik alleen je publieke r-adres. Deel nooit secrets.",
      },
      {
        number: "03",
        title: isEnglish ? "Fund reserve" : "Activeer reserve",
        text: isEnglish
          ? "Receive enough XRP to meet the XRPL account reserve."
          : "Ontvang genoeg XRP om de XRPL account reserve te halen.",
      },
      {
        number: "04",
        title: isEnglish ? "Connect to OTT" : "Connect met OTT",
        text: isEnglish
          ? "After activation, use Xaman proof flows inside the terminal."
          : "Na activatie gebruik je Xaman proof-flows in de terminal.",
      },
    ],
    [isEnglish],
  );

  function openXaman() {
    window.open(XAMAN_URL, "_blank", "noopener,noreferrer");
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
                      ? "Wallet onboarding · Xaman activation · safety first"
                      : "Wallet onboarding · Xaman activatie · safety first"
                  }
                />
              </div>

              <div className="inline-flex items-center gap-2 border border-black/10 bg-white/80 shadow-sm px-4 py-2 mb-6">
                <Smartphone size={15} className="text-[#C83888]" />

                <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/55">
                  {isEnglish ? "Xaman Wallet Activation" : "Xaman Wallet Activatie"}
                </p>
              </div>

              <h1 className="font-orbitron text-4xl xl:text-6xl font-black uppercase leading-none tracking-tight mb-6">
                {isEnglish ? "Start without fear." : "Start zonder stress."}
                <br />
                <span className="bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] bg-clip-text text-transparent">
                  {isEnglish ? "Activate safely." : "Activeer veilig."}
                </span>
              </h1>

              <p className="font-mono text-sm xl:text-base text-black/60 leading-relaxed max-w-3xl mb-8">
                {isEnglish
                  ? "New XRPL addresses are not active on-ledger until they receive enough XRP for the account reserve. This page explains the safe routes for Dutch beginners, non-crypto users and future OTT assisted onboarding."
                  : "Nieuwe XRPL-adressen zijn nog niet actief op de ledger totdat ze genoeg XRP ontvangen voor de accountreserve. Deze pagina legt veilige routes uit voor Nederlandse beginners, gebruikers zonder crypto-ervaring en toekomstige begeleide OTT-onboarding."}
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={openXaman}
                  className="inline-flex items-center gap-2 bg-[linear-gradient(135deg,#3898E8_0%,#8F49D8_42%,#C83888_68%,#D84858_100%)] text-white px-5 py-4 hover:brightness-95 transition-all"
                >
                  <ExternalLink size={16} />
                  <span className="font-orbitron text-xs font-black uppercase tracking-widest">
                    {isEnglish ? "Open Xaman" : "Open Xaman"}
                  </span>
                </button>

                <div className="border border-black/10 bg-white/80 px-5 py-4">
                  <OTTProofBadge sourceTag={SOURCE_TAG} />
                </div>
              </div>
            </div>

            <div className="col-span-12 xl:col-span-4">
              <div className="border border-[#C83888]/25 bg-[#C83888]/10 p-5 shadow-xl shadow-black/5">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={19} className="text-[#C83888] shrink-0 mt-0.5" />

                  <div>
                    <p className="font-orbitron text-xs font-black uppercase tracking-widest mb-3">
                      {isEnglish ? "Important boundary" : "Belangrijke grens"}
                    </p>
                    <p className="font-mono text-xs text-black/60 leading-relaxed">
                      {isEnglish
                        ? "OTT explains and supports onboarding. It does not custody funds, does not manage wallets, does not provide investment advice and does not promise token value."
                        : "OTT legt onboarding uit en kan support bieden. OTT bewaart geen funds, beheert geen wallets, geeft geen beleggingsadvies en belooft geen tokenwaarde."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="p-4 md:p-6 xl:p-10 bg-white">
        <div className="grid grid-cols-12 gap-4 mb-4">
          {steps.map((step) => (
            <FlowStep key={step.number} number={step.number} title={step.title} text={step.text} />
          ))}
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-8 space-y-4">
            <Panel title={isEnglish ? "Activation routes" : "Activatie routes"} icon={Wallet}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {activationRoutes.map((route) => (
                  <RouteCard
                    key={route.id}
                    icon={route.icon}
                    title={isEnglish ? route.titleEn : route.titleNl}
                    status={route.status}
                    lines={isEnglish ? route.linesEn : route.linesNl}
                  />
                ))}
              </div>
            </Panel>

            <Panel title={isEnglish ? "Safety checklist" : "Safety checklist"} icon={ShieldCheck}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {safetyRules.map((rule) => (
                  <SafetyCard
                    key={rule.titleEn}
                    icon={rule.icon}
                    title={isEnglish ? rule.titleEn : rule.titleNl}
                    text={isEnglish ? rule.textEn : rule.textNl}
                  />
                ))}
              </div>
            </Panel>
          </div>

          <div className="col-span-12 xl:col-span-4 space-y-4">
            <Panel title={isEnglish ? "What activation means" : "Wat activatie betekent"} icon={KeyRound}>
              <div className="space-y-3">
                <InfoLine
                  label={isEnglish ? "Before activation" : "Voor activatie"}
                  value={
                    isEnglish
                      ? "You can have a Xaman address, but it is not yet active on XRPL."
                      : "Je kunt een Xaman-adres hebben, maar het is nog niet actief op XRPL."
                  }
                />
                <InfoLine
                  label={isEnglish ? "After activation" : "Na activatie"}
                  value={
                    isEnglish
                      ? "The wallet can sign, receive, send and interact with proof flows."
                      : "De wallet kan tekenen, ontvangen, versturen en proof-flows gebruiken."
                  }
                />
                <InfoLine
                  label="OTT"
                  value={
                    isEnglish
                      ? "Assisted activation is planned as manual onboarding support, not an exchange service."
                      : "Assisted activation is gepland als handmatige onboarding support, niet als exchange-dienst."
                  }
                />
              </div>
            </Panel>

            <Panel title={isEnglish ? "Future fiat route" : "Toekomstige fiat-route"} icon={Banknote}>
              <p className="font-mono text-xs text-black/55 leading-relaxed mb-4">
                {isEnglish
                  ? "For non-crypto users, fiat payment should pay for onboarding/support through a business bank or payment provider. Automatic fiat-to-crypto conversion is not part of V1."
                  : "Gebruikers zonder crypto-ervaring kunnen later voor onboarding of ondersteuning betalen via een zakelijke bankrekening of betaalprovider. Automatische conversie van euro's naar crypto hoort niet bij V1."}
              </p>

              <StatusPill text={isEnglish ? "Coming soon · Manual support" : "Coming soon · Handmatige support"} />
            </Panel>
          </div>
        </div>
      </section>
    </div>
  );
}

function FlowStep({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <div className="col-span-12 md:col-span-3 border border-black/10 bg-[#F7F8FC] p-5">
      <p className="font-mono text-[10px] text-black/35 uppercase tracking-[0.35em] mb-3">
        {number}
      </p>
      <p className="font-orbitron text-sm font-black uppercase mb-3">{title}</p>
      <p className="font-mono text-xs text-black/50 leading-relaxed">{text}</p>
    </div>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon: ElementType; children: ReactNode }) {
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

function RouteCard({ icon: Icon, title, status, lines }: { icon: ElementType; title: string; status: string; lines: string[] }) {
  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <Icon size={20} className="text-[#C83888]" />
        <span className="font-mono text-[9px] uppercase tracking-widest text-black/35 border border-black/10 bg-white px-2 py-1">
          {status}
        </span>
      </div>
      <p className="font-orbitron text-sm font-black uppercase mb-4">{title}</p>
      <div className="space-y-3">
        {lines.map((line) => (
          <div key={line} className="flex items-start gap-2">
            <CheckCircle2 size={14} className="text-[#3898E8] shrink-0 mt-0.5" />
            <p className="font-mono text-xs text-black/55 leading-relaxed">{line}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SafetyCard({ icon: Icon, title, text }: { icon: ElementType; title: string; text: string }) {
  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-5">
      <Icon size={20} className="text-[#3898E8] mb-4" />
      <p className="font-orbitron text-sm font-black uppercase mb-3">{title}</p>
      <p className="font-mono text-xs text-black/55 leading-relaxed">{text}</p>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-black/10 bg-[#F7F8FC] p-4">
      <p className="font-mono text-[10px] text-black/35 uppercase tracking-widest mb-2">
        {label}
      </p>
      <p className="font-mono text-xs text-black/55 leading-relaxed">{value}</p>
    </div>
  );
}

function StatusPill({ text }: { text: string }) {
  return (
    <div className="inline-flex items-center gap-2 border border-[#3898E8]/25 bg-[#3898E8]/10 px-4 py-3">
      <ArrowRight size={15} className="text-[#3898E8]" />
      <span className="font-orbitron text-[10px] font-black uppercase tracking-widest text-black">
        {text}
      </span>
    </div>
  );
}

export default XamanActivationTab;
