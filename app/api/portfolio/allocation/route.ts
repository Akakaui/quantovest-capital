import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  const { identity, error } = await requireAuth();
  if (error) return error;

  try {
    return NextResponse.json({
      plan: "Growth",
      allocation: [
        { name: "FX Trading", percent: 40, color: "#22C55E" },
        { name: "Crypto Arbitrage", percent: 25, color: "#3B82F6" },
        { name: "Equities", percent: 20, color: "#F59E0B" },
        { name: "Cash Reserve", percent: 15, color: "#6B7280" },
      ],
    });
  } catch {
    return NextResponse.json([]);
  }
}
