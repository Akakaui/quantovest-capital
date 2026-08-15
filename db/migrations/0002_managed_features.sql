CREATE TABLE `plans` (
  `id` int AUTO_INCREMENT NOT NULL,
  `name` varchar(32) NOT NULL,
  `minimumDepositCents` int NOT NULL,
  `maximumDepositCents` int,
  `minRoiBps` int NOT NULL,
  `maxRoiBps` int NOT NULL,
  `active` int NOT NULL DEFAULT 1,
  CONSTRAINT `plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `investorAccounts` (
  `id` varchar(191) NOT NULL,
  `investorId` varchar(191) NOT NULL,
  `planId` int NOT NULL,
  `principalCents` int NOT NULL DEFAULT 0,
  `balanceCents` int NOT NULL DEFAULT 0,
  `status` enum('active','suspended','closed') NOT NULL DEFAULT 'active',
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `investorAccounts_id` PRIMARY KEY(`id`),
  CONSTRAINT `investor_accounts_investor_unique` UNIQUE(`investorId`)
);
--> statement-breakpoint
CREATE TABLE `traders` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `imageUrl` text,
  `imagePath` varchar(255),
  `specialty` varchar(100) NOT NULL,
  `winRateBps` int NOT NULL DEFAULT 0,
  `thirtyDayReturnBps` int NOT NULL DEFAULT 0,
  `riskLevel` int NOT NULL DEFAULT 1,
  `bio` text,
  `active` int NOT NULL DEFAULT 1,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `traders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `roiEntries` (
  `id` int AUTO_INCREMENT NOT NULL,
  `investorId` varchar(191) NOT NULL,
  `planId` int NOT NULL,
  `percentageBps` int NOT NULL,
  `profitCents` int NOT NULL,
  `marketNote` text NOT NULL,
  `publishedBy` varchar(191) NOT NULL,
  `entryDate` timestamp NOT NULL DEFAULT (now()),
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `roiEntries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `portfolioLedger` (
  `id` int AUTO_INCREMENT NOT NULL,
  `investorId` varchar(191) NOT NULL,
  `type` enum('deposit','roi','withdrawal','referral_reward','adjustment') NOT NULL,
  `amountCents` int NOT NULL,
  `referenceId` varchar(191),
  `description` text,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `portfolioLedger_id` PRIMARY KEY(`id`),
  CONSTRAINT `portfolio_ledger_reference_unique` UNIQUE(`type`,`referenceId`)
);
--> statement-breakpoint
INSERT INTO `plans` (`name`,`minimumDepositCents`,`maximumDepositCents`,`minRoiBps`,`maxRoiBps`,`active`) VALUES ('Starter',50000,499999,800,1200,1),('Growth',500000,1499999,1400,1800,1),('Elite',1500000,NULL,2000,2800,1);
