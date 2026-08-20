import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentIdentity } from "@/lib/supabase/identity";
import { getDb } from "@/lib/db";
import { users } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  try {
    const actor = await getCurrentIdentity();
    if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const db = getDb();
    if (!db) return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
    const body = await request.json().catch(() => null) as {
      name?: string;
      image?: string;
      twoFactorEnabled?: boolean;
      twoFactorSecret?: string;
      payoutDetails?: Record<string, string>;
      notificationPrefs?: Record<string, boolean>;
      onboardingCompleted?: boolean;
      onboardingAnswers?: Record<string, string>;
    } | null;
    if (!body) return NextResponse.json({ error: "Request body is required." }, { status: 400 });

    const updates: Record<string, unknown> = {};
    if (body.name?.trim()) updates.name = body.name.trim();
    if (body.image?.trim()) updates.image = body.image.trim();
    if (body.twoFactorEnabled !== undefined) updates.twoFactorEnabled = body.twoFactorEnabled;
    if (body.twoFactorSecret !== undefined) updates.twoFactorSecret = body.twoFactorSecret;
    if (body.payoutDetails) updates.payoutDetails = JSON.stringify(body.payoutDetails);
    if (body.notificationPrefs) updates.notificationPrefs = JSON.stringify(body.notificationPrefs);
    if (body.onboardingCompleted !== undefined) updates.onboardingCompleted = body.onboardingCompleted;
    if (body.onboardingAnswers) updates.onboardingAnswers = JSON.stringify(body.onboardingAnswers);

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
    }

    await db.update(users).set(updates).where(eq(users.id, actor.id));
    return NextResponse.json({ updated: true });
  } catch (err) {
    console.error('[profile PATCH]', err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
