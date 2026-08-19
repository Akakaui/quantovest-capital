import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { plans } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDb();
    if (!db) return NextResponse.json([]);
    const rows = await db.select().from(plans).where(eq(plans.active, 1));
    return NextResponse.json(rows);
  } catch (err) {
    console.error('[plans GET]', err);
    return NextResponse.json([]);
  }
}
