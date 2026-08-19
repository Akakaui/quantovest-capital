import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { identity, error } = await requireAuth();
  if (error) return error;

  const url = new URL(request.url);
  const ids = url.searchParams.get("ids") || "bitcoin,ethereum,solana,ripple";

  try {
    const prices = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
      { next: { revalidate: 60 } }
    );
    if (!prices.ok) {
      return NextResponse.json({ error: "Failed to fetch prices" }, { status: 502 });
    }
    const data = await prices.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "CoinGecko API unavailable" }, { status: 503 });
  }
}
