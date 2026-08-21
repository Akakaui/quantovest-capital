import "server-only";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "@/db/schema";

let client: postgres.Sql | undefined;

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  client ??= postgres(url, { prepare: false, max: 10, idle_timeout: 20, connect_timeout: 10, ssl: url.includes('localhost') ? false : { rejectUnauthorized: false } });
  return drizzle(client, { schema });
}
