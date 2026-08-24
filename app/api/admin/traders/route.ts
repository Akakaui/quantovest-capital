import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth-helpers";
import { getDb } from "@/lib/db";
import { traders } from "@/db/schema";

export const dynamic = "force-dynamic";

function getStorage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_MEDIA_BUCKET?.trim();
  if (!url || !serviceKey || bucket !== "quantovest-media") return null;
  return createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } }).storage.from(bucket);
}

async function withSignedImages(rows: typeof traders.$inferSelect[]) {
  const storage = getStorage();
  if (!storage) return rows;
  return Promise.all(rows.map(async row => {
    if (!row.imagePath) return row;
    const signed = await storage.createSignedUrl(row.imagePath, 60 * 60);
    return { ...row, imageUrl: signed.data?.signedUrl ?? row.imageUrl };
  }));
}

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;
    const db = getDb();
    if (!db) return NextResponse.json([]);
    return NextResponse.json(await withSignedImages(await db.select().from(traders)));
  } catch (err) {
    console.error('[traders]', err);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;
    const db = getDb();
    if (!db) return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
    const body = await request.json().catch(() => null) as { name?: string; specialty?: string; imagePath?: string; imageUrl?: string; winRateBps?: number; thirtyDayReturnBps?: number; riskLevel?: number; bio?: string } | null;
    const riskLevel = Number(body?.riskLevel);
    if (!body?.name?.trim() || !body.specialty?.trim() || (!body.imagePath?.trim() && !body.imageUrl?.trim()) || !Number.isInteger(riskLevel) || riskLevel < 1 || riskLevel > 5) {
      return NextResponse.json({ error: "Name, profile image or image URL, specialty, and risk level are required." }, { status: 400 });
    }
    const id = crypto.randomUUID();
    await db.insert(traders).values({
      id,
      name: body.name.trim(),
      specialty: body.specialty.trim(),
      imagePath: body.imagePath?.trim() || null,
      imageUrl: body.imageUrl?.trim() || null,
      winRateBps: body.winRateBps ?? 0,
      thirtyDayReturnBps: body.thirtyDayReturnBps ?? 0,
      riskLevel,
      bio: body.bio?.trim() || null,
    });
    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    console.error('[traders POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;
    const db = getDb();
    if (!db) return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
    const body = await request.json().catch(() => null) as { id?: string; name?: string; specialty?: string; imagePath?: string; imageUrl?: string; winRateBps?: number; thirtyDayReturnBps?: number; riskLevel?: number; bio?: string } | null;
    const riskLevel = Number(body?.riskLevel);
    if (!body?.id || !body.name?.trim() || !body.specialty?.trim() || !Number.isInteger(riskLevel) || riskLevel < 1 || riskLevel > 5) {
      return NextResponse.json({ error: "Trader ID, name, specialty, and risk level are required." }, { status: 400 });
    }
    await db.update(traders).set({
      name: body.name.trim(),
      specialty: body.specialty.trim(),
      ...(body.imagePath?.trim() ? { imagePath: body.imagePath.trim() } : {}),
      imageUrl: body.imageUrl?.trim() || null,
      winRateBps: body.winRateBps ?? 0,
      thirtyDayReturnBps: body.thirtyDayReturnBps ?? 0,
      riskLevel,
      bio: body.bio?.trim() || null,
    }).where(eq(traders.id, body.id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[traders PATCH]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
