'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';

interface NavbarProps {
  mode?: 'light' | 'dark';
  onOpenCalculator?: () => void;
}

export default function Navbar({ mode = 'light', onOpenCalculator }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isDark = mode === 'dark';

  return (
    <header
      className={`w-full z-40 transition-colors duration-200 ${
        isDark
          ? 'bg-[#0A0D0C] border-b border-[#202722] text-white'
          : 'bg-white border-b border-[#DEE1E6] text-[#0A0D0C]'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Brand Wordmark */}
        <Link href="/" className="flex items-center gap-3 group">
          <div>
            <span className={`text-lg tracking-tight font-medium ${isDark ? 'text-white' : 'text-[#0A0D0C]'}`}>
              QUANTOVEST
            </span>
            <span className="text-[10px] tracking-widest text-[#22C55E] uppercase font-mono block -mt-0.5">
              CAPITAL
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-normal">
          <Link
            href="/how-it-works"
            className={`${isDark ? 'text-[#A8ACB3] hover:text-white' : 'text-[#5B616E] hover:text-[#0A0D0C]'} transition-colors`}
          >
            How It Works
          </Link>
          <Link
            href="/services"
            className={`${isDark ? 'text-[#A8ACB3] hover:text-white' : 'text-[#5B616E] hover:text-[#0A0D0C]'} transition-colors`}
          >
            Services
          </Link>
          <Link
            href="/plans"
            className={`${isDark ? 'text-[#A8ACB3] hover:text-white' : 'text-[#5B616E] hover:text-[#0A0D0C]'} transition-colors`}
          >
            Investment Plans
          </Link>
          <Link
            href="/about"
            className={`${isDark ? 'text-[#A8ACB3] hover:text-white' : 'text-[#5B616E] hover:text-[#0A0D0C]'} transition-colors`}
          >
            About Us
          </Link>
          <Link
            href="/faq"
            className={`${isDark ? 'text-[#A8ACB3] hover:text-white' : 'text-[#5B616E] hover:text-[#0A0D0C]'} transition-colors`}
          >
            FAQ
          </Link>
          {onOpenCalculator && (
            <button
              onClick={onOpenCalculator}
              className="text-[#22C55E] hover:underline font-mono text-xs flex items-center gap-1"
            >
              <Icon icon="solar:calculator-bold" className="w-4 h-4" /> Calculate ROI
            </button>
          )}
        </nav>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className={`px-5 py-2.5 rounded-full text-sm font-medium border ${
              isDark
                ? 'border-[#202722] text-white hover:bg-[#12161A]'
                : 'border-[#DEE1E6] text-[#0A0D0C] hover:bg-[#F7F7F7]'
            } transition-colors`}
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-6 py-2.5 rounded-full text-sm font-semibold bg-[#22C55E] text-[#0A0D0C] hover:bg-[#16A34A] transition-colors shadow-sm"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-current"
        >
          <Icon icon={isMobileMenuOpen ? 'solar:close-circle-bold' : 'solar:hamburger-menu-bold'} className="w-7 h-7" />
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className={`md:hidden border-b p-6 space-y-4 ${isDark ? 'bg-[#0A0D0C] border-[#202722]' : 'bg-white border-[#DEE1E6]'}`}>
          <div className="flex flex-col space-y-3 font-normal text-base">
            <Link href="/how-it-works" onClick={() => setIsMobileMenuOpen(false)}>
              How It Works
            </Link>
            <Link href="/services" onClick={() => setIsMobileMenuOpen(false)}>
              Services
            </Link>
            <Link href="/plans" onClick={() => setIsMobileMenuOpen(false)}>
              Investment Plans
            </Link>
            <Link href="/about" onClick={() => setIsMobileMenuOpen(false)}>
              About Us
            </Link>
            <Link href="/faq" onClick={() => setIsMobileMenuOpen(false)}>
              FAQ
            </Link>
            {onOpenCalculator && (
              <button
                onClick={() => {
                  onOpenCalculator();
                  setIsMobileMenuOpen(false);
                }}
                className="text-[#22C55E] text-left font-mono text-sm flex items-center gap-1 pt-2"
              >
                <Icon icon="solar:calculator-bold" className="w-4 h-4" /> Calculate Projected ROI
              </button>
            )}
          </div>
          <div className="pt-4 border-t border-hairline flex flex-col gap-3">
            <Link
              href="/login"
              className="w-full py-3 rounded-full text-center font-medium border border-current"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="w-full py-3 rounded-full text-center font-semibold bg-[#22C55E] text-[#0A0D0C]"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
