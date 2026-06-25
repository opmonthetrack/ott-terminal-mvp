import { useState } from 'react';
import { Loader2, ShieldAlert, CheckCircle, Info } from 'lucide-react';

export function OTTIntelligence() {
  const [tokenId, setTokenId] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);

  const runAgentAnalysis = async () => {
    if (!tokenId) return;
    setIsAnalyzing(true);
    
    // Hier simuleren we de "Agent" die data ophaalt
    // In de volgende stap gaan we dit koppelen aan echte XRPL data
    setTimeout(() => {
      setAnalysisResult({
        trustScore: 85,
        compliance: "MiCA Compliant",
        riskLevel: "Low",
        warnings: ["Goede liquiditeit", "Doxxed team"],
        jurisdiction: "EU"
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="p-8 bg-black text-white min-h-screen">
      <h1 className="text-2xl font-orbitron font-black uppercase tracking-widest mb-2">OTT Intelligence</h1>
      <p className="text-gray-500 font-mono text-xs mb-8">AI-Powered XRPL Compliance & Risk Agent</p>

      <div className="max-w-2xl border border-white/10 p-6 bg-gray-950/30 rounded-lg">
        <label className="block text-[10px] uppercase text-gray-400 mb-2">Token Identifier</label>
        <input 
          className="w-full bg-black border border-white/20 p-4 font-mono text-white mb-4"
          placeholder="Voer XRPL Token ID in..."
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
        />
        <button 
          onClick={runAgentAnalysis}
          disabled={isAnalyzing}
          className="w-full bg-[#2b82ff] py-4 font-black uppercase hover:bg-opacity-80 transition-all flex items-center justify-center gap-2"
        >
          {isAnalyzing ? <Loader2 className="animate-spin" /> : "START INTELLIGENCE SCAN"}
        </button>
      </div>

      {analysisResult && (
        <div className="mt-8 max-w-2xl grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-900 border border-white/10 rounded-lg">
            <h3 className="text-xs text-gray-500 uppercase">Trust Score</h3>
            <p className="text-3xl font-black text-[#2b82ff]">{analysisResult.trustScore}/100</p>
          </div>
          <div className="p-4 bg-gray-900 border border-white/10 rounded-lg">
            <h3 className="text-xs text-gray-500 uppercase">Compliance</h3>
            <p className="text-lg font-bold text-green-400">{analysisResult.compliance}</p>
          </div>
          <div className="col-span-2 p-4 bg-gray-900 border border-white/10 rounded-lg">
            <h3 className="text-xs text-gray-500 uppercase mb-2">Agent Insights</h3>
            <ul className="text-sm font-mono space-y-2">
              {analysisResult.warnings.map((w: string, i: number) => (
                <li key={i} className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> {w}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}