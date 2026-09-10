export type XrplTokenMarketData = {
  id: string; currency: string; name: string; issuer: string;
  priceUsd: number | null; volume24hUsd: number | null;
  marketCapUsd: number | null; numTrades: number | null; lastTradeAt: string;
};
export type MarketSnapshot = { tokens: XrplTokenMarketData[]; source: string; fetchedAt: string };

export function marketNumber(...values: unknown[]): number | null {
  for (const value of values) {
    if (typeof value === "string" && !value.trim()) continue;
    if (typeof value !== "string" && typeof value !== "number") continue;
    const number = Number(value);
    if (Number.isFinite(number) && number >= 0) return number;
  }
  return null;
}

export function normalizeMarketToken(value: unknown): XrplTokenMarketData | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const currency = String(row.currency ?? row.code ?? row.symbol ?? "").trim();
  const issuer = String(row.issuer ?? "").trim();
  if (!currency || (currency !== "XRP" && !/^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(issuer))) return null;
  if (currency === "XRP" && issuer) return null;
  // Generic price/volume fields do not establish a currency or reporting period.
  const priceUsd = marketNumber(row.price_mid_usd, row.price_usd, row.priceUsd, row.priceUSD);
  const volume24hUsd = marketNumber(row.volume_24h_usd, row.volume24hUsd, row.volume24hUSD);
  const marketCapUsd = marketNumber(row.market_cap_usd, row.marketCapUsd);
  const numTrades = marketNumber(row.trades_24h, row.trades24h);
  if ([priceUsd, volume24hUsd, marketCapUsd, numTrades].every(item => item === null)) return null;
  const lastTrade = String(row.last_trade_at ?? row.lastTradeAt ?? "");
  return {
    id: `${currency}:${issuer}`, currency, issuer: issuer || "XRPL native asset",
    name: String(row.name ?? currency), priceUsd, volume24hUsd, marketCapUsd, numTrades,
    lastTradeAt: Number.isFinite(Date.parse(lastTrade)) ? lastTrade : "",
  };
}

export function parseMarketSnapshot(payload: unknown, source: string): MarketSnapshot {
  const body = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  if (body.error) throw new Error("Market provider returned an error");
  const data = Array.isArray(payload) ? payload : body.tokens ?? body.items ?? body.results ?? body.data;
  const nested = data && typeof data === "object" ? data as Record<string, unknown> : {};
  const rows = Array.isArray(data) ? data : nested.tokens ?? nested.items;
  if (!Array.isArray(rows)) throw new Error("Market provider returned no token records");
  const unique = new Map<string, XrplTokenMarketData>();
  for (const row of rows) {
    // OnTheDEX documents these fields for its rolling 24-hour daily endpoint.
    // Keep this mapping source-specific: generic fields from other providers have no proven units.
    const record = row && typeof row === "object" ? row as Record<string, unknown> : {};
    const token = normalizeMarketToken(source === "OnTheDEX API" ? {
      ...record, name: record.token_name ?? record.name,
      volume_24h_usd: record.volume_usd, market_cap_usd: record.market_cap,
      trades_24h: record.num_trades,
    } : row);
    if (token && !unique.has(token.id)) unique.set(token.id, token);
  }
  const tokens = [...unique.values()].sort((a, b) => (b.volume24hUsd ?? -1) - (a.volume24hUsd ?? -1)).slice(0, 50);
  if (!tokens.length) throw new Error("No usable market records");
  return { tokens, source, fetchedAt: new Date().toISOString() };
}

export const MARKET_SOURCES = [
  { label: "OnTheDEX API", url: "https://api.onthedex.live/public/v1/daily/tokens?by=volume&min_trades=1&per_page=50" },
  { label: "XRPL.to API", url: "https://api.xrpl.to/v1/tokens?limit=50&sort=volume" },
];

export async function loadMarketSnapshot(signal?: AbortSignal): Promise<MarketSnapshot> {
  for (const source of MARKET_SOURCES) {
    signal?.throwIfAborted();
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal?.addEventListener("abort", abort, { once: true });
    const timer = setTimeout(abort, 5000);
    try {
      const response = await fetch(source.url, { signal: controller.signal });
      if (!response.ok) throw new Error(`Market provider HTTP ${response.status}`);
      return parseMarketSnapshot(await response.json(), source.label);
    } catch {
      signal?.throwIfAborted();
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
    }
  }
  throw new Error("Market data is unavailable. No estimated or fallback prices are shown.");
}
