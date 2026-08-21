import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { users } from "@/db/schema";
import { verifyRecoveryCode } from "@/lib/recovery-codes";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null) as {
      userId?: string;
      code?: string;
    } | null;

    if (!body?.userId || !body?.code) {
      return NextResponse.json({ error: "User ID and recovery code are required." }, { status: 400 });
    }

    const db = getDb();
    if (!db) return NextResponse.json({ error: "Database not configured." }, { status: 503 });

    const rows = await db.select({ twoFactorEnabled: users.twoFactorEnabled })
      .from(users)
      .where(eq(users.id, body.userId))
      .limit(1);

    if (!rows[0] || !rows[0].twoFactorEnabled) {
      return NextResponse.json({ error: "2FA is not enabled for this account." }, { status: 400 });
    }

    const valid = await verifyRecoveryCode(body.userId, body.code);
    if (!valid) {
      return NextResponse.json({ error: "Invalid or already used recovery code." }, { status: 401 });
    }

    return NextResponse.json({ verified: true });
  } catch (err) {
    console.error("[auth recover]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
