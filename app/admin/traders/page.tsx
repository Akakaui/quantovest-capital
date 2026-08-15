'use client';

import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';

type Trader = { id: string; name: string; specialty: string; imagePath?: string | null; imageUrl?: string | null; winRateBps: number; thirtyDayReturnBps: number; riskLevel: number; bio?: string | null };

export default function AdminTradersPage() {
  const [traders, setTraders] = useState<Trader[]>([]);
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('FX Specialist');
  const [winRate, setWinRate] = useState('92.5');
  const [returnRate, setReturnRate] = useState('25');
  const [riskLevel, setRiskLevel] = useState('2');
  const [bio, setBio] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function load() { const response = await fetch('/api/admin/traders', { cache: 'no-store' }); if (response.ok) setTraders(await response.json()); }
  useEffect(() => { void load(); }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setSubmitting(true); setMessage('');
    let imagePath = '';
    if (image) {
      const form = new FormData(); form.append('file', image); form.append('purpose', 'trader');
      const upload = await fetch('/api/uploads', { method: 'POST', body: form });
      const uploadData = await upload.json().catch(() => ({}));
      if (!upload.ok) { setMessage(uploadData.error ?? 'Image upload failed.'); setSubmitting(false); return; }
      imagePath = uploadData.path;
    }
    const response = await fetch('/api/admin/traders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, specialty, imagePath, winRateBps: Math.round(Number(winRate) * 100), thirtyDayReturnBps: Math.round(Number(returnRate) * 100), riskLevel: Number(riskLevel), bio }) });
    const data = await response.json().catch(() => ({}));
    setMessage(response.ok ? 'Trader profile created.' : data.error ?? 'Trader creation failed.');
    if (response.ok) { setName(''); setBio(''); setImage(null); await load(); }
    setSubmitting(false);
  }

  return <div className="min-h-screen bg-[#0A0D0C] text-white flex flex-col md:flex-row font-sans"><AdminSidebar /><main className="flex-1 p-4 sm:p-8 space-y-8 overflow-y-auto pb-24 md:pb-8"><div className="border-b border-[#202722] pb-6"><h1 className="text-2xl font-normal">Master Trader Profile Manager</h1><p className="text-xs text-[#A8ACB3] mt-1">Create persistent trader profiles with validated image uploads.</p></div>{message && <div role="status" className="rounded-xl border border-[#22C55E]/50 bg-[#22C55E]/10 p-4 text-xs text-[#86EFAC]">{message}</div>}<div className="grid grid-cols-1 lg:grid-cols-2 gap-8"><form onSubmit={submit} className="bg-[#12161A] border border-[#202722] rounded-2xl p-6 sm:p-8 space-y-4"><label className="text-xs text-[#A8ACB3] block">Trader name<input required value={name} onChange={event => setName(event.target.value)} className="mt-1 w-full bg-[#0A0D0C] border border-[#202722] rounded-xl px-4 py-2.5 text-xs text-white" /></label><label className="text-xs text-[#A8ACB3] block">Profile image<input required type="file" accept="image/jpeg,image/png,image/webp" onChange={event => setImage(event.target.files?.[0] ?? null)} className="mt-1 w-full text-xs text-[#A8ACB3]" /></label><label className="text-xs text-[#A8ACB3] block">Specialty<select value={specialty} onChange={event => setSpecialty(event.target.value)} className="mt-1 w-full bg-[#0A0D0C] border border-[#202722] rounded-xl px-3 py-2.5 text-xs text-white"><option>FX Specialist</option><option>Crypto Arbitrage</option><option>Equities Momentum</option><option>Multi-Asset Macro</option></select></label><div className="grid grid-cols-3 gap-3"><label className="text-xs text-[#A8ACB3]">Win rate<input type="number" step="0.1" value={winRate} onChange={event => setWinRate(event.target.value)} className="mt-1 w-full bg-[#0A0D0C] border border-[#202722] rounded-xl px-3 py-2.5 text-xs text-white" /></label><label className="text-xs text-[#A8ACB3]">30D return<input type="number" step="0.1" value={returnRate} onChange={event => setReturnRate(event.target.value)} className="mt-1 w-full bg-[#0A0D0C] border border-[#202722] rounded-xl px-3 py-2.5 text-xs text-white" /></label><label className="text-xs text-[#A8ACB3]">Risk<input type="number" min="1" max="5" value={riskLevel} onChange={event => setRiskLevel(event.target.value)} className="mt-1 w-full bg-[#0A0D0C] border border-[#202722] rounded-xl px-3 py-2.5 text-xs text-white" /></label></div><label className="text-xs text-[#A8ACB3] block">Strategy bio<textarea rows={3} value={bio} onChange={event => setBio(event.target.value)} className="mt-1 w-full bg-[#0A0D0C] border border-[#202722] rounded-xl p-3 text-xs text-white" /></label><button disabled={submitting} className="w-full py-3.5 rounded-full bg-[#22C55E] text-[#07110B] font-semibold text-xs disabled:opacity-40">{submitting ? 'Saving…' : 'Add Master Trader Profile'}</button></form><section className="space-y-4"><h2 className="text-base">Active Master Traders ({traders.length})</h2>{traders.map(trader => <div key={trader.id} className="p-4 rounded-xl bg-[#12161A] border border-[#202722] flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-[#202722] flex items-center justify-center text-xs">{trader.name.slice(0, 1)}</div><div className="min-w-0"><p className="font-semibold text-white text-xs truncate">{trader.name}</p><p className="text-[10px] text-[#A8ACB3]">{trader.specialty} · {(trader.thirtyDayReturnBps / 100).toFixed(1)}% 30D</p></div></div>)}</section></div></main></div>;
}
