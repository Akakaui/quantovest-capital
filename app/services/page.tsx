'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Icon } from '@iconify/react';

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white text-[#0A0D0C] flex flex-col font-sans">
      <Navbar mode="light" />

      <section className="py-20 bg-[#F7F7F7] border-b border-[#DEE1E6]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 text-center space-y-4">
          <span className="text-xs font-mono uppercase tracking-widest text-[#22C55E]">Multi-Asset Solutions</span>
          <h1 className="text-4xl sm:text-6xl font-normal text-[#0A0D0C]">
            FX, Crypto & Stock Investment Services
          </h1>
          <p className="text-base text-[#5B616E] max-w-xl mx-auto">
            Quantovest Capital provides dedicated investment coverage across three core financial asset classes.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 space-y-12">
          {/* FX */}
          <div className="p-8 rounded-2xl bg-[#F7F7F7] border border-[#DEE1E6] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#0A0D0C] flex items-center justify-center text-[#22C55E]">
                <Icon icon="solar:dollar-minimalistic-bold" className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-normal text-[#0A0D0C]">Foreign Exchange (FX) Trading</h2>
            </div>
            <p className="text-xs text-[#5B616E] leading-relaxed">
              Institutional currency trading covering major pairs (EUR/USD, GBP/USD, USD/JPY) and high-frequency intraday momentum. Tight spread execution and automated stop-loss protection.
            </p>
          </div>

          {/* Crypto */}
          <div className="p-8 rounded-2xl bg-[#F7F7F7] border border-[#DEE1E6] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#0A0D0C] flex items-center justify-center text-[#22C55E]">
                <Icon icon="solar:bitcoin-bold" className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-normal text-[#0A0D0C]">Cryptocurrency Arbitrage & Yield</h2>
            </div>
            <p className="text-xs text-[#5B616E] leading-relaxed">
              24/7 automated crypto market execution targeting BTC, ETH, and SOL spot/futures delta-neutral arbitrage and trend momentum strategies.
            </p>
          </div>

          {/* Equities */}
          <div className="p-8 rounded-2xl bg-[#F7F7F7] border border-[#DEE1E6] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#0A0D0C] flex items-center justify-center text-[#22C55E]">
                <Icon icon="solar:chart-2-bold" className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-normal text-[#0A0D0C]">Global Equities & US Megacap Stocks</h2>
            </div>
            <p className="text-xs text-[#5B616E] leading-relaxed">
              Direct investment exposure to US technology giants (NVDA, AAPL, TSLA, MSFT) and blue-chip dividend growth equities.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
