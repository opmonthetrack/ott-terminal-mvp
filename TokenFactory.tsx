import { useState } from 'react';
import { Loader2, Zap } from 'lucide-react';

export function TokenFactory() {
  const [compiledJson, setCompiledJson] = useState<string>(JSON.stringify({
    TransactionType: "NFTokenMint",
    Account: "rYourWalletAddressHere",
    NFTokenTaxon: 0,
    Flags: 8,
    SourceTag: 2606170002, // CRUCIAAL VOOR HET LEADERBOARD
    TransferFee: 0,
    URI: "68747470733a2f2f697066732e696f2f697066732f516d58...",
    Fee: "12"
  }, null, 2));

  const [isPushing, setIsPushing] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);

  const pushToXaman = async () => {
    if (!compiledJson) {
      alert("Payload is leeg!");
      return;
    }

    setIsPushing(true);
    try {
      const txData = JSON.parse(compiledJson);

      const res = await fetch('/xaman-api/platform/payload', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json', 
            'X-API-Key': import.meta.env.VITE_XAMAN_API_KEY, 
            'X-API-Secret': import.meta.env.VITE_XAMAN_API_SECRET 
        },
        body: JSON.stringify({ 
          txjson: txData 
        })
      });

      const response = await res.json();
      
      if (response.refs?.qr_png) {
        setQrCode(response.refs.qr_png);
      } else {
        throw new Error(response.message || "Geen QR-code ontvangen van Xaman");
      }
    } catch (error: any) {
      console.error("Push Error:", error);
      alert("Fout bij pushen naar Xaman: " + error.message);
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <div className="p-8 bg-black text-white min-h-screen">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-orbitron font-black uppercase tracking-widest mb-2">Token Factory</h1>
        <p className="text-gray-500 font-mono text-sm mb-8">Compile & Mint on XRPL Mainnet</p>

        <div className="border border-white/10 p-6 bg-gray-950/30 rounded-lg">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">
            Transaction JSON (Mainnet)
          </label>
          <textarea 
            className="w-full h-80 bg-black border border-white/20 p-4 font-mono text-xs text-green-400 focus:border-[#ff2079] outline-none transition-colors"
            value={compiledJson}
            onChange={(e) => setCompiledJson(e.target.value)}
          />
          
          <button 
            onClick={pushToXaman}
            disabled={isPushing}
            className="mt-6 w-full bg-[#ff2079] py-4 font-black uppercase tracking-widest hover:bg-opacity-80 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPushing ? (
              <><Loader2 className="animate-spin" /> VERWERKEN...</>
            ) : (
              <><Zap size={18} /> PUSH LEDGER SIGN REQUEST</>
            )}
          </button>
        </div>

        {qrCode && (
          <div className="mt-8 p-6 bg-white rounded-xl flex flex-col items-center">
            <img src={qrCode} alt="Xaman QR" className="w-64" />
            <p className="text-black mt-4 font-orbitron font-bold uppercase tracking-widest text-sm">Scan met Xaman</p>
          </div>
        )}
      </div>
    </div>
  );
}