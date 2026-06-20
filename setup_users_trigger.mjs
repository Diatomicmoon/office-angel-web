import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join('/home/jakob/.openclaw/workspace/office-angel-web', '.env') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const sql = `
    -- Make sure role column exists in users
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'field_rep';
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
  `;
  
  const { data, error } = await supabase.rpc('exec_sql', { sql });
  if (error) console.error("SQL Error:", error);
  else console.log("SQL Success: users table updated with role");
}
run();
