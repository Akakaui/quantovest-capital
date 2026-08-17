'use client';

import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { Icon } from '@iconify/react';

type Investor = { id: string; name: string | null; email: string | null; planName: string | null; balanceCents: number | null; planId: number | null };

const PLAN_ROI: Record<string, { daily: number; label: string }> = {
  'Starter': { daily: 15, label: '15% Daily' },
  'Growth': { daily: 25, label: '25% Daily' },
  'Elite': { daily: 35, label: '35% Daily' },
};

export default function AdminPerformancePage() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [investorId, setInvestorId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/admin/investors', { cache: 'no-store' })
      .then(async (res) => { if (res.ok) setInvestors(await res.json()); })
      .catch(() => setMessage('Unable to load investors.'))
      .finally(() => setLoading(false));
  }, []);

  const selected = investors.find(i => i.id === investorId);
  const planRoi = selected?.planName ? PLAN_ROI[selected.planName] : null;

  async function publishFixed() {
    if (!selected || !planRoi) return;
    setSubmitting(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/roi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          investorId: selected.id,
          percentageBps: planRoi.daily * 100,
          marketNote: `${selected.planName} plan fixed daily ROI — ${planRoi.daily}%`,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMessage(`Published ${planRoi.daily}% ROI for ${selected.name ?? selected.email}. $${((data.profitCents ?? 0) / 100).toFixed(2)} credited.`);
        // Refresh investor data
        const updated = await fetch('/api/admin/investors', { cache: 'no-store' });
        if (updated.ok) setInvestors(await updated.json());
      } else {
        setMessage(data.error ?? 'ROI publication failed.');
      }
    } catch {
      setMessage('Network error.');
    }
    setSubmitting(false);
  }

  const balance = selected ? (selected.balanceCents ?? 0) / 100 : 0;
  const dailyProfit = planRoi ? balance * planRoi.daily / 100 : 0;

  return (
    <div className="min-h-screen bg-[#0D1215] text-[#E8EFEB] flex flex-col md:flex-row font-sans">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-8 space-y-8 overflow-y-auto pb-24 md:pb-8">
        <div className="border-b border-[#2B393F] pb-6 space-y-1">
          <h1 className="text-2xl font-normal">Publish Daily ROI</h1>
          <p className="text-xs text-[#93A09A]">Select an investor. Their plan has a fixed daily ROI — just tap the button to publish.</p>
        </div>

        {message && (
          <div role="status" className={`p-4 rounded-xl text-xs ${message.includes('failed') || message.includes('error') ? 'bg-[#CF202F]/10 border border-[#CF202F]/50 text-[#FCA5A5]' : 'bg-[#22C55E]/10 border border-[#22C55E]/50 text-[#86EFAC]'}`}>
            {message}
          </div>
        )}

        <label className="block text-xs text-[#93A09A]">
          Select Investor
          <select
            required
            value={investorId}
            onChange={e => { setInvestorId(e.target.value); setMessage(''); }}
            disabled={loading}
            className="mt-2 w-full bg-[#0D1215] border border-[#2B393F] rounded-xl px-4 py-3 text-sm text-[#E8EFEB]"
          >
            <option value="">{loading ? 'Loading investors...' : 'Select investor'}</option>
            {investors.map(i => (
              <option key={i.id} value={i.id}>
                {i.name ?? i.email ?? i.id} — {i.planName ?? 'No plan'} — ${((i.balanceCents ?? 0) / 100).toLocaleString()}
              </option>
            ))}
          </select>
        </label>

        {selected && (
          <div className="space-y-6">
            {/* Investor Info Card */}
            <div className="rounded-2xl border border-[#2B393F] bg-[#151E23] p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-xs text-[#93A09A]">Investor</p>
                  <p className="text-sm font-semibold text-white mt-1">{selected.name ?? selected.email}</p>
                </div>
                <div>
                  <p className="text-xs text-[#93A09A]">Plan</p>
                  <p className="text-sm font-semibold text-[#22C55E] mt-1">{selected.planName ?? 'None'}</p>
                </div>
                <div>
                  <p className="text-xs text-[#93A09A]">Balance</p>
                  <p className="text-sm font-mono font-semibold text-white mt-1">${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <p className="text-xs text-[#93A09A]">Daily ROI</p>
                  <p className="text-sm font-mono font-semibold text-[#22C55E] mt-1">{planRoi ? `${planRoi.daily}%` : 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* One-Click ROI Button */}
            {planRoi ? (
              <div className="rounded-2xl border border-[#22C55E]/30 bg-[#22C55E]/5 p-8 text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-[#22C55E]/10 flex items-center justify-center">
                  <Icon icon="solar:chart-up-bold" className="w-10 h-10 text-[#22C55E]" />
                </div>
                <div>
                  <h3 className="text-4xl font-mono font-bold text-[#22C55E]">{planRoi.daily}%</h3>
                  <p className="text-sm text-[#A8ACB3] mt-1">Fixed daily return for {selected.planName} plan</p>
                </div>
                <div className="text-xs text-[#93A09A]">
                  This will credit <span className="text-[#22C55E] font-mono">${dailyProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> to the investor&apos;s balance
                </div>
                <button
                  onClick={publishFixed}
                  disabled={submitting}
                  className="px-12 py-4 rounded-full bg-[#22C55E] text-[#0A0D0C] font-semibold text-sm hover:bg-[#16A34A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Publishing...' : `Publish ${planRoi.daily}% ROI Now`}
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-[#CF202F]/30 bg-[#CF202F]/5 p-8 text-center">
                <p className="text-sm text-[#FCA5A5]">This investor has no active plan. Assign a plan first.</p>
              </div>
            )}
          </div>
        )}

        {/* Quick Reference */}
        <div className="rounded-2xl border border-[#2B393F] bg-[#151E23] p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white">Fixed ROI Reference</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(PLAN_ROI).map(([plan, { daily }]) => (
              <div key={plan} className="p-4 rounded-xl bg-[#0D1215] border border-[#2B393F] text-center">
                <p className="text-xs text-[#93A09A]">{plan}</p>
                <p className="text-2xl font-mono font-bold text-[#22C55E] mt-1">{daily}%</p>
                <p className="text-xs text-[#93A09A] mt-1">per day</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
