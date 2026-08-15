'use client';

import React from 'react';
import InvestorSidebar from '@/components/InvestorSidebar';
import { useQuantovestStore } from '@/lib/store';
import { Icon } from '@iconify/react';

export default function SettingsPage() {
  const { user } = useQuantovestStore();

  return (
    <div className="min-h-screen bg-[#0A0F11] text-[#F3F7F4] flex flex-col md:flex-row font-sans">
      <InvestorSidebar />

      <main className="flex-1 p-4 sm:p-8 space-y-8 overflow-y-auto pb-24 md:pb-8">
        <div className="border-b border-[#263437] pb-6 space-y-1">
          <h1 className="text-2xl font-normal text-[#F3F7F4]">Account Settings</h1>
          <p className="text-xs text-[#93A09A]">Manage your investor profile, security preferences, and notifications.</p>
        </div>

        <div className="max-w-2xl bg-[#141C1F] border border-[#263437] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-[#263437]">
            <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full border-2 border-[#22C55E]/40 object-cover" />
            <div>
              <h3 className="text-lg font-medium text-[#F3F7F4]">{user.name}</h3>
              <p className="text-xs text-[#93A09A] font-mono">{user.email}</p>
              <span className="text-[10px] bg-[#22C55E]/10 text-[#22C55E] px-2.5 py-0.5 rounded-full font-mono mt-1 inline-block">
                {user.plan} Plan Investor
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-[#F3F7F4]">Security & 2FA</h4>
            <div className="p-4 bg-[#0A0F11] border border-[#263437] rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#F3F7F4]">Two-Factor Authentication (2FA)</p>
                <p className="text-[10px] text-[#93A09A]">Require OTP code for withdrawal requests</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#22C55E]/10 text-[#22C55E] text-xs font-mono font-semibold">
                ENABLED
              </span>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#263437]">
            <h4 className="text-sm font-semibold text-[#F3F7F4]">Notification Preferences</h4>
            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-3 bg-[#0A0F11] rounded-xl border border-[#263437] text-[#93A09A]">
                <span>Daily ROI Performance Email Summaries</span>
                <input type="checkbox" defaultChecked className="accent-[#22C55E]" />
              </label>
              <label className="flex items-center justify-between p-3 bg-[#0A0F11] rounded-xl border border-[#263437] text-[#93A09A]">
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
