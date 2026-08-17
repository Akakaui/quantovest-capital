'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Icon } from '@iconify/react';

export default function RiskPage() {
  return (
    <div className="min-h-screen bg-white text-[#0A0D0C] flex flex-col font-sans">
      <Navbar mode="light" />
      <section className="py-20 bg-[#F7F7F7] border-b border-[#DEE1E6]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 text-center space-y-4">
          <h1 className="text-4xl font-normal text-[#0A0D0C]">Risk Disclosure Statement</h1>
          <p className="text-xs text-[#5B616E]">Important: Please read carefully before investing</p>
        </div>
      </section>
      <section className="py-16 max-w-[800px] mx-auto px-4 text-sm leading-relaxed text-[#5B616E] space-y-8">
        {/* Critical Warning Box */}
        <div className="p-6 bg-[#FEF2F2] border-2 border-[#DC2626] rounded-2xl space-y-3">
          <div className="flex items-center gap-2">
            <Icon icon="solar:warning-bold" className="w-6 h-6 text-[#DC2626]" />
            <h2 className="text-lg font-bold text-[#7F1D1D]">Critical Risk Warning</h2>
          </div>
          <p className="text-sm font-semibold text-[#7F1D1D]">
            Trading Foreign Exchange (FX), Cryptocurrencies, and Global Equities involves substantial risk of loss and is not suitable for all investors. You should carefully consider whether trading is suitable for you in light of your financial condition.
          </p>
          <p className="text-sm text-[#991B1B]">
            <strong>You could lose your entire investment.</strong> Do not invest money you cannot afford to lose.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#0A0D0C]">1. General Risk Warning</h2>
          <p>The information and services provided by Quantovest Capital are for informational purposes only and do not constitute investment advice, financial advice, trading advice, or any other form of professional advice. Investing in financial markets carries a high level of risk and may not be suitable for all investors.</p>
          <p>Before deciding to invest, you should:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Consult with a qualified financial advisor</li>
            <li>Carefully assess your investment objectives, financial situation, and risk tolerance</li>
            <li>Consider the possibility of losing your entire investment</li>
            <li>Only invest capital that you can afford to lose without affecting your lifestyle</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#0A0D0C]">2. Foreign Exchange (FX) Risk</h2>
          <p>Foreign exchange trading involves significant risks including:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Market Risk:</strong> Currency values can fluctuate rapidly due to economic, political, and geopolitical factors</li>
            <li><strong>Leverage Risk:</strong> FX trading often uses leverage, which can amplify both gains and losses</li>
            <li><strong>Liquidity Risk:</strong> In certain market conditions, it may be difficult to execute trades at desired prices</li>
            <li><strong>Interest Rate Risk:</strong> Changes in interest rates can significantly impact currency values</li>
            <li><strong>Counterparty Risk:</strong> The risk that the other party in a trade may default on their obligation</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#0A0D0C]">3. Cryptocurrency Risk</h2>
          <p>Cryptocurrency investments carry additional unique risks:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Extreme Volatility:</strong> Cryptocurrency prices can experience 20-50%+ swings within a single day</li>
            <li><strong>Regulatory Risk:</strong> Government regulations can dramatically impact cryptocurrency values and accessibility</li>
            <li><strong>Technology Risk:</strong> Blockchain vulnerabilities, hacking, smart contract bugs, and network failures</li>
            <li><strong>Liquidity Risk:</strong> Smaller cryptocurrencies may have limited trading volume, making it difficult to exit positions</li>
            <li><strong>Total Loss Risk:</strong> Some cryptocurrencies have gone to zero — complete loss of investment is possible</li>
            <li><strong>Custody Risk:</strong> Loss of private keys or exchange hacks can result in permanent loss of assets</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#0A0D0C]">4. Equity (Stock Market) Risk</h2>
          <p>Stock market investments are subject to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Market Risk:</strong> Stock prices can decline due to company-specific or broad market factors</li>
            <li><strong>Sector Risk:</strong> Concentrated exposure to specific industries (e.g., technology) increases volatility</li>
            <li><strong>Earnings Risk:</strong> Company performance may fall short of expectations, causing price declines</li>
            <li><strong>Systemic Risk:</strong> Broad market crashes can affect all stocks simultaneously</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#0A0D0C]">5. Copytrading Risk</h2>
          <p>Copytrading involves following the strategies of master traders. This introduces additional risks:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Past performance of master traders does not guarantee future results</li>
            <li>Master traders may experience periods of losses or underperformance</li>
            <li>Execution delays may result in different entry/exit prices than the master trader</li>
            <li>Strategy changes by master traders may not align with your risk tolerance</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#0A0D0C]">6. Performance Disclaimer</h2>
          <p className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[#7F1D1D] text-sm">
            <strong>Stated ROI rates and historical win rates are not guarantees of future performance.</strong> The fixed daily return rates (15%, 25%, 35%) represent target performance under favorable market conditions. Actual returns may be lower or negative during adverse market periods. Historical performance metrics (including the 94.2% win rate) are based on past results and may not be indicative of future outcomes.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#0A0D0C]">7. No Insurance Protection</h2>
          <p>Unlike bank deposits, investments through Quantovest Capital are not covered by deposit insurance schemes (such as FDIC in the United States or equivalent programs in other jurisdictions). There is no guarantee of investment returns, and your capital is at risk.</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#0A0D0C]">8. Suitability</h2>
          <p>The services offered by Quantovest Capital may not be suitable for all investors. You should only invest if you:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Have sufficient financial resources to bear the potential loss of your entire investment</li>
            <li>Understand the risks involved in FX, cryptocurrency, and equity trading</li>
            <li>Have a diversified investment portfolio and are not relying solely on this platform</li>
            <li>Are not investing borrowed money or funds needed for essential expenses</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#0A0D0C]">9. Regulatory Notice</h2>
          <p>Quantovest Capital operates in compliance with applicable financial services regulations. However, the regulatory landscape for copytrading and cryptocurrency services varies by jurisdiction. Users are responsible for ensuring that their use of the Platform complies with the laws of their jurisdiction.</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#0A0D0C]">10. Contact</h2>
          <p>For questions about risk disclosure, contact <strong>risk@quantovest.com</strong>.</p>
        </div>
      </section>
      <Footer />
    </div>
  );
}
