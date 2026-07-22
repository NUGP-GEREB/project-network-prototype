type StaticUser = {
  id: number;
  openId: string;
  name: string;
  email: string;
  loginMethod: string;
  role: "admin" | "user";
  createdAt: string;
  updatedAt: string;
  lastSignedIn: string;
};

type StaticProject = {
  id: number;
  title: string;
  description: string | null;
  code: string;
  phase:
    | "pre_initiation"
    | "initiation"
    | "planning"
    | "execution"
    | "monitoring"
    | "closure"
    | "completed"
    | "cancelled";
  status: "active" | "paused" | "completed" | "cancelled";
  financingOrgan: string | null;
  totalBudget: string | null;
  executedBudget: string | null;
  startDate: string | null;
  endDate: string | null;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
};

type StaticStore = {
  users: any[];
  projects: any[];
  projectMembers: any[];
  preInitiation: any[];
  initiation: any[];
  planning: any[];
  planningActivities: any[];
  purchases: any[];
  financial: any[];
  executionActivities: any[];
  monitoring: any[];
  closure: any[];
  documents: any[];
  approvals: any[];
  notifications: any[];
};

const AUTH_KEY = "fiocruz-static-demo-auth";
const STORE_KEY = "fiocruz-static-demo-store";

const nowIso = () => new Date().toISOString();
const daysFromNow = (days: number) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

export const staticDemoUser: StaticUser = {
  id: 1,
  openId: "demo-admin",
  name: "Usuário Demo",
  email: "demo@fiocruz.br",
  loginMethod: "demo",
  role: "admin",
  createdAt: "2026-04-23T00:00:00.000Z",
  updatedAt: nowIso(),
  lastSignedIn: nowIso(),
};

export function isStaticDemoMode() {
  if (import.meta.env.VITE_STATIC_DEMO === "true") return true;
  if (typeof window === "undefined") return false;
  return window.location.hostname.endsWith(".github.io");
}

export function isStaticDemoAuthenticated() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(AUTH_KEY) === "true";
}

export function setStaticDemoAuthenticated(value: boolean) {
  if (typeof window === "undefined") return;
  if (value) {
    window.localStorage.setItem(AUTH_KEY, "true");
  } else {
    window.localStorage.removeItem(AUTH_KEY);
  }
}

function createInitialStore() {
  const projects: StaticProject[] = [
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
      startDate: daysFromNow(-120),
      endDate: daysFromNow(180),
      createdBy: 1,
      createdAt: daysFromNow(-120),
      updatedAt: daysFromNow(-2),
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
      startDate: daysFromNow(-20),
      endDate: daysFromNow(260),
      createdBy: 1,
      createdAt: daysFromNow(-25),
      updatedAt: daysFromNow(-1),
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
      createdAt: daysFromNow(-8),
      updatedAt: daysFromNow(-1),
    },
  ];

  return {
    users: [staticDemoUser],
    projects,
    projectMembers: [
      { id: 1, projectId: 1, userId: 1, role: "gestor", createdAt: daysFromNow(-120) },
      { id: 2, projectId: 2, userId: 1, role: "gestor", createdAt: daysFromNow(-25) },
      { id: 3, projectId: 3, userId: 1, role: "gestor", createdAt: daysFromNow(-8) },
    ],
    preInitiation: [
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
        validationNotes: null,
        validatedBy: null,
        validatedAt: null,
        createdAt: daysFromNow(-8),
        updatedAt: daysFromNow(-1),
      },
    ],
    initiation: [
      {
        id: 1,
        projectId: 1,
        tedNumber: "TED-2026-001",
        tedSignedDate: daysFromNow(-100),
        tedStatus: "signed_both",
        ordenadorDespesasId: 1,
        responsavelTecnicoId: 1,
        initialBudget: "1250000.00",
        budgetSource: "Termo de Execução Descentralizada",
        programCode: "10.571.5031",
        actionCode: "21BF",
        createdAt: daysFromNow(-115),
        updatedAt: daysFromNow(-80),
      },
    ],
    planning: [
      {
        id: 1,
        projectId: 2,
        technicalViability: "Equipe técnica definida e bases de dados mapeadas.",
        financialViability: "Orçamento estimado compatível com o plano de trabalho.",
        riskAnalysis: "Risco moderado em integração de dados legados.",
        internalApprovalStatus: "pending",
        internalApprovedBy: null,
        internalApprovedAt: null,
        financierApprovalStatus: "pending",
        financierApprovedBy: null,
        financierApprovedAt: null,
        createdAt: daysFromNow(-20),
        updatedAt: daysFromNow(-1),
      },
    ],
    planningActivities: [
      {
        id: 1,
        projectId: 2,
        title: "Mapear fontes de dados",
        description: "Inventariar sistemas e responsáveis por cada base.",
        responsible: "Equipe técnica",
        startDate: daysFromNow(-10),
        endDate: daysFromNow(20),
        status: "in_progress",
        goal: "Catálogo inicial publicado",
        indicator: "Bases mapeadas",
        targetValue: "12",
        currentValue: "7",
        budget: "45000.00",
        order: 1,
        createdAt: daysFromNow(-15),
        updatedAt: daysFromNow(-1),
      },
    ],
    purchases: [
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
        approvedAt: daysFromNow(-18),
        receivedAt: null,
        notes: "Processo aprovado para execução.",
        createdAt: daysFromNow(-30),
        updatedAt: daysFromNow(-18),
      },
    ],
    financial: [
      {
        id: 1,
        projectId: 1,
        type: "empenho",
        description: "Empenho inicial do TED",
        value: "735000.00",
        referenceNumber: "NE-2026-0001",
        issueDate: daysFromNow(-60),
        dueDate: null,
        paidAt: null,
        supplier: "Fiocruz",
        status: "processed",
        notes: "Valor empenhado para execução inicial.",
        createdBy: 1,
        createdAt: daysFromNow(-60),
        updatedAt: daysFromNow(-40),
      },
    ],
    executionActivities: [
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
        createdAt: daysFromNow(-45),
        updatedAt: daysFromNow(-3),
      },
    ],
    monitoring: [
      {
        id: 1,
        projectId: 1,
        reportDate: daysFromNow(-7),
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
        createdAt: daysFromNow(-7),
        updatedAt: daysFromNow(-7),
      },
    ],
    closure: [] as any[],
    documents: [
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
        createdAt: daysFromNow(-40),
        updatedAt: daysFromNow(-40),
      },
    ],
    approvals: [
      {
        id: 1,
        projectId: 1,
        type: "purchase_approval",
        status: "pending",
        requestedBy: 1,
        requestedAt: daysFromNow(-2),
        assignedTo: 1,
        decidedBy: null,
        decidedAt: null,
        notes: "Aprovação demonstrativa pendente.",
        referenceId: 1,
        createdAt: daysFromNow(-2),
        updatedAt: daysFromNow(-2),
      },
    ],
    notifications: [
      {
        id: 1,
        userId: 1,
        projectId: 1,
        type: "approval_requested",
        title: "Aprovação pendente",
        message: "Há uma solicitação de compra aguardando decisão.",
        isRead: false,
        link: "/approvals",
        createdAt: daysFromNow(-1),
      },
    ],
  };
}

function getStore(): StaticStore {
  if (typeof window === "undefined") return createInitialStore();

  const stored = window.localStorage.getItem(STORE_KEY);
  if (!stored) {
    const initial = createInitialStore();
    window.localStorage.setItem(STORE_KEY, JSON.stringify(initial));
    return initial;
  }

  try {
    return JSON.parse(stored);
  } catch {
    const initial = createInitialStore();
    window.localStorage.setItem(STORE_KEY, JSON.stringify(initial));
    return initial;
  }
}

function saveStore(store: StaticStore) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
  }
}

function nextId(items: Array<{ id: number }>) {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

function assignDefined(target: Record<string, unknown>, data: Record<string, unknown>) {
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) target[key] = value;
  }
}

function dashboardStats(projects: StaticProject[]) {
  return {
    total: projects.length,
    pre_initiation: projects.filter(p => p.phase === "pre_initiation").length,
    initiation: projects.filter(p => p.phase === "initiation").length,
    planning: projects.filter(p => p.phase === "planning").length,
    execution: projects.filter(p => p.phase === "execution").length,
    monitoring: projects.filter(p => p.phase === "monitoring").length,
    closure: projects.filter(p => p.phase === "closure").length,
    completed: projects.filter(p => p.phase === "completed").length,
    cancelled: projects.filter(p => p.status === "cancelled").length,
  };
}

function upsertByProjectId(items: any[], input: any) {
  const existing = items.find(item => item.projectId === input.projectId);
  if (existing) {
    assignDefined(existing, { ...input, updatedAt: nowIso() });
    return existing;
  }

  const item = {
    id: nextId(items),
    ...input,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  items.push(item);
  return item;
}

export async function handleStaticDemoOperation(path: string, input: unknown) {
  const store = getStore();
  const data = (input ?? {}) as any;
  const projectId = Number(data.projectId);

  switch (path) {
    case "auth.me":
      return isStaticDemoAuthenticated() ? staticDemoUser : null;
    case "auth.demoLogin":
      if (data.email === "demo@fiocruz.br" && data.password === "demo123") {
        setStaticDemoAuthenticated(true);
        return { success: true, user: staticDemoUser };
      }
      throw new Error("Credenciais inválidas.");
    case "auth.logout":
      setStaticDemoAuthenticated(false);
      return { success: true };
    case "users.list":
      return store.users;
    case "projects.dashboard":
      return dashboardStats(store.projects);
    case "projects.list":
      return store.projects;
    case "projects.getById":
      return store.projects.find(project => project.id === Number(data.id)) ?? null;
    case "projects.create": {
      const id = nextId(store.projects);
      store.projects.unshift({
        id,
        title: data.title,
        description: data.description ?? null,
        code: `FIO-DEMO-${String(id).padStart(3, "0")}`,
        phase: "pre_initiation",
        status: "active",
        financingOrgan: data.financingOrgan ?? null,
        totalBudget: data.totalBudget ?? null,
        executedBudget: "0.00",
        startDate: data.startDate || null,
        endDate: data.endDate || null,
        createdBy: 1,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      });
      saveStore(store);
      return { id };
    }
    case "projects.update": {
      const project = store.projects.find(item => item.id === Number(data.id));
      if (project) assignDefined(project as any, { ...data, updatedAt: nowIso() });
      saveStore(store);
      return { success: true };
    }
    case "projects.members.list":
      return store.projectMembers
        .filter(member => member.projectId === projectId)
        .map(member => ({
          ...member,
          user: store.users.find(user => user.id === member.userId) ?? null,
        }));
    case "projects.members.add":
      store.projectMembers.push({
        id: nextId(store.projectMembers),
        projectId,
        userId: data.userId,
        role: data.role,
        createdAt: nowIso(),
      });
      saveStore(store);
      return { success: true };
    case "preInitiation.get":
      return store.preInitiation.find(item => item.projectId === projectId) ?? null;
    case "preInitiation.save":
      upsertByProjectId(store.preInitiation, data);
      saveStore(store);
      return { success: true };
    case "initiation.get":
      return store.initiation.find(item => item.projectId === projectId) ?? null;
    case "initiation.save":
      upsertByProjectId(store.initiation, data);
      saveStore(store);
      return { success: true };
    case "planning.get":
      return store.planning.find(item => item.projectId === projectId) ?? null;
    case "planning.save":
      upsertByProjectId(store.planning, data);
      saveStore(store);
      return { success: true };
    case "planning.activities.list":
      return store.planningActivities.filter(item => item.projectId === projectId);
    case "planning.activities.create": {
      const id = nextId(store.planningActivities);
      store.planningActivities.push({
        id,
        ...data,
        status: "pending",
        currentValue: "0",
        createdAt: nowIso(),
        updatedAt: nowIso(),
      });
      saveStore(store);
      return { id };
    }
    case "planning.activities.update": {
      const activity = store.planningActivities.find(item => item.id === Number(data.id));
      if (activity) assignDefined(activity, { ...data, updatedAt: nowIso() });
      saveStore(store);
      return { success: true };
    }
    case "planning.activities.delete":
      store.planningActivities = store.planningActivities.filter(
        item => item.id !== Number(data.id)
      );
      saveStore(store);
      return { success: true };
    case "execution.purchases.list":
      return store.purchases.filter(item => item.projectId === projectId);
    case "execution.purchases.create": {
      const id = nextId(store.purchases);
      store.purchases.push({
        id,
        ...data,
        status: "requested",
        finalValue: null,
        requestedBy: 1,
        approvedBy: null,
        approvedAt: null,
        receivedAt: null,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      });
      saveStore(store);
      return { id };
    }
    case "execution.purchases.update": {
      const purchase = store.purchases.find(item => item.id === Number(data.id));
      if (purchase) assignDefined(purchase, { ...data, updatedAt: nowIso() });
      saveStore(store);
      return { success: true };
    }
    case "execution.financial.list":
      return store.financial.filter(item => item.projectId === projectId);
    case "execution.financial.create": {
      const id = nextId(store.financial);
      store.financial.push({
        id,
        ...data,
        status: "pending",
        paidAt: null,
        createdBy: 1,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      });
      saveStore(store);
      return { id };
    }
    case "execution.financial.update": {
      const record = store.financial.find(item => item.id === Number(data.id));
      if (record) assignDefined(record, { ...data, updatedAt: nowIso() });
      saveStore(store);
      return { success: true };
    }
    case "execution.activities.list":
      return store.executionActivities.filter(item => item.projectId === projectId);
    case "execution.activities.create": {
      const id = nextId(store.executionActivities);
      store.executionActivities.push({
        id,
        ...data,
        status: "pending",
        progressPercent: 0,
        executedAt: null,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      });
      saveStore(store);
      return { id };
    }
    case "execution.activities.update": {
      const activity = store.executionActivities.find(item => item.id === Number(data.id));
      if (activity) assignDefined(activity, { ...data, updatedAt: nowIso() });
      saveStore(store);
      return { success: true };
    }
    case "monitoring.list":
      return store.monitoring.filter(item => item.projectId === projectId);
    case "monitoring.create": {
      const id = nextId(store.monitoring);
      store.monitoring.push({
        id,
        ...data,
        reportDate: nowIso(),
        createdBy: 1,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      });
      saveStore(store);
      return { id };
    }
    case "monitoring.update": {
      const report = store.monitoring.find(item => item.id === Number(data.id));
      if (report) assignDefined(report, { ...data, updatedAt: nowIso() });
      saveStore(store);
      return { success: true };
    }
    case "closure.get":
      return store.closure.find(item => item.projectId === projectId) ?? null;
    case "closure.save":
      upsertByProjectId(store.closure, data);
      saveStore(store);
      return { success: true };
    case "documents.list":
      return store.documents.filter(
        item => item.projectId === projectId && (!data.phase || item.phase === data.phase)
      );
    case "documents.versions":
      return store.documents.filter(
        item => item.id === data.documentId || item.parentDocumentId === data.documentId
      );
    case "documents.upload": {
      const id = nextId(store.documents);
      store.documents.push({
        id,
        projectId,
        phase: data.phase ?? "general",
        title: data.title,
        description: data.description ?? null,
        fileKey: `static/${data.fileName}`,
        fileUrl: "#",
        fileName: data.fileName,
        fileSize: data.fileSize ?? null,
        mimeType: data.mimeType ?? null,
        version: 1,
        isLatest: true,
        parentDocumentId: data.parentDocumentId ?? null,
        uploadedBy: 1,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      });
      saveStore(store);
      return { id, url: "#" };
    }
    case "approvals.pending":
      return store.approvals.filter(
        item => item.status === "pending" && (!item.assignedTo || item.assignedTo === 1)
      );
    case "approvals.list":
      return store.approvals.filter(item => item.projectId === projectId);
    case "approvals.decide": {
      const approval = store.approvals.find(item => item.id === Number(data.id));
      if (approval) {
        assignDefined(approval, {
          status: data.status,
          notes: data.notes,
          decidedBy: 1,
          decidedAt: nowIso(),
          updatedAt: nowIso(),
        });
      }
      saveStore(store);
      return { success: true };
    }
    case "notifications.list":
      return store.notifications;
    case "notifications.markRead": {
      const notification = store.notifications.find(item => item.id === Number(data.id));
      if (notification) notification.isRead = true;
      saveStore(store);
      return { success: true };
    }
    case "notifications.markAllRead":
      store.notifications.forEach(item => {
        item.isRead = true;
      });
      saveStore(store);
      return { success: true };
    default:
      throw new Error(`Operação indisponível no protótipo estático: ${path}`);
  }
}
