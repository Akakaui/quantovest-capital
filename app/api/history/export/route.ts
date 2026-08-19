import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth-helpers";
import { getDb } from "@/lib/db";
import { portfolioLedger } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { identity, error } = await requireAuth();
  if (error) return error;
  const db = getDb();
  if (!db) return NextResponse.json([]);

  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type") as "deposit" | "roi" | "withdrawal" | "referral_reward" | "adjustment" | null;
    const conditions = [eq(portfolioLedger.investorId, identity.id)];
    if (type) conditions.push(eq(portfolioLedger.type, type));
    const rows = await db.select().from(portfolioLedger).where(and(...conditions));

    const header = "Date,Type,Amount (USD),Description,Reference\n";
    const csv = rows.map(r => {
      const date = new Date(r.createdAt).toLocaleDateString('en-US');
      const amount = (r.amountCents / 100).toFixed(2);
      const desc = (r.description ?? '').replace(/"/g, '""');
      const ref = (r.referenceId ?? '').replace(/"/g, '""');
      return `"${date}","${r.type}","${amount}","${desc}","${ref}"`;
    }).join("\n");

    return new NextResponse(header + csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="transaction-history.csv"`,
      },
    });
  } catch {
    return NextResponse.json([]);
  }
}
