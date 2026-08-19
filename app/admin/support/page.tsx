'use client';

import React from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { Icon } from '@iconify/react';

export default function AdminSupportPage() {
  return (
    <div className="min-h-screen bg-[#0D1215] text-[#E8EFEB] flex flex-col md:flex-row font-sans">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-8 space-y-8 overflow-y-auto pb-24 md:pb-8">
        <div className="border-b border-[#2B393F] pb-6 space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#F4B860] font-mono">
            <span className="w-2 h-2 rounded-full bg-[#F4B860]" />
            CUSTOMER SUPPORT
          </div>
          <h1 className="text-2xl font-normal text-[#E8EFEB]">Support Dashboard</h1>
          <p className="text-xs text-[#93A09A]">Manage live chat and customer support interactions.</p>
        </div>

        <div className="max-w-2xl bg-[#151E23] border border-[#2B393F] rounded-2xl p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#F4B860]/10 border border-[#F4B860]/30 flex items-center justify-center mx-auto">
            <Icon icon="solar:chat-round-dots-bold" className="w-8 h-8 text-[#F4B860]" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-[#E8EFEB]">Tawk.to Live Chat Dashboard</h3>
            <p className="text-xs text-[#93A09A] leading-relaxed max-w-md mx-auto">
              Customer support conversations are managed through the Tawk.to dashboard. 
              Click the button below to access the live chat management console where you can 
              respond to investor inquiries in real-time.
            </p>
          </div>
          <a
            href="https://dashboard.tawk.to"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#F4B860] text-[#111714] text-xs font-semibold hover:bg-[#e5a950] transition-colors"
          >
            <Icon icon="solar:external-link-bold" className="w-4 h-4" />
            Open Tawk.to Dashboard
          </a>
          <div className="pt-4 border-t border-[#2B393F] space-y-2">
            <p className="text-[10px] uppercase font-mono text-[#7F8C86]">Widget Status</p>
            <div className="flex items-center justify-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
              <span className="text-[#93A09A]">Live chat widget is active on all investor pages</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
