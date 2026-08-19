'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { createClient } from '@/lib/supabase/client';
import NotificationCenter from '@/components/NotificationCenter';

const adminLinks = [
  { label: 'Control Center', href: '/admin', icon: 'solar:widget-add-bold' },
  { label: 'Daily ROI Entry', href: '/admin/performance', icon: 'solar:graph-bold' },
  { label: 'Deposit Queue', href: '/admin/deposits', icon: 'solar:wallet-bold' },
  { label: 'Withdrawal Queue', href: '/admin/withdrawals', icon: 'solar:card-transfer-bold' },
  { label: 'Referral Payouts', href: '/admin/referrals', icon: 'solar:share-bold' },
  { label: 'KYC Queue', href: '/admin/kyc', icon: 'solar:shield-check-bold' },
  { label: 'Investors', href: '/admin/investors', icon: 'solar:user-bold' },
  { label: 'Plans', href: '/admin/plans', icon: 'solar:layers-bold' },
  { label: 'Portfolio Managers', href: '/admin/traders', icon: 'solar:users-group-rounded-bold' },
  { label: 'Notifications', href: '/admin/notifications', icon: 'solar:bell-bold' },
  { label: 'Support', href: '/admin/support', icon: 'solar:chat-round-dots-bold' },
  { label: 'Settings', href: '/admin/settings', icon: 'solar:settings-bold' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; avatar: string | null }>({ name: '', email: '', avatar: null });

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const res = await fetch('/api/investor-profile', { headers: { Authorization: `Bearer ${session.access_token}` } });
        if (res.ok) {
          const data = await res.json();
          setUser({ name: data.name ?? 'Admin', email: data.email ?? '', avatar: data.avatar });
        }
      } catch { /* ignore */ }
    }
    void load();
  }, [supabase]);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  const displayName = user.name || 'Admin';
  const avatarSrc = user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`;

  return (
    <>
      {/* Mobile Sticky Header */}
      <div className="flex md:hidden items-center justify-between px-4 py-3 bg-[#10161A] border-b border-[#263139] sticky top-0 z-40">
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-2 -ml-2 rounded-lg text-[#AAB5AF] hover:text-[#F2F6F3] hover:bg-[#1A2429] transition-colors"
          aria-label="Open menu"
        >
          <Icon icon="solar:hamburger-menu-bold" className="w-5 h-5" />
        </button>
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#1A2429] border border-[#37454A] flex items-center justify-center text-[#F4B860]">
            <Icon icon="solar:buildings-2-bold" className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold text-[#F2F6F3] tracking-tight">QUANTOVEST</span>
        </Link>
        <NotificationCenter />
      </div>

      {/* Drawer Backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Drawer Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-[#10161A] border-r border-[#263139] z-50 md:hidden flex flex-col transform transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 border-b border-[#263139] flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3" onClick={() => setDrawerOpen(false)}>
            <div className="w-9 h-9 rounded-xl bg-[#1A2429] border border-[#37454A] flex items-center justify-center text-[#F4B860]">
              <Icon icon="solar:buildings-2-bold" className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[#F2F6F3] text-base tracking-tight">QUANTOVEST</span>
              <span className="text-[9px] tracking-widest text-[#F4B860] uppercase font-mono block -mt-1">OPERATIONS CONSOLE</span>
            </div>
          </Link>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-2 -mr-2 rounded-lg text-[#AAB5AF] hover:text-[#F2F6F3] hover:bg-[#1A2429] transition-colors"
            aria-label="Close menu"
          >
            <Icon icon="solar:close-bold" className="w-5 h-5" />
          </button>
        </div>

        <div className="m-4 p-4 bg-[#151E23] border border-[#2B393F] rounded-xl">
          <div className="flex items-center gap-3">
            <img src={avatarSrc} alt={displayName} className="w-9 h-9 rounded-full object-cover border border-[#F4B860]/50" />
            <div className="truncate">
              <p className="text-xs font-semibold text-[#F2F6F3] truncate">{displayName}</p>
              <p className="text-[10px] text-[#93A09A] truncate font-mono">STAFF ACCESS &middot; ADMIN</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[10px] text-[#F4B860] font-mono uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F4B860]" />Privileged workspace
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          <p className="text-[10px] uppercase font-mono text-[#7F8C86] px-2 tracking-wider mb-2">Operations</p>
          {adminLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setDrawerOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive ? 'bg-[#F4B860] text-[#111714] font-semibold shadow-[0_8px_24px_rgba(244,184,96,0.16)]' : 'text-[#AAB5AF] hover:text-[#F2F6F3] hover:bg-[#1A2429]'
                }`}
              >
                <Icon icon={link.icon} className={`w-5 h-5 ${isActive ? 'text-[#111714]' : 'text-[#F4B860]'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#263139]">
          <button onClick={() => { setDrawerOpen(false); handleLogout(); }} className="flex items-center gap-2 text-[#93A09A] hover:text-[#F2F6F3] text-xs w-full">
            <Icon icon="solar:logout-3-bold" className="w-4 h-4" />Sign Out
          </button>
          <Link href="/dashboard" className="flex items-center gap-2 text-[#93A09A] hover:text-[#F2F6F3] text-xs mt-3" onClick={() => setDrawerOpen(false)}>
            <Icon icon="solar:user-bold" className="w-4 h-4" />Investor view
          </Link>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="admin-sidebar hidden md:flex flex-col w-72 bg-[#10161A] border-r border-[#263139] h-screen sticky top-0 text-[#E8EFEB] z-30 font-sans">
        <div className="p-6 border-b border-[#263139] flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-[#1A2429] border border-[#37454A] flex items-center justify-center text-[#F4B860]"><Icon icon="solar:buildings-2-bold" className="w-5 h-5" /></div><div><span className="text-[#F2F6F3] text-base tracking-tight">QUANTOVEST</span><span className="text-[9px] tracking-widest text-[#F4B860] uppercase font-mono block -mt-1">OPERATIONS CONSOLE</span></div></Link>
          <NotificationCenter />
        </div>
        <div className="m-4 p-4 bg-[#151E23] border border-[#2B393F] rounded-xl"><div className="flex items-center gap-3"><img src={avatarSrc} alt={displayName} className="w-9 h-9 rounded-full object-cover border border-[#F4B860]/50" /><div className="truncate"><p className="text-xs font-semibold text-[#F2F6F3] truncate">{displayName}</p><p className="text-[10px] text-[#93A09A] truncate font-mono">STAFF ACCESS &middot; ADMIN</p></div></div><div className="mt-3 flex items-center gap-2 text-[10px] text-[#F4B860] font-mono uppercase tracking-wider"><span className="w-1.5 h-1.5 rounded-full bg-[#F4B860]" />Privileged workspace</div></div>
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto"><p className="text-[10px] uppercase font-mono text-[#7F8C86] px-2 tracking-wider mb-2">Operations</p>{adminLinks.map((link) => { const isActive = pathname === link.href; return <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${isActive ? 'bg-[#F4B860] text-[#111714] font-semibold shadow-[0_8px_24px_rgba(244,184,96,0.16)]' : 'text-[#AAB5AF] hover:text-[#F2F6F3] hover:bg-[#1A2429]'}`}><Icon icon={link.icon} className={`w-5 h-5 ${isActive ? 'text-[#111714]' : 'text-[#F4B860]'}`} /><span>{link.label}</span></Link>; })}</nav>
        <div className="p-4 border-t border-[#263139]">
          <button onClick={handleLogout} className="flex items-center gap-2 text-[#93A09A] hover:text-[#F2F6F3] text-xs w-full">
            <Icon icon="solar:logout-3-bold" className="w-4 h-4" />Sign Out
          </button>
          <Link href="/dashboard" className="flex items-center gap-2 text-[#93A09A] hover:text-[#F2F6F3] text-xs mt-3">
            <Icon icon="solar:user-bold" className="w-4 h-4" />Investor view
          </Link>
        </div>
      </aside>
    </>
  );
}
