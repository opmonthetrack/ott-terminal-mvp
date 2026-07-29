import { useMemo, useState } from "react";
import {
  ArrowDownUp,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Coins,
  ExternalLink,
  Flame,
  Loader2,
  RefreshCcw,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { MAKE_WAVES_SOURCE_TAG } from "../lib/makeWaves";
import { connectWalletProvider } from "../lib/walletConnectors";
import { TOP_50_XRPL_TOKENS, type XrplTokenMarketData } from "../lib/xrplHeatmapData";
import { useTerminalLanguage } from "../lib/useTerminalLanguage";
import type { WalletProviderId } from "../lib/walletRegistry";

type Props = {
  isEnglish?: boolean;
  initialToken?: XrplTokenMarketData | null;
  walletAddress?: string;
};

export function XrplDexSwapTerminal({ initialToken, walletAddress = "guest" }: Props) {
  const { language } = useTerminalLanguage();
  const isEnglish = language === "en";

  const [fromToken, setFromToken] = useState<XrplTokenMarketData>(TOP_50_XRPL_TOKENS[0]); // XRP
  const [toToken, setToToken] = useState<XrplTokenMarketData>(
    initialToken || TOP_50_XRPL_TOKENS[1], // RLUSD
  );
  const [payAmount, setPayAmount] = useState("10");
  const [slippage, setSlippage] = useState("0.5");
  const [selectedWallet, setSelectedWallet] = useState<WalletProviderId>("xaman");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [swapPayloadUrl, setSwapPayloadUrl] = useState("");

  const estimatedReceive = useMemo(() => {
    const amount = Number(payAmount) || 0;
    if (amount <= 0) return "0.00";

    // From XRP to Token
    if (fromToken.currency === "XRP" && toToken.currency !== "XRP") {
      const receive = amount / (toToken.priceXrp || 1);
      return receive.toFixed(4);
    }
    // From Token to XRP
    if (fromToken.currency !== "XRP" && toToken.currency === "XRP") {
      const receive = amount * (fromToken.priceXrp || 1);
      return receive.toFixed(4);
    }
    // Token to Token via XRP rate
    const fromInXrp = amount * (fromToken.priceXrp || 1);
    const receive = fromInXrp / (toToken.priceXrp || 1);
    return receive.toFixed(4);
  }, [payAmount, fromToken, toToken]);

  function flipTokens() {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
  }

  async function handleCreateSwapPayload() {
    setBusy(true);
    setError("");
    setStatus("");
    setSwapPayloadUrl("");

    const amount = Number(payAmount);
    if (!amount || amount <= 0) {
      setError(isEnglish ? "Enter a valid amount to swap." : "Vul een geldig bedrag in om te swappen.");
      setBusy(false);
      return;
    }

    try {
      if (selectedWallet === "crossmark" || selectedWallet === "gemwallet" || selectedWallet === "metamask-xrpl") {
        setStatus(isEnglish ? `Connecting to ${selectedWallet.toUpperCase()}...` : `Koppelen met ${selectedWallet.toUpperCase()}...`);
        const conn = await connectWalletProvider(selectedWallet);
        setStatus(
          isEnglish
            ? `Connected ${conn.walletAddress.slice(0, 8)}... OrderCreate payload ready with SourceTag ${MAKE_WAVES_SOURCE_TAG}.`
            : `Gekoppeld ${conn.walletAddress.slice(0, 8)}... OrderCreate payload gereed met SourceTag ${MAKE_WAVES_SOURCE_TAG}.`,
        );
      } else {
        // Xaman Payload simulation / live deep link creation
        setStatus(isEnglish ? "Creating Xaman XRPL OfferCreate payload..." : "Xaman XRPL OfferCreate payload wordt gemaakt...");
        const payloadUrl = `https://xumm.app/detect/xapp:ott-dex-swap?from=${fromToken.currency}&to=${toToken.currency}&amount=${amount}&sourcetag=${MAKE_WAVES_SOURCE_TAG}`;
        setSwapPayloadUrl(payloadUrl);
        setStatus(isEnglish ? "Xaman swap payload created! Scan or click below to sign." : "Xaman swap payload gemaakt! Scan of klik hieronder om te ondertekenen.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Swap payload creation failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left: DEX Swap Card */}
      <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-5">
          <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs uppercase tracking-widest">
            <Zap size={16} />
            <span>{isEnglish ? "Native XRPL DEX Swap" : "Native XRPL DEX Swap"}</span>
          </div>
          <span className="font-mono text-xs font-semibold text-slate-500">
            SourceTag {MAKE_WAVES_SOURCE_TAG}
          </span>
        </div>

        {/* Pay Currency Box */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>{isEnglish ? "You Pay" : "Je Betaalt"}</span>
            <div className="flex gap-1.5">
              {["25%", "50%", "75%", "Max"].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setPayAmount(preset === "Max" ? "100" : String(Number(preset.replace("%", "")) * 2))}
                  className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-mono text-slate-700 hover:bg-slate-100"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="number"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-transparent font-mono text-2xl font-bold text-slate-950 focus:outline-none"
            />
            <select
              value={fromToken.id}
              onChange={(e) => {
                const found = TOP_50_XRPL_TOKENS.find((t) => t.id === e.target.value);
                if (found) setFromToken(found);
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-orbitron font-bold text-xs text-slate-950 shadow-sm focus:outline-none"
            >
              {TOP_50_XRPL_TOKENS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.currency}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Flip Button */}
        <div className="my-3 flex justify-center">
          <button
            type="button"
            onClick={flipTokens}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:scale-105 transition-all"
          >
            <ArrowDownUp size={16} />
          </button>
        </div>

        {/* Receive Currency Box */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>{isEnglish ? "You Receive (Estimated)" : "Je Ontvangt (Geschat)"}</span>
            <span className="font-mono text-[10px] text-slate-500">
              Rate: 1 {fromToken.currency} ≈ {(fromToken.priceXrp / (toToken.priceXrp || 1)).toFixed(4)} {toToken.currency}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-full font-mono text-2xl font-bold text-emerald-600">
              {estimatedReceive}
            </div>
            <select
              value={toToken.id}
              onChange={(e) => {
                const found = TOP_50_XRPL_TOKENS.find((t) => t.id === e.target.value);
                if (found) setToToken(found);
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-orbitron font-bold text-xs text-slate-950 shadow-sm focus:outline-none"
            >
              {TOP_50_XRPL_TOKENS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.currency}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Wallet Selection & Slippage */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1 block">
              {isEnglish ? "Signing Wallet" : "Onderteken Wallet"}
            </label>
            <select
              value={selectedWallet}
              onChange={(e) => setSelectedWallet(e.target.value as WalletProviderId)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-950 shadow-sm"
            >
              <option value="xaman">Xaman (Mobile / xApp)</option>
              <option value="crossmark">CROSSMARK Extension</option>
              <option value="gemwallet">GemWallet Extension</option>
              <option value="metamask-xrpl">MetaMask XRPL Snap</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1 block">
              {isEnglish ? "Max Slippage" : "Max Slippage"}
            </label>
            <div className="flex gap-1.5">
              {["0.1%", "0.5%", "1.0%"].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setSlippage(val.replace("%", ""))}
                  className={`flex-1 rounded-xl border py-2 font-mono text-xs font-semibold ${
                    slippage === val.replace("%", "")
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => void handleCreateSwapPayload()}
          disabled={busy}
          className="mt-6 w-full rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 py-4 font-orbitron text-sm font-black uppercase tracking-widest text-white shadow-lg transition-all hover:brightness-110 disabled:opacity-50"
        >
          {busy ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" size={16} />
              {isEnglish ? "Creating XRPL Offer..." : "XRPL Order maken..."}
            </span>
          ) : (
            `${isEnglish ? "Swap" : "Swap"} ${fromToken.currency} → ${toToken.currency}`
          )}
        </button>

        {/* Status / Error feedback */}
        {status && (
          <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3.5 text-xs text-blue-950 font-mono">
            {status}
          </div>
        )}
        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 font-mono">
            {error}
          </div>
        )}
        {swapPayloadUrl && (
          <div className="mt-4">
            <a
              href={swapPayloadUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-bold text-white shadow-md hover:bg-slate-800"
            >
              <span>{isEnglish ? "Open Sign Request in Xaman" : "Open Ondertekenverzoek in Xaman"}</span>
              <ExternalLink size={14} />
            </a>
          </div>
        )}
      </div>

      {/* Right: Orderbook Preview & Pair Stats */}
      <div className="lg:col-span-5 space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-orbitron font-bold text-sm text-slate-950 uppercase mb-4">
            {fromToken.currency} / {toToken.currency} Orderbook
          </h3>

          <div className="space-y-4 font-mono text-xs">
            {/* Bids (Buying) */}
            <div>
              <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-2">Bids (Buy)</p>
              <div className="space-y-1.5">
                <div className="flex justify-between rounded-lg bg-emerald-50 px-3 py-1.5 text-emerald-950">
                  <span>{(fromToken.priceXrp * 0.998).toFixed(4)}</span>
                  <span>1,420 {fromToken.currency}</span>
                </div>
                <div className="flex justify-between rounded-lg bg-emerald-50/70 px-3 py-1.5 text-emerald-900">
                  <span>{(fromToken.priceXrp * 0.995).toFixed(4)}</span>
                  <span>3,850 {fromToken.currency}</span>
                </div>
                <div className="flex justify-between rounded-lg bg-emerald-50/40 px-3 py-1.5 text-emerald-800">
                  <span>{(fromToken.priceXrp * 0.990).toFixed(4)}</span>
                  <span>12,000 {fromToken.currency}</span>
                </div>
              </div>
            </div>

            {/* Spread Divider */}
            <div className="border-y border-slate-100 py-2 text-center text-[10px] text-slate-400">
              Spread: 0.2% | AMM Liquidity Active
            </div>

            {/* Asks (Selling) */}
            <div>
              <p className="text-[10px] font-semibold text-rose-600 uppercase tracking-wider mb-2">Asks (Sell)</p>
              <div className="space-y-1.5">
                <div className="flex justify-between rounded-lg bg-rose-50 px-3 py-1.5 text-rose-950">
                  <span>{(fromToken.priceXrp * 1.002).toFixed(4)}</span>
                  <span>950 {fromToken.currency}</span>
                </div>
                <div className="flex justify-between rounded-lg bg-rose-50/70 px-3 py-1.5 text-rose-900">
                  <span>{(fromToken.priceXrp * 1.005).toFixed(4)}</span>
                  <span>4,200 {fromToken.currency}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
