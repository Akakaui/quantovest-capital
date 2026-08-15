'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import OnboardingModal from '@/components/OnboardingModal';
import KycModal from '@/components/KycModal';
import RoiCalculatorModal from '@/components/RoiCalculatorModal';
import { useQuantovestStore } from '@/lib/store';
import { Icon } from '@iconify/react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import Link from 'next/link';

export default function InvestorDashboard() {
  const { user, chartData, dailyLogs } = useQuantovestStore();
  const [isMasked, setIsMasked] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isKycOpen, setIsKycOpen] = useState(false);
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [tourStep, setTourStep] = useState<number | null>(null);

  useEffect(() => {
    // Show onboarding questionnaire if not completed
    if (!user.onboardingCompleted) {
      setIsOnboardingOpen(true);
    } else if (user.kycStatus !== 'approved') {
      // Show KYC prompt if not approved
      setIsKycOpen(true);
    }
  }, [user.onboardingCompleted, user.kycStatus]);

  useEffect(() => {
    // Check if welcome tour completed
    if (typeof window !== 'undefined') {
      const tourDone = localStorage.getItem('quantovest_tour_completed');
      if (!tourDone && user.onboardingCompleted) {
        setTourStep(0);
      }
    }
  }, [user.onboardingCompleted]);

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#0A0D0C] flex flex-col md:flex-row font-sans">
      <Sidebar
        onOpenDeposit={() => {}}
        onOpenWithdraw={() => {}}
        onOpenCalculator={() => setIsCalcOpen(true)}
      />

      <main className="flex-1 p-4 sm:p-8 space-y-8 overflow-y-auto pb-24 md:pb-8">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#DEE1E6] pb-6">
          <div className="flex items-center gap-3">
            <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full border-2 border-[#22C55E]/40 object-cover shadow-md" />
            <div>
              <h1 className="text-2xl font-normal text-[#0A0D0C]">Hello, {user.name}</h1>
              <p className="text-xs text-[#5B616E] flex items-center gap-2">
                Plan: <span className="text-[#22C55E] font-semibold font-mono">{user.plan}</span>
                <span>•</span>
                KYC:{' '}
                <span
                  className={`font-mono text-[11px] font-semibold ${
                    user.kycStatus === 'approved' ? 'text-[#22C55E]' : 'text-amber-400'
                  }`}
                >
                  {user.kycStatus.toUpperCase()}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user.kycStatus !== 'approved' && (
              <button
                onClick={() => setIsKycOpen(true)}
                className="px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium hover:bg-amber-500/20 transition-colors flex items-center gap-1.5"
              >
                <Icon icon="solar:shield-warning-bold" className="w-4 h-4" />
                <span>Complete Verification</span>
              </button>
            )}
            <button
              onClick={() => setIsCalcOpen(true)}
              className="px-4 py-2 rounded-full bg-white border border-[#DEE1E6] text-[#22C55E] text-xs font-mono hover:bg-[#F7F7F7] transition-colors flex items-center gap-1.5"
            >
              <Icon icon="solar:calculator-bold" className="w-4 h-4" />
              <span>ROI Calculator</span>
            </button>
          </div>
        </div>

        {/* KYC Floating Banner Alert */}
        {user.kycStatus !== 'approved' && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Icon icon="solar:shield-warning-bold" className="w-6 h-6 text-amber-400 shrink-0" />
              <p className="text-xs text-amber-200">
                <strong>Identity Verification Pending:</strong> Complete minimal 2-document upload (Government ID + Proof of Address) to enable instant copytrade processing.
              </p>
            </div>
            <button
              onClick={() => setIsKycOpen(true)}
              className="px-5 py-2 rounded-full bg-amber-400 text-[#0A0D0C] text-xs font-semibold hover:bg-amber-300 transition-colors whitespace-nowrap"
            >
              Upload Documents Now
            </button>
          </div>
        )}

        {/* Physical Metallic Balance Card */}
        <div className="relative overflow-hidden p-6 sm:p-8 rounded-2xl bg-white border border-[#DEE1E6] shadow-2xl space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase font-mono tracking-wider text-[#5B616E]">Total Portfolio Balance</p>
              <div className="flex items-center gap-3 mt-1">
                <h2 className="text-3xl sm:text-5xl font-mono font-semibold text-[#0A0D0C]">
                  {isMasked ? '••••••••' : `$${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                </h2>
                <button
                  onClick={() => setIsMasked(!isMasked)}
                  className="p-2 text-[#5B616E] hover:text-[#0A0D0C] transition-colors"
                >
                  <Icon icon={isMasked ? 'solar:eye-bold' : 'solar:eye-closed-bold'} className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chip Graphic */}
            <div className="w-12 h-9 rounded-lg bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 p-1 flex items-center justify-center opacity-90 shadow-inner">
              <div className="w-full h-full border border-amber-800/40 rounded flex items-center justify-center text-[10px] font-mono text-amber-950 font-bold">
                QC
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#DEE1E6]">
            <div>
              <p className="text-[10px] uppercase font-mono text-[#5B616E]">Total Invested</p>
              <p className="text-base font-mono font-semibold text-[#0A0D0C]">${user.totalInvested.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-mono text-[#5B616E]">Total ROI Profit</p>
              <p className="text-base font-mono font-semibold text-[#22C55E]">+${user.totalProfit.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-mono text-[#5B616E]">Daily ROI</p>
              <p className={`text-base font-mono font-semibold ${user.dailyRoiPercent >= 0 ? 'text-[#22C55E]' : 'text-[#CF202F]'}`}>
                {user.dailyRoiPercent >= 0 ? '+' : ''}{user.dailyRoiPercent}%
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-mono text-[#5B616E]">All-Time Return</p>
              <p className="text-base font-mono font-semibold text-[#22C55E]">+{user.allTimeRoiPercent}%</p>
            </div>
          </div>
        </div>

        {/* Interactive Performance & Calculator Graph */}
        <div className="p-6 rounded-2xl bg-white border border-[#DEE1E6] space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-normal text-[#0A0D0C] flex items-center gap-2">
                Portfolio Signal Growth Line
                <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></span>
              </h3>
              <p className="text-xs text-[#5B616E]">Dynamic daily updates driven by trading firm strategy execution</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/30 px-3 py-1 rounded-full">
                Live Dynamic Sync
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="signalGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#A8ACB3" fontSize={11} tickLine={false} />
                <YAxis stroke="#A8ACB3" fontSize={11} tickLine={false} domain={['dataMin - 100', 'dataMax + 100']} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#12161A', borderColor: '#202722', borderRadius: '12px', fontSize: '12px', color: '#FFF' }}
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Portfolio Value']}
                />
                <Area type="monotone" dataKey="value" stroke="#22C55E" strokeWidth={3} fillOpacity={1} fill="url(#signalGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Strategy Activity Log */}
        <div className="p-6 rounded-2xl bg-white border border-[#DEE1E6] space-y-4">
          <h3 className="text-base font-normal text-[#0A0D0C]">Daily ROI Strategy Activity Log</h3>
          <div className="space-y-3">
            {dailyLogs.map((log) => (
              <div key={log.id} className="p-4 bg-[#F7F7F7] border border-[#DEE1E6] rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${log.percentage >= 0 ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#CF202F]/10 text-[#CF202F]'}`}>
                    <Icon icon={log.percentage >= 0 ? 'solar:graph-up-bold' : 'solar:graph-down-bold'} className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#0A0D0C]">{log.marketNote}</p>
                    <p className="text-[10px] text-[#5B616E] font-mono">{log.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-mono font-semibold ${log.percentage >= 0 ? 'text-[#22C55E]' : 'text-[#CF202F]'}`}>
                    {log.percentage >= 0 ? '+' : ''}{log.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Modals */}
      <OnboardingModal isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} />
      <KycModal isOpen={isKycOpen} onClose={() => setIsKycOpen(false)} />
      <RoiCalculatorModal isOpen={isCalcOpen} onClose={() => setIsCalcOpen(false)} />

      {/* Interactive Welcome Tour Overlay */}
      {tourStep !== null && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-[#0A0D0C]">
          <div className="bg-white border border-[#DEE1E6] rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#DEE1E6] pb-2">
              <span className="text-[10px] uppercase font-mono text-[#22C55E] font-bold tracking-wider">
                Step {tourStep + 1} of 4 • User Guide
              </span>
              <button 
                onClick={() => {
                  setTourStep(null);
                  localStorage.setItem('quantovest_tour_completed', 'true');
                }}
                className="text-[#5B616E] hover:text-[#0A0D0C] text-xs font-semibold"
              >
                Skip Tour
              </button>
            </div>

            {tourStep === 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-[#0A0D0C]">
                  Welcome to Quantovest Capital
                </h4>
                <p className="text-xs text-[#5B616E] leading-relaxed">
                  Let&apos;s take a quick 30-second tour of your new light-theme managed investment portal.
                </p>
              </div>
            )}

            {tourStep === 1 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-[#0A0D0C]">
                  Live Portfolio Balance
                </h4>
                <p className="text-xs text-[#5B616E] leading-relaxed">
                  This card displays your total current capital, absolute ROI profits, and the overall yield of your managed assets.
                </p>
              </div>
            )}

            {tourStep === 2 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-[#0A0D0C]">
                  Portfolio Strategy Managers
                </h4>
                <p className="text-xs text-[#5B616E] leading-relaxed">
                  Click on the "Portfolio Managers" tab in the sidebar (or bottom bar on mobile) to select and follow institutional strategy experts.
                </p>
              </div>
            )}

            {tourStep === 3 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-[#0A0D0C]">
                  Funding & Payouts
                </h4>
                <p className="text-xs text-[#5B616E] leading-relaxed">
                  Deposit capital via cryptocurrency to start strategy mirroring instantly, or request withdrawals back to your wallet or bank account.
                </p>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setTourStep(prev => prev !== null && prev > 0 ? prev - 1 : prev)}
                disabled={tourStep === 0}
                className={`px-4 py-2 rounded-full text-xs font-semibold border ${
                  tourStep === 0 
                    ? 'border-[#DEE1E6] text-[#DEE1E6]/50 cursor-not-allowed' 
                    : 'border-[#DEE1E6] text-[#5B616E] hover:bg-[#F7F7F7]'
                }`}
              >
                Back
              </button>
              <button
                onClick={() => {
                  if (tourStep === 3) {
                    setTourStep(null);
                    localStorage.setItem('quantovest_tour_completed', 'true');
                  } else {
                    setTourStep(prev => prev !== null ? prev + 1 : null);
                  }
                }}
                className="px-5 py-2 rounded-full text-xs font-semibold bg-[#22C55E] text-[#0A0D0C] hover:bg-[#16A34A] transition-colors"
              >
                {tourStep === 3 ? 'Get Started' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
