ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS google_access_token TEXT,
ADD COLUMN IF NOT EXISTS google_refresh_token TEXT,
ADD COLUMN IF NOT EXISTS google_auth_updated_at TIMESTAMP WITH TIME ZONE;
