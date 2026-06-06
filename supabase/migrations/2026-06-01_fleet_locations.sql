-- Migration: Live Fleet Radar
-- Stores live GPS pings from the native Expo background location task

CREATE TABLE IF NOT EXISTS fleet_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    technician_id UUID REFERENCES technicians(id) ON DELETE CASCADE,
    
    latitude DECIMAL NOT NULL,
    longitude DECIMAL NOT NULL,
    
    heading DECIMAL, -- For showing directional van icons
    speed DECIMAL,   -- In mph or km/h, useful for tracking if they are driving
    
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    -- Optional: the job they are currently routed to
    active_job_id UUID REFERENCES jobs(id) ON DELETE SET NULL
);

-- Realtime needs an index to quickly pull the LATEST location for a fleet map
CREATE INDEX idx_fleet_locations_company_tech_time ON fleet_locations(company_id, technician_id, timestamp DESC);

-- Enable RLS
ALTER TABLE fleet_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view fleet locations for their company"
    ON fleet_locations FOR SELECT
    USING (company_id IN (
        SELECT company_id FROM company_memberships WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can insert fleet locations for their company"
    ON fleet_locations FOR INSERT
    WITH CHECK (company_id IN (
        SELECT company_id FROM company_memberships WHERE user_id = auth.uid()
    ));
