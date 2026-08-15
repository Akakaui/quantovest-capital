'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { useQuantovestStore } from '@/lib/store';
import { Icon } from '@iconify/react';

export default function KycPage() {
  const { user, submitKyc } = useQuantovestStore();
  const [idDoc, setIdDoc] = useState<string | null>(null);
  const [proofAddress, setProofAddress] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idDoc || !proofAddress) return;
    submitKyc(idDoc, proofAddress);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#0A0D0C] flex flex-col md:flex-row font-sans">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-8 space-y-8 overflow-y-auto pb-24 md:pb-8">
        <div className="border-b border-[#DEE1E6] pb-6 space-y-1">
          <h1 className="text-2xl font-normal text-[#0A0D0C]">Identity Verification (KYC)</h1>
          <p className="text-xs text-[#5B616E]">Minimal 2-document verification to unlock institutional investment access.</p>
        </div>

        <div className="max-w-2xl bg-white border border-[#DEE1E6] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between p-4 bg-[#F7F7F7] border border-[#DEE1E6] rounded-xl text-xs">
            <span className="text-[#5B616E]">Current Verification Status:</span>
            <span
              className={`px-3 py-1 rounded-full font-mono text-xs font-semibold ${
                user.kycStatus === 'approved'
                  ? 'bg-[#22C55E]/10 text-[#22C55E]'
                  : user.kycStatus === 'pending'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              {user.kycStatus.toUpperCase()}
            </span>
          </div>

          {submitted || user.kycStatus === 'approved' ? (
            <div className="py-8 text-center space-y-3">
              <Icon icon="solar:shield-check-bold" className="w-12 h-12 text-[#22C55E] mx-auto" />
              <h3 className="text-lg font-normal text-[#0A0D0C]">
                {user.kycStatus === 'approved' ? 'Identity Verified' : 'Documents Submitted for Review'}
              </h3>
              <p className="text-xs text-[#5B616E] max-w-md mx-auto">
                {user.kycStatus === 'approved'
                  ? 'Your account is fully verified. All deposit and investment features are active.'
                  : 'Your ID Document and Proof of Address are being reviewed by the admin queue.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Document 1 */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#0A0D0C] flex justify-between">
                  <span>1. Passport / Government ID / Driver's License</span>
                  {idDoc && <span className="text-[#22C55E] text-[10px] font-mono">Uploaded</span>}
                </label>
                <div
                  onClick={() => setIdDoc('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80')}
                  className={`p-5 rounded-xl border border-dashed text-center cursor-pointer transition-all ${
                    idDoc ? 'border-[#22C55E] bg-[#22C55E]/10' : 'border-[#DEE1E6] bg-[#F7F7F7] hover:border-[#22C55E]/50'
                  }`}
                >
                  <Icon icon="solar:document-bold" className="w-7 h-7 text-[#22C55E] mx-auto mb-1" />
                  <p className="text-xs text-[#0A0D0C] font-medium">{idDoc ? 'ID Document Uploaded' : 'Click to Upload ID File'}</p>
                </div>
              </div>

              {/* Document 2 */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#0A0D0C] flex justify-between">
                  <span>2. Proof of Address (Utility Bill / Bank Statement)</span>
                  {proofAddress && <span className="text-[#22C55E] text-[10px] font-mono">Uploaded</span>}
                </label>
                <div
                  onClick={() => setProofAddress('https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=600&auto=format&fit=crop&q=80')}
                  className={`p-5 rounded-xl border border-dashed text-center cursor-pointer transition-all ${
                    proofAddress ? 'border-[#22C55E] bg-[#22C55E]/10' : 'border-[#DEE1E6] bg-[#F7F7F7] hover:border-[#22C55E]/50'
                  }`}
                >
                  <Icon icon="solar:home-bold" className="w-7 h-7 text-[#22C55E] mx-auto mb-1" />
                  <p className="text-xs text-[#0A0D0C] font-medium">{proofAddress ? 'Proof of Address Uploaded' : 'Click to Upload Proof of Address'}</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={!idDoc || !proofAddress}
                className={`w-full py-3.5 rounded-full text-xs font-semibold ${
                  idDoc && proofAddress
                    ? 'bg-[#22C55E] text-[#0A0D0C] hover:bg-[#16A34A]'
                    : 'bg-[#202722] text-[#5B616E] cursor-not-allowed'
                } transition-colors shadow-lg`}
              >
                Submit 2-Document KYC Verification
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
