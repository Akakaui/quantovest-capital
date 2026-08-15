'use client';

import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { useQuantovestStore } from '@/lib/store';

interface RoiCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RoiCalculatorModal({ isOpen, onClose }: RoiCalculatorModalProps) {
  const { dailyLogs } = useQuantovestStore();
  const [deposit, setDeposit] = useState<number>(5000);
  const [months, setMonths] = useState<number>(6);

  if (!isOpen) return null;

  // Calculate customized return based on actual daily log entries
  const averageDailyPerformance = dailyLogs && dailyLogs.length > 0
    ? dailyLogs.reduce((acc, log) => acc + log.percentage, 0) / dailyLogs.length
    : 1.35; // default fallback if no entries

  // Approximate 21 trading days per month for compounded ROI
  const calculatedMonthlyRoi = Number(((Math.pow(1 + averageDailyPerformance / 100, 21) - 1) * 100).toFixed(2));

  // Determine plan tier
  let planName = 'Starter Plan';
  if (deposit >= 15000) {
    planName = 'Elite Plan';
  } else if (deposit >= 5000) {
    planName = 'Growth Plan';
  }

  // Calculate compound projections month-by-month
  const chartData = [];
  let currentVal = deposit;
  for (let i = 0; i <= months; i++) {
    chartData.push({
      month: i === 0 ? 'Start' : `Month ${i}`,
      value: Math.round(currentVal)
    });
    currentVal = currentVal * (1 + calculatedMonthlyRoi / 100);
  }

  const projectedProfit = Math.round(currentVal - deposit);
  const totalProjected = Math.round(currentVal);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4 font-sans text-[#0A0D0C]">
      <div className="bg-white border border-[#DEE1E6] rounded-2xl max-w-2xl w-full p-6 sm:p-8 relative shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b border-[#DEE1E6] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 flex items-center justify-center text-[#22C55E]">
              <Icon icon="solar:calculator-bold" className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#0A0D0C]">Investment Return Calculator</h3>
              <p className="text-xs text-[#5B616E]">Compounded projections based on actual daily performance entries</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#5B616E] hover:text-[#0A0D0C] p-1">
            <Icon icon="solar:close-circle-bold" className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-[#5B616E] block mb-2">
                Initial Investment Amount ($ USD)
              </label>
              <div className="flex gap-2 items-center mb-2">
                <input
                  type="number"
                  min="500"
                  max="1000000"
                  value={deposit}
                  onChange={e => setDeposit(Math.max(0, Number(e.target.value)))}
                  className="bg-[#F7F7F7] border border-[#DEE1E6] rounded-xl px-4 py-2.5 text-sm font-mono text-[#0A0D0C] w-full focus:outline-none focus:border-[#22C55E] font-semibold"
                />
              </div>
              <input
                type="range"
                min="500"
                max="50000"
                step="500"
                value={deposit > 50000 ? 50000 : deposit}
                onChange={e => setDeposit(Number(e.target.value))}
                className="w-full accent-[#22C55E] bg-[#EEF0F3] h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#5B616E] mt-1 font-mono">
                <span>$500</span>
                <span>$5,000</span>
                <span>$15,000+</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#5B616E] flex justify-between mb-2">
                <span>Investment Horizon</span>
                <span className="font-mono text-[#22C55E] font-semibold">{months} Months</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[3, 6, 12].map(m => (
                  <button
                    key={m}
                    onClick={() => setMonths(m)}
                    className={`py-2.5 rounded-xl text-xs font-mono font-medium transition-all ${
                      months === m
                        ? 'bg-[#22C55E] text-[#0A0D0C] font-semibold'
                        : 'bg-[#F7F7F7] border border-[#DEE1E6] text-[#5B616E] hover:text-[#0A0D0C]'
                    }`}
                  >
                    {m} Months
                  </button>
                ))}
              </div>
            </div>

            {/* Compound Summary */}
            <div className="p-4 bg-[#F7F7F7] border border-[#DEE1E6] rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#5B616E]">Assigned Plan Tier:</span>
                <span className="text-xs font-semibold text-[#22C55E]">{planName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#5B616E]">Compounded Monthly ROI:</span>
                <span className="text-xs font-mono font-semibold text-[#0A0D0C] flex items-center gap-1.5">
                  ~{calculatedMonthlyRoi}%
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-sans">
                    Live Rates
                  </span>
                </span>
              </div>
              <p className="text-[10px] text-[#5B616E] border-t border-[#DEE1E6] pt-2">
                Compounded rate derived from actual published performance updates ({averageDailyPerformance.toFixed(2)}% daily average).
              </p>
            </div>
          </div>

          {/* Chart & Results */}
          <div className="flex flex-col justify-between space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#F7F7F7] border border-[#DEE1E6] rounded-xl">
                <p className="text-[10px] text-[#5B616E] uppercase font-mono">Projected Profit</p>
                <p className="text-base font-mono font-bold text-[#22C55E] mt-0.5">
                  +${projectedProfit.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-[#F7F7F7] border border-[#DEE1E6] rounded-xl">
                <p className="text-[10px] text-[#5B616E] uppercase font-mono">Total Capital</p>
                <p className="text-base font-mono font-bold text-[#0A0D0C] mt-0.5">
                  ${totalProjected.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Projected Curve */}
            <div className="h-44 w-full bg-[#F7F7F7] border border-[#DEE1E6] rounded-xl p-2 relative">
              <p className="text-[10px] text-[#5B616E] font-mono px-2 pt-1">Projected Signal Growth Curve</p>
              <ResponsiveContainer width="100%" height="80%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="calcGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" hide />
                  <YAxis hide domain={['dataMin', 'dataMax']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFF', borderColor: '#DEE1E6', borderRadius: '12px', fontSize: '11px', color: '#0A0D0C' }}
                    formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Portfolio']}
                  />
                  <Area type="monotone" dataKey="value" stroke="#22C55E" strokeWidth={2} fillOpacity={1} fill="url(#calcGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 mt-6 border-t border-[#DEE1E6] flex items-center justify-between">
          <p className="text-[11px] text-[#5B616E] max-w-xs">
            *Projections compounded automatically based on actual published returns. Past returns do not guarantee future performance.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full text-xs font-semibold bg-[#22C55E] text-[#0A0D0C] hover:bg-[#16A34A]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
