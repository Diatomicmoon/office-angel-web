require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data: jobs, error: jErr } = await supabase.from('jobs').select('title, notes').neq('company_id', 'd335e254-2a5f-4f68-b9e4-4416bd44a67b').order('created_at', { ascending: false }).limit(3);
  if (jErr) console.error(jErr); else console.log(jobs);
}
run();
