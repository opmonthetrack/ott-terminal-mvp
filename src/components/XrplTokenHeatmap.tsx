import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  ExternalLink,
  Flame,
  Globe2,
  RefreshCcw,
  Search,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import {
  loadTop50XrplTokens,
  TOP_50_XRPL_TOKENS,
  type XrplTokenCategory,
  type XrplTokenMarketData,
} from "../lib/xrplHeatmapData";

type Props = {
  isEnglish?: boolean;
  onSelectTokenForSwap?: (token: XrplTokenMarketData) => void;
};

export function XrplTokenHeatmap({ isEnglish = true, onSelectTokenForSwap }: Props) {
  const [tokens, setTokens] = useState<XrplTokenMarketData[]>(TOP_50_XRPL_TOKENS);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<XrplTokenCategory | "all">("all");
  const [selectedToken, setSelectedToken] = useState<XrplTokenMarketData | null>(null);
  const [loading, setLoading] = useState(false);

  async function refreshData() {
    setLoading(true);
    try {
      const live = await loadTop50XrplTokens();
      setTokens(live);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshData();
  }, []);

  const filtered = useMemo(() => {
    return tokens.filter((t) => {
      const matchCat = category === "all" || t.category === category;
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        t.currency.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.issuer.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [tokens, category, search]);

  const maxCap = useMemo(() => {
    return Math.max(...filtered.map((t) => t.marketCapUsd), 1);
  }, [filtered]);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-pink-600 font-semibold text-xs uppercase tracking-widest">
            <Flame size={16} />
            <span>{isEnglish ? "XRPL Top 50 Token Heatmap" : "XRPL Top 50 Token Heatmap"}</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-950 mt-1">
            {isEnglish ? "Live Ecosystem Market Overview" : "Live Ecosysteem Marktoverzicht"}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <div className="relative min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isEnglish ? "Search symbol or address..." : "Zoek symbool of adres..."}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs font-mono focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => void refreshData()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
            <span>{isEnglish ? "Refresh" : "Vernieuwen"}</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {(["all", "stablecoin", "defi", "infrastructure", "nft-utility", "community"] as const).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              category === cat
                ? "bg-slate-950 text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {cat === "all"
              ? isEnglish
                ? "All Tokens"
                : "Alle Tokens"
              : cat === "stablecoin"
              ? "Stablecoins"
              : cat === "defi"
              ? "DeFi"
              : cat === "infrastructure"
              ? "Infrastructure"
              : cat === "nft-utility"
              ? "NFT & Utility"
              : "Community"}
          </button>
        ))}
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filtered.map((t) => {
          const isPositive = t.change24h >= 0;
          const ratio = Math.max(0.4, Math.min(1.5, Math.sqrt(t.marketCapUsd / maxCap) * 1.3));

          return (
            <div
              key={t.id}
              onClick={() => setSelectedToken(t)}
              style={{ minHeight: `${Math.round(80 * ratio)}px` }}
              className={`group relative flex cursor-pointer flex-col justify-between rounded-2xl p-3.5 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
                isPositive
                  ? t.change24h > 10
                    ? "bg-gradient-to-br from-emerald-600 to-teal-800 text-white"
                    : t.change24h > 3
                    ? "bg-gradient-to-br from-emerald-500 to-emerald-700 text-white"
                    : "bg-emerald-950/90 border border-emerald-500/30 text-emerald-100"
                  : t.change24h < -5
                  ? "bg-gradient-to-br from-rose-700 to-pink-900 text-white"
                  : "bg-rose-950/90 border border-rose-500/30 text-rose-100"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-orbitron font-extrabold text-sm tracking-wider">{t.currency}</span>
                    {t.verified && <ShieldCheck size={13} className="text-white/80 shrink-0" />}
                  </div>
                  <p className="text-[10px] opacity-75 font-mono truncate max-w-[90px]">{t.name}</p>
                </div>
                <ArrowUpRight size={14} className="opacity-0 transition-opacity group-hover:opacity-100 shrink-0" />
              </div>

              <div className="mt-3 flex items-end justify-between">
                <div>
                  <p className="font-mono text-xs font-bold">
                    {t.priceXrp >= 1 ? `${t.priceXrp.toFixed(2)} XRP` : `${t.priceXrp.toFixed(4)} XRP`}
                  </p>
                  <p className="text-[10px] opacity-70 font-mono">${t.priceUsd.toFixed(2)}</p>
                </div>

                <div className="flex items-center gap-0.5 text-xs font-bold font-mono">
                  {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                  <span>{isPositive ? `+${t.change24h.toFixed(2)}%` : `${t.change24h.toFixed(2)}%`}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Token Detail Modal Drawer */}
      {selectedToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <button
              type="button"
              onClick={() => setSelectedToken(null)}
              className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 font-orbitron font-extrabold text-white text-base">
                {selectedToken.currency.slice(0, 3)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-orbitron text-xl font-bold text-slate-950">{selectedToken.name}</h3>
                  <span className="font-mono text-xs text-slate-500">({selectedToken.currency})</span>
                </div>
                <p className="font-mono text-xs text-slate-500 truncate max-w-[280px]">
                  Issuer: {selectedToken.issuer}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-100">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Price (XRP)</p>
                <p className="mt-1 font-mono text-lg font-bold text-slate-950">{selectedToken.priceXrp} XRP</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-100">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Price (USD)</p>
                <p className="mt-1 font-mono text-lg font-bold text-slate-950">${selectedToken.priceUsd}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-100">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">24h Change</p>
                <p className={`mt-1 font-mono text-lg font-bold ${selectedToken.change24h >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {selectedToken.change24h >= 0 ? `+${selectedToken.change24h}%` : `${selectedToken.change24h}%`}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-100">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Trustlines</p>
                <p className="mt-1 font-mono text-lg font-bold text-slate-950">{selectedToken.trustlines.toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              {onSelectTokenForSwap && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectTokenForSwap(selectedToken);
                    setSelectedToken(null);
                  }}
                  className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-3 text-center text-xs font-bold uppercase tracking-wider text-white shadow-md hover:brightness-110"
                >
                  {isEnglish ? "Swap in DEX Terminal" : "Swappen in DEX Terminal"}
                </button>
              )}

              {selectedToken.onTheDexUrl && (
                <a
                  href={selectedToken.onTheDexUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <span>OnTheDex</span>
                  <ExternalLink size={13} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
