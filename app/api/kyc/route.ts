import { NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { getCurrentIdentity } from '@/lib/supabase/identity';
import { notifyAdmins } from '@/lib/notifications';
import { getDb } from '@/lib/db';
import { kycApplications, users } from '@/db/schema';
import { sendKycSubmitted } from '@/lib/email';
import { databaseUnavailable } from '@/lib/api-errors';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const actor = await getCurrentIdentity();
    if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    if (!db) return databaseUnavailable('kyc GET');
    return NextResponse.json(
      await db
        .select()
        .from(kycApplications)
        .where(eq(kycApplications.investorId, actor.id))
        .orderBy(desc(kycApplications.createdAt))
        .limit(10),
    );
  } catch (err) {
    return databaseUnavailable('kyc GET', err);
  }
}

export async function POST(request: Request) {
  const actor = await getCurrentIdentity();
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDb();
  if (!db) return databaseUnavailable('kyc POST');

  try {
    const body = await request.json().catch(() => null) as { documentPath?: string } | null;
    if (!body?.documentPath?.trim()) return NextResponse.json({ error: 'KYC documents are required.' }, { status: 400 });

    let documents: { bucket?: string; idDocument?: string; proofOfAddress?: string };
    try {
      documents = JSON.parse(body.documentPath) as typeof documents;
    } catch {
      return NextResponse.json({ error: 'Invalid KYC document references.' }, { status: 400 });
    }

    const ownerPrefix = `kyc/${actor.id}/`;
    const validDocuments = documents.bucket === 'quantovest-media'
      && typeof documents.idDocument === 'string'
      && typeof documents.proofOfAddress === 'string'
      && documents.idDocument.startsWith(ownerPrefix)
      && documents.proofOfAddress.startsWith(ownerPrefix);
    if (!validDocuments) return NextResponse.json({ error: 'KYC documents are invalid or expired. Please upload them again.' }, { status: 400 });

    const inserted = await db
      .insert(kycApplications)
      .values({ investorId: actor.id, documentPath: JSON.stringify(documents), status: 'pending' })
      .returning({ id: kycApplications.id });

    try {
      await notifyAdmins('kyc_submitted', 'New KYC review required', `Investor ${actor.id} submitted identity documents.`);
      const investor = await db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, actor.id)).limit(1);
      if (investor[0]?.email) sendKycSubmitted(investor[0].email, investor[0].name || 'Investor');
    } catch (notificationError) {
      console.error('[kyc] notification delivery failed', notificationError instanceof Error ? notificationError.message : 'unknown');
    }

    return NextResponse.json({ id: inserted[0].id, status: 'pending' }, { status: 201 });
  } catch (err) {
    return databaseUnavailable('kyc POST', err);
  }
}
