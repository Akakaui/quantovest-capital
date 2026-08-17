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
          <p className="text-xs text-[#5B616E]">Last updated: August 17, 2026</p>
        </div>
      </section>
      <section className="py-16 max-w-[800px] mx-auto px-4 text-sm leading-relaxed text-[#5B616E] space-y-8">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#0A0D0C]">1. Introduction</h2>
          <p>Quantovest Capital (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our copytrading and investment platform (the &quot;Platform&quot;).</p>
          <p>By using the Platform, you agree to the collection and use of information in accordance with this policy. If you do not agree, please discontinue use immediately.</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#0A0D0C]">2. Information We Collect</h2>
          <h3 className="text-sm font-semibold text-[#0A0D0C]">Personal Information</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Full name, email address, and contact details</li>
            <li>Government-issued identification documents (passport, driver&apos;s license, national ID) for KYC verification</li>
            <li>Proof of address documents (utility bills, bank statements dated within 3 months)</li>
            <li>Bank account details and cryptocurrency wallet addresses for deposit/withdrawal processing</li>
            <li>Account credentials (encrypted passwords, optional two-factor authentication secrets)</li>
          </ul>
          <h3 className="text-sm font-semibold text-[#0A0D0C]">Financial Information</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Deposit and withdrawal transaction records</li>
            <li>Portfolio balance, ROI history, and investment plan details</li>
            <li>Payment proof screenshots submitted for deposit verification</li>
          </ul>
          <h3 className="text-sm font-semibold text-[#0A0D0C]">Technical Information</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Browser type, device type, and operating system</li>
            <li>IP address and approximate geographic location</li>
            <li>Login timestamps and session activity</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#0A0D0C]">3. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>KYC Compliance:</strong> Verify your identity as required by anti-money laundering (AML) regulations</li>
            <li><strong>Account Management:</strong> Process deposits, withdrawals, and maintain your investment portfolio</li>
            <li><strong>Platform Operations:</strong> Execute copytrading strategies, calculate ROI, and manage your investment plan</li>
            <li><strong>Communication:</strong> Send account notifications, transaction confirmations, and platform updates</li>
            <li><strong>Security:</strong> Detect fraud, prevent unauthorized access, and protect against suspicious activity</li>
            <li><strong>Legal Compliance:</strong> Meet regulatory obligations and respond to lawful requests from authorities</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#0A0D0C]">4. Data Storage &amp; Security</h2>
          <p>All personal data and verification documents are stored using encrypted, multi-layer cold storage infrastructure. We implement industry-standard security measures including:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>AES-256 encryption for data at rest</li>
            <li>TLS 1.3 encryption for data in transit</li>
            <li>Supabase Row Level Security (RLS) policies on all database tables</li>
            <li>Role-based access controls for staff and administrative personnel</li>
            <li>Regular security audits and penetration testing</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#0A0D0C]">5. Data Sharing</h2>
          <p>We do not sell, trade, or rent your personal information to third parties. We may share your data only in the following circumstances:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Service Providers:</strong> Trusted third-party providers (payment processors, cloud infrastructure) who assist in platform operations, bound by strict confidentiality agreements</li>
            <li><strong>Legal Requirements:</strong> When required by law, court order, or regulatory authority</li>
            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets, with prior notice</li>
            <li><strong>With Your Consent:</strong> When you explicitly authorize sharing for a specific purpose</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#0A0D0C]">6. Data Retention</h2>
          <p>We retain your personal information for as long as your account is active or as needed to provide services. After account closure, we retain KYC documents and transaction records for a minimum of 5 years as required by anti-money laundering regulations.</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#0A0D0C]">7. Your Rights</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Access:</strong> Request a copy of all personal data we hold about you</li>
            <li><strong>Rectification:</strong> Request correction of inaccurate or incomplete data</li>
            <li><strong>Erasure:</strong> Request deletion of your personal data (subject to regulatory retention requirements)</li>
            <li><strong>Portability:</strong> Request your data in a structured, machine-readable format</li>
            <li><strong>Objection:</strong> Object to processing of your data for specific purposes</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#0A0D0C]">8. Cookies &amp; Tracking</h2>
          <p>The Platform uses essential cookies for session management and authentication. We do not use third-party advertising cookies or tracking pixels. Analytics data is collected anonymously to improve platform performance.</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#0A0D0C]">9. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. Material changes will be communicated via email or platform notification. Continued use after changes constitutes acceptance of the updated policy.</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#0A0D0C]">10. Contact Us</h2>
          <p>For privacy-related inquiries, data requests, or complaints, contact our Data Protection team at <strong>privacy@quantovest.com</strong>. We aim to respond within 30 days.</p>
        </div>
      </section>
      <Footer />
    </div>
  );
}
