'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-[#0A0D0C] flex flex-col font-sans">
      <Navbar mode="light" />

      <section className="py-20 bg-[#F7F7F7] border-b border-[#DEE1E6]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 text-center space-y-4">
          <span className="text-xs font-mono uppercase tracking-widest text-[#22C55E]">Our Mission</span>
          <h1 className="text-4xl sm:text-6xl font-normal text-[#0A0D0C]">
            About Quantovest Capital
          </h1>
          <p className="text-base text-[#5B616E] max-w-xl mx-auto">
            Professional managed investment across Foreign Exchange, Crypto, and Global Equities.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 space-y-8 text-sm leading-relaxed text-[#5B616E]">
          <h2 className="text-2xl font-normal text-[#0A0D0C]">Bridging Individual Capital & Expert Insight</h2>
          <p>
            Quantovest Capital was founded on a simple premise: investors deserve transparent access to market returns without personally managing high-risk intraday order books.
          </p>
          <p>
            By combining multi-asset risk allocation with vetted portfolio manager execution, Quantovest allows investors to participate in global FX, cryptocurrency, and blue-chip equity markets.
          </p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-6 border-t border-[#DEE1E6] text-center font-mono"
          >
            <div>
              <p className="text-3xl font-semibold text-[#0A0D0C]">$4B+</p>
              <p className="text-xs text-[#5B616E] font-sans">Managed AUM</p>
            </div>
            <div>
              <p className="text-3xl font-semibold text-[#22C55E]">94.2%</p>
              <p className="text-xs text-[#5B616E] font-sans">Win Rate</p>
            </div>
            <div>
              <p className="text-3xl font-semibold text-[#0A0D0C]">14,800+</p>
              <p className="text-xs text-[#5B616E] font-sans">Investors</p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
