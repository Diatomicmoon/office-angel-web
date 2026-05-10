-- Office Angel: calendar webhook + onboarding helpers

alter table public.companies
  add column if not exists calendar_webhook_url text;

-- webhook_secret was added earlier; this migration is a no-op if already present
alter table public.companies
  add column if not exists webhook_secret text;

