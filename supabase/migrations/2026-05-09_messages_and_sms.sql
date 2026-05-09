-- Office Angel: unified inbound/outbound messages (SMS + web) + SMS settings

-- 1) Messages table (stores the actual text/web lead content)
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  job_id uuid references public.jobs(id) on delete set null,
  channel text not null default 'sms', -- sms | web | email (future)
  direction text not null default 'inbound', -- inbound | outbound
  from_value text,
  to_value text,
  body text,
  meta jsonb,
  created_at timestamptz default timezone('utc', now())
);

create index if not exists messages_company_idx on public.messages(company_id);
create index if not exists messages_customer_idx on public.messages(customer_id);
create index if not exists messages_job_idx on public.messages(job_id);
create index if not exists messages_created_at_idx on public.messages(created_at);

alter table public.messages enable row level security;
-- NOTE: RLS policies intentionally omitted for now; server routes enforce membership.

-- 2) Jobs: store a simple notes field (fallback when messages table isn't used)
alter table public.jobs
  add column if not exists notes text;

alter table public.jobs
  add column if not exists updated_at timestamptz default timezone('utc', now());

-- 3) Companies: SMS settings + Twilio routing metadata
alter table public.companies
  add column if not exists sms_auto_reply_enabled boolean default true;

alter table public.companies
  add column if not exists sms_booking_confirmation_enabled boolean default true;

-- For subaccount-per-company setups (recommended). Optional.
alter table public.companies
  add column if not exists twilio_subaccount_sid text;

-- Optional: use a Messaging Service instead of direct-from number.
alter table public.companies
  add column if not exists twilio_messaging_service_sid text;

