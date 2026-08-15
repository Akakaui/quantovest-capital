'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Icon } from '@iconify/react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white text-[#0A0D0C] flex flex-col font-sans">
      <Navbar mode="light" />

      <section className="py-20 bg-[#F7F7F7] border-b border-[#DEE1E6]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 text-center space-y-4">
          <span className="text-xs font-mono uppercase tracking-widest text-[#22C55E]">Get In Touch</span>
          <h1 className="text-4xl sm:text-6xl font-normal text-[#0A0D0C]">
            Contact Quantovest Support
          </h1>
          <p className="text-base text-[#5B616E] max-w-xl mx-auto">
            Our support team and live desk are active 24/7.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-[600px] mx-auto px-4 sm:px-6">
          {submitted ? (
            <div className="p-8 bg-[#F7F7F7] border border-[#DEE1E6] rounded-2xl text-center space-y-4">
              <Icon icon="solar:check-circle-bold" className="w-12 h-12 text-[#22C55E] mx-auto" />
              <h3 className="text-xl font-normal text-[#0A0D0C]">Message Received</h3>
              <p className="text-xs text-[#5B616E]">An account manager will respond to your email within 2 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-8 bg-[#F7F7F7] border border-[#DEE1E6] rounded-2xl space-y-4">
              <div>
                <label className="text-xs text-[#5B616E] block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Alexander Sterling"
                  className="w-full bg-white border border-[#DEE1E6] rounded-xl px-4 py-2.5 text-xs text-[#0A0D0C] focus:outline-none focus:border-[#22C55E]"
                />
              </div>

              <div>
                <label className="text-xs text-[#5B616E] block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="alex@quantovest.com"
                  className="w-full bg-white border border-[#DEE1E6] rounded-xl px-4 py-2.5 text-xs text-[#0A0D0C] focus:outline-none focus:border-[#22C55E]"
                />
              </div>

              <div>
                <label className="text-xs text-[#5B616E] block mb-1">Inquiry Message</label>
                <textarea
                  rows={4}
                  required
                  placeholder="How can we assist you?"
                  className="w-full bg-white border border-[#DEE1E6] rounded-xl p-3 text-xs text-[#0A0D0C] focus:outline-none focus:border-[#22C55E]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-[#0A0D0C] text-white font-semibold text-xs hover:bg-[#12161A] transition-colors"
              >
                Send Support Message
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
