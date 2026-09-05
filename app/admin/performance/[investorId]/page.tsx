'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';
import SkeletonRows from '@/components/admin/SkeletonRows';
import { Icon } from '@iconify/react';

type Investor = { id: string; name: string | null; email: string | null; planName: string | null; balanceCents: number | null; planId: number | null };
type Performance = { id: number; investorId: string; investorName: string | null; investorEmail: string | null; planName: string | null; percentageBps: number; profitCents: number; marketNote: string; publishedBy: string; entryDate: string; createdAt: string };

const PLAN_ROI: Record<string, { weekly: number; label: string }> = {
  Starter: { weekly: 15, label: '15% / 7 Days' },
  Growth: { weekly: 25, label: '25% / 7 Days' },
  Elite: { weekly: 35, label: '35% / 7 Days' },
};

const MESSAGE_TEMPLATES = [
  'BTC market gains',
  'ETH portfolio performance',
  'USDT yield return',
  'Forex market gains',
];

function formatCents(cents: number | null | undefined) {
  return `$${((cents ?? 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export default function AdminPerformanceDetailPage() {
  const params = useParams<{ investorId: string }>();
  const investorId = params.investorId;
  const router = useRouter();

  const [investors, setInvestors] = useState<Investor[]>([]);
  const [history, setHistory] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState('');
  const [messageTemplate, setMessageTemplate] = useState(MESSAGE_TEMPLATES[0]);
  const [customMessage, setCustomMessage] = useState('');

  const selected = investors.find(investor => investor.id === investorId);
  const planRoi = selected?.planName ? PLAN_ROI[selected.planName] : null;
  const balance = selected ? (selected.balanceCents ?? 0) / 100 : 0;
  const weeklySuggestion = planRoi ? balance * planRoi.weekly / 100 : 0;

  const effectiveMessage = messageTemplate === 'Custom'
    ? customMessage.trim()
    : messageTemplate;

  async function load() {
    const [investorResponse, historyResponse] = await Promise.all([
      fetch('/api/admin/investors', { cache: 'no-store' }),
      fetch(`/api/admin/roi?investorId=${encodeURIComponent(investorId)}`, { cache: 'no-store' }),
    ]);
    if (investorResponse.ok) setInvestors(await investorResponse.json());
    if (historyResponse.ok) setHistory(await historyResponse.json());
    setLoading(false);
  }

  useEffect(() => {
    setLoading(true);
    void load().catch(() => setMessage('Unable to load investor performance data.'));
  }, [investorId]);

  const sortedHistory = useMemo(
    () => [...history].sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()),
    [history],
  );

  async function sendCredit() {
    const amountCents = Math.round(Number(amount) * 100);
    if (!selected || !Number.isFinite(amountCents) || amountCents <= 0 || !effectiveMessage) return;
    setSubmitting(true);
    setMessage('');
    try {
      const response = await fetch('/api/admin/roi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ investorId: selected.id, amountCents, message: effectiveMessage }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setMessage(`ROI/profit credit applied. ${formatCents(data.profitCents)} added to the account.`);
        setAmount('');
        await load();
      } else {
        setMessage(data.error ?? 'Performance credit failed.');
      }
    } catch {
      setMessage('Network error while applying the credit.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0D1215] text-[#E8EFEB] flex flex-col md:flex-row font-sans">
      <AdminSidebar />
      <main className="flex-1 min-w-0 p-3 sm:p-8 space-y-6 sm:space-y-8 overflow-y-auto pb-24 md:pb-8">
        <div className="border-b border-[#2B393F] pb-5 sm:pb-6 space-y-2">
          <div className="flex items-center gap-2 text-xs text-[#F59E0B] font-mono"><span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> EVALUATE CREDIT OPERATIONS</div>
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-xl sm:text-2xl font-normal">Daily ROI Entry</h1>
            <Link href="/admin/performance" className="min-h-10 inline-flex items-center gap-1 rounded-full border border-[#2B393F] px-3 text-xs text-[#93A09A] hover:text-white transition-colors touch-manipulation">
              <Icon icon="solar:arrow-left-bold" className="w-3.5 h-3.5" /> All investors
            </Link>
          </div>
        </div>

        {message && <div role="status" className={`p-4 rounded-xl text-xs ${/error|failed|unable|invalid|below/i.test(message) ? 'bg-[#CF202F]/10 border border-[#CF202F]/50 text-[#FCA5A5]' : 'bg-[#22C55E]/10 border border-[#22C55E]/50 text-[#86EFAC]'}`}>{message}</div>}

        {loading ? (
          <SkeletonRows rows={4} height="h-16" />
        ) : !selected ? (
          <div className="rounded-2xl border border-[#CF202F]/30 bg-[#CF202F]/5 p-8 text-center">
            <p className="text-sm text-[#FCA5A5]">Investor not found.</p>
            <Link href="/admin/performance" className="mt-3 inline-block text-xs text-[#93A09A] hover:text-white">Back to all investors</Link>
          </div>
        ) : (
          <>
            <section className="rounded-2xl border border-[#2B393F] bg-[#151E23] p-4 sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-lg font-semibold text-white">{selected.name ?? 'Unnamed investor'}</p>
                  <p className="text-xs text-[#93A09A] mt-1">{selected.email ?? 'No email on file'}</p>
                </div>
                <button onClick={() => router.push(`/admin/investors/${selected.id}`)} className="self-start sm:self-auto min-h-10 text-[11px] font-mono px-3 py-2 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/30 hover:bg-[#3B82F6]/20 transition-colors touch-manipulation">View investor profile</button>
              </div>
              <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[['Plan', selected.planName ?? 'No plan'], ['Balance', formatCents(selected.balanceCents)], ['Rate', planRoi ? `${planRoi.weekly}%/7d` : 'N/A'], ['Suggested weekly credit', planRoi ? formatCents(Math.round(weeklySuggestion * 100)) : '—']].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-[#0D1215] border border-[#2B393F] p-3">
                    <p className="text-[10px] uppercase font-mono text-[#7F8C86]">{label}</p>
                    <p className="mt-1 text-xs font-mono font-semibold text-white break-words">{value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-[#F59E0B]/30 bg-[#F59E0B]/5 p-4 sm:p-8 space-y-5">
              <div className="flex items-start gap-3"><div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full bg-[#F59E0B]/10 flex items-center justify-center"><Icon icon="solar:graph-up-bold" className="w-6 h-6 sm:w-7 sm:h-7 text-[#F59E0B]" /></div><div><h3 className="text-lg sm:text-xl font-semibold text-white">Apply a credit</h3><p className="text-xs leading-relaxed text-[#93A09A]">Enter the exact amount to credit. No weekly limit — apply anytime.</p></div></div>

              <label className="block text-xs text-[#93A09A]">
                Amount (USD)
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={event => setAmount(event.target.value)}
                  placeholder="e.g. 225.00"
                  className="mt-2 w-full min-h-12 rounded-xl border border-[#2B393F] bg-[#0D1215] px-4 py-3 text-base sm:text-sm text-white placeholder-[#7F8C86] font-mono focus:border-[#F59E0B]/50 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/15"
                />
                {planRoi && <span className="mt-1 block text-[10px] text-[#7F8C86]">Tip: the fixed weekly credit at {planRoi.weekly}% is {formatCents(Math.round(weeklySuggestion * 100))}</span>}
              </label>

              <label className="block text-xs text-[#93A09A]">
                Message
                <select value={messageTemplate} onChange={event => setMessageTemplate(event.target.value)} className="mt-2 w-full min-h-12 rounded-xl border border-[#2B393F] bg-[#0D1215] px-4 py-3 text-base sm:text-sm text-white focus:border-[#F59E0B]/50 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/15">
                  <option disabled>Select a message...</option>
                  {MESSAGE_TEMPLATES.map(template => <option key={template} value={template}>{template}</option>)}
                  <option value="Custom">Custom message...</option>
                </select>
              </label>

              {messageTemplate === 'Custom' && (
                <label className="block text-xs text-[#93A09A]">
                  Custom message
                  <textarea
                    value={customMessage}
                    onChange={event => setCustomMessage(event.target.value)}
                    rows={2}
                    maxLength={500}
                    placeholder="Enter the message shown to the investor"
                    className="mt-2 w-full min-h-24 rounded-xl border border-[#2B393F] bg-[#0D1215] px-4 py-3 text-sm text-white placeholder-[#7F8C86] focus:border-[#F59E0B]/50 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/15"
                  />
                </label>
              )}

              <button
                onClick={() => void sendCredit()}
                disabled={submitting || !amount || Number(amount) <= 0 || !effectiveMessage}
                className="w-full sm:w-auto min-h-12 px-8 py-3.5 rounded-full bg-[#F59E0B] text-[#0A0D0C] font-semibold text-sm hover:bg-[#D97706] transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              >
                {submitting ? 'Applying…' : 'Apply ROI / Profit'}
              </button>
            </section>

            <section className="rounded-2xl border border-[#2B393F] bg-[#151E23] p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div><h2 className="text-base font-semibold text-white">Credit history</h2><p className="text-xs text-[#7F8C86] mt-1">UTC-dated records for audit and duplicate prevention.</p></div>
                <span className="text-[11px] font-mono text-[#93A09A]">{sortedHistory.length} records</span>
              </div>
              {sortedHistory.length === 0 ? (
                <div className="rounded-xl bg-[#0D1215] border border-[#2B393F] p-6 text-center text-xs text-[#7F8C86]">No credits yet for this investor.</div>
              ) : (
                <>
                <div className="md:hidden space-y-3">
                  {sortedHistory.map(entry => (
                    <div key={entry.id} className="rounded-xl border border-[#2B393F] bg-[#0D1215] p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-mono font-semibold text-white">{formatCents(entry.profitCents)}</span>
                        <span className="font-mono text-[#22C55E]">{entry.percentageBps / 100}%</span>
                      </div>
                      <p className="text-xs leading-relaxed text-[#93A09A]">{entry.marketNote}</p>
                      <div className="flex items-center justify-between gap-3 text-[10px] text-[#7F8C86] font-mono">
                        <span>{formatDate(entry.entryDate)}</span>
                        <span className="truncate">{entry.publishedBy}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-xs">
                    <thead className="text-[10px] uppercase font-mono text-[#7F8C86] border-b border-[#2B393F]">
                      <tr><th className="py-3 pr-4">Credit</th><th className="py-3 pr-4">Rate</th><th className="py-3 pr-4">Message</th><th className="py-3 pr-4">Date</th><th className="py-3">Admin</th></tr>
                    </thead>
                    <tbody>
                      {sortedHistory.map(entry => (
                        <tr key={entry.id} className="border-b border-[#2B393F]/60 last:border-0">
                          <td className="py-3 pr-4 font-mono text-white">{formatCents(entry.profitCents)}</td>
                          <td className="py-3 pr-4 font-mono text-[#22C55E]">{entry.percentageBps / 100}%</td>
                          <td className="py-3 pr-4 text-[#93A09A] max-w-[260px] truncate">{entry.marketNote}</td>
                          <td className="py-3 pr-4 text-[#93A09A]">{formatDate(entry.entryDate)}</td>
                          <td className="py-3 text-[#7F8C86] font-mono">{entry.publishedBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                </>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}