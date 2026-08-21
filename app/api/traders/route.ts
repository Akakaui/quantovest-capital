import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentIdentity } from "@/lib/supabase/identity";
import { getDb } from "@/lib/db";
import { traders } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const actor = await getCurrentIdentity();
    if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const db = getDb();
    if (!db) return NextResponse.json([]);
    return NextResponse.json(await db.select().from(traders).where(eq(traders.active, 1)));
  } catch (err) {
    console.error('[traders]', err);
    return NextResponse.json([], { status: 500 });
  }
}
