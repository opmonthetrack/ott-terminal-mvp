import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { GraduationCap, Award, Brain, Zap, BookOpen, ShieldAlert, Cpu, CheckCircle2, Triangle, Sparkles, Download, ShoppingBag, Coins, Loader2, AlertOctagon, Ticket } from 'lucide-react';

interface AcademyTabProps {
  onClaimGlobal: () => void;
}

export function AcademyTab({ onClaimGlobal }: AcademyTabProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'xls' | 'xaman' | 'core'>('all');
  const [completedModules, setCompletedModules] = useState<string[]>(["core-1"]);
  const [claimingModuleId, setClaimingModuleId] = useState<string | null>(null);

  // --- PLATFORM SECURITY STATE (JOUW ANTI-DUMPING ENGINE) ---
  const [isWalletRestricted, setIsWalletRestricted] = useState(false);
  const [ticketRequested, setTicketRequested] = useState(false);
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  // --- MARKETPLACE STATE ---
  const [purchasedChapters, setPurchasedChapters] = useState<string[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<{ [key: string]: 'OTT' | 'XRP' | 'RLUSD' }>({
    "ch-1": "OTT", "ch-2": "OTT", "ch-3": "OTT"
  });
  const [isBuyingId, setIsBuyingId] = useState<string | null>(null);
  const [purchaseStatus, setPurchaseStatus] = useState<'idle' | 'signing' | 'success'>('idle');

  // L2E Modules
  const academyModules = [
    { id: "core-1", category: "core", title: "XRPL Core: Ledger Fundamentals", description: "Understand consensus and trustlines.", reward: 50 },
    { id: "xaman-1", category: "xaman", title: "Xaman Wallet Mastery", description: "Deep dive into secure key custody and signing.", reward: 100 },
    { id: "xls-20", category: "xls", title: "XLS-20: Native NFTs on XRPL", description: "Learn native minting and metadata structure.", reward: 150 },
    { id: "xls-30", category: "xls", title: "XLS-30d: Native AMM Mechanics", description: "Deconstruct continuous auction liquidity.", reward: 200 }
  ];

  // --- JOUW GEWENSCHTE EN ONTLEDEN HEARTH BOOK STRUCTUUR ---
  const hearthBookChapters = [
    {
      id: "ch-1",
      title: "The Hearth Book - Vol. I (Chapter 1)",
      subtitle: "Decoded Symbolism & Ancestral Frequency",
      description: "Unlocking the ancient wisdom strings and understanding how words act as direct vibratory creators of your reality.",
      prices: { OTT: 75, XRP: 15, RLUSD: 8 }
    },
    {
      id: "ch-2",
      title: "The Hearth Book - Vol. I (Chapter 2)",
      subtitle: "The Toxic Architecture",
      description: "A deep structural analysis parsing how corporate financial systems and modern chemical nutrition cage human consciousness.",
      prices: { OTT: 100, XRP: 20, RLUSD: 10 }
    },
    {
      id: "ch-3",
      title: "The Hearth Book - Vol. I (Chapter 3)",
      subtitle: "Cellular Emancipation",
      description: "Practical biometric protocols regarding deep tissue detoxification, advanced supplement matching, and energetic grid resetting.",
      prices: { OTT: 125, XRP: 25, RLUSD: 12 }
    }
  ];

  const filteredModules = activeCategory === 'all' ? academyModules : academyModules.filter(m => m.category === activeCategory);

  const handleExecuteAirdrop = (id: string) => {
    setClaimingModuleId(id);
    setTimeout(() => {
      setCompletedModules(prev => [...prev, id]);
      setClaimingModuleId(null);
      onClaimGlobal();
    }, 1200);
  };

  const handlePurchaseChapter = (id: string) => {
    if (isWalletRestricted) return; // Blokeer aankopen als wallet restricted is!
    setIsBuyingId(id);
    setPurchaseStatus('signing');
    setTimeout(() => {
      setPurchaseStatus('success');
      setTimeout(() => {
        setPurchasedChapters(prev => [...prev, id]);
        setIsBuyingId(null);
        setPurchaseStatus('idle');
      }, 1200);
    }, 1500);
  };

  const handleRequestTicket = () => {
    setIsSubmittingTicket(true);
    setTimeout(() => {
      setIsSubmittingTicket(false);
      setTicketRequested(true);
    }, 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 max-w-5xl font-sans text-white">
      
      {/* 🛡️ JOUW ANTI-DUMP SIMULATOR CONTROL PANEL (DEMO GOUD) */}
      <div className="border border-gray-800 bg-gray-950/40 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="text-xs font-mono text-gray-500 uppercase tracking-widest">Jury Demonstration Modus</div>
          <h4 className="font-orbitron text-xs font-bold uppercase text-white mt-1">Anti-Dump & Platform Gating Validator</h4>
        </div>
        <button 
          onClick={() => {
            setIsWalletRestricted(!isWalletRestricted);
            if(isWalletRestricted) setTicketRequested(false);
          }}
          className={`px-4 py-2 text-[10px] font-orbitron uppercase tracking-widest font-bold border transition-all cursor-pointer ${
            isWalletRestricted 
              ? 'border-[#2b82ff] bg-[#2b82ff]/10 text-[#2b82ff]' 
              : 'border-[#ff2079] bg-[#ff2079]/10 text-[#ff2079] animate-pulse'
          }`}
        >
          {isWalletRestricted ? "⚡ Reset naar Transparante Modus" : "🚨 Simuleer Dump ($OTT onder limiet)"}
        </button>
      </div>

      {/* BIJ VERGRENDELING: TOON TRANSPARANTE WARNING PANEL */}
      <AnimatePresence>
        {isWalletRestricted && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="border border-[#ff2079] bg-[#ff2079]/5 p-6 relative overflow-hidden">
            <div className="flex items-start space-x-4">
              <AlertOctagon className="w-8 h-8 text-[#ff2079] shrink-0" />
              <div className="space-y-2">
                <h3 className="font-orbitron text-sm font-black uppercase tracking-widest text-white">xApp Command Station: Access Suspended</h3>
                <p className="text-xs text-gray-400 leading-relaxed max-w-3xl">
                  Ledger analysis indicates your connected wallet address has deployed market-dumping parameters (holdings dropped below baseline). To maintain ecosystem equilibrium, premium features are gated. You cannot interact with the Marketplace until liquidity parameters are verified.
                </p>
                <div className="pt-2">
                  {ticketRequested ? (
                    <div className="border border-[#2b82ff]/40 bg-[#2b82ff]/5 px-4 py-2 w-fit text-[10px] font-mono text-[#2b82ff] uppercase tracking-wider">
                      🎟️ Exit-Ticket Queue Active. Request pending internal liquidity match.
                    </div>
                  ) : (
                    <button 
                      onClick={handleRequestTicket}
                      disabled={isSubmittingTicket}
                      className="flex items-center space-x-2 bg-white text-black text-[10px] font-orbitron font-bold uppercase tracking-widest px-4 py-2 hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      {isSubmittingTicket ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Ticket className="w-3 h-3" />
                      )}
                      <span>Request Transparent Exit-Ticket</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* L2E Engine Grid */}
      <div className={`space-y-6 transition-all ${isWalletRestricted ? 'opacity-30 pointer-events-none' : ''}`}>
        <div className="border-b border-gray-800 pb-4">
          <h2 className="font-orbitron text-xl uppercase tracking-widest flex items-center space-x-2">
            <GraduationCap className="w-6 h-6 text-[#2b82ff]" />
            <span>Learn-to-Earn (L2E) Matrix</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredModules.map((mod) => {
            const isCompleted = completedModules.includes(mod.id);
            return (
              <div key={mod.id} className={`border p-4 bg-black flex flex-col justify-between h-48 ${isCompleted ? 'border-gray-900 opacity-50' : 'border-gray-800'}`}>
                <div>
                  <h3 className="font-orbitron text-xs font-bold uppercase text-white tracking-wider">{mod.title}</h3>
                  <p className="text-gray-400 text-[11px] mt-2 font-sans">{mod.description}</p>
                </div>
                <div className="flex justify-between items-center border-t border-gray-900 pt-3 mt-2">
                  <span className="font-mono text-[11px] text-[#2b82ff]">+{mod.reward} $OTT</span>
                  {isCompleted ? (
                    <span className="text-[9px] uppercase font-mono text-gray-600">Airdropped</span>
                  ) : (
                    <button onClick={() => handleExecuteAirdrop(mod.id)} className="border border-gray-800 text-gray-400 text-[9px] font-orbitron uppercase py-1 px-2 hover:border-white hover:text-white cursor-pointer">
                      {claimingModuleId === mod.id ? "Airdropping..." : "Launch Task"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- PREMIUM SERIËLE ER-READER MARKETPLACE --- */}
      <div className={`space-y-6 pt-4 transition-all ${isWalletRestricted ? 'opacity-20 pointer-events-none' : ''}`}>
        <div className="border-b border-gray-800 pb-4">
          <h2 className="font-orbitron text-xl uppercase tracking-widest flex items-center space-x-2">
            <ShoppingBag className="w-6 h-6 text-[#ff2079]" />
            <span>Serialized Knowledge Marketplace</span>
          </h2>
          <p className="text-[11px] text-gray-500 uppercase font-mono mt-1">Unlock The Hearth Book chapter-by-chapter via verified ledger assets</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {hearthBookChapters.map((book) => {
            const hasPurchased = purchasedChapters.includes(book.id);
            const activeAsset = selectedAsset[book.id];
            const currentPrice = book.prices[activeAsset];

            return (
              <div key={book.id} className={`border p-5 bg-black flex flex-col justify-between h-80 relative ${hasPurchased ? 'border-[#2b82ff]/50' : 'border-gray-800'}`}>
                <div className="space-y-2">
                  <h3 className="font-orbitron text-xs text-white font-black uppercase tracking-wider">{book.title}</h3>
                  <div className="text-[10px] text-[#ff2079] font-orbitron uppercase tracking-widest font-bold">{book.subtitle}</div>
                  <p className="text-gray-400 text-[11px] font-sans leading-relaxed pt-2 line-clamp-4">{book.description}</p>
                </div>

                <div className="space-y-2 pt-4 border-t border-gray-900">
                  {!hasPurchased && (
                    <div className="flex justify-between items-center bg-gray-950 p-1 border border-gray-900">
                      <span className="text-[8px] uppercase text-gray-600 font-mono pl-1">Asset:</span>
                      <div className="flex space-x-1">
                        {(['OTT', 'XRP', 'RLUSD'] as const).map((asset) => (
                          <button key={asset} onClick={() => setSelectedAsset(prev => ({ ...prev, [book.id]: asset }))} className={`px-1.5 py-0.5 font-mono text-[8px] transition-all cursor-pointer ${activeAsset === asset ? 'bg-[#ff2079] text-white font-bold' : 'text-gray-600 hover:text-white'}`}>
                            {asset}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {hasPurchased ? (
                    <button className="w-full flex items-center justify-center space-x-1 border border-[#2b82ff] bg-[#2b82ff]/10 text-[#2b82ff] text-[10px] font-orbitron uppercase py-2 font-bold">
                      <Download className="w-3 h-3 animate-bounce" />
                      <span>Download Fragment PDF</span>
                    </button>
                  ) : (
                    <button onClick={() => handlePurchaseChapter(book.id)} className="w-full flex items-center justify-center space-x-1 bg-white text-black text-[10px] font-orbitron uppercase py-2 font-black hover:bg-gray-200 transition-all cursor-pointer">
                      <Coins className="w-3 h-3" />
                      <span>Unlock: {currentPrice} {activeAsset}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Handshake Loader Overlay */}
      <AnimatePresence>
        {isBuyingId && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-black border border-gray-800 p-6 max-w-xs w-full text-center space-y-3">
              {purchaseStatus === 'signing' ? (
                <>
                  <Loader2 className="w-8 h-8 text-[#ff2079] animate-spin mx-auto" />
                  <h4 className="font-orbitron text-xs uppercase tracking-widest text-white">Xaman Handshake Active</h4>
                  <p className="text-[10px] text-gray-500 font-mono">Signing fragmented asset distribution lease on-chain.</p>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-8 h-8 text-[#2b82ff] mx-auto" />
                  <h4 className="font-orbitron text-xs uppercase tracking-widest text-white">Payload Decrypted</h4>
                  <p className="text-[10px] text-gray-400 font-sans">Fragment securely pushed to your sovereign e-reader feed.</p>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
