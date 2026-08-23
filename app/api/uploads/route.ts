import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCurrentIdentity } from "@/lib/supabase/identity";
import { isUploadPurpose } from "@/lib/uploadRules";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg", "image/png", "image/webp",
  "application/pdf", "image/jpg"
]);

export async function POST(request: Request) {
  const actor = await getCurrentIdentity();
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_MEDIA_BUCKET?.trim();
  if (!url || !serviceKey || !bucket || bucket !== 'quantovest-media') {
    console.error('[uploads] Canonical media bucket is not configured');
    return NextResponse.json({ error: "Supabase Storage is temporarily unavailable." }, { status: 503 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    const purpose = form.get("purpose");
    if (!(file instanceof File) || !ALLOWED_TYPES.has(file.type) || file.size > MAX_BYTES) return NextResponse.json({ error: "Use a JPG, PNG, WebP, or PDF up to 10 MB." }, { status: 400 });
    if (!isUploadPurpose(purpose)) return NextResponse.json({ error: "Invalid upload purpose." }, { status: 400 });
    const extension = file.type.split("/")[1].replace("jpeg", "jpg");
    const path = `${purpose}/${actor.id}/${crypto.randomUUID()}.${extension}`;
    const storage = createClient(url, serviceKey).storage.from(bucket);
    const upload = await storage.upload(path, Buffer.from(await file.arrayBuffer()), {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });
    if (upload.error) {
      console.error("[uploads] Storage upload failed", { purpose, contentType: file.type, code: upload.error.name });
      return NextResponse.json({ error: "The document could not be uploaded. Please try again." }, { status: 502 });
    }
    return NextResponse.json({ path, bucket }, { status: 201 });
  } catch (err) {
    console.error("[uploads] Unexpected upload failure", err instanceof Error ? err.name : "unknown");
    return NextResponse.json({ error: "The document could not be uploaded. Please try again." }, { status: 500 });
  }
}
