import { NextResponse } from 'next/server';
import { eq, inArray } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth-helpers';
import { broadcastNotification, notifyAdmins } from '@/lib/notifications';
import { getDb } from '@/lib/db';
import { investorAccounts, plans, users } from '@/db/schema';

export async function POST(request: Request) {
  try {
    const { identity, error } = await requireAdmin();
    if (error) return error;
    const body = await request.json().catch(() => null) as {
      title?: string;
      body?: string;
      audience?: 'all' | 'plan' | 'selected';
      plans?: string[];
      userIds?: string[];
      type?: string;
      recipientIds?: string[];
      sendEmail?: boolean;
    } | null;
    if (!body?.title?.trim() || !body.body?.trim()) return NextResponse.json({ error: 'Title and message are required.' }, { status: 400 });

    const db = getDb();
    const type = body.type?.trim() || 'admin_message';
    const title = body.title.trim();
    const msgBody = body.body.trim();
    const email = body.sendEmail === true;

    let delivered = 0;

    if (!body.audience || body.audience === 'all' || body.recipientIds) {
      delivered = await broadcastNotification(type, title, msgBody, body.recipientIds, { sendEmail: email });
    } else if (body.audience === 'selected') {
      if (!body.userIds?.length) return NextResponse.json({ error: 'At least one user must be selected.' }, { status: 400 });
      delivered = await broadcastNotification(type, title, msgBody, body.userIds, { sendEmail: email });
    } else if (body.audience === 'plan') {
      if (!db) return NextResponse.json({ error: 'Database is not configured' }, { status: 503 });
      if (!body.plans?.length) return NextResponse.json({ error: 'At least one plan must be selected.' }, { status: 400 });

      const matchedPlans = await db.select({ id: plans.id }).from(plans).where(inArray(plans.name, body.plans));
      if (!matchedPlans.length) return NextResponse.json({ error: 'No matching plans found.' }, { status: 400 });

      const planIds = matchedPlans.map(p => p.id);
      const accounts = await db.select({ investorId: investorAccounts.investorId }).from(investorAccounts).where(inArray(investorAccounts.planId, planIds));
      const recipientIds = [...Array.from(new Set(accounts.map(a => a.investorId)))];
      if (recipientIds.length) {
        await broadcastNotification(type, title, msgBody, recipientIds, { sendEmail: email });
        delivered = recipientIds.length;
      }
    }

    await notifyAdmins('admin_message_audit', 'Notification sent', `${title} was delivered to ${delivered} recipient(s).`, { sendEmail: true });
    return NextResponse.json({ delivered }, { status: 201 });
  } catch (err) {
    console.error('[notifications POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
