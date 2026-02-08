-- Migration: 016_public_professional_profiles
-- Data: 2026-02-08
-- Objetivo:
-- - Permitir joins com RLS (sem service-role) sem expor colunas sensíveis de `users`/`professional_profiles`.
-- - Criar tabelas "públicas" apenas com campos seguros para listagens e telas públicas.

-- =========================
-- 1) Tabelas públicas (somente profissionais)
-- =========================

create table if not exists public.professional_public_users (
  user_id uuid primary key references public.users(id) on delete cascade,
  name text,
  description text,
  role text not null default 'professional',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.professional_public_profiles (
  professional_id uuid primary key references public.professional_profiles(id) on delete cascade,
  user_id uuid not null unique references public.professional_public_users(user_id) on delete cascade,
  bio text,
  skills text[] not null default '{}'::text[],
  location_scope text not null default 'national',
  uf text,
  city text,
  is_remote boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================
-- 2) RLS e policies (public read, no writes)
-- =========================

alter table public.professional_public_users enable row level security;
alter table public.professional_public_profiles enable row level security;

-- Public read (anon + authenticated)
drop policy if exists "Public can read professional public users" on public.professional_public_users;
create policy "Public can read professional public users"
  on public.professional_public_users for select
  using (auth.role() in ('anon', 'authenticated'));

drop policy if exists "Public can read professional public profiles" on public.professional_public_profiles;
create policy "Public can read professional public profiles"
  on public.professional_public_profiles for select
  using (auth.role() in ('anon', 'authenticated'));

-- Deny client writes (sync is done by triggers on private tables)
drop policy if exists "Deny writes on professional public users" on public.professional_public_users;
create policy "Deny writes on professional public users"
  on public.professional_public_users for all
  using (false)
  with check (false);

drop policy if exists "Deny writes on professional public profiles" on public.professional_public_profiles;
create policy "Deny writes on professional public profiles"
  on public.professional_public_profiles for all
  using (false)
  with check (false);

-- =========================
-- 3) Funções + triggers de sincronização
-- =========================

create or replace function public.sync_professional_public_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Sync only for users that have a professional profile row.
  if not exists (select 1 from public.professional_profiles p where p.user_id = new.id) then
    delete from public.professional_public_users where user_id = new.id;
    return new;
  end if;

  insert into public.professional_public_users (user_id, name, description, role, avatar_url, created_at, updated_at)
  values (new.id, new.name, new.description, 'professional', new.avatar_url, new.created_at, now())
  on conflict (user_id) do update set
    name = excluded.name,
    description = excluded.description,
    role = 'professional',
    avatar_url = excluded.avatar_url,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists trg_sync_professional_public_user on public.users;
create trigger trg_sync_professional_public_user
after insert or update of name, description, role, avatar_url
on public.users
for each row
execute function public.sync_professional_public_user();

create or replace function public.sync_professional_public_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
begin
  -- Ensure parent public user exists
  insert into public.professional_public_users (user_id, name, description, role, avatar_url, created_at, updated_at)
  select u.id, u.name, u.description, 'professional', u.avatar_url, u.created_at, now()
  from public.users u
  where u.id = new.user_id
  on conflict (user_id) do update set updated_at = now();

  insert into public.professional_public_profiles (
    professional_id, user_id, bio, skills, location_scope, uf, city, is_remote, created_at, updated_at
  )
  values (
    new.id,
    new.user_id,
    new.bio,
    coalesce(new.skills, '{}'::text[]),
    coalesce(new.location_scope, 'national'),
    new.uf,
    new.city,
    coalesce(new.is_remote, false),
    new.created_at,
    now()
  )
  on conflict (professional_id) do update set
    bio = excluded.bio,
    skills = excluded.skills,
    location_scope = excluded.location_scope,
    uf = excluded.uf,
    city = excluded.city,
    is_remote = excluded.is_remote,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists trg_sync_professional_public_profile on public.professional_profiles;
create trigger trg_sync_professional_public_profile
after insert or update of bio, skills, location_scope, uf, city, is_remote
on public.professional_profiles
for each row
execute function public.sync_professional_public_profile();

-- =========================
-- 4) Backfill inicial
-- =========================

insert into public.professional_public_users (user_id, name, description, role, avatar_url, created_at, updated_at)
select u.id, u.name, u.description, 'professional', u.avatar_url, u.created_at, now()
from public.users u
where exists (select 1 from public.professional_profiles p where p.user_id = u.id)
on conflict (user_id) do update set updated_at = now();

insert into public.professional_public_profiles (
  professional_id, user_id, bio, skills, location_scope, uf, city, is_remote, created_at, updated_at
)
select p.id, p.user_id, p.bio, coalesce(p.skills, '{}'::text[]), coalesce(p.location_scope,'national'),
       p.uf, p.city, coalesce(p.is_remote,false), p.created_at, now()
from public.professional_profiles p
join public.users u on u.id = p.user_id
on conflict (professional_id) do update set updated_at = now();

-- FK extra: permite embed direto proposals -> professional_public_profiles via PostgREST
do $$ begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'proposals_professional_public_fkey'
  ) then
    alter table public.proposals
      add constraint proposals_professional_public_fkey
      foreign key (professional_id) references public.professional_public_profiles(professional_id)
      on delete cascade;
  end if;
end $$;
