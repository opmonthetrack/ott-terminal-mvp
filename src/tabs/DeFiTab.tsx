import { useState } from 'react';
import { Link, Image as ImageIcon, Landmark, Cpu, Loader2, ExternalLink, CheckCircle } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export function DeFiTab() {
  const [activeSubTab, setActiveSubTab] = useState('nft_forge');
  const [isMinting, setIsMinting] = useState(false);
  const [txResult, setTxResult] = useState<{ hash: string | null } | null>(null);
  const { t } = useLanguage();

  const handleMintNFT = async () => {
    setIsMinting(true);
    setTxResult(null); // Reset vorige resultaten
    try {
      const uriHex = "697066733a2f2f6261666b726569667734376d6f706b7737717134667070786b686763746879726a7667657235757972717962796a353261756e7168737a3263626d";

      const res = await fetch('/xaman-api/platform/payload', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json', 
            'x-api-key': import.meta.env.VITE_XAMAN_API_KEY || '', 
            'x-api-secret': import.meta.env.VITE_XAMAN_API_SECRET || '' 
        },
        body: JSON.stringify({ 
          txjson: { 
            TransactionType: "NFTokenMint", 
            NFTokenTaxon: 0, 
            Flags: 8, 
            URI: uriHex 
          } 
        })
      });

      const payload = await res.json();
      if (payload.refs?.qr_png) {
        window.open(payload.next.always, '_blank');
        
        const ws = new WebSocket(payload.refs.websocket_status);
        ws.onmessage = async (event) => {
          const msg = JSON.parse(event.data);
          if (msg.signed === true) {
            ws.close();
            const result = await fetch(`/xaman-api/platform/payload/${payload.uuid}`);
            const resultData = await result.json();
            
            // Debug log toevoegen voor als het misgaat
            console.log("Xaman Response:", resultData);
            
            // Veilige extractie van de hash
            const hash = resultData.response?.txid || resultData.txid || null;
            setTxResult({ hash: hash });
            setIsMinting(false);
          }
        };
      } else {
        throw new Error("Geen QR payload ontvangen");
      }
    } catch (e) {
      console.error(e);
      alert("Minting mislukt. Controleer je Xaman connectie.");
      setIsMinting(false);
    }
  };

  return (
    <div className="p-8 bg-black text-white min-h-screen">
      <div className="flex space-x-8 border-b border-white/10 mb-8 pb-4">
        <button onClick={() => setActiveSubTab('token_factory')} className={`flex items-center gap-2 font-orbitron text-xs font-bold uppercase ${activeSubTab === 'token_factory' ? 'text-white border-b border-white pb-4' : 'text-gray-600'}`}>
          <Link size={14} /> Token Factory
        </button>
        <button onClick={() => setActiveSubTab('nft_forge')} className={`flex items-center gap-2 font-orbitron text-xs font-bold uppercase ${activeSubTab === 'nft_forge' ? 'text-white border-b border-white pb-4' : 'text-gray-600'}`}>
          <ImageIcon size={14} /> NFT Minting Forge
        </button>
        <button onClick={() => setActiveSubTab('yield_matrix')} className={`flex items-center gap-2 font-orbitron text-xs font-bold uppercase ${activeSubTab === 'yield_matrix' ? 'text-white border-b border-white pb-4' : 'text-gray-600'}`}>
          <Landmark size={14} /> Global Yield Matrix
        </button>
      </div>

      {activeSubTab === 'nft_forge' && (
        <div className="max-w-xl mx-auto mt-12 bg-gray-950/50 p-8 rounded-2xl border border-white/5">
          {!txResult ? (
            <div className="text-center">
              <ImageIcon className="w-16 h-16 mx-auto mb-6 text-[#ff2079]" />
              <h3 className="font-orbitron text-lg font-black uppercase mb-2">Initialize Minting Sequence</h3>
              <p className="text-gray-500 text-xs mb-8">Mint je exclusieve OTT Asset direct op de XRPL Ledger.</p>
              <button 
                onClick={handleMintNFT}
                disabled={isMinting}
                className="w-full bg-[#ff2079] text-white py-4 font-orbitron font-black uppercase tracking-widest hover:bg-[#ff2079]/80 transition-all"
              >
                {isMinting ? <><Loader2 className="animate-spin inline mr-2" /> Minting...</> : "Mint NFT (2 XRP Fee)"}
              </button>
            </div>
          ) : (
            <div className="text-center animate-fade-in">
              <CheckCircle className="w-16 h-16 mx-auto mb-6 text-green-500" />
              <h3 className="font-orbitron text-lg font-black uppercase mb-2">Minting Status</h3>
              {/* Veilige check voordat we substring aanroepen */}
              <p className="text-gray-500 text-xs mb-8 font-mono">
                {txResult.hash ? txResult.hash.substring(0, 20) + "..." : "Hash wordt verwerkt..."}
              </p>
              {txResult.hash && (
                <a 
                  href={`https://bithomp.com/explorer/${txResult.hash}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="block w-full border border-white/20 py-3 text-xs font-orbitron uppercase hover:bg-white hover:text-black transition-all"
                >
                  <ExternalLink className="inline mr-2" size={12} /> View op Bithomp
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* Rest van de tabs blijven ongewijzigd */}
      {activeSubTab === 'token_factory' && (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-lg">
          <Cpu className="w-12 h-12 mx-auto text-gray-700 mb-4" />
          <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">Token Factory under development</p>
        </div>
      )}
      {activeSubTab === 'yield_matrix' && (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-lg">
          <Landmark className="w-12 h-12 mx-auto text-gray-700 mb-4" />
          <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">Global Yield Matrix syncing...</p>
        </div>
      )}
    </div>
  );
}
