import { trpc } from "@/lib/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { Activity, DollarSign, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { EmptyState, SectionCard, StatusBadge } from "../../components/PhaseUtils";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Textarea } from "../../components/ui/textarea";

// ─── Purchases ────────────────────────────────────────────────────────────────
const purchaseSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  purchaseType: z.enum(["material", "service", "equipment", "other"]).optional(),
  estimatedValue: z.string().optional(),
  supplier: z.string().optional(),
  notes: z.string().optional(),
});

// ─── Financial ────────────────────────────────────────────────────────────────
const financialSchema = z.object({
  type: z.enum(["empenho", "liquidacao", "pagamento", "nota_fiscal", "devolucao"]),
  description: z.string().min(2),
  value: z.string(),
  referenceNumber: z.string().optional(),
  issueDate: z.string().optional(),
  dueDate: z.string().optional(),
  supplier: z.string().optional(),
  notes: z.string().optional(),
});

// ─── Activity ─────────────────────────────────────────────────────────────────
const activitySchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  responsible: z.string().optional(),
  notes: z.string().optional(),
});

const financialTypeLabels: Record<string, string> = {
  empenho: "Empenho",
  liquidacao: "Liquidação",
  pagamento: "Pagamento",
  nota_fiscal: "Nota Fiscal",
  devolucao: "Devolução",
};

const purchaseTypeLabels: Record<string, string> = {
  material: "Material",
  service: "Serviço",
  equipment: "Equipamento",
  other: "Outro",
};

export default function ExecutionModule({ projectId }: { projectId: number }) {
  const [purchaseDialog, setPurchaseDialog] = useState(false);
  const [financialDialog, setFinancialDialog] = useState(false);
  const [activityDialog, setActivityDialog] = useState(false);

  const { data: purchases } = trpc.execution.purchases.list.useQuery({ projectId });
  const { data: financials } = trpc.execution.financial.list.useQuery({ projectId });
  const { data: activities } = trpc.execution.activities.list.useQuery({ projectId });
  const utils = trpc.useUtils();

  const createPurchase = trpc.execution.purchases.create.useMutation({
    onSuccess: () => {
      utils.execution.purchases.list.invalidate({ projectId });
      setPurchaseDialog(false);
      purchaseForm.reset();
      toast.success("Solicitação de compra criada!");
    },
    onError: (e) => toast.error(e.message),
  });

  const updatePurchase = trpc.execution.purchases.update.useMutation({
    onSuccess: () => utils.execution.purchases.list.invalidate({ projectId }),
  });

  const createFinancial = trpc.execution.financial.create.useMutation({
    onSuccess: () => {
      utils.execution.financial.list.invalidate({ projectId });
      setFinancialDialog(false);
      financialForm.reset();
      toast.success("Registro financeiro criado!");
    },
    onError: (e) => toast.error(e.message),
  });

  const createActivity = trpc.execution.activities.create.useMutation({
    onSuccess: () => {
      utils.execution.activities.list.invalidate({ projectId });
      setActivityDialog(false);
      activityForm.reset();
      toast.success("Atividade criada!");
    },
    onError: (e) => toast.error(e.message),
  });

  const updateActivity = trpc.execution.activities.update.useMutation({
    onSuccess: () => utils.execution.activities.list.invalidate({ projectId }),
  });

  const purchaseForm = useForm<z.infer<typeof purchaseSchema>>({ resolver: zodResolver(purchaseSchema) });
  const financialForm = useForm<z.infer<typeof financialSchema>>({ resolver: zodResolver(financialSchema) });
  const activityForm = useForm<z.infer<typeof activitySchema>>({ resolver: zodResolver(activitySchema) });

  const totalEmpenho = financials?.filter((f) => f.type === "empenho").reduce((s, f) => s + parseFloat(f.value), 0) ?? 0;
  const totalPago = financials?.filter((f) => f.type === "pagamento").reduce((s, f) => s + parseFloat(f.value), 0) ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "oklch(0.95 0.06 25)" }}>
          <Activity size={15} style={{ color: "oklch(0.38 0.20 25)" }} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Execução</h2>
          <p className="text-xs text-muted-foreground">Gestão de compras, financeiro e atividades técnicas</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-xl border p-4">
          <p className="text-xs text-muted-foreground">Total Empenhado</p>
          <p className="text-lg font-bold text-foreground mt-1">
            R$ {totalEmpenho.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <p className="text-xs text-muted-foreground">Total Pago</p>
          <p className="text-lg font-bold text-foreground mt-1">
            R$ {totalPago.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <p className="text-xs text-muted-foreground">Compras em Andamento</p>
          <p className="text-lg font-bold text-foreground mt-1">
            {purchases?.filter((p) => !["paid", "cancelled"].includes(p.status ?? "")).length ?? 0}
          </p>
        </div>
      </div>

      <Tabs defaultValue="purchases">
        <TabsList className="bg-secondary p-1 rounded-xl">
          <TabsTrigger value="purchases" className="text-xs rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <ShoppingCart size={13} className="mr-1.5" /> Compras
          </TabsTrigger>
          <TabsTrigger value="financial" className="text-xs rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <DollarSign size={13} className="mr-1.5" /> Financeiro
          </TabsTrigger>
          <TabsTrigger value="activities" className="text-xs rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Activity size={13} className="mr-1.5" /> Atividades
          </TabsTrigger>
        </TabsList>

        {/* Purchases */}
        <TabsContent value="purchases" className="mt-4">
          <SectionCard
            title="Gestão de Compras"
            description="Solicitações, cotações, licitações e recebimentos"
            action={
              <Button size="sm" className="gap-2 text-xs h-8" onClick={() => setPurchaseDialog(true)}>
                <Plus size={13} /> Nova Solicitação
              </Button>
            }
          >
            {!purchases || purchases.length === 0 ? (
              <EmptyState
                icon={ShoppingCart}
                title="Nenhuma compra registrada"
                description="Crie uma solicitação de compra para iniciar o processo"
                action={
                  <Button size="sm" onClick={() => setPurchaseDialog(true)} className="gap-2 text-xs">
                    <Plus size={13} /> Nova Solicitação
                  </Button>
                }
              />
            ) : (
              <div className="space-y-2">
                {purchases.map((p) => (
                  <div key={p.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{p.title}</p>
                        {p.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">{p.description}</p>
                        )}
                        <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-muted-foreground">
                          <span>{purchaseTypeLabels[p.purchaseType ?? "material"]}</span>
                          {p.estimatedValue && (
                            <span>Estimado: R$ {parseFloat(p.estimatedValue).toLocaleString("pt-BR")}</span>
                          )}
                          {p.finalValue && (
                            <span className="font-medium text-foreground">
                              Final: R$ {parseFloat(p.finalValue).toLocaleString("pt-BR")}
                            </span>
                          )}
                          {p.supplier != null && <span>Fornecedor: {p.supplier}</span>}
                        </div>
                      </div>
                      <Select
                        value={p.status ?? "requested"}
                        onValueChange={(v) => updatePurchase.mutate({ id: p.id, status: v as any })}
                      >
                        <SelectTrigger className="h-7 text-xs w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="requested">Solicitado</SelectItem>
                          <SelectItem value="quoted">Cotado</SelectItem>
                          <SelectItem value="bidding">Licitação</SelectItem>
                          <SelectItem value="approved">Aprovado</SelectItem>
                          <SelectItem value="received">Recebido</SelectItem>
                          <SelectItem value="paid">Pago</SelectItem>
                          <SelectItem value="cancelled">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </TabsContent>

        {/* Financial */}
        <TabsContent value="financial" className="mt-4">
          <SectionCard
            title="Gestão Financeira"
            description="Empenhos, liquidações, notas fiscais e pagamentos"
            action={
              <Button size="sm" className="gap-2 text-xs h-8" onClick={() => setFinancialDialog(true)}>
                <Plus size={13} /> Novo Registro
              </Button>
            }
          >
            {!financials || financials.length === 0 ? (
              <EmptyState
                icon={DollarSign}
                title="Nenhum registro financeiro"
                description="Registre empenhos, liquidações e pagamentos"
                action={
                  <Button size="sm" onClick={() => setFinancialDialog(true)} className="gap-2 text-xs">
                    <Plus size={13} /> Novo Registro
                  </Button>
                }
              />
            ) : (
              <div className="space-y-2">
                {financials.map((f) => (
                  <div key={f.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{ background: "oklch(0.92 0.04 240)", color: "oklch(0.28 0.09 240)" }}
                          >
                            {financialTypeLabels[f.type]}
                          </span>
                          <p className="text-sm font-medium text-foreground truncate">{f.description}</p>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          {f.referenceNumber && <span>Ref: {f.referenceNumber}</span>}
                          {f.supplier && <span>{f.supplier}</span>}
                          {f.issueDate && (
                            <span>{new Date(f.issueDate).toLocaleDateString("pt-BR")}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-foreground">
                          R$ {parseFloat(f.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                        <StatusBadge status={f.status ?? "pending"} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </TabsContent>

        {/* Activities */}
        <TabsContent value="activities" className="mt-4">
          <SectionCard
            title="Atividades Técnicas"
            description="Execução das atividades planejadas"
            action={
              <Button size="sm" className="gap-2 text-xs h-8" onClick={() => setActivityDialog(true)}>
                <Plus size={13} /> Nova Atividade
              </Button>
            }
          >
            {!activities || activities.length === 0 ? (
              <EmptyState
                icon={Activity}
                title="Nenhuma atividade em execução"
                description="Registre as atividades técnicas em execução"
                action={
                  <Button size="sm" onClick={() => setActivityDialog(true)} className="gap-2 text-xs">
                    <Plus size={13} /> Nova Atividade
                  </Button>
                }
              />
            ) : (
              <div className="space-y-2">
                {activities.map((a) => (
                  <div key={a.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{a.title}</p>
                        {a.responsible && (
                          <p className="text-xs text-muted-foreground mt-0.5">Resp.: {a.responsible}</p>
                        )}
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>Progresso</span>
                            <span>{a.progressPercent ?? 0}%</span>
                          </div>
                          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${a.progressPercent ?? 0}%`,
                                background: "oklch(0.52 0.16 195)",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          className="w-16 h-7 text-xs text-center"
                          defaultValue={a.progressPercent ?? 0}
                          onBlur={(e) =>
                            updateActivity.mutate({
                              id: a.id,
                              progressPercent: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                        <Select
                          value={a.status ?? "pending"}
                          onValueChange={(v) =>
                            updateActivity.mutate({ id: a.id, status: v as any })
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </TabsContent>
      </Tabs>

      {/* Purchase Dialog */}
      <Dialog open={purchaseDialog} onOpenChange={setPurchaseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Nova Solicitação de Compra</DialogTitle></DialogHeader>
          <form onSubmit={purchaseForm.handleSubmit((v) => createPurchase.mutate({ projectId, ...v }))} className="space-y-3 mt-2">
            <div className="space-y-1.5">
              <Label>Título *</Label>
              <Input placeholder="Ex: Reagentes para laboratório" {...purchaseForm.register("title")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <Select value={purchaseForm.watch("purchaseType") ?? "material"} onValueChange={(v) => purchaseForm.setValue("purchaseType", v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(purchaseTypeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Valor Estimado (R$)</Label>
                <Input type="number" step="0.01" {...purchaseForm.register("estimatedValue")} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Fornecedor</Label>
              <Input placeholder="Nome do fornecedor" {...purchaseForm.register("supplier")} />
            </div>
            <div className="space-y-1.5">
              <Label>Observações</Label>
              <Textarea rows={2} {...purchaseForm.register("notes")} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setPurchaseDialog(false)}>Cancelar</Button>
              <Button type="submit" size="sm" disabled={createPurchase.isPending}>Criar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Financial Dialog */}
      <Dialog open={financialDialog} onOpenChange={setFinancialDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Novo Registro Financeiro</DialogTitle></DialogHeader>
          <form onSubmit={financialForm.handleSubmit((v) => createFinancial.mutate({ projectId, ...v }))} className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tipo *</Label>
                <Select value={financialForm.watch("type") ?? "empenho"} onValueChange={(v) => financialForm.setValue("type", v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(financialTypeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Valor (R$) *</Label>
                <Input type="number" step="0.01" {...financialForm.register("value")} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Descrição *</Label>
              <Input placeholder="Descreva o registro..." {...financialForm.register("description")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Nº de Referência</Label>
                <Input placeholder="Ex: NF-001" {...financialForm.register("referenceNumber")} />
              </div>
              <div className="space-y-1.5">
                <Label>Data de Emissão</Label>
                <Input type="date" {...financialForm.register("issueDate")} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Fornecedor/Credor</Label>
              <Input {...financialForm.register("supplier")} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setFinancialDialog(false)}>Cancelar</Button>
              <Button type="submit" size="sm" disabled={createFinancial.isPending}>Criar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Activity Dialog */}
      <Dialog open={activityDialog} onOpenChange={setActivityDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Nova Atividade Técnica</DialogTitle></DialogHeader>
          <form onSubmit={activityForm.handleSubmit((v) => createActivity.mutate({ projectId, ...v }))} className="space-y-3 mt-2">
            <div className="space-y-1.5">
              <Label>Título *</Label>
              <Input {...activityForm.register("title")} />
            </div>
            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Textarea rows={2} {...activityForm.register("description")} />
            </div>
            <div className="space-y-1.5">
              <Label>Responsável</Label>
              <Input {...activityForm.register("responsible")} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setActivityDialog(false)}>Cancelar</Button>
              <Button type="submit" size="sm" disabled={createActivity.isPending}>Criar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
