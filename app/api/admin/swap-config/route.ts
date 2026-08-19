import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { getDb } from "@/lib/db";
import { swapConfig } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { identity, error } = await requireAdmin();
    if (error) return error;
    const db = getDb();
    if (!db) return NextResponse.json([]);

    const configs = await db.select().from(swapConfig);
    return NextResponse.json(configs);
  } catch (err) {
    console.error('[swap-config]', err);
    return NextResponse.json([], { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { identity, error } = await requireAdmin();
    if (error) return error;
    const db = getDb();
    if (!db) return NextResponse.json({ error: "Database is not configured" }, { status: 503 });

    const body = await request.json().catch(() => null) as {
      fromAsset?: string;
      toAsset?: string;
      rateMultiplier?: string;
      feeBps?: number;
      active?: number;
    } | null;

    if (!body?.fromAsset || !body?.toAsset) {
      return NextResponse.json({ error: "fromAsset and toAsset are required" }, { status: 400 });
    }

    const existing = await db.select().from(swapConfig).where(
      eq(swapConfig.fromAsset, body.fromAsset)
    ).limit(1);

    if (existing.length > 0) {
      await db.update(swapConfig).set({
        rateMultiplier: body.rateMultiplier ?? existing[0].rateMultiplier,
        feeBps: body.feeBps ?? existing[0].feeBps,
        active: body.active ?? existing[0].active,
        updatedAt: new Date(),
      }).where(eq(swapConfig.fromAsset, body.fromAsset));
    } else {
      await db.insert(swapConfig).values({
        fromAsset: body.fromAsset,
        toAsset: body.toAsset,
        rateMultiplier: body.rateMultiplier ?? "1",
        feeBps: body.feeBps ?? 50,
        active: body.active ?? 1,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[swap-config PUT]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
