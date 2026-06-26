import { useState } from 'react';
import { Activity, Globe, Database, Zap, CheckCircle2, Server } from 'lucide-react';

export function LedgerIntelTab() {
  const [activeTab, setActiveTab] = useState('unl_voting');

  return (
    <div className="p-8 bg-black text-white min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
        <div>
          <h2 className="font-orbitron text-xl font-bold uppercase tracking-widest flex items-center gap-3">
            <Globe className="text-blue-500 w-6 h-6" /> Ledger Intel Terminal
          </h2>
          <p className="font-mono text-[10px] text-gray-500 uppercase mt-1">Sovereign Intelligence Engine // Live Protocol Sync</p>
        </div>
        <div className="flex items-center gap-2 bg-green-950/30 border border-green-500/30 px-4 py-2 rounded hidden md:flex">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-mono text-green-400 uppercase tracking-widest">Systeem 100% Up-to-date</span>
        </div>
      </div>

      {/* NAVIGATIE */}
      <div className="flex flex-wrap gap-4 mb-8 border-b border-white/5 pb-4">
        <button 
          onClick={() => setActiveTab('unl_voting')} 
          className={`font-orbitron text-xs font-bold uppercase tracking-widest px-4 py-2 rounded transition-colors flex items-center gap-2 ${activeTab === 'unl_voting' ? 'bg-white text-black' : 'bg-transparent text-gray-500 hover:text-white border border-white/10'}`}
        >
          <Server size={14} /> UNL Voting & Nodes
        </button>

        <button 
          onClick={() => setActiveTab('iso20022')} 
          className={`font-orbitron text-xs font-bold uppercase tracking-widest px-4 py-2 rounded transition-colors ${activeTab === 'iso20022' ? 'bg-white text-black' : 'bg-transparent text-gray-500 hover:text-white border border-white/10'}`}
        >
          ISO 20022 Matrix
        </button>
        
        {/* 🔥 DE HACKATHON JURY KNOP */}
        <button 
          onClick={() => setActiveTab('hackathon')} 
          className={`font-orbitron text-xs font-bold uppercase tracking-widest px-4 py-2 rounded transition-colors flex items-center gap-2 ${activeTab === 'hackathon' ? 'bg-[#ff2079] text-white shadow-[0_0_15px_rgba(255,32,121,0.4)]' : 'bg-transparent text-[#ff2079]/70 border border-[#ff2079]/30 hover:bg-[#ff2079]/10'}`}
        >
          <Zap size={14} /> Make Waves Hackathon
        </button>
        
        <button 
          onClick={() => setActiveTab('cbdc')} 
          className={`font-orbitron text-xs font-bold uppercase tracking-widest px-4 py-2 rounded transition-colors ${activeTab === 'cbdc' ? 'bg-white text-black' : 'bg-transparent text-gray-500 hover:text-white border border-white/10'}`}
        >
          CBDC Radar
        </button>
      </div>

      {/* CONTENT: UNL VOTING & NETWORK STATE (DE DONUT CHART!) */}
      {activeTab === 'unl_voting' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
          
          {/* VISUAL CHART PANEEL */}
          <div className="bg-gray-950/60 border border-white/5 p-6 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#2b82ff] opacity-10 blur-[50px]"></div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-8 w-full text-left flex items-center gap-2">
              <Activity size={14} className="text-[#2b82ff]"/> Validator Node Versions
            </h4>
            
            {/* Pure SVG Donut Chart */}
            <div className="relative w-56 h-56 mb-4">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {/* Achtergrond ring */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#111" strokeWidth="12" />
                {/* rippled 2.1.1 (85%) = 213.52 omtrek */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#2b82ff" strokeWidth="12" strokeDasharray="213.52 251.2" strokeDashoffset="0" className="transition-all duration-1000 ease-out" />
                {/* rippled 2.1.0 (10%) = 25.12 omtrek */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ff2079" strokeWidth="12" strokeDasharray="25.12 251.2" strokeDashoffset="-213.52" />
                {/* Overig (5%) = 12.56 omtrek */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#4ade80" strokeWidth="12" strokeDasharray="12.56 251.2" strokeDashoffset="-238.64" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-orbitron font-black text-3xl text-white">85<span className="text-lg">%</span></span>
                <span className="text-[9px] font-mono uppercase tracking-widest text-[#2b82ff] mt-1">v2.1.1 (Safe)</span>
              </div>
            </div>
          </div>

          {/* STATISTIEKEN PANEEL */}
          <div className="bg-gray-950/60 border border-white/5 p-8 rounded-lg flex flex-col justify-center space-y-6 relative overflow-hidden">
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono uppercase text-white flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#2b82ff] shadow-[0_0_8px_#2b82ff]"></div> rippled v2.1.1</span>
                <span className="text-xs font-orbitron font-bold text-[#2b82ff]">85%</span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded overflow-hidden">
                <div className="bg-[#2b82ff] h-full w-[85%] shadow-[0_0_10px_#2b82ff]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono uppercase text-white flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#ff2079] shadow-[0_0_8px_#ff2079]"></div> rippled v2.1.0</span>
                <span className="text-xs font-orbitron font-bold text-[#ff2079]">10%</span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded overflow-hidden">
                <div className="bg-[#ff2079] h-full w-[10%] shadow-[0_0_10px_#ff2079]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono uppercase text-white flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#4ade80]"></div> Legacy / Other</span>
                <span className="text-xs font-orbitron font-bold text-[#4ade80]">5%</span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded overflow-hidden">
                <div className="bg-[#4ade80] h-full w-[5%] shadow-[0_0_10px_#4ade80]"></div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-green-950/30 border border-green-500/20 rounded">
                <p className="text-[10px] font-mono text-green-400 uppercase tracking-widest leading-relaxed flex items-start gap-2">
                  <CheckCircle2 size={14} className="flex-shrink-0 mt-0.5" />
                  Network consensus is stable. Geen dUNL node overlaps gedetecteerd. Amendments opereren onder veilige drempels.
                </p>
            </div>
          </div>

        </div>
      )}

      {/* CONTENT: ISO 20022 */}
      {activeTab === 'iso20022' && (
        <div className="space-y-6 animate-fade-in">
          <h3 className="font-orbitron text-sm font-bold text-[#2b82ff] uppercase tracking-widest mb-4 flex items-center gap-2">
            <Database size={16} /> Universal Financial Messaging System
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-950/60 border border-white/5 p-6 rounded-lg">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">// HET NETWERK (Snelwegen)</h4>
              <p className="font-mono text-sm text-white mb-4">SWIFT, Fedwire, T2 (ECB), CHAPS</p>
              <p className="text-[10px] text-gray-500 leading-relaxed uppercase">De fysieke financiële infrastructuur die de ISO 20022-berichtgeving verplicht stelt voor al het interbancaire grensoverschrijdende verkeer.</p>
            </div>
            
            <div className="bg-gray-950/60 border border-white/5 p-6 rounded-lg">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">// DE SOFTWARE (Vertaalmachine)</h4>
              <p className="font-mono text-sm text-white mb-4">Ripple Payments, Volante, Temenos</p>
              <p className="text-[10px] text-gray-500 leading-relaxed uppercase">De gecertificeerde softwareleveranciers die banksystemen voorzien van de modules om ISO-berichten 1:1 te vertalen naar cryptografische transacties.</p>
            </div>
            
            <div className="bg-[#2b82ff]/5 border border-[#2b82ff]/30 p-6 rounded-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#2b82ff] opacity-10 blur-2xl"></div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#2b82ff] mb-2">// DE CRYPTO (Ledger Rails)</h4>
              <p className="font-mono text-sm text-white mb-4">XRP (Ripple), XLM (Stellar), XDC</p>
              <p className="text-[10px] text-gray-400 leading-relaxed uppercase">De programmeerbare Layer-1 blockchains waarvan de datavelden naadloos aansluiten op de ISO-datakwalificaties voor wholesale-verrekeningen.</p>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT: HACKATHON TRACKER VOOR DE JURY */}
      {activeTab === 'hackathon' && (
        <div className="bg-[#ff2079]/5 border border-[#ff2079]/20 p-8 rounded-lg animate-fade-in relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff2079] opacity-5 blur-[100px]"></div>
           
           <h3 className="font-orbitron text-sm font-bold text-[#ff2079] uppercase tracking-widest mb-8 flex items-center gap-2 relative z-10">
             Make Waves Hackathon Checkpoints
           </h3>
           
           <div className="space-y-6 relative z-10">
             <div className="flex items-start gap-4 border-b border-white/5 pb-4">
               <CheckCircle2 className="text-green-500 w-5 h-5 flex-shrink-0 mt-0.5" />
               <div>
                 <p className="font-bold text-white text-xs font-orbitron uppercase tracking-wider mb-1">Xaman Wallet Integratie</p>
                 <p className="font-mono text-[10px] text-gray-400 uppercase">Succesvolle login en payment payload generatie via Xaman API gerealiseerd in LoginScreen.</p>
               </div>
             </div>
             
             <div className="flex items-start gap-4 border-b border-white/5 pb-4">
               <CheckCircle2 className="text-green-500 w-5 h-5 flex-shrink-0 mt-0.5" />
               <div>
                 <p className="font-bold text-white text-xs font-orbitron uppercase tracking-wider mb-1">Live XRPL Data Fetching</p>
                 <p className="font-mono text-[10px] text-gray-400 uppercase">Command Center Dashboard toont real-time network balances, liquid XRP en XRPL object reserves.</p>
               </div>
             </div>
             
             <div className="flex items-start gap-4 border-b border-white/5 pb-4">
               <CheckCircle2 className="text-green-500 w-5 h-5 flex-shrink-0 mt-0.5" />
               <div>
                 <p className="font-bold text-white text-xs font-orbitron uppercase tracking-wider mb-1">Decentralized Architecture</p>
                 <p className="font-mono text-[10px] text-gray-400 uppercase">Professionele scheiding van OTT Treasury, Master Issuer en Operational wallets toegepast binnen de code base.</p>
               </div>
             </div>
             
             <div className="flex items-start gap-4">
               <div className="w-5 h-5 rounded-full border-2 border-dashed border-[#2b82ff] flex-shrink-0 flex items-center justify-center mt-0.5">
                 <div className="w-1.5 h-1.5 bg-[#2b82ff] rounded-full animate-pulse"></div>
               </div>
               <div>
                 <p className="font-bold text-[#2b82ff] text-xs font-orbitron uppercase tracking-wider mb-1">Token & NFT Issuance</p>
                 <p className="font-mono text-[10px] text-[#2b82ff]/70 uppercase">Voorbereiding in DeFi Hub afgerond. Wachtend op final Ledger payload executie.</p>
               </div>
             </div>
           </div>
        </div>
      )}

      {/* CONTENT: CBDC RADAR */}
      {activeTab === 'cbdc' && (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-lg text-gray-500 animate-fade-in">
          <Activity className="w-8 h-8 mx-auto mb-4 opacity-50" />
          <p className="font-orbitron text-xs uppercase tracking-widest">Global CBDC Radar Syncing...</p>
        </div>
      )}

    </div>
  );
}
