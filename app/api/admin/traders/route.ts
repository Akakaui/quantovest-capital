import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { traders } from "@/db/schema";

export async function GET() {
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
  return NextResponse.json(await db.select().from(traders));
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
  const body = await request.json().catch(() => null) as { name?: string; specialty?: string; imagePath?: string; imageUrl?: string; winRateBps?: number; thirtyDayReturnBps?: number; riskLevel?: number; bio?: string } | null;
  const riskLevel = Number(body?.riskLevel);
  if (!body?.name?.trim() || !body.specialty?.trim() || !Number.isInteger(riskLevel) || riskLevel < 1 || riskLevel > 5) return NextResponse.json({ error: "Name, specialty, and risk level are required." }, { status: 400 });
  const id = crypto.randomUUID();
  await db.insert(traders).values({ id, name: body.name.trim(), specialty: body.specialty.trim(), imagePath: body.imagePath?.trim() || null, imageUrl: body.imageUrl?.trim() || null, winRateBps: body.winRateBps ?? 0, thirtyDayReturnBps: body.thirtyDayReturnBps ?? 0, riskLevel, bio: body.bio?.trim() || null });
  return NextResponse.json({ id }, { status: 201 });
}
