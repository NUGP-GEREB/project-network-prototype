CREATE TABLE `approvals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`type` enum('proposal_validation','ted_approval','planning_internal','planning_financier','purchase_approval','final_report','accounting_approval','closure') NOT NULL,
	`status` enum('pending','approved','rejected','cancelled') DEFAULT 'pending',
	`requestedBy` int,
	`requestedAt` timestamp DEFAULT (now()),
	`assignedTo` int,
	`decidedBy` int,
	`decidedAt` timestamp,
	`notes` text,
	`referenceId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `approvals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `closure` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`finalReportStatus` enum('pending','draft','submitted','under_review','approved','rejected') DEFAULT 'pending',
	`finalReportContent` text,
	`accountingStatus` enum('pending','submitted','approved','rejected','in_diligence') DEFAULT 'pending',
	`accountingNotes` text,
	`opinionStatus` enum('pending','favorable','unfavorable') DEFAULT 'pending',
	`opinionBy` int,
	`opinionAt` timestamp,
	`opinionNotes` text,
	`administrativeClosureAt` timestamp,
	`lessonsLearned` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `closure_id` PRIMARY KEY(`id`),
	CONSTRAINT `closure_projectId_unique` UNIQUE(`projectId`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`phase` enum('pre_initiation','initiation','planning','execution','monitoring','closure','general') DEFAULT 'general',
	`title` varchar(255) NOT NULL,
	`description` text,
	`fileKey` varchar(512),
	`fileUrl` varchar(1024),
	`fileName` varchar(255),
	`fileSize` int,
	`mimeType` varchar(128),
	`version` int DEFAULT 1,
	`isLatest` boolean DEFAULT true,
	`parentDocumentId` int,
	`uploadedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `execution_activities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`planningActivityId` int,
	`title` varchar(255) NOT NULL,
	`description` text,
	`responsible` varchar(255),
	`executedAt` timestamp,
	`status` enum('pending','in_progress','completed','cancelled') DEFAULT 'pending',
	`progressPercent` int DEFAULT 0,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `execution_activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `execution_financial` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`type` enum('empenho','liquidacao','pagamento','nota_fiscal','devolucao') NOT NULL,
	`description` varchar(255) NOT NULL,
	`value` decimal(15,2) NOT NULL,
	`referenceNumber` varchar(128),
	`issueDate` timestamp,
	`dueDate` timestamp,
	`paidAt` timestamp,
	`supplier` varchar(255),
	`status` enum('pending','processed','cancelled') DEFAULT 'pending',
	`notes` text,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `execution_financial_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `execution_purchases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`purchaseType` enum('material','service','equipment','other') DEFAULT 'material',
	`status` enum('requested','quoted','bidding','approved','received','paid','cancelled') DEFAULT 'requested',
	`estimatedValue` decimal(15,2),
	`finalValue` decimal(15,2),
	`supplier` varchar(255),
	`requestedBy` int,
	`approvedBy` int,
	`approvedAt` timestamp,
	`receivedAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `execution_purchases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `initiation` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`tedNumber` varchar(64),
	`tedSignedDate` timestamp,
	`tedStatus` enum('pending','generated','signed_fiocruz','signed_both','published') DEFAULT 'pending',
	`ordenadorDespesasId` int,
	`responsavelTecnicoId` int,
	`initialBudget` decimal(15,2),
	`budgetSource` varchar(255),
	`programCode` varchar(64),
	`actionCode` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `initiation_id` PRIMARY KEY(`id`),
	CONSTRAINT `initiation_projectId_unique` UNIQUE(`projectId`)
);
--> statement-breakpoint
CREATE TABLE `monitoring` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`reportDate` timestamp DEFAULT (now()),
	`reportType` enum('progress','financial','quality','risk') DEFAULT 'progress',
	`title` varchar(255) NOT NULL,
	`content` text,
	`physicalProgress` int DEFAULT 0,
	`financialProgress` int DEFAULT 0,
	`qualityStatus` enum('on_track','at_risk','off_track') DEFAULT 'on_track',
	`issues` text,
	`actions` text,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `monitoring_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`projectId` int,
	`type` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text,
	`isRead` boolean DEFAULT false,
	`link` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `planning` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`technicalViability` text,
	`financialViability` text,
	`riskAnalysis` text,
	`internalApprovalStatus` enum('pending','approved','rejected') DEFAULT 'pending',
	`internalApprovedBy` int,
	`internalApprovedAt` timestamp,
	`financierApprovalStatus` enum('pending','approved','rejected') DEFAULT 'pending',
	`financierApprovedBy` int,
	`financierApprovedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `planning_id` PRIMARY KEY(`id`),
	CONSTRAINT `planning_projectId_unique` UNIQUE(`projectId`)
);
--> statement-breakpoint
CREATE TABLE `planning_activities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`responsible` varchar(255),
	`startDate` timestamp,
	`endDate` timestamp,
	`status` enum('pending','in_progress','completed','cancelled') NOT NULL DEFAULT 'pending',
	`goal` text,
	`indicator` varchar(255),
	`targetValue` varchar(64),
	`currentValue` varchar(64),
	`budget` decimal(15,2),
	`order` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `planning_activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pre_initiation` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`demandDescription` text,
	`justification` text,
	`objectives` text,
	`expectedResults` text,
	`estimatedBudget` decimal(15,2),
	`proposalStatus` enum('draft','submitted','under_review','approved','rejected') DEFAULT 'draft',
	`validatedBy` int,
	`validatedAt` timestamp,
	`validationNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pre_initiation_id` PRIMARY KEY(`id`),
	CONSTRAINT `pre_initiation_projectId_unique` UNIQUE(`projectId`)
);
--> statement-breakpoint
CREATE TABLE `project_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('ordenador_despesas','responsavel_tecnico','equipe','financiador','gestor') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `project_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`code` varchar(64),
	`phase` enum('pre_initiation','initiation','planning','execution','monitoring','closure','completed','cancelled') NOT NULL DEFAULT 'pre_initiation',
	`status` enum('active','paused','completed','cancelled') NOT NULL DEFAULT 'active',
	`financingOrgan` varchar(255),
	`totalBudget` decimal(15,2),
	`executedBudget` decimal(15,2) DEFAULT '0',
	`startDate` timestamp,
	`endDate` timestamp,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
