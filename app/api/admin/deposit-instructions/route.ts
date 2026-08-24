import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/auth-helpers';
import { getDb } from '@/lib/db';
import { depositInstructions } from '@/db/schema';

export const dynamic = 'force-dynamic';

const MEDIA_BUCKET = 'quantovest-media';
const MAX_QR_BYTES = 10 * 1024 * 1024;
const ALLOWED_QR_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/jpg']);
const ALLOWED_METHODS = new Set(['usdt-trc20', 'btc']);

type InstructionInput = {
  method?: string;
  label?: string;
  details?: string;
  qrPath?: string;
  active?: boolean;
};

function validateInput(body: InstructionInput) {
  if (!body.method || !body.label?.trim() || !body.details?.trim()) return 'Method, label, and details are required.';
  if (!ALLOWED_METHODS.has(body.method)) return 'Only BTC and USDT (TRC-20) are supported.';
  return null;
}

async function saveInstruction(identity: { id: string }, body: InstructionInput) {
  const db = getDb();
  if (!db) return NextResponse.json({ error: 'Database is not configured' }, { status: 503 });
  const validationError = validateInput(body);
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

  const existing = await db.select({ id: depositInstructions.id }).from(depositInstructions).where(eq(depositInstructions.method, body.method!)).limit(1);
  const values = {
    label: body.label!.trim(),
    details: body.details!.trim(),
    qrPath: body.qrPath?.trim() || null,
    active: body.active === false ? 0 : 1,
    updatedBy: identity.id,
    updatedAt: new Date(),
  };
  if (existing[0]) await db.update(depositInstructions).set(values).where(eq(depositInstructions.id, existing[0].id));
  else await db.insert(depositInstructions).values({ method: body.method!, ...values });
  return NextResponse.json({ updated: true });
}

async function uploadQr(identity: { id: string }, file: File) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_MEDIA_BUCKET?.trim();
  if (!url || !serviceKey || bucket !== MEDIA_BUCKET) return { error: 'Supabase Storage is temporarily unavailable.', status: 503 };
  if (!ALLOWED_QR_TYPES.has(file.type) || file.size > MAX_QR_BYTES) return { error: 'Use a JPG, PNG, or WebP QR image up to 10 MB.', status: 400 };

  const extension = file.type === 'image/jpeg' || file.type === 'image/jpg' ? 'jpg' : file.type.split('/')[1];
  const path = `deposit-qr/${identity.id}/${crypto.randomUUID()}.${extension}`;
  const storage = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } }).storage.from(MEDIA_BUCKET);
  const { error } = await storage.upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, cacheControl: '3600', upsert: false });
  if (error) {
    console.error('[deposit-instructions QR upload]', { name: error.name, status: error.status });
    return { error: 'The QR image could not be uploaded. Please try again.', status: 502 };
  }
  return { path };
}

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;
    const db = getDb();
    if (!db) return NextResponse.json([]);
    return NextResponse.json(await db.select().from(depositInstructions));
  } catch (err) {
    console.error('[deposit-instructions GET]', err);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { identity, error } = await requireAdmin();
    if (error) return error;
    const form = await request.formData();
    const file = form.get('qrFile');
    let qrPath = String(form.get('qrPath') ?? '').trim();
    if (file instanceof File && file.size > 0) {
      const upload = await uploadQr(identity, file);
      if ('error' in upload) return NextResponse.json({ error: upload.error }, { status: upload.status });
      qrPath = upload.path;
    }
    return saveInstruction(identity, {
      method: String(form.get('method') ?? ''),
      label: String(form.get('label') ?? ''),
      details: String(form.get('details') ?? ''),
      qrPath,
    });
  } catch (err) {
    console.error('[deposit-instructions POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { identity, error } = await requireAdmin();
    if (error) return error;
    const body = await request.json().catch(() => null) as InstructionInput | null;
    if (!body) return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    return saveInstruction(identity, body);
  } catch (err) {
    console.error('[deposit-instructions PUT]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
