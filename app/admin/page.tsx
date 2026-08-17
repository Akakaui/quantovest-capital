'use client';

import React, { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { Icon } from '@iconify/react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface InvestorRow {
  id: string;
  name: string | null;
  email: string;
  accountId: string | null;
  planId: string | null;
  balanceCents: number;
  principalCents: number;
  planName: string | null;
  minRoiBps: number | null;
  maxRoiBps: number | null;
}

interface DepositRow {
  id: string;
  status: string;
}

interface WithdrawalRow {
  id: number;
  status: string;
}

interface KycRow {
  id: number;
  status: string;
}

function formatCurrency(cents: number): string {
  const dollars = Math.floor(cents / 100);
  return '$' + dollars.toLocaleString('en-US');
}

function SkeletonBlock({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-2xl bg-[#1A252C] border border-[#2B393F] ${className}`} />
  );
}

export default function AdminDashboard() {
  const [aumCents, setAumCents] = useState(0);
  const [pendingDeposits, setPendingDeposits] = useState(0);
  const [pendingWithdrawals, setPendingWithdrawals] = useState(0);
  const [pendingKyc, setPendingKyc] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const opts = { credentials: 'include' as const };
        const [investorsRes, depositsRes, withdrawalsRes, kycRes] = await Promise.all([
          fetch('/api/admin/investors', opts),
          fetch('/api/admin/deposits', opts),
          fetch('/api/admin/withdrawals', opts),
          fetch('/api/admin/kyc', opts),
        ]);

        if (investorsRes.ok) {
          const investors: InvestorRow[] = await investorsRes.json();
          const totalCents = investors.reduce((sum, inv) => sum + (inv.balanceCents || 0), 0);
          setAumCents(totalCents);
        }

        if (depositsRes.ok) {
          const deposits: DepositRow[] = await depositsRes.json();
          setPendingDeposits(deposits.length);
        }

        if (withdrawalsRes.ok) {
          const withdrawals: WithdrawalRow[] = await withdrawalsRes.json();
          setPendingWithdrawals(withdrawals.filter(w => w.status === 'pending').length);
        }

        if (kycRes.ok) {
          const kyc: KycRow[] = await kycRes.json();
          setPendingKyc(kyc.length);
        }
      } catch (e) {
        console.error('Failed to load admin dashboard data', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#0D1215] text-[#E8EFEB] flex flex-col md:flex-row font-sans">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-8 space-y-8 overflow-y-auto pb-24 md:pb-8">
        {/* Header */}
        <div className="border-b border-[#2B393F] pb-6 space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#22C55E] font-mono">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></span>
            STAFF ADMIN CONSOLE
          </div>
          <h1 className="text-2xl font-normal text-[#E8EFEB]">Trading Firm Control Center</h1>
          <p className="text-xs text-[#93A09A]">Publish daily strategy returns, approve deposits, process withdrawals, and verify client KYC.</p>
        </div>

        {/* Action Counters Banner */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <SkeletonBlock className="h-[88px]" />
            <SkeletonBlock className="h-[88px]" />
            <SkeletonBlock className="h-[88px]" />
            <SkeletonBlock className="h-[88px]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#151E23] border border-[#2B393F] space-y-1">
              <p className="text-[10px] uppercase font-mono text-[#93A09A]">Total Managed AUM</p>
              <p className="text-2xl font-mono font-semibold text-[#22C55E]">{formatCurrency(aumCents)}</p>
            </div>

            <Link href="/admin/deposits" className="p-5 rounded-2xl bg-[#151E23] border border-[#2B393F] hover:border-[#22C55E]/40 transition-colors space-y-1">
              <div className="flex justify-between items-center">
                <p className="text-[10px] uppercase font-mono text-[#93A09A]">Pending Deposits</p>
                {pendingDeposits > 0 && <span className="w-2 h-2 rounded-full bg-amber-400"></span>}
              </div>
              <p className="text-2xl font-mono font-semibold text-[#E8EFEB]">{pendingDeposits} Requests</p>
            </Link>

            <Link href="/admin/withdrawals" className="p-5 rounded-2xl bg-[#151E23] border border-[#2B393F] hover:border-[#22C55E]/40 transition-colors space-y-1">
              <div className="flex justify-between items-center">
                <p className="text-[10px] uppercase font-mono text-[#93A09A]">Pending Withdrawals</p>
                {pendingWithdrawals > 0 && <span className="w-2 h-2 rounded-full bg-amber-400"></span>}
              </div>
              <p className="text-2xl font-mono font-semibold text-[#E8EFEB]">{pendingWithdrawals} Requests</p>
            </Link>

            <Link href="/admin/kyc" className="p-5 rounded-2xl bg-[#151E23] border border-[#2B393F] hover:border-[#22C55E]/40 transition-colors space-y-1">
              <div className="flex justify-between items-center">
                <p className="text-[10px] uppercase font-mono text-[#93A09A]">KYC Queue</p>
                {pendingKyc > 0 && <span className="w-2 h-2 rounded-full bg-amber-400"></span>}
              </div>
              <p className="text-2xl font-mono font-semibold text-[#E8EFEB]">{pendingKyc} Pending</p>
            </Link>
          </div>
        )}

        {/* Quick Tools Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/admin/performance" className="p-6 rounded-2xl bg-[#151E23] border border-[#22C55E]/40 hover:bg-[#0D1215] transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] flex items-center justify-center">
              <Icon icon="solar:graph-bold" className="w-6 h-6" />
            </div>
            <h3 className="text-base font-normal text-[#E8EFEB]">Publish Daily ROI Percentage</h3>
            <p className="text-xs text-[#93A09A]">
              Enter today&apos;s performance % (e.g., +1.35%). Automatically updates all investor balances and animates their dashboard growth charts.
            </p>
          </Link>

          <Link href="/admin/deposits" className="p-6 rounded-2xl bg-[#151E23] border border-[#2B393F] hover:bg-[#0D1215] transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] flex items-center justify-center">
              <Icon icon="solar:wallet-bold" className="w-6 h-6" />
            </div>
            <h3 className="text-base font-normal text-[#E8EFEB]">Review Deposit Proofs</h3>
            <p className="text-xs text-[#93A09A]">
              Inspect investor payment screenshots and click Approve to credit investor balances.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
