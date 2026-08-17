'use client';

import React, { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { Icon } from '@iconify/react';

interface Plan {
  id: number;
  name: string;
  minimumDepositCents: number;
  maximumDepositCents: number | null;
  minRoiBps: number;
  maxRoiBps: number;
  active: number;
}

interface PlanForm {
  name: string;
  minimumDepositCents: number;
  maximumDepositCents: number | null;
  minRoiBps: number;
  maxRoiBps: number;
  active: boolean;
}

const EMPTY_FORM: PlanForm = {
  name: '',
  minimumDepositCents: 100000,
  maximumDepositCents: null,
  minRoiBps: 100,
  maxRoiBps: 300,
  active: true,
};

function formatCents(cents: number): string {
  return '$' + (cents / 100).toLocaleString('en-US');
}

function formatBps(bps: number): string {
  return (bps / 100).toFixed(2) + '%';
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<PlanForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function loadPlans() {
    try {
      const res = await fetch('/api/admin/plans', { credentials: 'include' });
      if (res.ok) setPlans(await res.json());
    } catch {
      console.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadPlans(); }, []);

  function startEdit(plan: Plan) {
    setEditingId(plan.id);
    setCreating(false);
    setForm({
      name: plan.name,
      minimumDepositCents: plan.minimumDepositCents,
      maximumDepositCents: plan.maximumDepositCents,
      minRoiBps: plan.minRoiBps,
      maxRoiBps: plan.maxRoiBps,
      active: plan.active === 1,
    });
    setMessage(null);
  }

  function startCreate() {
    setCreating(true);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setMessage(null);
  }

  function cancel() {
    setEditingId(null);
    setCreating(false);
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const isEdit = editingId !== null;
      const body = isEdit ? { id: editingId, ...form } : form;
      const res = await fetch('/api/admin/plans', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: isEdit ? 'Plan updated.' : 'Plan created.' });
        setEditingId(null);
        setCreating(false);
        await loadPlans();
      } else {
        setMessage({ type: 'error', text: data.error ?? 'Save failed.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0D1215] text-[#E8EFEB] flex flex-col md:flex-row font-sans">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-8 space-y-8 overflow-y-auto pb-24 md:pb-8">
        <div className="border-b border-[#2B393F] pb-6 space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#22C55E] font-mono">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            PLAN MANAGEMENT
          </div>
          <h1 className="text-2xl font-normal text-[#E8EFEB]">Investment Plans</h1>
          <p className="text-xs text-[#93A09A]">Configure plan tiers, deposit limits, and ROI ranges.</p>
        </div>

        {message && (
          <div className={`rounded-xl border p-4 text-xs ${
            message.type === 'success'
              ? 'border-[#22C55E]/50 bg-[#22C55E]/10 text-[#86EFAC]'
              : 'border-rose-500/50 bg-rose-500/10 text-rose-300'
          }`}>
            {message.text}
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={startCreate}
            disabled={creating}
            className="rounded-xl bg-[#22C55E] px-5 py-2.5 text-xs font-semibold text-[#07110B] disabled:opacity-40 hover:bg-[#86EFAC] transition-colors flex items-center gap-2"
          >
            <Icon icon="solar:add-circle-bold" className="w-4 h-4" />
            Create New Plan
          </button>
        </div>

        {/* Create Form */}
        {creating && (
          <div className="bg-[#151E23] border border-[#22C55E]/40 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-[#E8EFEB]">New Plan</h3>
            <PlanFormFields form={form} setForm={setForm} />
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving} className="rounded-xl bg-[#22C55E] px-5 py-2.5 text-xs font-semibold text-[#07110B] disabled:opacity-40 hover:bg-[#86EFAC] transition-colors">
                {saving ? 'Saving...' : 'Create Plan'}
              </button>
              <button onClick={cancel} className="rounded-xl border border-[#2B393F] px-5 py-2.5 text-xs text-[#93A09A] hover:text-[#E8EFEB] transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Plan List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse rounded-2xl bg-[#1A252C] border border-[#2B393F] h-32" />
            ))}
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-12 text-xs text-[#7F8C86]">No plans found. Create one to get started.</div>
        ) : (
          <div className="space-y-4">
            {plans.map(plan => (
              <div key={plan.id} className="bg-[#151E23] border border-[#2B393F] rounded-2xl overflow-hidden">
                {editingId === plan.id ? (
                  <div className="p-6 space-y-4">
                    <h3 className="text-sm font-semibold text-[#E8EFEB]">Edit Plan</h3>
                    <PlanFormFields form={form} setForm={setForm} />
                    <div className="flex gap-3">
                      <button onClick={handleSave} disabled={saving} className="rounded-xl bg-[#22C55E] px-5 py-2.5 text-xs font-semibold text-[#07110B] disabled:opacity-40 hover:bg-[#86EFAC] transition-colors">
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button onClick={cancel} className="rounded-xl border border-[#2B393F] px-5 py-2.5 text-xs text-[#93A09A] hover:text-[#E8EFEB] transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-semibold text-[#E8EFEB]">{plan.name}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                          plan.active === 1
                            ? 'bg-[#22C55E]/10 text-[#22C55E]'
                            : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {plan.active === 1 ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 text-[10px] text-[#93A09A] font-mono">
                        <div>Min: {formatCents(plan.minimumDepositCents)}</div>
                        <div>Max: {plan.maximumDepositCents != null ? formatCents(plan.maximumDepositCents) : 'Unlimited'}</div>
                        <div>ROI: {formatBps(plan.minRoiBps)} – {formatBps(plan.maxRoiBps)}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => startEdit(plan)}
                      className="rounded-xl border border-[#2B393F] px-4 py-2.5 text-xs text-[#93A09A] hover:text-[#E8EFEB] hover:border-[#93A09A]/50 transition-colors flex items-center gap-2 shrink-0"
                    >
                      <Icon icon="solar:pen-bold" className="w-4 h-4" />
                      Edit
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function PlanFormFields({ form, setForm }: { form: PlanForm; setForm: React.Dispatch<React.SetStateAction<PlanForm>> }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <label className="text-xs text-[#93A09A] block">
        Plan Name
        <input
          value={form.name}
          onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
          placeholder="e.g. Starter"
          className="mt-1 w-full rounded-xl border border-[#2B393F] bg-[#0D1215] px-4 py-3 text-sm text-white placeholder-[#7F8C86]"
        />
      </label>
      <label className="text-xs text-[#93A09A] block">
        Minimum Deposit (cents)
        <input
          type="number"
          value={form.minimumDepositCents}
          onChange={e => setForm(prev => ({ ...prev, minimumDepositCents: Number(e.target.value) }))}
          className="mt-1 w-full rounded-xl border border-[#2B393F] bg-[#0D1215] px-4 py-3 text-sm text-white"
        />
      </label>
      <label className="text-xs text-[#93A09A] block">
        Maximum Deposit (cents)
        <input
          type="number"
          value={form.maximumDepositCents ?? ''}
          onChange={e => setForm(prev => ({ ...prev, maximumDepositCents: e.target.value ? Number(e.target.value) : null }))}
          placeholder="Leave empty for unlimited"
          className="mt-1 w-full rounded-xl border border-[#2B393F] bg-[#0D1215] px-4 py-3 text-sm text-white placeholder-[#7F8C86]"
        />
      </label>
      <div className="flex items-end gap-3">
        <label className="text-xs text-[#93A09A] block flex-1">
          Min ROI (bps)
          <input
            type="number"
            value={form.minRoiBps}
            onChange={e => setForm(prev => ({ ...prev, minRoiBps: Number(e.target.value) }))}
            className="mt-1 w-full rounded-xl border border-[#2B393F] bg-[#0D1215] px-4 py-3 text-sm text-white"
          />
        </label>
        <label className="text-xs text-[#93A09A] block flex-1">
          Max ROI (bps)
          <input
            type="number"
            value={form.maxRoiBps}
            onChange={e => setForm(prev => ({ ...prev, maxRoiBps: Number(e.target.value) }))}
            className="mt-1 w-full rounded-xl border border-[#2B393F] bg-[#0D1215] px-4 py-3 text-sm text-white"
          />
        </label>
      </div>
      <button
        type="button"
        onClick={() => setForm(prev => ({ ...prev, active: !prev.active }))}
        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
          form.active
            ? 'border-[#22C55E] bg-[#22C55E]/10'
            : 'border-[#2B393F] bg-[#0D1215]'
        }`}
      >
        <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
          form.active ? 'border-[#22C55E] bg-[#22C55E]' : 'border-[#93A09A]'
        }`}>
          {form.active && <Icon icon="solar:check-read-bold" className="w-3.5 h-3.5 text-[#07110B]" />}
        </div>
        <span className="text-xs font-semibold text-[#E8EFEB]">
          {form.active ? 'Active' : 'Inactive'}
        </span>
      </button>
    </div>
  );
}
