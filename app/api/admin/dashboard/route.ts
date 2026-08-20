import { NextResponse } from "next/server";
import { getCurrentIdentity } from "@/lib/supabase/identity";
import { getDb } from "@/lib/db";
import { investorAccounts, deposits, investorWithdrawals, kycApplications } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const actor = await getCurrentIdentity();
    if (!actor || actor.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    if (!db) return NextResponse.json({ aumCents: 0, pendingDeposits: 0, pendingWithdrawals: 0, pendingKyc: 0, investorCount: 0 });

    const empty = { aumCents: 0, pendingDeposits: 0, pendingWithdrawals: 0, pendingKyc: 0, investorCount: 0 };

    let aumCents = 0;
    let investorCount = 0;
    try {
      const rows = await db.select({
        balanceCents: investorAccounts.balanceCents,
      }).from(investorAccounts);
      aumCents = rows.reduce((sum, r) => sum + (r.balanceCents ?? 0), 0);
      investorCount = rows.length;
    } catch {}

    let pendingDeposits = 0;
    try {
      const rows = await db.select({ id: deposits.id }).from(deposits).where(eq(deposits.status, "pending"));
      pendingDeposits = rows.length;
    } catch {}

    let pendingWithdrawals = 0;
    try {
      const rows = await db.select({ id: investorWithdrawals.id }).from(investorWithdrawals).where(eq(investorWithdrawals.status, "pending"));
      pendingWithdrawals = rows.length;
    } catch {}

    let pendingKyc = 0;
    try {
      const rows = await db.select({ id: kycApplications.id }).from(kycApplications).where(eq(kycApplications.status, "pending"));
      pendingKyc = rows.length;
    } catch {}

    return NextResponse.json({ aumCents, pendingDeposits, pendingWithdrawals, pendingKyc, investorCount });
  } catch (err) {
    console.error('[admin dashboard]', err);
    return NextResponse.json({ aumCents: 0, pendingDeposits: 0, pendingWithdrawals: 0, pendingKyc: 0, investorCount: 0 });
  }
}
