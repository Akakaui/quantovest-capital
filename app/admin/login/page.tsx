'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        setMessage('Failed to verify account. Please try again.');
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.role === 'admin') {
        router.push('/admin');
      } else {
        await supabase.auth.signOut();
        setMessage('This account is not an admin account');
        setLoading(false);
      }
    } catch {
      setMessage('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0D0C] text-white flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md bg-[#12161A] border border-[#202722] rounded-2xl p-5 sm:p-8 shadow-2xl space-y-7">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#22C55E]/30 bg-[#22C55E]/10 px-3 py-1 text-[10px] uppercase tracking-wider font-mono text-[#22C55E]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" /> Secure staff access
          </div>
          <Link href="/" className="inline-block mb-2">
            <span className="text-xl tracking-tight font-medium text-white">QUANTOVEST</span>
            <span className="text-[10px] tracking-widest text-[#22C55E] uppercase font-mono block -mt-0.5">CAPITAL</span>
          </Link>
          <h2 className="text-2xl font-normal text-white">Staff Console</h2>
          <p className="text-xs text-[#A8ACB3]">Internal administration access only</p>
        </div>

        {message && (
          <div role="alert" aria-live="polite" className={`text-xs text-center px-4 py-3 rounded-xl border ${
            message.includes('not an admin')
              ? 'bg-red-900/20 border-red-800/40 text-red-400'
              : 'bg-red-900/20 border-red-800/40 text-red-400'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <p className="text-[11px] leading-relaxed text-[#A8ACB3]">Use your authorized staff account to manage investor operations and daily ROI records.</p>
          <div>
            <label className="text-xs text-[#A8ACB3] block mb-1.5">Staff Email</label>
            <input
              required
              type="email"
              autoComplete="username"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@quantovest.com"
              className="w-full min-h-12 bg-[#0A0D0C] border border-[#202722] rounded-xl px-4 py-3 text-sm text-white placeholder-[#A8ACB3] focus:outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20"
            />
          </div>

          <div>
            <label className="text-xs text-[#A8ACB3] block mb-1.5">Password</label>
            <input
              required
              minLength={8}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full min-h-12 bg-[#0A0D0C] border border-[#202722] rounded-xl px-4 py-3 text-sm text-white placeholder-[#A8ACB3] focus:outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-12 py-3 rounded-full bg-[#22C55E] text-[#E8EFEB] font-semibold text-sm hover:bg-[#16A34A] transition-colors shadow-lg mt-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            {loading ? 'Signing in...' : 'Access Staff Console'}
          </button>
        </form>

        <p className="text-center text-xs text-[#A8ACB3]">
          <Link href="/" className="text-[#22C55E] hover:underline font-medium">
            ← Back to Homepage
          </Link>
        </p>
      </div>
    </div>
  );
}
