import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { getClient } from "@/lib/db";
import { databaseUnavailable } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { identity, error } = await requireAdmin();
    if (error) return error;
    const client = getClient();
    if (!client) {
      return NextResponse.json({ error: 'Database connection unavailable' }, { status: 503 });
    }
    const rows = await client.unsafe(
      `SELECT u.id, u.name, u.email, ia.id as "accountId", ia."planId", ia."balanceCents", ia."principalCents", p.name as "planName", p."minRoiBps", p."maxRoiBps"
       FROM users u
       LEFT JOIN "investorAccounts" ia ON u.id = ia."investorId"
       LEFT JOIN plans p ON ia."planId" = p.id
       WHERE u.role = $1`,
      ['investor']
    );
    return NextResponse.json(rows);
  } catch (err) {
    return databaseUnavailable("admin investors GET", err);
  }
}
