import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight,
  BarChart3,
  FileCheck,
  FolderKanban,
  Lock,
  LogIn,
  Mail,
  Shield,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useLocation } from "wouter";

const features = [
  {
    icon: FolderKanban,
    title: "Ciclo de Vida Completo",
    description:
      "Gerencie projetos desde a Pré-Iniciação até o Encerramento, com módulos dedicados para cada fase.",
  },
  {
    icon: FileCheck,
    title: "Fluxo de Aprovações",
    description:
      "Controle aprovações para TED, planejamento, compras e prestação de contas.",
  },
  {
    icon: BarChart3,
    title: "Monitoramento e Indicadores",
    description:
      "Acompanhe progresso físico e financeiro com relatórios periódicos e indicadores.",
  },
  {
    icon: Shield,
    title: "Controle de Acesso",
    description:
      "Use papéis definidos para gestores, equipe técnica, financiadores e administradores.",
  },
];

const phases = [
  "Pré-Iniciação",
  "Iniciação",
  "Planejamento",
  "Execução",
  "Monitoramento",
  "Encerramento",
];

const isOAuthConfigured = Boolean(
  import.meta.env.VITE_OAUTH_PORTAL_URL && import.meta.env.VITE_APP_ID
);

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const utils = trpc.useUtils();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("demo@fiocruz.br");
  const [password, setPassword] = useState("demo123");

  const demoLogin = trpc.auth.demoLogin.useMutation({
    onSuccess: async data => {
      if (data.user) {
        utils.auth.me.setData(undefined, data.user);
      }
      await utils.auth.me.invalidate();
      navigate("/dashboard");
    },
  });

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, loading, navigate]);

  const handleDemoLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    demoLogin.mutate({ email, password });
  };

  const openExternalLogin = () => {
    window.location.href = getLoginUrl();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: "oklch(0.28 0.09 240)" }}
          >
            <FolderKanban size={20} className="text-white" />
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full animate-bounce"
                style={{
                  background: "oklch(0.52 0.16 195)",
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "oklch(0.28 0.09 240)" }}
            >
              <FolderKanban size={18} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground leading-none truncate">
                Fiocruz
              </p>
              <p className="text-xs text-muted-foreground truncate">
                Gestão de Projetos
              </p>
            </div>
          </div>
          <Button
            onClick={
              isOAuthConfigured
                ? openExternalLogin
                : () =>
                    document
                      .getElementById("login")
                      ?.scrollIntoView({ behavior: "smooth", block: "center" })
            }
            className="gap-2 text-sm shrink-0"
            style={{ background: "oklch(0.28 0.09 240)" }}
          >
            Entrar <LogIn size={15} />
          </Button>
        </div>
      </header>

      <main>
        <section className="max-w-6xl mx-auto px-6 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-10 lg:gap-12 items-start">
          <div className="max-w-3xl">
            <div
              className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full mb-6"
              style={{
                background: "oklch(0.92 0.04 240)",
                color: "oklch(0.28 0.09 240)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "oklch(0.52 0.16 195)" }}
              />
              Sistema de Gestão Institucional
            </div>
            <h1 className="text-4xl font-bold text-foreground leading-tight mb-4">
              Gestão completa do ciclo de vida de projetos institucionais
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Plataforma integrada para gerenciar projetos da Fiocruz, desde a
              identificação de demanda até o encerramento administrativo, com
              aprovações, documentos e indicadores no mesmo fluxo.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.map(feature => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="border bg-card rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "oklch(0.92 0.04 240)" }}
                      >
                        <Icon size={17} style={{ color: "oklch(0.28 0.09 240)" }} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <aside id="login" className="border bg-card rounded-lg p-6 shadow-sm">
            <div className="mb-6">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{ background: "oklch(0.28 0.09 240)" }}
              >
                <Lock size={18} className="text-white" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                Área de Login
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Acesse o ambiente de gestão de projetos.
              </p>
            </div>

            {isOAuthConfigured ? (
              <Button
                type="button"
                onClick={openExternalLogin}
                className="w-full gap-2"
                style={{ background: "oklch(0.28 0.09 240)" }}
              >
                Entrar com conta institucional <ArrowRight size={16} />
              </Button>
            ) : (
              <form className="space-y-4" onSubmit={handleDemoLogin}>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={event => setEmail(event.target.value)}
                      className="pl-9"
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={event => setPassword(event.target.value)}
                      className="pl-9"
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                {demoLogin.error ? (
                  <p className="text-sm text-destructive">
                    {demoLogin.error.message}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  disabled={demoLogin.isPending}
                  className="w-full gap-2"
                  style={{ background: "oklch(0.28 0.09 240)" }}
                >
                  {demoLogin.isPending ? "Entrando..." : "Entrar"}
                  <ArrowRight size={16} />
                </Button>
              </form>
            )}
          </aside>
        </section>

        <section className="border-t bg-card">
          <div className="max-w-6xl mx-auto px-6 py-12">
            <h2 className="text-lg font-semibold text-foreground mb-8 text-center">
              Fases do Ciclo de Vida
            </h2>
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
              {phases.map((phase, index) => (
                <div key={phase} className="flex items-center gap-2 flex-shrink-0">
                  <div
                    className="px-4 py-2 rounded-lg text-xs font-medium"
                    style={{
                      background: "oklch(0.92 0.04 240)",
                      color: "oklch(0.28 0.09 240)",
                    }}
                  >
                    {phase}
                  </div>
                  {index < phases.length - 1 && (
                    <ArrowRight
                      size={14}
                      className="text-muted-foreground flex-shrink-0"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Fiocruz - Sistema de Gestão de Projetos
          </p>
          <p className="text-xs text-muted-foreground">Versão 1.0</p>
        </div>
      </footer>
    </div>
  );
}
