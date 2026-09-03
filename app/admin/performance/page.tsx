'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { Icon } from '@iconify/react';

type Investor = { id: string; name: string | null; email: string | null; planName: string | null; balanceCents: number | null; planId: number | null };
type Performance = { id: number; investorId: string; investorName: string | null; investorEmail: string | null; planName: string | null; percentageBps: number; profitCents: number; marketNote: string; publishedBy: string; entryDate: string; createdAt: string };

const PLAN_ROI: Record<string, { weekly: number; label: string }> = {
  Starter: { weekly: 15, label: '15% / 7 Days' },
  Growth: { weekly: 25, label: '25% / 7 Days' },
  Elite: { weekly: 35, label: '35% / 7 Days' },
};

function formatCents(cents: number | null | undefined) {
  return `$${((cents ?? 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function isSameWeek(value: string) {
  const start = new Date();
  const end = new Date();
  const day = (start.getUTCDay() + 6) % 7;
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - day);
  end.setTime(start.getTime());
  end.setUTCDate(end.getUTCDate() + 7);
  const date = new Date(value);
  return date >= start && date < end;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export default function AdminPerformancePage() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [history, setHistory] = useState<Performance[]>([]);
  const [investorId, setInvestorId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [marketNote, setMarketNote] = useState('Strategy performance update');

  async function load() {
    setLoading(true);
    try {
      const [investorResponse, historyResponse] = await Promise.all([
        fetch('/api/admin/investors', { cache: 'no-store' }),
        fetch('/api/admin/roi', { cache: 'no-store' }),
      ]);
      if (investorResponse.ok) setInvestors(await investorResponse.json());
      if (historyResponse.ok) setHistory(await historyResponse.json());
    } catch {
      setMessage('Unable to load investor performance data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const selected = investors.find(investor => investor.id === investorId);
  const planRoi = selected?.planName ? PLAN_ROI[selected.planName] : null;
  const selectedHistory = useMemo(() => history.filter(entry => entry.investorId === investorId).sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()), [history, investorId]);
  const lastCredit = selectedHistory[0];
  const alreadyCreditedThisWeek = Boolean(lastCredit && isSameWeek(lastCredit.entryDate));
  const balance = selected ? (selected.balanceCents ?? 0) / 100 : 0;
  const weeklyProfit = planRoi ? balance * planRoi.weekly / 100 : 0;

  async function publishFixed() {
    if (!selected || !planRoi || alreadyCreditedThisWeek || !marketNote.trim()) return;
    setSubmitting(true);
    setMessage('');
    try {
      const response = await fetch('/api/admin/roi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ investorId: selected.id, percentageBps: planRoi.weekly * 100, marketNote: marketNote.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setMessage(`Performance credit applied for ${selected.name ?? selected.email}. ${formatCents(data.profitCents)} added to the account.`);
        await load();
      } else {
        setMessage(data.error ?? 'Performance credit failed.');
        await load();
      }
    } catch {
      setMessage('Network error while applying performance credit.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0D1215] text-[#E8EFEB] flex flex-col md:flex-row font-sans">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-8 space-y-8 overflow-y-auto pb-24 md:pb-8">
        <div className="border-b border-[#2B393F] pb-6 space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#22C55E] font-mono"><span className="w-2 h-2 rounded-full bg-[#22C55E]" /> PERFORMANCE OPERATIONS</div>
          <h1 className="text-2xl font-normal">Apply Strategy Performance</h1>
          <p className="text-xs text-[#93A09A]">Select an investor, review the last credit, and apply no more than one plan performance credit per 7-day period.</p>
        </div>

        {message && <div role="status" className={`p-4 rounded-xl text-xs ${/failed|error|already|unable/i.test(message) ? 'bg-[#CF202F]/10 border border-[#CF202F]/50 text-[#FCA5A5]' : 'bg-[#22C55E]/10 border border-[#22C55E]/50 text-[#86EFAC]'}`}>{message}</div>}

        <label className="block text-xs text-[#93A09A]">
          Select Investor
          <select required value={investorId} onChange={event => { setInvestorId(event.target.value); setMessage(''); }} disabled={loading} className="mt-2 w-full bg-[#0D1215] border border-[#2B393F] rounded-xl px-4 py-3 text-sm text-[#E8EFEB]">
            <option value="">{loading ? 'Loading investors…' : 'Select investor'}</option>
            {investors.map(investor => <option key={investor.id} value={investor.id}>{investor.name ?? 'Unnamed investor'} · {investor.email ?? 'No email'} · {investor.planName ?? 'No plan'} · {formatCents(investor.balanceCents)}</option>)}
          </select>
        </label>

        {selected && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#2B393F] bg-[#151E23] p-5 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-lg font-semibold text-white">{selected.name ?? 'Unnamed investor'}</p>
                  <p className="text-xs text-[#93A09A] mt-1">{selected.email ?? 'No email on file'}</p>
                </div>
                <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold ${alreadyCreditedThisWeek ? 'bg-amber-500/10 text-amber-300' : 'bg-[#22C55E]/10 text-[#86EFAC]'}`}>
                  <span className={`h-2 w-2 rounded-full ${alreadyCreditedThisWeek ? 'bg-amber-400' : 'bg-[#22C55E]'}`} />
                  {alreadyCreditedThisWeek ? 'Already credited this week' : 'Ready for this week'}
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 lg:grid-cols-5 gap-3">
                {[['Plan', selected.planName ?? 'None'], ['Balance', formatCents(selected.balanceCents)], ['Rate', planRoi ? `${planRoi.weekly}%` : 'N/A'], ['Last credit', lastCredit ? formatDate(lastCredit.entryDate) : 'None'], ['Last amount', lastCredit ? formatCents(lastCredit.profitCents) : '—']].map(([label, value]) => <div key={label} className="rounded-xl bg-[#0D1215] border border-[#2B393F] p-3"><p className="text-[10px] uppercase font-mono text-[#7F8C86]">{label}</p><p className="mt-1 text-xs font-mono font-semibold text-white break-words">{value}</p></div>)}
              </div>
            </div>

            {planRoi ? (
              <div className="rounded-2xl border border-[#22C55E]/30 bg-[#22C55E]/5 p-6 sm:p-8 space-y-5">
                <div className="flex items-center gap-3"><div className="w-12 h-12 rounded-full bg-[#22C55E]/10 flex items-center justify-center"><Icon icon="solar:chart-up-bold" className="w-7 h-7 text-[#22C55E]" /></div><div><h3 className="text-xl font-semibold text-white">This week&apos;s performance credit</h3><p className="text-xs text-[#93A09A]">Fixed {planRoi.weekly}% rate for the {selected.planName} plan</p></div></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs"><div className="rounded-xl bg-[#0D1215]/70 border border-[#2B393F] p-4"><p className="text-[#93A09A]">Estimated credit</p><p className="mt-1 text-xl font-mono font-bold text-[#22C55E]">{formatCents(Math.round(weeklyProfit * 100))}</p></div><div className="rounded-xl bg-[#0D1215]/70 border border-[#2B393F] p-4"><p className="text-[#93A09A]">After credit</p><p className="mt-1 text-xl font-mono font-bold text-white">{formatCents(Math.round((balance + weeklyProfit) * 100))}</p></div></div>
                <label className="block text-xs text-[#93A09A]">Market or strategy note<textarea value={marketNote} onChange={event => setMarketNote(event.target.value)} rows={2} maxLength={500} className="mt-2 w-full rounded-xl border border-[#2B393F] bg-[#0D1215] px-3 py-2.5 text-xs text-white" /></label>
                <button onClick={() => void publishFixed()} disabled={submitting || alreadyCreditedThisWeek || !marketNote.trim()} className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#22C55E] text-[#0A0D0C] font-semibold text-sm hover:bg-[#16A34A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{submitting ? 'Applying…' : alreadyCreditedThisWeek ? 'Already credited this week' : 'Apply this week’s performance credit'}</button>
              </div>
            ) : <div className="rounded-2xl border border-[#CF202F]/30 bg-[#CF202F]/5 p-8 text-center"><p className="text-sm text-[#FCA5A5]">This investor has no active plan. Assign a plan first.</p></div>}
          </div>
        )}

        <section className="rounded-2xl border border-[#2B393F] bg-[#151E23] p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"><div><h2 className="text-base font-semibold text-white">Performance credit history</h2><p className="text-xs text-[#7F8C86] mt-1">UTC-dated records for audit and duplicate prevention.</p></div><span className="text-[11px] font-mono text-[#93A09A]">{history.length} records</span></div>
          {history.length === 0 ? <p className="rounded-xl border border-dashed border-[#2B393F] p-8 text-center text-xs text-[#7F8C86]">No performance credits recorded.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-xs"><thead className="text-[10px] uppercase font-mono text-[#7F8C86] border-b border-[#2B393F]"><tr><th className="py-3 pr-4">Investor</th><th className="py-3 pr-4">Plan</th><th className="py-3 pr-4">Rate</th><th className="py-3 pr-4">Credit</th><th className="py-3 pr-4">Date</th><th className="py-3">Admin</th></tr></thead><tbody>{history.map(entry => <tr key={entry.id} className="border-b border-[#2B393F]/60 last:border-0"><td className="py-3 pr-4"><p className="font-semibold text-white">{entry.investorName ?? 'Unnamed investor'}</p><p className="text-[10px] text-[#7F8C86]">{entry.investorEmail ?? entry.investorId}</p></td><td className="py-3 pr-4 text-[#93A09A]">{entry.planName ?? '—'}</td><td className="py-3 pr-4 font-mono text-[#22C55E]">{entry.percentageBps / 100}%</td><td className="py-3 pr-4 font-mono text-white">{formatCents(entry.profitCents)}</td><td className="py-3 pr-4 text-[#93A09A]">{formatDate(entry.entryDate)}</td><td className="py-3 text-[#7F8C86] font-mono">{entry.publishedBy}</td></tr>)}</tbody></table></div>}
        </section>

        <section className="rounded-2xl border border-[#2B393F] bg-[#151E23] p-5 space-y-4"><h2 className="text-sm font-semibold text-white">Fixed performance reference</h2><div className="grid grid-cols-1 md:grid-cols-3 gap-3">{Object.entries(PLAN_ROI).map(([plan, { weekly, label }]) => <div key={plan} className="rounded-xl bg-[#0D1215] border border-[#2B393F] p-4 text-center"><p className="text-xs text-[#93A09A]">{plan}</p><p className="text-2xl font-mono font-bold text-[#22C55E] mt-1">{weekly}%</p><p className="text-[10px] text-[#7F8C86] mt-1">{label}</p></div>)}</div></section>
      </main>
    </div>
  );
}
