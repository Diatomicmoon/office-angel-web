create table if not exists public.supply_runner_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  name text not null,
  quantity integer not null default 1,
  unit text not null default 'ea',
  notes text default '',
  created_at timestamptz default now()
);
alter table public.supply_runner_items enable row level security;
create policy "Company members can manage supply items"
  on public.supply_runner_items for all
  using (company_id = (select id from public.companies limit 1));
