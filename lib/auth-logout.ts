import { createClient } from '@/lib/supabase/client';

export async function signOutWithCookies(): Promise<void> {
  const supabase = createClient();
  const timeout = new Promise<void>(resolve => setTimeout(resolve, 4000));
  const signOut = Promise.resolve(supabase.auth.signOut({ scope: 'global' }))
    .catch(() => undefined)
    .then(() => undefined);
  await Promise.race([signOut, timeout]);
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch { /* ignore: navigation clears client state regardless */ }
}