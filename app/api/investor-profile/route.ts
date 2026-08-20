import { NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { getCurrentIdentity } from '@/lib/supabase/identity';
import { getDb } from '@/lib/db';
import { users, investorAccounts, plans, roiEntries, kycApplications } from '@/db/schema';

export const dynamic = 'force-dynamic';

const fallbackProfile = (actor: { id: string; email: string | null; role: string }) => ({
  id: actor.id,
  name: null,
  email: actor.email,
  avatar: null,
  role: actor.role,
  balance: 0,
  totalInvested: 0,
  totalProfit: 0,
  dailyRoiPercent: 0,
  allTimeRoiPercent: 0,
  plan: 'None',
  kycStatus: 'unverified',
  onboardingCompleted: false,
});

export async function GET() {
  try {
    const actor = await getCurrentIdentity();
    if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getDb();
    if (!db) return NextResponse.json(fallbackProfile(actor));

    try {
      const [userRow] = await db.select().from(users).where(eq(users.id, actor.id)).limit(1);
      if (!userRow) return NextResponse.json(fallbackProfile(actor));

      let account: typeof investorAccounts.$inferSelect | undefined;
      try {
        [account] = await db.select().from(investorAccounts).where(eq(investorAccounts.investorId, actor.id)).limit(1);
      } catch {}

      let planName: string | null = null;
      if (account?.planId) {
        try {
          const [plan] = await db.select().from(plans).where(eq(plans.id, account.planId)).limit(1);
          planName = plan?.name ?? null;
        } catch {}
      }

      let latestRoi: any[] = [];
      try {
        latestRoi = await db.select().from(roiEntries).where(eq(roiEntries.investorId, actor.id)).orderBy(desc(roiEntries.entryDate)).limit(1);
      } catch {}

      let latestKyc: typeof kycApplications.$inferSelect | undefined;
      try {
        [latestKyc] = await db.select().from(kycApplications).where(eq(kycApplications.investorId, actor.id)).orderBy(desc(kycApplications.createdAt)).limit(1);
      } catch {}

      const balanceCents = account?.balanceCents ?? 0;
      const principalCents = account?.principalCents ?? 0;
      const balance = balanceCents / 100;
      const totalInvested = principalCents / 100;
      const totalProfit = balance - totalInvested;
      const allTimeRoiPercent = totalInvested > 0 ? Number((((balance - totalInvested) / totalInvested) * 100).toFixed(2)) : 0;
      const dailyRoiPercent = latestRoi[0] ? latestRoi[0].percentageBps / 100 : 0;

      return NextResponse.json({
        id: userRow.id,
        name: userRow.name,
        email: userRow.email,
        avatar: userRow.image,
        role: actor.role,
        balance,
        totalInvested,
        totalProfit: Number(totalProfit.toFixed(2)),
        dailyRoiPercent,
        allTimeRoiPercent,
        plan: planName ?? 'None',
        kycStatus: latestKyc?.status ?? 'unverified',
        onboardingCompleted: !!account,
      });
    } catch (dbErr) {
      console.error('[investor-profile] DB error, returning fallback', dbErr);
      return NextResponse.json(fallbackProfile(actor));
    }
  } catch (err) {
    console.error('[investor-profile]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
