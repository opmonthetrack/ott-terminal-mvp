import { useState } from 'react';

interface LoginScreenProps {
  onLoginSuccess: (address: string) => void;
}

// 🔐 OTT Treasury (De Kluis) - Bestemming voor de 2 XRP Mint Fee
const OTT_TREASURY_ADDRESS = "rpLquEze1WAxBh2Y6op8J7bo3VNGCYBEsZ"; 
const OTT_TREASURY_TAG = 2606170002;
const CHALLENGE_SOURCE_TAG = 2606170002; 

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
            'X-API-Key': import.meta.env.VITE_XAMAN_API_KEY, 
            'X-API-Secret': import.meta.env.VITE_XAMAN_API_SECRET 
        },
        body: JSON.stringify({ 
          txjson: { 
            TransactionType: "Payment", 
            Destination: OTT_TREASURY_ADDRESS, 
            DestinationTag: OTT_TREASURY_TAG,
            SourceTag: CHALLENGE_SOURCE_TAG,
            Amount: "2000000" // 2000000 drops = 2 XRP
          } 
        })
      });

      const payload = await res.json();
      if (payload.refs?.qr_png) {
        setQrCodeUrl(payload.refs.qr_png);
        
        const ws = new WebSocket(payload.refs.websocket_status);
        ws.onmessage = (event) => {
          const msg = JSON.parse(event.data);
          if (msg.signed === true) {
            ws.close();
            setQrCodeUrl(null);
            setIsMinting(false);
            // Gebruiker is succesvol ingelogd na betaling
            onLoginSuccess(OTT_TREASURY_ADDRESS); 
          }
        };
      } else {
        throw new Error("Geen QR code ontvangen vanuit het netwerk.");
      }
    } catch (e) { 
      console.error(e);
      setIsMinting(false);
      alert("Er ging iets mis met de verbinding. Probeer het opnieuw of controleer de netwerkstatus.");
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white selection:bg-[#ff2079]/30">
      {/* Fallback tekst als er geen logo.png in de public map staat */}
      <img src="/logo.png" alt="OTT Logo" className="w-24 mb-6" onError={(e) => e.currentTarget.style.display = 'none'} />

      <div className="text-center space-y-4">
        <h1 className="font-orbitron text-2xl font-black uppercase tracking-[0.25em]">XRPL OTT TERMINAL</h1>
        <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">Stay humble, Stay positive, 589 steps ahead</p>
      </div>

      <div className="w-full max-w-md mt-12">
        {!qrCodeUrl ? (
          <button 
            onClick={handleMintPass} 
            className="w-full bg-white text-black py-4 font-orbitron font-black uppercase tracking-widest hover:bg-gray-200 transition-colors cursor-pointer"
          >
            {isMinting ? "VERWERKEN..." : "MINT ACCESS PASS (2 XRP)"}
          </button>
        ) : (
          <div className="bg-white p-2 rounded-lg text-center mx-auto w-fit">
            <img src={qrCodeUrl} className="w-48" alt="Scan met Xaman" />
            <p className="text-black text-[10px] font-mono mt-2 uppercase tracking-widest">Scan met Xaman</p>
          </div>
        )}
      </div>
    </div>
  );
}
