import { useState } from 'react';
import { Activity, Globe, Zap, CheckCircle2, Server, Database, Landmark, Newspaper, FileText, Scale } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export function LedgerIntelTab() {
  const [activeTab, setActiveTab] = useState('unl_voting');
  const { t } = useLanguage();

  const tabs = [
    { id: 'unl_voting', label: 'UNL Voting', icon: <Server size={14} /> },
    { id: 'hackathon', label: 'Hackathon', icon: <Zap size={14} /> },
    { id: 'cbdc', label: 'CBDC Tracker', icon: <Globe size={14} /> },
    { id: 'stable', label: 'Stable Tokens', icon: <Landmark size={14} /> },
    { id: 'news', label: 'XRPL News', icon: <Newspaper size={14} /> },
    { id: 'xls', label: 'XLS Roadmap', icon: <FileText size={14} /> },
    { id: 'iso', label: 'ISO 20022 & Law', icon: <Scale size={14} /> },
  ];

  return (
    <div className="p-8 bg-black text-white min-h-screen">
      {/* HEADER */}
      <div className="mb-8 border-b border-white/10 pb-6">
        <h2 className="font-orbitron text-xl font-bold uppercase tracking-widest flex items-center gap-3">
          <Globe className="text-blue-500 w-6 h-6" /> Ledger Intel Terminal
        </h2>
        <p className="font-mono text-[10px] text-gray-500 uppercase mt-1">Sovereign Intelligence Engine // Live Protocol Sync</p>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-white/5 pb-4">
        {tabs.map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)} 
            className={`flex items-center gap-2 font-orbitron text-[10px] font-bold uppercase px-3 py-2 rounded transition-all ${activeTab === tab.id ? 'bg-white text-black' : 'border border-white/10 text-gray-500 hover:text-white'}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* DYNAMIC CONTENT */}
      <div className="animate-fade-in">
        {activeTab === 'unl_voting' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-950/60 p-6 rounded-lg flex flex-col items-center justify-center border border-white/5">
              <svg viewBox="0 0 100 100" className="w-48 h-48 transform -rotate-90">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#111" strokeWidth="12" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#2b82ff" strokeWidth="12" strokeDasharray="213.52 251.2" />
              </svg>
              <div className="absolute font-orbitron text-center">
                 <div className="text-2xl font-black">85%</div>
                 <div className="text-[8px] text-[#2b82ff]">V2.1.1 (SAFE)</div>
              </div>
            </div>
            <div className="bg-gray-950/60 p-6 rounded-lg border border-white/5">
              <h3 className="text-xs font-bold uppercase mb-4">Node Consensus Health</h3>
              <p className="text-[10px] text-gray-400 font-mono">Network consensus is stable. No dUNL node overlaps detected.</p>
            </div>
          </div>
        )}

        {activeTab === 'hackathon' && (
          <div className="bg-[#ff2079]/5 border border-[#ff2079]/20 p-8 rounded-lg">
            <h3 className="font-orbitron text-sm font-bold text-[#ff2079] mb-6">Make Waves Hackathon Checkpoints</h3>
            {['Xaman Wallet Integration', 'Live Data Fetching', 'Decentralized Arch', 'Token Factory', 'NFT Minting'].map((item, i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b border-white/5">
                <CheckCircle2 className="text-green-500 w-4 h-4" />
                <span className="text-xs uppercase font-mono">{item}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'cbdc' && (
          <div className="bg-gray-950/60 p-8 rounded-lg border border-white/5">
            <h3 className="text-sm font-bold uppercase mb-4">CBDC Development Tracker</h3>
            <p className="text-[10px] font-mono text-gray-500 italic">Live mapping of central bank digital currency pilots worldwide...</p>
          </div>
        )}

        {activeTab === 'stable' && (
          <div className="bg-gray-950/60 p-8 rounded-lg border border-white/5">
            <h3 className="text-sm font-bold uppercase mb-4">Fiat Stable Assets</h3>
            <table className="w-full text-left text-[10px] font-mono uppercase">
              <thead><tr className="text-gray-500 border-b border-white/10"><th className="pb-2">Symbol</th><th className="pb-2">Issuer</th><th className="pb-2">Backing</th></tr></thead>
              <tbody>
                <tr className="border-b border-white/5"><td>USD</td><td>Stably</td><td>1:1 Fiat Reserve</td></tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'news' && (
          <div className="bg-gray-950/60 p-8 rounded-lg border border-white/5">
            <h3 className="text-sm font-bold uppercase mb-4">XRPL / Ripple News Feed</h3>
            <p className="text-[10px] font-mono text-gray-500">Fetching latest headlines from CoinTelegraph...</p>
          </div>
        )}

        {activeTab === 'xls' && (
          <div className="bg-gray-950/60 p-8 rounded-lg border border-white/5">
            <h3 className="text-sm font-bold uppercase mb-4">XLS Standards Roadmap</h3>
            <ul className="text-[10px] font-mono space-y-2">
              <li>XLS-20d: NFT Standards (Active)</li>
              <li>XLS-30d: AMM Implementation (Active)</li>
              <li>XLS-40d: DID Protocol (Upcoming)</li>
            </ul>
          </div>
        )}

        {activeTab === 'iso' && (
          <div className="bg-gray-950/60 p-8 rounded-lg border border-white/5">
            <h3 className="text-sm font-bold uppercase mb-4">ISO 20022 & Regulatory Compliance</h3>
            <p className="text-[10px] font-mono text-gray-400">Monitoring global legislative frameworks for DLT adoption in banking...</p>
          </div>
        )}
      </div>
    </div>
  );
}
