/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatAgent } from './components/ChatAgent';
import { DashboardTab } from './tabs/DashboardTab';
import { DeFiTab } from './tabs/DeFiTab';
import { AcademyTab } from './tabs/AcademyTab';
import { Tab } from './types';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [ottBalance, setOttBalance] = useState(0);

  const handleLogin = () => {
    setIsMinting(true);
    setTimeout(() => {
      setIsMinting(false);
      setIsAuthenticated(true);
    }, 2000);
  };

  const handleClaimReward = () => {
    setOttBalance(prev => prev + 50);
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} isMinting={isMinting} />;
  }

  return (
    <div className="min-h-screen bg-black text-white flex select-none">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header ottBalance={ottBalance} />
        
        <main className="flex-1 p-6 md:p-10 overflow-y-auto pb-40 md:pb-10">
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'defi' && <DeFiTab />}
          {activeTab === 'academy' && <AcademyTab onClaimGlobal={handleClaimReward} />}
        </main>
      </div>

      <ChatAgent />
    </div>
  );
}
