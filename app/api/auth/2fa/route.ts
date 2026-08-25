import { NextResponse } from 'next/server';
import { and, eq, isNull } from 'drizzle-orm';
import { getCurrentIdentity } from '@/lib/supabase/identity';
import { getDb } from '@/lib/db';
import { users, recoveryCodes } from '@/db/schema';
import { generateRecoveryCodes } from '@/lib/recovery-codes';
import { verifyTOTP } from '@/lib/totp';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const actor = await getCurrentIdentity();
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: 'Database is not configured' }, { status: 503 });

  const body = await request.json().catch(() => null) as {
    action?: 'enable' | 'disable';
    secret?: string;
    code?: string;
  } | null;
  if (!body?.action || !body.code) return NextResponse.json({ error: 'Action and verification code are required.' }, { status: 400 });

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
