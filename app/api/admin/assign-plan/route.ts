import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { getDb } from '@/lib/db';
import { investorAccounts, plans, portfolioLedger } from '@/db/schema';
import { eq } from 'drizzle-orm';

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

      if (existing[0]) {
        await tx.update(investorAccounts).set({
          planId: targetPlan[0].id,
          updatedAt: new Date(),
        }).where(eq(investorAccounts.id, existing[0].id));
      } else {
        await tx.insert(investorAccounts).values({
          id: crypto.randomUUID(),
          investorId: body.investorId!,
          planId: targetPlan[0].id,
          principalCents: 0,
          balanceCents: 0,
          status: 'active',
        });
      }

      await tx.insert(portfolioLedger).values({
        investorId: body.investorId!,
        type: 'plan_assignment',
        amountCents: 0,
        referenceId: `plan-assign-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        description: `Plan assigned — ${body.planName}`,
      });

      return { success: true, plan: body.planName! };
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('[admin assign-plan POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
