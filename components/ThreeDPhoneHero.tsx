'use client';

import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import Link from 'next/link';

const screens = [
  { label: 'Portfolio signal', icon: 'solar:graph-up-bold' },
  { label: 'Capital allocation', icon: 'solar:chart-2-bold' },
  { label: 'Strategy managers', icon: 'solar:users-group-rounded-bold' },
  { label: 'Transparent plans', icon: 'solar:shield-star-bold' },
];

export default function ThreeDPhoneHero() {
  const [activeScreen, setActiveScreen] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => setActiveScreen((previous) => (previous + 1) % screens.length), 4200);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="relative mx-auto flex min-h-[620px] w-full max-w-[1200px] items-center overflow-hidden px-4 py-14 sm:px-6 lg:min-h-[600px] lg:py-16">
      <div className="pointer-events-none absolute -left-24 top-[-15%] h-[720px] w-[360px] rounded-full border border-[#22C55E]/20 opacity-70 [transform:rotate(18deg)]" />
      <div className="pointer-events-none absolute right-[-15%] top-[-20%] h-[620px] w-[620px] rounded-full border border-[#22C55E]/10 opacity-70" />
      <div className="relative z-10 w-full max-w-[620px] space-y-6 text-center items-center md:text-left md:items-start lg:max-w-[610px]">
        <div className="flex items-center justify-center md:justify-start gap-3 text-[11px] font-mono font-semibold uppercase tracking-[0.16em] text-[#4ADE80]">
          <span className="h-px w-10 bg-[#4ADE80]" />
          <span>Institutional Investment Platform</span>
        </div>
        <div className="h-px w-full bg-[#202722]" />
        <h1 className="max-w-[620px] text-[3.25rem] font-normal leading-[0.98] tracking-[-0.06em] text-white sm:text-[4.75rem] lg:text-[5.25rem]">
          Your Capital.<br />
          <span className="text-[#4ADE80]">Our Expertise.</span>
        </h1>
        <p className="max-w-[560px] text-base leading-7 text-[#A8ACB3] sm:text-lg sm:leading-8">
          Access top-tier algorithmic FX, Crypto, and Stock strategy execution starting at <strong className="font-semibold text-white">$1,500</strong>. Track your portfolio growth live.
        </p>
        <div className="flex flex-col gap-3 pt-1 items-center sm:flex-row sm:items-center">
          <Link href="/signup" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#22C55E] px-6 text-sm font-semibold text-[#07110B] shadow-[0_12px_32px_rgba(34,197,94,0.18)] transition hover:bg-[#4ADE80] active:scale-[0.98]">
            <span>Get Started ($1,500 Min)</span><Icon icon="solar:alt-arrow-right-bold" className="h-5 w-5" />
          </Link>
          <Link href="/plans" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#39453F] bg-transparent px-6 text-sm font-medium text-white transition hover:border-[#4ADE80]/60 hover:bg-[#121A16] active:scale-[0.98]">
            <span>Explore Plans &amp; ROI</span>
          </Link>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-10 right-[-42px] z-10 h-[420px] w-[310px] hidden md:block sm:right-0 sm:h-[520px] sm:w-[380px] lg:bottom-4 lg:right-6 lg:h-[570px] lg:w-[430px]">
        <div className="absolute bottom-8 left-1/2 h-10 w-64 -translate-x-1/2 rounded-full bg-[#22C55E]/20 blur-3xl" />
        <div className="absolute left-1/2 top-[56%] h-[330px] w-[210px] -translate-x-1/2 -translate-y-1/2 rotate-[-10deg] rounded-[30px] bg-[#101816] shadow-[0_30px_70px_rgba(0,0,0,0.55)] sm:h-[420px] sm:w-[270px] lg:h-[470px] lg:w-[300px]">
          <div className="absolute inset-[12px] overflow-hidden rounded-[22px] bg-[#101714] p-4 sm:inset-[16px] sm:rounded-[26px] sm:p-5">
            <div className="flex items-center justify-between border-b border-[#263437] pb-2 text-[8px] font-mono text-[#93A09A] sm:text-[10px]"><span className="text-white">QUANTOVEST</span><span>09:41</span></div>
            <div className="mt-4 rounded-xl bg-[#1A2528] p-3 sm:mt-6 sm:rounded-2xl sm:p-4"><p className="text-[8px] uppercase font-mono text-[#93A09A] sm:text-[10px]">Portfolio Balance</p><p className="mt-1 font-mono text-lg font-semibold text-white sm:text-2xl">$12,450.80</p><span className="mt-2 inline-flex rounded-full bg-[#22C55E]/15 px-2 py-0.5 text-[8px] font-mono text-[#4ADE80] sm:text-[10px]">+14.25% Total ROI</span></div>
            <div className="mt-3 rounded-xl border border-[#263437] bg-[#0A0F11] p-3 sm:mt-4 sm:p-4"><div className="mb-2 flex items-center justify-between text-[8px] font-mono text-[#93A09A] sm:text-[10px]"><span>Signal growth</span><span className="text-[#4ADE80]">LIVE</span></div><div className="flex h-16 items-end gap-1 sm:h-24">{[26,38,32,55,48,72,92].map((height, index) => <span key={index} className="flex-1 rounded-t bg-gradient-to-t from-[#22C55E]/30 to-[#4ADE80]" style={{ height: `${height}%` }} />)}</div></div>
          </div>
        </div>
<div className="absolute bottom-[12%] left-[10%] z-40 rounded-lg border border-[#263437] bg-[#101614]/95 px-3 py-2 shadow-xl sm:left-[3%] sm:rounded-xl sm:px-4 sm:py-3"><div className="text-[9px] font-mono text-[#4ADE80] sm:text-[10px]">0{activeScreen + 1} / 04</div><div className="text-[10px] font-mono text-white sm:text-xs">{screens[activeScreen].label}</div></div>
        <div className="absolute right-0 top-1/2 z-40 flex -translate-y-1/2 flex-col gap-2">{screens.map((screen, index) => <button key={screen.label} aria-label={`Show ${screen.label}`} onClick={() => setActiveScreen(index)} className={`pointer-events-auto h-2 w-2 rounded-full border transition-all ${activeScreen === index ? 'border-[#4ADE80] bg-[#4ADE80] shadow-[0_0_12px_rgba(74,222,128,0.8)]' : 'border-[#6A746E] bg-transparent'}`} />)}</div>
      </div>
    </div>
  );
}
