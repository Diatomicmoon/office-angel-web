import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { error: e1 } = await supabase.from('permits').select('id').limit(1);
  console.log('permits table error:', e1 ? e1.message : 'OK');
  
  const { error: e2 } = await supabase.from('new_build_permits').select('id').limit(1);
  console.log('new_build_permits table error:', e2 ? e2.message : 'OK');
}
check();
