import { motion } from 'motion/react';
import { useState } from 'react';
import { Layers, Database, Compass, Triangle, Shield, ShieldAlert, Globe, ArrowUpRight, CheckCircle } from 'lucide-react';

export function DeFiTab() {
  // State voor de MiCA Compliance Filter
  const [micaOnly, setMicaOnly] = useState(false);

  // De 6 Wereldwijde Valutacategorieën met Doppler en Anodos integratie
  const stablecoinPools = [
    { pair: "RLUSD / XRP", platform: "Doppler Finance Node", yield: "8.45%", volume: "$1.2M", status: "Compliant", cat: "USD" },
    { pair: "EUR / RLUSD", platform: "Anodos Treasury Hook", yield: "6.12%", volume: "$840K", status: "Compliant", cat: "EUR" },
    { pair: "GBP / XRP", platform: "Doppler Liquidity Pool", yield: "5.80%", volume: "$420K", status: "Compliant", cat: "GBP" },
    { pair: "MXN / RLUSD", platform: "Anodos Automated Market Maker", yield: "11.20%", volume: "$910K", status: "Compliant", cat: "MXN" },
    { pair: "CNY / XRP", platform: "Offshore Ledger Node", yield: "4.15%", volume: "$2.1M", status: "Unregulated", cat: "CNY" },
    { pair: "FUGAZI / XRP", platform: "Unknown Issuer Protocol", yield: "182.40%", volume: "$12K", status: "Non-Compliant", cat: "Speculative" }
  ];

  // Filter logica aangedreven door het Compliance Shield
  const filteredPools = micaOnly 
    ? stablecoinPools.filter(pool => pool.status === "Compliant") 
    : stablecoinPools;

  const coreCards = [
    {
      title: "Doppler Finance Matrix",
      description: "Direct access to smart order routing and yield optimization across native XRPL AMM structures.",
      icon: Layers,
      tag: "Institutional"
    },
    {
      title: "Anodos Hook Systems",
      description: "Automated treasury management and automated trustline indexing built natively for Xahau layer protocols.",
      icon: Database,
      tag: "Hooks Layer"
    },
    {
      title: "Cross-Chain Yield",
      description: "Monitor real-time rewards scaling from Evernode decentralized hosting and Flare network validation.",
      icon: Compass,
      tag: "Cross-Chain"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-5xl font-sans"
    >
      {/* Tab Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-800 pb-5 gap-4">
        <div>
          <h2 className="font-orbitron text-2xl uppercase tracking-widest text-white">DeFi Aggregator Hub</h2>
          <p className="text-xs text-gray-500 mt-1 uppercase font-mono">Aggregating Doppler, Anodos, and XRPL Liquidity Layers</p>
        </div>

        {/* INTERACTIEF MICA COMPLIANCE SHIELD */}
        <button
          onClick={() => setMicaOnly(!micaOnly)}
          className={`flex items-center space-x-3 px-4 py-2 border transition-all text-xs font-orbitron uppercase tracking-widest font-bold select-none cursor-pointer ${
            micaOnly 
              ? 'border-[#2b82ff] bg-[#2b82ff]/10 text-[#2b82ff] shadow-[0_0_15px_rgba(43,130,255,0.3)]' 
              : 'border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white bg-black'
          }`}
        >
          {micaOnly ? <Shield className="w-4 h-4 animate-pulse" /> : <ShieldAlert className="w-4 h-4 text-[#ff2079]" />}
          <span>{micaOnly ? "Compliance Shield: ACTIVE (MiCA Only)" : "Filter Unregulated (Fugazi) Risks"}</span>
        </button>
      </div>

      {/* Core Protocol Nodes (Doppler & Anodos Highlight) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {coreCards.map((card, i) => (
          <div 
            key={i}
            className="group relative border border-gray-800 bg-black p-6 flex flex-col justify-between h-60 overflow-hidden hover:border-transparent transition-all duration-300"
          >
            {/* Pulsing visual outline on hover */}
            <div className="absolute inset-0 bg-ott-gradient opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100" style={{ padding: '1px' }}>
              <div className="w-full h-full bg-black"></div>
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <card.icon className="w-8 h-8 text-[#2b82ff] group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-ott-gradient transition-all duration-300" strokeWidth={1} />
                  <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 border border-gray-800 text-gray-500 group-hover:border-[#ff2079]/40 group-hover:text-[#ff2079]">
                    {card.tag}
                  </span>
                </div>
                <h3 className="font-orbitron text-base uppercase tracking-wider mb-2 text-white">{card.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{card.description}</p>
              </div>

              <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-2 group-hover:translate-x-0">
                <span className="font-orbitron text-[10px] tracking-widest uppercase text-[#ff2079] flex items-center space-x-1">
                  <span>Connect Node</span>
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 6-CATEGORY GLOBAL STABLECOIN YIELD MATRIX */}
      <div className="relative border border-gray-800 bg-black p-6">
        <div className="absolute top-0 right-0 p-2 bg-ott-gradient text-white font-orbitron text-[9px] font-bold uppercase tracking-widest leading-none">
          Global Yield Layer
        </div>
        
        <h3 className="font-orbitron text-base uppercase tracking-wider mb-6 text-white flex items-center space-x-2">
          <Globe className="w-5 h-5 text-[#2b82ff]" />
          <span>6-Category Global Stable Yield Matrix</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full font-sans text-xs text-left">
            <thead className="text-gray-500 uppercase text-[9px] tracking-widest border-b border-gray-800">
              <tr>
                <th className="py-3 px-4 font-normal">Asset Pair</th>
                <th className="py-3 px-4 font-normal">Routing Engine / Liquidity</th>
                <th className="py-3 px-4 font-normal text-right">Projected Yield (APY)</th>
                <th className="py-3 px-4 font-normal text-right">24H Volume</th>
                <th className="py-3 px-4 font-normal text-right">Risk Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-900 font-mono">
              {filteredPools.map((pool, idx) => (
                <tr 
                  key={idx} 
                  className={`hover:bg-gray-950 transition-colors ${
                    pool.status === 'Unregulated' || pool.status === 'Non-Compliant' ? 'opacity-60' : ''
                  }`}
                >
                  <td className="py-4 px-4 font-orbitron text-sm tracking-wider text-white">{pool.pair}</td>
                  <td className="py-4 px-4 text-gray-400 font-sans">{pool.platform}</td>
                  <td className="py-4 px-4 text-right text-[#2b82ff] font-bold text-sm">{pool.yield}</td>
                  <td className="py-4 px-4 text-right text-gray-300">{pool.volume}</td>
                  <td className="py-4 px-4 text-right">
                    <span className={`text-[9px] px-2 py-0.5 uppercase tracking-wider font-sans border ${
                      pool.status === 'Compliant' 
                        ? 'border-[#2b82ff]/50 bg-[#2b82ff]/5 BENIGN text-[#2b82ff]' 
                        : pool.status === 'Unregulated'
                        ? 'border-yellow-600/50 bg-yellow-600/5 text-yellow-500'
                        : 'border-[#ff2079]/50 bg-[#ff2079]/5 text-[#ff2079] font-bold animate-pulse'
                    }`}>
                      {pool.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ACTIVE AIRDROPS AND SNAPSHOTS SECURE BOX */}
      <div className="border border-gray-800 bg-black p-6 relative">
        <h3 className="font-orbitron text-base uppercase tracking-wider mb-4 text-white flex items-center space-x-3">
          <Triangle className="w-5 h-5 text-[#ff2079]" />
          <span>Active Ledgers Snapshot Monitor</span>
        </h3>
        <div className="flex justify-between items-center bg-gray-950 border border-gray-900 p-4 hover:border-gray-800 transition-colors group">
          <div className="flex items-center space-x-4">
            <div className="w-9 h-9 border border-gray-800 flex items-center justify-center bg-black group-hover:border-[#a855f7] transition-all">
              <Triangle className="w-4 h-4 text-[#a855f7]" />
            </div>
            <div>
              <h4 className="font-orbitron uppercase text-white tracking-widest text-xs">Evernode Network Expansion</h4>
              <p className="text-[10px] text-gray-500 font-sans">Snapshot Validation Target: Dec 12, 2026</p>
            </div>
          </div>
          <button className="border border-gray-800 bg-black text-[10px] uppercase tracking-widest py-2 px-4 hover:border-white text-white font-orbitron transition-all">
            Check Eligibility
          </button>
        </div>
      </div>
    </motion.div>
  );
}
