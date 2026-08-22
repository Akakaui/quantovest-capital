'use client';

import React from 'react';
import { Icon } from '@iconify/react';
import Link from 'next/link';

export default function ThreeDPhoneHero() {
  return (
    <div className="relative mx-auto flex min-h-[420px] w-full max-w-[1200px] items-center justify-center overflow-hidden px-4 py-14 sm:px-6 lg:min-h-[480px] lg:py-16">
      <div className="pointer-events-none absolute -left-24 top-[-15%] h-[720px] w-[360px] rounded-full border border-[#22C55E]/20 opacity-70 [transform:rotate(18deg)]" />
      <div className="pointer-events-none absolute right-[-15%] top-[-20%] h-[620px] w-[620px] rounded-full border border-[#22C55E]/10 opacity-70" />
      <div className="relative z-10 w-full max-w-[620px] space-y-6 text-center items-center">
        <div className="flex items-center justify-center gap-3 text-[11px] font-mono font-semibold uppercase tracking-[0.16em] text-[#4ADE80]">
          <span className="h-px w-10 bg-[#4ADE80]" />
          <span>Institutional Investment Platform</span>
        </div>
        <div className="h-px w-full bg-[#202722]" />
        <h1 className="mx-auto max-w-[620px] text-[3.25rem] font-normal leading-[0.98] tracking-[-0.06em] text-white sm:text-[4.75rem] lg:text-[5.25rem]">
          Your Capital.<br />
          <span className="text-[#4ADE80]">Our Expertise.</span>
        </h1>
        <p className="mx-auto max-w-[560px] text-base leading-7 text-[#A8ACB3] sm:text-lg sm:leading-8">
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
    </div>
  );
}
