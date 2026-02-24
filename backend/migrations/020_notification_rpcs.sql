-- Security-definer RPCs to create cross-user notifications without exposing a service-role key.
-- These functions validate caller relationship/ownership using current_user_id() and existing tables.

-- Helper: check if a professional subscription is active.
create or replace function public.is_subscription_active(p_status text, p_current_period_end timestamptz)
returns boolean
language sql
stable
as $$
  select
    (p_status in ('active','trialing'))
    and (p_current_period_end is null or p_current_period_end >= now());
$$;

-- Notify subscribed professionals about a newly created request (called by the client who owns the request).
create or replace function public.notify_professionals_new_request(p_request_id uuid, p_limit int default 200)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client_id uuid;
  v_title text;
  v_category_id uuid;
  v_location_scope text;
  v_uf text;
  v_city text;
  v_has_category_map boolean;
  v_inserted int := 0;
begin
  select r.client_id, r.title, r.category_id, r.location_scope, r.uf, r.city
    into v_client_id, v_title, v_category_id, v_location_scope, v_uf, v_city
  from public.service_requests r
  where r.id = p_request_id;

  if v_client_id is null then
    raise exception 'Demanda nao encontrada';
  end if;

  if v_client_id <> public.current_user_id() then
    raise exception 'Sem permissao';
  end if;

  v_has_category_map := false;
  if v_category_id is not null then
    select exists(select 1 from public.professional_categories pc where pc.category_id = v_category_id)
      into v_has_category_map;
  end if;

  with recipients as (
    select distinct p.user_id
    from public.professional_profiles p
    join public.subscriptions s on s.professional_id = p.id
    where public.is_subscription_active(s.status, s.current_period_end)
      and (
        -- category filter: only enforce if there are mappings for this category.
        v_category_id is null
        or v_has_category_map is false
        or exists (
          select 1
          from public.professional_categories pc
          where pc.professional_id = p.id
            and pc.category_id = v_category_id
        )
      )
      and (
        -- location filter: match scope, but always include remote professionals.
        p.is_remote = true
        or v_location_scope is null
        or v_location_scope = 'national'
        or (v_location_scope = 'state' and (v_uf is null or p.uf = v_uf))
        or (v_location_scope = 'city' and (v_city is null or p.city = v_city))
      )
    order by p.user_id
    limit greatest(0, least(p_limit, 500))
  )
  insert into public.notifications (user_id, title, message, type, metadata)
  select
    r.user_id,
    'Nova demanda disponivel',
    'Uma nova demanda foi publicada: "' || coalesce(v_title, 'Servico') || '".',
    'SYSTEM_ALERT',
    jsonb_build_object('subtype','REQUEST_CREATED','serviceRequestId',p_request_id)
  from recipients r
  on conflict do nothing;

  get diagnostics v_inserted = row_count;
  return v_inserted;
end;
$$;

grant execute on function public.notify_professionals_new_request(uuid, int) to authenticated;

-- Notify professionals who already sent proposals that a request was updated (called by request owner).
create or replace function public.notify_professionals_request_updated(p_request_id uuid, p_limit int default 500)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client_id uuid;
  v_title text;
  v_inserted int := 0;
begin
  select r.client_id, r.title into v_client_id, v_title
  from public.service_requests r
  where r.id = p_request_id;

  if v_client_id is null then
    raise exception 'Demanda nao encontrada';
  end if;

  if v_client_id <> public.current_user_id() then
    raise exception 'Sem permissao';
  end if;

  with recipients as (
    select distinct p.user_id
    from public.proposals pr
    join public.professional_profiles p on p.id = pr.professional_id
    where pr.service_request_id = p_request_id
      and pr.status <> 'cancelled'
    order by p.user_id
    limit greatest(0, least(p_limit, 2000))
  )
  insert into public.notifications (user_id, title, message, type, metadata)
  select
    r.user_id,
    'Demanda atualizada',
    'O cliente atualizou a demanda "' || coalesce(v_title, 'Servico') || '".',
    'SYSTEM_ALERT',
    jsonb_build_object('subtype','REQUEST_UPDATED','serviceRequestId',p_request_id)
  from recipients r
  on conflict do nothing;

  get diagnostics v_inserted = row_count;
  return v_inserted;
end;
$$;

grant execute on function public.notify_professionals_request_updated(uuid, int) to authenticated;

-- Notify the client that a proposal was received (called by the professional who owns the proposal).
create or replace function public.notify_client_proposal_received(p_proposal_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_professional_user_id uuid;
  v_request_id uuid;
  v_client_id uuid;
  v_request_title text;
begin
  select p.user_id into v_professional_user_id
  from public.proposals pr
  join public.professional_profiles p on p.id = pr.professional_id
  where pr.id = p_proposal_id;

  if v_professional_user_id is null then
    raise exception 'Proposta nao encontrada';
  end if;

  if v_professional_user_id <> public.current_user_id() then
    raise exception 'Sem permissao';
  end if;

  select pr.service_request_id into v_request_id
  from public.proposals pr
  where pr.id = p_proposal_id;

  select r.client_id, r.title into v_client_id, v_request_title
  from public.service_requests r
  where r.id = v_request_id;

  if v_client_id is null then
    return;
  end if;

  insert into public.notifications (user_id, title, message, type, metadata)
  values (
    v_client_id,
    'Nova proposta recebida',
    'Voce recebeu uma proposta para a demanda "' || coalesce(v_request_title, 'Servico') || '".',
    'PROPOSAL_RECEIVED',
    jsonb_build_object('serviceRequestId', v_request_id, 'proposalId', p_proposal_id)
  );
end;
$$;

grant execute on function public.notify_client_proposal_received(uuid) to authenticated;

-- Notify the client that a proposal was updated (called by the professional who owns the proposal).
create or replace function public.notify_client_proposal_updated(p_proposal_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_professional_user_id uuid;
  v_request_id uuid;
  v_client_id uuid;
  v_request_title text;
begin
  select p.user_id into v_professional_user_id
  from public.proposals pr
  join public.professional_profiles p on p.id = pr.professional_id
  where pr.id = p_proposal_id;

  if v_professional_user_id is null then
    raise exception 'Proposta nao encontrada';
  end if;

  if v_professional_user_id <> public.current_user_id() then
    raise exception 'Sem permissao';
  end if;

  select pr.service_request_id into v_request_id
  from public.proposals pr
  where pr.id = p_proposal_id;

  select r.client_id, r.title into v_client_id, v_request_title
  from public.service_requests r
  where r.id = v_request_id;

  if v_client_id is null then
    return;
  end if;

  insert into public.notifications (user_id, title, message, type, metadata)
  values (
    v_client_id,
    'Proposta editada',
    'O freelancer atualizou a proposta na demanda "' || coalesce(v_request_title, 'Servico') || '".',
    'SYSTEM_ALERT',
    jsonb_build_object('subtype','PROPOSAL_UPDATED','serviceRequestId', v_request_id, 'proposalId', p_proposal_id)
  );
end;
$$;

grant execute on function public.notify_client_proposal_updated(uuid) to authenticated;

-- Notify the professional about proposal status changes (called by the client who owns the request).
create or replace function public.notify_professional_proposal_status(p_proposal_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request_id uuid;
  v_client_id uuid;
  v_prof_user_id uuid;
  v_title text;
  v_title_msg text;
  v_body_msg text;
  v_type text;
begin
  if p_status not in ('accepted','rejected') then
    raise exception 'Status invalido';
  end if;

  select pr.service_request_id into v_request_id
  from public.proposals pr
  where pr.id = p_proposal_id;

  if v_request_id is null then
    raise exception 'Proposta nao encontrada';
  end if;

  select r.client_id, r.title into v_client_id, v_title
  from public.service_requests r
  where r.id = v_request_id;

  if v_client_id is null then
    raise exception 'Demanda nao encontrada';
  end if;

  if v_client_id <> public.current_user_id() then
    raise exception 'Sem permissao';
  end if;

  select p.user_id into v_prof_user_id
  from public.proposals pr
  join public.professional_profiles p on p.id = pr.professional_id
  where pr.id = p_proposal_id;

  if v_prof_user_id is null then
    return;
  end if;

  if p_status = 'accepted' then
    v_title_msg := 'Proposta aceita';
    v_body_msg := 'Sua proposta para a demanda "' || coalesce(v_title, 'Servico') || '" foi aceita!';
    v_type := 'PROPOSAL_ACCEPTED';
  else
    v_title_msg := 'Proposta rejeitada';
    v_body_msg := 'Sua proposta foi rejeitada pelo cliente.';
    v_type := 'PROPOSAL_REJECTED';
  end if;

  insert into public.notifications (user_id, title, message, type, metadata)
  values (
    v_prof_user_id,
    v_title_msg,
    v_body_msg,
    v_type,
    jsonb_build_object('serviceRequestId', v_request_id, 'proposalId', p_proposal_id)
  );
end;
$$;

grant execute on function public.notify_professional_proposal_status(uuid, text) to authenticated;

