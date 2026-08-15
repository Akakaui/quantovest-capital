CREATE TABLE "accounts" (
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
--> statement-breakpoint
CREATE TABLE "deposits" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"investorId" varchar(191) NOT NULL,
	"amountCents" integer NOT NULL,
	"status" varchar(24) DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "investorAccounts" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"investorId" varchar(191) NOT NULL,
	"planId" integer NOT NULL,
	"principalCents" integer DEFAULT 0 NOT NULL,
	"balanceCents" integer DEFAULT 0 NOT NULL,
	"status" varchar(24) DEFAULT 'active' NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" varchar(191) NOT NULL,
	"type" varchar(64) NOT NULL,
	"title" varchar(160) NOT NULL,
	"body" text NOT NULL,
	"relatedRewardId" integer,
	"isRead" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(32) NOT NULL,
	"minimumDepositCents" integer NOT NULL,
	"maximumDepositCents" integer,
	"minRoiBps" integer NOT NULL,
	"maxRoiBps" integer NOT NULL,
	"active" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolioLedger" (
	"id" serial PRIMARY KEY NOT NULL,
	"investorId" varchar(191) NOT NULL,
	"type" varchar(32) NOT NULL,
	"amountCents" integer NOT NULL,
	"referenceId" varchar(191),
	"description" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referralAttributions" (
	"id" serial PRIMARY KEY NOT NULL,
	"referrerId" varchar(191) NOT NULL,
	"referredInvestorId" varchar(191) NOT NULL,
	"linkId" integer NOT NULL,
	"status" varchar(24) DEFAULT 'active' NOT NULL,
	"attributedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referralLinks" (
	"id" serial PRIMARY KEY NOT NULL,
	"ownerId" varchar(191) NOT NULL,
	"code" varchar(64) NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referralRewards" (
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
--> statement-breakpoint
CREATE TABLE "referralWithdrawals" (
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
--> statement-breakpoint
CREATE TABLE "roiEntries" (
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
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sessionToken" varchar(255) PRIMARY KEY NOT NULL,
	"userId" varchar(191) NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "traders" (
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
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"name" varchar(191),
	"email" varchar(191),
	"emailVerified" timestamp with time zone,
	"image" text,
	"role" varchar(24) DEFAULT 'investor' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verificationTokens" (
	"identifier" varchar(191) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "verificationTokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE INDEX "accounts_user_idx" ON "accounts" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "deposits_investor_idx" ON "deposits" USING btree ("investorId");--> statement-breakpoint
CREATE UNIQUE INDEX "investor_accounts_investor_unique" ON "investorAccounts" USING btree ("investorId");--> statement-breakpoint
CREATE INDEX "notifications_user_idx" ON "notifications" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "portfolio_ledger_investor_idx" ON "portfolioLedger" USING btree ("investorId");--> statement-breakpoint
CREATE UNIQUE INDEX "portfolio_ledger_reference_unique" ON "portfolioLedger" USING btree ("type","referenceId");--> statement-breakpoint
CREATE UNIQUE INDEX "referral_attributions_referred_unique" ON "referralAttributions" USING btree ("referredInvestorId");--> statement-breakpoint
CREATE INDEX "referral_attributions_referrer_idx" ON "referralAttributions" USING btree ("referrerId");--> statement-breakpoint
CREATE UNIQUE INDEX "referral_links_code_unique" ON "referralLinks" USING btree ("code");--> statement-breakpoint
CREATE INDEX "referral_links_owner_idx" ON "referralLinks" USING btree ("ownerId");--> statement-breakpoint
CREATE UNIQUE INDEX "referral_rewards_key_unique" ON "referralRewards" USING btree ("idempotencyKey");--> statement-breakpoint
CREATE INDEX "referral_rewards_referrer_idx" ON "referralRewards" USING btree ("referrerId");--> statement-breakpoint
CREATE INDEX "referral_withdrawals_investor_idx" ON "referralWithdrawals" USING btree ("investorId");--> statement-breakpoint
CREATE UNIQUE INDEX "roi_entries_investor_date_unique" ON "roiEntries" USING btree ("investorId","entryDate");--> statement-breakpoint
CREATE INDEX "roi_entries_investor_idx" ON "roiEntries" USING btree ("investorId");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("userId");