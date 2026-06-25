const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
async function run() {
  const { data, error } = await supabase.from('new_build_permits').select('*').limit(2);
  console.log('Permits Error:', error?.message || 'No error');
  console.log('Permits Data:', data ? data.length : null);
}
run();
