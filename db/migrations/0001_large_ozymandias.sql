CREATE TABLE `deposits` (
	`id` varchar(191) NOT NULL,
	`investorId` varchar(191) NOT NULL,
	`amountCents` int NOT NULL,
	`status` enum('pending','completed','rejected') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `deposits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `deposits_investor_idx` ON `deposits` (`investorId`);