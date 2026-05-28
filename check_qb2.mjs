import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('office-angel-web/.env.local', 'utf8');
const urlMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_URL="(.*?)"/);
const keyMatch = envFile.match(/SUPABASE_SERVICE_ROLE_KEY="(.*?)"/);

const supabase = createClient(urlMatch[1], keyMatch[1]);

async function check() {
  const { data, error } = await supabase.from('companies').select('quickbooks_access_token, quickbooks_token_expires_at').eq('id', '5341bfb2-8fce-4c7a-9a30-20e6aba60a8a').single();
  console.log(data);
}
check();
