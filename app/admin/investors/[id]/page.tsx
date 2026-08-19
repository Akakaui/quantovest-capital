'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import { Icon } from '@iconify/react';

interface InvestorProfile {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
  planName: string | null;
  balanceCents: number;
  principalCents: number;
  kycStatus: string | null;
  twoFactorEnabled: boolean;
}

export default function AdminInvestorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const investorId = params?.id as string;
  const [profile, setProfile] = useState<InvestorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/investors?id=${investorId}`);
        if (res.ok) {
          const data = await res.json();
          const inv = Array.isArray(data) ? data.find((i: InvestorProfile) => i.id === investorId) : data;
          if (inv) {
            setProfile(inv);
            setName(inv.name ?? '');
            setPhone(inv.phone ?? '');
          }
        }
      } catch { /* ignore */ } finally { setLoading(false); }
    }
    void load();
  }, [investorId]);

  async function handleSave() {
    setSaving(true); setMessage('');
    try {
      const res = await fetch(`/api/admin/investors/${investorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      });
      if (res.ok) {
        setMessage('Profile updated.');
        setProfile(p => p ? { ...p, name, phone } : p);
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage(data.error || 'Update failed.');
      }
    } catch { setMessage('Update failed.'); }
    setSaving(false);
  }

  const formatCents = (cents: number) => '$' + (cents / 100).toLocaleString('en-US');

  return (
    <div className="min-h-screen bg-[#0D1215] text-[#E8EFEB] flex flex-col md:flex-row font-sans">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-8 space-y-8 overflow-y-auto pb-24 md:pb-8">
        <div className="flex items-center gap-3 border-b border-[#2B393F] pb-6">
          <button onClick={() => router.back()} className="p-2 rounded-lg text-[#AAB5AF] hover:text-[#F2F6F3] hover:bg-[#1A2429]">
            <Icon icon="solar:alt-arrow-left-bold" className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-normal">Investor Profile</h1>
            <p className="text-xs text-[#93A09A]">View and edit investor account details.</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-[#1A252C] border border-[#2B393F] rounded-2xl animate-pulse" />)}
          </div>
        ) : !profile ? (
          <div className="text-center py-12 text-xs text-[#7F8C86]">Investor not found.</div>
        ) : (
          <div className="max-w-2xl space-y-6">
            {message && (
              <div className="p-4 rounded-xl border border-[#22C55E]/50 bg-[#22C55E]/10 text-xs text-[#86EFAC]">{message}</div>
            )}

            {/* Profile Info */}
            <div className="bg-[#151E23] border border-[#2B393F] rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-[#E8EFEB]">Account Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase font-mono text-[#93A09A]">ID</p>
                  <p className="text-xs font-mono text-[#E8EFEB] break-all">{profile.id}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-mono text-[#93A09A]">Email</p>
                  <p className="text-xs text-[#E8EFEB]">{profile.email}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-mono text-[#93A09A]">Plan</p>
                  <p className="text-xs text-[#E8EFEB]">{profile.planName ?? 'None'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-mono text-[#93A09A]">KYC Status</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                    profile.kycStatus === 'approved' ? 'bg-[#22C55E]/10 text-[#22C55E]' :
                    profile.kycStatus === 'pending' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>{profile.kycStatus ?? 'unverified'}</span>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-mono text-[#93A09A]">Balance</p>
                  <p className="text-sm font-mono text-[#22C55E]">{formatCents(profile.balanceCents)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-mono text-[#93A09A]">Principal</p>
                  <p className="text-sm font-mono text-[#E8EFEB]">{formatCents(profile.principalCents)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-mono text-[#93A09A]">2FA</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${profile.twoFactorEnabled ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#2B393F] text-[#93A09A]'}`}>
                    {profile.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-mono text-[#93A09A]">Joined</p>
                  <p className="text-xs text-[#E8EFEB]">{new Date(profile.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Edit Fields */}
            <div className="bg-[#151E23] border border-[#2B393F] rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-[#E8EFEB]">Edit Profile</h3>
              <label className="text-xs text-[#93A09A] block">Display Name
                <input value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full rounded-xl border border-[#2B393F] bg-[#0D1215] px-4 py-3 text-sm text-white" />
              </label>
              <label className="text-xs text-[#93A09A] block">Phone Number
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className="mt-1 w-full rounded-xl border border-[#2B393F] bg-[#0D1215] px-4 py-3 text-sm text-white font-mono" />
              </label>
              <button onClick={handleSave} disabled={saving} className="self-start rounded-full bg-[#22C55E] px-5 py-3 text-xs font-semibold text-[#07110B] disabled:opacity-40">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
