'use client';

import { useEffect, useState } from 'react';
import InvestorSidebar from '@/components/InvestorSidebar';
import { Icon } from '@iconify/react';

type Instruction = {
  id: number;
  method: string;
  label: string;
  details: string;
  qrPath: string | null;
};

type Deposit = {
  id: string;
  amountCents: number;
  method: string;
  status: string;
  proofPath: string | null;
  createdAt: string;
};

const CRYPTO_COINS = [
  { value: 'usdt-trc20', label: 'USDT (TRC-20)', icon: 'cryptocurrency:usdt' },
  { value: 'usdt-erc20', label: 'USDT (ERC-20)', icon: 'cryptocurrency:usdt' },
  { value: 'btc', label: 'Bitcoin (BTC)', icon: 'cryptocurrency:btc' },
  { value: 'eth', label: 'Ethereum (ETH)', icon: 'cryptocurrency:eth' },
] as const;

export default function DepositPage() {
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [method, setMethod] = useState<string>('usdt-trc20');
  const [amount, setAmount] = useState(1500);
  const [proof, setProof] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    const [instructionRes, depositRes] = await Promise.all([
      fetch('/api/deposit-instructions', { cache: 'no-store' }),
      fetch('/api/deposits', { cache: 'no-store' }),
    ]);
    if (instructionRes.ok) setInstructions(await instructionRes.json());
    if (depositRes.ok) setDeposits(await depositRes.json());
  }

  useEffect(() => {
    void load();
  }, []);

  const activeInstruction = instructions.find(item => item.method === method) ?? null;

  async function copyAddress() {
    if (activeInstruction) {
      await navigator.clipboard.writeText(activeInstruction.details);
      setMessage('Address copied to clipboard.');
      setTimeout(() => setMessage(''), 3000);
    }
  }

  async function submitDeposit(event: React.FormEvent) {
    event.preventDefault();
    setMessage('');
    if (!proof) {
      setMessage('Please upload the transaction confirmation screenshot before submitting.');
      return;
    }
    setLoading(true);

    try {
      const form = new FormData();
      form.append('file', proof);
      form.append('purpose', 'deposit-proof');

      const upload = await fetch('/api/uploads', { method: 'POST', body: form });
      const uploadData = await upload.json().catch(() => ({}));
      if (!upload.ok) {
        setMessage(uploadData.error ?? 'Proof image upload failed.');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountCents: Math.round(amount * 100),
          method,
          proofPath: uploadData.path,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(data.error ?? 'Deposit submission failed.');
        setLoading(false);
        return;
      }

      setSubmitted(true);
      setProof(null);
      await load();
    } catch {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0F11] text-[#F3F7F4] flex flex-col md:flex-row font-sans">
      <InvestorSidebar />
      <main className="flex-1 p-4 sm:p-8 space-y-8 overflow-y-auto pb-24 md:pb-8">
        <div className="border-b border-[#263437] pb-6 space-y-1">
          <h1 className="text-2xl font-normal">Deposit Funds</h1>
          <p className="text-xs text-[#93A09A]">
            Select a cryptocurrency, transfer the funds to the wallet address below, and upload proof of payment.
          </p>
        </div>

        {message && (
          <div role="alert" className="rounded-xl border border-amber-400/40 bg-amber-400/10 p-4 text-xs text-amber-100 animate-in fade-in duration-200">
            {message}
          </div>
        )}

        {submitted ? (
          <div className="max-w-xl rounded-2xl border border-[#263437] bg-[#141C1F] p-6 sm:p-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="mx-auto h-12 w-12 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/30 flex items-center justify-center text-[#22C55E]">
              <Icon icon="solar:check-read-bold" className="h-6 w-6" />
            </div>
            <h2 className="text-xl">Deposit Proof Submitted</h2>
            <p className="text-xs text-[#93A09A] max-w-sm mx-auto leading-relaxed">
              Our accounts team will review and verify the screenshot. Your portfolio balance will update once approved.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="rounded-full bg-[#22C55E] px-6 py-3 text-xs font-semibold text-[#07110B] hover:bg-[#16A34A] transition-colors"
            >
              Make another deposit
            </button>
          </div>
        ) : (
          <div className="grid max-w-4xl grid-cols-1 gap-8 lg:grid-cols-2">
            <section className="rounded-2xl border border-[#263437] bg-[#141C1F] p-6 sm:p-8 space-y-6">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#93A09A]">Select Cryptocurrency</p>
                <div className="grid grid-cols-2 gap-2">
                  {CRYPTO_COINS.map(coin => (
                    <button
                      key={coin.value}
                      onClick={() => setMethod(coin.value)}
                      className={`flex items-center gap-2 rounded-xl border p-3.5 text-xs transition-all ${
                        method === coin.value
                          ? 'border-[#22C55E] bg-[#22C55E]/10 text-white font-semibold'
                          : 'border-[#263437] bg-[#0A0F11] text-[#93A09A] hover:text-white'
                      }`}
                    >
                      <Icon icon={coin.icon} className="w-5 h-5 text-[#22C55E]" />
                      <span>{coin.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {activeInstruction ? (
                <div className="rounded-xl border border-[#263437] bg-[#0A0F11] p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-[#22C55E] uppercase tracking-wider font-mono font-semibold">
                        {activeInstruction.label}
                      </p>
                      <p className="text-xs text-[#93A09A] mt-0.5">Transfer address:</p>
                    </div>
                    <button
                      onClick={() => void copyAddress()}
                      className="text-xs font-semibold text-[#22C55E] hover:underline flex items-center gap-1"
                    >
                      <Icon icon="solar:copy-bold" className="w-3.5 h-3.5" />
                      Copy
                    </button>
                  </div>
                  <p className="select-all break-all font-mono text-xs text-white bg-[#141C1F] p-3 rounded-lg border border-[#263437]">
                    {activeInstruction.details}
                  </p>
                  {activeInstruction.qrPath && (
                    <div className="flex flex-col items-center justify-center border-t border-[#263437]/60 pt-4">
                      <p className="text-[10px] text-[#93A09A] mb-2 font-mono">Scan QR Code to pay:</p>
                      <img
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/quantovest-media/${activeInstruction.qrPath}`}
                        alt="Deposit QR code"
                        className="h-36 w-36 rounded-lg bg-white p-2 object-contain shadow-lg"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-[#263437] p-8 text-center text-xs text-[#93A09A] flex flex-col items-center justify-center gap-2">
                  <Icon icon="solar:shield-warning-bold" className="w-8 h-8 text-amber-500" />
                  <p>Payment address for this option is currently being updated. Please choose another crypto method or check back in a few minutes.</p>
                </div>
              )}

              <form onSubmit={submitDeposit} className="space-y-4 pt-2">
                <label className="block text-xs text-[#93A09A]">
                  Deposit Amount ($ USD)
                  <input
                    required
                    min="1500"
                    type="number"
                    value={amount}
                    onChange={event => setAmount(Number(event.target.value))}
                    className="mt-1.5 w-full rounded-xl border border-[#263437] bg-[#0A0F11] px-4 py-3 text-sm text-white focus:outline-none focus:border-[#22C55E]"
                  />
                </label>

                <label className="block text-xs text-[#93A09A]">
                  Upload Transaction Screenshot / Proof
                  <input
                    required
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={event => setProof(event.target.files?.[0] ?? null)}
                    className="mt-1.5 w-full text-xs text-[#93A09A] file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#22C55E]/10 file:text-[#22C55E] hover:file:bg-[#22C55E]/20"
                  />
                </label>

                <button
                  disabled={!activeInstruction || loading}
                  className="w-full rounded-full bg-[#22C55E] py-3.5 text-xs font-semibold text-[#07110B] hover:bg-[#16A34A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Submit Deposit Proof'}
                </button>
              </form>
            </section>

            <section className="rounded-2xl border border-[#263437] bg-[#141C1F] p-6 sm:p-8 flex flex-col">
              <h2 className="text-base font-semibold">Deposit History</h2>
              <div className="mt-4 space-y-3 flex-1 overflow-y-auto max-h-[450px] pr-1">
                {deposits.map(deposit => (
                  <div
                    key={deposit.id}
                    className="flex items-center justify-between rounded-xl border border-[#263437] bg-[#0A0F11] p-4 text-xs"
                  >
                    <div>
                      <p className="font-mono font-semibold text-white">
                        ${(deposit.amountCents / 100).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-[#93A09A] mt-0.5 uppercase tracking-wider font-mono">
                        {deposit.method}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                        deposit.status === 'approved'
                          ? 'bg-[#22C55E]/10 text-[#22C55E]'
                          : deposit.status === 'rejected'
                          ? 'bg-rose-500/10 text-rose-400'
                          : 'bg-amber-500/10 text-amber-300'
                      }`}
                    >
                      {deposit.status.toUpperCase()}
                    </span>
                  </div>
                ))}
                {!deposits.length && (
                  <div className="py-12 text-center text-xs text-[#93A09A] space-y-2">
                    <Icon icon="solar:folder-empty-bold" className="w-8 h-8 text-[#263437] mx-auto" />
                    <p>No deposits submitted yet.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
