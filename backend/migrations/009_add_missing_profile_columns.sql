-- Migration: 009_fix_schema_mismatches
-- Data: 2026-01-29
-- Descrição: Adiciona colunas faltantes em professional_profiles e service_requests (uf, city, location_scope) para alinhar com o código.
-- 1. Ajustes em professional_profiles
alter table public.professional_profiles
add column if not exists location_scope text default 'national',
    add column if not exists uf text,
    add column if not exists city text;
create index if not exists idx_professional_profiles_location_scope on public.professional_profiles(location_scope);
create index if not exists idx_professional_profiles_city on public.professional_profiles(city);
create index if not exists idx_professional_profiles_uf on public.professional_profiles(uf);
comment on column public.professional_profiles.location_scope is 'Alcance do atendimento (ex: national, regional, city)';
-- 2. Ajustes em service_requests
alter table public.service_requests
add column if not exists location_scope text default 'national',
    add column if not exists uf text,
    add column if not exists city text;
create index if not exists idx_service_requests_city on public.service_requests(city);
create index if not exists idx_service_requests_uf on public.service_requests(uf);
comment on column public.service_requests.location_scope is 'Alcance da demanda (ex: national, regional, city)';