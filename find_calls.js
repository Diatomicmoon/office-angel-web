import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: company } = await supabase.from('companies').select('id, name').ilike('name', '%Greenside%').single();
  if (!company) {
    console.log("No greenside company found.");
    return;
  }
  console.log("Found company:", company);

  // Check possible tables for calls
  const tables = ['calls', 'call_logs', 'vapi_calls', 'inbound_calls'];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').eq('company_id', company.id);
    if (!error && data && data.length > 0) {
      console.log(`Found ${data.length} records in table '${table}':`, data);
      
      // Let's just delete them right here to be fast
      const { error: delErr } = await supabase.from(table).delete().eq('company_id', company.id);
      console.log(`Deleted from ${table}. Error:`, delErr);
    } else if (error) {
       // Table might not exist or other error, ignore
    } else {
       console.log(`No records in '${table}'`);
    }
  }
}
run();
