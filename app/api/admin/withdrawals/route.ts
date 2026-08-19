import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth-helpers';
import { notifyAdmins, notifyUser } from '@/lib/notifications';
import { getDb } from '@/lib/db';
import { investorAccounts, investorWithdrawals, portfolioLedger } from '@/db/schema';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { identity, error } = await requireAdmin();
    if (error) return error;
    const db = getDb();
    if (!db) return NextResponse.json([]);
    return NextResponse.json(await db.select().from(investorWithdrawals));
  } catch (err) {
    console.error('[withdrawals]', err);
    return NextResponse.json([], { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { identity, error } = await requireAdmin();
    if (error) return error;
    const db = getDb();
    if (!db) return NextResponse.json({ error: 'Database is not configured' }, { status: 503 });
    const body = await request.json().catch(() => null) as { withdrawalId?: number; action?: 'approve' | 'reject'; reviewNote?: string } | null;
    if (!body?.withdrawalId || (body.action !== 'approve' && body.action !== 'reject')) return NextResponse.json({ error: 'Withdrawal and action are required.' }, { status: 400 });
    try {
    let investorId: string | null = null;
    let amountCents = 0;
    await db.transaction(async tx => {
      const rows = await tx.select().from(investorWithdrawals).where(and(eq(investorWithdrawals.id, body.withdrawalId!), eq(investorWithdrawals.status, 'pending'))).limit(1);
      if (!rows[0]) throw new Error('Pending withdrawal was not found.');
      const withdrawal = rows[0];
      investorId = withdrawal.investorId;
      amountCents = withdrawal.amountCents;
      const status = body.action === 'approve' ? 'approved' : 'rejected';
      await tx.update(investorWithdrawals).set({ status, reviewedBy: identity.id, reviewNote: body.reviewNote?.trim() || null }).where(eq(investorWithdrawals.id, withdrawal.id));
      if (body.action === 'reject') {
        const accounts = await tx.select().from(investorAccounts).where(and(eq(investorAccounts.investorId, withdrawal.investorId), eq(investorAccounts.status, 'active'))).limit(1);
        if (accounts[0]) await tx.update(investorAccounts).set({ balanceCents: accounts[0].balanceCents + withdrawal.amountCents }).where(eq(investorAccounts.id, accounts[0].id));
        await tx.insert(portfolioLedger).values({ investorId: withdrawal.investorId, type: 'adjustment', amountCents: withdrawal.amountCents, referenceId: `investor-withdrawal-reversal:${withdrawal.id}`, description: 'Rejected withdrawal balance released' });
      }
    });
    if (investorId) {
      const dollars = (amountCents / 100).toFixed(2);
      if (body.action === 'approve') {
        await notifyUser(investorId, 'withdrawal_approved', 'Withdrawal processed', `Your withdrawal of $${dollars} has been processed.`);
      } else {
        await notifyUser(investorId, 'withdrawal_rejected', 'Withdrawal declined', `Your withdrawal of $${dollars} was declined. ${body.reviewNote?.trim() || ''}`.trim());
      }
      await notifyAdmins(`withdrawal_${body.action === 'approve' ? 'approved' : 'rejected'}`, `Withdrawal ${body.action}`, `Withdrawal #${body.withdrawalId} was ${body.action} by admin.`);
    }
    return NextResponse.json({ updated: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Withdrawal settlement failed.' }, { status: 400 });
  }
  } catch (err) {
    console.error('[withdrawals PATCH]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
