import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { getDb } from '@/lib/db';
import { investorAccounts, portfolioLedger, plans } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { notifyUser } from '@/lib/notifications';
import { syncPlanForPrincipal } from '@/lib/auto-plan';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { identity, error } = await requireAdmin();
    if (error) return error;

    const db = getDb();
    if (!db) return NextResponse.json({ error: 'Database not configured' }, { status: 503 });

    const body = await request.json().catch(() => null) as {
      investorId?: string;
      amountCents?: number;
      reason?: string;
    } | null;

    if (!body?.investorId || !body?.amountCents || body.amountCents <= 0) {
      return NextResponse.json({ error: 'Investor ID and positive amount are required.' }, { status: 400 });
    }

    const result = await db.transaction(async tx => {
      const existing = await tx.select().from(investorAccounts).where(eq(investorAccounts.investorId, body.investorId!)).limit(1);

      let accountId: string;
      let currentPlanId: number;
      let newPrincipalCents: number;
      let planName: string | null = null;

      if (existing[0]) {
        accountId = existing[0].id;
        currentPlanId = existing[0].planId;
        newPrincipalCents = existing[0].principalCents + body.amountCents!;
        await tx.update(investorAccounts).set({
          principalCents: newPrincipalCents,
          balanceCents: existing[0].balanceCents + body.amountCents!,
          updatedAt: new Date(),
        }).where(eq(investorAccounts.id, existing[0].id));
      } else {
        const defaultPlan = await tx.select().from(plans).where(eq(plans.name, 'Starter')).limit(1);
        accountId = crypto.randomUUID();
        currentPlanId = defaultPlan[0]?.id ?? 1;
        newPrincipalCents = body.amountCents!;
        await tx.insert(investorAccounts).values({
          id: accountId,
          investorId: body.investorId!,
          planId: currentPlanId,
          principalCents: body.amountCents!,
          balanceCents: body.amountCents!,
          status: 'active',
        });
      }

      const planResult = await syncPlanForPrincipal(tx, accountId, body.investorId!, currentPlanId, newPrincipalCents);
      planName = planResult.changed ? planResult.toPlanName : null;

      const cleanReason = body.reason?.replace(/\badmin\b/gi, 'system') || '';

      await tx.insert(portfolioLedger).values({
        investorId: body.investorId!,
        type: 'credit',
        amountCents: body.amountCents!,
        referenceId: `credit-${crypto.randomUUID()}`,
        description: `Account credited — $${(body.amountCents! / 100).toFixed(2)}${cleanReason ? ` (${cleanReason})` : ''}`,
      });

      return { success: true, amountCents: body.amountCents!, investorId: body.investorId!, planName };
    });

    const dollars = (result.amountCents / 100).toFixed(2);
    const cleanReason = body.reason?.replace(/\badmin\b/gi, 'system')?.trim();
    await notifyUser(result.investorId, 'credit', 'Account credited', `Your account has been credited $${dollars}${cleanReason ? ` (${cleanReason})` : ''}.`);
    if (result.planName) await notifyUser(result.investorId, 'plan_updated', 'Plan upgraded', `You've been upgraded to the ${result.planName} plan.`);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[admin balance POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
