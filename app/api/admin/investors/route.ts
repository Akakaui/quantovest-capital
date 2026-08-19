import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth-helpers";
import { getDb } from "@/lib/db";
import { investorAccounts, plans, users } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { identity, error } = await requireAdmin();
    if (error) return error;
    const db = getDb();
    if (!db) return NextResponse.json([]);
    const rows = await db.select({ id: users.id, name: users.name, email: users.email, accountId: investorAccounts.id, planId: investorAccounts.planId, balanceCents: investorAccounts.balanceCents, principalCents: investorAccounts.principalCents, planName: plans.name, minRoiBps: plans.minRoiBps, maxRoiBps: plans.maxRoiBps }).from(users).leftJoin(investorAccounts, eq(users.id, investorAccounts.investorId)).leftJoin(plans, eq(investorAccounts.planId, plans.id));
    return NextResponse.json(rows);
  } catch (err) {
    console.error('[investors]', err);
    return NextResponse.json([], { status: 500 });
  }
}
