import { motion, AnimatePresence } from 'motion/react';
import { Send, Triangle, Cpu, Terminal as TermIcon, ShieldCheck, Activity, MessageSquareText, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';

export function ChatAgent() {
  const [isOpen, setIsOpen] = useState(false);
  // Chatgeschiedenis initialiseren
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'agent', text: 'OTT Oracle v1.0 online. X402 micro-payment state channel opened with wallet node rOTT...fUzg.' }
  ]);
  const [input, setInput] = useState('');
  
  // Live X402 Drops teller simuleren
  const [dropsConsumed, setDropsConsumed] = useState(1);
  const [isTyping, setIsTyping] = useState(false);
  
  // Automatisch naar beneden scrollen bij nieuwe berichten
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Slimme, deterministische antwoord-matrix op basis van de OTT-pijlers
  const getOracleResponse = (query: string): string => {
    const q = query.toLowerCase();
    
    if (q.includes('mica') || q.includes('compliance') || q.includes('shield')) {
      return "OTT COMPLIANCE SHIELD ANALYTICS: Cross-referencing token address parameters with European MiCA regulatory framework metrics. Scanning issuer contract accounts for blackholed validation status. Fugazi risks successfully isolated.";
    }
    if (q.includes('fugazi') || q.includes('scam')) {
      return "SECURITY RISK DETECTED: Low liquidity depth, spoofed transactional volume, and un-blackholed issuer keys identified on the ledger layer. Activating protective compliance parameters to stay 589 steps ahead.";
    }
    if (q.includes('doppler') || q.includes('anodos') || q.includes('yield')) {
      return "LIQUIDITY METRICS: Doppler Finance smart order routers and Anodos automated market hooks are reporting optimized liquidity paths on the RLUSD stablecoin pairs. Recommended node routing: EUR/RLUSD Treasury Hub.";
    }
    if (q.includes('x402') || q.includes('payment') || q.includes('drop')) {
      return "X402 PROTOCOL MATRIX: Machine-to-machine streaming data engine active. Each processing query executes an atomic ledger settlement of exactly 1 Drop (0.000001 XRP/RLUSD) through your private unidirectional channel layer. Zero latency.";
    }
    if (q.includes('health') || q.includes('detox') || q.includes('energy')) {
      return "BIOMETRIC RESTORATION SYSTEMS: Holistic data alignment check active. True systemic awareness requires cellular detoxification and complete emancipation from toxic structural and energetic architecture. Re-centering energy matrix.";
    }
    if (q.includes('xrp') || q.includes('ledger') || q.includes('xahau')) {
      return "LEDGER SYNCHRONIZATION: XRPL core AMM liquidity networks and Xahau Smart Hooks verified. System status nominal. Ready to deploy secondary trustline optimization protocols.";
    }
    
    // Standaard OTT Filosofie antwoord
    return "ORACLE INTELLIGENCE: On-chain telemetry and operational metrics fully analyzed. Patterns recognize system manipulation vectors. Recommendation: Maintain frequency. Stay humble, stay positive—OnTheTrack we got your back.";
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    const currentQuery = input;
    setInput('');
    setIsTyping(true);

    // Verhoog de X402 drops teller live bij elke query!
    setDropsConsumed(prev => prev + 1);

    // Simuleer denk-tijd van het cryptografische orakel
    setTimeout(() => {
      setIsTyping(false);
      const responseText = getOracleResponse(currentQuery);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'agent',
          text: responseText
        }
      ]);
    }, 1200);
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 flex items-center justify-center p-[1px] bg-ott-gradient group z-50 hover:shadow-[0_0_20px_rgba(43,130,255,0.4)] transition-all shadow-[0_0_10px_rgba(43,130,255,0.2)]"
          >
            <div className="bg-black p-3 flex items-center space-x-2 group-hover:bg-opacity-80 transition-all h-full w-full">
              <MessageSquareText className="w-5 h-5 text-white" />
              <span className="font-orbitron text-xs font-bold uppercase tracking-wider text-transparent bg-clip-text bg-ott-gradient pr-2">OTT Oracle</span>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 w-[calc(100vw-3rem)] sm:w-80 lg:w-96 border border-transparent bg-ott-gradient p-[1px] flex flex-col h-[450px] max-h-[80vh] shadow-[0_0_20px_rgba(43,130,255,0.15)] z-50"
          >
            <div className="bg-black flex flex-col h-full w-full font-sans text-sm text-white">
              
              {/* Header van het Orakel */}
              <div className="border-b border-gray-800 p-3 flex items-center justify-between bg-black text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-ott-gradient opacity-20" />
                <div className="flex items-center space-x-2 relative z-10">
                  <Triangle className="w-4 h-4 text-white fill-white" />
                  <span className="font-orbitron text-xs font-bold uppercase tracking-wider text-transparent bg-clip-text bg-ott-gradient">OTT Oracle Node</span>
                </div>
                <div className="flex items-center space-x-4 relative z-10">
                  <div className="flex items-center space-x-2">
                    <div className="text-[10px] uppercase font-mono border border-[#ff2079]/30 bg-[#ff2079]/5 px-2 py-0.5 text-[#ff2079] hidden md:block">
                      X402 Streaming
                    </div>
                    <div className="w-2 h-2 rounded-full bg-[#ff2079] animate-pulse shadow-[0_0_8px_#ff2079]" />
                  </div>
                  <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors cursor-pointer ml-2">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Live Ledger Ticker (Uniek voor X402 demonstratie) */}
              <div className="bg-gray-950 border-b border-gray-900 px-4 py-2 flex justify-between items-center font-mono text-[10px] text-gray-500">
                <div className="flex items-center space-x-1.5">
                  <Cpu className="w-3 h-3 text-[#2b82ff]" />
                  <span>Channel: rOTT...fUzg</span>
                </div>
                <div className="text-right text-white">
                  Settled: <span className="text-[#2b82ff] font-bold">{dropsConsumed}</span> Drops
                </div>
              </div>

              {/* Chat Venster */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/90">
                {messages.map(m => (
                  <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className={`max-w-[85%] p-3 text-xs leading-relaxed border ${
                        m.sender === 'user' 
                          ? 'border-[#a855f7]/30 bg-[#a855f7]/10 text-white font-medium' 
                          : 'border-gray-800 bg-gray-950/80 text-gray-300'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
                
                {/* Typen-animatie simulatie */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="border border-gray-900 bg-gray-950/40 p-3 text-xs text-gray-500 flex items-center space-x-2 font-mono">
                      <Activity className="w-3 h-3 animate-spin text-[#a855f7]" />
                      <span>Computing layer execution...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Formulier en Betalingsbalk */}
              <div className="p-3 border-t border-gray-800 bg-black relative">
                <form onSubmit={handleSend} className="flex space-x-2 relative">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Query matrix..."
                    className="flex-1 w-full min-w-0 bg-gray-950 border border-gray-800 focus:border-[#a855f7] outline-none px-3 py-2 text-xs text-white placeholder-gray-600 transition-colors relative z-10 font-mono"
                  />
                  <button type="submit" className="shrink-0 border border-gray-800 p-2 hover:border-[#ff2079] hover:text-[#ff2079] transition-colors focus:border-[#ff2079] focus:text-[#ff2079] outline-none text-gray-500 bg-black relative z-10 group cursor-pointer">
                    <Send className="w-3 h-3 group-hover:fill-[#ff2079]/20" />
                  </button>
                </form>
                <div className="text-[9px] text-gray-600 mt-2 font-mono text-center">
                  M2M Settlement active: <span className="text-gray-400 font-bold">0.000001 XRP</span> per query.
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
