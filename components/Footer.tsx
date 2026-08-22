'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0A0D0C] text-[#A8ACB3] border-t border-[#202722] py-16 text-sm font-sans">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          {/* Col 1 & 2: Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div>
                <span className="text-white text-base font-medium tracking-tight">QUANTOVEST</span>
                <span className="text-[9px] tracking-widest text-[#22C55E] uppercase font-mono block -mt-0.5">
                  CAPITAL
                </span>
              </div>
            </Link>
            <p className="text-xs leading-relaxed text-[#A8ACB3] max-w-sm">
              Quantovest Capital provides professional investment management across foreign exchange, cryptocurrency, and global stock markets.
            </p>
          </div>

          {/* Col 3: Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4 font-mono">Platform</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link href="/services" className="hover:text-white transition-colors">Services (FX/Crypto/Stocks)</Link></li>
              <li><Link href="/plans" className="hover:text-white transition-colors">Investment Plans ($1,500+)</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
            </ul>
          </div>

          {/* Col 4: Support & FAQ */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4 font-mono">Resources</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/about" className="hover:text-white transition-colors">About Quantovest</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ & Security</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
              <li><Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/legal/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Col 5: Security Badge */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4 font-mono">Compliance</h4>
            <div className="p-4 bg-[#12161A] border border-[#202722] rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-white text-xs font-medium">
                Identity Protected
              </div>
              <p className="text-[11px] text-[#A8ACB3] leading-snug">
                KYC Level 2 minimal document verification. All client assets segregated in multi-sig cold custody.
              </p>
            </div>
          </div>
        </div>

        {/* Regulatory Disclaimer */}
        <div className="pt-8 border-t border-[#202722] text-[11px] leading-relaxed text-[#A8ACB3] space-y-3">
          <p>
            <strong>Risk Warning:</strong> Investing in Foreign Exchange (FX), Cryptocurrencies, and Financial Equities carries high risk and may not be suitable for all investors. Past performance figures do not guarantee future returns. Quantovest Capital acts as an investment management venue. Investors retain full ownership of their capital.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs pt-4 text-[#A8ACB3]">
            <p>© {new Date().getFullYear()} Quantovest Capital Inc. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
