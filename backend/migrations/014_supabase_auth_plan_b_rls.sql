-- Migration: 014_supabase_auth_plan_b_rls
-- Data: 2026-02-08
-- Objetivo:
-- - Plano B: manter `public.users.id` (ID interno) separado do `auth.users.id` (Supabase Auth),
--   usando tabela de mapeamento + função `current_user_id()`.
-- - Reescrever RLS sem `using (true)` / `with check (true)` para alinhar com a doc `09-banco-de-dados...`.

-- =========================
-- 1) Mapeamento de Identidade
-- =========================

create table if not exists public.user_identities (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  user_id uuid not null unique references public.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.user_identities enable row level security;

drop policy if exists "Users can read own identity mapping" on public.user_identities;
create policy "Users can read own identity mapping"
  on public.user_identities for select
  using (auth_user_id = auth.uid());

create or replace function public.current_user_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select user_id
  from public.user_identities
  where auth_user_id = auth.uid();
$$;

-- =========================
-- 2) Remover autenticação legada do domínio público
-- =========================
-- A identidade agora vem do Supabase Auth. Manter `password_hash` em `public.users` expõe hash ao usuário
-- caso o frontend passe a acessar o Supabase diretamente (RLS não protege colunas).
alter table public.users drop column if exists password_hash;

-- =========================
-- 3) Habilitar RLS nas tabelas de negócio
-- =========================
alter table if exists public.categories enable row level security;
alter table if exists public.regions enable row level security;
alter table if exists public.ratings enable row level security;
alter table if exists public.leads enable row level security;
alter table if exists public.payments enable row level security;
alter table if exists public.contact_unlocks enable row level security;
alter table if exists public.refresh_tokens enable row level security;

-- =========================
-- 4) Policies por tabela (sem `true`)
-- =========================

-- ---- users (perfil base)
drop policy if exists "Users can read own data" on public.users;
drop policy if exists "Users can update own data" on public.users;
drop policy if exists "Users can view own profile" on public.users;
drop policy if exists "Users can update own profile" on public.users;
drop policy if exists "Users can read own profile" on public.users;
drop policy if exists "Users can update own profile" on public.users;

create policy "Users can read own profile"
  on public.users for select
  using (id = public.current_user_id());

create policy "Users can update own profile"
  on public.users for update
  using (id = public.current_user_id())
  with check (id = public.current_user_id());

-- ---- professional_profiles (dados do profissional)
drop policy if exists "Professionals can read own profile" on public.professional_profiles;
drop policy if exists "Professionals can update own profile" on public.professional_profiles;

create policy "Professionals can read own professional profile"
  on public.professional_profiles for select
  using (user_id = public.current_user_id());

create policy "Professionals can update own professional profile"
  on public.professional_profiles for update
  using (user_id = public.current_user_id())
  with check (user_id = public.current_user_id());

-- ---- categories / regions (leitura pública)
drop policy if exists "Public can read categories" on public.categories;
create policy "Public can read categories"
  on public.categories for select
  using (auth.role() in ('anon', 'authenticated'));

drop policy if exists "Public can read regions" on public.regions;
create policy "Public can read regions"
  on public.regions for select
  using (auth.role() in ('anon', 'authenticated'));

-- ---- service_requests (demandas)
drop policy if exists "Clients can read own requests" on public.service_requests;
drop policy if exists "Clients can create own requests" on public.service_requests;
drop policy if exists "Clients can update own requests" on public.service_requests;
drop policy if exists "Users can only see non-deleted records" on public.service_requests;
drop policy if exists "Public can read open requests" on public.service_requests;

create policy "Public can read open requests"
  on public.service_requests for select
  using (status = 'open' and deleted_at is null);

create policy "Clients can read own requests"
  on public.service_requests for select
  using (client_id = public.current_user_id() and deleted_at is null);

create policy "Clients can create own requests"
  on public.service_requests for insert
  with check (client_id = public.current_user_id());

create policy "Clients can update own requests"
  on public.service_requests for update
  using (client_id = public.current_user_id())
  with check (client_id = public.current_user_id());

-- ---- proposals (propostas)
drop policy if exists "Users can read authorized proposals" on public.proposals;
drop policy if exists "Professionals can create proposals" on public.proposals;
drop policy if exists "Users can update authorized proposals" on public.proposals;

create policy "Users can read authorized proposals"
  on public.proposals for select
  using (
    exists (
      select 1
      from public.service_requests r
      where r.id = proposals.service_request_id
        and r.client_id = public.current_user_id()
    )
    or exists (
      select 1
      from public.professional_profiles p
      where p.id = proposals.professional_id
        and p.user_id = public.current_user_id()
    )
  );

create policy "Professionals can create proposals"
  on public.proposals for insert
  with check (
    exists (
      select 1
      from public.professional_profiles p
      where p.id = proposals.professional_id
        and p.user_id = public.current_user_id()
    )
  );

create policy "Users can update authorized proposals"
  on public.proposals for update
  using (
    exists (
      select 1
      from public.service_requests r
      where r.id = proposals.service_request_id
        and r.client_id = public.current_user_id()
    )
    or exists (
      select 1
      from public.professional_profiles p
      where p.id = proposals.professional_id
        and p.user_id = public.current_user_id()
    )
  )
  with check (
    exists (
      select 1
      from public.service_requests r
      where r.id = proposals.service_request_id
        and r.client_id = public.current_user_id()
    )
    or exists (
      select 1
      from public.professional_profiles p
      where p.id = proposals.professional_id
        and p.user_id = public.current_user_id()
    )
  );

-- ---- subscriptions
drop policy if exists "Professionals can read own subscription" on public.subscriptions;
drop policy if exists "Backend can manage subscriptions" on public.subscriptions;

create policy "Professionals can read own subscription"
  on public.subscriptions for select
  using (
    exists (
      select 1
      from public.professional_profiles p
      where p.id = subscriptions.professional_id
        and p.user_id = public.current_user_id()
    )
  );

-- ---- professional_categories
drop policy if exists "Professionals can read own categories" on public.professional_categories;
drop policy if exists "Professionals can manage own categories" on public.professional_categories;

create policy "Professionals can read own categories"
  on public.professional_categories for select
  using (
    exists (
      select 1
      from public.professional_profiles p
      where p.id = professional_categories.professional_id
        and p.user_id = public.current_user_id()
    )
  );

create policy "Professionals can manage own categories"
  on public.professional_categories for all
  using (
    exists (
      select 1
      from public.professional_profiles p
      where p.id = professional_categories.professional_id
        and p.user_id = public.current_user_id()
    )
  )
  with check (
    exists (
      select 1
      from public.professional_profiles p
      where p.id = professional_categories.professional_id
        and p.user_id = public.current_user_id()
    )
  );

-- ---- professional_regions
drop policy if exists "Professionals can read own regions" on public.professional_regions;
drop policy if exists "Professionals can manage own regions" on public.professional_regions;

create policy "Professionals can read own regions"
  on public.professional_regions for select
  using (
    exists (
      select 1
      from public.professional_profiles p
      where p.id = professional_regions.professional_id
        and p.user_id = public.current_user_id()
    )
  );

create policy "Professionals can manage own regions"
  on public.professional_regions for all
  using (
    exists (
      select 1
      from public.professional_profiles p
      where p.id = professional_regions.professional_id
        and p.user_id = public.current_user_id()
    )
  )
  with check (
    exists (
      select 1
      from public.professional_profiles p
      where p.id = professional_regions.professional_id
        and p.user_id = public.current_user_id()
    )
  );

-- ---- notifications
drop policy if exists "Users can access notifications" on public.notifications;
create policy "Users can access notifications"
  on public.notifications for all
  using (user_id = public.current_user_id())
  with check (user_id = public.current_user_id());

-- ---- contact_unlocks (contato direto pago)
drop policy if exists "Clients can read own contact unlocks" on public.contact_unlocks;
drop policy if exists "Professionals can read contact unlocks about them" on public.contact_unlocks;
drop policy if exists "Clients can create own contact unlocks" on public.contact_unlocks;

create policy "Clients can read own contact unlocks"
  on public.contact_unlocks for select
  using (client_id = public.current_user_id());

create policy "Professionals can read contact unlocks about them"
  on public.contact_unlocks for select
  using (
    exists (
      select 1
      from public.professional_profiles p
      where p.id = contact_unlocks.professional_id
        and p.user_id = public.current_user_id()
    )
  );

create policy "Clients can create own contact unlocks"
  on public.contact_unlocks for insert
  with check (client_id = public.current_user_id());

-- ---- ratings
drop policy if exists "Public can read ratings" on public.ratings;
drop policy if exists "Users can create own ratings" on public.ratings;

create policy "Public can read ratings"
  on public.ratings for select
  using (auth.role() in ('anon', 'authenticated'));

create policy "Users can create own ratings"
  on public.ratings for insert
  with check (from_user_id = public.current_user_id());

-- ---- leads / payments / refresh_tokens (não expor via PostgREST)
drop policy if exists "Deny all on leads" on public.leads;
create policy "Deny all on leads"
  on public.leads for all
  using (false)
  with check (false);

drop policy if exists "Deny all on payments" on public.payments;
create policy "Deny all on payments"
  on public.payments for all
  using (false)
  with check (false);

drop policy if exists "Deny all on refresh_tokens" on public.refresh_tokens;
create policy "Deny all on refresh_tokens"
  on public.refresh_tokens for all
  using (false)
  with check (false);

