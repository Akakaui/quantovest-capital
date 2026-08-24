import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth-helpers';
import { getDb } from '@/lib/db';
import { depositInstructions } from '@/db/schema';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { identity, error } = await requireAdmin();
    if (error) return error;
    const db = getDb();
    if (!db) return NextResponse.json([]);
    return NextResponse.json(await db.select().from(depositInstructions));
  } catch (err) {
    console.error('[deposit-instructions]', err);
    return NextResponse.json([], { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { identity, error } = await requireAdmin();
    if (error) return error;
    const db = getDb();
    if (!db) return NextResponse.json({ error: 'Database is not configured' }, { status: 503 });
    const body = await request.json().catch(() => null) as { method?: string; label?: string; details?: string; qrPath?: string; active?: boolean } | null;
    if (!body?.method || !body.label?.trim() || !body.details?.trim()) return NextResponse.json({ error: 'Method, label, and details are required.' }, { status: 400 });
    if (!['usdt-trc20', 'btc'].includes(body.method)) return NextResponse.json({ error: 'Only BTC and USDT (TRC-20) are supported.' }, { status: 400 });
    const existing = await db.select({ id: depositInstructions.id }).from(depositInstructions).where(eq(depositInstructions.method, body.method)).limit(1);
    if (existing[0]) await db.update(depositInstructions).set({ label: body.label.trim(), details: body.details.trim(), qrPath: body.qrPath?.trim() || null, active: body.active === false ? 0 : 1, updatedBy: identity.id, updatedAt: new Date() }).where(eq(depositInstructions.id, existing[0].id));
    else await db.insert(depositInstructions).values({ method: body.method, label: body.label.trim(), details: body.details.trim(), qrPath: body.qrPath?.trim() || null, active: body.active === false ? 0 : 1, updatedBy: identity.id });
    return NextResponse.json({ updated: true });
  } catch (err) {
    console.error('[deposit-instructions PUT]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
