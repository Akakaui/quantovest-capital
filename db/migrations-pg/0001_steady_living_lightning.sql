CREATE TABLE "depositInstructions" (
	"id" serial PRIMARY KEY NOT NULL,
	"method" varchar(16) NOT NULL,
	"label" varchar(120) NOT NULL,
	"details" text NOT NULL,
	"qrPath" text,
	"active" integer DEFAULT 1 NOT NULL,
	"updatedBy" varchar(191) NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "investorWithdrawals" (
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
--> statement-breakpoint
CREATE TABLE "kycApplications" (
	"id" serial PRIMARY KEY NOT NULL,
	"investorId" varchar(191) NOT NULL,
	"documentPath" text NOT NULL,
	"status" varchar(24) DEFAULT 'pending' NOT NULL,
	"reviewedBy" varchar(191),
	"reviewNote" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "deposits" ADD COLUMN "method" varchar(16) NOT NULL;--> statement-breakpoint
ALTER TABLE "deposits" ADD COLUMN "proofPath" text;--> statement-breakpoint
ALTER TABLE "deposits" ADD COLUMN "planId" integer;--> statement-breakpoint
ALTER TABLE "deposits" ADD COLUMN "reviewedBy" varchar(191);--> statement-breakpoint
ALTER TABLE "deposits" ADD COLUMN "reviewNote" text;--> statement-breakpoint
ALTER TABLE "deposits" ADD COLUMN "updatedAt" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "deposit_instructions_method_unique" ON "depositInstructions" USING btree ("method");--> statement-breakpoint
CREATE INDEX "investor_withdrawals_investor_idx" ON "investorWithdrawals" USING btree ("investorId");--> statement-breakpoint
CREATE INDEX "kyc_applications_investor_idx" ON "kycApplications" USING btree ("investorId");--> statement-breakpoint
CREATE INDEX "kyc_applications_status_idx" ON "kycApplications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "deposits_status_idx" ON "deposits" USING btree ("status");