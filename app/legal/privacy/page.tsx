'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-[#0A0D0C] flex flex-col font-sans">
      <Navbar mode="light" />
      <section className="py-20 bg-[#F7F7F7] border-b border-[#DEE1E6]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 text-center space-y-4">
          <h1 className="text-4xl font-normal text-[#0A0D0C]">Privacy Policy</h1>
          <p className="text-xs text-[#5B616E]">Quantovest Capital Data Protection & Security Notice</p>
        </div>
      </section>
      <section className="py-16 max-w-[800px] mx-auto px-4 text-xs leading-relaxed text-[#5B616E] space-y-4">
        <p>Quantovest Capital respects client privacy. We collect minimal personal data required for KYC compliance (Government ID & Proof of Address).</p>
        <p>All client verification documents and transaction receipts are stored using encrypted multi-layer cold storage and will never be shared with third parties without authorization.</p>
      </section>
      <Footer />
    </div>
  );
}
