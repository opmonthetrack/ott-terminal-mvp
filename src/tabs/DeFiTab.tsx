import { useState } from 'react';
import { Link, Image as ImageIcon, Landmark, Cpu, ShieldCheck, Wallet } from 'lucide-react';

export function DeFiTab() {
  const [activeSubTab, setActiveSubTab] = useState('token_factory');
  const [currencyCode, setCurrencyCode] = useState('OTT');
  const [supply, setSupply] = useState('589000000');

  // 🔐 OTT Issuer (De Muntmeester) - Wallet 2
  const OTT_ISSUER_ADDRESS = "rPCF1f9pi91B7ad7FydnxFPKiF7cdycV5q";

  return (
    <div className="p-8 bg-black text-white min-h-screen">
      {/* TOP NAVIGATIE BINNEN DEFI HUB */}
      <div className="flex space-x-8 border-b border-white/10 mb-8 pb-4">
        <button 
          onClick={() => setActiveSubTab('token_factory')}
          className={`flex items-center gap-2 font-orbitron text-sm font-bold uppercase tracking-widest transition-colors ${activeSubTab === 'token_factory' ? 'text-white border-b-2 border-white pb-4 -mb-4' : 'text-gray-600 hover:text-gray-400'}`}
        >
          <Link size={16} /> Token Factory
        </button>
        <button 
          onClick={() => setActiveSubTab('nft_forge')}
          className={`flex items-center gap-2 font-orbitron text-sm font-bold uppercase tracking-widest transition-colors ${activeSubTab === 'nft_forge' ? 'text-white border-b-2 border-white pb-4 -mb-4' : 'text-gray-600 hover:text-gray-400'}`}
        >
          <ImageIcon size={16} /> NFT Minting Forge
        </button>
        <button 
          onClick={() => setActiveSubTab('yield_matrix')}
          className={`flex items-center gap-2 font-orbitron text-sm font-bold uppercase tracking-widest transition-colors ${activeSubTab === 'yield_matrix' ? 'text-white border-b-2 border-white pb-4 -mb-4' : 'text-gray-600 hover:text-gray-400'}`}
        >
          <Landmark size={16} /> Global Yield Matrix
        </button>
      </div>

      {/* CONTENT: TOKEN FACTORY */}
      {activeSubTab === 'token_factory' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT PANEL: SETUP */}
          <div className="bg-transparent border-none p-0">
            <h3 className="font-orbitron text-sm font-bold uppercase tracking-widest text-white mb-1">Asset Issuance Parameter Setup</h3>
            <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-8">Direct Ledger Payload Generator</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-2">Token Currency Code</label>
                <input 
                  type="text" 
                  value={currencyCode}
                  onChange={(e) => setCurrencyCode(e.target.value)}
                  className="w-full bg-black/50 border border-white/5 rounded p-3 text-white font-orbitron font-bold tracking-widest text-xs focus:border-[#2b82ff] focus:outline-none transition-colors" 
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-2">Total Max Supply Balance</label>
                <input 
                  type="text" 
                  value={supply}
                  onChange={(e) => setSupply(e.target.value)}
                  className="w-full bg-black/50 border border-white/5 rounded p-3 text-white font-orbitron font-bold tracking-widest text-xs focus:border-[#2b82ff] focus:outline-none transition-colors" 
                />
              </div>

              {/* 🔐 DE GEKOPPELDE MUNTMEESTER WALLET */}
              <div>
                <label className="block text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-2 flex justify-between">
                  <span>Cold Wallet Issuer Address (R...)</span>
                  <span className="text-[#2b82ff] flex items-center gap-1"><ShieldCheck size={10}/> Linked</span>
                </label>
                <input 
                  type="text" 
                  value={OTT_ISSUER_ADDRESS} 
                  disabled
                  className="w-full bg-[#2b82ff]/5 border border-[#2b82ff]/30 rounded p-3 text-gray-400 font-mono text-xs opacity-80 cursor-not-allowed" 
                />
                <p className="text-[8px] text-gray-500 mt-2 font-mono uppercase tracking-widest">Gekoppeld aan de OTT Master Issuer Node</p>
              </div>

              <div className="bg-transparent border border-[#2b82ff]/30 p-4 rounded flex justify-between items-center">
                <span className="text-xs font-mono text-[#2b82ff] uppercase tracking-widest flex items-center gap-2">
                  <Wallet size={14} /> OTT Service Fee
                </span>
                <span className="text-xs font-mono text-[#2b82ff]">5 XRP</span>
              </div>

              <button className="w-full bg-[#2b82ff] text-black font-orbitron font-black uppercase tracking-widest py-4 rounded hover:bg-[#2b82ff]/80 transition-colors mt-4">
                Compile Token Trustline JSON
              </button>
            </div>
          </div>

          {/* RIGHT PANEL: OUTPUT */}
          <div className="bg-black border border-white/5 rounded-lg flex flex-col h-full min-h-[400px]">
            <div className="p-4 border-b border-white/5 flex items-center gap-2">
               <Cpu size={14} className="text-gray-400" />
               <h3 className="font-orbitron text-xs font-bold uppercase tracking-widest text-gray-400">Cryptographic Payload Output</h3>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center text-gray-600 p-8">
              <ShieldCheck size={32} className="mb-4 opacity-30" />
              <p className="font-mono text-[10px] uppercase tracking-widest">Awaiting parameter compilation...</p>
            </div>
          </div>
        </div>
      )}

      {/* TIJDELIJKE PLACEHOLDERS VOOR ANDERE TABS */}
      {activeSubTab === 'nft_forge' && (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-lg text-gray-500 mt-8">
          <ImageIcon className="w-8 h-8 mx-auto mb-4 opacity-50" />
          <p className="font-orbitron text-xs uppercase tracking-widest">NFT Forge Initialization...</p>
        </div>
      )}

      {activeSubTab === 'yield_matrix' && (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-lg text-gray-500 mt-8">
          <Landmark className="w-8 h-8 mx-auto mb-4 opacity-50" />
          <p className="font-orbitron text-xs uppercase tracking-widest">Yield Matrix Initialization...</p>
        </div>
      )}

    </div>
  );
}
