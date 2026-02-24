-- Subscription/quota management without exposing service-role key.
-- Keep `subscriptions` writes locked down by RLS and expose controlled SECURITY DEFINER RPCs.

create or replace function public.create_subscription(p_professional_id uuid, p_plan_code text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_now timestamptz := now();
  v_period_end timestamptz := (now() + interval '1 month');
  v_plan_name text;
  v_monthly_price numeric;
  v_proposal_limit int;
begin
  select p.user_id into v_user_id
  from public.professional_profiles p
  where p.id = p_professional_id;

  if v_user_id is null then
    raise exception 'Perfil profissional nao encontrado';
  end if;

  if v_user_id <> public.current_user_id() then
    raise exception 'Sem permissao';
  end if;

  -- Plan mapping (must match backend/src/modules/subscriptions/subscriptionPlans.ts)
  case p_plan_code
    when 'starter_20' then v_plan_name := 'Starter 20'; v_monthly_price := 9.99; v_proposal_limit := 20;
    when 'pro_50' then v_plan_name := 'Pro 50'; v_monthly_price := 29.99; v_proposal_limit := 50;
    when 'max_100' then v_plan_name := 'Max 100'; v_monthly_price := 59.99; v_proposal_limit := 100;
    when 'enterprise_200' then v_plan_name := 'Enterprise 200'; v_monthly_price := 89.90; v_proposal_limit := 200;
    else
      raise exception 'Plano invalido';
  end case;

  insert into public.subscriptions (
    professional_id,
    status,
    current_period_start,
    current_period_end,
    cancel_at_period_end,
    plan_code,
    plan_name,
    monthly_price,
    proposal_limit,
    proposals_used_in_period,
    updated_at
  )
  values (
    p_professional_id,
    'active',
    v_now,
    v_period_end,
    false,
    p_plan_code,
    v_plan_name,
    v_monthly_price,
    v_proposal_limit,
    0,
    v_now
  )
  on conflict (professional_id) do update set
    status = 'active',
    current_period_start = excluded.current_period_start,
    current_period_end = excluded.current_period_end,
    cancel_at_period_end = excluded.cancel_at_period_end,
    plan_code = excluded.plan_code,
    plan_name = excluded.plan_name,
    monthly_price = excluded.monthly_price,
    proposal_limit = excluded.proposal_limit,
    proposals_used_in_period = 0,
    updated_at = excluded.updated_at;

  update public.professional_profiles
  set subscription_status = 'active', updated_at = v_now
  where id = p_professional_id;
end;
$$;

grant execute on function public.create_subscription(uuid, text) to authenticated;

create or replace function public.consume_proposal_quota(p_professional_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_sub_id uuid;
  v_used int;
  v_limit int;
  v_status text;
  v_period_end timestamptz;
begin
  select p.user_id into v_user_id
  from public.professional_profiles p
  where p.id = p_professional_id;

  if v_user_id is null then
    raise exception 'Perfil profissional nao encontrado';
  end if;

  if v_user_id <> public.current_user_id() then
    raise exception 'Sem permissao';
  end if;

  select s.id, s.proposals_used_in_period, s.proposal_limit, s.status, s.current_period_end
    into v_sub_id, v_used, v_limit, v_status, v_period_end
  from public.subscriptions s
  where s.professional_id = p_professional_id;

  if v_sub_id is null or not public.is_subscription_active(v_status, v_period_end) then
    raise exception 'Voce precisa de um plano ativo para enviar propostas.';
  end if;

  if coalesce(v_limit, 0) <= 0 then
    raise exception 'Plano invalido: limite mensal nao configurado.';
  end if;

  if coalesce(v_used, 0) >= v_limit then
    raise exception 'Voce atingiu o limite mensal do seu plano. Faca upgrade ou aguarde a renovacao.';
  end if;

  update public.subscriptions
  set proposals_used_in_period = v_used + 1,
      updated_at = now()
  where id = v_sub_id
    and proposals_used_in_period = v_used;

  if not found then
    raise exception 'Nao foi possivel consumir limite do plano';
  end if;
end;
$$;

grant execute on function public.consume_proposal_quota(uuid) to authenticated;

