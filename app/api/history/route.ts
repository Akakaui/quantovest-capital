import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { portfolioLedger } from "@/db/schema";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
  const url = new URL(request.url);
  const type = url.searchParams.get("type") as "deposit" | "roi" | "withdrawal" | "referral_reward" | "adjustment" | null;
  const conditions = [eq(portfolioLedger.investorId, session.user.id)];
  if (type) conditions.push(eq(portfolioLedger.type, type));
  const rows = await db.select().from(portfolioLedger).where(and(...conditions));
  return NextResponse.json(rows);
}
