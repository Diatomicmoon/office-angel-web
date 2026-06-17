import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.join('/home/jakob/.openclaw/workspace/office-angel-web', '.env') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const sql = fs.readFileSync('office-angel-web/marketing_prep.sql', 'utf8');
  const { data, error } = await supabase.rpc('exec_sql', { sql });
  if (error) console.error("SQL Error:", error);
  else console.log("SQL Success:", data || "Columns added");
}
run();
