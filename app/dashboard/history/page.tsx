'use client';

import React, { useState, useEffect } from 'react';
import InvestorSidebar from '@/components/InvestorSidebar';
import FilterBar from '@/components/history/FilterBar';
import TransactionRow from '@/components/history/TransactionRow';
import ExportButton from '@/components/history/ExportButton';
import { Icon } from '@iconify/react';

interface LedgerEntry {
  id: string;
  investorId: string;
  type: string;
  amountCents: number;
  referenceId: string | null;
  description: string | null;
  createdAt: string;
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (typeFilter) params.set('type', typeFilter);
        const res = await fetch(`/api/history?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setEntries(data);
        }
      } catch { /* ignore */ }
      setLoading(false);
    }
    void load();
  }, [typeFilter]);

  const filtered = entries.filter(e => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (e.description?.toLowerCase().includes(q) || e.type.includes(q) || e.referenceId?.toLowerCase().includes(q));
  });

  return (
    <div className="min-h-screen bg-[#0A0F11] text-[#F3F7F4] flex flex-col md:flex-row font-sans">
      <InvestorSidebar />
      <main className="flex-1 p-4 sm:p-8 space-y-6 overflow-y-auto pb-24 md:pb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#263437] pb-6">
          <div>
            <h1 className="text-2xl font-normal">Transaction History</h1>
            <p className="text-xs text-[#93A09A]">View all deposits, ROI credits, withdrawals, and adjustments.</p>
          </div>
          <ExportButton typeFilter={typeFilter} />
        </div>

        <FilterBar
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-[#141C1F] border border-[#263437] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Icon icon="solar:document-text-bold" className="w-12 h-12 text-[#263437] mx-auto mb-3" />
            <p className="text-xs text-[#93A09A]">No transactions found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(entry => (
              <TransactionRow
                key={entry.id}
                id={entry.id}
                type={entry.type}
                amountCents={entry.amountCents}
                description={entry.description}
                createdAt={entry.createdAt}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
