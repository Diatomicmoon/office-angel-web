-- Migration: Time & Attendance Tracking
-- Prepares the foundation for both Phase 1 (CSV Export) and Phase 2 (Finch API Auto-Sync)

CREATE TABLE IF NOT EXISTS time_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    technician_id UUID REFERENCES technicians(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL, -- Nullable for shop time, training, travel, etc.
    
    clock_in TIMESTAMPTZ NOT NULL,
    clock_out TIMESTAMPTZ,
    
    -- Geofencing / Auto-punch features
    clock_in_location_lat DECIMAL,
    clock_in_location_lng DECIMAL,
    clock_out_location_lat DECIMAL,
    clock_out_location_lng DECIMAL,
    auto_punched_out BOOLEAN DEFAULT false,
    
    -- e.g., 'regular', 'overtime', 'travel', 'shop_time', 'pto'
    entry_type TEXT DEFAULT 'regular', 
    
    -- E.g., 'pending', 'approved', 'exported_csv', 'synced_api'
    sync_status TEXT DEFAULT 'pending', 
    
    -- Future-proofing: When we turn on the API automation (Finch/Gusto), we store their IDs here
    external_payroll_id TEXT, 
    external_sync_meta JSONB, 
    
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast queries by company and payroll status
CREATE INDEX idx_time_entries_company_status ON time_entries(company_id, sync_status);
-- Index for job costing (finding all labor hours for a specific job)
CREATE INDEX idx_time_entries_job ON time_entries(job_id);
-- Index for technician timesheet views
CREATE INDEX idx_time_entries_technician ON time_entries(technician_id, clock_in);

-- RLS Policies
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view time entries for their company"
    ON time_entries FOR SELECT
    USING (company_id IN (
        SELECT company_id FROM company_memberships WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can insert time entries for their company"
    ON time_entries FOR INSERT
    WITH CHECK (company_id IN (
        SELECT company_id FROM company_memberships WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can update time entries for their company"
    ON time_entries FOR UPDATE
    USING (company_id IN (
        SELECT company_id FROM company_memberships WHERE user_id = auth.uid()
    ));
