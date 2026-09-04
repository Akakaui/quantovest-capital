'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import EmptyState from '@/components/admin/EmptyState';
import SkeletonRows from '@/components/admin/SkeletonRows';

type Deposit = { id: string; investorId: string; investorName: string | null; investorEmail: string | null; amountCents: number; method: string; proofPath: string | null; proofUrl: string | null; status: string; planId: number | null; reviewedBy: string | null; reviewNote: string | null; createdAt: string; updatedAt: string };
type Instruction = { id: number; method: string; label: string; details: string; qrPath: string | null; active: number };
const CRYPTO_METHODS = [{ value: 'usdt-trc20', label: 'USDT (TRC-20)' }, { value: 'btc', label: 'Bitcoin (BTC)' }] as const;

function formatCents(cents: number) { return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
function formatDate(value: string) { return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }); }

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [view, setView] = useState<'pending' | 'history'>('pending');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [depositResponse, instructionResponse] = await Promise.all([
      fetch('/api/admin/deposits?status=all', { cache: 'no-store' }),
      fetch('/api/admin/deposit-instructions', { cache: 'no-store' }),
    ]);
    if (depositResponse.ok) setDeposits(await depositResponse.json());
    if (instructionResponse.ok) setInstructions(await instructionResponse.json());
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  async function review(depositId: string, action: 'approve' | 'reject') {
    const response = await fetch('/api/admin/deposits', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ depositId, action }) });
    const data = await response.json().catch(() => ({}));
    setMessage(response.ok ? `Deposit ${action}d and notifications sent.` : data.error ?? 'Review failed.');
    await load();
  }

  async function saveInstruction(event: React.FormEvent<HTMLFormElement>, method: string) {
    event.preventDefault(); setMessage(''); const form = new FormData(event.currentTarget); form.set('method', method);
    const response = await fetch('/api/admin/deposit-instructions', { method: 'POST', body: form });
    const data = await response.json().catch(() => ({})); setMessage(response.ok ? `Instructions for ${method.toUpperCase()} saved.` : data.error ?? 'Instruction save failed.'); if (response.ok) await load();
  }

  const visibleDeposits = useMemo(() => deposits.filter(deposit => view === 'pending' ? deposit.status === 'pending' : deposit.status !== 'pending'), [deposits, view]);

  return (
    <div className="min-h-screen bg-[#0D1215] text-[#E8EFEB] flex flex-col md:flex-row font-sans">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-8 space-y-8 overflow-y-auto pb-24 md:pb-8">
        <div className="border-b border-[#2B393F] pb-6">
          <h1 className="text-2xl font-normal">Deposit Operations</h1>
          <p className="mt-1 text-xs text-[#93A09A]">Configure crypto payment details, verify proof, and review the complete deposit history.</p>
        </div>
        {message && <div role="status" className="rounded-xl border border-[#22C55E]/40 bg-[#22C55E]/10 p-4 text-xs text-[#86EFAC]">{message}</div>}

        <section className="space-y-4">
          <div>
            <h2 className="text-base font-semibold">Payment Instructions (Crypto Wallets)</h2>
            <p className="text-xs text-[#7F8C86] mt-1">Publish the wallet addresses investors use for funded deposits.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {CRYPTO_METHODS.map(coin => {
              const current = instructions.find(item => item.method === coin.value);
              return (
                <form key={coin.value} onSubmit={event => void saveInstruction(event, coin.value)} className="rounded-2xl border border-[#2B393F] bg-[#151E23] p-5 space-y-3">
                  <h3 className="text-xs font-semibold text-[#22C55E] uppercase tracking-wider">{coin.label} Details</h3>
                  <input name="label" defaultValue={current?.label ?? coin.label} placeholder="Wallet Name / Label" required className="w-full rounded-xl border border-[#2B393F] bg-[#0D1215] px-3 py-2.5 text-xs text-white" />
                  <textarea name="details" defaultValue={current?.details ?? ''} placeholder="Wallet Address" required rows={2} className="w-full rounded-xl border border-[#2B393F] bg-[#0D1215] px-3 py-2.5 text-xs text-white font-mono" />
                  <input name="qrFile" type="file" accept="image/jpeg,image/png,image/webp" className="w-full text-xs text-[#93A09A] file:mr-4 file:rounded-full file:border-0 file:bg-[#22C55E]/10 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[#22C55E]" />
                  <input type="hidden" name="method" value={coin.value} />
                  <input type="hidden" name="qrPath" value={current?.qrPath ?? ''} />
                  <p className="text-[10px] text-[#93A09A]">Upload a cropped QR code image. Leave empty to keep the existing QR code.</p>
                  <button type="submit" className="w-full rounded-full bg-[#F4B860] py-2.5 text-xs font-semibold text-[#111714] hover:bg-[#e0a44b] transition-colors">Save {coin.label} Wallet</button>
                </form>
              );
            })}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-base font-semibold">Deposit Records</h2>
              <p className="text-xs text-[#7F8C86] mt-1">Review pending proofs or audit completed and rejected deposits.</p>
            </div>
            <div className="flex rounded-full border border-[#2B393F] bg-[#151E23] p-1">
              {(['pending', 'history'] as const).map(tab => (
                <button key={tab} type="button" onClick={() => setView(tab)} className={`rounded-full px-4 py-2 text-xs font-semibold capitalize transition-colors ${view === tab ? 'bg-[#22C55E] text-[#07110B]' : 'text-[#93A09A] hover:text-white'}`}>{tab}</button>
              ))}
            </div>
          </div>
          {loading ? (
            <SkeletonRows rows={3} />
          ) : visibleDeposits.length === 0 ? (
            <EmptyState
              title={view === 'pending' ? 'No pending deposits' : 'No deposit history'}
              hint="New proof-of-payment submissions will appear here for review."
              icon="solar:wallet-bold"
            />
          ) : (
            <div className="space-y-4">
              {visibleDeposits.map(deposit => (
                <article key={deposit.id} className="rounded-2xl border border-[#2B393F] bg-[#151E23] p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">{deposit.investorName ?? 'Unnamed investor'}</p>
                      <p className="text-[10px] text-[#7F8C86]">{deposit.investorEmail ?? deposit.investorId}</p>
                      <p className="mt-3 text-2xl font-mono text-[#22C55E]">{formatCents(deposit.amountCents)}</p>
                      <p className="text-[10px] text-[#93A09A] mt-1">Method: <span className="uppercase font-semibold">{deposit.method}</span> · Submitted: {formatDate(deposit.createdAt)}</p>
                      <p className="text-[10px] text-[#93A09A] mt-1">Status: <span className="capitalize">{deposit.status}</span>{deposit.reviewedBy ? ` · Reviewed by ${deposit.reviewedBy}` : ''}</p>
                      {deposit.reviewNote && <p className="mt-2 text-xs text-[#A8B6AD]">Note: {deposit.reviewNote}</p>}
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      {deposit.proofUrl && <a href={deposit.proofUrl} target="_blank" rel="noreferrer" className="rounded-xl border border-[#2B393F] px-3 py-2 text-xs text-[#A8B6AD] hover:bg-[#0D1215]">View proof</a>}
                      {deposit.status === 'pending' && (
                        <>
                          <button type="button" onClick={() => void review(deposit.id, 'approve')} className="rounded-full bg-[#22C55E] px-4 py-2 text-xs font-semibold text-[#07110B] hover:bg-[#86EFAC]">Approve</button>
                          <button type="button" onClick={() => void review(deposit.id, 'reject')} className="rounded-full border border-rose-400/40 px-4 py-2 text-xs text-rose-300 hover:bg-rose-500/10">Reject</button>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}