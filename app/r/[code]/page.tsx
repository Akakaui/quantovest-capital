'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function ReferralRedirect() {
  const router = useRouter();
  const params = useParams();
  const code = params.code as string;

  useEffect(() => {
    if (code) {
      document.cookie = `referral_code=${encodeURIComponent(code)}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
      router.replace(`/signup?ref=${encodeURIComponent(code)}`);
    }
  }, [code, router]);

  return <p>Redirecting...</p>;
}
