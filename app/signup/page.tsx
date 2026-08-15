'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuantovestStore } from '@/lib/store';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useQuantovestStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    signup(name || 'Alexander Sterling', email || 'alex.sterling@quantovest.com');
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0A0D0C] text-white flex flex-col justify-center items-center p-4 font-sans relative overflow-hidden">
      <div className="w-full max-w-md bg-[#12161A] border border-[#202722] rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block mb-2">
            <span className="text-xl tracking-tight font-medium text-white">QUANTOVEST</span>
            <span className="text-[10px] tracking-widest text-[#22C55E] uppercase font-mono block -mt-0.5">CAPITAL</span>
          </Link>
          <h2 className="text-2xl font-normal text-white">Create Account</h2>
          <p className="text-xs text-[#A8ACB3]">Start investing across FX, Crypto & Stocks from $500</p>
        </div>

        {/* Google One-Click Sign Up */}
        <button
          type="button"
          onClick={() => {
            signup('Alexander Sterling', 'alex.sterling@gmail.com');
            router.push('/dashboard');
          }}
          className="w-full py-3 rounded-full border border-[#202722] bg-[#1A1F24] text-white text-xs font-semibold hover:bg-[#202722] transition-colors flex items-center justify-center gap-3"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Sign up with Google</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-[#202722] w-full"></div>
          <span className="bg-[#12161A] px-3 text-[10px] uppercase font-mono text-[#A8ACB3]">Or email</span>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="text-xs text-[#A8ACB3] block mb-1.5">Full Legal Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Alexander Sterling"
              className="w-full bg-[#0A0D0C] border border-[#202722] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#A8ACB3] focus:outline-none focus:border-[#22C55E]"
            />
          </div>

          <div>
            <label className="text-xs text-[#A8ACB3] block mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="alex.sterling@gmail.com"
              className="w-full bg-[#0A0D0C] border border-[#202722] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#A8ACB3] focus:outline-none focus:border-[#22C55E]"
            />
          </div>

          <div>
            <label className="text-xs text-[#A8ACB3] block mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#0A0D0C] border border-[#202722] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#A8ACB3] focus:outline-none focus:border-[#22C55E]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full bg-[#22C55E] text-[#0A0D0C] font-semibold text-xs hover:bg-[#16A34A] transition-colors shadow-lg mt-2"
          >
            Create Account
          </button>
        </form>

        <p className="text-center text-xs text-[#A8ACB3]">
          Already registered?{' '}
          <Link href="/login" className="text-[#22C55E] hover:underline font-medium">
            Sign In Here
          </Link>
        </p>
      </div>
    </div>
  );
}
