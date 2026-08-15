'use client';

import React from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { useQuantovestStore } from '@/lib/store';
import { Icon } from '@iconify/react';

export default function AdminDepositsPage() {
  const { deposits, approveDeposit } = useQuantovestStore();

  return (
    <div className="min-h-screen bg-[#0D1215] text-[#E8EFEB] flex flex-col md:flex-row font-sans">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-8 space-y-8 overflow-y-auto pb-24 md:pb-8">
        <div className="border-b border-[#2B393F] pb-6 space-y-1">
          <h1 className="text-2xl font-normal text-[#E8EFEB]">Deposit Approval Queue</h1>
          <p className="text-xs text-[#93A09A]">Review payment screenshot proofs and approve investor deposit funding.</p>
        </div>

        <div className="space-y-4">
          {deposits.map((dep) => (
            <div key={dep.id} className="p-6 rounded-2xl bg-[#151E23] border border-[#2B393F] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#E8EFEB]">{dep.userName}</span>
                  <span className="text-[10px] bg-[#0D1215] border border-[#2B393F] text-[#93A09A] px-2 py-0.5 rounded font-mono">
                    {dep.method}
                  </span>
                </div>
                <p className="text-2xl font-mono font-semibold text-[#22C55E]">${dep.amount.toLocaleString()}</p>
                <p className="text-[10px] text-[#93A09A] font-mono">{dep.createdAt}</p>
              </div>

              {/* Screenshot Proof Preview */}
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-[10px] text-[#93A09A] mb-1">Payment Proof</p>
                  <a
                    href={dep.proofScreenshotUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-24 h-16 rounded-xl overflow-hidden border border-[#2B393F] block hover:border-[#22C55E] transition-colors relative group"
                  >
                    <img src={dep.proofScreenshotUrl} alt="Deposit Proof" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Icon icon="solar:eye-bold" className="w-5 h-5 text-[#E8EFEB]" />
                    </div>
                  </a>
                </div>

                <div className="flex flex-col gap-2">
                  {dep.status === 'pending' ? (
                    <button
                      onClick={() => approveDeposit(dep.id)}
                      className="px-6 py-2.5 rounded-full text-xs font-semibold bg-[#22C55E] text-[#E8EFEB] hover:bg-[#16A34A] transition-colors shadow-md flex items-center gap-1.5"
                    >
                      <Icon icon="solar:check-circle-bold" className="w-4 h-4" />
                      Approve Deposit
                    </button>
                  ) : (
                    <span className="px-4 py-1.5 rounded-full bg-[#22C55E]/10 text-[#22C55E] font-mono text-xs font-semibold text-center">
                      APPROVED & CREDITED
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
