import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { referralRewards, referralWithdrawals } from "@/db/schema";

const MIN_WITHDRAWAL_CENTS = 50_000;

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
  const body = await request.json().catch(() => null) as { amountCents?: number; destinationType?: "bank" | "crypto"; destination?: string; destinationDetails?: string } | null;
  if (!body || typeof body.amountCents !== "number" || !Number.isInteger(body.amountCents) || body.amountCents < MIN_WITHDRAWAL_CENTS) return NextResponse.json({ error: "Minimum referral withdrawal is $500." }, { status: 400 });
  if (body.destinationType !== "bank" && body.destinationType !== "crypto") return NextResponse.json({ error: "Choose bank or crypto destination." }, { status: 400 });
  if (!body.destination || body.destination.trim().length < (body.destinationType === "crypto" ? 16 : 6)) return NextResponse.json({ error: "Enter valid destination details." }, { status: 400 });
  if (body.destinationType === "bank" && !body.destinationDetails?.trim()) return NextResponse.json({ error: "Bank name and account-holder details are required." }, { status: 400 });
  const destinationType = body.destinationType;
  const destination = body.destination.trim();
  const destinationDetails = body.destinationDetails?.trim() || null;

  try {
    const result = await db.transaction(async tx => {
      const rewards = await tx.select().from(referralRewards).where(and(eq(referralRewards.referrerId, session.user.id), eq(referralRewards.status, "available")));
      const available = rewards.reduce((sum, item) => sum + item.rewardAmountCents, 0);
      if (available < MIN_WITHDRAWAL_CENTS) throw new Error("Referral balance has not reached the $500 minimum.");
      if (body.amountCents !== available) throw new Error("For ledger safety, request the full available referral balance.");
      for (const reward of rewards) await tx.update(referralRewards).set({ status: "held" }).where(and(eq(referralRewards.id, reward.id), eq(referralRewards.status, "available")));
      const inserted = await tx.insert(referralWithdrawals).values({ investorId: session.user.id, amountCents: body.amountCents, destinationType, destination, destinationDetails, status: "pending" });
      return Number(inserted[0].insertId);
    });
    return NextResponse.json({ withdrawalId: result, status: "pending" }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Withdrawal request failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
