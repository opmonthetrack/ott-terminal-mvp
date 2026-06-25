import { motion } from 'motion/react';
import { LayoutDashboard, Coins, GraduationCap, Globe, LogOut } from 'lucide-react';
import { Tab } from '../types';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  // 🛰️ DIRECT GEMATCHT MET JOUW ACTUELE APP.TSX EN TYPES.TSX
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'defi', label: 'DeFi Hub', icon: Coins },
    { id: 'academy', label: 'OTT Academy', icon: GraduationCap },
    { id: 'news', label: 'Ledger Intel', icon: Globe }, // Succesvol toegevoegd!
  ];

  return (
    <div className="w-64 border-r border-gray-800 bg-black min-h-screen flex flex-col hidden md:flex font-sans">
      
      {/* BRANDING HUB */}
      <div className="p-6 border-b border-gray-800 flex flex-col items-center text-center">
        <h1 className="font-orbitron font-black text-2xl uppercase tracking-widest text-ott-gradient w-full leading-tight select-none">
          ONTHETRACK
        </h1>
        <div className="mt-2 text-[8px] text-white font-orbitron uppercase tracking-widest w-full opacity-80">
          OTT TERMINAL - 589 STEPS AHEAD
        </div>
      </div>

      {/* CORE NAVIGATION */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`group w-full flex items-center space-x-3 px-4 py-3 border transition-all relative ${
                isActive 
                  ? 'border-transparent bg-ott-gradient text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                  : 'border-transparent text-gray-400 hover:text-white hover:border-gray-800 hover:bg-gray-900/50'
              }`}
              style={isActive ? { padding: '1px' } : undefined}
            >
              <div className={`flex w-full items-center space-x-3 px-4 py-3 ${isActive ? 'bg-black w-[calc(100%-2px)] h-[calc(100%-2px)] absolute inset-[1px]' : ''}`}>
                 {isActive && <div className="absolute inset-0 bg-ott-gradient opacity-10 pointer-events-none" />}
                 <item.icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-[#ff2079]' : 'group-hover:text-[#a855f7] transition-colors'}`} />
                 <span className={`font-orbitron text-xs uppercase tracking-widest font-bold relative z-10 ${isActive ? 'text-white' : ''}`}>{item.label}</span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* SESSION MANAGEMENT TERMINATION */}
      <div className="p-4 border-t border-gray-800">
        <button 
          onClick={() => window.location.reload()} 
          className="w-full flex items-center space-x-3 px-4 py-3 text-gray-500 border border-transparent hover:text-white transition-colors group cursor-pointer"
        >
          <LogOut className="w-5 h-5 group-hover:text-[#ff2079] transition-colors" />
          <span className="font-orbitron text-xs uppercase tracking-widest group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-ott-gradient">Disconnect</span>
        </button>
      </div>

    </div>
  );
}