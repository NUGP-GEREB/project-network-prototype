import { trpc } from "@/lib/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { BarChart3, Plus, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { EmptyState, ProgressBar, SectionCard } from "../../components/PhaseUtils";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";

const reportSchema = z.object({
  title: z.string().min(2),
  reportType: z.enum(["progress", "financial", "quality", "risk"]).optional(),
  content: z.string().optional(),
  physicalProgress: z.number().min(0).max(100).optional(),
  financialProgress: z.number().min(0).max(100).optional(),
  qualityStatus: z.enum(["on_track", "at_risk", "off_track"]).optional(),
  issues: z.string().optional(),
  actions: z.string().optional(),
});

type ReportForm = z.infer<typeof reportSchema>;

const reportTypeLabels: Record<string, string> = {
  progress: "Progresso",
  financial: "Financeiro",
  quality: "Qualidade",
  risk: "Riscos",
};

const statusColors: Record<string, { bg: string; color: string; label: string }> = {
  on_track: { bg: "oklch(0.93 0.05 145)", color: "oklch(0.28 0.18 145)", label: "No Prazo" },
  at_risk: { bg: "oklch(0.95 0.06 85)", color: "oklch(0.38 0.18 85)", label: "Em Risco" },
  off_track: { bg: "oklch(0.95 0.06 25)", color: "oklch(0.38 0.20 25)", label: "Atrasado" },
};

export default function MonitoringModule({ projectId }: { projectId: number }) {
  const [reportDialog, setReportDialog] = useState(false);

  const { data: reports } = trpc.monitoring.list.useQuery({ projectId });
  const utils = trpc.useUtils();

  const createReport = trpc.monitoring.create.useMutation({
    onSuccess: () => {
      utils.monitoring.list.invalidate({ projectId });
      setReportDialog(false);
      form.reset();
      toast.success("Relatório criado!");
    },
    onError: (e) => toast.error(e.message),
  });

  const updateReport = trpc.monitoring.update.useMutation({
    onSuccess: () => utils.monitoring.list.invalidate({ projectId }),
  });

  const form = useForm<ReportForm>();

  // Summary stats
  const lastReport = reports?.[reports.length - 1];
  const avgPhysical = reports?.length
    ? Math.round(reports.reduce((s, r) => s + (r.physicalProgress ?? 0), 0) / reports.length)
    : 0;
  const avgFinancial = reports?.length
    ? Math.round(reports.reduce((s, r) => s + (r.financialProgress ?? 0), 0) / reports.length)
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "oklch(0.93 0.05 145)" }}>
          <TrendingUp size={15} style={{ color: "oklch(0.30 0.18 145)" }} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Monitoramento e Controle</h2>
          <p className="text-xs text-muted-foreground">Indicadores, controle de qualidade e relatórios de progresso</p>
        </div>
      </div>

      {/* Summary */}
      {reports && reports.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl border p-4">
            <p className="text-xs text-muted-foreground">Progresso Físico Médio</p>
            <p className="text-2xl font-bold text-foreground mt-1">{avgPhysical}%</p>
            <ProgressBar value={avgPhysical} color="oklch(0.52 0.16 195)" className="mt-2" />
          </div>
          <div className="bg-card rounded-xl border p-4">
            <p className="text-xs text-muted-foreground">Progresso Financeiro Médio</p>
            <p className="text-2xl font-bold text-foreground mt-1">{avgFinancial}%</p>
            <ProgressBar value={avgFinancial} color="oklch(0.38 0.18 85)" className="mt-2" />
          </div>
          <div className="bg-card rounded-xl border p-4">
            <p className="text-xs text-muted-foreground">Status Atual</p>
            {lastReport?.qualityStatus ? (
              <>
                <p className="text-lg font-bold text-foreground mt-1">
                  {statusColors[lastReport.qualityStatus]?.label ?? "—"}
                </p>
                <div
                  className="h-1.5 rounded-full mt-2"
                  style={{ background: statusColors[lastReport.qualityStatus]?.bg }}
                />
              </>
            ) : (
              <p className="text-lg font-bold text-muted-foreground mt-1">—</p>
            )}
          </div>
        </div>
      )}

      {/* Reports List */}
      <SectionCard
        title="Relatórios de Progresso"
        description="Acompanhamento periódico da execução do projeto"
        action={
          <Button size="sm" className="gap-2 text-xs h-8" onClick={() => setReportDialog(true)}>
            <Plus size={13} /> Novo Relatório
          </Button>
        }
      >
        {!reports || reports.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="Nenhum relatório registrado"
            description="Crie relatórios periódicos de acompanhamento do projeto"
            action={
              <Button size="sm" onClick={() => setReportDialog(true)} className="gap-2 text-xs">
                <Plus size={13} /> Novo Relatório
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {reports.map((r) => {
              const sc = statusColors[r.qualityStatus ?? "on_track"];
              return (
                <div key={r.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{ background: "oklch(0.92 0.04 240)", color: "oklch(0.28 0.09 240)" }}
                        >
                          {reportTypeLabels[r.reportType ?? "progress"]}
                        </span>
                        <p className="text-sm font-medium text-foreground">{r.title}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    {r.qualityStatus && (
                      <span
                        className="text-xs font-medium px-2.5 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: sc.bg, color: sc.color }}
                      >
                        {sc.label}
                      </span>
                    )}
                  </div>

                  {/* Progress bars */}
                  {(r.physicalProgress != null || r.financialProgress != null) && (
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      {r.physicalProgress != null && (
                        <div>
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Físico</span>
                            <span className="font-medium text-foreground">{r.physicalProgress}%</span>
                          </div>
                          <ProgressBar value={r.physicalProgress} color="oklch(0.52 0.16 195)" />
                        </div>
                      )}
                      {r.financialProgress != null && (
                        <div>
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Financeiro</span>
                            <span className="font-medium text-foreground">{r.financialProgress}%</span>
                          </div>
                          <ProgressBar value={r.financialProgress} color="oklch(0.38 0.18 85)" />
                        </div>
                      )}
                    </div>
                  )}

                  {r.content && (
                    <p className="text-xs text-muted-foreground mb-2">{r.content}</p>
                  )}

                  {r.issues && (
                    <div className="bg-secondary/50 rounded-lg p-2.5 mb-2">
                      <p className="text-xs font-medium text-foreground mb-0.5">Problemas / Riscos</p>
                      <p className="text-xs text-muted-foreground">{r.issues}</p>
                    </div>
                  )}

                  {r.actions && (
                    <div className="bg-secondary/50 rounded-lg p-2.5">
                      <p className="text-xs font-medium text-foreground mb-0.5">Ações / Próximos Passos</p>
                      <p className="text-xs text-muted-foreground">{r.actions}</p>
                    </div>
                  )}

                  {/* Quick update status */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                    <span className="text-xs text-muted-foreground">Atualizar status:</span>
                    <Select
                      value={r.qualityStatus ?? "on_track"}
                      onValueChange={(v) => updateReport.mutate({ id: r.id, qualityStatus: v as any })}
                    >
                      <SelectTrigger className="h-7 text-xs w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="on_track">No Prazo</SelectItem>
                        <SelectItem value="at_risk">Em Risco</SelectItem>
                        <SelectItem value="off_track">Atrasado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* Report Dialog */}
      <Dialog open={reportDialog} onOpenChange={setReportDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Novo Relatório de Progresso</DialogTitle></DialogHeader>
          <form
            onSubmit={form.handleSubmit((v) => createReport.mutate({ projectId, title: v.title, reportType: v.reportType, content: v.content, physicalProgress: v.physicalProgress, financialProgress: v.financialProgress, qualityStatus: v.qualityStatus, issues: v.issues, actions: v.actions }))}
            className="space-y-3 mt-2"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Título *</Label>
                <Input placeholder="Ex: Relatório Mensal Jan/2025" {...form.register("title")} />
              </div>
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <Select
                  value={form.watch("reportType") ?? "progress"}
                  onValueChange={(v) => form.setValue("reportType", v as any)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(reportTypeLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Progresso Físico (%)</Label>
                <Input type="number" min={0} max={100} {...form.register("physicalProgress")} />
              </div>
              <div className="space-y-1.5">
                <Label>Progresso Financeiro (%)</Label>
                <Input type="number" min={0} max={100} {...form.register("financialProgress")} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Status Geral</Label>
              <Select
                value={form.watch("qualityStatus") ?? "on_track"}
                onValueChange={(v) => form.setValue("qualityStatus", v as any)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="on_track">No Prazo</SelectItem>
                  <SelectItem value="at_risk">Em Risco</SelectItem>
                  <SelectItem value="off_track">Atrasado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Conteúdo / Resumo</Label>
              <Textarea rows={3} placeholder="Descreva o progresso do período..." {...form.register("content")} />
            </div>
            <div className="space-y-1.5">
              <Label>Problemas e Riscos</Label>
              <Textarea rows={2} placeholder="Dificuldades encontradas..." {...form.register("issues")} />
            </div>
            <div className="space-y-1.5">
              <Label>Ações e Próximos Passos</Label>
              <Textarea rows={2} placeholder="Ações planejadas..." {...form.register("actions")} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setReportDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={createReport.isPending}>
                {createReport.isPending ? "Criando..." : "Criar Relatório"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
