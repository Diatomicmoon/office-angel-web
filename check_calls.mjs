import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join('/home/jakob/.openclaw/workspace/office-angel-web', '.env') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data: calls, error } = await supabase.from('call_logs').select('id, company_id, phone_number').limit(10);
  console.log('Sample calls:', calls);
  
  const { data: c } = await supabase.from('companies').select('id, name');
  console.log('Companies:', c);
}
check();
