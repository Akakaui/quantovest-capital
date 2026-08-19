import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth-helpers";
import { getDb } from "@/lib/db";
import { copyAllocations, traders } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const { identity, error } = await requireAuth();
  if (error) return error;
  const db = getDb();
  if (!db) return NextResponse.json([]);

  try {
    const allocations = await db.select().from(copyAllocations).where(eq(copyAllocations.investorId, identity.id));
    const activeAllocations = allocations.filter(a => a.status === "active");

    const enriched = await Promise.all(
      activeAllocations.map(async (alloc) => {
        const [trader] = await db.select().from(traders).where(eq(traders.id, alloc.traderId)).limit(1);
        return { ...alloc, trader: trader ?? null };
      })
    );

    return NextResponse.json(enriched);
  } catch {
    return NextResponse.json([]);
  }
}
