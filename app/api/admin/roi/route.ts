import { NextResponse } from "next/server";
import { and, desc, eq, gte, lt } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth-helpers";
import { notifyAdmins, notifyUser } from "@/lib/notifications";
import { getDb } from "@/lib/db";
import { investorAccounts, plans, portfolioLedger, roiEntries, users } from "@/db/schema";

export const dynamic = "force-dynamic";

const FIXED_ROI_BPS: Record<string, number> = { Starter: 1500, Growth: 2500, Elite: 3500 };

function utcWeekBounds(date = new Date()) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = start.getUTCDay();
  const diff = start.getUTCDate() - day + (day === 0 ? -6 : 1);
  start.setUTCDate(diff);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 7);
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
    const body = await request.json().catch(() => null) as { investorId?: string; amountCents?: number; message?: string } | null;
    if (!body?.investorId || !Number.isInteger(body.amountCents) || body.amountCents! <= 0 || !body.message?.trim()) {
      return NextResponse.json({ error: "Investor, positive amount, and message are required." }, { status: 400 });
    }

    try {
      const result = await db.transaction(async tx => {
        const account = await tx.select({ account: investorAccounts, plan: plans })
          .from(investorAccounts)
          .leftJoin(plans, eq(investorAccounts.planId, plans.id))
          .where(and(eq(investorAccounts.investorId, body.investorId!), eq(investorAccounts.status, 'active')))
          .limit(1);
        if (!account[0]) throw new Error('Active investor account was not found.');
        const { account: investorAccount, plan } = account[0];
        
        const { start: weekStart, end: weekEnd } = utcWeekBounds();
        const existingCredit = await tx.select().from(roiEntries)
          .where(and(
            eq(roiEntries.investorId, body.investorId!),
            gte(roiEntries.entryDate, weekStart),
            lt(roiEntries.entryDate, weekEnd)
          ))
          .limit(1);
        if (existingCredit.length > 0) {
          throw new Error('ROI has already been credited for this 7-day period.');
        }

        const profitCents = body.amountCents!;
        const message = body.message!.trim();
        const planId = plan?.id ?? 1; // fallback planId if investor has no plan yet
        const percentageBps = plan ? FIXED_ROI_BPS[plan.name] ?? 0 : 0;

        const inserted = await tx.insert(roiEntries).values({
          investorId: body.investorId!,
          planId,
          percentageBps,
          profitCents,
          marketNote: message,
          publishedBy: identity.id
        }).returning({ id: roiEntries.id });
        const roiId = inserted[0].id;

        await tx.update(investorAccounts).set({ balanceCents: investorAccount.balanceCents + profitCents }).where(eq(investorAccounts.id, investorAccount.id));

        await tx.insert(portfolioLedger).values({
          investorId: body.investorId!,
          type: 'profit',
          amountCents: profitCents,
          referenceId: String(roiId),
          description: `Profit credited — $${(profitCents / 100).toFixed(2)} from ${message}`
        });

        return { roiId, profitCents, planName: plan?.name ?? null, investorId: body.investorId! };
      });
      const profitDollars = (result.profitCents / 100).toFixed(2);
      try {
        await notifyUser(result.investorId, "strategy_performance", "Strategy performance update", `A profit of $${profitDollars} has been applied to your account balance.`);
        await notifyAdmins("strategy_performance", "Investor performance credited", `A profit of $${profitDollars} was applied for investor ${result.investorId}.`);
      } catch (notificationError) {
        console.error("[roi notification delivery]", notificationError);
      }
      return NextResponse.json({ created: true, notifications: "queued", ...result }, { status: 201 });
    } catch (error) {
      const duplicate = error instanceof Error && (error.message.includes("already been credited") || error.message.includes("already credited"));
      return NextResponse.json({ error: error instanceof Error ? error.message : "Performance credit failed." }, { status: duplicate ? 409 : 400 });
    }
  } catch (err) {
    console.error("[roi POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
