import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('office-angel-web/.env.local', 'utf8');
const urlMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_URL="(.*?)"/);
const keyMatch = envFile.match(/SUPABASE_SERVICE_ROLE_KEY="(.*?)"/);

const supabase = createClient(urlMatch[1], keyMatch[1]);

async function check() {
  const { data } = await supabase.from('call_logs').select('id, duration_seconds, created_at, summary').not('duration_seconds', 'is', null).order('duration_seconds', { ascending: false }).limit(5);
  console.log("Longest Calls:", data);
}
check();
