import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { GraduationCap, Award, Brain, Zap, BookOpen, ShieldAlert, Cpu, CheckCircle2, Triangle, Sparkles, Download, ShoppingBag, Coins, Loader2 } from 'lucide-react';

interface AcademyTabProps {
  onClaimGlobal: () => void;
}

export function AcademyTab({ onClaimGlobal }: AcademyTabProps) {
  // Categorie filter state
  const [activeCategory, setActiveCategory] = useState<'all' | 'xls' | 'xaman' | 'core' | 'exclusive'>('all');
  
  // State voor afgeronde L2E modules
  const [completedModules, setCompletedModules] = useState<string[]>(["core-1"]);
  const [claimingModuleId, setClaimingModuleId] = useState<string | null>(null);

  // --- MARKETPLACE STATE ---
  const [purchasedBooks, setPurchasedBooks] = useState<string[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<{ [key: string]: 'OTT' | 'XRP' | 'RLUSD' }>({
    "book-1": "OTT",
    "book-2": "OTT",
    "book-3": "OTT"
  });
  const [isBuyingBookId, setIsBuyingBookId] = useState<string | null>(null);
  const [purchaseStatus, setPurchaseStatus] = useState<'idle' | 'signing' | 'success'>('idle');

  // De e-learning modules
  const academyModules = [
    {
      id: "core-1",
      category: "core",
      title: "XRPL Core (A to Z): Ledger Fundamentals",
      description: "Understand the XRP Ledger consensus mechanism, trustline architecture, account reserves, and decentralized transactions from first principles.",
      reward: 50,
      difficulty: "Beginner",
      status: "Completed"
    },
    {
      id: "xaman-1",
      category: "xaman",
      title: "Xaman Wallet Mastery & Security",
      description: "Deep dive into secure key custody, biometric transaction signing, managing multi-signing accounts, and interacting safely with third-party xApps.",
      reward: 100,
      difficulty: "Intermediate",
      status: "Ready to Claim"
    },
    {
      id: "xls-20",
      category: "xls",
      title: "XLS-20 Matrix: Native NFTs on XRPL",
      description: "Learn how native Non-Fungible Tokens operate on-chain without smart contract vulnerabilities. Master minting, burning, and brokerage hooks.",
      reward: 150,
      difficulty: "Advanced",
      status: "Start Course"
    },
    {
      id: "xls-30",
      category: "xls",
      title: "XLS-30d: Native Automated Market Makers (AMM)",
      description: "Deconstruct the ledger-level AMM protocol. Learn how continuous auction mechanisms reduce impermanent loss and route liquidity via Doppler structures.",
      reward: 200,
      difficulty: "Advanced",
      status: "Start Course"
    },
    {
      id: "crypto-1",
      category: "core",
      title: "How to Spot a Fugazi Token (Security 101)",
      description: "The ultimate survival guide to financial awareness. Filter out fake volume, analyze issuer keys, check blackhole status, and deploy the OTT Compliance Shield.",
      reward: 75,
      difficulty: "Intermediate",
      status: "Start Course"
    }
  ];

  // --- EXCLUSIEVE E-BOOKS MATRIX ---
  const eDocsBooks = [
    {
      id: "book-1",
      title: "The Hearth Book (Volume I)",
      description: "The cornerstone text of TruthOnTheTrack. Unlocking ancestral wisdom, decoded symbolism, and the spiritual frequency shifts required to achieve mental sovereignty.",
      prices: { OTT: 250, XRP: 50, RLUSD: 25 },
      author: "Oswald Hellemun"
    },
    {
      id: "book-2",
      title: "589 Steps Ahead: Escaping Toxic Systems",
      description: "A comprehensive investigation dossier detailing how corporate financial frameworks and modern chemical-nutrition systems manipulate human consciousness.",
      prices: { OTT: 150, XRP: 30, RLUSD: 15 },
      author: "Oswald Hellemun"
    },
    {
      id: "book-3",
      title: "The Sovereign Detox & Energy Manifesto",
      description: "Practical biometric blueprints on cell-level detoxification, advanced supplement layering, breathing protocols, and energetic grid restoration.",
      prices: { OTT: 200, XRP: 40, RLUSD: 20 },
      author: "Oswald Hellemun"
    }
  ];

  const filteredModules = activeCategory === 'all' 
    ? academyModules 
    : academyModules.filter(m => m.category === activeCategory);

  // L2E Claim Logica
  const handleExecuteAirdrop = (id: string) => {
    setClaimingModuleId(id);
    setTimeout(() => {
      setCompletedModules(prev => [...prev, id]);
      setClaimingModuleId(null);
      onClaimGlobal();
    }, 1500);
  };

  // E-Book Multi-Asset Aankoop Logica via Xaman
  const handlePurchaseBook = (bookId: string) => {
    setIsBuyingBookId(bookId);
    setPurchaseStatus('signing');
    
    // Simuleer Xaman cryptographic signature
    setTimeout(() => {
      setPurchaseStatus('success');
      setTimeout(() => {
        setPurchasedBooks(prev => [...prev, bookId]);
        setIsBuyingBookId(null);
        setPurchaseStatus('idle');
      }, 1500);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 max-w-5xl font-sans text-white"
    >
      {/* Academy Segment */}
      <div className="space-y-6">
        <div className="border-b border-gray-800 pb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="font-orbitron text-2xl uppercase tracking-widest flex items-center space-x-3">
              <GraduationCap className="w-7 h-7 text-[#2b82ff]" />
              <span>Learn-to-Earn (L2E) Engine</span>
            </h2>
            <p className="text-xs text-gray-500 mt-1 uppercase font-mono">Complete Tasks & Receive Automated Ledger Airdrops</p>
          </div>
          <div className="flex items-center space-x-2 bg-gray-950 border border-gray-900 px-4 py-2 text-xs font-mono text-gray-400">
            <Award className="w-4 h-4 text-[#ff2079]" />
            <span>Modules: <span className="text-white font-bold">{completedModules.length}</span> / {academyModules.length}</span>
          </div>
        </div>

        {/* Categorie Filters */}
        <div className="flex flex-wrap gap-2 border-b border-gray-900 pb-4">
          {[
            { id: 'all', label: 'All Modules', icon: BookOpen },
            { id: 'xls', label: 'XLS Patches', icon: Cpu },
            { id: 'xaman', label: 'Xaman Wallet', icon: Zap },
            { id: 'core', label: 'Crypto Education', icon: Brain },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setActiveCategory(btn.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 border text-xs font-orbitron uppercase tracking-wider transition-all cursor-pointer ${
                activeCategory === btn.id
                  ? 'border-[#ff2079] bg-[#ff2079]/10 text-[#ff2079]'
                  : 'border-gray-800 text-gray-400 hover:text-white bg-black'
              }`}
            >
              <btn.icon className="w-3.5 h-3.5" />
              <span>{btn.label}</span>
            </button>
          ))}
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredModules.map((mod) => {
            const isCompleted = completedModules.includes(mod.id);
            const isClaiming = claimingModuleId === mod.id;

            return (
              <div key={mod.id} className={`group relative border bg-black p-6 flex flex-col justify-between h-64 transition-all duration-300 ${isCompleted ? 'border-gray-900 opacity-60' : 'border-gray-800 hover:border-transparent'}`}>
                {!isCompleted && (
                  <div className="absolute inset-0 bg-ott-gradient opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ padding: '1px' }}><div className="w-full h-full bg-black"></div></div>
                )}
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <h3 className="font-orbitron text-sm text-white font-bold uppercase tracking-wider mb-2">{mod.title}</h3>
                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-3 font-sans">{mod.description}</p>
                  </div>
                  <div className="flex justify-between items-center border-t border-gray-900 pt-4">
                    <span className="font-orbitron font-bold text-xs text-[#2b82ff]">+{mod.reward} $OTT</span>
                    {isCompleted ? (
                      <span className="text-[10px] uppercase tracking-widest text-gray-500 font-orbitron">Airdropped</span>
                    ) : (
                      <button onClick={() => handleExecuteAirdrop(mod.id)} className="border border-gray-800 text-gray-400 text-[10px] font-orbitron uppercase tracking-widest py-1.5 px-3 transition-all cursor-pointer hover:border-white hover:text-white bg-black">
                        {isClaiming ? "Airdropping..." : "Launch Task"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- NIEUWE SECTIE: EXCLUSIEVE DIGITAL LIBRARY MARKETPLACE --- */}
      <div className="space-y-6 pt-6">
        <div className="border-b border-gray-800 pb-5">
          <h2 className="font-orbitron text-2xl uppercase tracking-widest flex items-center space-x-3">
            <ShoppingBag className="w-7 h-7 text-[#ff2079]" />
            <span>Sovereign Knowledge Marketplace</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1 uppercase font-mono">Unlock Oswald Hellemun's Exclusive Literature Using Multi-Asset Nodes</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {eDocsBooks.map((book) => {
            const hasPurchased = purchasedBooks.includes(book.id);
            const activeAsset = selectedAsset[book.id];
            const currentPrice = book.prices[activeAsset];

            return (
              <div 
                key={book.id}
                className={`relative border bg-black p-6 flex flex-col justify-between h-80 transition-all ${
                  hasPurchased ? 'border-[#2b82ff]/40 bg-gray-950/20' : 'border-gray-800'
                }`}
              >
                <div className="absolute top-0 right-0 p-2 bg-gray-900 text-gray-500 font-mono text-[8px] uppercase tracking-widest">
                  {book.author}
                </div>

                <div className="space-y-3">
                  <h3 className="font-orbitron text-sm text-white font-black uppercase tracking-wider border-b border-gray-900 pb-2">
                    {book.title}
                  </h3>
                  <p className="text-gray-400 text-xs leading-relaxed font-sans line-clamp-4">
                    {book.description}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-900">
                  {/* ASSET SELECTOR BAR (Alleen tonen als boek niet gekocht is) */}
                  {!hasPurchased && (
                    <div className="flex justify-between items-center bg-gray-950 p-1 border border-gray-900">
                      <span className="text-[9px] uppercase text-gray-500 font-mono pl-2">Pay with:</span>
                      <div className="flex space-x-1">
                        {(['OTT', 'XRP', 'RLUSD'] as const).map((asset) => (
                          <button
                            key={asset}
                            onClick={() => setSelectedAsset(prev => ({ ...prev, [book.id]: asset }))}
                            className={`px-2 py-0.5 font-mono text-[9px] transition-all cursor-pointer ${
                              activeAsset === asset 
                                ? 'bg-[#ff2079] text-white font-bold' 
                                : 'text-gray-500 hover:text-white'
                            }`}
                          >
                            {asset}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* KRIJG DOWNLOAD KNOP OF KOOP KNOP */}
                  {hasPurchased ? (
                    <a 
                      href="#" 
                      onClick={(e) => e.preventDefault()}
                      className="w-full flex items-center justify-center space-x-2 border border-[#2b82ff] bg-[#2b82ff]/10 text-[#2b82ff] text-xs font-orbitron uppercase tracking-widest py-2.5 font-bold hover:bg-[#2b82ff]/20 transition-all"
                    >
                      <Download className="w-4 h-4 animate-bounce" />
                      <span>Download PDF / EPUB</span>
                    </a>
                  ) : (
                    <button
                      onClick={() => handlePurchaseBook(book.id)}
                      className="w-full flex items-center justify-center space-x-2 bg-white text-black text-xs font-orbitron uppercase tracking-widest py-2.5 font-black hover:bg-gray-200 transition-all cursor-pointer"
                    >
                      <Coins className="w-4 h-4" />
                      <span>Buy: {currentPrice} {activeAsset}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* INTERACTIEVE KOOP PROMPT MODAL */}
      <AnimatePresence>
        {isBuyingBookId && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-black border border-gray-800 p-6 max-w-xs w-full text-center space-y-4"
            >
              {purchaseStatus === 'signing' && (
                <>
                  <Loader2 className="w-10 h-10 text-[#ff2079] animate-spin mx-auto" />
                  <h4 className="font-orbitron text-sm uppercase tracking-widest text-white">Xaman Handshake Active</h4>
                  <p className="text-xs text-gray-500 font-mono">
                    Awaiting cryptographic signature on ledger channel. Escrowing token value payload.
                  </p>
                </>
              )}
              {purchaseStatus === 'success' && (
                <>
                  <CheckCircle2 className="w-10 h-10 text-[#2b82ff] mx-auto" />
                  <h4 className="font-orbitron text-sm uppercase tracking-widest text-white">Payload Decrypted</h4>
                  <p className="text-xs text-gray-400 font-sans">
                    Transaction verified on-chain. Digital signature added. E-book unlocked in your command station.
                  </p>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
