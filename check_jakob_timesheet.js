const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const urlMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_URL="([^"]+)"/);
const keyMatch = envFile.match(/SUPABASE_SERVICE_ROLE_KEY="([^"]+)"/);

const supabase = createClient(urlMatch[1], keyMatch[1]);

async function check() {
  const { data: techs } = await supabase.from('technicians').select('id, name, last_location').ilike('name', '%Jakob%');
  console.log("Techs:", JSON.stringify(techs, null, 2));
  
  if (techs && techs.length > 0) {
    for (const tech of techs) {
      const { data: timesheets } = await supabase
        .from('timesheets')
        .select('*')
        .eq('technician_id', tech.id)
        .is('clock_out', null)
        .order('clock_in', { ascending: false });
      console.log(`Active timesheets for ${tech.name}:`, timesheets);
    }
  }
}
check();
