import { trpc } from "@/lib/trpc";
import {
  Activity,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  FolderOpen,
  Play,
  Plus,
  Target,
  TrendingUp,
} from "lucide-react";
import { Link } from "wouter";
import AppLayout from "../components/AppLayout";
import { PhaseBadge, ProgressBar, StatCard } from "../components/PhaseUtils";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";

const phaseCards = [
  {
    phase: "pre_initiation" as const,
    label: "Pré-Iniciação",
    icon: BookOpen,
    color: "oklch(0.35 0.12 270)",
    bg: "oklch(0.94 0.04 270)",
    description: "Identificação de demanda e elaboração de proposta",
  },
  {
    phase: "initiation" as const,
    label: "Iniciação",
    icon: Play,
    color: "oklch(0.28 0.16 200)",
    bg: "oklch(0.92 0.05 200)",
    description: "Formalização, TED e constituição de equipe",
  },
  {
    phase: "planning" as const,
    label: "Planejamento",
    icon: Target,
    color: "oklch(0.38 0.18 85)",
    bg: "oklch(0.95 0.06 85)",
    description: "Atividades, metas, cronograma e viabilidade",
  },
  {
    phase: "execution" as const,
    label: "Execução",
    icon: Activity,
    color: "oklch(0.38 0.20 25)",
    bg: "oklch(0.95 0.06 25)",
    description: "Compras, financeiro e atividades técnicas",
  },
  {
    phase: "monitoring" as const,
    label: "Monitoramento",
    icon: TrendingUp,
    color: "oklch(0.30 0.18 145)",
    bg: "oklch(0.93 0.05 145)",
    description: "Indicadores, controle e relatórios",
  },
  {
    phase: "closure" as const,
    label: "Encerramento",
    icon: CheckCircle2,
    color: "oklch(0.28 0.10 240)",
    bg: "oklch(0.93 0.03 240)",
    description: "Prestação de contas e encerramento administrativo",
  },
];

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = trpc.projects.dashboard.useQuery();
  const { data: projects, isLoading: projectsLoading } = trpc.projects.list.useQuery();
  const { data: pendingApprovals } = trpc.approvals.pending.useQuery();

  const recentProjects = projects?.slice(0, 5) ?? [];

  return (
    <AppLayout>
    <div className="space-y-6 transition-page">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Visão geral do ciclo de vida dos projetos institucionais
          </p>
        </div>
        <Link href="/projects">
          <Button size="sm" className="gap-2">
            <Plus size={15} />
            Novo Projeto
          </Button>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))
        ) : (
          <>
            <StatCard
              label="Total de Projetos"
              value={stats?.total ?? 0}
              icon={FolderOpen}
              color="oklch(0.28 0.09 240)"
              bg="oklch(0.92 0.04 240)"
            />
            <StatCard
              label="Em Execução"
              value={stats?.execution ?? 0}
              icon={Activity}
              color="oklch(0.38 0.20 25)"
              bg="oklch(0.95 0.06 25)"
            />
            <StatCard
              label="Aprovações Pendentes"
              value={pendingApprovals?.length ?? 0}
              icon={ClipboardCheck}
              color="oklch(0.38 0.18 85)"
              bg="oklch(0.95 0.06 85)"
            />
            <StatCard
              label="Concluídos"
              value={stats?.completed ?? 0}
              icon={CheckCircle2}
              color="oklch(0.30 0.18 145)"
              bg="oklch(0.93 0.05 145)"
            />
          </>
        )}
      </div>

      {/* Phase Overview */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Projetos por Fase</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {phaseCards.map((card) => {
            const Icon = card.icon;
            const count = stats ? (stats as Record<string, number>)[card.phase] ?? 0 : 0;
            const total = stats?.total ?? 1;
            return (
              <Link key={card.phase} href={`/phase/${card.phase}`}>
                <div className="bg-card rounded-xl border p-4 hover:shadow-sm transition-all duration-200 cursor-pointer group">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: card.bg }}
                  >
                    <Icon size={16} style={{ color: card.color }} />
                  </div>
                  <p className="text-xl font-bold text-foreground">{count}</p>
                  <p className="text-xs font-medium text-foreground mt-0.5">{card.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-tight hidden lg:block">
                    {card.description}
                  </p>
                  <ProgressBar
                    value={count}
                    max={Math.max(total, 1)}
                    color={card.color}
                    className="mt-3"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Projects + Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Recent Projects */}
        <div className="lg:col-span-3 bg-card rounded-xl border">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Projetos Recentes</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Últimas atualizações</p>
            </div>
            <Link href="/projects">
              <Button variant="ghost" size="sm" className="text-xs h-7">
                Ver todos
              </Button>
            </Link>
          </div>
          <div className="divide-y">
            {projectsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-5 py-3.5">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))
            ) : recentProjects.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <FolderOpen size={28} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Nenhum projeto ainda</p>
                <Link href="/projects">
                  <Button size="sm" variant="outline" className="mt-3 text-xs">
                    Criar primeiro projeto
                  </Button>
                </Link>
              </div>
            ) : (
              recentProjects.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <div className="px-5 py-3.5 hover:bg-secondary/50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {project.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {project.financingOrgan ?? "Órgão não definido"}
                        </p>
                      </div>
                      <PhaseBadge phase={project.phase} />
                    </div>
                    {project.totalBudget && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>Orçamento executado</span>
                          <span>
                            {project.executedBudget
                              ? (
                                  (parseFloat(project.executedBudget) /
                                    parseFloat(project.totalBudget)) *
                                  100
                                ).toFixed(0)
                              : 0}
                            %
                          </span>
                        </div>
                        <ProgressBar
                          value={parseFloat(project.executedBudget ?? "0")}
                          max={parseFloat(project.totalBudget)}
                          color="oklch(0.52 0.16 195)"
                        />
                      </div>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="lg:col-span-2 bg-card rounded-xl border">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Aprovações Pendentes</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Aguardando sua decisão</p>
            </div>
            <Link href="/approvals">
              <Button variant="ghost" size="sm" className="text-xs h-7">
                Ver todas
              </Button>
            </Link>
          </div>
          <div className="divide-y">
            {!pendingApprovals || pendingApprovals.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <ClipboardCheck size={28} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Nenhuma aprovação pendente</p>
              </div>
            ) : (
              pendingApprovals.slice(0, 5).map((approval) => {
                const typeLabels: Record<string, string> = {
                  proposal_validation: "Validação de Proposta",
                  ted_approval: "Aprovação de TED",
                  planning_internal: "Aprovação Interna",
                  planning_financier: "Aprovação Financiador",
                  purchase_approval: "Aprovação de Compra",
                  final_report: "Relatório Final",
                  accounting_approval: "Prestação de Contas",
                  closure: "Encerramento",
                };
                return (
                  <Link key={approval.id} href={`/approvals`}>
                    <div className="px-5 py-3.5 hover:bg-secondary/50 transition-colors cursor-pointer">
                      <p className="text-xs font-medium text-foreground">
                        {typeLabels[approval.type] ?? approval.type}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Projeto #{approval.projectId}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: "oklch(0.62 0.17 85)" }}
                        />
                        <span className="text-xs" style={{ color: "oklch(0.38 0.18 85)" }}>
                          Aguardando decisão
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
    </AppLayout>
  );
}
