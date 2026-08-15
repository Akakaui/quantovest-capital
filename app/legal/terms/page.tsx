'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-[#0A0D0C] flex flex-col font-sans">
      <Navbar mode="light" />
      <section className="py-20 bg-[#F7F7F7] border-b border-[#DEE1E6]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 text-center space-y-4">
          <h1 className="text-4xl font-normal text-[#0A0D0C]">Terms of Service</h1>
          <p className="text-xs text-[#5B616E]">Platform Rules & Investor Agreement</p>
        </div>
      </section>
      <section className="py-16 max-w-[800px] mx-auto px-4 text-xs leading-relaxed text-[#5B616E] space-y-4">
        <p>By using Quantovest Capital, you agree to our platform terms. Minimum plan funding levels ($500 Starter, $5,000 Growth, $15,000 Elite) govern plan features and target ROI projections.</p>
        <p>Withdrawal requests are processed via Admin review within 24 hours. Copytrading strategies execute automatically based on master trader signals.</p>
      </section>
      <Footer />
    </div>
  );
}
