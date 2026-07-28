export type DefiDirectoryCategory =
  | "yield"
  | "lending"
  | "dex"
  | "analytics"
  | "nft"
  | "rwa"
  | "bridge"
  | "infrastructure"
  | "xahau";

export type DefiDirectoryEntry = {
  id: string;
  name: string;
  category: DefiDirectoryCategory;
  verifiedDomain: boolean;
  status: "reviewed" | "research" | "deprecated";
  url: string;
  sourceLabel: string;
  summaryEn: string;
  summaryNl: string;
  technologyEn: string;
  technologyNl: string;
  possibleBenefitEn: string;
  possibleBenefitNl: string;
  risksEn: string[];
  risksNl: string[];
  custodyEn: string;
  custodyNl: string;
  walletEn: string;
  walletNl: string;
};

export const DEFI_DIRECTORY: DefiDirectoryEntry[] = [
  {
    id: "soil", name: "SOIL", category: "yield", verifiedDomain: true, status: "reviewed",
    url: "https://soil.co/", sourceLabel: "Official SOIL website",
    summaryEn: "Vault products connecting digital assets with institutional credit and treasury strategies, including XRPL-focused products.",
    summaryNl: "Vaultproducten die digitale assets verbinden met institutioneel krediet en treasurystrategieën, waaronder XRPL-gerichte producten.",
    technologyEn: "XRPL-facing vault interfaces combined with off-ledger legal, credit or investment structures.",
    technologyNl: "XRPL-vaultinterfaces gecombineerd met off-ledger juridische, krediet- of investeringsstructuren.",
    possibleBenefitEn: "Structured capital-use products for XRP or stablecoin holders, depending on eligibility and product terms.",
    possibleBenefitNl: "Gestructureerde kapitaalproducten voor XRP- of stablecoinhouders, afhankelijk van toegang en voorwaarden.",
    risksEn: ["Counterparty and credit risk", "Lock-up or notice periods", "Jurisdiction and product eligibility", "Custody model differs per product"],
    risksNl: ["Tegenpartij- en kredietrisico", "Lock-up- of opzegtermijnen", "Jurisdictie en producttoegang", "Custody verschilt per product"],
    custodyEn: "Product-specific; confirm who receives, holds and deploys the assets.",
    custodyNl: "Productafhankelijk; controleer wie de assets ontvangt, bewaart en inzet.",
    walletEn: "XRPL-compatible wallet where supported; an account and KYC may also be required.",
    walletNl: "XRPL-compatibele wallet waar ondersteund; account en KYC kunnen ook vereist zijn.",
  },
  {
    id: "doppler", name: "Doppler Finance", category: "yield", verifiedDomain: true, status: "reviewed",
    url: "https://docs.doppler.finance/introduction", sourceLabel: "Official Doppler documentation",
    summaryEn: "XRPfi yield and capital-use products for XRP and connected ecosystem assets.",
    summaryNl: "XRPfi-yield- en kapitaalproducten voor XRP en verbonden ecosysteemassets.",
    technologyEn: "Product-dependent vault, lending and cross-network infrastructure rather than one native XRPL primitive.",
    technologyNl: "Productafhankelijke vault-, lending- en cross-networkinfrastructuur in plaats van één native XRPL-primitive.",
    possibleBenefitEn: "Potential use of otherwise idle assets, subject to each product's real structure.",
    possibleBenefitNl: "Mogelijke inzet van anders ongebruikte assets, afhankelijk van de werkelijke productstructuur.",
    risksEn: ["Counterparty and custody risk", "Variable yield", "Protocol and integration risk", "Terms can change"],
    risksNl: ["Tegenpartij- en custodyrisico", "Variabel rendement", "Protocol- en integratierisico", "Voorwaarden kunnen veranderen"],
    custodyEn: "Review each product separately; marketing language does not determine custody.",
    custodyNl: "Controleer ieder product apart; marketingtaal bepaalt de custody niet.",
    walletEn: "Depends on the selected product, network and supported signing flow.",
    walletNl: "Hangt af van product, netwerk en ondersteunde signingflow.",
  },
  {
    id: "strobe", name: "Strobe Finance", category: "lending", verifiedDomain: true, status: "reviewed",
    url: "https://strobe.finance/", sourceLabel: "Official Strobe Finance website and documentation",
    summaryEn: "An XRPL-focused lending protocol interface for supplying assets, borrowing and monitoring positions.",
    summaryNl: "Een XRPL-gerichte lendinginterface voor het aanbieden van assets, lenen en volgen van posities.",
    technologyEn: "Smart-contract or protocol logic around collateral, borrowing, interest and liquidation, with XRPL ecosystem connectivity.",
    technologyNl: "Protocol- of smart-contractlogica rond onderpand, lenen, rente en liquidatie met XRPL-ecosysteemkoppelingen.",
    possibleBenefitEn: "Borrow or supply supported assets without using a traditional broker, where the product is available.",
    possibleBenefitNl: "Ondersteunde assets lenen of aanbieden zonder traditionele broker, waar het product beschikbaar is.",
    risksEn: ["Liquidation risk", "Oracle and protocol risk", "Variable rates", "Asset and issuer risk"],
    risksNl: ["Liquidatierisico", "Oracle- en protocolrisico", "Variabele rente", "Asset- en issuerrisico"],
    custodyEn: "Confirm whether each action is self-custodied and which contracts or accounts control supplied assets.",
    custodyNl: "Controleer per actie of deze self-custody is en welke contracten of accounts assets beheren.",
    walletEn: "Use only a supported wallet and test small amounts after reviewing the exact transaction.",
    walletNl: "Gebruik alleen een ondersteunde wallet en test klein na controle van de exacte transactie.",
  },
  {
    id: "anodos", name: "Anodos / ANODEX", category: "dex", verifiedDomain: true, status: "reviewed",
    url: "https://apps.anodos.finance/", sourceLabel: "Official Anodos applications",
    summaryEn: "Interfaces for XRPL DEX trading, liquidity and account management, including ANODEX and a Xaman xApp.",
    summaryNl: "Interfaces voor XRPL DEX-handel, liquiditeit en accountbeheer, waaronder ANODEX en een Xaman-xApp.",
    technologyEn: "Uses XRPL native order books, issued currencies and liquidity functionality through a non-custodial interface.",
    technologyNl: "Gebruikt native XRPL-orderboeken, issued currencies en liquiditeitsfuncties via een non-custodial interface.",
    possibleBenefitEn: "Direct access to XRPL trading and liquidity without transferring ownership to a central exchange.",
    possibleBenefitNl: "Directe XRPL-handel en liquiditeit zonder eigendom aan een centrale exchange over te dragen.",
    risksEn: ["Token and issuer risk", "Slippage and thin liquidity", "Wrong trustline or asset", "Signing mistakes"],
    risksNl: ["Token- en issuerrisico", "Slippage en lage liquiditeit", "Verkeerde trustline of asset", "Signingfouten"],
    custodyEn: "The connected wallet signs the on-ledger transaction.", custodyNl: "De gekoppelde wallet ondertekent de on-ledger transactie.",
    walletEn: "Compatible XRPL wallet; exact support depends on the selected application.", walletNl: "Compatibele XRPL-wallet; exacte ondersteuning hangt af van de gekozen applicatie.",
  },
  {
    id: "xpmarket", name: "XPMarket", category: "dex", verifiedDomain: true, status: "reviewed",
    url: "https://xpmarket.com/", sourceLabel: "Official XPMarket website",
    summaryEn: "XRPL token discovery, DEX and AMM trading, NFT markets, launch tooling and ecosystem analytics.",
    summaryNl: "XRPL-tokenontdekking, DEX- en AMM-handel, NFT-markten, launchtools en ecosysteemanalyse.",
    technologyEn: "Interfaces with the XRPL native DEX, AMM, issued assets and XLS-20 NFT functionality.",
    technologyNl: "Werkt met native XRPL DEX, AMM, issued assets en XLS-20 NFT-functionaliteit.",
    possibleBenefitEn: "Research and on-ledger actions in one interface.", possibleBenefitNl: "Onderzoek en on-ledger acties in één interface.",
    risksEn: ["Market and token risk", "Liquidity and price impact", "Unverified issuers", "Phishing clones"],
    risksNl: ["Markt- en tokenrisico", "Liquiditeit en prijsimpact", "Ongeverifieerde issuers", "Phishingkopieën"],
    custodyEn: "Native trading is wallet-signed; inspect each connected service separately.", custodyNl: "Native handel wordt door de wallet ondertekend; controleer gekoppelde diensten apart.",
    walletEn: "Supported XRPL wallet; inspect every field before signing.", walletNl: "Ondersteunde XRPL-wallet; controleer ieder veld vóór ondertekening.",
  },
  {
    id: "sologenic", name: "Sologenic", category: "dex", verifiedDomain: true, status: "reviewed",
    url: "https://sologenic.org/", sourceLabel: "Official Sologenic website",
    summaryEn: "XRPL ecosystem interfaces for DEX, AMM, swap, NFT, bridge and token-management functions.",
    summaryNl: "XRPL-ecosysteeminterfaces voor DEX, AMM, swap, NFT, bridge en tokenbeheer.",
    technologyEn: "Combines native XRPL functions with additional bridge and application services.", technologyNl: "Combineert native XRPL-functies met aanvullende bridge- en applicatiediensten.",
    possibleBenefitEn: "Several XRPL market and tokenization activities in one ecosystem.", possibleBenefitNl: "Meerdere XRPL-markt- en tokenisatieactiviteiten in één ecosysteem.",
    risksEn: ["Bridge and cross-chain risk", "Issuer and token risk", "Liquidity risk", "Service-specific terms"],
    risksNl: ["Bridge- en cross-chainrisico", "Issuer- en tokenrisico", "Liquiditeitsrisico", "Dienstspecifieke voorwaarden"],
    custodyEn: "Native DEX actions can be self-custodied; bridge and fiat services need separate review.", custodyNl: "Native DEX-acties kunnen self-custody zijn; bridge- en fiatdiensten vereisen aparte controle.",
    walletEn: "Supported XRPL wallet for native actions; other networks may require another wallet.", walletNl: "Ondersteunde XRPL-wallet voor native acties; andere netwerken kunnen een andere wallet vereisen.",
  },
  {
    id: "gatehub", name: "GateHub", category: "dex", verifiedDomain: true, status: "reviewed",
    url: "https://gatehub.net/", sourceLabel: "Official GateHub website",
    summaryEn: "A hosted wallet and gateway platform with access to XRPL payments, issued assets and the native DEX.",
    summaryNl: "Een hosted wallet- en gatewayplatform met toegang tot XRPL-betalingen, issued assets en de native DEX.",
    technologyEn: "Combines an account service and gateway functions with native XRPL order-book transactions.",
    technologyNl: "Combineert een accountdienst en gatewayfuncties met native XRPL-orderboektransacties.",
    possibleBenefitEn: "A guided interface for payments, assets and XRPL trading.", possibleBenefitNl: "Een begeleide interface voor betalingen, assets en XRPL-handel.",
    risksEn: ["Hosted-account and custody model", "Gateway and issuer risk", "Account-security risk", "Jurisdiction and service terms"],
    risksNl: ["Hosted-account- en custody-model", "Gateway- en issuerrisico", "Accountbeveiligingsrisico", "Jurisdictie en voorwaarden"],
    custodyEn: "Do not assume the same custody model as a self-custody extension; review GateHub's account terms.", custodyNl: "Ga niet uit van hetzelfde model als een self-custodyextensie; controleer de accountvoorwaarden.",
    walletEn: "Uses the GateHub account experience; external wallet compatibility depends on the feature.", walletNl: "Gebruikt de GateHub-accountervaring; externe walletcompatibiliteit verschilt per functie.",
  },
  {
    id: "moai", name: "Moai Finance", category: "bridge", verifiedDomain: true, status: "reviewed",
    url: "https://docs.moai-finance.xyz/", sourceLabel: "Official Moai Finance documentation",
    summaryEn: "Multi-chain liquidity, swapping and bridge-oriented tooling connected to XRP ecosystem assets.",
    summaryNl: "Multi-chain liquiditeits-, swap- en bridgetools rond assets uit het XRP-ecosysteem.",
    technologyEn: "Cross-chain contracts, routing and liquidity pools outside the native XRPL trust model.",
    technologyNl: "Cross-chaincontracten, routing en liquiditeitspools buiten het native XRPL-vertrouwensmodel.",
    possibleBenefitEn: "Move or use supported assets across connected networks.", possibleBenefitNl: "Ondersteunde assets over verbonden netwerken verplaatsen of gebruiken.",
    risksEn: ["Bridge exploit risk", "Smart-contract risk", "Wrapped-asset risk", "Gas, routing and finality differences"],
    risksNl: ["Bridge-exploitrisico", "Smart-contractrisico", "Wrapped-assetrisico", "Verschillen in gas, routing en finaliteit"],
    custodyEn: "Cross-chain components can introduce contracts and intermediaries beyond the XRPL account.", custodyNl: "Cross-chaincomponenten kunnen contracten en tussenlagen buiten het XRPL-account toevoegen.",
    walletEn: "May require different wallets and native gas assets for each connected chain.", walletNl: "Kan per gekoppelde chain andere wallets en native gasassets vereisen.",
  },
  {
    id: "xrplto", name: "XRPL.to", category: "analytics", verifiedDomain: true, status: "reviewed",
    url: "https://xrpl.to/", sourceLabel: "Official XRPL.to website",
    summaryEn: "XRPL market, token, DEX and NFT discovery with public ledger analytics.", summaryNl: "XRPL-markt-, token-, DEX- en NFT-ontdekking met openbare ledgeranalyse.",
    technologyEn: "Indexes public XRPL data and presents market and account-derived metrics.", technologyNl: "Indexeert openbare XRPL-data en presenteert markt- en accountstatistieken.",
    possibleBenefitEn: "Faster comparison of public asset and market information before signing elsewhere.", possibleBenefitNl: "Sneller openbare asset- en marktinformatie vergelijken vóór ondertekening elders.",
    risksEn: ["Indexer or methodology differences", "Delayed data", "Token identity confusion", "Metrics are not guarantees"],
    risksNl: ["Verschillen in indexer of methode", "Vertraagde data", "Verwarring rond tokenidentiteit", "Statistieken zijn geen garanties"],
    custodyEn: "Basic research is read-only and does not require custody.", custodyNl: "Basisonderzoek is alleen-lezen en vereist geen custody.",
    walletEn: "No wallet needed for research; connected actions need separate review.", walletNl: "Geen wallet nodig voor onderzoek; gekoppelde acties vereisen aparte controle.",
  },
  {
    id: "xrplfi", name: "XRPL.fi", category: "analytics", verifiedDomain: true, status: "reviewed",
    url: "https://xrpl.fi/", sourceLabel: "Official XRPL.fi website",
    summaryEn: "Analytics and discovery for XRPL assets, stablecoins, DEX activity and real-world-asset themes.",
    summaryNl: "Analyse en ontdekking voor XRPL-assets, stablecoins, DEX-activiteit en real-world-assetthema's.",
    technologyEn: "A data and interpretation layer built from public XRPL and project information.", technologyNl: "Een data- en interpretatielaag op basis van openbare XRPL- en projectinformatie.",
    possibleBenefitEn: "Research context across token, issuer and market categories.", possibleBenefitNl: "Onderzoekscontext over token-, issuer- en marktcategorieën.",
    risksEn: ["Data-source coverage", "Classification and methodology", "Issuer information can change", "Not investment advice"],
    risksNl: ["Dekking van databronnen", "Classificatie en methodologie", "Issuerinformatie kan veranderen", "Geen beleggingsadvies"],
    custodyEn: "Read-only research unless a separate action explicitly requests a wallet.", custodyNl: "Alleen-lezen onderzoek tenzij een aparte actie expliciet een wallet vraagt.",
    walletEn: "Not required for normal research.", walletNl: "Niet nodig voor normaal onderzoek.",
  },
  {
    id: "bithomp", name: "Bithomp", category: "infrastructure", verifiedDomain: true, status: "reviewed",
    url: "https://bithomp.com/", sourceLabel: "Official Bithomp explorer and API",
    summaryEn: "XRPL explorer, account tools and API services for public transaction and object inspection.",
    summaryNl: "XRPL-explorer, accounttools en API-diensten voor openbare transacties en objecten.",
    technologyEn: "Indexes and presents validated XRPL ledger data through explorer and API interfaces.", technologyNl: "Indexeert en presenteert gevalideerde XRPL-ledgerdata via explorer- en API-interfaces.",
    possibleBenefitEn: "Independent verification of transactions, NFTs, account objects and history.", possibleBenefitNl: "Onafhankelijke verificatie van transacties, NFT's, accountobjecten en historie.",
    risksEn: ["Indexer availability", "Human interpretation errors", "Public-address privacy", "Third-party links"],
    risksNl: ["Beschikbaarheid van indexer", "Menselijke interpretatiefouten", "Privacy van openbare adressen", "Links van derden"],
    custodyEn: "Explorer use is read-only; never enter a seed or private key.", custodyNl: "Explorergebruik is alleen-lezen; voer nooit seed of private key in.",
    walletEn: "No wallet required for public verification.", walletNl: "Geen wallet nodig voor openbare verificatie.",
  },
  {
    id: "onthedex", name: "OnTheDEX.live", category: "analytics", verifiedDomain: true, status: "reviewed",
    url: "https://onthedex.live/", sourceLabel: "Official OnTheDEX.live website",
    summaryEn: "XRPL token activity, prices, pairs, seller analysis, portfolio views and API data.", summaryNl: "XRPL-tokenactiviteit, prijzen, paren, verkopersanalyse, portfolioweergaven en API-data.",
    technologyEn: "Indexes public XRPL DEX data; analytics are an interpretation layer above raw ledger records.", technologyNl: "Indexeert openbare XRPL DEX-data; analyse is een interpretatielaag boven ruwe ledgerrecords.",
    possibleBenefitEn: "Market observations and historical context before signing elsewhere.", possibleBenefitNl: "Marktobservaties en historische context vóór ondertekening elders.",
    risksEn: ["Indexer completeness", "Metric methodology", "Delayed or sampled data", "Analytics do not predict outcomes"],
    risksNl: ["Volledigheid van indexer", "Methodologie", "Vertraagde of gesamplede data", "Analyse voorspelt geen uitkomsten"],
    custodyEn: "Analytics use is read-only; public addresses may be used for portfolio views.", custodyNl: "Analyse is alleen-lezen; openbare adressen kunnen voor portfolio's worden gebruikt.",
    walletEn: "Not required for basic research.", walletNl: "Niet nodig voor basisonderzoek.",
  },
  {
    id: "xrpcafe", name: "XRP Café", category: "nft", verifiedDomain: true, status: "reviewed",
    url: "https://xrp.cafe/", sourceLabel: "Official XRP Café website",
    summaryEn: "XRPL-native NFT marketplace and creator tooling around XLS-20 NFTs.", summaryNl: "XRPL-native NFT-marktplaats en creatortools rond XLS-20 NFT's.",
    technologyEn: "Uses native XRPL mint, offer and transfer functions with external metadata and indexing.", technologyNl: "Gebruikt native XRPL-mint-, offer- en transferfuncties met externe metadata en indexering.",
    possibleBenefitEn: "Create, discover and trade native XRPL NFTs.", possibleBenefitNl: "Native XRPL-NFT's maken, ontdekken en verhandelen.",
    risksEn: ["Collection authenticity", "Metadata permanence", "Thin markets", "Marketplace terms"],
    risksNl: ["Authenticiteit van collecties", "Bestendigheid van metadata", "Dunne markten", "Marktplaatsvoorwaarden"],
    custodyEn: "NFT actions are wallet-signed; metadata and marketplace services remain external dependencies.", custodyNl: "NFT-acties worden door de wallet ondertekend; metadata en marktplaatsdiensten blijven externe afhankelijkheden.",
    walletEn: "XRPL wallet with XLS-20 support.", walletNl: "XRPL-wallet met XLS-20-ondersteuning.",
  },
  {
    id: "archax", name: "Archax", category: "rwa", verifiedDomain: true, status: "reviewed",
    url: "https://archax.com/", sourceLabel: "Official Archax website",
    summaryEn: "A regulated digital-asset and tokenization business working with institutional and real-world-asset products, including XRPL collaborations.",
    summaryNl: "Een gereguleerd digital-asset- en tokenisatiebedrijf voor institutionele en real-world-assetproducten, inclusief XRPL-samenwerkingen.",
    technologyEn: "Regulated issuance, custody, market and tokenization infrastructure linked to legal off-ledger rights.",
    technologyNl: "Gereguleerde uitgifte-, custody-, markt- en tokenisatie-infrastructuur gekoppeld aan juridische off-ledger rechten.",
    possibleBenefitEn: "Institutional access and tokenized representation of eligible assets.", possibleBenefitNl: "Institutionele toegang en getokeniseerde representatie van toegestane assets.",
    risksEn: ["Eligibility and KYC", "Legal-right and issuer risk", "Market liquidity", "Custody and jurisdiction"],
    risksNl: ["Toegang en KYC", "Juridisch recht en issuerrisico", "Marktliquiditeit", "Custody en jurisdictie"],
    custodyEn: "Regulated custody and product terms can differ from self-custodied XRPL tokens.", custodyNl: "Gereguleerde custody en productvoorwaarden kunnen afwijken van self-custodied XRPL-tokens.",
    walletEn: "Product-specific; institutional onboarding may be required.", walletNl: "Productafhankelijk; institutionele onboarding kan vereist zijn.",
  },
  {
    id: "xahau-ecosystem", name: "Xahau Ecosystem", category: "xahau", verifiedDomain: true, status: "reviewed",
    url: "https://xahau.network/", sourceLabel: "Official Xahau network website",
    summaryEn: "A smart-contract sidechain ecosystem using Hooks for programmable ledger logic and ecosystem applications.",
    summaryNl: "Een smart-contract-sidechainecosysteem met Hooks voor programmeerbare ledgerlogica en applicaties.",
    technologyEn: "XRPL-derived ledger technology with Hooks and XAH as the network asset.", technologyNl: "Van XRPL afgeleide ledgertechnologie met Hooks en XAH als netwerkasset.",
    possibleBenefitEn: "Programmable on-ledger workflows and experimentation beyond standard XRPL transaction types.", possibleBenefitNl: "Programmeerbare on-ledger workflows en experimenten naast standaard XRPL-transactietypes.",
    risksEn: ["Different network and asset", "Hook code risk", "Early ecosystem liquidity", "Wallet/network confusion"],
    risksNl: ["Ander netwerk en andere asset", "Hook-coderisico", "Vroege ecosysteemliquiditeit", "Wallet- en netwerkverwarring"],
    custodyEn: "Self-custody depends on the selected Xahau wallet and application.", custodyNl: "Self-custody hangt af van de gekozen Xahau-wallet en applicatie.",
    walletEn: "Use a wallet that explicitly supports Xahau and verify the selected network.", walletNl: "Gebruik een wallet die Xahau expliciet ondersteunt en controleer het netwerk.",
  },
  {
    id: "xmagnetic-review", name: "xMagnetic", category: "dex", verifiedDomain: false, status: "research",
    url: "", sourceLabel: "Official-domain verification pending",
    summaryEn: "A known XRPL DeFi name, but conflicting domains and claims require manual verification before OTT links users out.",
    summaryNl: "Een bekende XRPL DeFi-naam, maar conflicterende domeinen en claims vereisen handmatige verificatie voordat OTT doorlinkt.",
    technologyEn: "Reported DEX, AMM, farming, NFT and token functions; each claim needs an independently verified official source.",
    technologyNl: "Gerapporteerde DEX-, AMM-, farming-, NFT- en tokenfuncties; elke claim vereist een onafhankelijk geverifieerde bron.",
    possibleBenefitEn: "Potentially broad tooling after source verification.", possibleBenefitNl: "Mogelijk brede tools na bronverificatie.",
    risksEn: ["Conflicting domains", "Phishing and clone risk", "Unverified claims", "Wallet-signing risk"],
    risksNl: ["Conflicterende domeinen", "Phishing- en kopierisico", "Ongeverifieerde claims", "Wallet-signingrisico"],
    custodyEn: "Not assessed until the official product source is verified.", custodyNl: "Niet beoordeeld totdat de officiële productbron is geverifieerd.",
    walletEn: "Do not connect through an unverified domain.", walletNl: "Koppel geen wallet via een niet-geverifieerd domein.",
  },
  {
    id: "onexah-review", name: "OneXAH", category: "xahau", verifiedDomain: false, status: "research",
    url: "", sourceLabel: "Official product documentation pending",
    summaryEn: "A developing Xahau DeFi concept associated with Hooks-based logic; OTT withholds links until official documentation is confirmed.",
    summaryNl: "Een ontwikkelend Xahau DeFi-concept rond Hooks; OTT houdt links tegen tot officiële documentatie is bevestigd.",
    technologyEn: "Reported Hooks and liquidity mechanisms; production state and controls require verification.", technologyNl: "Gerapporteerde Hooks- en liquiditeitsmechanismen; productiestatus en controles vereisen verificatie.",
    possibleBenefitEn: "Potential programmable Xahau workflows after technical review.", possibleBenefitNl: "Mogelijke programmeerbare Xahau-workflows na technische controle.",
    risksEn: ["Early-stage risk", "Hook code risk", "Liquidity risk", "Incomplete documentation"],
    risksNl: ["Vroeg stadium", "Hook-coderisico", "Liquiditeitsrisico", "Onvolledige documentatie"],
    custodyEn: "Not assessed until official transaction documentation is available.", custodyNl: "Niet beoordeeld totdat officiële transactiedocumentatie beschikbaar is.",
    walletEn: "Do not sign until network, Hook and destination are independently verified.", walletNl: "Onderteken niet totdat netwerk, Hook en bestemming onafhankelijk zijn gecontroleerd.",
  },
];
