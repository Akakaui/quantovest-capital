'use client';

import React, { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { Icon } from '@iconify/react';

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Dubai',
  'Australia/Sydney',
];

const CURRENCIES = ['USD', 'BTC', 'ETH', 'USDT'] as const;

interface PlatformSettings {
  platformName: string;
  supportEmail: string;
  defaultTimezone: string;
  maintenanceMode: boolean;
  minimumDepositCents: number;
  supportedCurrencies: string[];
}

const DEFAULT_SETTINGS: PlatformSettings = {
  platformName: 'Quantovest Capital',
  supportEmail: 'support@quantovest.com',
  defaultTimezone: 'UTC',
  maintenanceMode: false,
  minimumDepositCents: 500000,
  supportedCurrencies: ['USD'],
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('quantovest_platform_settings');
      if (stored) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
    } catch {}
  }, []);

  function handleChange(field: keyof PlatformSettings, value: unknown) {
    setSettings(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  function toggleCurrency(currency: string) {
    setSettings(prev => {
      const current = prev.supportedCurrencies;
      const next = current.includes(currency)
        ? current.filter(c => c !== currency)
        : [...current, currency];
      return { ...prev, supportedCurrencies: next };
    });
    setSaved(false);
  }

  function handleSave() {
    setSaving(true);
    try {
      localStorage.setItem('quantovest_platform_settings', JSON.stringify(settings));
      setSaved(true);
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
            <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
            CONFIGURATION
          </div>
          <h1 className="text-2xl font-normal text-[#E8EFEB]">Platform Settings</h1>
          <p className="text-xs text-[#93A09A]">Configure global platform defaults and operational parameters.</p>
        </div>

        {saved && (
          <div className="rounded-xl border border-[#22C55E]/50 bg-[#22C55E]/10 p-4 text-xs text-[#86EFAC]">
            Settings saved successfully.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General Settings */}
          <div className="bg-[#151E23] border border-[#2B393F] rounded-2xl p-6 space-y-5">
            <h3 className="text-sm font-semibold text-[#E8EFEB]">General</h3>

            <label className="text-xs text-[#93A09A] block">
              Platform Name
              <input
                value={settings.platformName}
                onChange={e => handleChange('platformName', e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#2B393F] bg-[#0D1215] px-4 py-3 text-sm text-white placeholder-[#7F8C86]"
              />
            </label>

            <label className="text-xs text-[#93A09A] block">
              Support Email
              <input
                type="email"
                value={settings.supportEmail}
                onChange={e => handleChange('supportEmail', e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#2B393F] bg-[#0D1215] px-4 py-3 text-sm text-white placeholder-[#7F8C86]"
              />
            </label>

            <label className="text-xs text-[#93A09A] block">
              Default Timezone
              <select
                value={settings.defaultTimezone}
                onChange={e => handleChange('defaultTimezone', e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#2B393F] bg-[#0D1215] px-4 py-3 text-sm text-white"
              >
                {TIMEZONES.map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </label>

            <label className="text-xs text-[#93A09A] block">
              Minimum Deposit Amount (USD cents)
              <input
                type="number"
                value={settings.minimumDepositCents}
                onChange={e => handleChange('minimumDepositCents', Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-[#2B393F] bg-[#0D1215] px-4 py-3 text-sm text-white placeholder-[#7F8C86]"
              />
              <span className="text-[10px] text-[#7F8C86] mt-1 block">
                Currently: ${(settings.minimumDepositCents / 100).toLocaleString('en-US')}
              </span>
            </label>
          </div>

          {/* Operational Settings */}
          <div className="bg-[#151E23] border border-[#2B393F] rounded-2xl p-6 space-y-5">
            <h3 className="text-sm font-semibold text-[#E8EFEB]">Operations</h3>

            <button
              onClick={() => handleChange('maintenanceMode', !settings.maintenanceMode)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                settings.maintenanceMode
                  ? 'border-amber-500/50 bg-amber-500/10'
                  : 'border-[#2B393F] bg-[#0D1215]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  icon="solar:power-bold"
                  className={`w-5 h-5 ${settings.maintenanceMode ? 'text-amber-400' : 'text-[#93A09A]'}`}
                />
                <div className="text-left">
                  <p className="text-xs font-semibold text-[#E8EFEB]">Maintenance Mode</p>
                  <p className="text-[10px] text-[#93A09A]">
                    {settings.maintenanceMode ? 'Platform is in maintenance mode' : 'Platform is live'}
                  </p>
                </div>
              </div>
              <div className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 ${
                settings.maintenanceMode ? 'bg-amber-500 justify-end' : 'bg-[#2B393F] justify-start'
              }`}>
                <div className="w-5 h-5 rounded-full bg-white shadow" />
              </div>
            </button>

            <div className="space-y-3">
              <p className="text-xs font-semibold text-[#E8EFEB]">Supported Currencies</p>
              <div className="grid grid-cols-2 gap-3">
                {CURRENCIES.map(currency => {
                  const active = settings.supportedCurrencies.includes(currency);
                  return (
                    <button
                      key={currency}
                      onClick={() => toggleCurrency(currency)}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        active
                          ? 'border-[#22C55E] bg-[#22C55E]/10'
                          : 'border-[#2B393F] bg-[#0D1215] hover:border-[#93A09A]/30'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                        active ? 'border-[#22C55E] bg-[#22C55E]' : 'border-[#93A09A]'
                      }`}>
                        {active && <Icon icon="solar:check-read-bold" className="w-3.5 h-3.5 text-[#07110B]" />}
                      </div>
                      <span className="text-xs font-semibold text-[#E8EFEB]">{currency}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-[#22C55E] px-8 py-3 text-xs font-semibold text-[#07110B] disabled:opacity-40 hover:bg-[#86EFAC] transition-colors"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </main>
    </div>
  );
}
