-- Migration: 012_business_rules_monetization_and_reputation
-- Data: 2026-02-06
-- Descrição:
-- 1) Cadastro obrigatório com descrição
-- 2) Limite grátis de propostas e planos mensais
-- 3) Promoção de urgência e compra de contato direto
-- 4) Anexos em propostas e consistência para avaliações públicas

-- ============================================
-- 1) Cadastro e perfil base
-- ============================================

alter table public.users
  add column if not exists description text;

alter table public.professional_profiles
  add column if not exists free_proposals_used integer not null default 0;

-- ============================================
-- 2) Assinaturas por plano (sem dependência Stripe)
-- ============================================

alter table public.subscriptions
  add column if not exists plan_code text,
  add column if not exists plan_name text,
  add column if not exists monthly_price numeric(10,2),
  add column if not exists proposal_limit integer,
  add column if not exists proposals_used_in_period integer not null default 0;

update public.subscriptions
set
  current_period_start = coalesce(current_period_start, now()),
  current_period_end = coalesce(current_period_end, now() + interval '1 month');

alter table public.subscriptions
  drop constraint if exists subscriptions_plan_code_check;

alter table public.subscriptions
  add constraint subscriptions_plan_code_check
  check (
    plan_code is null
    or plan_code in ('starter_20', 'pro_50', 'max_100', 'enterprise_200')
  );

create index if not exists subscriptions_plan_code_idx
  on public.subscriptions(plan_code);

-- ============================================
-- 3) Propostas com anexos
-- ============================================

alter table public.proposals
  add column if not exists photo_urls text[] not null default '{}'::text[],
  add column if not exists video_urls text[] not null default '{}'::text[];

-- ============================================
-- 4) Promoção de urgência (R$ 5,99)
-- ============================================

alter table public.service_requests
  add column if not exists is_urgent_promoted boolean not null default false,
  add column if not exists urgent_promotion_price numeric(10,2),
  add column if not exists urgent_promoted_at timestamptz;

create index if not exists service_requests_urgent_promoted_idx
  on public.service_requests(status, is_urgent_promoted, urgency, created_at desc);

-- ============================================
-- 5) Contato direto com profissional (R$ 2,99)
-- ============================================

create table if not exists public.contact_unlocks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.users(id) on delete cascade,
  professional_id uuid not null references public.professional_profiles(id) on delete cascade,
  service_request_id uuid references public.service_requests(id) on delete set null,
  price numeric(10,2) not null default 2.99,
  created_at timestamptz not null default now(),
  constraint contact_unlocks_price_positive check (price > 0)
);

create unique index if not exists contact_unlocks_client_professional_unique_idx
  on public.contact_unlocks(client_id, professional_id);

create index if not exists contact_unlocks_client_idx
  on public.contact_unlocks(client_id, created_at desc);

create index if not exists contact_unlocks_professional_idx
  on public.contact_unlocks(professional_id, created_at desc);

-- ============================================
-- 6) Avaliações públicas (integridade)
-- ============================================

create unique index if not exists ratings_unique_from_to_request_idx
  on public.ratings(request_id, from_user_id, to_user_id);

create index if not exists ratings_to_user_created_at_idx
  on public.ratings(to_user_id, created_at desc);

