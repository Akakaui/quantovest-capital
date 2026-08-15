CREATE TABLE `accounts` (
	`userId` varchar(191) NOT NULL,
	`type` varchar(32) NOT NULL,
	`provider` varchar(191) NOT NULL,
	`providerAccountId` varchar(191) NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` int,
	`token_type` varchar(64),
	`scope` varchar(255),
	`id_token` text,
	`session_state` varchar(255),
	CONSTRAINT `accounts_provider_providerAccountId_pk` PRIMARY KEY(`provider`,`providerAccountId`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(191) NOT NULL,
	`type` varchar(64) NOT NULL,
	`title` varchar(160) NOT NULL,
	`body` text NOT NULL,
	`relatedRewardId` int,
	`isRead` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referralAttributions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referrerId` varchar(191) NOT NULL,
	`referredInvestorId` varchar(191) NOT NULL,
	`linkId` int NOT NULL,
	`status` enum('active','reversed') NOT NULL DEFAULT 'active',
	`attributedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `referralAttributions_id` PRIMARY KEY(`id`),
	CONSTRAINT `referral_attributions_referred_unique` UNIQUE(`referredInvestorId`)
);
--> statement-breakpoint
CREATE TABLE `referralLinks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` varchar(191) NOT NULL,
	`code` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `referralLinks_id` PRIMARY KEY(`id`),
	CONSTRAINT `referral_links_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `referralRewards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`attributionId` int NOT NULL,
	`referrerId` varchar(191) NOT NULL,
	`referredInvestorId` varchar(191) NOT NULL,
	`qualifyingDepositId` varchar(191) NOT NULL,
	`idempotencyKey` varchar(191) NOT NULL,
	`qualifyingAmountCents` int NOT NULL,
	`rewardAmountCents` int NOT NULL,
	`status` enum('available','held','paid','reversed') NOT NULL DEFAULT 'available',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `referralRewards_id` PRIMARY KEY(`id`),
	CONSTRAINT `referral_rewards_key_unique` UNIQUE(`idempotencyKey`)
);
--> statement-breakpoint
CREATE TABLE `referralWithdrawals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`investorId` varchar(191) NOT NULL,
	`amountCents` int NOT NULL,
	`destinationType` enum('bank','crypto') NOT NULL,
	`destination` varchar(255) NOT NULL,
	`destinationDetails` text,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`reviewedBy` varchar(191),
	`reviewNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referralWithdrawals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`sessionToken` varchar(255) NOT NULL,
	`userId` varchar(191) NOT NULL,
	`expires` timestamp NOT NULL,
	CONSTRAINT `sessions_sessionToken` PRIMARY KEY(`sessionToken`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(191) NOT NULL,
	`name` varchar(191),
	`email` varchar(191),
	`emailVerified` timestamp,
	`image` text,
	`role` enum('investor','admin') NOT NULL DEFAULT 'investor',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `verificationTokens` (
	`identifier` varchar(191) NOT NULL,
	`token` varchar(255) NOT NULL,
	`expires` timestamp NOT NULL,
	CONSTRAINT `verificationTokens_identifier_token_pk` PRIMARY KEY(`identifier`,`token`)
);
--> statement-breakpoint
CREATE INDEX `accounts_user_idx` ON `accounts` (`userId`);--> statement-breakpoint
CREATE INDEX `notifications_user_idx` ON `notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `referral_attributions_referrer_idx` ON `referralAttributions` (`referrerId`);--> statement-breakpoint
CREATE INDEX `referral_links_owner_idx` ON `referralLinks` (`ownerId`);--> statement-breakpoint
CREATE INDEX `referral_rewards_referrer_idx` ON `referralRewards` (`referrerId`);--> statement-breakpoint
CREATE INDEX `referral_withdrawals_investor_idx` ON `referralWithdrawals` (`investorId`);--> statement-breakpoint
CREATE INDEX `sessions_user_idx` ON `sessions` (`userId`);