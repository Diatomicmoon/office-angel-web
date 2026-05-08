-- Office Angel: Live Field Status
-- Run this in Supabase SQL editor (or as a migration if you have supabase CLI).

create table if not exists public.technicians (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade,
  name text not null,
  phone_number text,
  status text default 'available', -- available | en_route | on_site | off
  current_job_title text,
  last_location_address text,
  last_location jsonb, -- { lat, lng, accuracy, source }
  updated_at timestamptz default timezone('utc', now()),
  created_at timestamptz default timezone('utc', now())
);

alter table public.technicians enable row level security;

-- NOTE: RLS policies intentionally omitted for now; service role key bypasses RLS.
