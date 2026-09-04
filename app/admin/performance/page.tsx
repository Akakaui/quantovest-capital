'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import EmptyState from '@/components/admin/EmptyState';
import SkeletonRows from '@/components/admin/SkeletonRows';
import { Icon } from '@iconify/react';

type Investor = { id: string; name: string | null; email: string | null; planName: string | null; balanceCents: number | null; planId: number | null };

function formatCents(cents: number | null | undefined) {
  return `$${((cents ?? 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function AdminPerformanceHomePage() {
  const router = useRouter();
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch('/api/admin/investors', { cache: 'no-store' });
        if (response.ok) setInvestors(await response.json());
        else setMessage('Unable to load investors.');
      } catch {
        setMessage('Unable to load investors.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[#0D1215] text-[#E8EFEB] flex flex-col md:flex-row font-sans">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-8 space-y-8 overflow-y-auto pb-24 md:pb-8">
        <div className="border-b border-[#2B393F] pb-6 space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#22C55E] font-mono"><span className="w-2 h-2 rounded-full bg-[#22C55E]" /> PERFORMANCE OPERATIONS</div>
          <h1 className="text-2xl font-normal">Daily ROI Entry</h1>
          <p className="text-xs text-[#93A09A]">Select an investor to enter an exact ROI/profit credit and a message. Credits can be applied at any time.</p>
        </div>

        {message && <div role="status" className="p-4 rounded-xl text-xs bg-[#CF202F]/10 border border-[#CF202F]/50 text-[#FCA5A5]">{message}</div>}

        {loading ? (
          <SkeletonRows rows={4} height="h-16" />
        ) : investors.length === 0 ? (
          <EmptyState title="No investors yet" hint="Investors appear here once they fund their account." icon="solar:users-group-rounded-bold" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {investors.map(investor => (
              <button
                key={investor.id}
                onClick={() => router.push(`/admin/performance/${investor.id}`)}
                className="rounded-2xl border border-[#2B393F] bg-[#151E23] p-5 text-left hover:border-[#F59E0B]/50 hover:bg-[#1A252C] transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{investor.name ?? 'Unnamed investor'}</p>
                    <p className="text-[10px] text-[#7F8C86] truncate mt-0.5">{investor.email ?? investor.id}</p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-mono bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30">
                    <Icon icon="solar:graph-up-bold" className="w-3 h-3" />
                    Add ROI
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-[#0D1215] border border-[#2B393F] p-2.5">
                    <p className="text-[9px] uppercase font-mono text-[#7F8C86]">Plan</p>
                    <p className="mt-0.5 font-mono font-semibold text-white">{investor.planName ?? 'No plan'}</p>
                  </div>
                  <div className="rounded-xl bg-[#0D1215] border border-[#2B393F] p-2.5">
                    <p className="text-[9px] uppercase font-mono text-[#7F8C86]">Balance</p>
                    <p className="mt-0.5 font-mono font-semibold text-[#22C55E]">{formatCents(investor.balanceCents)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}