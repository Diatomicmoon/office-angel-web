const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.rpc('exec_sql', { sql: `
    SELECT polname, polcmd, polroles, polqual, polwithcheck FROM pg_policy WHERE polrelid = 'invoices'::regclass;
  `});
  console.log("Policies:", data);
}
run();
