'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import { useQuantovestStore } from '@/lib/store';
import { Icon } from '@iconify/react';

export default function AdminWithdrawalsPage() {
  const { withdrawals, approveWithdrawal } = useQuantovestStore();

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#0A0D0C] flex flex-col md:flex-row font-sans">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-8 space-y-8 overflow-y-auto pb-24 md:pb-8">
        <div className="border-b border-[#DEE1E6] pb-6 space-y-1">
          <h1 className="text-2xl font-normal text-[#0A0D0C]">Withdrawal Approval Queue</h1>
          <p className="text-xs text-[#5B616E]">Review and process pending client withdrawal payouts.</p>
        </div>

        <div className="space-y-4">
          {withdrawals.map((wth) => (
            <div key={wth.id} className="p-6 rounded-2xl bg-white border border-[#DEE1E6] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[#0A0D0C]">{wth.userName}</p>
                <p className="text-2xl font-mono font-semibold text-[#0A0D0C]">${wth.amount.toLocaleString()}</p>
                <p className="text-xs text-[#5B616E] font-mono">Destination: {wth.destination}</p>
                <p className="text-[10px] text-[#5B616E] font-mono">{wth.createdAt}</p>
              </div>

              <div className="flex items-center gap-3">
                {wth.status === 'pending' ? (
                  <button
                    onClick={() => approveWithdrawal(wth.id)}
                    className="px-6 py-2.5 rounded-full text-xs font-semibold bg-[#22C55E] text-[#0A0D0C] hover:bg-[#16A34A] transition-colors shadow-md flex items-center gap-1.5"
                  >
                    <Icon icon="solar:check-circle-bold" className="w-4 h-4" />
                    Approve & Process Payout
                  </button>
                ) : (
                  <span className="px-4 py-1.5 rounded-full bg-[#22C55E]/10 text-[#22C55E] font-mono text-xs font-semibold">
                    PAYOUT SENT
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
