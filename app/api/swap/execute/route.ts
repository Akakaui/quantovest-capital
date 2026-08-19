import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { getDb } from "@/lib/db";
import { swapTransactions, swapConfig, portfolioLedger } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { identity, error } = await requireAuth();
  if (error) return error;
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database is not configured" }, { status: 503 });

  const body = await request.json().catch(() => null) as {
    fromAsset?: string;
    toAsset?: string;
    fromAmount?: number;
  } | null;

  if (!body?.fromAsset || !body?.toAsset || !body?.fromAmount || body.fromAmount <= 0) {
    return NextResponse.json({ error: "Invalid swap parameters" }, { status: 400 });
  }

  const from = body.fromAsset.toUpperCase();
  const to = body.toAsset.toUpperCase();

  const ASSET_PRICES: Record<string, number> = {
    BTC: 67500, ETH: 3450, SOL: 178, USDT: 1, USDC: 1,
    XRP: 0.62, DOGE: 0.16, GBP: 1.27, EUR: 1.09, USD: 1,
  };

  const baseFrom = ASSET_PRICES[from] ?? 0;
  const baseTo = ASSET_PRICES[to] ?? 0;
  if (!baseFrom || !baseTo) {
    return NextResponse.json({ error: "Unsupported asset pair" }, { status: 400 });
  }

  try {
    let rate = baseFrom / baseTo;
    let feeBps = 50;

    const [config] = await db.select().from(swapConfig).where(
      eq(swapConfig.fromAsset, from)
    ).limit(1);
    if (config && config.active) {
      rate *= parseFloat(config.rateMultiplier);
      feeBps = config.feeBps;
    }

    const fee = body.fromAmount * (feeBps / 10000);
    const toAmount = body.fromAmount * rate - fee;

    const [inserted] = await db.insert(swapTransactions).values({
      investorId: identity.id,
      fromAsset: from,
      toAsset: to,
      fromAmount: body.fromAmount.toString(),
      toAmount: toAmount.toFixed(6),
      rate: rate.toFixed(8),
      feeCents: Math.round(fee * 100),
      status: "completed",
    }).returning({ id: swapTransactions.id });

    await db.insert(portfolioLedger).values({
      investorId: identity.id,
      type: "swap",
      amountCents: Math.round(body.fromAmount * 100),
      referenceId: String(inserted.id),
      description: `Swapped ${body.fromAmount} ${from} to ${toAmount.toFixed(6)} ${to}`,
    });

    return NextResponse.json({
      id: inserted.id,
      from,
      to,
      fromAmount: body.fromAmount,
      toAmount: toAmount.toFixed(6),
      rate: rate.toFixed(8),
      fee: fee.toFixed(6),
      status: "completed",
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Swap failed." }, { status: 500 });
  }
}
