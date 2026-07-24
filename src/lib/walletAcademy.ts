import type { WalletProviderId } from "./walletRegistry";

export type WalletAcademyLesson = {
  id: string;
  title: { en: string; nl: string };
  summary: { en: string; nl: string };
  level: "foundation" | "security" | "advanced";
  xp: number;
};

export type WalletAcademyModule = {
  id: string;
  title: { en: string; nl: string };
  certificateType: string;
  lessons: WalletAcademyLesson[];
};

export const WALLET_ACADEMY_MODULES: WalletAcademyModule[] = [
  {
    id: "wallet-foundation",
    title: { en: "Wallet Foundation", nl: "Walletfundament" },
    certificateType: "wallet-foundation-certificate",
    lessons: [
      {
        id: "account-wallet-address",
        title: { en: "Account, wallet and address", nl: "Account, wallet en adres" },
        summary: {
          en: "Understand why an XRPL account exists on-ledger while a wallet manages the keys that authorize it.",
          nl: "Begrijp waarom een XRPL-account op de ledger bestaat en een wallet de sleutels beheert die het account autoriseren.",
        },
        level: "foundation",
        xp: 20,
      },
      {
        id: "classic-xaddress-tag",
        title: { en: "Classic address, X-address and destination tag", nl: "Classic address, X-address en destination tag" },
        summary: {
          en: "Learn which address format to use and why exchanges often require a destination tag.",
          nl: "Leer welk adresformaat je gebruikt en waarom exchanges vaak een destination tag vereisen.",
        },
        level: "foundation",
        xp: 20,
      },
      {
        id: "reserve-fees-sequence",
        title: { en: "Reserve, fees and sequence", nl: "Reserve, kosten en sequence" },
        summary: {
          en: "See how account reserve, owner objects, transaction fees and sequence numbers affect an account.",
          nl: "Bekijk hoe accountreserve, owner objects, transactiekosten en sequence-nummers een account beïnvloeden.",
        },
        level: "foundation",
        xp: 25,
      },
      {
        id: "custody-models",
        title: { en: "Self-custody and custodial services", nl: "Self-custody en custodial diensten" },
        summary: {
          en: "Separate a wallet you control from an exchange balance held in a shared account.",
          nl: "Onderscheid een wallet die jij beheert van een exchangebalans in een gedeeld account.",
        },
        level: "foundation",
        xp: 25,
      },
    ],
  },
  {
    id: "wallet-security",
    title: { en: "Wallet Security", nl: "Walletbeveiliging" },
    certificateType: "wallet-security-certificate",
    lessons: [
      {
        id: "secrets-recovery",
        title: { en: "Seeds, private keys and recovery", nl: "Seeds, private keys en herstel" },
        summary: {
          en: "Learn which secrets can control funds, how to back them up and why OTT will never request them.",
          nl: "Leer welke geheimen geld kunnen beheren, hoe je ze veilig bewaart en waarom OTT er nooit om vraagt.",
        },
        level: "security",
        xp: 30,
      },
      {
        id: "payload-review",
        title: { en: "Read before signing", nl: "Lees vóór ondertekenen" },
        summary: {
          en: "Verify account, destination, amount, token issuer, network, flags, memo and SourceTag before approval.",
          nl: "Controleer account, bestemming, bedrag, tokenissuer, netwerk, flags, memo en SourceTag vóór goedkeuring.",
        },
        level: "security",
        xp: 35,
      },
      {
        id: "regular-key-multisign",
        title: { en: "Regular keys and multi-signing", nl: "Regular keys en multi-signing" },
        summary: {
          en: "Understand safer authorization structures and how a signer quorum can protect an XRPL account.",
          nl: "Begrijp veiligere autorisatiestructuren en hoe een signer quorum een XRPL-account kan beschermen.",
        },
        level: "security",
        xp: 40,
      },
      {
        id: "phishing-response",
        title: { en: "Phishing and incident response", nl: "Phishing en incidentrespons" },
        summary: {
          en: "Recognize fake wallet prompts and know what to do after a suspicious signature or exposed secret.",
          nl: "Herken valse walletverzoeken en weet wat je doet na een verdachte handtekening of blootgesteld geheim.",
        },
        level: "security",
        xp: 40,
      },
    ],
  },
  {
    id: "wallet-operations",
    title: { en: "XRPL Wallet Operations", nl: "XRPL-walletgebruik" },
    certificateType: "wallet-operations-certificate",
    lessons: [
      {
        id: "payments-tokens",
        title: { en: "XRP, tokens and trustlines", nl: "XRP, tokens en trustlines" },
        summary: {
          en: "Understand native XRP payments, issued currencies, issuers, limits and trustline risk.",
          nl: "Begrijp native XRP-betalingen, issued currencies, issuers, limieten en trustline-risico.",
        },
        level: "advanced",
        xp: 40,
      },
      {
        id: "dex-amm",
        title: { en: "DEX offers and AMM positions", nl: "DEX-orders en AMM-posities" },
        summary: {
          en: "Learn how offers, paths, liquidity pools, LP tokens and slippage appear in a wallet profile.",
          nl: "Leer hoe offers, paden, liquiditeitspools, LP-tokens en slippage in een walletprofiel verschijnen.",
        },
        level: "advanced",
        xp: 45,
      },
      {
        id: "nfts-escrows-checks",
        title: { en: "NFTs, escrows and checks", nl: "NFT’s, escrows en checks" },
        summary: {
          en: "Explore ownership objects, offers, time conditions and claim-based payment instruments.",
          nl: "Ontdek eigendomsobjecten, offers, tijdvoorwaarden en claim-gebaseerde betaalinstrumenten.",
        },
        level: "advanced",
        xp: 45,
      },
      {
        id: "testnet-lab",
        title: { en: "Testnet signing lab", nl: "Testnet-ondertekenlab" },
        summary: {
          en: "Connect a supported wallet, inspect a harmless transaction and verify the validated result without risking real funds.",
          nl: "Koppel een ondersteunde wallet, controleer een onschuldige transactie en verifieer het gevalideerde resultaat zonder echt geld te riskeren.",
        },
        level: "advanced",
        xp: 50,
      },
    ],
  },
];

export const WALLET_PROVIDER_GUIDES: Partial<Record<WalletProviderId, {
  setup: { en: string[]; nl: string[] };
  safety: { en: string; nl: string };
}>> = {
  xaman: {
    setup: {
      en: ["Install Xaman on iOS or Android.", "Create or import an XRPL account inside Xaman.", "Open the OTT sign request, inspect every field and approve inside Xaman.", "Return to OTT and wait for server-side payload verification."],
      nl: ["Installeer Xaman op iOS of Android.", "Maak of importeer een XRPL-account in Xaman.", "Open het OTT-ondertekenverzoek, controleer ieder veld en keur het goed in Xaman.", "Ga terug naar OTT en wacht op server-side payloadverificatie."],
    },
    safety: {
      en: "OTT receives the signed account and transaction result, never the Xaman secret.",
      nl: "OTT ontvangt het ondertekende account en transactieresultaat, nooit het Xaman-geheim.",
    },
  },
  crossmark: {
    setup: {
      en: ["Install the CROSSMARK browser extension.", "Unlock the extension and select the intended XRPL network.", "Choose CROSSMARK in OTT and approve the sign-in request.", "Verify the connected address and network in the OTT profile."],
      nl: ["Installeer de CROSSMARK-browserextensie.", "Ontgrendel de extensie en kies het bedoelde XRPL-netwerk.", "Kies CROSSMARK in OTT en keur het sign-inverzoek goed.", "Controleer het gekoppelde adres en netwerk in het OTT-profiel."],
    },
    safety: {
      en: "CROSSMARK signs inside the extension. OTT never receives the private key.",
      nl: "CROSSMARK ondertekent in de extensie. OTT ontvangt nooit de private key.",
    },
  },
  gemwallet: {
    setup: {
      en: ["Install the GemWallet extension.", "Select Mainnet or a test network in GemWallet.", "Choose GemWallet in OTT and share the active classic address.", "Use Testnet first before approving a real transaction."],
      nl: ["Installeer de GemWallet-extensie.", "Kies Mainnet of een testnetwerk in GemWallet.", "Kies GemWallet in OTT en deel het actieve classic address.", "Gebruik eerst Testnet voordat je een echte transactie goedkeurt."],
    },
    safety: {
      en: "Address sharing proves provider access, while each transaction still needs a separate approval in GemWallet.",
      nl: "Adresdeling bewijst providertoegang, terwijl iedere transactie apart in GemWallet moet worden goedgekeurd.",
    },
  },
  walletconnect: {
    setup: {
      en: ["OTT creates a WalletConnect pairing URI.", "Scan it with an XRPL-compatible mobile wallet.", "Approve the requested XRPL namespace and account.", "Sign only after checking network and transaction fields."],
      nl: ["OTT maakt een WalletConnect-pairing-URI.", "Scan deze met een XRPL-compatibele mobiele wallet.", "Keur de gevraagde XRPL-namespace en het account goed.", "Onderteken pas na controle van netwerk en transactievelden."],
    },
    safety: {
      en: "WalletConnect is a communication protocol, not custody and not a wallet by itself.",
      nl: "WalletConnect is een communicatieprotocol, geen custody en geen zelfstandige wallet.",
    },
  },
};

export function getWalletAcademyStats() {
  const lessons = WALLET_ACADEMY_MODULES.flatMap((module) => module.lessons);
  return {
    moduleCount: WALLET_ACADEMY_MODULES.length,
    lessonCount: lessons.length,
    totalXp: lessons.reduce((total, lesson) => total + lesson.xp, 0),
    certificateCount: WALLET_ACADEMY_MODULES.length,
  };
}
