import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth-helpers";
import { getDb } from "@/lib/db";
import { portfolioLedger } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { identity, error } = await requireAuth();
    if (error) return error;
    const db = getDb();
    if (!db) return NextResponse.json([]);
    const url = new URL(request.url);
    const type = url.searchParams.get("type") as "deposit" | "roi" | "withdrawal" | "referral_reward" | "adjustment" | null;
    const conditions = [eq(portfolioLedger.investorId, identity.id)];
    if (type) conditions.push(eq(portfolioLedger.type, type));
    const rows = await db.select().from(portfolioLedger).where(and(...conditions));
    return NextResponse.json(rows);
  } catch (err) {
    console.error('[history GET]', err);
    return NextResponse.json([]);
  }
}
