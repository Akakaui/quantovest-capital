import { NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { getCurrentIdentity } from '@/lib/supabase/identity';
import { getDb } from '@/lib/db';
import { users, investorAccounts, plans, roiEntries, kycApplications } from '@/db/schema';

export const dynamic = 'force-dynamic';

export async function GET() {
  const actor = await getCurrentIdentity();
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: 'Database is not configured' }, { status: 503 });

  const [userRow] = await db.select().from(users).where(eq(users.id, actor.id)).limit(1);
  if (!userRow) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const [account] = await db.select().from(investorAccounts).where(eq(investorAccounts.investorId, actor.id)).limit(1);

  let planName: string | null = null;
  if (account?.planId) {
    const [plan] = await db.select().from(plans).where(eq(plans.id, account.planId)).limit(1);
    planName = plan?.name ?? null;
  }

  const latestRoi = await db.select().from(roiEntries).where(eq(roiEntries.investorId, actor.id)).orderBy(desc(roiEntries.entryDate)).limit(1);

  const [latestKyc] = await db.select().from(kycApplications).where(eq(kycApplications.investorId, actor.id)).orderBy(desc(kycApplications.createdAt)).limit(1);

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
}
