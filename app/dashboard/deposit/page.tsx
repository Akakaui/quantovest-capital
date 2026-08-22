'use client';

import { useEffect, useState } from 'react';
import InvestorSidebar from '@/components/InvestorSidebar';
import { Icon } from '@iconify/react';

type Instruction = { id: number; method: string; label: string; details: string; qrPath: string | null };
type Deposit = { id: string; amountCents: number; method: string; status: string; proofPath: string | null };

export default function DepositPage() {
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [method, setMethod] = useState<'bank' | 'crypto'>('crypto');
  const [amount, setAmount] = useState(1500);
  const [proof, setProof] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');

  async function load() {
    const [instructionRes, depositRes] = await Promise.all([
      fetch('/api/deposit-instructions', { cache: 'no-store' }),
      fetch('/api/deposits', { cache: 'no-store' }),
    ]);
    if (instructionRes.ok) setInstructions(await instructionRes.json());
    if (depositRes.ok) setDeposits(await depositRes.json());
  }

  useEffect(() => { void load(); }, []);

  const active = instructions.find(item => item.method === method) ?? null;

  async function copy() {
    if (active) {
      await navigator.clipboard.writeText(active.details);
      setMessage('Deposit details copied.');
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setMessage('');
    if (!proof) { setMessage('Upload the payment screenshot before submitting.'); return; }
    const form = new FormData();
    form.append('file', proof);
    form.append('purpose', 'deposit-proof');
    const upload = await fetch('/api/uploads', { method: 'POST', body: form });
    const uploadData = await upload.json().catch(() => ({}));
    if (!upload.ok) { setMessage(uploadData.error ?? 'Proof upload failed.'); return; }
    const response = await fetch('/api/deposits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amountCents: Math.round(amount * 100), method, proofPath: uploadData.path }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) { setMessage(data.error ?? 'Deposit submission failed.'); return; }
    setSubmitted(true);
    await load();
  }

  return (
    <div className="min-h-screen bg-[#0A0F11] text-[#F3F7F4] flex flex-col md:flex-row font-sans">
      <InvestorSidebar />
      <main className="flex-1 p-4 sm:p-8 space-y-8 overflow-y-auto pb-24 md:pb-8">
        <div className="border-b border-[#263437] pb-6 space-y-1">
          <h1 className="text-2xl font-normal">Deposit Capital</h1>
          <p className="text-xs text-[#93A09A]">Use the current admin-configured instructions, then upload proof for manual verification.</p>
        </div>
        {message && <div role="alert" className="rounded-xl border border-amber-400/40 bg-amber-400/10 p-4 text-xs text-amber-100">{message}</div>}
        {submitted ? (
          <div className="max-w-xl rounded-2xl border border-[#263437] bg-[#141C1F] p-6 sm:p-8 text-center">
            <Icon icon="solar:check-read-bold" className="mx-auto h-10 w-10 text-[#22C55E]" />
            <h2 className="mt-4 text-xl">Deposit proof submitted</h2>
            <p className="mt-2 text-xs text-[#93A09A]">Admin will verify the screenshot. Your plan and balance update only after approval.</p>
            <button onClick={() => setSubmitted(false)} className="mt-5 rounded-full bg-[#22C55E] px-5 py-3 text-xs font-semibold text-[#07110B]">Make another deposit</button>
          </div>
        ) : (
          <div className="grid max-w-4xl grid-cols-1 gap-8 lg:grid-cols-2">
            <section className="rounded-2xl border border-[#263437] bg-[#141C1F] p-6 sm:p-8 space-y-5">
              <div className="flex gap-2">
                <button onClick={() => setMethod('crypto')} className={`flex-1 rounded-xl border p-3 text-xs ${method === 'crypto' ? 'border-[#22C55E] bg-[#22C55E]/10' : 'border-[#263437]'}`}>Crypto</button>
                <button onClick={() => setMethod('bank')} className={`flex-1 rounded-xl border p-3 text-xs ${method === 'bank' ? 'border-[#22C55E] bg-[#22C55E]/10' : 'border-[#263437]'}`}>Bank</button>
              </div>
              {active ? (
                <div className="rounded-xl border border-[#263437] bg-[#0A0F11] p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[#93A09A]">{active.label}</p>
                    <button onClick={() => void copy()} className="text-xs text-[#22C55E]">Copy</button>
                  </div>
                  <p className="mt-3 select-all break-all font-mono text-xs text-white">{active.details}</p>
                  {active.qrPath && <img src={active.qrPath} alt="Deposit QR code" className="mt-4 h-32 w-32 rounded-lg bg-white object-contain" />}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-[#263437] p-8 text-center text-xs text-[#93A09A]">Admin has not configured {method} deposit instructions yet.</div>
              )}
              <form onSubmit={submit} className="space-y-4">
                <label className="block text-xs text-[#93A09A]">Amount ($)
                  <input required min="1500" type="number" value={amount} onChange={event => setAmount(Number(event.target.value))} className="mt-1 w-full rounded-xl border border-[#263437] bg-[#0A0F11] px-4 py-3 text-sm text-white" />
                </label>
                <label className="block text-xs text-[#93A09A]">Payment screenshot
                  <input required type="file" accept="image/jpeg,image/png,image/webp" onChange={event => setProof(event.target.files?.[0] ?? null)} className="mt-1 w-full text-xs" />
                </label>
                <button disabled={!active} className="w-full rounded-full bg-[#22C55E] py-3.5 text-xs font-semibold text-[#07110B] disabled:opacity-40">Submit for manual verification</button>
              </form>
            </section>
            <section className="rounded-2xl border border-[#263437] bg-[#141C1F] p-6 sm:p-8">
              <h2 className="text-base">Deposit history</h2>
              <div className="mt-4 space-y-3">
                {deposits.map(deposit => (
                  <div key={deposit.id} className="flex items-center justify-between rounded-xl border border-[#263437] bg-[#0A0F11] p-4 text-xs">
                    <div>
                      <p className="font-mono font-semibold">${(deposit.amountCents / 100).toLocaleString()}</p>
                      <p className="text-[10px] text-[#93A09A]">{deposit.method}</p>
                    </div>
                    <span className="rounded-full bg-amber-500/20 px-2 py-1 text-[10px] text-amber-300">{deposit.status.toUpperCase()}</span>
                  </div>
                ))}
                {!deposits.length && <p className="py-8 text-center text-xs text-[#93A09A]">No deposits submitted yet.</p>}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
