export type AcademyLearningSection = {
  titleEn: string;
  titleNl: string;
  bodyEn: string;
  bodyNl: string;
};

export type AcademyLearningContent = {
  summaryEn: string;
  summaryNl: string;
  sections: AcademyLearningSection[];
  exampleEn: string;
  exampleNl: string;
  glossary: Array<{
    term: string;
    definitionEn: string;
    definitionNl: string;
  }>;
};

export const ACADEMY_LEARNING_CONTENT: Record<string, AcademyLearningContent> = {
  "blockchain-crypto-basics": {
    summaryEn: "A blockchain is a shared ledger. A wallet controls keys that authorize actions on that ledger; it does not physically contain the assets.",
    summaryNl: "Een blockchain is een gedeeld grootboek. Een wallet beheert sleutels waarmee handelingen op dat grootboek worden goedgekeurd; de assets zitten niet letterlijk in de wallet.",
    sections: [
      {
        titleEn: "Ledger and transactions",
        titleNl: "Ledger en transacties",
        bodyEn: "A ledger records balances and transactions. A blockchain distributes copies of that history across independent participants so changes can be checked and agreed upon.",
        bodyNl: "Een ledger registreert saldi en transacties. Een blockchain verspreidt kopieën van die geschiedenis over onafhankelijke deelnemers, zodat wijzigingen gecontroleerd en overeengekomen kunnen worden.",
      },
      {
        titleEn: "What a wallet does",
        titleNl: "Wat een wallet doet",
        bodyEn: "A self-custody wallet stores or protects the signing keys for an account. Whoever controls the recovery secret can normally authorize transactions, so recovery data must never be shared.",
        bodyNl: "Een self-custodywallet bewaart of beschermt de ondertekeningssleutels van een account. Wie het herstelgeheim beheert, kan normaal transacties goedkeuren; deel herstelgegevens daarom nooit.",
      },
      {
        titleEn: "Understand before signing",
        titleNl: "Begrijp vóór ondertekenen",
        bodyEn: "Blockchain transactions may be irreversible. Check the destination, asset, amount, network and requested permissions before approving anything.",
        bodyNl: "Blockchaintransacties kunnen onomkeerbaar zijn. Controleer bestemming, asset, bedrag, netwerk en gevraagde rechten voordat je iets goedkeurt.",
      },
    ],
    exampleEn: "A wallet asks you to approve a payment. Before signing, verify the destination address, the amount, the asset and whether the request came from the official application.",
    exampleNl: "Een wallet vraagt je een betaling goed te keuren. Controleer vóór ondertekening het bestemmingsadres, het bedrag, de asset en of het verzoek uit de officiële applicatie komt.",
    glossary: [
      { term: "Ledger", definitionEn: "A recorded history of balances and transactions.", definitionNl: "Een vastgelegde geschiedenis van saldi en transacties." },
      { term: "Self-custody", definitionEn: "The user controls the signing and recovery keys.", definitionNl: "De gebruiker beheert de ondertekenings- en herstelsleutels." },
      { term: "Private key", definitionEn: "Secret cryptographic material used to authorize actions.", definitionNl: "Geheim cryptografisch materiaal waarmee handelingen worden goedgekeurd." },
    ],
  },
  "intro-to-xrpl": {
    summaryEn: "The XRP Ledger is a public decentralized network for accounts, payments and issued assets. Independent validators agree on a validated ledger history.",
    summaryNl: "De XRP Ledger is een openbaar gedecentraliseerd netwerk voor accounts, betalingen en uitgegeven assets. Onafhankelijke validators bereiken overeenstemming over een gevalideerde ledgergeschiedenis.",
    sections: [
      {
        titleEn: "Accounts and public data",
        titleNl: "Accounts en openbare data",
        bodyEn: "An XRPL account is identified by an r-address. Account settings, balances and validated transactions can be inspected through an explorer or an XRPL data service.",
        bodyNl: "Een XRPL-account wordt herkend aan een r-adres. Accountinstellingen, saldi en gevalideerde transacties kunnen via een explorer of XRPL-datadienst worden bekeken.",
      },
      {
        titleEn: "Consensus and validation",
        titleNl: "Consensus en validatie",
        bodyEn: "Validators exchange proposals and agree on the next ledger version. A transaction should be treated as final evidence only after it appears in a validated ledger with a successful result.",
        bodyNl: "Validators wisselen voorstellen uit en bereiken overeenstemming over de volgende ledgerversie. Behandel een transactie pas als definitief bewijs wanneer die in een gevalideerde ledger staat met een succesvol resultaat.",
      },
      {
        titleEn: "What to verify",
        titleNl: "Wat je controleert",
        bodyEn: "Check validation status, result code, account, destination, delivered amount, currency, issuer, destination tag and memo when relevant.",
        bodyNl: "Controleer validatiestatus, resultaatcode, account, bestemming, geleverd bedrag, valuta, issuer, destination tag en memo wanneer relevant.",
      },
    ],
    exampleEn: "A screenshot says a payment was sent. The reliable check is the transaction hash in an explorer, where you confirm validated status and the actual delivered amount.",
    exampleNl: "Een screenshot zegt dat een betaling is verzonden. De betrouwbare controle is de transactiehash in een explorer, waar je validatie en het werkelijk geleverde bedrag bevestigt.",
    glossary: [
      { term: "Validator", definitionEn: "A server participating in agreement on ledger state.", definitionNl: "Een server die deelneemt aan overeenstemming over de ledgerstatus." },
      { term: "Validated", definitionEn: "Accepted into a consensus-approved ledger version.", definitionNl: "Opgenomen in een door consensus goedgekeurde ledgerversie." },
      { term: "Finality", definitionEn: "The point at which a confirmed result can be treated as settled evidence.", definitionNl: "Het moment waarop een bevestigd resultaat als definitief bewijs geldt." },
    ],
  },
  "payments-use-cases": {
    summaryEn: "A safe payment is more than a green success message. The transaction must match the intended sender, destination, asset, amount and business context.",
    summaryNl: "Een veilige betaling is meer dan een groen succesbericht. De transactie moet overeenkomen met afzender, bestemming, asset, bedrag en zakelijke context.",
    sections: [
      {
        titleEn: "Payment fields",
        titleNl: "Betalingsvelden",
        bodyEn: "A Payment transaction identifies the sending account and destination. XRP amounts use drops; issued-token amounts include both a currency code and an issuer address.",
        bodyNl: "Een Payment-transactie vermeldt het verzendende account en de bestemming. XRP-bedragen gebruiken drops; bedragen in issued tokens bevatten zowel een valutacode als een issueradres.",
      },
      {
        titleEn: "Success with context",
        titleNl: "Succes met context",
        bodyEn: "tesSUCCESS means the transaction executed successfully. It does not by itself prove that the correct destination, amount, token, memo or business order was used.",
        bodyNl: "tesSUCCESS betekent dat de transactie succesvol is uitgevoerd. Het bewijst op zichzelf niet dat bestemming, bedrag, token, memo of bestelling correct waren.",
      },
      {
        titleEn: "Tags and memos",
        titleNl: "Tags en memo's",
        bodyEn: "Destination tags can route a payment inside a service. Memos and public SourceTags can add reconciliation context, but they are not passwords and should not contain secrets.",
        bodyNl: "Destination tags kunnen een betaling binnen een dienst routeren. Memo's en openbare SourceTags kunnen context geven, maar zijn geen wachtwoorden en mogen geen geheimen bevatten.",
      },
    ],
    exampleEn: "A donation is accepted only after the server verifies the expected destination, amount, validated result and the action identifier used by OTT.",
    exampleNl: "Een donatie wordt pas geaccepteerd nadat de server bestemming, bedrag, gevalideerd resultaat en de OTT-actie-identificatie heeft gecontroleerd.",
    glossary: [
      { term: "tesSUCCESS", definitionEn: "The XRPL result code for successful execution.", definitionNl: "De XRPL-resultaatcode voor een succesvolle uitvoering." },
      { term: "Destination tag", definitionEn: "A numeric identifier used by some recipients to route deposits.", definitionNl: "Een numerieke identificatie waarmee sommige ontvangers stortingen routeren." },
      { term: "Memo", definitionEn: "Optional public transaction metadata.", definitionNl: "Optionele openbare transactiemetadata." },
    ],
  },
  "source-tag-proof": {
    summaryEn: "OTT uses SourceTag 2606170002 as a public tracking identity for selected Make Waves actions. It adds context but never replaces full transaction verification.",
    summaryNl: "OTT gebruikt SourceTag 2606170002 als openbare tracking-identiteit voor geselecteerde Make Waves-acties. Het geeft context, maar vervangt nooit volledige transactieverificatie.",
    sections: [
      {
        titleEn: "Public proof identity",
        titleNl: "Openbare proof-identiteit",
        bodyEn: "A SourceTag or memo can connect an on-ledger action to a project campaign. Everyone can inspect it, so it must not be treated as authentication or a secret.",
        bodyNl: "Een SourceTag of memo kan een on-ledger actie aan een projectcampagne koppelen. Iedereen kan dit bekijken; behandel het daarom niet als authenticatie of geheim.",
      },
      {
        titleEn: "Verify the full transaction",
        titleNl: "Controleer de volledige transactie",
        bodyEn: "The server must also verify the transaction hash, validated status, result, account, destination, amount and intended action.",
        bodyNl: "De server moet ook transactiehash, validatiestatus, resultaat, account, bestemming, bedrag en bedoelde actie controleren.",
      },
      {
        titleEn: "Prevent duplicate rewards",
        titleNl: "Voorkom dubbele beloningen",
        bodyEn: "Store each accepted transaction hash or action key once. Repeated requests must return the existing result rather than issuing the reward again.",
        bodyNl: "Sla iedere geaccepteerde transactiehash of actiesleutel één keer op. Herhaalde verzoeken moeten het bestaande resultaat teruggeven in plaats van opnieuw te belonen.",
      },
    ],
    exampleEn: "Two users submit the same transaction hash. The first valid submission is recorded; the second is recognized as a duplicate and receives no second reward.",
    exampleNl: "Twee gebruikers sturen dezelfde transactiehash in. De eerste geldige inzending wordt opgeslagen; de tweede wordt als duplicaat herkend en krijgt geen tweede beloning.",
    glossary: [
      { term: "SourceTag", definitionEn: "A public OTT identifier added to selected proof actions.", definitionNl: "Een openbare OTT-identificatie die aan geselecteerde proof-acties wordt toegevoegd." },
      { term: "Transaction hash", definitionEn: "A unique identifier for a ledger transaction.", definitionNl: "Een unieke identificatie van een ledgertransactie." },
      { term: "Idempotency", definitionEn: "Processing the same action repeatedly without duplicating its effect.", definitionNl: "Dezelfde actie herhaald verwerken zonder het effect te verdubbelen." },
    ],
  },
  "defi-island": {
    summaryEn: "Testnet lets learners practise DeFi actions without risking real assets. The mechanics are educational, while test assets have no monetary value.",
    summaryNl: "Op testnet kunnen leerlingen DeFi-handelingen oefenen zonder echte assets te riskeren. De werking is leerzaam, terwijl testassets geen geldwaarde hebben.",
    sections: [
      {
        titleEn: "Learn through simulation",
        titleNl: "Leren door simulatie",
        bodyEn: "A quest can guide a learner through obtaining test XRP, creating a trustline, using a DEX or interacting with an AMM while explaining each transaction.",
        bodyNl: "Een quest kan iemand begeleiden bij test-XRP, een trustline, een DEX of een AMM en legt iedere transactie stap voor stap uit.",
      },
      {
        titleEn: "Mainnet is different",
        titleNl: "Mainnet is anders",
        bodyEn: "Mainnet transactions use real assets and fees. A successful testnet action does not prove that a mainnet market is safe, liquid or profitable.",
        bodyNl: "Mainnettransacties gebruiken echte assets en kosten. Een geslaagde testnetactie bewijst niet dat een mainnetmarkt veilig, liquide of winstgevend is.",
      },
      {
        titleEn: "Safety in gamification",
        titleNl: "Veiligheid in gamification",
        bodyEn: "Rewards should encourage understanding, not blind speed. A quest should require transaction review, explain risks and never promise returns.",
        bodyNl: "Beloningen moeten begrip stimuleren, niet blind tempo. Een quest moet transactiecontrole vereisen, risico's uitleggen en nooit rendement beloven.",
      },
    ],
    exampleEn: "A learner swaps two test tokens and then explains slippage and why the same action with real funds needs additional research.",
    exampleNl: "Een leerling wisselt twee testtokens en legt daarna slippage uit en waarom dezelfde actie met echt geld extra onderzoek vereist.",
    glossary: [
      { term: "Testnet", definitionEn: "A testing network whose assets have no real monetary value.", definitionNl: "Een testnetwerk waarvan de assets geen echte geldwaarde hebben." },
      { term: "DEX", definitionEn: "A decentralized exchange where orders can settle on-ledger.", definitionNl: "Een decentrale beurs waarop orders on-ledger kunnen afwikkelen." },
      { term: "AMM", definitionEn: "A pool-based automated market mechanism.", definitionNl: "Een geautomatiseerd marktmechanisme op basis van liquiditeitspools." },
    ],
  },
  "blockchain-for-business": {
    summaryEn: "A useful blockchain project starts with a real operational problem and a measurable proof trail, not with a token searching for a purpose.",
    summaryNl: "Een nuttig blockchainproject begint met een echt operationeel probleem en een meetbare proof trail, niet met een token dat nog een doel zoekt.",
    sections: [
      {
        titleEn: "Define the problem",
        titleNl: "Definieer het probleem",
        bodyEn: "Describe the current process, participants, delays, costs and trust gaps. Decide which facts genuinely benefit from shared verification.",
        bodyNl: "Beschrijf huidig proces, deelnemers, vertragingen, kosten en vertrouwensproblemen. Bepaal welke feiten echt baat hebben bij gedeelde verificatie.",
      },
      {
        titleEn: "Design the proof trail",
        titleNl: "Ontwerp de proof trail",
        bodyEn: "Map each business action to an identifier, transaction, timestamp or signed approval. Keep personal and commercially sensitive information off the public ledger.",
        bodyNl: "Koppel iedere zakelijke actie aan een identificatie, transactie, tijdstip of ondertekende goedkeuring. Houd persoonlijke en commercieel gevoelige informatie buiten de openbare ledger.",
      },
      {
        titleEn: "Governance still matters",
        titleNl: "Governance blijft nodig",
        bodyEn: "Blockchain does not replace contracts, accounting, privacy review, sanctions checks, customer support or responsibility for incorrect input.",
        bodyNl: "Blockchain vervangt geen contracten, boekhouding, privacycontrole, sanctiechecks, klantenservice of verantwoordelijkheid voor foutieve invoer.",
      },
    ],
    exampleEn: "A supplier payment workflow stores an order reference and settlement proof on-ledger while invoices and personal details remain in the company's protected systems.",
    exampleNl: "Een leveranciersbetaling bewaart orderreferentie en afwikkelingsbewijs on-ledger, terwijl facturen en persoonsgegevens in beveiligde bedrijfssystemen blijven.",
    glossary: [
      { term: "Business case", definitionEn: "A reasoned explanation of value, cost, risk and feasibility.", definitionNl: "Een onderbouwde uitleg van waarde, kosten, risico en haalbaarheid." },
      { term: "Proof trail", definitionEn: "A sequence of verifiable records showing what happened.", definitionNl: "Een reeks controleerbare gegevens die toont wat er is gebeurd." },
      { term: "Governance", definitionEn: "Rules, responsibilities and oversight around a process.", definitionNl: "Regels, verantwoordelijkheden en toezicht rond een proces." },
    ],
  },
  "decentralized-identity": {
    summaryEn: "Digital credentials should prove a limited claim with consent. They should not expose more identity or wallet history than the verifier needs.",
    summaryNl: "Digitale credentials moeten met toestemming een beperkte claim bewijzen. Ze mogen niet meer identiteit of walletgeschiedenis tonen dan een controleur nodig heeft.",
    sections: [
      {
        titleEn: "Issuer, holder and verifier",
        titleNl: "Issuer, houder en verifier",
        bodyEn: "The issuer creates a credential, the holder presents it and the verifier checks authenticity and status. Each role needs a clear trust model.",
        bodyNl: "De issuer maakt een credential, de houder toont die en de verifier controleert echtheid en status. Iedere rol heeft een duidelijk vertrouwensmodel nodig.",
      },
      {
        titleEn: "Data minimization",
        titleNl: "Dataminimalisatie",
        bodyEn: "Do not publish seed phrases, identity documents, unnecessary personal data or complete wallet histories. Share only the claim needed for the action.",
        bodyNl: "Publiceer geen seed phrases, identiteitsdocumenten, onnodige persoonsgegevens of volledige walletgeschiedenissen. Deel alleen de claim die voor de actie nodig is.",
      },
      {
        titleEn: "Wallet-linked certificates",
        titleNl: "Walletgekoppelde certificaten",
        bodyEn: "A wallet signature can prove control of the receiving account. It does not automatically prove the legal identity of the person unless a separate identity process exists.",
        bodyNl: "Een wallethandtekening kan controle over het ontvangende account bewijzen. Dit bewijst niet automatisch de juridische identiteit van de persoon zonder apart identiteitsproces.",
      },
    ],
    exampleEn: "An OTT certificate proves that an account completed a named learning path. It does not claim employment status, professional licensing or investment expertise.",
    exampleNl: "Een OTT-certificaat bewijst dat een account een genoemd leerpad heeft afgerond. Het claimt geen arbeidsstatus, beroepsvergunning of beleggingsdeskundigheid.",
    glossary: [
      { term: "Credential", definitionEn: "A verifiable claim issued to a holder.", definitionNl: "Een controleerbare claim die aan een houder is uitgegeven." },
      { term: "Consent", definitionEn: "A clear and informed agreement to share or use data.", definitionNl: "Duidelijke en geïnformeerde toestemming om gegevens te delen of gebruiken." },
      { term: "Revocation", definitionEn: "Marking a credential as no longer valid.", definitionNl: "Een credential markeren als niet langer geldig." },
    ],
  },
  "deep-dive-defi": {
    summaryEn: "XRPL DeFi combines an on-ledger order book and AMM functionality. Every mechanism carries liquidity, price, issuer and signing risks.",
    summaryNl: "XRPL DeFi combineert een on-ledger orderboek met AMM-functionaliteit. Ieder mechanisme heeft liquiditeits-, prijs-, issuer- en signingrisico's.",
    sections: [
      {
        titleEn: "Order-book trading",
        titleNl: "Handelen via orderboek",
        bodyEn: "Offers state what an account is willing to buy and sell. Execution depends on available counterparties, price limits, transfer fees and path liquidity.",
        bodyNl: "Offers geven aan wat een account wil kopen en verkopen. Uitvoering hangt af van tegenpartijen, prijslimieten, transfer fees en padliquiditeit.",
      },
      {
        titleEn: "AMM pools",
        titleNl: "AMM-pools",
        bodyEn: "An AMM holds pooled assets and calculates prices from the pool balance. Liquidity providers receive pool shares but remain exposed to price movement and pool-specific risk.",
        bodyNl: "Een AMM houdt gepoolde assets en berekent prijzen uit de poolbalans. Liquiditeitsverschaffers ontvangen poolaandelen, maar blijven blootgesteld aan prijsbewegingen en poolrisico.",
      },
      {
        titleEn: "Risk belongs with the mechanism",
        titleNl: "Risico hoort bij het mechanisme",
        bodyEn: "Review slippage, depth, issuer settings, concentration, volatility, transfer fees and the exact transaction before participating.",
        bodyNl: "Controleer slippage, diepte, issuerinstellingen, concentratie, volatiliteit, transfer fees en de exacte transactie voordat je deelneemt.",
      },
    ],
    exampleEn: "A pool advertises high activity, but most liquidity is supplied by one account. The concentration does not prove misconduct, but it raises exit and manipulation risk.",
    exampleNl: "Een pool toont veel activiteit, maar het grootste deel van de liquiditeit komt van één account. Dat bewijst geen misbruik, maar verhoogt exit- en manipulatierisico.",
    glossary: [
      { term: "Liquidity", definitionEn: "The available capacity to trade without large price impact.", definitionNl: "De beschikbare capaciteit om te handelen zonder grote prijsimpact." },
      { term: "Slippage", definitionEn: "The difference between expected and executed price.", definitionNl: "Het verschil tussen verwachte en uitgevoerde prijs." },
      { term: "Pool share", definitionEn: "A token representing a proportional AMM position.", definitionNl: "Een token dat een evenredig aandeel in een AMM vertegenwoordigt." },
    ],
  },
  "tokenization-rwa": {
    summaryEn: "A token can represent access, a certificate or a claim, but the ledger entry does not by itself create enforceable ownership of an off-chain asset.",
    summaryNl: "Een token kan toegang, een certificaat of een claim voorstellen, maar de ledgerregistratie creëert op zichzelf geen afdwingbaar eigendom van een off-chain actief.",
    sections: [
      {
        titleEn: "Define the token's meaning",
        titleNl: "Definieer de betekenis van het token",
        bodyEn: "State exactly what the token provides: access, proof, redemption, governance or another right. Avoid language that implies rights not backed by contracts and operations.",
        bodyNl: "Leg exact vast wat het token biedt: toegang, bewijs, inwisseling, governance of een ander recht. Vermijd taal die rechten suggereert zonder contractuele en operationele dekking.",
      },
      {
        titleEn: "Verify the issuer and asset",
        titleNl: "Controleer issuer en actief",
        bodyEn: "Research the issuing entity, custody, reserves, audits, legal terms, redemption process and the relationship between the token and the real asset.",
        bodyNl: "Onderzoek uitgevende entiteit, custody, reserves, audits, juridische voorwaarden, inwisselproces en de relatie tussen token en werkelijk actief.",
      },
      {
        titleEn: "Legal boundaries",
        titleNl: "Juridische grenzen",
        bodyEn: "Profit, ownership, yield and redemption promises can create regulated obligations. Product language and structure require qualified legal review.",
        bodyNl: "Beloften over winst, eigendom, rendement en inwisseling kunnen gereguleerde verplichtingen veroorzaken. Producttaal en structuur vereisen gekwalificeerde juridische controle.",
      },
    ],
    exampleEn: "An event ticket NFT can prove access to an event. It does not automatically represent a share in the organizer or a promise that its market price will rise.",
    exampleNl: "Een evenementticket-NFT kan toegang tot een evenement bewijzen. Het vertegenwoordigt niet automatisch een aandeel in de organisator of een belofte dat de marktprijs stijgt.",
    glossary: [
      { term: "RWA", definitionEn: "A token-linked real-world asset or claim.", definitionNl: "Een aan een token gekoppeld real-world actief of claim." },
      { term: "Issuer", definitionEn: "The entity or account responsible for issuing an asset.", definitionNl: "De entiteit of het account dat verantwoordelijk is voor uitgifte van een asset." },
      { term: "Redemption", definitionEn: "Exchanging a token for the promised underlying value or service.", definitionNl: "Een token inwisselen voor de beloofde onderliggende waarde of dienst." },
    ],
  },
  stablecoins: {
    summaryEn: "A stablecoin is an issued token designed to track a target value. Stability depends on the issuer, reserves, redemption terms, market liquidity and ledger controls.",
    summaryNl: "Een stablecoin is een uitgegeven token dat een doelwaarde probeert te volgen. Stabiliteit hangt af van issuer, reserves, inwisselvoorwaarden, marktliquiditeit en ledgerinstellingen.",
    sections: [
      {
        titleEn: "Issued asset structure",
        titleNl: "Structuur van een issued asset",
        bodyEn: "On XRPL an issued token is identified by its currency code and issuer account. Users normally need a trustline before holding it.",
        bodyNl: "Op XRPL wordt een issued token geïdentificeerd door valutacode en issueraccount. Gebruikers hebben normaal een trustline nodig om het te houden.",
      },
      {
        titleEn: "Issuer and redemption risk",
        titleNl: "Issuer- en inwisselrisico",
        bodyEn: "Review who holds reserves, what assets back the token, whether attestations exist, who can redeem and under which legal terms.",
        bodyNl: "Controleer wie reserves houdt, welke activa dekking geven, of attestaties bestaan, wie kan inwisselen en onder welke juridische voorwaarden.",
      },
      {
        titleEn: "Ledger controls",
        titleNl: "Ledgerinstellingen",
        bodyEn: "Issuer settings may include freeze, clawback or transfer fees. These controls may support compliance but also create counterparty dependence that must be disclosed.",
        bodyNl: "Issuerinstellingen kunnen freeze, clawback of transfer fees bevatten. Deze controles kunnen compliance ondersteunen, maar creëren ook tegenpartijafhankelijkheid die zichtbaar moet zijn.",
      },
    ],
    exampleEn: "Two tokens use the same USD code but different issuer addresses. They are separate assets with different redemption rights and risks.",
    exampleNl: "Twee tokens gebruiken dezelfde USD-code maar verschillende issueradressen. Het zijn afzonderlijke assets met andere inwisselrechten en risico's.",
    glossary: [
      { term: "Trustline", definitionEn: "An account relationship defining willingness to hold an issued asset.", definitionNl: "Een accountrelatie die bepaalt of een issued asset mag worden gehouden." },
      { term: "Clawback", definitionEn: "An enabled issuer capability to retrieve issued tokens under defined conditions.", definitionNl: "Een ingeschakelde issuerfunctie waarmee issued tokens onder voorwaarden kunnen worden teruggehaald." },
      { term: "Freeze", definitionEn: "An issuer capability that can restrict use of issued assets.", definitionNl: "Een issuerfunctie die gebruik van issued assets kan beperken." },
    ],
  },
  "defi-exchanges-lending-trading": {
    summaryEn: "Education explains mechanisms and risks. Financial advice recommends a personalized action. OTT must remain neutral and evidence-led.",
    summaryNl: "Educatie legt mechanismen en risico's uit. Financieel advies beveelt een persoonlijke actie aan. OTT moet neutraal en bewijsgericht blijven.",
    sections: [
      {
        titleEn: "Centralized and decentralized venues",
        titleNl: "Centrale en decentrale handelsplaatsen",
        bodyEn: "A custodial exchange controls assets inside its platform. A decentralized protocol may let users sign from their own wallet, but introduces smart-contract, issuer, liquidity or bridge risks.",
        bodyNl: "Een custodial exchange beheert assets binnen het platform. Een decentraal protocol kan gebruikers vanuit hun eigen wallet laten tekenen, maar introduceert smart-contract-, issuer-, liquiditeits- of bridgerisico's.",
      },
      {
        titleEn: "Lending risk",
        titleNl: "Lendingrisico",
        bodyEn: "Understand who borrows, what collateral or underwriting exists, how defaults are handled, withdrawal limits and whether returns depend on a token incentive.",
        bodyNl: "Begrijp wie leent, welk onderpand of welke kredietbeoordeling bestaat, hoe wanbetaling wordt behandeld, welke opnamelimieten gelden en of rendement van tokenincentives afhangt.",
      },
      {
        titleEn: "Neutral reporting",
        titleNl: "Neutrale rapportage",
        bodyEn: "Report observable facts, missing evidence and risk indicators. Do not promise safety, profit, recovery or a future price.",
        bodyNl: "Rapporteer waarneembare feiten, ontbrekend bewijs en risico-indicatoren. Beloof geen veiligheid, winst, herstel of toekomstige prijs.",
      },
    ],
    exampleEn: "A report can say that 74% of visible supply is held by five connected wallets. It should explain concentration risk without declaring the project fraudulent.",
    exampleNl: "Een rapport kan zeggen dat 74% van de zichtbare supply bij vijf verbonden wallets ligt. Het legt concentratierisico uit zonder het project fraude te noemen.",
    glossary: [
      { term: "Counterparty risk", definitionEn: "The risk that another party cannot or will not meet its obligations.", definitionNl: "Het risico dat een andere partij haar verplichtingen niet kan of wil nakomen." },
      { term: "Collateral", definitionEn: "Assets pledged to reduce a lender's loss if a borrower defaults.", definitionNl: "Assets die worden vastgezet om verlies bij wanbetaling te beperken." },
      { term: "Financial advice", definitionEn: "A recommendation tailored to a person's financial situation or objectives.", definitionNl: "Een aanbeveling afgestemd op iemands financiële situatie of doelen." },
    ],
  },
  "build-react": {
    summaryEn: "A safe XRPL interface explains the requested action before opening a wallet and verifies the final ledger result after the user returns.",
    summaryNl: "Een veilige XRPL-interface legt de gevraagde actie uit vóór de wallet wordt geopend en controleert het definitieve ledgerresultaat nadat de gebruiker terugkeert.",
    sections: [
      {
        titleEn: "Prepare a clear request",
        titleNl: "Bereid een duidelijk verzoek voor",
        bodyEn: "Show transaction type, destination, amount, asset, network and purpose. Generate sensitive payloads on a trusted server when secrets or business rules are involved.",
        bodyNl: "Toon transactietype, bestemming, bedrag, asset, netwerk en doel. Genereer gevoelige payloads op een vertrouwde server wanneer secrets of bedrijfsregels betrokken zijn.",
      },
      {
        titleEn: "Wallet handoff",
        titleNl: "Overdracht naar wallet",
        bodyEn: "Use the supported wallet integration and handle cancellation, expiration, mobile return and duplicate clicks. Never request a seed phrase inside the app.",
        bodyNl: "Gebruik de ondersteunde walletintegratie en behandel annulering, verlopen verzoeken, mobiele terugkeer en dubbele klikken. Vraag nooit om een seed phrase in de app.",
      },
      {
        titleEn: "Verify after signing",
        titleNl: "Controleer na ondertekening",
        bodyEn: "A signed response is not enough. Fetch the transaction from XRPL and confirm validation, result and expected fields before unlocking access or rewards.",
        bodyNl: "Een ondertekend antwoord is niet genoeg. Haal de transactie op uit XRPL en controleer validatie, resultaat en verwachte velden voordat toegang of beloning wordt vrijgegeven.",
      },
    ],
    exampleEn: "The UI creates a payment request, displays exactly what will happen, opens the wallet, then verifies the returned transaction before showing success.",
    exampleNl: "De interface maakt een betalingsverzoek, toont exact wat er gebeurt, opent de wallet en controleert daarna de teruggekomen transactie voordat succes wordt getoond.",
    glossary: [
      { term: "Payload", definitionEn: "The structured transaction or signing request sent to a wallet.", definitionNl: "Het gestructureerde transactie- of ondertekeningsverzoek voor een wallet." },
      { term: "Callback", definitionEn: "The route or event used when an external signing flow returns.", definitionNl: "De route of gebeurtenis waarmee een externe signingflow terugkeert." },
      { term: "Testnet-first", definitionEn: "Testing a new flow with valueless test assets before mainnet use.", definitionNl: "Een nieuwe flow testen met waardeloze testassets vóór gebruik op mainnet." },
    ],
  },
  "code-javascript": {
    summaryEn: "Server-side verification protects API secrets and prevents a browser from awarding itself progress, access or funds based on untrusted data.",
    summaryNl: "Server-side verificatie beschermt API-secrets en voorkomt dat een browser zichzelf voortgang, toegang of geld toekent op basis van onbetrouwbare data.",
    sections: [
      {
        titleEn: "Treat the browser as public",
        titleNl: "Behandel de browser als openbaar",
        bodyEn: "Vite variables, JavaScript bundles and network requests can be inspected. Private keys, provider secrets and administrator credentials must never be embedded in client code.",
        bodyNl: "Vite-variabelen, JavaScriptbundels en netwerkverzoeken kunnen worden bekeken. Private keys, providersecrets en beheerdersgegevens mogen nooit in clientcode staan.",
      },
      {
        titleEn: "Verify transaction fields",
        titleNl: "Controleer transactievelden",
        bodyEn: "Fetch by transaction hash and require validated status, successful result, correct type, account, destination, delivered amount and application identifier.",
        bodyNl: "Haal op via transactiehash en eis validatiestatus, succesvol resultaat, correct type, account, bestemming, geleverd bedrag en applicatie-identificatie.",
      },
      {
        titleEn: "Prevent abuse",
        titleNl: "Voorkom misbruik",
        bodyEn: "Use authentication, authorization, input validation, rate limits, allowlists and idempotent database writes. Log important decisions without logging secrets.",
        bodyNl: "Gebruik authenticatie, autorisatie, invoercontrole, rate limits, allowlists en idempotente databasewrites. Log belangrijke beslissingen zonder secrets te loggen.",
      },
    ],
    exampleEn: "The browser submits a transaction hash. The server independently checks XRPL and stores the reward only when every expected field matches.",
    exampleNl: "De browser stuurt een transactiehash. De server controleert XRPL onafhankelijk en slaat de beloning alleen op wanneer ieder verwacht veld klopt.",
    glossary: [
      { term: "Server-side", definitionEn: "Code executed in a controlled backend environment.", definitionNl: "Code die in een gecontroleerde backendomgeving wordt uitgevoerd." },
      { term: "Authorization", definitionEn: "Checking whether an authenticated user may perform an action.", definitionNl: "Controleren of een ingelogde gebruiker een actie mag uitvoeren." },
      { term: "Rate limit", definitionEn: "A restriction on how often an action can be requested.", definitionNl: "Een beperking op hoe vaak een actie kan worden aangevraagd." },
    ],
  },
  "agentic-transactions": {
    summaryEn: "An AI agent should operate inside explicit limits. It must never receive unlimited spending authority or access to wallet recovery secrets.",
    summaryNl: "Een AI-agent moet binnen expliciete limieten werken. De agent mag nooit onbeperkte bestedingsmacht of toegang tot walletherstelgeheimen krijgen.",
    sections: [
      {
        titleEn: "Pre-approved scope",
        titleNl: "Vooraf goedgekeurde scope",
        bodyEn: "Define permitted assets, destinations, amounts, networks, frequency and time windows. Everything outside the policy requires human approval.",
        bodyNl: "Definieer toegestane assets, bestemmingen, bedragen, netwerken, frequentie en tijdvensters. Alles buiten het beleid vereist menselijke goedkeuring.",
      },
      {
        titleEn: "Human control and stop",
        titleNl: "Menselijke controle en noodstop",
        bodyEn: "Provide review screens, confirmation thresholds and an immediate emergency stop. High-risk or unusual actions should always escalate to a person.",
        bodyNl: "Bied controleschermen, bevestigingsdrempels en een directe noodstop. Risicovolle of ongebruikelijke acties moeten altijd naar een mens worden geëscaleerd.",
      },
      {
        titleEn: "Audit trail",
        titleNl: "Audit trail",
        bodyEn: "Record the instruction, policy check, proposed transaction, approval, final transaction hash and result so decisions can be reconstructed and investigated.",
        bodyNl: "Registreer instructie, beleidscontrole, voorgestelde transactie, goedkeuring, definitieve transactiehash en resultaat zodat beslissingen kunnen worden gereconstrueerd.",
      },
    ],
    exampleEn: "An agent may pay an approved supplier up to 50 XRP once per month. A new destination or higher amount pauses the action for human approval.",
    exampleNl: "Een agent mag één keer per maand maximaal 50 XRP aan een goedgekeurde leverancier betalen. Een nieuwe bestemming of hoger bedrag pauzeert de actie voor menselijke goedkeuring.",
    glossary: [
      { term: "Allowlist", definitionEn: "A list of explicitly permitted accounts, assets or actions.", definitionNl: "Een lijst met expliciet toegestane accounts, assets of acties." },
      { term: "Spending limit", definitionEn: "A maximum amount an agent may authorize within a defined period.", definitionNl: "Een maximumbedrag dat een agent binnen een bepaalde periode mag goedkeuren." },
      { term: "Audit trail", definitionEn: "A chronological record of instructions, decisions and results.", definitionNl: "Een chronologisch overzicht van instructies, beslissingen en resultaten." },
    ],
  },
};
