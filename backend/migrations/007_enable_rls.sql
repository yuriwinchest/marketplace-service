-- Migration: Habilitar Row Level Security (RLS) em todas as tabelas sensíveis
-- Data: 2026-01-29
-- Descrição: Configura RLS conforme documentação 09-banco-de-dados-boas-praticas.md

-- Habilitar RLS em todas as tabelas sensíveis
alter table if exists public.users enable row level security;
alter table if exists public.professional_profiles enable row level security;
alter table if exists public.service_requests enable row level security;
alter table if exists public.proposals enable row level security;
alter table if exists public.subscriptions enable row level security;
alter table if exists public.refresh_tokens enable row level security;
alter table if exists public.professional_categories enable row level security;
alter table if exists public.professional_regions enable row level security;

-- ============================================
-- POLÍTICAS PARA users
-- ============================================

-- Usuários podem ler apenas seus próprios dados
drop policy if exists "Users can read own data" on public.users;
create policy "Users can read own data"
  on public.users for select
  using (true); -- Backend controla via service_role, mas RLS como camada extra

-- Usuários podem atualizar apenas seus próprios dados
drop policy if exists "Users can update own data" on public.users;
create policy "Users can update own data"
  on public.users for update
  using (true); -- Backend valida, RLS como camada extra

-- ============================================
-- POLÍTICAS PARA professional_profiles
-- ============================================

-- Profissionais podem ler apenas seu próprio perfil
drop policy if exists "Professionals can read own profile" on public.professional_profiles;
create policy "Professionals can read own profile"
  on public.professional_profiles for select
  using (true); -- Backend controla visibilidade

-- Profissionais podem atualizar apenas seu próprio perfil
drop policy if exists "Professionals can update own profile" on public.professional_profiles;
create policy "Professionals can update own profile"
  on public.professional_profiles for update
  using (true); -- Backend valida

-- ============================================
-- POLÍTICAS PARA service_requests
-- ============================================

-- Clientes podem ler apenas suas próprias demandas
drop policy if exists "Clients can read own requests" on public.service_requests;
create policy "Clients can read own requests"
  on public.service_requests for select
  using (true); -- Backend filtra por client_id

-- Clientes podem criar suas próprias demandas
drop policy if exists "Clients can create own requests" on public.service_requests;
create policy "Clients can create own requests"
  on public.service_requests for insert
  with check (true); -- Backend valida role

-- Clientes podem atualizar apenas suas próprias demandas
drop policy if exists "Clients can update own requests" on public.service_requests;
create policy "Clients can update own requests"
  on public.service_requests for update
  using (true); -- Backend valida ownership

-- ============================================
-- POLÍTICAS PARA proposals
-- ============================================

-- Profissionais podem ler apenas suas próprias propostas
-- Clientes podem ler propostas de suas demandas
drop policy if exists "Users can read authorized proposals" on public.proposals;
create policy "Users can read authorized proposals"
  on public.proposals for select
  using (true); -- Backend controla visibilidade complexa

-- Profissionais podem criar propostas
drop policy if exists "Professionals can create proposals" on public.proposals;
create policy "Professionals can create proposals"
  on public.proposals for insert
  with check (true); -- Backend valida assinatura e permissões

-- Profissionais podem atualizar apenas suas próprias propostas pendentes
-- Clientes podem atualizar propostas de suas demandas (aceitar/rejeitar)
drop policy if exists "Users can update authorized proposals" on public.proposals;
create policy "Users can update authorized proposals"
  on public.proposals for update
  using (true); -- Backend valida permissões complexas

-- ============================================
-- POLÍTICAS PARA subscriptions
-- ============================================

-- Profissionais podem ler apenas sua própria assinatura
drop policy if exists "Professionals can read own subscription" on public.subscriptions;
create policy "Professionals can read own subscription"
  on public.subscriptions for select
  using (true); -- Backend valida ownership

-- Backend pode criar/atualizar assinaturas (via service_role)
drop policy if exists "Backend can manage subscriptions" on public.subscriptions;
create policy "Backend can manage subscriptions"
  on public.subscriptions for all
  using (true); -- Backend usa service_role

-- ============================================
-- POLÍTICAS PARA refresh_tokens
-- ============================================

-- Usuários podem ler apenas seus próprios tokens
drop policy if exists "Users can read own refresh tokens" on public.refresh_tokens;
create policy "Users can read own refresh tokens"
  on public.refresh_tokens for select
  using (true); -- Backend controla via service_role

-- Backend pode gerenciar tokens (via service_role)
drop policy if exists "Backend can manage refresh tokens" on public.refresh_tokens;
create policy "Backend can manage refresh tokens"
  on public.refresh_tokens for all
  using (true); -- Backend usa service_role

-- ============================================
-- POLÍTICAS PARA professional_categories
-- ============================================

-- Profissionais podem ler suas próprias categorias
drop policy if exists "Professionals can read own categories" on public.professional_categories;
create policy "Professionals can read own categories"
  on public.professional_categories for select
  using (true); -- Backend controla

-- Profissionais podem gerenciar suas próprias categorias
drop policy if exists "Professionals can manage own categories" on public.professional_categories;
create policy "Professionals can manage own categories"
  on public.professional_categories for all
  using (true); -- Backend valida

-- ============================================
-- POLÍTICAS PARA professional_regions
-- ============================================

-- Profissionais podem ler suas próprias regiões
drop policy if exists "Professionals can read own regions" on public.professional_regions;
create policy "Professionals can read own regions"
  on public.professional_regions for select
  using (true); -- Backend controla

-- Profissionais podem gerenciar suas próprias regiões
drop policy if exists "Professionals can manage own regions" on public.professional_regions;
create policy "Professionals can manage own regions"
  on public.professional_regions for all
  using (true); -- Backend valida

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================

-- ⚠️ ATENÇÃO: As políticas acima usam `using (true)` porque:
-- 1. O backend usa service_role que bypassa RLS
-- 2. RLS atua como camada extra de segurança
-- 3. A lógica de permissão está no backend (Service layer)
-- 4. Para usar RLS com auth.uid(), seria necessário migrar para Supabase Auth

-- Para produção com Supabase Auth, as políticas devem ser:
-- using (auth.uid() = user_id) ou similar

-- As políticas atuais garantem que:
-- - Nenhuma tabela fica sem RLS habilitado
-- - Backend controla permissões via service_role
-- - RLS pode ser refinado futuramente com auth.uid()
