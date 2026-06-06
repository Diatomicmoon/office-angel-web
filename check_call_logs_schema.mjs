import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const envFile = fs.readFileSync('.env.local', 'utf8');
const urlMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_URL="(.*?)"/);
const keyMatch = envFile.match(/SUPABASE_SERVICE_ROLE_KEY="(.*?)"/);
const supabase = createClient(urlMatch[1], keyMatch[1]);
async function check() {
  const { data } = await supabase.from('call_logs').select('*').limit(1);
  console.log("Columns:", Object.keys(data[0] || {}));
}
check();
