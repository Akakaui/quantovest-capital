import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { getCurrentIdentity } from '@/lib/supabase/identity';
import { getDb } from '@/lib/db';
import { investorAccounts, investorWithdrawals, portfolioLedger } from '@/db/schema';
import { notifyAdmins, notifyUser } from '@/lib/notifications';
import { sendWithdrawalSubmitted } from '@/lib/email';

export const dynamic = 'force-dynamic';

const MIN_WITHDRAW_BALANCE_CENTS = 300_000;

export async function GET() {
  try {
    const actor = await getCurrentIdentity();
    if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    if (!db) return NextResponse.json([]);
    return NextResponse.json(await db.select().from(investorWithdrawals).where(eq(investorWithdrawals.investorId, actor.id)));
  } catch (err) {
    console.error('[withdrawals GET]', err);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  const actor = await getCurrentIdentity();
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: 'Database is not configured' }, { status: 503 });
  const body = await request.json().catch(() => null) as { amountCents?: number; destinationType?: 'bank' | 'crypto'; destination?: string } | null;
  if (!body?.amountCents || !Number.isInteger(body.amountCents) || body.amountCents <= 0 || (body.destinationType !== 'bank' && body.destinationType !== 'crypto') || !body.destination?.trim()) return NextResponse.json({ error: 'A valid amount and bank or crypto destination are required.' }, { status: 400 });
  try {
    const withdrawalId = await db.transaction(async tx => {
      const accounts = await tx.select().from(investorAccounts).where(and(eq(investorAccounts.investorId, actor.id), eq(investorAccounts.status, 'active'))).limit(1);
      if (!accounts[0]) throw new Error('No active investor account found.');
      if (accounts[0].balanceCents < MIN_WITHDRAW_BALANCE_CENTS) throw new Error('A minimum balance of $3,000 is required to withdraw.');
      if (accounts[0].balanceCents < body.amountCents!) throw new Error('Insufficient available balance.');
      await tx.update(investorAccounts).set({ balanceCents: accounts[0].balanceCents - body.amountCents! }).where(eq(investorAccounts.id, accounts[0].id));
      const inserted = await tx.insert(investorWithdrawals).values({ investorId: actor.id, amountCents: body.amountCents!, destinationType: body.destinationType!, destination: body.destination!.trim(), status: 'pending' }).returning({ id: investorWithdrawals.id });
      await tx.insert(portfolioLedger).values({ investorId: actor.id, type: 'withdrawal', amountCents: -body.amountCents!, referenceId: `investor-withdrawal:${inserted[0].id}`, description: 'Investor withdrawal request held for admin review' });
      return inserted[0].id;
    });
    const dollars = (body.amountCents! / 100).toFixed(2);
    await notifyUser(actor.id, 'withdrawal_submitted', 'Withdrawal requested', `Your withdrawal request of $${dollars} has been submitted and is pending review.`);
    await notifyAdmins('withdrawal_submitted', 'New withdrawal request', `A withdrawal request of $${dollars} was submitted by ${actor.name || actor.id}.`);
    try { if (actor.email) await sendWithdrawalSubmitted(actor.email, actor.name || 'Investor', `$${dollars}`); } catch {}
    return NextResponse.json({ withdrawalId, status: 'pending' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Withdrawal request failed.' }, { status: 400 });
  }
}
