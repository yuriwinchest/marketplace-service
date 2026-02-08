-- Migration: 018_fix_public_fk_no_cascade
-- Data: 2026-02-08
-- Objetivo:
-- - Evitar efeito colateral perigoso: FK derivada `proposals -> professional_public_profiles`
--   nao deve ter ON DELETE CASCADE, pois as tabelas publicas sao sincronizadas e podem ser "reconstruidas".

do $$ begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'proposals_professional_public_fkey'
  ) then
    alter table public.proposals
      drop constraint proposals_professional_public_fkey;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'proposals_professional_public_fkey'
  ) then
    alter table public.proposals
      add constraint proposals_professional_public_fkey
      foreign key (professional_id) references public.professional_public_profiles(professional_id);
  end if;
end $$;

