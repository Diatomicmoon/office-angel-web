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
    CREATE POLICY "Public Access" 
    ON storage.objects FOR SELECT 
    USING ( bucket_id = 'canvassing_permits' );

    CREATE POLICY "Authenticated users can upload" 
    ON storage.objects FOR INSERT 
    WITH CHECK ( bucket_id = 'canvassing_permits' AND auth.role() = 'authenticated' );

    CREATE POLICY "Authenticated users can delete" 
    ON storage.objects FOR DELETE 
    USING ( bucket_id = 'canvassing_permits' AND auth.role() = 'authenticated' );
  `;
  
  const { data, error } = await supabase.rpc('exec_sql', { sql });
  if (error) console.error("SQL Error:", error);
  else console.log("SQL Success: Policies created");
}
run();
