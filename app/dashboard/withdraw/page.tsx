'use client';

import React, { useState } from 'react';
import InvestorSidebar from '@/components/InvestorSidebar';
import { useQuantovestStore, WithdrawalRequest } from '@/lib/store';
import { Icon } from '@iconify/react';

export default function WithdrawPage() {
  const { user, withdrawals, submitWithdrawal } = useQuantovestStore();
  const [amount, setAmount] = useState<number>(200);
  const [destination, setDestination] = useState('');
  const [method, setMethod] = useState<WithdrawalRequest['method']>('Bank Wire');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount > user.balance) return;
    submitWithdrawal(amount, destination || 'Bank Wire ****9821', method);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#0A0F11] text-[#F3F7F4] flex flex-col md:flex-row font-sans">
      <InvestorSidebar />

      <main className="flex-1 p-4 sm:p-8 space-y-8 overflow-y-auto pb-24 md:pb-8">
        <div className="border-b border-[#263437] pb-6 space-y-1">
          <h1 className="text-2xl font-normal text-[#F3F7F4]">Withdraw Capital</h1>
          <p className="text-xs text-[#93A09A]">Request capital withdrawals directly to your bank account or crypto wallet.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Withdrawal Form */}
          <div className="bg-[#141C1F] border border-[#263437] rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="p-4 bg-[#0A0F11] border border-[#263437] rounded-xl flex justify-between items-center text-xs">
              <span className="text-[#93A09A]">Available Balance:</span>
              <span className="font-mono font-semibold text-[#F3F7F4] text-sm">${user.balance.toLocaleString()}</span>
            </div>

            {submitted ? (
              <div className="py-6 text-center space-y-3">
                <Icon icon="solar:check-circle-bold" className="w-10 h-10 text-[#22C55E] mx-auto" />
                <h3 className="text-base font-normal text-[#F3F7F4]">Withdrawal Request Submitted</h3>
                <p className="text-xs text-[#93A09A]">Your request for ${amount} is pending Admin processing.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2 rounded-full text-xs font-semibold bg-[#22C55E] text-[#F3F7F4]"
                >
                  New Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-[#93A09A] block mb-1">Withdrawal Amount ($)</label>
                  <input
                    type="number"
                    max={user.balance}
                    required
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    className="w-full bg-[#0A0F11] border border-[#263437] rounded-xl px-4 py-2.5 text-xs text-[#F3F7F4] font-mono placeholder-[#5B616E] focus:outline-none focus:border-[#22C55E]"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#93A09A] block mb-1">Payout Destination Details</label>
                  <input
                    type="text"
                    required
                    value={destination}
                    onChange={e => setDestination(e.target.value)}
                    placeholder="Bank Account IBAN or Crypto Wallet Address"
                    className="w-full bg-[#0A0F11] border border-[#263437] rounded-xl px-4 py-2.5 text-xs text-[#F3F7F4] font-mono placeholder-[#5B616E] focus:outline-none focus:border-[#22C55E]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={amount > user.balance}
                  className={`w-full py-3.5 rounded-full text-xs font-semibold ${
                    amount <= user.balance
                      ? 'bg-[#22C55E] text-[#F3F7F4] hover:bg-[#16A34A]'
                      : 'bg-[#202722] text-[#93A09A] cursor-not-allowed'
                  } transition-colors shadow-lg mt-2`}
                >
                  Submit Withdrawal Request
                </button>
              </form>
            )}
          </div>

          {/* Withdrawal History Tracker */}
          <div className="bg-[#141C1F] border border-[#263437] rounded-2xl p-6 sm:p-8 space-y-4">
            <h3 className="text-base font-normal text-[#F3F7F4]">Withdrawal History & Status Tracker</h3>
            <div className="space-y-3">
              {withdrawals.map((w) => (
                <div key={w.id} className="p-4 bg-[#0A0F11] border border-[#263437] rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-[#F3F7F4] font-mono">${w.amount.toLocaleString()}</p>
                    <p className="text-[10px] text-[#93A09A] truncate max-w-[180px]">{w.destination}</p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full font-mono text-[10px] font-semibold ${
                      w.status === 'approved'
                        ? 'bg-[#22C55E]/10 text-[#22C55E]'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {w.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
