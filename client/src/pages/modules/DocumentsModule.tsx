import { trpc } from "@/lib/trpc";
import { Download, FileText, Plus, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { EmptyState, SectionCard } from "../../components/PhaseUtils";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";

const phaseLabels: Record<string, string> = {
  pre_initiation: "Pré-Iniciação",
  initiation: "Iniciação",
  planning: "Planejamento",
  execution: "Execução",
  monitoring: "Monitoramento",
  closure: "Encerramento",
  general: "Geral",
};

export default function DocumentsModule({ projectId }: { projectId: number }) {
  const [uploadDialog, setUploadDialog] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<string>("all");
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    phase: "general",
    description: "",
    version: "1.0",
  });
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: documents, isLoading } = trpc.documents.list.useQuery({
    projectId,
    phase: selectedPhase === "all" ? undefined : selectedPhase,
  });

  const utils = trpc.useUtils();

  const uploadMutation = trpc.documents.upload.useMutation({
    onSuccess: () => {
      utils.documents.list.invalidate({ projectId });
      setUploadDialog(false);
      setFormData({ title: "", phase: "general", description: "", version: "1.0" });
      toast.success("Documento enviado com sucesso!");
    },
    onError: (e) => toast.error(e.message),
  });

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      toast.error("Selecione um arquivo");
      return;
    }
    if (!formData.title) {
      toast.error("Informe o título do documento");
      return;
    }

    setUploading(true);
    try {
      // Convert to base64 for upload
      const buffer = await file.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
      );

      uploadMutation.mutate({
        projectId,
        title: formData.title,
        phase: formData.phase as any,
        description: formData.description || undefined,
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
        fileBase64: base64,
      });
    } catch (err) {
      toast.error("Erro ao processar arquivo");
    } finally {
      setUploading(false);
    }
  };

  const iconByType = (type: string) => {
    if (type.includes("pdf")) return "📄";
    if (type.includes("word") || type.includes("doc")) return "📝";
    if (type.includes("excel") || type.includes("sheet") || type.includes("xls")) return "📊";
    if (type.includes("image")) return "🖼️";
    return "📎";
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "oklch(0.92 0.04 240)" }}
          >
            <FileText size={15} style={{ color: "oklch(0.28 0.09 240)" }} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Gestão de Documentos</h2>
            <p className="text-xs text-muted-foreground">
              Upload, armazenamento e versionamento de documentos
            </p>
          </div>
        </div>
        <Button size="sm" className="gap-2 text-xs" onClick={() => setUploadDialog(true)}>
          <Upload size={13} /> Enviar Documento
        </Button>
      </div>

      {/* Phase Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {["all", ...Object.keys(phaseLabels)].map((phase) => (
          <button
            key={phase}
            onClick={() => setSelectedPhase(phase)}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={
              selectedPhase === phase
                ? { background: "oklch(0.28 0.09 240)", color: "white" }
                : { background: "oklch(0.94 0.008 240)", color: "oklch(0.40 0.05 240)" }
            }
          >
            {phase === "all" ? "Todos" : phaseLabels[phase]}
          </button>
        ))}
      </div>

      {/* Documents List */}
      <SectionCard title="Documentos" description={`${documents?.length ?? 0} documento(s) encontrado(s)`}>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-secondary rounded-lg animate-pulse" />
            ))}
          </div>
        ) : !documents || documents.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Nenhum documento encontrado"
            description="Envie documentos relacionados ao projeto"
            action={
              <Button size="sm" onClick={() => setUploadDialog(true)} className="gap-2 text-xs">
                <Upload size={13} /> Enviar Documento
              </Button>
            }
          />
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-secondary/30 transition-colors"
              >
                <span className="text-2xl flex-shrink-0">{iconByType(doc.mimeType ?? "")}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">{doc.title}</p>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded flex-shrink-0"
                      style={{ background: "oklch(0.92 0.04 240)", color: "oklch(0.28 0.09 240)" }}
                    >
                      v{doc.version}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                    <span>{phaseLabels[doc.phase ?? "general"] ?? doc.phase}</span>
                    {doc.fileSize != null && <span>{formatSize(doc.fileSize)}</span>}
                    <span>{new Date(doc.createdAt).toLocaleDateString("pt-BR")}</span>
                  </div>
                  {doc.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{doc.description}</p>
                  )}
                </div>
                {doc.fileUrl && (
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0"
                  >
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download size={14} />
                    </Button>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Upload Dialog */}
      <Dialog open={uploadDialog} onOpenChange={setUploadDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar Documento</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-1.5">
              <Label>Arquivo *</Label>
              <div
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-secondary/30 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                <Upload size={24} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Clique para selecionar ou arraste o arquivo
                </p>
                <p className="text-xs text-muted-foreground mt-1">PDF, Word, Excel, imagens</p>
              </div>
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && !formData.title) {
                    setFormData((p) => ({
                      ...p,
                      title: file.name.replace(/\.[^/.]+$/, ""),
                    }));
                  }
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Título *</Label>
              <Input
                placeholder="Nome do documento"
                value={formData.title}
                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Fase</Label>
                <Select
                  value={formData.phase}
                  onValueChange={(v) => setFormData((p) => ({ ...p, phase: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(phaseLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Versão</Label>
                <Input
                  placeholder="1.0"
                  value={formData.version}
                  onChange={(e) => setFormData((p) => ({ ...p, version: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Textarea
                rows={2}
                placeholder="Descrição opcional do documento..."
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setUploadDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleUpload}
                disabled={uploading || uploadMutation.isPending}
                className="gap-2"
              >
                <Upload size={13} />
                {uploading || uploadMutation.isPending ? "Enviando..." : "Enviar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
