import { NextResponse } from "next/server";
import { getCurrentIdentity } from "@/lib/supabase/identity";
import { getDb } from "@/lib/db";
import { investorAccounts, deposits, investorWithdrawals, kycApplications, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const actor = await getCurrentIdentity();
    if (!actor || actor.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    if (!db) return NextResponse.json({ aumCents: 0, pendingDeposits: 0, pendingWithdrawals: 0, pendingKyc: 0, investorCount: 0 });

    const empty = { aumCents: 0, pendingDeposits: 0, pendingWithdrawals: 0, pendingKyc: 0, investorCount: 0 };

    try {
      await db.select().from(investorAccounts).limit(1);

      const [aumResult, investorRows] = await Promise.all([
        db.select({ balanceCents: investorAccounts.balanceCents }).from(investorAccounts),
        db.select({ id: users.id }).from(users).where(eq(users.role, "investor")),
      ]);
      const aumCents = aumResult.reduce((sum, r) => sum + (r.balanceCents ?? 0), 0);
      const investorCount = investorRows.length;

      const [depRows, wdrRows, kycRows] = await Promise.all([
        db.select({ id: deposits.id }).from(deposits).where(eq(deposits.status, "pending")),
        db.select({ id: investorWithdrawals.id }).from(investorWithdrawals).where(eq(investorWithdrawals.status, "pending")),
        db.select({ id: kycApplications.id }).from(kycApplications).where(eq(kycApplications.status, "pending")),
      ]);

      return NextResponse.json({
        aumCents,
        investorCount,
        pendingDeposits: depRows.length,
        pendingWithdrawals: wdrRows.length,
        pendingKyc: kycRows.length,
      });
    } catch {
      return NextResponse.json(empty);
    }
  } catch (err) {
    console.error('[admin dashboard]', err);
    return NextResponse.json({ aumCents: 0, pendingDeposits: 0, pendingWithdrawals: 0, pendingKyc: 0, investorCount: 0 });
  }
}
