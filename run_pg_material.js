const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });
async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL || process.env.SUPABASE_DB_URL });
  await client.connect();
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.material_catalog (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
      sku text NOT NULL,
      item_name text,
      unit_price numeric,
      unit_of_measure text,
      supplier text,
      last_updated timestamp with time zone DEFAULT now(),
      UNIQUE(company_id, sku)
    );
    ALTER TABLE public.material_catalog ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Companies can access their own material_catalog" ON public.material_catalog;
    CREATE POLICY "Companies can access their own material_catalog" 
    ON public.material_catalog FOR ALL 
    USING (
      company_id IN (
        SELECT company_id FROM company_memberships WHERE user_id = auth.uid()
      )
    );
  `);
  console.log("Success");
  await client.end();
}
run();
