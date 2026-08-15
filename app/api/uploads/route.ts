import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return NextResponse.json({ error: "Supabase Storage is not configured" }, { status: 503 });
  const form = await request.formData();
  const file = form.get("file");
  const purpose = form.get("purpose");
  if (!(file instanceof File) || !ALLOWED_TYPES.has(file.type) || file.size > MAX_BYTES) return NextResponse.json({ error: "Use a JPG, PNG, or WebP image up to 5 MB." }, { status: 400 });
  if (purpose !== "avatar" && purpose !== "trader") return NextResponse.json({ error: "Invalid upload purpose." }, { status: 400 });
  const extension = file.type.split("/")[1].replace("jpeg", "jpg");
  const path = `${purpose}/${session.user.id}/${crypto.randomUUID()}.${extension}`;
  const storage = createClient(url, serviceKey).storage.from(process.env.SUPABASE_MEDIA_BUCKET ?? "quantovest-media");
  const upload = await storage.upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: false });
  if (upload.error) return NextResponse.json({ error: upload.error.message }, { status: 502 });
  return NextResponse.json({ path, bucket: process.env.SUPABASE_MEDIA_BUCKET ?? "quantovest-media" }, { status: 201 });
}
