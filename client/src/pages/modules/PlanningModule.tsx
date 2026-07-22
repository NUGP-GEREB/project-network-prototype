import { trpc } from "@/lib/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Plus, Target, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { EmptyState, SectionCard, StatusBadge } from "../../components/PhaseUtils";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";

const planningSchema = z.object({
  technicalViability: z.string().optional(),
  financialViability: z.string().optional(),
  riskAnalysis: z.string().optional(),
  internalApprovalStatus: z.enum(["pending", "approved", "rejected"]).optional(),
  financierApprovalStatus: z.enum(["pending", "approved", "rejected"]).optional(),
});

const activitySchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  responsible: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  goal: z.string().optional(),
  indicator: z.string().optional(),
  targetValue: z.string().optional(),
  budget: z.string().optional(),
});

type PlanningForm = z.infer<typeof planningSchema>;
type ActivityForm = z.infer<typeof activitySchema>;

export default function PlanningModule({ projectId }: { projectId: number }) {
  const { data: planning } = trpc.planning.get.useQuery({ projectId });
  const { data: activities, isLoading: activitiesLoading } = trpc.planning.activities.list.useQuery({ projectId });
  const utils = trpc.useUtils();
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);

  const savePlanning = trpc.planning.save.useMutation({
    onSuccess: () => {
      utils.planning.get.invalidate({ projectId });
      toast.success("Planejamento salvo!");
    },
    onError: (e) => toast.error(e.message),
  });

  const createActivity = trpc.planning.activities.create.useMutation({
    onSuccess: () => {
      utils.planning.activities.list.invalidate({ projectId });
      setActivityDialogOpen(false);
      activityForm.reset();
      toast.success("Atividade criada!");
    },
    onError: (e) => toast.error(e.message),
  });

  const updateActivity = trpc.planning.activities.update.useMutation({
    onSuccess: () => utils.planning.activities.list.invalidate({ projectId }),
  });

  const deleteActivity = trpc.planning.activities.delete.useMutation({
    onSuccess: () => utils.planning.activities.list.invalidate({ projectId }),
  });

  const planningForm = useForm<PlanningForm>({ resolver: zodResolver(planningSchema) });
  const activityForm = useForm<ActivityForm>({ resolver: zodResolver(activitySchema) });

  useEffect(() => {
    if (planning) {
      planningForm.reset({
        technicalViability: planning.technicalViability ?? "",
        financialViability: planning.financialViability ?? "",
        riskAnalysis: planning.riskAnalysis ?? "",
        internalApprovalStatus: (planning.internalApprovalStatus as PlanningForm["internalApprovalStatus"]) ?? "pending",
        financierApprovalStatus: (planning.financierApprovalStatus as PlanningForm["financierApprovalStatus"]) ?? "pending",
      });
    }
  }, [planning]);

  const statusColors: Record<string, string> = {
    pending: "oklch(0.38 0.18 85)",
    in_progress: "oklch(0.28 0.16 200)",
    completed: "oklch(0.28 0.18 145)",
    cancelled: "oklch(0.38 0.05 0)",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "oklch(0.95 0.06 85)" }}>
          <Target size={15} style={{ color: "oklch(0.38 0.18 85)" }} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Planejamento</h2>
          <p className="text-xs text-muted-foreground">Atividades, metas, cronograma e análise de viabilidade</p>
        </div>
      </div>

      {/* Activities */}
      <SectionCard
        title="Atividades e Metas"
        description="Desdobramento detalhado das atividades do projeto"
        action={
          <Button size="sm" className="gap-2 text-xs h-8" onClick={() => setActivityDialogOpen(true)}>
            <Plus size={13} /> Adicionar Atividade
          </Button>
        }
      >
        {activitiesLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-secondary rounded-lg animate-pulse" />
            ))}
          </div>
        ) : !activities || activities.length === 0 ? (
          <EmptyState
            icon={Target}
            title="Nenhuma atividade cadastrada"
            description="Adicione as atividades e metas do projeto"
            action={
              <Button size="sm" onClick={() => setActivityDialogOpen(true)} className="gap-2 text-xs">
                <Plus size={13} /> Adicionar
              </Button>
            }
          />
        ) : (
          <div className="space-y-2">
            {activities.map((activity) => (
              <div key={activity.id} className="border rounded-lg p-4 hover:bg-secondary/30 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: statusColors[activity.status] ?? "oklch(0.38 0.18 85)" }}
                      />
                      <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                    </div>
                    {activity.description && (
                      <p className="text-xs text-muted-foreground ml-4">{activity.description}</p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-2 ml-4 text-xs text-muted-foreground">
                      {activity.responsible && <span>Resp.: {activity.responsible}</span>}
                      {activity.startDate && (
                        <span>
                          {new Date(activity.startDate).toLocaleDateString("pt-BR")}
                          {activity.endDate && ` → ${new Date(activity.endDate).toLocaleDateString("pt-BR")}`}
                        </span>
                      )}
                      {activity.goal && <span>Meta: {activity.goal}</span>}
                      {activity.budget && (
                        <span>R$ {parseFloat(activity.budget).toLocaleString("pt-BR")}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Select
                      value={activity.status}
                      onValueChange={(v) =>
                        updateActivity.mutate({ id: activity.id, status: v as typeof activity.status })
                      }
                    >
                      <SelectTrigger className="h-7 text-xs w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="in_progress">Em Andamento</SelectItem>
                        <SelectItem value="completed">Concluída</SelectItem>
                        <SelectItem value="cancelled">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteActivity.mutate({ id: activity.id })}
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Viability & Approvals */}
      <form onSubmit={planningForm.handleSubmit((v) => savePlanning.mutate({ projectId, ...v }))}>
        <div className="space-y-4">
          <SectionCard title="Análise de Viabilidade" description="Avaliação técnica e financeira do projeto">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Viabilidade Técnica</Label>
                <Textarea
                  placeholder="Análise da viabilidade técnica do projeto..."
                  rows={3}
                  {...planningForm.register("technicalViability")}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Viabilidade Financeira</Label>
                <Textarea
                  placeholder="Análise da viabilidade financeira e orçamentária..."
                  rows={3}
                  {...planningForm.register("financialViability")}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Análise de Riscos</Label>
                <Textarea
                  placeholder="Identificação e análise dos principais riscos..."
                  rows={3}
                  {...planningForm.register("riskAnalysis")}
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Aprovações" description="Status das aprovações necessárias para avançar">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Aprovação Interna (Fiocruz)</Label>
                <Select
                  value={planningForm.watch("internalApprovalStatus") ?? "pending"}
                  onValueChange={(v) => planningForm.setValue("internalApprovalStatus", v as PlanningForm["internalApprovalStatus"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="approved">Aprovado</SelectItem>
                    <SelectItem value="rejected">Rejeitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Aprovação do Financiador</Label>
                <Select
                  value={planningForm.watch("financierApprovalStatus") ?? "pending"}
                  onValueChange={(v) => planningForm.setValue("financierApprovalStatus", v as PlanningForm["financierApprovalStatus"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="approved">Aprovado</SelectItem>
                    <SelectItem value="rejected">Rejeitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </SectionCard>

          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={savePlanning.isPending}>
              {savePlanning.isPending ? "Salvando..." : "Salvar Planejamento"}
            </Button>
          </div>
        </div>
      </form>

      {/* Activity Dialog */}
      <Dialog open={activityDialogOpen} onOpenChange={setActivityDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova Atividade</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={activityForm.handleSubmit((v) =>
              createActivity.mutate({ projectId, ...v })
            )}
            className="space-y-3 mt-2"
          >
            <div className="space-y-1.5">
              <Label>Título *</Label>
              <Input placeholder="Nome da atividade" {...activityForm.register("title")} />
            </div>
            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Textarea rows={2} placeholder="Descreva a atividade..." {...activityForm.register("description")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Responsável</Label>
                <Input placeholder="Nome do responsável" {...activityForm.register("responsible")} />
              </div>
              <div className="space-y-1.5">
                <Label>Orçamento (R$)</Label>
                <Input type="number" step="0.01" placeholder="0,00" {...activityForm.register("budget")} />
              </div>
              <div className="space-y-1.5">
                <Label>Data Início</Label>
                <Input type="date" {...activityForm.register("startDate")} />
              </div>
              <div className="space-y-1.5">
                <Label>Data Fim</Label>
                <Input type="date" {...activityForm.register("endDate")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Meta</Label>
                <Input placeholder="Ex: Publicar 3 artigos" {...activityForm.register("goal")} />
              </div>
              <div className="space-y-1.5">
                <Label>Indicador</Label>
                <Input placeholder="Ex: Nº de publicações" {...activityForm.register("indicator")} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setActivityDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={createActivity.isPending}>
                {createActivity.isPending ? "Criando..." : "Criar Atividade"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
