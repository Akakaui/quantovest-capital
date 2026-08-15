import { DrizzleAdapter } from "@auth/drizzle-adapter";
import AppleProvider from "next-auth/providers/apple";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import { getDb } from "@/lib/db";
import * as schema from "@/db/schema";

const db = getDb();

const providers: NextAuthOptions["providers"] = [];
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET }));
}
if (process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET) {
  providers.push(AppleProvider({ clientId: process.env.APPLE_CLIENT_ID, clientSecret: process.env.APPLE_CLIENT_SECRET }));
}
if (process.env.EMAIL_SERVER && process.env.EMAIL_FROM) {
  providers.push(EmailProvider({ server: process.env.EMAIL_SERVER, from: process.env.EMAIL_FROM }));
}

export const authOptions: NextAuthOptions = {
  adapter: db ? DrizzleAdapter(db, { usersTable: schema.users, accountsTable: schema.accounts, sessionsTable: schema.sessions, verificationTokensTable: schema.verificationTokens }) : undefined,
  providers,
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: db ? "database" : "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async session({ session, user, token }) {
      if (session.user) {
        session.user.id = user?.id ?? token.sub ?? "";
        session.user.role = (user as { role?: "investor" | "admin" } | undefined)?.role ?? "investor";
      }
      return session;
    },
  },
};
