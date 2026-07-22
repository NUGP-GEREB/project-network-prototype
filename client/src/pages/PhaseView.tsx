import { trpc } from "@/lib/trpc";
import {
  Activity,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  FolderOpen,
  Play,
  Target,
  TrendingUp,
} from "lucide-react";
import { Link, useParams } from "wouter";
import AppLayout from "../components/AppLayout";
import { PhaseBadge, ProgressBar } from "../components/PhaseUtils";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";

const phaseConfig: Record<
  string,
  { label: string; icon: React.ElementType; color: string; bg: string; description: string }
> = {
  pre_initiation: {
    label: "Pré-Iniciação",
    icon: BookOpen,
    color: "oklch(0.35 0.12 270)",
    bg: "oklch(0.94 0.04 270)",
    description: "Projetos em fase de identificação de demanda e elaboração de proposta preliminar",
  },
  initiation: {
    label: "Iniciação",
    icon: Play,
    color: "oklch(0.28 0.16 200)",
    bg: "oklch(0.92 0.05 200)",
    description: "Projetos em fase de formalização, geração de TED e constituição de equipe",
  },
  planning: {
    label: "Planejamento",
    icon: Target,
    color: "oklch(0.38 0.18 85)",
    bg: "oklch(0.95 0.06 85)",
    description: "Projetos em fase de detalhamento de atividades, metas e cronograma",
  },
  execution: {
    label: "Execução",
    icon: Activity,
    color: "oklch(0.38 0.20 25)",
    bg: "oklch(0.95 0.06 25)",
    description: "Projetos em fase de compras, execução financeira e atividades técnicas",
  },
  monitoring: {
    label: "Monitoramento e Controle",
    icon: TrendingUp,
    color: "oklch(0.30 0.18 145)",
    bg: "oklch(0.93 0.05 145)",
    description: "Projetos em fase de acompanhamento de indicadores e relatórios de progresso",
  },
  closure: {
    label: "Encerramento",
    icon: CheckCircle2,
    color: "oklch(0.28 0.10 240)",
    bg: "oklch(0.93 0.03 240)",
    description: "Projetos em fase de prestação de contas e encerramento administrativo",
  },
};

export default function PhaseView() {
  const params = useParams<{ phase: string }>();
  const phase = params.phase ?? "pre_initiation";
  const config = phaseConfig[phase];

  const { data: projects, isLoading } = trpc.projects.list.useQuery();

  const filtered = projects?.filter((p) => p.phase === phase) ?? [];

  if (!config) {
    return (
      <AppLayout>
        <div className="text-center py-16">
          <p className="text-muted-foreground">Fase não encontrada</p>
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="mt-4">
              Voltar ao Dashboard
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const Icon = config.icon;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Link href="/dashboard">
            <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3">
              <ArrowLeft size={14} />
              Dashboard
            </button>
          </Link>
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: config.bg }}
            >
              <Icon size={22} style={{ color: config.color }} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">{config.label}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{config.description}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div
          className="rounded-xl p-4 border"
          style={{ background: config.bg, borderColor: config.color + "30" }}
        >
          <p className="text-3xl font-bold" style={{ color: config.color }}>
            {isLoading ? "—" : filtered.length}
          </p>
          <p className="text-sm font-medium mt-0.5" style={{ color: config.color }}>
            {filtered.length === 1 ? "projeto nesta fase" : "projetos nesta fase"}
          </p>
        </div>

        {/* Projects List */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-card border rounded-xl">
            <FolderOpen size={40} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              Nenhum projeto nesta fase
            </p>
            <Link href="/projects">
              <Button size="sm" variant="outline" className="mt-4 text-xs">
                Ver todos os projetos
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <div className="bg-card border rounded-xl p-5 hover:shadow-sm transition-all duration-200 cursor-pointer h-full">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
                      {project.title}
                    </h3>
                    <PhaseBadge phase={project.phase} />
                  </div>
                  {project.description && (
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {project.financingOrgan && (
                      <p>
                        <span className="font-medium text-foreground">Financiador:</span>{" "}
                        {project.financingOrgan}
                      </p>
                    )}
                    {project.startDate && (
                      <p>
                        <span className="font-medium text-foreground">Início:</span>{" "}
                        {new Date(project.startDate).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                  </div>
                  {project.totalBudget && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                        <span>Execução orçamentária</span>
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
                        color={config.color}
                      />
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
