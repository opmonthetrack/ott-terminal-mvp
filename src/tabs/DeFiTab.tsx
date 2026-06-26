import { useState } from 'react';
import { Link, Image as ImageIcon, Landmark, Cpu, ShieldCheck, Wallet } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export function DeFiTab() {
  const [activeSubTab, setActiveSubTab] = useState('token_factory');
  const [currencyCode, setCurrencyCode] = useState('OTT');
  const [supply, setSupply] = useState('589000000');
  const { t } = useLanguage();

  // 🔐 OTT Issuer (De Muntmeester) - Wallet 2
  const OTT_ISSUER_ADDRESS = "rPCF1f9pi91B7ad7FydnxFPKiF7cdycV5q";

  return (
    <div className="p-8 bg-black text-white min-h-screen">
      {/* NAVIGATION */}
      <div className="flex space-x-8 border-b border-white/10 mb-8 pb-4">
        <button onClick={() => setActiveSubTab('token_factory')} className={`flex items-center gap-2 font-orbitron text-sm font-bold uppercase tracking-widest transition-colors ${activeSubTab === 'token_factory' ? 'text-white border-b-2 border-white pb-4 -mb-4' : 'text-gray-600'}`}>
          <Link size={16} /> Token Factory
        </button>
        <button onClick={() => setActiveSubTab('nft_forge')} className={`flex items-center gap-2 font-orbitron text-sm font-bold uppercase tracking-widest transition-colors ${activeSubTab === 'nft_forge' ? 'text-white border-b-2 border-white pb-4 -mb-4' : 'text-gray-600'}`}>
          <ImageIcon size={16} /> NFT Minting Forge
        </button>
        <button onClick={() => setActiveSubTab('yield_matrix')} className={`flex items-center gap-2 font-orbitron text-sm font-bold uppercase tracking-widest transition-colors ${activeSubTab === 'yield_matrix' ? 'text-white border-b-2 border-white pb-4 -mb-4' : 'text-gray-600'}`}>
          <Landmark size={16} /> Global Yield Matrix
        </button>
      </div>

      {/* CONTENT SECTIONS */}
      {activeSubTab === 'token_factory' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-transparent border-none p-0">
            <h3 className="font-orbitron text-sm font-bold uppercase tracking-widest text-white mb-1">Asset Issuance Parameter Setup</h3>
            <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-8">Direct Ledger Payload Generator</p>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-2">Token Currency Code</label>
                <input type="text" value={currencyCode} onChange={(e) => setCurrencyCode(e.target.value)} className="w-full bg-black/50 border border-white/5 rounded p-3 text-white font-orbitron text-xs focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-2">Total Max Supply</label>
                <input type="text" value={supply} onChange={(e) => setSupply(e.target.value)} className="w-full bg-black/50 border border-white/5 rounded p-3 text-white font-mono text-xs focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-2 flex justify-between">
                  <span>Cold Wallet Issuer Address</span>
                  <span className="text-[#2b82ff] flex items-center gap-1"><ShieldCheck size={10}/> Linked</span>
                </label>
                <input type="text" value={OTT_ISSUER_ADDRESS} disabled className="w-full bg-[#2b82ff]/5 border border-[#2b82ff]/30 rounded p-3 text-gray-400 font-mono text-xs cursor-not-allowed" />
              </div>
              <button className="w-full bg-[#2b82ff] text-black font-orbitron font-black uppercase tracking-widest py-4 rounded hover:bg-[#2b82ff]/80 transition-colors">
                Compile Token Trustline JSON
              </button>
            </div>
          </div>
          <div className="bg-black border border-white/5 rounded-lg flex flex-col items-center justify-center p-8 text-gray-600">
             <Cpu size={48} className="mb-4 opacity-20" />
             <p className="font-mono text-[10px] uppercase tracking-widest">Awaiting parameter compilation...</p>
          </div>
        </div>
      )}

      {activeSubTab === 'nft_forge' && (
        <div className="p-12 border border-white/10 rounded-lg text-center bg-black/50">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 text-[#ff2079] opacity-70" />
          <p className="font-orbitron text-xs uppercase tracking-widest text-white">NFT Forge is Initialized</p>
          <p className="font-mono text-[10px] text-gray-500 mt-2">Connect Master Issuer Wallet to begin minting sequence.</p>
        </div>
      )}

      {activeSubTab === 'yield_matrix' && (
        <div className="p-12 border border-white/10 rounded-lg text-center bg-black/50">
          <Landmark className="w-12 h-12 mx-auto mb-4 text-green-500 opacity-70" />
          <p className="font-orbitron text-xs uppercase tracking-widest text-white">Global Yield Matrix</p>
          <p className="font-mono text-[10px] text-gray-500 mt-2">Real-time ROI intelligence engine active.</p>
        </div>
      )}
    </div>
  );
}
