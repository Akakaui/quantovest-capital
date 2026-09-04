const COINGECKO_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
};

const FALLBACK_PRICES: Record<string, number> = {
  BTC: 67500,
  ETH: 3450,
  SOL: 178,
};

const FIAT_SYMBOLS = new Set(["USD", "USDT", "USDC"]);

export function isFiat(symbol: string) {
  return FIAT_SYMBOLS.has(symbol.toUpperCase());
}

export async function fetchLivePrices(symbols: string[]): Promise<Record<string, number>> {
  const seen: Record<string, boolean> = {};
  const cryptoSymbols = symbols.filter(s => {
    const u = s.toUpperCase();
    if (isFiat(u) || !COINGECKO_IDS[u]) return false;
    if (seen[u]) return false;
    seen[u] = true;
    return true;
  });
  if (cryptoSymbols.length === 0) {
    const result: Record<string, number> = {};
    for (const s of symbols) result[s.toUpperCase()] = 1;
    return result;
  }

  const ids = cryptoSymbols.map(s => COINGECKO_IDS[s]).join(",");
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
      { signal: controller.signal, cache: "no-store" },
    );
    clearTimeout(timeout);
    if (!res.ok) return buildFallback(symbols);
    const data = await res.json();
    const result: Record<string, number> = {};
    for (const s of symbols) {
      const upper = s.toUpperCase();
      if (isFiat(upper)) {
        result[upper] = 1;
      } else {
        const cgId = COINGECKO_IDS[upper];
        result[upper] = data[cgId]?.usd ?? FALLBACK_PRICES[upper] ?? 0;
      }
    }
    return result;
  } catch {
    return buildFallback(symbols);
  }
}

function buildFallback(symbols: string[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const s of symbols) {
    const upper = s.toUpperCase();
    if (isFiat(upper)) result[upper] = 1;
    else result[upper] = FALLBACK_PRICES[upper] ?? 0;
  }
  return result;
}
