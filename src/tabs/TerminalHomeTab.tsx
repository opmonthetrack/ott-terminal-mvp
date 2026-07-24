import { useEffect, useState, type ElementType } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Compass,
  FileSearch,
  ShieldCheck,
  UserCircle,
  Wallet,
  X,
} from "lucide-react";
import { OTTLogoMark } from "../components/OTTLogo";
import { getOttAccountName } from "../lib/ottAuth";
import { useOttAuthSession } from "../lib/useOttAuthSession";
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

const WELCOME_CHOICE_KEY = "ott-account-welcome-choice-v1";

export function TerminalHomeTab({
  walletAddress = "guest",
  onNavigate,
}: TerminalHomeTabProps) {
  const { language } = useTerminalLanguage();
  const { user, signedIn, loading: authLoading } = useOttAuthSession();
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const isEnglish = language === "en";
  const isGuestWallet = !walletAddress || walletAddress === "guest";
  const accountName = getOttAccountName(user);

  useEffect(() => {
    if (authLoading || signedIn || typeof window === "undefined") {
      setWelcomeOpen(false);
      return;
    }

    setWelcomeOpen(window.localStorage.getItem(WELCOME_CHOICE_KEY) !== "done");
  }, [authLoading, signedIn]);

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

  function rememberWelcomeChoice() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(WELCOME_CHOICE_KEY, "done");
    }
    setWelcomeOpen(false);
  }

  function openAccount() {
    rememberWelcomeChoice();
    navigate("wallet");
  }

  function continueAsGuest() {
    rememberWelcomeChoice();
  }

  return (
    <div className="min-h-screen bg-white text-slate-950">
      {welcomeOpen && (
        <WelcomeChoice
          isEnglish={isEnglish}
          onCreateAccount={openAccount}
          onContinueGuest={continueAsGuest}
          onClose={continueAsGuest}
        />
      )}

      <section className="border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.12fr_0.88fr]">
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
                  ? "Learn XRPL. Verify your progress. Connect a wallet when you are ready."
                  : "Leer XRPL. Verifieer je voortgang. Koppel een wallet wanneer je er klaar voor bent."}
              </h1>

              <p className="mt-7 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                {isEnglish
                  ? "Start with a normal OTT account or explore as a guest. A wallet is never required just to learn."
                  : "Start met een normaal OTT-account of ontdek als gast. Een wallet is nooit nodig om alleen te leren."}
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => signedIn ? navigate("academy") : openAccount()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  {signedIn
                    ? isEnglish ? "Continue learning" : "Ga verder met leren"
                    : isEnglish ? "Create free account" : "Maak gratis account"}
                  <ArrowRight size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => navigate("intel")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                >
                  {isEnglish ? "Explore as guest" : "Ontdek als gast"}
                  <Compass size={17} />
                </button>
              </div>

              <p className="mt-4 text-xs text-slate-500">
                {isEnglish
                  ? "No wallet, seed phrase or payment required to create an account."
                  : "Geen wallet, seed phrase of betaling nodig om een account te maken."}
              </p>
            </div>

            <AccountStartingPoint
              isEnglish={isEnglish}
              authLoading={authLoading}
              signedIn={signedIn}
              accountName={accountName}
              userEmail={user?.email ?? ""}
              walletConnected={!isGuestWallet}
              onAccount={openAccount}
              onAcademy={() => navigate("academy")}
            />
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

function WelcomeChoice({
  isEnglish,
  onCreateAccount,
  onContinueGuest,
  onClose,
}: {
  isEnglish: boolean;
  onCreateAccount: () => void;
  onContinueGuest: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = document.getElementById("welcome-choice-dialog");
    const focusable = dialog?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    focusable?.[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    dialog?.addEventListener("keydown", onKeyDown);
    return () => {
      dialog?.removeEventListener("keydown", onKeyDown);
      previous?.focus();
    };
  }, [onClose]);

  return (
    <div id="welcome-choice-dialog" className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="welcome-choice-title">
      <button type="button" className="absolute inset-0" onClick={onClose} aria-label={isEnglish ? "Close welcome" : "Welkom sluiten"} />
      <section className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label={isEnglish ? "Close welcome" : "Sluit welkom"}
        >
          <X size={18} />
        </button>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
          <UserCircle size={24} />
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
          {isEnglish ? "Welcome to OTT" : "Welkom bij OTT"}
        </p>
        <h2 id="welcome-choice-title" className="mt-3 text-3xl font-semibold tracking-tight">
          {isEnglish ? "How would you like to begin?" : "Hoe wil je beginnen?"}
        </h2>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          {isEnglish
            ? "Create a free account to save learning progress across devices, or look around first as a guest."
            : "Maak een gratis account om leervoortgang op meerdere apparaten te bewaren, of kijk eerst rond als gast."}
        </p>

        <button
          type="button"
          onClick={onCreateAccount}
          className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          {isEnglish ? "Create free account" : "Maak gratis account"}
          <ArrowRight size={17} />
        </button>
        <button
          type="button"
          onClick={onContinueGuest}
          className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-slate-200 px-5 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          {isEnglish ? "Continue as guest" : "Ga verder als gast"}
        </button>
        <p className="mt-5 text-center text-xs text-slate-500">
          {isEnglish
            ? "A wallet is optional and remains separate from your OTT account."
            : "Een wallet is optioneel en blijft apart van je OTT-account."}
        </p>
      </section>
    </div>
  );
}

function AccountStartingPoint({
  isEnglish,
  authLoading,
  signedIn,
  accountName,
  userEmail,
  walletConnected,
  onAccount,
  onAcademy,
}: {
  isEnglish: boolean;
  authLoading: boolean;
  signedIn: boolean;
  accountName: string;
  userEmail: string;
  walletConnected: boolean;
  onAccount: () => void;
  onAcademy: () => void;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {isEnglish ? "Your starting point" : "Jouw startpunt"}
      </p>

      {authLoading ? (
        <div className="mt-8 h-48 animate-pulse rounded-2xl bg-white" />
      ) : signedIn ? (
        <>
          <div className="mt-6 flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 size={21} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold">
                {isEnglish ? "Welcome back" : "Welkom terug"}{accountName ? `, ${accountName}` : ""}
              </p>
              {userEmail && <p className="mt-1 truncate text-xs text-slate-500">{userEmail}</p>}
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {isEnglish
                  ? "Your learning progress follows your OTT account."
                  : "Je leervoortgang volgt je OTT-account."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onAcademy}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            {isEnglish ? "Continue Academy" : "Ga verder in Academy"}
            <ArrowRight size={17} />
          </button>
          <button
            type="button"
            onClick={onAccount}
            className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {isEnglish ? "Open my profile" : "Open mijn profiel"}
          </button>
        </>
      ) : (
        <>
          <h2 className="mt-5 text-2xl font-semibold tracking-tight">
            {isEnglish ? "Create your free OTT account" : "Maak je gratis OTT-account"}
          </h2>
          <div className="mt-6 space-y-4">
            <StartPoint
              number="01"
              title={isEnglish ? "Save your progress" : "Bewaar je voortgang"}
              text={isEnglish ? "Continue on another device." : "Ga verder op een ander apparaat."}
            />
            <StartPoint
              number="02"
              title={isEnglish ? "Earn verified completion" : "Verdien geverifieerde afronding"}
              text={isEnglish ? "AI-checked course results belong to your account." : "AI-gecontroleerde cursusresultaten horen bij je account."}
            />
            <StartPoint
              number="03"
              title={isEnglish ? "Prepare for certificates" : "Bereid je voor op certificaten"}
              text={isEnglish ? "Connect a wallet only when on-chain proof is needed." : "Koppel pas een wallet wanneer on-chain bewijs nodig is."}
            />
          </div>
          <button
            type="button"
            onClick={onAccount}
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            {isEnglish ? "Create account or sign in" : "Account maken of inloggen"}
            <ArrowRight size={17} />
          </button>
        </>
      )}

      <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <Wallet size={19} className={walletConnected ? "text-emerald-700" : "text-slate-400"} />
        <div>
          <p className="text-sm font-semibold">
            {walletConnected
              ? isEnglish ? "Optional wallet connected" : "Optionele wallet gekoppeld"
              : isEnglish ? "Wallet not required" : "Wallet niet verplicht"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {isEnglish ? "Use it later for signing and NFTs." : "Gebruik deze later voor ondertekening en NFT’s."}
          </p>
        </div>
      </div>
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
