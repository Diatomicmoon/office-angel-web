create table if not exists public.material_kits (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade,
  name text not null,
  description text,
  items jsonb default '[]'::jsonb not null,
  created_at timestamptz default timezone('utc', now())
);

alter table public.material_kits enable row level security;
create index if not exists material_kits_company_idx on public.material_kits(company_id);

-- Note: RLS policies omitted for prototype as service role key is used.
