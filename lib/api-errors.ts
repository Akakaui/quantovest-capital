import { NextResponse } from "next/server";

export function serviceUnavailable(scope: string, error?: unknown) {
  const detail = error instanceof Error ? error.message : "unknown error";
  console.error(`[${scope}] dependency unavailable`, { message: detail.slice(0, 240) });
  return NextResponse.json(
    {
      error: "This service is temporarily unavailable. Please try again shortly.",
      code: "SERVICE_UNAVAILABLE",
    },
    { status: 503 },
  );
}

export function databaseUnavailable(scope: string, error?: unknown) {
  return serviceUnavailable(`${scope}:database`, error);
}
