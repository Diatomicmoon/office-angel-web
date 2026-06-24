CREATE TABLE IF NOT EXISTS public.invoices (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
    job_id uuid REFERENCES public.jobs(id) ON DELETE SET NULL,
    customer_name text NOT NULL,
    customer_email text,
    customer_phone text,
    amount decimal(10,2) NOT NULL DEFAULT 0.00,
    status text NOT NULL DEFAULT 'pending', -- pending, paid, overdue, canceled
    stripe_session_id text,
    stripe_payment_link text,
    created_at timestamptz DEFAULT timezone('utc', now()),
    updated_at timestamptz DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS invoices_company_idx ON public.invoices(company_id);

CREATE TABLE IF NOT EXISTS public.invoice_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_id uuid REFERENCES public.invoices(id) ON DELETE CASCADE,
    description text NOT NULL,
    quantity integer NOT NULL DEFAULT 1,
    rate decimal(10,2) NOT NULL DEFAULT 0.00,
    created_at timestamptz DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS invoice_items_invoice_idx ON public.invoice_items(invoice_id);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view invoices for their company"
    ON public.invoices FOR SELECT
    USING (company_id IN (
        SELECT company_id FROM public.company_memberships WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can insert invoices for their company"
    ON public.invoices FOR INSERT
    WITH CHECK (company_id IN (
        SELECT company_id FROM public.company_memberships WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can update invoices for their company"
    ON public.invoices FOR UPDATE
    USING (company_id IN (
        SELECT company_id FROM public.company_memberships WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can view invoice items for their company"
    ON public.invoice_items FOR SELECT
    USING (invoice_id IN (
        SELECT id FROM public.invoices WHERE company_id IN (
            SELECT company_id FROM public.company_memberships WHERE user_id = auth.uid()
        )
    ));

CREATE POLICY "Users can insert invoice items for their company"
    ON public.invoice_items FOR INSERT
    WITH CHECK (invoice_id IN (
        SELECT id FROM public.invoices WHERE company_id IN (
            SELECT company_id FROM public.company_memberships WHERE user_id = auth.uid()
        )
    ));
