import { useState } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { DashboardTab } from './tabs/DashboardTab';
import { DeFiTab } from './tabs/DeFiTab';
import { LedgerIntelTab } from './tabs/LedgerIntelTab';
// Importeer de nieuwe vertaal-motor
import { LanguageProvider, useLanguage } from './LanguageContext';

function MainApp() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Haal de taal en de vertaalfunctie (t) op uit onze engine
  const { lang, setLang, t } = useLanguage();

  if (!walletAddress) {
    return <LoginScreen onLoginSuccess={setWalletAddress} />;
  }

  return (
    <div className="flex min-h-screen bg-black text-white selection:bg-[#ff2079]/30">
      
      {/* SIDEBAR */}
      <div className="w-64 border-r border-white/10 flex flex-col justify-between bg-black z-10 relative">
        <div className="p-6">
          {/* Logo (Zorg dat logo.png in je public map staat) */}
          <div className="flex items-center gap-3 mb-10">
             <div className="w-10 h-10 bg-white flex items-center justify-center font-black text-black font-orbitron rounded-sm">
                OTT
             </div>
             <div>
               <p className="font-orbitron font-bold text-xs tracking-widest">TERMINAL</p>
               <p className="font-mono text-[8px] text-gray-500 uppercase tracking-widest">v1.0.0-beta</p>
             </div>
          </div>

          <nav className="space-y-2">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full text-left px-4 py-3 rounded font-orbitron text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'dashboard' ? 'bg-[#2b82ff]/10 text-[#2b82ff] border-l-2 border-[#2b82ff]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
              {t('menu_dashboard')}
            </button>
            <button onClick={() => setActiveTab('defi')} className={`w-full text-left px-4 py-3 rounded font-orbitron text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'defi' ? 'bg-[#2b82ff]/10 text-[#2b82ff] border-l-2 border-[#2b82ff]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
              {t('menu_defi')}
            </button>
            <button onClick={() => setActiveTab('academy')} className={`w-full text-left px-4 py-3 rounded font-orbitron text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'academy' ? 'bg-[#2b82ff]/10 text-[#2b82ff] border-l-2 border-[#2b82ff]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
              {t('menu_academy')}
            </button>
            <button onClick={() => setActiveTab('intel')} className={`w-full text-left px-4 py-3 rounded font-orbitron text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'intel' ? 'bg-[#2b82ff]/10 text-[#2b82ff] border-l-2 border-[#2b82ff]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
              {t('menu_intel')}
            </button>
          </nav>
        </div>
        
        <div className="p-6 space-y-6">
          {/* 🔥 DE TAAL SCHAKELAAR */}
          <div className="bg-gray-950 border border-white/10 rounded-lg p-1 flex relative">
            <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded shadow transition-all duration-300 ${lang === 'nl' ? 'left-1' : 'left-[calc(50%+2px)]'}`}></div>
            <button onClick={() => setLang('nl')} className={`flex-1 relative z-10 text-[10px] font-bold uppercase tracking-widest py-2 rounded transition-colors ${lang === 'nl' ? 'text-black' : 'text-gray-500 hover:text-white'}`}>
              NL
            </button>
            <button onClick={() => setLang('en')} className={`flex-1 relative z-10 text-[10px] font-bold uppercase tracking-widest py-2 rounded transition-colors ${lang === 'en' ? 'text-black' : 'text-gray-500 hover:text-white'}`}>
              EN
            </button>
          </div>

          <button onClick={() => setWalletAddress(null)} className="w-full text-left px-4 py-3 text-[10px] font-mono font-bold text-gray-600 uppercase tracking-widest hover:text-[#ff2079] transition-colors">
            {t('menu_logout')}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 h-screen overflow-y-auto">
        {activeTab === 'dashboard' && <DashboardTab walletAddress={walletAddress} />}
        {activeTab === 'defi' && <DeFiTab />}
        {activeTab === 'intel' && <LedgerIntelTab />}
        {/* Placeholder voor AcademyTab als je er later op klikt */}
        {activeTab === 'academy' && (
          <div className="p-8 text-center text-gray-500 font-orbitron uppercase">
            OTT Academy Module - <span className="text-[#ff2079]">In Development</span>
          </div>
        )}
      </div>
      
    </div>
  );
}

// Wrap de hele applicatie in de LanguageProvider
export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}
