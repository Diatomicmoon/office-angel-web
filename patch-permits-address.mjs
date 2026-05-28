import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// We can't run raw DDL via the JS client without an RPC, 
// so we'll just check if the permits table exists by doing a select.
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase.from('permits').select('*').limit(1);
  console.log('Permits table select result:', { data, error });
}
check();
