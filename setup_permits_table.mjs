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
    CREATE TABLE IF NOT EXISTS public.canvassing_permits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID,
        title TEXT NOT NULL,
        expiration_date DATE,
        file_url TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Try to insert bucket (if storage.buckets exists and is accessible via RPC)
    INSERT INTO storage.buckets (id, name, public) 
    VALUES ('canvassing_permits', 'canvassing_permits', true)
    ON CONFLICT (id) DO NOTHING;
  `;
  
  const { data, error } = await supabase.rpc('exec_sql', { sql });
  if (error) console.error("SQL Error:", error);
  else console.log("SQL Success: Table created");
}
run();
