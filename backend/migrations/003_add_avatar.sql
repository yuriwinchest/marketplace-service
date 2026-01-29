alter table public.users add column if not exists avatar_url text;

alter table public.professional_profiles add column if not exists skills text[];
