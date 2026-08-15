'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

export default function HowItWorksPage() {
  const steps = [
    {
      step: '01',
      title: 'Account Registration & Plan Selection',
      desc: 'Select your capital allocation tier ($500 Starter, $5,000 Growth, or $15,000 Elite). Complete our 5-step investor questionnaire to align risk tolerance with your financial goals.',
      icon: 'solar:card-search-bold'
    },
    {
      step: '02',
      title: 'Minimal 2-Document KYC Verification',
      desc: 'Regulatory compliance made rapid. Upload your Government ID (Passport / License) and Proof of Address (Utility Bill / Bank Statement). Admin review completes within 2 hours.',
      icon: 'solar:shield-check-bold'
    },
    {
      step: '03',
      title: 'Fund Your Investor Account',
      desc: 'Deposit funds using Cryptocurrency (BTC, ETH, USDT) or Bank Wire Transfer. Upload payment screenshot confirmation to receive rapid funding approval.',
      icon: 'solar:wallet-bold'
    },
    {
      step: '04',
      title: 'Follow Expert Strategies & Live Returns',
      desc: 'Browse portfolio manager profiles filterable by market (FX, Crypto, Equities), win rate, and risk score. Click Follow Strategy to mirror their trades. Daily ROI updates directly to your interactive balance graph.',
      icon: 'solar:graph-up-bold'
    }
  ];

  return (
    <div className="min-h-screen bg-white text-[#0A0D0C] flex flex-col font-sans">
      <Navbar mode="light" />

      {/* Hero Header */}
      <section className="py-20 bg-[#F7F7F7] border-b border-[#DEE1E6]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 text-center space-y-4">
          <span className="text-xs font-mono uppercase tracking-widest text-[#22C55E]">Step-By-Step Mechanics</span>
          <h1 className="text-4xl sm:text-6xl font-normal text-[#0A0D0C]">
            How Quantovest Investing Works
          </h1>
          <p className="text-base text-[#5B616E] max-w-xl mx-auto">
            You don&apos;t need trading experience. Deposit capital into your preferred plan tier, select strategy experts, and our automated engine mirrors institutional trades in real time.
          </p>
        </div>
      </section>

      {/* 4 Steps Breakdown */}
      <section className="py-20 bg-white">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 space-y-12">
          {steps.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl bg-[#F7F7F7] border border-[#DEE1E6] flex flex-col md:flex-row items-start gap-6"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#0A0D0C] flex items-center justify-center text-[#22C55E] shrink-0">
                <Icon icon={item.icon} className="w-7 h-7" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-semibold text-[#22C55E] bg-[#22C55E]/10 px-2.5 py-0.5 rounded-full">
                    STEP {item.step}
                  </span>
                  <h3 className="text-xl font-normal text-[#0A0D0C]">{item.title}</h3>
                </div>
                <p className="text-xs text-[#5B616E] leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#0A0D0C] text-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 text-center space-y-6">
          <h2 className="text-3xl font-normal text-white">Ready to Start Investing?</h2>
          <p className="text-xs text-[#A8ACB3]">Create an account in 2 minutes starting at $500.</p>
          <Link href="/signup" className="inline-block px-8 py-3.5 rounded-full bg-[#22C55E] text-[#0A0D0C] font-semibold text-xs hover:bg-[#16A34A]">
            Get Started Now
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
