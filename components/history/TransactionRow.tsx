'use client';

import React from 'react';
import { Icon } from '@iconify/react';

interface TransactionRowProps {
  id: string;
  type: string;
  amountCents: number;
  description: string | null;
  createdAt: string;
}

function typeIcon(type: string): string {
  if (type === 'deposit') return 'solar:wallet-money-bold';
  if (type === 'roi' || type === 'profit') return 'solar:graph-bold';
  if (type === 'withdrawal') return 'solar:card-send-bold';
  if (type === 'referral_reward') return 'solar:share-bold';
  if (type === 'credit' || type === 'balance_credit') return 'solar:add-circle-bold';
  if (type === 'plan_assignment' || type === 'plan_purchase') return 'solar:medal-ribbon-bold';
  return 'solar:refresh-bold';
}

function typeColor(type: string): string {
  if (type === 'deposit') return 'bg-[#22C55E]/10 text-[#22C55E]';
  if (type === 'roi' || type === 'profit') return 'bg-blue-500/10 text-blue-400';
  if (type === 'withdrawal') return 'bg-amber-500/10 text-amber-400';
  if (type === 'referral_reward') return 'bg-purple-500/10 text-purple-400';
  if (type === 'credit' || type === 'balance_credit') return 'bg-[#22C55E]/10 text-[#22C55E]';
  if (type === 'plan_assignment' || type === 'plan_purchase') return 'bg-sky-500/10 text-sky-400';
  return 'bg-[#263437] text-[#93A09A]';
}

function typeLabel(type: string): string {
  if (type === 'deposit') return 'Deposit';
  if (type === 'roi') return 'ROI Credit';
  if (type === 'profit') return 'Profit';
  if (type === 'withdrawal') return 'Withdrawal';
  if (type === 'referral_reward') return 'Referral Bonus';
  if (type === 'credit' || type === 'balance_credit') return 'Account Credit';
  if (type === 'plan_assignment') return 'Plan Assigned';
  if (type === 'plan_purchase') return 'Plan Purchase';
  return 'Transaction';
}

export default function TransactionRow({ type, amountCents, description, createdAt }: TransactionRowProps) {
  const isPositive = amountCents >= 0;
  return (
    <div className="p-4 bg-[#0A0F11] border border-[#263437] rounded-xl flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${typeColor(type)}`}>
          <Icon icon={typeIcon(type)} className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-semibold text-[#F3F7F4]">{typeLabel(type)}</p>
          <p className="text-[10px] text-[#93A09A] font-mono">{new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</p>
          {description && <p className="text-[10px] text-[#74817B] mt-0.5 max-w-xs truncate">{description}</p>}
        </div>
      </div>
      <span className={`text-sm font-mono font-semibold ${isPositive ? 'text-[#22C55E]' : 'text-[#CF202F]'}`}>
        {isPositive ? '+' : ''}{(amountCents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
      </span>
    </div>
  );
}
