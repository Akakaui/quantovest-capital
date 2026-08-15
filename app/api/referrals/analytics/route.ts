import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { referralAttributions, referralRewards } from "@/db/schema";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
  const url = new URL(request.url);
  const start = url.searchParams.get("start");
  const end = url.searchParams.get("end");
  if (start && end && start > end) return NextResponse.json({ error: "Start date must be before end date" }, { status: 400 });
  const [attributions, rewards] = await Promise.all([
    db.select({ attributedAt: referralAttributions.attributedAt }).from(referralAttributions).where(eq(referralAttributions.referrerId, session.user.id)),
    db.select({ createdAt: referralRewards.createdAt, rewardAmountCents: referralRewards.rewardAmountCents }).from(referralRewards).where(eq(referralRewards.referrerId, session.user.id)),
  ]);
  const points = new Map<string, { signUps: number; earningsCents: number }>();
  for (const item of attributions) {
    const date = new Date(item.attributedAt);
    if (start && date < new Date(`${start}T00:00:00Z`)) continue;
    if (end && date > new Date(`${end}T23:59:59Z`)) continue;
    const month = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    const current = points.get(month) ?? { signUps: 0, earningsCents: 0 };
    current.signUps += 1;
    points.set(month, current);
  }
  for (const item of rewards) {
    const date = new Date(item.createdAt);
    if (start && date < new Date(`${start}T00:00:00Z`)) continue;
    if (end && date > new Date(`${end}T23:59:59Z`)) continue;
    const month = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    const current = points.get(month) ?? { signUps: 0, earningsCents: 0 };
    current.earningsCents += item.rewardAmountCents;
    points.set(month, current);
  }
  return NextResponse.json(Array.from(points.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([month, values]) => ({ month, label: new Date(`${month}-01T12:00:00Z`).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" }), ...values })));
}
