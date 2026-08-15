'use client';

import React, { useState } from 'react';
import InvestorSidebar from '@/components/InvestorSidebar';
import { useQuantovestStore, DepositRequest } from '@/lib/store';
import { Icon } from '@iconify/react';

export default function DepositPage() {
  const { submitDeposit, traders } = useQuantovestStore();
  const [method, setMethod] = useState<DepositRequest['method']>('Bitcoin (BTC)');
  const [amount, setAmount] = useState<number>(500);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showWire, setShowWire] = useState(false);

  const walletDetails = {
    'Bitcoin (BTC)': { title: 'Bitcoin Network', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', icon: 'cryptocurrency-color:btc' },
    'Ethereum (ETH)': { title: 'Ethereum Network', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', icon: 'cryptocurrency-color:eth' },
    'USDT (TRC20)': { title: 'Tron Network', address: 'TN2Yi7enMk2EfLPAgHoWvGFQTvmQjR9eYH', icon: 'cryptocurrency-color:usdt' },
    'Bank Wire Transfer': { title: 'Institutional Wire Account', address: 'Quantovest Capital LLC — JP Morgan Chase (Routing: 021000021, Acct: 9482019482)', icon: 'solar:bank-bold' },
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(walletDetails[method as keyof typeof walletDetails].address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitDeposit(amount, method, proofUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80');
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#0A0F11] text-[#F3F7F4] flex flex-col md:flex-row font-sans">
      <InvestorSidebar />

      <main className="flex-1 p-4 sm:p-8 space-y-8 overflow-y-auto pb-24 md:pb-8">
        <div className="border-b border-[#263437] pb-6 space-y-1">
          <h1 className="text-2xl font-normal text-[#F3F7F4]">Deposit Capital</h1>
          <p className="text-xs text-[#93A09A]">Fund your investor account to activate managed investment ($500 min).</p>
        </div>

        {submitted ? (
          <div className="p-8 bg-[#141C1F] border border-[#263437] rounded-2xl max-w-xl mx-auto text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#0A0F11] text-[#22C55E] border border-[#263437] flex items-center justify-center mx-auto animate-bounce">
              <Icon icon="solar:check-read-bold" className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-normal text-[#F3F7F4]">Deposit Proof Submitted!</h3>
            <p className="text-xs text-[#93A09A] max-w-md mx-auto">
              Your deposit request for <strong>${amount.toLocaleString()}</strong> ({method}) has been sent to the Admin queue for review. Once verified, your balance will update.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="px-6 py-2.5 rounded-full text-xs font-semibold bg-[#22C55E] text-[#F3F7F4] hover:bg-[#16A34A]"
            >
              Make Another Deposit
            </button>
          </div>
        ) : (
          <div className="max-w-2xl bg-[#141C1F] border border-[#263437] rounded-2xl p-6 sm:p-8 space-y-6">
            {/* Method Tabs */}
            <div className="space-y-2">
              <label className="text-xs text-[#93A09A]">1. Select Cryptocurrency</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(['Bitcoin (BTC)', 'Ethereum (ETH)', 'USDT (TRC20)'] as const).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setMethod(m); setShowWire(false); }}
                    className={`py-4 px-3 rounded-xl text-sm font-medium border text-center transition-all flex flex-col items-center gap-2 ${
                      method === m
                        ? 'border-[#22C55E] bg-[#22C55E]/10 text-[#F3F7F4] font-semibold'
                        : 'border-[#263437] bg-[#0A0F11] text-[#93A09A] hover:text-[#F3F7F4]'
                    }`}
                  >
                    <Icon icon={walletDetails[m].icon} className="w-8 h-8" />
                    <span>{m.split(' ')[0]}</span>
                    <span className="text-[10px] opacity-70">{m.includes('(') ? m.slice(m.indexOf('(')) : ''}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Wire Transfer Toggle */}
            <div className="border-t border-[#263437] pt-4">
              <button 
                type="button" 
                onClick={() => {
                  setShowWire(!showWire);
                  if (!showWire) {
                    setMethod('Bank Wire Transfer');
                  } else {
                    setMethod('Bitcoin (BTC)');
                  }
                }}
                className="text-xs text-[#93A09A] flex items-center gap-2 hover:text-[#F3F7F4] transition-colors"
              >
                <Icon icon={showWire ? "solar:alt-arrow-up-bold" : "solar:alt-arrow-down-bold"} />
                Show Alternative Methods (Bank Wire Transfer)
              </button>
              
              {showWire && (
                <div className="mt-3">
                   <button
                    type="button"
                    onClick={() => setMethod('Bank Wire Transfer')}
                    className={`w-full py-4 px-3 rounded-xl text-sm font-medium border text-center transition-all flex items-center justify-center gap-3 ${
                      method === 'Bank Wire Transfer'
                        ? 'border-[#22C55E] bg-[#22C55E]/10 text-[#F3F7F4] font-semibold'
                        : 'border-[#263437] bg-[#0A0F11] text-[#93A09A] hover:text-[#F3F7F4]'
                    }`}
                  >
                    <Icon icon={walletDetails['Bank Wire Transfer'].icon} className="w-6 h-6" />
                    Bank Wire Transfer
                  </button>
                </div>
              )}
            </div>

            {/* Address Box */}
            <div className="p-4 bg-[#0A0F11] border border-[#263437] rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#93A09A] font-mono">{walletDetails[method as keyof typeof walletDetails].title}</span>
                <button onClick={handleCopy} className="text-[#22C55E] font-mono text-[11px] flex items-center gap-1 hover:underline">
                  <Icon icon={copied ? 'solar:check-circle-bold' : 'solar:copy-bold'} />
                  {copied ? 'Copied!' : 'Copy Address'}
                </button>
              </div>
              <p className="font-mono text-xs text-[#F3F7F4] bg-[#0A0F11] p-3 rounded-lg border border-[#263437] break-all select-all">
                {walletDetails[method as keyof typeof walletDetails].address}
              </p>
            </div>

            {/* Deposit Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-[#93A09A] block mb-1.5">2. Enter Deposit Amount ($ USD)</label>
                <input
                  type="number"
                  min="500"
                  required
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  className="w-full bg-[#0A0F11] border border-[#263437] rounded-xl px-4 py-2.5 text-xs text-[#F3F7F4] font-mono placeholder-[#5B616E] focus:outline-none focus:border-[#22C55E]"
                />
              </div>

              {/* Assign Portfolio Manager */}
              <div>
                <label className="text-xs text-[#93A09A] block mb-1.5">3. Assign Strategy Portfolio Manager</label>
                <select
                  className="w-full bg-[#0A0F11] border border-[#263437] rounded-xl px-4 py-2.5 text-xs text-[#F3F7F4] focus:outline-none focus:border-[#22C55E] cursor-pointer"
                  required
                >
                  {traders.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.specialty} — Win Rate: {t.winRate}%)
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Proof Upload */}
              <div>
                <label className="text-xs text-[#93A09A] block mb-1.5">4. Upload Payment Screenshot Proof</label>
                <div
                  onClick={() => setProofUrl('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80')}
                  className={`p-4 rounded-xl border border-dashed text-center cursor-pointer transition-all ${
                    proofUrl ? 'border-[#22C55E] bg-[#22C55E]/10' : 'border-[#263437] bg-[#0A0F11] hover:border-[#22C55E]/50'
                  }`}
                >
                  <Icon icon="solar:upload-track-bold" className="w-6 h-6 mx-auto mb-1 text-[#22C55E]" />
                  <p className="text-xs text-[#F3F7F4] font-medium">
                    {proofUrl ? 'Payment Screenshot Attached' : 'Click to Upload Deposit Confirmation Screenshot'}
                  </p>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-[#22C55E] text-[#F3F7F4] font-semibold text-xs hover:bg-[#16A34A] transition-colors shadow-lg mt-2"
              >
                Confirm Payment Deposited
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
