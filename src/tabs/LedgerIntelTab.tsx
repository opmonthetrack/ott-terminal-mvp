import { useState } from 'react';
import { Activity, Globe, Zap, CheckCircle2, Server, Database } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export function LedgerIntelTab() {
  const [activeTab, setActiveTab] = useState('unl_voting');

  return (
    <div className="p-8 bg-black text-white min-h-screen">
      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
        <div>
          <h2 className="font-orbitron text-xl font-bold uppercase tracking-widest flex items-center gap-3">
            <Globe className="text-blue-500 w-6 h-6" /> Ledger Intel Terminal
          </h2>
          <p className="font-mono text-[10px] text-gray-500 uppercase mt-1">Sovereign Intelligence Engine // Live Protocol Sync</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-8 border-b border-white/5 pb-4">
        <button onClick={() => setActiveTab('unl_voting')} className={`font-orbitron text-xs font-bold uppercase px-4 py-2 rounded ${activeTab === 'unl_voting' ? 'bg-white text-black' : 'border border-white/10'}`}>
          <Server size={14} /> UNL Voting
        </button>
        <button onClick={() => setActiveTab('hackathon')} className={`font-orbitron text-xs font-bold uppercase px-4 py-2 rounded ${activeTab === 'hackathon' ? 'bg-[#ff2079] text-white' : 'border border-[#ff2079]/30'}`}>
          <Zap size={14} /> Make Waves Hackathon
        </button>
      </div>

      {activeTab === 'unl_voting' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-950/60 p-6 rounded-lg flex flex-col items-center justify-center">
            <div className="relative w-56 h-56">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#111" strokeWidth="12" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#2b82ff" strokeWidth="12" strokeDasharray="213.52 251.2" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black">85%</span>
                <span className="text-[9px] text-[#2b82ff]">v2.1.1 (Safe)</span>
              </div>
            </div>
          </div>
          <div className="bg-gray-950/60 p-8 rounded-lg space-y-6">
            <div className="flex justify-between items-center"><span className="text-xs uppercase">rippled v2.1.1</span><span className="font-bold text-[#2b82ff]">85%</span></div>
            <div className="w-full bg-white/5 h-2 rounded"><div className="bg-[#2b82ff] h-full w-[85%]"></div></div>
          </div>
        </div>
      )}

      {activeTab === 'hackathon' && (
        <div className="bg-[#ff2079]/5 border border-[#ff2079]/20 p-8 rounded-lg">
          <h3 className="font-orbitron text-sm font-bold text-[#ff2079] mb-8">Make Waves Hackathon Checkpoints</h3>
          <div className="space-y-6">
             {['Xaman Wallet Integratie', 'Live XRPL Data Fetching', 'Decentralized Architecture'].map((item, i) => (
               <div key={i} className="flex items-start gap-4 border-b border-white/5 pb-4">
                 <CheckCircle2 className="text-green-500 w-5 h-5" />
                 <p className="font-mono text-[10px] uppercase">{item}</p>
               </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
}
