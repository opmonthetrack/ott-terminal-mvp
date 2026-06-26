import { useState } from 'react';
import { Loader2, ShieldCheck, CreditCard } from 'lucide-react';

export function LoginScreen({ onLoginSuccess }: { onLoginSuccess: (addr: string) => void }) {
  const [isChecking, setIsChecking] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  const OTT_ISSUER_ADDRESS = "rnz9im9849ztKyhe6nR5eeibDx3swosDjA";

  const verifyNFTOwnership = async (address: string) => {
    setIsChecking(true);
    try {
      const response = await fetch('/api/check-nft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      });
      
      const json = await response.json();
      if (!json.success) throw new Error(json.error);
      
      const nfts = json.data?.result?.account_nfts || [];
      if (nfts.some((nft: any) => nft.Issuer === OTT_ISSUER_ADDRESS)) {
        onLoginSuccess(address);
      } else {
        alert("Geen Access Pass gevonden in deze wallet.");
      }
    } catch (e: any) {
      alert("Verificatie fout: " + e.message);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSignIn = async () => {
    setIsChecking(true);
    try {
      const res = await fetch('https://xumm.app/api/v1/platform/payload', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_XAMAN_API_KEY,
          'x-api-secret': import.meta.env.VITE_XAMAN_API_SECRET
        },
        body: JSON.stringify({ txjson: { TransactionType: "SignIn" } })
      });

      const payload = await res.json();
      
      if (payload.refs?.qr_png) {
        setQrCodeUrl(payload.refs.qr_png);
        window.open(payload.next.always, '_blank');
        
        const ws = new WebSocket(payload.refs.websocket_status);
        ws.onmessage = async (event) => {
          const msg = JSON.parse(event.data);
          if (msg.signed === true) {
            ws.close();
            setQrCodeUrl(null);
            
            const resultRes = await fetch(`https://xumm.app/api/v1/platform/payload/${payload.uuid}`, {
                headers: {
                    'x-api-key': import.meta.env.VITE_XAMAN_API_KEY,
                    'x-api-secret': import.meta.env.VITE_XAMAN_API_SECRET
                }
            });
            const resultData = await resultRes.json();
            verifyNFTOwnership(resultData.response?.signer);
          }
        };
      } else {
        throw new Error(payload.error || "Geen QR ontvangen");
      }
    } catch (e: any) {
      setIsChecking(false);
      alert("Inloggen mislukt: " + e.message);
    }
  };

  const handleMintPass = async () => {
    setIsMinting(true);
    try {
      const uriHex = "697066733a2f2f6261666b726569667734376d6f706b7737717134667070786b686763746879726a7667657235757972717962796a353261756e7168737a3263626d";
      const res = await fetch('https://xumm.app/api/v1/platform/payload', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_XAMAN_API_KEY,
          'x-api-secret': import.meta.env.VITE_XAMAN_API_SECRET
        },
        body: JSON.stringify({ 
            txjson: { TransactionType: "NFTokenMint", NFTokenTaxon: 0, Flags: 8, URI: uriHex } 
        })
      });
      const payload = await res.json();
      if (payload.refs?.qr_png) {
        setQrCodeUrl(payload.refs.qr_png);
        window.open(payload.next.always, '_blank');
        const ws = new WebSocket(payload.refs.websocket_status);
        ws.onmessage = (event) => {
          const msg = JSON.parse(event.data);
          if (msg.signed === true) {
            ws.close();
            setQrCodeUrl(null);
            setIsMinting(false);
            alert("NFT gemint!");
          }
        };
      } else {
        throw new Error(payload.error || "Geen QR ontvangen");
      }
    } catch (e: any) {
      setIsMinting(false);
      alert("Minting mislukt: " + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white selection:bg-[#ff2079]/30">
      <img src="/logo.png" alt="TruthOnTheTrack Logo" className="w-32 h-32 mb-8 object-contain" />
      
      <h1 className="font-orbitron text-2xl font-black uppercase mb-12">XRPL OTT TERMINAL</h1>
      <div className="w-full max-w-md space-y-4">
        {!qrCodeUrl ? (
          <>
            <button onClick={handleSignIn} disabled={isChecking} className="w-full bg-white text-black py-4 font-orbitron font-black uppercase hover:bg-gray-200 transition-all flex justify-center items-center gap-2">
              {isChecking ? <Loader2 className="animate-spin" size={16} /> : <><ShieldCheck size={16}/> SCAN QR & LOGIN</>}
            </button>
            <button onClick={handleMintPass} disabled={isMinting} className="w-full border border-white/20 py-4 font-orbitron uppercase hover:bg-white/5 transition-all flex justify-center items-center gap-2">
              {isMinting ? <Loader2 className="animate-spin" size={16} /> : <><CreditCard size={16}/> MINT ACCESS PASS</>}
            </button>
          </>
        ) : (
          <div className="bg-white p-6 rounded-xl text-center">
            <img src={qrCodeUrl} className="w-48 mx-auto" alt="Scan QR" />
            <p className="text-black text-xs mt-4 font-mono uppercase">Scan met Xaman</p>
          </div>
        )}
      </div>
    </div>
  );
}
