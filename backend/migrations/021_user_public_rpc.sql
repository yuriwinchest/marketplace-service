-- Return minimal public user fields for a given internal user id.
-- Used by the API to show who posted a request, without exposing a service-role key.

create or replace function public.get_user_public(p_user_id uuid)
returns table (
  id uuid,
  name text,
  description text,
  avatar_url text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_user_id is null then
    return;
  end if;

  -- Self can always see their own public fields.
  if p_user_id = public.current_user_id() then
    return query
      select u.id, u.name, u.description, u.avatar_url, u.created_at
      from public.users u
      where u.id = p_user_id;
    return;
  end if;

  -- Active professionals (subscribers) can view public fields of other users (no contact info).
  if exists (
    select 1
    from public.professional_profiles p
    join public.subscriptions s on s.professional_id = p.id
    where p.user_id = public.current_user_id()
      and public.is_subscription_active(s.status, s.current_period_end)
  ) then
    return query
      select u.id, u.name, u.description, u.avatar_url, u.created_at
      from public.users u
      where u.id = p_user_id;
    return;
  end if;

  -- Not allowed: return no rows.
  return;
end;
$$;

grant execute on function public.get_user_public(uuid) to authenticated;

