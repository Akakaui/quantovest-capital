'use client';

import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { createClient } from '@/lib/supabase/client';

interface KycModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KycModal({ isOpen, onClose }: KycModalProps) {
  const [idDoc, setIdDoc] = useState<File | null>(null);
  const [proofAddress, setProofAddress] = useState<File | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [idDocName, setIdDocName] = useState('');
  const [proofAddressName, setProofAddressName] = useState('');

  if (!isOpen) return null;

  const handleDocChange = (type: 'id' | 'address', file: File | null) => {
    if (!file) return;
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size must be under 5MB.');
      return;
    }
    if (type === 'id') {
      setIdDoc(file);
      setIdDocName(file.name);
    } else {
      setProofAddress(file);
      setProofAddressName(file.name);
    }
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idDoc || !proofAddress) return;
    setUploading(true);
    setError('');

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Session expired. Please log in again.');
        setUploading(false);
        return;
      }
      const headers = { Authorization: `Bearer ${session.access_token}` };

      // Upload both documents
      const [idUpload, addressUpload] = await Promise.all([
        (async () => {
          const form = new FormData();
          form.append('file', idDoc);
          form.append('purpose', 'kyc');
          const res = await fetch('/api/uploads', { method: 'POST', headers, body: form });
          return res.json();
        })(),
        (async () => {
          const form = new FormData();
          form.append('file', proofAddress);
          form.append('purpose', 'kyc');
          const res = await fetch('/api/uploads', { method: 'POST', headers, body: form });
          return res.json();
        })(),
      ]);

      if (!idUpload.path || !addressUpload.path) {
        setError('File upload failed. Please try again.');
        setUploading(false);
        return;
      }

      // Submit KYC application with document paths
      const docPath = JSON.stringify({ idDocument: idUpload.path, proofOfAddress: addressUpload.path });
      const res = await fetch('/api/kyc', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentPath: docPath }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'KYC submission failed.');
        setUploading(false);
        return;
      }

      setIsSubmitted(true);
      setTimeout(() => onClose(), 1800);
    } catch {
      setError('An error occurred. Please try again.');
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-[#12161A] border border-[#202722] rounded-2xl max-w-lg w-full p-6 sm:p-8 text-white relative shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 border-b border-[#202722] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 flex items-center justify-center text-[#22C55E]">
              <Icon icon="solar:shield-check-bold" className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-normal text-white">Identity Verification (KYC)</h3>
              <p className="text-xs text-[#A8ACB3]">Minimal 2-document verification for institutional compliance</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#A8ACB3] hover:text-white p-1">
            <Icon icon="solar:close-circle-bold" className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">{error}</div>
        )}

        {isSubmitted ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#22C55E]/20 border border-[#22C55E] text-[#22C55E] flex items-center justify-center mx-auto animate-bounce">
              <Icon icon="solar:check-read-bold" className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-normal text-white">Verification Documents Submitted</h4>
            <p className="text-xs text-[#A8ACB3] max-w-sm mx-auto">
              Our compliance team is reviewing your documents. Your status is updated to <strong>PENDING</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="bg-[#1A1F24] p-3 rounded-xl border border-[#202722] flex items-center gap-3 text-xs text-[#A8ACB3]">
              <Icon icon="solar:info-square-bold" className="w-5 h-5 text-[#22C55E] shrink-0" />
              <span>Please upload clear photos or PDFs. Only 2 documents required (max 5MB each).</span>
            </div>

            {/* Document 1: ID Document */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-white flex items-center justify-between">
                <span>1. Government ID / Passport / Driver&apos;s License</span>
                {idDoc && <span className="text-[#22C55E] text-[10px] font-mono flex items-center gap-1"><Icon icon="solar:check-circle-bold" /> Uploaded</span>}
              </label>
              <label
                className={`p-4 rounded-xl border border-dashed text-center cursor-pointer transition-all block ${
                  idDoc
                    ? 'border-[#22C55E] bg-[#22C55E]/10'
                    : 'border-[#202722] bg-[#1A1F24] hover:border-[#22C55E]/50'
                }`}
              >
                <Icon icon="solar:document-bold" className="w-7 h-7 mx-auto mb-1 text-[#22C55E]" />
                <p className="text-xs font-medium text-white">
                  {idDocName || 'Click to Upload ID / Passport'}
                </p>
                <p className="text-[10px] text-[#A8ACB3]">JPG, PNG or PDF (max 5MB)</p>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="hidden"
                  onChange={e => handleDocChange('id', e.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            {/* Document 2: Proof of Address */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-white flex items-center justify-between">
                <span>2. Proof of Address (Utility Bill / Bank Statement)</span>
                {proofAddress && <span className="text-[#22C55E] text-[10px] font-mono flex items-center gap-1"><Icon icon="solar:check-circle-bold" /> Uploaded</span>}
              </label>
              <label
                className={`p-4 rounded-xl border border-dashed text-center cursor-pointer transition-all block ${
                  proofAddress
                    ? 'border-[#22C55E] bg-[#22C55E]/10'
                    : 'border-[#202722] bg-[#1A1F24] hover:border-[#22C55E]/50'
                }`}
              >
                <Icon icon="solar:home-bold" className="w-7 h-7 mx-auto mb-1 text-[#22C55E]" />
                <p className="text-xs font-medium text-white">
                  {proofAddressName || 'Click to Upload Bank Statement / Bill'}
                </p>
                <p className="text-[10px] text-[#A8ACB3]">Issued within last 90 days</p>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="hidden"
                  onChange={e => handleDocChange('address', e.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full text-xs font-medium text-[#A8ACB3] border border-[#202722] hover:bg-[#1A1F24]"
              >
                Remind Me Later
              </button>
              <button
                type="submit"
                disabled={!idDoc || !proofAddress || uploading}
                className={`px-6 py-2.5 rounded-full text-xs font-semibold ${
                  idDoc && proofAddress && !uploading
                    ? 'bg-[#22C55E] text-[#0A0D0C] hover:bg-[#16A34A]'
                    : 'bg-[#22C55E]/30 text-[#0A0D0C]/50 cursor-not-allowed'
                } transition-colors`}
              >
                {uploading ? 'Uploading...' : 'Submit Documents'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
