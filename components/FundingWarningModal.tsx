'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';

interface FundingWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FundingWarningModal({ isOpen, onClose }: FundingWarningModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 font-sans text-white">
      <div className="bg-[#12161A] border border-[#202722] rounded-2xl max-w-md w-full p-6 text-center relative shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="w-14 h-14 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/40 text-[#22C55E] flex items-center justify-center mx-auto mb-4">
          <Icon icon="solar:wallet-money-bold" className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-normal text-white mb-2">Account Funding Required</h3>
        <p className="text-xs text-[#A8ACB3] leading-relaxed mb-6">
          To activate managed investment strategy execution, your account requires a minimum funded balance of <strong>$500</strong> (Starter Plan).
        </p>

        <div className="space-y-3">
          <button
            onClick={() => {
              onClose();
              router.push('/dashboard/deposit');
            }}
            className="w-full py-3 rounded-full text-xs font-semibold bg-[#22C55E] text-[#0A0D0C] hover:bg-[#16A34A] transition-colors flex items-center justify-center gap-2"
          >
            <Icon icon="solar:wallet-bold" className="w-4 h-4" />
            <span>Deposit Funds Now ($500 Min)</span>
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-full text-xs font-medium text-[#A8ACB3] border border-[#202722] hover:bg-[#1A1F24]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
