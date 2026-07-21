import type { ElementType } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Compass,
  FileSearch,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { OTTLogoMark } from "../components/OTTLogo";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

type TerminalHomeTabProps = {
  walletAddress?: string;
  onNavigate?: (target: string) => void;
};

type JourneyCard = {
  icon: ElementType;
  title: string;
  text: string;
  action: string;
  target: string;
};

export function TerminalHomeTab({
  walletAddress = "guest",
  onNavigate,
}: TerminalHomeTabProps) {
  const { language } = useTerminalLanguage();
  const isEnglish = language === "en";
  const isGuest = !walletAddress || walletAddress === "guest";

  const journey: JourneyCard[] = [
    {
      icon: BookOpen,
      title: isEnglish ? "Learn" : "Leren",
      text: isEnglish
        ? "Understand XRPL, wallets and digital assets in clear steps."
        : "Begrijp XRPL, wallets en digitale assets in duidelijke stappen.",
      action: isEnglish ? "Start learning" : "Start met leren",
      target: "academy",
    },
    {
      icon: Compass,
      title: isEnglish ? "Explore" : "Ontdekken",
      text: isEnglish
        ? "Review projects, ecosystem activity and source-led information."
        : "Bekijk projecten, ecosysteemactiviteit en informatie met duidelijke bronnen.",
      action: isEnglish ? "Explore XRPL" : "Ontdek XRPL",
      target: "intel",
    },
    {
      icon: ShieldCheck,
      title: isEnglish ? "Protect" : "Beschermen",
      text: isEnglish
        ? "Learn wallet types, recovery, custody and signing risks before connecting."
        : "Leer walletsoorten, herstel, custody en ondertekeningsrisico’s vóór je koppelt.",
      action: isEnglish ? "Understand wallets" : "Begrijp wallets",
      target: "xamanactivation",
    },
  ];

  function navigate(target: string) {
    onNavigate?.(target);
  }

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <section className="border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24 lg:py-28">
          <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="max-w-3xl">
              <div className="mb-7 flex items-center gap-3">
                <OTTLogoMark size={42} />
                <div>
                  <p className="text-sm font-semibold tracking-tight">OnTheTrack</p>
                  <p className="text-xs text-slate-500">XRPL learning and research</p>
                </div>
              </div>

              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
                {isEnglish ? "Learn before you act" : "Leer voordat je handelt"}
              </p>

              <h1 className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                {isEnglish
                  ? "Understand the XRP Ledger with more clarity and less noise."
                  : "Begrijp de XRP Ledger met meer duidelijkheid en minder ruis."}
              </h1>

              <p className="mt-7 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                {isEnglish
                  ? "Learn the basics, examine evidence and understand wallet risks. Connect a wallet only when an action truly requires it."
                  : "Leer de basis, onderzoek bewijs en begrijp walletrisico’s. Koppel pas een wallet wanneer een actie dat echt vereist."}
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate("academy")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  {isEnglish ? "Start learning" : "Start met leren"}
                  <ArrowRight size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => navigate("intel")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                >
                  {isEnglish ? "Explore the ecosystem" : "Ontdek het ecosysteem"}
                  <Compass size={17} />
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {isEnglish ? "Your starting point" : "Jouw startpunt"}
              </p>
              <div className="mt-6 space-y-5">
                <StartPoint
                  number="01"
                  title={isEnglish ? "Learn without a wallet" : "Leer zonder wallet"}
                  text={isEnglish ? "Courses and research are available first." : "Cursussen en onderzoek zijn eerst beschikbaar."}
                />
                <StartPoint
                  number="02"
                  title={isEnglish ? "Prove what you understand" : "Bewijs wat je begrijpt"}
                  text={isEnglish ? "Complete questions and knowledge checks." : "Voltooi vragen en kennistoetsen."}
                />
                <StartPoint
                  number="03"
                  title={isEnglish ? "Connect only when needed" : "Koppel alleen wanneer nodig"}
                  text={isEnglish ? "Use a supported wallet for signing or on-chain proof." : "Gebruik een ondersteunde wallet voor ondertekening of on-chain bewijs."}
                />
              </div>

              <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-3">
                  <Wallet size={20} className="text-blue-700" />
                  <div>
                    <p className="text-sm font-semibold">
                      {isGuest
                        ? isEnglish ? "No wallet connected" : "Geen wallet gekoppeld"
                        : isEnglish ? "Wallet connected" : "Wallet gekoppeld"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {isGuest
                        ? isEnglish ? "You can continue learning as a guest." : "Je kunt als gast blijven leren."
                        : isEnglish ? "Your wallet is available for verified actions." : "Je wallet is beschikbaar voor geverifieerde acties."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
            {isEnglish ? "Three clear routes" : "Drie duidelijke routes"}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            {isEnglish ? "Choose what you need right now." : "Kies wat je nu nodig hebt."}
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {journey.map((card) => (
            <JourneyCard key={card.title} card={card} onClick={() => navigate(card.target)} />
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:px-8 md:grid-cols-3">
          <TrustPoint
            icon={FileSearch}
            title={isEnglish ? "Evidence before conclusions" : "Bewijs vóór conclusies"}
            text={isEnglish
              ? "Sources, observed data and analysis remain visibly separated."
              : "Bronnen, waargenomen data en analyse blijven zichtbaar gescheiden."}
          />
          <TrustPoint
            icon={ShieldCheck}
            title={isEnglish ? "Neutral risk language" : "Neutrale risicotaal"}
            text={isEnglish
              ? "OTT reports mismatches and uncertainty without declaring projects safe or fraudulent."
              : "OTT rapporteert afwijkingen en onzekerheid zonder projecten veilig of frauduleus te noemen."}
          />
          <TrustPoint
            icon={CheckCircle2}
            title={isEnglish ? "Progress must be earned" : "Voortgang moet worden verdiend"}
            text={isEnglish
              ? "Lessons, assessments and future achievement NFTs require verified completion."
              : "Lessen, beoordelingen en toekomstige achievement-NFT’s vereisen geverifieerde afronding."}
          />
        </div>
      </section>
    </div>
  );
}

function StartPoint({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <div className="flex gap-4">
      <span className="mt-0.5 text-xs font-semibold text-blue-700">{number}</span>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
      </div>
    </div>
  );
}

function JourneyCard({ card, onClick }: { card: JourneyCard; onClick: () => void }) {
  const Icon = card.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-2xl border border-slate-200 p-6 text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
        <Icon size={21} strokeWidth={1.8} />
      </span>
      <h3 className="mt-6 text-lg font-semibold">{card.title}</h3>
      <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-600">{card.text}</p>
      <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
        {card.action}
        <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
      </span>
    </button>
  );
}

function TrustPoint({ icon: Icon, title, text }: { icon: ElementType; title: string; text: string }) {
  return (
    <div className="flex gap-4">
      <Icon className="mt-0.5 shrink-0 text-blue-700" size={21} strokeWidth={1.8} />
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
      </div>
    </div>
  );
}
