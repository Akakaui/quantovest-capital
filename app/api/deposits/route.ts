import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getCurrentIdentity } from '@/lib/supabase/identity';
import { notifyAdmins } from '@/lib/notifications';
import { getDb } from '@/lib/db';
import { deposits, users } from '@/db/schema';
import { sendDepositSubmitted } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const actor = await getCurrentIdentity();
    if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    if (!db) return NextResponse.json([]);
    return NextResponse.json(await db.select().from(deposits).where(eq(deposits.investorId, actor.id)));
  } catch (err) {
    console.error('[deposits GET]', err);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  const actor = await getCurrentIdentity();
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: 'Database is not configured' }, { status: 503 });
  const body = await request.json().catch(() => null) as { amountCents?: number; method?: 'bank' | 'crypto'; proofPath?: string; planId?: number } | null;
  if (!body?.amountCents || !Number.isInteger(body.amountCents) || body.amountCents < 50000 || (body.method !== 'bank' && body.method !== 'crypto') || !body.proofPath?.trim()) return NextResponse.json({ error: 'Minimum deposit is $500. Select a bank or crypto method and upload proof.' }, { status: 400 });
  const id = crypto.randomUUID();
  await db.insert(deposits).values({ id, investorId: actor.id, amountCents: body.amountCents, method: body.method, proofPath: body.proofPath.trim(), planId: body.planId ?? null, status: 'pending' });
  await notifyAdmins('deposit_submitted', 'New deposit awaiting verification', `Investor ${actor.id} submitted a ${(body.amountCents / 100).toFixed(2)} deposit via ${body.method}.`);
  if (actor.email) {
    try {
      const investor = await db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, actor.id)).limit(1);
      if (investor[0]?.email) sendDepositSubmitted(investor[0].email, investor[0].name || 'Investor', `$${(body.amountCents / 100).toFixed(2)}`);
    } catch {}
  }
  return NextResponse.json({ id, status: 'pending' }, { status: 201 });
}
