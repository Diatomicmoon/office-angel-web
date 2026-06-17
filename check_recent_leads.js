require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const omyId = 'd335e254-2a5f-4f68-b9e4-4416bd44a67b';
  
  console.log("--- JOBS (Leads) ---");
  const { data: jobs, error: jErr } = await supabase.from('jobs').select('*').eq('company_id', omyId).order('created_at', { ascending: false }).limit(3);
  if (jErr) console.error(jErr); else console.log(jobs);
  
  console.log("\n--- MESSAGES ---");
  const { data: msgs, error: mErr } = await supabase.from('messages').select('*').eq('company_id', omyId).order('created_at', { ascending: false }).limit(3);
  if (mErr) console.error(mErr); else console.log(msgs);
}
run();
