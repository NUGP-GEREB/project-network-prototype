# Sistema de Gestão de Projetos Fiocruz - TODO

## Backend / Schema

- [x] Schema: tabela projects (ciclo de vida completo)
- [x] Schema: tabela project_members (papéis: admin, ordenador, responsavel_tecnico, equipe, financiador)
- [x] Schema: tabela pre_initiation (demanda, proposta preliminar)
- [x] Schema: tabela initiation (TED, equipe, orçamento inicial)
- [x] Schema: tabela planning (atividades, metas, cronograma, viabilidade)
- [x] Schema: tabela execution_purchases (compras: solicitação, cotação, licitação, recebimento)
- [x] Schema: tabela execution_financial (empenho, liquidação, notas fiscais, pagamentos)
- [x] Schema: tabela execution_activities (atividades técnicas)
- [x] Schema: tabela monitoring (indicadores, relatórios de progresso)
- [x] Schema: tabela closure (prestação de contas, parecer, encerramento)
- [x] Schema: tabela documents (upload, versionamento)
- [x] Schema: tabela approvals (fluxo de aprovações)
- [x] Schema: tabela notifications (notificações automáticas)
- [x] DB helpers para todas as entidades
- [x] tRPC routers: projects, preInitiation, initiation, planning, execution, monitoring, closure, documents, approvals, notifications, users

## Frontend

- [x] Design system: paleta de cores elegante, tipografia, tokens CSS
- [x] AppLayout com sidebar de navegação escura e fases do ciclo
- [x] Home page (landing page com redirecionamento automático ao dashboard)
- [x] Página Dashboard: visão geral de projetos por fase, estatísticas, aprovações pendentes
- [x] Página Projetos: listagem, busca e criação via dialog
- [x] Página Detalhe do Projeto: timeline de fases, tabs de módulos
- [x] Módulo Pré-Iniciação: formulário de demanda e proposta
- [x] Módulo Iniciação: formalização, TED, equipe, orçamento
- [x] Módulo Planejamento: atividades, metas, cronograma, viabilidade
- [x] Módulo Execução: compras, financeiro, atividades técnicas
- [x] Módulo Monitoramento: indicadores, controle, relatórios
- [x] Módulo Encerramento: prestação de contas, parecer, encerramento
- [x] Gestão de Documentos: upload, listagem, versionamento por fase
- [x] Fluxo de Aprovações: visualização e ação sobre aprovações pendentes
- [x] Controle de acesso por papel (RBAC) — admin/user
- [x] Notificações automáticas nas etapas críticas
- [x] Página de Visão por Fase (/phase/:phase)
- [x] Página de Usuários (admin only)
- [x] Testes Vitest para routers principais (12 testes passando)
