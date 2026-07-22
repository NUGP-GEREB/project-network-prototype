import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  Activity,
  BarChart3,
  Bell,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FileText,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Play,
  Settings,
  Target,
  TrendingUp,
  User,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ScrollArea } from "./ui/scroll-area";

const phaseNav = [
  {
    id: "pre_initiation",
    label: "Pré-Iniciação",
    icon: BookOpen,
    color: "oklch(0.60 0.12 270)",
    bg: "oklch(0.94 0.04 270)",
  },
  {
    id: "initiation",
    label: "Iniciação",
    icon: Play,
    color: "oklch(0.40 0.16 200)",
    bg: "oklch(0.92 0.05 200)",
  },
  {
    id: "planning",
    label: "Planejamento",
    icon: Target,
    color: "oklch(0.45 0.18 85)",
    bg: "oklch(0.95 0.06 85)",
  },
  {
    id: "execution",
    label: "Execução",
    icon: Activity,
    color: "oklch(0.45 0.20 25)",
    bg: "oklch(0.95 0.06 25)",
  },
  {
    id: "monitoring",
    label: "Monitoramento",
    icon: TrendingUp,
    color: "oklch(0.38 0.18 145)",
    bg: "oklch(0.93 0.05 145)",
  },
  {
    id: "closure",
    label: "Encerramento",
    icon: CheckCircle2,
    color: "oklch(0.30 0.10 240)",
    bg: "oklch(0.93 0.03 240)",
  },
];

const mainNav = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/projects", label: "Projetos", icon: FolderOpen },
  { path: "/approvals", label: "Aprovações", icon: ClipboardList },
  { path: "/notifications", label: "Notificações", icon: Bell },
  { path: "/users", label: "Usuários", icon: Users },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: notifications } = trpc.notifications.list.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-sm mx-auto p-8">
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "oklch(0.28 0.09 240)" }}
            >
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <h1 className="text-2xl font-semibold text-foreground">Sistema de Projetos</h1>
            <p className="text-muted-foreground text-sm mt-1">Fiocruz — Gestão de Ciclo de Vida</p>
          </div>
          <Button className="w-full" size="lg" asChild>
            <a href={getLoginUrl()}>Entrar com conta institucional</a>
          </Button>
        </div>
      </div>
    );
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "oklch(0.52 0.16 195)" }}
          >
            <span className="text-white font-bold text-base">F</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-sidebar-foreground leading-tight">
              Fiocruz
            </p>
            <p className="text-xs" style={{ color: "oklch(0.60 0.05 240)" }}>
              Gestão de Projetos
            </p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 py-3">
        {/* Main Nav */}
        <div className="px-3 mb-4">
          <p
            className="text-xs font-medium uppercase tracking-widest mb-2 px-3"
            style={{ color: "oklch(0.55 0.05 240)" }}
          >
            Principal
          </p>
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer mb-0.5 ${
                    isActive ? "text-white" : ""
                  }`}
                  style={
                    isActive
                      ? { background: "oklch(0.52 0.16 195)" }
                      : { color: "oklch(0.70 0.04 240)" }
                  }
                  onMouseEnter={(e) => {
                    if (!isActive)
                      (e.currentTarget as HTMLElement).style.background =
                        "oklch(0.25 0.07 240)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive)
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                  {item.path === "/approvals" && unreadCount > 0 && (
                    <Badge
                      className="ml-auto text-xs h-5 min-w-5 flex items-center justify-center"
                      style={{ background: "oklch(0.56 0.22 25)", color: "white" }}
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Phases Nav */}
        <div className="px-3">
          <p
            className="text-xs font-medium uppercase tracking-widest mb-2 px-3"
            style={{ color: "oklch(0.55 0.05 240)" }}
          >
            Fases do Ciclo
          </p>
          {phaseNav.map((phase) => {
            const Icon = phase.icon;
            const isActive = location.includes(`/phase/${phase.id}`);
            return (
              <Link key={phase.id} href={`/phase/${phase.id}`}>
                <div
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer mb-0.5"
                  style={
                    isActive
                      ? { background: "oklch(0.25 0.07 240)", color: "white" }
                      : { color: "oklch(0.70 0.04 240)" }
                  }
                  onMouseEnter={(e) => {
                    if (!isActive)
                      (e.currentTarget as HTMLElement).style.background =
                        "oklch(0.25 0.07 240)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive)
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ background: phase.bg }}
                  >
                    <Icon size={12} style={{ color: phase.color }} />
                  </div>
                  <span className="text-xs">{phase.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </ScrollArea>

      {/* User */}
      <div className="px-3 py-3 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-all duration-150 hover:bg-sidebar-accent cursor-pointer">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-semibold"
                style={{ background: "oklch(0.52 0.16 195)" }}
              >
                {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-xs font-medium text-sidebar-foreground truncate">
                  {user?.name ?? "Usuário"}
                </p>
                <p className="text-xs truncate" style={{ color: "oklch(0.55 0.05 240)" }}>
                  {user?.role === "admin" ? "Administrador" : "Usuário"}
                </p>
              </div>
              <ChevronRight size={14} style={{ color: "oklch(0.55 0.05 240)" }} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <User size={14} className="mr-2" /> Meu Perfil
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings size={14} className="mr-2" /> Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={logout}
            >
              <LogOut size={14} className="mr-2" /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex flex-col w-60 flex-shrink-0 h-full"
        style={{ background: "oklch(0.18 0.06 240)" }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside
            className="relative w-64 h-full flex flex-col z-10"
            style={{ background: "oklch(0.18 0.06 240)" }}
          >
            <button
              className="absolute top-4 right-4 text-sidebar-foreground"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 flex items-center justify-between px-6 border-b bg-card flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1.5 rounded-lg hover:bg-secondary"
              onClick={() => setSidebarOpen(true)}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M2 4h14M2 9h14M2 14h14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <nav className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
              <span>Sistema de Projetos</span>
              <ChevronRight size={14} />
              <span className="text-foreground font-medium">
                {mainNav.find((n) => n.path === location)?.label ??
                  phaseNav.find((p) => location.includes(p.id))?.label ??
                  "Projeto"}
              </span>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/approvals">
              <Button variant="ghost" size="icon" className="relative">
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                    style={{ background: "oklch(0.56 0.22 25)" }}
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
