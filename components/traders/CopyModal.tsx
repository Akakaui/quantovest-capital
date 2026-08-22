'use client';

import React, { useState } from 'react';
import { Icon } from '@iconify/react';

interface CopyModalProps {
  isOpen: boolean;
  traderId: string;
  traderName: string;
  onClose: () => void;
  onSuccess: (traderId: string) => void;
}

export default function CopyModal({ isOpen, traderId, traderName, onClose, onSuccess }: CopyModalProps) {
  const [allocation, setAllocation] = useState('1500');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    const cents = Math.round(parseFloat(allocation) * 100);
    if (isNaN(cents) || cents < 150000) {
      setError('Minimum allocation is $1,500.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/traders/copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ traderId, allocationCents: cents }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Failed to start copying.');
        setSubmitting(false);
        return;
      }
      onSuccess(traderId);
    } catch {
      setError('An error occurred.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#141C1F] border border-[#263437] rounded-2xl max-w-sm w-full p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Copy Strategy</h3>
          <button onClick={onClose} className="text-[#93A09A] hover:text-white">
            <Icon icon="solar:close-bold" className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-[#93A09A]">
          Allocate funds to copy <span className="text-[#22C55E] font-semibold">{traderName}</span>&apos;s strategy.
          Minimum allocation is $1,500.
        </p>

        {error && <p className="text-xs text-rose-400">{error}</p>}

        <label className="text-xs text-[#93A09A] block">
          Allocation Amount (USD)
          <div className="relative mt-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#93A09A]">$</span>
            <input
              type="number"
              min="1500"
              step="100"
              value={allocation}
              onChange={e => { setAllocation(e.target.value); setError(''); }}
              className="w-full rounded-xl border border-[#263437] bg-[#0A0F11] pl-8 pr-4 py-3 text-sm text-white font-mono"
            />
          </div>
        </label>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-full border border-[#263437] text-xs font-medium text-[#93A09A] hover:bg-[#0A0F11]">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-full bg-[#22C55E] text-[#07110B] text-xs font-semibold hover:bg-[#16A34A] disabled:opacity-40"
          >
            {submitting ? 'Connecting...' : 'Start Copying'}
          </button>
        </div>
      </div>
    </div>
  );
}
