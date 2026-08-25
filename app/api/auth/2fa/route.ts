import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { and, eq, isNull } from 'drizzle-orm';
import { getCurrentIdentity } from '@/lib/supabase/identity';
import { getDb } from '@/lib/db';
import { users, recoveryCodes } from '@/db/schema';
import { generateRecoveryCodes } from '@/lib/recovery-codes';
import { verifyTOTP } from '@/lib/totp';
import { createTwoFactorToken } from '@/lib/2fa-session';

export const dynamic = 'force-dynamic';

const failedAttempts = new Map<string, { count: number; windowStarted: number }>();
const ATTEMPT_WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function limited(userId: string) {
  const now = Date.now();
  const current = failedAttempts.get(userId);
  if (!current || now - current.windowStarted >= ATTEMPT_WINDOW_MS) {
    failedAttempts.set(userId, { count: 0, windowStarted: now });
    return false;
  }
  return current.count >= MAX_ATTEMPTS;
}

function recordFailure(userId: string) {
  const now = Date.now();
  const current = failedAttempts.get(userId);
  if (!current || now - current.windowStarted >= ATTEMPT_WINDOW_MS) failedAttempts.set(userId, { count: 1, windowStarted: now });
  else current.count += 1;
}

function clearFailures(userId: string) { failedAttempts.delete(userId); }

export async function POST(request: Request) {
  const actor = await getCurrentIdentity();
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: 'Database is not configured' }, { status: 503 });

  const body = await request.json().catch(() => null) as {
    action?: 'enable' | 'disable' | 'challenge' | 'verify';
    secret?: string;
    code?: string;
  } | null;
  if (!body?.action) return NextResponse.json({ error: 'Action is required.' }, { status: 400 });
  if (body.action === 'challenge') {
    cookies().set('qv_2fa_pending', '1', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 600, path: '/' });
    return NextResponse.json({ challenged: true });
  }
  if (!body.code) return NextResponse.json({ error: 'Verification code is required.' }, { status: 400 });

  const [user] = await db.select({ twoFactorEnabled: users.twoFactorEnabled, twoFactorSecret: users.twoFactorSecret }).from(users).where(eq(users.id, actor.id)).limit(1);
  if (!user) return NextResponse.json({ error: 'User profile not found.' }, { status: 404 });

  if (body.action === 'enable') {
    const secret = body.secret?.trim();
    if (!secret || !(await verifyTOTP(secret, body.code))) {
      return NextResponse.json({ error: 'Invalid authenticator code.' }, { status: 400 });
    }
    await db.update(users).set({ twoFactorEnabled: true, twoFactorSecret: secret }).where(eq(users.id, actor.id));
    const recovery = await generateRecoveryCodes(actor.id);
    return NextResponse.json({ enabled: true, recoveryCodes: recovery });
  }

  if (body.action === 'verify') {
    if (limited(actor.id)) return NextResponse.json({ error: 'Too many attempts. Please wait 10 minutes and try again.' }, { status: 429 });
    if (!user.twoFactorEnabled || !user.twoFactorSecret || !(await verifyTOTP(user.twoFactorSecret, body.code))) {
      recordFailure(actor.id);
      return NextResponse.json({ error: 'Invalid authenticator code.' }, { status: 400 });
    }
    clearFailures(actor.id);
    const token = await createTwoFactorToken(actor.id);
    const response = NextResponse.json({ verified: true });
    response.cookies.set('qv_2fa_verified', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 3600, path: '/' });
    response.cookies.set('qv_2fa_pending', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 0, path: '/' });
    return response;
  }

  if (body.action === 'disable') {
    if (!user.twoFactorEnabled || !user.twoFactorSecret || !(await verifyTOTP(user.twoFactorSecret, body.code))) {
      return NextResponse.json({ error: 'Invalid authenticator code.' }, { status: 400 });
    }
    await db.transaction(async tx => {
      await tx.update(users).set({ twoFactorEnabled: false, twoFactorSecret: null }).where(eq(users.id, actor.id));
      await tx.delete(recoveryCodes).where(and(eq(recoveryCodes.userId, actor.id), isNull(recoveryCodes.usedAt)));
    });
    return NextResponse.json({ enabled: false });
  }

  return NextResponse.json({ error: 'Unsupported 2FA action.' }, { status: 400 });
}
