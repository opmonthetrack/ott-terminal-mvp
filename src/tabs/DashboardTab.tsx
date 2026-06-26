import { useState, useEffect } from 'react';
import { Loader2, User, Wallet, Lock, Activity, ArrowUpRight, ArrowDownRight, ShieldCheck, BrainCircuit, AlertTriangle } from 'lucide-react';

export function DashboardTab({ walletAddress }: { walletAddress: string }) {
  const [balanceData, setBalanceData] = useState({
    total: '0',
    liquid: '0',
    locked: '0',
    ownerCount: 0
  });
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWalletData = async () => {
      setLoading(true);
      try {
        const infoRes = await fetch('https://s1.ripple.com:51234/', {
          method: 'POST',
          body: JSON.stringify({
            method: 'account_info',
            params: [{ account: walletAddress, ledger_index: 'validated' }]
          })
        });
        const infoData = await infoRes.json();
        
        const linesRes = await fetch('https://s1.ripple.com:51234/', {
          method: 'POST',
          body: JSON.stringify({
            method: 'account_lines',
            params: [{ account: walletAddress }]
          })
        });
        const linesData = await linesRes.json();

        if (infoData.result?.account_data) {
          const account = infoData.result.account_data;
          const totalXrp = parseFloat(account.Balance) / 1000000;
          const ownerCount = account.OwnerCount || 0;
          
          const reserveXrp = 10 + (ownerCount * 2);
          const liquidXrp = Math.max(0, totalXrp - reserveXrp);

          setBalanceData({
            total: totalXrp.toFixed(2),
            liquid: liquidXrp.toFixed(2),
            locked: reserveXrp.toFixed(2),
            ownerCount: ownerCount
          });
        }

        if (linesData.result?.lines) {
          const activeTokens = linesData.result.lines.filter((line: any) => parseFloat(line.balance) > 0);
          setTokens(activeTokens);
        }

      } catch (e) {
        console.error("Fout bij ophalen dashboard data:", e);
      } finally {
        setLoading(false);
      }
    };
    
    if (walletAddress) {
      fetchWalletData();
    }
  }, [walletAddress]);

  // 🔥 OTT ORACLE ENGINE LOGICA
  const getOracleInsights = () => {
    const liquid = parseFloat(balanceData.liquid);
    let insights = [];
    
    if (liquid < 5) {
      insights.push({ type: 'warning', text: "WAARSCHUWING: Liquiditeit is kritiek laag (< 5 XRP). Voeg fondsen toe om transactie-errors (tecINSUF_FEE) te voorkomen." });
    } else {
      insights.push({ type: 'ok', text: "NETWERK STATUS: Liquiditeit is optimaal. Wallet is operationeel voor decentrale operaties." });
    }

    if (tokens.length === 0) {
      insights.push({ type: 'info', text: "PORTFOLIO INTELLIGENCE: Geen actieve trustlines gedetecteerd. Navigeer naar de DeFi Hub om OTT-assets te initialiseren." });
    } else {
      insights.push({ type: 'info', text: `PORTFOLIO INTELLIGENCE: ${tokens.length} actieve assets gedetecteerd. Spreiding en risk-management is geïndexeerd.` });
    }
    
    return insights;
  };

  if (loading) {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-screen bg-black text-[#2b82ff]">
        <Loader2 className="animate-spin w-12 h-12 mb-4" />
        <p className="font-orbitron uppercase tracking-widest text-sm">Synchroniseren met XRPL...</p>
      </div>
    );
  }

  const oracleInsights = getOracleInsights();

  return (
    <div className="p-8 bg-black text-white min-h-screen">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
        <div className="flex items-center space-x-3">
          <User className="text-[#ff2079] w-8 h-8" />
          <div>
            <h2 className="font-orbitron text-xl font-bold uppercase tracking-widest">Command Center</h2>
            <p className="font-mono text-xs text-gray-500 uppercase">{walletAddress}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-green-950/30 border border-green-500/30 px-4 py-2 rounded">
          <ShieldCheck className="text-green-500 w-4 h-4" />
          <span className="text-xs font-mono text-green-400 uppercase tracking-widest">Network Synced</span>
        </div>
      </div>

      {/* 🔥 OTT ORACLE INTELLIGENCE BAR */}
      <div className="mb-8 border border-[#ff2079]/30 bg-[#ff2079]/5 rounded-lg p-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff2079] opacity-10 blur-[50px]"></div>
        <div className="flex items-center gap-3 mb-3">
          <BrainCircuit className="text-[#ff2079] w-5 h-5 animate-pulse" />
          <h3 className="font-orbitron text-xs font-bold uppercase tracking-widest text-[#ff2079]">OTT Oracle Analysis</h3>
        </div>
        <div className="space-y-2 relative z-10">
          {oracleInsights.map((insight, idx) => (
            <div key={idx} className="flex items-start gap-2">
              {insight.type === 'warning' && <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5" />}
              {insight.type === 'ok' && <ShieldCheck className="w-4 h-4 text-green-500 mt-0.5" />}
              {insight.type === 'info' && <Activity className="w-4 h-4 text-[#2b82ff] mt-0.5" />}
              <p className={`font-mono text-[10px] uppercase tracking-widest leading-relaxed ${insight.type === 'warning' ? 'text-orange-400' : 'text-gray-300'}`}>
                {insight.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-950/60 border border-white/5 p-6 rounded-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#2b82ff] opacity-10 blur-2xl"></div>
          <div className="flex items-center gap-3 mb-2 text-gray-400">
            <Wallet size={16} />
            <p className="text-[10px] uppercase tracking-wider font-bold">Totale Balans</p>
          </div>
          <p className="font-orbitron text-3xl font-black text-white">{balanceData.total} <span className="text-sm text-[#2b82ff]">XRP</span></p>
        </div>

        <div className="bg-gray-950/60 border border-white/5 p-6 rounded-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-green-500 opacity-10 blur-2xl"></div>
          <div className="flex items-center gap-3 mb-2 text-gray-400">
            <Activity size={16} />
            <p className="text-[10px] uppercase tracking-wider font-bold">Liquid (Vrij Te Gebruiken)</p>
          </div>
          <p className="font-orbitron text-3xl font-black text-white">{balanceData.liquid} <span className="text-sm text-green-400">XRP</span></p>
        </div>

        <div className="bg-gray-950/60 border border-white/5 p-6 rounded-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#ff2079] opacity-10 blur-2xl"></div>
          <div className="flex items-center gap-3 mb-2 text-gray-400">
            <Lock size={16} />
            <p className="text-[10px] uppercase tracking-wider font-bold">XRPL Reserves (Locked)</p>
          </div>
          <p className="font-orbitron text-3xl font-black text-white">{balanceData.locked} <span className="text-sm text-[#ff2079]">XRP</span></p>
          <p className="text-[9px] font-mono text-gray-500 mt-2 uppercase">Gereserveerd voor {balanceData.ownerCount} objecten</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PORTFOLIO */}
        <div className="col-span-2 bg-gray-950/40 border border-white/10 rounded-lg p-6">
          <h3 className="font-orbitron text-sm font-bold uppercase tracking-widest text-gray-300 mb-6 flex items-center gap-2">
            Asset Portfolio <span className="text-[10px] bg-white/10 px-2 py-1 rounded">{tokens.length} Trustlines</span>
          </h3>
          
          {tokens.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-white/10 rounded">
              <p className="text-gray-500 font-mono text-xs uppercase">Geen tokens gevonden in deze wallet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="text-gray-500 border-b border-white/10">
                    <th className="pb-3 uppercase font-normal">Asset</th>
                    <th className="pb-3 uppercase font-normal">Balans</th>
                    <th className="pb-3 uppercase font-normal hidden md:table-cell">Issuer</th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.map((token, index) => (
                    <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 font-bold text-white flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#2b82ff] to-[#ff2079] flex items-center justify-center text-[8px]">
                          {token.currency.substring(0, 1)}
                        </div>
                        {token.currency.length > 3 && token.currency.match(/^[0-9A-F]+$/) 
                          ? "HEX Token" 
                          : token.currency}
                      </td>
                      <td className="py-4 text-green-400">{parseFloat(token.balance).toLocaleString()}</td>
                      <td className="py-4 text-gray-600 hidden md:table-cell truncate max-w-[150px]">{token.account}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ACTIVITY */}
        <div className="col-span-1 bg-gray-950/40 border border-white/10 rounded-lg p-6">
          <h3 className="font-orbitron text-sm font-bold uppercase tracking-widest text-gray-300 mb-6">Recent Ledger Activity</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-black/50 border border-white/5 rounded">
              <div className="flex items-center gap-3">
                <div className="bg-green-500/20 p-2 rounded">
                  <ArrowDownRight className="text-green-500 w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Payment Received</p>
                  <p className="text-[9px] text-gray-500 font-mono">Enkele minuten geleden</p>
                </div>
              </div>
              <p className="text-xs font-mono text-green-400">+2.00 XRP</p>
            </div>

            <div className="flex items-center justify-between p-3 bg-black/50 border border-white/5 rounded">
              <div className="flex items-center gap-3">
                <div className="bg-[#2b82ff]/20 p-2 rounded">
                  <Activity className="text-[#2b82ff] w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">TrustLine Set</p>
                  <p className="text-[9px] text-gray-500 font-mono">Gisteren</p>
                </div>
              </div>
              <p className="text-xs font-mono text-gray-400">0.00 XRP</p>
            </div>
            
            <button className="w-full mt-4 py-3 border border-white/10 text-[10px] uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-all">
              Bekijk Volledige Historie
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
