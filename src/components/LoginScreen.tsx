import { useState } from 'react';
import { Loader2, ShieldCheck, CreditCard } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (address: string) => void;
}

const OTT_ISSUER_ADDRESS = "rnz9im9849ztKyhe6nR5eeibDx3swosDjA"; 

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  // 1. NFT CHECK LOGICA (Op het adres dat we uit de sign-in krijgen)
  const verifyNFTOwnership = async (address: string) => {
    try {
      const response = await fetch('https://s1.ripple.com:51234/', {
        method: 'POST',
        body: JSON.stringify({
          method: "account_nfts",
          params: [{ account: address }]
        })
      });
      const data = await response.json();
      const hasAccessNFT = data.result?.account_nfts?.some(
        (nft: any) => nft.Issuer === OTT_ISSUER_ADDRESS
      );

      if (hasAccessNFT) {
        onLoginSuccess(address);
      } else {
        alert("Toegang geweigerd: Geen OTT Access Pass gevonden in deze wallet.");
      }
    } catch (e) {
      alert("Fout bij het checken van de Ledger. Probeer het opnieuw.");
    }
  };

  // 2. XAMAN SIGN-IN (Vervangt handmatig adres invoeren)
  const handleSignIn = async () => {
    setIsChecking(true);
    try {
      const res = await fetch('/xaman-api/platform/payload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': import.meta.env.VITE_XAMAN_API_KEY || '', 'x-api-secret': import.meta.env.VITE_XAMAN_API_SECRET || '' },
        body: JSON.stringify({ 
          txjson: { TransactionType: "SignIn" } // Xaman herkent dit als inlogverzoek
        })
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
            setIsChecking(false);
            const result = await fetch(`/xaman-api/platform/payload/${payload.uuid}`);
            const resultData = await result.json();
            const userAddress = resultData.response?.signer;
            verifyNFTOwnership(userAddress); // Check direct de NFT's
          }
        };
      }
    } catch (e) {
      setIsChecking(false);
      alert("Inloggen mislukt.");
    }
  };

  // 3. MINT LOGICA (Blijft hetzelfde)
  const handleMintPass = async () => {
    setIsMinting(true);
    try {
      const uriHex = "697066733a2f2f6261666b726569667734376d6f706b7737717134667070786b686763746879726a7667657235757972717962796a353261756e7168737a3263626d";
      const res = await fetch('/xaman-api/platform/payload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': import.meta.env.VITE_XAMAN_API_KEY || '', 'x-api-secret': import.meta.env.VITE_XAMAN_API_SECRET || '' },
        body: JSON.stringify({ txjson: { TransactionType: "NFTokenMint", NFTokenTaxon: 0, Flags: 8, URI: uriHex } })
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
            setIsMinting(false);
            alert("NFT succesvol gemint! Scan nu opnieuw om in te loggen.");
          }
        };
      }
    } catch (e) {
      setIsMinting(false);
      alert("Minting mislukt.");
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white selection:bg-[#ff2079]/30">
      <img src="/logo.png" alt="TruthOnTheTrack Logo" className="w-32 h-32 mb-8 object-contain" />
      
      <div className="text-center space-y-2 mb-12">
        <h1 className="font-orbitron text-2xl font-black uppercase tracking-[0.25em]">XRPL OTT TERMINAL</h1>
        <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">Sovereign Intelligence Engine</p>
      </div>

      <div className="w-full max-w-md space-y-4">
        {!qrCodeUrl ? (
          <>
            <button onClick={handleSignIn} disabled={isChecking} className="w-full bg-white text-black py-4 font-orbitron font-black uppercase tracking-widest hover:bg-gray-200 transition-all flex justify-center items-center gap-2">
              {isChecking ? <Loader2 className="animate-spin" size={16} /> : <><ShieldCheck size={16}/> SCAN QR & LOGIN</>}
            </button>
            <button onClick={handleMintPass} disabled={isMinting} className="w-full border border-white/20 py-4 font-orbitron uppercase tracking-widest hover:bg-white/5 transition-all flex justify-center items-center gap-2 text-gray-400">
              {isMinting ? <Loader2 className="animate-spin" size={16} /> : <><CreditCard size={16}/> MINT NIEUWE ACCESS PASS</>}
            </button>
          </>
        ) : (
          <div className="bg-white p-6 rounded-xl text-center">
            <img src={qrCodeUrl} className="w-48 mx-auto" alt="Scan met Xaman" />
            <p className="text-black text-xs mt-4 font-mono uppercase tracking-widest">Scan QR met Xaman</p>
          </div>
        )}
      </div>
    </div>
  );
}
