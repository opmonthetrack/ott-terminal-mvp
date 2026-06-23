import { useState } from 'react';
import { Activity, ShieldCheck, Zap, Triangle, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function DashboardTab() {
  // Live saldi beheren in de state voor demonstratiedoeleinden
  const [xrpBalance, setXrpBalance] = useState(4206.90);
  const rlusdBalance = 1500.00;
  const xrpPrice = 0.50; // Gefixeerde koers voor de totale waarde calculator
  
  // Dynamische trustline lijst
  const [trustlines, setTrustlines] = useState([
    { asset: "RLUSD", issuer: "rQp...xZ9", balance: "1,500.00", status: "Active", color: "text-[#2b82ff]" },
    { asset: "SGB", issuer: "r3V...aK2", balance: "0.00", status: "Empty", color: "text-gray-400" }
  ]);

  // Simulatie states voor de Trustline Reclaimer
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reclaimStatus, setReclaimStatus] = useState<'idle' | 'pending' | 'success'>('idle');

  // Bereken de totale dollarwaarde live op basis van het XRP-saldo
  const totalValueUSD = (xrpBalance * xrpPrice) + rlusdBalance;

  // Start het opschoonproces
  const handleStartReclaim = () => {
    setIsModalOpen(true);
    setReclaimStatus('idle');
  };

  // Simuleer de Xaman handtekening en de on-chain transactie
  const handleConfirmReclaim = () => {
    setReclaimStatus('pending');
    
    setTimeout(() => {
      setReclaimStatus('success');
      // Voeg 2 XRP toe aan het saldo (vrijgekomen reserve)
      setXrpBalance(prev => prev + 2.00);
      // Filter de lege SGB trustline uit de lijst
      setTrustlines(prev => prev.filter(tl => tl.asset !== "SGB"));
    }, 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-5xl font-sans relative"
    >
      {/* Profile & Telemetry Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group relative border border-transparent hover:border-transparent transition-all">
          <div className="absolute inset-0 bg-ott-gradient opacity-50 blur-[2px] transition-all group-hover:opacity-100" style={{ padding: '1px', borderRadius: '1px' }}>
             <div className="w-full h-full bg-black rounded-none"></div>
          </div>
          <div className="relative p-6 bg-black/80 h-full flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-2 bg-ott-gradient text-white font-orbitron text-[10px] font-bold uppercase tracking-widest leading-none">
              Identity
            </div>
            <div>
              <h2 className="font-orbitron text-xl mb-4 text-white uppercase tracking-wider flex items-center space-x-2">
                <Triangle className="w-5 h-5 text-[#a855f7]" />
                <span>User Profile</span>
              </h2>
            </div>
            <div className="space-y-4 font-sans mt-8">
              <div>
                <div className="text-gray-500 text-xs mb-1 uppercase tracking-widest">Your XRPL Address</div>
                <div className="font-mono text-sm break-all text-[#2b82ff] font-bold">rOTT...fUzg</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs mb-1 uppercase tracking-widest">Network Node Status</div>
                <div className="flex items-center space-x-2 text-sm text-white border border-[#ff2079]/50 w-fit px-3 py-1 bg-[#ff2079]/10">
                  <div className="w-2 h-2 rounded-full bg-[#ff2079] animate-pulse shadow-[0_0_8px_#ff2079]" />
                  <span>Terminal Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="group relative border border-transparent hover:border-transparent transition-all">
          <div className="absolute inset-0 bg-ott-gradient opacity-50 blur-[2px] transition-all group-hover:opacity-100" style={{ padding: '1px', borderRadius: '1px' }}>
             <div className="w-full h-full bg-black rounded-none"></div>
          </div>
          <div className="relative p-6 bg-black/80 h-full flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-2 bg-ott-gradient text-white font-orbitron text-[10px] font-bold uppercase tracking-widest leading-none">
              Telemetry
            </div>
            <h2 className="font-orbitron text-xl mb-4 text-white uppercase tracking-wider">Net Worth</h2>
            <div className="mt-8 space-y-6 font-sans">
              <div className="flex justify-between items-end border-b border-gray-800 pb-2">
                <div className="text-gray-500 text-xs uppercase tracking-widest">XRP Balance</div>
                <div className="font-orbitron text-2xl text-white">{xrpBalance.toFixed(2)}</div>
              </div>
              <div className="flex justify-between items-end border-b border-gray-800 pb-2">
                <div className="text-gray-500 text-xs uppercase tracking-widest">RLUSD Balance</div>
                <div className="font-orbitron text-2xl text-white">{rlusdBalance.toFixed(2)}</div>
              </div>
              <div className="flex justify-between items-end mt-4">
                <div className="text-gray-500 text-xs uppercase tracking-widest">Total Value (USD)</div>
                <div className="font-orbitron text-3xl font-bold text-ott-gradient">${totalValueUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trustline Manager Box */}
      <div className="relative border border-transparent p-[1px]">
        <div className="absolute inset-0 bg-ott-gradient opacity-30"></div>
        <div className="relative bg-black p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="font-orbitron text-xl text-white uppercase tracking-wider flex items-center space-x-3">
              <ShieldCheck className="w-6 h-6 text-[#2b82ff]" />
              <span>Trustline Manager</span>
            </h2>
            
            {/* Activeer reclaimer knop alleen als er lege trustlines zijn */}
            {trustlines.some(tl => tl.status === "Empty") && (
              <button 
                onClick={handleStartReclaim}
                className="border border-transparent bg-ott-gradient p-[1px] relative group overflow-hidden text-xs uppercase tracking-widest font-sans cursor-pointer hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-shadow"
              >
                <div className="bg-black px-4 py-2 flex items-center space-x-2 group-hover:bg-opacity-80 transition-all h-full w-full">
                  <Zap className="w-4 h-4 text-[#ff2079]" />
                  <span className="text-white">Clean empty trustlines (Reclaim 2 XRP)</span>
                </div>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full font-sans text-sm text-left">
              <thead className="text-gray-500 uppercase text-[10px] tracking-widest border-b border-gray-800">
                <tr>
                  <th className="py-3 px-4 font-normal">Asset</th>
                  <th className="py-3 px-4 font-normal">Issuer Token Address</th>
                  <th className="py-3 px-4 font-normal text-right">Balance</th>
                  <th className="py-3 px-4 font-normal text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 font-mono">
                <AnimatePresence>
                  {trustlines.map((pool, idx) => (
                    <motion.tr 
                      key={pool.asset}
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.4 }}
                      className="hover:bg-gray-900/40 transition-colors"
                    >
                      <td className={`py-3 px-4 font-orbitron tracking-wider ${pool.color}`}>{pool.asset}</td>
                      <td className="py-3 px-4 text-xs text-gray-500">{pool.issuer}</td>
                      <td className="py-3 px-4 text-right text-white">{pool.balance}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`border text-[10px] px-2 py-1 uppercase tracking-wider ${
                          pool.status === 'Active' 
                            ? 'border-[#a855f7]/50 bg-[#a855f7]/10 text-[#a855f7]' 
                            : 'border-gray-800 text-gray-500 bg-gray-900/20'
                        }`}>
                          {pool.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* INTERACTIEVE SIMULATIE MODAL (POP-UP) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-black border border-gray-800 p-6 max-w-md w-full relative"
            >
              <div className="absolute inset-0 bg-ott-gradient opacity-5 pointer-events-none" />
              
              {reclaimStatus === 'idle' && (
                <div className="text-center space-y-4">
                  <AlertTriangle className="w-12 h-12 text-[#ff2079] mx-auto animate-pulse" />
                  <h3 className="font-orbitron text-lg uppercase tracking-wider text-white">Initialize Trustline Optimization</h3>
                  <p className="text-sm text-gray-400 font-sans">
                    You are about to sign an on-chain ledger operation to terminate <span className="text-white font-bold">1 empty trustline</span> (SGB). This action will release and reclaim your <span className="text-[#2b82ff] font-bold">2.00 XRP</span> network reserve back into your wallet.
                  </p>
                  <div className="flex space-x-3 pt-4">
                    <button 
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-3 border border-gray-800 text-gray-400 text-xs font-orbitron uppercase tracking-widest hover:bg-gray-900 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleConfirmReclaim}
                      className="flex-1 py-3 bg-white text-black text-xs font-orbitron uppercase tracking-widest font-bold hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      Push to Xaman
                    </button>
                  </div>
                </div>
              )}

              {reclaimStatus === 'pending' && (
                <div className="text-center py-8 space-y-4">
                  <Loader2 className="w-12 h-12 text-[#a855f7] animate-spin mx-auto" />
                  <h3 className="font-orbitron text-lg uppercase tracking-wider text-white">Awaiting Ledger Signature...</h3>
                  <p className="text-xs text-gray-500 font-mono">
                    Executing AccountSet / TrustSet Hook operation. Reclaiming 2 XRP drops container.
                  </p>
                </div>
              )}

              {reclaimStatus === 'success' && (
                <div className="text-center space-y-4">
                  <CheckCircle2 className="w-12 h-12 text-[#2b82ff] mx-auto" />
                  <h3 className="font-orbitron text-lg uppercase tracking-wider text-white">Reserve Successfully Reclaimed</h3>
                  <p className="text-sm text-gray-400 font-sans">
                    The empty trustline has been permanently deleted from the ledger. <span className="text-white font-bold">+2.00 XRP</span> has been successfully credited back to your balance telemetry.
                  </p>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="w-full mt-4 py-3 border border-[#2b82ff] bg-[#2b82ff]/10 text-[#2b82ff] text-xs font-orbitron uppercase tracking-widest font-bold hover:bg-[#2b82ff]/20 transition-all cursor-pointer"
                  >
                    Return to Terminal
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
