-- Migration: Criar tabelas proposals e subscriptions
-- Data: 2026-01-29
-- Descrição: Cria tabelas necessárias para propostas e assinaturas conforme documentação

-- Criar enum para status de proposta
do $$
begin
  if not exists (select 1 from pg_type where typname = 'proposal_status') then
    create type proposal_status as enum ('pending', 'accepted', 'rejected', 'cancelled');
  end if;
end
$$;

-- Criar enum para status de assinatura
do $$
begin
  if not exists (select 1 from pg_type where typname = 'subscription_status') then
    create type subscription_status as enum ('active', 'inactive', 'cancelled', 'past_due', 'trialing');
  end if;
end
$$;

-- Criar tabela subscriptions (assinaturas Stripe)
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professional_profiles(id) on delete cascade,
  stripe_subscription_id text unique,
  stripe_customer_id text,
  status subscription_status not null default 'inactive',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscriptions_professional_unique unique (professional_id)
);

create index if not exists subscriptions_professional_id_idx on public.subscriptions(professional_id);
create index if not exists subscriptions_stripe_subscription_id_idx on public.subscriptions(stripe_subscription_id);
create index if not exists subscriptions_status_idx on public.subscriptions(status);

-- Criar tabela proposals (propostas de profissionais)
create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  service_request_id uuid not null references public.service_requests(id) on delete cascade,
  professional_id uuid not null references public.professional_profiles(id) on delete cascade,
  value numeric(12,2) not null,
  description text not null,
  estimated_days integer,
  status proposal_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint proposals_unique_request_professional unique (service_request_id, professional_id),
  constraint proposals_value_positive check (value > 0)
);

create index if not exists proposals_service_request_id_idx on public.proposals(service_request_id);
create index if not exists proposals_professional_id_idx on public.proposals(professional_id);
create index if not exists proposals_status_idx on public.proposals(status);

-- Adicionar campos faltantes em professional_profiles
alter table public.professional_profiles
  add column if not exists is_remote boolean not null default false,
  add column if not exists subscription_status subscription_status,
  add column if not exists email text,
  add column if not exists whatsapp text;

-- Criar tabelas de relacionamento muitos-para-muitos
create table if not exists public.professional_categories (
  professional_id uuid not null references public.professional_profiles(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (professional_id, category_id)
);

create index if not exists professional_categories_professional_id_idx on public.professional_categories(professional_id);
create index if not exists professional_categories_category_id_idx on public.professional_categories(category_id);

create table if not exists public.professional_regions (
  professional_id uuid not null references public.professional_profiles(id) on delete cascade,
  region_id uuid not null references public.regions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (professional_id, region_id)
);

create index if not exists professional_regions_professional_id_idx on public.professional_regions(professional_id);
create index if not exists professional_regions_region_id_idx on public.professional_regions(region_id);

-- Adicionar trigger de updated_at para novas tabelas
drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

drop trigger if exists proposals_set_updated_at on public.proposals;
create trigger proposals_set_updated_at
before update on public.proposals
for each row execute function public.set_updated_at();

-- Adicionar status 'in_progress' ao enum request_status se não existir
-- Nota: PostgreSQL não permite adicionar valores a enums existentes facilmente
-- Será necessário criar novo enum ou usar ALTER TYPE (requer PostgreSQL 9.1+)
-- Por enquanto, vamos verificar se precisamos ajustar

-- Comentários para documentação
comment on table public.subscriptions is 'Assinaturas Stripe dos profissionais';
comment on table public.proposals is 'Propostas enviadas por profissionais para demandas';
comment on table public.professional_categories is 'Relacionamento muitos-para-muitos: profissionais e categorias';
comment on table public.professional_regions is 'Relacionamento muitos-para-muitos: profissionais e regiões atendidas';

comment on column public.professional_profiles.is_remote is 'Indica se o profissional atende remotamente';
comment on column public.professional_profiles.subscription_status is 'Status da assinatura (sincronizado com subscriptions)';
comment on column public.professional_profiles.email is 'E-mail para contato (sensível)';
comment on column public.professional_profiles.whatsapp is 'WhatsApp para contato (sensível)';
