'use client';

import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface RoiCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PLAN_TIERS = [
  { name: 'Starter', min: 1500, max: 7499, dailyRoi: 15 },
  { name: 'Growth', min: 7500, max: 44999, dailyRoi: 25 },
  { name: 'Elite', min: 45000, max: Infinity, dailyRoi: 35 },
];

function getPlanForDeposit(amount: number) {
  return PLAN_TIERS.find(t => amount >= t.min && amount <= t.max) ?? PLAN_TIERS[0];
}

export default function RoiCalculatorModal({ isOpen, onClose }: RoiCalculatorModalProps) {
  const [deposit, setDeposit] = useState<number>(7500);
  const [inputValue, setInputValue] = useState<string>('7500');
  const [months, setMonths] = useState<number>(6);

  if (!isOpen) return null;

  const plan = getPlanForDeposit(deposit);
  const dailyRoi = plan.dailyRoi;
  const tradingDaysPerMonth = 21;
  const monthlyRoi = (Math.pow(1 + dailyRoi / 100, tradingDaysPerMonth) - 1) * 100;

  // Compound projections
  const chartData = [];
  let currentVal = deposit;
  for (let i = 0; i <= months; i++) {
    chartData.push({ month: i === 0 ? 'Start' : `Month ${i}`, value: Math.round(currentVal) });
    currentVal = currentVal * (1 + monthlyRoi / 100);
  }

  const projectedProfit = Math.round(currentVal - deposit);
  const totalProjected = Math.round(currentVal);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4 font-sans text-white">
      <div className="bg-[#12161A] border border-[#263437] rounded-2xl max-w-2xl w-full p-6 sm:p-8 relative shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b border-[#263437] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 flex items-center justify-center text-[#22C55E]">
              <Icon icon="solar:calculator-bold" className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Investment Return Calculator</h3>
              <p className="text-xs text-[#A8ACB3]">Compound projections based on fixed daily ROI per plan</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#A8ACB3] hover:text-white p-1">
            <Icon icon="solar:close-circle-bold" className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-[#A8ACB3] block mb-2">
                Initial Investment Amount ($ USD)
              </label>
              <input
                type="number"
                min="1500"
                max="1000000"
                value={inputValue}
                onChange={e => {
                  setInputValue(e.target.value);
                  const val = Number(e.target.value);
                  if (!isNaN(val) && val > 0) {
                    setDeposit(val);
                  }
                }}
                onBlur={() => {
                  let val = Number(inputValue);
                  if (isNaN(val) || val < 1500) val = 1500;
                  if (val > 1000000) val = 1000000;
                  setDeposit(val);
                  setInputValue(val.toString());
                }}
                className="bg-[#1A2528] border border-[#263437] rounded-xl px-4 py-2.5 text-sm font-mono text-white w-full focus:outline-none focus:border-[#22C55E] font-semibold mb-2"
              />
              <input
                type="range"
                min="1500"
                max="50000"
                step="500"
                value={Math.min(deposit, 50000)}
                onChange={e => {
                  const val = Number(e.target.value);
                  setDeposit(val);
                  setInputValue(val.toString());
                }}
                className="w-full accent-[#22C55E] bg-[#263437] h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#A8ACB3] mt-1 font-mono">
                <span>$1,500</span>
                <span>$7,500</span>
                <span>$45,000+</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#A8ACB3] flex justify-between mb-2">
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
                        ? 'bg-[#22C55E] text-[#07110B] font-semibold'
                        : 'bg-[#1A2528] border border-[#263437] text-[#A8ACB3] hover:text-white'
                    }`}
                  >
                    {m} Months
                  </button>
                ))}
              </div>
            </div>

            {/* Plan Info */}
            <div className="p-4 bg-[#1A2528] border border-[#263437] rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#A8ACB3]">Assigned Plan:</span>
                <span className="text-xs font-semibold text-[#22C55E]">{plan.name} Plan</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#A8ACB3]">Fixed Daily ROI:</span>
                <span className="text-xs font-mono font-bold text-[#22C55E]">{dailyRoi}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#A8ACB3]">Compounded Monthly:</span>
                <span className="text-xs font-mono font-semibold text-white">~{monthlyRoi.toFixed(1)}%</span>
              </div>
              <p className="text-[10px] text-[#A8ACB3] border-t border-[#263437] pt-2">
                {plan.name} plan: ${plan.min.toLocaleString()} min deposit, {dailyRoi}% fixed daily return.
              </p>
            </div>

            {/* All Plans Reference */}
            <div className="grid grid-cols-3 gap-2">
              {PLAN_TIERS.map(t => (
                <div key={t.name} className={`p-2 rounded-lg text-center text-[10px] border ${
                  t.name === plan.name
                    ? 'border-[#22C55E]/50 bg-[#22C55E]/10 text-[#22C55E]'
                    : 'border-[#263437] bg-[#1A2528] text-[#A8ACB3]'
                }`}>
                  <p className="font-semibold">{t.name}</p>
                  <p className="font-mono font-bold text-xs">{t.dailyRoi}%/day</p>
                </div>
              ))}
            </div>
          </div>

          {/* Chart & Results */}
          <div className="flex flex-col justify-between space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#1A2528] border border-[#263437] rounded-xl">
                <p className="text-[10px] text-[#A8ACB3] uppercase font-mono">Projected Profit</p>
                <p className="text-base font-mono font-bold text-[#22C55E] mt-0.5">
                  +${projectedProfit.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-[#1A2528] border border-[#263437] rounded-xl">
                <p className="text-[10px] text-[#A8ACB3] uppercase font-mono">Total Capital</p>
                <p className="text-base font-mono font-bold text-white mt-0.5">
                  ${totalProjected.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Projected Curve */}
            <div className="h-44 w-full bg-[#1A2528] border border-[#263437] rounded-xl p-2 relative">
              <p className="text-[10px] text-[#A8ACB3] font-mono px-2 pt-1">Projected Growth Curve</p>
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
                    contentStyle={{ backgroundColor: '#12161A', borderColor: '#263437', borderRadius: '12px', fontSize: '11px', color: '#FFFFFF' }}
                    formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Portfolio']}
                  />
                  <Area type="monotone" dataKey="value" stroke="#22C55E" strokeWidth={2} fillOpacity={1} fill="url(#calcGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Daily Breakdown */}
            <div className="p-3 bg-[#1A2528] border border-[#263437] rounded-xl">
              <p className="text-[10px] text-[#A8ACB3] uppercase font-mono mb-2">Daily Return</p>
              <div className="flex items-center justify-between">
                            <span className="text-xs text-[#A8ACB3]">{dailyRoi}% of ${deposit.toLocaleString()}</span>
                <span className="text-sm font-mono font-bold text-[#22C55E]">=${(deposit * dailyRoi / 100).toLocaleString()}/day</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 mt-6 border-t border-[#263437] flex items-center justify-between">
          <p className="text-[11px] text-[#A8ACB3] max-w-xs">
            *Projections are estimates based on fixed daily ROI rates. Actual returns may vary. Past performance does not guarantee future results.
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
