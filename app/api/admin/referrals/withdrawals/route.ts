import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth-helpers";
import { notifyAdmins, notifyUser } from "@/lib/notifications";
import { getDb } from "@/lib/db";
import { portfolioLedger, referralRewards, referralWithdrawals } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { identity, error } = await requireAdmin();
    if (error) return error;
    const db = getDb();
    if (!db) return NextResponse.json([]);
    return NextResponse.json(await db.select().from(referralWithdrawals));
  } catch (err) {
    console.error('[referrals/withdrawals]', err);
    return NextResponse.json([], { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { identity, error } = await requireAdmin();
    if (error) return error;
    const db = getDb();
    if (!db) return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
    const body = await request.json().catch(() => null) as { withdrawalId?: number; action?: "approve" | "reject"; reviewNote?: string } | null;
    if (!body?.withdrawalId || (body.action !== "approve" && body.action !== "reject")) return NextResponse.json({ error: "Withdrawal and action are required." }, { status: 400 });
    try {
    let investorId: string | null = null;
    let amountCents = 0;
    await db.transaction(async tx => {
      const rows = await tx.select().from(referralWithdrawals).where(and(eq(referralWithdrawals.id, body.withdrawalId!), eq(referralWithdrawals.status, "pending"))).limit(1);
      if (!rows[0]) throw new Error("Pending referral withdrawal was not found.");
      const withdrawal = rows[0];
      investorId = withdrawal.investorId;
      amountCents = withdrawal.amountCents;
      const status = body.action === "approve" ? "approved" : "rejected";
      await tx.update(referralWithdrawals).set({ status, reviewedBy: identity.id, reviewNote: body.reviewNote?.trim() || null }).where(eq(referralWithdrawals.id, withdrawal.id));
      await tx.update(referralRewards).set({ status: body.action === "approve" ? "paid" : "available" }).where(and(eq(referralRewards.referrerId, withdrawal.investorId), eq(referralRewards.status, "held")));
      if (body.action === "approve") await tx.insert(portfolioLedger).values({ investorId: withdrawal.investorId, type: "withdrawal", amountCents: -withdrawal.amountCents, referenceId: `referral-withdrawal:${withdrawal.id}`, description: "Referral bonus withdrawal approved" });
    });
    if (investorId) {
      const dollars = (amountCents / 100).toFixed(2);
      if (body.action === "approve") {
        await notifyUser(investorId, 'referral_withdrawal_approved', 'Referral withdrawal processed', `Your referral withdrawal of $${dollars} has been processed.`);
      } else {
        await notifyUser(investorId, 'referral_withdrawal_rejected', 'Referral withdrawal declined', `Your referral withdrawal of $${dollars} was declined. ${body.reviewNote?.trim() || ''}`.trim());
      }
      await notifyAdmins(`referral_withdrawal_${body.action}`, `Referral withdrawal ${body.action}`, `Referral withdrawal #${body.withdrawalId} was ${body.action}.`);
    }
    return NextResponse.json({ updated: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Settlement failed." }, { status: 400 });
  }
  } catch (err) {
    console.error('[referrals/withdrawals PATCH]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
