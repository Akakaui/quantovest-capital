'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function RiskPage() {
  return (
    <div className="min-h-screen bg-white text-[#0A0D0C] flex flex-col font-sans">
      <Navbar mode="light" />
      <section className="py-20 bg-[#F7F7F7] border-b border-[#DEE1E6]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 text-center space-y-4">
          <h1 className="text-4xl font-normal text-[#0A0D0C]">Risk Disclosure Statement</h1>
          <p className="text-xs text-[#5B616E]">Financial Markets Risk Warning</p>
        </div>
      </section>
      <section className="py-16 max-w-[800px] mx-auto px-4 text-xs leading-relaxed text-[#5B616E] space-y-4">
        <p>Trading Foreign Exchange (FX), Cryptocurrencies, and Equities involves substantial risk of loss and is not suitable for all investors.</p>
        <p>Historical ROI win rates (e.g. 94.2%) do not guarantee future returns. Investors should only allocate risk capital they can afford to lose.</p>
      </section>
      <Footer />
    </div>
  );
}
