-- Migration: 019_bootstrap_user_rpc
-- Data: 2026-02-08
-- Objetivo:
-- - Remover dependência de `service_role` no fluxo de cadastro/login.
-- - Criar uma função SECURITY DEFINER chamada via JWT (auth.uid) para:
--   - criar/recuperar `public.users` (ID interno)
--   - criar mapeamento `public.user_identities` (auth_user_id -> user_id)
--   - criar `professional_profiles` quando aplicável

create or replace function public.bootstrap_user(
  p_name text default null,
  p_description text default null,
  p_avatar_url text default null,
  p_role text default 'client'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_auth_user_id uuid := auth.uid();
  v_email text := lower(nullif(auth.jwt() ->> 'email', ''));
  v_user_id uuid;
  v_role text := coalesce(nullif(p_role, ''), 'client');
  v_existing_role text;
begin
  if v_auth_user_id is null then
    raise exception 'Nao autenticado';
  end if;

  if v_email is null then
    raise exception 'Email ausente no token';
  end if;

  -- 1) If mapping already exists, return it (idempotent).
  select user_id
    into v_user_id
  from public.user_identities
  where auth_user_id = v_auth_user_id;

  if v_user_id is not null then
    return v_user_id;
  end if;

  -- 2) If an internal user already exists for this email and is not mapped yet, reuse it.
  select u.id, u.role
    into v_user_id, v_existing_role
  from public.users u
  where u.email = v_email
  limit 1;

  if v_user_id is not null then
    if exists (select 1 from public.user_identities i where i.user_id = v_user_id) then
      raise exception 'Email ja vinculado a outra conta';
    end if;
  else
    if v_role not in ('client', 'professional') then
      v_role := 'client';
    end if;

    insert into public.users (id, email, name, description, role, avatar_url)
    values (
      gen_random_uuid(),
      v_email,
      nullif(p_name, ''),
      nullif(p_description, ''),
      v_role,
      nullif(p_avatar_url, '')
    )
    returning id, role into v_user_id, v_existing_role;
  end if;

  -- 3) Create mapping auth uid -> internal user id.
  insert into public.user_identities (auth_user_id, user_id)
  values (v_auth_user_id, v_user_id);

  -- 4) Ensure professional profile exists (if user is professional).
  if v_existing_role = 'professional' then
    insert into public.professional_profiles (user_id)
    values (v_user_id)
    on conflict (user_id) do nothing;
  end if;

  return v_user_id;
end;
$$;

revoke all on function public.bootstrap_user(text, text, text, text) from public;
grant execute on function public.bootstrap_user(text, text, text, text) to authenticated;

