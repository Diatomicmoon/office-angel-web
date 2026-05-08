-- Office Angel: multi-tenant membership table

create table if not exists public.company_memberships (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  role text default 'staff',
  created_at timestamptz default timezone('utc', now()),
  unique(user_id, company_id)
);

alter table public.company_memberships enable row level security;

create index if not exists company_memberships_user_idx on public.company_memberships(user_id);
create index if not exists company_memberships_company_idx on public.company_memberships(company_id);

-- NOTE: RLS policies intentionally omitted for now; API routes can enforce membership server-side.
