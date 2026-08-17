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
          <p className="text-xs text-[#5B616E]">Last updated: August 17, 2026</p>
        </div>
      </section>
      <section className="py-16 max-w-[800px] mx-auto px-4 text-sm leading-relaxed text-[#5B616E] space-y-8">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#0A0D0C]">1. Acceptance of Terms</h2>
          <p>By accessing or using the Quantovest Capital platform (&quot;Platform&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, you must not access or use the Platform.</p>
          <p>These Terms constitute a legally binding agreement between you (&quot;User,&quot; &quot;Investor,&quot; or &quot;you&quot;) and Quantovest Capital (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;).</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#0A0D0C]">2. Eligibility</h2>
          <p>To use the Platform, you must:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Be at least 18 years of age</li>
            <li>Have the legal capacity to enter into binding agreements</li>
            <li>Complete identity verification (KYC) with valid government-issued documents</li>
            <li>Not be a resident of a jurisdiction where copytrading services are prohibited</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#0A0D0C]">3. Investment Plans &amp; Services</h2>
          <p>The Platform offers three investment tiers with fixed daily return rates:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Starter Plan:</strong> $500 minimum deposit, 15% fixed daily return</li>
            <li><strong>Growth Plan:</strong> $5,000 minimum deposit, 25% fixed daily return</li>
            <li><strong>Elite Plan:</strong> $15,000 minimum deposit, 35% fixed daily return</li>
          </ul>
          <p>The Platform provides copytrading services where experienced traders execute investment strategies on behalf of investors. Returns are credited daily based on the assigned plan&apos;s fixed rate.</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#0A0D0C]">4. Account Requirements</h2>
          <h3 className="text-sm font-semibold text-[#0A0D0C]">Single Active Plan</h3>
          <p>Each investor is assigned one active investment plan at a time. Upgrading to a higher tier requires a minimum balance that meets the target plan&apos;s deposit threshold.</p>
          <h3 className="text-sm font-semibold text-[#0A0D0C]">Minimum Balance Maintenance</h3>
          <p>Investors must maintain their plan&apos;s minimum balance to continue receiving daily returns. Withdrawals that would drop the balance below the plan minimum may result in plan downgrade.</p>
          <h3 className="text-sm font-semibold text-[#0A0D0C]">Account Closure</h3>
          <p>Investors may request full account closure by withdrawing their entire balance. Upon admin approval, the account balance is set to $0 and the active plan is removed.</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#0A0D0C]">5. Deposits &amp; Withdrawals</h2>
          <h3 className="text-sm font-semibold text-[#0A0D0C]">Deposits</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Deposits are processed via bank wire transfer or cryptocurrency</li>
            <li>Minimum deposit: $500 (Starter plan minimum)</li>
            <li>All deposits require admin verification of payment proof before funds are credited</li>
            <li>Processing time: typically within 24 hours of proof submission</li>
          </ul>
          <h3 className="text-sm font-semibold text-[#0A0D0C]">Withdrawals</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Withdrawal requests are subject to admin review and approval</li>
            <li>Minimum withdrawal: $500</li>
            <li>Two-factor authentication may be required for withdrawals if enabled</li>
            <li>Withdrawals are processed to the investor&apos;s saved bank account or crypto wallet</li>
            <li>Full account withdrawal (closing account) withdraws the entire balance</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#0A0D0C]">6. Risks &amp; Disclaimers</h2>
          <p className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[#7F1D1D]">
            <strong>IMPORTANT RISK WARNING:</strong> Trading Foreign Exchange (FX), Cryptocurrencies, and Equities involves substantial risk of loss and is not suitable for all investors. Past performance is not indicative of future results. You should not invest more than you can afford to lose. The fixed daily return rates represent target performance and are not guaranteed.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Market conditions may affect actual returns</li>
            <li>Past performance (including stated win rates) does not guarantee future results</li>
            <li>Copytrading involves following the strategies of third-party traders whose performance may vary</li>
            <li>Complete loss of invested capital is possible in extreme market conditions</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#0A0D0C]">7. Fees &amp; Charges</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Management Fee:</strong> 0% — no management fees on any plan</li>
            <li><strong>Performance Fee:</strong> 15% of profits — deducted automatically from daily ROI credits</li>
            <li><strong>Deposit/Withdrawal Fees:</strong> Network fees may apply for cryptocurrency transactions</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#0A0D0C]">8. Account Security</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>You are responsible for maintaining the confidentiality of your account credentials</li>
            <li>Two-factor authentication (2FA) is available and recommended for account security</li>
            <li>You must notify us immediately of any unauthorized access to your account</li>
            <li>We are not liable for losses resulting from unauthorized use of your account due to your failure to secure your credentials</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#0A0D0C]">9. Termination</h2>
          <p>We reserve the right to suspend or terminate your account if:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>You violate these Terms of Service</li>
            <li>You provide false or misleading information during KYC verification</li>
            <li>We detect suspicious or fraudulent activity on your account</li>
            <li>We are required to do so by law or regulatory authority</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#0A0D0C]">10. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, Quantovest Capital shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or investment capital, arising from your use of the Platform.</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#0A0D0C]">11. Governing Law</h2>
          <p>These Terms are governed by and construed in accordance with applicable international financial services regulations. Any disputes shall be resolved through binding arbitration.</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#0A0D0C]">12. Changes to Terms</h2>
          <p>We may modify these Terms at any time. Material changes will be notified via email or platform notification. Your continued use after changes become effective constitutes acceptance.</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#0A0D0C]">13. Contact</h2>
          <p>Questions about these Terms should be directed to <strong>legal@quantovest.com</strong>.</p>
        </div>
      </section>
      <Footer />
    </div>
  );
}
