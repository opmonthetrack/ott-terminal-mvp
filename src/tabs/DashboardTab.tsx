import { useState, useEffect } from 'react';
import { Loader2, Send, ArrowDownLeft, ArrowUpRight, Search, History, BarChart3, Wallet, Clock } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export function DashboardTab({ walletAddress }: { walletAddress: string }) {
  const [balanceData, setBalanceData] = useState({ total: '0', liquid: '0', locked: '0' });
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    // Data fetching blijft intact
    const fetchWalletData = async () => {
      setLoading(true);
      try {
        const infoRes = await fetch('https://s1.ripple.com:51234/', { method: 'POST', body: JSON.stringify({ method: 'account_info', params: [{ account: walletAddress, ledger_index: 'validated' }] }) });
        const infoData = await infoRes.json();
        if (infoData.result?.account_data) {
          const total = parseFloat(infoData.result.account_data.Balance) / 1000000;
          setBalanceData({ total: total.toFixed(4), liquid: (total - 10).toFixed(4), locked: '10' });
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchWalletData();
  }, [walletAddress]);

  if (loading) return <div className="p-20 text-center text-[#2b82ff]"><Loader2 className="animate-spin mx-auto w-10 h-10" /></div>;

  return (
    <div className="p-6 bg-black min-h-screen text-white grid grid-cols-12 gap-4">
      
      {/* KOLOM 1: WALLET KAART (Lijkt op image_ad9302.jpg) */}
      <div className="col-span-12 lg:col-span-3 space-y-4">
        <div className="bg-gradient-to-br from-[#1e3a8a] to-[#2563eb] p-6 rounded-2xl shadow-xl">
          <p className="text-blue-100 text-xs font-mono mb-1">Total Balance</p>
          <h1 className="text-3xl font-black mb-6">{balanceData.total} <span className="text-lg font-medium">XRP</span></h1>
          <div className="grid grid-cols-2 gap-2">
            <button className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 py-2 rounded-lg text-sm font-bold transition-all"><ArrowDownLeft size={16} /> Receive</button>
            <button className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 py-2 rounded-lg text-sm font-bold transition-all"><Send size={16} /> Send</button>
          </div>
        </div>
        <div className="bg-gray-900/50 p-4 rounded-xl border border-white/5">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-4">DEX & NFT Orders</p>
            <div className="text-center py-8 opacity-50"><p className="text-xs">Nothing found</p></div>
        </div>
      </div>

      {/* KOLOM 2: ASSETS (Tokens/LPs/NFTs) */}
      <div className="col-span-12 lg:col-span-6 bg-gray-900/30 rounded-2xl p-6 border border-white/5">
        <div className="flex gap-6 mb-6 border-b border-white/10 pb-4">
          <button className="font-bold text-sm">Tokens</button>
          <button className="text-gray-500 text-sm">LPs</button>
          <button className="text-gray-500 text-sm">NFTs</button>
        </div>
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 text-gray-500" size={16} />
          <input className="w-full bg-black border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm" placeholder="Search" />
        </div>
        <div className="space-y-4">
           <div className="flex justify-between items-center py-2 border-b border-white/5">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs">X</div>
                 <div><p className="text-sm font-bold">XRP</p><p className="text-[10px] text-gray-500">$1.02</p></div>
              </div>
              <p className="text-sm font-mono">{balanceData.total}</p>
           </div>
        </div>
      </div>

      {/* KOLOM 3: HISTORY */}
      <div className="col-span-12 lg:col-span-3 bg-gray-900/30 rounded-2xl p-6 border border-white/5">
        <div className="flex gap-6 mb-6 border-b border-white/10 pb-4">
          <button className="flex items-center gap-2 text-sm font-bold"><History size={16} /> History</button>
          <button className="flex items-center gap-2 text-sm text-gray-500"><BarChart3 size={16} /> Stats</button>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-start text-xs border-b border-white/5 pb-2">
            <div><p className="font-bold">Received</p><p className="text-[9px] text-gray-500">From rP6L...1</p></div>
            <p className="text-green-500">+2.00 XRP</p>
          </div>
          <div className="flex justify-between items-start text-xs border-b border-white/5 pb-2">
            <div><p className="font-bold">Sent</p><p className="text-[9px] text-gray-500">To rPCF1...q</p></div>
            <p className="text-red-500">-11.00 XRP</p>
          </div>
        </div>
      </div>
      
    </div>
  );
}
