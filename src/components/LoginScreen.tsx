import { useState } from 'react';

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
      // API call
      const res = await fetch('/xaman-api/platform/payload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': import.meta.env.VITE_XAMAN_API_KEY || '', 'X-API-Secret': import.meta.env.VITE_XAMAN_API_SECRET || '' },
        body: JSON.stringify({ txjson: { TransactionType: "Payment", Destination: OTT_TREASURY_ADDRESS, Amount: "2000000" } })
      });

      const payload = await res.json();
      
      if (payload.refs?.qr_png) {
        setQrCodeUrl(payload.refs.qr_png);
        
        const ws = new WebSocket(payload.refs.websocket_status);
        ws.onmessage = async (event) => {
          const msg = JSON.parse(event.data);
          console.log("Xaman WebSocket bericht:", msg); // DIT IS JE DEBUG LOG
          
          if (msg.signed === true) {
            ws.close();
            // Haal adres op
            const result = await fetch(`/xaman-api/platform/payload/${payload.uuid}`);
            const resultData = await result.json();
            const userAddress = resultData.response?.signer || "rTEST_WALLET_ADDRESS"; // Fallback voor test
            
            console.log("Inloggen succesvol met:", userAddress);
            onLoginSuccess(userAddress); 
          }
        };
      }
    } catch (e) { 
      console.error("Fout:", e);
      setIsMinting(false);
      alert("Er ging iets mis met de verbinding. Probeer het opnieuw.");
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white">
      {/* Fallback logo als afbeelding mist */}
      <div className="w-24 h-24 bg-white flex items-center justify-center font-black text-black font-orbitron mb-6 text-2xl">OTT</div>
      
      <h1 className="font-orbitron text-2xl font-black uppercase tracking-[0.25em] mb-12">XRPL OTT TERMINAL</h1>
      
      {!qrCodeUrl ? (
        <button onClick={handleMintPass} className="bg-white text-black py-4 px-8 font-bold uppercase tracking-widest hover:bg-gray-200 transition-all">
          {isMinting ? "VERBINDEN..." : "MINT ACCESS PASS (2 XRP)"}
        </button>
      ) : (
        <div className="bg-white p-4 rounded-xl text-center">
            <img src={qrCodeUrl} className="w-48 mx-auto" alt="Scan met Xaman" />
            <p className="text-black text-xs mt-2 font-mono">Scan met Xaman</p>
        </div>
      )}
    </div>
  );
}
