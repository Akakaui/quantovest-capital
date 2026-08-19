import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth-helpers";
import { getDb } from "@/lib/db";
import { copyAllocations } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { identity, error } = await requireAuth();
  if (error) return error;
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database is not configured" }, { status: 503 });

  try {
    await db.update(copyAllocations).set({ status: "stopped", updatedAt: new Date() }).where(
      and(eq(copyAllocations.id, Number(params.id)), eq(copyAllocations.investorId, identity.id))
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to stop." }, { status: 500 });
  }
}
