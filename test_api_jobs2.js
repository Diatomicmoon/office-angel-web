require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function check() {
  const companyId = 'd335e254-2a5f-4f68-b9e4-4416bd44a67b';
  const { data: jobs } = await supabase.from("jobs").select("*").eq("company_id", companyId);
  console.log(jobs[0]);
}
check();
