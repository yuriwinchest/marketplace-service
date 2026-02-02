-- Migration: 008_align_with_best_practices
-- Descrição: Ajusta o banco para seguir o documento de Boas Práticas (UUID, Auditoria, Soft Delete e Índices)
-- Data: 2026-01-29
-- 1. ADICIONAR COLUNAS DE AUDITORIA E SOFT DELETE ONDE FALTA
do $$ begin -- Exemplo para a tabela users
if not exists (
    select 1
    from INFORMATION_SCHEMA.COLUMNS
    where table_name = 'users'
        and column_name = 'deleted_at'
) then
alter table public.users
add column deleted_at timestamptz;
end if;
-- Exemplo para service_requests
if not exists (
    select 1
    from INFORMATION_SCHEMA.COLUMNS
    where table_name = 'service_requests'
        and column_name = 'deleted_at'
) then
alter table public.service_requests
add column deleted_at timestamptz;
end if;
-- Exemplo para proposals
if not exists (
    select 1
    from INFORMATION_SCHEMA.COLUMNS
    where table_name = 'proposals'
        and column_name = 'updated_at'
) then
alter table public.proposals
add column updated_at timestamptz default now();
alter table public.proposals
add column deleted_at timestamptz;
end if;
end $$;
-- 2. CRIAÇÃO DE ÍNDICES EM TODAS AS FOREIGN KEYS (REGRAS DE PERFORMANCE)
create index if not exists idx_professional_profiles_user_id on public.professional_profiles(user_id);
create index if not exists idx_service_requests_user_id on public.service_requests(client_id);
create index if not exists idx_service_requests_category_id on public.service_requests(category_id);
create index if not exists idx_proposals_request_id on public.proposals(service_request_id);
create index if not exists idx_proposals_professional_id on public.proposals(professional_id);
-- 3. REFORÇO DE CONSTRAINTS (CHECK)
alter table public.users drop constraint if exists users_role_check;
alter table public.users
add constraint users_role_check check (role in ('client', 'professional', 'admin'));
-- 4. FUNÇÃO PARA ATUALIZAR O UPDATED_AT AUTOMATICAMENTE
create or replace function public.handle_updated_at() returns trigger as $$ begin new.updated_at = now();
return new;
end;
$$ language plpgsql;
-- 5. APLICAR TRIGGER DE UPDATED_AT NAS TABELAS PRINCIPAIS
-- Nota: DROP e CREATE para garantir atualização
drop trigger if exists set_updated_at on public.users;
create trigger set_updated_at before
update on public.users for each row execute procedure public.handle_updated_at();
drop trigger if exists set_updated_at on public.service_requests;
create trigger set_updated_at before
update on public.service_requests for each row execute procedure public.handle_updated_at();
drop trigger if exists set_updated_at on public.proposals;
create trigger set_updated_at before
update on public.proposals for each row execute procedure public.handle_updated_at();
-- 6. ATUALIZAÇÃO DAS POLÍTICAS DE RLS (INTEGRAÇÃO COM AUTH.UID)
-- Ajustando a tabela users para que o usuário autenticado só veja a si mesmo (exeto se for admin)
alter table public.users enable row level security;
drop policy if exists "Users can view own profile" on public.users;
create policy "Users can view own profile" on public.users for
select using (auth.uid() = id);
drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile" on public.users for
update using (auth.uid() = id);
-- Garantir que Soft Delete seja respeitado nas buscas
drop policy if exists "Users can only see non-deleted records" on public.service_requests;
create policy "Users can only see non-deleted records" on public.service_requests for
select using (deleted_at is null);