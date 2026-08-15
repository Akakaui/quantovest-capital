'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import Link from 'next/link';

export default function ThreeDPhoneHero() {
  const [activeScreen, setActiveScreen] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const screens = [
    { title: 'Live Dashboard', desc: 'Real-time portfolio tracking & Signal Line charts', icon: 'solar:widget-bold' },
    { title: 'Multi-Asset Allocation', desc: 'Automated distribution across FX, Crypto & Stocks', icon: 'solar:chart-2-bold' },
    { title: 'Strategy Experts', desc: 'Follow verified institutional strategy managers', icon: 'solar:users-group-rounded-bold' },
    { title: 'Transparent Plans', desc: 'Starting at $500 with up to 28% target monthly ROI', icon: 'solar:shield-star-bold' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveScreen(prev => (prev + 1) % screens.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [screens.length]);

  return (
    <div ref={containerRef} className="relative w-full max-w-6xl mx-auto py-12 px-4 flex flex-col lg:flex-row items-center justify-between gap-12 text-white">
      {/* Left Column: Headlines & Animated Controls */}
      <div className="lg:w-1/2 space-y-6 text-center lg:text-left z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1A1F24] border border-[#202722] text-[#22C55E] text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
          INSTITUTIONAL INVESTMENT PLATFORM
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-white leading-none">
          Your Capital. <br />
          <span className="text-[#22C55E]">Our Expertise.</span>
        </h1>

        <p className="text-base sm:text-lg text-[#A8ACB3] max-w-lg mx-auto lg:mx-0 leading-relaxed">
          Access top-tier algorithmic FX, Crypto, and Stock strategy execution starting at <strong>$500</strong>. Track your portfolio growth live.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
          <Link
            href="/signup"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#22C55E] text-[#0A0D0C] font-semibold text-base hover:bg-[#16A34A] transition-colors shadow-lg hover:shadow-2xl flex items-center justify-center gap-2"
          >
            <span>Get Started ($500 Min)</span>
            <Icon icon="solar:alt-arrow-right-bold" className="w-5 h-5" />
          </Link>
          <Link
            href="/plans"
            className="w-full sm:w-auto px-8 py-4 rounded-full border border-[#202722] bg-[#12161A] text-white font-medium text-base hover:bg-[#1A1F24] transition-colors flex items-center justify-center gap-2"
          >
            <Icon icon="solar:calculator-bold" className="w-5 h-5 text-[#22C55E]" />
            <span>Explore Plans & ROI</span>
          </Link>
        </div>

        {/* Screen Indicator Selector */}
        <div className="pt-6 border-t border-[#202722] grid grid-cols-2 gap-3 max-w-md mx-auto lg:mx-0 text-left">
          {screens.map((sc, i) => (
            <button
              key={i}
              onClick={() => setActiveScreen(i)}
              className={`p-3 rounded-xl border text-left transition-all ${
                activeScreen === i
                  ? 'border-[#22C55E] bg-[#22C55E]/10 text-white'
                  : 'border-[#202722] bg-[#12161A]/50 text-[#A8ACB3] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-semibold">
                <Icon icon={sc.icon} className={`w-4 h-4 ${activeScreen === i ? 'text-[#22C55E]' : 'text-[#A8ACB3]'}`} />
                <span className="truncate">{sc.title}</span>
              </div>
              <p className="text-[10px] text-[#A8ACB3] truncate mt-0.5">{sc.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Right Column: 3D Phone Mockup */}
      <div className="lg:w-1/2 flex items-center justify-center relative z-10 w-full h-[600px] perspective-[1200px]">
        {/* Subtle shadow beneath the phone */}
        <div className="absolute bottom-0 w-[240px] h-[40px] bg-black/50 blur-2xl rounded-[100%] transform -translate-x-12 translate-y-12"></div>
        
        {/* Phone Container */}
        <div className="relative animate-phone-float w-[280px] sm:w-[320px] h-[580px] bg-[#0A0D0C] border-[8px] border-[#1A1F24] rounded-[48px] shadow-2xl p-3 flex flex-col justify-between overflow-hidden">
          
          {/* Realistic glass reflection overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 z-30 pointer-events-none rounded-[36px]"></div>

          {/* Dynamic Island / Speaker Notch */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-5 bg-[#0A0D0C] rounded-full z-20 flex items-center justify-center border border-[#1A1F24]/50 shadow-inner">
            <span className="w-2.5 h-2.5 rounded-full bg-[#12161A] block mr-1 border border-white/5"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]/80 block"></span>
          </div>

          {/* Screen Content Window */}
          <div className="flex-1 bg-[#12161A] rounded-[36px] overflow-hidden pt-8 px-4 pb-4 flex flex-col justify-between text-white relative">
            {/* Screen Header */}
            <div className="flex items-center justify-between text-xs pb-3 border-b border-[#202722]">
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-white/80">
                QUANTOVEST
              </div>
              <span className="text-[10px] text-[#A8ACB3] font-mono">09:41</span>
            </div>

            {/* Crossfading Screen Mockups */}
            <div className="flex-1 py-4 flex flex-col justify-between relative">
              {/* Screen 0 */}
              <div className={`absolute inset-0 flex flex-col transition-opacity duration-500 ${activeScreen === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                <div className="space-y-4">
                  <div className="p-4 bg-[#1A1F24] border border-[#202722] rounded-2xl space-y-2">
                    <p className="text-[10px] text-[#A8ACB3] uppercase font-mono">Total Portfolio Balance</p>
                    <p className="text-2xl font-mono font-semibold text-white">$12,450.80</p>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#22C55E]/20 text-[#22C55E] text-[10px] font-mono">
                      +14.25% Total ROI
                    </div>
                  </div>
                  <div className="p-3 bg-[#0A0D0C] border border-[#202722] rounded-xl text-xs space-y-2">
                    <p className="text-[10px] text-[#A8ACB3] font-mono">Signal Growth Line</p>
                    <div className="h-20 w-full flex items-end justify-between gap-1 pt-2">
                      {[30, 45, 40, 65, 60, 85, 100].map((h, idx) => (
                        <div key={idx} className="flex-1 bg-[#22C55E]/80 rounded-t transition-all" style={{ height: `${h}%` }}></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Screen 1 */}
              <div className={`absolute inset-0 flex flex-col transition-opacity duration-500 ${activeScreen === 1 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                <div className="space-y-4">
                  <p className="text-xs font-semibold text-white">Multi-Asset Breakdown</p>
                  <div className="space-y-2.5">
                    {[
                      { name: 'Foreign Exchange (FX)', pct: '45%', color: 'bg-[#22C55E]' },
                      { name: 'Cryptocurrency', pct: '35%', color: 'bg-emerald-400' },
                      { name: 'US Equities (Stocks)', pct: '20%', color: 'bg-teal-500' }
                    ].map((item, idx) => (
                      <div key={idx} className="p-3 bg-[#1A1F24] rounded-xl border border-[#202722] text-xs">
                        <div className="flex justify-between text-[#A8ACB3] text-[11px] mb-1">
                          <span>{item.name}</span>
                          <span className="font-mono text-white">{item.pct}</span>
                        </div>
                        <div className="w-full bg-[#0A0D0C] h-1.5 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color}`} style={{ width: item.pct }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Screen 2 */}
              <div className={`absolute inset-0 flex flex-col transition-opacity duration-500 ${activeScreen === 2 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-white">Strategy Experts</p>
                  {[
                    { name: 'Alexei Vance', spec: 'FX Specialist', roi: '+24.8%' },
                    { name: 'Sarah Chen', spec: 'Crypto Arbitrage', roi: '+31.4%' }
                  ].map((tr, idx) => (
                    <div key={idx} className="p-3 bg-[#1A1F24] rounded-xl border border-[#202722] flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-white">{tr.name}</p>
                        <p className="text-[10px] text-[#A8ACB3]">{tr.spec}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-mono font-semibold text-[#22C55E]">{tr.roi}</p>
                        <span className="text-[9px] bg-[#22C55E]/10 text-[#22C55E] px-2 py-0.5 rounded-full font-mono">Managed</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Screen 3 */}
              <div className={`absolute inset-0 flex flex-col transition-opacity duration-500 ${activeScreen === 3 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-white">Investment Plans</p>
                  <div className="p-3 bg-[#1A1F24] rounded-xl border border-[#22C55E] text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="font-semibold text-white">$5,000 Growth Plan</span>
                      <span className="text-[#22C55E] font-mono">Featured</span>
                    </div>
                    <p className="text-base font-mono font-semibold text-[#22C55E]">14% - 18% Monthly</p>
                    <p className="text-[10px] text-[#A8ACB3]">Multi-asset FX + Crypto portfolio allocation</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Screen Footer Dots */}
            <div className="flex justify-center gap-1.5 pt-3 border-t border-[#202722] mt-auto">
              {screens.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-all ${
                    activeScreen === idx ? 'bg-[#22C55E] w-4' : 'bg-[#202722]'
                  }`}
                ></span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
