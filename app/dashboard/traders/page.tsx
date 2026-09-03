'use client';

import React, { useState, useEffect } from 'react';
import InvestorSidebar from '@/components/InvestorSidebar';
import CopyModal from '@/components/traders/CopyModal';
import MyCopies from '@/components/traders/MyCopies';
import { Icon } from '@iconify/react';

interface ApiTrader {
  id: string;
  name: string;
  imageUrl: string | null;
  imagePath: string | null;
  specialty: string;
  winRateBps: number;
  thirtyDayReturnBps: number;
  riskLevel: number;
  bio: string | null;
  active: number;
  createdAt: string;
}

export default function TradersPage() {
  const [traders, setTraders] = useState<ApiTrader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedTraderIds, setCopiedTraderIds] = useState<Set<string>>(new Set());
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [selectedTrader, setSelectedTrader] = useState<{ id: string; name: string } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function loadTraders() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/traders');
        if (!res.ok) throw new Error('Failed to load traders');
        const data = await res.json();
        setTraders(data.filter((t: ApiTrader) => t.active === 1));
      } catch {
        setError('Could not load portfolio managers. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    loadTraders();
  }, []);

  useEffect(() => {
    async function loadCopies() {
      try {
        const res = await fetch('/api/traders/my');
        if (res.ok) {
          const data = await res.json();
          setCopiedTraderIds(new Set(data.map((c: { traderId: string }) => c.traderId)));
        }
      } catch { /* ignore */ }
    }
    void loadCopies();
  }, [refreshKey]);

  function handleCopyClick(traderId: string, traderName: string) {
    setSelectedTrader({ id: traderId, name: traderName });
    setCopyModalOpen(true);
  }

  function handleCopySuccess(traderId: string) {
    setCopiedTraderIds(prev => new Set(prev).add(traderId));
    setCopyModalOpen(false);
    setToastMessage(`Successfully connected strategy!`);
    setRefreshKey(k => k + 1);
    setTimeout(() => setToastMessage(null), 4000);
  }

  const bpsToPercent = (bps: number) => (bps / 100).toFixed(1);

  return (
    <div className="min-h-screen bg-[#0A0F11] text-[#F3F7F4] flex flex-col md:flex-row font-sans">
      <InvestorSidebar />

      <main className="flex-1 p-4 sm:p-8 space-y-8 overflow-y-auto pb-24 md:pb-8">
        {/* Header */}
        <div className="border-b border-[#263437] pb-6 space-y-1">
          <h1 className="text-2xl font-normal text-[#F3F7F4]">Portfolio Managers</h1>
          <p className="text-xs text-[#93A09A]">Browse strategy managers and follow their approach to grow your portfolio.</p>
        </div>

        {/* My Copies */}
        <MyCopies key={refreshKey} onRefresh={() => setRefreshKey(k => k + 1)} />

        {/* Toast Notification */}
        {toastMessage && (
          <div className="p-4 bg-[#22C55E]/10 border border-[#22C55E] rounded-xl text-xs text-[#22C55E] flex items-center gap-2 animate-in fade-in duration-200">
            <Icon icon="solar:check-circle-bold" className="w-5 h-5 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-6 rounded-2xl bg-[#141C1F] border border-[#263437] space-y-5 animate-pulse">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#263437]" />
                    <div className="space-y-2">
                      <div className="h-4 w-28 bg-[#263437] rounded" />
                      <div className="h-3 w-20 bg-[#263437] rounded-full" />
                    </div>
                  </div>
                </div>
                <div className="h-3 w-full bg-[#263437] rounded" />
                <div className="grid grid-cols-2 gap-2 p-3 bg-[#0A0F11] border border-[#263437] rounded-xl">
                  {[1, 2].map((j) => (
                    <div key={j} className="text-center space-y-1">
                      <div className="h-2 w-12 bg-[#263437] rounded mx-auto" />
                      <div className="h-3 w-10 bg-[#263437] rounded mx-auto" />
                    </div>
                  ))}
                </div>
                <div className="h-10 w-full bg-[#263437] rounded-full" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-6 rounded-2xl bg-[#141C1F] border border-red-500/40 text-center space-y-3">
            <Icon icon="solar:danger-circle-bold" className="w-10 h-10 text-red-400 mx-auto" />
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-full text-xs font-semibold bg-[#22C55E] text-[#F3F7F4] hover:bg-[#16A34A] transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Trader Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {traders.length === 0 && (
              <div className="col-span-full p-8 rounded-2xl bg-[#141C1F] border border-[#263437] text-center space-y-3">
                <Icon icon="solar:users-group-rounded-bold" className="w-10 h-10 text-[#93A09A] mx-auto" />
                <p className="text-sm text-[#93A09A]">No portfolio managers available yet.</p>
                <p className="text-[10px] text-[#5B616E]">Check back soon — new managers are added regularly.</p>
              </div>
            )}
            {traders.map((trader) => {
              const isCopying = copiedTraderIds.has(trader.id);
              return (
                <div key={trader.id} className="p-6 rounded-2xl bg-[#141C1F] border border-[#263437] space-y-5 hover:border-[#22C55E]/40 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img src={trader.imageUrl || trader.imagePath || `https://api.dicebear.com/7.x/avataaars/svg?seed=${trader.name}`} alt={trader.name} className="w-12 h-12 rounded-full object-cover border border-[#22C55E]/40" />
                      <div>
                        <h3 className="text-base font-medium text-[#F3F7F4]">{trader.name}</h3>
                        <span className="text-[10px] bg-[#0A0F11] text-[#22C55E] border border-[#263437] px-2 py-0.5 rounded-full font-mono">
                          {trader.specialty}
                        </span>
                      </div>
                    </div>
                    {isCopying && (
                      <span className="px-2.5 py-1 rounded-full bg-[#22C55E] text-[#F3F7F4] font-mono text-[10px] font-bold">
                        STRATEGY ACTIVE
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#93A09A] leading-relaxed">{trader.bio}</p>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-2 p-3 bg-[#0A0F11] border border-[#263437] rounded-xl text-center">
                    <div>
                      <p className="text-[10px] text-[#93A09A] font-mono">Win Rate</p>
                      <p className="text-sm font-mono font-semibold text-[#22C55E]">{bpsToPercent(trader.winRateBps)}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#93A09A] font-mono">30D Return</p>
                      <p className="text-sm font-mono font-semibold text-[#22C55E]">+{bpsToPercent(trader.thirtyDayReturnBps)}%</p>
                    </div>
                  </div>

                  {/* Follow Button */}
                  <button
                    onClick={() => isCopying ? {} : handleCopyClick(trader.id, trader.name)}
                    className={`w-full py-3 rounded-full text-xs font-semibold transition-colors flex items-center justify-center gap-2 ${
                      isCopying
                        ? 'bg-[#0A0F11] border border-[#263437] text-[#F3F7F4] hover:bg-[#202722]'
                        : 'bg-[#22C55E] text-[#F3F7F4] hover:bg-[#16A34A]'
                    }`}
                  >
                    <Icon icon="solar:users-group-rounded-bold" className="w-4 h-4" />
                    <span>{isCopying ? 'Strategy Active' : 'Follow Strategy ($1,500 Min)'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Copy Modal */}
      {selectedTrader && (
        <CopyModal
          isOpen={copyModalOpen}
          traderId={selectedTrader.id}
          traderName={selectedTrader.name}
          onClose={() => { setCopyModalOpen(false); setSelectedTrader(null); }}
          onSuccess={handleCopySuccess}
        />
      )}
    </div>
  );
}
