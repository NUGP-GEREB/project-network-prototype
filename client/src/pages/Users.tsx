import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Shield, Users2 } from "lucide-react";
import AppLayout from "../components/AppLayout";

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  user: "Usuário",
};

export default function Users() {
  const { user } = useAuth();
  const { data: users, isLoading } = trpc.users.list.useQuery();

  if (user?.role !== "admin") {
    return (
      <AppLayout>
        <div className="p-6 text-center py-16">
          <Shield size={48} className="mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-sm font-medium text-muted-foreground">Acesso restrito</p>
          <p className="text-xs text-muted-foreground mt-1">
            Apenas administradores podem acessar esta página
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">Usuários</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestão de usuários e controle de acesso
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-secondary rounded-xl animate-pulse" />
            ))}
          </div>
        ) : !users || users.length === 0 ? (
          <div className="text-center py-16">
            <Users2 size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-sm font-medium text-muted-foreground">Nenhum usuário cadastrado</p>
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((u) => (
              <div key={u.id} className="bg-card border rounded-xl p-4 flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
                  style={{ background: "oklch(0.92 0.04 240)", color: "oklch(0.28 0.09 240)" }}
                >
                  {(u.name ?? u.email ?? "U").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{u.name ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">{u.email ?? "—"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-medium px-2.5 py-1 rounded-full"
                    style={
                      u.role === "admin"
                        ? { background: "oklch(0.92 0.04 240)", color: "oklch(0.28 0.09 240)" }
                        : { background: "oklch(0.94 0.008 240)", color: "oklch(0.40 0.05 240)" }
                    }
                  >
                    {roleLabels[u.role] ?? u.role}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Desde {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
