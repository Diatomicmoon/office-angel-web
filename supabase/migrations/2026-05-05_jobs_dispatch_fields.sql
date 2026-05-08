-- Add dispatching fields to jobs table

alter table public.jobs
  add column if not exists technician_id uuid references public.technicians(id) on delete set null;

alter table public.jobs
  add column if not exists scheduled_start timestamptz;

alter table public.jobs
  add column if not exists scheduled_end timestamptz;

alter table public.jobs
  add column if not exists priority text default 'normal'; -- emergency, high, normal, low
