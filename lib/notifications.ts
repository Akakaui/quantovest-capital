import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { notifications, users } from '@/db/schema';

export async function notifyUser(userId: string, type: string, title: string, body: string, relatedRewardId?: number) {
  const db = getDb();
  if (!db) return;
  await db.insert(notifications).values({ userId, type, title, body, relatedRewardId: relatedRewardId ?? null, isRead: 0 });
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
