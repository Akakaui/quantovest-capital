import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { getCurrentIdentity } from '@/lib/supabase/identity';
import { getDb } from '@/lib/db';
import { investorAccounts, investorWithdrawals, portfolioLedger } from '@/db/schema';

export async function GET() {
  const actor = await getCurrentIdentity();
  if (!actor?.id || actor.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: 'Database is not configured' }, { status: 503 });
  return NextResponse.json(await db.select().from(investorWithdrawals));
}

export async function PATCH(request: Request) {
  const actor = await getCurrentIdentity();
  if (!actor?.id || actor.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: 'Database is not configured' }, { status: 503 });
  const body = await request.json().catch(() => null) as { withdrawalId?: number; action?: 'approve' | 'reject'; reviewNote?: string } | null;
  if (!body?.withdrawalId || (body.action !== 'approve' && body.action !== 'reject')) return NextResponse.json({ error: 'Withdrawal and action are required.' }, { status: 400 });
  try {
    await db.transaction(async tx => {
      const rows = await tx.select().from(investorWithdrawals).where(and(eq(investorWithdrawals.id, body.withdrawalId!), eq(investorWithdrawals.status, 'pending'))).limit(1);
      if (!rows[0]) throw new Error('Pending withdrawal was not found.');
      const withdrawal = rows[0];
      const status = body.action === 'approve' ? 'approved' : 'rejected';
      await tx.update(investorWithdrawals).set({ status, reviewedBy: actor.id, reviewNote: body.reviewNote?.trim() || null }).where(eq(investorWithdrawals.id, withdrawal.id));
      if (body.action === 'reject') {
        const accounts = await tx.select().from(investorAccounts).where(and(eq(investorAccounts.investorId, withdrawal.investorId), eq(investorAccounts.status, 'active'))).limit(1);
        if (accounts[0]) await tx.update(investorAccounts).set({ balanceCents: accounts[0].balanceCents + withdrawal.amountCents }).where(eq(investorAccounts.id, accounts[0].id));
        await tx.insert(portfolioLedger).values({ investorId: withdrawal.investorId, type: 'adjustment', amountCents: withdrawal.amountCents, referenceId: `investor-withdrawal-reversal:${withdrawal.id}`, description: 'Rejected withdrawal balance released' });
      }
    });
    return NextResponse.json({ updated: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Withdrawal settlement failed.' }, { status: 400 });
  }
}
