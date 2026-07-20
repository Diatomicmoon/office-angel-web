alter table public.companies
  add column if not exists google_calendar_id text,
  add column if not exists google_channel_id text,
  add column if not exists google_resource_id text,
  add column if not exists google_sync_token text,
  add column if not exists google_channel_expiration text;