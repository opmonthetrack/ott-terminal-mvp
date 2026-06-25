import { useState } from 'react';
import { Loader2, Zap } from 'lucide-react';

export function TokenFactory() {
  const [uri, setUri] = useState<string>(''); 
  const [isPushing, setIsPushing] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);

  const stringToHex = (str: string) => {
    return Array.from(str).map(c => c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')).join('');
  };

  const pushToXaman = async () => {
    if (!uri) { alert("Vul een IPFS URI in!"); return; }
    
    setIsPushing(true);
    try {
      const txData = {
        TransactionType: "NFTokenMint",
        Account: "rGAs3npYy1VwLPE92kvKvA2QYLR6FSA9n6", 
        NFTokenTaxon: 0,
        Flags: 8,
        SourceTag: 2606170002, // Hackathon tracking
        TransferFee: 500,
        URI: stringToHex(uri),
        Fee: "12"
      };

      const res = await fetch('/xaman-api/platform/payload', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json', 
            'X-API-Key': import.meta.env.VITE_XAMAN_API_KEY, 
            'X-API-Secret': import.meta.env.VITE_XAMAN_API_SECRET 
        },
        body: JSON.stringify({ txjson: txData })
      });

      const response = await res.json();
      
      if (response.refs?.qr_png) {
        setQrCode(response.refs.qr_png);
      } else {
        throw new Error(response.message || "Xaman weigerde de payload");
      }
    } catch (error: any) {
      console.error("Push Error:", error);
      alert("Mint Fout: " + error.message);
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <div className="p-8 bg-black text-white min-h-screen">
      <h1 className="text-2xl font-orbitron font-black uppercase tracking-widest mb-8">Token Factory</h1>
      
      <div className="border border-white/10 p-6 bg-gray-950/30 rounded-lg max-w-xl">
        <div className="mb-4 flex justify-between text-[10px] font-mono text-gray-500 uppercase">
          <span>Service Fee</span>
          <span>2 XRP</span>
        </div>
        
        <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">IPFS CID / URI</label>
        <input 
          type="text"
          className="w-full bg-black border border-white/20 p-4 font-mono text-xs text-white"
          value={uri}
          onChange={(e) => setUri(e.target.value)}
          placeholder="ipfs://..."
        />
        
        <button 
          onClick={pushToXaman}
          disabled={isPushing}
          className="mt-6 w-full bg-[#ff2079] py-4 font-black uppercase hover:bg-opacity-80 transition-all flex items-center justify-center gap-2"
        >
          {isPushing ? <><Loader2 className="animate-spin" /> VERWERKEN...</> : <><Zap size={18} /> MINT NFT (2 XRP FEE)</>}
        </button>
      </div>

      {qrCode && (
        <div className="mt-8 p-6 bg-white w-fit mx-auto">
          <img src={qrCode} className="w-64" alt="Scan met Xaman" />
          <p className="text-black text-center mt-2 font-bold font-mono text-xs uppercase">Scan met Xaman</p>
        </div>
      )}
    </div>
  );
}