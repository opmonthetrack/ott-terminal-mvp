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
      // 1. API Call met verplichte kleine letters in headers om 403 error te voorkomen
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
        
        // 2. WebSocket luisteren naar ondertekening
        const ws = new WebSocket(payload.refs.websocket_status);
        ws.onmessage = async (event) => {
          const msg = JSON.parse(event.data);
          
          if (msg.signed === true) {
            ws.close();
            
            // 3. Gebruikersadres ophalen
            const result = await fetch(`/xaman-api/platform/payload/${payload.uuid}`);
            const resultData = await result.json();
            const userAddress = resultData.response?.signer || "rTEST_WALLET_ADDRESS";
            
            setQrCodeUrl(null);
            setIsMinting(false);
            onLoginSuccess(userAddress); 
          }
        };
      } else {
        throw new Error("Geen QR code ontvangen.");
      }
    } catch (e) { 
      console.error("Fout bij payload:", e);
      setIsMinting(false);
      alert("Fout bij verbinden met Xaman. Controleer API sleutels in Vercel.");
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white selection:bg-[#ff2079]/30">
      {/* FALLBACK LOGO: Zichtbaar als /logo.png niet laadt */}
      <div className="w-24 h-24 bg-white flex items-center justify-center font-black text-black font-orbitron mb-6 text-2xl rounded-sm">OTT</div>
      
      <div className="text-center space-y-4 mb-12">
        <h1 className="font-orbitron text-2xl font-black uppercase tracking-[0.25em]">XRPL OTT TERMINAL</h1>
        <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">Stay humble, Stay positive, 589 steps ahead</p>
      </div>

      <div className="w-full max-w-md">
        {!qrCodeUrl ? (
          <button 
            onClick={handleMintPass} 
            disabled={isMinting}
            className="w-full bg-white text-black py-4 font-orbitron font-black uppercase tracking-widest hover:bg-gray-200 transition-all cursor-pointer flex justify-center items-center gap-2"
          >
            {isMinting ? (
              <> <Loader2 className="animate-spin" size={16} /> VERBINDEN... </>
            ) : (
              "MINT ACCESS PASS (2 XRP)"
            )}
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
