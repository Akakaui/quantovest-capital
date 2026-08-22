import { eq } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import { getDb } from '@/lib/db';
import { users } from '@/db/schema';

export async function getCurrentIdentity() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const authRole = user.app_metadata?.role ?? user.user_metadata?.role;
  const db = getDb();
  if (!db) return { id: user.id, role: (authRole === 'admin' ? 'admin' : 'investor') as 'admin' | 'investor', email: user.email ?? null };
  try {
    const profile = await db.select({ id: users.id, role: users.role, email: users.email }).from(users).where(eq(users.id, user.id)).limit(1);
    const dbRole = profile[0]?.role === 'admin' ? 'admin' : 'investor';
    return { id: user.id, role: (authRole === 'admin' || dbRole === 'admin' ? 'admin' : 'investor') as 'admin' | 'investor', email: profile[0]?.email ?? user.email ?? null };
  } catch {
    return { id: user.id, role: (authRole === 'admin' ? 'admin' : 'investor') as 'admin' | 'investor', email: user.email ?? null };
  }
}
