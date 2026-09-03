'use client';

import React from 'react';
import { Icon } from '@iconify/react';

interface FilterBarProps {
  typeFilter: string;
  onTypeFilterChange: (type: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'deposit', label: 'Deposits' },
  { value: 'roi', label: 'ROI Credits' },
  { value: 'profit', label: 'Profits' },
  { value: 'credit', label: 'Account Credits' },
  { value: 'withdrawal', label: 'Withdrawals' },
  { value: 'referral_reward', label: 'Referral Rewards' },
  { value: 'plan_assignment', label: 'Plan Changes' },
];

export default function FilterBar({ typeFilter, onTypeFilterChange, searchQuery, onSearchChange }: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {typeOptions.map(opt => (
          <button
            key={opt.value}
            onClick={() => onTypeFilterChange(opt.value)}
            className={`px-3 py-1.5 rounded-full text-[10px] font-medium whitespace-nowrap transition-colors ${
              typeFilter === opt.value
                ? 'bg-[#4ADE80] text-[#07110B]'
                : 'bg-[#151D20] border border-[#263437] text-[#9AA7A0] hover:border-[#4ADE80]/50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="relative flex-1 max-w-xs">
        <Icon icon="solar:magnifer-bold" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#74817B]" />
        <input
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search transactions..."
          className="w-full rounded-xl border border-[#263437] bg-[#151D20] pl-10 pr-4 py-2 text-xs text-white placeholder-[#74817B]"
        />
      </div>
    </div>
  );
}
