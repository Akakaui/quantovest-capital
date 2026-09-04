import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth-helpers";
import { getDb } from "@/lib/db";
import { copyAllocations, investorAccounts, kycApplications, plans, traders } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { identity, error } = await requireAuth();
  if (error) return error;
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database is not configured" }, { status: 503 });

  const body = await request.json().catch(() => null) as { traderId?: string; allocationCents?: number } | null;
  if (!body?.traderId) return NextResponse.json({ error: "traderId is required." }, { status: 400 });

  const allocationCents = body.allocationCents ?? 150000;
  if (!Number.isInteger(allocationCents) || allocationCents < 150000) {
    return NextResponse.json({ error: "Minimum strategy allocation is $1,500." }, { status: 400 });
  }

  try {
    const [account] = await db.select().from(investorAccounts)
      .where(and(eq(investorAccounts.investorId, identity.id), eq(investorAccounts.status, "active")))
      .limit(1);
    if (!account) return NextResponse.json({ error: "An active funded investor account is required before selecting a strategy." }, { status: 409 });
    if (allocationCents > account.balanceCents) {
      return NextResponse.json({ error: "Allocation cannot exceed your available balance." }, { status: 400 });
    }

    const [plan] = account.planId
      ? await db.select({ id: plans.id }).from(plans).where(and(eq(plans.id, account.planId), eq(plans.active, 1))).limit(1)
      : [];
    if (!plan) return NextResponse.json({ error: "Your account does not have an active plan." }, { status: 409 });

    const [kyc] = await db.select({ status: kycApplications.status }).from(kycApplications)
      .where(eq(kycApplications.investorId, identity.id)).orderBy(desc(kycApplications.createdAt)).limit(1);
    if (kyc?.status !== "approved") return NextResponse.json({ error: "Approved identity verification is required before starting a strategy." }, { status: 403 });

    const [trader] = await db.select({ id: traders.id }).from(traders)
      .where(and(eq(traders.id, body.traderId), eq(traders.active, 1))).limit(1);
    if (!trader) return NextResponse.json({ error: "That strategy is unavailable." }, { status: 404 });

    const existing = await db.select().from(copyAllocations).where(
      eq(copyAllocations.investorId, identity.id)
    );

    const activeCopy = existing.find(c => c.status === "active");
    if (activeCopy) {
      return NextResponse.json({ error: "You can copy only one trader at a time. Stop your current strategy before selecting another." }, { status: 409 });
    }

    const inserted = await db.insert(copyAllocations).values({
      investorId: identity.id,
      traderId: body.traderId,
      allocationCents,
      status: "active",
    }).returning({ id: copyAllocations.id });

    return NextResponse.json({ id: inserted[0].id, status: "active" }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to start copying." }, { status: 500 });
  }
}
