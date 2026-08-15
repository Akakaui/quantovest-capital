'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@iconify/react';
import { useQuantovestStore } from '@/lib/store';

const adminLinks = [
  { label: 'Control Center', href: '/admin', icon: 'solar:widget-add-bold' },
  { label: 'Daily ROI Entry', href: '/admin/performance', icon: 'solar:graph-bold' },
  { label: 'Deposit Queue', href: '/admin/deposits', icon: 'solar:wallet-bold' },
  { label: 'Withdrawal Queue', href: '/admin/withdrawals', icon: 'solar:card-transfer-bold' },
  { label: 'KYC Queue', href: '/admin/kyc', icon: 'solar:shield-check-bold' },
  { label: 'Portfolio Managers', href: '/admin/traders', icon: 'solar:users-group-rounded-bold' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useQuantovestStore();
  return (
    <>
      <aside className="admin-sidebar hidden md:flex flex-col w-72 bg-[#10161A] border-r border-[#263139] h-screen sticky top-0 text-[#E8EFEB] z-30 font-sans">
        <div className="p-6 border-b border-[#263139]">
          <Link href="/admin" className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-[#1A2429] border border-[#37454A] flex items-center justify-center text-[#F4B860]"><Icon icon="solar:buildings-2-bold" className="w-5 h-5" /></div><div><span className="text-[#F2F6F3] text-base tracking-tight">QUANTOVEST</span><span className="text-[9px] tracking-widest text-[#F4B860] uppercase font-mono block -mt-1">OPERATIONS CONSOLE</span></div></Link>
        </div>
        <div className="m-4 p-4 bg-[#151E23] border border-[#2B393F] rounded-xl"><div className="flex items-center gap-3"><img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover border border-[#F4B860]/50" /><div className="truncate"><p className="text-xs font-semibold text-[#F2F6F3] truncate">{user.name}</p><p className="text-[10px] text-[#93A09A] truncate font-mono">STAFF ACCESS · ADMIN</p></div></div><div className="mt-3 flex items-center gap-2 text-[10px] text-[#F4B860] font-mono uppercase tracking-wider"><span className="w-1.5 h-1.5 rounded-full bg-[#F4B860] animate-pulse" />Privileged workspace</div></div>
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto"><p className="text-[10px] uppercase font-mono text-[#7F8C86] px-2 tracking-wider mb-2">Operations</p>{adminLinks.map((link) => { const isActive = pathname === link.href; return <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${isActive ? 'bg-[#F4B860] text-[#111714] font-semibold shadow-[0_8px_24px_rgba(244,184,96,0.16)]' : 'text-[#AAB5AF] hover:text-[#F2F6F3] hover:bg-[#1A2429]'}`}><Icon icon={link.icon} className={`w-5 h-5 ${isActive ? 'text-[#111714]' : 'text-[#F4B860]'}`} /><span>{link.label}</span></Link>; })}</nav>
        <div className="p-4 border-t border-[#263139]"><Link href="/" className="flex items-center gap-2 text-[#93A09A] hover:text-[#F2F6F3] text-xs"><Icon icon="solar:logout-3-bold" className="w-4 h-4" />Back to Public Website</Link><Link href="/dashboard" className="flex items-center gap-2 text-[#93A09A] hover:text-[#F2F6F3] text-xs mt-3"><Icon icon="solar:user-bold" className="w-4 h-4" />Investor view</Link></div>
      </aside>
      <div className="admin-mobile-nav md:hidden fixed bottom-0 left-0 right-0 bg-[#10161A]/95 backdrop-blur border-t border-[#263139] z-40 px-2 py-2 flex items-center justify-around text-[#E8EFEB] pb-[max(8px,env(safe-area-inset-bottom))]">{adminLinks.map((link) => { const isActive = pathname === link.href; return <Link key={link.href} href={link.href} className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium ${isActive ? 'text-[#F4B860]' : 'text-[#7F8C86]'}`}><Icon icon={link.icon} className="w-5 h-5" /><span>{link.label === 'Control Center' ? 'Home' : link.label.split(' ')[0]}</span></Link>; })}</div>
    </>
  );
}
