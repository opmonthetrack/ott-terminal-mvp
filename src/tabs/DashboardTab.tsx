import { useState, useEffect } from 'react';
import { ShieldCheck, Zap, Loader2, AlertCircle, RefreshCw, User } from 'lucide-react';

interface DashboardTabProps {
  walletAddress: string;
}

interface Trustline {
  currency: string;
  issuer: string;
  balance: string;
  limit: string;
}

export function DashboardTab({ walletAddress }: DashboardTabProps) {
  const [xrpBalance, setXrpBalance] = useState<number>(0);
  const [trustlines, setTrustlines] = useState<Trustline[]>([]);
  const [xrpPrice, setXrpPrice] = useState<number>(2.45); // Fallback live prijs indicator
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 🛰️ LIVE ON-CHAIN DATA RETRIEVAL FROM XRPL COMPLIANT NODES
  const fetchOnChainData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch Live XRP Balans (account_info)
      const accountInfoResponse = await fetch('https://xrplcluster.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'account_info',
          params: [{ account: walletAddress, ledger_index: 'validated' }]
        })
      });
      const accountData = await accountInfoResponse.json();

      if (accountData.result?.error === 'actNotFound') {
        // Wallet bestaat wel in Xaman, maar is nog niet gefund met de minimale 10 XRP op Mainnet
        setXrpBalance(0);
        setIsLoading(false);
        return;
      }

      if (accountData.result?.account_data) {
        // XRP Balans komt binnen in 'drops'. 1 XRP = 1.000.000 drops
        const drops = accountData.result.account_data.Balance;
        setXrpBalance(parseFloat(drops) / 1000000);
      }

      // 2. Fetch Live Trustlines (account_lines voor RLUSD, OTT, etc.)
      const accountLinesResponse = await fetch('https://xrplcluster.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'account_lines',
          params: [{ account: walletAddress, ledger_index: 'validated' }]
        })
      });
      const linesData = await accountLinesResponse.json();

      if (linesData.result?.lines) {
        setTrustlines(linesData.result.lines);
      }

      // 3. Optioneel: Haal live XRP marktprijs op om net worth te berekenen
      try {
        const priceRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=usd');
        const priceData = await priceRes.json();
        if (priceData.ripple?.usd) {
          setXrpPrice(priceData.ripple.usd);
        }
      } catch (e) {
        console.warn("OTT Telemetry: Kon live prijsfeed niet bereiken, gebruik fallback.");
      }

    } catch (err) {
      console.error("XRPL Ledger Error:", err);
      setError("Kon on-chain data niet live synchroniseren.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      fetchOnChainData();
    }
  }, [walletAddress]);

  // Bereken de exacte waarde op basis van je live on-chain balans
  const rlusdLine = trustlines.find(l => l.currency === 'RLUSD' || l.currency === '524C555344000000000000000000000000000000');
  const rlusdBalance = rlusdLine ? Math.abs(parseFloat(rlusdLine.balance)) : 0;
  const totalNetWorth = (xrpBalance * xrpPrice) + rlusdBalance;

  // Formateer het adres voor de UI: rAbC...xYz
  const truncatedAddress = walletAddress 
    ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
    : 'Niet verbonden';

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-4 border border-gray-950 bg-black/40">
        <Loader2 className="w-6 h-6 animate-spin text-[#ff2079]" />
        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Querying Ledger State...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {error && (
        <div className="p-3 border border-red-900 bg-red-950/20 flex items-center justify-between text-left">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-[10px] font-mono text-red-400">{error}</span>
          </div>
          <button onClick={fetchOnChainData} className="p-1 hover:bg-gray-900 text-gray-400 hover:text-white transition-all">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Grid: User Profile & Net Worth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Profile / Identity */}
        <div className="border border-gray-950 bg-black p-6 relative space-y-6">
          <div className="absolute top-0 right-0 bg-[#2b82ff] text-black font-orbitron font-black text-[9px] tracking-widest uppercase px-2 py-0.5">
            Identity
          </div>
          <div className="flex items-center space-x-3 text-white">
            <User className="w-4 h-4 text-[#2b82ff]" />
            <h2 className="font-orbitron text-xs font-black uppercase tracking-widest">User Profile</h2>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-mono text-gray-600 uppercase tracking-wider">Your XRPL Address</span>
            <div className="font-orbitron text-sm font-black text-[#2b82ff] select-text">{truncatedAddress}</div>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-mono text-gray-600 uppercase tracking-wider">Network Node Status</span>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-mono text-white uppercase tracking-wide">Mainnet Node Active</span>
            </div>
          </div>
        </div>

        {/* Net Worth / Telemetry */}
        <div className="border border-gray-950 bg-black p-6 relative space-y-6">
          <div className="absolute top-0 right-0 bg-[#ff2079] text-black font-orbitron font-black text-[9px] tracking-widest uppercase px-2 py-0.5">
            Telemetry
          </div>
          <h2 className="font-orbitron text-xs font-black text-white uppercase tracking-widest">Net Worth</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-950 pb-2">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">XRP Balance</span>
              <span className="font-orbitron text-sm font-black text-white">{xrpBalance.toFixed(2)} XRP</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-950 pb-2">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">RLUSD Balance</span>
              <span className="font-orbitron text-sm font-black text-white">{rlusdBalance.toFixed(2)} RLUSD</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider font-bold">Total Value (USD)</span>
              <span className="font-orbitron text-lg font-black text-[#2b82ff]">${totalNetWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trustline Manager */}
      <div className="border border-gray-950 bg-black p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3 text-white">
            <ShieldCheck className="w-4 h-4 text-white" />
            <h2 className="font-orbitron text-xs font-black uppercase tracking-widest">Trustline Manager</h2>
          </div>
          <button className="border border-gray-900 bg-gray-950/40 text-gray-400 hover:text-white hover:border-gray-700 text-[10px] font-orbitron font-bold uppercase tracking-widest px-4 py-2 transition-all flex items-center space-x-2 cursor-pointer">
            <Zap className="w-3.5 h-3.5 text-[#ff2079]" />
            <span>Clean Empty Trustlines (Reclaim 2 XRP)</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-950 text-[9px] font-mono text-gray-600 uppercase tracking-wider">
                <th className="pb-3 font-medium">Asset</th>
                <th className="pb-3 font-medium">Issuer Token Address</th>
                <th className="pb-3 font-medium text-right">Balance</th>
                <th className="pb-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-950 text-[11px] font-mono">
              {trustlines.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-gray-600 uppercase text-[10px] tracking-wider text-center">
                    Geen actieve token trustlines gevonden op dit account.
                  </td>
                </tr>
              ) : (
                trustlines.map((line, index) => (
                  <tr key={index} className="text-gray-300 hover:text-white transition-colors">
                    <td className="py-3 font-orbitron font-bold text-white">{line.currency.length > 4 ? 'Custom Token' : line.currency}</td>
                    <td className="py-3 text-gray-500 select-text">{line.issuer}</td>
                    <td className="py-3 text-right font-orbitron font-black text-white">{parseFloat(line.balance).toFixed(2)}</td>
                    <td className="py-3 text-right">
                      <span className="px-2 py-0.5 bg-gray-950 text-green-400 border border-gray-900 text-[9px] uppercase font-bold">
                        Active
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}