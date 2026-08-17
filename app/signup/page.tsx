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
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setMessage('');
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

  async function oauth(provider: 'google' | 'apple') {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` } });
    if (error) setMessage(error.message);
  }

  return <div className="min-h-screen bg-[#0A0D0C] text-white flex flex-col justify-center items-center p-4 font-sans relative overflow-hidden"><div className="w-full max-w-md bg-[#12161A] border border-[#202722] rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6"><div className="text-center space-y-2"><Link href="/" className="inline-block mb-2"><span className="text-xl tracking-tight font-medium text-white">QUANTOVEST</span><span className="text-[10px] tracking-widest text-[#22C55E] uppercase font-mono block -mt-0.5">CAPITAL</span></Link><h2 className="text-2xl font-normal text-white">Create Account</h2><p className="text-xs text-[#A8ACB3]">Start investing across FX, Crypto & Stocks from $500</p></div><div className="grid grid-cols-2 gap-3"><button type="button" onClick={() => void oauth('google')} className="w-full py-3 rounded-full border border-[#202722] bg-[#1A1F24] text-white text-xs font-semibold hover:bg-[#202722] transition-colors">Google</button><button type="button" onClick={() => void oauth('apple')} className="w-full py-3 rounded-full border border-[#202722] bg-[#1A1F24] text-white text-xs font-semibold hover:bg-[#202722] transition-colors">Apple</button></div><div className="relative flex items-center justify-center"><div className="border-t border-[#202722] w-full"></div><span className="bg-[#12161A] px-3 text-[10px] uppercase font-mono text-[#A8ACB3]">Or email</span></div><form onSubmit={handleSignup} className="space-y-4"><label className="text-xs text-[#A8ACB3] block mb-1.5">Full Legal Name<input required value={name} onChange={event => setName(event.target.value)} placeholder="e.g. Alexander Sterling" className="mt-1 w-full bg-[#0A0D0C] border border-[#202722] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#A8ACB3] focus:outline-none focus:border-[#22C55E]" /></label><label className="text-xs text-[#A8ACB3] block mb-1.5">Email Address<input required type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="alex.sterling@gmail.com" className="mt-1 w-full bg-[#0A0D0C] border border-[#202722] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#A8ACB3] focus:outline-none focus:border-[#22C55E]" /></label><label className="text-xs text-[#A8ACB3] block mb-1.5">Password<input required minLength={8} type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="At least 8 characters" className="mt-1 w-full bg-[#0A0D0C] border border-[#202722] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#A8ACB3] focus:outline-none focus:border-[#22C55E]" /></label>{message && <p className={`text-xs ${message.includes('Check your email') ? 'text-[#22C55E]' : 'text-red-400'}`}>{message}</p>}<button disabled={loading} type="submit" className="w-full py-3 rounded-full bg-[#22C55E] text-[#0A0D0C] text-xs font-bold hover:bg-[#16A34A] transition-colors disabled:opacity-50">{loading ? 'Creating Account...' : 'Create Account'}</button></form><p className="text-center text-xs text-[#A8ACB3]">Already have an account? <Link href="/login" className="text-[#22C55E] hover:underline">Sign In</Link></p></div></div>;
}
