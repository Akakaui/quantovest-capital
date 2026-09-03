import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null) as { name?: string; email?: string; password?: string } | null;
    if (!body?.name || !body?.email || !body?.password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }
    if (body.password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email: body.email,
      password: body.password,
      options: {
        data: { name: body.name },
        emailRedirectTo: `${new URL(request.url).origin}/auth/callback?next=/dashboard`,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (data.user) {
      const db = getDb();
      if (db) {
        await db.insert(users).values({
          id: data.user.id,
          name: body.name,
          email: body.email,
          emailVerified: data.user.email_confirmed_at ? new Date(data.user.email_confirmed_at) : null,
          role: 'investor',
        }).onConflictDoUpdate({
          target: users.id,
          set: {
            name: body.name,
            email: body.email,
            emailVerified: data.user.email_confirmed_at ? new Date(data.user.email_confirmed_at) : null,
            role: 'investor',
          },
        });
      }
    }

    return NextResponse.json({
      user: data.user ? { id: data.user.id, email: data.user.email, name: body.name } : null,
      session: data.session,
    });
  } catch (err) {
    console.error('[auth signup]', err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
