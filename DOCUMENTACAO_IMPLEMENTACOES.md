# Documentacao das Implementacoes (2026-02-06)

Este arquivo resume as principais implementacoes feitas no projeto (frontend, backend e banco de dados) para atender as regras de negocio de monetizacao, reputacao e ajustes de interface.

## Visao Geral

- Banco de dados: Supabase (Postgres + API REST via `@supabase/supabase-js`)
- Backend: Node + Express
- Frontend: React + Vite
- Producao (VPS): Nginx servindo o `dist` do frontend e proxy para o backend em `/api`

## Regras de Negocio Implementadas

- O sistema nao realiza repasses.
- O pagamento e feito diretamente entre cliente e freelancer.
- Cadastro obrigatorio com foto e descricao (registro gratuito).
- Para enviar propostas, o freelancer precisa ter **assinatura ativa** e **creditos de proposta** no plano (quota mensal).
- Planos mensais (limite de propostas por periodo):
- R$ 9,99/mes: ate 20 propostas
- R$ 29,99/mes: ate 50 propostas
- R$ 59,99/mes: ate 100 propostas
- R$ 89,90/mes: ate 200 propostas
- O cliente nao paga para receber propostas.
- Cada proposta pode incluir fotos e links de videos (ate 10 de cada).
- Avaliacoes publicas: cliente e freelancer podem se avaliar com estrelas (1 a 5) e comentario visivel publicamente.
- Urgencia: o cliente pode promover uma demanda como urgente por R$ 5,99, para aparecer em um filtro/aba de urgencia.
- Contato direto: o cliente pode desbloquear contato de um freelancer listado por R$ 2,99.

## Banco de Dados (Supabase)

Migracao adicionada:

- `backend/migrations/012_business_rules_monetization_and_reputation.sql`

Principais mudancas:

- `public.users`
- Coluna `description` (text)
- `public.professional_profiles`
- Coluna `free_proposals_used` (int, default 0)
- `public.subscriptions`
- Colunas `plan_code`, `plan_name`, `monthly_price`, `proposal_limit`, `proposals_used_in_period`
- `public.proposals`
- Colunas `photo_urls` (text[]) e `video_urls` (text[])
- `public.service_requests`
- Colunas `is_urgent_promoted`, `urgent_promotion_price`, `urgent_promoted_at`
- Nova tabela `public.contact_unlocks`
- Indices de integridade/consulta para `ratings`, `service_requests` e `contact_unlocks`

Observacao importante (RLS):

- Em producao, algumas operacoes podem falhar se o projeto estiver com RLS habilitado no Supabase.
- Por isso o backend suporta `SUPABASE_SERVICE_ROLE_KEY` (somente no `.env` do servidor; nunca commitar essa chave).

## API (Backend)

Rotas principais (todas com prefixo `/api`):

- Health
- `GET /api/health`
- Auth
- `POST /api/auth/register` (body: `email`, `password`, `description`, `avatarUrl`, `role`)
- `POST /api/auth/login`
- Requests (Demandas)
- `POST /api/requests` (auth)
- `GET /api/requests` (auth, demandas do cliente)
- `GET /api/requests/open` (publico, listar demandas abertas)
- `GET /api/requests/:id/stats` (auth)
- `POST /api/requests/:id/promote-urgent` (auth, promocao de urgencia)
- Proposals
- `POST /api/proposals` (auth, profissional)
- `GET /api/proposals/service-request/:serviceRequestId` (auth, cliente dono da demanda)
- `GET /api/proposals/me` (auth, profissional)
- `POST /api/proposals/:id/accept` (auth, cliente dono)
- `POST /api/proposals/:id/reject` (auth, cliente dono)
- `POST /api/proposals/:id/cancel` (auth, profissional)
- Subscriptions
- `GET /api/subscriptions/plans` (publico)
- `GET /api/subscriptions/me` (auth, profissional)
- `GET /api/subscriptions/me/quota` (auth, profissional)
- `POST /api/subscriptions` (auth, profissional)
- Contact
- `GET /api/contact?userId=<uuid>&serviceRequestId=<uuid?>` (auth)
- `POST /api/contact/unlock` (auth, cliente)
- Ratings
- `POST /api/ratings` (auth)
- `GET /api/ratings/user/:userId` (auth)

Autenticacao:

- Rotas autenticadas exigem `Authorization: Bearer <token>` (token do login).

## Frontend

Principais ajustes:

- Header
- Logo do header usa `frontend/public/logo-header.png` (horizontal) para evitar sobreposicao no texto.
- Botoes `Entrar` e `Cadastrar` usando o mesmo estilo de fundo (classe `btn btn-primary`).
- Cadastro e Perfil
- Cadastro exige descricao (min 10) e foto (`avatarUrl`).
- Edicao de perfil inclui campo de descricao.

## Deploy (VPS)

Estrutura de pastas usada em producao:

- Backend: `/opt/servicoja/backend`
- Frontend: `/opt/servicoja/frontend`

Comandos tipicos:

```bash
# Backend (reiniciar com env atualizado)
cd /opt/servicoja/backend
pm2 restart servicoja-api --update-env

# Frontend (build)
cd /opt/servicoja/frontend
npm run build
```

Variaveis de ambiente (exemplos, nao commitar segredos):

```env
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=... # obrigatorio em producao se RLS estiver ativo
```

## Referencias no Repositorio

- `CHANGELOG_SUPABASE_MIGRATION.md`: detalhes da migracao de `pg` para API REST do Supabase.
- `MELHORIAS_IMPLEMENTADAS.md`: documentacao do design system (tokens CSS e componentes).
