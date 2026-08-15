'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { useQuantovestStore } from '@/lib/store';

interface SidebarProps {
  onOpenDeposit?: () => void;
  onOpenWithdraw?: () => void;
  onOpenCalculator?: () => void;
}

export default function Sidebar({ onOpenDeposit, onOpenWithdraw, onOpenCalculator }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, login } = useQuantovestStore();

  const isAdmin = user.role === 'admin';

  const navLinks = isAdmin
    ? [
        { label: 'Admin Dashboard', href: '/admin', icon: 'solar:widget-add-bold' },
        { label: 'Daily ROI % Entry', href: '/admin/performance', icon: 'solar:graph-bold' },
        { label: 'Deposit Queue', href: '/admin/deposits', icon: 'solar:wallet-bold' },
        { label: 'Withdrawal Queue', href: '/admin/withdrawals', icon: 'solar:card-transfer-bold' },
        { label: 'KYC Queue', href: '/admin/kyc', icon: 'solar:shield-check-bold' },
        { label: 'Portfolio Managers', href: '/admin/traders', icon: 'solar:users-group-rounded-bold' },
      ]
    : [
        { label: 'Overview', href: '/dashboard', icon: 'solar:widget-bold' },
        { label: 'Portfolio Managers', href: '/dashboard/traders', icon: 'solar:users-group-rounded-bold' },
        { label: 'Deposit', href: '/dashboard/deposit', icon: 'solar:wallet-money-bold' },
        { label: 'Withdraw', href: '/dashboard/withdraw', icon: 'solar:card-send-bold' },
        { label: 'Identity KYC', href: '/dashboard/kyc', icon: 'solar:shield-check-bold' },
        { label: 'Settings', href: '/dashboard/settings', icon: 'solar:settings-bold' },
      ];

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#DEE1E6] h-screen sticky top-0 text-[#0A0D0C] z-30 font-sans">
        {/* Brand Header */}
        <div className="p-6 border-b border-[#DEE1E6] flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F7F7F7] border border-[#DEE1E6] flex items-center justify-center text-[#22C55E]">
              <Icon icon="solar:chart-square-bold" className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[#0A0D0C] text-base font-normal tracking-tight">QUANTOVEST</span>
              <span className="text-[9px] tracking-widest text-[#22C55E] uppercase font-mono block -mt-1">
                {isAdmin ? 'STAFF ADMIN' : 'INVESTOR PORTAL'}
              </span>
            </div>
          </Link>
        </div>

        {/* User Info / Role Toggle Pill */}
        <div className="p-4 mx-4 my-4 bg-[#F7F7F7] border border-[#DEE1E6] rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover border border-[#22C55E]/40" />
            <div className="truncate">
              <p className="text-xs font-semibold text-[#0A0D0C] truncate">{user.name}</p>
              <p className="text-[10px] text-[#5B616E] truncate font-mono">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => login(isAdmin ? 'investor' : 'admin')}
            title="Toggle Demo Role (Investor vs Admin)"
            className="p-1.5 rounded-lg text-[#22C55E] hover:bg-[#22C55E]/10 transition-colors"
          >
            <Icon icon="solar:user-speak-bold" className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons inside Sidebar Navigation */}
        {!isAdmin && (
          <div className="px-4 mb-4 space-y-2">
            <p className="text-[10px] uppercase font-mono text-[#5B616E] px-2 tracking-wider">Quick Actions</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  if (onOpenDeposit) onOpenDeposit();
                  else router.push('/dashboard/deposit');
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-[#22C55E] text-[#0A0D0C] text-xs font-semibold hover:bg-[#16A34A] transition-colors shadow-sm"
              >
                <Icon icon="solar:wallet-money-bold" className="w-4 h-4" />
                Deposit
              </button>
              <button
                onClick={() => {
                  if (onOpenWithdraw) onOpenWithdraw();
                  else router.push('/dashboard/withdraw');
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-[#F7F7F7] border border-[#DEE1E6] text-[#0A0D0C] text-xs font-medium hover:bg-[#202722] transition-colors"
              >
                <Icon icon="solar:card-send-bold" className="w-4 h-4 text-[#22C55E]" />
                Withdraw
              </button>
            </div>
            {onOpenCalculator && (
              <button
                onClick={onOpenCalculator}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-full bg-[#F7F7F7] border border-[#22C55E]/30 text-[#22C55E] text-xs font-mono hover:bg-[#22C55E]/10 transition-colors mt-2"
              >
                <Icon icon="solar:calculator-bold" className="w-4 h-4" />
                Calculate ROI Graph
              </button>
            )}
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          <p className="text-[10px] uppercase font-mono text-[#5B616E] px-2 tracking-wider mb-2">Menu</p>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#22C55E] text-[#0A0D0C] font-semibold shadow-md'
                    : 'text-[#5B616E] hover:text-[#0A0D0C] hover:bg-[#F7F7F7]'
                }`}
              >
                <Icon icon={link.icon} className={`w-5 h-5 ${isActive ? 'text-[#0A0D0C]' : 'text-[#22C55E]'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* KYC Status Indicator Footer */}
        <div className="p-4 border-t border-[#DEE1E6] text-xs space-y-2">
          <div className="flex items-center justify-between text-[#5B616E] text-[11px]">
            <span>Identity KYC Status</span>
            <span
              className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold ${
                user.kycStatus === 'approved'
                  ? 'bg-[#22C55E]/10 text-[#22C55E]'
                  : user.kycStatus === 'pending'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              {user.kycStatus.toUpperCase()}
            </span>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 text-[#5B616E] hover:text-[#0A0D0C] text-xs pt-2 border-t border-[#DEE1E6]"
          >
            <Icon icon="solar:logout-3-bold" className="w-4 h-4" />
            Back to Public Website
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#DEE1E6] z-40 px-2 py-2 flex items-center justify-around text-[#0A0D0C]">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? 'text-[#22C55E]' : 'text-[#5B616E]'
              }`}
            >
              <Icon 
                icon={link.icon} 
                className={`w-5 h-5 transition-colors ${isActive ? 'text-[#22C55E]' : 'text-[#5B616E]'}`} 
              />
              <span>
                {link.label === 'Portfolio Managers' 
                  ? 'Managers' 
                  : link.label === 'Admin Dashboard'
                  ? 'Admin'
                  : link.label === 'Daily ROI % Entry'
                  ? 'ROI %'
                  : link.label.split(' ')[0]}
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
