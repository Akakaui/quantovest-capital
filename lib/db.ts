import "server-only";
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "@/db/schema";

let client: mysql.Pool | undefined;

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  client ??= mysql.createPool({ uri: url, connectionLimit: 5, enableKeepAlive: true });
  return drizzle(client, { schema, mode: "default" });
}
