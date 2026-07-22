import { trpc } from "@/lib/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Activity,
  BookOpen,
  Calendar,
  CheckCircle2,
  FolderOpen,
  Play,
  Plus,
  Search,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "wouter";
import { EmptyState, PhaseBadge, ProgressBar } from "../components/PhaseUtils";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import { z } from "zod";
import AppLayout from "../components/AppLayout";

const createSchema = z.object({
  title: z.string().min(3, "Título deve ter ao menos 3 caracteres"),
  description: z.string().optional(),
  financingOrgan: z.string().optional(),
  totalBudget: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type CreateForm = z.infer<typeof createSchema>;

const phaseIcons = {
  pre_initiation: BookOpen,
  initiation: Play,
  planning: Target,
  execution: Activity,
  monitoring: TrendingUp,
  closure: CheckCircle2,
  completed: CheckCircle2,
  cancelled: X,
};

export default function Projects() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();

  const { data: projects, isLoading } = trpc.projects.list.useQuery();
  const createMutation = trpc.projects.create.useMutation({
    onSuccess: () => {
      utils.projects.list.invalidate();
      utils.projects.dashboard.invalidate();
      setOpen(false);
      reset();
      toast.success("Projeto criado com sucesso!");
    },
    onError: (e) => toast.error(e.message),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateForm>({ resolver: zodResolver(createSchema) });

  const filtered = projects?.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.financingOrgan ?? "").toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const onSubmit = (data: CreateForm) => createMutation.mutate(data);

  return (
    <AppLayout>
    <div className="space-y-6 transition-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projetos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gerencie todos os projetos institucionais
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus size={15} /> Novo Projeto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Criar Novo Projeto</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label htmlFor="title">Título do Projeto *</Label>
                <Input id="title" placeholder="Ex: Pesquisa em Saúde Pública 2025" {...register("title")} />
                {errors.title && (
                  <p className="text-xs text-destructive">{errors.title.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva brevemente o projeto..."
                  rows={3}
                  {...register("description")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="financingOrgan">Órgão Financiador</Label>
                <Input
                  id="financingOrgan"
                  placeholder="Ex: Ministério da Saúde"
                  {...register("financingOrgan")}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="totalBudget">Orçamento Total (R$)</Label>
                  <Input
                    id="totalBudget"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    {...register("totalBudget")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="startDate">Data de Início</Label>
                  <Input id="startDate" type="date" {...register("startDate")} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Criando..." : "Criar Projeto"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Buscar projetos..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card rounded-xl border p-5 animate-pulse">
              <div className="h-4 bg-secondary rounded w-3/4 mb-3" />
              <div className="h-3 bg-secondary rounded w-1/2 mb-4" />
              <div className="h-2 bg-secondary rounded w-full" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="Nenhum projeto encontrado"
          description={
            search
              ? "Tente ajustar os termos de busca"
              : "Crie seu primeiro projeto para começar"
          }
          action={
            !search && (
              <Button size="sm" onClick={() => setOpen(true)} className="gap-2">
                <Plus size={14} /> Criar Projeto
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project) => {
            const Icon =
              phaseIcons[project.phase as keyof typeof phaseIcons] ?? FolderOpen;
            const budgetPct =
              project.totalBudget && project.executedBudget
                ? Math.min(
                    100,
                    (parseFloat(project.executedBudget) /
                      parseFloat(project.totalBudget)) *
                      100
                  )
                : 0;

            return (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <div className="bg-card rounded-xl border p-5 hover:shadow-md transition-all duration-200 cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                      {project.financingOrgan && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {project.financingOrgan}
                        </p>
                      )}
                    </div>
                    <PhaseBadge phase={project.phase} />
                  </div>

                  {project.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                      {project.description}
                    </p>
                  )}

                  {project.totalBudget && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                        <span>Execução orçamentária</span>
                        <span className="font-medium text-foreground">
                          {budgetPct.toFixed(0)}%
                        </span>
                      </div>
                      <ProgressBar value={budgetPct} color="oklch(0.52 0.16 195)" />
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {project.startDate && (
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {new Date(project.startDate).toLocaleDateString("pt-BR")}
                      </span>
                    )}
                    {project.totalBudget && (
                      <span className="ml-auto font-medium text-foreground">
                        R${" "}
                        {parseFloat(project.totalBudget).toLocaleString("pt-BR", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
    </AppLayout>
  );
}
