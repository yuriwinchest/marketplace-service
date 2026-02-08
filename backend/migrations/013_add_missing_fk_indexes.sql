-- Migration: 013_add_missing_fk_indexes
-- Data: 2026-02-08
-- Descrição: cria índices que faltavam em colunas FK (melhora performance de JOIN/filters)

create index if not exists service_requests_region_id_idx
  on public.service_requests(region_id);

create index if not exists leads_professional_id_idx
  on public.leads(professional_id);

create index if not exists contact_unlocks_service_request_id_idx
  on public.contact_unlocks(service_request_id);

