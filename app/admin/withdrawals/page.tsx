'use client';

import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';

export const dynamic = 'force-dynamic';

type Withdrawal = { id: number; investorId: string; amountCents: number; destinationType: string; destination: string; status: string; createdAt: string };

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  async function load() { setLoading(true); const response = await fetch('/api/admin/withdrawals', { cache: 'no-store' }); if (response.ok) setWithdrawals(await response.json()); setLoading(false); }
  useEffect(() => { void load(); }, []);
  async function review(withdrawalId: number, action: 'approve' | 'reject') { setMessage(''); const response = await fetch('/api/admin/withdrawals', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ withdrawalId, action }) }); const data = await response.json().catch(() => ({})); setMessage(response.ok ? `Withdrawal ${action}d successfully.` : data.error ?? 'Action failed.'); await load(); }
  return <div className="min-h-screen bg-[#0D1215] text-[#E8EFEB] flex flex-col md:flex-row font-sans"><AdminSidebar /><main className="flex-1 p-4 sm:p-8 space-y-8 overflow-y-auto pb-24 md:pb-8"><div className="border-b border-[#2B393F] pb-6 space-y-1"><h1 className="text-2xl font-normal text-[#E8EFEB]">Withdrawal Approval Queue</h1><p className="text-xs text-[#93A09A]">Review and process pending client withdrawal payouts.</p></div>{message && <div role="status" className="rounded-xl border border-[#22C55E]/40 bg-[#22C55E]/10 p-4 text-xs text-[#86EFAC]">{message}</div>}{loading ? <div className="space-y-4">{[0,1,2].map(i => <div key={i} className="h-32 rounded-2xl bg-[#151E23] border border-[#2B393F] animate-pulse" />)}</div> : withdrawals.length === 0 ? <p className="text-sm text-[#93A09A]">No withdrawals found.</p> : <div className="space-y-4">{withdrawals.map(wth => <div key={wth.id} className="p-6 rounded-2xl bg-[#151E23] border border-[#2B393F] flex flex-col md:flex-row items-start md:items-center justify-between gap-6"><div className="space-y-1"><p className="text-sm font-semibold text-[#E8EFEB]">{wth.investorId}</p><p className="text-2xl font-mono font-semibold text-[#E8EFEB]">${(wth.amountCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p><p className="text-xs text-[#93A09A] font-mono">{wth.destinationType}: {wth.destination}</p><p className="text-[10px] text-[#93A09A] font-mono">{new Date(wth.createdAt).toLocaleString()}</p></div><div className="flex items-center gap-3">{wth.status === 'pending' ? <><button onClick={() => void review(wth.id, 'approve')} className="px-6 py-2.5 rounded-full text-xs font-semibold bg-[#22C55E] text-[#E8EFEB] hover:bg-[#16A34A] transition-colors shadow-md">Approve</button><button onClick={() => void review(wth.id, 'reject')} className="px-6 py-2.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors">Reject</button></> : <span className={`px-4 py-1.5 rounded-full font-mono text-xs font-semibold ${wth.status === 'approved' ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-red-500/10 text-red-400'}`}>{wth.status.toUpperCase()}</span>}</div></div>)}</div>}</main></div>;
}
