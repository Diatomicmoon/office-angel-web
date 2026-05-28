CREATE TABLE IF NOT EXISTS new_build_permits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  property_address TEXT NOT NULL,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  contractor_name TEXT,
  contractor_phone TEXT,
  permit_value NUMERIC,
  permit_date DATE,
  estimated_completion_date DATE, -- Calculated as permit_date + ~6 months
  status TEXT DEFAULT 'foundation' CHECK (status IN ('foundation', 'rough-in', 'drywall_stage', 'ready_to_knock', 'dead')),
  latitude NUMERIC,
  longitude NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE new_build_permits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their company permits"
  ON new_build_permits FOR SELECT
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert their company permits"
  ON new_build_permits FOR INSERT
  WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their company permits"
  ON new_build_permits FOR UPDATE
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));
