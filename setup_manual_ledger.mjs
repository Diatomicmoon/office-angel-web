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
    CREATE TABLE IF NOT EXISTS public.manual_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID,
        date DATE NOT NULL,
        type TEXT NOT NULL, -- 'income' or 'expense'
        amount NUMERIC(12, 2) NOT NULL,
        client_name TEXT,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;
  
  const { data, error } = await supabase.rpc('exec_sql', { sql });
  if (error) console.error("SQL Error:", error);
  else console.log("SQL Success: manual_transactions table created");
}
run();
