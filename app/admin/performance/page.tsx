'use client';

import React, { useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { useQuantovestStore } from '@/lib/store';
import { Icon } from '@iconify/react';

export default function AdminPerformancePage() {
  const { publishDailyRoi, dailyLogs } = useQuantovestStore();
  const [percentage, setPercentage] = useState<number>(1.35);
  const [note, setNote] = useState('FX EUR/USD intraday rally + Crypto BTC momentum execution');
  const [published, setPublished] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    publishDailyRoi(percentage, note);
    setPublished(true);
    setTimeout(() => setPublished(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0D1215] text-[#E8EFEB] flex flex-col md:flex-row font-sans">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-8 space-y-8 overflow-y-auto pb-24 md:pb-8">
        <div className="border-b border-[#2B393F] pb-6 space-y-1">
          <h1 className="text-2xl font-normal text-[#E8EFEB]">Publish Daily ROI Percentage</h1>
          <p className="text-xs text-[#93A09A]">Enter today's strategy performance to automatically recalculate investor balances and animate their performance charts.</p>
        </div>

        {published && (
          <div className="p-4 bg-[#22C55E]/10 border border-[#22C55E] rounded-xl text-xs text-[#22C55E] flex items-center gap-2 animate-in fade-in duration-200">
            <Icon icon="solar:check-circle-bold" className="w-5 h-5 shrink-0" />
            <span>Successfully published {percentage >= 0 ? '+' : ''}{percentage}% ROI update across all active investor dashboards!</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Daily ROI Input Form */}
          <form onSubmit={handleSubmit} className="bg-[#151E23] border border-[#2B393F] rounded-2xl p-6 sm:p-8 space-y-5">
            <div>
              <label className="text-xs text-[#93A09A] block mb-1.5">1. Daily Performance Percentage (%)</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="0.01"
                  required
                  value={percentage}
                  onChange={e => setPercentage(Number(e.target.value))}
                  className="flex-1 bg-[#0D1215] border border-[#2B393F] rounded-xl px-4 py-3 text-lg text-[#E8EFEB] font-mono placeholder-[#5B616E] focus:outline-none focus:border-[#22C55E]"
                />
                <span className={`text-base font-mono font-semibold px-3 py-2 rounded-xl ${percentage >= 0 ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#CF202F]/10 text-[#CF202F]'}`}>
                  {percentage >= 0 ? '+' : ''}{percentage}%
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs text-[#93A09A] block mb-1.5">2. Market Allocation Note / Strategy Description</label>
              <textarea
                required
                rows={3}
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="e.g. FX GBP/JPY momentum scalp + US Equities tech rally"
                className="w-full bg-[#0D1215] border border-[#2B393F] rounded-xl p-3 text-xs text-[#E8EFEB] placeholder-[#5B616E] focus:outline-none focus:border-[#22C55E]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-[#22C55E] text-[#E8EFEB] font-semibold text-xs hover:bg-[#16A34A] transition-colors shadow-lg"
            >
              Publish Daily ROI & Update Investor Dashboards
            </button>
          </form>

          {/* History */}
          <div className="bg-[#151E23] border border-[#2B393F] rounded-2xl p-6 sm:p-8 space-y-4">
            <h3 className="text-base font-normal text-[#E8EFEB]">Recent Daily ROI Publications</h3>
            <div className="space-y-3">
              {dailyLogs.map((log) => (
                <div key={log.id} className="p-4 bg-[#0D1215] border border-[#2B393F] rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-[#E8EFEB]">{log.marketNote}</p>
                    <p className="text-[10px] text-[#93A09A] font-mono">{log.date}</p>
                  </div>
                  <span className={`font-mono font-semibold text-sm ${log.percentage >= 0 ? 'text-[#22C55E]' : 'text-[#CF202F]'}`}>
                    {log.percentage >= 0 ? '+' : ''}{log.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
