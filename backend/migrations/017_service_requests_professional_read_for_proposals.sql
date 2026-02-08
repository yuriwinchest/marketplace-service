-- Migration: 017_service_requests_professional_read_for_proposals
-- Data: 2026-02-08
-- Objetivo:
-- - Permitir que profissionais leiam `service_requests` quando eles tiverem
--   uma proposta vinculada, para suportar listagens com joins sob RLS (sem service-role).

drop policy if exists "Professionals can read requests they proposed to" on public.service_requests;
create policy "Professionals can read requests they proposed to"
  on public.service_requests for select
  using (
    deleted_at is null
    and exists (
      select 1
      from public.proposals pr
      join public.professional_profiles pp on pp.id = pr.professional_id
      where pr.service_request_id = service_requests.id
        and pp.user_id = public.current_user_id()
    )
  );

