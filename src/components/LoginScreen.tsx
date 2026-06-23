import { motion, AnimatePresence } from 'motion/react';
import { Loader2, X, Hexagon, Coins } from 'lucide-react';
import { useState } from 'react';

interface LoginScreenProps {
  onLogin: () => void;
  isMinting: boolean;
}

function OttLogoFull() {
  return (
    <div className="flex flex-col items-center mb-10">
      <div className="flex flex-col items-center mb-6">
        <svg viewBox="0 0 100 100" className="h-16 w-16 mb-4 text-white" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 30,15 C 15,15 15,40 5,50 C 15,60 15,85 30,85" />
          <path d="M 70,15 C 85,15 85,40 95,50 C 85,60 85,85 70,85" />
          <path d="M 36,33 L 50,45 L 64,33" />
          <path d="M 36,67 L 50,55 L 64,67" />
        </svg>
        <h2 className="font-orbitron font-bold text-xl tracking-[0.2em] uppercase text-white mb-4 text-center">
          XRPL OTT Terminal
        </h2>
      </div>
      <h1 className="font-orbitron font-black text-5xl tracking-[0.1em] uppercase text-ott-gradient">
        ONTHETRACK
      </h1>
      <div className="font-sans font-bold text-xs tracking-[0.5em] uppercase text-ott-gradient mt-3">
        We got your back
      </div>
    </div>
  );
}

export function LoginScreen({ onLogin, isMinting }: LoginScreenProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handlePaymentSelect = () => {
    setShowPaymentModal(false);
    onLogin();
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center font-sans relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute inset-0 bg-ott-gradient opacity-10 blur-[150px] mix-blend-screen pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-xl w-full p-8 flex flex-col items-center text-center relative z-10"
      >
        <OttLogoFull />
        
        <p className="mb-10 text-gray-300 text-sm tracking-wide font-sans max-w-sm">
          Access restricted. Connect Xaman Wallet to initialize your terminal.
        </p>

        <div className="w-full max-w-sm space-y-4">
          <button
            onClick={() => setShowPaymentModal(true)}
            disabled={isMinting}
            className="group relative w-full bg-black py-5 px-6 text-white uppercase tracking-widest font-orbitron text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center h-16 border-none outline-none cursor-pointer"
          >
            {/* Subtle pulsating full-color gradient glow border/background */}
            <div className="absolute inset-0 bg-ott-gradient opacity-80 group-hover:opacity-100 transition-opacity animate-pulse" style={{ padding: '2px', borderRadius: '4px' }}>
              <div className="w-full h-full bg-black group-hover:bg-opacity-80 transition-all rounded-[2px]" />
            </div>
            
            <div className="absolute inset-0 bg-ott-gradient opacity-0 group-hover:opacity-20 transition-opacity blur-xl rounded-lg" />

            {isMinting ? (
              <span className="relative z-10 flex items-center space-x-3 text-white">
                <Loader2 className="w-5 h-5 animate-spin text-[#a855f7]" />
                <span className="text-ott-gradient">Minting Access Pass...</span>
              </span>
            ) : (
              <span className="relative z-10 flex items-center space-x-2">
                <span className="text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-ott-gradient transition-all">Mint Access Pass</span>
              </span>
            )}
          </button>

          <button
            onClick={onLogin}
            className="group relative w-full bg-black py-4 px-6 text-white uppercase tracking-widest font-orbitron text-sm font-bold transition-all flex justify-center items-center h-14 border-none outline-none cursor-pointer"
          >
            {/* Subtle blue gradient glow border/background */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#3052FF] to-[#00A4FF] opacity-50 group-hover:opacity-100 transition-opacity" style={{ padding: '2px', borderRadius: '4px' }}>
              <div className="w-full h-full bg-black group-hover:bg-opacity-90 transition-all rounded-[2px]" />
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-r from-[#3052FF] to-[#00A4FF] opacity-0 group-hover:opacity-20 transition-opacity blur-xl rounded-lg" />

            <span className="relative z-10 flex items-center space-x-3">
              <svg viewBox="0 0 400 400" className="w-5 h-5 text-white group-hover:text-[#3052FF] transition-colors" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M200 0C89.54 0 0 89.54 0 200C0 310.46 89.54 400 200 400C310.46 400 400 310.46 400 200C400 89.54 310.46 0 200 0ZM288.66 142.66L182 249.32C178.1 253.22 172.98 255.38 167.58 255.38C162.18 255.38 157.06 253.22 153.16 249.32L111.34 207.5C103.54 199.7 103.54 187.04 111.34 179.24C119.14 171.44 131.8 171.44 139.6 179.24L167.58 207.22L260.4 114.4C268.2 106.6 280.86 106.6 288.66 114.4C296.46 122.2 296.46 134.86 288.66 142.66Z" />
              </svg>
              <span className="group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[white] group-hover:to-[#3052FF] transition-all">Login with Xaman</span>
            </span>
          </button>
        </div>
      </motion.div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-black border border-gray-800 p-8 max-w-md w-full relative"
            >
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-8">
                <Coins className="w-10 h-10 text-[#2b82ff] mx-auto mb-4" />
                <h3 className="font-orbitron font-bold text-xl uppercase tracking-widest text-white mb-2">Acquire Access Pass</h3>
                <p className="text-gray-400 text-sm font-sans mb-4">
                  Select payment asset to mint your lifetime sovereign terminal pass. Constant value of <span className="text-white font-bold">€10</span>.
                </p>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={handlePaymentSelect}
                  className="w-full flex justify-between items-center bg-gray-900 border border-gray-800 hover:border-[#2b82ff] p-4 group transition-all cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <Hexagon className="w-6 h-6 text-[#2b82ff] fill-[#2b82ff]/20" />
                    <span className="font-orbitron font-bold text-white uppercase tracking-wider">Pay with XRP</span>
                  </div>
                  <span className="font-mono text-gray-400 group-hover:text-white transition-colors">~19.5 XRP</span>
                </button>

                <button 
                  onClick={handlePaymentSelect}
                  className="w-full flex justify-between items-center bg-gray-900 border border-gray-800 hover:border-[#a855f7] p-4 group transition-all cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <Coins className="w-6 h-6 text-[#a855f7] fill-[#a855f7]/20" />
                    <span className="font-orbitron font-bold text-white uppercase tracking-wider">Pay with RLUSD</span>
                  </div>
                  <span className="font-mono text-gray-400 group-hover:text-white transition-colors">10.8 RLUSD</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
