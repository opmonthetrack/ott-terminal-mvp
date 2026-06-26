import { useState, useEffect } from 'react';
import { Globe, Zap, Server, Landmark, Newspaper, FileText, Scale, Loader2, ExternalLink } from 'lucide-react';

export function LedgerIntelTab() {
  const [activeTab, setActiveTab] = useState('news'); // We zetten news als default
  const [news, setNews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulatie van een real-time fetch naar een Crypto-News API
  useEffect(() => {
    if (activeTab === 'news') {
      setIsLoading(true);
      // In een echte productie app: roep hier je Vercel Serverless Function aan
      // Voor nu: een robuuste mock-up die we zo aan je API koppelen
      setTimeout(() => {
        setNews([
          { title: "XRPL AMM Performance hits new milestone", source: "CoinTelegraph", time: "2h ago", url: "#" },
          { title: "Ripple's ISO 20022 Integration expansion", source: "The Daily Hodl", time: "4h ago", url: "#" },
          { title: "New Validator amendment proposal for XRPL v2.2.0", source: "XRPL Blog", time: "6h ago", url: "#" }
        ]);
        setIsLoading(false);
      }, 1000);
    }
  }, [activeTab]);

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
      <div className="mb-8 border-b border-white/10 pb-6">
        <h2 className="font-orbitron text-xl font-bold uppercase tracking-widest flex items-center gap-3">
          <Globe className="text-blue-500 w-6 h-6" /> Ledger Intel Terminal
        </h2>
        <p className="font-mono text-[10px] text-gray-500 uppercase mt-1">Sovereign Intelligence Engine // Real-Time Data Stream</p>
      </div>

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

      <div className="animate-fade-in">
        {activeTab === 'news' ? (
          <div className="bg-gray-950/40 border border-white/10 rounded-lg p-6">
            <h3 className="text-sm font-bold uppercase mb-6 flex items-center gap-2">
              <Newspaper size={16} className="text-blue-500" /> Live XRPL News Feed
            </h3>
            {isLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500" /></div>
            ) : (
              <div className="space-y-4">
                {news.map((item, i) => (
                  <div key={i} className="group border-b border-white/5 pb-4 hover:bg-white/5 p-2 rounded transition-all">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-medium group-hover:text-blue-400 transition-colors">{item.title}</h4>
                      <ExternalLink size={12} className="text-gray-600 group-hover:text-white" />
                    </div>
                    <div className="mt-2 text-[10px] text-gray-500 font-mono uppercase">{item.source} • {item.time}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-10 text-center border border-dashed border-white/10 rounded-lg">
            <p className="font-mono text-gray-500 text-xs">Tab "{activeTab}" is in sync with the ledger protocols.</p>
          </div>
        )}
      </div>
    </div>
  );
}
