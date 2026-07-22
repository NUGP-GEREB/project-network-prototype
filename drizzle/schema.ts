import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Projects ─────────────────────────────────────────────────────────────────
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  code: varchar("code", { length: 64 }),
  phase: mysqlEnum("phase", [
    "pre_initiation",
    "initiation",
    "planning",
    "execution",
    "monitoring",
    "closure",
    "completed",
    "cancelled",
  ])
    .default("pre_initiation")
    .notNull(),
  status: mysqlEnum("status", ["active", "paused", "completed", "cancelled"])
    .default("active")
    .notNull(),
  financingOrgan: varchar("financingOrgan", { length: 255 }),
  totalBudget: decimal("totalBudget", { precision: 15, scale: 2 }),
  executedBudget: decimal("executedBudget", { precision: 15, scale: 2 }).default("0"),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

// ─── Project Members ──────────────────────────────────────────────────────────
export const projectMembers = mysqlTable("project_members", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", [
    "ordenador_despesas",
    "responsavel_tecnico",
    "equipe",
    "financiador",
    "gestor",
  ]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProjectMember = typeof projectMembers.$inferSelect;

// ─── Pre-Initiation ───────────────────────────────────────────────────────────
export const preInitiation = mysqlTable("pre_initiation", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull().unique(),
  demandDescription: text("demandDescription"),
  justification: text("justification"),
  objectives: text("objectives"),
  expectedResults: text("expectedResults"),
  estimatedBudget: decimal("estimatedBudget", { precision: 15, scale: 2 }),
  proposalStatus: mysqlEnum("proposalStatus", [
    "draft",
    "submitted",
    "under_review",
    "approved",
    "rejected",
  ]).default("draft"),
  validatedBy: int("validatedBy"),
  validatedAt: timestamp("validatedAt"),
  validationNotes: text("validationNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PreInitiation = typeof preInitiation.$inferSelect;

// ─── Initiation ───────────────────────────────────────────────────────────────
export const initiation = mysqlTable("initiation", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull().unique(),
  tedNumber: varchar("tedNumber", { length: 64 }),
  tedSignedDate: timestamp("tedSignedDate"),
  tedStatus: mysqlEnum("tedStatus", [
    "pending",
    "generated",
    "signed_fiocruz",
    "signed_both",
    "published",
  ]).default("pending"),
  ordenadorDespesasId: int("ordenadorDespesasId"),
  responsavelTecnicoId: int("responsavelTecnicoId"),
  initialBudget: decimal("initialBudget", { precision: 15, scale: 2 }),
  budgetSource: varchar("budgetSource", { length: 255 }),
  programCode: varchar("programCode", { length: 64 }),
  actionCode: varchar("actionCode", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Initiation = typeof initiation.$inferSelect;

// ─── Planning ─────────────────────────────────────────────────────────────────
export const planning = mysqlTable("planning", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull().unique(),
  technicalViability: text("technicalViability"),
  financialViability: text("financialViability"),
  riskAnalysis: text("riskAnalysis"),
  internalApprovalStatus: mysqlEnum("internalApprovalStatus", [
    "pending",
    "approved",
    "rejected",
  ]).default("pending"),
  internalApprovedBy: int("internalApprovedBy"),
  internalApprovedAt: timestamp("internalApprovedAt"),
  financierApprovalStatus: mysqlEnum("financierApprovalStatus", [
    "pending",
    "approved",
    "rejected",
  ]).default("pending"),
  financierApprovedBy: int("financierApprovedBy"),
  financierApprovedAt: timestamp("financierApprovedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Planning = typeof planning.$inferSelect;

// ─── Planning Activities ──────────────────────────────────────────────────────
export const planningActivities = mysqlTable("planning_activities", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  responsible: varchar("responsible", { length: 255 }),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "cancelled"])
    .default("pending")
    .notNull(),
  goal: text("goal"),
  indicator: varchar("indicator", { length: 255 }),
  targetValue: varchar("targetValue", { length: 64 }),
  currentValue: varchar("currentValue", { length: 64 }),
  budget: decimal("budget", { precision: 15, scale: 2 }),
  order: int("order").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PlanningActivity = typeof planningActivities.$inferSelect;

// ─── Execution Purchases ──────────────────────────────────────────────────────
export const executionPurchases = mysqlTable("execution_purchases", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  purchaseType: mysqlEnum("purchaseType", [
    "material",
    "service",
    "equipment",
    "other",
  ]).default("material"),
  status: mysqlEnum("status", [
    "requested",
    "quoted",
    "bidding",
    "approved",
    "received",
    "paid",
    "cancelled",
  ]).default("requested"),
  estimatedValue: decimal("estimatedValue", { precision: 15, scale: 2 }),
  finalValue: decimal("finalValue", { precision: 15, scale: 2 }),
  supplier: varchar("supplier", { length: 255 }),
  requestedBy: int("requestedBy"),
  approvedBy: int("approvedBy"),
  approvedAt: timestamp("approvedAt"),
  receivedAt: timestamp("receivedAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ExecutionPurchase = typeof executionPurchases.$inferSelect;

// ─── Execution Financial ──────────────────────────────────────────────────────
export const executionFinancial = mysqlTable("execution_financial", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  type: mysqlEnum("type", ["empenho", "liquidacao", "pagamento", "nota_fiscal", "devolucao"])
    .notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  value: decimal("value", { precision: 15, scale: 2 }).notNull(),
  referenceNumber: varchar("referenceNumber", { length: 128 }),
  issueDate: timestamp("issueDate"),
  dueDate: timestamp("dueDate"),
  paidAt: timestamp("paidAt"),
  supplier: varchar("supplier", { length: 255 }),
  status: mysqlEnum("status", ["pending", "processed", "cancelled"]).default("pending"),
  notes: text("notes"),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ExecutionFinancial = typeof executionFinancial.$inferSelect;

// ─── Execution Activities ─────────────────────────────────────────────────────
export const executionActivities = mysqlTable("execution_activities", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  planningActivityId: int("planningActivityId"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  responsible: varchar("responsible", { length: 255 }),
  executedAt: timestamp("executedAt"),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "cancelled"])
    .default("pending"),
  progressPercent: int("progressPercent").default(0),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ExecutionActivity = typeof executionActivities.$inferSelect;

// ─── Monitoring ───────────────────────────────────────────────────────────────
export const monitoring = mysqlTable("monitoring", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  reportDate: timestamp("reportDate").defaultNow(),
  reportType: mysqlEnum("reportType", ["progress", "financial", "quality", "risk"])
    .default("progress"),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  physicalProgress: int("physicalProgress").default(0),
  financialProgress: int("financialProgress").default(0),
  qualityStatus: mysqlEnum("qualityStatus", ["on_track", "at_risk", "off_track"])
    .default("on_track"),
  issues: text("issues"),
  actions: text("actions"),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Monitoring = typeof monitoring.$inferSelect;

// ─── Closure ──────────────────────────────────────────────────────────────────
export const closure = mysqlTable("closure", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull().unique(),
  finalReportStatus: mysqlEnum("finalReportStatus", [
    "pending",
    "draft",
    "submitted",
    "under_review",
    "approved",
    "rejected",
  ]).default("pending"),
  finalReportContent: text("finalReportContent"),
  accountingStatus: mysqlEnum("accountingStatus", [
    "pending",
    "submitted",
    "approved",
    "rejected",
    "in_diligence",
  ]).default("pending"),
  accountingNotes: text("accountingNotes"),
  opinionStatus: mysqlEnum("opinionStatus", ["pending", "favorable", "unfavorable"])
    .default("pending"),
  opinionBy: int("opinionBy"),
  opinionAt: timestamp("opinionAt"),
  opinionNotes: text("opinionNotes"),
  administrativeClosureAt: timestamp("administrativeClosureAt"),
  lessonsLearned: text("lessonsLearned"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Closure = typeof closure.$inferSelect;

// ─── Documents ────────────────────────────────────────────────────────────────
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  phase: mysqlEnum("phase", [
    "pre_initiation",
    "initiation",
    "planning",
    "execution",
    "monitoring",
    "closure",
    "general",
  ]).default("general"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  fileKey: varchar("fileKey", { length: 512 }),
  fileUrl: varchar("fileUrl", { length: 1024 }),
  fileName: varchar("fileName", { length: 255 }),
  fileSize: int("fileSize"),
  mimeType: varchar("mimeType", { length: 128 }),
  version: int("version").default(1),
  isLatest: boolean("isLatest").default(true),
  parentDocumentId: int("parentDocumentId"),
  uploadedBy: int("uploadedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Document = typeof documents.$inferSelect;

// ─── Approvals ────────────────────────────────────────────────────────────────
export const approvals = mysqlTable("approvals", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  type: mysqlEnum("type", [
    "proposal_validation",
    "ted_approval",
    "planning_internal",
    "planning_financier",
    "purchase_approval",
    "final_report",
    "accounting_approval",
    "closure",
  ]).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "cancelled"])
    .default("pending"),
  requestedBy: int("requestedBy"),
  requestedAt: timestamp("requestedAt").defaultNow(),
  assignedTo: int("assignedTo"),
  decidedBy: int("decidedBy"),
  decidedAt: timestamp("decidedAt"),
  notes: text("notes"),
  referenceId: int("referenceId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Approval = typeof approvals.$inferSelect;

// ─── Notifications ────────────────────────────────────────────────────────────
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  projectId: int("projectId"),
  type: varchar("type", { length: 64 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  isRead: boolean("isRead").default(false),
  link: varchar("link", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
