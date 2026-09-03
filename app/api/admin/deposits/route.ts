import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { and, asc, desc, eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth-helpers';
import { notifyAdmins, notifyUser } from '@/lib/notifications';
import { getDb } from '@/lib/db';
import { deposits, investorAccounts, plans, portfolioLedger, users } from '@/db/schema';
import { sendDepositApproved, sendDepositRejected } from '@/lib/email';
import { databaseUnavailable } from '@/lib/api-errors';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { identity, error } = await requireAdmin();
    if (error) return error;
    const db = getDb();
    if (!db) return databaseUnavailable('admin deposits GET');
    const status = new URL(request.url).searchParams.get('status') ?? 'pending';
    const rows = await db.select({ deposit: deposits, investorName: users.name, investorEmail: users.email })
      .from(deposits)
      .leftJoin(users, eq(deposits.investorId, users.id))
      .where(status === 'all' ? undefined : eq(deposits.status, status))
      .orderBy(desc(deposits.createdAt));
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucket = process.env.SUPABASE_MEDIA_BUCKET?.trim();
    const flattened = rows.map(row => ({ ...row.deposit, investorName: row.investorName, investorEmail: row.investorEmail }));
    if (!url || !serviceKey || bucket !== 'quantovest-media') return NextResponse.json(flattened.map(row => ({ ...row, proofUrl: null })));
    const storage = createClient(url, serviceKey).storage.from(bucket);
    const enriched = await Promise.all(flattened.map(async row => {
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
      // 1. Find the deposit and confirm it is pending FIRST (prevents race conditions)
      const rows = await tx.select().from(deposits).where(and(eq(deposits.id, body.depositId!), eq(deposits.status, 'pending'))).limit(1);
      if (!rows[0]) {
        const existing = await tx.select({ id: deposits.id, status: deposits.status }).from(deposits).where(eq(deposits.id, body.depositId!)).limit(1);
        if (!existing[0]) throw new Error('Deposit not found.');
        if (existing[0].status === 'completed' || existing[0].status === 'approved') {
          return { investorId: '', status: 'completed', planName: null, amountCents: 0, alreadyProcessed: true };
        }
        throw new Error(`Deposit is already ${existing[0].status}. Only pending deposits can be reviewed.`);
      }
      const deposit = rows[0];
      if (body.action === 'reject') {
        await tx.update(deposits).set({ status: 'rejected', reviewedBy: identity.id, reviewNote: body.reviewNote?.trim() || null, updatedAt: new Date() }).where(eq(deposits.id, deposit.id));
        return { investorId: deposit.investorId, status: 'rejected', planName: null, amountCents: deposit.amountCents };
      }
      // 2. Mark deposit as completed BEFORE touching balance (prevents re-processing)
      await tx.update(deposits).set({ status: 'completed', reviewedBy: identity.id, reviewNote: body.reviewNote?.trim() || null, updatedAt: new Date() }).where(eq(deposits.id, deposit.id));
      // 3. Credit investor balance — plan assignment is optional and separate
      const existingAccounts = await tx.select().from(investorAccounts).where(eq(investorAccounts.investorId, deposit.investorId)).limit(1);
      // Try to find a matching plan but do NOT fail if none found
      const availablePlans = await tx.select().from(plans).where(eq(plans.active, 1)).orderBy(asc(plans.minimumDepositCents));
      const selectedPlan = (deposit.planId ? availablePlans.find(plan => plan.id === deposit.planId) : undefined)
        ?? [...availablePlans].reverse().find(plan => deposit.amountCents >= plan.minimumDepositCents && (plan.maximumDepositCents == null || deposit.amountCents <= plan.maximumDepositCents));
      if (existingAccounts[0]) {
        await tx.update(investorAccounts).set({
          ...(selectedPlan ? { planId: selectedPlan.id } : {}),
          principalCents: existingAccounts[0].principalCents + deposit.amountCents,
          balanceCents: existingAccounts[0].balanceCents + deposit.amountCents,
          status: 'active',
          updatedAt: new Date(),
        }).where(eq(investorAccounts.id, existingAccounts[0].id));
      } else {
        // Create account with a placeholder planId of 1 (or selectedPlan if found)
        const planId = selectedPlan?.id ?? availablePlans[0]?.id ?? 1;
        await tx.insert(investorAccounts).values({ id: crypto.randomUUID(), investorId: deposit.investorId, planId, principalCents: deposit.amountCents, balanceCents: deposit.amountCents, status: 'active' });
      }
      // 4. Record in ledger (guard against unique constraint if entry already exists from a prior partial attempt)
      const existingLedger = await tx.select({ id: portfolioLedger.id }).from(portfolioLedger).where(and(eq(portfolioLedger.type, 'deposit'), eq(portfolioLedger.referenceId, deposit.id))).limit(1);
      if (!existingLedger[0]) {
        await tx.insert(portfolioLedger).values({ investorId: deposit.investorId, type: 'deposit', amountCents: deposit.amountCents, referenceId: deposit.id, description: selectedPlan ? `Deposit approved — ${selectedPlan.name} plan` : 'Deposit approved' });
      }
      return { investorId: deposit.investorId, status: 'completed', planName: selectedPlan?.name ?? null, amountCents: deposit.amountCents };
    });
    if ('alreadyProcessed' in result && result.alreadyProcessed) {
      return NextResponse.json({ message: 'Deposit was already processed.', ...result });
    }
    if (result.status === 'completed') await notifyUser(result.investorId, 'deposit_approved', 'Deposit approved', result.planName ? `Your deposit was verified and your account is now on the ${result.planName} plan.` : 'Your deposit has been verified and your account balance has been updated.');
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
