import { useState } from 'react';
import { Coins, Image, ShieldAlert, ArrowRight, CheckCircle2, Cpu, Landmark, ExternalLink, ShieldCheck, Wallet } from 'lucide-react';

// --- ⚡ OTT TREASURY CONFIGURATIE (HARDWIRED) ---
const OTT_TREASURY_ADDRESS = "rGAs3npYy1VwLPE92kvKvA2QYLR6FSA9n6"; 
const OTT_TREASURY_TAG = 2606170002; // JOUW UNIEKE BESTEMMINGSTAG
const SERVICE_FEE_XRP = "5"; 
const SERVICE_FEE_DROPS = "5000000"; 

const convertToHex = (str: string) => {
  return Array.from(str)
    .map(c => c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0'))
    .join('');
};

export function DeFiTab() {
  const [tokenCurrency, setTokenCurrency] = useState('OTT');
  const [tokenSupply, setTokenSupply] = useState('589000000'); 
  const [issuerAddress, setIssuerAddress] = useState('');
  
  const [nftUri, setNftUri] = useState('ipfs://bafybeihashhere...');
  const [transferFee, setTransferFee] = useState('500'); 
  const [taxon, setTaxon] = useState('0');

  const [payloadOutput, setPayloadOutput] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<'token' | 'nft' | 'yield'>('token');

  const generateTokenPayload = () => {
    if (!issuerAddress.startsWith('r') || issuerAddress.length < 25) {
      alert('Voer een geldig XRPL r-adres in voor de Token Issuer.');
      return;
    }

    const formattedCurrency = tokenCurrency.length === 3 
      ? tokenCurrency 
      : convertToHex(tokenCurrency).padEnd(40, '0');

    const batchPayload = {
      OTT_Routing_Protocol: "Smart Contract Batch Execution",
      Platform_Fee_Recipient: OTT_TREASURY_ADDRESS,
      Transactions: [
        {
          TransactionType: "Payment",
          Account: "YOUR_CONNECTED_WALLET",
          Destination: OTT_TREASURY_ADDRESS,
          DestinationTag: OTT_TREASURY_TAG, // ⚡ TAG GEÏNTEGREERD
          Amount: SERVICE_FEE_DROPS,
          Memos: [{ Memo: { MemoData: convertToHex("OTT Terminal Creation Fee") } }]
        },
        {
          TransactionType: "TrustSet",
          Account: "YOUR_CONNECTED_WALLET",
          LimitAmount: {
            currency: formattedCurrency,
            issuer: issuerAddress,
            value: tokenSupply
          },
          Flags: 131072
        }
      ]
    };

    setPayloadOutput(JSON.stringify(batchPayload, null, 2));
  };

  const generateNftPayload = () => {
    if (!nftUri) {
      alert('Voer een geldige metadata URI in.');
      return;
    }

    const hexUri = convertToHex(nftUri);

    const batchPayload = {
      OTT_Routing_Protocol: "Smart Contract Batch Execution",
      Platform_Fee_Recipient: OTT_TREASURY_ADDRESS,
      Transactions: [
        {
          TransactionType: "Payment",
          Account: "YOUR_CONNECTED_WALLET",
          Destination: OTT_TREASURY_ADDRESS,
          DestinationTag: OTT_TREASURY_TAG, // ⚡ TAG GEÏNTEGREERD
          Amount: SERVICE_FEE_DROPS,
          Memos: [{ Memo: { MemoData: convertToHex("OTT Terminal Minting Fee") } }]
        },
        {
          TransactionType: "NFTokenMint",
          Account: "YOUR_CONNECTED_WALLET",
          NFTokenTaxon: parseInt(taxon),
          TransferFee: parseInt(transferFee),
          URI: hexUri,
          Flags: 8
        }
      ]
    };

    setPayloadOutput(JSON.stringify(batchPayload, null, 2));
  };

  const yieldPlatforms = [
    {
      name: "xMagnetic Farming",
      type: "Yield Farming / Dual-Asset Staking",
      url: "https://xmagnetic.org/farming?network=mainnet",
      description: "De absolute koning van XRPL en Xahau yield farming. Lock LP-tokens van actieve DEX-paren en verdien extra governance-tokens bovenop je normale handelskosten.",
      theme: "text-[#a855f7] border-[#a855f7]"
    },
    {
      name: "xMagnetic AMM Pools",
      type: "XLS-30 Liquidity Provision",
      url: "https://xmagnetic.org/amm?network=mainnet",
      description: "Directe toegang tot de native Automated Market Maker pools van het XRPL. Voorzie het orderboek van liquiditeit en verdien een passief percentage op alle netwerk-swaps.",
      theme: "text-[#a855f7] border-[#a855f7]"
    },
    {
      name: "Anodos Finance",
      type: "Cross-Border AMM & Fiat Corridors",
      url: "https://anodos.finance/",
      description: "Geautomatiseerde liquiditeit voor institutionele fiat-bruggen (zoals de MXN/RLUSD corridor). Genereer rendement uit internationale remittance geldstromen.",
      theme: "text-[#2b82ff] border-[#2b82ff]"
    },
    {
      name: "Soil Farming RWA",
      type: "Real World Asset (RWA) Lending",
      url: "https://xrpl.soil.co/user/dashboard",
      description: "Sla de brug naar de fysieke wereld. Jouw crypto-kapitaal leent direct geld uit aan gevestigde bedrijven buiten de blockchain. Rendement komt uit echte bedrijfsinkomsten.",
      theme: "text-green-400 border-green-500"
    },
    {
      name: "Doppler Finance",
      type: "Synthetische Derivaten & Opties",
      url: "https://www.doppler.finance/",
      description: "Brengt institutionele optie-pools en geavanceerde derivaten naar de XRPL. Door liquiditeit te verschaffen aan deze high-yield matrix incasseer je direct optie-premies.",
      theme: "text-yellow-400 border-yellow-500"
    },
    {
      name: "Flare XRPFi",
      type: "Smart Contract Interoperability",
      url: "https://xrpfi.flare.network/defi",
      description: "Transformeer native XRP soeverein naar smart-contract compatibele fXRP via trustless bridges. Genereer passief rendement via cross-chain DeFi ecosystemen en leenprotocollen.",
      theme: "text-[#ff2079] border-[#ff2079]"
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in text-white font-sans selection:bg-[#ff2079]/30">
      
      <div className="flex space-x-1 border-b border-gray-950 pb-px overflow-x-auto custom-scrollbar">
        <button
          onClick={() => { setActiveMode('token'); setPayloadOutput(null); }}
          className={`px-6 py-3 font-orbitron text-xs font-black uppercase tracking-widest border-t-2 transition-all cursor-pointer whitespace-nowrap ${
            activeMode === 'token' ? 'border-[#2b82ff] bg-gray-950/20 text-white' : 'border-transparent text-gray-500 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Coins className="w-3.5 h-3.5" /> Token Factory
          </div>
        </button>
        
        <button
          onClick={() => { setActiveMode('nft'); setPayloadOutput(null); }}
          className={`px-6 py-3 font-orbitron text-xs font-black uppercase tracking-widest border-t-2 transition-all cursor-pointer whitespace-nowrap ${
            activeMode === 'nft' ? 'border-[#ff2079] bg-gray-950/20 text-white' : 'border-transparent text-gray-500 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Image className="w-3.5 h-3.5" /> NFT Minting Forge
          </div>
        </button>

        <button
          onClick={() => { setActiveMode('yield'); setPayloadOutput(null); }}
          className={`px-6 py-3 font-orbitron text-xs font-black uppercase tracking-widest border-t-2 transition-all cursor-pointer whitespace-nowrap ${
            activeMode === 'yield' ? 'border-green-400 bg-gray-950/20 text-white' : 'border-transparent text-gray-500 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Landmark className="w-3.5 h-3.5" /> Global Yield Matrix
          </div>
        </button>
      </div>

      {activeMode === 'yield' ? (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="font-orbitron text-xs font-black uppercase tracking-widest text-green-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Sovereign Yield Layer // Geverifieerde Gateways
            </h2>
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mt-1">
              Selecteer een protocol om je kapitaal on-chain te laten renderen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {yieldPlatforms.map((platform, idx) => (
              <div key={idx} className="border border-gray-950 bg-black flex flex-col justify-between hover:border-gray-800 transition-all group">
                <div className="p-6 space-y-4">
                  <div className="space-y-1 border-b border-gray-950 pb-3">
                    <span className={`text-[8px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 border bg-black/50 ${platform.theme}`}>
                      {platform.type}
                    </span>
                    <h3 className="font-orbitron text-sm font-black uppercase tracking-wider text-white pt-2">{platform.name}</h3>
                  </div>
                  <p className="font-mono text-[11px] text-gray-400 leading-relaxed normal-case">
                    {platform.description}
                  </p>
                </div>
                
                <div className="p-4 border-t border-gray-950 bg-gray-950/20">
                  <a 
                    href={platform.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 border border-gray-800 hover:border-white text-gray-400 hover:text-white bg-black transition-all cursor-pointer font-orbitron text-[9px] font-black uppercase tracking-widest"
                  >
                    Open dApp Gateway <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-fade-in">
        <div className="border border-gray-950 bg-black p-6 space-y-6">
          <div>
            <h2 className="font-orbitron text-xs font-black uppercase tracking-widest text-white">
              {activeMode === 'token' ? 'Asset Issuance Parameter Setup' : 'XLS-20 NFT Mint Parameters'}
            </h2>
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mt-1">Direct Ledger Payload Generator</p>
          </div>

          {activeMode === 'token' ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Token Currency Code</label>
                <input
                  type="text"
                  value={tokenCurrency}
                  onChange={(e) => setTokenCurrency(e.target.value.toUpperCase())}
                  className="w-full border border-gray-950 bg-gray-950/50 px-4 py-3 font-orbitron text-xs font-black uppercase tracking-widest text-white focus:outline-none focus:border-[#2b82ff]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Total Max Supply Balance</label>
                <input
                  type="number"
                  value={tokenSupply}
                  onChange={(e) => setTokenSupply(e.target.value)}
                  className="w-full border border-gray-950 bg-gray-950/50 px-4 py-3 font-mono text-xs text-white focus:outline-none focus:border-[#2b82ff]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Cold Wallet Issuer Address (r...)</label>
                <input
                  type="text"
                  placeholder="rOTT..."
                  value={issuerAddress}
                  onChange={(e) => setIssuerAddress(e.target.value)}
                  className="w-full border border-gray-950 bg-gray-950/50 px-4 py-3 font-mono text-xs text-white focus:outline-none focus:border-[#2b82ff]"
                />
              </div>
              
              <div className="p-3 border border-[#2b82ff]/30 bg-[#2b82ff]/5 flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-[#2b82ff]">
                <div className="flex items-center gap-2"><Wallet className="w-3.5 h-3.5" /> OTT Service Fee</div>
                <div className="font-bold">{SERVICE_FEE_XRP} XRP</div>
              </div>

              <button
                onClick={generateTokenPayload}
                className="w-full bg-[#2b82ff] text-black hover:bg-black hover:text-[#2b82ff] border border-[#2b82ff] font-orbitron text-xs font-black uppercase tracking-widest py-3.5 transition-all cursor-pointer"
              >
                Compile Token Trustline JSON
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Metadata URI (IPFS CID Link)</label>
                <input
                  type="text"
                  value={nftUri}
                  onChange={(e) => setNftUri(e.target.value)}
                  className="w-full border border-gray-950 bg-gray-950/50 px-4 py-3 font-mono text-xs text-white focus:outline-none focus:border-[#ff2079]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Royalties Fee (e.g. 500 = 5%)</label>
                  <input
                    type="number"
                    value={transferFee}
                    onChange={(e) => setTransferFee(e.target.value)}
                    className="w-full border border-gray-950 bg-gray-950/50 px-4 py-3 font-mono text-xs text-white focus:outline-none focus:border-[#ff2079]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">NFToken Taxon ID</label>
                  <input
                    type="number"
                    value={taxon}
                    onChange={(e) => setTaxon(e.target.value)}
                    className="w-full border border-gray-950 bg-gray-950/50 px-4 py-3 font-mono text-xs text-white focus:outline-none focus:border-[#ff2079]"
                  />
                </div>
              </div>

              <div className="p-3 border border-[#ff2079]/30 bg-[#ff2079]/5 flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-[#ff2079]">
                <div className="flex items-center gap-2"><Wallet className="w-3.5 h-3.5" /> OTT Service Fee</div>
                <div className="font-bold">{SERVICE_FEE_XRP} XRP</div>
              </div>

              <button
                onClick={generateNftPayload}
                className="w-full bg-[#ff2079] text-black hover:bg-black hover:text-[#ff2079] border border-[#ff2079] font-orbitron text-xs font-black uppercase tracking-widest py-3.5 transition-all cursor-pointer"
              >
                Compile On-Chain Mint JSON
              </button>
            </div>
          )}
        </div>

        <div className="border border-gray-950 bg-black p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4 flex-1 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-gray-500" />
                <h3 className="font-orbitron text-xs font-black uppercase tracking-widest text-white">Cryptographic Payload Output</h3>
              </div>
              {payloadOutput && (
                <span className="text-[9px] font-mono text-green-400 border border-green-950 bg-green-950/10 px-2 py-0.5 uppercase tracking-wider font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Batch Compiled
                </span>
              )}
            </div>

            {payloadOutput ? (
              <pre className="w-full flex-1 border border-gray-950 bg-gray-950/30 p-4 font-mono text-[10px] text-gray-300 overflow-auto whitespace-pre rounded-sm selection:bg-white/20 custom-scrollbar">
                {payloadOutput}
              </pre>
            ) : (
              <div className="w-full flex-1 border border-dashed border-gray-950 flex flex-col items-center justify-center p-8 text-center text-gray-700">
                <ShieldAlert className="w-6 h-6 mb-2" />
                <span className="text-[10px] font-mono uppercase tracking-widest">Awaiting Parameter Compilation...</span>
              </div>
            )}
          </div>

          {payloadOutput && (
            <button 
              onClick={() => {
                alert(`STAP 2 GEACTIVEERD: Multi-Transaction Payload (Inclusief ${SERVICE_FEE_XRP} XRP Fee) klaar voor Xaman Gateway! Bestemming: ${OTT_TREASURY_ADDRESS} (TAG: ${OTT_TREASURY_TAG})`);
              }}
              className="w-full border border-white bg-white text-black hover:bg-black hover:text-white font-orbitron text-xs font-black uppercase tracking-widest py-3.5 transition-all tracking-[0.2em] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Push Ledger Sign Request</span> <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      )}
    </div>
  );
}