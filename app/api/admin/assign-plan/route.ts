import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { getDb } from '@/lib/db';
import { investorAccounts, plans, portfolioLedger, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { notifyUser } from '@/lib/notifications';
import { sendPlanUpdated } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { identity, error } = await requireAdmin();
    if (error) return error;

    const db = getDb();
    if (!db) return NextResponse.json({ error: 'Database not configured' }, { status: 503 });

    const body = await request.json().catch(() => null) as {
      investorId?: string;
      planName?: string;
    } | null;

    if (!body?.investorId || !body?.planName) {
      return NextResponse.json({ error: 'Investor ID and plan name are required.' }, { status: 400 });
    }

      const result = await db.transaction(async tx => {
      const targetPlan = await tx.select().from(plans).where(eq(plans.name, body.planName!)).limit(1);
      if (!targetPlan[0]) throw new Error('Plan not found');

      const existing = await tx.select().from(investorAccounts).where(eq(investorAccounts.investorId, body.investorId!)).limit(1);
      const principalCents = existing[0]?.principalCents ?? 0;

      if (principalCents < targetPlan[0].minimumDepositCents) {
        throw new Error(
          `This investor's total deposit of $${(principalCents / 100).toFixed(2)} is below the ${targetPlan[0].name} plan's minimum of $${(targetPlan[0].minimumDepositCents / 100).toFixed(2)}. No plan is granted until the minimum deposit is reached.`
        );
      }

      if (existing[0]) {
        await tx.update(investorAccounts).set({
          planId: targetPlan[0].id,
          status: 'active',
          updatedAt: new Date(),
        }).where(eq(investorAccounts.id, existing[0].id));
      } else {
        await tx.insert(investorAccounts).values({
          id: crypto.randomUUID(),
          investorId: body.investorId!,
          planId: targetPlan[0].id,
          principalCents,
          balanceCents: principalCents,
          status: 'active',
        });
      }

      await tx.insert(portfolioLedger).values({
        investorId: body.investorId!,
        type: 'plan_upgrade',
        amountCents: 0,
        referenceId: `plan-assign-${crypto.randomUUID()}`,
        description: `Account assigned to the ${targetPlan[0].name} plan`,
      });

      return { success: true, plan: body.planName!, investorId: body.investorId! };
    });

    await notifyUser(result.investorId, 'plan_updated', 'Plan assigned', `Your account has been assigned the ${result.plan} plan.`);
    try {
      const investor = await db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, result.investorId)).limit(1);
      if (investor[0]?.email) sendPlanUpdated(investor[0].email, investor[0].name || 'Investor', 'Previous plan', result.plan);
    } catch {}

    return NextResponse.json(result);
  } catch (err) {
    console.error('[admin assign-plan POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
