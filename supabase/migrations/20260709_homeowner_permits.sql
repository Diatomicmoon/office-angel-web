-- Add homeowner fields to new_build_permits for BatchSkipTracing integration
ALTER TABLE public.new_build_permits ADD COLUMN IF NOT EXISTS homeowner_name TEXT;
ALTER TABLE public.new_build_permits ADD COLUMN IF NOT EXISTS homeowner_phone TEXT;
