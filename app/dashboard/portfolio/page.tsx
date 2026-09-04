'use client';

import React, { useState, useEffect } from 'react';
import InvestorSidebar from '@/components/InvestorSidebar';
import HoldingCard from '@/components/portfolio/HoldingCard';
import AllocationPie from '@/components/portfolio/AllocationPie';
import OrderBook from '@/components/portfolio/OrderBook';
import { Icon } from '@iconify/react';

const ASSETS = [
  { symbol: 'BTC', name: 'Bitcoin', coingeckoId: 'bitcoin', tradingviewSymbol: 'BINANCE:BTCUSDT' },
  { symbol: 'ETH', name: 'Ethereum', coingeckoId: 'ethereum', tradingviewSymbol: 'BINANCE:ETHUSDT' },
  { symbol: 'SOL', name: 'Solana', coingeckoId: 'solana', tradingviewSymbol: 'BINANCE:SOLUSDT' },
  { symbol: 'XRP', name: 'Ripple', coingeckoId: 'ripple', tradingviewSymbol: 'BINANCE:XRPUSDT' },
];

interface Holding {
  id: number;
  investorId: string;
  assetSymbol: string;
  assetName: string;
  quantity: string;
  costBasisCents: number;
  currentPriceCents: number;
  createdAt: string;
  updatedAt: string;
}

interface AllocationData {
  name: string;
  percent: number;
  color: string;
}

interface PriceData {
  [key: string]: { usd: number; usd_24h_change?: number };
}

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [allocation, setAllocation] = useState<AllocationData[]>([]);
  const [prices, setPrices] = useState<PriceData>({});
  const [accountBalance, setAccountBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeAsset, setActiveAsset] = useState(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [holdingsRes, allocRes, profileRes] = await Promise.all([
          fetch('/api/portfolio/holdings', { cache: 'no-store' }),
          fetch('/api/portfolio/allocation', { cache: 'no-store' }),
          fetch('/api/investor-profile', { cache: 'no-store' }),
        ]);

        if (profileRes.ok) {
          const profile = await profileRes.json();
          setAccountBalance(Number(profile.balance ?? 0));
        }

        if (holdingsRes.ok) setHoldings(await holdingsRes.json());
        if (allocRes.ok) {
          const data = await allocRes.json();
          setAllocation(data.allocation ?? []);
        }

        try {
          const ids = ASSETS.map(a => a.coingeckoId).join(',');
          const priceRes = await fetch(`/api/portfolio/prices?ids=${ids}`);
          if (priceRes.ok) setPrices(await priceRes.json());
        } catch { /* ignore price fetch errors */ }
      } catch {
        setError('Failed to load portfolio data');
      }
      setLoading(false);
    }
    void load();
  }, []);

  const holdingsValue = holdings.reduce((sum, h) => {
    const price = prices[h.assetSymbol.toLowerCase()]?.usd ?? (h.currentPriceCents / 100);
    return sum + parseFloat(h.quantity) * price;
  }, 0);
  const holdingsCost = holdings.reduce((sum, h) => sum + h.costBasisCents, 0) / 100;
  const totalValue = holdings.length > 0 ? holdingsValue : accountBalance;
  const totalCost = holdings.length > 0 ? holdingsCost : accountBalance;
  const totalPnl = totalValue - totalCost;
  const totalPnlPercent = totalCost > 0 ? ((totalPnl / totalCost) * 100) : 0;

  const asset = ASSETS[activeAsset];
  const currentPrice = prices[asset.coingeckoId]?.usd ?? 0;
  const change24h = prices[asset.coingeckoId]?.usd_24h_change ?? 0;

  return (
    <div className="min-h-screen bg-[#0A0F11] text-[#F3F7F4] flex flex-col md:flex-row font-sans">
      <InvestorSidebar />
      <main className="flex-1 p-4 sm:p-8 space-y-6 overflow-y-auto pb-24 md:pb-8">
        {/* Header */}
        <div className="border-b border-[#263437] pb-6 space-y-1">
          <h1 className="text-2xl font-normal text-[#F3F7F4]">Portfolio</h1>
          <p className="text-xs text-[#93A09A]">Live charts, holdings, and allocation breakdown.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 bg-[#141C1F] border border-[#263437] rounded-xl">
            <p className="text-[10px] uppercase font-mono text-[#93A09A]">Total Value</p>
            <p className="text-base sm:text-lg font-mono font-semibold text-[#F3F7F4] truncate">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="p-3 sm:p-4 bg-[#141C1F] border border-[#263437] rounded-xl">
            <p className="text-[10px] uppercase font-mono text-[#93A09A]">Total Cost</p>
            <p className="text-base sm:text-lg font-mono font-semibold text-[#F3F7F4] truncate">${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="p-3 sm:p-4 bg-[#141C1F] border border-[#263437] rounded-xl">
            <p className="text-[10px] uppercase font-mono text-[#93A09A]">P&L</p>
            <p className={`text-base sm:text-lg font-mono font-semibold truncate ${totalPnl >= 0 ? 'text-[#22C55E]' : 'text-[#CF202F]'}`}>
              {totalPnl >= 0 ? '+' : ''}${totalPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-3 sm:p-4 bg-[#141C1F] border border-[#263437] rounded-xl">
            <p className="text-[10px] uppercase font-mono text-[#93A09A]">P&L %</p>
            <p className={`text-base sm:text-lg font-mono font-semibold truncate ${totalPnlPercent >= 0 ? 'text-[#22C55E]' : 'text-[#CF202F]'}`}>
              {totalPnlPercent >= 0 ? '+' : ''}{totalPnlPercent.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Live Chart Section */}
        <div className="bg-[#141C1F] border border-[#263437] rounded-2xl overflow-hidden">
          {/* Asset Tabs + Price Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 border-b border-[#263437]">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {ASSETS.map((a, i) => (
                <button
                  key={a.symbol}
                  onClick={() => setActiveAsset(i)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono font-medium transition-all whitespace-nowrap ${
                    activeAsset === i
                      ? 'bg-[#22C55E] text-[#07110B]'
                      : 'bg-[#1A2528] border border-[#263437] text-[#93A09A] hover:text-white hover:border-[#22C55E]/40'
                  }`}
                >
                  {a.symbol}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-[#93A09A]">{asset.name}</p>
                <p className="text-lg sm:text-xl font-mono font-bold text-white">
                  ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold ${
                change24h >= 0 ? 'bg-[#22C55E]/15 text-[#22C55E]' : 'bg-[#CF202F]/15 text-[#CF202F]'
              }`}>
                {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
              </div>
            </div>
          </div>

          {/* TradingView Widget */}
          <div className="h-[300px] sm:h-[400px]">
            <iframe
              key={asset.tradingviewSymbol}
              src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_${asset.symbol}&symbol=${asset.tradingviewSymbol}&interval=D&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=fixed&studies=[]&theme=dark&style=1&timezone=exchange&modify=0&includesessions=0&allow_symbol_change=0&details=0&hotlist=0&calendar=0&news=0`}
              className="w-full h-full border-0"
              allowFullScreen
            />
          </div>
        </div>

        {/* Holdings + Allocation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Holdings */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-semibold text-[#F3F7F4]">Your Holdings</h2>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-28 bg-[#141C1F] border border-[#263437] rounded-xl animate-pulse" />
                ))}
              </div>
            ) : holdings.length === 0 ? (
              <div className="p-12 bg-[#141C1F] border border-[#263437] rounded-2xl text-center">
                <Icon icon="solar:chart-square-bold" className="w-12 h-12 text-[#263437] mx-auto mb-3" />
                <p className="text-xs text-[#93A09A]">No holdings yet. Deposit and copy a trader to start.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {holdings.map(h => (
                  <HoldingCard
                    key={h.id}
                    symbol={h.assetSymbol}
                    name={h.assetName}
                    quantity={h.quantity}
                    currentPrice={prices[h.assetSymbol.toLowerCase()]?.usd ?? (h.currentPriceCents / 100)}
                    costBasis={h.costBasisCents / 100}
                    change24h={prices[h.assetSymbol.toLowerCase()]?.usd_24h_change}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Allocation Pie */}
          <div>
            <AllocationPie data={allocation} />
          </div>
        </div>

        {/* Activity / Trade History */}
        <OrderBook />
      </main>
    </div>
  );
}
