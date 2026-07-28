const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
  const { data, error } = await supabase.from('technicians').select('*').eq('name', 'Jakob').single();
  console.log("Technician:", data);
  if (data) {
    const { data: fleet } = await supabase.from('fleet_locations').select('*').eq('technician_id', data.id).order('created_at', { ascending: false }).limit(2);
    console.log("Latest fleet locations:", fleet);
  }
}
check();
