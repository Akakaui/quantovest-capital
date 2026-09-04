import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getCurrentIdentity } from '@/lib/supabase/identity';
import { getDb } from '@/lib/db';
import { investorAccounts, plans, portfolioLedger } from '@/db/schema';
import { notifyUser } from '@/lib/notifications';
import { sendPlanUpdated } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const actor = await getCurrentIdentity();
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: 'Database is not configured' }, { status: 503 });

  const body = await request.json().catch(() => null) as { planName?: string } | null;
  const planName = body?.planName;

  if (!planName || !['Starter', 'Growth', 'Elite'].includes(planName)) {
    return NextResponse.json({ error: 'Invalid plan name. Must be Starter, Growth, or Elite.' }, { status: 400 });
  }

  try {
    const [account] = await db.select().from(investorAccounts).where(eq(investorAccounts.investorId, actor.id)).limit(1);

    if (!account) {
      return NextResponse.json({ error: 'No investor account found.' }, { status: 404 });
    }

    const [targetPlan] = await db.select().from(plans).where(eq(plans.name, planName)).limit(1);
    if (!targetPlan) {
      return NextResponse.json({ error: `Plan "${planName}" not found in database.` }, { status: 404 });
    }

    if (account.planId === targetPlan.id) {
      return NextResponse.json({ success: true, plan: planName, unchanged: true });
    }

    if (account.principalCents < targetPlan.minimumDepositCents) {
      return NextResponse.json({
        error: `Your total deposit of $${(account.principalCents / 100).toFixed(2)} does not meet the ${targetPlan.name} plan minimum of $${(targetPlan.minimumDepositCents / 100).toFixed(2)} yet.`,
      }, { status: 400 });
    }

    const previousPlan = account.planId
      ? await db.select({ name: plans.name }).from(plans).where(eq(plans.id, account.planId)).limit(1)
      : [];
    await db.transaction(async tx => {
      await tx.update(investorAccounts).set({ planId: targetPlan.id, updatedAt: new Date() }).where(eq(investorAccounts.id, account.id));
      await tx.insert(portfolioLedger).values({
        investorId: actor.id,
        type: 'plan_upgrade',
        amountCents: 0,
        referenceId: `plan-upgrade:${crypto.randomUUID()}`,
        description: `Plan changed from ${previousPlan[0]?.name ?? 'previous plan'} to ${targetPlan.name}`,
      });
    });

    await notifyUser(actor.id, 'plan_updated', 'Investment plan updated', `You've upgraded to the ${targetPlan.name} plan.`);
    if (actor.email) {
      void sendPlanUpdated(actor.email, actor.name || 'Investor', previousPlan[0]?.name ?? 'Previous plan', targetPlan.name).catch(error => console.error('[upgrade plan email]', error));
    }
    return NextResponse.json({ success: true, plan: planName });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Upgrade failed.' }, { status: 500 });
  }
}
