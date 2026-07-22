import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import AppLayout from "../components/AppLayout";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";

const typeLabels: Record<string, string> = {
  proposal_validation: "Validação de Proposta",
  ted_approval: "Aprovação de TED",
  planning_internal: "Aprovação Interna de Planejamento",
  planning_financier: "Aprovação do Financiador",
  purchase_approval: "Aprovação de Compra",
  final_report: "Relatório Final",
  accounting_approval: "Aprovação de Prestação de Contas",
  closure: "Encerramento",
};

const statusConfig: Record<string, { label: string; bg: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pendente", bg: "oklch(0.95 0.06 85)", color: "oklch(0.38 0.18 85)", icon: Clock },
  approved: { label: "Aprovado", bg: "oklch(0.93 0.05 145)", color: "oklch(0.28 0.18 145)", icon: CheckCircle2 },
  rejected: { label: "Rejeitado", bg: "oklch(0.95 0.06 25)", color: "oklch(0.38 0.20 25)", icon: XCircle },
  cancelled: { label: "Cancelado", bg: "oklch(0.94 0.008 240)", color: "oklch(0.40 0.05 240)", icon: XCircle },
};

export default function Approvals() {
  const { user } = useAuth();
  const [decideDialog, setDecideDialog] = useState<{ id: number; decision: "approved" | "rejected" } | null>(null);
  const [notes, setNotes] = useState("");

  const { data: pending } = trpc.approvals.pending.useQuery();
  const utils = trpc.useUtils();

  const decide = trpc.approvals.decide.useMutation({
    onSuccess: () => {
      utils.approvals.pending.invalidate();
      setDecideDialog(null);
      setNotes("");
      toast.success("Decisão registrada!");
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">Aprovações Pendentes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Fluxo de aprovações para etapas críticas dos projetos
          </p>
        </div>

        {!pending || pending.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle2 size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-sm font-medium text-muted-foreground">Nenhuma aprovação pendente</p>
            <p className="text-xs text-muted-foreground mt-1">
              Todas as solicitações foram processadas
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((approval) => {
              const sc = statusConfig[approval.status ?? "pending"];
              const Icon = sc.icon;
              return (
                <div key={approval.id} className="bg-card border rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-xs font-medium px-2.5 py-0.5 rounded-full"
                          style={{ background: "oklch(0.92 0.04 240)", color: "oklch(0.28 0.09 240)" }}
                        >
                          {typeLabels[approval.type] ?? approval.type}
                        </span>
                        <span
                          className="text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1"
                          style={{ background: sc.bg, color: sc.color }}
                        >
                          <Icon size={10} />
                          {sc.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Projeto #{approval.projectId}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Solicitado em{" "}
                        {new Date(approval.requestedAt ?? approval.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                      {approval.notes && (
                        <p className="text-xs text-muted-foreground mt-2 bg-secondary/50 rounded-lg p-2">
                          {approval.notes}
                        </p>
                      )}
                    </div>
                    {approval.status === "pending" && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs gap-1.5 h-8"
                          style={{ borderColor: "oklch(0.85 0.08 25)", color: "oklch(0.38 0.20 25)" }}
                          onClick={() => setDecideDialog({ id: approval.id, decision: "rejected" })}
                        >
                          <XCircle size={12} /> Rejeitar
                        </Button>
                        <Button
                          size="sm"
                          className="text-xs gap-1.5 h-8"
                          style={{ background: "oklch(0.52 0.16 145)", color: "white" }}
                          onClick={() => setDecideDialog({ id: approval.id, decision: "approved" })}
                        >
                          <CheckCircle2 size={12} /> Aprovar
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={!!decideDialog} onOpenChange={() => setDecideDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {decideDialog?.decision === "approved" ? "Confirmar Aprovação" : "Confirmar Rejeição"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-1.5">
              <Label>Observações (opcional)</Label>
              <Textarea
                rows={3}
                placeholder="Justificativa ou comentários..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setDecideDialog(null)}>
                Cancelar
              </Button>
              <Button
                size="sm"
                disabled={decide.isPending}
                style={
                  decideDialog?.decision === "approved"
                    ? { background: "oklch(0.52 0.16 145)", color: "white" }
                    : { background: "oklch(0.52 0.16 25)", color: "white" }
                }
                onClick={() => {
                  if (decideDialog) {
                    decide.mutate({
                      id: decideDialog.id,
                      status: decideDialog.decision,
                      notes: notes || undefined,
                    });
                  }
                }}
              >
                {decide.isPending
                  ? "Processando..."
                  : decideDialog?.decision === "approved"
                  ? "Confirmar Aprovação"
                  : "Confirmar Rejeição"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
