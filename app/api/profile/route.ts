import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { users } from "@/db/schema";

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
  const body = await request.json().catch(() => null) as { name?: string; image?: string } | null;
  if (!body || (!body.name?.trim() && !body.image?.trim())) return NextResponse.json({ error: "A profile name or image is required." }, { status: 400 });
  await db.update(users).set({ ...(body.name?.trim() ? { name: body.name.trim() } : {}), ...(body.image?.trim() ? { image: body.image.trim() } : {}) }).where(eq(users.id, session.user.id));
  return NextResponse.json({ updated: true });
}
