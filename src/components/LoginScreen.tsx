import { ShieldCheck, Terminal, WifiOff } from "lucide-react";

interface LoginScreenProps {
  onLoginSuccess: (address: string) => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const handleBypassLogin = () => {
    // Tijdelijke debug-login.
    // Hiermee kunnen we de binnenkant van de terminal bouwen
    // zonder dat Xaman-login nu al perfect hoeft te werken.
    onLoginSuccess("rDEBUG_MOCK_ADDRESS_123");
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white selection:bg-white/20">
      <div className="w-full max-w-md flex flex-col items-center">
        <img
          src="/logo.png"
          alt="OnTheTrack Logo"
          className="w-32 h-32 mb-8 object-contain"
        />

        <div className="flex items-center gap-2 mb-4 text-white/50">
          <Terminal size={18} />
          <span className="font-mono text-xs uppercase tracking-[0.35em]">
            Make Waves MVP
          </span>
        </div>

        <h1 className="font-orbitron text-3xl font-black uppercase text-center leading-tight mb-3">
          XRPL OnTheTrack Terminal
        </h1>

        <p className="text-center text-white/50 text-sm font-mono mb-10 leading-relaxed">
          The Home Screen of the XRP Ledger.
          <br />
          Debug mode actief voor dashboard ontwikkeling.
        </p>

        <div className="w-full space-y-4">
          <button
            onClick={handleBypassLogin}
            className="w-full bg-white text-black py-4 font-orbitron font-black uppercase hover:bg-gray-200 transition-all flex justify-center items-center gap-2"
          >
            <ShieldCheck size={16} />
            Open Terminal
          </button>

          <div className="border border-white/10 p-4 flex items-start gap-3">
            <WifiOff size={18} className="text-white/40 mt-0.5" />
            <div>
              <p className="font-orbitron text-xs uppercase text-white/70 mb-1">
                Xaman Login tijdelijk uit
              </p>
              <p className="font-mono text-xs text-white/35 leading-relaxed">
                We bouwen nu eerst de binnenkant van de app. Later zetten we de
                echte Xaman-connectie weer veilig aan.
              </p>
            </div>
          </div>

          <p className="text-center text-white/25 text-xs font-mono mt-8 uppercase">
            Terminal Status: Offline / Debug Mode
          </p>
        </div>
      </div>
    </div>
  );
}
