'use client';

import React, { useState } from 'react';
import InvestorSidebar from '@/components/InvestorSidebar';
import { useQuantovestStore } from '@/lib/store';

export default function SettingsPage() {
  const { user } = useQuantovestStore();
  const [name, setName] = useState(user.name);
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setMessage('');
    let imagePath = '';
    if (image) {
      const form = new FormData(); form.append('file', image); form.append('purpose', 'avatar');
      const upload = await fetch('/api/uploads', { method: 'POST', body: form });
      const uploadData = await upload.json().catch(() => ({}));
      if (!upload.ok) { setMessage(uploadData.error ?? 'Avatar upload failed.'); setSaving(false); return; }
      imagePath = `${uploadData.bucket}/${uploadData.path}`;
    }
    const response = await fetch('/api/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, image: imagePath || undefined }) });
    const data = await response.json().catch(() => ({}));
    setMessage(response.ok ? 'Profile saved.' : data.error ?? 'Profile save failed.');
    setSaving(false);
  }

  return <div className="min-h-screen bg-[#0A0F11] text-[#F3F7F4] flex flex-col md:flex-row font-sans"><InvestorSidebar /><main className="flex-1 p-4 sm:p-8 space-y-8 overflow-y-auto pb-24 md:pb-8"><div className="border-b border-[#263437] pb-6 space-y-1"><h1 className="text-2xl font-normal">Account Settings</h1><p className="text-xs text-[#93A09A]">Manage your investor profile, security preferences, and notifications.</p></div>{message && <div role="status" className="rounded-xl border border-[#22C55E]/50 bg-[#22C55E]/10 p-4 text-xs text-[#86EFAC]">{message}</div>}<div className="max-w-2xl bg-[#141C1F] border border-[#263437] rounded-2xl p-6 sm:p-8 space-y-6"><form onSubmit={saveProfile} className="flex flex-col gap-4 pb-6 border-b border-[#263437]"><div className="flex items-center gap-4"><img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full border-2 border-[#22C55E]/40 object-cover" /><div><h3 className="text-lg font-medium">{user.name}</h3><p className="text-xs text-[#93A09A] font-mono">{user.email}</p><span className="text-[10px] bg-[#22C55E]/10 text-[#22C55E] px-2.5 py-0.5 rounded-full font-mono mt-1 inline-block">{user.plan} Plan Investor</span></div></div><label className="text-xs text-[#93A09A]">Display name<input value={name} onChange={event => setName(event.target.value)} className="mt-1 w-full rounded-xl border border-[#263437] bg-[#0A0F11] px-4 py-3 text-sm text-white" /></label><label className="text-xs text-[#93A09A]">Avatar image<input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => setImage(event.target.files?.[0] ?? null)} className="mt-1 w-full text-xs" /></label><button disabled={saving} className="self-start rounded-full bg-[#22C55E] px-5 py-3 text-xs font-semibold text-[#07110B] disabled:opacity-40">{saving ? 'Saving…' : 'Save Profile'}</button></form><div className="space-y-4"><h4 className="text-sm font-semibold">Security & 2FA</h4><div className="p-4 bg-[#0A0F11] border border-[#263437] rounded-xl flex items-center justify-between"><div><p className="text-xs font-semibold">Two-Factor Authentication (2FA)</p><p className="text-[10px] text-[#93A09A]">Require OTP code for withdrawal requests</p></div><span className="px-3 py-1 rounded-full bg-[#22C55E]/10 text-[#22C55E] text-xs font-mono font-semibold">ENABLED</span></div></div><div className="space-y-4 pt-4 border-t border-[#263437]"><h4 className="text-sm font-semibold">Notification Preferences</h4><div className="space-y-2 text-xs"><label className="flex items-center justify-between p-3 bg-[#0A0F11] rounded-xl border border-[#263437] text-[#93A09A]"><span>Daily ROI Performance Email Summaries</span><input type="checkbox" defaultChecked className="accent-[#22C55E]" /></label><label className="flex items-center justify-between p-3 bg-[#0A0F11] rounded-xl border border-[#263437] text-[#93A09A]"><span>Strategy Performance Alerts</span><input type="checkbox" defaultChecked className="accent-[#22C55E]" /></label></div></div></div></main></div>;
}
