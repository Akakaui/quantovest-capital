import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getCurrentIdentity } from '@/lib/supabase/identity';
import { getDb } from '@/lib/db';
import { investorAccounts, plans } from '@/db/schema';

export const dynamic = 'force-dynamic';

const PLAN_MINIMUMS_CENTS: Record<string, number> = {
  Starter: 50000,
  Growth: 500000,
  Elite: 1500000,
};

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

  const minBalanceCents = PLAN_MINIMUMS_CENTS[planName];

  try {
    const [account] = await db.select().from(investorAccounts).where(eq(investorAccounts.investorId, actor.id)).limit(1);

    if (!account) {
      return NextResponse.json({ error: 'No investor account found.' }, { status: 404 });
    }

    if (account.balanceCents < minBalanceCents) {
      const needed = (minBalanceCents - account.balanceCents) / 100;
      return NextResponse.json({
        success: false,
        error: `Insufficient balance. You need $${needed.toLocaleString()} more to qualify for the ${planName} plan.`
      }, { status: 400 });
    }

    const [targetPlan] = await db.select().from(plans).where(eq(plans.name, planName)).limit(1);
    if (!targetPlan) {
      return NextResponse.json({ error: `Plan "${planName}" not found in database.` }, { status: 404 });
    }

    await db.update(investorAccounts).set({ planId: targetPlan.id }).where(eq(investorAccounts.id, account.id));

    return NextResponse.json({ success: true, plan: planName });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Upgrade failed.' }, { status: 500 });
  }
}
