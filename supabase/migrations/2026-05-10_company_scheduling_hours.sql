-- Office Angel: per-company scheduling hours (simple v1)

alter table public.companies
  add column if not exists schedule_start_minute integer default 480; -- 8:00am

alter table public.companies
  add column if not exists schedule_end_minute integer default 1020; -- 5:00pm

