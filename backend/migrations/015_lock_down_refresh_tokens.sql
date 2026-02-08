-- Migration: 015_lock_down_refresh_tokens
-- Data: 2026-02-08
-- Objetivo: remover policies genéricas (`true`) e bloquear acesso via PostgREST à tabela legada `refresh_tokens`.

alter table if exists public.refresh_tokens enable row level security;

drop policy if exists "Backend can manage refresh tokens" on public.refresh_tokens;
drop policy if exists "Users can read own refresh tokens" on public.refresh_tokens;
drop policy if exists "Deny all on refresh_tokens" on public.refresh_tokens;

create policy "Deny all on refresh_tokens"
  on public.refresh_tokens for all
  using (false)
  with check (false);

