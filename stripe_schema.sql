-- Add stripe_account_id to companies
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS stripe_account_id text;

-- Create invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
    job_id uuid REFERENCES public.jobs(id) ON DELETE SET NULL,
    customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
    amount numeric NOT NULL,
    status text DEFAULT 'pending',
    stripe_payment_link text,
    stripe_invoice_id text,
    stripe_session_id text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Policies for invoices
DROP POLICY IF EXISTS "Companies can read their own invoices" ON public.invoices;
CREATE POLICY "Companies can read their own invoices" 
    ON public.invoices FOR SELECT 
    USING (auth.uid() IN (SELECT user_id FROM public.company_memberships WHERE company_id = invoices.company_id));

DROP POLICY IF EXISTS "Companies can insert their own invoices" ON public.invoices;
CREATE POLICY "Companies can insert their own invoices" 
    ON public.invoices FOR INSERT 
    WITH CHECK (auth.uid() IN (SELECT user_id FROM public.company_memberships WHERE company_id = invoices.company_id));

DROP POLICY IF EXISTS "Companies can update their own invoices" ON public.invoices;
CREATE POLICY "Companies can update their own invoices" 
    ON public.invoices FOR UPDATE 
    USING (auth.uid() IN (SELECT user_id FROM public.company_memberships WHERE company_id = invoices.company_id));