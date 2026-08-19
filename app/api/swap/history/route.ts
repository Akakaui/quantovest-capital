import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth-helpers";
import { getDb } from "@/lib/db";
import { swapTransactions } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const { identity, error } = await requireAuth();
  if (error) return error;
  const db = getDb();
  if (!db) return NextResponse.json([]);

  try {
    const rows = await db.select().from(swapTransactions).where(
      eq(swapTransactions.investorId, identity.id)
    );
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json([]);
  }
}
