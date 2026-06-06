ALTER TABLE public.timesheets ADD COLUMN IF NOT EXISTS edited_manually BOOLEAN DEFAULT false;
