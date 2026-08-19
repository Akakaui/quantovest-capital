'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message); else router.push('/dashboard');
    setLoading(false);
  }

  async function oauth(provider: 'google') {
    setMessage('');
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` } });
    if (error) setMessage(error.message);
  }

  return (
    <div className="min-h-screen bg-[#0A0D0C] text-white flex flex-col justify-center items-center p-4 font-sans relative overflow-hidden">
      <div className="w-full max-w-md bg-[#12161A] border border-[#202722] rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block mb-2">
            <span className="text-xl tracking-tight font-medium text-white">QUANTOVEST</span>
            <span className="text-[10px] tracking-widest text-[#22C55E] uppercase font-mono block -mt-0.5">CAPITAL</span>
          </Link>
          <h2 className="text-2xl font-normal text-white">Welcome Back</h2>
          <p className="text-xs text-[#A8ACB3]">Sign in to access your investment portfolio</p>
        </div>

        <button
          type="button"
          onClick={() => void oauth('google')}
          className="w-full py-3 rounded-full border border-[#202722] bg-[#1A1F24] text-white text-xs font-semibold hover:bg-[#202722] transition-colors"
        >
          Continue with Google
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-[#202722] w-full" />
          <span className="bg-[#12161A] px-3 text-[10px] uppercase font-mono text-[#A8ACB3]">Or email</span>
        </div>

        {message && (
          <div className="text-xs text-center px-4 py-2.5 rounded-xl border bg-red-900/20 border-red-800/40 text-red-400">
            {message}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs text-[#A8ACB3] block mb-1.5">Email Address</label>
            <input
              required
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full bg-[#0A0D0C] border border-[#202722] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#A8ACB3] focus:outline-none focus:border-[#22C55E]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-[#A8ACB3]">Password</label>
              <Link href="/forgot-password" className="text-[10px] text-[#22C55E] hover:underline font-medium">
                Forgot password?
              </Link>
            </div>
            <input
              required
              minLength={8}
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#0A0D0C] border border-[#202722] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#A8ACB3] focus:outline-none focus:border-[#22C55E]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-[#22C55E] text-[#0A0D0C] text-xs font-semibold hover:bg-[#16A34A] transition-colors shadow-lg mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-[#A8ACB3]">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[#22C55E] hover:underline font-medium">Create one</Link>
        </p>

        <p className="text-center text-xs text-[#A8ACB3]">
          <Link href="/" className="text-[#22C55E] hover:underline font-medium">
            ← Back to Homepage
          </Link>
        </p>
      </div>
    </div>
  );
}
