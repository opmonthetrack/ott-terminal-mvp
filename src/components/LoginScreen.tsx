import { useState } from 'react';
import { Loader2, ShieldCheck, CreditCard } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (address: string) => void;
}

// Jouw wallet-adres dat de NFT's uitgeeft (De Issuer)
const OTT_ISSUER_ADDRESS = "rnz9im9849ztKyhe6nR5eeibDx3swosDjA"; 

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  // 1. Validatie: Check of wallet de juiste NFT bezit via jouw proxy
  const verifyNFTOwnership = async (address: string) => {
    try {
      const response = await fetch('/api/check-nft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: address })
      });
      
      const data = await response.json();
      
      // Zoek naar NFT's uitgegeven door jouw adres
      const hasAccessNFT = data.result?.account_nfts?.some(
        (nft: any) => nft.Issuer === OTT_ISSUER_ADDRESS
      );

      if (hasAccessNFT) {
        onLoginSuccess(address);
      } else {
        alert("Toegang geweigerd: Geen geldige OTT Access Pass gevonden in deze wallet.");
      }
    } catch (e: any) {
      alert("Proxy fout: " + e.message);
    } finally {
      setIsChecking(false);
    }
  };

  // 2. Xaman Login: QR genereren voor Sign-In
  const handleSignIn = async () => {
    setIsChecking(true);
    try {
      const res = await fetch('/xaman-api/platform/payload', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'x-api-key': import.meta.env.VITE_XAMAN_API_KEY || '', 
          'x-api-secret': import.meta.env.VITE_XAMAN_API_SECRET || '' 
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
            const result = await fetch(`/xaman-api/platform/payload/${payload.uuid}`);
            const resultData = await result.json();
            verifyNFTOwnership(resultData.response?.signer);
          }
        };
      }
    } catch (e) {
      setIsChecking(false);
      alert("Inloggen mislukt.");
    }
  };

  // 3. Minting Flow
  const handleMintPass = async () => {
    setIsMinting(true);
    try {
      // Hex voor ipfs://bafkreifw47mopkw7qq4fppxkhgcthyrjvger5uyrqybyj52aunqhsz2cbm
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
        setQrCodeUrl(payload.refs.qr_png);
        window.open(payload.next.always, '_blank');
        
        const ws = new WebSocket(payload.refs.websocket_status);
        ws.onmessage = async (event) => {
          const msg = JSON.parse(event.data);
          if (msg.signed === true) {
            ws.close();
            setQrCodeUrl(null);
            setIsMinting(false);
            alert("NFT gemint! Scan nu opnieuw om in te loggen.");
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
      <p className="mt-8 text-[10px] text-gray-600 uppercase font-mono">Stay humble, Stay positive, 589 steps ahead</p>
    </div>
  );
}
