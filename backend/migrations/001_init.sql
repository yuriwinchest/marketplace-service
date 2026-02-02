do $$ begin if not exists (
  select 1
  from pg_type
  where typname = 'user_role'
) then create type user_role as enum ('client', 'professional', 'admin');
end if;
if not exists (
  select 1
  from pg_type
  where typname = 'request_urgency'
) then create type request_urgency as enum ('low', 'medium', 'high');
end if;
if not exists (
  select 1
  from pg_type
  where typname = 'request_status'
) then create type request_status as enum ('open', 'matched', 'closed', 'cancelled');
end if;
if not exists (
  select 1
  from pg_type
  where typname = 'lead_status'
) then create type lead_status as enum ('available', 'purchased', 'expired');
end if;
end $$;
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  name text,
  role user_role not null default 'client',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.refresh_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  token_hash text not null,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists refresh_tokens_user_id_idx on public.refresh_tokens(user_id);
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.regions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.users(id) on delete cascade,
  category_id uuid references public.categories(id),
  region_id uuid references public.regions(id),
  title text not null,
  description text,
  budget_min numeric(12, 2),
  budget_max numeric(12, 2),
  urgency request_urgency not null default 'medium',
  status request_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint budget_range_chk check (
    budget_min is null
    or budget_max is null
    or budget_min <= budget_max
  )
);
create index if not exists service_requests_client_id_idx on public.service_requests(client_id);
create index if not exists service_requests_status_idx on public.service_requests(status);
create table if not exists public.professional_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  bio text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
if not exists (
  select 1
  from pg_type
  where typname = 'proposal_status'
) then create type proposal_status as enum ('pending', 'accepted', 'rejected', 'cancelled');
end if;
create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  service_request_id uuid not null references public.service_requests(id) on delete cascade,
  professional_id uuid not null references public.professional_profiles(id) on delete cascade,
  value numeric(12, 2) not null,
  description text,
  estimated_days int,
  status proposal_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists proposals_request_id_idx on public.proposals(service_request_id);
create index if not exists proposals_professional_id_idx on public.proposals(professional_id);
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.service_requests(id) on delete cascade,
  professional_id uuid references public.professional_profiles(id) on delete
  set null,
    price numeric(12, 2) not null default 0,
    status lead_status not null default 'available',
    purchased_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists leads_request_id_idx on public.leads(request_id);
create index if not exists leads_status_idx on public.leads(status);
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete
  set null,
    provider text not null,
    provider_payment_id text,
    amount numeric(12, 2) not null,
    currency text not null default 'BRL',
    status text not null,
    raw jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists payments_user_id_idx on public.payments(user_id);
create index if not exists payments_provider_payment_id_idx on public.payments(provider_payment_id);
create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.service_requests(id) on delete cascade,
  from_user_id uuid not null references public.users(id) on delete cascade,
  to_user_id uuid not null references public.users(id) on delete cascade,
  score int not null,
  comment text,
  created_at timestamptz not null default now(),
  constraint ratings_score_chk check (
    score between 1 and 5
  )
);
create index if not exists ratings_to_user_id_idx on public.ratings(to_user_id);
create index if not exists ratings_request_id_idx on public.ratings(request_id);
create or replace function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now();
return new;
end $$;
drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at before
update on public.users for each row execute function public.set_updated_at();
drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at before
update on public.categories for each row execute function public.set_updated_at();
drop trigger if exists regions_set_updated_at on public.regions;
create trigger regions_set_updated_at before
update on public.regions for each row execute function public.set_updated_at();
drop trigger if exists service_requests_set_updated_at on public.service_requests;
create trigger service_requests_set_updated_at before
update on public.service_requests for each row execute function public.set_updated_at();
drop trigger if exists professional_profiles_set_updated_at on public.professional_profiles;
create trigger professional_profiles_set_updated_at before
update on public.professional_profiles for each row execute function public.set_updated_at();
drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at before
update on public.leads for each row execute function public.set_updated_at();
drop trigger if exists payments_set_updated_at on public.payments;
create trigger payments_set_updated_at before
update on public.payments for each row execute function public.set_updated_at();