import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { getCurrentIdentity } from '@/lib/supabase/identity';
import { getDb } from '@/lib/db';
import { investorAccounts, investorWithdrawals, portfolioLedger } from '@/db/schema';

export const dynamic = 'force-dynamic';

export async function GET() {
  const actor = await getCurrentIdentity();
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: 'Database is not configured' }, { status: 503 });
  return NextResponse.json(await db.select().from(investorWithdrawals).where(eq(investorWithdrawals.investorId, actor.id)));
}

export async function POST(request: Request) {
  const actor = await getCurrentIdentity();
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: 'Database is not configured' }, { status: 503 });
  const body = await request.json().catch(() => null) as { amountCents?: number; destinationType?: 'bank' | 'crypto'; destination?: string } | null;
  if (!body?.amountCents || !Number.isInteger(body.amountCents) || body.amountCents < 50000 || (body.destinationType !== 'bank' && body.destinationType !== 'crypto') || !body.destination?.trim()) return NextResponse.json({ error: 'Minimum withdrawal is $500 and a valid bank or crypto destination is required.' }, { status: 400 });
  try {
    const withdrawalId = await db.transaction(async tx => {
      const accounts = await tx.select().from(investorAccounts).where(and(eq(investorAccounts.investorId, actor.id), eq(investorAccounts.status, 'active'))).limit(1);
      if (!accounts[0] || accounts[0].balanceCents < body.amountCents!) throw new Error('Insufficient available balance.');
      await tx.update(investorAccounts).set({ balanceCents: accounts[0].balanceCents - body.amountCents! }).where(eq(investorAccounts.id, accounts[0].id));
      const inserted = await tx.insert(investorWithdrawals).values({ investorId: actor.id, amountCents: body.amountCents!, destinationType: body.destinationType!, destination: body.destination!.trim(), status: 'pending' }).returning({ id: investorWithdrawals.id });
      await tx.insert(portfolioLedger).values({ investorId: actor.id, type: 'withdrawal', amountCents: -body.amountCents!, referenceId: `investor-withdrawal:${inserted[0].id}`, description: 'Investor withdrawal request held for admin review' });
      return inserted[0].id;
    });
    return NextResponse.json({ withdrawalId, status: 'pending' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Withdrawal request failed.' }, { status: 400 });
  }
}
