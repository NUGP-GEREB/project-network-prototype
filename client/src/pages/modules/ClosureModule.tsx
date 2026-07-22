import { trpc } from "@/lib/trpc";
import { CheckCircle2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { SectionCard, StatusBadge } from "../../components/PhaseUtils";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";

type ClosureForm = {
  finalReportStatus: "pending" | "draft" | "submitted" | "under_review" | "approved" | "rejected";
  finalReportContent: string;
  accountingStatus: "pending" | "submitted" | "approved" | "rejected" | "in_diligence";
  accountingNotes: string;
  opinionStatus: "pending" | "favorable" | "unfavorable";
  opinionNotes: string;
  lessonsLearned: string;
};

const finalReportStatusLabels: Record<string, string> = {
  pending: "Pendente",
  draft: "Rascunho",
  submitted: "Submetido",
  under_review: "Em Análise",
  approved: "Aprovado",
  rejected: "Rejeitado",
};

const accountingStatusLabels: Record<string, string> = {
  pending: "Pendente",
  submitted: "Submetida",
  approved: "Aprovada",
  rejected: "Rejeitada",
  in_diligence: "Em Diligência",
};

export default function ClosureModule({ projectId }: { projectId: number }) {
  const { data, isLoading } = trpc.closure.get.useQuery({ projectId });
  const utils = trpc.useUtils();

  const saveMutation = trpc.closure.save.useMutation({
    onSuccess: () => {
      utils.closure.get.invalidate({ projectId });
      toast.success("Encerramento salvo com sucesso!");
    },
    onError: (e) => toast.error(e.message),
  });

  const { register, handleSubmit, reset, setValue, watch } = useForm<ClosureForm>();

  useEffect(() => {
    if (data) {
      reset({
        finalReportStatus: (data.finalReportStatus as ClosureForm["finalReportStatus"]) ?? "pending",
        finalReportContent: data.finalReportContent ?? "",
        accountingStatus: (data.accountingStatus as ClosureForm["accountingStatus"]) ?? "pending",
        accountingNotes: data.accountingNotes ?? "",
        opinionStatus: (data.opinionStatus as ClosureForm["opinionStatus"]) ?? "pending",
        opinionNotes: data.opinionNotes ?? "",
        lessonsLearned: data.lessonsLearned ?? "",
      });
    }
  }, [data, reset]);

  const onSubmit = (values: ClosureForm) => {
    saveMutation.mutate({ projectId, ...values });
  };

  const allApproved =
    data?.finalReportStatus === "approved" &&
    data?.accountingStatus === "approved" &&
    data?.opinionStatus === "favorable";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "oklch(0.93 0.03 240)" }}
          >
            <CheckCircle2 size={15} style={{ color: "oklch(0.28 0.10 240)" }} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Encerramento</h2>
            <p className="text-xs text-muted-foreground">
              Prestação de contas, análise e encerramento administrativo
            </p>
          </div>
        </div>
        {allApproved && (
          <span
            className="text-xs font-medium px-3 py-1.5 rounded-full"
            style={{ background: "oklch(0.93 0.05 145)", color: "oklch(0.28 0.18 145)" }}
          >
            ✓ Pronto para Encerramento
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Final Report */}
        <SectionCard
          title="Relatório Final"
          description="Elaboração e submissão do relatório final de execução"
          action={<StatusBadge status={watch("finalReportStatus") ?? "pending"} />}
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Status do Relatório Final</Label>
              <Select
                value={watch("finalReportStatus") ?? "pending"}
                onValueChange={(v) =>
                  setValue("finalReportStatus", v as ClosureForm["finalReportStatus"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(finalReportStatusLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Conteúdo do Relatório Final</Label>
              <Textarea
                placeholder="Descreva os resultados alcançados, atividades realizadas, recursos utilizados..."
                rows={6}
                {...register("finalReportContent")}
              />
            </div>
          </div>
        </SectionCard>

        {/* Accounting */}
        <SectionCard
          title="Prestação de Contas"
          description="Análise e aprovação da prestação de contas financeira"
          action={<StatusBadge status={watch("accountingStatus") ?? "pending"} />}
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Status da Prestação de Contas</Label>
              <Select
                value={watch("accountingStatus") ?? "pending"}
                onValueChange={(v) =>
                  setValue("accountingStatus", v as ClosureForm["accountingStatus"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(accountingStatusLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Observações / Diligências</Label>
              <Textarea
                placeholder="Observações sobre a prestação de contas, pendências, diligências..."
                rows={3}
                {...register("accountingNotes")}
              />
            </div>
          </div>
        </SectionCard>

        {/* Opinion */}
        <SectionCard
          title="Análise e Parecer"
          description="Parecer técnico sobre a execução do projeto"
          action={<StatusBadge status={watch("opinionStatus") ?? "pending"} />}
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Parecer</Label>
              <Select
                value={watch("opinionStatus") ?? "pending"}
                onValueChange={(v) =>
                  setValue("opinionStatus", v as ClosureForm["opinionStatus"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="favorable">Favorável</SelectItem>
                  <SelectItem value="unfavorable">Desfavorável</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Notas do Parecer</Label>
              <Textarea
                placeholder="Justificativa e observações do parecer técnico..."
                rows={3}
                {...register("opinionNotes")}
              />
            </div>
          </div>
        </SectionCard>

        {/* Lessons Learned */}
        <SectionCard
          title="Lições Aprendidas"
          description="Registro de aprendizados para projetos futuros"
        >
          <div className="space-y-1.5">
            <Label>Lições Aprendidas</Label>
            <Textarea
              placeholder="Registre os principais aprendizados, boas práticas identificadas e pontos de melhoria para projetos futuros..."
              rows={5}
              {...register("lessonsLearned")}
            />
          </div>
        </SectionCard>

        {/* Administrative Closure */}
        {data?.administrativeClosureAt && (
          <div
            className="rounded-xl p-4 border"
            style={{ background: "oklch(0.93 0.05 145)", borderColor: "oklch(0.85 0.08 145)" }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} style={{ color: "oklch(0.28 0.18 145)" }} />
              <p className="text-sm font-medium" style={{ color: "oklch(0.20 0.18 145)" }}>
                Encerramento Administrativo Concluído
              </p>
            </div>
            <p className="text-xs mt-1" style={{ color: "oklch(0.35 0.15 145)" }}>
              Encerrado em{" "}
              {new Date(data.administrativeClosureAt).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          {allApproved && !data?.administrativeClosureAt && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() =>
                saveMutation.mutate({
                  projectId,
                  finalReportStatus: "approved",
                  accountingStatus: "approved",
                  opinionStatus: "favorable",
                })
              }
              disabled={saveMutation.isPending}
            >
              Registrar Encerramento Administrativo
            </Button>
          )}
          <div className="ml-auto">
            <Button type="submit" size="sm" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
