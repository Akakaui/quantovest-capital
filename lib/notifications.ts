import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { notifications, users } from '@/db/schema';
import { sendEmail } from '@/lib/email';

type NotificationPrefs = { notifyDailyRoi?: boolean; notifyStrategyAlerts?: boolean };

function readPrefs(value: unknown): NotificationPrefs {
  if (!value) return {};
  if (typeof value === 'string') {
    try { return JSON.parse(value) as NotificationPrefs; } catch { return {}; }
  }
  return typeof value === 'object' ? value as NotificationPrefs : {};
}

async function maybeEmailUser(user: { email: string | null; name: string | null; notificationPrefs: unknown } | undefined, type: string, title: string, body: string) {
  if (!user?.email) return;
  const prefs = readPrefs(user.notificationPrefs);
  const isPerformance = type === 'roi_published' || type === 'strategy_performance';
  const optedIn = isPerformance
    ? prefs.notifyDailyRoi === true
    : type === 'strategy_alert' || type === 'strategy_update'
      ? prefs.notifyStrategyAlerts === true
      : false;
  if (!optedIn) return;
  if (isPerformance) {
    await sendEmail(user.email, 'roi_published', {
      investorName: user.name || 'Investor',
      roiPercent: body.match(/\d+(?:\.\d+)?%/)?.[0]?.replace('%', ''),
      profitAmount: body.match(/\$[\d,.]+/)?.[0],
      message: body,
    });
  } else {
    await sendEmail(user.email, 'admin_broadcast', {
      investorName: user.name || 'Investor',
      message: body,
    });
  }
}

export async function notifyUser(userId: string, type: string, title: string, body: string, relatedRewardId?: number) {
  const db = getDb();
  if (!db) return;
  let user: { email: string | null; name: string | null; notificationPrefs: unknown } | undefined;
  try {
    const [row] = await db.select({ email: users.email, name: users.name, notificationPrefs: users.notificationPrefs }).from(users).where(eq(users.id, userId)).limit(1);
    user = row;
  } catch (error) {
    // Keep in-app notifications and the financial operation alive if an older
    // production database has not yet received the notificationPrefs column.
    console.error('[notifications preference lookup]', error instanceof Error ? error.message : error);
    try {
      const [row] = await db.select({ email: users.email, name: users.name }).from(users).where(eq(users.id, userId)).limit(1);
      user = row ? { ...row, notificationPrefs: null } : undefined;
    } catch (fallbackError) {
      console.error('[notifications user lookup]', fallbackError instanceof Error ? fallbackError.message : fallbackError);
    }
  }
  try {
    await db.insert(notifications).values({ userId, type, title, body, relatedRewardId: relatedRewardId ?? null, isRead: 0 });
  } catch (error) {
    console.error('[notifications in-app insert]', error instanceof Error ? error.message : error);
  }
  try { await maybeEmailUser(user, type, title, body); } catch (error) { console.error('[notifications email]', error); }
}

export async function notifyAdmins(type: string, title: string, body: string) {
  const db = getDb();
  if (!db) return;
  const admins = await db.select({ id: users.id }).from(users).where(eq(users.role, 'admin'));
  if (admins.length) await db.insert(notifications).values(admins.map(admin => ({ userId: admin.id, type, title, body, isRead: 0 })));
}

export async function broadcastNotification(type: string, title: string, body: string, recipientIds?: string[]) {
  const db = getDb();
  if (!db) return 0;
  const recipients = recipientIds?.length ? recipientIds.map(id => ({ id })) : await db.select({ id: users.id }).from(users);
  if (recipients.length) await db.insert(notifications).values(recipients.map(recipient => ({ userId: recipient.id, type, title, body, isRead: 0 })));
  return recipients.length;
}
