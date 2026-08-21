import "server-only";
import { createHash, randomBytes } from "crypto";
import { eq, and, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { recoveryCodes } from "@/db/schema";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 8;
const CODE_COUNT = 10;

function generateCode(): string {
  const bytes = randomBytes(CODE_LENGTH);
  let result = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    result += CHARS[bytes[i] % CHARS.length];
  }
  return result;
}

export function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

export async function generateRecoveryCodes(userId: string): Promise<string[]> {
  const db = getDb();
  if (!db) throw new Error("Database not configured");

  const codes: string[] = [];
  const rows: { codeHash: string }[] = [];

  for (let i = 0; i < CODE_COUNT; i++) {
    const code = generateCode();
    codes.push(code);
    rows.push({ codeHash: hashCode(code) });
  }

  await db.insert(recoveryCodes).values(
    rows.map((r) => ({ userId, codeHash: r.codeHash }))
  );

  return codes;
}

export async function verifyRecoveryCode(
  userId: string,
  code: string
): Promise<boolean> {
  const db = getDb();
  if (!db) return false;

  const normalized = code.toUpperCase().replace(/[\s-]/g, "");
  const codeHash = hashCode(normalized);

  const rows = await db
    .select()
    .from(recoveryCodes)
    .where(
      and(
        eq(recoveryCodes.userId, userId),
        eq(recoveryCodes.codeHash, codeHash),
        isNull(recoveryCodes.usedAt)
      )
    )
    .limit(1);

  if (rows.length === 0) return false;

  await db
    .update(recoveryCodes)
    .set({ usedAt: new Date() })
    .where(eq(recoveryCodes.id, rows[0].id));

  return true;
}

export async function getUnusedRecoveryCodes(
  userId: string
): Promise<string[]> {
  const db = getDb();
  if (!db) return [];

  const rows = await db
    .select({ codeHash: recoveryCodes.codeHash })
    .from(recoveryCodes)
    .where(
      and(
        eq(recoveryCodes.userId, userId),
        isNull(recoveryCodes.usedAt)
      )
    );

  return rows.map((r) => r.codeHash);
}
