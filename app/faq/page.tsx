'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does Quantovest work for non-traders?',
      a: 'You choose an investment plan ($500 Starter, $5,000 Growth, or $15,000 Elite), deposit funds, and select verified strategy experts to follow. Our system automatically mirrors their trades onto your portfolio balance without requiring you to manually trade.'
    },
    {
      q: 'What documents are required for KYC identity verification?',
      a: 'We require minimal 2-document verification: (1) Government-issued ID, Passport, or Driver\'s License, and (2) Proof of Address such as a Utility Bill or Bank Statement issued within 90 days.'
    },
    {
      q: 'How are daily ROI performance percentage updates calculated?',
      a: 'Quantovest investment team publishes daily strategy returns based on portfolio manager performance. Your dashboard balance, ROI metrics, and interactive performance graph automatically update every day.'
    },
    {
      q: 'What deposit methods are accepted?',
      a: 'We accept Bank Wire Transfers as well as Cryptocurrency deposits in Bitcoin (BTC), Ethereum (ETH), and USDT (TRC20). Upload your deposit payment screenshot proof to receive rapid funding approval.'
    },
    {
      q: 'Can I withdraw my capital at any time?',
      a: 'Yes. You can submit withdrawal requests directly from your investor portal to your bank account or crypto wallet. Admin processing completes within 24 hours.'
    }
  ];

  return (
    <div className="min-h-screen bg-white text-[#0A0D0C] flex flex-col font-sans">
      <Navbar mode="light" />

      <section className="py-20 bg-[#F7F7F7] border-b border-[#DEE1E6]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 text-center space-y-4">
          <span className="text-xs font-mono uppercase tracking-widest text-[#22C55E]">Got Questions?</span>
          <h1 className="text-4xl sm:text-6xl font-normal text-[#0A0D0C]">
            Frequently Asked Questions
          </h1>
          <p className="text-base text-[#5B616E] max-w-xl mx-auto">
            Everything you need to know about Quantovest investing, deposits, KYC verification, and withdrawal processing.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border border-[#DEE1E6] rounded-2xl overflow-hidden bg-[#F7F7F7]">
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full p-6 text-left flex items-center justify-between font-medium text-base text-[#0A0D0C]"
              >
                <span>{faq.q}</span>
                <motion.div
                  animate={{ rotate: openIndex === idx ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon
                    icon="solar:alt-arrow-down-bold"
                    className="w-5 h-5 text-[#22C55E] shrink-0"
                  />
                </motion.div>
              </button>
              <AnimatePresence>
                {openIndex === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-6 pb-6 text-xs text-[#5B616E] leading-relaxed border-t border-[#DEE1E6]/50 pt-4 bg-white">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
