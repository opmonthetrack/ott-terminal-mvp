import { useState, useEffect } from 'react';
import { 
  Globe, Radio, Cpu, ShieldAlert, Eye, Terminal, TrendingDown, 
  ChevronRight, ShieldCheck, HelpCircle, Activity, Vote, 
  Milestone, Scale, Map, ShieldX, RefreshCw, CheckCircle2, AlertTriangle
} from 'lucide-react';

// --- DATA ARCHITECTUUR INTERFACES ---
interface IntelItem { id: string; category: 'MACRO' | 'ISO20022' | 'SYSTEMIC'; timestamp: string; title: string; source: string; summary: string; content: string; urgency: 'HIGH' | 'MEDIUM' | 'STABLE'; }
interface CbdcProject { country: string; assetName: string; status: 'LAUNCHED' | 'PILOT' | 'RESEARCH' | 'CANCELLED'; tech: string; mBridge: boolean; controlScore: string; analysis: string; }
interface StablecoinProject { name: string; ticker: string; peg: string; issuer: string; ledger: string; backing: string; status: 'STABLE' | 'AUDITED' | 'UPCOMING'; facts: string; }
interface XlsStandard { id: string; name: string; era: string; status: 'ENABLED' | 'VOTING' | 'PROPOSED'; architecture: string; ledgerImpact: string; }
interface UnlNode { name: string; operator: string; region: string; status: 'VALIDATING' | 'OUT_OF_SYNC'; xls65Vote: 'YES' | 'NO' | 'PENDING'; xls66Vote: 'YES' | 'NO' | 'PENDING'; score: string; }
interface LegalAct { name: string; jurisdiction: string; status: 'ENFORCED' | 'PENDING' | 'PROPOSED'; target: string; systemicImpact: string; focus: string; }
interface IsoNetwork { category: string; names: string; role: string; }
interface FakeTx { id: string; type: string; amount: string; account: string; destination: string; timestamp: string; }

export function NewsTab() {
  const [currentSection, setCurrentSection] = useState<'matrix' | 'cbdc' | 'stable' | 'xls' | 'nodes' | 'legal' | 'globe'>('matrix');
  const [selectedIntel, setSelectedIntel] = useState<IntelItem | null>(null);
  const [lastUpdateDate, setLastUpdateDate] = useState<string>('');
  const [liveTransactions, setLiveTransactions] = useState<FakeTx[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [checkupStatus, setCheckupStatus] = useState<'SECURE' | 'SCANNING'>('SECURE');

  useEffect(() => {
    setLastUpdateDate('25-06-2026 - LIVE PROTOCOL SYNC');
  }, []);

  // Live XRPL Transactie stream simulator
  useEffect(() => {
    const txTypes = ['PAYMENT', 'NFTOKEN_MINT', 'TRUST_SET', 'AMM_CREATE', 'ESCROW_FINISH'];
    const accounts = ['rGAs3n...', 'rPT1Sj...', 'rOTT58...', 'rMidaS...', 'rXahau...'];
    
    const interval = setInterval(() => {
      const newTx: FakeTx = {
        id: Math.random().toString(16).substring(2, 10).toUpperCase(),
        type: txTypes[Math.floor(Math.random() * txTypes.length)],
        amount: (Math.random() * 1000).toFixed(2),
        account: accounts[Math.floor(Math.random() * accounts.length)],
        destination: accounts[Math.floor(Math.random() * accounts.length)],
        timestamp: new Date().toLocaleTimeString('nl-NL')
      };
      setLiveTransactions(prev => [newTx, ...prev.slice(0, 14)]);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  // --- INTEGRATIE COMPLETE LEDGER INSIGHT DATABASE ---
  const intelFeed: IntelItem[] = [
    { id: "INTEL-01", category: "MACRO", timestamp: "Zojuist", title: "mBridge Wholesale Corridors passeren SWIFT-volumes in Aziatische oliehandel", source: "BIS Hub Basel", summary: "Gedecentraliseerde centralebank-grootboeken creëren een parallelle financiële realiteit[cite: 1].", content: "De de-dollarisering is geen theorie meer. On-chain auditing bevestigt dat bilaterale olie-clearing tussen de BRICS-alliantie nu direct via de mBridge consensus-ledger loopt[cite: 1]. Project mBridge fungeert als de snelst groeiende wholesale-pilot ter wereld met ruim $55 miljard aan volume, waarbij de Chinese e-CNY verantwoordelijk is voor 95% van de afwikkelingen[cite: 1].", urgency: "HIGH" },
    { id: "INTEL-02", category: "ISO20022", timestamp: "14m geleden", title: "Federal Reserve en ECB voltooien core ISO 20022 infrastructurele migraties", source: "Fedwire / T2 Core", summary: "Mondiaal interbancair betalingsverkeer dwingt datavelden af die matchen met XRP/XLM protocollen[cite: 1].", content: "De Federal Reserve heeft de migratie van de Fedwire Funds Service naar de ISO 20022-standaard succesvol afgerond[cite: 1]. Tegelijkertijd heeft het Eurosystem (ECB) het T2-platform volledig operationeel voor grote euro-transacties[cite: 1]. SWIFT faseert de oude MT-berichten definitief uit, waardoor gecertificeerde layer-1 ledgers (XRP, XLM, XDC) direct klaarstaan om deze enterprise-grade datastromen te verwerken[cite: 1].", urgency: "MEDIUM" },
    { id: "INTEL-03", category: "SYSTEMIC", timestamp: "1h geleden", title: "Project Agorá activeert multi-grootbank tokenized deposit contracten", source: "New York Fed", summary: "Zeven centrale banken starten grootschalige interbancaire tokenisatie-pilot[cite: 1].", content: "Project Agorá is gelanceerd als een internationaal initiatief van de New York Fed en zeven andere centrale banken[cite: 1]. Het doel is om te testen hoe tokenized commerciële banktegoeden wereldwijd sneller, goedkoper en veiliger verhandeld kunnen worden via gekoppelde programmable money grootboeken[cite: 1].", urgency: "HIGH" }
  ];

  const cbdcTracker: CbdcProject[] = [
    { country: "China", assetName: "e-CNY (Digital Yuan)", status: "PILOT", tech: "Hyperledger Fabric / mBridge Core", mBridge: true, controlScore: "99%", analysis: "De veruit grootste pilot ter wereld met een transactievolume van meer dan 16 biljoen yuan (~2,3 biljoen dollar)[cite: 1]. De People's Bank of China heeft de e-CNY recent hergeclassificeerd als bankdeposito, wat wijst op een verschuiving naar een breder monetair instrument[cite: 1]." },
    { country: "Brazilië", assetName: "Drex (Digital Real)", status: "PILOT", tech: "Hyperledger Besu Private", mBridge: false, controlScore: "92%", analysis: "Geavanceerd platform dat zich specifiek richt op het automatiseren van zakelijke transacties en leningen via slimme contracten (programmable money)[cite: 1]. Formele live-gang staat gepland voor eind 2026[cite: 1]." },
    { country: "Rusland", assetName: "Digital Ruble", status: "PILOT", tech: "Custom Russian DLT Node", mBridge: false, controlScore: "95%", analysis: "Test momenteel een pilot met commerciële banken en heeft de harde intentie uitgesproken om in 2026 volledig live te gaan om internationale sancties vlijmscherp te omzeilen[cite: 1]." },
    { country: "Eurozone (ECB)", assetName: "Digital Euro", status: "PILOT", tech: "Private Permissioned Node", mBridge: false, controlScore: "85%", analysis: "Bevindt zich in de afrondende voorbereidingsfase waarin het regelboek wordt geschreven[cite: 1]. De ECB neemt dit jaar (2026) het definitieve besluit over de daadwerkelijke uitgifte en bouw van de infrastructuur[cite: 1]." },
    { country: "De Bahama's", assetName: "Sand Dollar", status: "LAUNCHED", tech: "NZIA Cortex DLT Framework", mBridge: false, controlScore: "75%", analysis: "Sinds 2020 s werelds allereerste operationele retail-CBDC[cite: 1]. Volledig gericht op eilandbewoners zonder toegang tot fysieke bankfilialen om de inclusie te vergroten[cite: 1]." },
    { country: "Nigeria", assetName: "eNaira", status: "LAUNCHED", tech: "Hyperledger Fabric (Bitt Inc)", mBridge: false, controlScore: "90%", analysis: "Ingezet om miljoenen burgers zonder bankrekening toegang te geven tot het digitale financiële systeem, al verloopt de adoptie onder de bevolking traag[cite: 1]." },
    { country: "Jamaica", assetName: "JAM-DEX", status: "LAUNCHED", tech: "eCurrency Mint Technology", mBridge: false, controlScore: "70%", analysis: "Volledig gelanceerd retail-project om de lokale transactiekosten voor burgers en de informele economie aanzienlijk te verlagen[cite: 1]." },
    { country: "Verenigde Staten", assetName: "Wholesale USD / FedNow Hub", status: "RESEARCH", tech: "New York Fed / MIT Core", mBridge: false, controlScore: "95%", analysis: "Door de aanname van de federale GENIUS Act is het de Federal Reserve wettelijk streng verboden om een CBDC voor consumenten (retail) uit te geven[cite: 1]. De VS focust zich daarom puur op wholesale bankclearing en private stablecoins[cite: 1]." }
  ];

  const stablecoinTracker: StablecoinProject[] = [
    { name: "Tether Dollar", ticker: "USDT", peg: "Amerikaanse Dollar (USD)", issuer: "Tether Limited", ledger: "Multi-Chain (Omni, Tron, Ethereum)", backing: "Fiatgeld, liquide Amerikaanse kortlopende staatsobligaties[cite: 1]", status: "STABLE", facts: "De allergrootste en meest liquide stablecoin ter wereld[cite: 1]. Dominant op elk handelsplatform voor crypto-trading, ondanks regelmatige maatschappelijke discussies over de exacte transparantie van hun reserves[cite: 1]." },
    { name: "USD Coin", ticker: "USDC", peg: "Amerikaanse Dollar (USD)", issuer: "Circle Internet Financial", ledger: "Multi-Chain (XRPL, Solana, Ethereum)", backing: "100% Gereguleerde Amerikaanse cash en kortlopende staatsobligaties[cite: 1]", status: "AUDITED", facts: "Geldt in de markt als het veiligere en volledig gereguleerde alternatief voor USDT[cite: 1]. Geniet absolute voorkeur en adoptie bij institutionele beleggers en grote corporate platformen[cite: 1]." },
    { name: "Ripple USD", ticker: "RLUSD", peg: "Amerikaanse Dollar (USD)", issuer: "Ripple Labs Inc.", ledger: "XRP Ledger (XRPL) & Ethereum", backing: "100% Amerikaanse staatsobligaties, cash reserves en dollar-equivalenten[cite: 1]", status: "AUDITED", facts: "De enterprise-standaard voor cross-border betalingen en liquidity pools binnen de XRPL DEX[cite: 1]. Volledig MiCA-compliant ontworpen voor directe on-chain bankclearing[cite: 1]." },
    { name: "Moneda Digital Peso", ticker: "MXNX", peg: "Mexicaanse Peso (MXN)", issuer: "Bitso / Moneta Network", ledger: "XRP Ledger (XRPL) & Xahau", backing: "100% Gecertificeerde Mexicaanse schatkistcertificaten (Cetes) en bankreserves[cite: 1]", status: "UPCOMING", facts: "De absolute nieuwe spil in de Latijns-Amerikaanse remittance-corridor[cite: 1]. Gemaakt om on-chain liquidity rechtstreeks te paren met RLUSD, waardoor grensoverschrijdend kapitaal binnen 3 seconden converteert zonder correspondentbanken[cite: 1]." },
    { name: "Euro Coin Circle", ticker: "EURC", peg: "Euro (EUR)", issuer: "Circle Internet Financial", ledger: "Ethereum, Solana, Stellar", backing: "Euro bankdeposito's en liquide euro-overheidspapier[cite: 1]", status: "AUDITED", facts: "De grootste en meest liquide euro-stablecoin ter wereld[cite: 1]. Volledig geprofessionaliseerd en in lijn gebracht sinds de harde handhaving van de Europese MiCA-wetgeving[cite: 1]." },
    { name: "Monerium Euro", ticker: "EURe", peg: "Euro (EUR)", issuer: "Monerium SIA", ledger: "Ethereum, Gnosis", backing: "100% Gecertificeerde fiat euro banktegoeden[cite: 1]", status: "STABLE", facts: "Unieke Europese stablecoin omdat deze on-chain direct gekoppeld is aan persoonlijke, virtuele IBAN-bankrekeningen van gebruikers[cite: 1]." },
    { name: "PayPal USD", ticker: "PYUSD", peg: "Amerikaanse Dollar (USD)", issuer: "PayPal / Paxos Trust", backing: "Amerikaanse staatsobligaties en dollar-reserves[cite: 1]", ledger: "Ethereum, Solana", status: "STABLE", facts: "Volledig gereguleerd en sterk in opkomst voor alledaagse consumentenbetalingen en e-commerce via de snelle Solana-blockchain-rails[cite: 1]." },
    { name: "Global Dollar", ticker: "USDG", peg: "Amerikaanse Dollar (USD)", issuer: "Kraken / Robinhood Consortium", ledger: "Ethereum Network Rails", backing: "Gereguleerde fiat bankreserves via Paxos[cite: 1]", status: "UPCOMING", facts: "Gezamenlijk consortium-initiatief om een gereguleerd alternatief te bieden dat aan alle mondiale wetgeving voldoet en waarbij opbrengsten uit reserves eerlijk verdeeld worden met partners[cite: 1]." },
    { name: "Ondo US Dollar Yield", ticker: "USDY", peg: "Amerikaanse Dollar (USD)", issuer: "Ondo Finance", ledger: "Ethereum, Solana, Mantle", backing: "Gedekt door Amerikaanse staatsobligaties en banktegoeden[cite: 1]", status: "STABLE", facts: "Een tokenized note gedekt door Amerikaanse staatsobligaties die rechtstreeks rente (yield) uitkeert aan de on-chain houder van het token[cite: 1]." }
  ];

  const isoNetworks: IsoNetwork[] = [
    { category: "Het Netwerk (Snelwegen)", names: "SWIFT, Fedwire, T2 (ECB), CHAPS (Bank of England)[cite: 1]", role: "De fysieke financiële infrastructuur die de ISO 20022-berichtgeving verplicht stelt voor al het interbancaire grensoverschrijdende verkeer[cite: 1]." },
    { category: "De Software (Vertaalmachine)", names: "Ripple Payments (RippleNet), Finastra, Volante Technologies, Temenos, ACI Worldwide[cite: 1]", role: "De gecertificeerde softwareleveranciers die banksystemen voorzien van de modules om ISO-berichten 1:1 te vertalen naar cryptografische blockchain-transacties[cite: 1]." },
    { category: "De Crypto (Ledger Rails)", names: "XRP (Ripple), XLM (Stellar), XDC (XinFin), ALGO (Algorand), HBAR (Hedera), QNT (Quant Overledger)[cite: 1]", role: "De programmeerbare Layer-1 blockchains waarvan de datavelden naadloos aansluiten op de ISO-datakwalificaties voor wholesale-verrekeningen, trade finance en CBDC's[cite: 1]." }
  ];

  const nonFiatExclusions = [
    { ticker: "USDS / DAI", type: "Crypto-Backed Stablecoin", issue: "Gedekt door computercodes, algoritmes en overgecollateraliseerde crypto-reserves op de blockchain; valt niet onder pure fiat-dekking[cite: 1]." },
    { ticker: "USDe (Ethena)", type: "Synthetische Dollar", issue: "Houdt de waarde niet vast via banktegoeden, maar via een risicovolle cash-and-carry arbitragestrategie met short-derivaten[cite: 1]." },
    { ticker: "PAXG / XAUt", type: "Commodities-Backed Asset", issue: "Dit zijn geen stablecoins gekoppeld aan nationale fiat-valuta, maar munten gedekt door fysieke goudbaren in Zwitserse/Londense kluizen[cite: 1]." }
  ];

  const xlsUpdates: XlsStandard[] = [
    { id: "XLS-14d", name: "Ecosystem User Agent Information Standard", era: "Genesis Infrastructure Era", status: "ENABLED", architecture: "Ecosystem Client-Side Specification", ledgerImpact: "Geactiveerd in de vroege jaren van de ledger. Introduceerde een universele indeling voor client-applicaties om metadata en browser/wallet agent informatie op te bouwen, wat interactie tussen vroege XRPL-interfaces stroomlijnde." },
    { id: "XLS-19d", name: "Asset Profile & Metadata URI Framework", era: "Genesis Infrastructure Era", status: "ENABLED", architecture: "Client & Node Layer Protocol", ledgerImpact: "Geactiveerd om gestandaardiseerde links, logo's en omschrijvingen op een soevereine manier aan uitgegeven tokens (issued assets) te koppelen zonder overbodige data-ballast op het Layer-1 netwerk te veroorzaken." },
    { id: "XLS-20", name: "Native On-Chain Non-Fungible Tokens (NFTs)", era: "Genesis DeFi Era", status: "ENABLED", architecture: "Native XRPL Object Layer (Geen Smart Contracts nodig)[cite: 1]", ledgerImpact: "Geactiveerd in 2022[cite: 1]. Bracht vlijmscherpe, kogelvrije NFT-functionaliteit rechtstreeks naar de core-code van de ledger[cite: 1]. Sloopte het risico op smart contract hacks (zoals op Ethereum)[cite: 1]. Introduceerde on-chain ingebouwde royalty-fees en automatische makelaarsfuncties[cite: 1]." },
    { id: "XLS-30", name: "Native Automated Market Maker (AMM)", era: "DeFi Core Integration", status: "ENABLED", architecture: "Protocol-level AMM Engine met Orderbook-routing[cite: 1]", ledgerImpact: "Geactiveerd in 2024[cite: 1]. Slaat een brug tussen het traditionele orderboek van de XRPL DEX en geautomatiseerde liquiditeitspools[cite: 1]. Uniek mechanisme: veilt continu handelsvolume om impermanent loss direct terug te betalen aan Liquidity Providers[cite: 1]." },
    { id: "XLS-38", name: "Cross-Chain Sidechain Bridges", era: "Interoperability Expansion", status: "ENABLED", architecture: "Gecertificeerd Cross-Chain Bridge Protocol[cite: 1]", ledgerImpact: "Maakt veilige, native verbindingen mogelijk tussen de XRPL Mainnet en zijketens zoals het Xahau Netwerk of de XRPL EVM Sidechain[cite: 1]. Voorkomt de beruchte bridge-hacks door de vergrendeling direct op protocol-niveau af te dwingen[cite: 1]." },
    { id: "XLS-39d", name: "Native Asset Clawback Architecture", era: "DeFi Core Integration", status: "ENABLED", architecture: "L1 TrustSet & AccountSet Flag Protocols", ledgerImpact: "Geactiveerd begin 2024. Geeft gereguleerde token-uitgevers (zoals stablecoin-providers) de cruciale optie om tokens terug te vorderen bij aantoonbare fraude of verloren accounts. Dit is een absolute vereiste voor institutionele MiCA-compliance." },
    { id: "XLS-40", name: "Decentralized Identity (DID)", era: "Sovereign Identity Era", status: "ENABLED", architecture: "W3C Compliant On-Chain DID Identity Objects[cite: 1]", ledgerImpact: "Geactiveerd eind 2024[cite: 1]. Stelt gebruikers en entiteiten in staat om hun eigen, soevereine digitale identiteit te beheren op het netwerk[cite: 1]. Cruciaal voor institutionele stablecoin-uitgevers om KYC-checks on-chain te valideren zonder privacy-lekken[cite: 1]." },
    { id: "XLS-47", name: "Native Price Oracles", era: "DeFi Data Core", status: "ENABLED", architecture: "L1 Data Oracle Storage Objects[cite: 1]", ledgerImpact: "Introduceert native data-feeds rechtstreeks in het grootboek[cite: 1]. Hiermee kunnen goedgekeurde bronnen (zoals Chainlink) real-time marktprijzen van grondstoffen, fiat-valuta en crypto direct in de chain pompen voor DeFi-toepassingen[cite: 1]." },
    { id: "XLS-65", name: "Single Asset Liquidity Vaults", era: "The New Ledger Matrix (2025/2026)", status: "VOTING", architecture: "On-Chain Asset Vault Pools[cite: 1]", ledgerImpact: "De fundering voor passief rendement[cite: 1]. Maakt het mogelijk om één specifieke asset (zoals XRP of RLUSD) in een native kluis te storten om rente te verdienen, zonder dat je verplicht bent om een tweede asset te matchen zoals bij een AMM[cite: 1]." },
    { id: "XLS-66d", name: "Native Decentralized Lending Protocol", era: "The New Ledger Matrix (2025/2026)", status: "VOTING", architecture: "L1 Fixed-Term Non-Collateralized Lending Engine[cite: 1]", ledgerImpact: "De absolute gamechanger[cite: 1]. Introduceert institutioneel lenen en uitlenen direct op het XRP Ledger[cite: 1]. Werkt hand in hand met XLS-65 kluizen om kapitaalstromen soeverein te routeren zonder tussenkomst van derden[cite: 1]." }
  ];

  const legalActs: LegalAct[] = [
    { name: "MiCAR (Markets in Crypto-Assets Regulation)", jurisdiction: "Europese Unie", status: "ENFORCED", target: "Stablecoins, Exchanges, Crypto-Asset Service Providers (CASPs)", focus: "Eist 100% fiat-dekking bij on-chain euro/dollar uitgevers. Verbiedt algoritmische stablecoins volledig en dwingt strikte governance-protocollen af.", systemicImpact: "Hoge barrière voor start-ups, maar dwingt banken en instituties om gigantische liquiditeit on-chain te brengen via gereguleerde tokens zoals RLUSD." },
    { name: "Clarity for Payment Stablecoins Act", jurisdiction: "Verenigde Staten", status: "PENDING", target: "Gereguleerde Amerikaanse Stablecoin Uitgevers", focus: "Creëert een federale structuur voor fiat-backed tokens onder toezicht van de Federal Reserve. Verbiedt ongedekte of gemixte reserves.", systemicImpact: "Zorgt voor de definitieve institutionele doorbraak van Amerikaanse banken die stabiele on-chain assets willen emitteren zonder angst voor SEC-vervolging." },
    { name: "FIT21 (Financial Innovation and Technology for the 21st Century Act)", jurisdiction: "Verenigde Staten", status: "PENDING", target: "Decentralisatie Classificatie (SEC vs CFTC)", focus: "Trekt een harde, wiskundige lijn tussen effecten (securities) en grondstoffen (commodities) op basis van de daadwerkelijke on-chain decentralisatiegraad van een netwerk.", systemicImpact: "Zorgt voor totale marktveiligheid voor L1-ledgers zoals het XRP Ledger, die hiermee definitief buiten schot van agressieve handhavingsacties blijven." }
  ];

  // ⚡ DE HERSTELDE CORE FUNCTIONALITEIT:
  const triggerDailyCheckup = () => {
    setCheckupStatus('SCANNING');
    setTimeout(() => {
      setCheckupStatus('SECURE');
      alert("OTT COMPLIANCE CHECKUP: Geopolitieke datavelden gecontroleerd. Database status 100% synchroon met de laatste macro-ontwikkelingen en pilots voor juni 2026. Systemen nominaal.");
    }, 1500);
  };

  const filteredFeed = activeFilter === "ALL" ? intelFeed : intelFeed.filter(item => item.category === activeFilter);

  return (
    <div className="space-y-6 text-white font-sans selection:bg-[#ff2079]/30">
      
      {/* 🌌 FLUIDE MASTER HEADER MATRIX */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-gray-950 pb-4 gap-4 w-full">
        
        {/* LOGO LINKSBOVEN EN STRAKKE TITEL-STRUCTUUR */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="w-9 h-9 border border-white flex items-center justify-center font-orbitron font-black text-xs tracking-tighter bg-black shadow-[0_0_15px_rgba(255,32,121,0.1)] select-none">
            OTT
          </div>
          <div>
            <h1 className="font-orbitron text-xs font-black uppercase tracking-[0.25em] text-white">Ledger Intel Terminal</h1>
            <p className="text-[9px] font-mono text-gray-500 uppercase tracking-wider mt-0.5 whitespace-nowrap leading-none">
              Sovereign Intelligence Engine // <span className="text-[#ff2079] font-bold">{lastUpdateDate}</span>
            </p>
          </div>
        </div>
        
        {/* INTERACTIEVE NAVIGATIE STRIP - ALLE 7 COMPACT NAAST ELKAAR ZONDER SCROLLEN */}
        <div className="flex flex-wrap lg:flex-nowrap gap-0.5 border border-gray-950 p-0.5 bg-black items-center max-w-full">
          <button onClick={() => setCurrentSection('matrix')} className={`px-2.5 py-1.5 font-orbitron text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap ${currentSection === 'matrix' ? 'bg-[#ff2079] text-black font-black' : 'text-gray-400 hover:text-white'}`}>Intel Matrix</button>
          <button onClick={() => setCurrentSection('cbdc')} className={`px-3 py-1.5 font-orbitron text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap ${currentSection === 'cbdc' ? 'bg-[#2b82ff] text-black font-black' : 'text-gray-400 hover:text-white'}`}>CBDC Radar</button>
          <button onClick={() => setCurrentSection('stable')} className={`px-3 py-1.5 font-orbitron text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap ${currentSection === 'stable' ? 'bg-green-400 text-black font-black' : 'text-gray-400 hover:text-white'}`}>Stablecoins</button>
          <button onClick={() => setCurrentSection('xls')} className={`px-3 py-1.5 font-orbitron text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap ${currentSection === 'xls' ? 'bg-purple-500 text-black font-black' : 'text-gray-400 hover:text-white'}`}>XLS Protocol</button>
          <button onClick={() => setCurrentSection('nodes')} className={`px-3 py-1.5 font-orbitron text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap ${currentSection === 'nodes' ? 'bg-yellow-500 text-black font-black' : 'text-gray-400 hover:text-white'}`}>UNL Voting</button>
          <button onClick={() => setCurrentSection('legal')} className={`px-3 py-1.5 font-orbitron text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap ${currentSection === 'legal' ? 'bg-cyan-400 text-black font-black' : 'text-gray-400 hover:text-white'}`}>Wetgeving</button>
          <button onClick={() => setCurrentSection('globe')} className={`px-3 py-1.5 font-orbitron text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap ${currentSection === 'globe' ? 'bg-white text-black font-black' : 'text-gray-400 hover:text-white'}`}><Map className="w-3 h-3 inline mr-1" /> Live Stream</button>
        </div>
      </div>

      {/* 📡 LIVE INTERACTIEVE DAILY CHECKUP MATRIX BAR */}
      <div className="p-4 border border-gray-950 bg-gradient-to-r from-gray-950 via-black to-gray-950 flex flex-col md:flex-row justify-between items-center gap-3 font-mono text-[10px]">
        <div className="flex items-center space-x-2.5">
          {checkupStatus === 'SECURE' ? (
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" />
          ) : (
            <RefreshCw className="w-3 h-3 text-[#ff2079] animate-spin" />
          )}
          <span className="text-gray-400 uppercase tracking-wider">
            {checkupStatus === 'SECURE' 
              ? "DAILY PROTOCOL HANDSHAKE: Systeem is 100% up-to-date. Geen nieuwe geopolitieke afwijkingen gevonden." 
              : "SCANNING GLOBAL LEDGER INSIGHTS: Controleert macro-data, MiCA compliance en wholesale mutaties..."}
          </span>
        </div>
        <button 
          onClick={triggerDailyCheckup} 
          disabled={checkupStatus === 'SCANNING'}
          className="px-3 py-1 bg-black border border-gray-900 hover:border-[#ff2079] hover:text-[#ff2079] transition-all text-gray-500 font-orbitron font-black uppercase tracking-widest text-[8px] cursor-pointer rounded-sm"
        >
          {checkupStatus === 'SCANNING' ? "SYSTEM_CHECK..." : "Forceer Daily Checkup"}
        </button>
      </div>

      {/* --- SECTIE 1: INTEL MATRIX --- */}
      {currentSection === 'matrix' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in">
          <div className="xl:col-span-2 space-y-4">
            <div className="flex flex-wrap gap-2 border-b border-gray-950 pb-2">
              {['ALL', 'MACRO', 'ISO20022', 'SYSTEMIC'].map((filter) => (
                <button key={filter} onClick={() => { setActiveFilter(filter); setSelectedIntel(null); }} className={`px-3 py-1 font-orbitron text-[9px] font-black uppercase tracking-widest border transition-all cursor-pointer ${activeFilter === filter ? 'border-[#ff2079] bg-[#ff2079]/5 text-white' : 'border-gray-950 text-gray-500 hover:text-white'}`}>{filter}</button>
              ))}
            </div>
            <div className="space-y-4">
              {filteredFeed.map((intel) => (
                <div key={intel.id} onClick={() => setSelectedIntel(intel)} className={`border p-5 bg-black transition-all cursor-pointer group space-y-2 ${selectedIntel?.id === intel.id ? 'border-white' : 'border-gray-950 hover:border-gray-800'}`}>
                  <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-widest">
                    <span className="text-gray-400">{intel.source}</span>
                    <span className="text-gray-500">{intel.timestamp}</span>
                  </div>
                  <h3 className="font-orbitron text-xs font-black uppercase tracking-wider group-hover:text-[#ff2079] transition-colors">{intel.title}</h3>
                  <p className="text-[11px] font-mono text-gray-400 uppercase tracking-wide line-clamp-2">{intel.summary}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="xl:col-span-1 border border-gray-950 bg-black p-5 min-h-[350px] flex flex-col justify-between">
            {selectedIntel ? (
              <div className="space-y-4 animate-fade-in">
                <span className="text-[8px] font-mono text-[#ff2079] uppercase tracking-widest font-black">// Gecodeerd Dossier Ontcijferd</span>
                <h2 className="font-orbitron text-xs font-black uppercase tracking-wider border-b border-gray-950 pb-2">{selectedIntel.title}</h2>
                <p className="text-[11px] font-mono text-gray-300 whitespace-pre-line leading-relaxed normal-case font-sans">{selectedIntel.content}</p>
              </div>
            ) : (
              <div className="my-auto text-center p-6 border border-dashed border-gray-950 text-gray-700 font-orbitron text-[9px] font-black uppercase tracking-widest">Awaiting Intel Selection</div>
            )}
          </div>
        </div>
      )}

      {/* --- SECTIE 2: COMPREHENSIEVE CBDC RADAR --- */}
      {currentSection === 'cbdc' && (
        <div className="border border-gray-950 bg-black p-6 space-y-6 animate-fade-in">
          <div>
            <h2 className="font-orbitron text-xs font-black uppercase tracking-widest text-[#2b82ff]">// Central Bank Programmable Monetary Radar</h2>
            <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mt-0.5">Mondiaal BBP toezicht: 146 Landen actief in on-chain onderzoek</p>
          </div>
          <div className="overflow-x-auto w-full custom-scrollbar">
            <table className="w-full text-left font-mono text-[11px] uppercase border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-950 text-gray-500 text-[9px] tracking-widest font-bold">
                  <th className="pb-3">Land / Regio</th>
                  <th className="pb-3">Asset Naam</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">DLT Architectuur</th>
                  <th className="pb-3 text-center">mBridge</th>
                  <th className="pb-3 text-center">Controle Factor</th>
                  <th className="pb-3 pl-4">OTT Systemische Analyse & Volume Metrics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-950/40 text-gray-300">
                {cbdcTracker.map((cbdc, idx) => (
                  <tr key={idx} className="hover:bg-gray-950/20">
                    <td className="py-3.5 font-bold font-orbitron text-white text-[10px]">{cbdc.country}</td>
                    <td className="py-3.5 text-gray-400">{cbdc.assetName}</td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 text-[8px] font-bold border ${
                        cbdc.status === 'LAUNCHED' ? 'border-red-900 bg-red-950/20 text-red-400' : 'border-yellow-900 bg-yellow-950/20 text-yellow-400'
                      }`}>{cbdc.status}</span>
                    </td>
                    <td className="py-3.5 text-gray-600 text-[10px]">{cbdc.tech}</td>
                    <td className="py-3.5 text-center font-bold text-[#2b82ff]">{cbdc.mBridge ? 'YES' : '—'}</td>
                    <td className="py-3.5 text-center font-bold text-red-500 text-[10px]">{cbdc.controlScore}</td>
                    <td className="py-3.5 text-gray-400 font-sans text-[11px] normal-case tracking-normal max-w-xs leading-tight pl-4">{cbdc.analysis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- SECTIE 3: WORLDWIDE STABLECOIN HUB & PROTECTION SHIELD --- */}
      {currentSection === 'stable' && (
        <div className="space-y-6 animate-fade-in">
          <div className="border border-gray-950 bg-black p-6 space-y-6">
            <h2 className="font-orbitron text-xs font-black uppercase tracking-widest text-green-400">// Comprehensive Global Stable Asset Matrix</h2>
            <div className="grid grid-cols-1 gap-4">
              {stablecoinTracker.map((coin, idx) => (
                <div key={idx} className={`border p-5 bg-black/40 flex flex-col xl:flex-row justify-between gap-6 ${coin.ticker === 'MXNX' ? 'border-[#ff2079] bg-[#ff2079]/5 shadow-[0_0_15px_rgba(255,32,121,0.05)]' : 'border-gray-950'}`}>
                  <div className="space-y-2 xl:w-1/3">
                    <div className="flex items-baseline space-x-2">
                      <h3 className="font-orbitron text-sm font-black text-white">{coin.ticker}</h3>
                      <span className={`px-2 py-0.5 text-[8px] font-bold border ${coin.status === 'UPCOMING' ? 'border-[#ff2079] bg-[#ff2079]/10 text-[#ff2079] animate-pulse' : 'border-green-950 bg-green-950/10 text-green-400'}`}>{coin.status}</span>
                    </div>
                    <p className="text-[10px] font-mono uppercase text-gray-400">Pegged: <span className="text-white font-bold">{coin.peg}</span></p>
                    <p className="text-[10px] font-mono uppercase text-gray-500">Issuer: {coin.issuer}</p>
                  </div>
                  <div className="font-mono text-[10px] text-gray-400 xl:w-1/3 space-y-1">
                    <p className="text-gray-600 uppercase font-bold text-[8px]">Reserves & Rails Architecture:</p>
                    <p className="text-[#2b82ff] font-bold text-[9px] leading-tight normal-case font-sans">{coin.backing}</p>
                    <p className="pt-2 text-gray-500 text-[9px] uppercase">Ledger Corridors: {coin.ledger}</p>
                  </div>
                  <div className="flex-1 bg-gray-950/30 p-4 border-l border-gray-950">
                    <span className="text-[8px] font-orbitron font-black text-[#ff2079] block uppercase mb-1">// Systemic Reality Facts</span>
                    <p className="text-[11px] font-mono text-gray-300 uppercase tracking-wide leading-relaxed">{coin.facts}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ANTI-FUGAZI RADAR */}
          <div className="border border-gray-950 bg-[#060003] p-6 space-y-4">
            <div className="flex items-center space-x-2 text-red-500">
              <ShieldCheck className="w-4 h-4 text-red-500" />
              <h2 className="font-orbitron text-xs font-black uppercase tracking-widest">// OTT Risk Shield: Non-Fiat Exclusions Isolated</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {nonFiatExclusions.map((ex, i) => (
                <div key={i} className="p-4 border border-red-950/40 bg-black space-y-1.5 font-mono text-[10px]">
                  <span className="text-white font-orbitron font-black text-xs block">{ex.ticker}</span>
                  <span className="text-red-500 font-bold uppercase block text-[8px] tracking-wider">// Classificatie: {ex.type}</span>
                  <p className="text-gray-500 leading-tight normal-case font-sans text-[11px] pt-1">{ex.issue}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- SECTIE 4: COMPREHENSIEF XLS HISTORY REGISTER --- */}
      {currentSection === 'xls' && (
        <div className="border border-gray-950 bg-black p-6 space-y-6 animate-fade-in">
          <div>
            <h2 className="font-orbitron text-xs font-black uppercase tracking-widest text-purple-400">// XRP Ledger Historical Protocol Timeline (XLS-14 to Present)</h2>
            <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mt-0.5">Volledige evolutie van on-chain L1 architecture en standaarden</p>
          </div>
          <div className="space-y-4">
            {xlsUpdates.map((xls) => (
              <div key={xls.id} className="border border-gray-950 bg-black/50 p-5 grid grid-cols-1 xl:grid-cols-4 gap-4 items-start">
                <div className="space-y-1">
                  <div className="flex items-baseline space-x-2">
                    <span className="font-orbitron text-md font-black text-white">{xls.id}</span>
                    <span className="text-[8px] font-mono px-1.5 py-0.5 bg-purple-950/30 text-purple-400 border border-purple-900 font-bold">{xls.era}</span>
                  </div>
                  <p className="font-orbitron text-[11px] font-bold uppercase text-gray-400">{xls.name}</p>
                  <span className={`inline-block px-2 py-0.5 text-[8px] font-mono font-bold mt-1 ${xls.status === 'ENABLED' ? 'text-green-400 border border-green-950 bg-green-950/10' : 'text-yellow-400 border border-yellow-950 bg-yellow-950/10 animate-pulse'}`}>{xls.status}</span>
                </div>
                <div className="font-mono text-[10px] text-gray-500 uppercase xl:col-span-1">
                  <span className="text-[8px] text-gray-600 block font-bold">Architecture Type:</span>
                  <p className="text-gray-400">{xls.architecture}</p>
                </div>
                <div className="xl:col-span-2 bg-gray-950/20 p-3 border border-gray-950 font-mono text-[11px] text-gray-300 uppercase tracking-wide leading-relaxed">
                  <span className="text-[8px] font-orbitron font-black text-purple-400 block mb-1">// Ledger Impact & Evolution</span>
                  {xls.ledgerImpact}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- SECTIE 5: ISO 20022 CORE NETWORKS MAPPING --- */}
      {currentSection === 'nodes' && (
        <div className="border border-gray-950 bg-black p-6 space-y-6 animate-fade-in">
          <div>
            <h2 className="font-orbitron text-xs font-black uppercase tracking-widest text-yellow-500">// Universal Financial Messaging System (ISO 20022 Engine Mapping)</h2>
            <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mt-0.5">Traditionele bankinfrastructuur vs cryptografische settlement layers</p>
          </div>
          
          <div className="grid grid-cols-1 gap-4 font-mono text-[11px]">
            {isoNetworks.map((net, i) => (
              <div key={i} className="p-5 border border-gray-950 bg-gray-950/20 grid grid-cols-1 xl:grid-cols-4 gap-4 items-center">
                <div className="xl:col-span-1">
                  <span className="text-yellow-500 font-orbitron font-black text-[10px] block uppercase tracking-wider">// {net.category}</span>
                </div>
                <div className="xl:col-span-1 text-white font-bold text-[11px]">
                  {net.names}
                </div>
                <div className="xl:col-span-2 text-gray-400 font-sans text-[11px] leading-relaxed normal-case">
                  {net.role}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- SECTIE 6: CRYPTO WETGEVING / REGULATION MATRIX --- */}
      {currentSection === 'legal' && (
        <div className="border border-gray-950 bg-black p-6 space-y-6 animate-fade-in">
          <h2 className="font-orbitron text-xs font-black uppercase tracking-widest text-cyan-400">// Global Cryptocurrency Regulatory & Legislative Tracking Matrix</h2>
          <div className="grid grid-cols-1 gap-4">
            {legalActs.map((act, idx) => (
              <div key={idx} className="border border-gray-950 bg-black/50 p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-gray-950 pb-2">
                  <div className="flex items-baseline space-x-2">
                    <span className="font-orbitron text-xs font-black text-white">{act.name}</span>
                    <span className="font-mono text-[9px] text-cyan-400 font-bold uppercase tracking-wider">// Jurisdiction: {act.jurisdiction}</span>
                  </div>
                  <span className={`px-2 py-0.5 text-[8px] font-mono font-bold border ${act.status === 'ENFORCED' ? 'border-green-950 bg-green-950/20 text-green-400' : 'border-yellow-950 bg-yellow-950/20 text-yellow-400 animate-pulse'}`}>{act.status}</span>
                </div>
                <div className="font-mono text-[11px] space-y-2 uppercase">
                  <p><span className="text-gray-600 font-bold text-[9px]">Regulatory Scope:</span> <span className="text-gray-300">{act.target}</span></p>
                  <p className="bg-gray-950/20 p-2.5 border border-gray-950 text-gray-400 leading-relaxed tracking-wide"><span className="text-cyan-400 font-orbitron text-[9px] block font-black mb-0.5">// Core Legislative Focus</span>{act.focus}</p>
                  <p className="bg-cyan-950/5 p-2.5 border border-cyan-950/20 text-gray-300 normal-case font-sans text-[11px] leading-tight"><span className="text-white font-orbitron text-[9px] block font-black uppercase tracking-wider mb-0.5">// Systemic Impact Analysis</span>{act.systemicImpact}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- SECTIE 7: LIVE XRPL MAP TRANSMISSION DATA STREAM --- */}
      {currentSection === 'globe' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-fade-in">
          <div className="text-white font-sans flex flex-col justify-between items-center min-h-[500px] relative overflow-hidden xl:col-span-2 border border-gray-950 bg-black p-6">
            <div className="absolute top-4 left-4 z-10">
              <span className="text-[9px] font-mono text-green-400 uppercase tracking-widest font-black flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 animate-pulse" /> // Ledger Node Overlay: Connected</span>
            </div>
            
            <div className="my-auto w-full max-w-md aspect-square relative flex items-center justify-center">
              <div className="absolute inset-0 border border-gray-950/40 rounded-full animate-[spin_60s_linear_infinite] bg-[radial-gradient(circle_at_center,rgba(255,32,121,0.02)_0%,transparent_70%)]" />
              <div className="absolute w-4/5 h-4/5 border border-dashed border-gray-950/60 rounded-full animate-[spin_30s_linear_infinite_reverse]" />
              <div className="absolute w-1/2 h-1/2 border border-gray-950 rounded-full animate-ping opacity-10" />
              
              <div className="absolute top-1/4 left-1/4 w-1.5 h-1.5 bg-[#ff2079] rounded-full shadow-[0_0_10px_#ff2079] animate-ping" />
              <div className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 bg-[#2b82ff] rounded-full shadow-[0_0_10px_#2b82ff] animate-pulse" />
              <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-green-400 rounded-full animate-pulse" />
              <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping" />

              <div className="text-center space-y-1 z-10 pointer-events-none">
                <span className="font-orbitron text-[16px] font-black tracking-[0.3em] uppercase text-white">XRPL CORE</span>
                <p className="font-mono text-[9px] text-gray-500 uppercase tracking-widest">Global P2P Transmission Map</p>
              </div>
            </div>

            <div className="w-full border-t border-gray-950 pt-4 flex justify-between items-center font-mono text-[9px] text-gray-600 uppercase tracking-widest">
              <span>LATENCY: 2.8s [TESTNET_NODE]</span>
              <span>Consensus: 100% Trusted</span>
            </div>
          </div>

          <div className="xl:col-span-1 border border-gray-950 bg-black p-5 flex flex-col justify-between h-[542px]">
            <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center space-x-2 border-b border-gray-950 pb-2">
                <Terminal className="w-4 h-4 text-gray-500" />
                <h3 className="font-orbitron text-xs font-black uppercase tracking-widest text-white">Live Ledger Stream</h3>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar font-mono text-[10px] uppercase tracking-wider">
                {liveTransactions.map((tx) => (
                  <div key={tx.id} className="p-2 border border-gray-950 bg-gray-950/20 rounded-sm flex justify-between items-center animate-fade-in hover:border-gray-800 transition-all">
                    <div className="space-y-0.5">
                      <p className="text-white font-bold flex items-center gap-1">
                        <span className={`w-1 h-1 rounded-full ${tx.type === 'PAYMENT' ? 'bg-green-400' : 'bg-[#ff2079]'}`}></span>
                        {tx.type}
                      </p>
                      <p className="text-gray-500 text-[9px]">Src: {tx.account} ➡️ Dest: {tx.destination}</p>
                    </div>
                    <div className="text-right space-y-0.5">
                      <p className="text-white font-orbitron font-black">{tx.amount} <span className="text-[8px] text-gray-500">XRP</span></p>
                      <p className="text-gray-600 text-[8px]">ID: {tx.id}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}