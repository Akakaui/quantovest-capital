'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import FundingWarningModal from '@/components/FundingWarningModal';
import { useQuantovestStore } from '@/lib/store';
import { Icon } from '@iconify/react';

export default function TradersPage() {
  const { traders, copyTrader, user } = useQuantovestStore();
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleCopy = (traderId: string) => {
    const res = copyTrader(traderId);
    if (!res.success) {
      setIsWarningOpen(true);
    } else {
      setToastMessage(res.message.replace('copytrading', 'investment').replace('copy', 'follow'));
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#0A0D0C] flex flex-col md:flex-row font-sans">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-8 space-y-8 overflow-y-auto pb-24 md:pb-8">
        {/* Header */}
        <div className="border-b border-[#DEE1E6] pb-6 space-y-1">
          <h1 className="text-2xl font-normal text-[#0A0D0C]">Portfolio Strategy Hub</h1>
          <p className="text-xs text-[#5B616E]">Browse and follow institutional strategy experts across FX, Crypto, and Equities.</p>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="p-4 bg-[#22C55E]/10 border border-[#22C55E] rounded-xl text-xs text-[#22C55E] flex items-center gap-2 animate-in fade-in duration-200">
            <Icon icon="solar:check-circle-bold" className="w-5 h-5 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Trader Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {traders.map((trader) => {
            const isCopying = user.copiedTraderId === trader.id;
            return (
              <div key={trader.id} className="p-6 rounded-2xl bg-white border border-[#DEE1E6] space-y-5 hover:border-[#22C55E]/40 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img src={trader.avatar} alt={trader.name} className="w-12 h-12 rounded-full object-cover border border-[#22C55E]/40" />
                    <div>
                      <h3 className="text-base font-medium text-[#0A0D0C]">{trader.name}</h3>
                      <span className="text-[10px] bg-[#F7F7F7] text-[#22C55E] border border-[#DEE1E6] px-2 py-0.5 rounded-full font-mono">
                        {trader.specialty}
                      </span>
                    </div>
                  </div>
                  {isCopying && (
                    <span className="px-2.5 py-1 rounded-full bg-[#22C55E] text-[#0A0D0C] font-mono text-[10px] font-bold">
                      STRATEGY ACTIVE
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#5B616E] leading-relaxed">{trader.bio}</p>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-[#F7F7F7] border border-[#DEE1E6] rounded-xl text-center">
                  <div>
                    <p className="text-[10px] text-[#5B616E] font-mono">Win Rate</p>
                    <p className="text-sm font-mono font-semibold text-[#22C55E]">{trader.winRate}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#5B616E] font-mono">30D Return</p>
                    <p className="text-sm font-mono font-semibold text-[#22C55E]">+{trader.thirtyDayReturn}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#5B616E] font-mono">Risk Level</p>
                    <p className="text-sm font-mono font-semibold text-[#0A0D0C]">{trader.riskLevel} / 5</p>
                  </div>
                </div>

                {/* Follow Button */}
                <button
                  onClick={() => handleCopy(trader.id)}
                  className={`w-full py-3 rounded-full text-xs font-semibold transition-colors flex items-center justify-center gap-2 ${
                    isCopying
                      ? 'bg-[#F7F7F7] border border-[#DEE1E6] text-[#0A0D0C] hover:bg-[#202722]'
                      : 'bg-[#22C55E] text-[#0A0D0C] hover:bg-[#16A34A]'
                  }`}
                >
                  <Icon icon="solar:users-group-rounded-bold" className="w-4 h-4" />
                  <span>{isCopying ? 'Strategy Active (Click to Re-follow)' : 'Follow Strategy ($500 Min Fund)'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </main>

      <FundingWarningModal isOpen={isWarningOpen} onClose={() => setIsWarningOpen(false)} />
    </div>
  );
}
