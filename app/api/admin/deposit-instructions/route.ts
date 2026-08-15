import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getCurrentIdentity } from '@/lib/supabase/identity';
import { getDb } from '@/lib/db';
import { depositInstructions } from '@/db/schema';

export async function GET() {
  const actor = await getCurrentIdentity();
  if (!actor?.id || actor.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: 'Database is not configured' }, { status: 503 });
  return NextResponse.json(await db.select().from(depositInstructions));
}

export async function PUT(request: Request) {
  const actor = await getCurrentIdentity();
  if (!actor?.id || actor.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: 'Database is not configured' }, { status: 503 });
  const body = await request.json().catch(() => null) as { method?: 'bank' | 'crypto'; label?: string; details?: string; qrPath?: string; active?: boolean } | null;
  if (!body?.method || !body.label?.trim() || !body.details?.trim()) return NextResponse.json({ error: 'Method, label, and details are required.' }, { status: 400 });
  const existing = await db.select({ id: depositInstructions.id }).from(depositInstructions).where(eq(depositInstructions.method, body.method)).limit(1);
  if (existing[0]) await db.update(depositInstructions).set({ label: body.label.trim(), details: body.details.trim(), qrPath: body.qrPath?.trim() || null, active: body.active === false ? 0 : 1, updatedBy: actor.id, updatedAt: new Date() }).where(eq(depositInstructions.id, existing[0].id));
  else await db.insert(depositInstructions).values({ method: body.method, label: body.label.trim(), details: body.details.trim(), qrPath: body.qrPath?.trim() || null, active: body.active === false ? 0 : 1, updatedBy: actor.id });
  return NextResponse.json({ updated: true });
}
