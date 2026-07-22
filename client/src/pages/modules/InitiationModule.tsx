import { trpc } from "@/lib/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileSignature, Play } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { SectionCard, StatusBadge } from "../../components/PhaseUtils";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";

const schema = z.object({
  tedNumber: z.string().optional(),
  tedSignedDate: z.string().optional(),
  tedStatus: z.enum(["pending", "generated", "signed_fiocruz", "signed_both", "published"]).optional(),
  ordenadorDespesasId: z.string().optional(),
  responsavelTecnicoId: z.string().optional(),
  initialBudget: z.string().optional(),
  budgetSource: z.string().optional(),
  programCode: z.string().optional(),
  actionCode: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const tedStatusLabels: Record<string, string> = {
  pending: "Pendente",
  generated: "TED Gerado",
  signed_fiocruz: "Assinado pela Fiocruz",
  signed_both: "Assinado por Ambas as Partes",
  published: "Publicado no DOU",
};

export default function InitiationModule({ projectId }: { projectId: number }) {
  const { data, isLoading } = trpc.initiation.get.useQuery({ projectId });
  const { data: users } = trpc.users.list.useQuery();
  const utils = trpc.useUtils();

  const saveMutation = trpc.initiation.save.useMutation({
    onSuccess: () => {
      utils.initiation.get.invalidate({ projectId });
      toast.success("Iniciação salva com sucesso!");
    },
    onError: (e) => toast.error(e.message),
  });

  const { register, handleSubmit, reset, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (data) {
      reset({
        tedNumber: data.tedNumber ?? "",
        tedSignedDate: data.tedSignedDate
          ? new Date(data.tedSignedDate).toISOString().split("T")[0]
          : "",
        tedStatus: (data.tedStatus as FormData["tedStatus"]) ?? "pending",
        ordenadorDespesasId: data.ordenadorDespesasId?.toString() ?? "",
        responsavelTecnicoId: data.responsavelTecnicoId?.toString() ?? "",
        initialBudget: data.initialBudget ?? "",
        budgetSource: data.budgetSource ?? "",
        programCode: data.programCode ?? "",
        actionCode: data.actionCode ?? "",
      });
    }
  }, [data, reset]);

  const onSubmit = (values: FormData) => {
    saveMutation.mutate({
      projectId,
      ...values,
      ordenadorDespesasId: values.ordenadorDespesasId ? parseInt(values.ordenadorDespesasId) : undefined,
      responsavelTecnicoId: values.responsavelTecnicoId ? parseInt(values.responsavelTecnicoId) : undefined,
    });
  };

  const handleGenerateTED = () => {
    const tedNum = `TED-${new Date().getFullYear()}-${String(projectId).padStart(4, "0")}`;
    saveMutation.mutate({ projectId, tedNumber: tedNum, tedStatus: "generated" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "oklch(0.92 0.05 200)" }}
          >
            <Play size={15} style={{ color: "oklch(0.28 0.16 200)" }} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Iniciação</h2>
            <p className="text-xs text-muted-foreground">Formalização do projeto, TED e constituição de equipe</p>
          </div>
        </div>
        {data?.tedStatus && <StatusBadge status={data.tedStatus} />}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* TED */}
        <SectionCard
          title="Termo de Execução Descentralizada (TED)"
          description="Formalização do instrumento jurídico do projeto"
          action={
            !data?.tedNumber && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-2 text-xs"
                onClick={handleGenerateTED}
                disabled={saveMutation.isPending}
              >
                <FileSignature size={13} />
                Gerar TED
              </Button>
            )
          }
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Número do TED</Label>
              <Input placeholder="TED-2025-0001" {...register("tedNumber")} />
            </div>
            <div className="space-y-1.5">
              <Label>Status do TED</Label>
              <Select
                value={watch("tedStatus") ?? "pending"}
                onValueChange={(v) => setValue("tedStatus", v as FormData["tedStatus"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(tedStatusLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Data de Assinatura</Label>
              <Input type="date" {...register("tedSignedDate")} />
            </div>
            <div className="space-y-1.5">
              <Label>Código do Programa</Label>
              <Input placeholder="Ex: 0001" {...register("programCode")} />
            </div>
            <div className="space-y-1.5">
              <Label>Código da Ação</Label>
              <Input placeholder="Ex: 20TP" {...register("actionCode")} />
            </div>
          </div>
        </SectionCard>

        {/* Equipe */}
        <SectionCard title="Constituição de Equipe" description="Designação dos responsáveis pelo projeto">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Ordenador de Despesas</Label>
              <Select
                value={watch("ordenadorDespesasId") ?? ""}
                onValueChange={(v) => setValue("ordenadorDespesasId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar..." />
                </SelectTrigger>
                <SelectContent>
                  {users?.map((u) => (
                    <SelectItem key={u.id} value={u.id.toString()}>
                      {u.name ?? u.email ?? `#${u.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Responsável Técnico</Label>
              <Select
                value={watch("responsavelTecnicoId") ?? ""}
                onValueChange={(v) => setValue("responsavelTecnicoId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar..." />
                </SelectTrigger>
                <SelectContent>
                  {users?.map((u) => (
                    <SelectItem key={u.id} value={u.id.toString()}>
                      {u.name ?? u.email ?? `#${u.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </SectionCard>

        {/* Orçamento */}
        <SectionCard title="Planejamento Orçamentário Inicial" description="Recursos financeiros previstos">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Orçamento Inicial (R$)</Label>
              <Input type="number" step="0.01" placeholder="0,00" {...register("initialBudget")} />
            </div>
            <div className="space-y-1.5">
              <Label>Fonte de Recursos</Label>
              <Input placeholder="Ex: LOA 2025 / Tesouro Nacional" {...register("budgetSource")} />
            </div>
          </div>
        </SectionCard>

        <div className="flex justify-end pt-2">
          <Button type="submit" size="sm" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
