import { eq } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import { getDb } from '@/lib/db';
import { users } from '@/db/schema';

export async function getCurrentIdentity() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const db = getDb();
    if (!db) return { id: user.id, role: 'investor' as const, email: user.email ?? null };
    const profile = await db.select({ id: users.id, role: users.role, email: users.email }).from(users).where(eq(users.id, user.id)).limit(1);
    return { id: user.id, role: profile[0]?.role === 'admin' ? 'admin' as const : 'investor' as const, email: profile[0]?.email ?? user.email ?? null };
  } catch {
    return null;
  }
}
