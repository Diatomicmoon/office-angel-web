require('dotenv').config({ path: '.env' });

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  // Let's emulate what /api/jobs does
  const companyId = 'd335e254-2a5f-4f68-b9e4-4416bd44a67b';
  
  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("*, customers(first_name, last_name, phone_number)")
    .eq("company_id", companyId)
    .order("updated_at", { ascending: false })
    .order("created_at", { ascending: false });
    
  console.log("Jobs returned:", jobs?.length);
  if (jobs) {
      console.log(jobs[0].status);
  }
}
check();
