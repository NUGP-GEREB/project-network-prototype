import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { isLocalDemoMode } from "./_core/env";
import { sdk } from "./_core/sdk";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  addProjectMember,
  createApproval,
  createDocument,
  createExecutionActivity,
  createFinancialRecord,
  createMonitoringReport,
  createNotification,
  createProject,
  createPlanningActivity,
  createPurchase,
  deletePlanningActivity,
  getAllProjects,
  getAllUsers,
  getApprovals,
  getClosure,
  getDashboardStats,
  getDocumentVersions,
  getDocuments,
  getExecutionActivities,
  getFinancialRecords,
  getInitiation,
  getMonitoringReports,
  getPurchases,
  getPendingApprovals,
  getPlanning,
  getPlanningActivities,
  getPreInitiation,
  getProjectById,
  getProjectMembers,
  getProjectsByUser,
  getUserByOpenId,
  getUserNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  updateApproval,
  updateExecutionActivity,
  updateFinancialRecord,
  updateMonitoringReport,
  updatePlanningActivity,
  updateProject,
  updatePurchase,
  upsertUser,
  upsertClosure,
  upsertInitiation,
  upsertPlanning,
  upsertPreInitiation,
} from "./db";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

const DEMO_USER = {
  openId: "demo-admin",
  name: "Usuário Demo",
  email: "demo@fiocruz.br",
  password: "demo123",
} as const;

// ─── Projects Router ──────────────────────────────────────────────────────────
const projectsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role === "admin") return getAllProjects();
    return getProjectsByUser(ctx.user.id);
  }),

  getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const project = await getProjectById(input.id);
    if (!project) throw new TRPCError({ code: "NOT_FOUND", message: "Projeto não encontrado" });
    return project;
  }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(3),
        description: z.string().optional(),
        financingOrgan: z.string().optional(),
        totalBudget: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const id = await createProject({
        title: input.title,
        description: input.description,
        financingOrgan: input.financingOrgan,
        totalBudget: input.totalBudget,
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        endDate: input.endDate ? new Date(input.endDate) : undefined,
        createdBy: ctx.user.id,
        phase: "pre_initiation",
        status: "active",
      });
      await addProjectMember({ projectId: id, userId: ctx.user.id, role: "gestor" });
      return { id };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        phase: z
          .enum([
            "pre_initiation",
            "initiation",
            "planning",
            "execution",
            "monitoring",
            "closure",
            "completed",
            "cancelled",
          ])
          .optional(),
        status: z.enum(["active", "paused", "completed", "cancelled"]).optional(),
        financingOrgan: z.string().optional(),
        totalBudget: z.string().optional(),
        executedBudget: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateProject(id, {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      });
      return { success: true };
    }),

  dashboard: protectedProcedure.query(async () => {
    return getDashboardStats();
  }),

  members: router({
    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(({ input }) => getProjectMembers(input.projectId)),

    add: protectedProcedure
      .input(
        z.object({
          projectId: z.number(),
          userId: z.number(),
          role: z.enum([
            "ordenador_despesas",
            "responsavel_tecnico",
            "equipe",
            "financiador",
            "gestor",
          ]),
        })
      )
      .mutation(async ({ input }) => {
        await addProjectMember(input);
        return { success: true };
      }),
  }),
});

// ─── Pre-Initiation Router ────────────────────────────────────────────────────
const preInitiationRouter = router({
  get: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(({ input }) => getPreInitiation(input.projectId)),

  save: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        demandDescription: z.string().optional(),
        justification: z.string().optional(),
        objectives: z.string().optional(),
        expectedResults: z.string().optional(),
        estimatedBudget: z.string().optional(),
        proposalStatus: z
          .enum(["draft", "submitted", "under_review", "approved", "rejected"])
          .optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await upsertPreInitiation(input);
      if (input.proposalStatus === "submitted") {
        const project = await getProjectById(input.projectId);
        const approvalId = await createApproval({
          projectId: input.projectId,
          type: "proposal_validation",
          status: "pending",
          requestedBy: ctx.user.id,
        });
        await createNotification({
          userId: ctx.user.id,
          projectId: input.projectId,
          type: "approval_requested",
          title: "Proposta submetida para validação",
          message: `A proposta do projeto "${project?.title}" foi submetida e aguarda validação.`,
          link: `/projects/${input.projectId}/pre-initiation`,
        });
      }
      return { success: true };
    }),
});

// ─── Initiation Router ────────────────────────────────────────────────────────
const initiationRouter = router({
  get: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(({ input }) => getInitiation(input.projectId)),

  save: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        tedNumber: z.string().optional(),
        tedSignedDate: z.string().optional(),
        tedStatus: z
          .enum(["pending", "generated", "signed_fiocruz", "signed_both", "published"])
          .optional(),
        ordenadorDespesasId: z.number().optional(),
        responsavelTecnicoId: z.number().optional(),
        initialBudget: z.string().optional(),
        budgetSource: z.string().optional(),
        programCode: z.string().optional(),
        actionCode: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await upsertInitiation({
        ...input,
        tedSignedDate: input.tedSignedDate ? new Date(input.tedSignedDate) : undefined,
      });
      if (input.tedStatus === "generated") {
        const project = await getProjectById(input.projectId);
        await createApproval({
          projectId: input.projectId,
          type: "ted_approval",
          status: "pending",
          requestedBy: ctx.user.id,
        });
        await createNotification({
          userId: ctx.user.id,
          projectId: input.projectId,
          type: "ted_generated",
          title: "TED gerado e aguardando aprovação",
          message: `O TED do projeto "${project?.title}" foi gerado e aguarda assinatura.`,
          link: `/projects/${input.projectId}/initiation`,
        });
      }
      return { success: true };
    }),
});

// ─── Planning Router ──────────────────────────────────────────────────────────
const planningRouter = router({
  get: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(({ input }) => getPlanning(input.projectId)),

  save: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        technicalViability: z.string().optional(),
        financialViability: z.string().optional(),
        riskAnalysis: z.string().optional(),
        internalApprovalStatus: z.enum(["pending", "approved", "rejected"]).optional(),
        financierApprovalStatus: z.enum(["pending", "approved", "rejected"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await upsertPlanning(input);
      if (input.internalApprovalStatus === "approved") {
        const project = await getProjectById(input.projectId);
        await createApproval({
          projectId: input.projectId,
          type: "planning_financier",
          status: "pending",
          requestedBy: ctx.user.id,
        });
        await createNotification({
          userId: ctx.user.id,
          projectId: input.projectId,
          type: "planning_approved_internal",
          title: "Planejamento aprovado internamente",
          message: `O planejamento do projeto "${project?.title}" foi aprovado internamente e aguarda aprovação do financiador.`,
          link: `/projects/${input.projectId}/planning`,
        });
      }
      return { success: true };
    }),

  activities: router({
    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(({ input }) => getPlanningActivities(input.projectId)),

    create: protectedProcedure
      .input(
        z.object({
          projectId: z.number(),
          title: z.string().min(2),
          description: z.string().optional(),
          responsible: z.string().optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          goal: z.string().optional(),
          indicator: z.string().optional(),
          targetValue: z.string().optional(),
          budget: z.string().optional(),
          order: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const id = await createPlanningActivity({
          ...input,
          startDate: input.startDate ? new Date(input.startDate) : undefined,
          endDate: input.endDate ? new Date(input.endDate) : undefined,
        });
        return { id };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          description: z.string().optional(),
          responsible: z.string().optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
          goal: z.string().optional(),
          indicator: z.string().optional(),
          targetValue: z.string().optional(),
          currentValue: z.string().optional(),
          budget: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updatePlanningActivity(id, {
          ...data,
          startDate: data.startDate ? new Date(data.startDate) : undefined,
          endDate: data.endDate ? new Date(data.endDate) : undefined,
        });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deletePlanningActivity(input.id);
        return { success: true };
      }),
  }),
});

// ─── Execution Router ─────────────────────────────────────────────────────────
const executionRouter = router({
  purchases: router({
    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(({ input }) => getPurchases(input.projectId)),

    create: protectedProcedure
      .input(
        z.object({
          projectId: z.number(),
          title: z.string().min(2),
          description: z.string().optional(),
          purchaseType: z.enum(["material", "service", "equipment", "other"]).optional(),
          estimatedValue: z.string().optional(),
          supplier: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const id = await createPurchase({ ...input, requestedBy: ctx.user.id });
        const project = await getProjectById(input.projectId);
        await createApproval({
          projectId: input.projectId,
          type: "purchase_approval",
          status: "pending",
          requestedBy: ctx.user.id,
          referenceId: id,
        });
        await createNotification({
          userId: ctx.user.id,
          projectId: input.projectId,
          type: "purchase_requested",
          title: "Nova solicitação de compra",
          message: `Solicitação de compra "${input.title}" criada no projeto "${project?.title}".`,
          link: `/projects/${input.projectId}/execution`,
        });
        return { id };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z
            .enum(["requested", "quoted", "bidding", "approved", "received", "paid", "cancelled"])
            .optional(),
          finalValue: z.string().optional(),
          supplier: z.string().optional(),
          notes: z.string().optional(),
          receivedAt: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        await updatePurchase(id, {
          ...data,
          approvedBy: data.status === "approved" ? ctx.user.id : undefined,
          approvedAt: data.status === "approved" ? new Date() : undefined,
          receivedAt: data.receivedAt ? new Date(data.receivedAt) : undefined,
        });
        return { success: true };
      }),
  }),

  financial: router({
    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(({ input }) => getFinancialRecords(input.projectId)),

    create: protectedProcedure
      .input(
        z.object({
          projectId: z.number(),
          type: z.enum(["empenho", "liquidacao", "pagamento", "nota_fiscal", "devolucao"]),
          description: z.string().min(2),
          value: z.string(),
          referenceNumber: z.string().optional(),
          issueDate: z.string().optional(),
          dueDate: z.string().optional(),
          supplier: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const id = await createFinancialRecord({
          ...input,
          issueDate: input.issueDate ? new Date(input.issueDate) : undefined,
          dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
          createdBy: ctx.user.id,
        });
        return { id };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pending", "processed", "cancelled"]).optional(),
          paidAt: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateFinancialRecord(id, {
          ...data,
          paidAt: data.paidAt ? new Date(data.paidAt) : undefined,
        });
        return { success: true };
      }),
  }),

  activities: router({
    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(({ input }) => getExecutionActivities(input.projectId)),

    create: protectedProcedure
      .input(
        z.object({
          projectId: z.number(),
          title: z.string().min(2),
          description: z.string().optional(),
          responsible: z.string().optional(),
          planningActivityId: z.number().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const id = await createExecutionActivity(input);
        return { id };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
          progressPercent: z.number().min(0).max(100).optional(),
          notes: z.string().optional(),
          executedAt: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateExecutionActivity(id, {
          ...data,
          executedAt: data.executedAt ? new Date(data.executedAt) : undefined,
        });
        return { success: true };
      }),
  }),
});

// ─── Monitoring Router ────────────────────────────────────────────────────────
const monitoringRouter = router({
  list: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(({ input }) => getMonitoringReports(input.projectId)),

  create: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        title: z.string().min(2),
        reportType: z.enum(["progress", "financial", "quality", "risk"]).optional(),
        content: z.string().optional(),
        physicalProgress: z.number().min(0).max(100).optional(),
        financialProgress: z.number().min(0).max(100).optional(),
        qualityStatus: z.enum(["on_track", "at_risk", "off_track"]).optional(),
        issues: z.string().optional(),
        actions: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const id = await createMonitoringReport({ ...input, createdBy: ctx.user.id });
      return { id };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        content: z.string().optional(),
        physicalProgress: z.number().optional(),
        financialProgress: z.number().optional(),
        qualityStatus: z.enum(["on_track", "at_risk", "off_track"]).optional(),
        issues: z.string().optional(),
        actions: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateMonitoringReport(id, data);
      return { success: true };
    }),
});

// ─── Closure Router ───────────────────────────────────────────────────────────
const closureRouter = router({
  get: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(({ input }) => getClosure(input.projectId)),

  save: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        finalReportStatus: z
          .enum(["pending", "draft", "submitted", "under_review", "approved", "rejected"])
          .optional(),
        finalReportContent: z.string().optional(),
        accountingStatus: z
          .enum(["pending", "submitted", "approved", "rejected", "in_diligence"])
          .optional(),
        accountingNotes: z.string().optional(),
        opinionStatus: z.enum(["pending", "favorable", "unfavorable"]).optional(),
        opinionNotes: z.string().optional(),
        lessonsLearned: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await upsertClosure(input);
      if (input.finalReportStatus === "submitted") {
        const project = await getProjectById(input.projectId);
        await createApproval({
          projectId: input.projectId,
          type: "final_report",
          status: "pending",
          requestedBy: ctx.user.id,
        });
        await createNotification({
          userId: ctx.user.id,
          projectId: input.projectId,
          type: "final_report_submitted",
          title: "Relatório final submetido",
          message: `O relatório final do projeto "${project?.title}" foi submetido e aguarda análise.`,
          link: `/projects/${input.projectId}/closure`,
        });
      }
      return { success: true };
    }),
});

// ─── Documents Router ─────────────────────────────────────────────────────────
const documentsRouter = router({
  list: protectedProcedure
    .input(z.object({ projectId: z.number(), phase: z.string().optional() }))
    .query(({ input }) => getDocuments(input.projectId, input.phase)),

  versions: protectedProcedure
    .input(z.object({ documentId: z.number() }))
    .query(({ input }) => getDocumentVersions(input.documentId)),

  upload: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        phase: z
          .enum([
            "pre_initiation",
            "initiation",
            "planning",
            "execution",
            "monitoring",
            "closure",
            "general",
          ])
          .optional(),
        title: z.string().min(2),
        description: z.string().optional(),
        fileName: z.string(),
        fileSize: z.number().optional(),
        mimeType: z.string().optional(),
        fileBase64: z.string(),
        parentDocumentId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const buffer = Buffer.from(input.fileBase64, "base64");
      const suffix = nanoid(8);
      const fileKey = `projects/${input.projectId}/docs/${suffix}-${input.fileName}`;
      const { url } = await storagePut(fileKey, buffer, input.mimeType || "application/octet-stream");

      let version = 1;
      if (input.parentDocumentId) {
        const versions = await getDocumentVersions(input.parentDocumentId);
        version = versions.length + 1;
        const db = await import("./db").then((m) => m.getDb());
        if (db) {
          const { documents: docsTable } = await import("../drizzle/schema");
          const { eq } = await import("drizzle-orm");
          await db.update(docsTable).set({ isLatest: false }).where(eq(docsTable.parentDocumentId, input.parentDocumentId));
          await db.update(docsTable).set({ isLatest: false }).where(eq(docsTable.id, input.parentDocumentId));
        }
      }

      const id = await createDocument({
        projectId: input.projectId,
        phase: input.phase || "general",
        title: input.title,
        description: input.description,
        fileKey,
        fileUrl: url,
        fileName: input.fileName,
        fileSize: input.fileSize,
        mimeType: input.mimeType,
        version,
        isLatest: true,
        parentDocumentId: input.parentDocumentId,
        uploadedBy: ctx.user.id,
      });
      return { id, url };
    }),
});

// ─── Approvals Router ─────────────────────────────────────────────────────────
const approvalsRouter = router({
  list: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(({ input }) => getApprovals(input.projectId)),

  pending: protectedProcedure.query(({ ctx }) => getPendingApprovals(ctx.user.id)),

  decide: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["approved", "rejected"]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await updateApproval(input.id, {
        status: input.status,
        decidedBy: ctx.user.id,
        decidedAt: new Date(),
        notes: input.notes,
      });
      return { success: true };
    }),
});

// ─── Notifications Router ─────────────────────────────────────────────────────
const notificationsRouter = router({
  list: protectedProcedure.query(({ ctx }) => getUserNotifications(ctx.user.id)),

  markRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await markNotificationRead(input.id);
      return { success: true };
    }),

  markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    await markAllNotificationsRead(ctx.user.id);
    return { success: true };
  }),
});

// ─── Users Router ─────────────────────────────────────────────────────────────
const usersRouter = router({
  list: protectedProcedure.query(() => getAllUsers()),
});

// ─── App Router ───────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    demoLogin: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(1),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!isLocalDemoMode()) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Login demo disponível apenas no ambiente local.",
          });
        }

        const email = input.email.trim().toLowerCase();
        if (email !== DEMO_USER.email || input.password !== DEMO_USER.password) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Credenciais inválidas.",
          });
        }

        await upsertUser({
          openId: DEMO_USER.openId,
          name: DEMO_USER.name,
          email: DEMO_USER.email,
          loginMethod: "demo",
          role: "admin",
          lastSignedIn: new Date(),
        });

        const sessionToken = await sdk.createSessionToken(DEMO_USER.openId, {
          name: DEMO_USER.name,
          expiresInMs: ONE_YEAR_MS,
        });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });

        return {
          success: true,
          user: await getUserByOpenId(DEMO_USER.openId),
        } as const;
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  projects: projectsRouter,
  preInitiation: preInitiationRouter,
  initiation: initiationRouter,
  planning: planningRouter,
  execution: executionRouter,
  monitoring: monitoringRouter,
  closure: closureRouter,
  documents: documentsRouter,
  approvals: approvalsRouter,
  notifications: notificationsRouter,
  users: usersRouter,
});

export type AppRouter = typeof appRouter;
