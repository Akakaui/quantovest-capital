import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth-helpers";
import { getDb } from "@/lib/db";
import { referralAttributions, referralLinks } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const { identity, error } = await requireAuth();
  if (error) return error;
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
  const links = await db.select().from(referralLinks).where(eq(referralLinks.ownerId, identity.id)).limit(1);
  return NextResponse.json(links[0] ?? null);
}

export async function POST() {
  const { identity, error } = await requireAuth();
  if (error) return error;
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
  const existing = await db.select().from(referralLinks).where(eq(referralLinks.ownerId, identity.id)).limit(1);
  if (existing[0]) return NextResponse.json(existing[0]);
  const code = `QV-${randomBytes(5).toString("hex").toUpperCase()}`;
  const inserted = await db.insert(referralLinks).values({ ownerId: identity.id, code }).returning({ id: referralLinks.id });
  return NextResponse.json({ id: inserted[0].id, ownerId: identity.id, code }, { status: 201 });
}

export async function PUT(request: Request) {
  const { identity, error } = await requireAuth();
  if (error) return error;
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
  const body = await request.json().catch(() => null) as { code?: string } | null;
  const code = body?.code?.trim().toUpperCase();
  if (!code || code.length < 4) return NextResponse.json({ error: "Referral code is required" }, { status: 400 });
  const link = await db.select().from(referralLinks).where(eq(referralLinks.code, code)).limit(1);
  if (!link[0] || link[0].ownerId === identity.id) return NextResponse.json({ error: "Referral code is unavailable" }, { status: 400 });
  const existing = await db.select().from(referralAttributions).where(eq(referralAttributions.referredInvestorId, identity.id)).limit(1);
  if (existing[0]) return NextResponse.json(existing[0]);
  const inserted = await db.insert(referralAttributions).values({ referrerId: link[0].ownerId, referredInvestorId: identity.id, linkId: link[0].id, status: "active" }).returning({ id: referralAttributions.id });
  return NextResponse.json({ id: inserted[0].id, referrerId: link[0].ownerId, referredInvestorId: identity.id, linkId: link[0].id, status: "active" }, { status: 201 });
}
