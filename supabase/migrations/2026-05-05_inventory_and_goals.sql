-- Office Angel: Inventory tracker + Financial goals (beta scaffolding)

create table if not exists public.inventory_items (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade,
  name text not null,
  sku text,
  unit text default 'ea',
  reorder_point numeric(12,2) default 0,
  reorder_qty numeric(12,2) default 0,
  preferred_supplier text,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);

create table if not exists public.inventory_txns (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade,
  item_id uuid references public.inventory_items(id) on delete cascade,
  txn_type text not null, -- in | out | adjust
  qty numeric(12,2) not null,
  unit_cost numeric(10,2),
  ref_type text,
  ref_id uuid,
  note text,
  created_at timestamptz default timezone('utc', now())
);

create table if not exists public.financial_goals (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade,
  period_type text not null, -- month | year
  period_start date not null,
  period_end date not null,
  revenue_goal numeric(12,2) default 0,
  gross_profit_goal numeric(12,2) default 0,
  jobs_goal integer default 0,
  leads_goal integer default 0,
  notes text,
  created_at timestamptz default timezone('utc', now())
);

alter table public.inventory_items enable row level security;
alter table public.inventory_txns enable row level security;
alter table public.financial_goals enable row level security;

create index if not exists inventory_items_company_idx on public.inventory_items(company_id);
create index if not exists inventory_txns_company_created_idx on public.inventory_txns(company_id, created_at desc);
create index if not exists financial_goals_company_period_idx on public.financial_goals(company_id, period_start desc);

-- NOTE: RLS policies intentionally omitted for now; service role key bypasses RLS.
