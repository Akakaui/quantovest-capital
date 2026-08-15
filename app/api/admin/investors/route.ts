import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { investorAccounts, plans, users } from "@/db/schema";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
  const rows = await db.select({ id: users.id, name: users.name, email: users.email, accountId: investorAccounts.id, planId: investorAccounts.planId, balanceCents: investorAccounts.balanceCents, principalCents: investorAccounts.principalCents, planName: plans.name, minRoiBps: plans.minRoiBps, maxRoiBps: plans.maxRoiBps }).from(users).leftJoin(investorAccounts, eq(users.id, investorAccounts.investorId)).leftJoin(plans, eq(investorAccounts.planId, plans.id));
  return NextResponse.json(rows);
}
