import { NextResponse } from "next/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { requireAuth } from "@/lib/auth-helpers";
import { getDb } from "@/lib/db";
import { referralAttributions, referralLinks, referralRewards, referralWithdrawals, users } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { identity, error } = await requireAuth();
    if (error) return error;
    const db = getDb();
    if (!db) return NextResponse.json({ link: null, attributions: [], referredUsers: [], rewards: [], withdrawals: [], balanceCents: 0 });

    const [link, attributions, rewards, withdrawals] = await Promise.all([
      db.select().from(referralLinks).where(eq(referralLinks.ownerId, identity.id)).orderBy(desc(referralLinks.createdAt)).limit(1),
      db.select().from(referralAttributions).where(and(eq(referralAttributions.referrerId, identity.id), eq(referralAttributions.status, "active"))),
      db.select().from(referralRewards).where(eq(referralRewards.referrerId, identity.id)).orderBy(desc(referralRewards.createdAt)),
      db.select().from(referralWithdrawals).where(eq(referralWithdrawals.investorId, identity.id)).orderBy(desc(referralWithdrawals.createdAt)),
    ]);
    const withdrawalHold = withdrawals.filter(item => item.status === "pending" || item.status === "approved").reduce((sum, item) => sum + item.amountCents, 0);
    const earned = rewards.filter(item => item.status !== "reversed").reduce((sum, item) => sum + item.rewardAmountCents, 0);
    const referredIds = attributions.map(item => item.referredInvestorId);
    const referredUsers = referredIds.length ? await db.select({ id: users.id, name: users.name, email: users.email }).from(users).where(inArray(users.id, referredIds)) : [];
    return NextResponse.json({ link: link[0] ?? null, attributions, referredUsers, rewards, withdrawals, balanceCents: Math.max(0, earned - withdrawalHold) });
  } catch (err) {
    console.error('[referrals/summary]', err);
    return NextResponse.json({ link: null, attributions: [], referredUsers: [], rewards: [], withdrawals: [], balanceCents: 0 }, { status: 500 });
  }
}
