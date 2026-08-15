import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { deposits, notifications, referralAttributions, referralRewards } from "@/db/schema";

const RATE_BPS = 1_000;

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
  const body = await request.json().catch(() => null) as { referredInvestorId?: string; depositId?: string } | null;
  if (!body?.referredInvestorId || !body.depositId) return NextResponse.json({ error: "Investor and deposit are required" }, { status: 400 });
  const deposit = await db.select().from(deposits).where(and(eq(deposits.id, body.depositId), eq(deposits.investorId, body.referredInvestorId), eq(deposits.status, "completed"))).limit(1);
  if (!deposit[0]) return NextResponse.json({ error: "Only a completed deposit can qualify" }, { status: 400 });
  const attribution = await db.select().from(referralAttributions).where(and(eq(referralAttributions.referredInvestorId, body.referredInvestorId), eq(referralAttributions.status, "active"))).limit(1);
  if (!attribution[0]) return NextResponse.json({ created: false, reason: "no_attribution" });
  const key = `first-deposit:${body.referredInvestorId}`;
  const existing = await db.select().from(referralRewards).where(eq(referralRewards.idempotencyKey, key)).limit(1);
  if (existing[0]) return NextResponse.json({ created: false, reason: "already_rewarded", reward: existing[0] });
  const rewardAmountCents = Math.max(0, Math.floor(deposit[0].amountCents * RATE_BPS / 10_000));
  const created = await db.transaction(async tx => {
    const inserted = await tx.insert(referralRewards).values({ attributionId: attribution[0].id, referrerId: attribution[0].referrerId, referredInvestorId: body.referredInvestorId!, qualifyingDepositId: body.depositId!, idempotencyKey: key, qualifyingAmountCents: deposit[0].amountCents, rewardAmountCents, status: "available" }).returning({ id: referralRewards.id });
    const rewardId = inserted[0].id;
    await tx.insert(notifications).values({ userId: attribution[0].referrerId, type: "referral_reward_credited", title: "Referral bonus credited", body: `Your referral generated a 10% first-deposit bonus of $${(rewardAmountCents / 100).toFixed(2)}.`, relatedRewardId: rewardId });
    return rewardId;
  });
  return NextResponse.json({ created: true, rewardId: created, rewardAmountCents }, { status: 201 });
}
