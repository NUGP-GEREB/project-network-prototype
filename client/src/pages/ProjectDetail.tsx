import { trpc } from "@/lib/trpc";
import {
  Activity,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  FileText,
  Play,
  Settings,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { Link, useParams } from "wouter";
import { useState } from "react";
import AppLayout from "../components/AppLayout";
import { PhaseBadge, ProgressBar, SectionCard } from "../components/PhaseUtils";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import PreInitiationModule from "./modules/PreInitiationModule";
import InitiationModule from "./modules/InitiationModule";
import PlanningModule from "./modules/PlanningModule";
import ExecutionModule from "./modules/ExecutionModule";
import MonitoringModule from "./modules/MonitoringModule";
import ClosureModule from "./modules/ClosureModule";
import DocumentsModule from "./modules/DocumentsModule";

const phases = [
  { id: "pre_initiation", label: "Pré-Iniciação", icon: BookOpen, short: "Pré-Ini." },
  { id: "initiation", label: "Iniciação", icon: Play, short: "Iniciação" },
  { id: "planning", label: "Planejamento", icon: Target, short: "Planej." },
  { id: "execution", label: "Execução", icon: Activity, short: "Execução" },
  { id: "monitoring", label: "Monitoramento", icon: TrendingUp, short: "Monitor." },
  { id: "closure", label: "Encerramento", icon: CheckCircle2, short: "Encerr." },
];

const phaseOrder = [
  "pre_initiation",
  "initiation",
  "planning",
  "execution",
  "monitoring",
  "closure",
  "completed",
];

export default function ProjectDetail() {
  const params = useParams<{ id: string }>();
  const projectId = parseInt(params.id ?? "0");

  const { data: project, isLoading } = trpc.projects.getById.useQuery(
    { id: projectId },
    { enabled: !!projectId }
  );

  const utils = trpc.useUtils();
  const advanceMutation = trpc.projects.update.useMutation({
    onSuccess: () => utils.projects.getById.invalidate({ id: projectId }),
  });

  if (isLoading) {
    return (
      <AppLayout>
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
      </AppLayout>
    );
  }

  if (!project) {
    return (
      <AppLayout>
      <div className="text-center py-16">
        <p className="text-muted-foreground">Projeto não encontrado</p>
        <Link href="/projects">
          <Button variant="outline" size="sm" className="mt-4">
            Voltar para projetos
          </Button>
        </Link>
      </div>
      </AppLayout>
    );
  }

  const currentPhaseIdx = phaseOrder.indexOf(project.phase);
  const budgetPct =
    project.totalBudget && project.executedBudget
      ? Math.min(
          100,
          (parseFloat(project.executedBudget) / parseFloat(project.totalBudget)) * 100
        )
      : 0;

  const canAdvance =
    currentPhaseIdx < phaseOrder.length - 2 && project.status === "active";

  const handleAdvancePhase = () => {
    const nextPhase = phaseOrder[currentPhaseIdx + 1];
    if (nextPhase) {
      advanceMutation.mutate({ id: projectId, phase: nextPhase as typeof project.phase });
    }
  };

  return (
    <AppLayout>
    <div className="space-y-5 transition-page">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/projects">
          <button className="flex items-center gap-1 hover:text-foreground transition-colors">
            <ArrowLeft size={14} />
            Projetos
          </button>
        </Link>
        <ChevronRight size={14} />
        <span className="text-foreground font-medium truncate">{project.title}</span>
      </div>

      {/* Project Header */}
      <div className="bg-card rounded-xl border p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1.5">
              <h1 className="text-xl font-semibold text-foreground truncate">{project.title}</h1>
              <PhaseBadge phase={project.phase} />
            </div>
            {project.description && (
              <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              {project.financingOrgan && (
                <span>
                  <strong className="text-foreground">Financiador:</strong>{" "}
                  {project.financingOrgan}
                </span>
              )}
              {project.startDate && (
                <span>
                  <strong className="text-foreground">Início:</strong>{" "}
                  {new Date(project.startDate).toLocaleDateString("pt-BR")}
                </span>
              )}
              {project.endDate && (
                <span>
                  <strong className="text-foreground">Término:</strong>{" "}
                  {new Date(project.endDate).toLocaleDateString("pt-BR")}
                </span>
              )}
              {project.totalBudget && (
                <span>
                  <strong className="text-foreground">Orçamento:</strong> R${" "}
                  {parseFloat(project.totalBudget).toLocaleString("pt-BR")}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {canAdvance && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleAdvancePhase}
                disabled={advanceMutation.isPending}
                className="text-xs"
              >
                Avançar Fase
              </Button>
            )}
          </div>
        </div>

        {/* Phase Timeline */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {phases.map((phase, idx) => {
              const Icon = phase.icon;
              const phaseIdx = phaseOrder.indexOf(phase.id);
              const isDone = phaseIdx < currentPhaseIdx;
              const isCurrent = phase.id === project.phase;
              const isFuture = phaseIdx > currentPhaseIdx;
              return (
                <div key={phase.id} className="flex items-center gap-1 flex-shrink-0">
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isCurrent
                        ? "text-white"
                        : isDone
                        ? ""
                        : "opacity-40"
                    }`}
                    style={
                      isCurrent
                        ? { background: "oklch(0.28 0.09 240)" }
                        : isDone
                        ? { background: "oklch(0.93 0.05 145)", color: "oklch(0.28 0.18 145)" }
                        : { background: "oklch(0.93 0.01 240)", color: "oklch(0.40 0.05 240)" }
                    }
                  >
                    {isDone ? (
                      <CheckCircle2 size={11} />
                    ) : (
                      <Icon size={11} />
                    )}
                    <span className="hidden sm:inline">{phase.label}</span>
                    <span className="sm:hidden">{phase.short}</span>
                  </div>
                  {idx < phases.length - 1 && (
                    <div
                      className="w-4 h-px flex-shrink-0"
                      style={{
                        background: isDone
                          ? "oklch(0.52 0.16 195)"
                          : "oklch(0.89 0.006 240)",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Budget Progress */}
        {project.totalBudget && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>Execução orçamentária</span>
              <span className="font-medium text-foreground">
                R$ {parseFloat(project.executedBudget ?? "0").toLocaleString("pt-BR")} de R${" "}
                {parseFloat(project.totalBudget).toLocaleString("pt-BR")} ({budgetPct.toFixed(1)}%)
              </span>
            </div>
            <ProgressBar value={budgetPct} color="oklch(0.52 0.16 195)" />
          </div>
        )}
      </div>

      {/* Module Tabs */}
      <Tabs defaultValue={project.phase === "completed" ? "closure" : project.phase}>
        <TabsList className="h-auto flex-wrap gap-1 bg-secondary p-1 rounded-xl">
          {phases.map((phase) => {
            const Icon = phase.icon;
            return (
              <TabsTrigger
                key={phase.id}
                value={phase.id}
                className="flex items-center gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-lg"
              >
                <Icon size={13} />
                <span className="hidden sm:inline">{phase.label}</span>
                <span className="sm:hidden">{phase.short}</span>
              </TabsTrigger>
            );
          })}
          <TabsTrigger
            value="documents"
            className="flex items-center gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-lg"
          >
            <FileText size={13} />
            <span className="hidden sm:inline">Documentos</span>
            <span className="sm:hidden">Docs</span>
          </TabsTrigger>
          <TabsTrigger
            value="team"
            className="flex items-center gap-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-lg"
          >
            <Users size={13} />
            <span className="hidden sm:inline">Equipe</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="pre_initiation">
            <PreInitiationModule projectId={projectId} />
          </TabsContent>
          <TabsContent value="initiation">
            <InitiationModule projectId={projectId} />
          </TabsContent>
          <TabsContent value="planning">
            <PlanningModule projectId={projectId} />
          </TabsContent>
          <TabsContent value="execution">
            <ExecutionModule projectId={projectId} />
          </TabsContent>
          <TabsContent value="monitoring">
            <MonitoringModule projectId={projectId} />
          </TabsContent>
          <TabsContent value="closure">
            <ClosureModule projectId={projectId} />
          </TabsContent>
          <TabsContent value="documents">
            <DocumentsModule projectId={projectId} />
          </TabsContent>
          <TabsContent value="team">
            <TeamModule projectId={projectId} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
    </AppLayout>
  );
}

function TeamModule({ projectId }: { projectId: number }) {
  const { data: members, isLoading } = trpc.projects.members.list.useQuery({ projectId });
  const { data: allUsers } = trpc.users.list.useQuery();
  const utils = trpc.useUtils();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("equipe");

  const addMember = trpc.projects.members.add.useMutation({
    onSuccess: () => utils.projects.members.list.invalidate({ projectId }),
  });

  const roleLabels: Record<string, string> = {
    ordenador_despesas: "Ordenador de Despesas",
    responsavel_tecnico: "Responsável Técnico",
    equipe: "Equipe do Projeto",
    financiador: "Órgão Financiador",
    gestor: "Gestor",
  };

  return (
    <SectionCard
      title="Equipe do Projeto"
      description="Membros e seus papéis no projeto"
      action={
        <div className="flex items-center gap-2">
          <select
            className="text-xs border rounded-lg px-2 py-1.5 bg-background"
            value={selectedUserId ?? ""}
            onChange={(e) => setSelectedUserId(parseInt(e.target.value) || null)}
          >
            <option value="">Selecionar usuário</option>
            {allUsers?.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name ?? u.email ?? `#${u.id}`}
              </option>
            ))}
          </select>
          <select
            className="text-xs border rounded-lg px-2 py-1.5 bg-background"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            {Object.entries(roleLabels).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            className="text-xs h-8"
            disabled={!selectedUserId || addMember.isPending}
            onClick={() => {
              if (selectedUserId) {
                addMember.mutate({
                  projectId,
                  userId: selectedUserId,
                  role: selectedRole as any,
                });
                setSelectedUserId(null);
              }
            }}
          >
            Adicionar
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      ) : !members || members.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground">
          Nenhum membro adicionado ainda
        </div>
      ) : (
        <div className="space-y-2">
          {members.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                  style={{ background: "oklch(0.52 0.16 195)" }}
                >
                  {(m.user?.name ?? "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {m.user?.name ?? m.user?.email ?? `Usuário #${m.userId}`}
                  </p>
                  <p className="text-xs text-muted-foreground">{m.user?.email}</p>
                </div>
              </div>
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-full"
                style={{
                  background: "oklch(0.92 0.04 240)",
                  color: "oklch(0.28 0.09 240)",
                }}
              >
                {roleLabels[m.role] ?? m.role}
              </span>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}


