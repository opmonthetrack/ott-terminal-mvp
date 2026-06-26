import { ShieldCheck } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (address: string) => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  
  const handleBypassLogin = () => {
    // We simuleren een succesvolle login met een mock-adres
    // zodat je direct doorgaat naar de terminal-interface.
    onLoginSuccess("rDEBUG_MOCK_ADDRESS_123");
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white selection:bg-[#ff2079]/30">
      <img src="/logo.png" alt="TruthOnTheTrack Logo" className="w-32 h-32 mb-8 object-contain" />
      
      <h1 className="font-orbitron text-2xl font-black uppercase mb-12">XRPL OTT TERMINAL</h1>

      <div className="w-full max-w-md space-y-4">
        <button 
          onClick={handleBypassLogin} 
          className="w-full bg-white text-black py-4 font-orbitron font-black uppercase hover:bg-gray-200 transition-all flex justify-center items-center gap-2"
        >
          <ShieldCheck size={16}/> LOGIN (DEBUG MODE)
        </button>
        
        <p className="text-center text-white/30 text-xs font-mono mt-8 uppercase">
          Terminal Status: Offline / Debug Mode
        </p>
      </div>
    </div>
  );
}
