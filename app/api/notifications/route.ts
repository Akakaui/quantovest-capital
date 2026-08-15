import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { notifications } from "@/db/schema";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
  const items = await db.select().from(notifications).where(eq(notifications.userId, session.user.id)).orderBy(desc(notifications.createdAt)).limit(30);
  return NextResponse.json({ items, unreadCount: items.filter(item => item.isRead === 0).length });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
  const body = await request.json().catch(() => null) as { id?: number } | null;
  if (!body?.id || !Number.isInteger(body.id)) return NextResponse.json({ error: "Notification id is required" }, { status: 400 });
  await db.update(notifications).set({ isRead: 1 }).where(and(eq(notifications.id, body.id), eq(notifications.userId, session.user.id)));
  return NextResponse.json({ success: true });
}
