import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDb } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';
  if (code) {
    const supabase = await createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    if (data.user) {
      const db = getDb();
      if (db) {
        try {
          const rows = await db.select({ twoFactorEnabled: users.twoFactorEnabled })
            .from(users)
            .where(eq(users.id, data.user.id))
            .limit(1);
          if (rows[0]?.twoFactorEnabled) {
            return NextResponse.redirect(new URL('/verify-2fa', requestUrl.origin));
          }
        } catch { /* fall through */ }
      }
    }
  }
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
