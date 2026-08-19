'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup(event: React.FormEvent) {
    event.preventDefault();
    setMessage('');

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setMessage('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) { setMessage(data.error || 'Signup failed'); setLoading(false); return; }
    if (data.session) router.push('/dashboard'); else setMessage('Check your email to confirm your account, then sign in.');
    setLoading(false);
  }

  async function oauth(provider: 'google') {
    const supabase = createClient();
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
          <h2 className="text-2xl font-normal text-white">Create Account</h2>
          <p className="text-xs text-[#A8ACB3]">Start investing across FX, Crypto & Stocks from $500</p>
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
          <div className={`text-xs text-center px-4 py-2.5 rounded-xl border ${
            message.includes('Check your email')
              ? 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]'
              : 'bg-red-900/20 border-red-800/40 text-red-400'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <label className="text-xs text-[#A8ACB3] block mb-1.5">
            Full Legal Name
            <input
              required
              value={name}
              onChange={event => setName(event.target.value)}
              placeholder="e.g. John Doe"
              className="mt-1 w-full bg-[#0A0D0C] border border-[#202722] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#A8ACB3] focus:outline-none focus:border-[#22C55E]"
            />
          </label>

          <label className="text-xs text-[#A8ACB3] block mb-1.5">
            Email Address
            <input
              required
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="mt-1 w-full bg-[#0A0D0C] border border-[#202722] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#A8ACB3] focus:outline-none focus:border-[#22C55E]"
            />
          </label>

          <label className="text-xs text-[#A8ACB3] block mb-1.5">
            Password
            <input
              required
              type="password"
              minLength={8}
              value={password}
              onChange={event => setPassword(event.target.value)}
              placeholder="Min. 8 characters"
              className="mt-1 w-full bg-[#0A0D0C] border border-[#202722] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#A8ACB3] focus:outline-none focus:border-[#22C55E]"
            />
          </label>

          <label className="text-xs text-[#A8ACB3] block mb-1.5">
            Confirm Password
            <input
              required
              type="password"
              minLength={8}
              value={confirmPassword}
              onChange={event => setConfirmPassword(event.target.value)}
              placeholder="Re-enter your password"
              className="mt-1 w-full bg-[#0A0D0C] border border-[#202722] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#A8ACB3] focus:outline-none focus:border-[#22C55E]"
            />
          </label>
          {confirmPassword && password !== confirmPassword && (
            <p className="text-[10px] text-red-400 -mt-2">Passwords do not match</p>
          )}

          <button
            type="submit"
            disabled={loading || !name || !email || !password || !confirmPassword || password !== confirmPassword}
            className="w-full py-3 rounded-full bg-[#22C55E] text-[#0A0D0C] text-xs font-semibold hover:bg-[#16A34A] transition-colors shadow-lg mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-xs text-[#A8ACB3]">
          Already have an account?{' '}
          <Link href="/login" className="text-[#22C55E] hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
