import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  console.log("Adding tier column to companies table via exec_sql...");
  const query = `
    ALTER TABLE companies ADD COLUMN IF NOT EXISTS tier integer DEFAULT 1;
  `;
  const { error } = await supabase.rpc('exec_sql', { query });
  if (error) console.log("RPC exec_sql failed:", error);
  else console.log("Success.");
}
run();
