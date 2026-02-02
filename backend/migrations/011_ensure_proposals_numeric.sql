-- Migration: Ensure proposals value is numeric
-- Date: 2026-02-01
-- Description: Converts value column to numeric if it is money, or ensures it is numeric
do $$ begin -- Check if column exists and is not numeric (e.g. money)
if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
        and table_name = 'proposals'
        and column_name = 'value'
        and data_type = 'money'
) then -- Convert money to numeric
alter table public.proposals
alter column value type numeric(12, 2) using value::numeric;
elsif exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
        and table_name = 'proposals'
        and column_name = 'value'
) then -- Ensure it is numeric(12,2) regardless (if text or other convertible type)
alter table public.proposals
alter column value type numeric(12, 2) using value::numeric;
end if;
end $$;