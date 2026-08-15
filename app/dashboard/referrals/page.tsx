"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Summary = { link: { code: string } | null; referredUsers: { id: string; name: string | null; email: string | null }[]; rewards: { id: number; rewardAmountCents: number; status: string; createdAt: string }[]; withdrawals: { id: number; amountCents: number; destinationType: string; status: string; createdAt: string }[]; balanceCents: number };
type Point = { month: string; label: string; signUps: number; earningsCents: number };

export default function ReferralsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [destinationType, setDestinationType] = useState<"bank" | "crypto">("bank");
  const [destination, setDestination] = useState("");
  const [destinationDetails, setDestinationDetails] = useState("");
  const [amount, setAmount] = useState("500");

  const loadSummary = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/referrals/summary", { cache: "no-store" });
    if (response.ok) setSummary(await response.json());
    else setMessage(response.status === 401 ? "Sign in to view your live referral account." : "Referral data is temporarily unavailable.");
    setLoading(false);
  }, []);

  const loadAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    const query = new URLSearchParams();
    if (start) query.set("start", start);
    if (end) query.set("end", end);
    const response = await fetch(`/api/referrals/analytics?${query.toString()}`, { cache: "no-store" });
    if (response.ok) setPoints(await response.json());
    else setMessage(response.status === 400 ? "Choose a valid date range." : "Analytics are temporarily unavailable.");
    setAnalyticsLoading(false);
  }, [start, end]);

  useEffect(() => { void loadSummary(); }, [loadSummary]);
  useEffect(() => { void loadAnalytics(); }, [loadAnalytics]);

  const maxEarnings = Math.max(1, ...points.map(point => point.earningsCents));
  const maxSignups = Math.max(1, ...points.map(point => point.signUps));
  const chartPoints = useMemo(() => points.map((point, index) => ({ x: points.length === 1 ? 50 : (index / (points.length - 1)) * 100, y: 100 - (point.earningsCents / maxEarnings) * 82 })), [points, maxEarnings]);
  const canWithdraw = (summary?.balanceCents ?? 0) >= 50_000;

  async function createLink() {
    const response = await fetch("/api/referrals/link", { method: "POST" });
    if (response.ok) { const link = await response.json(); setSummary(current => current ? { ...current, link } : current); setMessage("Referral link ready."); }
    else setMessage("Sign in before creating a referral link.");
  }

  async function submitWithdrawal(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/referrals/withdrawals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amountCents: Math.round(Number(amount) * 100), destinationType, destination, destinationDetails }) });
    const data = await response.json().catch(() => ({}));
    setMessage(response.ok ? "Withdrawal request submitted for admin review." : data.error ?? "Withdrawal request failed.");
    if (response.ok) { setDestination(""); setDestinationDetails(""); await loadSummary(); }
  }

  return <main className="min-h-screen bg-[#07100c] px-4 py-8 text-[#f3f7f4] sm:px-8 lg:px-12">
    <div className="mx-auto max-w-6xl space-y-8">
      <header><p className="text-xs uppercase tracking-[0.25em] text-[#d6a85c]">Investor referrals</p><h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Build wealth together.</h1><p className="mt-3 max-w-2xl text-sm text-[#a8b6ad]">Track real attributed sign-ups, first-deposit rewards, and payout requests from your account ledger.</p></header>
      {message && <div role="status" className="rounded-xl border border-[#d6a85c]/30 bg-[#d6a85c]/10 px-4 py-3 text-sm text-[#f3d9a1]">{message}</div>}
      {loading ? <div className="grid gap-4 sm:grid-cols-3">{[1,2,3].map(item => <div key={item} className="h-28 animate-pulse rounded-2xl bg-white/10" />)}</div> : <>
        <section className="grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-white/10 bg-white/[.04] p-5"><p className="text-xs uppercase tracking-widest text-[#a8b6ad]">Available bonus</p><p className="mt-2 text-3xl font-semibold">${((summary?.balanceCents ?? 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p></div><div className="rounded-2xl border border-white/10 bg-white/[.04] p-5"><p className="text-xs uppercase tracking-widest text-[#a8b6ad]">Referrals</p><p className="mt-2 text-3xl font-semibold">{summary?.referredUsers.length ?? 0}</p></div><div className="rounded-2xl border border-white/10 bg-white/[.04] p-5"><p className="text-xs uppercase tracking-widest text-[#a8b6ad]">Reward rate</p><p className="mt-2 text-3xl font-semibold">10%</p></div></section>
        <section className="rounded-2xl border border-white/10 bg-white/[.04] p-5 sm:p-7"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-semibold">Your referral link</h2><p className="mt-1 text-sm text-[#a8b6ad]">A reward is created only after an attributed investor completes their first approved deposit.</p></div><button onClick={createLink} className="rounded-full bg-[#d6a85c] px-5 py-3 text-sm font-semibold text-[#07100c]">{summary?.link ? "Refresh link" : "Create link"}</button></div><div className="mt-5 rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-mono text-sm text-[#d8e5dd]">{summary?.link ? `${window.location.origin}/r/${summary.link.code}` : "No referral link created yet."}</div></section>
        <section className="rounded-2xl border border-white/10 bg-white/[.04] p-5 sm:p-7"><div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><h2 className="text-xl font-semibold">Sign-ups and earnings</h2><p className="mt-1 text-sm text-[#a8b6ad]">Only persisted attribution and reward records appear here.</p></div><div className="grid grid-cols-2 gap-3"><label className="text-xs text-[#a8b6ad]">From<input value={start} onChange={event => setStart(event.target.value)} type="date" className="mt-1 block rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white" /></label><label className="text-xs text-[#a8b6ad]">To<input value={end} onChange={event => setEnd(event.target.value)} type="date" className="mt-1 block rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white" /></label></div></div>{analyticsLoading ? <div className="mt-6 h-64 animate-pulse rounded-xl bg-white/10" /> : points.length ? <div className="mt-6"><svg viewBox="0 0 100 100" className="h-64 w-full overflow-visible" role="img" aria-label="Referral earnings over time"><polyline fill="none" stroke="#d6a85c" strokeWidth="1.5" points={chartPoints.map(point => `${point.x},${point.y}`).join(" ")} />{chartPoints.map((point, index) => <circle key={point.x} cx={point.x} cy={point.y} r="1.8" fill="#d6a85c"><title>{points[index].label}: ${(points[index].earningsCents / 100).toFixed(2)} earnings, {points[index].signUps} sign-ups</title></circle>)}</svg><div className="mt-3 grid grid-cols-2 gap-3 text-xs text-[#a8b6ad]"><span>Max sign-ups: {maxSignups}</span><span className="text-right">Total earnings: ${(points.reduce((sum, point) => sum + point.earningsCents, 0) / 100).toFixed(2)}</span></div></div> : <div className="mt-6 rounded-xl border border-dashed border-white/15 px-4 py-12 text-center text-sm text-[#a8b6ad]">No persisted referral activity matches this period.</div>}</section>
        <section className="rounded-2xl border border-white/10 bg-white/[.04] p-5 sm:p-7"><div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-semibold">Withdraw referral bonus</h2><p className="mt-1 text-sm text-[#a8b6ad]">Minimum request: $500. Requests remain pending until admin review.</p></div><span className={`rounded-full px-3 py-1 text-xs ${canWithdraw ? "bg-emerald-400/15 text-emerald-300" : "bg-white/10 text-[#a8b6ad]"}`}>{canWithdraw ? "Eligible" : "Locked below $500"}</span></div><form onSubmit={submitWithdrawal} className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm text-[#c9d6ce]">Amount (USD)<input value={amount} onChange={event => setAmount(event.target.value)} type="number" min="500" step="0.01" disabled={!canWithdraw} className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-3 text-white disabled:cursor-not-allowed disabled:opacity-40" /></label><label className="text-sm text-[#c9d6ce]">Payout rail<select value={destinationType} onChange={event => setDestinationType(event.target.value as "bank" | "crypto")} disabled={!canWithdraw} className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-3 text-white disabled:opacity-40"><option value="bank">Bank transfer</option><option value="crypto">Crypto wallet</option></select></label><label className="text-sm text-[#c9d6ce]">{destinationType === "bank" ? "Account / bank reference" : "Wallet address"}<input value={destination} onChange={event => setDestination(event.target.value)} disabled={!canWithdraw} className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-3 text-white disabled:opacity-40" /></label><label className="text-sm text-[#c9d6ce]">{destinationType === "bank" ? "Bank and account-holder details" : "Network (optional)"}<input value={destinationDetails} onChange={event => setDestinationDetails(event.target.value)} disabled={!canWithdraw} className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-3 text-white disabled:opacity-40" /></label><button disabled={!canWithdraw} className="rounded-full bg-[#d6a85c] px-5 py-3 text-sm font-semibold text-[#07100c] disabled:cursor-not-allowed disabled:opacity-40">Withdraw Referral Bonus</button></form></section>
      </>}
    </div>
  </main>;
}
