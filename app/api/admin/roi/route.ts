import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth-helpers";
import { notifyAdmins, notifyUser } from "@/lib/notifications";
import { getDb } from "@/lib/db";
import { investorAccounts, plans, portfolioLedger, roiEntries } from "@/db/schema";

export const dynamic = "force-dynamic";

// Fixed daily ROI per plan (in basis points)
const FIXED_ROI_BPS: Record<string, number> = {
  Starter: 1500,  // 15%
  Growth: 2500,   // 25%
  Elite: 3500,    // 35%
};

export async function POST(request: Request) {
  try {
    const { identity, error } = await requireAdmin();
    if (error) return error;
    const db = getDb();
    if (!db) return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
    const body = await request.json().catch(() => null) as { investorId?: string; percentageBps?: number; marketNote?: string } | null;
    if (!body?.investorId || !Number.isInteger(body.percentageBps) || !body.marketNote?.trim()) {
      return NextResponse.json({ error: "Investor, ROI percentage, and market note are required." }, { status: 400 });
    }

    try {
      const result = await db.transaction(async tx => {
        const account = await tx.select({ account: investorAccounts, plan: plans })
          .from(investorAccounts)
          .innerJoin(plans, eq(investorAccounts.planId, plans.id))
          .where(and(
            eq(investorAccounts.investorId, body.investorId!),
            eq(investorAccounts.status, "active"),
            eq(plans.active, 1)
          ))
          .limit(1);

        if (!account[0]) throw new Error("Active investor account or plan was not found.");
        const { account: investorAccount, plan } = account[0];

        // Enforce fixed ROI per plan
        const fixedBps = FIXED_ROI_BPS[plan.name];
        if (!fixedBps) throw new Error(`No fixed ROI configured for plan: ${plan.name}`);

        // Allow the submitted percentage to match the fixed rate (within 1% tolerance for rounding)
        const diff = Math.abs(body.percentageBps! - fixedBps);
        if (diff > 100) {
          throw new Error(`${plan.name} plan has a fixed daily ROI of ${fixedBps / 100}%. You submitted ${body.percentageBps! / 100}%.`);
        }

        const profitCents = Math.floor(investorAccount.balanceCents * fixedBps / 10_000);

        const inserted = await tx.insert(roiEntries).values({
          investorId: body.investorId!,
          planId: plan.id,
          percentageBps: fixedBps,
          profitCents,
          marketNote: body.marketNote!.trim(),
          publishedBy: identity.id,
        }).returning({ id: roiEntries.id });

        const roiId = inserted[0].id;

        await tx.update(investorAccounts)
          .set({ balanceCents: investorAccount.balanceCents + profitCents })
          .where(eq(investorAccounts.id, investorAccount.id));

        await tx.insert(portfolioLedger).values({
          investorId: body.investorId!,
          type: "roi",
          amountCents: profitCents,
          referenceId: String(roiId),
          description: body.marketNote!.trim(),
        });

        return { roiId, profitCents, planName: plan.name, investorId: body.investorId!, percentageBps: fixedBps };
      });

      const profitDollars = (result.profitCents / 100).toFixed(2);
      const roiPercent = (result.percentageBps / 100).toFixed(0);
      await notifyUser(result.investorId, 'roi_published', 'ROI published', `ROI of ${roiPercent}% published. $${profitDollars} added to your balance.`);
      await notifyAdmins('roi_published', 'ROI published', `ROI of ${roiPercent}% published for investor ${result.investorId}.`);
      return NextResponse.json({ created: true, ...result }, { status: 201 });
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "ROI publication failed." }, { status: 400 });
    }
  } catch (err) {
    console.error('[roi POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
