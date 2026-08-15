'use client';

import React from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { useQuantovestStore } from '@/lib/store';
import { Icon } from '@iconify/react';

export default function AdminKycPage() {
  const { kycSubmissions, approveKyc, rejectKyc } = useQuantovestStore();

  return (
    <div className="min-h-screen bg-[#0D1215] text-[#E8EFEB] flex flex-col md:flex-row font-sans">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-8 space-y-8 overflow-y-auto pb-24 md:pb-8">
        <div className="border-b border-[#2B393F] pb-6 space-y-1">
          <h1 className="text-2xl font-normal text-[#E8EFEB]">KYC Review Queue</h1>
          <p className="text-xs text-[#93A09A]">Inspect 2-document verification uploads (ID + Proof of Address) and approve client identity.</p>
        </div>

        <div className="space-y-4">
          {kycSubmissions.map((kyc) => (
            <div key={kyc.id} className="p-6 rounded-2xl bg-[#151E23] border border-[#2B393F] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-1">
                <h3 className="text-base font-medium text-[#E8EFEB]">{kyc.userName}</h3>
                <p className="text-xs text-[#93A09A] font-mono">{kyc.userEmail}</p>
                <p className="text-[10px] text-[#93A09A] font-mono">Submitted: {kyc.createdAt}</p>
              </div>

              {/* Document Previews */}
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-[10px] text-[#93A09A] mb-1">1. ID / Passport</p>
                  <a href={kyc.idDocumentUrl} target="_blank" rel="noreferrer" className="w-24 h-16 rounded-xl border border-[#2B393F] block overflow-hidden">
                    <img src={kyc.idDocumentUrl} alt="ID Document" className="w-full h-full object-cover" />
                  </a>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-[#93A09A] mb-1">2. Proof of Address</p>
                  <a href={kyc.proofOfAddressUrl} target="_blank" rel="noreferrer" className="w-24 h-16 rounded-xl border border-[#2B393F] block overflow-hidden">
                    <img src={kyc.proofOfAddressUrl} alt="Proof of Address" className="w-full h-full object-cover" />
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {kyc.status === 'approved' ? (
                  <span className="px-4 py-1.5 rounded-full bg-[#22C55E]/10 text-[#22C55E] font-mono text-xs font-semibold">
                    VERIFIED & APPROVED
                  </span>
                ) : (
                  <>
                    <button
                      onClick={() => approveKyc(kyc.userId)}
                      className="px-5 py-2 rounded-full text-xs font-semibold bg-[#22C55E] text-[#E8EFEB] hover:bg-[#16A34A] flex items-center gap-1"
                    >
                      <Icon icon="solar:check-circle-bold" className="w-4 h-4" />
                      Approve KYC
                    </button>
                    <button
                      onClick={() => rejectKyc(kyc.userId, 'Document unreadable, please re-upload.')}
                      className="px-4 py-2 rounded-full text-xs font-medium bg-[#CF202F]/10 border border-[#CF202F]/30 text-[#CF202F] hover:bg-[#CF202F]/20"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
