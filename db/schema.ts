import { index, int, mysqlEnum, mysqlTable, primaryKey, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";
import type { AdapterAccount } from "next-auth/adapters";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 191 }).primaryKey(),
  name: varchar("name", { length: 191 }),
  email: varchar("email", { length: 191 }).unique(),
  emailVerified: timestamp("emailVerified"),
  image: text("image"),
  role: mysqlEnum("role", ["investor", "admin"]).default("investor").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const accounts = mysqlTable("accounts", {
  userId: varchar("userId", { length: 191 }).notNull(),
  type: varchar("type", { length: 32 }).$type<AdapterAccount["type"]>().notNull(),
  provider: varchar("provider", { length: 191 }).notNull(),
  providerAccountId: varchar("providerAccountId", { length: 191 }).notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: int("expires_at"),
  token_type: varchar("token_type", { length: 64 }),
  scope: varchar("scope", { length: 255 }),
  id_token: text("id_token"),
  session_state: varchar("session_state", { length: 255 }),
}, table => ({ pk: primaryKey({ columns: [table.provider, table.providerAccountId] }), userIndex: index("accounts_user_idx").on(table.userId) }));

export const sessions = mysqlTable("sessions", {
  sessionToken: varchar("sessionToken", { length: 255 }).primaryKey(),
  userId: varchar("userId", { length: 191 }).notNull(),
  expires: timestamp("expires").notNull(),
}, table => ({ userIndex: index("sessions_user_idx").on(table.userId) }));

export const verificationTokens = mysqlTable("verificationTokens", {
  identifier: varchar("identifier", { length: 191 }).notNull(),
  token: varchar("token", { length: 255 }).notNull(),
  expires: timestamp("expires").notNull(),
}, table => ({ pk: primaryKey({ columns: [table.identifier, table.token] }) }));

export const deposits = mysqlTable("deposits", {
  id: varchar("id", { length: 191 }).primaryKey(),
  investorId: varchar("investorId", { length: 191 }).notNull(),
  amountCents: int("amountCents").notNull(),
  status: mysqlEnum("status", ["pending", "completed", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ investorIndex: index("deposits_investor_idx").on(table.investorId) }));

export const referralLinks = mysqlTable("referralLinks", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: varchar("ownerId", { length: 191 }).notNull(),
  code: varchar("code", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ codeUnique: uniqueIndex("referral_links_code_unique").on(table.code), ownerIndex: index("referral_links_owner_idx").on(table.ownerId) }));

export const referralAttributions = mysqlTable("referralAttributions", {
  id: int("id").autoincrement().primaryKey(),
  referrerId: varchar("referrerId", { length: 191 }).notNull(),
  referredInvestorId: varchar("referredInvestorId", { length: 191 }).notNull(),
  linkId: int("linkId").notNull(),
  status: mysqlEnum("status", ["active", "reversed"]).default("active").notNull(),
  attributedAt: timestamp("attributedAt").defaultNow().notNull(),
}, table => ({ referredUnique: uniqueIndex("referral_attributions_referred_unique").on(table.referredInvestorId), referrerIndex: index("referral_attributions_referrer_idx").on(table.referrerId) }));

export const referralRewards = mysqlTable("referralRewards", {
  id: int("id").autoincrement().primaryKey(),
  attributionId: int("attributionId").notNull(),
  referrerId: varchar("referrerId", { length: 191 }).notNull(),
  referredInvestorId: varchar("referredInvestorId", { length: 191 }).notNull(),
  qualifyingDepositId: varchar("qualifyingDepositId", { length: 191 }).notNull(),
  idempotencyKey: varchar("idempotencyKey", { length: 191 }).notNull(),
  qualifyingAmountCents: int("qualifyingAmountCents").notNull(),
  rewardAmountCents: int("rewardAmountCents").notNull(),
  status: mysqlEnum("status", ["available", "held", "paid", "reversed"]).default("available").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ keyUnique: uniqueIndex("referral_rewards_key_unique").on(table.idempotencyKey), referrerIndex: index("referral_rewards_referrer_idx").on(table.referrerId) }));

export const referralWithdrawals = mysqlTable("referralWithdrawals", {
  id: int("id").autoincrement().primaryKey(),
  investorId: varchar("investorId", { length: 191 }).notNull(),
  amountCents: int("amountCents").notNull(),
  destinationType: mysqlEnum("destinationType", ["bank", "crypto"]).notNull(),
  destination: varchar("destination", { length: 255 }).notNull(),
  destinationDetails: text("destinationDetails"),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  reviewedBy: varchar("reviewedBy", { length: 191 }),
  reviewNote: text("reviewNote"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({ investorIndex: index("referral_withdrawals_investor_idx").on(table.investorId) }));

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: varchar("userId", { length: 191 }).notNull(),
  type: varchar("type", { length: 64 }).notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  body: text("body").notNull(),
  relatedRewardId: int("relatedRewardId"),
  isRead: int("isRead").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ userIndex: index("notifications_user_idx").on(table.userId) }));

export type User = typeof users.$inferSelect;
export type ReferralAttribution = typeof referralAttributions.$inferSelect;
export type ReferralReward = typeof referralRewards.$inferSelect;
export type ReferralWithdrawal = typeof referralWithdrawals.$inferSelect;
export type Notification = typeof notifications.$inferSelect;

export const schema = { users, accounts, sessions, verificationTokens, deposits, referralLinks, referralAttributions, referralRewards, referralWithdrawals, notifications };
