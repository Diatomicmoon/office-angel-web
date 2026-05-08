-- Office Angel: Call log metadata + recording URL

alter table public.call_logs
  add column if not exists recording_url text;

alter table public.call_logs
  add column if not exists meta jsonb;

-- Helpful indexes
create index if not exists call_logs_company_created_at_idx
  on public.call_logs (company_id, created_at desc);
