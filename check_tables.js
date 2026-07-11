import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const companyId = '7ec29b70-c591-4d23-94a7-0b2a4a223812';
  
  const tables = ['calls', 'call_logs', 'vapi_calls', 'inbound_calls', 'jobs'];
  for (const table of tables) {
    const { data } = await supabase.from(table).select('*').eq('company_id', companyId);
    if (data && data.length > 0) {
      console.log(`Table ${table} has ${data.length} records.`, data);
      await supabase.from(table).delete().eq('company_id', companyId);
    }
  }
}
run();
