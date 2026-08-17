import { NextResponse } from "next/server";
import { getCurrentIdentity } from "@/lib/supabase/identity";

export type Identity = NonNullable<Awaited<ReturnType<typeof getCurrentIdentity>>>;

export async function requireAuth(): Promise<{ identity: Identity; error?: never } | { identity?: never; error: NextResponse }> {
  const identity = await getCurrentIdentity();
  if (!identity) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  return { identity };
}

export async function requireAdmin(): Promise<{ identity: Identity; error?: never } | { identity?: never; error: NextResponse }> {
  const result = await requireAuth();
  if (result.error) return result;
  if (result.identity.role !== "admin") return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return result;
}
