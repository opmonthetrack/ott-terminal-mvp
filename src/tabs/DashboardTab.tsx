import { useState, useEffect } from 'react';
import { Loader2, User, RefreshCw } from 'lucide-react';

export function DashboardTab({ walletAddress }: { walletAddress: string }) {
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // We vragen expliciet data op voor JOUW walletAddress
        const res = await fetch('https://xrplcluster.com', {
          method: 'POST',
          body: JSON.stringify({
            method: 'account_info',
            params: [{ account: walletAddress, ledger_index: 'validated' }]
          })
        });
        const data = await res.json();
        if (data.result?.account_data) {
          const xrp = parseFloat(data.result.account_data.Balance) / 1000000;
          setBalance(xrp.toFixed(2));
        }
      } catch (e) {
        console.error("Fout bij ophalen:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [walletAddress]);

  if (loading) return <div className="p-10"><Loader2 className="animate-spin text-[#ff2079]" /></div>;

  return (
    <div className="p-6 border border-gray-950 bg-black">
      <div className="flex items-center space-x-3 mb-6">
        <User className="text-[#2b82ff]" />
        <h2 className="font-orbitron font-bold uppercase tracking-widest">Dashboard</h2>
      </div>
      
      <div className="bg-gray-950/40 p-4 border border-white/5">
        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Actief Adres</p>
        <p className="font-mono text-sm text-white truncate">{walletAddress}</p>
      </div>

      <div className="mt-4 p-4 bg-gray-950/40 border border-white/5">
        <p className="text-[10px] text-gray-500 uppercase tracking-wider">XRP Balance</p>
        <p className="font-orbitron text-2xl font-black text-[#2b82ff]">{balance} XRP</p>
      </div>
      
      <p className="text-[10px] text-gray-600 mt-6 italic">
        * Alleen mainnet data wordt getoond.
      </p>
    </div>
  );
}