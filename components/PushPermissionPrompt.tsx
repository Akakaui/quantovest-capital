'use client';

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

export default function PushPermissionPrompt() {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setSupported(true);
      setPermission(Notification.permission);
    }
    const wasDismissed = localStorage.getItem('quantovest_push_dismissed');
    if (wasDismissed) setDismissed(true);
  }, []);

  if (!supported || permission !== 'default' || dismissed) return null;

  async function handleEnable() {
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === 'granted') {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_KEY,
        });
        const sub = subscription.toJSON();
        if (sub.endpoint && sub.keys) {
          await fetch('/api/push/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              endpoint: sub.endpoint,
              p256dh: sub.keys.p256dh,
              auth: sub.keys.auth,
            }),
          });
        }
      } catch { /* ignore */ }
    }
  }

  function handleDismiss() {
    setDismissed(true);
    localStorage.setItem('quantovest_push_dismissed', 'true');
  }

  return (
    <div className="p-4 bg-[#141C1F] border border-[#263437] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 flex items-center justify-center text-[#22C55E]">
          <Icon icon="solar:bell-bold" className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-semibold text-[#F3F7F4]">Enable Push Notifications</p>
          <p className="text-[10px] text-[#93A09A]">Get instant alerts for deposits, withdrawals, and ROI updates.</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={handleDismiss} className="px-3 py-1.5 rounded-full text-[10px] text-[#93A09A] hover:text-white transition-colors">
          Later
        </button>
        <button onClick={handleEnable} className="px-4 py-1.5 rounded-full bg-[#22C55E] text-[#0A0D0C] text-[10px] font-semibold hover:bg-[#16A34A] transition-colors">
          Enable
        </button>
      </div>
    </div>
  );
}
