import { NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { getCurrentIdentity } from '@/lib/supabase/identity';
import { notifyAdmins } from '@/lib/notifications';
import { getDb } from '@/lib/db';
import { kycApplications } from '@/db/schema';

export const dynamic = 'force-dynamic';

export async function GET() {
  const actor = await getCurrentIdentity();
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: 'Database is not configured' }, { status: 503 });
  return NextResponse.json(await db.select().from(kycApplications).where(eq(kycApplications.investorId, actor.id)).orderBy(desc(kycApplications.createdAt)).limit(10));
}

export async function POST(request: Request) {
  const actor = await getCurrentIdentity();
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: 'Database is not configured' }, { status: 503 });
  const body = await request.json().catch(() => null) as { documentPath?: string } | null;
  if (!body?.documentPath?.trim()) return NextResponse.json({ error: 'KYC document is required.' }, { status: 400 });
  const inserted = await db.insert(kycApplications).values({ investorId: actor.id, documentPath: body.documentPath.trim(), status: 'pending' }).returning({ id: kycApplications.id });
  await notifyAdmins('kyc_submitted', 'New KYC review required', `Investor ${actor.id} submitted identity documents.`);
  return NextResponse.json({ id: inserted[0].id, status: 'pending' }, { status: 201 });
}
