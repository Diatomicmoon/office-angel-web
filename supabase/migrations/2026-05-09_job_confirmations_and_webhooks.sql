-- Office Angel: SMS confirmations + website webhook security

-- Jobs: confirmation state
alter table public.jobs
  add column if not exists confirmation_status text default 'pending'; -- pending | confirmed | reschedule_requested

alter table public.jobs
  add column if not exists confirmed_at timestamptz;

alter table public.jobs
  add column if not exists reschedule_requested_at timestamptz;

-- Companies: website webhook secret (recommended once multi-tenant)
alter table public.companies
  add column if not exists webhook_secret text;

