import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const urlMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_URL="(.*?)"/);
const keyMatch = envFile.match(/SUPABASE_SERVICE_ROLE_KEY="(.*?)"/);

const supabase = createClient(urlMatch[1], keyMatch[1]);

async function run() {
  const { data, error } = await supabase.rpc('run_sql', {
    sql: `
      ALTER TABLE jobs ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
      ALTER TABLE jobs ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;
    `
  });
  console.log("Error:", error);
  console.log("Data:", data);
}
run();
