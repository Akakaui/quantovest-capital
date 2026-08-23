import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { and, asc, eq, isNull, lte, or } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth-helpers';
import { notifyAdmins, notifyUser } from '@/lib/notifications';
import { getDb } from '@/lib/db';
import { deposits, investorAccounts, plans, portfolioLedger, users } from '@/db/schema';
import { sendDepositApproved, sendDepositRejected } from '@/lib/email';
import { databaseUnavailable } from '@/lib/api-errors';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { identity, error } = await requireAdmin();
    if (error) return error;
    const db = getDb();
    if (!db) return databaseUnavailable('admin deposits GET');
    const rows = await db.select().from(deposits).where(eq(deposits.status, 'pending'));
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucket = process.env.SUPABASE_MEDIA_BUCKET?.trim();
    if (!url || !serviceKey || bucket !== 'quantovest-media') return NextResponse.json(rows.map(row => ({ ...row, proofUrl: null })));
    const storage = createClient(url, serviceKey).storage.from(bucket);
    const enriched = await Promise.all(rows.map(async row => {
      if (!row.proofPath) return { ...row, proofUrl: null };
      const signed = await storage.createSignedUrl(row.proofPath, 300);
      return { ...row, proofUrl: signed.data?.signedUrl ?? null };
    }));
    return NextResponse.json(enriched);
  } catch (err) {
    return databaseUnavailable('admin deposits GET', err);
  }
}

export async function PATCH(request: Request) {
  try {
    const { identity, error } = await requireAdmin();
    if (error) return error;
    const db = getDb();
    if (!db) return NextResponse.json({ error: 'Database is not configured' }, { status: 503 });
    const body = await request.json().catch(() => null) as { depositId?: string; action?: 'approve' | 'reject'; reviewNote?: string } | null;
    if (!body?.depositId || (body.action !== 'approve' && body.action !== 'reject')) return NextResponse.json({ error: 'Deposit and action are required.' }, { status: 400 });
    try {
    const result = await db.transaction(async tx => {
      const rows = await tx.select().from(deposits).where(and(eq(deposits.id, body.depositId!), eq(deposits.status, 'pending'))).limit(1);
      if (!rows[0]) throw new Error('Pending deposit was not found.');
      const deposit = rows[0];
      if (body.action === 'reject') {
        await tx.update(deposits).set({ status: 'rejected', reviewedBy: identity.id, reviewNote: body.reviewNote?.trim() || null, updatedAt: new Date() }).where(eq(deposits.id, deposit.id));
        return { investorId: deposit.investorId, status: 'rejected', planName: null, amountCents: deposit.amountCents };
      }
      const availablePlans = await tx.select().from(plans).where(eq(plans.active, 1)).orderBy(asc(plans.minimumDepositCents));
      const selectedPlan = (deposit.planId ? availablePlans.find(plan => plan.id === deposit.planId) : undefined) ?? [...availablePlans].reverse().find(plan => deposit.amountCents >= plan.minimumDepositCents && (plan.maximumDepositCents == null || deposit.amountCents <= plan.maximumDepositCents));
      if (!selectedPlan) throw new Error('No active plan matches this deposit amount.');
      await tx.update(deposits).set({ status: 'completed', planId: selectedPlan.id, reviewedBy: identity.id, reviewNote: body.reviewNote?.trim() || null, updatedAt: new Date() }).where(eq(deposits.id, deposit.id));
      const existing = await tx.select().from(investorAccounts).where(eq(investorAccounts.investorId, deposit.investorId)).limit(1);
      if (existing[0]) await tx.update(investorAccounts).set({ planId: selectedPlan.id, principalCents: existing[0].principalCents + deposit.amountCents, balanceCents: existing[0].balanceCents + deposit.amountCents, status: 'active', updatedAt: new Date() }).where(eq(investorAccounts.id, existing[0].id));
      else await tx.insert(investorAccounts).values({ id: crypto.randomUUID(), investorId: deposit.investorId, planId: selectedPlan.id, principalCents: deposit.amountCents, balanceCents: deposit.amountCents, status: 'active' });
      await tx.insert(portfolioLedger).values({ investorId: deposit.investorId, type: 'deposit', amountCents: deposit.amountCents, referenceId: deposit.id, description: `Deposit approved and assigned to ${selectedPlan.name} plan` });
      return { investorId: deposit.investorId, status: 'completed', planName: selectedPlan.name, amountCents: deposit.amountCents };
    });
    if (result.status === 'completed') await notifyUser(result.investorId, 'deposit_approved', 'Deposit approved', `Your deposit was verified and your account is now on the ${result.planName} plan.`);
    else await notifyUser(result.investorId, 'deposit_rejected', 'Deposit requires attention', 'Your deposit proof was not approved. Review the admin note and submit corrected proof.');
    await notifyAdmins(`deposit_${result.status}`, `Deposit ${result.status}`, `The deposit review was marked ${result.status} for investor ${result.investorId}.`);
    try {
      const investor = await db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, result.investorId)).limit(1);
      if (investor[0]?.email) {
        if (result.status === 'completed') sendDepositApproved(investor[0].email, investor[0].name || 'Investor', `$${(result.amountCents / 100).toFixed(2)}`, result.planName!);
        else sendDepositRejected(investor[0].email, investor[0].name || 'Investor', body.reviewNote?.trim() || 'Deposit proof did not meet requirements.');
      }
    } catch {}
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Deposit review failed.' }, { status: 400 });
  }
  } catch (err) {
    console.error('[deposits PATCH]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
