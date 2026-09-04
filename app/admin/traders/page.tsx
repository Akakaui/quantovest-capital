'use client';

import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import EmptyState from '@/components/admin/EmptyState';

type Trader = {
  id: string;
  name: string;
  specialty: string;
  imagePath?: string | null;
  imageUrl?: string | null;
  winRateBps: number;
  thirtyDayReturnBps: number;
  bio?: string | null;
};

const specialties = ['FX Specialist', 'Crypto Arbitrage', 'Equities Momentum', 'Multi-Asset Macro'];

export default function AdminTradersPage() {
  const [traders, setTraders] = useState<Trader[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState(specialties[0]);
  const [winRate, setWinRate] = useState('92.5');
  const [returnRate, setReturnRate] = useState('25');
  const [bio, setBio] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    const response = await fetch('/api/admin/traders', { cache: 'no-store' });
    if (response.ok) setTraders(await response.json());
  }

  useEffect(() => { void load(); }, []);

  function resetForm() {
    setEditingId(null);
    setName('');
    setSpecialty(specialties[0]);
    setWinRate('92.5');
    setReturnRate('25');
    setBio('');
    setImage(null);
  }

  function startEdit(trader: Trader) {
    setEditingId(trader.id);
    setName(trader.name);
    setSpecialty(trader.specialty);
    setWinRate((trader.winRateBps / 100).toFixed(1));
    setReturnRate((trader.thirtyDayReturnBps / 100).toFixed(1));
    setBio(trader.bio ?? '');
    setImage(null);
    setMessage(`Editing ${trader.name}. Choose a new image only if you want to replace the current one.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      let imagePath = editingId ? traders.find(trader => trader.id === editingId)?.imagePath ?? '' : '';
      if (image) {
        const form = new FormData();
        form.append('file', image);
        form.append('purpose', 'trader');
        const upload = await fetch('/api/uploads', { method: 'POST', body: form });
        const uploadData = await upload.json().catch(() => ({}));
        if (!upload.ok) {
          setMessage(uploadData.error ?? 'Image upload failed.');
          setSubmitting(false);
          return;
        }
        imagePath = uploadData.path;
      }
      if (!editingId && !imagePath) {
        setMessage('A profile image is required for a new trader.');
        setSubmitting(false);
        return;
      }
      const response = await fetch('/api/admin/traders', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId ?? undefined,
          name,
          specialty,
          imagePath,
          winRateBps: Math.round(Number(winRate) * 100),
          thirtyDayReturnBps: Math.round(Number(returnRate) * 100),
          bio,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(data.error ?? 'Trader profile could not be saved.');
      } else {
        setMessage(editingId ? 'Trader profile and image updated.' : 'Trader profile created.');
        resetForm();
        await load();
      }
    } catch {
      setMessage('The trader profile could not be saved. Please try again.');
    }
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-[#0A0D0C] text-white flex flex-col md:flex-row font-sans">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-8 space-y-8 overflow-y-auto pb-24 md:pb-8">
        <div className="border-b border-[#202722] pb-6">
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#22C55E]">Strategy directory</p>
          <h1 className="text-2xl font-normal mt-2">Master Trader Profile Manager</h1>
          <p className="text-xs text-[#A8ACB3] mt-1">Create persistent trader profiles and replace their images or performance details at any time.</p>
        </div>
        {message && <div role="status" className="rounded-xl border border-[#22C55E]/50 bg-[#22C55E]/10 p-4 text-xs text-[#86EFAC]">{message}</div>}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <form onSubmit={submit} className="bg-[#12161A] border border-[#202722] rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">{editingId ? 'Edit trader profile' : 'Add trader profile'}</h2>
              {editingId && <button type="button" onClick={resetForm} className="text-[11px] text-[#A8ACB3] hover:text-white">Cancel edit</button>}
            </div>
            <label className="text-xs text-[#A8ACB3] block">Trader name<input required value={name} onChange={event => setName(event.target.value)} className="mt-1 w-full bg-[#0A0D0C] border border-[#202722] rounded-xl px-4 py-2.5 text-xs text-white" /></label>
            <label className="text-xs text-[#A8ACB3] block">{editingId ? 'Replace profile image (optional)' : 'Profile image'}<input required={!editingId} type="file" accept="image/jpeg,image/png,image/webp" onChange={event => setImage(event.target.files?.[0] ?? null)} className="mt-1 w-full text-xs text-[#A8ACB3]" /></label>
            <label className="text-xs text-[#A8ACB3] block">Specialty<select value={specialty} onChange={event => setSpecialty(event.target.value)} className="mt-1 w-full bg-[#0A0D0C] border border-[#202722] rounded-xl px-3 py-2.5 text-xs text-white">{specialties.map(option => <option key={option}>{option}</option>)}</select></label>
            <div className="grid grid-cols-2 gap-3"><label className="text-xs text-[#A8ACB3]">Win rate<input type="number" min="0" max="100" step="0.1" value={winRate} onChange={event => setWinRate(event.target.value)} className="mt-1 w-full bg-[#0A0D0C] border border-[#202722] rounded-xl px-3 py-2.5 text-xs text-white" /></label><label className="text-xs text-[#A8ACB3]">30D return<input type="number" step="0.1" value={returnRate} onChange={event => setReturnRate(event.target.value)} className="mt-1 w-full bg-[#0A0D0C] border border-[#202722] rounded-xl px-3 py-2.5 text-xs text-white" /></label></div>
            <label className="text-xs text-[#A8ACB3] block">Strategy bio<textarea rows={3} value={bio} onChange={event => setBio(event.target.value)} className="mt-1 w-full bg-[#0A0D0C] border border-[#202722] rounded-xl p-3 text-xs text-white" /></label>
            <button disabled={submitting} className="w-full py-3.5 rounded-full bg-[#22C55E] text-[#07110B] font-semibold text-xs disabled:opacity-40">{submitting ? 'Saving…' : editingId ? 'Save Trader Changes' : 'Add Master Trader Profile'}</button>
          </form>
          <section className="space-y-4">
            <div className="flex items-center justify-between"><h2 className="text-base">Active Master Traders ({traders.length})</h2><span className="text-[10px] text-[#A8ACB3]">Images replaceable</span></div>
            {traders.length === 0 && (
              <EmptyState
                title="No active trader profiles yet"
                hint="Add your first master trader profile using the form to build the strategy directory."
                icon="solar:users-group-rounded-bold"
              />
            )}
            {traders.map(trader => <div key={trader.id} className="p-4 rounded-xl bg-[#12161A] border border-[#202722] flex items-center gap-3"><img src={trader.imageUrl || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(trader.name)}`} alt="" className="w-11 h-11 rounded-full object-cover border border-[#22C55E]/30" /><div className="min-w-0 flex-1"><p className="font-semibold text-white text-xs truncate">{trader.name}</p><p className="text-[10px] text-[#A8ACB3]">{trader.specialty} · {(trader.thirtyDayReturnBps / 100).toFixed(1)}% 30D</p></div><button type="button" onClick={() => startEdit(trader)} className="px-3 py-2 rounded-full border border-[#22C55E]/40 text-[#86EFAC] text-[10px] hover:bg-[#22C55E]/10">Edit / Replace</button></div>)}
          </section>
        </div>
      </main>
    </div>
  );
}
