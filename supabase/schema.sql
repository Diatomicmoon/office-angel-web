-- 1. Create Companies Table (For the B2B SaaS Tenants)
CREATE TABLE companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone_number TEXT, -- The dedicated Twilio/Bland AI number for this company
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 2. Create User Profiles (Links Auth to Companies)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'staff', -- 'owner', 'dispatcher', 'staff'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 2b. Company Memberships (multi-tenant: login selects company)
CREATE TABLE company_memberships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'staff',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  UNIQUE(user_id, company_id)
);

-- 3. Create Customers Table (The people calling in)
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 4. Create Call Logs Table (The core AI feature)
CREATE TABLE call_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  call_status TEXT, -- 'completed', 'missed', 'voicemail'
  duration_seconds INTEGER,
  transcript JSONB, -- Stored as a JSON array of {speaker: "AI", text: "..."}
  summary TEXT,
  urgency_flag TEXT, -- 'high', 'medium', 'low'
  action_items TEXT,
  recording_url TEXT,
  meta JSONB, -- provider metadata: { provider, provider_call_id, ... }
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 5. Create Jobs / Projects Table (Ties everything together)
CREATE TABLE jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  title TEXT NOT NULL, -- e.g., "200A Panel Upgrade"
  status TEXT DEFAULT 'Lead', -- 'Lead', 'Scheduled', 'In Progress', 'Completed', 'Ghosted'
  address TEXT,
  quoted_amount NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 6. Create Receipts / Materials Table (Supply Runner OCR)
CREATE TABLE receipts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL, -- Nullable if "Truck Stock"
  supplier_name TEXT, -- e.g., "Home Depot Pro", "Viking Electric"
  total_amount NUMERIC(10, 2),
  receipt_url TEXT, -- Link to PDF/Image in Supabase Storage
  line_items JSONB, -- Array of { item: "Romex", qty: 1, cost: 134.50 }
  status TEXT DEFAULT 'Action Required', -- 'Mapped to Job Costing', 'Action Required'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 6b. Inventory Items (Truck stock / shop stock)
CREATE TABLE inventory_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT,
  unit TEXT DEFAULT 'ea', -- ea, ft, box, roll, etc.
  reorder_point NUMERIC(12, 2) DEFAULT 0,
  reorder_qty NUMERIC(12, 2) DEFAULT 0,
  preferred_supplier TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 6c. Inventory Transactions (simple ledger)
CREATE TABLE inventory_txns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
  txn_type TEXT NOT NULL, -- 'in', 'out', 'adjust'
  qty NUMERIC(12, 2) NOT NULL,
  unit_cost NUMERIC(10, 2),
  ref_type TEXT, -- 'receipt', 'job', 'manual'
  ref_id UUID,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 6d. Financial Goals (monthly/yearly projections)
CREATE TABLE financial_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  period_type TEXT NOT NULL, -- 'month' | 'year'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  revenue_goal NUMERIC(12, 2) DEFAULT 0,
  gross_profit_goal NUMERIC(12, 2) DEFAULT 0,
  jobs_goal INTEGER DEFAULT 0,
  leads_goal INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 7. Create Permits Table (Permit & Inspection AI)
CREATE TABLE permits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  municipality TEXT, -- e.g., "Minneapolis", "St. Paul"
  permit_number TEXT,
  status TEXT DEFAULT 'Application Started', -- 'Approved', 'Rough-In Passed', 'Final Passed', 'Failed'
  fee_amount NUMERIC(10, 2),
  admin_time_minutes INTEGER DEFAULT 0, -- Tracked hidden labor
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 8. Create Technicians Table (Live Field Status)
CREATE TABLE technicians (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone_number TEXT,
  status TEXT DEFAULT 'available', -- 'available', 'en_route', 'on_site', 'off'
  current_job_title TEXT,
  last_location_address TEXT,
  last_location JSONB, -- { lat, lng, accuracy, source }
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Enable Row Level Security (RLS) so companies can only see their own data
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_txns ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (Example: Users can only select data where company_id matches their profile's company_id)
-- Note: In production, you'll add specific INSERT/UPDATE policies based on auth.uid() matching the profiles table.
