-- ============================================================
-- Quantovest Capital — Database Setup
-- Single source of truth for manual Supabase SQL Editor setup.
-- Safe to run on a fresh database. Run once top-to-bottom.
-- ============================================================

-- ── 0000: Core tables ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "accounts" (
	"userId" varchar(191) NOT NULL,
	"type" varchar(32) NOT NULL,
	"provider" varchar(191) NOT NULL,
	"providerAccountId" varchar(191) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(64),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT "accounts_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);

CREATE TABLE IF NOT EXISTS "users" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"name" varchar(191),
	"email" varchar(191),
	"emailVerified" timestamp with time zone,
	"image" text,
	"phone" varchar(32),
	"role" varchar(24) DEFAULT 'investor' NOT NULL,
	"onboardingCompleted" boolean DEFAULT false NOT NULL,
	"onboardingAnswers" json,
	"twoFactorEnabled" boolean DEFAULT false NOT NULL,
	"twoFactorSecret" text,
	"payoutDetails" json,
	"notificationPrefs" json,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);

CREATE TABLE IF NOT EXISTS "sessions" (
	"sessionToken" varchar(255) PRIMARY KEY NOT NULL,
	"userId" varchar(191) NOT NULL,
	"expires" timestamp with time zone NOT NULL
);

CREATE TABLE IF NOT EXISTS "verificationTokens" (
	"identifier" varchar(191) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "verificationTokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);

CREATE TABLE IF NOT EXISTS "plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(32) NOT NULL,
	"minimumDepositCents" integer NOT NULL,
	"maximumDepositCents" integer,
	"minRoiBps" integer NOT NULL,
	"maxRoiBps" integer NOT NULL,
	"active" integer DEFAULT 1 NOT NULL
);

CREATE TABLE IF NOT EXISTS "investorAccounts" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"investorId" varchar(191) NOT NULL,
	"planId" integer NOT NULL,
	"principalCents" integer DEFAULT 0 NOT NULL,
	"balanceCents" integer DEFAULT 0 NOT NULL,
	"status" varchar(24) DEFAULT 'active' NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "traders" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"name" varchar(191) NOT NULL,
	"imageUrl" text,
	"imagePath" varchar(255),
	"specialty" varchar(100) NOT NULL,
	"winRateBps" integer DEFAULT 0 NOT NULL,
	"thirtyDayReturnBps" integer DEFAULT 0 NOT NULL,
	"riskLevel" integer DEFAULT 1 NOT NULL,
	"bio" text,
	"active" integer DEFAULT 1 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "deposits" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"investorId" varchar(191) NOT NULL,
	"amountCents" integer NOT NULL,
	"method" varchar(16) NOT NULL,
	"proofPath" text,
	"planId" integer,
	"status" varchar(24) DEFAULT 'pending' NOT NULL,
	"reviewedBy" varchar(191),
	"reviewNote" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "roiEntries" (
	"id" serial PRIMARY KEY NOT NULL,
	"investorId" varchar(191) NOT NULL,
	"planId" integer NOT NULL,
	"percentageBps" integer NOT NULL,
	"profitCents" integer NOT NULL,
	"marketNote" text NOT NULL,
	"publishedBy" varchar(191) NOT NULL,
	"entryDate" timestamp with time zone DEFAULT now() NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "portfolioLedger" (
	"id" serial PRIMARY KEY NOT NULL,
	"investorId" varchar(191) NOT NULL,
	"type" varchar(32) NOT NULL,
	"amountCents" integer NOT NULL,
	"referenceId" varchar(191),
	"description" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" varchar(191) NOT NULL,
	"type" varchar(64) NOT NULL,
	"title" varchar(160) NOT NULL,
	"body" text NOT NULL,
	"relatedRewardId" integer,
	"isRead" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "referralLinks" (
	"id" serial PRIMARY KEY NOT NULL,
	"ownerId" varchar(191) NOT NULL,
	"code" varchar(64) NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "referralAttributions" (
	"id" serial PRIMARY KEY NOT NULL,
	"referrerId" varchar(191) NOT NULL,
	"referredInvestorId" varchar(191) NOT NULL,
	"linkId" integer NOT NULL,
	"status" varchar(24) DEFAULT 'active' NOT NULL,
	"attributedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "referralRewards" (
	"id" serial PRIMARY KEY NOT NULL,
	"attributionId" integer NOT NULL,
	"referrerId" varchar(191) NOT NULL,
	"referredInvestorId" varchar(191) NOT NULL,
	"qualifyingDepositId" varchar(191) NOT NULL,
	"idempotencyKey" varchar(191) NOT NULL,
	"qualifyingAmountCents" integer NOT NULL,
	"rewardAmountCents" integer NOT NULL,
	"status" varchar(24) DEFAULT 'available' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);

-- ── 0001: Deposits, KYC, Withdrawals, Instructions ────────────

CREATE TABLE IF NOT EXISTS "depositInstructions" (
	"id" serial PRIMARY KEY NOT NULL,
	"method" varchar(16) NOT NULL,
	"label" varchar(120) NOT NULL,
	"details" text NOT NULL,
	"qrPath" text,
	"active" integer DEFAULT 1 NOT NULL,
	"updatedBy" varchar(191) NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "kycApplications" (
	"id" serial PRIMARY KEY NOT NULL,
	"investorId" varchar(191) NOT NULL,
	"documentPath" text NOT NULL,
	"status" varchar(24) DEFAULT 'pending' NOT NULL,
	"reviewedBy" varchar(191),
	"reviewNote" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "investorWithdrawals" (
	"id" serial PRIMARY KEY NOT NULL,
	"investorId" varchar(191) NOT NULL,
	"amountCents" integer NOT NULL,
	"destinationType" varchar(16) NOT NULL,
	"destination" varchar(255) NOT NULL,
	"status" varchar(24) DEFAULT 'pending' NOT NULL,
	"reviewedBy" varchar(191),
	"reviewNote" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "referralWithdrawals" (
	"id" serial PRIMARY KEY NOT NULL,
	"investorId" varchar(191) NOT NULL,
	"amountCents" integer NOT NULL,
	"destinationType" varchar(16) NOT NULL,
	"destination" varchar(255) NOT NULL,
	"destinationDetails" text,
	"status" varchar(24) DEFAULT 'pending' NOT NULL,
	"reviewedBy" varchar(191),
	"reviewNote" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

-- ── 0002: Portfolio, Copy Trading, Swap, Push ─────────────────

CREATE TABLE IF NOT EXISTS "portfolioHoldings" (
	"id" serial PRIMARY KEY NOT NULL,
	"investorId" varchar(191) NOT NULL,
	"assetSymbol" varchar(16) NOT NULL,
	"assetName" varchar(100) NOT NULL,
	"quantity" varchar(64) DEFAULT '0' NOT NULL,
	"costBasisCents" integer DEFAULT 0 NOT NULL,
	"currentPriceCents" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "copyAllocations" (
	"id" serial PRIMARY KEY NOT NULL,
	"investorId" varchar(191) NOT NULL,
	"traderId" varchar(191) NOT NULL,
	"allocationCents" integer DEFAULT 0 NOT NULL,
	"status" varchar(24) DEFAULT 'active' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "swapTransactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"investorId" varchar(191) NOT NULL,
	"fromAsset" varchar(16) NOT NULL,
	"toAsset" varchar(16) NOT NULL,
	"fromAmount" varchar(64) NOT NULL,
	"toAmount" varchar(64) NOT NULL,
	"rate" varchar(64) NOT NULL,
	"feeCents" integer DEFAULT 0 NOT NULL,
	"status" varchar(24) DEFAULT 'completed' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "swapConfig" (
	"id" serial PRIMARY KEY NOT NULL,
	"fromAsset" varchar(16) NOT NULL,
	"toAsset" varchar(16) NOT NULL,
	"rateMultiplier" varchar(32) DEFAULT '1' NOT NULL,
	"feeBps" integer DEFAULT 50 NOT NULL,
	"active" integer DEFAULT 1 NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "pushSubscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" varchar(191) NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"userAgent" varchar(255),
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "recoveryCodes" (
  "id" serial PRIMARY KEY NOT NULL,
  "userId" varchar(191) NOT NULL,
  "codeHash" varchar(64) NOT NULL,
  "usedAt" timestamp with time zone,
  "createdAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "platformSettings" (
  "id" serial PRIMARY KEY NOT NULL,
  "settingKey" varchar(64) NOT NULL,
  "settingValue" json NOT NULL,
  "updatedBy" varchar(191) NOT NULL,
  "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

-- ── Indexes ────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS "accounts_user_idx" ON "accounts" USING btree ("userId");
CREATE INDEX IF NOT EXISTS "sessions_user_idx" ON "sessions" USING btree ("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "investor_accounts_investor_unique" ON "investorAccounts" USING btree ("investorId");
CREATE INDEX IF NOT EXISTS "deposits_investor_idx" ON "deposits" USING btree ("investorId");
CREATE INDEX IF NOT EXISTS "deposits_status_idx" ON "deposits" USING btree ("status");
CREATE UNIQUE INDEX IF NOT EXISTS "deposit_instructions_method_unique" ON "depositInstructions" USING btree ("method");
CREATE INDEX IF NOT EXISTS "kyc_applications_investor_idx" ON "kycApplications" USING btree ("investorId");
CREATE INDEX IF NOT EXISTS "kyc_applications_status_idx" ON "kycApplications" USING btree ("status");
CREATE INDEX IF NOT EXISTS "investor_withdrawals_investor_idx" ON "investorWithdrawals" USING btree ("investorId");
CREATE UNIQUE INDEX IF NOT EXISTS "referral_links_code_unique" ON "referralLinks" USING btree ("code");
CREATE INDEX IF NOT EXISTS "referral_links_owner_idx" ON "referralLinks" USING btree ("ownerId");
CREATE UNIQUE INDEX IF NOT EXISTS "referral_attributions_referred_unique" ON "referralAttributions" USING btree ("referredInvestorId");
CREATE INDEX IF NOT EXISTS "referral_attributions_referrer_idx" ON "referralAttributions" USING btree ("referrerId");
CREATE UNIQUE INDEX IF NOT EXISTS "referral_rewards_key_unique" ON "referralRewards" USING btree ("idempotencyKey");
CREATE INDEX IF NOT EXISTS "referral_rewards_referrer_idx" ON "referralRewards" USING btree ("referrerId");
CREATE INDEX IF NOT EXISTS "referral_withdrawals_investor_idx" ON "referralWithdrawals" USING btree ("investorId");
CREATE UNIQUE INDEX IF NOT EXISTS "roi_entries_investor_date_unique" ON "roiEntries" USING btree ("investorId","entryDate");
CREATE INDEX IF NOT EXISTS "roi_entries_investor_idx" ON "roiEntries" USING btree ("investorId");
CREATE INDEX IF NOT EXISTS "portfolio_ledger_investor_idx" ON "portfolioLedger" USING btree ("investorId");
CREATE UNIQUE INDEX IF NOT EXISTS "portfolio_ledger_reference_unique" ON "portfolioLedger" USING btree ("type","referenceId");
CREATE INDEX IF NOT EXISTS "notifications_user_idx" ON "notifications" USING btree ("userId");
CREATE INDEX IF NOT EXISTS "portfolio_holdings_investor_idx" ON "portfolioHoldings" USING btree ("investorId");
CREATE INDEX IF NOT EXISTS "portfolio_holdings_symbol_idx" ON "portfolioHoldings" USING btree ("assetSymbol");
CREATE INDEX IF NOT EXISTS "copy_allocations_investor_idx" ON "copyAllocations" USING btree ("investorId");
CREATE INDEX IF NOT EXISTS "copy_allocations_trader_idx" ON "copyAllocations" USING btree ("traderId");
CREATE UNIQUE INDEX IF NOT EXISTS "copy_allocations_investor_trader_unique" ON "copyAllocations" USING btree ("investorId","traderId");
CREATE INDEX IF NOT EXISTS "swap_transactions_investor_idx" ON "swapTransactions" USING btree ("investorId");
CREATE UNIQUE INDEX IF NOT EXISTS "swap_config_pair_unique" ON "swapConfig" USING btree ("fromAsset","toAsset");
CREATE INDEX IF NOT EXISTS "push_subscriptions_user_idx" ON "pushSubscriptions" USING btree ("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "push_subscriptions_endpoint_unique" ON "pushSubscriptions" USING btree ("endpoint");
CREATE INDEX IF NOT EXISTS "recovery_codes_user_idx" ON "recoveryCodes" USING btree ("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "recovery_codes_hash_unique" ON "recoveryCodes" USING btree ("codeHash");
CREATE UNIQUE INDEX IF NOT EXISTS "platform_settings_key_unique" ON "platformSettings" USING btree ("settingKey");

-- ── Seed Plans ─────────────────────────────────────────────────

INSERT INTO "plans" ("name", "minimumDepositCents", "maximumDepositCents", "minRoiBps", "maxRoiBps", "active")
VALUES
  ('Starter', 150000, 749999, 1500, 1500, 1),
  ('Growth', 750000, 4499999, 2500, 2500, 1),
  ('Elite', 4500000, NULL, 3500, 3500, 1)
ON CONFLICT DO NOTHING;
