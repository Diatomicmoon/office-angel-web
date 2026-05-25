-- Door-to-Door Canvassing CRM: Track visits, interest levels, and resident details.
CREATE TABLE door_knocking_visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resident_name TEXT,
  address TEXT NOT NULL,
  city TEXT,
  state TEXT,
  zip TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  interest_level TEXT NOT NULL DEFAULT 'not_interested', -- 'hot', 'warm', 'not_interested', 'do_not_knock'
  notes TEXT,
  phone_number TEXT,
  email TEXT,
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

CREATE INDEX idx_door_knocking_visits_company_id ON door_knocking_visits(company_id);
CREATE INDEX idx_door_knocking_visits_interest_level ON door_knocking_visits(interest_level);
CREATE INDEX idx_door_knocking_visits_address ON door_knocking_visits(address);
