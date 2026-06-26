import { useState, useEffect } from 'react';
import { Globe, Zap, Server, Landmark, Newspaper, FileText, Scale, Loader2, ExternalLink } from 'lucide-react';

export function LedgerIntelTab() {
  const [activeTab, setActiveTab] = useState('news');
  const [news, setNews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'news') {
      const fetchNews = async () => {
        setIsLoading(true);
        try {
          const res = await fetch('/api/news');
          const data = await res.json();
          // CryptoPanic geeft de data in een 'results' array
          setNews(data.results || []);
        } catch (e) {
          console.error("Nieuws feed error:", e);
        } finally {
          setIsLoading(false);
        }
      };
      fetchNews();
    }
  }, [activeTab]);

  const tabs = [
    { id: 'news', label: 'XRPL News', icon: <Newspaper size={14} /> },
    { id: 'unl_voting', label: 'UNL Voting', icon: <Server size={14} /> },
    { id: 'hackathon', label: 'Hackathon', icon: <Zap size={14} /> },
    { id: 'cbdc', label: 'CBDC Tracker', icon: <Globe size={14} /> },
    { id: 'stable', label: 'Stable Tokens', icon: <Landmark size={14} /> },
    { id: 'xls', label: 'XLS Roadmap', icon: <FileText size={14} /> },
    { id: 'iso', label: 'ISO 20022 & Law', icon: <Scale size={14} /> },
  ];

  return (
    <div className="p-8 bg-black text-white min-h-screen">
      <div className="mb-8 border-b border-white/10 pb-6">
        <h2 className="font-orbitron text-xl font-bold uppercase tracking-widest flex items-center gap-3">
          <Globe className="text-blue-500 w-6 h-6" /> Ledger Intel Terminal
        </h2>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 border-b border-white/5 pb-4">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 font-orbitron text-[10px] font-bold uppercase px-3 py-2 rounded ${activeTab === tab.id ? 'bg-white text-black' : 'border border-white/10 text-gray-500 hover:text-white'}`}>
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
                  <a key={i} href={item.url} target="_blank" className="block border-b border-white/5 pb-4 hover:bg-white/5 p-2 rounded transition-all">
                    <h4 className="text-sm font-medium hover:text-blue-400">{item.title}</h4>
                    <div className="mt-2 text-[10px] text-gray-500 font-mono uppercase">{item.source.title} • {new Date(item.created_at).toLocaleDateString()}</div>
                  </a>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-10 text-center border border-dashed border-white/10 rounded-lg">
             <p className="font-mono text-gray-500 text-xs">Systeem in sync. Data voor "{activeTab}" wordt opgeroepen.</p>
          </div>
        )}
      </div>
    </div>
  );
}
