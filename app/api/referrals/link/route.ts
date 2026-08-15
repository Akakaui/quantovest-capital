import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { referralAttributions, referralLinks } from "@/db/schema";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
  const links = await db.select().from(referralLinks).where(eq(referralLinks.ownerId, session.user.id)).limit(1);
  return NextResponse.json(links[0] ?? null);
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
  const existing = await db.select().from(referralLinks).where(eq(referralLinks.ownerId, session.user.id)).limit(1);
  if (existing[0]) return NextResponse.json(existing[0]);
  const code = `QV-${randomBytes(5).toString("hex").toUpperCase()}`;
  const inserted = await db.insert(referralLinks).values({ ownerId: session.user.id, code });
  return NextResponse.json({ id: Number(inserted[0].insertId), ownerId: session.user.id, code }, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
  const body = await request.json().catch(() => null) as { code?: string } | null;
  const code = body?.code?.trim().toUpperCase();
  if (!code || code.length < 4) return NextResponse.json({ error: "Referral code is required" }, { status: 400 });
  const link = await db.select().from(referralLinks).where(eq(referralLinks.code, code)).limit(1);
  if (!link[0] || link[0].ownerId === session.user.id) return NextResponse.json({ error: "Referral code is unavailable" }, { status: 400 });
  const existing = await db.select().from(referralAttributions).where(eq(referralAttributions.referredInvestorId, session.user.id)).limit(1);
  if (existing[0]) return NextResponse.json(existing[0]);
  const inserted = await db.insert(referralAttributions).values({ referrerId: link[0].ownerId, referredInvestorId: session.user.id, linkId: link[0].id, status: "active" });
  return NextResponse.json({ id: Number(inserted[0].insertId), referrerId: link[0].ownerId, referredInvestorId: session.user.id, linkId: link[0].id, status: "active" }, { status: 201 });
}
