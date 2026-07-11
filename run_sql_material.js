const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
async function run() {
  const { data, error } = await supabase.rpc('exec_sql', {
    sql_string: `
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
      
      -- Let owners read/write their own catalog
      DROP POLICY IF EXISTS "Companies can access their own material_catalog" ON public.material_catalog;
      CREATE POLICY "Companies can access their own material_catalog" 
      ON public.material_catalog FOR ALL 
      USING (
        company_id IN (
          SELECT company_id FROM company_memberships WHERE user_id = auth.uid()
        )
      );
    `
  });
  console.log("RPC Error:", error);
}
run();
