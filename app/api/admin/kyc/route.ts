import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { getCurrentIdentity } from '@/lib/supabase/identity';
import { notifyAdmins, notifyUser } from '@/lib/notifications';
import { getDb } from '@/lib/db';
import { kycApplications } from '@/db/schema';

export async function GET() {
  const actor = await getCurrentIdentity();
  if (!actor?.id || actor.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: 'Database is not configured' }, { status: 503 });
  return NextResponse.json(await db.select().from(kycApplications).where(eq(kycApplications.status, 'pending')));
}

export async function PATCH(request: Request) {
  const actor = await getCurrentIdentity();
  if (!actor?.id || actor.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: 'Database is not configured' }, { status: 503 });
  const body = await request.json().catch(() => null) as { applicationId?: number; action?: 'approve' | 'decline'; reviewNote?: string } | null;
  if (!body?.applicationId || (body.action !== 'approve' && body.action !== 'decline')) return NextResponse.json({ error: 'Application and action are required.' }, { status: 400 });
  const rows = await db.select().from(kycApplications).where(and(eq(kycApplications.id, body.applicationId), eq(kycApplications.status, 'pending'))).limit(1);
  if (!rows[0]) return NextResponse.json({ error: 'Pending KYC application was not found.' }, { status: 404 });
  const status = body.action === 'approve' ? 'approved' : 'declined';
  await db.update(kycApplications).set({ status, reviewedBy: actor.id, reviewNote: body.reviewNote?.trim() || null, updatedAt: new Date() }).where(eq(kycApplications.id, body.applicationId));
  await notifyUser(rows[0].investorId, `kyc_${status}`, `KYC ${status}`, body.reviewNote?.trim() || `Your identity verification was ${status}.`);
  await notifyAdmins(`kyc_${status}`, `KYC ${status}`, `KYC application ${body.applicationId} was ${status}.`);
  return NextResponse.json({ updated: true, status });
}
