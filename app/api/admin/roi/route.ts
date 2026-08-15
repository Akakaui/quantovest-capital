import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { investorAccounts, plans, portfolioLedger, roiEntries } from "@/db/schema";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
  const body = await request.json().catch(() => null) as { investorId?: string; percentageBps?: number; marketNote?: string } | null;
  if (!body?.investorId || !Number.isInteger(body.percentageBps) || !body.marketNote?.trim()) return NextResponse.json({ error: "Investor, ROI percentage, and market note are required." }, { status: 400 });

  try {
    const result = await db.transaction(async tx => {
      const account = await tx.select({ account: investorAccounts, plan: plans }).from(investorAccounts).innerJoin(plans, eq(investorAccounts.planId, plans.id)).where(and(eq(investorAccounts.investorId, body.investorId!), eq(investorAccounts.status, "active"), eq(plans.active, 1))).limit(1);
      if (!account[0]) throw new Error("Active investor account or plan was not found.");
      const { account: investorAccount, plan } = account[0];
      if (body.percentageBps! < plan.minRoiBps || body.percentageBps! > plan.maxRoiBps) throw new Error(`ROI must be between ${plan.minRoiBps / 100}% and ${plan.maxRoiBps / 100}% for the ${plan.name} plan.`);
      const profitCents = Math.floor(investorAccount.balanceCents * body.percentageBps! / 10_000);
      const inserted = await tx.insert(roiEntries).values({ investorId: body.investorId!, planId: plan.id, percentageBps: body.percentageBps!, profitCents, marketNote: body.marketNote!.trim(), publishedBy: session.user.id! });
      const roiId = Number(inserted[0].insertId);
      await tx.update(investorAccounts).set({ balanceCents: investorAccount.balanceCents + profitCents }).where(eq(investorAccounts.id, investorAccount.id));
      await tx.insert(portfolioLedger).values({ investorId: body.investorId!, type: "roi", amountCents: profitCents, referenceId: String(roiId), description: body.marketNote!.trim() });
      return { roiId, profitCents, planName: plan.name };
    });
    return NextResponse.json({ created: true, ...result }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "ROI publication failed." }, { status: 400 });
  }
}
