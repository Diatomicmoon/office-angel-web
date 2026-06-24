
CREATE TABLE public.material_catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    item_name TEXT NOT NULL,
    unit_price NUMERIC(10, 4) NOT NULL,
    unit_of_measure TEXT NOT NULL,
    supplier TEXT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.material_catalog ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy for authenticated users to view their own material catalog
CREATE POLICY "Users can view their own material catalog" ON public.material_catalog
FOR SELECT USING (auth.uid() IN (SELECT id FROM public.users WHERE public.users.company_id = public.material_catalog.company_id));

-- Policy for authenticated users to insert into their own material catalog
CREATE POLICY "Users can insert into their own material catalog" ON public.material_catalog
FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM public.users WHERE public.users.company_id = public.material_catalog.company_id));

-- Policy for authenticated users to update their own material catalog
CREATE POLICY "Users can update their own material catalog" ON public.material_catalog
FOR UPDATE USING (auth.uid() IN (SELECT id FROM public.users WHERE public.users.company_id = public.material_catalog.company_id));

-- Policy for authenticated users to delete from their own material catalog
CREATE POLICY "Users can delete from their own material catalog" ON public.material_catalog
FOR DELETE USING (auth.uid() IN (SELECT id FROM public.users WHERE public.users.company_id = public.material_catalog.company_id));

-- Create function to update last_updated timestamp
CREATE OR REPLACE FUNCTION public.update_last_updated_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update last_updated timestamp
CREATE TRIGGER material_catalog_last_updated_at_before_update
BEFORE UPDATE ON public.material_catalog
FOR EACH ROW EXECUTE FUNCTION public.update_last_updated_column();
