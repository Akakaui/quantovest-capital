import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth-helpers';
import { notifyAdmins, notifyUser } from '@/lib/notifications';
import { getDb } from '@/lib/db';
import { kycApplications, users } from '@/db/schema';
import { sendKycApproved, sendKycDeclined } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { identity, error } = await requireAdmin();
    if (error) return error;
    const db = getDb();
    if (!db) return NextResponse.json([]);
    return NextResponse.json(await db.select().from(kycApplications).where(eq(kycApplications.status, 'pending')));
  } catch (err) {
    console.error('[kyc]', err);
    return NextResponse.json([], { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { identity, error } = await requireAdmin();
    if (error) return error;
    const db = getDb();
    if (!db) return NextResponse.json({ error: 'Database is not configured' }, { status: 503 });
    const body = await request.json().catch(() => null) as { applicationId?: number; action?: 'approve' | 'decline'; reviewNote?: string } | null;
    if (!body?.applicationId || (body.action !== 'approve' && body.action !== 'decline')) return NextResponse.json({ error: 'Application and action are required.' }, { status: 400 });
    const rows = await db.select().from(kycApplications).where(and(eq(kycApplications.id, body.applicationId), eq(kycApplications.status, 'pending'))).limit(1);
    if (!rows[0]) return NextResponse.json({ error: 'Pending KYC application was not found.' }, { status: 404 });
    const status = body.action === 'approve' ? 'approved' : 'declined';
    await db.update(kycApplications).set({ status, reviewedBy: identity.id, reviewNote: body.reviewNote?.trim() || null, updatedAt: new Date() }).where(eq(kycApplications.id, body.applicationId));
    await notifyUser(rows[0].investorId, `kyc_${status}`, `KYC ${status}`, body.reviewNote?.trim() || `Your identity verification was ${status}.`);
    await notifyAdmins(`kyc_${status}`, `KYC ${status}`, `KYC application ${body.applicationId} was ${status}.`);
    try {
      const investor = await db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, rows[0].investorId)).limit(1);
      if (investor[0]?.email) {
        if (status === 'approved') sendKycApproved(investor[0].email, investor[0].name || 'Investor');
        else sendKycDeclined(investor[0].email, investor[0].name || 'Investor', body.reviewNote?.trim() || 'Your identity verification did not meet requirements.');
      }
    } catch {}
    return NextResponse.json({ updated: true, status });
  } catch (err) {
    console.error('[kyc PATCH]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
