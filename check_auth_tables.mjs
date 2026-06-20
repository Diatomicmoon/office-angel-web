import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join('/home/jakob/.openclaw/workspace/office-angel-web', '.env') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data: cols } = await supabase.rpc('exec_sql', { sql: "SELECT table_name FROM information_schema.tables WHERE table_schema='public'" });
  console.log("Public Tables:", cols);
}
run();
