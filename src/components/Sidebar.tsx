import { LayoutDashboard, Database, BookOpen, Globe } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'defi', label: 'DeFi Hub', icon: <Database size={20} /> },
    { id: 'academy', label: 'OTT Academy', icon: <BookOpen size={20} /> },
    { id: 'intel', label: 'Ledger Intel', icon: <Globe size={20} /> },
  ];

  return (
    <div className="w-64 bg-black border-r border-white/10 p-6 flex flex-col min-h-screen">
      {/* Logo in de sidebar - geen vierkantje meer */}
      <div className="mb-12">
        <img src="/logo.png" alt="OTT Logo" className="w-16 h-16 object-contain" />
      </div>

      <nav className="flex-1 space-y-6">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-4 w-full font-orbitron text-xs uppercase tracking-widest transition-colors ${
              activeTab === item.id ? 'text-white' : 'text-gray-500 hover:text-white'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
