import { NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { getCurrentIdentity } from "@/lib/supabase/identity";
import { getDb } from "@/lib/db";
import { users, recoveryCodes } from "@/db/schema";
import { generateRecoveryCodes } from "@/lib/recovery-codes";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const actor = await getCurrentIdentity();
    if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const db = getDb();
    if (!db) return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
    const rows = await db.select({
      name: users.name,
      image: users.image,
      twoFactorEnabled: users.twoFactorEnabled,
      twoFactorSecret: users.twoFactorSecret,
      payoutDetails: users.payoutDetails,
      notificationPrefs: users.notificationPrefs,
      onboardingCompleted: users.onboardingCompleted,
      onboardingAnswers: users.onboardingAnswers,
    }).from(users).where(eq(users.id, actor.id)).limit(1);

    const profile = rows[0] ?? null;
    if (profile?.twoFactorEnabled) {
      const unusedCodes = await db.select({ id: recoveryCodes.id })
        .from(recoveryCodes)
        .where(and(eq(recoveryCodes.userId, actor.id), isNull(recoveryCodes.usedAt)));
      return NextResponse.json({ ...profile, unusedRecoveryCodeCount: unusedCodes.length });
    }

    return NextResponse.json(profile);
  } catch (err) {
    console.error('[profile GET]', err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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

    let recoveryCodesList: string[] | undefined;
    if (body.twoFactorEnabled === true) {
      try {
        recoveryCodesList = await generateRecoveryCodes(actor.id);
      } catch { /* recovery codes generation failed — non-fatal */ }
    }

    return NextResponse.json({ updated: true, recoveryCodes: recoveryCodesList });
  } catch (err) {
    console.error('[profile PATCH]', err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
