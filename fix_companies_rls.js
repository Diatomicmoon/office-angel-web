const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const sql = `
    DROP POLICY IF EXISTS "Allow public read access" ON companies;
    DROP POLICY IF EXISTS "Users can view their own company" ON companies;
    CREATE POLICY "Users can view their own company" ON companies 
      FOR SELECT 
      USING (
        id IN (SELECT company_id FROM company_memberships WHERE user_id = auth.uid())
      );
  `;
  const { error } = await supabase.rpc('exec_sql', { sql });
  if (error) {
    console.error("RPC Error:", error);
  } else {
    console.log("Successfully tightened RLS on companies table.");
  }
}
run();
