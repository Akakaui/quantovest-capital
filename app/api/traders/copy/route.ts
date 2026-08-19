import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth-helpers";
import { getDb } from "@/lib/db";
import { copyAllocations } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { identity, error } = await requireAuth();
  if (error) return error;
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database is not configured" }, { status: 503 });

  const body = await request.json().catch(() => null) as { traderId?: string; allocationCents?: number } | null;
  if (!body?.traderId) return NextResponse.json({ error: "traderId is required." }, { status: 400 });

  const allocationCents = body.allocationCents ?? 50000;

  try {
    const existing = await db.select().from(copyAllocations).where(
      eq(copyAllocations.investorId, identity.id)
    );

    const activeCopy = existing.find(c => c.status === "active" && c.traderId === body.traderId);
    if (activeCopy) {
      return NextResponse.json({ error: "Already copying this trader." }, { status: 409 });
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
