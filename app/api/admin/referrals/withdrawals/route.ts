import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getCurrentIdentity } from "@/lib/supabase/identity";
import { getDb } from "@/lib/db";
import { portfolioLedger, referralRewards, referralWithdrawals } from "@/db/schema";

export async function GET() {
  const actor = await getCurrentIdentity();
  if (!actor?.id || actor.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
  return NextResponse.json(await db.select().from(referralWithdrawals));
}

export async function PATCH(request: Request) {
  const actor = await getCurrentIdentity();
  if (!actor?.id || actor.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
  const body = await request.json().catch(() => null) as { withdrawalId?: number; action?: "approve" | "reject"; reviewNote?: string } | null;
  if (!body?.withdrawalId || (body.action !== "approve" && body.action !== "reject")) return NextResponse.json({ error: "Withdrawal and action are required." }, { status: 400 });
  try {
    await db.transaction(async tx => {
      const rows = await tx.select().from(referralWithdrawals).where(and(eq(referralWithdrawals.id, body.withdrawalId!), eq(referralWithdrawals.status, "pending"))).limit(1);
      if (!rows[0]) throw new Error("Pending referral withdrawal was not found.");
      const withdrawal = rows[0];
      const status = body.action === "approve" ? "approved" : "rejected";
      await tx.update(referralWithdrawals).set({ status, reviewedBy: actor.id, reviewNote: body.reviewNote?.trim() || null }).where(eq(referralWithdrawals.id, withdrawal.id));
      await tx.update(referralRewards).set({ status: body.action === "approve" ? "paid" : "available" }).where(and(eq(referralRewards.referrerId, withdrawal.investorId), eq(referralRewards.status, "held")));
      if (body.action === "approve") await tx.insert(portfolioLedger).values({ investorId: withdrawal.investorId, type: "withdrawal", amountCents: -withdrawal.amountCents, referenceId: `referral-withdrawal:${withdrawal.id}`, description: "Referral bonus withdrawal approved" });
    });
    return NextResponse.json({ updated: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Settlement failed." }, { status: 400 });
  }
}
