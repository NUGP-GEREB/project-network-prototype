import { trpc } from "@/lib/trpc";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import AppLayout from "../components/AppLayout";
import { Button } from "../components/ui/button";

export default function Notifications() {
  const { data: notifications, isLoading } = trpc.notifications.list.useQuery();
  const utils = trpc.useUtils();

  const markRead = trpc.notifications.markRead.useMutation({
    onSuccess: () => utils.notifications.list.invalidate(),
  });

  const markAllRead = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      toast.success("Todas as notificações marcadas como lidas");
    },
  });

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  return (
    <AppLayout>
      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Notificações</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {unreadCount > 0 ? `${unreadCount} não lida(s)` : "Todas as notificações lidas"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-xs"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
            >
              <CheckCheck size={13} /> Marcar todas como lidas
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-secondary rounded-xl animate-pulse" />
            ))}
          </div>
        ) : !notifications || notifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-sm font-medium text-muted-foreground">Nenhuma notificação</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="bg-card border rounded-xl p-4 cursor-pointer hover:bg-secondary/20 transition-colors"
                style={!n.isRead ? { borderLeftWidth: 3, borderLeftColor: "oklch(0.52 0.16 195)" } : {}}
                onClick={() => {
                  if (!n.isRead) markRead.mutate({ id: n.id });
                  if (n.link) window.location.href = n.link;
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {!n.isRead && (
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: "oklch(0.52 0.16 195)" }}
                        />
                      )}
                      <p className="text-sm font-medium text-foreground">{n.title}</p>
                    </div>
                    {n.message && (
                      <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(n.createdAt).toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
