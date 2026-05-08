import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const urlMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_URL="(.*?)"/);
const anonMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY="(.*?)"/);

const supabase = createClient(urlMatch[1], anonMatch[1]);

async function check() {
  const { data: { session }, error } = await supabase.auth.getSession();
  console.log("Session Check Error:", error);
}
check();
