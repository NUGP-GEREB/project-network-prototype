import { trpc } from "@/lib/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpen, Send } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { SectionCard, StatusBadge } from "../../components/PhaseUtils";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";

const schema = z.object({
  demandDescription: z.string().optional(),
  justification: z.string().optional(),
  objectives: z.string().optional(),
  expectedResults: z.string().optional(),
  estimatedBudget: z.string().optional(),
  proposalStatus: z.enum(["draft", "submitted", "under_review", "approved", "rejected"]).optional(),
});

type FormData = z.infer<typeof schema>;

export default function PreInitiationModule({ projectId }: { projectId: number }) {
  const { data, isLoading } = trpc.preInitiation.get.useQuery({ projectId });
  const utils = trpc.useUtils();

  const saveMutation = trpc.preInitiation.save.useMutation({
    onSuccess: () => {
      utils.preInitiation.get.invalidate({ projectId });
      toast.success("Pré-iniciação salva com sucesso!");
    },
    onError: (e) => toast.error(e.message),
  });

  const { register, handleSubmit, reset, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (data) {
      reset({
        demandDescription: data.demandDescription ?? "",
        justification: data.justification ?? "",
        objectives: data.objectives ?? "",
        expectedResults: data.expectedResults ?? "",
        estimatedBudget: data.estimatedBudget ?? "",
        proposalStatus: (data.proposalStatus as FormData["proposalStatus"]) ?? "draft",
      });
    }
  }, [data, reset]);

  const onSubmit = (values: FormData) => {
    saveMutation.mutate({ projectId, ...values });
  };

  const handleSubmitProposal = () => {
    saveMutation.mutate({ projectId, proposalStatus: "submitted" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "oklch(0.94 0.04 270)" }}
          >
            <BookOpen size={15} style={{ color: "oklch(0.35 0.12 270)" }} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Pré-Iniciação</h2>
            <p className="text-xs text-muted-foreground">Identificação de demanda e proposta preliminar</p>
          </div>
        </div>
        {data?.proposalStatus && <StatusBadge status={data.proposalStatus} />}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <SectionCard title="Identificação da Demanda" description="Descreva a necessidade que origina este projeto">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Descrição da Demanda</Label>
              <Textarea
                placeholder="Descreva a demanda ou necessidade identificada..."
                rows={4}
                {...register("demandDescription")}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Justificativa</Label>
              <Textarea
                placeholder="Por que este projeto é necessário? Qual problema resolve?"
                rows={3}
                {...register("justification")}
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Proposta Preliminar" description="Objetivos, resultados esperados e estimativa orçamentária">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Objetivos</Label>
              <Textarea
                placeholder="Quais são os objetivos principais do projeto?"
                rows={3}
                {...register("objectives")}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Resultados Esperados</Label>
              <Textarea
                placeholder="Quais resultados e impactos são esperados?"
                rows={3}
                {...register("expectedResults")}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Estimativa Orçamentária (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  {...register("estimatedBudget")}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Status da Proposta</Label>
                <Select
                  value={watch("proposalStatus") ?? "draft"}
                  onValueChange={(v) => setValue("proposalStatus", v as FormData["proposalStatus"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="submitted">Submetida</SelectItem>
                    <SelectItem value="under_review">Em Análise</SelectItem>
                    <SelectItem value="approved">Aprovada</SelectItem>
                    <SelectItem value="rejected">Rejeitada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </SectionCard>

        {data?.validationNotes && (
          <SectionCard title="Parecer de Validação">
            <p className="text-sm text-foreground">{data.validationNotes}</p>
            {data.validatedAt && (
              <p className="text-xs text-muted-foreground mt-2">
                Validado em {new Date(data.validatedAt).toLocaleDateString("pt-BR")}
              </p>
            )}
          </SectionCard>
        )}

        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleSubmitProposal}
            disabled={saveMutation.isPending || data?.proposalStatus === "submitted" || data?.proposalStatus === "approved"}
          >
            <Send size={14} />
            Submeter para Validação
          </Button>
          <Button type="submit" size="sm" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
