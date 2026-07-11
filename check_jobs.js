import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const companyId = '7ec29b70-c591-4d23-94a7-0b2a4a223812';
  
  const { data } = await supabase.from('jobs').select('*').eq('company_id', companyId);
  console.log(`Table jobs has ${data.length} records.`);
  if (data.length > 0) {
      await supabase.from('jobs').delete().eq('company_id', companyId);
      console.log("Deleted all jobs");
  }
}
run();
