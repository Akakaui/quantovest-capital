import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { getDb } from "@/lib/db";
import { traders } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { identity, error } = await requireAdmin();
    if (error) return error;
    const db = getDb();
    if (!db) return NextResponse.json([]);
    return NextResponse.json(await db.select().from(traders));
  } catch (err) {
    console.error('[traders]', err);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { identity, error } = await requireAdmin();
    if (error) return error;
    const db = getDb();
    if (!db) return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
    const body = await request.json().catch(() => null) as { name?: string; specialty?: string; imagePath?: string; imageUrl?: string; winRateBps?: number; thirtyDayReturnBps?: number; riskLevel?: number; bio?: string } | null;
    const riskLevel = Number(body?.riskLevel);
    if (!body?.name?.trim() || !body.specialty?.trim() || !Number.isInteger(riskLevel) || riskLevel < 1 || riskLevel > 5) return NextResponse.json({ error: "Name, specialty, and risk level are required." }, { status: 400 });
    const id = crypto.randomUUID();
    await db.insert(traders).values({ id, name: body.name.trim(), specialty: body.specialty.trim(), imagePath: body.imagePath?.trim() || null, imageUrl: body.imageUrl?.trim() || null, winRateBps: body.winRateBps ?? 0, thirtyDayReturnBps: body.thirtyDayReturnBps ?? 0, riskLevel, bio: body.bio?.trim() || null });
    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    console.error('[traders POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
