const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ztknhbilfergfwoxjzvb.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
);
async function check() {
  const { data, error } = await supabase.from('technicians').select('id, name, updated_at, last_location').order('updated_at', { ascending: false }).limit(5);
  if (error) console.error("Error:", error);
  else console.log(JSON.stringify(data, null, 2));
}
check();
