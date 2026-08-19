'use client';

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

interface CopiedTrader {
  id: number;
  traderId: string;
  allocationCents: number;
  status: string;
  createdAt: string;
  trader: {
    id: string;
    name: string;
    imageUrl: string | null;
    imagePath: string | null;
    specialty: string;
    winRateBps: number;
    thirtyDayReturnBps: number;
  } | null;
}

interface MyCopiesProps {
  onRefresh?: () => void;
}

export default function MyCopies({ onRefresh }: MyCopiesProps) {
  const [copies, setCopies] = useState<CopiedTrader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/traders/my');
        if (res.ok) setCopies(await res.json());
      } catch { /* ignore */ }
      setLoading(false);
    }
    void load();
  }, []);

  async function handleStop(id: number) {
    await fetch(`/api/traders/copy/${id}`, { method: 'DELETE' });
    setCopies(prev => prev.filter(c => c.id !== id));
    onRefresh?.();
  }

  if (loading || copies.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-[#F3F7F4] flex items-center gap-2">
        <Icon icon="solar:users-group-rounded-bold" className="w-4 h-4 text-[#22C55E]" />
        Your Active Copies ({copies.length})
      </h3>
      {copies.map(copy => (
        <div key={copy.id} className="p-4 bg-[#141C1F] border border-[#22C55E]/30 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={copy.trader?.imageUrl || copy.trader?.imagePath || `https://api.dicebear.com/7.x/avataaars/svg?seed=${copy.trader?.name}`}
              alt={copy.trader?.name}
              className="w-9 h-9 rounded-full object-cover border border-[#22C55E]/40"
            />
            <div>
              <p className="text-xs font-semibold text-[#F3F7F4]">{copy.trader?.name ?? 'Unknown Trader'}</p>
              <p className="text-[10px] text-[#93A09A] font-mono">{copy.trader?.specialty}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-[#22C55E]">${(copy.allocationCents / 100).toLocaleString()}</span>
            <button
              onClick={() => handleStop(copy.id)}
              className="px-2 py-1 rounded-full border border-rose-500/30 text-rose-400 text-[10px] font-medium hover:bg-rose-500/10 transition-colors"
            >
              Stop
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
