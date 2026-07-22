import { and, desc, eq, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  approvals,
  closure,
  documents,
  executionActivities,
  executionFinancial,
  executionPurchases,
  initiation,
  monitoring,
  notifications,
  planning,
  planningActivities,
  preInitiation,
  projectMembers,
  projects,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

type UserRow = typeof users.$inferSelect;
type ProjectRow = typeof projects.$inferSelect;
type ProjectMemberRow = typeof projectMembers.$inferSelect;
type PreInitiationRow = typeof preInitiation.$inferSelect;
type InitiationRow = typeof initiation.$inferSelect;
type PlanningRow = typeof planning.$inferSelect;
type PlanningActivityRow = typeof planningActivities.$inferSelect;
type ExecutionPurchaseRow = typeof executionPurchases.$inferSelect;
type ExecutionFinancialRow = typeof executionFinancial.$inferSelect;
type ExecutionActivityRow = typeof executionActivities.$inferSelect;
type MonitoringRow = typeof monitoring.$inferSelect;
type ClosureRow = typeof closure.$inferSelect;
type DocumentRow = typeof documents.$inferSelect;
type ApprovalRow = typeof approvals.$inferSelect;
type NotificationRow = typeof notifications.$inferSelect;

const isDemoStoreEnabled = () =>
  process.env.NODE_ENV !== "production" && !ENV.databaseUrl;
const now = () => new Date();
const dateDaysAgo = (days: number) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000);
const dateDaysFromNow = (days: number) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000);

const demoUser: UserRow = {
  id: 1,
  openId: "demo-admin",
  name: "Usuário Demo",
  email: "demo@fiocruz.br",
  loginMethod: "demo",
  role: "admin",
  createdAt: dateDaysAgo(90),
  updatedAt: dateDaysAgo(1),
  lastSignedIn: now(),
};

let nextUserId = 2;
let nextProjectId = 4;
let nextProjectMemberId = 4;
let nextPreInitiationId = 2;
let nextInitiationId = 2;
let nextPlanningId = 2;
let nextPlanningActivityId = 3;
let nextPurchaseId = 2;
let nextFinancialId = 2;
let nextExecutionActivityId = 2;
let nextMonitoringId = 2;
let nextClosureId = 1;
let nextDocumentId = 2;
let nextApprovalId = 2;
let nextNotificationId = 2;

const memoryUsers: UserRow[] = [demoUser];

const memoryProjects: ProjectRow[] = [
  {
    id: 1,
    title: "Pesquisa em Saúde Pública Digital",
    description:
      "Projeto demonstrativo para acompanhamento de execução técnica, financeira e documental.",
    code: "FIO-DEMO-001",
    phase: "execution",
    status: "active",
    financingOrgan: "Ministério da Saúde",
    totalBudget: "1250000.00",
    executedBudget: "735000.00",
    startDate: dateDaysAgo(120),
    endDate: dateDaysFromNow(180),
    createdBy: 1,
    createdAt: dateDaysAgo(120),
    updatedAt: dateDaysAgo(2),
  },
  {
    id: 2,
    title: "Vigilância Epidemiológica Integrada",
    description:
      "Planejamento de indicadores, metas e cronograma para integração de bases institucionais.",
    code: "FIO-DEMO-002",
    phase: "planning",
    status: "active",
    financingOrgan: "Fiocruz",
    totalBudget: "640000.00",
    executedBudget: "0.00",
    startDate: dateDaysAgo(20),
    endDate: dateDaysFromNow(260),
    createdBy: 1,
    createdAt: dateDaysAgo(25),
    updatedAt: dateDaysAgo(1),
  },
  {
    id: 3,
    title: "Capacitação em Gestão de Projetos",
    description:
      "Estruturação inicial de proposta para capacitação de equipes técnicas e administrativas.",
    code: "FIO-DEMO-003",
    phase: "pre_initiation",
    status: "active",
    financingOrgan: "Escola Fiocruz de Governo",
    totalBudget: "180000.00",
    executedBudget: "0.00",
    startDate: null,
    endDate: null,
    createdBy: 1,
    createdAt: dateDaysAgo(8),
    updatedAt: dateDaysAgo(1),
  },
];

const memoryProjectMembers: ProjectMemberRow[] = [
  {
    id: 1,
    projectId: 1,
    userId: 1,
    role: "gestor",
    createdAt: dateDaysAgo(120),
  },
  {
    id: 2,
    projectId: 2,
    userId: 1,
    role: "gestor",
    createdAt: dateDaysAgo(25),
  },
  { id: 3, projectId: 3, userId: 1, role: "gestor", createdAt: dateDaysAgo(8) },
];

const memoryPreInitiations: PreInitiationRow[] = [
  {
    id: 1,
    projectId: 3,
    demandDescription:
      "Capacitar equipes para padronizar rotinas de gestão de projetos.",
    justification:
      "Reduzir retrabalho e aumentar rastreabilidade das entregas.",
    objectives: "Criar trilha de capacitação e materiais de apoio.",
    expectedResults:
      "Equipes aptas a registrar, acompanhar e encerrar projetos com consistência.",
    estimatedBudget: "180000.00",
    proposalStatus: "draft",
    validatedBy: null,
    validatedAt: null,
    validationNotes: null,
    createdAt: dateDaysAgo(8),
    updatedAt: dateDaysAgo(1),
  },
];

const memoryInitiations: InitiationRow[] = [
  {
    id: 1,
    projectId: 1,
    tedNumber: "TED-2026-001",
    tedSignedDate: dateDaysAgo(100),
    tedStatus: "signed_both",
    ordenadorDespesasId: 1,
    responsavelTecnicoId: 1,
    initialBudget: "1250000.00",
    budgetSource: "Termo de Execução Descentralizada",
    programCode: "10.571.5031",
    actionCode: "21BF",
    createdAt: dateDaysAgo(115),
    updatedAt: dateDaysAgo(80),
  },
];

const memoryPlannings: PlanningRow[] = [
  {
    id: 1,
    projectId: 2,
    technicalViability: "Equipe técnica definida e bases de dados mapeadas.",
    financialViability:
      "Orçamento estimado compatível com o plano de trabalho.",
    riskAnalysis: "Risco moderado em integração de dados legados.",
    internalApprovalStatus: "pending",
    internalApprovedBy: null,
    internalApprovedAt: null,
    financierApprovalStatus: "pending",
    financierApprovedBy: null,
    financierApprovedAt: null,
    createdAt: dateDaysAgo(20),
    updatedAt: dateDaysAgo(1),
  },
];

const memoryPlanningActivities: PlanningActivityRow[] = [
  {
    id: 1,
    projectId: 2,
    title: "Mapear fontes de dados",
    description: "Inventariar sistemas e responsáveis por cada base.",
    responsible: "Equipe técnica",
    startDate: dateDaysAgo(10),
    endDate: dateDaysFromNow(20),
    status: "in_progress",
    goal: "Catálogo inicial publicado",
    indicator: "Bases mapeadas",
    targetValue: "12",
    currentValue: "7",
    budget: "45000.00",
    order: 1,
    createdAt: dateDaysAgo(15),
    updatedAt: dateDaysAgo(1),
  },
  {
    id: 2,
    projectId: 2,
    title: "Definir indicadores",
    description: "Consolidar indicadores de acompanhamento do projeto.",
    responsible: "Coordenação",
    startDate: dateDaysFromNow(5),
    endDate: dateDaysFromNow(35),
    status: "pending",
    goal: "Painel de indicadores aprovado",
    indicator: "Indicadores homologados",
    targetValue: "8",
    currentValue: "0",
    budget: "30000.00",
    order: 2,
    createdAt: dateDaysAgo(12),
    updatedAt: dateDaysAgo(1),
  },
];

const memoryPurchases: ExecutionPurchaseRow[] = [
  {
    id: 1,
    projectId: 1,
    title: "Contratação de consultoria de dados",
    description: "Apoio especializado para modelagem dos indicadores.",
    purchaseType: "service",
    status: "approved",
    estimatedValue: "120000.00",
    finalValue: "118500.00",
    supplier: "Consultoria Saúde Dados Ltda.",
    requestedBy: 1,
    approvedBy: 1,
    approvedAt: dateDaysAgo(18),
    receivedAt: null,
    notes: "Processo aprovado para execução.",
    createdAt: dateDaysAgo(30),
    updatedAt: dateDaysAgo(18),
  },
];

const memoryFinancialRecords: ExecutionFinancialRow[] = [
  {
    id: 1,
    projectId: 1,
    type: "empenho",
    description: "Empenho inicial do TED",
    value: "735000.00",
    referenceNumber: "NE-2026-0001",
    issueDate: dateDaysAgo(60),
    dueDate: null,
    paidAt: null,
    supplier: "Fiocruz",
    status: "processed",
    notes: "Valor empenhado para execução inicial.",
    createdBy: 1,
    createdAt: dateDaysAgo(60),
    updatedAt: dateDaysAgo(40),
  },
];

const memoryExecutionActivities: ExecutionActivityRow[] = [
  {
    id: 1,
    projectId: 1,
    planningActivityId: null,
    title: "Implantar painel de acompanhamento",
    description: "Disponibilizar visão inicial dos indicadores do projeto.",
    responsible: "Núcleo de dados",
    executedAt: null,
    status: "in_progress",
    progressPercent: 65,
    notes: "Protótipo validado com a equipe.",
    createdAt: dateDaysAgo(45),
    updatedAt: dateDaysAgo(3),
  },
];

const memoryMonitoringReports: MonitoringRow[] = [
  {
    id: 1,
    projectId: 1,
    reportDate: dateDaysAgo(7),
    reportType: "progress",
    title: "Relatório mensal de execução",
    content:
      "Projeto evoluindo conforme cronograma, com atenção à etapa de homologação.",
    physicalProgress: 62,
    financialProgress: 58,
    qualityStatus: "on_track",
    issues: "Dependência de agenda para homologação final.",
    actions: "Agendar oficina de validação com áreas envolvidas.",
    createdBy: 1,
    createdAt: dateDaysAgo(7),
    updatedAt: dateDaysAgo(7),
  },
];

const memoryClosures: ClosureRow[] = [];

const memoryDocuments: DocumentRow[] = [
  {
    id: 1,
    projectId: 1,
    phase: "execution",
    title: "Plano de Trabalho",
    description: "Documento demonstrativo anexado ao projeto.",
    fileKey: "demo/plano-trabalho.pdf",
    fileUrl: "#",
    fileName: "plano-trabalho.pdf",
    fileSize: 245760,
    mimeType: "application/pdf",
    version: 1,
    isLatest: true,
    parentDocumentId: null,
    uploadedBy: 1,
    createdAt: dateDaysAgo(40),
    updatedAt: dateDaysAgo(40),
  },
];

const memoryApprovals: ApprovalRow[] = [
  {
    id: 1,
    projectId: 1,
    type: "purchase_approval",
    status: "pending",
    requestedBy: 1,
    requestedAt: dateDaysAgo(2),
    assignedTo: 1,
    decidedBy: null,
    decidedAt: null,
    notes: "Aprovação demonstrativa pendente.",
    referenceId: 1,
    createdAt: dateDaysAgo(2),
    updatedAt: dateDaysAgo(2),
  },
];

const memoryNotifications: NotificationRow[] = [
  {
    id: 1,
    userId: 1,
    projectId: 1,
    type: "approval_requested",
    title: "Aprovação pendente",
    message: "Há uma solicitação de compra aguardando decisão.",
    isRead: false,
    link: "/approvals",
    createdAt: dateDaysAgo(1),
  },
];

function assignDefined<T extends Record<string, unknown>>(
  target: T,
  data: Record<string, unknown>
) {
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      target[key as keyof T] = value as T[keyof T];
    }
  }
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  if (isDemoStoreEnabled()) {
    const existing = memoryUsers.find(u => u.openId === user.openId);
    if (existing) {
      assignDefined(existing, {
        name: user.name ?? existing.name,
        email: user.email ?? existing.email,
        loginMethod: user.loginMethod ?? existing.loginMethod,
        role: user.role ?? existing.role,
        lastSignedIn: user.lastSignedIn ?? now(),
        updatedAt: now(),
      });
      return;
    }

    memoryUsers.push({
      id: nextUserId++,
      openId: user.openId,
      name: user.name ?? null,
      email: user.email ?? null,
      loginMethod: user.loginMethod ?? "demo",
      role: user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user"),
      createdAt: now(),
      updatedAt: now(),
      lastSignedIn: user.lastSignedIn ?? now(),
    });
    return;
  }

  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  type TextField = (typeof textFields)[number];
  const assignNullable = (field: TextField) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  };
  textFields.forEach(assignNullable);
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db
    .insert(users)
    .values(values)
    .onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  if (isDemoStoreEnabled()) return memoryUsers.find(u => u.openId === openId);
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  if (isDemoStoreEnabled())
    return [...memoryUsers].sort((a, b) =>
      (a.name ?? "").localeCompare(b.name ?? "")
    );
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(users.name);
}

// ─── Projects ─────────────────────────────────────────────────────────────────
export async function createProject(data: typeof projects.$inferInsert) {
  if (isDemoStoreEnabled()) {
    const id = nextProjectId++;
    const project: ProjectRow = {
      id,
      title: data.title,
      description: data.description ?? null,
      code: data.code ?? `FIO-DEMO-${String(id).padStart(3, "0")}`,
      phase: data.phase ?? "pre_initiation",
      status: data.status ?? "active",
      financingOrgan: data.financingOrgan ?? null,
      totalBudget: data.totalBudget ?? null,
      executedBudget: data.executedBudget ?? "0.00",
      startDate: data.startDate ?? null,
      endDate: data.endDate ?? null,
      createdBy: data.createdBy,
      createdAt: now(),
      updatedAt: now(),
    };
    memoryProjects.unshift(project);
    return id;
  }

  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const [result] = await db.insert(projects).values(data);
  return result.insertId;
}

export async function getProjectsByUser(userId: number) {
  if (isDemoStoreEnabled()) {
    const ids = new Set(
      memoryProjectMembers
        .filter(m => m.userId === userId)
        .map(m => m.projectId)
    );
    return memoryProjects
      .filter(p => p.createdBy === userId || ids.has(p.id))
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  const db = await getDb();
  if (!db) return [];
  const memberProjects = await db
    .select({ projectId: projectMembers.projectId })
    .from(projectMembers)
    .where(eq(projectMembers.userId, userId));
  const ids = memberProjects.map(m => m.projectId);
  const createdProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.createdBy, userId))
    .orderBy(desc(projects.updatedAt));
  if (ids.length === 0) return createdProjects;
  const memberProjectsList = await db
    .select()
    .from(projects)
    .orderBy(desc(projects.updatedAt));
  const all = [...createdProjects, ...memberProjectsList];
  const unique = Array.from(new Map(all.map(p => [p.id, p])).values());
  return unique;
}

export async function getAllProjects() {
  if (isDemoStoreEnabled()) {
    return [...memoryProjects].sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }

  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects).orderBy(desc(projects.updatedAt));
}

export async function getProjectById(id: number) {
  if (isDemoStoreEnabled()) return memoryProjects.find(p => p.id === id);
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);
  return result[0];
}

export async function updateProject(
  id: number,
  data: Partial<typeof projects.$inferInsert>
) {
  if (isDemoStoreEnabled()) {
    const project = memoryProjects.find(p => p.id === id);
    if (!project) throw new Error("Project not found");
    assignDefined(project, { ...data, updatedAt: now() });
    return;
  }

  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(projects).set(data).where(eq(projects.id, id));
}

// ─── Project Members ──────────────────────────────────────────────────────────
export async function addProjectMember(
  data: typeof projectMembers.$inferInsert
) {
  if (isDemoStoreEnabled()) {
    memoryProjectMembers.push({
      id: nextProjectMemberId++,
      projectId: data.projectId,
      userId: data.userId,
      role: data.role,
      createdAt: now(),
    });
    return;
  }

  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(projectMembers).values(data);
}

export async function getProjectMembers(projectId: number) {
  if (isDemoStoreEnabled()) {
    return memoryProjectMembers
      .filter(m => m.projectId === projectId)
      .map(m => ({
        ...m,
        user: memoryUsers.find(u => u.id === m.userId),
      }));
  }

  const db = await getDb();
  if (!db) return [];
  const members = await db
    .select()
    .from(projectMembers)
    .where(eq(projectMembers.projectId, projectId));
  const userIds = members.map(m => m.userId);
  if (userIds.length === 0) return [];
  const userList = await db.select().from(users);
  return members.map(m => ({
    ...m,
    user: userList.find(u => u.id === m.userId),
  }));
}

// ─── Pre-Initiation ───────────────────────────────────────────────────────────
export async function upsertPreInitiation(
  data: typeof preInitiation.$inferInsert
) {
  if (isDemoStoreEnabled()) {
    const existing = memoryPreInitiations.find(
      item => item.projectId === data.projectId
    );
    if (existing) {
      assignDefined(existing, { ...data, updatedAt: now() });
    } else {
      memoryPreInitiations.push({
        id: nextPreInitiationId++,
        projectId: data.projectId!,
        demandDescription: data.demandDescription ?? null,
        justification: data.justification ?? null,
        objectives: data.objectives ?? null,
        expectedResults: data.expectedResults ?? null,
        estimatedBudget: data.estimatedBudget ?? null,
        proposalStatus: data.proposalStatus ?? "draft",
        validatedBy: data.validatedBy ?? null,
        validatedAt: data.validatedAt ?? null,
        validationNotes: data.validationNotes ?? null,
        createdAt: now(),
        updatedAt: now(),
      });
    }
    return;
  }

  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const existing = await db
    .select()
    .from(preInitiation)
    .where(eq(preInitiation.projectId, data.projectId!))
    .limit(1);
  if (existing.length > 0) {
    await db
      .update(preInitiation)
      .set(data)
      .where(eq(preInitiation.projectId, data.projectId!));
  } else {
    await db.insert(preInitiation).values(data);
  }
}

export async function getPreInitiation(projectId: number) {
  if (isDemoStoreEnabled()) {
    return memoryPreInitiations.find(item => item.projectId === projectId);
  }

  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(preInitiation)
    .where(eq(preInitiation.projectId, projectId))
    .limit(1);
  return result[0];
}

// ─── Initiation ───────────────────────────────────────────────────────────────
export async function upsertInitiation(data: typeof initiation.$inferInsert) {
  if (isDemoStoreEnabled()) {
    const existing = memoryInitiations.find(
      item => item.projectId === data.projectId
    );
    if (existing) {
      assignDefined(existing, { ...data, updatedAt: now() });
    } else {
      memoryInitiations.push({
        id: nextInitiationId++,
        projectId: data.projectId!,
        tedNumber: data.tedNumber ?? null,
        tedSignedDate: data.tedSignedDate ?? null,
        tedStatus: data.tedStatus ?? "pending",
        ordenadorDespesasId: data.ordenadorDespesasId ?? null,
        responsavelTecnicoId: data.responsavelTecnicoId ?? null,
        initialBudget: data.initialBudget ?? null,
        budgetSource: data.budgetSource ?? null,
        programCode: data.programCode ?? null,
        actionCode: data.actionCode ?? null,
        createdAt: now(),
        updatedAt: now(),
      });
    }
    return;
  }

  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const existing = await db
    .select()
    .from(initiation)
    .where(eq(initiation.projectId, data.projectId!))
    .limit(1);
  if (existing.length > 0) {
    await db
      .update(initiation)
      .set(data)
      .where(eq(initiation.projectId, data.projectId!));
  } else {
    await db.insert(initiation).values(data);
  }
}

export async function getInitiation(projectId: number) {
  if (isDemoStoreEnabled()) {
    return memoryInitiations.find(item => item.projectId === projectId);
  }

  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(initiation)
    .where(eq(initiation.projectId, projectId))
    .limit(1);
  return result[0];
}

// ─── Planning ─────────────────────────────────────────────────────────────────
export async function upsertPlanning(data: typeof planning.$inferInsert) {
  if (isDemoStoreEnabled()) {
    const existing = memoryPlannings.find(
      item => item.projectId === data.projectId
    );
    if (existing) {
      assignDefined(existing, { ...data, updatedAt: now() });
    } else {
      memoryPlannings.push({
        id: nextPlanningId++,
        projectId: data.projectId!,
        technicalViability: data.technicalViability ?? null,
        financialViability: data.financialViability ?? null,
        riskAnalysis: data.riskAnalysis ?? null,
        internalApprovalStatus: data.internalApprovalStatus ?? "pending",
        internalApprovedBy: data.internalApprovedBy ?? null,
        internalApprovedAt: data.internalApprovedAt ?? null,
        financierApprovalStatus: data.financierApprovalStatus ?? "pending",
        financierApprovedBy: data.financierApprovedBy ?? null,
        financierApprovedAt: data.financierApprovedAt ?? null,
        createdAt: now(),
        updatedAt: now(),
      });
    }
    return;
  }

  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const existing = await db
    .select()
    .from(planning)
    .where(eq(planning.projectId, data.projectId!))
    .limit(1);
  if (existing.length > 0) {
    await db
      .update(planning)
      .set(data)
      .where(eq(planning.projectId, data.projectId!));
  } else {
    await db.insert(planning).values(data);
  }
}

export async function getPlanning(projectId: number) {
  if (isDemoStoreEnabled()) {
    return memoryPlannings.find(item => item.projectId === projectId);
  }

  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(planning)
    .where(eq(planning.projectId, projectId))
    .limit(1);
  return result[0];
}

export async function createPlanningActivity(
  data: typeof planningActivities.$inferInsert
) {
  if (isDemoStoreEnabled()) {
    const id = nextPlanningActivityId++;
    memoryPlanningActivities.push({
      id,
      projectId: data.projectId,
      title: data.title,
      description: data.description ?? null,
      responsible: data.responsible ?? null,
      startDate: data.startDate ?? null,
      endDate: data.endDate ?? null,
      status: data.status ?? "pending",
      goal: data.goal ?? null,
      indicator: data.indicator ?? null,
      targetValue: data.targetValue ?? null,
      currentValue: data.currentValue ?? null,
      budget: data.budget ?? null,
      order: data.order ?? 0,
      createdAt: now(),
      updatedAt: now(),
    });
    return id;
  }

  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const [result] = await db.insert(planningActivities).values(data);
  return result.insertId;
}

export async function getPlanningActivities(projectId: number) {
  if (isDemoStoreEnabled()) {
    return memoryPlanningActivities
      .filter(item => item.projectId === projectId)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(planningActivities)
    .where(eq(planningActivities.projectId, projectId))
    .orderBy(planningActivities.order);
}

export async function updatePlanningActivity(
  id: number,
  data: Partial<typeof planningActivities.$inferInsert>
) {
  if (isDemoStoreEnabled()) {
    const activity = memoryPlanningActivities.find(item => item.id === id);
    if (!activity) throw new Error("Planning activity not found");
    assignDefined(activity, { ...data, updatedAt: now() });
    return;
  }

  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db
    .update(planningActivities)
    .set(data)
    .where(eq(planningActivities.id, id));
}

export async function deletePlanningActivity(id: number) {
  if (isDemoStoreEnabled()) {
    const index = memoryPlanningActivities.findIndex(item => item.id === id);
    if (index >= 0) memoryPlanningActivities.splice(index, 1);
    return;
  }

  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(planningActivities).where(eq(planningActivities.id, id));
}

// ─── Execution Purchases ──────────────────────────────────────────────────────
export async function createPurchase(
  data: typeof executionPurchases.$inferInsert
) {
  if (isDemoStoreEnabled()) {
    const id = nextPurchaseId++;
    memoryPurchases.push({
      id,
      projectId: data.projectId,
      title: data.title,
      description: data.description ?? null,
      purchaseType: data.purchaseType ?? "material",
      status: data.status ?? "requested",
      estimatedValue: data.estimatedValue ?? null,
      finalValue: data.finalValue ?? null,
      supplier: data.supplier ?? null,
      requestedBy: data.requestedBy ?? null,
      approvedBy: data.approvedBy ?? null,
      approvedAt: data.approvedAt ?? null,
      receivedAt: data.receivedAt ?? null,
      notes: data.notes ?? null,
      createdAt: now(),
      updatedAt: now(),
    });
    return id;
  }

  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const [result] = await db.insert(executionPurchases).values(data);
  return result.insertId;
}

export async function getPurchases(projectId: number) {
  if (isDemoStoreEnabled()) {
    return memoryPurchases
      .filter(item => item.projectId === projectId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(executionPurchases)
    .where(eq(executionPurchases.projectId, projectId))
    .orderBy(desc(executionPurchases.createdAt));
}

export async function updatePurchase(
  id: number,
  data: Partial<typeof executionPurchases.$inferInsert>
) {
  if (isDemoStoreEnabled()) {
    const purchase = memoryPurchases.find(item => item.id === id);
    if (!purchase) throw new Error("Purchase not found");
    assignDefined(purchase, { ...data, updatedAt: now() });
    return;
  }

  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db
    .update(executionPurchases)
    .set(data)
    .where(eq(executionPurchases.id, id));
}

// ─── Execution Financial ──────────────────────────────────────────────────────
export async function createFinancialRecord(
  data: typeof executionFinancial.$inferInsert
) {
  if (isDemoStoreEnabled()) {
    const id = nextFinancialId++;
    memoryFinancialRecords.push({
      id,
      projectId: data.projectId,
      type: data.type,
      description: data.description,
      value: data.value,
      referenceNumber: data.referenceNumber ?? null,
      issueDate: data.issueDate ?? null,
      dueDate: data.dueDate ?? null,
      paidAt: data.paidAt ?? null,
      supplier: data.supplier ?? null,
      status: data.status ?? "pending",
      notes: data.notes ?? null,
      createdBy: data.createdBy ?? null,
      createdAt: now(),
      updatedAt: now(),
    });
    return id;
  }

  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const [result] = await db.insert(executionFinancial).values(data);
  return result.insertId;
}

export async function getFinancialRecords(projectId: number) {
  if (isDemoStoreEnabled()) {
    return memoryFinancialRecords
      .filter(item => item.projectId === projectId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(executionFinancial)
    .where(eq(executionFinancial.projectId, projectId))
    .orderBy(desc(executionFinancial.createdAt));
}

export async function updateFinancialRecord(
  id: number,
  data: Partial<typeof executionFinancial.$inferInsert>
) {
  if (isDemoStoreEnabled()) {
    const record = memoryFinancialRecords.find(item => item.id === id);
    if (!record) throw new Error("Financial record not found");
    assignDefined(record, { ...data, updatedAt: now() });
    return;
  }

  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db
    .update(executionFinancial)
    .set(data)
    .where(eq(executionFinancial.id, id));
}

// ─── Execution Activities ─────────────────────────────────────────────────────
export async function createExecutionActivity(
  data: typeof executionActivities.$inferInsert
) {
  if (isDemoStoreEnabled()) {
    const id = nextExecutionActivityId++;
    memoryExecutionActivities.push({
      id,
      projectId: data.projectId,
      planningActivityId: data.planningActivityId ?? null,
      title: data.title,
      description: data.description ?? null,
      responsible: data.responsible ?? null,
      executedAt: data.executedAt ?? null,
      status: data.status ?? "pending",
      progressPercent: data.progressPercent ?? 0,
      notes: data.notes ?? null,
      createdAt: now(),
      updatedAt: now(),
    });
    return id;
  }

  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const [result] = await db.insert(executionActivities).values(data);
  return result.insertId;
}

export async function getExecutionActivities(projectId: number) {
  if (isDemoStoreEnabled()) {
    return memoryExecutionActivities
      .filter(item => item.projectId === projectId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(executionActivities)
    .where(eq(executionActivities.projectId, projectId))
    .orderBy(desc(executionActivities.createdAt));
}

export async function updateExecutionActivity(
  id: number,
  data: Partial<typeof executionActivities.$inferInsert>
) {
  if (isDemoStoreEnabled()) {
    const activity = memoryExecutionActivities.find(item => item.id === id);
    if (!activity) throw new Error("Execution activity not found");
    assignDefined(activity, { ...data, updatedAt: now() });
    return;
  }

  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db
    .update(executionActivities)
    .set(data)
    .where(eq(executionActivities.id, id));
}

// ─── Monitoring ───────────────────────────────────────────────────────────────
export async function createMonitoringReport(
  data: typeof monitoring.$inferInsert
) {
  if (isDemoStoreEnabled()) {
    const id = nextMonitoringId++;
    memoryMonitoringReports.push({
      id,
      projectId: data.projectId,
      reportDate: data.reportDate ?? now(),
      reportType: data.reportType ?? "progress",
      title: data.title,
      content: data.content ?? null,
      physicalProgress: data.physicalProgress ?? 0,
      financialProgress: data.financialProgress ?? 0,
      qualityStatus: data.qualityStatus ?? "on_track",
      issues: data.issues ?? null,
      actions: data.actions ?? null,
      createdBy: data.createdBy ?? null,
      createdAt: now(),
      updatedAt: now(),
    });
    return id;
  }

  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const [result] = await db.insert(monitoring).values(data);
  return result.insertId;
}

export async function getMonitoringReports(projectId: number) {
  if (isDemoStoreEnabled()) {
    return memoryMonitoringReports
      .filter(item => item.projectId === projectId)
      .sort(
        (a, b) =>
          (b.reportDate?.getTime() ?? 0) - (a.reportDate?.getTime() ?? 0)
      );
  }

  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(monitoring)
    .where(eq(monitoring.projectId, projectId))
    .orderBy(desc(monitoring.reportDate));
}

export async function updateMonitoringReport(
  id: number,
  data: Partial<typeof monitoring.$inferInsert>
) {
  if (isDemoStoreEnabled()) {
    const report = memoryMonitoringReports.find(item => item.id === id);
    if (!report) throw new Error("Monitoring report not found");
    assignDefined(report, { ...data, updatedAt: now() });
    return;
  }

  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(monitoring).set(data).where(eq(monitoring.id, id));
}

// ─── Closure ──────────────────────────────────────────────────────────────────
export async function upsertClosure(data: typeof closure.$inferInsert) {
  if (isDemoStoreEnabled()) {
    const existing = memoryClosures.find(
      item => item.projectId === data.projectId
    );
    if (existing) {
      assignDefined(existing, { ...data, updatedAt: now() });
    } else {
      memoryClosures.push({
        id: nextClosureId++,
        projectId: data.projectId!,
        finalReportStatus: data.finalReportStatus ?? "pending",
        finalReportContent: data.finalReportContent ?? null,
        accountingStatus: data.accountingStatus ?? "pending",
        accountingNotes: data.accountingNotes ?? null,
        opinionStatus: data.opinionStatus ?? "pending",
        opinionBy: data.opinionBy ?? null,
        opinionAt: data.opinionAt ?? null,
        opinionNotes: data.opinionNotes ?? null,
        administrativeClosureAt: data.administrativeClosureAt ?? null,
        lessonsLearned: data.lessonsLearned ?? null,
        createdAt: now(),
        updatedAt: now(),
      });
    }
    return;
  }

  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const existing = await db
    .select()
    .from(closure)
    .where(eq(closure.projectId, data.projectId!))
    .limit(1);
  if (existing.length > 0) {
    await db
      .update(closure)
      .set(data)
      .where(eq(closure.projectId, data.projectId!));
  } else {
    await db.insert(closure).values(data);
  }
}

export async function getClosure(projectId: number) {
  if (isDemoStoreEnabled()) {
    return memoryClosures.find(item => item.projectId === projectId);
  }

  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(closure)
    .where(eq(closure.projectId, projectId))
    .limit(1);
  return result[0];
}

// ─── Documents ────────────────────────────────────────────────────────────────
export async function createDocument(data: typeof documents.$inferInsert) {
  if (isDemoStoreEnabled()) {
    const id = nextDocumentId++;
    memoryDocuments.push({
      id,
      projectId: data.projectId,
      phase: data.phase ?? "general",
      title: data.title,
      description: data.description ?? null,
      fileKey: data.fileKey ?? null,
      fileUrl: data.fileUrl ?? null,
      fileName: data.fileName ?? null,
      fileSize: data.fileSize ?? null,
      mimeType: data.mimeType ?? null,
      version: data.version ?? 1,
      isLatest: data.isLatest ?? true,
      parentDocumentId: data.parentDocumentId ?? null,
      uploadedBy: data.uploadedBy ?? null,
      createdAt: now(),
      updatedAt: now(),
    });
    return id;
  }

  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const [result] = await db.insert(documents).values(data);
  return result.insertId;
}

export async function getDocuments(projectId: number, phase?: string) {
  if (isDemoStoreEnabled()) {
    return memoryDocuments
      .filter(
        item =>
          item.projectId === projectId &&
          item.isLatest &&
          (!phase || item.phase === phase)
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  const db = await getDb();
  if (!db) return [];
  if (phase) {
    return db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.projectId, projectId),
          eq(documents.isLatest, true),
          eq(
            documents.phase,
            phase as
              | "pre_initiation"
              | "initiation"
              | "planning"
              | "execution"
              | "monitoring"
              | "closure"
              | "general"
          )
        )
      )
      .orderBy(desc(documents.createdAt));
  }
  return db
    .select()
    .from(documents)
    .where(
      and(eq(documents.projectId, projectId), eq(documents.isLatest, true))
    )
    .orderBy(desc(documents.createdAt));
}

export async function getDocumentVersions(parentId: number) {
  if (isDemoStoreEnabled()) {
    return memoryDocuments
      .filter(
        item => item.id === parentId || item.parentDocumentId === parentId
      )
      .sort((a, b) => (b.version ?? 0) - (a.version ?? 0));
  }

  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(documents)
    .where(
      or(eq(documents.id, parentId), eq(documents.parentDocumentId, parentId))
    )
    .orderBy(desc(documents.version));
}

// ─── Approvals ────────────────────────────────────────────────────────────────
export async function createApproval(data: typeof approvals.$inferInsert) {
  if (isDemoStoreEnabled()) {
    const id = nextApprovalId++;
    memoryApprovals.push({
      id,
      projectId: data.projectId,
      type: data.type,
      status: data.status ?? "pending",
      requestedBy: data.requestedBy ?? null,
      requestedAt: data.requestedAt ?? now(),
      assignedTo: data.assignedTo ?? 1,
      decidedBy: data.decidedBy ?? null,
      decidedAt: data.decidedAt ?? null,
      notes: data.notes ?? null,
      referenceId: data.referenceId ?? null,
      createdAt: now(),
      updatedAt: now(),
    });
    return id;
  }

  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const [result] = await db.insert(approvals).values(data);
  return result.insertId;
}

export async function getApprovals(projectId: number) {
  if (isDemoStoreEnabled()) {
    return memoryApprovals
      .filter(item => item.projectId === projectId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(approvals)
    .where(eq(approvals.projectId, projectId))
    .orderBy(desc(approvals.createdAt));
}

export async function getPendingApprovals(userId: number) {
  if (isDemoStoreEnabled()) {
    return memoryApprovals
      .filter(
        item =>
          item.status === "pending" &&
          (item.assignedTo === userId || item.assignedTo === null)
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(approvals)
    .where(
      and(eq(approvals.assignedTo, userId), eq(approvals.status, "pending"))
    )
    .orderBy(desc(approvals.createdAt));
}

export async function updateApproval(
  id: number,
  data: Partial<typeof approvals.$inferInsert>
) {
  if (isDemoStoreEnabled()) {
    const approval = memoryApprovals.find(item => item.id === id);
    if (!approval) throw new Error("Approval not found");
    assignDefined(approval, { ...data, updatedAt: now() });
    return;
  }

  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(approvals).set(data).where(eq(approvals.id, id));
}

// ─── Notifications ────────────────────────────────────────────────────────────
export async function createNotification(
  data: typeof notifications.$inferInsert
) {
  if (isDemoStoreEnabled()) {
    memoryNotifications.unshift({
      id: nextNotificationId++,
      userId: data.userId,
      projectId: data.projectId ?? null,
      type: data.type,
      title: data.title,
      message: data.message ?? null,
      isRead: data.isRead ?? false,
      link: data.link ?? null,
      createdAt: now(),
    });
    return;
  }

  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(notifications).values(data);
}

export async function getUserNotifications(userId: number) {
  if (isDemoStoreEnabled()) {
    return memoryNotifications
      .filter(item => item.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 50);
  }

  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(50);
}

export async function markNotificationRead(id: number) {
  if (isDemoStoreEnabled()) {
    const notification = memoryNotifications.find(item => item.id === id);
    if (notification) notification.isRead = true;
    return;
  }

  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, id));
}

export async function markAllNotificationsRead(userId: number) {
  if (isDemoStoreEnabled()) {
    memoryNotifications
      .filter(item => item.userId === userId)
      .forEach(item => {
        item.isRead = true;
      });
    return;
  }

  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(eq(notifications.userId, userId), eq(notifications.isRead, false))
    );
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export async function getDashboardStats() {
  if (isDemoStoreEnabled()) {
    return {
      total: memoryProjects.length,
      pre_initiation: memoryProjects.filter(p => p.phase === "pre_initiation")
        .length,
      initiation: memoryProjects.filter(p => p.phase === "initiation").length,
      planning: memoryProjects.filter(p => p.phase === "planning").length,
      execution: memoryProjects.filter(p => p.phase === "execution").length,
      monitoring: memoryProjects.filter(p => p.phase === "monitoring").length,
      closure: memoryProjects.filter(p => p.phase === "closure").length,
      completed: memoryProjects.filter(p => p.phase === "completed").length,
      cancelled: memoryProjects.filter(p => p.status === "cancelled").length,
    };
  }

  const db = await getDb();
  if (!db) return null;
  const allProjects = await db.select().from(projects);
  const stats = {
    total: allProjects.length,
    pre_initiation: allProjects.filter(p => p.phase === "pre_initiation")
      .length,
    initiation: allProjects.filter(p => p.phase === "initiation").length,
    planning: allProjects.filter(p => p.phase === "planning").length,
    execution: allProjects.filter(p => p.phase === "execution").length,
    monitoring: allProjects.filter(p => p.phase === "monitoring").length,
    closure: allProjects.filter(p => p.phase === "closure").length,
    completed: allProjects.filter(p => p.phase === "completed").length,
    cancelled: allProjects.filter(p => p.status === "cancelled").length,
  };
  return stats;
}
