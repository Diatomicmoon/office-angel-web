CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  property_address TEXT NOT NULL,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  new_owner_name TEXT,
  sale_date DATE,
  sale_price NUMERIC,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'knocked', 'converted', 'dead')),
  source TEXT DEFAULT 'scraper',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their company leads"
  ON leads FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert their company leads"
  ON leads FOR INSERT
  WITH CHECK (company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update their company leads"
  ON leads FOR UPDATE
  USING (company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  ));
