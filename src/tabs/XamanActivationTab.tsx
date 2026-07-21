import type { ElementType } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  ExternalLink,
  Eye,
  Fingerprint,
  Globe2,
  HardDrive,
  KeyRound,
  Laptop,
  LockKeyhole,
  ShieldCheck,
  Smartphone,
  Users,
  Wallet,
} from "lucide-react";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";

type WalletType = {
  id: string;
  icon: ElementType;
  titleEn: string;
  titleNl: string;
  purposeEn: string;
  purposeNl: string;
  prosEn: string[];
  prosNl: string[];
  consEn: string[];
  consNl: string[];
  bestForEn: string;
  bestForNl: string;
};

const walletTypes: WalletType[] = [
  {
    id: "mobile-self-custody",
    icon: Smartphone,
    titleEn: "Mobile self-custody wallet",
    titleNl: "Mobiele self-custody wallet",
    purposeEn: "A wallet app on your phone where you control the account keys.",
    purposeNl: "Een wallet-app op je telefoon waarbij jij de accountsleutels beheert.",
    prosEn: ["Easy daily use", "QR and mobile signing", "Assets remain on the ledger"],
    prosNl: ["Makkelijk dagelijks gebruik", "QR en mobiel ondertekenen", "Assets blijven op de ledger"],
    consEn: ["Phone security matters", "Recovery must be arranged", "Some features depend on provider services"],
    consNl: ["Telefoonbeveiliging is belangrijk", "Herstel moet goed geregeld zijn", "Sommige functies hangen af van diensten van de aanbieder"],
    bestForEn: "Most everyday XRPL users",
    bestForNl: "De meeste dagelijkse XRPL-gebruikers",
  },
  {
    id: "browser-extension",
    icon: Globe2,
    titleEn: "Browser extension wallet",
    titleNl: "Browserextensie-wallet",
    purposeEn: "A wallet that connects directly to websites and dApps from a desktop browser.",
    purposeNl: "Een wallet die vanuit een desktopbrowser direct met websites en dApps verbindt.",
    prosEn: ["Fast dApp connection", "Good desktop workflow", "Clear transaction prompts"],
    prosNl: ["Snelle dApp-koppeling", "Goede desktopworkflow", "Duidelijke transactieverzoeken"],
    consEn: ["Browser and extensions increase attack surface", "Phishing sites can imitate prompts", "Mobile use can be limited"],
    consNl: ["Browser en extensies vergroten het aanvalsoppervlak", "Phishingsites kunnen verzoeken nabootsen", "Mobiel gebruik kan beperkt zijn"],
    bestForEn: "Frequent desktop and dApp users",
    bestForNl: "Veelgebruikers van desktop en dApps",
  },
  {
    id: "hardware",
    icon: HardDrive,
    titleEn: "Hardware wallet",
    titleNl: "Hardwarewallet",
    purposeEn: "A separate physical device that keeps signing keys away from the normal computer or phone environment.",
    purposeNl: "Een apart fysiek apparaat dat ondertekeningssleutels buiten de normale computer- of telefoonomgeving houdt.",
    prosEn: ["Strong key isolation", "Useful for larger holdings", "Physical confirmation"],
    prosNl: ["Sterke isolatie van sleutels", "Geschikt voor grotere tegoeden", "Fysieke bevestiging"],
    consEn: ["Costs money", "Less convenient", "Loss without recovery can be serious"],
    consNl: ["Kost geld", "Minder gemakkelijk", "Verlies zonder herstelmogelijkheid kan ernstig zijn"],
    bestForEn: "Long-term storage and higher-value accounts",
    bestForNl: "Langdurige opslag en accounts met hogere waarde",
  },
  {
    id: "custodial",
    icon: Building2,
    titleEn: "Custodial account",
    titleNl: "Custodial account",
    purposeEn: "A company holds or controls the keys and maintains your balance inside its service.",
    purposeNl: "Een bedrijf bewaart of beheert de sleutels en houdt jouw saldo binnen zijn dienst bij.",
    prosEn: ["Password recovery may be available", "Simple onboarding", "Fiat access can be easier"],
    prosNl: ["Wachtwoordherstel kan mogelijk zijn", "Eenvoudige onboarding", "Fiattoegang kan makkelijker zijn"],
    consEn: ["You depend on the company", "Withdrawals can be restricted", "Insolvency or regulation can affect access"],
    consNl: ["Je bent afhankelijk van het bedrijf", "Opnames kunnen worden beperkt", "Insolventie of regelgeving kan toegang beïnvloeden"],
    bestForEn: "Beginners who understand counterparty risk",
    bestForNl: "Beginners die tegenpartijrisico begrijpen",
  },
  {
    id: "multisign",
    icon: Users,
    titleEn: "Multisign wallet setup",
    titleNl: "Multisign-walletopzet",
    purposeEn: "An account that requires approval from multiple authorised keys before a transaction can execute.",
    purposeNl: "Een account waarvoor meerdere bevoegde sleutels toestemming moeten geven voordat een transactie wordt uitgevoerd.",
    prosEn: ["Reduces single-key risk", "Useful for teams and treasuries", "Supports shared governance"],
    prosNl: ["Vermindert risico van één sleutel", "Geschikt voor teams en treasuries", "Ondersteunt gedeeld bestuur"],
    consEn: ["More setup and coordination", "Signer loss can block activity", "Policies must be documented"],
    consNl: ["Meer installatie en afstemming", "Verlies van signers kan activiteit blokkeren", "Afspraken moeten zijn vastgelegd"],
    bestForEn: "Organisations, families and shared funds",
    bestForNl: "Organisaties, families en gedeelde fondsen",
  },
  {
    id: "watch-only",
    icon: Eye,
    titleEn: "Watch-only wallet",
    titleNl: "Watch-only wallet",
    purposeEn: "A view of an account without storing the private signing key.",
    purposeNl: "Een weergave van een account zonder de private ondertekeningssleutel te bewaren.",
    prosEn: ["Safe monitoring", "Useful for audits", "No signing key on the viewing device"],
    prosNl: ["Veilig monitoren", "Geschikt voor audits", "Geen ondertekeningssleutel op het kijkapparaat"],
    consEn: ["Cannot sign transactions", "Requires another signing method", "Privacy depends on how it is used"],
    consNl: ["Kan geen transacties ondertekenen", "Vereist een andere ondertekeningsmethode", "Privacy hangt af van het gebruik"],
    bestForEn: "Monitoring, accounting and transparency",
    bestForNl: "Monitoring, administratie en transparantie",
  },
];

const safetyQuestions = [
  {
    icon: KeyRound,
    titleEn: "Who controls the keys?",
    titleNl: "Wie beheert de sleutels?",
    textEn: "Determine whether you, a company or several signers control transaction approval.",
    textNl: "Bepaal of jij, een bedrijf of meerdere signers transacties kunnen goedkeuren.",
  },
  {
    icon: LockKeyhole,
    titleEn: "How does recovery work?",
    titleNl: "Hoe werkt herstel?",
    textEn: "Know exactly what is required after loss of a phone, password, card or device.",
    textNl: "Weet precies wat nodig is na verlies van een telefoon, wachtwoord, kaart of apparaat.",
  },
  {
    icon: Building2,
    titleEn: "What if the provider disappears?",
    titleNl: "Wat als de aanbieder verdwijnt?",
    textEn: "With self-custody, the ledger account can often be recovered elsewhere if you still control compatible keys. With custody, access depends on the provider and its legal process.",
    textNl: "Bij self-custody kan het ledgeraccount vaak elders worden hersteld wanneer je nog over compatibele sleutels beschikt. Bij custody hangt toegang af van de aanbieder en het juridische proces.",
  },
  {
    icon: Fingerprint,
    titleEn: "What exactly are you signing?",
    titleNl: "Wat onderteken je precies?",
    textEn: "Read the transaction type, destination, amount, token, memo and permissions before approval.",
    textNl: "Lees vóór goedkeuring het transactietype, adres, bedrag, token, memo en de bevoegdheden.",
  },
];

const comparisonPoints = [
  {
    labelEn: "Keys",
    labelNl: "Sleutels",
    selfEn: "Controlled by the user",
    selfNl: "Door gebruiker beheerd",
    custodyEn: "Controlled by provider",
    custodyNl: "Door aanbieder beheerd",
  },
  {
    labelEn: "Recovery",
    labelNl: "Herstel",
    selfEn: "Depends on your backup",
    selfNl: "Afhankelijk van jouw back-up",
    custodyEn: "Depends on provider policy",
    custodyNl: "Afhankelijk van beleid aanbieder",
  },
  {
    labelEn: "Provider failure",
    labelNl: "Uitval aanbieder",
    selfEn: "Core assets remain on-ledger; app services may stop",
    selfNl: "Kernassets blijven op-ledger; appdiensten kunnen stoppen",
    custodyEn: "Access can be frozen or delayed",
    custodyNl: "Toegang kan worden bevroren of vertraagd",
  },
  {
    labelEn: "Main responsibility",
    labelNl: "Hoofdverantwoordelijkheid",
    selfEn: "Protect keys and backups",
    selfNl: "Sleutels en back-ups beschermen",
    custodyEn: "Choose and monitor the provider",
    custodyNl: "Aanbieder kiezen en controleren",
  },
];

export function XamanActivationTab() {
  const { language } = useTerminalLanguage();
  const isEnglish = language === "en";

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <section className="border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
          <div className="max-w-3xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
              {isEnglish ? "Wallet learning" : "Leren over wallets"}
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              {isEnglish ? "Understand the wallet before you connect it." : "Begrijp de wallet voordat je hem koppelt."}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              {isEnglish
                ? "A wallet is not just an app. It is a way to control keys, approve transactions and recover access. Learn the differences first, then choose the setup that matches your situation."
                : "Een wallet is niet alleen een app. Het is een manier om sleutels te beheren, transacties goed te keuren en toegang te herstellen. Leer eerst de verschillen en kies daarna wat bij jouw situatie past."}
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <SummaryCard
              icon={Wallet}
              title={isEnglish ? "Store access, not coins" : "Bewaar toegang, geen munten"}
              text={isEnglish
                ? "The wallet manages the keys that control assets recorded on a ledger or held by a provider."
                : "De wallet beheert sleutels die controle geven over assets op een ledger of bij een aanbieder."}
            />
            <SummaryCard
              icon={ShieldCheck}
              title={isEnglish ? "Self-custody is responsibility" : "Self-custody is verantwoordelijkheid"}
              text={isEnglish
                ? "You remove a central custodian, but you must protect recovery information yourself."
                : "Je verwijdert een centrale bewaarder, maar moet herstelgegevens zelf beschermen."}
            />
            <SummaryCard
              icon={Building2}
              title={isEnglish ? "Custody is dependency" : "Custody is afhankelijkheid"}
              text={isEnglish
                ? "The provider may offer recovery and convenience, while also controlling access and withdrawals."
                : "De aanbieder kan herstel en gemak bieden, maar beheert ook toegang en opnames."}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <SectionHeading
          eyebrow={isEnglish ? "Wallet types" : "Walletsoorten"}
          title={isEnglish ? "Different tools for different responsibilities" : "Verschillende hulpmiddelen voor verschillende verantwoordelijkheden"}
          text={isEnglish
            ? "No wallet type is automatically best for everyone. Compare its purpose, strengths and limitations."
            : "Geen walletsoort is automatisch het beste voor iedereen. Vergelijk doel, sterke punten en beperkingen."}
        />

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {walletTypes.map((type) => (
            <WalletTypeCard key={type.id} type={type} isEnglish={isEnglish} />
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
          <SectionHeading
            eyebrow={isEnglish ? "Core decision" : "Kernbeslissing"}
            title={isEnglish ? "Self-custody or custodial service?" : "Self-custody of een custodial dienst?"}
            text={isEnglish
              ? "This distinction is more important than the logo on the wallet."
              : "Dit verschil is belangrijker dan het logo op de wallet."}
          />

          <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="grid grid-cols-[1.1fr_1fr_1fr] border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500 sm:px-6">
              <span>{isEnglish ? "Question" : "Onderwerp"}</span>
              <span>{isEnglish ? "Self-custody" : "Self-custody"}</span>
              <span>{isEnglish ? "Custodial" : "Custodial"}</span>
            </div>
            {comparisonPoints.map((point) => (
              <div key={point.labelEn} className="grid grid-cols-[1.1fr_1fr_1fr] gap-3 border-b border-slate-100 px-4 py-4 text-sm last:border-b-0 sm:px-6">
                <span className="font-medium text-slate-900">{isEnglish ? point.labelEn : point.labelNl}</span>
                <span className="text-slate-600">{isEnglish ? point.selfEn : point.selfNl}</span>
                <span className="text-slate-600">{isEnglish ? point.custodyEn : point.custodyNl}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <SectionHeading
          eyebrow={isEnglish ? "Before connecting" : "Voor het koppelen"}
          title={isEnglish ? "Four questions every user should answer" : "Vier vragen die iedere gebruiker moet beantwoorden"}
          text={isEnglish
            ? "A wallet choice becomes safer when the recovery and dependency model is clear."
            : "Een walletkeuze wordt veiliger wanneer herstel en afhankelijkheden duidelijk zijn."}
        />

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {safetyQuestions.map((question) => {
            const Icon = question.icon;
            return (
              <article key={question.titleEn} className="rounded-2xl border border-slate-200 p-6">
                <Icon className="text-blue-700" size={22} strokeWidth={1.8} />
                <h3 className="mt-5 text-lg font-semibold">
                  {isEnglish ? question.titleEn : question.titleNl}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {isEnglish ? question.textEn : question.textNl}
                </p>
              </article>
            );
          })}
        </div>

        <div className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <AlertTriangle className="mt-0.5 shrink-0 text-amber-700" size={22} />
            <div>
              <h3 className="text-lg font-semibold text-amber-950">
                {isEnglish ? "Never enter recovery information into OTT" : "Voer nooit herstelgegevens in bij OTT"}
              </h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-amber-900/75">
                {isEnglish
                  ? "OTT may ask for a public XRPL address to research or connect an account. It must never ask for a seed phrase, family seed, secret numbers, private key, recovery words or remote access to your device."
                  : "OTT kan om een openbaar XRPL-adres vragen om onderzoek te doen of een account te koppelen. OTT mag nooit vragen om een seed phrase, family seed, geheime nummers, private key, herstelwoorden of externe toegang tot je apparaat."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-14 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-300">
              {isEnglish ? "Next lesson" : "Volgende les"}
            </p>
            <h2 className="mt-3 text-2xl font-semibold">
              {isEnglish ? "Compare supported XRPL wallets" : "Vergelijk ondersteunde XRPL-wallets"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {isEnglish
                ? "OTT will compare compatibility, custody model, recovery options and provider dependency separately. Xaman can be recommended for full OTT compatibility without presenting it as the only wallet."
                : "OTT vergelijkt compatibiliteit, custodymodel, herstelopties en afhankelijkheid van de aanbieder afzonderlijk. Xaman kan worden aanbevolen voor volledige OTT-compatibiliteit zonder het als enige wallet te presenteren."}
            </p>
          </div>
          <a
            href="https://xaman.app"
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            {isEnglish ? "View a wallet example" : "Bekijk een walletvoorbeeld"}
            <ExternalLink size={16} />
          </a>
        </div>
      </section>
    </div>
  );
}

function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-slate-600">{text}</p>
    </div>
  );
}

function SummaryCard({ icon: Icon, title, text }: { icon: ElementType; title: string; text: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 p-6">
      <Icon className="text-blue-700" size={22} strokeWidth={1.8} />
      <h2 className="mt-5 text-base font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </article>
  );
}

function WalletTypeCard({ type, isEnglish }: { type: WalletType; isEnglish: boolean }) {
  const Icon = type.icon;
  const pros = isEnglish ? type.prosEn : type.prosNl;
  const cons = isEnglish ? type.consEn : type.consNl;

  return (
    <article className="rounded-2xl border border-slate-200 p-6 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <Icon size={21} strokeWidth={1.8} />
          </span>
          <h3 className="text-lg font-semibold">{isEnglish ? type.titleEn : type.titleNl}</h3>
        </div>
      </div>

      <p className="mt-5 text-sm leading-6 text-slate-600">
        {isEnglish ? type.purposeEn : type.purposeNl}
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
            {isEnglish ? "Advantages" : "Voordelen"}
          </p>
          <ul className="mt-3 space-y-2">
            {pros.map((item) => (
              <li key={item} className="flex gap-2 text-sm leading-5 text-slate-600">
                <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={15} />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
            {isEnglish ? "Limitations" : "Nadelen"}
          </p>
          <ul className="mt-3 space-y-2">
            {cons.map((item) => (
              <li key={item} className="flex gap-2 text-sm leading-5 text-slate-600">
                <ArrowRight className="mt-0.5 shrink-0 text-amber-600" size={15} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 border-t border-slate-100 pt-4 text-sm">
        <span className="font-medium text-slate-900">{isEnglish ? "Useful for: " : "Geschikt voor: "}</span>
        <span className="text-slate-600">{isEnglish ? type.bestForEn : type.bestForNl}</span>
      </div>
    </article>
  );
}
