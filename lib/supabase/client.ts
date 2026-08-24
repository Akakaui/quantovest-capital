import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookieOptions: { maxAge: 60 * 60 * 24 * 7 },
  });
}
