import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { plans } from "@/db/schema";

export async function GET() {
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
  const rows = await db.select().from(plans).where(eq(plans.active, 1));
  return NextResponse.json(rows);
}
