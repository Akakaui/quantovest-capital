import "server-only";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "@/db/schema";

let client: postgres.Sql | undefined;

function getClient() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  client ??= postgres(url, { prepare: false, max: 10, idle_timeout: 20, connect_timeout: 10, ssl: url.includes('localhost') ? false : { rejectUnauthorized: false } });
  return client;
}

export function getDb() {
  const c = getClient();
  if (!c) return null;
  return drizzle(c, { schema });
}

export { getClient };
