'use client';

import React, { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { Icon } from '@iconify/react';

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

interface KycRow {
  id: number;
  investorId: string;
  status: string;
  createdAt: string;
}

interface WithdrawalRow {
  id: number;
  investorId: string;
  amountCents: number;
  status: string;
  destinationType: string;
  createdAt: string;
}

function formatCents(cents: number): string {
  return '$' + (cents / 100).toLocaleString('en-US');
}

export default function AdminInvestorsPage() {
  const [investors, setInvestors] = useState<InvestorRow[]>([]);
  const [kycApps, setKycApps] = useState<KycRow[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const opts = { credentials: 'include' as const };
        const [invRes, kycRes, wdRes] = await Promise.all([
          fetch('/api/admin/investors', opts),
          fetch('/api/admin/kyc', opts),
          fetch('/api/admin/withdrawals', opts),
        ]);
        if (invRes.ok) {
          setInvestors(await invRes.json());
        } else {
          const body = await invRes.json().catch(() => null);
          const msg = body?.error || `Failed to load investors (HTTP ${invRes.status}).`;
          const detail = body?.detail ? ` — ${body.detail}` : '';
          setErrorMsg(`${msg}${detail}`);
        }
        if (kycRes.ok) setKycApps(await kycRes.json());
        if (wdRes.ok) setWithdrawals(await wdRes.json());
      } catch {
        setErrorMsg('Failed to connect to the server.');
      } finally {
        setLoading(false);
      }
    }
    void fetchData();
  }, []);

  const filtered = investors.filter(inv => {
    const q = searchQuery.toLowerCase();
    return (inv.name?.toLowerCase().includes(q) || inv.email?.toLowerCase().includes(q));
  });

  function getKycForInvestor(investorId: string): KycRow[] {
    return kycApps.filter(k => k.investorId === investorId);
  }

  function getWithdrawalsForInvestor(investorId: string): WithdrawalRow[] {
    return withdrawals.filter(w => w.investorId === investorId);
  }

  function getLatestKycStatus(investorId: string): string | null {
    const apps = getKycForInvestor(investorId);
    if (apps.length === 0) return null;
    return apps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].status;
  }

  return (
    <div className="min-h-screen bg-[#0D1215] text-[#E8EFEB] flex flex-col md:flex-row font-sans">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-8 space-y-8 overflow-y-auto pb-24 md:pb-8">
        <div className="border-b border-[#2B393F] pb-6 space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#22C55E] font-mono">
            <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
            INVESTOR MANAGEMENT
          </div>
          <h1 className="text-2xl font-normal text-[#E8EFEB]">Investor Accounts</h1>
          <p className="text-xs text-[#93A09A]">Search, view, and manage investor accounts and activity.</p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-500/10 text-xs text-rose-300">{errorMsg}</div>
        )}

        {/* Search */}
        <div className="max-w-md">
          <div className="relative">
            <Icon icon="solar:magnifer-bold" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7F8C86]" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full rounded-xl border border-[#2B393F] bg-[#151E23] pl-10 pr-4 py-3 text-sm text-white placeholder-[#7F8C86]"
            />
          </div>
        </div>

        {/* Investor Table */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="animate-pulse rounded-2xl bg-[#1A252C] border border-[#2B393F] h-20" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-xs text-[#7F8C86]">No investors found.</div>
        ) : (
          <div className="space-y-3">
            {filtered.map(inv => {
              const isExpanded = expandedId === inv.id;
              const kycStatus = getLatestKycStatus(inv.id);
              const investorWithdrawals = getWithdrawalsForInvestor(inv.id);
              const investorKyc = getKycForInvestor(inv.id);

              return (
                <div key={inv.id} className="bg-[#151E23] border border-[#2B393F] rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : inv.id)}
                    className="w-full p-5 flex flex-col sm:flex-row sm:items-center gap-4 text-left hover:bg-[#1A252C] transition-colors"
                  >
                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <p className="text-[10px] uppercase font-mono text-[#93A09A]">Name</p>
                        <p className="text-sm font-semibold text-[#E8EFEB] truncate">{inv.name ?? 'Unnamed'}</p>
                        <p className="text-[10px] text-[#7F8C86] font-mono truncate">{inv.email}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-mono text-[#93A09A]">Plan</p>
                        <p className="text-sm text-[#E8EFEB]">{inv.planName ?? 'None'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-mono text-[#93A09A]">Balance</p>
                        <p className="text-sm font-mono text-[#22C55E]">{formatCents(inv.balanceCents)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-mono text-[#93A09A]">Status</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {kycStatus && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                              kycStatus === 'approved'
                                ? 'bg-[#22C55E]/10 text-[#22C55E]'
                                : kycStatus === 'pending'
                                ? 'bg-amber-500/10 text-amber-400'
                                : 'bg-rose-500/10 text-rose-400'
                            }`}>
                              KYC: {kycStatus}
                            </span>
                          )}
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-[#22C55E]/10 text-[#22C55E]">
                            ACTIVE
                          </span>
                        </div>
                      </div>
                    </div>
                    <Icon
                      icon="solar:alt-arrow-right-bold"
                      className={`w-4 h-4 text-[#93A09A] transition-transform shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="border-t border-[#2B393F] p-5 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-[#0D1215] border border-[#2B393F] rounded-xl p-4">
                          <p className="text-[10px] uppercase font-mono text-[#93A09A] mb-1">Principal</p>
                          <p className="text-lg font-mono text-[#E8EFEB]">{formatCents(inv.principalCents)}</p>
                        </div>
                        <div className="bg-[#0D1215] border border-[#2B393F] rounded-xl p-4">
                          <p className="text-[10px] uppercase font-mono text-[#93A09A] mb-1">ROI Range</p>
                          <p className="text-lg font-mono text-[#E8EFEB]">
                            {inv.minRoiBps != null && inv.maxRoiBps != null
                              ? `${(inv.minRoiBps / 100).toFixed(2)}% – ${(inv.maxRoiBps / 100).toFixed(2)}%`
                              : 'N/A'}
                          </p>
                        </div>
                        <div className="bg-[#0D1215] border border-[#2B393F] rounded-xl p-4">
                          <p className="text-[10px] uppercase font-mono text-[#93A09A] mb-1">Account ID</p>
                          <p className="text-[10px] font-mono text-[#93A09A] break-all">{inv.accountId ?? 'No account'}</p>
                        </div>
                      </div>

                      {/* KYC History */}
                      <div>
                        <h4 className="text-xs font-semibold text-[#E8EFEB] mb-2">KYC History</h4>
                        {investorKyc.length === 0 ? (
                          <p className="text-[10px] text-[#7F8C86]">No KYC submissions.</p>
                        ) : (
                          <div className="space-y-2">
                            {investorKyc.map(k => (
                              <div key={k.id} className="flex items-center gap-3 text-[10px] font-mono text-[#93A09A]">
                                <span className={`w-2 h-2 rounded-full ${
                                  k.status === 'approved' ? 'bg-[#22C55E]' : k.status === 'pending' ? 'bg-amber-400' : 'bg-rose-400'
                                }`} />
                                <span>ID: {k.id}</span>
                                <span className="capitalize">{k.status}</span>
                                <span>{new Date(k.createdAt).toLocaleDateString()}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Withdrawals */}
                      <div>
                        <h4 className="text-xs font-semibold text-[#E8EFEB] mb-2">Recent Withdrawals</h4>
                        {investorWithdrawals.length === 0 ? (
                          <p className="text-[10px] text-[#7F8C86]">No withdrawal history.</p>
                        ) : (
                          <div className="space-y-2">
                            {investorWithdrawals.slice(0, 5).map(w => (
                              <div key={w.id} className="flex items-center gap-3 text-[10px] font-mono text-[#93A09A]">
                                <span className={`w-2 h-2 rounded-full ${
                                  w.status === 'approved' ? 'bg-[#22C55E]' : w.status === 'pending' ? 'bg-amber-400' : 'bg-rose-400'
                                }`} />
                                <span>{formatCents(w.amountCents)}</span>
                                <span className="capitalize">{w.destinationType}</span>
                                <span className="capitalize">{w.status}</span>
                                <span>{new Date(w.createdAt).toLocaleDateString()}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
