'use client';

import React, { useState, useEffect } from 'react';
import InvestorSidebar from '@/components/InvestorSidebar';
import { generateSecret, getQRCodeUrl, verifyTOTP } from '@/lib/totp';
import { Icon } from '@iconify/react';
import { createClient } from '@/lib/supabase/client';

interface Profile {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
  balance: number;
  totalInvested: number;
  totalProfit: number;
  dailyRoiPercent: number;
  allTimeRoiPercent: number;
  plan: string;
  kycStatus: string;
  onboardingCompleted: boolean;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  payoutDetails?: Record<string, string>;
  notificationPrefs?: Record<string, boolean>;
  unusedRecoveryCodeCount?: number;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile>({
    id: '', name: '', email: '', avatar: null, role: 'investor',
    balance: 0, totalInvested: 0, totalProfit: 0, dailyRoiPercent: 0,
    allTimeRoiPercent: 0, plan: 'None', kycStatus: 'unverified',
    onboardingCompleted: false,
  });
  const [name, setName] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const [show2faModal, setShow2faModal] = useState(false);
  const [pendingSecret, setPendingSecret] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [showDisable, setShowDisable] = useState(false);

  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [showRecoveryView, setShowRecoveryView] = useState(false);
  const [unusedCount, setUnusedCount] = useState(0);

  const [cryptoAddress, setCryptoAddress] = useState('');
  const [cryptoNetwork, setCryptoNetwork] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [payoutMsg, setPayoutMsg] = useState('');
  const [savingPayout, setSavingPayout] = useState(false);

  const [notifyDailyRoi, setNotifyDailyRoi] = useState(true);
  const [notifyStrategyAlerts, setNotifyStrategyAlerts] = useState(true);
  const [notifyMsg, setNotifyMsg] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function loadProfile() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const user = session.user;
      const authName = (user.user_metadata?.name as string) || (user.email ?? '').split('@')[0];
      const authProfile: Profile = {
        id: user.id,
        name: authName,
        email: user.email ?? '',
        avatar: (user.user_metadata?.avatar_url as string) || null,
        role: 'investor',
        balance: 0,
        totalInvested: 0,
        totalProfit: 0,
        dailyRoiPercent: 0,
        allTimeRoiPercent: 0,
        plan: 'None',
        kycStatus: 'unverified',
        onboardingCompleted: false,
      };
      if (!cancelled) {
        setProfile(authProfile);
        setName(authProfile.name);
      }

      const headers = { Authorization: `Bearer ${session.access_token}` };
      try {
        const [profileRes, settingsRes] = await Promise.allSettled([
          fetch('/api/investor-profile', { headers }),
          fetch('/api/profile', { headers }),
        ]);
        if (cancelled) return;

        if (profileRes.status === 'fulfilled' && profileRes.value.ok) {
          const data = await profileRes.value.json();
          setProfile(prev => prev ? { ...prev, ...data } : data);
          setName(data.name ?? '');
        }
        if (settingsRes.status === 'fulfilled' && settingsRes.value.ok) {
          const settings = await settingsRes.value.json();
          if (settings.payoutDetails) {
            const pd = typeof settings.payoutDetails === 'string' ? JSON.parse(settings.payoutDetails) : settings.payoutDetails;
            setCryptoAddress(pd.cryptoAddress || '');
            setCryptoNetwork(pd.cryptoNetwork || '');
            setBankName(pd.bankName || '');
            setBankAccountName(pd.bankAccountName || '');
            setBankAccountNumber(pd.bankAccountNumber || '');
          }
          if (settings.notificationPrefs) {
            const np = typeof settings.notificationPrefs === 'string' ? JSON.parse(settings.notificationPrefs) : settings.notificationPrefs;
            setNotifyDailyRoi(np.notifyDailyRoi ?? true);
            setNotifyStrategyAlerts(np.notifyStrategyAlerts ?? true);
          }
          if (settings.twoFactorEnabled !== undefined) {
            setProfile(p => ({ ...p, twoFactorEnabled: settings.twoFactorEnabled, twoFactorSecret: settings.twoFactorSecret, unusedRecoveryCodeCount: settings.unusedRecoveryCodeCount }));
          }
        }
      } catch { /* ignore - auth data is already shown */ }
    }
    void loadProfile();
    return () => { cancelled = true; };
  }, []);

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

  function handleConfigure2FA() {
    const secret = generateSecret();
    setPendingSecret(secret);
    setVerifyCode('');
    setShow2faModal(true);
  }

  async function handleVerify2FA() {
    if (verifyTOTP(pendingSecret, verifyCode)) {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ twoFactorEnabled: true, twoFactorSecret: pendingSecret }),
      });
      const data = await res.json().catch(() => ({}));
      setProfile(p => ({ ...p, twoFactorEnabled: true, twoFactorSecret: pendingSecret }));
      setShow2faModal(false);
      if (data.recoveryCodes && data.recoveryCodes.length > 0) {
        setRecoveryCodes(data.recoveryCodes);
        setShowRecoveryModal(true);
      }
      setMessage('Two-factor authentication enabled successfully.');
    } else {
      setMessage('Invalid verification code. Please try again.');
    }
  }

  async function handleDisable2FA() {
    if (profile.twoFactorSecret && verifyTOTP(profile.twoFactorSecret, disableCode)) {
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ twoFactorEnabled: false, twoFactorSecret: '' }),
      });
      setProfile(p => ({ ...p, twoFactorEnabled: false, twoFactorSecret: '' }));
      setShowDisable(false);
      setDisableCode('');
      setMessage('Two-factor authentication disabled.');
    } else {
      setMessage('Invalid code. Cannot disable 2FA.');
    }
  }

  async function handleSavePayout() {
    setSavingPayout(true); setPayoutMsg('');
    await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payoutDetails: { cryptoAddress, cryptoNetwork, bankName, bankAccountName, bankAccountNumber } }),
    });
    setPayoutMsg('Payout details saved.');
    setSavingPayout(false);
  }

  async function handleSaveNotifications() {
    await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationPrefs: { notifyDailyRoi, notifyStrategyAlerts } }),
    });
    setNotifyMsg('Notification preferences saved.');
  }

  function copyRecoveryCodes() {
    navigator.clipboard.writeText(recoveryCodes.join('\n')).catch(() => {});
  }

  function downloadRecoveryCodes() {
    const blob = new Blob([recoveryCodes.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quantovest-recovery-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-[#0A0F11] text-[#F3F7F4] flex flex-col md:flex-row font-sans">
      <InvestorSidebar />
      <main className="flex-1 p-4 sm:p-8 space-y-8 overflow-y-auto pb-24 md:pb-8">
        <div className="border-b border-[#263437] pb-6 space-y-1">
          <h1 className="text-2xl font-normal">Account Settings</h1>
          <p className="text-xs text-[#93A09A]">Manage your investor profile, security preferences, and notifications.</p>
        </div>

        {message && (
          <div role="status" className="rounded-xl border border-[#22C55E]/50 bg-[#22C55E]/10 p-4 text-xs text-[#86EFAC]">{message}</div>
        )}

        <div className="max-w-2xl bg-[#141C1F] border border-[#263437] rounded-2xl p-6 sm:p-8 space-y-6">
          {/* Profile Section */}
          <form onSubmit={saveProfile} className="flex flex-col gap-4 pb-6 border-b border-[#263437]">
            <div className="flex items-center gap-3 sm:gap-4">
              <img src={profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`} alt={profile.name} className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-[#22C55E]/40 object-cover shrink-0" />
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-medium truncate">{profile.name}</h3>
                <p className="text-xs text-[#93A09A] font-mono truncate">{profile.email}</p>
                <span className="text-[10px] bg-[#22C55E]/10 text-[#22C55E] px-2.5 py-0.5 rounded-full font-mono mt-1 inline-block">{profile.plan} Plan Investor</span>
              </div>
            </div>
            <label className="text-xs text-[#93A09A]">Display name
              <input value={name} onChange={event => setName(event.target.value)} className="mt-1 w-full rounded-xl border border-[#263437] bg-[#0A0F11] px-4 py-3 text-sm text-white" />
            </label>
            <label className="text-xs text-[#93A09A]">Avatar image
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => setImage(event.target.files?.[0] ?? null)} className="mt-1 w-full text-xs" />
            </label>
            <button disabled={saving} className="self-start rounded-full bg-[#22C55E] px-5 py-3 text-xs font-semibold text-[#07110B] disabled:opacity-40">
              {saving ? 'Saving\u2026' : 'Save Profile'}
            </button>
          </form>

          {/* Security & 2FA Section */}
          <div className="space-y-4 pb-6 border-b border-[#263437]">
            <h4 className="text-sm font-semibold">Security & 2FA</h4>
            <div className="p-4 bg-[#0A0F11] border border-[#263437] rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#F3F7F4]">Two-Factor Authentication</p>
                <p className="text-[10px] text-[#93A09A] mt-0.5">
                  {profile.twoFactorEnabled ? 'Enabled \u2014 withdrawals require a TOTP code' : 'Disabled \u2014 enable for extra security'}
                </p>
              </div>
              {profile.twoFactorEnabled ? (
                <button onClick={() => { setShowDisable(true); setDisableCode(''); }} className="px-4 py-2 rounded-full border border-rose-500/30 text-rose-400 text-[10px] font-semibold hover:bg-rose-500/10 transition-colors">
                  Disable 2FA
                </button>
              ) : (
                <button onClick={handleConfigure2FA} className="px-4 py-2 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] text-[10px] font-semibold hover:bg-[#22C55E]/20 transition-colors">
                  Configure 2FA
                </button>
              )}
            </div>
            {profile.twoFactorEnabled && (
              <div className="p-4 bg-[#0A0F11] border border-[#263437] rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#F3F7F4]">Recovery Codes</p>
                  <p className="text-[10px] text-[#93A09A] mt-0.5">Use these if you lose access to your authenticator</p>
                </div>
                <button onClick={() => setShowRecoveryView(true)} className="px-4 py-2 rounded-full border border-[#263437] text-[#93A09A] text-[10px] font-semibold hover:bg-[#1A1F24] transition-colors">
                  View Codes {profile.unusedRecoveryCodeCount != null && `(${profile.unusedRecoveryCodeCount})`}
                </button>
              </div>
            )}
          </div>

          {/* Payout Details Section */}
          <div className="space-y-4 pb-6 border-b border-[#263437]">
            <h4 className="text-sm font-semibold">Payout Details</h4>
            <p className="text-[10px] text-[#93A09A]">Saved details are used when submitting withdrawal requests.</p>
            {payoutMsg && <div className="text-xs text-[#22C55E]">{payoutMsg}</div>}
            <div className="space-y-3">
              <label className="text-xs text-[#93A09A] block">Crypto Wallet Address
                <input value={cryptoAddress} onChange={e => setCryptoAddress(e.target.value)} placeholder="0x..." className="mt-1 w-full rounded-xl border border-[#263437] bg-[#0A0F11] px-4 py-3 text-sm text-white font-mono" />
              </label>
              <label className="text-xs text-[#93A09A] block">Crypto Network
                <select value={cryptoNetwork} onChange={e => setCryptoNetwork(e.target.value)} className="mt-1 w-full rounded-xl border border-[#263437] bg-[#0A0F11] px-4 py-3 text-sm text-white">
                  <option value="">Select network</option>
                  <option value="ERC-20">ERC-20 (Ethereum)</option>
                  <option value="TRC-20">TRC-20 (Tron)</option>
                  <option value="BEP-20">BEP-20 (BSC)</option>
                  <option value="BTC">Bitcoin</option>
                </select>
              </label>
              <div className="border-t border-[#263437] pt-3" />
              <label className="text-xs text-[#93A09A] block">Bank Name
                <input value={bankName} onChange={e => setBankName(e.target.value)} placeholder="e.g. Chase, HSBC" className="mt-1 w-full rounded-xl border border-[#263437] bg-[#0A0F11] px-4 py-3 text-sm text-white" />
              </label>
              <label className="text-xs text-[#93A09A] block">Account Holder Name
                <input value={bankAccountName} onChange={e => setBankAccountName(e.target.value)} placeholder="Full name on account" className="mt-1 w-full rounded-xl border border-[#263437] bg-[#0A0F11] px-4 py-3 text-sm text-white" />
              </label>
              <label className="text-xs text-[#93A09A] block">Account Number / IBAN
                <input value={bankAccountNumber} onChange={e => setBankAccountNumber(e.target.value)} placeholder="Account number or IBAN" className="mt-1 w-full rounded-xl border border-[#263437] bg-[#0A0F11] px-4 py-3 text-sm text-white font-mono" />
              </label>
            </div>
            <button onClick={handleSavePayout} disabled={savingPayout} className="self-start rounded-full bg-[#22C55E] px-5 py-3 text-xs font-semibold text-[#07110B] disabled:opacity-40">
              {savingPayout ? 'Saving\u2026' : 'Save Payout Details'}
            </button>
          </div>

          {/* Notification Preferences Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Notification Preferences</h4>
            {notifyMsg && <div className="text-xs text-[#22C55E]">{notifyMsg}</div>}

            <div className="p-3 bg-[#0A0F11] border border-[#263437] rounded-xl space-y-1">
              <p className="text-[10px] uppercase font-mono text-[#93A09A]">Always-on notifications</p>
              <p className="text-xs text-[#B9C6BD]">Deposit status, KYC status, withdrawal status, security alerts, and plan changes cannot be disabled.</p>
            </div>

            <label className="flex items-center gap-3 p-4 bg-[#0A0F11] border border-[#263437] rounded-xl cursor-pointer hover:border-[#22C55E]/30 transition-colors">
              <input type="checkbox" checked={notifyDailyRoi} onChange={e => setNotifyDailyRoi(e.target.checked)} className="w-4 h-4 accent-[#22C55E] rounded" />
              <div>
                <p className="text-xs font-semibold text-[#F3F7F4]">Daily ROI Reports</p>
                <p className="text-[10px] text-[#93A09A]">Receive email updates when daily ROI is published to your portfolio.</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-4 bg-[#0A0F11] border border-[#263437] rounded-xl cursor-pointer hover:border-[#22C55E]/30 transition-colors">
              <input type="checkbox" checked={notifyStrategyAlerts} onChange={e => setNotifyStrategyAlerts(e.target.checked)} className="w-4 h-4 accent-[#22C55E] rounded" />
              <div>
                <p className="text-xs font-semibold text-[#F3F7F4]">Strategy &amp; Marketing Alerts</p>
                <p className="text-[10px] text-[#93A09A]">Receive emails about strategy changes, educational content, and platform updates.</p>
              </div>
            </label>
            <button onClick={handleSaveNotifications} className="self-start rounded-full bg-[#22C55E] px-5 py-3 text-xs font-semibold text-[#07110B]">
              Save Preferences
            </button>
          </div>
        </div>

        {/* 2FA Setup Modal */}
        {show2faModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#141C1F] border border-[#263437] rounded-2xl max-w-sm w-full p-6 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">Set Up Two-Factor Authentication</h3>
                <button onClick={() => setShow2faModal(false)} className="text-[#93A09A] hover:text-white">
                  <Icon icon="solar:close-bold" className="w-5 h-5" />
                </button>
              </div>
              <div className="flex justify-center">
                <img src={getQRCodeUrl(profile.email, pendingSecret)} alt="2FA QR Code" className="w-48 h-48 rounded-xl bg-white p-2" />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] text-[#93A09A]">Scan this QR code with Google Authenticator, then enter the 6-digit code below.</p>
                <p className="text-[10px] text-[#93A09A] font-mono break-all">Manual key: {pendingSecret}</p>
              </div>
              <div>
                <label className="text-xs text-[#93A09A] block">Verification Code
                  <input value={verifyCode} onChange={e => setVerifyCode(e.target.value)} maxLength={6} placeholder="000000" className="mt-1 w-full rounded-xl border border-[#263437] bg-[#0A0F11] px-4 py-3 text-sm text-white font-mono text-center tracking-[0.3em]" />
                </label>
              </div>
              <button onClick={handleVerify2FA} disabled={verifyCode.length !== 6} className="w-full rounded-full bg-[#22C55E] px-5 py-3 text-xs font-semibold text-[#07110B] disabled:opacity-40">
                Verify & Enable
              </button>
            </div>
          </div>
        )}

        {/* Disable 2FA Modal */}
        {showDisable && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#141C1F] border border-[#263437] rounded-2xl max-w-sm w-full p-6 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">Disable Two-Factor Authentication</h3>
                <button onClick={() => { setShowDisable(false); setDisableCode(''); }} className="text-[#93A09A] hover:text-white">
                  <Icon icon="solar:close-bold" className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-[#93A09A]">Enter a valid TOTP code from your authenticator app to confirm disabling 2FA.</p>
              <label className="text-xs text-[#93A09A] block">TOTP Code
                <input value={disableCode} onChange={e => setDisableCode(e.target.value)} maxLength={6} placeholder="000000" className="mt-1 w-full rounded-xl border border-[#263437] bg-[#0A0F11] px-4 py-3 text-sm text-white font-mono text-center tracking-[0.3em]" />
              </label>
              <button onClick={handleDisable2FA} disabled={disableCode.length !== 6} className="w-full rounded-full bg-rose-500/20 border border-rose-500/40 px-5 py-3 text-xs font-semibold text-rose-300 disabled:opacity-40">
                Confirm Disable
              </button>
            </div>
          </div>
        )}

        {/* Recovery Codes Display Modal */}
        {showRecoveryModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#141C1F] border border-[#263437] rounded-2xl max-w-sm w-full p-6 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">Your Recovery Codes</h3>
                <button onClick={() => { setShowRecoveryModal(false); setRecoveryCodes([]); }} className="text-[#93A09A] hover:text-white">
                  <Icon icon="solar:close-bold" className="w-5 h-5" />
                </button>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
                <p className="text-[10px] text-amber-300 font-semibold">Save these codes now. They will not be shown again.</p>
                <p className="text-[10px] text-amber-400/70 mt-1">Each code can only be used once. Store them in a safe place.</p>
              </div>
              <div className="bg-[#0A0F11] border border-[#263437] rounded-xl p-4">
                <div className="grid grid-cols-2 gap-2">
                  {recoveryCodes.map((c, i) => (
                    <span key={i} className="text-xs font-mono text-[#F3F7F4] bg-[#141C1F] border border-[#263437] rounded-lg px-3 py-2 text-center">{c}</span>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={copyRecoveryCodes} className="flex-1 rounded-full border border-[#263437] px-4 py-2.5 text-[10px] font-semibold text-[#93A09A] hover:bg-[#1A1F24] transition-colors flex items-center justify-center gap-1.5">
                  <Icon icon="solar:copy-bold" className="w-3.5 h-3.5" /> Copy
                </button>
                <button onClick={downloadRecoveryCodes} className="flex-1 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/30 px-4 py-2.5 text-[10px] font-semibold text-[#22C55E] hover:bg-[#22C55E]/20 transition-colors flex items-center justify-center gap-1.5">
                  <Icon icon="solar:download-bold" className="w-3.5 h-3.5" /> Download
                </button>
              </div>
              <button onClick={() => { setShowRecoveryModal(false); setRecoveryCodes([]); }} className="w-full rounded-full bg-[#22C55E] px-5 py-3 text-xs font-semibold text-[#07110B]">
                I Have Saved My Codes
              </button>
            </div>
          </div>
        )}

        {/* View Recovery Codes Modal */}
        {showRecoveryView && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#141C1F] border border-[#263437] rounded-2xl max-w-sm w-full p-6 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">Recovery Codes</h3>
                <button onClick={() => setShowRecoveryView(false)} className="text-[#93A09A] hover:text-white">
                  <Icon icon="solar:close-bold" className="w-5 h-5" />
                </button>
              </div>
              <div className="bg-[#0A0F11] border border-[#263437] rounded-xl p-4 text-center space-y-2">
                <Icon icon="solar:shield-check-bold" className="w-10 h-10 text-[#22C55E] mx-auto" />
                <p className="text-xs text-[#F3F7F4] font-semibold">2FA is Active</p>
                <p className="text-[10px] text-[#93A09A]">Recovery codes can only be viewed once when 2FA is first enabled. If you have lost your codes, disable and re-enable 2FA to generate new ones.</p>
              </div>
              <button onClick={() => setShowRecoveryView(false)} className="w-full rounded-full bg-[#22C55E] px-5 py-3 text-xs font-semibold text-[#07110B]">
                Close
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
