'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';

type Investor = { id: string; name: string | null; email: string | null; planName: string | null; minRoiBps: number | null; maxRoiBps: number | null; balanceCents: number | null };
type Plan = { id: number; name: string; minRoiBps: number; maxRoiBps: number };

export default function AdminPerformancePage() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [investorId, setInvestorId] = useState('');
  const [percentage, setPercentage] = useState('1.00');
  const [note, setNote] = useState('FX EUR/USD intraday rally + Crypto BTC momentum execution');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    Promise.all([fetch('/api/admin/investors', { cache: 'no-store' }), fetch('/api/plans', { cache: 'no-store' })]).then(async ([investorResponse, planResponse]) => {
      if (investorResponse.ok) setInvestors(await investorResponse.json());
      if (planResponse.ok) setPlans(await planResponse.json());
      setLoading(false);
    }).catch(() => { setMessage('Unable to load the persistent investor queue.'); setLoading(false); });
  }, []);

  const selected = investors.find(investor => investor.id === investorId);
  const range = useMemo(() => selected?.minRoiBps != null && selected.maxRoiBps != null ? { min: selected.minRoiBps / 100, max: selected.maxRoiBps / 100 } : null, [selected]);

  async function publish(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    const response = await fetch('/api/admin/roi', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ investorId, percentageBps: Math.round(Number(percentage) * 100), marketNote: note }) });
    const data = await response.json().catch(() => ({}));
    setMessage(response.ok ? `ROI published for ${selected?.name ?? 'investor'} and recorded in the portfolio ledger.` : data.error ?? 'ROI publication failed.');
    setSubmitting(false);
  }

  return <div className="min-h-screen bg-[#0D1215] text-[#E8EFEB] flex flex-col md:flex-row font-sans"><AdminSidebar /><main className="flex-1 p-4 sm:p-8 space-y-8 overflow-y-auto pb-24 md:pb-8"><div className="border-b border-[#2B393F] pb-6 space-y-1"><h1 className="text-2xl font-normal">Publish Individual Investor ROI</h1><p className="text-xs text-[#93A09A]">Select one investor. The server validates the ROI against that investor&apos;s active plan before changing their persistent balance.</p></div>{message && <div role="status" className="p-4 bg-[#22C55E]/10 border border-[#22C55E]/50 rounded-xl text-xs text-[#86EFAC]">{message}</div>}<form onSubmit={publish} className="max-w-2xl bg-[#151E23] border border-[#2B393F] rounded-2xl p-6 sm:p-8 space-y-5"><label className="block text-xs text-[#93A09A]">Investor<select required value={investorId} onChange={event => setInvestorId(event.target.value)} disabled={loading} className="mt-2 w-full bg-[#0D1215] border border-[#2B393F] rounded-xl px-4 py-3 text-sm text-[#E8EFEB]"><option value="">{loading ? 'Loading investor accounts…' : 'Select investor'}</option>{investors.map(investor => <option key={investor.id} value={investor.id}>{investor.name ?? investor.email ?? investor.id} · {investor.planName ?? 'No plan'}</option>)}</select></label>{selected && <div className="rounded-xl border border-[#2B393F] bg-[#0D1215] p-4 text-xs text-[#A8ACB3]">Active plan: <strong className="text-white">{selected.planName ?? 'Not assigned'}</strong><span className="mx-2">·</span>Balance: <strong className="text-white">${((selected.balanceCents ?? 0) / 100).toLocaleString()}</strong><span className="mx-2">·</span>Allowed range: <strong className="text-[#86EFAC]">{range ? `${range.min.toFixed(2)}% – ${range.max.toFixed(2)}%` : 'Unavailable'}</strong></div>}<label className="block text-xs text-[#93A09A]">ROI percentage<input required type="number" step="0.01" min={range?.min} max={range?.max} value={percentage} onChange={event => setPercentage(event.target.value)} className="mt-2 w-full bg-[#0D1215] border border-[#2B393F] rounded-xl px-4 py-3 text-lg text-[#E8EFEB] font-mono" /></label><label className="block text-xs text-[#93A09A]">Market allocation note<textarea required rows={3} value={note} onChange={event => setNote(event.target.value)} className="mt-2 w-full bg-[#0D1215] border border-[#2B393F] rounded-xl p-3 text-sm text-[#E8EFEB]" /></label><button disabled={submitting || !investorId} className="w-full py-3.5 rounded-full bg-[#22C55E] text-[#07110B] font-semibold text-xs disabled:opacity-40">{submitting ? 'Publishing…' : 'Publish ROI to This Investor'}</button></form><section className="max-w-2xl rounded-2xl border border-[#2B393F] bg-[#151E23] p-6"><h2 className="text-base">Configured plans</h2><div className="mt-4 grid gap-3 sm:grid-cols-3">{plans.map(plan => <div key={plan.id} className="rounded-xl bg-[#0D1215] p-4 text-xs"><p className="font-semibold text-white">{plan.name}</p><p className="mt-1 text-[#86EFAC]">{(plan.minRoiBps / 100).toFixed(2)}% – {(plan.maxRoiBps / 100).toFixed(2)}%</p></div>)}</div></section></main></div>;
}
