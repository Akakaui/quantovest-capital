import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { eq } from 'drizzle-orm';
import { getCurrentIdentity } from '@/lib/supabase/identity';
import { getDb } from '@/lib/db';
import { depositInstructions } from '@/db/schema';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const actor = await getCurrentIdentity();
    if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    if (!db) return NextResponse.json([]);
    const rows = await db.select().from(depositInstructions).where(eq(depositInstructions.active, 1));
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucket = process.env.SUPABASE_MEDIA_BUCKET?.trim();
    if (!url || !serviceKey || bucket !== 'quantovest-media') return NextResponse.json(rows.map(row => ({ ...row, qrUrl: null })));
    const storage = createClient(url, serviceKey).storage.from(bucket);
    const withUrls = await Promise.all(rows.map(async row => {
      if (!row.qrPath) return { ...row, qrUrl: null };
      const signed = await storage.createSignedUrl(row.qrPath, 3600);
      return { ...row, qrUrl: signed.data?.signedUrl ?? null };
    }));
    return NextResponse.json(withUrls);
  } catch (err) {
    console.error('[deposit-instructions GET]', err);
    return NextResponse.json([]);
  }
}
