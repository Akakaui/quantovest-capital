'use client';

import React, { useEffect, useState } from 'react';

interface OrderBookEntry {
  id: string;
  type: string;
  amountCents: number;
  description: string | null;
  createdAt: string;
}

function formatCents(cents: number): string {
  return '$' + (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 });
}

export default function OrderBook({ investorId }: { investorId?: string }) {
  const [entries, setEntries] = useState<OrderBookEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/history');
        if (res.ok) setEntries(await res.json());
      } catch { /* ignore */ }
      setLoading(false);
    }
    void load();
  }, []);

  if (loading) return (
    <div className="p-6 rounded-2xl bg-[#141C1F] border border-[#263437] space-y-4">
      <div className="h-4 w-32 bg-[#263437] rounded animate-pulse" />
      {[1,2,3].map(i => <div key={i} className="h-12 bg-[#263437] rounded-xl animate-pulse" />)}
    </div>
  );

  return (
    <div className="p-6 rounded-2xl bg-[#141C1F] border border-[#263437] space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-normal text-[#F3F7F4]">Activity / Trade History</h3>
        <span className="text-[10px] font-mono text-[#93A09A]">{entries.length} transactions</span>
      </div>
      {/* Header */}
      <div className="grid grid-cols-3 gap-2 text-[10px] uppercase font-mono text-[#74817B] px-3">
        <span>Type</span>
        <span className="text-right">Amount</span>
        <span className="text-right">Date</span>
      </div>
      {/* Rows */}
      <div className="space-y-1 max-h-[400px] overflow-y-auto">
        {entries.slice(0, 20).map(entry => {
          const isBuy = entry.amountCents >= 0;
          const label = entry.type.includes("referral") ? "REFERRAL"
            : entry.type === "deposit" ? "DEPOSIT"
            : entry.type === "withdrawal" ? "WITHDRAWAL"
            : entry.type === "swap" ? "SWAP"
            : entry.type === "roi" || entry.type === "profit" ? "RETURN"
            : entry.type.toUpperCase();
          return (
            <div key={entry.id} className={`grid grid-cols-3 gap-2 text-xs font-mono px-3 py-2 rounded-lg ${
              isBuy ? 'bg-[#22C55E]/5' : 'bg-[#CF202F]/5'
            }`}>
              <span className={isBuy ? 'text-[#22C55E]' : 'text-[#CF202F]'}>
                {label}
              </span>
              <span className={`text-right ${entry.amountCents >= 0 ? 'text-[#22C55E]' : 'text-[#CF202F]'}`}>
                {entry.amountCents >= 0 ? '+' : ''}{formatCents(entry.amountCents)}
              </span>
              <span className="text-right text-[#93A09A]">
                {new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
              </span>
            </div>
          );
        })}
        {entries.length === 0 && (
          <div className="text-center py-8 text-xs text-[#93A09A]">No transactions yet</div>
        )}
      </div>
    </div>
  );
}
