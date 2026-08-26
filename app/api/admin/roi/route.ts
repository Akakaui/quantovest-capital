import { NextResponse } from "next/server";
import { and, desc, eq, gte, lt } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth-helpers";
import { notifyAdmins, notifyUser } from "@/lib/notifications";
import { getDb } from "@/lib/db";
import { investorAccounts, plans, portfolioLedger, roiEntries, users } from "@/db/schema";

export const dynamic = "force-dynamic";

const FIXED_ROI_BPS: Record<string, number> = { Starter: 1500, Growth: 2500, Elite: 3500 };

function utcDayBounds(date = new Date()) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

export async function GET(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;
    const db = getDb();
    if (!db) return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
    const url = new URL(request.url);
    const investorId = url.searchParams.get("investorId");
    const rows = await db.select({
      id: roiEntries.id,
      investorId: roiEntries.investorId,
      investorName: users.name,
      investorEmail: users.email,
      planId: roiEntries.planId,
      planName: plans.name,
      percentageBps: roiEntries.percentageBps,
      profitCents: roiEntries.profitCents,
      marketNote: roiEntries.marketNote,
      publishedBy: roiEntries.publishedBy,
      entryDate: roiEntries.entryDate,
      createdAt: roiEntries.createdAt,
    })
      .from(roiEntries)
      .leftJoin(users, eq(roiEntries.investorId, users.id))
      .leftJoin(plans, eq(roiEntries.planId, plans.id))
      .where(investorId ? eq(roiEntries.investorId, investorId) : undefined)
      .orderBy(desc(roiEntries.entryDate))
      .limit(500);
    return NextResponse.json(rows);
  } catch (err) {
    console.error("[admin roi GET]", err);
    return NextResponse.json({ error: "Unable to load performance history." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { identity, error } = await requireAdmin();
    if (error) return error;
    const db = getDb();
    if (!db) return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
    const body = await request.json().catch(() => null) as { investorId?: string; percentageBps?: number; marketNote?: string } | null;
    if (!body?.investorId || !Number.isInteger(body.percentageBps) || !body.marketNote?.trim()) {
      return NextResponse.json({ error: "Investor, performance rate, and market note are required." }, { status: 400 });
    }

    try {
      const result = await db.transaction(async tx => {
        const account = await tx.select({ account: investorAccounts, plan: plans })
          .from(investorAccounts)
          .innerJoin(plans, eq(investorAccounts.planId, plans.id))
          .where(and(eq(investorAccounts.investorId, body.investorId!), eq(investorAccounts.status, "active"), eq(plans.active, 1)))
          .limit(1);
        if (!account[0]) throw new Error("Active investor account or plan was not found.");
        const { account: investorAccount, plan } = account[0];
        const fixedBps = FIXED_ROI_BPS[plan.name];
        if (!fixedBps) throw new Error(`No fixed performance rate configured for plan: ${plan.name}`);
        if (Math.abs(body.percentageBps! - fixedBps) > 100) {
          throw new Error(`${plan.name} plan has a fixed performance rate of ${fixedBps / 100}%.`);
        }
        const { start, end } = utcDayBounds();
        const existingToday = await tx.select({ id: roiEntries.id, entryDate: roiEntries.entryDate })
          .from(roiEntries)
          .where(and(eq(roiEntries.investorId, body.investorId!), gte(roiEntries.entryDate, start), lt(roiEntries.entryDate, end)))
          .limit(1);
        if (existingToday[0]) {
          throw new Error(`Today’s performance has already been credited for this investor (${existingToday[0].entryDate.toISOString()}).`);
        }
        const profitCents = Math.floor(investorAccount.balanceCents * fixedBps / 10_000);
        const inserted = await tx.insert(roiEntries).values({ investorId: body.investorId!, planId: plan.id, percentageBps: fixedBps, profitCents, marketNote: body.marketNote!.trim(), publishedBy: identity.id }).returning({ id: roiEntries.id });
        const roiId = inserted[0].id;
        await tx.update(investorAccounts).set({ balanceCents: investorAccount.balanceCents + profitCents }).where(eq(investorAccounts.id, investorAccount.id));
        await tx.insert(portfolioLedger).values({ investorId: body.investorId!, type: "roi", amountCents: profitCents, referenceId: String(roiId), description: body.marketNote!.trim() });
        return { roiId, profitCents, planName: plan.name, investorId: body.investorId!, percentageBps: fixedBps };
      });
      const profitDollars = (result.profitCents / 100).toFixed(2);
      const roiPercent = (result.percentageBps / 100).toFixed(0);
      try {
        await notifyUser(result.investorId, "strategy_performance", "Strategy performance update", `A ${roiPercent}% performance credit of $${profitDollars} has been applied to your account balance.`);
        await notifyAdmins("strategy_performance", "Investor performance credited", `A ${roiPercent}% performance credit of $${profitDollars} was applied for investor ${result.investorId}.`);
      } catch (notificationError) {
        // The account transaction is already committed. A notification provider
        // or preference-schema failure must not report a false credit failure.
        console.error("[roi notification delivery]", notificationError);
      }
      return NextResponse.json({ created: true, notifications: "queued", ...result }, { status: 201 });
    } catch (error) {
      const duplicate = error instanceof Error && error.message.includes("already been credited");
      return NextResponse.json({ error: error instanceof Error ? error.message : "Performance credit failed." }, { status: duplicate ? 409 : 400 });
    }
  } catch (err) {
    console.error("[roi POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
