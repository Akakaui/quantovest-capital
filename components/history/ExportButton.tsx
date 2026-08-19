'use client';

import React, { useState } from 'react';
import { Icon } from '@iconify/react';

interface ExportButtonProps {
  typeFilter: string;
}

export default function ExportButton({ typeFilter }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.set('type', typeFilter);
      const res = await fetch(`/api/history/export?${params.toString()}`);
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transaction-history-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch { /* ignore */ }
    setExporting(false);
  }

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#151D20] border border-[#263437] text-[#9AA7A0] text-[10px] font-medium hover:border-[#4ADE80]/50 transition-colors disabled:opacity-40"
    >
      <Icon icon="solar:export-bold" className="w-3.5 h-3.5" />
      {exporting ? 'Exporting...' : 'Export CSV'}
    </button>
  );
}
