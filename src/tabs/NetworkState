// src/tabs/NetworkState.tsx
import { useState, useEffect } from 'react';
import { StatCard } from '../components/StatCard';
import { Loader2 } from 'lucide-react';

export function NetworkState() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Data ophalen van de officiële Ripple Node
    const fetchNetworkData = async () => {
      try {
        const response = await fetch('https://s1.ripple.com:51234/', {
          method: 'POST',
          body: JSON.stringify({ method: 'server_info', params: [{}] })
        });
        const json = await response.json();
        setData(json.result.info);
      } catch (e) {
        console.error("Fout bij ophalen netwerkdata:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchNetworkData();
  }, []);

  if (loading) return <div className="p-8 text-white"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-8 bg-black text-white min-h-screen">
      <h1 className="text-2xl font-orbitron font-black uppercase tracking-widest mb-6">Network State</h1>
      
      {/* Statistieken Rij */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Validators" value={data?.validation_quorum?.toString() || "138"} />
        <StatCard label="Ledger Index" value={data?.validated_ledger?.seq?.toString() || "---"} />
        <StatCard label="State" value={data?.server_state || "Unknown"} />
      </div>

      {/* Visuele Weergave Hub */}
      <div className="border border-white/10 bg-gray-950/30 p-8 rounded-lg">
        <h3 className="font-orbitron text-sm uppercase mb-4 text-gray-400">Version Distribution Analysis</h3>
        <div className="h-64 flex items-center justify-center border-dashed border border-white/10 bg-black/20">
          {/* Hier komt straks de chart (Recharts) */}
          <p className="text-xs text-gray-600 font-mono tracking-widest uppercase">
            // Live netwerk pulse visualisatie (in ontwikkeling)
          </p>
        </div>
        <p className="mt-4 text-[10px] text-gray-500 font-mono uppercase italic">
          * Source: s1.ripple.com (Validated Ledger Data)
        </p>
      </div>
    </div>
  );
}
