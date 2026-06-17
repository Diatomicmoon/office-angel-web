require('dotenv').config({ path: '.env' });

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const companyId = 'd335e254-2a5f-4f68-b9e4-4416bd44a67b';
  
  let query = supabase
    .from("call_logs")
    .select("id, company_id, customer_id, call_status, duration_seconds, transcript, summary, urgency_flag, action_items, recording_url, meta, created_at, customers(*)")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(50);
    
  const { data, error } = await query;
  console.log("Call logs returned:", data?.length, "Error:", error);
}
check();
