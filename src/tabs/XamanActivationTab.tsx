import { useState, type ElementType } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  Building2,
  Check,
  ChevronRight,
  Eye,
  Fingerprint,
  Globe2,
  HardDrive,
  KeyRound,
  Laptop,
  Link2,
  LockKeyhole,
  ShieldCheck,
  Smartphone,
  Users,
  Wallet,
  X,
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

type CompatibilityLevel = "recommended" | "full" | "advanced" | "standard" | "variable";

type WalletCompatibility = {
  id: string;
  name: string;
  score: number;
  maxScore?: number;
  level: CompatibilityLevel;
  setupEn: string;
  setupNl: string;
  noteEn: string;
  noteNl: string;
  capabilities: string[];
};

const walletTypes: WalletType[] = [
  {
    id: "mobile-self-custody",
    icon: Smartphone,
    titleEn: "Mobile self-custody wallet",
    titleNl: "Mobiele self-custody wallet",
    purposeEn: "A phone app where you control the account keys and approve transactions.",
    purposeNl: "Een telefoonapp waarbij jij de accountsleutels beheert en transacties goedkeurt.",
    prosEn: ["Easy daily use", "QR and mobile signing", "Assets remain on-ledger"],
    prosNl: ["Makkelijk dagelijks gebruik", "QR en mobiel ondertekenen", "Assets blijven op de ledger"],
    consEn: ["Phone security matters", "Recovery must be arranged", "Provider services can still affect convenience"],
    consNl: ["Telefoonbeveiliging is belangrijk", "Herstel moet goed geregeld zijn", "Diensten van de aanbieder kunnen gemak beïnvloeden"],
    bestForEn: "Everyday XRPL use",
    bestForNl: "Dagelijks XRPL-gebruik",
  },
  {
    id: "browser-extension",
    icon: Globe2,
    titleEn: "Browser extension wallet",
    titleNl: "Browserextensie-wallet",
    purposeEn: "A wallet that connects directly to websites and dApps from a desktop browser.",
    purposeNl: "Een wallet die vanuit een desktopbrowser direct met websites en dApps verbindt.",
    prosEn: ["Fast dApp connection", "Strong desktop workflow", "Clear transaction prompts"],
    prosNl: ["Snelle dApp-koppeling", "Goede desktopworkflow", "Duidelijke transactieverzoeken"],
    consEn: ["Browser extensions increase attack surface", "Phishing sites can imitate prompts", "Mobile use may be limited"],
    consNl: ["Browserextensies vergroten het aanvalsoppervlak", "Phishingsites kunnen verzoeken nabootsen", "Mobiel gebruik kan beperkt zijn"],
    bestForEn: "Desktop and dApp users",
    bestForNl: "Desktop- en dApp-gebruikers",
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
    bestForEn: "Users who understand counterparty risk",
    bestForNl: "Gebruikers die tegenpartijrisico begrijpen",
  },
  {
    id: "multisign",
    icon: Users,
    titleEn: "Multisign setup",
    titleNl: "Multisign-opzet",
    purposeEn: "An account that requires approval from multiple authorised keys before a transaction can execute.",
    purposeNl: "Een account waarvoor meerdere bevoegde sleutels toestemming moeten geven voordat een transactie wordt uitgevoerd.",
    prosEn: ["Reduces single-key risk", "Useful for teams and treasuries", "Supports shared control"],
    prosNl: ["Vermindert risico van één sleutel", "Geschikt voor teams en treasuries", "Ondersteunt gedeelde controle"],
    consEn: ["More setup and coordination", "Signer loss can block activity", "Policies must be documented"],
    consNl: ["Meer installatie en afstemming", "Verlies van signers kan activiteit blokkeren", "Afspraken moeten zijn vastgelegd"],
    bestForEn: "Organisations, families and shared funds",
    bestForNl: "Organisaties, families en gedeelde fondsen",
  },
  {
    id: "watch-only",
    icon: Eye,
    titleEn: "Watch-only account",
    titleNl: "Watch-only account",
    purposeEn: "A view of an account without storing the private signing key.",
    purposeNl: "Een weergave van een account zonder de private ondertekeningssleutel te bewaren.",
    prosEn: ["Safe monitoring", "Useful for audits", "No signing key on the viewing device"],
    prosNl: ["Veilig monitoren", "Geschikt voor audits", "Geen ondertekeningssleutel op het kijkapparaat"],
    consEn: ["Cannot sign transactions", "Requires another signing method", "Privacy depends on usage"],
    consNl: ["Kan geen transacties ondertekenen", "Vereist een andere ondertekeningsmethode", "Privacy hangt af van het gebruik"],
    bestForEn: "Monitoring, accounting and transparency",
    bestForNl: "Monitoring, administratie en transparantie",
  },
];

const compatibility: WalletCompatibility[] = [
  {
    id: "xaman",
    name: "Xaman",
    score: 100,
    level: "recommended",
    setupEn: "Mobile app and OTT signing return flow",
    setupNl: "Mobiele app en OTT-terugkeer na ondertekening",
    noteEn: "The reference implementation for the complete planned OTT flow.",
    noteNl: "De referentie-integratie voor de volledige geplande OTT-flow.",
    capabilities: ["connect", "payment", "memo", "nft", "trustline", "dex", "advanced", "return"],
  },
  {
    id: "gemwallet",
    name: "GemWallet",
    score: 94,
    level: "full",
    setupEn: "Browser extension",
    setupNl: "Browserextensie",
    noteEn: "Strong raw transaction, NFT and browser dApp coverage.",
    noteNl: "Sterke ondersteuning voor raw transactions, NFT’s en browser-dApps.",
    capabilities: ["connect", "payment", "memo", "nft", "trustline", "dex", "advanced"],
  },
  {
    id: "joey",
    name: "Joey",
    score: 92,
    level: "advanced",
    setupEn: "Mobile wallet with advanced signing methods",
    setupNl: "Mobiele wallet met geavanceerde ondertekenmethoden",
    noteEn: "Broad XRPL transaction and bulk-signing potential.",
    noteNl: "Brede XRPL-transactieondersteuning en potentieel voor bulkondertekening.",
    capabilities: ["connect", "payment", "memo", "nft", "trustline", "dex", "advanced"],
  },
  {
    id: "crossmark",
    name: "CROSSMARK",
    score: 91,
    level: "advanced",
    setupEn: "Browser extension",
    setupNl: "Browserextensie",
    noteEn: "Strong web signing and transaction submission workflow.",
    noteNl: "Sterke webondertekening en transactie-indiening.",
    capabilities: ["connect", "payment", "memo", "nft", "trustline", "dex", "advanced"],
  },
  {
    id: "metamask-snap",
    name: "MetaMask + XRPL Snap",
    score: 88,
    level: "advanced",
    setupEn: "MetaMask plus an additional XRPL Snap installation",
    setupNl: "MetaMask plus een extra XRPL Snap-installatie",
    noteEn: "XRPL support is supplied by the Snap, not by standard MetaMask alone.",
    noteNl: "XRPL-ondersteuning komt van de Snap, niet van standaard MetaMask alleen.",
    capabilities: ["connect", "payment", "memo", "nft", "trustline", "dex"],
  },
  {
    id: "katz",
    name: "Katz",
    score: 85,
    level: "standard",
    setupEn: "XRPL-focused mobile wallet",
    setupNl: "XRPL-gerichte mobiele wallet",
    noteEn: "Suitable for standard mobile token, DEX, AMM and dApp use.",
    noteNl: "Geschikt voor standaard mobiel token-, DEX-, AMM- en dApp-gebruik.",
    capabilities: ["connect", "payment", "memo", "nft", "trustline", "dex"],
  },
  {
    id: "walletconnect",
    name: "More wallets via WalletConnect",
    score: 60,
    maxScore: 95,
    level: "variable",
    setupEn: "Connection protocol; actual support depends on the selected wallet",
    setupNl: "Koppelprotocol; werkelijke ondersteuning hangt af van de gekozen wallet",
    noteEn: "OTT must inspect the approved namespace, methods and transaction types after connection.",
    noteNl: "OTT moet na koppeling de goedgekeurde namespace, methoden en transactietypen controleren.",
    capabilities: ["connect"],
  },
];

const capabilityColumns = [
  { id: "connect", en: "Connect", nl: "Koppelen" },
  { id: "payment", en: "Payment", nl: "Betaling" },
  { id: "memo", en: "Memo/Tag", nl: "Memo/Tag" },
  { id: "nft", en: "NFT", nl: "NFT" },
  { id: "trustline", en: "Trustline", nl: "Trustline" },
  { id: "dex", en: "DEX/AMM", nl: "DEX/AMM" },
  { id: "advanced", en: "Advanced", nl: "Geavanceerd" },
  { id: "return", en: "OTT return", nl: "OTT-terugkeer" },
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
    textEn: "Self-custody assets remain on-ledger when you retain compatible keys. Custodial access depends on the provider and legal process.",
    textNl: "Self-custody-assets blijven op-ledger wanneer je compatibele sleutels behoudt. Custodial toegang hangt af van de aanbieder en het juridische proces.",
  },
  {
    icon: Fingerprint,
    titleEn: "What exactly are you signing?",
    titleNl: "Wat onderteken je precies?",
    textEn: "Read transaction type, destination, amount, token, memo, tags and permissions before approval.",
    textNl: "Lees vóór goedkeuring transactietype, adres, bedrag, token, memo, tags en bevoegdheden.",
  },
];

export function XamanActivationTab() {
  const { language } = useTerminalLanguage();
  const isEnglish = language === "en";
  const [selectedWallet, setSelectedWallet] = useState(compatibility[0]);

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <section className="border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
              {isEnglish ? "Wallet learning center" : "Wallet-leercentrum"}
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              {isEnglish ? "Understand the wallet before you connect it." : "Begrijp de wallet voordat je hem koppelt."}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              {isEnglish
                ? "A wallet manages access and signatures. Assets are recorded on the ledger or held by a custodian. Compare responsibility, recovery and OTT feature coverage before choosing."
                : "Een wallet beheert toegang en handtekeningen. Assets staan op de ledger of worden door een custodian gehouden. Vergelijk verantwoordelijkheid, herstel en OTT-functiedekking voordat je kiest."}
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <SummaryCard
              icon={Wallet}
              title={isEnglish ? "Access, not coins" : "Toegang, geen munten"}
              text={isEnglish ? "A self-custody wallet stores or accesses keys; it does not contain the ledger itself." : "Een self-custody wallet bewaart of gebruikt sleutels; hij bevat niet de ledger zelf."}
            />
            <SummaryCard
              icon={ShieldCheck}
              title={isEnglish ? "Responsibility changes" : "Verantwoordelijkheid verandert"}
              text={isEnglish ? "Self-custody removes a central custodian but transfers recovery responsibility to you." : "Self-custody verwijdert een centrale bewaarder maar legt herstelverantwoordelijkheid bij jou."}
            />
            <SummaryCard
              icon={BadgeCheck}
              title="OTT XRPL compatibility"
              text={isEnglish ? "The percentage measures planned OTT function coverage, not wallet safety or overall quality." : "Het percentage meet geplande OTT-functiedekking, niet walletveiligheid of algemene kwaliteit."}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <SectionHeading
          eyebrow={isEnglish ? "OTT compatibility" : "OTT-compatibiliteit"}
          title={isEnglish ? "One recommended route, several supported routes" : "Eén aanbevolen route, meerdere ondersteunde routes"}
          text={isEnglish
            ? "Scores are OTT product estimates. The connected wallet must still prove its actual capabilities before a feature is enabled."
            : "Scores zijn OTT-productinschattingen. De gekoppelde wallet moet nog steeds zijn werkelijke mogelijkheden bewijzen voordat een functie wordt geactiveerd."}
        />

        <div className="mt-9 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-3">
            {compatibility.map((wallet) => (
              <button
                key={wallet.id}
                type="button"
                onClick={() => setSelectedWallet(wallet)}
                className={`w-full rounded-2xl border p-5 text-left transition ${selectedWallet.id === wallet.id ? "border-blue-600 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{wallet.name}</h3>
                      {wallet.level === "recommended" && (
                        <span className="rounded-full bg-slate-950 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                          {isEnglish ? "Recommended" : "Aanbevolen"}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-500">{isEnglish ? wallet.setupEn : wallet.setupNl}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xl font-semibold text-blue-700">
                      {wallet.maxScore ? `${wallet.score}–${wallet.maxScore}%` : `${wallet.score}%`}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">OTT XRPL</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <article className="rounded-3xl border border-slate-200 p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                  {isEnglish ? "Selected integration" : "Geselecteerde integratie"}
                </p>
                <h3 className="mt-3 text-2xl font-semibold">{selectedWallet.name}</h3>
              </div>
              <div className="rounded-2xl bg-slate-950 px-4 py-3 text-center text-white">
                <p className="text-lg font-semibold">{selectedWallet.maxScore ? `${selectedWallet.score}–${selectedWallet.maxScore}%` : `${selectedWallet.score}%`}</p>
                <p className="text-[9px] uppercase tracking-wide text-slate-300">compatibility</p>
              </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-slate-600">
              {isEnglish ? selectedWallet.noteEn : selectedWallet.noteNl}
            </p>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-3 pr-3 font-medium">{isEnglish ? "Capability" : "Mogelijkheid"}</th>
                    <th className="py-3 font-medium">{isEnglish ? "Current OTT plan" : "Huidig OTT-plan"}</th>
                  </tr>
                </thead>
                <tbody>
                  {capabilityColumns.map((capability) => {
                    const supported = selectedWallet.capabilities.includes(capability.id);
                    return (
                      <tr key={capability.id} className="border-b border-slate-100 last:border-0">
                        <td className="py-3 pr-3 font-medium text-slate-700">{isEnglish ? capability.en : capability.nl}</td>
                        <td className="py-3">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold ${supported ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>
                            {supported ? <Check size={13} /> : <X size={13} />}
                            {supported ? (isEnglish ? "Covered" : "Gedekt") : (isEnglish ? "Verify first" : "Eerst verifiëren")}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-5">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 shrink-0 text-amber-600" size={19} />
                <p className="text-xs leading-5 text-slate-600">
                  {selectedWallet.id === "walletconnect"
                    ? (isEnglish
                        ? "WalletConnect is a connection protocol, not a wallet. The final score must be calculated from the wallet, namespaces, approved methods and transaction types returned during connection."
                        : "WalletConnect is een koppelprotocol, geen wallet. De uiteindelijke score moet worden berekend uit de wallet, namespaces, goedgekeurde methoden en transactietypen die tijdens koppeling worden teruggegeven.")
                    : (isEnglish
                        ? "OTT will enable only capabilities confirmed by the active integration. A product score never replaces transaction review."
                        : "OTT activeert alleen mogelijkheden die door de actieve integratie zijn bevestigd. Een productscore vervangt nooit transactiecontrole.")}
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
          <SectionHeading
            eyebrow={isEnglish ? "Wallet types" : "Walletsoorten"}
            title={isEnglish ? "Different tools create different responsibilities" : "Verschillende hulpmiddelen geven verschillende verantwoordelijkheden"}
            text={isEnglish
              ? "No wallet type is automatically best for everyone. Compare purpose, strengths, limitations and recovery."
              : "Geen walletsoort is automatisch het beste voor iedereen. Vergelijk doel, sterke punten, beperkingen en herstel."}
          />

          <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {walletTypes.map((walletType) => (
              <WalletTypeCard key={walletType.id} walletType={walletType} isEnglish={isEnglish} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <SectionHeading
          eyebrow={isEnglish ? "Before signing" : "Vóór ondertekening"}
          title={isEnglish ? "Four questions that prevent avoidable mistakes" : "Vier vragen die vermijdbare fouten voorkomen"}
          text={isEnglish
            ? "A familiar logo or high compatibility score does not remove the need to inspect every transaction."
            : "Een bekend logo of hoge compatibiliteitsscore neemt de noodzaak niet weg om elke transactie te controleren."}
        />

        <div className="mt-9 grid gap-4 md:grid-cols-2">
          {safetyQuestions.map((question) => (
            <SummaryCard
              key={question.titleEn}
              icon={question.icon}
              title={isEnglish ? question.titleEn : question.titleNl}
              text={isEnglish ? question.textEn : question.textNl}
            />
          ))}
        </div>

        <div className="mt-8 rounded-3xl bg-slate-950 p-6 text-white sm:p-8">
          <div className="grid gap-6 md:grid-cols-[auto_1fr_auto] md:items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <Link2 size={23} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{isEnglish ? "Dynamic capability check" : "Dynamische capability-check"}</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                {isEnglish
                  ? "After connection, OTT should test account access, payments, memos, NFTokenMint, TrustSet, OfferCreate or AMM support, advanced signing and a safe return to OTT."
                  : "Na koppeling moet OTT accounttoegang, betalingen, memo’s, NFTokenMint, TrustSet, OfferCreate- of AMM-ondersteuning, geavanceerd ondertekenen en veilige terugkeer naar OTT testen."}
              </p>
            </div>
            <ChevronRight className="hidden text-slate-500 md:block" size={24} />
          </div>
        </div>
      </section>
    </div>
  );
}

function WalletTypeCard({ walletType, isEnglish }: { walletType: WalletType; isEnglish: boolean }) {
  const Icon = walletType.icon;
  const pros = isEnglish ? walletType.prosEn : walletType.prosNl;
  const cons = isEnglish ? walletType.consEn : walletType.consNl;

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-blue-700">
        <Icon size={21} />
      </div>
      <h3 className="mt-5 text-lg font-semibold">{isEnglish ? walletType.titleEn : walletType.titleNl}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{isEnglish ? walletType.purposeEn : walletType.purposeNl}</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 md:grid-cols-1">
        <ListBlock title={isEnglish ? "Strengths" : "Sterke punten"} items={pros} positive />
        <ListBlock title={isEnglish ? "Limitations" : "Beperkingen"} items={cons} />
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{isEnglish ? "Often suitable for" : "Vaak geschikt voor"}</p>
        <p className="mt-2 text-sm font-medium text-slate-700">{isEnglish ? walletType.bestForEn : walletType.bestForNl}</p>
      </div>
    </article>
  );
}

function ListBlock({ title, items, positive = false }: { title: string; items: string[]; positive?: boolean }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-700">{title}</p>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-xs leading-5 text-slate-500">
            {positive ? <Check className="mt-0.5 shrink-0 text-emerald-600" size={14} /> : <AlertTriangle className="mt-0.5 shrink-0 text-amber-600" size={14} />}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SummaryCard({ icon: Icon, title, text }: { icon: ElementType; title: string; text: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5">
      <Icon size={20} className="text-blue-700" />
      <h3 className="mt-4 text-sm font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
    </article>
  );
}

function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">{text}</p>
    </div>
  );
}
