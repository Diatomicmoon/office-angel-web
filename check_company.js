const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data, error } = await supabase.from('companies').select('phone_number, ai_enabled, forward_to_phone').eq('id', '5341bfb2-8fce-4c7a-9a30-20e6aba60a8a');
  console.log(data, error);
}
run();
