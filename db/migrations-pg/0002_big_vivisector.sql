CREATE TABLE "copyAllocations" (
	"id" serial PRIMARY KEY NOT NULL,
	"investorId" varchar(191) NOT NULL,
	"traderId" varchar(191) NOT NULL,
	"allocationCents" integer DEFAULT 0 NOT NULL,
	"status" varchar(24) DEFAULT 'active' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolioHoldings" (
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
--> statement-breakpoint
CREATE TABLE "pushSubscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" varchar(191) NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"userAgent" varchar(255),
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "swapConfig" (
	"id" serial PRIMARY KEY NOT NULL,
	"fromAsset" varchar(16) NOT NULL,
	"toAsset" varchar(16) NOT NULL,
	"rateMultiplier" varchar(32) DEFAULT '1' NOT NULL,
	"feeBps" integer DEFAULT 50 NOT NULL,
	"active" integer DEFAULT 1 NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "swapTransactions" (
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
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone" varchar(32);--> statement-breakpoint
CREATE INDEX "copy_allocations_investor_idx" ON "copyAllocations" USING btree ("investorId");--> statement-breakpoint
CREATE INDEX "copy_allocations_trader_idx" ON "copyAllocations" USING btree ("traderId");--> statement-breakpoint
CREATE UNIQUE INDEX "copy_allocations_investor_trader_unique" ON "copyAllocations" USING btree ("investorId","traderId");--> statement-breakpoint
CREATE INDEX "portfolio_holdings_investor_idx" ON "portfolioHoldings" USING btree ("investorId");--> statement-breakpoint
CREATE INDEX "portfolio_holdings_symbol_idx" ON "portfolioHoldings" USING btree ("assetSymbol");--> statement-breakpoint
CREATE INDEX "push_subscriptions_user_idx" ON "pushSubscriptions" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "push_subscriptions_endpoint_unique" ON "pushSubscriptions" USING btree ("endpoint");--> statement-breakpoint
CREATE UNIQUE INDEX "swap_config_pair_unique" ON "swapConfig" USING btree ("fromAsset","toAsset");--> statement-breakpoint
CREATE INDEX "swap_transactions_investor_idx" ON "swapTransactions" USING btree ("investorId");