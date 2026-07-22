import { Badge } from "./ui/badge";

export type ProjectPhase =
  | "pre_initiation"
  | "initiation"
  | "planning"
  | "execution"
  | "monitoring"
  | "closure"
  | "completed"
  | "cancelled";

const phaseConfig: Record<
  ProjectPhase,
  { label: string; bg: string; color: string }
> = {
  pre_initiation: {
    label: "Pré-Iniciação",
    bg: "oklch(0.94 0.04 270)",
    color: "oklch(0.35 0.12 270)",
  },
  initiation: {
    label: "Iniciação",
    bg: "oklch(0.92 0.05 200)",
    color: "oklch(0.28 0.16 200)",
  },
  planning: {
    label: "Planejamento",
    bg: "oklch(0.95 0.06 85)",
    color: "oklch(0.38 0.18 85)",
  },
  execution: {
    label: "Execução",
    bg: "oklch(0.95 0.06 25)",
    color: "oklch(0.38 0.20 25)",
  },
  monitoring: {
    label: "Monitoramento",
    bg: "oklch(0.93 0.05 145)",
    color: "oklch(0.30 0.18 145)",
  },
  closure: {
    label: "Encerramento",
    bg: "oklch(0.93 0.03 240)",
    color: "oklch(0.28 0.10 240)",
  },
  completed: {
    label: "Concluído",
    bg: "oklch(0.93 0.05 145)",
    color: "oklch(0.28 0.18 145)",
  },
  cancelled: {
    label: "Cancelado",
    bg: "oklch(0.93 0.01 0)",
    color: "oklch(0.38 0.05 0)",
  },
};

export function PhaseBadge({ phase }: { phase: ProjectPhase }) {
  const config = phaseConfig[phase] ?? phaseConfig.pre_initiation;
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ background: config.bg, color: config.color }}
    >
      {config.label}
    </span>
  );
}

export function getPhaseLabel(phase: ProjectPhase): string {
  return phaseConfig[phase]?.label ?? phase;
}

export function getPhaseColor(phase: ProjectPhase): string {
  return phaseConfig[phase]?.color ?? "oklch(0.50 0.05 240)";
}

export function getPhaseOrder(phase: ProjectPhase): number {
  const order: Record<ProjectPhase, number> = {
    pre_initiation: 0,
    initiation: 1,
    planning: 2,
    execution: 3,
    monitoring: 4,
    closure: 5,
    completed: 6,
    cancelled: 7,
  };
  return order[phase] ?? 0;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
type StatusVariant = "pending" | "approved" | "rejected" | "active" | "completed" | "cancelled" | "in_progress" | "on_track" | "at_risk" | "off_track" | string;

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  pending: { label: "Pendente", bg: "oklch(0.95 0.06 85)", color: "oklch(0.38 0.18 85)" },
  approved: { label: "Aprovado", bg: "oklch(0.93 0.05 145)", color: "oklch(0.28 0.18 145)" },
  rejected: { label: "Rejeitado", bg: "oklch(0.95 0.06 25)", color: "oklch(0.38 0.20 25)" },
  active: { label: "Ativo", bg: "oklch(0.93 0.05 145)", color: "oklch(0.28 0.18 145)" },
  completed: { label: "Concluído", bg: "oklch(0.93 0.05 145)", color: "oklch(0.28 0.18 145)" },
  cancelled: { label: "Cancelado", bg: "oklch(0.93 0.01 0)", color: "oklch(0.38 0.05 0)" },
  in_progress: { label: "Em Andamento", bg: "oklch(0.92 0.05 200)", color: "oklch(0.28 0.16 200)" },
  on_track: { label: "No Prazo", bg: "oklch(0.93 0.05 145)", color: "oklch(0.28 0.18 145)" },
  at_risk: { label: "Em Risco", bg: "oklch(0.95 0.06 85)", color: "oklch(0.38 0.18 85)" },
  off_track: { label: "Atrasado", bg: "oklch(0.95 0.06 25)", color: "oklch(0.38 0.20 25)" },
  draft: { label: "Rascunho", bg: "oklch(0.93 0.01 240)", color: "oklch(0.38 0.05 240)" },
  submitted: { label: "Submetido", bg: "oklch(0.92 0.05 200)", color: "oklch(0.28 0.16 200)" },
  under_review: { label: "Em Análise", bg: "oklch(0.95 0.06 85)", color: "oklch(0.38 0.18 85)" },
  favorable: { label: "Favorável", bg: "oklch(0.93 0.05 145)", color: "oklch(0.28 0.18 145)" },
  unfavorable: { label: "Desfavorável", bg: "oklch(0.95 0.06 25)", color: "oklch(0.38 0.20 25)" },
  requested: { label: "Solicitado", bg: "oklch(0.92 0.05 200)", color: "oklch(0.28 0.16 200)" },
  quoted: { label: "Cotado", bg: "oklch(0.95 0.06 85)", color: "oklch(0.38 0.18 85)" },
  bidding: { label: "Licitação", bg: "oklch(0.94 0.04 270)", color: "oklch(0.35 0.12 270)" },
  received: { label: "Recebido", bg: "oklch(0.93 0.05 145)", color: "oklch(0.28 0.18 145)" },
  paid: { label: "Pago", bg: "oklch(0.93 0.05 145)", color: "oklch(0.28 0.18 145)" },
  processed: { label: "Processado", bg: "oklch(0.93 0.05 145)", color: "oklch(0.28 0.18 145)" },
};

export function StatusBadge({ status }: { status: StatusVariant }) {
  const config = statusConfig[status] ?? { label: status, bg: "oklch(0.93 0.01 240)", color: "oklch(0.38 0.05 240)" };
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ background: config.bg, color: config.color }}
    >
      {config.label}
    </span>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
export function ProgressBar({
  value,
  max = 100,
  color,
  className = "",
}: {
  value: number;
  max?: number;
  color?: string;
  className?: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={`h-1.5 bg-secondary rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${pct}%`,
          background: color ?? "oklch(0.52 0.16 195)",
        }}
      />
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-4">
        <Icon size={24} className="text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
export function SectionCard({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-card rounded-xl border ${className}`}>
      <div className="flex items-start justify-between px-5 py-4 border-b">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
export function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
  trend,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  color: string;
  bg: string;
  trend?: { value: number; label: string };
}) {
  return (
    <div className="bg-card rounded-xl border p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: bg }}
        >
          <Icon size={18} style={{ color }} />
        </div>
        {trend && (
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              background: trend.value >= 0 ? "oklch(0.93 0.05 145)" : "oklch(0.95 0.06 25)",
              color: trend.value >= 0 ? "oklch(0.28 0.18 145)" : "oklch(0.38 0.20 25)",
            }}
          >
            {trend.value >= 0 ? "+" : ""}
            {trend.value}% {trend.label}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}
