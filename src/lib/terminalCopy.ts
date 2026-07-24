export type TerminalLanguage = "nl" | "en";

export type CopyDictionary = {
  common: {
    productStructure: string;
    sourceTag: string;
    wallet: string;
    connectedWallet: string;
    guestMode: string;
    mode: string;
    educationFirst: string;
    custody: string;
    never: string;
    noCustodyLine: string;
    continueRoute: string;
    connectXaman: string;
    openExplorer: string;
    openWallet: string;
    openProofLayer: string;
    mobileReady: string;
    desktopReady: string;
    verified: string;
    notVerified: string;
    loading: string;
    waiting: string;
    error: string;
    reset: string;
  };
  home: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    titleLine3: string;
    intro: string;
    startExplorer: string;
    startExplorerText: string;
    connectXaman: string;
    connectXamanText: string;
    proofEducation: string;
    proofEducationText: string;
    threeLayerTitle: string;
    threeLayerIntro: string;
    explorerTitle: string;
    explorerLabel: string;
    explorerDescription: string;
    explorerBullets: string[];
    dashboardTitle: string;
    dashboardLabel: string;
    dashboardDescription: string;
    dashboardBullets: string[];
    proofTitle: string;
    proofLabel: string;
    proofDescription: string;
    proofBullets: string[];
    mainFlow: string;
    reuseTitle: string;
    reuseItems: string[];
  };
  access: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    titleLine3: string;
    intro: string;
    routeTitle: string;
    nftTitle: string;
    nftIntro: string;
    nftSteps: string[];
    legalTitle: string;
    legalLines: string[];
    statusTitle: string;
    statusMessage: string;
    chooseRoute: string;
    createPayload: string;
    openBanxa: string;
    verifyPayment: string;
    txHashLabel: string;
    destinationWallet: string;
    routeSelected: string;
    noRouteSelected: string;
    noRouteSelectedText: string;
    accessUnlocked: string;
    accessLocked: string;
    accessPassFound: string;
    accessPassNotFound: string;
  };
  xaman: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    titleLine3: string;
    intro: string;
    connectButton: string;
    connectButtonText: string;
    createOnly: string;
    openXaman: string;
    verify: string;
    qrFallback: string;
    mobileStatusReady: string;
    desktopStatusReady: string;
    creatingPayload: string;
    openingXaman: string;
    signingWaiting: string;
    signatureFound: string;
    rejectedExpired: string;
    safeTitle: string;
    safeLines: string[];
  };
};

export const terminalCopy: Record<TerminalLanguage, CopyDictionary> = {
  nl: {
    common: {
      productStructure: "Productstructuur",
      sourceTag: "SourceTag",
      wallet: "Wallet",
      connectedWallet: "Gekoppelde wallet",
      guestMode: "Gastmodus",
      mode: "Modus",
      educationFirst: "Education-first",
      custody: "Custody",
      never: "Nooit",
      noCustodyLine:
        "Geen custody, geen broker, geen yield provider, geen trade execution. Officiële routes pas na uitleg en risicobewustzijn.",
      continueRoute: "Ga verder",
      connectXaman: "Xaman koppelen",
      openExplorer: "Open verkenner",
      openWallet: "Open wallet",
      openProofLayer: "Open bewijslaag",
      mobileReady: "Mobiel klaar",
      desktopReady: "Desktop klaar",
      verified: "Geverifieerd",
      notVerified: "Niet geverifieerd",
      loading: "Laden",
      waiting: "Wachten",
      error: "Fout",
      reset: "Reset",
    },
    home: {
      eyebrow: "XRPL OnTheTrack Terminal V2",
      titleLine1: "Explore XRPL.",
      titleLine2: "Connect Xaman.",
      titleLine3: "Prove What Matters.",
      intro:
        "Een XRPL-native terminal met drie lagen: een professionele explorer, een connected Xaman wallet dashboard en de unieke OTT Proof / Education laag rond SourceTag.",
      startExplorer: "Start verkenner",
      startExplorerText: "Publieke XRPL laag",
      connectXaman: "Connect Xaman",
      connectXamanText: "Mobiele walletstroom",
      proofEducation: "Proof / Education",
      proofEducationText: "Unieke OTT laag",
      threeLayerTitle: "XRPL-terminal met drie lagen",
      threeLayerIntro:
        "Alles wat al gebouwd is blijft bestaan. We tonen het alleen slimmer: explorer eerst, wallet dashboard tweede, OTT proof / education derde.",
      explorerTitle: "XRPL-verkenner",
      explorerLabel: "Publieke laag",
      explorerDescription:
        "De publieke voorkant: live XRPL data, search, ledgers, transactions, accounts, assets en SourceTag proof.",
      explorerBullets: [
        "Live XRPL network overview",
        "Search account / transaction / asset",
        "SourceTag 2606170002 lookup",
        "Explorer-style first impression",
      ],
      dashboardTitle: "Xaman-walletoverzicht",
      dashboardLabel: "Gekoppelde laag",
      dashboardDescription:
        "Na Xaman connect krijgt de gebruiker zijn eigen XRPL command center met wallet, balances, trustlines, proof history en XP.",
      dashboardBullets: [
        "Wallet address and balances",
        "Recent transactions",
        "Trustlines / NFTs later",
        "Reward Ledger and access status",
      ],
      proofTitle: "OTT Proof / Education",
      proofLabel: "OnTheTrack-laag",
      proofDescription:
        "De unieke OTT-laag: Partner Hub, Proof Stamps, Truth Desk, Access Gate en education-first routes.",
      proofBullets: [
        "Learn first, act second",
        "Risk notes before route",
        "Optional Proof Stamps",
        "Truth Desk and Access Gate",
      ],
      mainFlow: "Nieuwe hoofdroute",
      reuseTitle: "Wat we hergebruiken",
      reuseItems: [
        "api/ott.ts single router",
        "Xaman payload logic",
        "XRPL verification logic",
        "Partner Hub content",
        "Truth Desk / Access Gate",
        "Reward Ledger / XP",
      ],
    },
    access: {
      eyebrow: "Access Gate Layer",
      titleLine1: "Buy Access.",
      titleLine2: "Receive Pass.",
      titleLine3: "Unlock Services.",
      intro:
        "Klanten kunnen toegang kopen voor OTT services. De lange termijn flow is: Xaman betalen → OTT Access Pass NFT ontvangen → bij volgende login NFT ownership check → automatisch toegang. De NFT is access utility, geen investering.",
      routeTitle: "Access Routes",
      nftTitle: "NFT Access Pass",
      nftIntro:
        "Production mint + ownership check is de volgende bouwstap. Deze pagina bereidt de klantreis voor en laat de werkende Xaman-flow intact.",
      nftSteps: [
        "Betaal één keer voor service access.",
        "Ontvang OTT Access Pass NFT.",
        "Volgende login checkt NFT ownership.",
        "Access opent zonder opnieuw betalen.",
      ],
      legalTitle: "Legal-safe taal",
      legalLines: [
        "Access payments unlocken alleen app access.",
        "OTT Access Pass NFT is alleen access utility.",
        "De NFT is geen investment product.",
        "XP heeft geen gegarandeerde financiële waarde.",
        "Mainnet token conversion vereist legal review.",
      ],
      statusTitle: "Access Status",
      statusMessage: "Kies een access route om de terminal access flow te starten.",
      chooseRoute: "Kies eerst een access route.",
      createPayload: "Toegangsverzoek maken",
      openBanxa: "Banxa openen",
      verifyPayment: "Toegangsbetaling controleren",
      txHashLabel: "Transactiehash van toegangsbetaling",
      destinationWallet: "Bestemmingswallet",
      routeSelected: "Access route geselecteerd.",
      noRouteSelected: "Geen route geselecteerd",
      noRouteSelectedText:
        "Kies links een access route. Daarna zie je uitleg, risico’s, bedrag en de volgende betaal/verificatie stap.",
      accessUnlocked: "Access open",
      accessLocked: "Access locked",
      accessPassFound: "OTT Access Pass gevonden. Services kunnen automatisch unlocken.",
      accessPassNotFound: "Geen OTT Access Pass gevonden voor deze wallet.",
    },
    xaman: {
      eyebrow: "Mobile Xaman Connect Layer",
      titleLine1: "Tap.",
      titleLine2: "Open Xaman.",
      titleLine3: "Return Smooth.",
      intro:
        "Mobiel staat voorop: de klant tapt, Xaman opent, de klant tekent en komt terug naar OTT Terminal. De payload wordt lokaal bewaard zodat de wallet automatisch gekoppeld kan worden.",
      connectButton: "Koppelen met Xaman",
      connectButtonText: "Eerst mobiele deeplink, daarna QR als terugval",
      createOnly: "Alleen aanmaken",
      openXaman: "Xaman openen",
      verify: "Controleren",
      qrFallback: "QR-terugval",
      mobileStatusReady: "Mobiele modus: Xaman-deeplink is klaar.",
      desktopStatusReady: "Desktopmodus: QR en deeplink beschikbaar.",
      creatingPayload: "Xaman-verzoek wordt aangemaakt...",
      openingXaman: "Verzoek opgeslagen. Xaman wordt geopend...",
      signingWaiting: "De ondertekening in Xaman wacht nog.",
      signatureFound: "Handtekening gevonden. Wallet gekoppeld.",
      rejectedExpired: "Handtekening geweigerd of verlopen. Probeer opnieuw.",
      safeTitle: "Veilige uitgangspositie",
      safeLines: [
        "Geen custody",
        "Geen broker",
        "Geen yieldprovider",
        "Geen handelsuitvoering",
        "De gebruiker ondertekent in Xaman",
      ],
    },
  },
  en: {
    common: {
      productStructure: "Product Structure",
      sourceTag: "SourceTag",
      wallet: "Wallet",
      connectedWallet: "Connected Wallet",
      guestMode: "Guest Mode",
      mode: "Mode",
      educationFirst: "Education-first",
      custody: "Custody",
      never: "Never",
      noCustodyLine:
        "No custody, no broker, no yield provider, no trade execution. Official routes only after explanation and risk awareness.",
      continueRoute: "Continue route",
      connectXaman: "Connect Xaman",
      openExplorer: "Open Explorer",
      openWallet: "Open Wallet",
      openProofLayer: "Open Proof Layer",
      mobileReady: "Mobile ready",
      desktopReady: "Desktop ready",
      verified: "Verified",
      notVerified: "Not verified",
      loading: "Loading",
      waiting: "Waiting",
      error: "Error",
      reset: "Reset",
    },
    home: {
      eyebrow: "XRPL OnTheTrack Terminal V2",
      titleLine1: "Explore XRPL.",
      titleLine2: "Connect Xaman.",
      titleLine3: "Prove What Matters.",
      intro:
        "An XRPL-native terminal with three layers: a professional explorer, a connected Xaman wallet dashboard, and the unique OTT Proof / Education layer around SourceTag.",
      startExplorer: "Start Explorer",
      startExplorerText: "Public XRPL layer",
      connectXaman: "Connect Xaman",
      connectXamanText: "Mobile wallet flow",
      proofEducation: "Proof / Education",
      proofEducationText: "Unique OTT layer",
      threeLayerTitle: "Three-Layer XRPL Terminal",
      threeLayerIntro:
        "Everything already built stays available. We simply present it smarter: explorer first, wallet dashboard second, OTT proof / education third.",
      explorerTitle: "XRPL Explorer",
      explorerLabel: "Public Layer",
      explorerDescription:
        "The public front layer: live XRPL data, search, ledgers, transactions, accounts, assets, and SourceTag proof.",
      explorerBullets: [
        "Live XRPL network overview",
        "Search account / transaction / asset",
        "SourceTag 2606170002 lookup",
        "Explorer-style first impression",
      ],
      dashboardTitle: "Xaman Wallet Dashboard",
      dashboardLabel: "Connected Layer",
      dashboardDescription:
        "After connecting with Xaman, the user gets an XRPL command center with wallet, balances, trustlines, proof history, and XP.",
      dashboardBullets: [
        "Wallet address and balances",
        "Recent transactions",
        "Trustlines / NFTs later",
        "Reward Ledger and access status",
      ],
      proofTitle: "OTT Proof / Education",
      proofLabel: "OnTheTrack Layer",
      proofDescription:
        "The unique OTT layer: Partner Hub, Proof Stamps, Truth Desk, Access Gate, and education-first routes.",
      proofBullets: [
        "Learn first, act second",
        "Risk notes before route",
        "Optional Proof Stamps",
        "Truth Desk and Access Gate",
      ],
      mainFlow: "New Main Flow",
      reuseTitle: "What We Reuse",
      reuseItems: [
        "api/ott.ts single router",
        "Xaman payload logic",
        "XRPL verification logic",
        "Partner Hub content",
        "Truth Desk / Access Gate",
        "Reward Ledger / XP",
      ],
    },
    access: {
      eyebrow: "Access Gate Layer",
      titleLine1: "Buy Access.",
      titleLine2: "Receive Pass.",
      titleLine3: "Unlock Services.",
      intro:
        "Customers can buy access to OTT services. The long-term flow is: pay with Xaman → receive an OTT Access Pass NFT → on the next login, NFT ownership is checked → access unlocks automatically. The NFT is access utility, not an investment.",
      routeTitle: "Access Routes",
      nftTitle: "NFT Access Pass",
      nftIntro:
        "Production mint + ownership check is the next build step. This screen prepares the customer journey while keeping the working Xaman flow intact.",
      nftSteps: [
        "Pay once for service access.",
        "Receive OTT Access Pass NFT.",
        "Next login checks NFT ownership.",
        "Access opens without paying again.",
      ],
      legalTitle: "Legal-safe Language",
      legalLines: [
        "Access payments unlock app access only.",
        "OTT Access Pass NFT is access utility only.",
        "The NFT is not an investment product.",
        "XP has no guaranteed financial value.",
        "Mainnet token conversion requires legal review.",
      ],
      statusTitle: "Access Status",
      statusMessage: "Choose an access route to start the terminal access flow.",
      chooseRoute: "Select an access route first.",
      createPayload: "Create Access Payload",
      openBanxa: "Open Banxa",
      verifyPayment: "Verify Access Payment",
      txHashLabel: "Access Payment Tx Hash",
      destinationWallet: "Destination Wallet",
      routeSelected: "Access route selected.",
      noRouteSelected: "No Route Selected",
      noRouteSelectedText:
        "Choose an access route on the left. You will then see the explanation, risks, amount, and next payment/verification step.",
      accessUnlocked: "Access unlocked",
      accessLocked: "Access locked",
      accessPassFound: "OTT Access Pass found. Services can unlock automatically.",
      accessPassNotFound: "No OTT Access Pass found for this wallet.",
    },
    xaman: {
      eyebrow: "Mobile Xaman Connect Layer",
      titleLine1: "Tap.",
      titleLine2: "Open Xaman.",
      titleLine3: "Return Smooth.",
      intro:
        "Mobile comes first: the customer taps, Xaman opens, the customer signs, and returns to OTT Terminal. The payload is stored locally so the wallet can be connected automatically.",
      connectButton: "Connect With Xaman",
      connectButtonText: "Mobile deeplink first / QR fallback second",
      createOnly: "Create Only",
      openXaman: "Open Xaman",
      verify: "Verify",
      qrFallback: "QR fallback",
      mobileStatusReady: "Mobile mode: Xaman deeplink ready.",
      desktopStatusReady: "Desktop mode: QR and deeplink available.",
      creatingPayload: "Creating Xaman payload...",
      openingXaman: "Payload saved. Opening Xaman app...",
      signingWaiting: "Xaman signing is still waiting.",
      signatureFound: "Signature found. Wallet connected.",
      rejectedExpired: "Signature rejected or expired. Try again.",
      safeTitle: "Safe Position",
      safeLines: [
        "No custody",
        "No broker",
        "No yield provider",
        "No trade execution",
        "User signs inside Xaman",
      ],
    },
  },
};

export function getTerminalCopy(language: string | undefined) {
  return terminalCopy[language === "en" ? "en" : "nl"];
}

export function getTerminalLanguage(language: string | undefined): TerminalLanguage {
  return language === "en" ? "en" : "nl";
}
