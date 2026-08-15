'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import { useQuantovestStore } from '@/lib/store';
import { Icon } from '@iconify/react';

export default function SettingsPage() {
  const { user } = useQuantovestStore();

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#0A0D0C] flex flex-col md:flex-row font-sans">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-8 space-y-8 overflow-y-auto pb-24 md:pb-8">
        <div className="border-b border-[#DEE1E6] pb-6 space-y-1">
          <h1 className="text-2xl font-normal text-[#0A0D0C]">Account Settings</h1>
          <p className="text-xs text-[#5B616E]">Manage your investor profile, security preferences, and notifications.</p>
        </div>

        <div className="max-w-2xl bg-white border border-[#DEE1E6] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-[#DEE1E6]">
            <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full border-2 border-[#22C55E]/40 object-cover" />
            <div>
              <h3 className="text-lg font-medium text-[#0A0D0C]">{user.name}</h3>
              <p className="text-xs text-[#5B616E] font-mono">{user.email}</p>
              <span className="text-[10px] bg-[#22C55E]/10 text-[#22C55E] px-2.5 py-0.5 rounded-full font-mono mt-1 inline-block">
                {user.plan} Plan Investor
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-[#0A0D0C]">Security & 2FA</h4>
            <div className="p-4 bg-[#F7F7F7] border border-[#DEE1E6] rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#0A0D0C]">Two-Factor Authentication (2FA)</p>
                <p className="text-[10px] text-[#5B616E]">Require OTP code for withdrawal requests</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#22C55E]/10 text-[#22C55E] text-xs font-mono font-semibold">
                ENABLED
              </span>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#DEE1E6]">
            <h4 className="text-sm font-semibold text-[#0A0D0C]">Notification Preferences</h4>
            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-3 bg-[#F7F7F7] rounded-xl border border-[#DEE1E6] text-[#5B616E]">
                <span>Daily ROI Performance Email Summaries</span>
                <input type="checkbox" defaultChecked className="accent-[#22C55E]" />
              </label>
              <label className="flex items-center justify-between p-3 bg-[#F7F7F7] rounded-xl border border-[#DEE1E6] text-[#5B616E]">
                <span>Strategy Performance Alerts</span>
                <input type="checkbox" defaultChecked className="accent-[#22C55E]" />
              </label>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
