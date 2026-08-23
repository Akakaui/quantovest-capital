import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/auth-helpers';
import { notifyAdmins, notifyUser } from '@/lib/notifications';
import { getDb } from '@/lib/db';
import { kycApplications, users } from '@/db/schema';
import { sendKycApproved, sendKycDeclined } from '@/lib/email';
import { databaseUnavailable } from '@/lib/api-errors';

export const dynamic = 'force-dynamic';

function documentPaths(raw: string) {
  try {
    const parsed = JSON.parse(raw) as { bucket?: string; idDocument?: string; proofOfAddress?: string };
    if (parsed.bucket === 'quantovest-media' && parsed.idDocument && parsed.proofOfAddress) return [parsed.idDocument, parsed.proofOfAddress];
  } catch {
    const legacy = raw.split('|').filter(Boolean);
    if (legacy.length === 2) return legacy;
  }
  return [];
}

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;
    const db = getDb();
    if (!db) return databaseUnavailable('admin kyc GET');
    const rows = await db.select().from(kycApplications).where(eq(kycApplications.status, 'pending'));
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucket = process.env.SUPABASE_MEDIA_BUCKET?.trim();
    if (!url || !serviceKey || bucket !== 'quantovest-media') return NextResponse.json(rows.map(row => ({ ...row, documentUrls: [] })));
    const storage = createClient(url, serviceKey).storage.from(bucket);
    const enriched = await Promise.all(rows.map(async row => {
      const paths = documentPaths(row.documentPath);
      const documentUrls = (await Promise.all(paths.map(async path => (await storage.createSignedUrl(path, 300)).data?.signedUrl ?? null))).filter(Boolean);
      return { ...row, documentUrls };
    }));
    return NextResponse.json(enriched);
  } catch (err) {
    return databaseUnavailable('admin kyc GET', err);
  }
}

export async function PATCH(request: Request) {
  try {
    const { identity, error } = await requireAdmin();
    if (error) return error;
    const db = getDb();
    if (!db) return databaseUnavailable('admin kyc PATCH');
    const body = await request.json().catch(() => null) as { applicationId?: number; action?: 'approve' | 'decline'; reviewNote?: string } | null;
    if (!body?.applicationId || (body.action !== 'approve' && body.action !== 'decline')) return NextResponse.json({ error: 'Application and action are required.' }, { status: 400 });
    const rows = await db.select().from(kycApplications).where(and(eq(kycApplications.id, body.applicationId), eq(kycApplications.status, 'pending'))).limit(1);
    if (!rows[0]) return NextResponse.json({ error: 'Pending KYC application was not found.' }, { status: 404 });
    const status = body.action === 'approve' ? 'approved' : 'declined';
    await db.update(kycApplications).set({ status, reviewedBy: identity.id, reviewNote: body.reviewNote?.trim() || null, updatedAt: new Date() }).where(eq(kycApplications.id, body.applicationId));
    try {
      await notifyUser(rows[0].investorId, `kyc_${status}`, `KYC ${status}`, body.reviewNote?.trim() || `Your identity verification was ${status}.`);
      await notifyAdmins(`kyc_${status}`, `KYC ${status}`, `KYC application ${body.applicationId} was ${status}.`);
      const investor = await db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, rows[0].investorId)).limit(1);
      if (investor[0]?.email) {
        if (status === 'approved') sendKycApproved(investor[0].email, investor[0].name || 'Investor');
        else sendKycDeclined(investor[0].email, investor[0].name || 'Investor', body.reviewNote?.trim() || 'Your identity verification did not meet requirements.');
      }
    } catch (notificationError) {
      console.error('[kyc] notification delivery failed', notificationError instanceof Error ? notificationError.message : 'unknown');
    }
    return NextResponse.json({ updated: true, status });
  } catch (err) {
    return databaseUnavailable('admin kyc PATCH', err);
  }
}
