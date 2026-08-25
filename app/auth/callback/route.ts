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
          const authAvatar = typeof data.user.user_metadata?.avatar_url === 'string'
            ? data.user.user_metadata.avatar_url
            : typeof data.user.user_metadata?.picture === 'string'
              ? data.user.user_metadata.picture
              : null;
          const existing = await db.select({ id: users.id, image: users.image }).from(users).where(eq(users.id, data.user.id)).limit(1);
          if (existing.length === 0) {
            await db.insert(users).values({
              id: data.user.id,
              email: data.user.email ?? '',
              name: data.user.user_metadata?.name ?? data.user.user_metadata?.full_name ?? data.user.email?.split('@')[0] ?? 'User',
              image: authAvatar,
              role: 'investor',
            });
          } else if (!existing[0].image && authAvatar) {
            await db.update(users).set({ image: authAvatar }).where(eq(users.id, data.user.id));
          }
          const rows = await db.select({ twoFactorEnabled: users.twoFactorEnabled }).from(users).where(eq(users.id, data.user.id)).limit(1);
          if (rows[0]?.twoFactorEnabled) {
            const response = NextResponse.redirect(new URL('/verify-2fa', requestUrl.origin));
            response.cookies.set('qv_2fa_pending', '1', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 600, path: '/' });
            return response;
          }
        } catch { /* fall through */ }
      }
    }
  }
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
