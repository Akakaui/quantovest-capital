'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';

type Application = { id: number; investorId: string; investorName: string | null; investorEmail: string | null; documentPath: string; documentUrls: string[]; status: string; reviewedBy: string | null; reviewNote: string | null; createdAt: string; updatedAt: string };
function formatDate(value: string) { return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }); }

export default function AdminKycPage() {
  const [rows, setRows] = useState<Application[]>([]);
  const [view, setView] = useState<'pending' | 'history'>('pending');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/kyc?status=all', { cache: 'no-store' });
      const data = await response.json().catch(() => []);
      if (response.ok) setRows(data); else setMessage(data.error ?? 'KYC records are temporarily unavailable.');
    } catch { setMessage('KYC records are temporarily unavailable.'); } finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);
  async function review(applicationId: number, action: 'approve' | 'decline') {
    const response = await fetch('/api/admin/kyc', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ applicationId, action }) });
    const data = await response.json().catch(() => ({})); setMessage(response.ok ? `KYC ${action}d and notifications sent.` : data.error ?? 'KYC review failed.'); await load();
  }
  const visibleRows = useMemo(() => rows.filter(row => view === 'pending' ? row.status === 'pending' : row.status !== 'pending'), [rows, view]);

  return <div className="min-h-screen bg-[#0D1215] text-[#E8EFEB] flex flex-col md:flex-row font-sans"><AdminSidebar /><main className="flex-1 p-4 sm:p-8 space-y-8 overflow-y-auto pb-24 md:pb-8"><div className="border-b border-[#2B393F] pb-6"><h1 className="text-2xl font-normal">KYC Review Queue</h1><p className="mt-1 text-xs text-[#93A09A]">Review submitted identity documents and audit approved or declined applications.</p></div>{message && <div role="status" className="rounded-xl border border-amber-400/40 bg-amber-400/10 p-4 text-xs text-amber-100">{message}</div>}<div className="flex items-center justify-between gap-4 flex-wrap"><div><h2 className="text-base font-semibold">Identity Applications</h2><p className="text-xs text-[#7F8C86] mt-1">{rows.length} total records</p></div><div className="flex rounded-full border border-[#2B393F] bg-[#151E23] p-1">{(['pending', 'history'] as const).map(tab => <button key={tab} type="button" onClick={() => setView(tab)} className={`rounded-full px-4 py-2 text-xs font-semibold capitalize ${view === tab ? 'bg-[#22C55E] text-[#07110B]' : 'text-[#93A09A] hover:text-white'}`}>{tab}</button>)}</div></div>{loading ? <div className="rounded-2xl border border-[#2B393F] bg-[#151E23] p-10 text-center text-xs text-[#93A09A]">Loading KYC records…</div> : visibleRows.length === 0 ? <div className="rounded-2xl border border-dashed border-[#2B393F] p-10 text-center text-xs text-[#93A09A]">No {view === 'pending' ? 'pending KYC applications' : 'KYC history'}.</div> : <div className="space-y-4">{visibleRows.map(row => <article key={row.id} className="rounded-2xl border border-[#2B393F] bg-[#151E23] p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><p className="text-sm font-semibold text-white">{row.investorName ?? 'Unnamed investor'}</p><p className="text-[10px] text-[#7F8C86]">{row.investorEmail ?? row.investorId}</p><p className="mt-2 text-[10px] text-[#93A09A]">Submitted {formatDate(row.createdAt)} · <span className="capitalize">{row.status}</span>{row.reviewedBy ? ` · Reviewed by ${row.reviewedBy}` : ''}</p><div className="mt-3 flex flex-wrap gap-2">{row.documentUrls?.map((url, index) => <a key={url} href={url} target="_blank" rel="noreferrer" className="rounded-xl border border-[#2B393F] px-3 py-2 text-xs text-[#A8B6AD] hover:bg-[#0D1215]">View {index === 0 ? 'ID document' : 'proof of address'}</a>)}{!row.documentUrls?.length && <span className="text-xs text-amber-300">Documents unavailable for preview</span>}</div>{row.reviewNote && <p className="mt-3 text-xs text-[#A8B6AD]">Review note: {row.reviewNote}</p>}</div>{row.status === 'pending' && <div className="flex gap-2"><button type="button" onClick={() => void review(row.id, 'approve')} className="rounded-full bg-[#22C55E] px-4 py-2 text-xs font-semibold text-[#07110B]">Approve</button><button type="button" onClick={() => void review(row.id, 'decline')} className="rounded-full border border-rose-400/40 px-4 py-2 text-xs text-rose-300">Decline</button></div>}</div></article>)}</div>}</main></div>;
}
