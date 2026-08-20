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
  const [msgTitle, setMsgTitle] = useState('');
  const [msgBody, setMsgBody] = useState('');
  const [msgAudience, setMsgAudience] = useState<'all' | 'plan'>('all');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/admin/dashboard', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setAumCents(data.aumCents ?? 0);
          setPendingDeposits(data.pendingDeposits ?? 0);
          setPendingWithdrawals(data.pendingWithdrawals ?? 0);
          setPendingKyc(data.pendingKyc ?? 0);
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
            <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
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
                
              </div>
              <p className="text-2xl font-mono font-semibold text-[#E8EFEB]">{pendingDeposits} Requests</p>
            </Link>

            <Link href="/admin/withdrawals" className="p-5 rounded-2xl bg-[#151E23] border border-[#2B393F] hover:border-[#22C55E]/40 transition-colors space-y-1">
              <div className="flex justify-between items-center">
                <p className="text-[10px] uppercase font-mono text-[#93A09A]">Pending Withdrawals</p>
                
              </div>
              <p className="text-2xl font-mono font-semibold text-[#E8EFEB]">{pendingWithdrawals} Requests</p>
            </Link>

            <Link href="/admin/kyc" className="p-5 rounded-2xl bg-[#151E23] border border-[#2B393F] hover:border-[#22C55E]/40 transition-colors space-y-1">
              <div className="flex justify-between items-center">
                <p className="text-[10px] uppercase font-mono text-[#93A09A]">KYC Queue</p>
                
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

        {/* Quick Message Composer */}
        <div className="p-6 rounded-2xl bg-[#151E23] border border-[#2B393F] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#d6a85c]/10 border border-[#d6a85c]/30 text-[#d6a85c] flex items-center justify-center">
              <Icon icon="solar:megaphone-bold" className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-normal text-[#E8EFEB]">Send Announcement</h3>
              <p className="text-[10px] text-[#93A09A]">Broadcast a message to investors</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              value={msgTitle}
              onChange={e => setMsgTitle(e.target.value)}
              placeholder="Notification title"
              className="rounded-xl border border-[#2B393F] bg-[#0D1215] px-4 py-2.5 text-xs text-white placeholder-[#5B6B62] focus:outline-none focus:border-[#d6a85c]"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setMsgAudience('all')}
                className={`flex-1 rounded-xl text-[10px] font-mono py-2.5 border transition-colors ${
                  msgAudience === 'all'
                    ? 'border-[#d6a85c]/50 bg-[#d6a85c]/10 text-[#d6a85c]'
                    : 'border-[#2B393F] bg-[#0D1215] text-[#93A09A] hover:text-white'
                }`}
              >
                All Investors
              </button>
              <button
                onClick={() => setMsgAudience('plan')}
                className={`flex-1 rounded-xl text-[10px] font-mono py-2.5 border transition-colors ${
                  msgAudience === 'plan'
                    ? 'border-[#d6a85c]/50 bg-[#d6a85c]/10 text-[#d6a85c]'
                    : 'border-[#2B393F] bg-[#0D1215] text-[#93A09A] hover:text-white'
                }`}
              >
                By Plan
              </button>
            </div>
          </div>

          <textarea
            value={msgBody}
            onChange={e => setMsgBody(e.target.value)}
            placeholder="Write your announcement message..."
            rows={3}
            className="w-full rounded-xl border border-[#2B393F] bg-[#0D1215] px-4 py-2.5 text-xs text-white placeholder-[#5B6B62] focus:outline-none focus:border-[#d6a85c] resize-none"
          />

          <div className="flex items-center justify-between">
            {sendResult && (
              <p className={`text-[10px] font-mono ${sendResult.startsWith('Sent') ? 'text-[#22C55E]' : 'text-red-400'}`}>
                {sendResult}
              </p>
            )}
            <button
              disabled={!msgTitle.trim() || !msgBody.trim() || sending}
              onClick={async () => {
                setSending(true);
                setSendResult(null);
                try {
                  const res = await fetch('/api/admin/notifications', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      title: msgTitle.trim(),
                      body: msgBody.trim(),
                      audience: msgAudience,
                    }),
                  });
                  const data = await res.json();
                  if (res.ok) {
                    setSendResult(`Sent to ${data.delivered ?? '?'} investors`);
                    setMsgTitle('');
                    setMsgBody('');
                  } else {
                    setSendResult(data.error || 'Failed to send');
                  }
                } catch {
                  setSendResult('Network error');
                }
                setSending(false);
              }}
              className="ml-auto px-5 py-2.5 rounded-full bg-[#d6a85c] text-[#0D1215] text-[11px] font-semibold hover:bg-[#c49a50] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {sending ? 'Sending...' : 'Send to All'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
