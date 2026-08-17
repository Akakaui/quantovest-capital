'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';

type Notice = { id: number; title: string; body: string; type: string; isRead: number; createdAt: string };

function typeIcon(type: string): string {
  if (type.includes('deposit')) return 'solar:wallet-bold';
  if (type.includes('withdrawal')) return 'solar:card-transfer-bold';
  if (type.includes('kyc')) return 'solar:shield-check-bold';
  if (type.includes('roi')) return 'solar:graph-bold';
  if (type.includes('referral')) return 'solar:share-bold';
  if (type.includes('security')) return 'solar:lock-bold';
  if (type.includes('admin')) return 'solar:buildings-2-bold';
  return 'solar:bell-bold';
}

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notice[]>([]);
  const [unread, setUnread] = useState(0);

  async function load() {
    const response = await fetch('/api/notifications', { cache: 'no-store' });
    if (response.ok) {
      const data = await response.json();
      setItems(data.items ?? []);
      setUnread(data.unreadCount ?? 0);
    }
  }

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 30000);
    return () => window.clearInterval(timer);
  }, []);

  async function mark(id?: number) {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(id ? { id } : { all: true }),
    });
    await load();
  }

  return (
    <div className="relative">
      <button
        aria-label="Notifications"
        onClick={() => setOpen(value => !value)}
        className="relative rounded-full border border-white/10 bg-white/[.04] p-2 text-[#d8e5dd] hover:bg-white/[.08]"
      >
        <Icon icon="solar:bell-bold" className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-[#d6a85c] px-1 text-[9px] font-bold text-[#07100c]">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-[#101714] p-3 shadow-2xl">
          <div className="flex items-center justify-between px-2 pb-2">
            <p className="text-xs font-semibold text-white">Notifications</p>
            {unread > 0 && (
              <button onClick={() => void mark()} className="text-[10px] text-[#d6a85c]">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-2 py-6 text-center text-xs text-[#94a59a]">No notifications yet.</p>
            ) : (
              items.map(item => (
                <button
                  key={item.id}
                  onClick={() => void mark(item.id)}
                  className={`flex items-start gap-3 w-full rounded-xl p-3 text-left transition-colors ${
                    item.isRead ? 'bg-white/[.02] hover:bg-white/[.04]' : 'bg-[#d6a85c]/10 hover:bg-[#d6a85c]/15'
                  }`}
                >
                  <div className={`mt-0.5 shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${
                    item.isRead ? 'bg-white/[.06]' : 'bg-[#d6a85c]/20'
                  }`}>
                    <Icon icon={typeIcon(item.type)} className={`w-3.5 h-3.5 ${item.isRead ? 'text-[#7f9185]' : 'text-[#d6a85c]'}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`text-xs font-semibold truncate ${item.isRead ? 'text-[#b9c6bd]' : 'text-white'}`}>{item.title}</p>
                      {!item.isRead && <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-[#d6a85c]" />}
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-[#b9c6bd] line-clamp-2">{item.body}</p>
                    <p className="mt-1 text-[9px] text-[#7f9185]">{new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
