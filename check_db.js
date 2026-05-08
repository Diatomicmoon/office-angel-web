const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data: profiles } = await supabase.from('profiles').select('*');
  const { data: calls } = await supabase.from('call_logs').select('*');
  const { data: users } = await supabase.auth.admin.listUsers();
  console.log("Users:", users.users.length);
  console.log("Profiles:", profiles?.length || 0);
  console.log("Calls:", calls?.length || 0);
}
check();
