'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { useQuantovestStore } from '@/lib/store';

interface InvestorSidebarProps {
  onOpenDeposit?: () => void;
  onOpenWithdraw?: () => void;
  onOpenCalculator?: () => void;
}

const navLinks = [
  { label: 'Overview', href: '/dashboard', icon: 'solar:widget-bold' },
  { label: 'Portfolio Managers', href: '/dashboard/traders', icon: 'solar:users-group-rounded-bold' },
  { label: 'Deposit', href: '/dashboard/deposit', icon: 'solar:wallet-money-bold' },
  { label: 'Withdraw', href: '/dashboard/withdraw', icon: 'solar:card-send-bold' },
  { label: 'Referrals', href: '/dashboard/referrals', icon: 'solar:share-bold' },
  { label: 'Identity KYC', href: '/dashboard/kyc', icon: 'solar:shield-check-bold' },
  { label: 'Settings', href: '/dashboard/settings', icon: 'solar:settings-bold' },
];

export default function InvestorSidebar({ onOpenDeposit, onOpenWithdraw, onOpenCalculator }: InvestorSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useQuantovestStore();

  return (
    <>
      <aside className="investor-sidebar hidden md:flex flex-col w-64 bg-[#0D1214] border-r border-[#202A2D] h-screen sticky top-0 text-[#F4F7F3] z-30 font-sans">
        <div className="p-6 border-b border-[#202A2D] flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#151D20] border border-[#2C393C] flex items-center justify-center text-[#4ADE80]"><Icon icon="solar:chart-square-bold" className="w-5 h-5" /></div>
            <div><span className="text-[#F4F7F3] text-base tracking-tight">QUANTOVEST</span><span className="text-[9px] tracking-widest text-[#4ADE80] uppercase font-mono block -mt-1">INVESTOR PORTAL</span></div>
          </Link>
        </div>
        <div className="m-4 p-4 bg-[#151D20] border border-[#263437] rounded-xl flex items-center gap-3">
          <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover border border-[#4ADE80]/40" />
          <div className="truncate"><p className="text-xs font-semibold text-[#F4F7F3] truncate">{user.name}</p><p className="text-[10px] text-[#8D9994] truncate font-mono">{user.email}</p></div>
        </div>
        <div className="px-4 mb-4 space-y-2">
          <p className="text-[10px] uppercase font-mono text-[#74817B] px-2 tracking-wider">Quick Actions</p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => onOpenDeposit ? onOpenDeposit() : router.push('/dashboard/deposit')} className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-[#4ADE80] text-[#07110B] text-xs font-semibold hover:bg-[#86EFAC] transition-colors"><Icon icon="solar:wallet-money-bold" className="w-4 h-4" />Deposit</button>
            <button onClick={() => onOpenWithdraw ? onOpenWithdraw() : router.push('/dashboard/withdraw')} className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-[#151D20] border border-[#30403D] text-[#DCE8E0] text-xs font-medium hover:border-[#4ADE80]/50 transition-colors"><Icon icon="solar:card-send-bold" className="w-4 h-4 text-[#4ADE80]" />Withdraw</button>
          </div>
          {onOpenCalculator && <button onClick={onOpenCalculator} className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-full bg-[#151D20] border border-[#4ADE80]/30 text-[#4ADE80] text-xs font-mono hover:bg-[#4ADE80]/10 transition-colors mt-2"><Icon icon="solar:calculator-bold" className="w-4 h-4" />Calculate ROI Graph</button>}
        </div>
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          <p className="text-[10px] uppercase font-mono text-[#74817B] px-2 tracking-wider mb-2">Investor workspace</p>
          {navLinks.map((link) => { const isActive = pathname === link.href; return <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${isActive ? 'bg-[#4ADE80] text-[#07110B] font-semibold shadow-[0_8px_24px_rgba(74,222,128,0.16)]' : 'text-[#9AA7A0] hover:text-[#F4F7F3] hover:bg-[#172124]'}`}><Icon icon={link.icon} className={`w-5 h-5 ${isActive ? 'text-[#07110B]' : 'text-[#4ADE80]'}`} /><span>{link.label}</span></Link>; })}
        </nav>
        <div className="p-4 border-t border-[#202A2D] text-xs space-y-2">
          <div className="flex items-center justify-between text-[#8D9994] text-[11px]"><span>Identity KYC Status</span><span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold ${user.kycStatus === 'approved' ? 'bg-[#4ADE80]/10 text-[#4ADE80]' : user.kycStatus === 'pending' ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'}`}>{user.kycStatus.toUpperCase()}</span></div>
          <Link href="/" className="flex items-center gap-2 text-[#8D9994] hover:text-[#F4F7F3] text-xs pt-2 border-t border-[#202A2D]"><Icon icon="solar:logout-3-bold" className="w-4 h-4" />Back to Public Website</Link>
        </div>
      </aside>
      <div className="investor-mobile-nav md:hidden fixed bottom-0 left-0 right-0 bg-[#0D1214]/95 backdrop-blur border-t border-[#202A2D] z-40 px-2 py-2 flex items-center justify-around text-[#F4F7F3] pb-[max(8px,env(safe-area-inset-bottom))]">
        {navLinks.map((link) => { const isActive = pathname === link.href; return <Link key={link.href} href={link.href} className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium ${isActive ? 'text-[#4ADE80]' : 'text-[#74817B]'}`}><Icon icon={link.icon} className="w-5 h-5" /><span>{link.label === 'Portfolio Managers' ? 'Managers' : link.label.split(' ')[0]}</span></Link>; })}
      </div>
    </>
  );
}
