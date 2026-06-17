require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const secret = 'omy_web_sec_8841';
  const { data, error } = await supabase.from('companies').update({ webhook_secret: secret }).eq('id', 'd335e254-2a5f-4f68-b9e4-4416bd44a67b').select('id, name, webhook_secret');
  console.log(data);
}
run();
