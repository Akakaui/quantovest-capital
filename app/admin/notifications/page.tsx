'use client';

import React, { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { Icon } from '@iconify/react';

interface Investor {
  id: string;
  name: string | null;
  email: string;
  planName: string | null;
}

interface Plan {
  id: number;
  name: string;
}

type AudienceMode = 'all' | 'selected' | 'plan';

export default function AdminNotificationsPage() {
  const [audience, setAudience] = useState<AudienceMode>('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sendEmail, setSendEmail] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [recipientCount, setRecipientCount] = useState(0);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const opts = { credentials: 'include' as const };
        const [investorsRes, plansRes] = await Promise.all([
          fetch('/api/admin/investors', opts),
          fetch('/api/plans', opts),
        ]);
        if (investorsRes.ok) setInvestors(await investorsRes.json());
        if (plansRes.ok) {
          const data = await plansRes.json();
          setPlans(Array.isArray(data) ? data : data.plans ?? []);
        }
      } catch (e) {
        console.error('Failed to load data', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (audience === 'all') {
      setRecipientCount(investors.length);
    } else if (audience === 'selected') {
      setRecipientCount(selectedUsers.length);
    } else {
      const planHolders = investors.filter(inv => selectedPlans.includes(inv.planName ?? ''));
      setRecipientCount(planHolders.length);
    }
  }, [audience, selectedUsers, selectedPlans, investors]);

  const filteredInvestors = investors.filter(inv => {
    const q = searchQuery.toLowerCase();
    return (inv.name?.toLowerCase().includes(q) || inv.email?.toLowerCase().includes(q));
  });

  function toggleUser(userId: string) {
    setSelectedUsers(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  }

  function togglePlan(planName: string) {
    setSelectedPlans(prev => prev.includes(planName) ? prev.filter(n => n !== planName) : [...prev, planName]);
  }

  async function handleSend() {
    if (!title.trim() || !message.trim() || recipientCount === 0) return;
    setSending(true);
    setResult(null);
    try {
      const body: Record<string, unknown> = {
        title: title.trim(),
        body: message.trim(),
        audience,
      };
      if (audience === 'plan') body.plans = selectedPlans;
      if (audience === 'selected') body.userIds = selectedUsers;

      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ success: true, message: `Notification delivered to ${data.delivered} recipient(s).` });
        setTitle('');
        setMessage('');
        setSelectedUsers([]);
        setSelectedPlans([]);
        setAudience('all');
      } else {
        setResult({ success: false, message: data.error ?? 'Failed to send notification.' });
      }
    } catch {
      setResult({ success: false, message: 'Network error. Please try again.' });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0D1215] text-[#E8EFEB] flex flex-col md:flex-row font-sans">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-8 space-y-8 overflow-y-auto pb-24 md:pb-8">
        <div className="border-b border-[#2B393F] pb-6 space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#22C55E] font-mono">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            MESSAGING CONSOLE
          </div>
          <h1 className="text-2xl font-normal text-[#E8EFEB]">Notification Composer</h1>
          <p className="text-xs text-[#93A09A]">Send targeted messages to investors via in-app notification or email.</p>
        </div>

        {result && (
          <div className={`rounded-xl border p-4 text-xs ${result.success ? 'border-[#22C55E]/50 bg-[#22C55E]/10 text-[#86EFAC]' : 'border-rose-500/50 bg-rose-500/10 text-rose-300'}`}>
            {result.message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Composer */}
          <div className="lg:col-span-2 space-y-6">
            {/* Audience Selector */}
            <div className="bg-[#151E23] border border-[#2B393F] rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-[#E8EFEB]">Audience</h3>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { mode: 'all' as AudienceMode, label: 'All Investors', desc: 'Every active user', icon: 'solar:users-group-rounded-bold' },
                  { mode: 'selected' as AudienceMode, label: 'Personal Message', desc: 'Search & select users', icon: 'solar:user-search-bold' },
                  { mode: 'plan' as AudienceMode, label: 'Plan-Targeted', desc: 'By active plan', icon: 'solar:layers-bold' },
                ]).map(opt => (
                  <button
                    key={opt.mode}
                    onClick={() => { setAudience(opt.mode); setSelectedUsers([]); setSelectedPlans([]); }}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      audience === opt.mode
                        ? 'border-[#22C55E] bg-[#22C55E]/10'
                        : 'border-[#2B393F] bg-[#0D1215] hover:border-[#93A09A]/30'
                    }`}
                  >
                    <Icon icon={opt.icon} className={`w-5 h-5 mb-2 ${audience === opt.mode ? 'text-[#22C55E]' : 'text-[#93A09A]'}`} />
                    <p className={`text-xs font-semibold ${audience === opt.mode ? 'text-[#22C55E]' : 'text-[#E8EFEB]'}`}>{opt.label}</p>
                    <p className="text-[10px] text-[#93A09A] mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>

              {audience === 'selected' && (
                <div className="mt-4 space-y-3">
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full rounded-xl border border-[#2B393F] bg-[#0D1215] px-4 py-3 text-sm text-white placeholder-[#7F8C86]"
                  />
                  <div className="max-h-48 overflow-y-auto space-y-1.5">
                    {loading ? (
                      <p className="text-xs text-[#7F8C86] py-4 text-center">Loading investors...</p>
                    ) : filteredInvestors.length === 0 ? (
                      <p className="text-xs text-[#7F8C86] py-4 text-center">No investors found.</p>
                    ) : (
                      filteredInvestors.map(inv => (
                        <label
                          key={inv.id}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            selectedUsers.includes(inv.id)
                              ? 'border-[#22C55E] bg-[#22C55E]/10'
                              : 'border-[#2B393F] bg-[#0D1215] hover:border-[#93A09A]/30'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(inv.id)}
                            onChange={() => toggleUser(inv.id)}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                            selectedUsers.includes(inv.id) ? 'border-[#22C55E] bg-[#22C55E]' : 'border-[#93A09A]'
                          }`}>
                            {selectedUsers.includes(inv.id) && <Icon icon="solar:check-read-bold" className="w-3.5 h-3.5 text-[#07110B]" />}
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-semibold text-[#E8EFEB] truncate">{inv.name ?? 'Unnamed'}</p>
                            <p className="text-[10px] text-[#93A09A] font-mono truncate">{inv.email}</p>
                          </div>
                          {inv.planName && (
                            <span className="ml-auto text-[10px] bg-[#22C55E]/10 text-[#22C55E] px-2 py-0.5 rounded-full font-mono shrink-0">
                              {inv.planName}
                            </span>
                          )}
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}

              {audience === 'plan' && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {(plans.length > 0 ? plans : [{ id: 1, name: 'Starter' }, { id: 2, name: 'Growth' }, { id: 3, name: 'Elite' }]).map(plan => (
                    <button
                      key={plan.name}
                      onClick={() => togglePlan(plan.name)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        selectedPlans.includes(plan.name)
                          ? 'border-[#22C55E] bg-[#22C55E]/10'
                          : 'border-[#2B393F] bg-[#0D1215] hover:border-[#93A09A]/30'
                      }`}
                    >
                      <p className={`text-xs font-semibold ${selectedPlans.includes(plan.name) ? 'text-[#22C55E]' : 'text-[#E8EFEB]'}`}>{plan.name}</p>
                      <p className="text-[10px] text-[#93A09A] mt-0.5">
                        {investors.filter(i => i.planName === plan.name).length} investors
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Message Form */}
            <div className="bg-[#151E23] border border-[#2B393F] rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-[#E8EFEB]">Message</h3>
              <label className="text-xs text-[#93A09A] block">
                Title
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Scheduled Maintenance Notice"
                  className="mt-1 w-full rounded-xl border border-[#2B393F] bg-[#0D1215] px-4 py-3 text-sm text-white placeholder-[#7F8C86]"
                />
              </label>
              <label className="text-xs text-[#93A09A] block">
                Body
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Write your message here..."
                  rows={5}
                  className="mt-1 w-full rounded-xl border border-[#2B393F] bg-[#0D1215] px-4 py-3 text-sm text-white placeholder-[#7F8C86] resize-none"
                />
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={e => setSendEmail(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${sendEmail ? 'border-[#22C55E] bg-[#22C55E]' : 'border-[#93A09A]'}`}>
                  {sendEmail && <Icon icon="solar:check-read-bold" className="w-3.5 h-3.5 text-[#07110B]" />}
                </div>
                <span className="text-xs text-[#E8EFEB]">Also send via email</span>
              </label>
            </div>
          </div>

          {/* Preview Sidebar */}
          <div className="space-y-6">
            <div className="bg-[#151E23] border border-[#2B393F] rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-[#E8EFEB]">Preview</h3>
              <div className="p-4 bg-[#0D1215] border border-[#2B393F] rounded-xl">
                <p className="text-[10px] uppercase font-mono text-[#93A09A] mb-2">Recipients</p>
                <p className="text-3xl font-mono font-semibold text-[#22C55E]">{recipientCount}</p>
                <p className="text-[10px] text-[#93A09A] mt-1">
                  {audience === 'all' && 'All active investors'}
                  {audience === 'selected' && `${selectedUsers.length} selected user(s)`}
                  {audience === 'plan' && (selectedPlans.length > 0 ? selectedPlans.join(', ') + ' plan holders' : 'No plans selected')}
                </p>
              </div>

              {title && (
                <div className="p-4 bg-[#0D1215] border border-[#2B393F] rounded-xl">
                  <p className="text-[10px] uppercase font-mono text-[#93A09A] mb-2">Preview</p>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs text-[#B9C6BD] mt-2 whitespace-pre-wrap">{message || 'No message body.'}</p>
                </div>
              )}

              <div className="space-y-2 text-[10px] text-[#93A09A]">
                <div className="flex justify-between"><span>Channels</span><span className="text-[#E8EFEB]">In-app{sendEmail ? ', Email' : ''}</span></div>
                <div className="flex justify-between"><span>Audience</span><span className="text-[#E8EFEB] capitalize">{audience}</span></div>
              </div>

              <button
                onClick={handleSend}
                disabled={sending || !title.trim() || !message.trim() || recipientCount === 0}
                className="w-full rounded-xl bg-[#22C55E] px-5 py-3 text-xs font-semibold text-[#07110B] disabled:opacity-40 hover:bg-[#86EFAC] transition-colors"
              >
                {sending ? 'Sending...' : `Send to ${recipientCount} recipient(s)`}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
