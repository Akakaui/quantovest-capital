import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { getDb } from '@/lib/db';
import { investorAccounts, portfolioLedger } from '@/db/schema';
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
      amountCents?: number;
      reason?: string;
    } | null;

    if (!body?.investorId || !body?.amountCents || body.amountCents <= 0) {
      return NextResponse.json({ error: 'Investor ID and positive amount are required.' }, { status: 400 });
    }

    const result = await db.transaction(async tx => {
      const existing = await tx.select().from(investorAccounts).where(eq(investorAccounts.investorId, body.investorId!)).limit(1);

      if (existing[0]) {
        await tx.update(investorAccounts).set({
          balanceCents: existing[0].balanceCents + body.amountCents!,
          updatedAt: new Date(),
        }).where(eq(investorAccounts.id, existing[0].id));
      } else {
        const { plans } = await import('@/db/schema');
        const defaultPlan = await tx.select().from(plans).where(eq(plans.name, 'Starter')).limit(1);
        await tx.insert(investorAccounts).values({
          id: crypto.randomUUID(),
          investorId: body.investorId!,
          planId: defaultPlan[0]?.id ?? 1,
          principalCents: body.amountCents!,
          balanceCents: body.amountCents!,
          status: 'active',
        });
      }

      const cleanReason = body.reason?.replace(/admin/gi, 'system') || '';
      
      await tx.insert(portfolioLedger).values({
        investorId: body.investorId!,
        type: 'credit',
        amountCents: body.amountCents!,
        referenceId: `credit-${Date.now()}-${cleanReason.slice(0, 100)}`,
        description: `Account credited — $${(body.amountCents! / 100).toFixed(2)}${cleanReason ? ` (${cleanReason})` : ''}`,
      });

      return { success: true, amountCents: body.amountCents!, investorId: body.investorId! };
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('[admin balance POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
