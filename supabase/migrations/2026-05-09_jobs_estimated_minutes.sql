-- Add estimated duration to jobs table (AI scheduling helper)

alter table public.jobs
  add column if not exists estimated_minutes integer;

