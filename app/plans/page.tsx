'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RoiCalculatorModal from '@/components/RoiCalculatorModal';
import Link from 'next/link';
import { Icon } from '@iconify/react';

export default function PlansPage() {
  const [isCalcOpen, setIsCalcOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-[#0A0D0C] flex flex-col font-sans">
      <Navbar mode="light" onOpenCalculator={() => setIsCalcOpen(true)} />

      {/* Hero Header */}
      <section className="py-20 bg-[#F7F7F7] border-b border-[#DEE1E6]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 text-center space-y-4">
          <span className="text-xs font-mono uppercase tracking-widest text-[#22C55E]">Transparent Tiers</span>
          <h1 className="text-4xl sm:text-6xl font-normal text-[#0A0D0C]">
            Investment Plans & Target ROI
          </h1>
          <p className="text-base text-[#5B616E] max-w-xl mx-auto">
            Choose your preferred capital tier starting at $500. Quantovest automatically distributes exposure across FX, Crypto, and Stocks.
          </p>
          <button
            onClick={() => setIsCalcOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#22C55E] text-[#0A0D0C] font-semibold text-xs hover:bg-[#16A34A] transition-colors shadow-sm"
          >
            <Icon icon="solar:calculator-bold" className="w-5 h-5" />
            Launch Interactive ROI Calculator Graph
          </button>
        </div>
      </section>

      {/* Plans Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="p-8 rounded-2xl bg-[#F7F7F7] border border-[#DEE1E6] space-y-6">
              <div>
                <span className="text-xs font-mono text-[#5B616E]">STARTER TIER</span>
                <h3 className="text-2xl font-normal text-[#0A0D0C] mt-1">Starter Plan</h3>
                <p className="text-3xl font-mono font-semibold text-[#22C55E] mt-3">$500 <span className="text-xs font-sans text-[#5B616E]">Min Deposit</span></p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-[#DEE1E6] space-y-1">
                <p className="text-xs text-[#5B616E]">Target Monthly ROI</p>
                <p className="text-xl font-mono text-[#22C55E] font-semibold">8% – 12% / Month</p>
              </div>
              <ul className="space-y-3 text-xs text-[#5B616E]">
                <li className="flex items-center gap-2"><Icon icon="solar:check-circle-bold" className="w-4 h-4 text-[#22C55E]" /> FX & Top Crypto Asset Access</li>
                <li className="flex items-center gap-2"><Icon icon="solar:check-circle-bold" className="w-4 h-4 text-[#22C55E]" /> Daily ROI Dashboard Updates</li>
                <li className="flex items-center gap-2"><Icon icon="solar:check-circle-bold" className="w-4 h-4 text-[#22C55E]" /> 0% Management Fee (15% Perf Fee)</li>
              </ul>
              <Link
                href="/signup"
                className="w-full block py-3.5 rounded-full text-center text-xs font-semibold bg-[#0A0D0C] text-white hover:bg-[#12161A] transition-colors"
              >
                Select Starter Plan ($500)
              </Link>
            </div>

            {/* Growth Plan */}
            <div className="p-8 rounded-2xl bg-[#0A0D0C] text-white border-2 border-[#22C55E] space-y-6 relative shadow-xl scale-105">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#22C55E] text-[#0A0D0C] font-mono text-[10px] font-bold uppercase tracking-wider">
                Recommended
              </span>
              <div>
                <span className="text-xs font-mono text-[#22C55E]">GROWTH TIER</span>
                <h3 className="text-2xl font-normal text-white mt-1">Growth Plan</h3>
                <p className="text-3xl font-mono font-semibold text-[#22C55E] mt-3">$5,000 <span className="text-xs font-sans text-[#A8ACB3]">Min Deposit</span></p>
              </div>
              <div className="p-4 bg-[#12161A] rounded-xl border border-[#202722] space-y-1">
                <p className="text-xs text-[#A8ACB3]">Target Monthly ROI</p>
                <p className="text-xl font-mono text-[#22C55E] font-semibold">14% – 18% / Month</p>
              </div>
              <ul className="space-y-3 text-xs text-[#A8ACB3]">
                <li className="flex items-center gap-2"><Icon icon="solar:check-circle-bold" className="w-4 h-4 text-[#22C55E]" /> FX, Crypto & US Equities Access</li>
                <li className="flex items-center gap-2"><Icon icon="solar:check-circle-bold" className="w-4 h-4 text-[#22C55E]" /> Dedicated Account Manager</li>
                <li className="flex items-center gap-2"><Icon icon="solar:check-circle-bold" className="w-4 h-4 text-[#22C55E]" /> Priority Investment Execution</li>
              </ul>
              <Link
                href="/signup"
                className="w-full block py-3.5 rounded-full text-center text-xs font-semibold bg-[#22C55E] text-[#0A0D0C] hover:bg-[#16A34A] transition-colors shadow-lg"
              >
                Select Growth Plan ($5,000)
              </Link>
            </div>

            {/* Elite Plan */}
            <div className="p-8 rounded-2xl bg-[#F7F7F7] border border-[#DEE1E6] space-y-6">
              <div>
                <span className="text-xs font-mono text-[#5B616E]">ELITE TIER</span>
                <h3 className="text-2xl font-normal text-[#0A0D0C] mt-1">Elite Plan</h3>
                <p className="text-3xl font-mono font-semibold text-[#22C55E] mt-3">$15,000 <span className="text-xs font-sans text-[#5B616E]">Min Deposit</span></p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-[#DEE1E6] space-y-1">
                <p className="text-xs text-[#5B616E]">Target Monthly ROI</p>
                <p className="text-xl font-mono text-[#22C55E] font-semibold">20% – 28% / Month</p>
              </div>
              <ul className="space-y-3 text-xs text-[#5B616E]">
                <li className="flex items-center gap-2"><Icon icon="solar:check-circle-bold" className="w-4 h-4 text-[#22C55E]" /> Full Multi-Asset VIP Access</li>
                <li className="flex items-center gap-2"><Icon icon="solar:check-circle-bold" className="w-4 h-4 text-[#22C55E]" /> Custom Risk Controls</li>
                <li className="flex items-center gap-2"><Icon icon="solar:check-circle-bold" className="w-4 h-4 text-[#22C55E]" /> Direct Portfolio Manager Insights</li>
              </ul>
              <Link
                href="/signup"
                className="w-full block py-3.5 rounded-full text-center text-xs font-semibold bg-[#0A0D0C] text-white hover:bg-[#12161A] transition-colors"
              >
                Select Elite Plan ($15,000)
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <RoiCalculatorModal isOpen={isCalcOpen} onClose={() => setIsCalcOpen(false)} />
    </div>
  );
}
