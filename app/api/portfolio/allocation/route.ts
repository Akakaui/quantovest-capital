import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth-helpers";
import { getDb } from "@/lib/db";
import { copyAllocations, investorAccounts, plans, traders } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const { identity, error } = await requireAuth();
  if (error) return error;

  const db = getDb();
  if (!db) return NextResponse.json({ plan: "None", allocation: [] }, { headers: { "Cache-Control": "no-store" } });

  try {
    const [account] = await db.select({ planId: investorAccounts.planId })
      .from(investorAccounts)
      .where(and(eq(investorAccounts.investorId, identity.id), eq(investorAccounts.status, "active")))
      .limit(1);

    const [plan] = account
      ? await db.select({ name: plans.name }).from(plans).where(eq(plans.id, account.planId)).limit(1)
      : [];

    const [copy] = await db.select({ traderId: copyAllocations.traderId, allocationCents: copyAllocations.allocationCents })
      .from(copyAllocations)
      .where(and(eq(copyAllocations.investorId, identity.id), eq(copyAllocations.status, "active")))
      .limit(1);

    if (!copy) {
      return NextResponse.json({ plan: plan?.name ?? "None", allocation: [] }, { headers: { "Cache-Control": "no-store" } });
    }

    const [trader] = await db.select({ name: traders.name }).from(traders).where(eq(traders.id, copy.traderId)).limit(1);
    return NextResponse.json({
      plan: plan?.name ?? "None",
      allocation: [{ name: trader?.name ?? "Active Strategy", percent: 100, color: "#22C55E" }],
      allocationCents: copy.allocationCents,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[portfolio/allocation] failed", err);
    return NextResponse.json({ plan: "None", allocation: [] }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
