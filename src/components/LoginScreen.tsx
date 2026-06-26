import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (address: string) => void;
}

const OTT_TREASURY_ADDRESS = "rpLquEze1WAxBh2Y6op8J7bo3VNGCYBEsZ";

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);

  const handleMintPass = async () => {
    setIsMinting(true);
    try {
      const res = await fetch('/xaman-api/platform/payload', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'x-api-key': import.meta.env.VITE_XAMAN_API_KEY || '', 
          'x-api-secret': import.meta.env.VITE_XAMAN_API_SECRET || '' 
        },
        body: JSON.stringify({ 
          txjson: { 
            TransactionType: "Payment", 
            Destination: OTT_TREASURY_ADDRESS, 
            Amount: "2000000" 
          } 
        })
      });

      const payload = await res.json();
      if (payload.refs?.qr_png) {
        setQrCodeUrl(payload.refs.qr_png);
        const ws = new WebSocket(payload.refs.websocket_status);
        ws.onmessage = async (event) => {
          const msg = JSON.parse(event.data);
          if (msg.signed === true) {
            ws.close();
            const result = await fetch(`/xaman-api/platform/payload/${payload.uuid}`);
            const resultData = await result.json();
            onLoginSuccess(resultData.response?.signer || "rTEST_WALLET_ADDRESS"); 
          }
        };
      }
    } catch (e) { 
      setIsMinting(false);
      alert("Fout bij verbinden met Xaman.");
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white">
      {/* HIER WORDT JE ECHTE LOGO GELADEN */}
      <img src="/logo.png" alt="TruthOnTheTrack Logo" className="w-32 h-32 mb-8 object-contain" />
      
      <div className="text-center space-y-2 mb-12">
        <h1 className="font-orbitron text-2xl font-black uppercase tracking-[0.25em]">XRPL OTT TERMINAL</h1>
      </div>

      <div className="w-full max-w-md">
        {!qrCodeUrl ? (
          <button onClick={handleMintPass} disabled={isMinting} className="w-full bg-white text-black py-4 font-orbitron font-black uppercase tracking-widest hover:bg-gray-200 transition-all flex justify-center items-center gap-2">
            {isMinting ? <><Loader2 className="animate-spin" size={16} /> VERWERKEN...</> : "MINT ACCESS PASS (2 XRP)"}
          </button>
        ) : (
          <div className="bg-white p-4 rounded-xl text-center">
            <img src={qrCodeUrl} className="w-48 mx-auto" alt="Scan met Xaman" />
            <p className="text-black text-xs mt-4 font-mono uppercase tracking-widest">Scan QR met Xaman</p>
          </div>
        )}
      </div>
    </div>
  );
}
