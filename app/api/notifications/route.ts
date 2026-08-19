import { NextResponse } from 'next/server';
import { and, desc, eq } from 'drizzle-orm';
import { getCurrentIdentity } from '@/lib/supabase/identity';
import { getDb } from '@/lib/db';
import { notifications } from '@/db/schema';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const actor = await getCurrentIdentity();
    if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    if (!db) return NextResponse.json({ items: [], unreadCount: 0 });
    const items = await db.select().from(notifications).where(eq(notifications.userId, actor.id)).orderBy(desc(notifications.createdAt)).limit(50);
    return NextResponse.json({ items, unreadCount: items.filter(item => item.isRead === 0).length });
  } catch (err) {
    console.error('[notifications GET]', err);
    return NextResponse.json({ items: [], unreadCount: 0 });
  }
}

export async function PATCH(request: Request) {
  try {
    const actor = await getCurrentIdentity();
    if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    if (!db) return NextResponse.json({ error: 'Database is not configured' }, { status: 503 });
    const body = await request.json().catch(() => null) as { id?: number; all?: boolean } | null;
    if (body?.all) await db.update(notifications).set({ isRead: 1 }).where(eq(notifications.userId, actor.id));
    else if (body?.id && Number.isInteger(body.id)) await db.update(notifications).set({ isRead: 1 }).where(and(eq(notifications.id, body.id), eq(notifications.userId, actor.id)));
    else return NextResponse.json({ error: 'Notification id or all=true is required.' }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[notifications PATCH]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
