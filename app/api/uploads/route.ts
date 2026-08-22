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
  if (!url || !serviceKey) return NextResponse.json({ error: "Supabase Storage is not configured" }, { status: 503 });

  try {
    const form = await request.formData();
    const file = form.get("file");
    const purpose = form.get("purpose");
    if (!(file instanceof File) || !ALLOWED_TYPES.has(file.type) || file.size > MAX_BYTES) return NextResponse.json({ error: "Use a JPG, PNG, WebP, or PDF up to 10 MB." }, { status: 400 });
    if (!isUploadPurpose(purpose)) return NextResponse.json({ error: "Invalid upload purpose." }, { status: 400 });
    const extension = file.type.split("/")[1].replace("jpeg", "jpg");
    const path = `${purpose}/${actor.id}/${crypto.randomUUID()}.${extension}`;
    const storage = createClient(url, serviceKey).storage.from(process.env.SUPABASE_MEDIA_BUCKET ?? "quantovest");
    const upload = await storage.upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: false });
    if (upload.error) return NextResponse.json({ error: upload.error.message }, { status: 502 });
    return NextResponse.json({ path, bucket: process.env.SUPABASE_MEDIA_BUCKET ?? "quantovest" }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Upload failed." }, { status: 500 });
  }
}
