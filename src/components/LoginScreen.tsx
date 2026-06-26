import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (address: string) => void;
}

// OTT Treasury: Hier komt de 2 XRP minting fee binnen
const OTT_TREASURY_ADDRESS = "rpLquEze1WAxBh2Y6op8J7bo3VNGCYBEsZ"; 

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);

  const handleMintPass = async () => {
    setIsMinting(true);
    try {
      // 1. Payload aanmaken via de Xaman API
      const res = await fetch('/xaman-api/platform/payload', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json', 
            'X-API-Key': import.meta.env.VITE_XAMAN_API_KEY || '', 
            'X-API-Secret': import.meta.env.VITE_XAMAN_API_SECRET || '' 
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
        
        // 2. Wacht tot gebruiker signeert
        const ws = new WebSocket(payload.refs.websocket_status);
        ws.onmessage = async (event) => {
          const msg = JSON.parse(event.data);
          if (msg.signed === true) {
            ws.close();
            
            // 3. Haal gebruiker-adres op na succesvolle betaling
            const result = await fetch(`/xaman-api/platform/payload/${payload.uuid}`);
            const resultData = await result.json();
            const userAddress = resultData.response?.signer; 
            
            setQrCodeUrl(null);
            setIsMinting(false);
            onLoginSuccess(userAddress); // Geef adres door aan Dashboard
          }
        };
      } else {
        throw new Error("Geen QR ontvangen");
      }
    } catch (e) { 
      console.error(e);
      setIsMinting(false);
      alert("Er ging iets mis. Controleer je Xaman API Keys in Vercel.");
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white selection:bg-[#ff2079]/30">
      <h1 className="font-orbitron text-2xl font-black uppercase tracking-[0.25em] mb-12">XRPL OTT TERMINAL</h1>
      
      <div className="w-full max-w-md">
        {!qrCodeUrl ? (
          <button 
            onClick={handleMintPass} 
            disabled={isMinting}
            className="w-full bg-white text-black py-4 font-orbitron font-black uppercase tracking-widest hover:bg-gray-200 transition-all cursor-pointer flex justify-center items-center gap-2"
          >
            {isMinting ? (
              <> <Loader2 className="animate-spin" size={16} /> VERWERKEN... </>
            ) : (
              "MINT ACCESS PASS (2 XRP)"
            )}
          </button>
        ) : (
          <div className="bg-white p-4 rounded-xl text-center">
            <img src={qrCodeUrl} className="w-48 mx-auto" alt="Scan met Xaman" />
            <p className="text-black text-xs mt-4 font-mono uppercase">Scan QR met Xaman om te valideren</p>
          </div>
        )}
      </div>
    </div>
  );
}
