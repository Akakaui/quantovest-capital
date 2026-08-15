import { NextResponse } from 'next/server';
import { getCurrentIdentity } from '@/lib/supabase/identity';
import { broadcastNotification, notifyAdmins } from '@/lib/notifications';

export async function POST(request: Request) {
  const actor = await getCurrentIdentity();
  if (!actor?.id || actor.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await request.json().catch(() => null) as { type?: string; title?: string; body?: string; recipientIds?: string[] } | null;
  if (!body?.title?.trim() || !body.body?.trim()) return NextResponse.json({ error: 'Title and message are required.' }, { status: 400 });
  const type = body.type?.trim() || 'admin_message';
  const delivered = await broadcastNotification(type, body.title.trim(), body.body.trim(), body.recipientIds);
  await notifyAdmins('admin_message_audit', 'Notification sent', `${body.title.trim()} was delivered to ${delivered} recipient(s).`);
  return NextResponse.json({ delivered }, { status: 201 });
}
