'use client';

import React, { useEffect, useState } from 'react';
import InvestorSidebar from '@/components/InvestorSidebar';
import { useQuantovestStore, PLAN_MINIMUMS } from '@/lib/store';
import { verifyTOTP } from '@/lib/totp';
import { Icon } from '@iconify/react';
import Link from 'next/link';

type Withdrawal = { id: number; amountCents: number; destination: string; destinationType: string; status: string };

export default function WithdrawPage() {
  const { user, closeAccount } = useQuantovestStore();
  const [amount, setAmount] = useState(500);
  const [destinationType, setDestinationType] = useState<'bank' | 'crypto'>('bank');
  const [closeAccountMode, setCloseAccountMode] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const planMinimum = PLAN_MINIMUMS[user.plan] ?? 0;
  const minBalanceForPlan = planMinimum;

  async function load() {
    const response = await fetch('/api/withdrawals', { cache: 'no-store' });
    if (response.ok) setWithdrawals(await response.json());
    else setMessage('Unable to load withdrawal history.');
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  useEffect(() => {
    if (closeAccountMode) {
      setAmount(user.balance);
    }
  }, [closeAccountMode, user.balance]);

  function getPayoutDestination(): string {
    if (destinationType === 'crypto') {
      return user.payoutDetails.cryptoAddress || '';
    }
    const { bankName, bankAccountName, bankAccountNumber } = user.payoutDetails;
    if (bankName && bankAccountNumber) return `${bankName} ****${bankAccountNumber.slice(-4)}`;
    return '';
  }

  const remainingBalance = user.balance - amount;
  const wouldDropBelowMin = !closeAccountMode && remainingBalance < minBalanceForPlan && remainingBalance > 0;
  const hasPayoutDetails = destinationType === 'crypto' ? !!user.payoutDetails.cryptoAddress : (!!user.payoutDetails.bankName && !!user.payoutDetails.bankAccountNumber);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (user.twoFactorEnabled && !verifyTOTP(user.twoFactorSecret, otpCode)) {
      setMessage('Invalid 2FA code. Please check your authenticator app.');
      return;
    }
    setSubmitting(true); setMessage('');

    const destination = getPayoutDestination();
    if (!destination) {
      setMessage('No payout details found. Please save payout details in Settings first.');
      setSubmitting(false);
      return;
    }

    if (closeAccountMode) {
      closeAccount();
    }

    const response = await fetch('/api/withdrawals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amountCents: Math.round(amount * 100), destinationType, destination })
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok) {
      setSubmitted(true);
      setOtpCode('');
      await load();
    } else setMessage(data.error ?? 'Withdrawal request failed.');
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-[#0A0F11] text-[#F3F7F4] flex flex-col md:flex-row font-sans">
      <InvestorSidebar />
      <main className="flex-1 p-4 sm:p-8 space-y-8 overflow-y-auto pb-24 md:pb-8">
        <div className="border-b border-[#263437] pb-6 space-y-1">
          <h1 className="text-2xl font-normal">Withdraw Capital</h1>
          <p className="text-xs text-[#93A09A]">Request capital withdrawals directly to your saved bank account or crypto wallet.</p>
        </div>

        {message && (
          <div role="alert" className="rounded-xl border border-rose-400/40 bg-rose-400/10 p-4 text-xs text-rose-200">{message}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[#141C1F] border border-[#263437] rounded-2xl p-6 sm:p-8 space-y-6">
            {submitted ? (
              <div className="py-6 text-center space-y-3">
                <Icon icon="solar:check-circle-bold" className="w-10 h-10 text-[#22C55E] mx-auto" />
                <h3 className="text-base">Withdrawal Request Submitted</h3>
                <p className="text-xs text-[#93A09A]">Your request for ${amount.toLocaleString()} is pending Admin processing.</p>
                <button onClick={() => setSubmitted(false)} className="px-5 py-2 rounded-full text-xs font-semibold bg-[#22C55E] text-[#07110B]">New Request</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="rounded-xl border border-[#263437] bg-[#0A0F11] p-4 text-xs text-[#93A09A]">
                  Available balance: <strong className="text-white">${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
                  {user.plan !== 'None' && (
                    <span className="ml-2 text-[#22C55E]">({user.plan} plan — min ${minBalanceForPlan.toLocaleString()})</span>
                  )}
                </div>

                {/* Close Account Toggle */}
                <label className="flex items-center gap-3 p-4 bg-[#0A0F11] border border-[#263437] rounded-xl cursor-pointer hover:border-rose-500/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={closeAccountMode}
                    onChange={e => { setCloseAccountMode(e.target.checked); setMessage(''); }}
                    className="w-4 h-4 accent-rose-500 rounded"
                  />
                  <div>
                    <p className="text-xs font-semibold text-[#F3F7F4]">Close Account &amp; Withdraw Entire Balance</p>
                    <p className="text-[10px] text-[#93A09A]">Withdraw everything and close your account. This action cannot be undone.</p>
                  </div>
                </label>

                {/* Amount Input */}
                <label className="text-xs text-[#93A09A] block">
                  Withdrawal Amount ($)
                  <input
                    type="number"
                    min={closeAccountMode ? 0 : 500}
                    step="0.01"
                    required
                    value={amount}
                    disabled={closeAccountMode}
                    onChange={event => setAmount(Number(event.target.value))}
                    className="mt-1 w-full bg-[#0A0F11] border border-[#263437] rounded-xl px-4 py-2.5 text-xs text-white font-mono disabled:opacity-50"
                  />
                </label>

                {/* Below-minimum Warning */}
                {wouldDropBelowMin && (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-[10px] text-amber-300">
                    <Icon icon="solar:warning-bold" className="w-4 h-4 inline mr-1" />
                    This withdrawal would drop your balance below the {user.plan} plan minimum of ${minBalanceForPlan.toLocaleString()}. Your plan may be downgraded.
                  </div>
                )}

                {/* Payout Rail */}
                <label className="text-xs text-[#93A09A] block">
                  Payout rail
                  <select
                    value={destinationType}
                    onChange={event => setDestinationType(event.target.value as 'bank' | 'crypto')}
                    className="mt-1 w-full bg-[#0A0F11] border border-[#263437] rounded-xl px-4 py-3 text-xs text-white"
                  >
                    <option value="bank">Bank Transfer</option>
                    <option value="crypto">Crypto Wallet</option>
                  </select>
                </label>

                {/* Payout Destination Preview */}
                {hasPayoutDetails ? (
                  <div className="rounded-xl border border-[#22C55E]/20 bg-[#22C55E]/5 p-3 text-[10px] text-[#86EFAC]">
                    <Icon icon="solar:check-circle-bold" className="w-4 h-4 inline mr-1" />
                    {destinationType === 'crypto' ? 'Crypto wallet' : 'Bank'} details loaded from Settings: <strong>{getPayoutDestination()}</strong>
                  </div>
                ) : (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-[10px] text-amber-300">
                    <Icon icon="solar:warning-bold" className="w-4 h-4 inline mr-1" />
                    No {destinationType} payout details saved. Please add them in <Link href="/dashboard/settings" className="underline font-semibold">Settings</Link> first.
                  </div>
                )}

                {/* 2FA Challenge */}
                {user.twoFactorEnabled && (
                  <div className="rounded-xl border border-[#22C55E]/30 bg-[#22C55E]/5 p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon icon="solar:shield-check-bold" className="w-4 h-4 text-[#22C55E]" />
                      <p className="text-xs font-semibold text-[#22C55E]">Two-Factor Verification Required</p>
                    </div>
                    <p className="text-[10px] text-[#93A09A]">Enter the 6-digit code from your authenticator app.</p>
                    <input
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value)}
                      maxLength={6}
                      placeholder="000000"
                      className="w-full rounded-xl border border-[#263437] bg-[#0A0F11] px-4 py-3 text-sm text-white font-mono text-center tracking-[0.3em]"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || amount <= 0 || !hasPayoutDetails || (user.twoFactorEnabled && otpCode.length !== 6)}
                  className="w-full rounded-full bg-[#22C55E] px-5 py-3 text-xs font-semibold text-[#07110B] disabled:opacity-40"
                >
                  {submitting ? 'Submitting…' : closeAccountMode ? 'Close Account & Withdraw' : 'Submit Withdrawal'}
                </button>
              </form>
            )}
          </div>

          {/* Withdrawal History */}
          <div className="bg-[#141C1F] border border-[#263437] rounded-2xl p-6 sm:p-8 space-y-4">
            <h4 className="text-sm font-semibold">Withdrawal History</h4>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-[#0A0F11] border border-[#263437] rounded-xl animate-pulse" />)}
              </div>
            ) : withdrawals.length === 0 ? (
              <div className="py-8 text-center">
                <Icon icon="solar:document-text-bold" className="w-8 h-8 text-[#263437] mx-auto mb-2" />
                <p className="text-xs text-[#93A09A]">No withdrawal requests yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {withdrawals.map(w => (
                  <div key={w.id} className="p-4 bg-[#0A0F11] border border-[#263437] rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-[#F3F7F4]">${(w.amountCents / 100).toLocaleString()}</p>
                      <p className="text-[10px] text-[#93A09A]">{w.destinationType === 'crypto' ? 'Crypto' : 'Bank'} → {w.destination}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                      w.status === 'approved' ? 'bg-[#22C55E]/10 text-[#22C55E]' :
                      w.status === 'rejected' ? 'bg-rose-500/10 text-rose-400' :
                      'bg-amber-500/10 text-amber-400'
                    }`}>
                      {w.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
