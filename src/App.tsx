import { useState } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { DashboardTab } from './tabs/DashboardTab';
import { DeFiTab } from './tabs/DeFiTab';
import { AcademyTab } from './tabs/AcademyTab';
import { NewsTab } from './tabs/NewsTab';
import { ChatAgent } from './components/ChatAgent';
import { LayoutDashboard, ShieldCheck, GraduationCap, Globe } from 'lucide-react';

export default function App() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'defi' | 'academy' | 'news'>('dashboard');

  const handleLoginSuccess = (address: string) => {
    setWalletAddress(address);
  };

  // Als we nog niet ingelogd zijn, toon de LoginScreen
  if (!walletAddress) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // Dashboard weergave
  return (
    <div className="min-h-screen bg-[#000] text-white flex font-sans">
      <aside className="w-64 border-r border-gray-950 bg-black p-6">
        <nav className="space-y-4">
            <button onClick={() => setActiveTab('dashboard')} className="block w-full text-left p-2 hover:text-white text-gray-400">Dashboard</button>
            <button onClick={() => setActiveTab('defi')} className="block w-full text-left p-2 hover:text-white text-gray-400">DeFi Hub</button>
            <button onClick={() => setActiveTab('academy')} className="block w-full text-left p-2 hover:text-white text-gray-400">OTT Academy</button>
            <button onClick={() => setActiveTab('news')} className="block w-full text-left p-2 hover:text-white text-gray-400">Ledger Intel</button>
        </nav>
      </aside>
      <main className="flex-1 p-10">
        {activeTab === 'dashboard' && <DashboardTab walletAddress={walletAddress} />}
        {activeTab === 'defi' && <DeFiTab />}
        {activeTab === 'academy' && <AcademyTab />}
        {activeTab === 'news' && <NewsTab />}
        <ChatAgent />
      </main>
    </div>
  );
}
